import { ContactRepository } from '../repositories/contactRepository';
import { sendEmail } from '../utils/email';
import { IContactMessage } from '../models/contactMessage';
import { messages } from '../utils/message';
import HomepageConfig from '../models/homepageConfig';

export interface ContactData {
    name: string;
    email: string;
    subject: string;
    message: string;
}

export class ContactService {
    private contactRepository: ContactRepository;

    constructor() {
        this.contactRepository = new ContactRepository();
    }

    async createContactMessage(data: ContactData): Promise<IContactMessage> {
        // Save message to database
        const contactMessage = await this.contactRepository.create(data);

        // Send email notification (non-blocking)
        this.sendNotificationEmail(data).catch((error) => {
            console.error(messages.emailSendingFailed(), error);
            // Don't fail the request if email fails
        });

        return contactMessage;
    }

    private async sendNotificationEmail(data: ContactData): Promise<void> {
        // Get recipient email in priority order:
        // 1. EMAIL_TO environment variable
        // 2. Contact email from homepage config
        // 3. EMAIL_FROM environment variable
        // 4. ADMIN_EMAIL environment variable

        let recipientEmail = process.env.EMAIL_TO;

        if (!recipientEmail) {
            // Try to get from homepage config
            try {
                const config = await HomepageConfig.findOne({ isActive: true }).exec();
                if (config?.sections?.contact?.email) {
                    recipientEmail = config.sections.contact.email;
                }
            } catch (error) {
                console.warn('Could not fetch contact email from homepage config:', error);
            }
        }

        // Fallback to environment variables
        if (!recipientEmail) {
            recipientEmail = process.env.EMAIL_FROM || process.env.ADMIN_EMAIL;
        }

        if (!recipientEmail) {
            const errorMessage = 'No recipient email configured. Please set EMAIL_TO environment variable, or configure contact email in homepage settings, or set EMAIL_FROM/ADMIN_EMAIL.';
            console.error(errorMessage);
            throw new Error(errorMessage);
        }

        await sendEmail({
            to: recipientEmail,
            subject: messages.contactEmailSubject(data.subject),
            html: messages.contactEmailTemplate(data),
        });
    }

    async getAllMessages(): Promise<IContactMessage[]> {
        return this.contactRepository.findAll();
    }

    async getMessageById(id: string): Promise<IContactMessage | null> {
        return this.contactRepository.findById(id);
    }
}

