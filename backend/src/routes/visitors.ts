import express from 'express';
import { VisitorController } from '../controllers/visitorController';

const router = express.Router();
const visitorController = new VisitorController();

/**
 * @swagger
 * /api/visitors/track:
 *   post:
 *     summary: Track a visitor visit
 *     description: Track a visitor visit and return the total visitor count
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
 *                     totalCount:
 *                       type: number
 */
router.post('/track', visitorController.trackVisit);

/**
 * @swagger
 * /api/visitors/count:
 *   get:
 *     summary: Get total visitor count
 *     description: Retrieve the total number of unique visitors
 *     tags: [Visitors]
 *     responses:
 *       200:
 *         description: Visitor count retrieved successfully
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
 *                     count:
 *                       type: number
 */
router.get('/count', visitorController.getVisitorCount);

export default router;
