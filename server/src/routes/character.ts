import { Router } from 'express';
import { characterController } from '../controllers/characterController.js';
import { validateRequest, characterSchemas } from '../middleware/validation.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// All character routes require authentication
router.use(authenticate);

// Character CRUD
router.post('/', validateRequest(characterSchemas.create), characterController.create);
router.get('/', characterController.list);
router.get('/:id', characterController.get);
router.put('/:id', characterController.update);
router.delete('/:id', characterController.delete);

// Game-specific routes
router.post('/:id/save', characterController.saveProgress);

export default router;
