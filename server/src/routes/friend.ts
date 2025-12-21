import { Router } from 'express';
import { friendController } from '../controllers/friendController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Get friends list
router.get('/', friendController.getFriends);

// Get pending requests
router.get('/pending', friendController.getPendingRequests);

// Get blocked users
router.get('/blocked', friendController.getBlocked);

// Send friend request
router.post('/request', friendController.sendRequest);

// Accept friend request
router.post('/accept/:requestId', friendController.acceptRequest);

// Reject friend request
router.post('/reject/:requestId', friendController.rejectRequest);

// Remove friend
router.delete('/:friendId', friendController.removeFriend);

// Block user
router.post('/block', friendController.blockUser);

// Unblock user
router.delete('/block/:targetId', friendController.unblockUser);

export default router;
