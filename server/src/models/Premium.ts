import mongoose, { Document, Schema } from 'mongoose';

export type PremiumTier = 'none' | 'bronze' | 'silver' | 'gold' | 'diamond';

export interface IPremiumBenefit {
    expMultiplier: number;
    goldMultiplier: number;
    dropRateBonus: number;
    inventorySlots: number;
    storageSlots: number;
    dailyGems: number;
    nameColor: string;
    badge: string;
    priorityQueue: boolean;
    exclusiveEmotes: string[];
    discountPercent: number;
}

export interface IPremium extends Document {
    userId: mongoose.Types.ObjectId;
    tier: PremiumTier;
    expiresAt: Date | null;
    totalSpent: number;
    purchaseHistory: Array<{
        tier: PremiumTier;
        price: number;
        duration: number; // days
        purchaseDate: Date;
    }>;
    claimedDailyRewards: string[]; // dates in YYYY-MM-DD format
    createdAt: Date;
    updatedAt: Date;
}

const PremiumSchema = new Schema<IPremium>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    tier: {
        type: String,
        enum: ['none', 'bronze', 'silver', 'gold', 'diamond'],
        default: 'none'
    },
    expiresAt: { type: Date, default: null },
    totalSpent: { type: Number, default: 0 },
    purchaseHistory: [{
        tier: String,
        price: Number,
        duration: Number,
        purchaseDate: { type: Date, default: Date.now }
    }],
    claimedDailyRewards: [String],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

PremiumSchema.index({ userId: 1 });
PremiumSchema.index({ expiresAt: 1 });

// Premium tier configurations
export const PREMIUM_TIERS: Record<Exclude<PremiumTier, 'none'>, IPremiumBenefit> = {
    bronze: {
        expMultiplier: 1.1,
        goldMultiplier: 1.1,
        dropRateBonus: 5,
        inventorySlots: 10,
        storageSlots: 20,
        dailyGems: 5,
        nameColor: '#CD7F32',
        badge: '🥉',
        priorityQueue: false,
        exclusiveEmotes: ['bronze_wave'],
        discountPercent: 5
    },
    silver: {
        expMultiplier: 1.25,
        goldMultiplier: 1.2,
        dropRateBonus: 10,
        inventorySlots: 20,
        storageSlots: 50,
        dailyGems: 15,
        nameColor: '#C0C0C0',
        badge: '🥈',
        priorityQueue: true,
        exclusiveEmotes: ['silver_wave', 'silver_dance'],
        discountPercent: 10
    },
    gold: {
        expMultiplier: 1.5,
        goldMultiplier: 1.5,
        dropRateBonus: 20,
        inventorySlots: 40,
        storageSlots: 100,
        dailyGems: 30,
        nameColor: '#FFD700',
        badge: '🥇',
        priorityQueue: true,
        exclusiveEmotes: ['gold_wave', 'gold_dance', 'gold_fireworks'],
        discountPercent: 15
    },
    diamond: {
        expMultiplier: 2.0,
        goldMultiplier: 2.0,
        dropRateBonus: 35,
        inventorySlots: 60,
        storageSlots: 200,
        dailyGems: 50,
        nameColor: '#B9F2FF',
        badge: '💎',
        priorityQueue: true,
        exclusiveEmotes: ['diamond_wave', 'diamond_dance', 'diamond_fireworks', 'diamond_aura'],
        discountPercent: 25
    }
};

// Premium packages (prices in gems)
export const PREMIUM_PACKAGES = [
    { tier: 'bronze' as const, duration: 7, price: 100, label: '1 Hafta' },
    { tier: 'bronze' as const, duration: 30, price: 350, label: '1 Ay' },
    { tier: 'silver' as const, duration: 7, price: 200, label: '1 Hafta' },
    { tier: 'silver' as const, duration: 30, price: 700, label: '1 Ay' },
    { tier: 'gold' as const, duration: 7, price: 400, label: '1 Hafta' },
    { tier: 'gold' as const, duration: 30, price: 1400, label: '1 Ay' },
    { tier: 'diamond' as const, duration: 7, price: 700, label: '1 Hafta' },
    { tier: 'diamond' as const, duration: 30, price: 2500, label: '1 Ay' }
];

export const Premium = mongoose.model<IPremium>('Premium', PremiumSchema);
