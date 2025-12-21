import { Router } from 'express';
import { dailyQuestController } from '../controllers/dailyQuestController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Get today's daily quests
router.get('/', dailyQuestController.getDailyQuests);

// Update quest progress (internal use)
router.post('/progress', dailyQuestController.updateProgress);

// Claim quest reward
router.post('/claim/:questId', dailyQuestController.claimReward);

// Claim bonus for completing all
router.post('/claim-bonus', dailyQuestController.claimBonusReward);

export default router;
