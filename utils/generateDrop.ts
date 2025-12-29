/**
 * generateDrop.ts
 * Drop Table Logic for T1 / T2 / T3 items.
 * T4/T5 are craft-only and NEVER drop from mobs.
 */

import { ZONE_REWARDS, DEFAULT_ZONE_REWARD, ARMOR_SETS } from '../constants';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type DropQuality = 'normal' | 'medium' | 'premium';

export interface DropItem {
    id: string;
    name: string;
    tier: 1 | 2 | 3;
    quality: DropQuality;
    color: string;         // Hex color for UI
    type: string;          // helmet, armor, pants, boots, necklace, earring
    stats: Record<string, number>;
    scaledLevel: number;   // Mob level that generated this drop
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const QUALITY_COLORS: Record<DropQuality, string> = {
    normal: '#22c55e',   // Green
    medium: '#3b82f6',   // Blue
    premium: '#f97316',  // Orange
};

const QUALITY_STAT_MULTIPLIERS: Record<DropQuality, number> = {
    normal: 1.0,
    medium: 1.2,
    premium: 1.4,
};

// Quality roll thresholds (cumulative)
const QUALITY_THRESHOLDS = {
    premium: 0.05,  // 5%
    medium: 0.30,   // 25% (5% + 25% = 30%)
    normal: 1.00,   // 70% remainder
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Roll quality based on weighted probabilities.
 */
function rollQuality(): DropQuality {
    const roll = Math.random();
    if (roll < QUALITY_THRESHOLDS.premium) return 'premium';
    if (roll < QUALITY_THRESHOLDS.medium) return 'medium';
    return 'normal';
}

/**
 * Calculate level-based stat scaling.
 * Formula: BaseStat * (1 + mobLevel * 0.05)
 */
function scaleStats(baseStats: Record<string, number>, mobLevel: number, quality: DropQuality): Record<string, number> {
    const levelMultiplier = 1 + (mobLevel * 0.05);
    const qualityMultiplier = QUALITY_STAT_MULTIPLIERS[quality];

    const scaled: Record<string, number> = {};
    for (const [key, value] of Object.entries(baseStats)) {
        scaled[key] = Math.round(value * levelMultiplier * qualityMultiplier);
    }
    return scaled;
}

/**
 * Select a random base item from ARMOR_SETS matching the tier.
 */
function selectBaseItem(maxTier: number): typeof ARMOR_SETS[0] | null {
    // Filter items by allowed tier (1, 2, or 3 only)
    const eligibleItems = ARMOR_SETS.filter(item => item.tier <= maxTier && item.tier <= 3);
    if (eligibleItems.length === 0) return null;

    // Weighted selection: lower tiers more common
    const weighted: typeof ARMOR_SETS[0][] = [];
    for (const item of eligibleItems) {
        const weight = 4 - item.tier; // T1=3x, T2=2x, T3=1x
        for (let i = 0; i < weight; i++) {
            weighted.push(item);
        }
    }

    return weighted[Math.floor(Math.random() * weighted.length)];
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN FUNCTION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate a drop based on zone and mob level.
 * @param zoneId - Current zone ID
 * @param mobLevel - Level of the killed mob
 * @returns DropItem or null if no drop
 */
export function generateDrop(zoneId: number, mobLevel: number): DropItem | null {
    // 1. Get zone rewards config
    const zoneReward = ZONE_REWARDS[zoneId] || DEFAULT_ZONE_REWARD;

    // 2. Roll drop chance
    if (Math.random() > zoneReward.dropChance) {
        return null; // No drop
    }

    // 3. Select base item (respects maxTier)
    const baseItem = selectBaseItem(zoneReward.maxTier);
    if (!baseItem) return null;

    // 4. Roll quality
    const quality = rollQuality();

    // 5. Scale stats
    const baseStats = baseItem.stats || {};
    const scaledStats = scaleStats(baseStats as unknown as Record<string, number>, mobLevel, quality);

    // 6. Build DropItem
    const dropItem: DropItem = {
        id: `drop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: baseItem.name,
        tier: baseItem.tier as 1 | 2 | 3,
        quality,
        color: QUALITY_COLORS[quality],
        type: baseItem.type,
        stats: scaledStats,
        scaledLevel: mobLevel,
    };

    return dropItem;
}

// ─────────────────────────────────────────────────────────────────────────────
// MATERIAL DROP LOGIC (UPDATED PHASE 1)
// ─────────────────────────────────────────────────────────────────────────────

export interface MaterialDrop {
    id: string;
    name: string;
    type: 'material';
    tier: number;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    value: number;
    icon: string;
    description?: string;
}

/**
 * Generate a material drop based on mob type & level.
 * Rules:
 * - Normal Mobs: Basic Scrap (Common) - 5% chance
 * - Elite Mobs: Boss Essence (Epic) - 10% chance
 * - Boss Mobs: Boss Essence (High Chance) + Void Shard (Low Chance)
 * 
 * @param mobLevel - Level of the killed mob
 * @param isBoss - Is Boss
 * @param isElite - Is Elite
 * @returns MaterialDrop or null
 */
export function generateBossMaterialDrop(mobLevel: number, isBoss: boolean, isElite: boolean = false): MaterialDrop | null {

    // 1. VOID SHARD (Legendary) - Boss Only, Lvl 30+
    if ((isBoss && mobLevel >= 30) || (mobLevel >= 40)) { // Safety for high level zones
        if (Math.random() < 0.15) { // 15% from proper bosses
            return {
                id: `void_shard_${Date.now()}`,
                name: 'Boşluk Parçası',
                type: 'material',
                tier: 5,
                rarity: 'legendary',
                value: 5000,
                icon: '🌀',
                description: 'T5 Efsanevi Craft malzemesi.'
            };
        }
    }

    // 2. BOSS ESSENCE (Epic) - Boss (High) or Elite (Low)
    if (isBoss) {
        if (Math.random() < 1.0) { // Boss always drops essence (Guaranteed)
            return {
                id: `boss_essence_${Date.now()}`,
                name: 'Boss Özü',
                type: 'material',
                tier: 4,
                rarity: 'epic',
                value: 1000,
                icon: '💀',
                description: 'T4 Kadim Craft malzemesi.'
            };
        }
    } else if (isElite) {
        if (Math.random() < 0.20) { // Elite has 20% chance
            return {
                id: `boss_essence_${Date.now()}`,
                name: 'Boss Özü',
                type: 'material',
                tier: 4,
                rarity: 'epic',
                value: 1000,
                icon: '💀',
                description: 'T4 Kadim Craft malzemesi.'
            };
        }
    }

    // 3. BASIC SCRAP (Common) - Normal Mobs
    // Only if not boss/elite drop occurred
    if (Math.random() < 0.05) { // 5% chance from any mob
        return {
            id: `basic_scrap_${Date.now()}`,
            name: 'Metal Hurdası',
            type: 'material',
            tier: 1,
            rarity: 'common',
            value: 50,
            icon: '🔩',
            description: 'Basit üretim malzemesi.'
        };
    }

    return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────────────────────

export { QUALITY_COLORS, QUALITY_STAT_MULTIPLIERS };
