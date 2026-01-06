import jwt, { SignOptions } from 'jsonwebtoken';
import { UserRepository } from '../repositories/userRepository';
import { UnauthorizedError } from '../errors/appError';
import { messages } from '../utils/message';
import env from '../config/env';

export interface LoginResult {
    token: string;
    user: {
        id: string;
        email: string;
        role: string;
    };
}

export class AuthService {
    private userRepository: UserRepository;

    constructor() {
        this.userRepository = new UserRepository();
    }

    async login(email: string, password: string): Promise<LoginResult> {
        const user = await this.userRepository.findByEmail(email);

        if (!user) {
            throw new UnauthorizedError(messages.invalidCredentials());
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            throw new UnauthorizedError(messages.invalidCredentials());
        }

        if (!env.JWT_SECRET) {
            throw new Error(messages.jwtSecretNotConfigured());
        }

        const payload = { id: user._id.toString(), email: user.email, role: user.role };
        const token = jwt.sign(payload, env.JWT_SECRET, {
            expiresIn: env.JWT_EXPIRE,
        } as SignOptions);

        return {
            token,
            user: {
                id: user._id.toString(),
                email: user.email,
                role: user.role,
            },
        };
    }

    async verifyToken(token: string): Promise<{ id: string; email: string; role: string }> {
        if (!env.JWT_SECRET) {
            throw new Error(messages.jwtSecretNotConfigured());
        }

        try {
            const decoded = jwt.verify(token, env.JWT_SECRET) as {
                id: string;
                email: string;
                role: string;
            };
            return decoded;
        } catch (error) {
            throw new UnauthorizedError(messages.tokenInvalid());
        }
    }
}

