/**
 * Standardized API Response Utilities
 */

import { Response } from 'express';
import { HTTP_STATUS } from '../constants';
import { ApiResponse } from '../types';
import { messages } from './message';

export class ResponseHelper {
    static success<T>(
        res: Response,
        data?: T,
        message?: string,
        statusCode: number = HTTP_STATUS.OK
    ): void {
        const response: ApiResponse<T> = {
            success: true,
            ...(data && { data }),
            ...(message && { message }),
        };
        res.status(statusCode).json(response);
    }

    static created<T>(res: Response, data: T, message?: string): void {
        ResponseHelper.success(res, data, message || messages.created(), HTTP_STATUS.CREATED);
    }

    static noContent(res: Response): void {
        res.status(HTTP_STATUS.NO_CONTENT).send();
    }

    static error(
        res: Response,
        message: string,
        statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR
    ): void {
        const response: ApiResponse = {
            success: false,
            message,
        };
        res.status(statusCode).json(response);
    }

    static badRequest(res: Response, message: string): void {
        ResponseHelper.error(res, message, HTTP_STATUS.BAD_REQUEST);
    }

    static unauthorized(res: Response, message?: string): void {
        ResponseHelper.error(res, message || messages.unauthorizedDefault(), HTTP_STATUS.UNAUTHORIZED);
    }

    static forbidden(res: Response, message?: string): void {
        ResponseHelper.error(res, message || messages.forbiddenDefault(), HTTP_STATUS.FORBIDDEN);
    }

    static notFound(res: Response, message?: string): void {
        ResponseHelper.error(res, message || messages.notFoundDefault(), HTTP_STATUS.NOT_FOUND);
    }

    static conflict(res: Response, message?: string): void {
        ResponseHelper.error(res, message || messages.conflictDefault(), HTTP_STATUS.CONFLICT);
    }
}
