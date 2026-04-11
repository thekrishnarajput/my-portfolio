import express, { Request, Response } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { ResponseHelper } from '../utils/response';
import { AppError } from '../errors/appError';
import { HTTP_STATUS } from '../constants';

const router = express.Router();

/**
 * @swagger
 * /api/upload:
 *   post:
 *     summary: Upload a file
 *     description: Uploads a file and returns its public URL (admin only)
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 url:
 *                   type: string
 */
router.post('/', authenticate, requireAdmin, upload.single('file'), (req: Request, res: Response) => {
    if (!req.file) {
        throw new AppError('No file uploaded', HTTP_STATUS.BAD_REQUEST);
    }

    // Return a relative URL path; frontend constructs the full URL from its API base
    const fileUrl = `/uploads/${req.file.filename}`;
    
    ResponseHelper.success(res, { url: fileUrl }, 'File uploaded successfully');
});

export default router;
