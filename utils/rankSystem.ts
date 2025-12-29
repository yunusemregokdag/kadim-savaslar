/**
 * rankSystem.ts
 * Honor + Rank + Daily Ranking System
 * 
 * CORE LOGIC:
 * - RankScore = Weighted sum (Honor + Exp + Kills)
 * - Daily Ranking: Players sorted by RankScore -> Ranks assigned by %
 * - Anti-Abuse: Daily caps, Kill cooldowns
 */

import { PlayerState } from '../types';

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS & WEIGHTS
// ═══════════════════════════════════════════════════════════════════════════

const SCORE_WEIGHTS = {
    HONOR: 1.0,         // 1 Honor = 1 Score
    EXP_MILLION: 10,    // 1 Million EXP = 10 Score
    PLAYER_KILL: 50,    // 1 PvP Kill = 50 Score
    NPC_KILL: 0.1       // 10 NPC Kills = 1 Score
};

export const HONOR_LIMITS = {
    DAILY_CAP: 5000,
    KILL_COOLDOWN_MS: 300 * 1000, // 5 Minutes same target cooldown
    VALUES: {
        NPC: 2,
        ELITE: 10,
        BOSS: 50,
        PLAYER: 150
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// ANTI-ABUSE STATE
// ═══════════════════════════════════════════════════════════════════════════

// Map<KillerID, Map<VictimID, Timestamp>>
const killCooldowns = new Map<string, Map<string, number>>();

/**
 * Check if honor gain is valid (Anti-Abuse)
 */
export function canGainHonor(killer: PlayerState, targetId: string, type: 'player' | 'npc'): boolean {
    // 1. Daily Cap Check
    if ((killer.dailyHonor || 0) >= HONOR_LIMITS.DAILY_CAP) {
        return false;
    }

    // 2. PvP Cooldown Check
    if (type === 'player') {
        const killerCooldowns = killCooldowns.get(killer.nickname) || new Map();
        const lastKill = killerCooldowns.get(targetId);

        if (lastKill && Date.now() - lastKill < HONOR_LIMITS.KILL_COOLDOWN_MS) {
            return false; // Spam kill attempt
        }
    }

    return true;
}

/**
 * Record a kill for cooldown tracking
 */
export function recordKill(killerId: string, targetId: string) {
    let killerCooldowns = killCooldowns.get(killerId);
    if (!killerCooldowns) {
        killerCooldowns = new Map();
        killCooldowns.set(killerId, killerCooldowns);
    }
    killerCooldowns.set(targetId, Date.now());
}

// ═══════════════════════════════════════════════════════════════════════════
// RANK CALCULATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Calculate dynamic Rank Score
 */
export function calculateRankScore(player: PlayerState): number {
    const honorScore = player.honor * SCORE_WEIGHTS.HONOR;
    const expScore = (player.exp / 1_000_000) * SCORE_WEIGHTS.EXP_MILLION;

    // Note: Assuming we track stats in player.stats or similar. 
    // If not, these default to 0 for now.
    const kills = (player as any).stats?.kills || 0;
    const mobKills = (player as any).stats?.mobKills || 0;

    const pvpScore = kills * SCORE_WEIGHTS.PLAYER_KILL;
    const pveScore = mobKills * SCORE_WEIGHTS.NPC_KILL;

    return Math.floor(honorScore + expScore + pvpScore + pveScore);
}

/**
 * Simulate Daily Rank Distribution
 * (In a real server, this runs on all DB users)
 */
export function applyDailyRanks(allPlayers: PlayerState[]): PlayerState[] {
    // 1. Calculate Scores
    const scoredPlayers = allPlayers.map(p => ({
        player: p,
        score: calculateRankScore(p)
    }));

    // 2. Sort DESC
    scoredPlayers.sort((a, b) => b.score - a.score);

    // 3. Assign Ranks based on Percentages (Example Distribution)
    const total = scoredPlayers.length;

    return scoredPlayers.map((entry, index) => {
        const percentile = (index / total) * 100;
        let rankIdx = 0; // Recruit

        // Hardcoded distribution rules (Simulated)
        if (index === 0) rankIdx = 5;      // #1 -> Legend
        else if (percentile <= 1) rankIdx = 4; // Top 1% -> Commander
        else if (percentile <= 5) rankIdx = 3; // Top 5% -> Elite
        else if (percentile <= 15) rankIdx = 2; // Top 15% -> Veteran
        else if (percentile <= 40) rankIdx = 1; // Top 40% -> Soldier

        const updatedPlayer = { ...entry.player, rank: rankIdx };
        return updatedPlayer;
    });
}

/**
 * Get Honor amount for kill type
 */
export function getHonorValue(type: 'normal' | 'elite' | 'boss' | 'player'): number {
    switch (type) {
        case 'player': return HONOR_LIMITS.VALUES.PLAYER;
        case 'boss': return HONOR_LIMITS.VALUES.BOSS;
        case 'elite': return HONOR_LIMITS.VALUES.ELITE;
        default: return HONOR_LIMITS.VALUES.NPC;
    }
}


