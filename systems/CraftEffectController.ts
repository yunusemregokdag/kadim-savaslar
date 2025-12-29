/**
 * CraftEffectController.ts
 * Central controller for T4/T5 crafting visual effects
 * Handles timeline, LowFXMode, class colors, and skip logic
 */

import { CharacterClass } from '../types';

// ═══════════════════════════════════════════════════════════════════════════════
// GLOBAL FX MODE
// ═══════════════════════════════════════════════════════════════════════════════

let LowFXMode = false;

export function setLowFXMode(enabled: boolean): void {
    LowFXMode = enabled;
}

export function isLowFXMode(): boolean {
    return LowFXMode;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLASS COLOR PALETTES (Parameterized - No Hardcoding)
// ═══════════════════════════════════════════════════════════════════════════════

export interface ColorPalette {
    primary: string;
    secondary: string;
    accent: string;
    glow: string;
}

const CLASS_PALETTES: Record<CharacterClass, ColorPalette> = {
    warrior: { primary: '#dc2626', secondary: '#f97316', accent: '#fbbf24', glow: '#ef4444' },
    arctic_knight: { primary: '#0ea5e9', secondary: '#06b6d4', accent: '#22d3ee', glow: '#38bdf8' },
    gale_glaive: { primary: '#22c55e', secondary: '#84cc16', accent: '#a3e635', glow: '#4ade80' },
    archer: { primary: '#22c55e', secondary: '#eab308', accent: '#facc15', glow: '#86efac' },
    archmage: { primary: '#a855f7', secondary: '#8b5cf6', accent: '#c084fc', glow: '#d946ef' },
    bard: { primary: '#ec4899', secondary: '#f472b6', accent: '#fb7185', glow: '#f9a8d4' },
    cleric: { primary: '#fbbf24', secondary: '#f59e0b', accent: '#fcd34d', glow: '#fde68a' },
    martial_artist: { primary: '#dc2626', secondary: '#991b1b', accent: '#450a0a', glow: '#b91c1c' },
    monk: { primary: '#14b8a6', secondary: '#2dd4bf', accent: '#5eead4', glow: '#99f6e4' },
    reaper: { primary: '#7c3aed', secondary: '#6d28d9', accent: '#4c1d95', glow: '#a78bfa' },
};

export function getClassPalette(charClass: CharacterClass): ColorPalette {
    return CLASS_PALETTES[charClass] || CLASS_PALETTES.warrior;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TIER-BASED EFFECT CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

export interface TierEffectConfig {
    runeColor: string;
    runeColorPulse?: string;
    particleCount: number;
    particleCountLow: number;
    glowIntensity: number;
    duration: number;
    successEffectDuration: number;
    hasWingArcs: boolean;
    hasChestPulse: boolean;
}

export const TIER_EFFECTS: Record<4 | 5, TierEffectConfig> = {
    4: {
        runeColor: '#8b5cf6',           // Violet
        particleCount: 120,
        particleCountLow: 40,
        glowIntensity: 1.5,
        duration: 3500,                 // 3.5 seconds
        successEffectDuration: 6000,    // 6 seconds post-craft glow
        hasWingArcs: false,
        hasChestPulse: false,
    },
    5: {
        runeColor: '#dc2626',           // Crimson
        runeColorPulse: '#fbbf24',      // Gold pulse
        particleCount: 120,
        particleCountLow: 40,
        glowIntensity: 2.5,
        duration: 3500,                 // 3.5 seconds
        successEffectDuration: 10000,   // 10 seconds post-craft prestige effect
        hasWingArcs: true,
        hasChestPulse: true,
    },
};

export function getTierConfig(tier: 4 | 5): TierEffectConfig {
    return TIER_EFFECTS[tier];
}

// ═══════════════════════════════════════════════════════════════════════════════
// CRAFT ANIMATION TIMELINE
// ═══════════════════════════════════════════════════════════════════════════════

export type CraftPhase =
    | 'idle'
    | 'ui_lock'        // 0.0s - Lock UI
    | 'energy_circle'  // 0.3s - Rune appears
    | 'particle_rise'  // 0.8s - Particles rise
    | 'item_manifest'  // 1.8s - Item silhouette
    | 'impact_flash'   // 2.8s - Flash
    | 'result'         // 3.2s - Show result
    | 'complete';

export interface CraftTimelineEvent {
    phase: CraftPhase;
    timestamp: number;  // ms from start
}

export const CRAFT_TIMELINE: CraftTimelineEvent[] = [
    { phase: 'ui_lock', timestamp: 0 },
    { phase: 'energy_circle', timestamp: 300 },
    { phase: 'particle_rise', timestamp: 800 },
    { phase: 'item_manifest', timestamp: 1800 },
    { phase: 'impact_flash', timestamp: 2800 },
    { phase: 'result', timestamp: 3200 },
    { phase: 'complete', timestamp: 3500 },
];

export const SKIP_AVAILABLE_AT = 1200; // Can skip after 1.2s

// ═══════════════════════════════════════════════════════════════════════════════
// CRAFT STATE CONTROLLER
// ═══════════════════════════════════════════════════════════════════════════════

export interface CraftState {
    isActive: boolean;
    phase: CraftPhase;
    tier: 4 | 5;
    startTime: number;
    canSkip: boolean;
    wasSkipped: boolean;
    result: 'pending' | 'success' | 'failure';
}

export function createCraftState(): CraftState {
    return {
        isActive: false,
        phase: 'idle',
        tier: 4,
        startTime: 0,
        canSkip: false,
        wasSkipped: false,
        result: 'pending',
    };
}

export function startCraft(state: CraftState, tier: 4 | 5): CraftState {
    return {
        ...state,
        isActive: true,
        phase: 'ui_lock',
        tier,
        startTime: Date.now(),
        canSkip: false,
        wasSkipped: false,
        result: 'pending',
    };
}

export function updateCraftPhase(state: CraftState): CraftState {
    if (!state.isActive || state.wasSkipped) return state;

    const elapsed = Date.now() - state.startTime;

    // Check skip availability
    const canSkip = elapsed >= SKIP_AVAILABLE_AT && state.phase !== 'result' && state.phase !== 'complete';

    // Find current phase
    let currentPhase: CraftPhase = 'ui_lock';
    for (const event of CRAFT_TIMELINE) {
        if (elapsed >= event.timestamp) {
            currentPhase = event.phase;
        }
    }

    return {
        ...state,
        phase: currentPhase,
        canSkip,
    };
}

export function skipCraft(state: CraftState): CraftState {
    if (!state.canSkip) return state;

    return {
        ...state,
        phase: 'result',
        wasSkipped: true,
        canSkip: false,
    };
}

export function completeCraft(state: CraftState, success: boolean): CraftState {
    return {
        ...state,
        phase: 'complete',
        result: success ? 'success' : 'failure',
        isActive: false,
    };
}

// ═══════════════════════════════════════════════════════════════════════════════
// FAILURE TYPES & ICONS
// ═══════════════════════════════════════════════════════════════════════════════

export type FailureReason = 'materials' | 'gold' | 'diamonds' | 'tier_mismatch';

export interface FailureConfig {
    icon: string;
    label: string;
    description: string;
}

export const FAILURE_CONFIGS: Record<FailureReason, FailureConfig> = {
    materials: {
        icon: '📦',
        label: 'Malzeme Eksik',
        description: 'Gerekli malzemeler envanterinizde yok.',
    },
    gold: {
        icon: '💰',
        label: 'Yetersiz Altın',
        description: 'Bu zanaat için yeterli altınınız yok.',
    },
    diamonds: {
        icon: '💎',
        label: 'Yetersiz Elmas',
        description: 'Bu zanaat için yeterli elmasınız yok.',
    },
    tier_mismatch: {
        icon: '⚠️',
        label: 'Tier Uyumsuzluğu',
        description: 'Seçilen eşyalar bu tarif için uygun değil.',
    },
};

// ═══════════════════════════════════════════════════════════════════════════════
// PARTICLE COUNT HELPER
// ═══════════════════════════════════════════════════════════════════════════════

export function getParticleCount(tier: 4 | 5): number {
    const config = TIER_EFFECTS[tier];
    return LowFXMode ? config.particleCountLow : config.particleCount;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN SHAKE (Desktop Only, Disabled in LowFXMode)
// ═══════════════════════════════════════════════════════════════════════════════

export function shouldShakeScreen(): boolean {
    if (LowFXMode) return false;
    // Check if desktop (no touch)
    return typeof window !== 'undefined' && !('ontouchstart' in window);
}

// ═══════════════════════════════════════════════════════════════════════════════
// SOUND HOOKS (No audio files - just event triggers)
// ═══════════════════════════════════════════════════════════════════════════════

export type SoundEvent = 'craft_start' | 'craft_charge' | 'craft_impact' | 'craft_success' | 'craft_failure';

export function triggerSoundEvent(event: SoundEvent): void {
    // Hook for sound system - implement in SoundManager
    console.log(`[SOUND] ${event}`);
}
