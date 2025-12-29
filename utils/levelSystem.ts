/**
 * levelSystem.ts
 * Core Level System Logic
 * - EXP addition
 * - Level calculation
 * - Level-up detection
 * - Max level cap (30)
 */

import { LEVEL_XP_REQUIREMENTS } from '../constants';

export const MAX_LEVEL = 30;
export const STAT_POINTS_PER_LEVEL = 5;

/**
 * Calculate current level from total EXP
 */
export function getLevelFromExp(totalExp: number): number {
    for (let level = MAX_LEVEL; level >= 1; level--) {
        if (totalExp >= LEVEL_XP_REQUIREMENTS[level]) {
            return level;
        }
    }
    return 1;
}

/**
 * Get EXP required to reach a specific level
 */
export function getExpForLevel(level: number): number {
    if (level < 1) return 0;
    if (level > MAX_LEVEL) return LEVEL_XP_REQUIREMENTS[MAX_LEVEL];
    return LEVEL_XP_REQUIREMENTS[level];
}

/**
 * Get EXP required for NEXT level
 */
export function getExpForNextLevel(currentLevel: number): number {
    if (currentLevel >= MAX_LEVEL) return LEVEL_XP_REQUIREMENTS[MAX_LEVEL];
    return LEVEL_XP_REQUIREMENTS[currentLevel + 1];
}

/**
 * Calculate EXP progress percentage between current and next level
 * Returns 0-100
 */
export function getExpProgress(totalExp: number, currentLevel: number): number {
    if (currentLevel >= MAX_LEVEL) return 100;

    const currentLevelExp = getExpForLevel(currentLevel);
    const nextLevelExp = getExpForNextLevel(currentLevel);
    const expInLevel = totalExp - currentLevelExp;
    const expNeeded = nextLevelExp - currentLevelExp;

    if (expNeeded <= 0) return 100;

    const progress = (expInLevel / expNeeded) * 100;
    return Math.min(100, Math.max(0, progress));
}

/**
 * Result of adding EXP
 */
export interface ExpResult {
    newExp: number;
    newLevel: number;
    levelsGained: number;
    statPointsGained: number;
    didLevelUp: boolean;
}

/**
 * Add EXP and calculate level changes
 * Handles multiple level-ups in one call
 */
export function addExp(currentExp: number, currentLevel: number, expGain: number): ExpResult {
    const newExp = currentExp + expGain;
    const newLevel = Math.min(MAX_LEVEL, getLevelFromExp(newExp));
    const levelsGained = newLevel - currentLevel;
    const statPointsGained = levelsGained * STAT_POINTS_PER_LEVEL;

    return {
        newExp,
        newLevel,
        levelsGained,
        statPointsGained,
        didLevelUp: levelsGained > 0
    };
}

/**
 * Format large EXP numbers for display
 * e.g., 1,500,000 → "1.5M"
 */
export function formatExp(exp: number): string {
    if (exp >= 1_000_000_000_000) return (exp / 1_000_000_000_000).toFixed(1) + 'T';
    if (exp >= 1_000_000_000) return (exp / 1_000_000_000).toFixed(1) + 'B';
    if (exp >= 1_000_000) return (exp / 1_000_000).toFixed(1) + 'M';
    if (exp >= 1_000) return (exp / 1_000).toFixed(1) + 'K';
    return exp.toString();
}
