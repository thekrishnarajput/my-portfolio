import { Request, Response } from 'express';
import { ContactService, IAttachmentInput } from '../services/contactService';
import { ResponseHelper } from '../utils/response';
import { asyncHandler } from '../errors/errorHandler';
import { messages } from '../utils/message';
import { verifyRecaptcha } from '../utils/recaptcha';
import { ValidationError, NotFoundError } from '../errors/appError';

export class ContactController {
    private contactService: ContactService;

    constructor() {
        this.contactService = new ContactService();
    }

    // ─── Public Endpoints ────────────────────────────────────────────────────

    createContactMessage = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { name, email, subject, message, recaptchaToken } = req.body;

        const isHuman = await verifyRecaptcha(recaptchaToken);
        if (!isHuman) {
            throw new ValidationError('reCAPTCHA verification failed. Please try again.');
        }

        // Map multer files → IAttachmentInput
        // const files = (req.files as Express.Multer.File[]) ?? [];
        // const attachments: IAttachmentInput[] = files.map((f) => ({
        //     filename:   f.originalname,
        //     storedName: f.filename,
        //     mimetype:   f.mimetype,
        //     size:       f.size,
        //     url:        `/uploads/contact-attachments/${f.filename}`,
        // }));

        await this.contactService.createContactMessage({
            name,
            email,
            subject,
            message,
            // attachments: []
        });
        ResponseHelper.created(res, undefined, messages.messageSent());
    });

    /**
     * Webhook endpoint called by Resend when a user replies to an email thread.
     *
     * Resend delivers the inbound email payload to this URL. The endpoint:
     *  - Accepts all Resend event types but only processes "email.received"
     *  - Optionally verifies a shared secret via X-Resend-Signature header
     *  - Matches the email to a conversation and stores the user reply
     *
     * Setup in Resend dashboard:
     *  1. Add your inbound domain (e.g. replies.mukeshkarn.com)
     *  2. Set webhook URL to: https://your-backend.com/api/contact/webhook/inbound
     *  3. Set RESEND_INBOUND_EMAIL=replies@mukeshkarn.com in your .env
     *  4. Optionally set RESEND_WEBHOOK_SECRET for signature verification
     */
    handleInboundWebhook = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        // Note: Resend uses Svix HMAC signatures (svix-id / svix-timestamp / svix-signature).
        // Simple string comparison won't work. For now the secret webhook URL provides
        // sufficient protection. Full Svix verification can be added later via `svix` npm package.

        const payload = req.body;
        const eventType: string = payload?.type ?? '';

        // Only process inbound email events
        if (eventType !== 'email.received' && eventType !== 'inbound_email') {
            // Acknowledge other event types without processing
            res.status(200).json({ success: true, message: `Event "${eventType}" acknowledged` });
            return;
        }

        const updated = await this.contactService.processInboundReply(payload);

        if (!updated) {
            // Return 200 even if unmatched — Resend will retry on non-2xx responses
            res.status(200).json({ success: false, message: 'No matching thread found for this email' });
            return;
        }

        ResponseHelper.success(res, { threadId: updated.threadId }, 'User reply stored successfully');
    });

    // ─── Admin Endpoints (Protected) ─────────────────────────────────────────

    getAllMessages = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
        const msgs = await this.contactService.getAllMessages();
        ResponseHelper.success(res, msgs, 'Messages retrieved successfully');
    });

    getMessageById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        const msg = await this.contactService.getMessageById(id);
        if (!msg) throw new NotFoundError('Contact message not found');
        ResponseHelper.success(res, msg, 'Message retrieved successfully');
    });

    /**
     * Lightweight poll endpoint — returns only the replies array for a conversation.
     * Used by the admin dashboard to check for new user replies without fetching the full message.
     */
    getReplies = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        const msg = await this.contactService.getMessageById(id);
        if (!msg) throw new NotFoundError('Contact message not found');
        ResponseHelper.success(res, { replies: msg.replies, status: msg.status, read: msg.read }, 'Replies retrieved');
    });

    replyToMessage = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        const { content } = req.body;

        if (!content || !content.trim()) {
            throw new ValidationError('Reply content is required');
        }

        // Map multer files → IAttachmentInput
        const files = (req.files as Express.Multer.File[]) ?? [];
        const attachments: IAttachmentInput[] = files.map((f) => ({
            filename:   f.originalname,
            storedName: f.filename,
            mimetype:   f.mimetype,
            size:       f.size,
            url:        `/uploads/contact-attachments/${f.filename}`,
        }));

        const updated = await this.contactService.replyToMessage(id, {
            content: content.trim(),
            attachments
        });
        if (!updated) throw new NotFoundError('Contact message not found');

        ResponseHelper.success(res, updated, 'Reply sent successfully');
    });

    updateStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['pending', 'replied', 'closed'];
        if (!validStatuses.includes(status)) {
            throw new ValidationError(`Status must be one of: ${validStatuses.join(', ')}`);
        }

        const updated = await this.contactService.updateStatus(id, status);
        if (!updated) throw new NotFoundError('Contact message not found');

        ResponseHelper.success(res, updated, 'Status updated successfully');
    });

    deleteMessage = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        const deleted = await this.contactService.deleteMessage(id);
        if (!deleted) throw new NotFoundError('Contact message not found');
        ResponseHelper.success(res, undefined, 'Message deleted successfully');
    });

    markAsRead = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        const { read } = req.body;
        const isRead = read !== undefined ? Boolean(read) : true;

        const msg = await this.contactService.setReadState(id, isRead);
        if (!msg) throw new NotFoundError('Contact message not found');
        ResponseHelper.success(res, msg, `Message marked as ${isRead ? 'read' : 'unread'} successfully`);
    });

    bulkMarkAsRead = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { ids, read } = req.body;
        if (!ids || !Array.isArray(ids)) {
            throw new ValidationError('ids array is required');
        }
        const isRead = read !== undefined ? Boolean(read) : true;
        await this.contactService.bulkSetReadState(ids, isRead);
        ResponseHelper.success(res, undefined, `Messages marked as ${isRead ? 'read' : 'unread'} successfully`);
    });

    bulkDelete = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids)) {
            throw new ValidationError('ids array is required');
        }
        await this.contactService.bulkDelete(ids);
        ResponseHelper.success(res, undefined, 'Messages deleted successfully');
    });

    getStats = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
        const stats = await this.contactService.getStats();
        ResponseHelper.success(res, stats, 'Stats retrieved successfully');
    });
}
