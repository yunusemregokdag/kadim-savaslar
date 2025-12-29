/**
 * vipSystem.ts
 * Real-Money Economy: VIP System
 * 
 * PRINCIPLES:
 * - Time-based (Subscription)
 * - Tiers (VIP 1 vs VIP 2)
 * - Pay-to-Progress (Faster Exp/Gold)
 * - NO Direct Power (No T4/T5 unlocks)
 */

import { PlayerState } from '../types';

export enum VipTier {
    NONE = 0,
    SILVER = 1, // Standard
    GOLD = 2    // Premium
}

export const VIP_CONFIG = {
    [VipTier.SILVER]: {
        EXP_BONUS: 0.20,        // +20%
        GOLD_BONUS: 0.20,       // +20%
        DROP_QUALITY_CHANCE: 0.05, // +5% chance for higher rarity (not tier)
        CRAFT_SUCCESS_BONUS: 0.05, // +5% success
        MARKET_TAX_REDUCTION: 0.30, // -30% tax
        MARKET_SLOTS_BONUS: 2
    },
    [VipTier.GOLD]: {
        EXP_BONUS: 0.50,        // +50%
        GOLD_BONUS: 0.50,       // +50%
        DROP_QUALITY_CHANCE: 0.10, // +10%
        CRAFT_SUCCESS_BONUS: 0.10, // +10%
        MARKET_TAX_REDUCTION: 0.60, // -60% tax
        MARKET_SLOTS_BONUS: 5
    }
};

/**
 * Get current VIP Tier based on player state
 */
export function getVipTier(player: PlayerState): VipTier {
    if (!player.vipUntil || Date.now() > player.vipUntil) return VipTier.NONE;
    return (player as any).vipTier || (player as any).vipLevel || VipTier.SILVER;
}

/**
 * Generic getter for VIP multipliers/bonuses
 */
export function getVipBonus(player: PlayerState, type: keyof typeof VIP_CONFIG[VipTier.SILVER]): number {
    const tier = getVipTier(player);
    if (tier === VipTier.NONE) return 0;

    return VIP_CONFIG[tier][type] || 0;
}

/**
 * Helper: Apply tax reduction
 */
export function calculateVipTax(baseTax: number, player: PlayerState): number {
    const reduction = getVipBonus(player, 'MARKET_TAX_REDUCTION');
    return Math.floor(baseTax * (1 - reduction));
}

/**
 * Activate VIP (Simulated)
 */
export function activateVip(currentExpiry: number | undefined, days: number, tier: VipTier): number {
    const now = Date.now();
    const effectiveStart = (currentExpiry && currentExpiry > now) ? currentExpiry : now;
    return effectiveStart + (days * 24 * 60 * 60 * 1000);
}

/**
 * Claim Daily VIP Bonus
 * Checks cooldown (24h) and returns rewards
 */
export function claimDailyVipBonus(player: PlayerState): { success: boolean, rewards?: { gold: number, gems: number }, error?: string } {
    const tier = getVipTier(player);
    if (tier === VipTier.NONE) {
        return { success: false, error: 'VIP aktif değil.' };
    }

    const now = Date.now();
    const lastClaim = player.lastVipClaim || 0;

    // Using simple day check:
    const lastDate = new Date(lastClaim).toDateString();
    const todayDate = new Date(now).toDateString();

    if (lastDate === todayDate && lastClaim !== 0) {
        return { success: false, error: 'Bugünkü VIP ödülü zaten alındı.' };
    }

    // Define Rewards
    const rewards = {
        [VipTier.SILVER]: { gold: 5000, gems: 5 },
        [VipTier.GOLD]: { gold: 15000, gems: 15 }
    };

    return {
        success: true,
        rewards: rewards[tier]
    };
}
