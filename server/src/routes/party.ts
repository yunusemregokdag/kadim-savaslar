import { Router } from 'express';
import { partyController } from '../controllers/partyController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// All party routes require authentication
router.use(authenticate);

// Party CRUD
router.post('/', partyController.create);
router.get('/my', partyController.myParty);

// Membership
router.post('/invite/:playerId', partyController.invite);
router.post('/leave', partyController.leave);
router.delete('/kick/:memberId', partyController.kick);

// Party management
router.put('/settings', partyController.updateSettings);
router.post('/transfer/:memberId', partyController.transferLeadership);
router.delete('/disband', partyController.disband);

export default router;
