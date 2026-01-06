/**
 * Helper Functions
 */

import { PaginationQuery } from '../types';
import { PAGINATION } from '../constants';

export class Helpers {
  /**
   * Parse pagination parameters from query
   */
  static parsePagination(query: PaginationQuery): { page: number; limit: number; skip: number } {
    const page = Math.max(1, parseInt(query.page || String(PAGINATION.DEFAULT_PAGE), 10));
    const limit = Math.min(
      PAGINATION.MAX_LIMIT,
      Math.max(1, parseInt(query.limit || String(PAGINATION.DEFAULT_LIMIT), 10))
    );
    const skip = (page - 1) * limit;

    return { page, limit, skip };
  }

  /**
   * Build sort object from query parameters
   */
  static parseSort(sort?: string, order?: 'asc' | 'desc'): Record<string, 1 | -1> {
    if (!sort) return { createdAt: -1 }; // Default sort

    const sortOrder = order === 'asc' ? 1 : -1;
    return { [sort]: sortOrder };
  }

  /**
   * Build filter object from query parameters
   */
  static parseFilter(filter?: string): Record<string, any> {
    if (!filter) return {};

    try {
      return JSON.parse(filter);
    } catch {
      return {};
    }
  }

  /**
   * Calculate total pages
   */
  static calculateTotalPages(total: number, limit: number): number {
    return Math.ceil(total / limit);
  }

  /**
   * Extract search terms from query
   */
  static extractSearchTerms(search?: string): string[] {
    if (!search) return [];
    return search
      .split(' ')
      .map((term) => term.trim())
      .filter((term) => term.length > 0);
  }

  /**
   * Build MongoDB search query
   */
  static buildSearchQuery(search?: string, fields: string[] = []): Record<string, any> {
    const terms = Helpers.extractSearchTerms(search);
    if (terms.length === 0 || fields.length === 0) return {};

    return {
      $or: fields.map((field) => ({
        [field]: {
          $regex: terms.join('|'),
          $options: 'i',
        },
      })),
    };
  }

  /**
   * Delay execution
   */
  static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Retry a function with exponential backoff
   */
  static async retry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delayMs: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        if (i < maxRetries - 1) {
          await Helpers.delay(delayMs * Math.pow(2, i)); // Exponential backoff
        }
      }
    }

    throw lastError!;
  }

  /**
   * Sanitize object - remove undefined values
   */
  static sanitizeObject<T extends Record<string, any>>(obj: T): Partial<T> {
    const sanitized: Partial<T> = {};
    for (const key in obj) {
      if (obj[key] !== undefined) {
        sanitized[key] = obj[key];
      }
    }
    return sanitized;
  }

  /**
   * Generate random string
   */
  static generateRandomString(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

