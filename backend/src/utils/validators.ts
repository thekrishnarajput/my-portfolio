/**
 * Validation Utilities
 */

import { VALIDATION } from '../constants';

export class Validators {
    static isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static isValidUrl(url: string): boolean {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    static isValidMongoId(id: string): boolean {
        return /^[0-9a-fA-F]{24}$/.test(id);
    }

    static sanitizeString(input: string): string {
        return input.trim().replace(/\s+/g, ' ');
    }

    static validateLength(
        value: string,
        min: number,
        max: number,
        fieldName: string
    ): { isValid: boolean; error?: string } {
        if (value.length < min) {
            return {
                isValid: false,
                error: `${fieldName} must be at least ${min} characters`,
            };
        }
        if (value.length > max) {
            return {
                isValid: false,
                error: `${fieldName} must not exceed ${max} characters`,
            };
        }
        return { isValid: true };
    }

    static validateProficiency(proficiency: number): { isValid: boolean; error?: string } {
        if (proficiency < VALIDATION.MIN_PROFICIENCY || proficiency > VALIDATION.MAX_PROFICIENCY) {
            return {
                isValid: false,
                error: `Proficiency must be between ${VALIDATION.MIN_PROFICIENCY} and ${VALIDATION.MAX_PROFICIENCY}`,
            };
        }
        return { isValid: true };
    }

    static validatePassword(password: string): { isValid: boolean; error?: string } {
        if (password.length < VALIDATION.MIN_PASSWORD_LENGTH) {
            return {
                isValid: false,
                error: `Password must be at least ${VALIDATION.MIN_PASSWORD_LENGTH} characters`,
            };
        }
        return { isValid: true };
    }
}

