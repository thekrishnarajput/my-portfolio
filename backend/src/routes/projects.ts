import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import Project from '../models/Project';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = express.Router();

// Validation rules
const projectValidation = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 100 }),
  body('description').trim().notEmpty().withMessage('Description is required').isLength({ max: 500 }),
  body('techStack').isArray({ min: 1 }).withMessage('At least one technology is required'),
  body('techStack.*').trim().notEmpty(),
  body('githubUrl').optional().isURL().withMessage('Invalid GitHub URL'),
  body('liveUrl').optional().isURL().withMessage('Invalid live URL'),
  body('proficiency').optional().isInt({ min: 0, max: 100 })
];

// GET /api/projects - Get all projects (public)
router.get('/', async (req: Request, res: Response) => {
  try {
    const projects = await Project.find().sort({ order: 1, createdAt: -1 });
    res.json({ success: true, data: projects });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/projects/:id - Get single project (public)
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }
    res.json({ success: true, data: project });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/projects - Create project (admin only)
router.post(
  '/',
  authenticate,
  requireAdmin,
  validate(projectValidation),
  async (req: Request, res: Response) => {
    try {
      const project = new Project(req.body);
      await project.save();
      res.status(201).json({ success: true, data: project });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
);

// PUT /api/projects/:id - Update project (admin only)
router.put(
  '/:id',
  authenticate,
  requireAdmin,
  validate(projectValidation),
  async (req: Request, res: Response) => {
    try {
      const project = await Project.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      if (!project) {
        res.status(404).json({ success: false, message: 'Project not found' });
        return;
      }
      res.json({ success: true, data: project });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
);

// DELETE /api/projects/:id - Delete project (admin only)
router.delete('/:id', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }
    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

