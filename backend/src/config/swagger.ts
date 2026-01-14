import swaggerJsdoc from 'swagger-jsdoc';
import { Application } from 'express';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Portfolio API',
            version: '1.0.0',
            description: 'Backend API for portfolio website with projects, skills, contact, and admin features',
            contact: {
                name: 'Mukesh Karn (Krishna)',
            },
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                Project: {
                    type: 'object',
                    required: ['title', 'description', 'techStack'],
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'Project ID',
                        },
                        title: {
                            type: 'string',
                            maxLength: 100,
                            description: 'Project title',
                        },
                        description: {
                            type: 'string',
                            maxLength: 2000,
                            description: 'Project description',
                        },
                        techStack: {
                            type: 'array',
                            items: {
                                type: 'string',
                            },
                            description: 'Technologies used in the project',
                        },
                        githubUrl: {
                            type: 'string',
                            format: 'uri',
                            description: 'GitHub repository URL',
                        },
                        liveUrl: {
                            type: 'string',
                            format: 'uri',
                            description: 'Live demo URL',
                        },
                        imageUrl: {
                            type: 'string',
                            format: 'uri',
                            description: 'Project image URL',
                        },
                        featured: {
                            type: 'boolean',
                            default: false,
                            description: 'Whether the project is featured',
                        },
                        order: {
                            type: 'number',
                            default: 0,
                            description: 'Display order',
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                    },
                },
                TechStack: {
                    type: 'object',
                    required: ['name'],
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'Tech stack ID',
                        },
                        name: {
                            type: 'string',
                            maxLength: 50,
                            description: 'Tech stack name (stored in lowercase for uniqueness)',
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                    },
                },
                Skill: {
                    type: 'object',
                    required: ['name', 'category', 'proficiency'],
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'Skill ID',
                        },
                        name: {
                            type: 'string',
                            maxLength: 50,
                            description: 'Skill name',
                        },
                        category: {
                            type: 'string',
                            enum: ['frontend', 'backend', 'database', 'devops', 'tools', 'other'],
                            description: 'Skill category',
                        },
                        proficiency: {
                            type: 'number',
                            minimum: 0,
                            maximum: 100,
                            description: 'Proficiency level (0-100)',
                        },
                        icon: {
                            type: 'string',
                            description: 'Icon identifier or URL',
                        },
                        order: {
                            type: 'number',
                            default: 0,
                            description: 'Display order',
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                    },
                },
                ContactMessage: {
                    type: 'object',
                    required: ['name', 'email', 'subject', 'message'],
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'Message ID',
                        },
                        name: {
                            type: 'string',
                            maxLength: 100,
                            description: 'Sender name',
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'Sender email',
                        },
                        subject: {
                            type: 'string',
                            maxLength: 200,
                            description: 'Message subject',
                        },
                        message: {
                            type: 'string',
                            maxLength: 2000,
                            description: 'Message content',
                        },
                        read: {
                            type: 'boolean',
                            default: false,
                            description: 'Whether the message has been read',
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                    },
                },
                LoginRequest: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'Admin email',
                        },
                        password: {
                            type: 'string',
                            format: 'password',
                            description: 'Admin password',
                        },
                    },
                },
                LoginResponse: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                        },
                        token: {
                            type: 'string',
                            description: 'JWT token',
                        },
                        user: {
                            type: 'object',
                            properties: {
                                id: {
                                    type: 'string',
                                },
                                email: {
                                    type: 'string',
                                },
                                role: {
                                    type: 'string',
                                },
                            },
                        },
                    },
                },
                Error: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: false,
                        },
                        message: {
                            type: 'string',
                            description: 'Error message',
                        },
                    },
                },
                Success: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: true,
                        },
                        data: {
                            type: 'object',
                        },
                        message: {
                            type: 'string',
                        },
                    },
                },
                HomepageConfig: {
                    type: 'object',
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'Configuration ID',
                        },
                        version: {
                            type: 'string',
                            description: 'Configuration version',
                        },
                        sections: {
                            type: 'object',
                            description: 'Homepage sections configuration',
                            properties: {
                                hero: { type: 'object' },
                                about: { type: 'object' },
                                projects: { type: 'object' },
                                skills: { type: 'object' },
                                contact: { type: 'object' },
                            },
                        },
                        order: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Section display order',
                        },
                        isActive: {
                            type: 'boolean',
                            description: 'Whether this configuration is active',
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                    },
                },
            },
        },
        tags: [
            {
                name: 'Health',
                description: 'Health check endpoints',
            },
            {
                name: 'Projects',
                description: 'Project management endpoints',
            },
            {
                name: 'Skills',
                description: 'Skill management endpoints',
            },
            {
                name: 'Contact',
                description: 'Contact form endpoints',
            },
            {
                name: 'Auth',
                description: 'Authentication endpoints',
            },
            {
                name: 'LinkedIn',
                description: 'LinkedIn integration endpoints',
            },
            {
                name: 'Visitors',
                description: 'Visitor tracking endpoints',
            },
            {
                name: 'Homepage Config',
                description: 'Homepage configuration management endpoints',
            },
        ],
    },
    apis: ['./src/routes/*.ts', './src/server.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app: Application): void => {
    const swaggerUi = require('swagger-ui-express');
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'Portfolio API Documentation',
    }));
};

