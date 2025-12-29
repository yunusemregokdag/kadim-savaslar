/**
 * antiBotSystem.ts
 * Anti-Bot Farming Detection System (The Watcher)
 * Detects AFK farming and applies diminishing returns.
 */

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const CLUSTER_RADIUS = 10;        // Meters - kills within this radius count as "same spot"
const KILLS_TO_ESCALATE = 20;     // Kills before debuff escalates
const RESET_DISTANCE = 50;        // Meters - move this far to reset
const RESET_TIME_MS = 5 * 60 * 1000; // 5 minutes in milliseconds

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type DebuffStage = 0 | 1 | 2 | 3;

export interface AntiBotState {
    killCenterX: number;
    killCenterZ: number;
    consecutiveKills: number;
    debuffStage: DebuffStage;
    lastKillTime: number;
    stageKillCount: number; // Kills since last stage escalation
}

export interface RewardMultipliers {
    dropMultiplier: number;  // 0.0 to 1.0
    expMultiplier: number;   // 0.0 to 1.0
    warningMessage: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// WARNING MESSAGES (Turkish)
// ─────────────────────────────────────────────────────────────────────────────

const WARNINGS: Record<DebuffStage, string | null> = {
    0: null,
    1: '⚠️ Yorgunluk başladı! Hareket et.',
    2: '⚠️ Loot düşmüyor! Bölge değiştir.',
    3: '⛔ Deneyim kazanmıyorsun! AFK tespit edildi.',
};

// ─────────────────────────────────────────────────────────────────────────────
// FACTORY
// ─────────────────────────────────────────────────────────────────────────────

export function createAntiBotState(): AntiBotState {
    return {
        killCenterX: 0,
        killCenterZ: 0,
        consecutiveKills: 0,
        debuffStage: 0,
        lastKillTime: 0,
        stageKillCount: 0,
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: Distance calculation
// ─────────────────────────────────────────────────────────────────────────────

function calculateDistance(x1: number, z1: number, x2: number, z2: number): number {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(z2 - z1, 2));
}

// ─────────────────────────────────────────────────────────────────────────────
// CORE: Update state on kill
// ─────────────────────────────────────────────────────────────────────────────

export function updateAntiBotOnKill(
    state: AntiBotState,
    killX: number,
    killZ: number
): { newState: AntiBotState; stageChanged: boolean } {
    const now = Date.now();
    let newState = { ...state };
    let stageChanged = false;

    // TIME-BASED RESET: If 5 minutes passed since last kill, reset everything
    if (state.lastKillTime > 0 && (now - state.lastKillTime) > RESET_TIME_MS) {
        return {
            newState: {
                ...createAntiBotState(),
                killCenterX: killX,
                killCenterZ: killZ,
                consecutiveKills: 1,
                lastKillTime: now,
            },
            stageChanged: false,
        };
    }

    // DISTANCE CHECK
    const distanceFromCenter = calculateDistance(
        killX, killZ,
        state.killCenterX, state.killCenterZ
    );

    // If player moved beyond reset distance OR this is first kill, reset cluster
    if (distanceFromCenter > RESET_DISTANCE || state.consecutiveKills === 0) {
        return {
            newState: {
                killCenterX: killX,
                killCenterZ: killZ,
                consecutiveKills: 1,
                debuffStage: 0,
                lastKillTime: now,
                stageKillCount: 0,
            },
            stageChanged: state.debuffStage !== 0,
        };
    }

    // If player moved beyond cluster radius but not reset distance, update center (light reset)
    if (distanceFromCenter > CLUSTER_RADIUS) {
        newState.killCenterX = killX;
        newState.killCenterZ = killZ;
        newState.stageKillCount = 1;
        newState.consecutiveKills += 1;
        newState.lastKillTime = now;
        // Debuff stage does NOT reset on small movement
        return { newState, stageChanged: false };
    }

    // SAME SPOT: Increment counters
    newState.consecutiveKills += 1;
    newState.stageKillCount += 1;
    newState.lastKillTime = now;

    // ESCALATE DEBUFF if threshold reached
    if (newState.stageKillCount >= KILLS_TO_ESCALATE && newState.debuffStage < 3) {
        newState.debuffStage = (newState.debuffStage + 1) as DebuffStage;
        newState.stageKillCount = 0; // Reset counter for next stage
        stageChanged = true;
    }

    return { newState, stageChanged };
}

// ─────────────────────────────────────────────────────────────────────────────
// CORE: Get reward multipliers based on current debuff stage
// ─────────────────────────────────────────────────────────────────────────────

export function getRewardMultipliers(state: AntiBotState): RewardMultipliers {
    switch (state.debuffStage) {
        case 0:
            return { dropMultiplier: 1.0, expMultiplier: 1.0, warningMessage: null };
        case 1:
            return { dropMultiplier: 0.5, expMultiplier: 1.0, warningMessage: WARNINGS[1] };
        case 2:
            return { dropMultiplier: 0.0, expMultiplier: 1.0, warningMessage: WARNINGS[2] };
        case 3:
            return { dropMultiplier: 0.0, expMultiplier: 0.0, warningMessage: WARNINGS[3] };
        default:
            return { dropMultiplier: 1.0, expMultiplier: 1.0, warningMessage: null };
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY: Reset state (for zone change)
// ─────────────────────────────────────────────────────────────────────────────

export function resetAntiBotState(): AntiBotState {
    return createAntiBotState();
}
