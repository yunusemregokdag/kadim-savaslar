import { Response } from 'express';
import { Trade } from '../models/Trade.js';
import { AuthRequest } from '../middleware/auth.js';
import mongoose from 'mongoose';

export const tradeController = {
    // Request trade with another player
    async request(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;
            const { targetPlayerId } = req.params;

            if (userId === targetPlayerId) {
                res.status(400).json({ error: 'Cannot trade with yourself' });
                return;
            }

            // Check for existing pending trade
            const existingTrade = await Trade.findOne({
                $or: [
                    { trader1: userId, status: 'PENDING' },
                    { trader2: userId, status: 'PENDING' },
                ],
            });

            if (existingTrade) {
                res.status(400).json({ error: 'You already have a pending trade' });
                return;
            }

            // Create trade
            const trade = new Trade({
                trader1: new mongoose.Types.ObjectId(userId),
                trader2: new mongoose.Types.ObjectId(targetPlayerId),
                status: 'PENDING',
            });

            await trade.save();

            res.status(201).json({
                message: 'Trade request sent',
                tradeId: trade._id,
            });
        } catch (error) {
            console.error('Request trade error:', error);
            res.status(500).json({ error: 'Failed to request trade' });
        }
    },

    // Get my trades
    async myTrades(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;

            const trades = await Trade.find({
                $or: [{ trader1: userId }, { trader2: userId }],
                status: { $in: ['PENDING', 'CONFIRMED'] },
            }).populate('trader1 trader2', 'username');

            res.json({ trades });
        } catch (error) {
            console.error('Get my trades error:', error);
            res.status(500).json({ error: 'Failed to get trades' });
        }
    },

    // Get trade details
    async get(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;
            const { id } = req.params;

            const trade = await Trade.findOne({
                _id: id,
                $or: [{ trader1: userId }, { trader2: userId }],
            }).populate('trader1 trader2', 'username');

            if (!trade) {
                res.status(404).json({ error: 'Trade not found' });
                return;
            }

            res.json({ trade });
        } catch (error) {
            console.error('Get trade error:', error);
            res.status(500).json({ error: 'Failed to get trade' });
        }
    },

    // Add item to trade
    async addItem(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;
            const { id } = req.params;
            const { item } = req.body;

            const trade = await Trade.findOne({
                _id: id,
                $or: [{ trader1: userId }, { trader2: userId }],
                status: 'PENDING',
            });

            if (!trade) {
                res.status(404).json({ error: 'Trade not found or not pending' });
                return;
            }

            // Reset confirmations when items change
            trade.trader1Confirmed = false;
            trade.trader2Confirmed = false;

            // Add item to correct trader
            if (trade.trader1.toString() === userId) {
                trade.trader1Items.push(item);
            } else {
                trade.trader2Items.push(item);
            }

            await trade.save();

            res.json({ message: 'Item added to trade', trade });
        } catch (error) {
            console.error('Add item to trade error:', error);
            res.status(500).json({ error: 'Failed to add item' });
        }
    },

    // Set gold amount
    async setGold(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;
            const { id } = req.params;
            const { amount } = req.body;

            if (amount < 0) {
                res.status(400).json({ error: 'Invalid gold amount' });
                return;
            }

            const trade = await Trade.findOne({
                _id: id,
                $or: [{ trader1: userId }, { trader2: userId }],
                status: 'PENDING',
            });

            if (!trade) {
                res.status(404).json({ error: 'Trade not found or not pending' });
                return;
            }

            // Reset confirmations when gold changes
            trade.trader1Confirmed = false;
            trade.trader2Confirmed = false;

            // Set gold for correct trader
            if (trade.trader1.toString() === userId) {
                trade.trader1Gold = amount;
            } else {
                trade.trader2Gold = amount;
            }

            await trade.save();

            res.json({ message: 'Gold amount set', trade });
        } catch (error) {
            console.error('Set gold error:', error);
            res.status(500).json({ error: 'Failed to set gold' });
        }
    },

    // Confirm trade
    async confirm(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;
            const { id } = req.params;

            const trade = await Trade.findOne({
                _id: id,
                $or: [{ trader1: userId }, { trader2: userId }],
                status: 'PENDING',
            });

            if (!trade) {
                res.status(404).json({ error: 'Trade not found or not pending' });
                return;
            }

            // Set confirmation for correct trader
            if (trade.trader1.toString() === userId) {
                trade.trader1Confirmed = true;
            } else {
                trade.trader2Confirmed = true;
            }

            // Check if both confirmed
            if (trade.trader1Confirmed && trade.trader2Confirmed) {
                trade.status = 'COMPLETED';
                trade.completedAt = new Date();
                // Here you would actually transfer items/gold between players
                // This would require updating Character inventories
            }

            await trade.save();

            res.json({
                message: trade.status === 'COMPLETED' ? 'Trade completed!' : 'Trade confirmed. Waiting for other player.',
                status: trade.status,
            });
        } catch (error) {
            console.error('Confirm trade error:', error);
            res.status(500).json({ error: 'Failed to confirm trade' });
        }
    },

    // Cancel trade
    async cancel(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;
            const { id } = req.params;

            const trade = await Trade.findOne({
                _id: id,
                $or: [{ trader1: userId }, { trader2: userId }],
                status: { $in: ['PENDING', 'CONFIRMED'] },
            });

            if (!trade) {
                res.status(404).json({ error: 'Trade not found or already completed' });
                return;
            }

            trade.status = 'CANCELLED';
            await trade.save();

            res.json({ message: 'Trade cancelled' });
        } catch (error) {
            console.error('Cancel trade error:', error);
            res.status(500).json({ error: 'Failed to cancel trade' });
        }
    },
};
