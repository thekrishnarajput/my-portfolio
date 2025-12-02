import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import Skill from '../models/Skill';
import { authenticate, requireAdmin } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = express.Router();

// Validation rules
const skillValidation = [
  body('name').trim().notEmpty().withMessage('Skill name is required').isLength({ max: 50 }),
  body('category').isIn(['frontend', 'backend', 'database', 'devops', 'tools', 'other']),
  body('proficiency').isInt({ min: 0, max: 100 }).withMessage('Proficiency must be between 0 and 100')
];

// GET /api/skills - Get all skills (public)
router.get('/', async (req: Request, res: Response) => {
  try {
    const skills = await Skill.find().sort({ category: 1, order: 1 });
    res.json({ success: true, data: skills });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/skills/:id - Get single skill (public)
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) {
      res.status(404).json({ success: false, message: 'Skill not found' });
      return;
    }
    res.json({ success: true, data: skill });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/skills - Create skill (admin only)
router.post(
  '/',
  authenticate,
  requireAdmin,
  validate(skillValidation),
  async (req: Request, res: Response) => {
    try {
      const skill = new Skill(req.body);
      await skill.save();
      res.status(201).json({ success: true, data: skill });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
);

// PUT /api/skills/:id - Update skill (admin only)
router.put(
  '/:id',
  authenticate,
  requireAdmin,
  validate(skillValidation),
  async (req: Request, res: Response) => {
    try {
      const skill = await Skill.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      if (!skill) {
        res.status(404).json({ success: false, message: 'Skill not found' });
        return;
      }
      res.json({ success: true, data: skill });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
);

// DELETE /api/skills/:id - Delete skill (admin only)
router.delete('/:id', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const skill = await Skill.findByIdAndDelete(req.params.id);
    if (!skill) {
      res.status(404).json({ success: false, message: 'Skill not found' });
      return;
    }
    res.json({ success: true, message: 'Skill deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

