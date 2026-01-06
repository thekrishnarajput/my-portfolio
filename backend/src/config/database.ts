import mongoose, { Connection } from 'mongoose';
import { logger } from '../utils/logger';
import { messages } from '../utils/message';

export interface DatabaseConfig {
    uri: string;
    options?: mongoose.ConnectOptions;
}

export class DatabaseService {
    private connection: Connection | null = null;
    private retryCount = 0;
    private readonly maxRetries = 5;
    private readonly retryDelay = 5000; // 5 seconds

    async connect(config: DatabaseConfig): Promise<Connection> {
        const options: mongoose.ConnectOptions = {
            ...config.options,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        };

        try {
            mongoose.set('strictQuery', false);

            const connection = await mongoose.connect(config.uri, options);
            this.connection = connection.connection;
            this.retryCount = 0;

            this.setupEventHandlers();

            logger.info('Connected to MongoDB');
            return this.connection;
        } catch (error: any) {
            this.retryCount++;

            if (this.retryCount < this.maxRetries) {
                logger.warn(
                    `MongoDB connection attempt ${this.retryCount} failed. Retrying in ${this.retryDelay / 1000}s...`
                );
                await this.delay(this.retryDelay);
                return this.connect(config);
            }

            logger.error(messages.mongodbConnectionError(), error);
            throw error;
        }
    }

    private setupEventHandlers(): void {
        if (!this.connection) return;

        this.connection.on('connected', () => {
            logger.info('Mongoose connected to MongoDB');
        });

        this.connection.on('error', (error) => {
            logger.error(messages.mongooseConnectionError(), error);
        });

        this.connection.on('disconnected', () => {
            logger.warn('Mongoose disconnected from MongoDB');
        });

        // Handle application termination
        process.on('SIGINT', this.gracefulShutdown.bind(this));
        process.on('SIGTERM', this.gracefulShutdown.bind(this));
    }

    private async gracefulShutdown(): Promise<void> {
        if (this.connection) {
            await mongoose.connection.close();
            console.log('✅ MongoDB connection closed through app termination');
            process.exit(0);
        }
    }

    async disconnect(): Promise<void> {
        if (this.connection) {
            await mongoose.connection.close();
            this.connection = null;
            logger.info('Disconnected from MongoDB');
        }
    }

    getConnection(): Connection | null {
        return this.connection;
    }

    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}

export const databaseService = new DatabaseService();

