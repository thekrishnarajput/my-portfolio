import ContactMessage, { IContactMessage } from '../models/contactMessage';

export class ContactRepository {
    async create(data: Partial<IContactMessage>): Promise<IContactMessage> {
        const contactMessage = new ContactMessage(data);
        return contactMessage.save();
    }

    async findAll(): Promise<IContactMessage[]> {
        return ContactMessage.find().sort({ createdAt: -1 }).exec();
    }

    async findById(id: string): Promise<IContactMessage | null> {
        return ContactMessage.findById(id).exec();
    }
}

