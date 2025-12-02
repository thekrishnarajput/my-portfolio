import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import ContactMessage from '../models/ContactMessage';
import { sendEmail } from '../utils/email';
import { validate } from '../middleware/validation';

const router = express.Router();

// Validation rules
const contactValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('email').isEmail().withMessage('Valid email is required'),
  body('subject').trim().notEmpty().withMessage('Subject is required').isLength({ max: 200 }),
  body('message').trim().notEmpty().withMessage('Message is required').isLength({ max: 2000 })
];

// POST /api/contact - Send contact message
router.post(
  '/',
  validate(contactValidation),
  async (req: Request, res: Response) => {
    try {
      const { name, email, subject, message } = req.body;

      // Save message to database
      const contactMessage = new ContactMessage({ name, email, subject, message });
      await contactMessage.save();

      // Send email notification
      try {
        await sendEmail({
          to: process.env.EMAIL_FROM || '',
          subject: `Portfolio Contact: ${subject}`,
          html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <p>${message.replace(/\n/g, '<br>')}</p>
          `
        });
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        // Don't fail the request if email fails
      }

      res.status(201).json({
        success: true,
        message: 'Message sent successfully'
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
);

export default router;

