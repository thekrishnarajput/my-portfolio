import express from 'express';
import { ContactController } from '../controllers/contactController';
import { contactValidation } from '../utils/validator';

const router = express.Router();
const contactController = new ContactController();

/**
 * @swagger
 * /api/contact:
 *   post:
 *     summary: Send a contact message
 *     description: Submit a contact form message (public endpoint)
 *     tags: [Contact]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - subject
 *               - message
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *                 description: Sender name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Sender email
 *               subject:
 *                 type: string
 *                 maxLength: 200
 *                 description: Message subject
 *               message:
 *                 type: string
 *                 maxLength: 2000
 *                 description: Message content
 *     responses:
 *       201:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', ...contactValidation, contactController.createContactMessage);

export default router;

