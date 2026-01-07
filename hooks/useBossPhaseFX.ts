// ═══════════════════════════════════════════════════════════════════════════
// BOSS PHASE FX HOOK - Kadim Savaşlar
// Boss faz değişimlerinde görsel efekt tetikleme
// ═══════════════════════════════════════════════════════════════════════════

import { useEffect, useCallback, useState, useRef } from 'react';
import { BossPhaseNumber } from '../core/types';
import { BossPhaseEvent } from '../core/BossPhaseController';
import * as THREE from 'three';

// ═══════════════════════════════════════════════════════════════════════════
// BOSS PHASE FX HOOK
// ═══════════════════════════════════════════════════════════════════════════
export interface UseBossPhaseFXOptions {
    onPhaseChange?: (phase: BossPhaseNumber, config: BossPhaseEvent['config']) => void;
    enableScreenShake?: boolean;
    enableAura?: boolean;
    enableSound?: boolean;
}

export function useBossPhaseFX(options: UseBossPhaseFXOptions = {}) {
    const {
        onPhaseChange,
        enableScreenShake = true,
        enableAura = true,
        enableSound = true
    } = options;

    const [currentPhase, setCurrentPhase] = useState<BossPhaseNumber>(1);
    const [auraColor, setAuraColor] = useState<string>('#4488ff');
    const [isShaking, setIsShaking] = useState(false);
    const shakeTimeoutRef = useRef<NodeJS.Timeout>();

    // Screen shake effect
    const triggerScreenShake = useCallback((intensity: number = 1, duration: number = 500) => {
        if (!enableScreenShake) return;

        setIsShaking(true);

        // CSS shake animation
        document.body.style.animation = `shake ${duration}ms ease-in-out`;
        document.body.style.setProperty('--shake-intensity', `${intensity * 5}px`);

        if (shakeTimeoutRef.current) {
            clearTimeout(shakeTimeoutRef.current);
        }

        shakeTimeoutRef.current = setTimeout(() => {
            setIsShaking(false);
            document.body.style.animation = '';
        }, duration);
    }, [enableScreenShake]);

    // Aura color change
    const triggerAura = useCallback((color: string) => {
        if (!enableAura) return;
        setAuraColor(color);
    }, [enableAura]);

    // Sound effect
    const playPhaseSound = useCallback((soundId?: string) => {
        if (!enableSound || !soundId) return;

        // TODO: Sound system entegrasyonu
        console.log(`[BossPhaseFX] Play sound: ${soundId}`);
    }, [enableSound]);

    // Event listener
    useEffect(() => {
        const handleBossPhase = (event: CustomEvent<BossPhaseEvent>) => {
            const { phase, config } = event.detail;

            console.log(`[BossPhaseFX] Phase changed to ${phase}`, config);

            setCurrentPhase(phase);

            // Aura color
            if (config.auraColor) {
                triggerAura(config.auraColor);
            }

            // Screen shake
            if (config.screenShake) {
                const intensity = phase === 3 ? 2 : 1;
                triggerScreenShake(intensity, phase === 3 ? 800 : 500);
            }

            // Sound
            if (config.soundEffect) {
                playPhaseSound(config.soundEffect);
            }

            // Callback
            onPhaseChange?.(phase, config);
        };

        document.addEventListener('bossPhase', handleBossPhase as EventListener);

        return () => {
            document.removeEventListener('bossPhase', handleBossPhase as EventListener);
            if (shakeTimeoutRef.current) {
                clearTimeout(shakeTimeoutRef.current);
            }
        };
    }, [onPhaseChange, triggerAura, triggerScreenShake, playPhaseSound]);

    return {
        currentPhase,
        auraColor,
        isShaking,
        triggerScreenShake,
        triggerAura
    };
}

// ═══════════════════════════════════════════════════════════════════════════
// BOSS AURA COMPONENT (R3F)
// ═══════════════════════════════════════════════════════════════════════════
export interface BossAuraProps {
    position: [number, number, number];
    color: string;
    intensity?: number;
    radius?: number;
    visible?: boolean;
}

// Bu component R3F Canvas içinde kullanılır
export function createBossAura(props: BossAuraProps) {
    const { color, intensity = 0.3, radius = 5 } = props;

    const material = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: intensity,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide
    });

    const geometry = new THREE.SphereGeometry(radius, 32, 32);
    const mesh = new THREE.Mesh(geometry, material);

    return mesh;
}

// ═══════════════════════════════════════════════════════════════════════════
// CSS SHAKE ANIMATION (Global style'a eklenecek)
// ═══════════════════════════════════════════════════════════════════════════
export const SHAKE_CSS = `
@keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(calc(-1 * var(--shake-intensity, 5px))); }
    20%, 40%, 60%, 80% { transform: translateX(var(--shake-intensity, 5px)); }
}
`;

// CSS'i document'a ekle (bir kez)
if (typeof document !== 'undefined') {
    const styleId = 'boss-phase-shake-style';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = SHAKE_CSS;
        document.head.appendChild(style);
    }
}

export default useBossPhaseFX;
