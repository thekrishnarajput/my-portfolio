import express from 'express';
import { VisitorController } from '../controllers/visitorController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = express.Router();
const visitorController = new VisitorController();

/**
 * @swagger
 * /api/visitors/track:
 *   post:
 *     summary: Track a visitor visit
 *     description: Track a visitor visit and return visitor counts
 *     tags: [Visitors]
 *     responses:
 *       200:
 *         description: Visit tracked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     isNewVisitor:
 *                       type: boolean
 *                     uniqueVisitors:
 *                       type: number
 *                     totalVisits:
 *                       type: number
 */
router.post('/track', visitorController.trackVisit);

/**
 * @swagger
 * /api/visitors/count:
 *   get:
 *     summary: Get visitor counts
 *     description: Retrieve both unique visitors count and total visits count
 *     tags: [Visitors]
 *     responses:
 *       200:
 *         description: Visitor counts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     uniqueVisitors:
 *                       type: number
 *                     totalVisits:
 *                       type: number
 */
router.get('/count', visitorController.getVisitorCount);

/**
 * @swagger
 * /api/visitors:
 *   get:
 *     summary: Get all visitors (admin only)
 *     description: Retrieve all visitors with pagination
 *     tags: [Visitors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 25
 *           maximum: 100
 *         description: Number of items per page (max 100)
 *     responses:
 *       200:
 *         description: Visitors retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     visitors:
 *                       type: array
 *                       items:
 *                         type: object
 *                     total:
 *                       type: number
 *                     totalPages:
 *                       type: number
 *                     currentPage:
 *                       type: number
 */
router.get('/', authenticate, requireAdmin, visitorController.getAllVisitors);

export default router;
