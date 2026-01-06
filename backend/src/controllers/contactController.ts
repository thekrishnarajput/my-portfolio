import { Request, Response } from 'express';
import { ContactService } from '../services/contactService';
import { ResponseHelper } from '../utils/response';
import { asyncHandler } from '../errors/errorHandler';
import { messages } from '../utils/message';

export class ContactController {
    private contactService: ContactService;

    constructor() {
        this.contactService = new ContactService();
    }

    createContactMessage = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { name, email, subject, message } = req.body;
        await this.contactService.createContactMessage({ name, email, subject, message });
        ResponseHelper.created(res, undefined, messages.messageSent());
    });
}

