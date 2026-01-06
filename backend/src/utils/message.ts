/**
 * Centralized Message Functions
 * All application messages are defined here for consistency and maintainability
 */

export const messages = {
    // Authentication Messages
    loginSuccess: () => {
        return 'Login successful';
    },

    invalidCredentials: () => {
        return 'Invalid credentials';
    },

    unauthorized: () => {
        return 'Unauthorized access';
    },

    tokenRequired: () => {
        return 'Token is required';
    },

    tokenInvalid: () => {
        return 'Invalid or expired token';
    },

    tokenVerified: () => {
        return 'Token verified successfully';
    },

    adminRequired: () => {
        return 'Admin access required';
    },

    jwtSecretNotConfigured: () => {
        return 'JWT_SECRET is not configured';
    },

    // Resource Messages - Projects
    projectNotFound: () => {
        return 'Project not found';
    },

    projectCreated: () => {
        return 'Project created successfully';
    },

    projectUpdated: () => {
        return 'Project updated successfully';
    },

    projectDeleted: () => {
        return 'Project deleted successfully';
    },

    // Resource Messages - Skills
    skillNotFound: () => {
        return 'Skill not found';
    },

    skillCreated: () => {
        return 'Skill created successfully';
    },

    skillUpdated: () => {
        return 'Skill updated successfully';
    },

    skillDeleted: () => {
        return 'Skill deleted successfully';
    },

    // Resource Messages - Contact
    messageSent: () => {
        return 'Message sent successfully';
    },

    contactEmailSubject: (subject: string) => {
        return `Portfolio Contact: ${subject}`;
    },

    contactEmailTemplate: (data: { name: string; email: string; subject: string; message: string }) => {
        return `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #4CAF50;">New Contact Message</h2>
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Name:</strong> ${data.name}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Subject:</strong> ${data.subject}</p>
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap;">${data.message}</p>
          </div>
          <p style="color: #666; font-size: 12px;">This message was sent from your portfolio contact form.</p>
        </body>
      </html>
    `;
    },

    emailSendingFailed: () => {
        return 'Email sending failed';
    },

    emailSentSuccessfully: () => {
        return 'Email sent successfully';
    },

    // Validation Messages
    validationError: () => {
        return 'Validation error';
    },

    invalidInput: () => {
        return 'Invalid input data';
    },

    missingRequiredField: () => {
        return 'Missing required field';
    },

    invalidIdFormat: () => {
        return 'Invalid ID format';
    },

    duplicateEntry: () => {
        return 'Duplicate entry detected';
    },

    // General Resource Messages
    notFound: (resource: string = 'Resource') => {
        return `${resource} not found`;
    },

    created: (resource: string = 'Resource') => {
        return `${resource} created successfully`;
    },

    updated: (resource: string = 'Resource') => {
        return `${resource} updated successfully`;
    },

    deleted: (resource: string = 'Resource') => {
        return `${resource} deleted successfully`;
    },

    alreadyExists: (resource: string) => {
        return `${resource} already exists`;
    },

    // Error Messages
    internalError: () => {
        return 'Internal server error';
    },

    databaseError: () => {
        return 'Database connection error';
    },

    serviceUnavailable: () => {
        return 'Service temporarily unavailable';
    },

    routeNotFound: () => {
        return 'Route not found';
    },

    // LinkedIn Service Messages
    linkedinApiNotConfigured: () => {
        return 'LinkedIn API not configured. Please set LINKEDIN_ACCESS_TOKEN in environment variables.';
    },

    linkedinOAuthRequired: () => {
        return 'LinkedIn integration requires OAuth setup. See backend/src/services/linkedInService.ts for implementation details.';
    },

    // Rate Limiting
    rateLimitExceeded: () => {
        return 'Too many requests from this IP, please try again later.';
    },

    // Server Messages
    serverRunning: (port: number) => {
        return `Server running on port ${port}`;
    },

    gracefulShutdown: (signal: string) => {
        return `${signal} received. Starting graceful shutdown...`;
    },

    httpServerClosed: () => {
        return 'HTTP server closed';
    },

    gracefulShutdownCompleted: () => {
        return 'Graceful shutdown completed';
    },

    errorDuringShutdown: () => {
        return 'Error during shutdown';
    },

    forcingShutdown: () => {
        return 'Forcing shutdown after timeout';
    },

    failedToStartServer: () => {
        return 'Failed to start server';
    },

    unhandledRejection: () => {
        return 'Unhandled Rejection';
    },

    uncaughtException: () => {
        return 'Uncaught Exception';
    },

    // Database Messages
    mongodbConnectionError: () => {
        return 'MongoDB connection error after max retries';
    },

    mongooseConnectionError: () => {
        return 'Mongoose connection error';
    },

    // Admin Script Messages
    adminUserCreated: () => {
        return 'Admin user created successfully';
    },

    errorInitializingAdmin: () => {
        return 'Error initializing admin';
    },

    // Response Helper Messages
    unauthorizedDefault: () => {
        return 'Unauthorized';
    },

    forbiddenDefault: () => {
        return 'Forbidden';
    },

    notFoundDefault: () => {
        return 'Not found';
    },

    conflictDefault: () => {
        return 'Conflict';
    },

    // Validator Messages
    invalidValue: () => {
        return 'Invalid value';
    },
};

