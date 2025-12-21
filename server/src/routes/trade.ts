import { Router } from 'express';
import { tradeController } from '../controllers/tradeController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// All trade routes require authentication
router.use(authenticate);

// Trade operations
router.post('/request/:targetPlayerId', tradeController.request);
router.get('/my', tradeController.myTrades);
router.get('/:id', tradeController.get);
router.post('/:id/item', tradeController.addItem);
router.put('/:id/gold', tradeController.setGold);
router.post('/:id/confirm', tradeController.confirm);
router.post('/:id/cancel', tradeController.cancel);

export default router;
