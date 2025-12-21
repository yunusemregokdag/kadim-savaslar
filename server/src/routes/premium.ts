import { Router } from 'express';
import { premiumController } from '../controllers/premiumController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Get premium status
router.get('/status', premiumController.getStatus);

// Purchase premium
router.post('/purchase', premiumController.purchase);

// Claim daily gems
router.post('/claim-daily', premiumController.claimDailyGems);

export default router;
