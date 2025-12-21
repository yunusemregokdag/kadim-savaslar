// ============================================
// RANDOM STATS SİSTEMİ
// ============================================

import { Equipment } from '../types';

export interface StatRange {
    min: number;
    max: number;
}

export interface RandomStatConfig {
    attack?: StatRange;
    defense?: StatRange;
    hp?: StatRange;
    mana?: StatRange;
    strength?: StatRange;
    dexterity?: StatRange;
    intelligence?: StatRange;
    vitality?: StatRange;
    critChance?: StatRange;
    critDamage?: StatRange;
    attackSpeed?: StatRange;
    moveSpeed?: StatRange;
}

// Tier'a göre stat aralıkları
export const STAT_RANGES_BY_TIER: { [tier: number]: RandomStatConfig } = {
    1: {
        attack: { min: 5, max: 10 },
        defense: { min: 3, max: 7 },
        hp: { min: 10, max: 25 },
        strength: { min: 1, max: 3 },
        dexterity: { min: 1, max: 3 },
        intelligence: { min: 1, max: 3 },
        vitality: { min: 1, max: 3 },
    },
    2: {
        attack: { min: 10, max: 20 },
        defense: { min: 7, max: 15 },
        hp: { min: 25, max: 50 },
        mana: { min: 10, max: 25 },
        strength: { min: 2, max: 5 },
        dexterity: { min: 2, max: 5 },
        intelligence: { min: 2, max: 5 },
        vitality: { min: 2, max: 5 },
        critChance: { min: 0, max: 2 },
    },
    3: {
        attack: { min: 20, max: 40 },
        defense: { min: 15, max: 30 },
        hp: { min: 50, max: 100 },
        mana: { min: 25, max: 50 },
        strength: { min: 4, max: 8 },
        dexterity: { min: 4, max: 8 },
        intelligence: { min: 4, max: 8 },
        vitality: { min: 4, max: 8 },
        critChance: { min: 1, max: 4 },
        critDamage: { min: 5, max: 15 },
    },
    4: {
        attack: { min: 40, max: 70 },
        defense: { min: 30, max: 55 },
        hp: { min: 100, max: 200 },
        mana: { min: 50, max: 100 },
        strength: { min: 7, max: 14 },
        dexterity: { min: 7, max: 14 },
        intelligence: { min: 7, max: 14 },
        vitality: { min: 7, max: 14 },
        critChance: { min: 3, max: 7 },
        critDamage: { min: 10, max: 25 },
        attackSpeed: { min: 2, max: 5 },
    },
    5: {
        attack: { min: 70, max: 120 },
        defense: { min: 55, max: 95 },
        hp: { min: 200, max: 400 },
        mana: { min: 100, max: 200 },
        strength: { min: 12, max: 22 },
        dexterity: { min: 12, max: 22 },
        intelligence: { min: 12, max: 22 },
        vitality: { min: 12, max: 22 },
        critChance: { min: 5, max: 12 },
        critDamage: { min: 20, max: 40 },
        attackSpeed: { min: 5, max: 10 },
        moveSpeed: { min: 3, max: 8 },
    },
};

// Rastgele değer üret (min-max arası)
export function randomInRange(range: StatRange): number {
    return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
}

// Item için random statlar üret
export function generateRandomStats(
    baseItem: Equipment,
    tier: number,
    statKeys: (keyof RandomStatConfig)[]
): Partial<Equipment> {
    const ranges = STAT_RANGES_BY_TIER[tier] || STAT_RANGES_BY_TIER[1];
    const randomStats: Partial<Equipment> = {};

    statKeys.forEach(key => {
        const range = ranges[key];
        if (range) {
            (randomStats as any)[key] = randomInRange(range);
        }
    });

    return randomStats;
}

// Item düşürülürken random stat ekle
export function rollItemStats(baseItem: Equipment): Equipment {
    const tier = (baseItem as any).tier || 1;
    const ranges = STAT_RANGES_BY_TIER[tier] || STAT_RANGES_BY_TIER[1];

    const rolledItem = { ...baseItem };

    // Mevcut statları random aralıkta yeniden hesapla
    Object.keys(ranges).forEach(key => {
        const range = (ranges as any)[key];
        if (range && (baseItem as any)[key] !== undefined) {
            (rolledItem as any)[key] = randomInRange(range);
        }
    });

    // Item kalitesi hesapla
    (rolledItem as any).quality = calculateItemQuality(rolledItem, tier);

    return rolledItem;
}

// Item kalitesi hesapla (max değerlere ne kadar yakın)
export function calculateItemQuality(item: Equipment, tier: number): number {
    const ranges = STAT_RANGES_BY_TIER[tier] || STAT_RANGES_BY_TIER[1];
    let totalQuality = 0;
    let statCount = 0;

    Object.entries(ranges).forEach(([key, range]) => {
        const value = (item as any)[key];
        if (value !== undefined && range) {
            const quality = ((value - range.min) / (range.max - range.min)) * 100;
            totalQuality += quality;
            statCount++;
        }
    });

    return statCount > 0 ? Math.round(totalQuality / statCount) : 50;
}

// Kalite derecesi
export function getQualityGrade(quality: number): { grade: string; color: string; icon: string } {
    if (quality >= 95) return { grade: 'SSS', color: '#ffd700', icon: '🌟' };
    if (quality >= 90) return { grade: 'SS', color: '#ff6b6b', icon: '⭐' };
    if (quality >= 80) return { grade: 'S', color: '#a855f7', icon: '💎' };
    if (quality >= 70) return { grade: 'A', color: '#3b82f6', icon: '🔷' };
    if (quality >= 60) return { grade: 'B', color: '#22c55e', icon: '🔹' };
    if (quality >= 50) return { grade: 'C', color: '#fbbf24', icon: '⬡' };
    if (quality >= 30) return { grade: 'D', color: '#94a3b8', icon: '○' };
    return { grade: 'F', color: '#64748b', icon: '·' };
}

// Stat tooltip'i (min-max gösterimi)
export function getStatTooltip(statKey: string, value: number, tier: number): string {
    const ranges = STAT_RANGES_BY_TIER[tier];
    const range = ranges ? (ranges as any)[statKey] : null;

    if (!range) return `${value}`;

    const isMax = value >= range.max;
    const isMin = value <= range.min;

    if (isMax) return `${value} ✨ (MAX!)`;
    if (isMin) return `${value} (min)`;

    return `${value} (${range.min}-${range.max})`;
}

// Perfect item kontrolü (tüm statlar max)
export function isPerfectItem(item: Equipment, tier: number): boolean {
    const quality = calculateItemQuality(item, tier);
    return quality >= 95;
}
