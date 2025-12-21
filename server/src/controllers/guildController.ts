import { Response } from 'express';
import { Guild } from '../models/Guild.js';
import { User } from '../models/User.js';
import { AuthRequest } from '../middleware/auth.js';
import mongoose from 'mongoose';

export const guildController = {
    // Create new guild
    async create(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;
            const { name, tag } = req.body;

            // Check if user is already in a guild
            const existingMembership = await Guild.findOne({ 'members.userId': userId });
            if (existingMembership) {
                res.status(400).json({ error: 'You are already in a guild. Leave first to create a new one.' });
                return;
            }

            // Check if guild name or tag is taken
            const existingGuild = await Guild.findOne({ $or: [{ name }, { tag: tag.toUpperCase() }] });
            if (existingGuild) {
                res.status(400).json({ error: 'Guild name or tag already taken' });
                return;
            }

            // Create guild
            const guild = new Guild({
                name,
                tag: tag.toUpperCase(),
                level: 1,
                exp: 0,
                gold: 0,
                leader: userId,
                officers: [],
                members: [{
                    userId: new mongoose.Types.ObjectId(userId),
                    role: 'LEADER',
                    joinedAt: new Date(),
                    contribution: 0,
                }],
                storage: [],
                announcement: `${name} klanına hoş geldiniz!`,
                maxMembers: 30,
            });

            await guild.save();

            res.status(201).json({
                message: 'Guild created successfully',
                guild: {
                    id: guild._id,
                    name: guild.name,
                    tag: guild.tag,
                    level: guild.level,
                    memberCount: guild.members.length,
                },
            });
        } catch (error) {
            console.error('Create guild error:', error);
            res.status(500).json({ error: 'Failed to create guild' });
        }
    },

    // Get guild info
    async get(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            const guild = await Guild.findById(id).populate('members.userId', 'username');

            if (!guild) {
                res.status(404).json({ error: 'Guild not found' });
                return;
            }

            res.json({ guild });
        } catch (error) {
            console.error('Get guild error:', error);
            res.status(500).json({ error: 'Failed to get guild' });
        }
    },

    // Get my guild
    async myGuild(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;

            const guild = await Guild.findOne({ 'members.userId': userId });

            if (!guild) {
                res.status(404).json({ error: 'You are not in a guild' });
                return;
            }

            res.json({ guild });
        } catch (error) {
            console.error('Get my guild error:', error);
            res.status(500).json({ error: 'Failed to get guild' });
        }
    },

    // Join guild (if invited or open)
    async join(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;
            const { id } = req.params;

            // Check if already in a guild
            const existingMembership = await Guild.findOne({ 'members.userId': userId });
            if (existingMembership) {
                res.status(400).json({ error: 'You are already in a guild' });
                return;
            }

            const guild = await Guild.findById(id);
            if (!guild) {
                res.status(404).json({ error: 'Guild not found' });
                return;
            }

            // Check if guild is full
            if (guild.members.length >= guild.maxMembers) {
                res.status(400).json({ error: 'Guild is full' });
                return;
            }

            // Add member
            guild.members.push({
                userId: new mongoose.Types.ObjectId(userId),
                role: 'MEMBER',
                joinedAt: new Date(),
                contribution: 0,
            });

            await guild.save();

            res.json({ message: 'Joined guild successfully', guildName: guild.name });
        } catch (error) {
            console.error('Join guild error:', error);
            res.status(500).json({ error: 'Failed to join guild' });
        }
    },

    // Leave guild
    async leave(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;

            const guild = await Guild.findOne({ 'members.userId': userId });
            if (!guild) {
                res.status(404).json({ error: 'You are not in a guild' });
                return;
            }

            // Check if user is leader
            if (guild.leader.toString() === userId) {
                // If leader and only member, delete guild
                if (guild.members.length === 1) {
                    await Guild.findByIdAndDelete(guild._id);
                    res.json({ message: 'Guild disbanded (you were the only member)' });
                    return;
                }
                // Otherwise, must transfer leadership first
                res.status(400).json({ error: 'Leader cannot leave. Transfer leadership first or disband the guild.' });
                return;
            }

            // Remove member
            guild.members = guild.members.filter(m => m.userId.toString() !== userId);
            await guild.save();

            res.json({ message: 'Left guild successfully' });
        } catch (error) {
            console.error('Leave guild error:', error);
            res.status(500).json({ error: 'Failed to leave guild' });
        }
    },

    // Kick member (officer+ only)
    async kick(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;
            const { id, memberId } = req.params;

            const guild = await Guild.findById(id);
            if (!guild) {
                res.status(404).json({ error: 'Guild not found' });
                return;
            }

            // Check permissions
            const myMembership = guild.members.find(m => m.userId.toString() === userId);
            if (!myMembership || !['LEADER', 'VICE_LEADER'].includes(myMembership.role)) {
                res.status(403).json({ error: 'You do not have permission to kick members' });
                return;
            }

            // Can't kick leader
            if (guild.leader.toString() === memberId) {
                res.status(400).json({ error: 'Cannot kick the leader' });
                return;
            }

            // Can't kick yourself
            if (userId === memberId) {
                res.status(400).json({ error: 'Cannot kick yourself. Use leave instead.' });
                return;
            }

            // Remove member
            guild.members = guild.members.filter(m => m.userId.toString() !== memberId);
            await guild.save();

            res.json({ message: 'Member kicked successfully' });
        } catch (error) {
            console.error('Kick member error:', error);
            res.status(500).json({ error: 'Failed to kick member' });
        }
    },

    // Promote member
    async promote(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;
            const { id, memberId } = req.params;

            const guild = await Guild.findById(id);
            if (!guild) {
                res.status(404).json({ error: 'Guild not found' });
                return;
            }

            // Only leader can promote
            if (guild.leader.toString() !== userId) {
                res.status(403).json({ error: 'Only guild leader can promote members' });
                return;
            }

            // Find member
            const member = guild.members.find(m => m.userId.toString() === memberId);
            if (!member) {
                res.status(404).json({ error: 'Member not found' });
                return;
            }

            // Promote logic
            const promotionPath: Record<string, string> = {
                'MEMBER': 'OFFICER',
                'OFFICER': 'VICE_LEADER',
            };

            if (!promotionPath[member.role]) {
                res.status(400).json({ error: 'Cannot promote further' });
                return;
            }

            member.role = promotionPath[member.role] as 'MEMBER' | 'OFFICER' | 'VICE_LEADER' | 'LEADER';
            await guild.save();

            res.json({ message: `Member promoted to ${member.role}` });
        } catch (error) {
            console.error('Promote member error:', error);
            res.status(500).json({ error: 'Failed to promote member' });
        }
    },

    // Demote member
    async demote(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;
            const { id, memberId } = req.params;

            const guild = await Guild.findById(id);
            if (!guild) {
                res.status(404).json({ error: 'Guild not found' });
                return;
            }

            // Only leader can demote
            if (guild.leader.toString() !== userId) {
                res.status(403).json({ error: 'Only guild leader can demote members' });
                return;
            }

            // Find member
            const member = guild.members.find(m => m.userId.toString() === memberId);
            if (!member) {
                res.status(404).json({ error: 'Member not found' });
                return;
            }

            // Demote logic
            const demotionPath: Record<string, string> = {
                'VICE_LEADER': 'OFFICER',
                'OFFICER': 'MEMBER',
            };

            if (!demotionPath[member.role]) {
                res.status(400).json({ error: 'Cannot demote further' });
                return;
            }

            member.role = demotionPath[member.role] as 'MEMBER' | 'OFFICER' | 'VICE_LEADER' | 'LEADER';
            await guild.save();

            res.json({ message: `Member demoted to ${member.role}` });
        } catch (error) {
            console.error('Demote member error:', error);
            res.status(500).json({ error: 'Failed to demote member' });
        }
    },

    // Transfer leadership
    async transferLeadership(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;
            const { id, memberId } = req.params;

            const guild = await Guild.findById(id);
            if (!guild) {
                res.status(404).json({ error: 'Guild not found' });
                return;
            }

            // Only leader can transfer
            if (guild.leader.toString() !== userId) {
                res.status(403).json({ error: 'Only guild leader can transfer leadership' });
                return;
            }

            // Find new leader
            const newLeader = guild.members.find(m => m.userId.toString() === memberId);
            if (!newLeader) {
                res.status(404).json({ error: 'Member not found' });
                return;
            }

            // Update roles
            const oldLeader = guild.members.find(m => m.userId.toString() === userId);
            if (oldLeader) oldLeader.role = 'VICE_LEADER';
            newLeader.role = 'LEADER';
            guild.leader = new mongoose.Types.ObjectId(memberId);

            await guild.save();

            res.json({ message: 'Leadership transferred successfully' });
        } catch (error) {
            console.error('Transfer leadership error:', error);
            res.status(500).json({ error: 'Failed to transfer leadership' });
        }
    },

    // Update announcement
    async updateAnnouncement(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;
            const { id } = req.params;
            const { announcement } = req.body;

            const guild = await Guild.findById(id);
            if (!guild) {
                res.status(404).json({ error: 'Guild not found' });
                return;
            }

            // Check permissions (officer+)
            const myMembership = guild.members.find(m => m.userId.toString() === userId);
            if (!myMembership || myMembership.role === 'MEMBER') {
                res.status(403).json({ error: 'You do not have permission to update announcement' });
                return;
            }

            guild.announcement = announcement;
            await guild.save();

            res.json({ message: 'Announcement updated' });
        } catch (error) {
            console.error('Update announcement error:', error);
            res.status(500).json({ error: 'Failed to update announcement' });
        }
    },

    // Get guild leaderboard
    async leaderboard(req: AuthRequest, res: Response): Promise<void> {
        try {
            const guilds = await Guild.find()
                .sort({ level: -1, exp: -1 })
                .limit(50)
                .select('name tag level exp members');

            const leaderboard = guilds.map((g, index) => ({
                id: g._id, // Added ID
                rank: index + 1,
                name: g.name,
                tag: g.tag,
                level: g.level,
                exp: g.exp,
                memberCount: g.members.length,
            }));

            res.json({ leaderboard });
        } catch (error) {
            console.error('Guild leaderboard error:', error);
            res.status(500).json({ error: 'Failed to get leaderboard' });
        }
    },

    // Donate gold to guild
    async donate(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;
            const { id } = req.params;
            const { amount } = req.body;

            if (!amount || amount <= 0) {
                res.status(400).json({ error: 'Invalid donation amount' });
                return;
            }

            const guild = await Guild.findById(id);
            if (!guild) {
                res.status(404).json({ error: 'Guild not found' });
                return;
            }

            // Check membership
            const member = guild.members.find(m => m.userId.toString() === userId);
            if (!member) {
                res.status(403).json({ error: 'You are not a member of this guild' });
                return;
            }

            // Add gold to guild and contribution to member
            guild.gold += amount;
            member.contribution += amount;

            // Add exp based on donation (1 gold = 0.1 exp)
            guild.exp += Math.floor(amount * 0.1);

            // Check for level up
            const expNeeded = guild.level * 10000;
            if (guild.exp >= expNeeded && guild.level < 20) {
                guild.level += 1;
                guild.exp -= expNeeded;
                guild.maxMembers += 5; // Increase max members per level
            }

            await guild.save();

            res.json({
                message: `Donated ${amount} gold to guild`,
                guildGold: guild.gold,
                guildLevel: guild.level,
                yourContribution: member.contribution,
            });
        } catch (error) {
            console.error('Donate error:', error);
            res.status(500).json({ error: 'Failed to donate' });
        }
    },
};
