/**
 * Combat System Utilities
 * Hasar hesaplama, sınıf menzilleri ve savaş mekanikleri
 */

import { CharacterClass } from '../types';

// --- SINIF SALDIRI MENZİLLERİ ---
export interface ClassCombatConfig {
    attackRange: number;      // Temel saldırı menzili (birim)
    skillRange: number;       // Yetenek menzili
    attackType: 'melee' | 'ranged' | 'magic';
    attackSpeed: number;      // Saldırı hızı çarpanı (1 = normal)
    critChance: number;       // Kritik vuruş şansı (%)
    critMultiplier: number;   // Kritik vuruş çarpanı
    baseArmor: number;        // Temel zırh değeri
    projectileSpeed?: number; // Mermi hızı (ranged için)
}

export const CLASS_COMBAT_CONFIG: Record<CharacterClass, ClassCombatConfig> = {
    // YAKIN DÖVÜŞ (MELEE)
    warrior: {
        attackRange: 3,
        skillRange: 5,
        attackType: 'melee',
        attackSpeed: 1.0,
        critChance: 5,
        critMultiplier: 1.5,
        baseArmor: 50,
    },
    arctic_knight: {
        attackRange: 3,
        skillRange: 6,
        attackType: 'melee',
        attackSpeed: 0.9,
        critChance: 5,
        critMultiplier: 1.5,
        baseArmor: 60,
    },
    gale_glaive: {
        attackRange: 4,
        skillRange: 7,
        attackType: 'melee',
        attackSpeed: 1.3,
        critChance: 10,
        critMultiplier: 1.8,
        baseArmor: 30,
    },
    martial_artist: {
        attackRange: 2.5,
        skillRange: 4,
        attackType: 'melee',
        attackSpeed: 1.5,
        critChance: 15,
        critMultiplier: 2.0,
        baseArmor: 25,
    },
    monk: {
        attackRange: 3,
        skillRange: 5,
        attackType: 'melee',
        attackSpeed: 1.1,
        critChance: 8,
        critMultiplier: 1.6,
        baseArmor: 40,
    },
    reaper: {
        attackRange: 4,
        skillRange: 6,
        attackType: 'melee',
        attackSpeed: 1.2,
        critChance: 12,
        critMultiplier: 2.2,
        baseArmor: 20,
    },

    // UZAK DÖVÜŞ (RANGED)
    archer: {
        attackRange: 15,
        skillRange: 18,
        attackType: 'ranged',
        attackSpeed: 1.4,
        critChance: 20,
        critMultiplier: 2.5,
        baseArmor: 15,
        projectileSpeed: 25,
    },

    // BÜYÜ (MAGIC)
    archmage: {
        attackRange: 12,
        skillRange: 15,
        attackType: 'magic',
        attackSpeed: 0.8,
        critChance: 8,
        critMultiplier: 1.8,
        baseArmor: 10,
        projectileSpeed: 18,
    },
    bard: {
        attackRange: 10,
        skillRange: 12,
        attackType: 'magic',
        attackSpeed: 1.0,
        critChance: 5,
        critMultiplier: 1.4,
        baseArmor: 20,
        projectileSpeed: 15,
    },
    cleric: {
        attackRange: 8,
        skillRange: 10,
        attackType: 'magic',
        attackSpeed: 0.9,
        critChance: 3,
        critMultiplier: 1.3,
        baseArmor: 35,
        projectileSpeed: 12,
    },
};

// --- HASAR HESAPLAMA FORMÜLÜ ---
/**
 * Final hasar hesaplama
 * Formula: FinalDamage = RawDamage * (100 / (100 + Defense))
 * 
 * Örnek:
 * - 1000 hasar vs 900 defans = 1000 * (100 / (100 + 900)) = 100 hasar
 * - 1000 hasar vs 100 defans = 1000 * (100 / (100 + 100)) = 500 hasar
 * - 1000 hasar vs 0 defans = 1000 * (100 / 100) = 1000 hasar
 */
export function calculateDamage(
    rawDamage: number,
    targetDefense: number,
    isCritical: boolean = false,
    critMultiplier: number = 1.5,
    damageType: 'physical' | 'magical' | 'true' = 'physical'
): { damage: number; isCritical: boolean; damageReduction: number } {
    // True damage ignores defense
    if (damageType === 'true') {
        const finalDamage = isCritical ? rawDamage * critMultiplier : rawDamage;
        return { damage: Math.floor(finalDamage), isCritical, damageReduction: 0 };
    }

    // Defense formula: Damage * (100 / (100 + Defense))
    // This gives diminishing returns on defense stacking
    const effectiveDefense = Math.max(0, targetDefense);
    const damageMultiplier = 100 / (100 + effectiveDefense);

    let finalDamage = rawDamage * damageMultiplier;

    // Critical hit
    if (isCritical) {
        finalDamage *= critMultiplier;
    }

    // Minimum damage (always deal at least 1 damage)
    finalDamage = Math.max(1, Math.floor(finalDamage));

    const damageReduction = Math.floor((1 - damageMultiplier) * 100);

    return { damage: finalDamage, isCritical, damageReduction };
}

/**
 * Kritik vuruş belirleme
 */
export function rollCritical(critChance: number): boolean {
    return Math.random() * 100 < critChance;
}

/**
 * Hasar çeşitlendirme (%90-110 arasında)
 */
export function applyDamageVariance(damage: number, variance: number = 0.1): number {
    const min = damage * (1 - variance);
    const max = damage * (1 + variance);
    return Math.floor(min + Math.random() * (max - min));
}

/**
 * Tam combat hesaplama
 */
export function performAttack(
    attackerClass: CharacterClass,
    attackerDamage: number,
    targetDefense: number,
    bonusCritChance: number = 0, // Equipment bonuses
    bonusCritDamage: number = 0  // Equipment bonuses
): { damage: number; isCritical: boolean; damageReduction: number } {
    const config = CLASS_COMBAT_CONFIG[attackerClass];

    // Roll for crit
    const totalCritChance = config.critChance + bonusCritChance;
    const isCritical = rollCritical(totalCritChance);

    // Calculate crit multiplier
    const totalCritMultiplier = config.critMultiplier + (bonusCritDamage / 100);

    // Apply variance
    const variedDamage = applyDamageVariance(attackerDamage);

    // Calculate final damage
    return calculateDamage(variedDamage, targetDefense, isCritical, totalCritMultiplier);
}

/**
 * Menzil kontrolü
 */
export function isInAttackRange(
    attackerClass: CharacterClass,
    attackerX: number,
    attackerY: number,
    targetX: number,
    targetY: number,
    isSkill: boolean = false
): boolean {
    const config = CLASS_COMBAT_CONFIG[attackerClass];
    const range = isSkill ? config.skillRange : config.attackRange;

    const distance = Math.sqrt(
        Math.pow(targetX - attackerX, 2) +
        Math.pow(targetY - attackerY, 2)
    );

    return distance <= range;
}

/**
 * Mesafe hesaplama
 */
export function getDistance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

/**
 * Optimal saldırı mesafesi (düşmana yaklaşırken)
 */
export function getOptimalRange(attackerClass: CharacterClass): number {
    const config = CLASS_COMBAT_CONFIG[attackerClass];
    // Melee wants to be close, ranged wants to be at max range
    if (config.attackType === 'melee') {
        return config.attackRange * 0.8;
    }
    return config.attackRange * 0.9;
}

/**
 * Saldırı tipi kontrolü
 */
export function isMeleeClass(charClass: CharacterClass): boolean {
    return CLASS_COMBAT_CONFIG[charClass].attackType === 'melee';
}

export function isRangedClass(charClass: CharacterClass): boolean {
    return CLASS_COMBAT_CONFIG[charClass].attackType === 'ranged' ||
        CLASS_COMBAT_CONFIG[charClass].attackType === 'magic';
}

// --- EFFECTIVE STATS CALCULATION ---
export interface EffectiveStats {
    damage: number;
    defense: number;
    critChance: number;
    critDamage: number;
    attackSpeed: number;
    maxHp: number;
    maxMp: number;
}

export function calculateEffectiveStats(
    baseDamage: number,
    baseDefense: number,
    charClass: CharacterClass,
    level: number,
    equipmentBonuses: Partial<EffectiveStats> = {}
): EffectiveStats {
    const config = CLASS_COMBAT_CONFIG[charClass];

    return {
        damage: baseDamage + (equipmentBonuses.damage || 0),
        defense: baseDefense + config.baseArmor + (equipmentBonuses.defense || 0),
        critChance: config.critChance + (equipmentBonuses.critChance || 0),
        critDamage: (config.critMultiplier * 100) + (equipmentBonuses.critDamage || 0),
        attackSpeed: config.attackSpeed + (equipmentBonuses.attackSpeed || 0),
        maxHp: (equipmentBonuses.maxHp || 0),
        maxMp: (equipmentBonuses.maxMp || 0),
    };
}

// --- CONSOLE LOG FOR COMBAT DEBUG ---
export function logCombat(
    attackerName: string,
    targetName: string,
    rawDamage: number,
    result: { damage: number; isCritical: boolean; damageReduction: number }
): void {
    if (process.env.NODE_ENV === 'development') {
        console.log(
            `⚔️ ${attackerName} -> ${targetName}: ${rawDamage} raw → ${result.damage} final ` +
            `(${result.damageReduction}% blocked${result.isCritical ? ', CRIT!' : ''})`
        );
    }
}
