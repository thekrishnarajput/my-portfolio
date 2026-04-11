import { Request, Response } from 'express';
import { ContactService } from '../services/contactService';
import { ResponseHelper } from '../utils/response';
import { asyncHandler } from '../errors/errorHandler';
import { messages } from '../utils/message';
import { verifyRecaptcha } from '../utils/recaptcha';
import { ValidationError } from '../errors/appError';

export class ContactController {
    private contactService: ContactService;

    constructor() {
        this.contactService = new ContactService();
    }

    createContactMessage = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { name, email, subject, message, recaptchaToken } = req.body;

        const isHuman = await verifyRecaptcha(recaptchaToken);
        if (!isHuman) {
            throw new ValidationError('reCAPTCHA verification failed. Please try again.');
        }

        await this.contactService.createContactMessage({ name, email, subject, message });
        ResponseHelper.created(res, undefined, messages.messageSent());
    });
}

