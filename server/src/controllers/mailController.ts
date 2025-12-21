import { Response } from 'express';
import { Mail } from '../models/Mail.js';
import { User } from '../models/User.js';
import { Character } from '../models/Character.js';
import { AuthRequest } from '../middleware/auth.js';

export const mailController = {
    // Get inbox
    async inbox(req: AuthRequest, res: Response) {
        try {
            const userId = req.userId;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            const skip = (page - 1) * limit;

            const mails = await Mail.find({ recipientId: userId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean();

            const total = await Mail.countDocuments({ recipientId: userId });
            const unreadCount = await Mail.countDocuments({ recipientId: userId, isRead: false });

            res.json({
                mails,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                },
                unreadCount
            });
        } catch (error) {
            console.error('Mail inbox error:', error);
            res.status(500).json({ error: 'Failed to fetch inbox' });
        }
    },

    // Send mail to player
    async send(req: AuthRequest, res: Response) {
        try {
            const senderId = req.userId;
            const { recipientName, subject, message, attachedItems, attachedGold } = req.body;

            if (!recipientName || !subject || !message) {
                return res.status(400).json({ error: 'Recipient, subject and message are required' });
            }

            // Find recipient by character name or username
            let recipient = await Character.findOne({ name: recipientName }).populate('userId');
            if (!recipient) {
                const user = await User.findOne({ username: recipientName });
                if (!user) {
                    return res.status(404).json({ error: 'Player not found' });
                }
                recipient = await Character.findOne({ userId: user._id });
            }

            if (!recipient) {
                return res.status(404).json({ error: 'Player not found' });
            }

            // Get sender info
            const senderChar = await Character.findOne({ userId: senderId });
            const senderName = senderChar?.name || 'Unknown';

            // Validate mail cost (10 gold per mail)
            const mailCost = 10;
            if (senderChar && senderChar.gold < mailCost) {
                return res.status(400).json({ error: 'Not enough gold to send mail (10 gold required)' });
            }

            // Deduct gold from sender
            if (senderChar) {
                senderChar.gold -= mailCost;
                await senderChar.save();
            }

            const mail = new Mail({
                senderId,
                senderName,
                recipientId: recipient.userId,
                recipientName: recipient.name,
                subject,
                message,
                attachedItems: attachedItems || [],
                attachedGold: attachedGold || 0,
                mailType: 'player'
            });

            await mail.save();

            res.json({
                success: true,
                message: 'Mail sent successfully',
                mailId: mail._id
            });
        } catch (error) {
            console.error('Send mail error:', error);
            res.status(500).json({ error: 'Failed to send mail' });
        }
    },

    // Read mail
    async read(req: AuthRequest, res: Response) {
        try {
            const userId = req.userId;
            const { mailId } = req.params;

            const mail = await Mail.findOne({ _id: mailId, recipientId: userId });
            if (!mail) {
                return res.status(404).json({ error: 'Mail not found' });
            }

            // Mark as read
            mail.isRead = true;
            await mail.save();

            res.json(mail);
        } catch (error) {
            console.error('Read mail error:', error);
            res.status(500).json({ error: 'Failed to read mail' });
        }
    },

    // Collect attachments
    async collect(req: AuthRequest, res: Response) {
        try {
            const userId = req.userId;
            const { mailId } = req.params;

            const mail = await Mail.findOne({ _id: mailId, recipientId: userId });
            if (!mail) {
                return res.status(404).json({ error: 'Mail not found' });
            }

            if (mail.isCollected) {
                return res.status(400).json({ error: 'Attachments already collected' });
            }

            // Get character
            const character = await Character.findOne({ userId });
            if (!character) {
                return res.status(404).json({ error: 'Character not found' });
            }

            // Add gold
            if (mail.attachedGold > 0) {
                character.gold = (character.gold || 0) + mail.attachedGold;
            }

            // Add items to inventory
            if (mail.attachedItems && mail.attachedItems.length > 0) {
                const inventory = character.inventory || [];
                mail.attachedItems.forEach(item => {
                    inventory.push({
                        id: item.itemId,
                        name: item.name,
                        type: item.type,
                        rarity: item.rarity,
                        stats: item.stats,
                        quantity: 1
                    });
                });
                character.inventory = inventory;
            }

            await character.save();

            // Mark as collected
            mail.isCollected = true;
            await mail.save();

            res.json({
                success: true,
                message: 'Attachments collected',
                gold: mail.attachedGold,
                items: mail.attachedItems
            });
        } catch (error) {
            console.error('Collect mail error:', error);
            res.status(500).json({ error: 'Failed to collect attachments' });
        }
    },

    // Delete mail
    async delete(req: AuthRequest, res: Response) {
        try {
            const userId = req.userId;
            const { mailId } = req.params;

            const mail = await Mail.findOne({ _id: mailId, recipientId: userId });
            if (!mail) {
                return res.status(404).json({ error: 'Mail not found' });
            }

            // Check if has uncollected attachments
            if (!mail.isCollected && (mail.attachedGold > 0 || mail.attachedItems.length > 0)) {
                return res.status(400).json({ error: 'Collect attachments before deleting' });
            }

            await Mail.deleteOne({ _id: mailId });

            res.json({ success: true, message: 'Mail deleted' });
        } catch (error) {
            console.error('Delete mail error:', error);
            res.status(500).json({ error: 'Failed to delete mail' });
        }
    },

    // Delete all read mails
    async deleteAllRead(req: AuthRequest, res: Response) {
        try {
            const userId = req.userId;

            // Delete mails that are read and have no uncollected attachments
            const result = await Mail.deleteMany({
                recipientId: userId,
                isRead: true,
                $or: [
                    { isCollected: true },
                    { attachedGold: 0, attachedItems: { $size: 0 } }
                ]
            });

            res.json({
                success: true,
                deletedCount: result.deletedCount
            });
        } catch (error) {
            console.error('Delete all read mails error:', error);
            res.status(500).json({ error: 'Failed to delete mails' });
        }
    },

    // Send system mail (for internal use - rewards, events, etc.)
    async sendSystemMail(
        recipientId: string,
        recipientName: string,
        subject: string,
        message: string,
        attachedGold: number = 0,
        attachedItems: any[] = [],
        attachedGems: number = 0
    ) {
        try {
            const mail = new Mail({
                senderId: null,
                senderName: 'Sistem',
                recipientId,
                recipientName,
                subject,
                message,
                attachedItems,
                attachedGold,
                attachedGems,
                mailType: 'system'
            });

            await mail.save();
            return mail;
        } catch (error) {
            console.error('Send system mail error:', error);
            throw error;
        }
    }
};
