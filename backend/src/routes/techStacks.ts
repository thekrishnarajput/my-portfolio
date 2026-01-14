import express from 'express';
import { TechStackController } from '../controllers/techStackController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = express.Router();
const techStackController = new TechStackController();

/**
 * @swagger
 * /api/tech-stacks:
 *   get:
 *     summary: Search tech stacks (autocomplete)
 *     description: Search tech stacks by query string for autocomplete suggestions
 *     tags: [Tech Stacks]
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Search query (optional)
 *     responses:
 *       200:
 *         description: List of matching tech stacks
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TechStack'
 *                 message:
 *                   type: string
 */
router.get('/', techStackController.searchTechStacks);

/**
 * @swagger
 * /api/tech-stacks:
 *   post:
 *     summary: Create a new tech stack
 *     description: Add a new tech stack to the database (admin only)
 *     tags: [Tech Stacks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "React"
 *     responses:
 *       201:
 *         description: Tech stack created successfully
 *       400:
 *         description: Bad request - name is required
 *       409:
 *         description: Conflict - tech stack already exists
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticate, requireAdmin, techStackController.createTechStack);

/**
 * @swagger
 * /api/tech-stacks/{id}/delete:
 *   post:
 *     summary: Delete a tech stack
 *     description: Delete a tech stack by ID (admin only)
 *     tags: [Tech Stacks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tech stack ID
 *     responses:
 *       200:
 *         description: Tech stack deleted successfully
 *       404:
 *         description: Tech stack not found
 *       401:
 *         description: Unauthorized
 */
router.post(
    '/:id/delete',
    authenticate,
    requireAdmin,
    techStackController.deleteTechStack
);

export default router;
