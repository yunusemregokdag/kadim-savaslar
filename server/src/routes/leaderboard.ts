import { Router } from 'express';
import { leaderboardController } from '../controllers/leaderboardController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// All leaderboard routes require authentication
router.use(authenticate);

// Leaderboard rankings
router.get('/level', leaderboardController.level);
router.get('/pvp', leaderboardController.pvp);
router.get('/wealth', leaderboardController.wealth);
router.get('/guilds', leaderboardController.guilds);

export default router;
