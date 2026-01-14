import express from 'express';
import { ProjectController } from '../controllers/projectController';
import { authenticate, requireAdmin } from '../middleware/auth';
import {
  createProjectValidation,
  updateProjectValidation,
} from '../utils/validator';

const router = express.Router();
const projectController = new ProjectController();

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Get all projects
 *     description: Retrieve all projects (public endpoint)
 *     tags: [Projects]
 *     responses:
 *       200:
 *         description: List of projects
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
 *                     $ref: '#/components/schemas/Project'
 */
router.get('/', projectController.getAllProjects);

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Create a new project
 *     description: Create a new project (admin only)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - techStack
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 maxLength: 2000
 *               techStack:
 *                 type: array
 *                 items:
 *                   type: string
 *               githubUrl:
 *                 type: string
 *                 format: uri
 *               liveUrl:
 *                 type: string
 *                 format: uri
 *               imageUrl:
 *                 type: string
 *                 format: uri
 *               featured:
 *                 type: boolean
 *                 default: false
 *               order:
 *                 type: number
 *                 default: 0
 *     responses:
 *       201:
 *         description: Project created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Project'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.post(
  '/',
  authenticate,
  requireAdmin,
  ...createProjectValidation,
  projectController.createProject
);

/**
 * @swagger
 * /api/projects/{id}/update:
 *   post:
 *     summary: Update a project
 *     description: Update an existing project (admin only)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Project'
 *     responses:
 *       200:
 *         description: Project updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Project'
 *       404:
 *         description: Project not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.post(
  '/:id/update',
  authenticate,
  requireAdmin,
  ...updateProjectValidation,
  projectController.updateProject
);

/**
 * @swagger
 * /api/projects/{id}/delete:
 *   post:
 *     summary: Delete a project
 *     description: Delete a project by ID (admin only)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Project not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.post('/:id/delete', authenticate, requireAdmin, projectController.deleteProject);

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: Get a single project
 *     description: Retrieve a project by ID (public endpoint)
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Project'
 *       404:
 *         description: Project not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', projectController.getProjectById);

export default router;

