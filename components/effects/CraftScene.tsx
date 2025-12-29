/**
 * CraftScene.tsx
 * Complete 3D craft animation scene
 * Combines rune circle, particles, item manifest, and success effect
 * Orchestrates timeline via CraftEffectController
 */

import React, { useState, useEffect, useCallback } from 'react';
import { CharacterClass } from '../../types';
import {
    CraftState,
    createCraftState,
    startCraft,
    updateCraftPhase,
    skipCraft,
    completeCraft,
    SKIP_AVAILABLE_AT,
    triggerSoundEvent,
} from '../../systems/CraftEffectController';
import CraftRuneCircle from './CraftRuneCircle';
import CraftParticleSystem from './CraftParticleSystem';
import CraftItemManifest from './CraftItemManifest';
import CraftSuccessEffect from './CraftSuccessEffect';

interface CraftSceneProps {
    tier: 4 | 5 | null;
    charClass: CharacterClass;
    playerPosition: [number, number, number];
    onCraftComplete: (success: boolean) => void;
    craftSuccess: boolean;
}

export default function CraftScene({ tier, charClass, playerPosition, onCraftComplete, craftSuccess }: CraftSceneProps) {
    const [state, setState] = useState<CraftState>(createCraftState());
    const [showSuccessEffect, setShowSuccessEffect] = useState(false);

    // Start crafting when tier changes
    useEffect(() => {
        if (tier !== null) {
            setState(startCraft(createCraftState(), tier));
            triggerSoundEvent('craft_start');
        } else {
            setState(createCraftState());
        }
    }, [tier]);

    // Update phase loop
    useEffect(() => {
        if (!state.isActive) return;

        const interval = setInterval(() => {
            setState(prev => {
                const updated = updateCraftPhase(prev);

                // Trigger sounds on phase changes
                if (updated.phase !== prev.phase) {
                    if (updated.phase === 'energy_circle') triggerSoundEvent('craft_charge');
                    if (updated.phase === 'impact_flash') triggerSoundEvent('craft_impact');
                }

                // Auto-complete when reaching result phase
                if (updated.phase === 'result' && prev.phase !== 'result') {
                    setTimeout(() => {
                        const final = completeCraft(updated, craftSuccess);
                        setState(final);

                        if (craftSuccess) {
                            triggerSoundEvent('craft_success');
                            setShowSuccessEffect(true);
                        } else {
                            triggerSoundEvent('craft_failure');
                        }

                        onCraftComplete(craftSuccess);
                    }, 300);
                }

                return updated;
            });
        }, 50);

        return () => clearInterval(interval);
    }, [state.isActive, craftSuccess, onCraftComplete]);

    // Skip handler
    const handleSkip = useCallback(() => {
        if (state.canSkip) {
            setState(prev => skipCraft(prev));
        }
    }, [state.canSkip]);

    // Hide success effect after duration
    const handleSuccessEffectComplete = useCallback(() => {
        setShowSuccessEffect(false);
    }, []);

    if (tier === null && !showSuccessEffect) return null;

    return (
        <>
            {/* Craft Animation (only when tier is active) */}
            {tier !== null && (
                <group>
                    <CraftRuneCircle
                        tier={tier}
                        phase={state.phase}
                        position={playerPosition}
                    />

                    <CraftParticleSystem
                        tier={tier}
                        phase={state.phase}
                        charClass={charClass}
                        position={playerPosition}
                        isFailure={!craftSuccess && state.phase === 'result'}
                    />

                    <CraftItemManifest
                        tier={tier}
                        phase={state.phase}
                        charClass={charClass}
                        position={playerPosition}
                        isSuccess={craftSuccess}
                    />
                </group>
            )}

            {/* Post-Craft Success Glow */}
            {showSuccessEffect && tier !== null && (
                <CraftSuccessEffect
                    tier={tier}
                    charClass={charClass}
                    isActive={showSuccessEffect}
                    onComplete={handleSuccessEffectComplete}
                />
            )}
        </>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SKIP BUTTON (2D Overlay - used in parent component)
// ═══════════════════════════════════════════════════════════════════════════════

interface CraftSkipButtonProps {
    canSkip: boolean;
    onSkip: () => void;
}

export function CraftSkipButton({ canSkip, onSkip }: CraftSkipButtonProps) {
    if (!canSkip) return null;

    return (
        <button
            onClick={onSkip}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 px-4 py-2 bg-slate-800/80 border border-slate-600 rounded-lg text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-all animate-pulse z-50"
        >
            ⏩ Animasyonu Atla
        </button>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CRAFT OVERLAY (Vignette + UI Lock indicator)
// ═══════════════════════════════════════════════════════════════════════════════

interface CraftOverlayProps {
    isActive: boolean;
    tier: 4 | 5;
}

export function CraftOverlay({ isActive, tier }: CraftOverlayProps) {
    if (!isActive) return null;

    const borderColor = tier === 5 ? 'border-amber-500/30' : 'border-purple-500/30';
    const shadowColor = tier === 5 ? 'shadow-amber-500/20' : 'shadow-purple-500/20';

    return (
        <div className={`fixed inset-0 pointer-events-none z-40 border-[12px] ${borderColor} shadow-inner ${shadowColor}`}>
            {/* Vignette */}
            <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/40" />

            {/* Crafting indicator */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="flex items-center gap-3 bg-black/60 px-6 py-3 rounded-xl border border-slate-600">
                    <div className="w-6 h-6 border-2 border-t-transparent border-amber-400 rounded-full animate-spin" />
                    <span className="text-amber-400 font-semibold">
                        {tier === 5 ? '🔴 Efsanevi Zanaat...' : '🟣 Kadim Zanaat...'}
                    </span>
                </div>
            </div>
        </div>
    );
}
