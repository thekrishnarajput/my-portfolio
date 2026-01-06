import moment from 'moment';
import mongoose from 'mongoose';

export interface HealthStatus {
    status: 'healthy' | 'unhealthy';
    timestamp: string;
    uptime: number;
    database: {
        status: 'connected' | 'disconnected';
        responseTime?: number;
        name?: string;
    };
    environment: string;
    version: string;
}

export class HealthService {
    async getHealthStatus(): Promise<HealthStatus> {
        const startTime = Date.now();
        const { status: dbStatus, name: dbName } = await this.checkDatabase();
        const responseTime = Date.now() - startTime;

        const isHealthy = dbStatus === 'connected';

        return {
            status: isHealthy ? 'healthy' : 'unhealthy',
            timestamp: moment().utcOffset(330).format('YYYY-MM-DD HH:mm:ss A'),
            uptime: process.uptime(),
            database: {
                status: dbStatus,
                responseTime: dbStatus === 'connected' ? responseTime : undefined,
                name: dbStatus === 'connected' ? dbName : undefined,
            },
            environment: process.env.NODE_ENV || 'development',
            version: process.env.npm_package_version || '1.0.0',
        };
    }

    private async checkDatabase(): Promise<{status: 'connected' | 'disconnected', name?: string}> {
        try {
            const state = mongoose.connection.readyState;
            // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
            if (state === 1 && mongoose.connection.db) {
                // Perform a simple ping to ensure connection is active
                await mongoose.connection.db.admin().ping();
                const dbName = mongoose.connection.db.databaseName;
                return { status: 'connected', name: dbName };
            }
            return { status: 'disconnected' };
        } catch (error) {
            return { status: 'disconnected' };
        }
    }
}
