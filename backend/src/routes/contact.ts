import express from 'express';
import { ContactController } from '../controllers/contactController';
import { contactValidation } from '../utils/validator';
import { authenticate, requireAdmin } from '../middleware/auth';
import { contactUpload } from '../middleware/contactUpload';

const router = express.Router();
const contactController = new ContactController();

// ─── Public Routes ──────────────────────────────────────────────────────────

router.post('/', /* contactUpload.array('attachments', 5), */ ...contactValidation, contactController.createContactMessage);

// ─── Resend Inbound Webhook (no auth — verified via shared secret or IP) ─────
/**
 * Resend calls this URL when a user replies to an email thread.
 *
 * Setup:
 *  1. Go to Resend dashboard → Domains → Add your domain → Enable Inbound
 *  2. Set the inbound webhook URL to: https://your-backend.com/api/contact/webhook/inbound
 *  3. Add RESEND_INBOUND_EMAIL=replies@yourdomain.com to .env (used as replyTo)
 *  4. Optionally set RESEND_WEBHOOK_SECRET for basic shared-secret verification
 */
router.post('/webhook/inbound', contactController.handleInboundWebhook);

// ─── Admin Routes (Protected) ───────────────────────────────────────────────
router.get('/admin/stats', authenticate, requireAdmin, contactController.getStats);
router.post('/admin/bulk/read', authenticate, requireAdmin, contactController.bulkMarkAsRead);
router.post('/admin/bulk/delete', authenticate, requireAdmin, contactController.bulkDelete);
router.post('/admin/:id/read', authenticate, requireAdmin, contactController.markAsRead);

router.get('/admin', authenticate, requireAdmin, contactController.getAllMessages);
router.get('/admin/:id', authenticate, requireAdmin, contactController.getMessageById);

// Lightweight poll for new replies — used by dashboard auto-refresh
router.get('/admin/:id/replies', authenticate, requireAdmin, contactController.getReplies);

router.post('/admin/:id/reply', authenticate, requireAdmin, contactUpload.array('attachments', 5), contactController.replyToMessage);
router.post('/admin/:id/status', authenticate, requireAdmin, contactController.updateStatus);
router.post('/admin/:id/delete', authenticate, requireAdmin, contactController.deleteMessage);

export default router;
