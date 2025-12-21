import { Router } from 'express';
import { mailController } from '../controllers/mailController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Get inbox
router.get('/inbox', mailController.inbox);

// Send mail
router.post('/send', mailController.send);

// Read specific mail
router.get('/:mailId', mailController.read);

// Collect attachments
router.post('/:mailId/collect', mailController.collect);

// Delete mail
router.delete('/:mailId', mailController.delete);

// Delete all read mails
router.delete('/batch/read', mailController.deleteAllRead);

export default router;
