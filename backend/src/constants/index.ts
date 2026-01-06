/**
 * Application Constants
 */

export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
} as const;

export const ERROR_MESSAGES = {
    // Authentication
    INVALID_CREDENTIALS: 'Invalid credentials',
    UNAUTHORIZED: 'Unauthorized access',
    TOKEN_REQUIRED: 'Token is required',
    TOKEN_INVALID: 'Invalid or expired token',
    ADMIN_REQUIRED: 'Admin access required',

    // Validation
    VALIDATION_ERROR: 'Validation error',
    INVALID_INPUT: 'Invalid input data',
    MISSING_REQUIRED_FIELD: 'Missing required field',

    // Resources
    NOT_FOUND: 'Resource not found',
    ALREADY_EXISTS: 'Resource already exists',
    DELETE_SUCCESS: 'Resource deleted successfully',

    // Server
    INTERNAL_ERROR: 'Internal server error',
    DATABASE_ERROR: 'Database connection error',
    SERVICE_UNAVAILABLE: 'Service temporarily unavailable',
} as const;

export const SUCCESS_MESSAGES = {
    CREATED: 'Resource created successfully',
    UPDATED: 'Resource updated successfully',
    DELETED: 'Resource deleted successfully',
    LOGIN_SUCCESS: 'Login successful',
    MESSAGE_SENT: 'Message sent successfully',
} as const;

export const SKILL_CATEGORIES = [
    'frontend',
    'backend',
    'database',
    'devops',
    'tools',
    'other',
] as const;

export type SkillCategory = typeof SKILL_CATEGORIES[number];

export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
} as const;

export const RATE_LIMIT = {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100,
} as const;

export const JWT = {
    DEFAULT_EXPIRE: '7d',
} as const;

export const VALIDATION = {
    MAX_TITLE_LENGTH: 100,
    MAX_DESCRIPTION_LENGTH: 500,
    MAX_LONG_DESCRIPTION_LENGTH: 2000,
    MAX_SKILL_NAME_LENGTH: 50,
    MAX_NAME_LENGTH: 100,
    MAX_SUBJECT_LENGTH: 200,
    MAX_MESSAGE_LENGTH: 2000,
    MIN_PASSWORD_LENGTH: 8,
    MIN_PROFICIENCY: 0,
    MAX_PROFICIENCY: 100,
} as const;

