import { Router } from 'express';
import { eventController } from '../controllers/eventController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Public routes (no auth required for viewing events)
router.get('/active', eventController.getActiveEvents);
router.get('/upcoming', eventController.getUpcomingEvents);
router.get('/bonuses', eventController.getCurrentBonuses);
router.get('/:eventId', eventController.getEvent);

// Protected routes (require auth)
router.use(authMiddleware);

// Admin routes (TODO: add admin middleware)
router.post('/', eventController.createEvent);
router.put('/:eventId', eventController.updateEvent);
router.delete('/:eventId', eventController.deleteEvent);

export default router;
