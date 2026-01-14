import express from 'express';
import { HomepageConfigController } from '../controllers/homepageConfigController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = express.Router();
const homepageConfigController = new HomepageConfigController();

/**
 * @swagger
 * /api/homepage-config:
 *   get:
 *     summary: Get active homepage configuration
 *     description: Retrieve the currently active homepage configuration (public endpoint)
 *     tags: [Homepage Config]
 *     responses:
 *       200:
 *         description: Active homepage configuration
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/HomepageConfig'
 */
router.get('/', homepageConfigController.getActiveConfig);

/**
 * @swagger
 * /api/homepage-config/all:
 *   get:
 *     summary: Get all homepage configurations
 *     description: Retrieve all homepage configurations (admin only)
 *     tags: [Homepage Config]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of homepage configurations
 */
router.get('/all', authenticate, requireAdmin, homepageConfigController.getAllConfigs);

/**
 * @swagger
 * /api/homepage-config/:id:
 *   get:
 *     summary: Get homepage configuration by ID
 *     description: Retrieve a specific homepage configuration (admin only)
 *     tags: [Homepage Config]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Configuration ID
 *     responses:
 *       200:
 *         description: Homepage configuration
 */
router.get('/:id', authenticate, requireAdmin, homepageConfigController.getConfigById);

/**
 * @swagger
 * /api/homepage-config:
 *   post:
 *     summary: Create a new homepage configuration
 *     description: Create a new homepage configuration (admin only)
 *     tags: [Homepage Config]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/HomepageConfig'
 *     responses:
 *       201:
 *         description: Homepage configuration created
 */
router.post('/', authenticate, requireAdmin, homepageConfigController.createConfig);

/**
 * @swagger
 * /api/homepage-config/:id/update:
 *   post:
 *     summary: Update homepage configuration
 *     description: Update an existing homepage configuration (admin only)
 *     tags: [Homepage Config]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Configuration ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/HomepageConfig'
 *     responses:
 *       200:
 *         description: Homepage configuration updated
 */
router.post('/:id/update', authenticate, requireAdmin, homepageConfigController.updateConfig);

/**
 * @swagger
 * /api/homepage-config/:id/delete:
 *   post:
 *     summary: Delete homepage configuration
 *     description: Delete a homepage configuration (admin only, cannot delete active config)
 *     tags: [Homepage Config]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Configuration ID
 *     responses:
 *       200:
 *         description: Homepage configuration deleted
 */
router.post('/:id/delete', authenticate, requireAdmin, homepageConfigController.deleteConfig);

/**
 * @swagger
 * /api/homepage-config/:id/activate:
 *   post:
 *     summary: Activate homepage configuration
 *     description: Set a homepage configuration as active (admin only)
 *     tags: [Homepage Config]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Configuration ID
 *     responses:
 *       200:
 *         description: Homepage configuration activated
 */
router.post('/:id/activate', authenticate, requireAdmin, homepageConfigController.setActiveConfig);

export default router;
