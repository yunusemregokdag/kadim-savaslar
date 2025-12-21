import { Response } from 'express';
import { Premium, PREMIUM_TIERS, PREMIUM_PACKAGES, PremiumTier } from '../models/Premium.js';
import { User } from '../models/User.js';
import { AuthRequest } from '../middleware/auth.js';

// Get today's date string
const getTodayDate = (): string => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

export const premiumController = {
    // Get premium status
    async getStatus(req: AuthRequest, res: Response) {
        try {
            const userId = req.userId;

            let premium = await Premium.findOne({ userId });

            // Check if expired
            if (premium && premium.expiresAt && premium.expiresAt < new Date()) {
                premium.tier = 'none';
                premium.expiresAt = null;
                await premium.save();
            }

            if (!premium) {
                premium = new Premium({
                    userId,
                    tier: 'none',
                    expiresAt: null
                });
                await premium.save();
            }

            const benefits = premium.tier !== 'none' ? PREMIUM_TIERS[premium.tier] : null;
            const today = getTodayDate();
            const canClaimDaily = premium.tier !== 'none' && !premium.claimedDailyRewards.includes(today);

            res.json({
                premium: {
                    tier: premium.tier,
                    expiresAt: premium.expiresAt,
                    totalSpent: premium.totalSpent
                },
                benefits,
                packages: PREMIUM_PACKAGES,
                tiers: PREMIUM_TIERS,
                canClaimDaily
            });
        } catch (error) {
            console.error('Get premium status error:', error);
            res.status(500).json({ error: 'Failed to get premium status' });
        }
    },

    // Purchase premium
    async purchase(req: AuthRequest, res: Response) {
        try {
            const userId = req.userId;
            const { tier, duration } = req.body;

            // Find package
            const pkg = PREMIUM_PACKAGES.find(p => p.tier === tier && p.duration === duration);
            if (!pkg) {
                return res.status(400).json({ error: 'Invalid package' });
            }

            // Check user gems
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            if ((user.gems || 0) < pkg.price) {
                return res.status(400).json({ error: 'Not enough gems' });
            }

            // Deduct gems
            user.gems = (user.gems || 0) - pkg.price;
            await user.save();

            // Get or create premium
            let premium = await Premium.findOne({ userId });
            if (!premium) {
                premium = new Premium({ userId, tier: 'none' });
            }

            // Calculate new expiry
            let newExpiry: Date;
            if (premium.tier === tier && premium.expiresAt && premium.expiresAt > new Date()) {
                // Extend existing premium
                newExpiry = new Date(premium.expiresAt);
                newExpiry.setDate(newExpiry.getDate() + duration);
            } else {
                // New premium or upgrade
                newExpiry = new Date();
                newExpiry.setDate(newExpiry.getDate() + duration);
            }

            // Tier hierarchy check
            const tierOrder: PremiumTier[] = ['none', 'bronze', 'silver', 'gold', 'diamond'];
            const currentTierIndex = tierOrder.indexOf(premium.tier);
            const newTierIndex = tierOrder.indexOf(tier);

            // Upgrade or same tier
            if (newTierIndex >= currentTierIndex) {
                premium.tier = tier;
                premium.expiresAt = newExpiry;
            } else {
                // Can't downgrade - just extend current tier
                // Return error
                user.gems = (user.gems || 0) + pkg.price;
                await user.save();
                return res.status(400).json({ error: 'Cannot downgrade. Wait for current premium to expire.' });
            }

            premium.totalSpent += pkg.price;
            premium.purchaseHistory.push({
                tier,
                price: pkg.price,
                duration,
                purchaseDate: new Date()
            });
            premium.updatedAt = new Date();
            await premium.save();

            res.json({
                success: true,
                message: `${tier.toUpperCase()} premium aktivated!`,
                premium: {
                    tier: premium.tier,
                    expiresAt: premium.expiresAt
                },
                benefits: PREMIUM_TIERS[tier as keyof typeof PREMIUM_TIERS]
            });
        } catch (error) {
            console.error('Purchase premium error:', error);
            res.status(500).json({ error: 'Failed to purchase premium' });
        }
    },

    // Claim daily gems
    async claimDailyGems(req: AuthRequest, res: Response) {
        try {
            const userId = req.userId;
            const today = getTodayDate();

            const premium = await Premium.findOne({ userId });
            if (!premium || premium.tier === 'none') {
                return res.status(400).json({ error: 'No active premium' });
            }

            // Check if expired
            if (premium.expiresAt && premium.expiresAt < new Date()) {
                premium.tier = 'none';
                premium.expiresAt = null;
                await premium.save();
                return res.status(400).json({ error: 'Premium expired' });
            }

            // Check if already claimed
            if (premium.claimedDailyRewards.includes(today)) {
                return res.status(400).json({ error: 'Already claimed today' });
            }

            // Get gem amount
            const benefits = PREMIUM_TIERS[premium.tier as keyof typeof PREMIUM_TIERS];
            const gemAmount = benefits.dailyGems;

            // Add gems to user
            const user = await User.findById(userId);
            if (user) {
                user.gems = (user.gems || 0) + gemAmount;
                await user.save();
            }

            // Mark as claimed
            premium.claimedDailyRewards.push(today);

            // Keep only last 30 days of claims
            if (premium.claimedDailyRewards.length > 30) {
                premium.claimedDailyRewards = premium.claimedDailyRewards.slice(-30);
            }

            await premium.save();

            res.json({
                success: true,
                gemsReceived: gemAmount,
                totalGems: user?.gems || 0
            });
        } catch (error) {
            console.error('Claim daily gems error:', error);
            res.status(500).json({ error: 'Failed to claim daily gems' });
        }
    },

    // Get premium benefits for calculations (internal use)
    async getBenefits(userId: string) {
        try {
            const premium = await Premium.findOne({ userId });

            if (!premium || premium.tier === 'none') {
                return null;
            }

            // Check if expired
            if (premium.expiresAt && premium.expiresAt < new Date()) {
                return null;
            }

            return PREMIUM_TIERS[premium.tier as keyof typeof PREMIUM_TIERS];
        } catch {
            return null;
        }
    }
};
