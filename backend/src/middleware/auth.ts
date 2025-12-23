import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../types';
import { UnauthorizedError, ForbiddenError } from '../errors/AppError';
import { messages } from '../utils/message';
import env from '../config/env';

export const authenticate = (req: AuthRequest, _res: Response, next: NextFunction): void => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>

    if (!token) {
      throw new UnauthorizedError(messages.tokenRequired());
    }

    if (!env.JWT_SECRET) {
      throw new Error(messages.jwtSecretNotConfigured());
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      id: string;
      email: string;
      role: string;
    };

    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return next(error);
    }
    next(new UnauthorizedError(messages.tokenInvalid()));
  }
};

export const requireAdmin = (req: AuthRequest, _res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== 'admin') {
    return next(new ForbiddenError(messages.adminRequired()));
  }
  next();
};

