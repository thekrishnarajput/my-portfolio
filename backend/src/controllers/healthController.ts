import { Request, Response } from 'express';
import { HealthService } from '../services/healthService';
import moment from 'moment';

export class HealthController {
    private healthService: HealthService;

    constructor() {
        this.healthService = new HealthService();
    }

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
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: string
     *                   example: healthy
     *                 timestamp:
     *                   type: string
     *                   format: date-time
     *                 uptime:
     *                   type: number
     *                   description: Server uptime in seconds
     *                 database:
     *                   type: object
     *                   properties:
     *                     status:
     *                       type: string
     *                       example: connected
     *                     responseTime:
     *                       type: number
     *                       description: Database response time in milliseconds
     *                 environment:
     *                   type: string
     *                   example: development
     *                 version:
     *                   type: string
     *                   example: 1.0.0
     */
    getHealth = async (_: Request, res: Response): Promise<void> => {
        try {
            const healthStatus = await this.healthService.getHealthStatus();
            console.log("healthStatus:-", healthStatus);
            const statusCode = healthStatus.status === 'healthy' ? 200 : 503;
            res.status(statusCode).json(healthStatus);
        } catch (error: any) {
            res.status(503).json({
                status: 'unhealthy',
                timestamp: moment().utcOffset(330).format('YYYY-MM-DD HH:mm:ss A'),
                error: error.message,
            });
        }   
    };
}

