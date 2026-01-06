/**
 * Centralized Error Handling
 */

import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from './appError';
import { HTTP_STATUS } from '../constants';
import { ErrorResponse } from '../types';
import { logger } from '../utils/logger';
import { messages } from '../utils/message';

export const errorHandler = (
    err: Error | AppError,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    let statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    let message: string = messages.internalError();
    let validationErrors: any = undefined;

    if (err instanceof ValidationError) {
        statusCode = err.statusCode;
        message = err.message;
        // Include detailed validation errors if available
        if ((err as any).errors) {
            validationErrors = (err as any).errors;
        }
    } else if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
    } else if (err.name === 'ValidationError') {
        statusCode = HTTP_STATUS.BAD_REQUEST;
        message = err.message || messages.validationError();
    } else if (err.name === 'CastError') {
        statusCode = HTTP_STATUS.BAD_REQUEST;
        message = messages.invalidIdFormat();
    } else if (err.name === 'MongoServerError' && (err as any).code === 11000) {
        statusCode = HTTP_STATUS.CONFLICT;
        message = messages.duplicateEntry();
    } else if (err.name === 'JsonWebTokenError') {
        statusCode = HTTP_STATUS.UNAUTHORIZED;
        message = messages.tokenInvalid();
    } else if (err.name === 'TokenExpiredError') {
        statusCode = HTTP_STATUS.UNAUTHORIZED;
        message = messages.tokenInvalid();
    } else if (err.message) {
        message = err.message;
    }

    const errorResponse: ErrorResponse & { errors?: any } = {
        success: false,
        message,
        ...(validationErrors && { errors: validationErrors }),
    };

    // Include stack trace in development
    if (process.env.NODE_ENV === 'development') {
        errorResponse.error = err.message;
        errorResponse.stack = err.stack;
    }

    // Log error
    logger.error('Request error', err instanceof Error ? err : new Error(message), {
        statusCode,
        message,
        ...(validationErrors && { validationErrors }),
    });

    res.status(statusCode).json(errorResponse);
};

export const asyncHandler = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

