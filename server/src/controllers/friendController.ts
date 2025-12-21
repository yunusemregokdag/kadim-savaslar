import { Response } from 'express';
import { Friend } from '../models/Friend.js';
import { User } from '../models/User.js';
import { Character } from '../models/Character.js';
import { AuthRequest } from '../middleware/auth.js';

export const friendController = {
    // Get friends list
    async getFriends(req: AuthRequest, res: Response) {
        try {
            const userId = req.userId;

            const friends = await Friend.find({
                userId,
                status: 'accepted'
            }).lean();

            // Get online status (would require socket tracking in production)
            const friendsWithStatus = friends.map(f => ({
                ...f,
                isOnline: false // TODO: Track online status via socket
            }));

            res.json({ friends: friendsWithStatus });
        } catch (error) {
            console.error('Get friends error:', error);
            res.status(500).json({ error: 'Failed to get friends' });
        }
    },

    // Get pending friend requests
    async getPendingRequests(req: AuthRequest, res: Response) {
        try {
            const userId = req.userId;

            // Incoming requests (where I am the friendId)
            const incoming = await Friend.find({
                friendId: userId,
                status: 'pending'
            }).lean();

            // Get requester names
            const incomingWithNames = await Promise.all(
                incoming.map(async (req) => {
                    const character = await Character.findOne({ userId: req.userId });
                    return {
                        ...req,
                        requesterName: character?.name || 'Unknown'
                    };
                })
            );

            // Outgoing requests (where I am the userId)
            const outgoing = await Friend.find({
                userId,
                status: 'pending'
            }).lean();

            res.json({
                incoming: incomingWithNames,
                outgoing
            });
        } catch (error) {
            console.error('Get pending requests error:', error);
            res.status(500).json({ error: 'Failed to get pending requests' });
        }
    },

    // Send friend request
    async sendRequest(req: AuthRequest, res: Response) {
        try {
            const userId = req.userId;
            const { targetName } = req.body;

            if (!targetName) {
                return res.status(400).json({ error: 'Target name required' });
            }

            // Find target by character name
            const targetChar = await Character.findOne({ name: targetName });
            if (!targetChar) {
                return res.status(404).json({ error: 'Player not found' });
            }

            const targetUserId = targetChar.userId;

            // Can't friend yourself
            if (targetUserId.toString() === userId) {
                return res.status(400).json({ error: 'Cannot friend yourself' });
            }

            // Check if already friends or pending
            const existing = await Friend.findOne({
                $or: [
                    { userId, friendId: targetUserId },
                    { userId: targetUserId, friendId: userId }
                ]
            });

            if (existing) {
                if (existing.status === 'accepted') {
                    return res.status(400).json({ error: 'Already friends' });
                }
                if (existing.status === 'pending') {
                    return res.status(400).json({ error: 'Request already pending' });
                }
                if (existing.status === 'blocked') {
                    return res.status(400).json({ error: 'Cannot send request' });
                }
            }

            // Get sender name
            const senderChar = await Character.findOne({ userId });

            // Create friend request
            const friendRequest = new Friend({
                userId,
                friendId: targetUserId,
                friendName: targetName,
                status: 'pending'
            });

            await friendRequest.save();

            res.json({
                success: true,
                message: `${targetName}'a arkadaşlık isteği gönderildi`
            });
        } catch (error) {
            console.error('Send friend request error:', error);
            res.status(500).json({ error: 'Failed to send request' });
        }
    },

    // Accept friend request
    async acceptRequest(req: AuthRequest, res: Response) {
        try {
            const userId = req.userId;
            const { requestId } = req.params;

            const request = await Friend.findById(requestId);
            if (!request) {
                return res.status(404).json({ error: 'Request not found' });
            }

            // Must be the target of the request
            if (request.friendId.toString() !== userId) {
                return res.status(403).json({ error: 'Not authorized' });
            }

            // Update original request
            request.status = 'accepted';
            request.updatedAt = new Date();
            await request.save();

            // Create reverse friendship
            const myChar = await Character.findOne({ userId });
            const reverseRequest = new Friend({
                userId,
                friendId: request.userId,
                friendName: myChar?.name || 'Unknown', // This should be the original requester's name
                status: 'accepted'
            });

            // Get the original requester's character name for the reverse entry
            const requesterChar = await Character.findOne({ userId: request.userId });
            reverseRequest.friendName = requesterChar?.name || 'Unknown';

            await reverseRequest.save();

            res.json({
                success: true,
                message: 'Arkadaşlık isteği kabul edildi'
            });
        } catch (error) {
            console.error('Accept friend request error:', error);
            res.status(500).json({ error: 'Failed to accept request' });
        }
    },

    // Reject friend request
    async rejectRequest(req: AuthRequest, res: Response) {
        try {
            const userId = req.userId;
            const { requestId } = req.params;

            const request = await Friend.findById(requestId);
            if (!request) {
                return res.status(404).json({ error: 'Request not found' });
            }

            // Must be the target of the request
            if (request.friendId.toString() !== userId) {
                return res.status(403).json({ error: 'Not authorized' });
            }

            await Friend.deleteOne({ _id: requestId });

            res.json({ success: true, message: 'İstek reddedildi' });
        } catch (error) {
            console.error('Reject friend request error:', error);
            res.status(500).json({ error: 'Failed to reject request' });
        }
    },

    // Remove friend
    async removeFriend(req: AuthRequest, res: Response) {
        try {
            const userId = req.userId;
            const { friendId } = req.params;

            // Remove both directions
            await Friend.deleteMany({
                $or: [
                    { userId, friendId },
                    { userId: friendId, friendId: userId }
                ]
            });

            res.json({ success: true, message: 'Arkadaş silindi' });
        } catch (error) {
            console.error('Remove friend error:', error);
            res.status(500).json({ error: 'Failed to remove friend' });
        }
    },

    // Block user
    async blockUser(req: AuthRequest, res: Response) {
        try {
            const userId = req.userId;
            const { targetId } = req.body;

            // Remove any existing friendship
            await Friend.deleteMany({
                $or: [
                    { userId, friendId: targetId },
                    { userId: targetId, friendId: userId }
                ]
            });

            // Create block entry
            const targetChar = await Character.findOne({ userId: targetId });

            const block = new Friend({
                userId,
                friendId: targetId,
                friendName: targetChar?.name || 'Unknown',
                status: 'blocked'
            });

            await block.save();

            res.json({ success: true, message: 'Kullanıcı engellendi' });
        } catch (error) {
            console.error('Block user error:', error);
            res.status(500).json({ error: 'Failed to block user' });
        }
    },

    // Unblock user
    async unblockUser(req: AuthRequest, res: Response) {
        try {
            const userId = req.userId;
            const { targetId } = req.params;

            await Friend.deleteOne({
                userId,
                friendId: targetId,
                status: 'blocked'
            });

            res.json({ success: true, message: 'Engel kaldırıldı' });
        } catch (error) {
            console.error('Unblock user error:', error);
            res.status(500).json({ error: 'Failed to unblock user' });
        }
    },

    // Get blocked users
    async getBlocked(req: AuthRequest, res: Response) {
        try {
            const userId = req.userId;

            const blocked = await Friend.find({
                userId,
                status: 'blocked'
            }).lean();

            res.json({ blocked });
        } catch (error) {
            console.error('Get blocked error:', error);
            res.status(500).json({ error: 'Failed to get blocked users' });
        }
    }
};
