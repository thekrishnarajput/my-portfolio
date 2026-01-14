import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

// Import configuration
import { setupSwagger } from './config/swagger';
import { databaseService } from './config/database';
import env from './config/env';

// Import utilities
import { logger } from './utils/logger';
import { errorHandler } from './errors/errorHandler';
import { ResponseHelper } from './utils/response';
import morganLogger from './middleware/morgan';
import { messages } from './utils/message';

// Import routes
import projectRoutes from './routes/projects';
import skillRoutes from './routes/skills';
import contactRoutes from './routes/contact';
import authRoutes from './routes/auth';
import linkedinRoutes from './routes/linkedin';
import visitorRoutes from './routes/visitors';

// Import controllers
import { HealthController } from './controllers/healthController';
import initAdmin from './scripts/initAdmin';

const app: Application = express();
const healthController = new HealthController();

// If behind a proxy (e.g., when using services like Heroku, AWS ELB, etc.)
// Trust only 1 proxy (usually the first in the chain)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(compression());

// CORS configuration
app.use(
  cors({
    origin: ['http://localhost:3000', env.FRONTEND_URL],
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  message: messages.rateLimitExceeded(),
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Use morgan logger for logging HTTP request with customized format
app.use(morganLogger());

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the health status of the API including database connection
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Health status
 */
app.get('/health', healthController.getHealth);

// Swagger documentation
setupSwagger(app);

// API routes
app.use('/api/projects', projectRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/linkedin', linkedinRoutes);
app.use('/api/visitors', visitorRoutes);

// 404 handler
app.use((_: Request, res: Response) => {
  ResponseHelper.notFound(res, messages.routeNotFound());
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server function
async function startServer(): Promise<void> {
  try {
    // Connect to MongoDB
    await databaseService.connect({
      uri: env.MONGODB_URI,
    });

    // Start Express server
    const server = app.listen(env.PORT, async () => {
      // Initialize admin user (non-blocking, doesn't exit process)
      initAdmin().catch((error) => {
        logger.error('Failed to initialize admin user', error);
        // Don't exit - server should continue running
      });

      logger.info(messages.serverRunning(env.PORT));
      logger.info(`Environment: ${env.NODE_ENV}`);
      logger.info(`API Documentation: http://localhost:${env.PORT}/api-docs`);
      logger.info(`Health Check: http://localhost:${env.PORT}/health`);
    });

    // Graceful shutdown handling
    const gracefulShutdown = async (signal: string): Promise<void> => {
      logger.warn(messages.gracefulShutdown(signal));

      server.close(async () => {
        logger.info(messages.httpServerClosed());

        try {
          await databaseService.disconnect();
          logger.info(messages.gracefulShutdownCompleted());
          process.exit(0);
        } catch (error) {
          logger.error(messages.errorDuringShutdown(), error as Error);
          process.exit(1);
        }
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error(messages.forcingShutdown());
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason: Error) => {
      logger.error(messages.unhandledRejection(), reason);
      gracefulShutdown('unhandledRejection');
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error: Error) => {
      logger.error(messages.uncaughtException(), error);
      gracefulShutdown('uncaughtException');
    });
  } catch (error) {
    logger.error(messages.failedToStartServer(), error as Error);
    process.exit(1);
  }
}

// Start the server
startServer();

export default app;

