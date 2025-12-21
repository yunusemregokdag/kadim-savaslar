import { Router } from 'express';
import { houseController } from '../controllers/houseController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Get player's house
router.get('/', houseController.getHouse);

// Upgrade house
router.post('/upgrade', houseController.upgradeHouse);

// Furniture management
router.post('/furniture/buy', houseController.buyFurniture);
router.put('/furniture/move', houseController.moveFurniture);
router.delete('/furniture/:furnitureInstanceId', houseController.removeFurniture);

// Storage management
router.post('/storage/add', houseController.addToStorage);
router.post('/storage/remove', houseController.removeFromStorage);

// Get active buffs
router.get('/buffs', houseController.getBuffs);

// Visit house
router.get('/visit/:ownerName', houseController.visitHouse);

// Update settings
router.put('/settings', houseController.updateSettings);

export default router;
