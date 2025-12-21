import { Response } from 'express';
import { Character } from '../models/Character.js';
import { Guild } from '../models/Guild.js';
import { AuthRequest } from '../middleware/auth.js';

export const leaderboardController = {
    // Level leaderboard
    async level(req: AuthRequest, res: Response): Promise<void> {
        try {
            const characters = await Character.find()
                .sort({ level: -1, exp: -1 })
                .limit(100)
                .select('name class level exp');

            const leaderboard = characters.map((c, index) => ({
                rank: index + 1,
                name: c.name,
                class: c.class,
                level: c.level,
                exp: c.exp,
            }));

            res.json({ leaderboard });
        } catch (error) {
            console.error('Level leaderboard error:', error);
            res.status(500).json({ error: 'Failed to get leaderboard' });
        }
    },

    // PVP leaderboard
    async pvp(req: AuthRequest, res: Response): Promise<void> {
        try {
            const characters = await Character.find()
                .sort({ 'pvpStats.rating': -1 })
                .limit(100)
                .select('name class level pvpStats');

            const leaderboard = characters.map((c, index) => ({
                rank: index + 1,
                name: c.name,
                class: c.class,
                level: c.level,
                rating: c.pvpStats.rating,
                kills: c.pvpStats.kills,
                deaths: c.pvpStats.deaths,
                kd: c.pvpStats.deaths > 0 ? (c.pvpStats.kills / c.pvpStats.deaths).toFixed(2) : c.pvpStats.kills,
            }));

            res.json({ leaderboard });
        } catch (error) {
            console.error('PVP leaderboard error:', error);
            res.status(500).json({ error: 'Failed to get leaderboard' });
        }
    },

    // Wealth leaderboard
    async wealth(req: AuthRequest, res: Response): Promise<void> {
        try {
            const characters = await Character.find()
                .sort({ gold: -1 })
                .limit(100)
                .select('name class level gold');

            const leaderboard = characters.map((c, index) => ({
                rank: index + 1,
                name: c.name,
                class: c.class,
                level: c.level,
                gold: c.gold,
            }));

            res.json({ leaderboard });
        } catch (error) {
            console.error('Wealth leaderboard error:', error);
            res.status(500).json({ error: 'Failed to get leaderboard' });
        }
    },

    // Guild leaderboard
    async guilds(req: AuthRequest, res: Response): Promise<void> {
        try {
            const guilds = await Guild.find()
                .sort({ level: -1, exp: -1 })
                .limit(50)
                .select('name tag level exp members gold');

            const leaderboard = guilds.map((g, index) => ({
                id: g._id, // Added ID for joining
                rank: index + 1,
                name: g.name,
                tag: g.tag,
                level: g.level,
                exp: g.exp,
                memberCount: g.members.length,
                gold: g.gold,
            }));

            res.json({ leaderboard });
        } catch (error) {
            console.error('Guild leaderboard error:', error);
            res.status(500).json({ error: 'Failed to get leaderboard' });
        }
    },
};
