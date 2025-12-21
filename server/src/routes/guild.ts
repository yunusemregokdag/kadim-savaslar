import { Router } from 'express';
import { guildController } from '../controllers/guildController.js';
import { validateRequest, guildSchemas } from '../middleware/validation.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// All guild routes require authentication
router.use(authenticate);

// Guild CRUD
router.post('/', validateRequest(guildSchemas.create), guildController.create);
router.get('/my', guildController.myGuild);
router.get('/leaderboard', guildController.leaderboard);
router.get('/:id', guildController.get);

// Membership
router.post('/:id/join', guildController.join);
router.post('/leave', guildController.leave);
router.delete('/:id/kick/:memberId', guildController.kick);

// Rank management
router.post('/:id/promote/:memberId', guildController.promote);
router.post('/:id/demote/:memberId', guildController.demote);
router.post('/:id/transfer/:memberId', guildController.transferLeadership);

// Guild management
router.put('/:id/announcement', guildController.updateAnnouncement);
router.post('/:id/donate', guildController.donate);

export default router;
