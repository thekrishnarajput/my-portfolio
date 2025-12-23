import express from 'express';
import { LinkedInController } from '../controllers/LinkedInController';

const router = express.Router();
const linkedInController = new LinkedInController();

/**
 * @swagger
 * /api/linkedin/followers:
 *   get:
 *     summary: Get LinkedIn follower count
 *     description: Retrieve LinkedIn follower count (requires LinkedIn API configuration)
 *     tags: [LinkedIn]
 *     responses:
 *       200:
 *         description: LinkedIn follower data
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
 *                     followers:
 *                       type: number
 *                       description: Number of LinkedIn followers
 *                     message:
 *                       type: string
 *                       description: Status message or configuration note
 */
router.get('/followers', linkedInController.getFollowers);

export default router;

