import express, { Request, Response } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { uploadBuffer, UPLOAD_FOLDER_ROOT } from '../services/cloudinaryService';
import { asyncHandler } from '../errors/errorHandler';
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
router.post(
  '/',
  authenticate,
  requireAdmin,
  upload.single('file'),
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      throw new AppError('No file uploaded', HTTP_STATUS.BAD_REQUEST);
    }

    // Upload the buffered file straight to Cloudinary; the asset keeps its
    // original file name (e.g. `my-image.png` → .../mukeshkarn.com/my-image.png)
    const result = await uploadBuffer(req.file.buffer, {
      folder: UPLOAD_FOLDER_ROOT,
      resourceType: 'image',
      filename: req.file.originalname,
    });

    ResponseHelper.success(
      res,
      { url: result.url, publicId: result.publicId },
      'File uploaded successfully'
    );
  })
);

export default router;
