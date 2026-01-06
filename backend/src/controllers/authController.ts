import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { ResponseHelper } from '../utils/response';
import { UnauthorizedError } from '../errors/appError';
import { asyncHandler } from '../errors/errorHandler';
import { messages } from '../utils/message';

export class AuthController {
    private authService: AuthService;

    constructor() {
        this.authService = new AuthService();
    }

    login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { email, password } = req.body;
        const result = await this.authService.login(email, password);
        ResponseHelper.success(res, result, messages.loginSuccess());
    });

    verify = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            throw new UnauthorizedError(messages.tokenRequired());
        }

        const user = await this.authService.verifyToken(token);
        ResponseHelper.success(res, { user });
    });
}

