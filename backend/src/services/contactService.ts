import { ContactRepository } from '../repositories/contactRepository';
import { sendEmail } from '../utils/email';
import { IContactMessage } from '../models/contactMessage';
import { messages } from '../utils/message';

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
        await sendEmail({
            to: process.env.EMAIL_FROM || '',
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

