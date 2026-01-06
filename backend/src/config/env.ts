/**
 * Environment Configuration and Validation
 */

import dotenv from 'dotenv';
import { messages } from '../utils/message';

// Load environment variables
dotenv.config();

interface EnvConfig {
    // Server
    NODE_ENV: string;
    PORT: number;
    FRONTEND_URL: string;

    // Database
    MONGODB_URI: string;

    // JWT
    JWT_SECRET: string;
    JWT_EXPIRE: string;

    // Email
    EMAIL_HOST?: string;
    EMAIL_PORT?: number;
    EMAIL_USER?: string;
    EMAIL_PASS?: string;
    EMAIL_FROM?: string;

    // Rate Limiting
    RATE_LIMIT_WINDOW_MS: number;
    RATE_LIMIT_MAX_REQUESTS: number;

    // LinkedIn (optional)
    LINKEDIN_ACCESS_TOKEN?: string;
}

const getEnvVar = (key: string, defaultValue?: string): string => {
    const value = process.env[key];
    if (!value && !defaultValue) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value || defaultValue!;
};

const getEnvNumber = (key: string, defaultValue?: number): number => {
    const value = process.env[key];
    if (!value && defaultValue === undefined) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value ? parseInt(value, 10) : defaultValue!;
};

export const env: EnvConfig = {
    // Server
    NODE_ENV: getEnvVar('NODE_ENV', 'development'),
    PORT: getEnvNumber('PORT', 5000),
    FRONTEND_URL: getEnvVar('FRONTEND_URL', 'http://localhost:3000'),

    // Database
    MONGODB_URI: getEnvVar('MONGODB_URI', 'mongodb://localhost:27017/portfolioDB'),

    // JWT
    JWT_SECRET: getEnvVar('JWT_SECRET', ''),
    JWT_EXPIRE: getEnvVar('JWT_EXPIRE', '7d'),

    // Email (optional)
    EMAIL_HOST: process.env.EMAIL_HOST,
    EMAIL_PORT: process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT, 10) : undefined,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASS: process.env.EMAIL_PASS,
    EMAIL_FROM: process.env.EMAIL_FROM,

    // Rate Limiting
    RATE_LIMIT_WINDOW_MS: getEnvNumber('RATE_LIMIT_WINDOW_MS', 900000), // 15 minutes
    RATE_LIMIT_MAX_REQUESTS: getEnvNumber('RATE_LIMIT_MAX_REQUESTS', 100),

    // LinkedIn (optional)
    LINKEDIN_ACCESS_TOKEN: process.env.LINKEDIN_ACCESS_TOKEN,
};

// Validate critical environment variables
if (!env.JWT_SECRET && env.NODE_ENV === 'production') {
    throw new Error(messages.jwtSecretNotConfigured());
}

export default env;

