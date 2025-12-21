import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { validateRequest, authSchemas } from '../middleware/validation.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Public routes
router.post('/register', validateRequest(authSchemas.register), authController.register);
router.post('/login', validateRequest(authSchemas.login), authController.login);

// Protected routes
router.get('/me', authenticate, authController.me);

export default router;
