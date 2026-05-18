import { ContactRepository } from '../repositories/contactRepository';
import { IContactMessage } from '../models/contactMessage';
import { messages } from '../utils/message';
import HomepageConfig from '../models/homepageConfig';
import { randomUUID } from 'crypto';
import { Resend } from 'resend';
import { sendEmail } from '../utils/email';

const formatMessageId = (id: string): string => {
    if (!id) return '';
    let formatted = id.trim();
    if (!formatted.startsWith('<')) {
        if (/^[0-9a-fA-F-]{36}$/.test(formatted)) {
            formatted = `<${formatted}@resend.com>`;
        } else {
            formatted = `<${formatted}>`;
        }
    }
    return formatted;
};

export interface IAttachmentInput {
    filename: string;
    storedName: string;
    mimetype: string;
    size: number;
    url: string;
}

export interface ContactData {
    name: string;
    email: string;
    subject: string;
    message: string;
    attachments?: IAttachmentInput[];
}

export interface ReplyData {
    content: string;
    attachments?: IAttachmentInput[];
}

export class ContactService {
    private contactRepository: ContactRepository;
    private resend: Resend | null = null;

    constructor() {
        this.contactRepository = new ContactRepository();
        if (process.env.RESEND_API_KEY) {
            this.resend = new Resend(process.env.RESEND_API_KEY);
        }
    }

    async createContactMessage(data: ContactData): Promise<IContactMessage> {
        const threadId = `contact-${randomUUID()}`;
        const contactMessage = await this.contactRepository.create({
            ...data,
            threadId,
            attachments: data.attachments ?? [],
        });

        // Notify admin (non-blocking)
        this.sendAdminNotificationEmail(data, threadId).catch((error) => {
            console.error(messages.emailSendingFailed(), error);
        });

        return contactMessage;
    }

    async getAllMessages(): Promise<IContactMessage[]> {
        return this.contactRepository.findAll();
    }

    async getMessageById(id: string): Promise<IContactMessage | null> {
        const message = await this.contactRepository.findById(id);
        if (message && !message.read) {
            await this.contactRepository.markAsRead(id);
        }
        return message;
    }

    async replyToMessage(id: string, replyData: ReplyData): Promise<IContactMessage | null> {
        const contactMessage = await this.contactRepository.findById(id);
        if (!contactMessage) return null;

        let emailMessageId: string | undefined;

        try {
            emailMessageId = await this.sendReplyEmail(contactMessage, replyData.content, replyData.attachments);
        } catch (error) {
            console.error('Failed to send reply email:', error);
            throw error;
        }

        // Save reply with sender='admin'
        const updated = await this.contactRepository.addReply(id, {
            content: replyData.content,
            sentAt: new Date(),
            emailMessageId,
            sender: 'admin',
            attachments: replyData.attachments ?? []
        });

        // Keep the latest admin email message ID on the contact for threading
        if (emailMessageId) {
            await this.contactRepository.updateEmailMessageId(id, emailMessageId);
        }

        return updated;
    }

    async updateStatus(id: string, status: 'pending' | 'replied' | 'closed'): Promise<IContactMessage | null> {
        return this.contactRepository.updateStatus(id, status);
    }

    async deleteMessage(id: string): Promise<boolean> {
        return this.contactRepository.delete(id);
    }

    async setReadState(id: string, read: boolean): Promise<IContactMessage | null> {
        return this.contactRepository.setReadState(id, read);
    }

    async bulkMarkAsRead(ids: string[]): Promise<void> {
        await this.contactRepository.bulkMarkAsRead(ids);
    }

    async bulkSetReadState(ids: string[], read: boolean): Promise<void> {
        await this.contactRepository.bulkSetReadState(ids, read);
    }

    async bulkDelete(ids: string[]): Promise<void> {
        await this.contactRepository.bulkDelete(ids);
    }

    async getStats(): Promise<{ total: number; unread: number; pending: number; replied: number; closed: number }> {
        return this.contactRepository.getStats();
    }

    /**
     * Process an inbound email webhook from Resend.
     *
     * Resend fires a webhook when a user replies to one of your outgoing emails.
     * The payload contains standard email headers (In-Reply-To, References, X-Thread-Id)
     * that we use to match the reply to the correct conversation thread.
     *
     * Matching strategy (in priority order):
     *  1. Custom X-Thread-Id header  → direct threadId lookup
     *  2. In-Reply-To / References   → match against stored Resend message IDs
     *
     * Duplicate guard: if the emailId is already stored in any reply, skip.
     */
    async processInboundReply(webhookPayload: any): Promise<IContactMessage | null> {
        const emailData = webhookPayload?.data ?? webhookPayload;

        const emailId: string | undefined = emailData?.email_id;
        const fromEmail: string = emailData?.from ?? '';
        const subject: string = emailData?.subject ?? '(no subject)';

        console.log(`[Inbound] Received — from: ${fromEmail}, subject: "${subject}", id: ${emailId}`);

        // ── Step 1: Fetch full email body from Resend Receiving API ───────────
        // Resend webhooks only send metadata. The full body (text/html/headers)
        // is retrieved via resend.emails.receiving.get(emailId).
        // Docs: https://resend.com/docs/api-reference/emails/retrieve-received-email
        let content = '';

        if (emailId && this.resend) {
            try {
                const { data: received, error } = await (this.resend.emails as any).receiving.get(emailId);

                if (error) {
                    console.warn('[Resend Receiving] API error:', error);
                } else if (received) {
                    console.log('[Resend Receiving] Fields:', Object.keys(received));

                    // Prefer plain text; strip HTML as fallback
                    const stripHtml = (html: string) =>
                        html
                            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                            .replace(/<blockquote[^>]*>[\s\S]*?<\/blockquote>/gi, '')
                            .replace(/<[^>]+>/g, ' ')
                            .replace(/\s{2,}/g, ' ')
                            .trim();

                    content = received.text ?? '';
                    if (!content && received.html) content = stripHtml(received.html);

                    // If text/html are null, try fetching the raw MIME message
                    // The raw.download_url is a pre-signed URL valid for 1 hour
                    if (!content && received.raw?.download_url) {
                        console.log('[Resend Receiving] Fetching raw MIME from download_url...');
                        try {
                            const rawRes = await fetch(received.raw.download_url);
                            if (rawRes.ok) {
                                const rawText = await rawRes.text();
                                // Extract text/plain part from raw MIME
                                const plainMatch = rawText.match(/Content-Type: text\/plain[\s\S]*?\r\n\r\n([\s\S]*?)(?:\r\n--|\r\n\r\n--)/i);
                                if (plainMatch) content = plainMatch[1].trim();
                                // Fall back to stripping all HTML from raw
                                if (!content) content = stripHtml(rawText);
                            }
                        } catch (rawErr: any) {
                            console.warn('[Resend Receiving] Raw fetch failed:', rawErr?.message);
                        }
                    }

                    // Strip quoted reply lines (lines starting with ">")
                    content = content
                        .split('\n')
                        .filter((l) => !l.trimStart().startsWith('>'))
                        .join('\n')
                        .trim();
                }
            } catch (err: any) {
                console.warn('[Resend Receiving] Unexpected error:', err?.message ?? err);
            }
        }

        // sentinel — UI renders this as a soft notification badge
        if (!content) {
            console.warn('[Inbound] Could not extract body via Resend Receiving API.');
            content = '__NO_BODY__';
        }

        // ── Step 2: Extract threading headers from webhook payload ─────────────
        // Resend doesn't send headers in the webhook, but we embed the threadId
        // in our custom Message-ID so we can parse it from In-Reply-To.
        const inReplyTo = emailData?.in_reply_to ?? '';
        const references = emailData?.references ?? '';
        const xThreadId = emailData?.x_thread_id;

        // ── Step 3: Match to a conversation ───────────────────────────────────

        let contact: IContactMessage | null = null;

        // 4a. Parse threadId from our custom Message-ID format:
        //     <{threadId}.{timestamp}@{domain}>
        //     e.g. <contact-uuid.1716066000000@mukeshkarn.com>
        const allRefStrings = [inReplyTo, references].join(' ');
        const threadIdMatch = allRefStrings.match(/<?(contact-[\w-]+)\.\d+@/);
        if (threadIdMatch) {
            contact = await this.contactRepository.findByThreadId(threadIdMatch[1]);
            if (contact) console.log(`[Inbound] Matched via custom Message-ID → threadId: ${threadIdMatch[1]}`);
        }

        // 4b. X-Thread-Id header (set by us on outgoing emails)
        if (!contact && xThreadId) {
            contact = await this.contactRepository.findByThreadId(xThreadId);
            if (contact) console.log(`[Inbound] Matched via X-Thread-Id: ${xThreadId}`);
        }

        // 4c. In-Reply-To / References against stored Resend email IDs
        if (!contact && inReplyTo) {
            contact = await this.contactRepository.findByEmailMessageId(inReplyTo);
            if (contact) console.log(`[Inbound] Matched via In-Reply-To`);
        }
        if (!contact && references) {
            for (const ref of references.split(/\s+/).filter(Boolean)) {
                contact = await this.contactRepository.findByEmailMessageId(ref);
                if (contact) { console.log(`[Inbound] Matched via References`); break; }
            }
        }

        // 4d. Subject fallback — strip Re:/Fwd: and match stored subjects
        if (!contact && subject) {
            const baseSubject = subject.replace(/^(Re|Fwd?):\s*/gi, '').trim();
            contact = await this.contactRepository.findBySubject(baseSubject);
            if (contact) console.log(`[Inbound] Matched via subject: "${baseSubject}"`);
        }

        if (!contact) {
            console.warn(`[Inbound] No thread matched for email from ${fromEmail} — "${subject}"`);
            return null;
        }

        // ── Step 5: Duplicate guard ───────────────────────────────────────────
        if (emailId && contact.replies.some((r) => r.emailMessageId === emailId)) {
            console.info(`[Inbound] Already stored email ${emailId} — skipping.`);
            return contact;
        }

        // ── Step 6: Validate sender ───────────────────────────────────────────
        const senderEmail = fromEmail.toLowerCase().replace(/.*<(.+)>/, '$1').trim();
        if (senderEmail && senderEmail !== contact.email.toLowerCase()) {
            console.warn(`[Inbound] Sender ${senderEmail} ≠ contact ${contact.email} — skipping.`);
            return null;
        }

        // Retrieve inbound attachments from Resend Attachments API
        let attachments: IAttachmentInput[] = [];
        if (emailId && this.resend) {
            try {
                const { data: resendAttachments, error: listError } = await (this.resend.emails as any).receiving.attachments.list({
                    emailId,
                });

                if (listError) {
                    console.warn('[Resend Inbound Attachments] API error:', listError);
                } else if (resendAttachments) {
                    const attachmentsList = Array.isArray(resendAttachments)
                        ? resendAttachments
                        : (Array.isArray((resendAttachments as any).data) ? (resendAttachments as any).data : []);

                    console.log(`[Resend Inbound Attachments] Found ${attachmentsList.length} attachments`);
                    const fs = require('fs');
                    const path = require('path');
                    const UPLOAD_DIR = path.join(process.cwd(), 'public/uploads/contact-attachments');
                    if (!fs.existsSync(UPLOAD_DIR)) {
                        fs.mkdirSync(UPLOAD_DIR, { recursive: true });
                    }

                    for (const att of attachmentsList) {
                        try {
                            const downloadUrl = att.downloadUrl ?? att.download_url;
                            if (downloadUrl) {
                                console.log(`[Resend Inbound Attachments] Downloading: ${att.filename} from ${downloadUrl}`);
                                const res = await fetch(downloadUrl);
                                if (res.ok) {
                                    const buffer = await res.arrayBuffer();
                                    const ext = path.extname(att.filename);
                                    const storedName = `${randomUUID()}${ext}`;
                                    const filePath = path.join(UPLOAD_DIR, storedName);
                                    fs.writeFileSync(filePath, Buffer.from(buffer));

                                    attachments.push({
                                        filename: att.filename,
                                        storedName,
                                        mimetype: att.contentType ?? att.content_type ?? 'application/octet-stream',
                                        size: att.size,
                                        url: `/uploads/contact-attachments/${storedName}`,
                                    });
                                } else {
                                    console.warn(`[Resend Inbound Attachments] Failed to download ${att.filename}: ${res.statusText}`);
                                }
                            }
                        } catch (downloadErr: any) {
                            console.warn(`[Resend Inbound Attachments] Error downloading attachment ${att.filename}:`, downloadErr.message);
                        }
                    }
                }
            } catch (err: any) {
                console.warn('[Resend Inbound Attachments] Unexpected error:', err.message ?? err);
            }
        }

        // ── Step 7: Store user reply ──────────────────────────────────────────
        const updated = await this.contactRepository.addReply(contact._id as unknown as string, {
            content,
            sentAt: new Date(),
            emailMessageId: emailId,
            sender: 'user',
            attachments
        });

        console.info(`[Inbound] ✓ User reply stored in thread ${contact.threadId}`);
        return updated;
    }

    // ─── Private Email Helpers ────────────────────────────────────────────────

    private async getAdminEmail(): Promise<string> {
        let recipientEmail = process.env.EMAIL_TO;

        if (!recipientEmail) {
            try {
                const config = await HomepageConfig.findOne({ isActive: true }).exec();
                if (config?.sections?.contact?.email) {
                    recipientEmail = config.sections.contact.email;
                }
            } catch (error) {
                console.warn('Could not fetch contact email from homepage config:', error);
            }
        }

        if (!recipientEmail) {
            recipientEmail = process.env.EMAIL_FROM || process.env.ADMIN_EMAIL;
        }

        if (!recipientEmail) {
            throw new Error('No admin email configured. Please set EMAIL_TO environment variable.');
        }

        return recipientEmail;
    }

    private getFromAddress(): string {
        const domain = process.env.RESEND_FROM_DOMAIN || process.env.EMAIL_FROM || 'noreply@example.com';
        return `Mukesh Karn <${domain}>`;
    }

    private async sendAdminNotificationEmail(data: ContactData, threadId: string): Promise<void> {
        const adminEmail = await this.getAdminEmail();

        await sendEmail({
            to: adminEmail,
            cc: adminEmail,
            subject: `New Contact Message: ${data.subject}`,
            html: this.buildAdminNotificationHtml(data, threadId),
            headers: { 'X-Thread-Id': threadId },
        });
    }

    private async sendReplyEmail(
        contact: IContactMessage,
        replyContent: string,
        attachments?: IAttachmentInput[]
    ): Promise<string | undefined> {
        if (!this.resend) {
            throw new Error('Resend API is not configured. Please set the RESEND_API_KEY environment variable.');
        }

        const from = this.getFromAddress();
        
        // Ensure subject starts with a single "Re: " and matches parent precisely
        const cleanSubject = contact.subject.replace(/^(Re|Fwd?):\s*/gi, '').trim();
        const subject = `Re: ${cleanSubject}`;

        // Get all previous reply Message-IDs in the entire thread
        const replyIds = contact.replies
            .filter((r) => r.emailMessageId)
            .map((r) => r.emailMessageId as string);
        
        const originalMessageId = contact.emailMessageId;
        const rawIds = [...(originalMessageId ? [originalMessageId] : []), ...replyIds];
        
        // Wrap plain UUIDs or parse into standard RFC-compliant <id@domain> format
        const formattedIds = rawIds.map(formatMessageId).filter(Boolean);
        const latestId = formattedIds[formattedIds.length - 1];

        const inboundAddress = process.env.RESEND_INBOUND_EMAIL || process.env.EMAIL_TO || process.env.EMAIL_FROM;
        const adminEmail = await this.getAdminEmail();

        // Map reply attachments to Resend API format
        const resendAttachments = attachments && attachments.length > 0
            ? attachments.map((a) => {
                const fs = require('fs');
                const path = require('path');
                const fullPath = path.join(process.cwd(), 'public/uploads/contact-attachments', a.storedName);
                if (fs.existsSync(fullPath)) {
                    return {
                        content: fs.readFileSync(fullPath).toString('base64'),
                        filename: a.filename,
                    };
                }
                return null;
            }).filter(Boolean) as any[]
            : undefined;

        const replyToAddresses = [inboundAddress, adminEmail].filter(Boolean) as string[];

        const result = await this.resend.emails.send({
            from,
            to: contact.email,
            subject,
            html: this.buildReplyHtml(contact, replyContent),
            headers: {
                'X-Thread-Id': contact.threadId,
                ...(latestId && { 'In-Reply-To': latestId }),
                ...(formattedIds.length > 0 && { 'References': formattedIds.join(' ') }),
            },
            replyTo: replyToAddresses,
            ...(resendAttachments && { attachments: resendAttachments }),
        });

        return (result.data as any)?.id;
    }

    private buildAdminNotificationHtml(data: ContactData, threadId: string): string {
        const attachmentHtml = data.attachments && data.attachments.length > 0
            ? `<div style="background: white; padding: 16px 20px; border-radius: 8px; margin-top: 16px; border-left: 4px solid #a78bfa; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
              <p style="margin: 0 0 8px 0; font-weight: bold; color: #7c3aed;">&#128206; Attachments (${data.attachments.length})</p>
              <ul style="margin: 0; padding-left: 20px;">
                ${data.attachments.map((a) => `<li style="margin: 4px 0; font-size: 13px;">${a.filename} <span style="color:#999;">(${(a.size / 1024).toFixed(1)} KB)</span></li>`).join('')}
              </ul>
            </div>`
            : '';
        return `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">&#128236; New Contact Message</h1>
          </div>
          <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
              <p style="margin: 8px 0;"><strong>Name:</strong> ${data.name}</p>
              <p style="margin: 8px 0;"><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
              <p style="margin: 8px 0;"><strong>Subject:</strong> ${data.subject}</p>
            </div>
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
              <p style="margin: 0 0 10px 0; font-weight: bold; color: #667eea;">Message:</p>
              <p style="white-space: pre-wrap; margin: 0;">${data.message}</p>
            </div>
            ${attachmentHtml}
            <p style="color: #999; font-size: 12px; margin-top: 20px;">
              Thread ID: ${threadId} &middot; Sent from portfolio contact form
            </p>
          </div>
        </body>
      </html>
    `;
    }

    private buildReplyHtml(contact: IContactMessage, replyContent: string): string {
        const previousMessages = [
            { from: contact.name, content: contact.message, date: contact.createdAt, isUser: true },
            ...contact.replies.map((r) => ({
                from: r.sender === 'user' ? contact.name : 'Mukesh (Admin)',
                content: r.content,
                date: r.sentAt,
                isUser: r.sender === 'user',
            })),
        ];

        const historyHtml = previousMessages
            .map(
                (m) => `
          <div style="padding: 12px; background: ${m.isUser ? '#f0f4ff' : '#f5f5f5'}; border-radius: 6px; margin-bottom: 10px; border-left: 3px solid ${m.isUser ? '#667eea' : '#ccc'};">
            <p style="margin: 0 0 4px 0; font-size: 12px; color: #888;"><strong>${m.from}</strong> · ${new Date(m.date).toLocaleString()}</p>
            <p style="margin: 0; white-space: pre-wrap; font-size: 14px;">${m.content}</p>
          </div>`
            )
            .join('');

        return `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">💬 Reply to your message</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0 0;">Re: ${contact.subject}</p>
          </div>
          <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e0e0e0;">
            <p style="margin: 0 0 8px 0;">Hi ${contact.name},</p>
            <div style="background: #f0f4ff; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 16px 0;">
              <p style="margin: 0; white-space: pre-wrap;">${replyContent}</p>
            </div>
          </div>
          ${previousMessages.length > 0 ? `
          <div style="padding: 20px; background: #fafafa; border: 1px solid #e0e0e0; border-top: 0; border-radius: 0 0 10px 10px;">
            <p style="color: #999; font-size: 12px; margin: 0 0 10px 0;">─── Previous conversation ───</p>
            ${historyHtml}
          </div>` : ''}
        </body>
      </html>
    `;
    }
}
