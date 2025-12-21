import { Response } from 'express';
import { Party } from '../models/Party.js';
import { Character } from '../models/Character.js';
import { User } from '../models/User.js';
import { AuthRequest } from '../middleware/auth.js';
import mongoose from 'mongoose';

export const partyController = {
    // Create new party
    async create(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;

            // Check if already in a party
            const existingParty = await Party.findOne({
                $or: [{ leader: userId }, { members: userId }],
                disbanded: false,
            });

            if (existingParty) {
                res.status(400).json({ error: 'You are already in a party. Leave first to create a new one.' });
                return;
            }

            // Create party
            const party = new Party({
                leader: new mongoose.Types.ObjectId(userId),
                members: [new mongoose.Types.ObjectId(userId)],
                lootMode: 'FREE_FOR_ALL',
                expShareEnabled: true,
                maxMembers: 5,
            });

            await party.save();

            res.status(201).json({
                message: 'Party created successfully',
                party: {
                    id: party._id,
                    leader: party.leader,
                    memberCount: party.members.length,
                    lootMode: party.lootMode,
                    expShareEnabled: party.expShareEnabled,
                },
            });
        } catch (error) {
            console.error('Create party error:', error);
            res.status(500).json({ error: 'Failed to create party' });
        }
    },

    // Get my party
    async myParty(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;

            const party = await Party.findOne({
                members: userId,
                disbanded: false,
            }).populate('members', 'username');

            if (!party) {
                res.status(404).json({ error: 'You are not in a party' });
                return;
            }

            // Fetch character data for each member
            const memberStats = await Promise.all((party.members as any[]).map(async (member: any) => {
                const char = await Character.findOne({ userId: member._id }).sort({ lastPlayed: -1 });
                return {
                    id: member._id,
                    username: member.username,
                    ...(char ? {
                        nickname: char.name, // Use Character Name
                        class: char.class,
                        level: char.level,
                        hp: char.hp,
                        maxHp: char.maxHp,
                        mana: char.mana,
                        maxMana: char.maxMana,
                        zoneId: char.currentZone
                    } : {
                        nickname: member.username,
                        class: 'unknown',
                        level: 1,
                        hp: 100,
                        maxHp: 100,
                        mana: 100,
                        maxMana: 100
                    })
                };
            }));

            res.json({
                party: {
                    ...party.toObject(),
                    members: memberStats
                }
            });
        } catch (error) {
            console.error('Get my party error:', error);
            res.status(500).json({ error: 'Failed to get party' });
        }
    },

    // Invite player (returns invite token/id for now)
    async invite(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;
            const { playerId } = req.params;
            let targetUserId = playerId;

            // Resolve Username/CharacterName to UserID if not a valid ObjectId
            if (!mongoose.Types.ObjectId.isValid(playerId)) {
                const targetChar = await Character.findOne({ name: playerId });
                if (targetChar) {
                    targetUserId = targetChar.userId.toString();
                } else {
                    const targetUser = await User.findOne({ username: playerId });
                    if (targetUser) {
                        targetUserId = targetUser._id.toString();
                    } else {
                        res.status(404).json({ error: 'Player not found' });
                        return;
                    }
                }
            }

            const party = await Party.findOne({
                leader: userId,
                disbanded: false,
            });

            if (!party) {
                res.status(404).json({ error: 'You are not a party leader' });
                return;
            }

            if (party.members.length >= party.maxMembers) {
                res.status(400).json({ error: 'Party is full' });
                return;
            }

            // Check if player is already in a party
            const playerInParty = await Party.findOne({
                members: targetUserId,
                disbanded: false,
            });

            if (playerInParty) {
                res.status(400).json({ error: 'Player is already in a party' });
                return;
            }

            // For now, directly add the player (in real app, would send invite)
            party.members.push(new mongoose.Types.ObjectId(playerId));
            await party.save();

            res.json({ message: 'Player added to party', memberCount: party.members.length });
        } catch (error) {
            console.error('Invite to party error:', error);
            res.status(500).json({ error: 'Failed to invite player' });
        }
    },

    // Leave party
    async leave(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;

            const party = await Party.findOne({
                members: userId,
                disbanded: false,
            });

            if (!party) {
                res.status(404).json({ error: 'You are not in a party' });
                return;
            }

            // If leader leaves
            if (party.leader.toString() === userId) {
                if (party.members.length === 1) {
                    // Disband party
                    party.disbanded = true;
                    await party.save();
                    res.json({ message: 'Party disbanded' });
                    return;
                }

                // Transfer leadership to next member
                party.members = party.members.filter(m => m.toString() !== userId);
                party.leader = party.members[0];
                await party.save();
                res.json({ message: 'You left the party. Leadership transferred.' });
                return;
            }

            // Regular member leaves
            party.members = party.members.filter(m => m.toString() !== userId);
            await party.save();

            res.json({ message: 'Left party successfully' });
        } catch (error) {
            console.error('Leave party error:', error);
            res.status(500).json({ error: 'Failed to leave party' });
        }
    },

    // Kick member (leader only)
    async kick(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;
            const { memberId } = req.params;

            const party = await Party.findOne({
                leader: userId,
                disbanded: false,
            });

            if (!party) {
                res.status(403).json({ error: 'You are not a party leader' });
                return;
            }

            if (memberId === userId) {
                res.status(400).json({ error: 'Cannot kick yourself. Use leave instead.' });
                return;
            }

            if (!party.members.some(m => m.toString() === memberId)) {
                res.status(404).json({ error: 'Member not in party' });
                return;
            }

            party.members = party.members.filter(m => m.toString() !== memberId);
            await party.save();

            res.json({ message: 'Member kicked from party' });
        } catch (error) {
            console.error('Kick from party error:', error);
            res.status(500).json({ error: 'Failed to kick member' });
        }
    },

    // Update party settings (leader only)
    async updateSettings(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;
            const { lootMode, expShareEnabled } = req.body;

            const party = await Party.findOne({
                leader: userId,
                disbanded: false,
            });

            if (!party) {
                res.status(403).json({ error: 'You are not a party leader' });
                return;
            }

            if (lootMode) {
                if (!['FREE_FOR_ALL', 'ROUND_ROBIN', 'LEADER_ONLY'].includes(lootMode)) {
                    res.status(400).json({ error: 'Invalid loot mode' });
                    return;
                }
                party.lootMode = lootMode;
            }

            if (typeof expShareEnabled === 'boolean') {
                party.expShareEnabled = expShareEnabled;
            }

            await party.save();

            res.json({
                message: 'Party settings updated',
                lootMode: party.lootMode,
                expShareEnabled: party.expShareEnabled,
            });
        } catch (error) {
            console.error('Update party settings error:', error);
            res.status(500).json({ error: 'Failed to update settings' });
        }
    },

    // Transfer leadership
    async transferLeadership(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;
            const { memberId } = req.params;

            const party = await Party.findOne({
                leader: userId,
                disbanded: false,
            });

            if (!party) {
                res.status(403).json({ error: 'You are not a party leader' });
                return;
            }

            if (!party.members.some(m => m.toString() === memberId)) {
                res.status(404).json({ error: 'Member not in party' });
                return;
            }

            party.leader = new mongoose.Types.ObjectId(memberId);
            await party.save();

            res.json({ message: 'Leadership transferred successfully' });
        } catch (error) {
            console.error('Transfer party leadership error:', error);
            res.status(500).json({ error: 'Failed to transfer leadership' });
        }
    },

    // Disband party (leader only)
    async disband(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;

            const party = await Party.findOne({
                leader: userId,
                disbanded: false,
            });

            if (!party) {
                res.status(403).json({ error: 'You are not a party leader' });
                return;
            }

            party.disbanded = true;
            await party.save();

            res.json({ message: 'Party disbanded' });
        } catch (error) {
            console.error('Disband party error:', error);
            res.status(500).json({ error: 'Failed to disband party' });
        }
    },
};
