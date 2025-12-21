import { Response } from 'express';
import { GameEvent } from '../models/Event.js';
import { AuthRequest } from '../middleware/auth.js';

export const eventController = {
    // Get all active events
    async getActiveEvents(req: AuthRequest, res: Response) {
        try {
            const now = new Date();
            const events = await GameEvent.find({
                isActive: true,
                startTime: { $lte: now },
                endTime: { $gte: now }
            }).sort({ endTime: 1 }).lean();

            res.json({ events });
        } catch (error) {
            console.error('Get active events error:', error);
            res.status(500).json({ error: 'Failed to fetch events' });
        }
    },

    // Get upcoming events
    async getUpcomingEvents(req: AuthRequest, res: Response) {
        try {
            const now = new Date();
            const events = await GameEvent.find({
                isActive: true,
                startTime: { $gt: now }
            }).sort({ startTime: 1 }).limit(10).lean();

            res.json({ events });
        } catch (error) {
            console.error('Get upcoming events error:', error);
            res.status(500).json({ error: 'Failed to fetch upcoming events' });
        }
    },

    // Get event details
    async getEvent(req: AuthRequest, res: Response) {
        try {
            const { eventId } = req.params;
            const event = await GameEvent.findById(eventId).lean();

            if (!event) {
                return res.status(404).json({ error: 'Event not found' });
            }

            res.json(event);
        } catch (error) {
            console.error('Get event error:', error);
            res.status(500).json({ error: 'Failed to fetch event' });
        }
    },

    // Admin: Create event
    async createEvent(req: AuthRequest, res: Response) {
        try {
            // TODO: Add admin check
            const {
                name,
                description,
                eventType,
                startTime,
                endTime,
                bonusMultiplier,
                targetZones,
                rewards,
                requirements
            } = req.body;

            const event = new GameEvent({
                name,
                description,
                eventType,
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                bonusMultiplier: bonusMultiplier || 1.0,
                targetZones: targetZones || [],
                rewards: rewards || {},
                requirements: requirements || {},
                isActive: true
            });

            await event.save();

            res.json({ success: true, event });
        } catch (error) {
            console.error('Create event error:', error);
            res.status(500).json({ error: 'Failed to create event' });
        }
    },

    // Admin: Update event
    async updateEvent(req: AuthRequest, res: Response) {
        try {
            const { eventId } = req.params;
            const updates = req.body;

            const event = await GameEvent.findByIdAndUpdate(
                eventId,
                { ...updates, updatedAt: new Date() },
                { new: true }
            );

            if (!event) {
                return res.status(404).json({ error: 'Event not found' });
            }

            res.json({ success: true, event });
        } catch (error) {
            console.error('Update event error:', error);
            res.status(500).json({ error: 'Failed to update event' });
        }
    },

    // Admin: Delete event
    async deleteEvent(req: AuthRequest, res: Response) {
        try {
            const { eventId } = req.params;

            await GameEvent.findByIdAndDelete(eventId);

            res.json({ success: true, message: 'Event deleted' });
        } catch (error) {
            console.error('Delete event error:', error);
            res.status(500).json({ error: 'Failed to delete event' });
        }
    },

    // Get current bonuses for a player
    async getCurrentBonuses(req: AuthRequest, res: Response) {
        try {
            const { zoneId, level } = req.query;
            const now = new Date();

            const activeEvents = await GameEvent.find({
                isActive: true,
                startTime: { $lte: now },
                endTime: { $gte: now }
            }).lean();

            let expBonus = 1.0;
            let goldBonus = 1.0;
            let dropBonus = 1.0;

            const playerLevel = parseInt(level as string) || 1;
            const playerZone = parseInt(zoneId as string) || 0;

            for (const event of activeEvents) {
                // Check level requirements
                if (event.requirements.minLevel && playerLevel < event.requirements.minLevel) continue;
                if (event.requirements.maxLevel && playerLevel > event.requirements.maxLevel) continue;

                // Check zone requirements (empty = all zones)
                if (event.targetZones.length > 0 && !event.targetZones.includes(playerZone)) continue;

                // Apply bonuses
                switch (event.eventType) {
                    case 'exp_boost':
                        expBonus = Math.max(expBonus, event.bonusMultiplier);
                        break;
                    case 'gold_boost':
                        goldBonus = Math.max(goldBonus, event.bonusMultiplier);
                        break;
                    case 'drop_boost':
                        dropBonus = Math.max(dropBonus, event.bonusMultiplier);
                        break;
                }
            }

            res.json({
                expBonus,
                goldBonus,
                dropBonus,
                activeEvents: activeEvents.map(e => ({
                    id: e._id,
                    name: e.name,
                    type: e.eventType,
                    endsAt: e.endTime
                }))
            });
        } catch (error) {
            console.error('Get current bonuses error:', error);
            res.status(500).json({ error: 'Failed to fetch bonuses' });
        }
    }
};

// Helper function to seed default events (can be called on server start)
export const seedDefaultEvents = async () => {
    const existingEvents = await GameEvent.countDocuments();
    if (existingEvents > 0) return;

    // Create some default recurring events
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const defaultEvents = [
        {
            name: '2X EXP Hafta Sonu!',
            description: 'Tüm bölgelerde deneyim puanı iki katına çıktı! Bu fırsatı kaçırma!',
            eventType: 'exp_boost' as const,
            startTime: now,
            endTime: nextWeek,
            bonusMultiplier: 2.0,
            isActive: true
        },
        {
            name: 'Altın Yağmuru',
            description: 'Düşmanlardan %50 daha fazla altın düşüyor!',
            eventType: 'gold_boost' as const,
            startTime: tomorrow,
            endTime: nextWeek,
            bonusMultiplier: 1.5,
            isActive: true
        }
    ];

    await GameEvent.insertMany(defaultEvents);
    console.log('✅ Default events seeded');
};
