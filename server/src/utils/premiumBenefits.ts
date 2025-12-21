// Premium benefits utility functions
// Use these functions throughout the game to apply premium bonuses

import { premiumController } from '../controllers/premiumController.js';

interface PremiumBenefits {
    expMultiplier: number;
    goldMultiplier: number;
    dropRateBonus: number;
    inventorySlots: number;
    storageSlots: number;
    dailyGems: number;
    nameColor: string;
    badge: string;
    priorityQueue: boolean;
    discountPercent: number;
}

const DEFAULT_BENEFITS: PremiumBenefits = {
    expMultiplier: 1,
    goldMultiplier: 1,
    dropRateBonus: 0,
    inventorySlots: 0,
    storageSlots: 0,
    dailyGems: 0,
    nameColor: '#FFFFFF',
    badge: '',
    priorityQueue: false,
    discountPercent: 0
};

/**
 * Get premium benefits for a user
 */
export const getPremiumBenefits = async (userId: string): Promise<PremiumBenefits> => {
    const benefits = await premiumController.getBenefits(userId);
    return benefits || DEFAULT_BENEFITS;
};

/**
 * Apply EXP multiplier from premium
 */
export const applyExpMultiplier = async (userId: string, baseExp: number): Promise<number> => {
    const benefits = await getPremiumBenefits(userId);
    return Math.floor(baseExp * benefits.expMultiplier);
};

/**
 * Apply Gold multiplier from premium
 */
export const applyGoldMultiplier = async (userId: string, baseGold: number): Promise<number> => {
    const benefits = await getPremiumBenefits(userId);
    return Math.floor(baseGold * benefits.goldMultiplier);
};

/**
 * Apply drop rate bonus from premium
 * Returns true if item should drop (with bonus applied)
 */
export const shouldDropItem = async (userId: string, baseDropRate: number): Promise<boolean> => {
    const benefits = await getPremiumBenefits(userId);
    const effectiveRate = baseDropRate * (1 + benefits.dropRateBonus / 100);
    return Math.random() * 100 < effectiveRate;
};

/**
 * Get extra inventory slots from premium
 */
export const getExtraInventorySlots = async (userId: string): Promise<number> => {
    const benefits = await getPremiumBenefits(userId);
    return benefits.inventorySlots;
};

/**
 * Get extra storage slots from premium
 */
export const getExtraStorageSlots = async (userId: string): Promise<number> => {
    const benefits = await getPremiumBenefits(userId);
    return benefits.storageSlots;
};

/**
 * Apply shop discount from premium
 */
export const applyShopDiscount = async (userId: string, basePrice: number): Promise<number> => {
    const benefits = await getPremiumBenefits(userId);
    const discount = benefits.discountPercent / 100;
    return Math.floor(basePrice * (1 - discount));
};

/**
 * Get player name color from premium
 */
export const getNameColor = async (userId: string): Promise<string> => {
    const benefits = await getPremiumBenefits(userId);
    return benefits.nameColor;
};

/**
 * Get player badge from premium
 */
export const getBadge = async (userId: string): Promise<string> => {
    const benefits = await getPremiumBenefits(userId);
    return benefits.badge;
};

export default {
    getPremiumBenefits,
    applyExpMultiplier,
    applyGoldMultiplier,
    shouldDropItem,
    getExtraInventorySlots,
    getExtraStorageSlots,
    applyShopDiscount,
    getNameColor,
    getBadge
};
