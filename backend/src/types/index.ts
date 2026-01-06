/**
 * Shared Type Definitions
 */

import { Request } from 'express';

// Extended Request with user information
export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
    };
}

// API Response Types
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// Error Response Type
export interface ErrorResponse {
    success: false;
    message: string;
    error?: string;
    stack?: string;
}

// Pagination Query Parameters
export interface PaginationQuery {
    page?: string;
    limit?: string;
    sort?: string;
    order?: 'asc' | 'desc';
}

// Common Query Parameters
export interface CommonQuery extends PaginationQuery {
    search?: string;
    filter?: string;
}

// Database Connection State
export type ConnectionState = 'connected' | 'disconnected' | 'connecting' | 'disconnecting';

// Environment Types
export type NodeEnv = 'development' | 'production' | 'test';

