/**
 * Structured Logging Utility
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
    level: LogLevel;
    message: string;
    timestamp: string;
    data?: any;
    error?: Error;
}

class Logger {
    private formatMessage(level: LogLevel, message: string, data?: any, error?: Error): LogEntry {
        return {
            level,
            message,
            timestamp: new Date().toISOString(),
            ...(data && { data }),
            ...(error && {
                error: {
                    name: error.name,
                    message: error.message,
                    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
                },
            }),
        };
    }

    private log(level: LogLevel, message: string, data?: any, error?: Error): void {
        const logEntry = this.formatMessage(level, message, data, error);

        if (process.env.NODE_ENV === 'production') {
            // In production, use structured JSON logging
            console.log(JSON.stringify(logEntry));
        } else {
            // In development, use formatted console output
            const emoji = {
                info: 'ℹ️',
                warn: '⚠️',
                error: '❌',
                debug: '🔍',
            }[level];

            console.log(`${emoji} [${logEntry.timestamp}] ${message}`, data || '');
            if (error) {
                console.error(error);
            }
        }
    }

    info(message: string, data?: any): void {
        this.log('info', message, data);
    }

    warn(message: string, data?: any): void {
        this.log('warn', message, data);
    }

    error(message: string, error?: Error, data?: any): void {
        this.log('error', message, data, error);
    }

    debug(message: string, data?: any): void {
        if (process.env.NODE_ENV === 'development') {
            this.log('debug', message, data);
        }
    }
}

export const logger = new Logger();

