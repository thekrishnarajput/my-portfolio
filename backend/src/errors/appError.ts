/**
 * Custom Application Error Classes
 */

import { messages } from '../utils/message';

export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;

    constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;

        Error.captureStackTrace(this, this.constructor);
    }
}

export class ValidationError extends AppError {
    constructor(message: string = messages.validationError()) {
        super(message, 400);
        this.name = 'ValidationError';
    }
}

export class NotFoundError extends AppError {
    constructor(message: string = messages.notFound()) {
        super(message, 404);
        this.name = 'NotFoundError';
    }
}

export class UnauthorizedError extends AppError {
    constructor(message: string = messages.unauthorized()) {
        super(message, 401);
        this.name = 'UnauthorizedError';
    }
}

export class ForbiddenError extends AppError {
    constructor(message: string = messages.forbiddenDefault()) {
        super(message, 403);
        this.name = 'ForbiddenError';
    }
}

export class ConflictError extends AppError {
    constructor(message: string = messages.alreadyExists('Resource')) {
        super(message, 409);
        this.name = 'ConflictError';
    }
}

export class DatabaseError extends AppError {
    constructor(message: string = messages.databaseError()) {
        super(message, 500);
        this.name = 'DatabaseError';
    }
}

