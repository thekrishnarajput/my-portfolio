import ContactMessage, { IContactMessage, IReply } from '../models/contactMessage';

export class ContactRepository {
    async create(data: Partial<IContactMessage>): Promise<IContactMessage> {
        const contactMessage = new ContactMessage(data);
        return contactMessage.save();
    }

    async findAll(): Promise<IContactMessage[]> {
        return ContactMessage.find()
            .sort({ createdAt: -1 })
            .lean()
            .exec() as unknown as IContactMessage[];
    }

    async findById(id: string): Promise<IContactMessage | null> {
        return ContactMessage.findById(id).lean().exec() as unknown as IContactMessage | null;
    }

    async findByThreadId(threadId: string): Promise<IContactMessage | null> {
        return ContactMessage.findOne({ threadId }).lean().exec() as unknown as IContactMessage | null;
    }

    /**
     * Subject-based fallback: strip Re:/Fwd: prefixes and match by the original subject.
     * Returns the most recent matching conversation.
     */
    async findBySubject(subject: string): Promise<IContactMessage | null> {
        return ContactMessage.findOne({ subject: { $regex: new RegExp(`^${subject.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } })
            .sort({ createdAt: -1 })
            .lean()
            .exec() as unknown as IContactMessage | null;
    }

    /**
     * Find a conversation by any Resend message ID stored in the thread:
     * - contact.emailMessageId (ID of last outgoing admin email)
     * - replies[].emailMessageId (ID of each admin reply email)
     * Used to match inbound user email replies to the correct conversation.
     */
    async findByEmailMessageId(messageId: string): Promise<IContactMessage | null> {
        // Clean up angle brackets if present (e.g. "<abc@resend.dev>" → "abc@resend.dev")
        const cleanId = messageId.replace(/^<|>$/g, '').trim();
        return ContactMessage.findOne({
            $or: [
                { emailMessageId: cleanId },
                { 'replies.emailMessageId': cleanId },
            ],
        }).lean().exec() as unknown as IContactMessage | null;
    }

    async markAsRead(id: string): Promise<IContactMessage | null> {
        return ContactMessage.findByIdAndUpdate(
            id,
            { read: true },
            { new: true }
        ).lean().exec() as unknown as IContactMessage | null;
    }

    async setReadState(id: string, read: boolean): Promise<IContactMessage | null> {
        return ContactMessage.findByIdAndUpdate(
            id,
            { read },
            { new: true }
        ).lean().exec() as unknown as IContactMessage | null;
    }

    async updateStatus(id: string, status: 'pending' | 'replied' | 'closed'): Promise<IContactMessage | null> {
        return ContactMessage.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        ).lean().exec() as unknown as IContactMessage | null;
    }

    /**
     * Add a reply to a conversation.
     * - Admin replies → status stays/becomes 'replied', read stays true
     * - User replies → status resets to 'pending' (admin needs to respond), read=false
     */
    async addReply(id: string, reply: Omit<IReply, '_id'>): Promise<IContactMessage | null> {
        const isUserReply = reply.sender === 'user';
        return ContactMessage.findByIdAndUpdate(
            id,
            {
                $push: { replies: reply },
                $set: {
                    status: isUserReply ? 'pending' : 'replied',
                    read: !isUserReply, // User replies mark as unread for admin
                },
            },
            { new: true }
        ).lean().exec() as unknown as IContactMessage | null;
    }

    /**
     * Store the Resend message ID of the most recent outgoing admin email,
     * so we can build proper In-Reply-To / References headers next time.
     */
    async updateEmailMessageId(id: string, emailMessageId: string): Promise<void> {
        await ContactMessage.findByIdAndUpdate(id, { emailMessageId }).exec();
    }

    async delete(id: string): Promise<boolean> {
        const result = await ContactMessage.findByIdAndDelete(id).exec();
        return result !== null;
    }

    async getUnreadCount(): Promise<number> {
        return ContactMessage.countDocuments({ read: false }).exec();
    }

    async getStats(): Promise<{ total: number; unread: number; pending: number; replied: number; closed: number }> {
        const [total, unread, pending, replied, closed] = await Promise.all([
            ContactMessage.countDocuments().exec(),
            ContactMessage.countDocuments({ read: false }).exec(),
            ContactMessage.countDocuments({ status: 'pending' }).exec(),
            ContactMessage.countDocuments({ status: 'replied' }).exec(),
            ContactMessage.countDocuments({ status: 'closed' }).exec(),
        ]);
        return { total, unread, pending, replied, closed };
    }

    async bulkMarkAsRead(ids: string[]): Promise<void> {
        await ContactMessage.updateMany(
            { _id: { $in: ids } },
            { read: true }
        ).exec();
    }

    async bulkSetReadState(ids: string[], read: boolean): Promise<void> {
        await ContactMessage.updateMany(
            { _id: { $in: ids } },
            { read }
        ).exec();
    }

    async bulkDelete(ids: string[]): Promise<void> {
        await ContactMessage.deleteMany({ _id: { $in: ids } }).exec();
    }
}
