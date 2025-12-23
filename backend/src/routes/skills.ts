import express from 'express';
import { SkillController } from '../controllers/SkillController';
import { authenticate, requireAdmin } from '../middleware/auth';
import {
  createSkillValidation,
  updateSkillValidation,
} from '../utils/validator';

const router = express.Router();
const skillController = new SkillController();

/**
 * @swagger
 * /api/skills:
 *   get:
 *     summary: Get all skills
 *     description: Retrieve all skills (public endpoint)
 *     tags: [Skills]
 *     responses:
 *       200:
 *         description: List of skills
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
 *                     $ref: '#/components/schemas/Skill'
 */
router.get('/', skillController.getAllSkills);

/**
 * @swagger
 * /api/skills:
 *   post:
 *     summary: Create a new skill
 *     description: Create a new skill (admin only)
 *     tags: [Skills]
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
 *               - category
 *               - proficiency
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 50
 *               category:
 *                 type: string
 *                 enum: [frontend, backend, database, devops, tools, other]
 *               proficiency:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *               icon:
 *                 type: string
 *               order:
 *                 type: number
 *                 default: 0
 *     responses:
 *       201:
 *         description: Skill created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.post(
  '/',
  authenticate,
  requireAdmin,
  ...createSkillValidation,
  skillController.createSkill
);

/**
 * @swagger
 * /api/skills/{id}/update:
 *   post:
 *     summary: Update a skill
 *     description: Update an existing skill (admin only)
 *     tags: [Skills]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Skill ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Skill'
 *     responses:
 *       200:
 *         description: Skill updated successfully
 *       404:
 *         description: Skill not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.post(
  '/:id/update',
  authenticate,
  requireAdmin,
  ...updateSkillValidation,
  skillController.updateSkill
);

/**
 * @swagger
 * /api/skills/{id}/delete:
 *   post:
 *     summary: Delete a skill
 *     description: Delete a skill by ID (admin only)
 *     tags: [Skills]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Skill ID
 *     responses:
 *       200:
 *         description: Skill deleted successfully
 *       404:
 *         description: Skill not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.post('/:id/delete', authenticate, requireAdmin, skillController.deleteSkill);

/**
 * @swagger
 * /api/skills/{id}:
 *   get:
 *     summary: Get a single skill
 *     description: Retrieve a skill by ID (public endpoint)
 *     tags: [Skills]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Skill ID
 *     responses:
 *       200:
 *         description: Skill details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Skill'
 *       404:
 *         description: Skill not found
 */
router.get('/:id', skillController.getSkillById);

export default router;

