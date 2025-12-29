/**
 * CraftEffect.tsx
 * Premium T4/T5 Crafting Animation System
 * Class-based color adaptation, staged animations, GPU-friendly
 */

import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CharacterClass } from '../../types';

// ─────────────────────────────────────────────────────────────────────────────
// CLASS COLOR PALETTES
// ─────────────────────────────────────────────────────────────────────────────

const CLASS_COLORS: Record<CharacterClass, { primary: string; accent: string }> = {
    warrior: { primary: '#ef4444', accent: '#f97316' },
    arctic_knight: { primary: '#06b6d4', accent: '#3b82f6' },
    gale_glaive: { primary: '#22c55e', accent: '#84cc16' },
    archer: { primary: '#22c55e', accent: '#eab308' },
    archmage: { primary: '#a855f7', accent: '#06b6d4' },
    bard: { primary: '#ec4899', accent: '#f472b6' },
    cleric: { primary: '#fbbf24', accent: '#ffffff' },
    martial_artist: { primary: '#dc2626', accent: '#1f2937' },
    monk: { primary: '#14b8a6', accent: '#86efac' },
    reaper: { primary: '#7c3aed', accent: '#1f2937' },
};

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface CraftEffectProps {
    tier: 4 | 5;
    charClass: CharacterClass;
    position: [number, number, number];
    onComplete: () => void;
    isActive: boolean;
}

type CraftStage = 'idle' | 'charge' | 'absorb' | 'reveal' | 'complete';

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const T4_DURATION = 2500; // ms
const T5_DURATION = 4000; // ms
const MAX_PARTICLES_T4 = 30;
const MAX_PARTICLES_T5 = 40;

// ─────────────────────────────────────────────────────────────────────────────
// RUNE CIRCLE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

function RuneCircle({ color, radius, rotationSpeed, opacity }: { color: string; radius: number; rotationSpeed: number; opacity: number }) {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((_, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.z += delta * rotationSpeed;
        }
    });

    return (
        <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
            <ringGeometry args={[radius * 0.8, radius, 32]} />
            <meshBasicMaterial color={color} transparent opacity={opacity} side={THREE.DoubleSide} />
        </mesh>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// PARTICLE SYSTEM (Pooled)
// ─────────────────────────────────────────────────────────────────────────────

function CraftParticles({ count, color, accentColor, stage, tier }: { count: number; color: string; accentColor: string; stage: CraftStage; tier: 4 | 5 }) {
    const particlesRef = useRef<THREE.Points>(null);
    const positions = useMemo(() => {
        const arr = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const radius = 1.5 + Math.random() * 0.5;
            arr[i * 3] = Math.cos(angle) * radius;
            arr[i * 3 + 1] = Math.random() * 2;
            arr[i * 3 + 2] = Math.sin(angle) * radius;
        }
        return arr;
    }, [count]);

    const colors = useMemo(() => {
        const arr = new Float32Array(count * 3);
        const primary = new THREE.Color(color);
        const accent = new THREE.Color(accentColor);
        for (let i = 0; i < count; i++) {
            const c = Math.random() > 0.5 ? primary : accent;
            arr[i * 3] = c.r;
            arr[i * 3 + 1] = c.g;
            arr[i * 3 + 2] = c.b;
        }
        return arr;
    }, [count, color, accentColor]);

    useFrame((_, delta) => {
        if (!particlesRef.current) return;
        const geo = particlesRef.current.geometry;
        const posAttr = geo.attributes.position as THREE.BufferAttribute;

        if (stage === 'charge') {
            // Spiral upward
            for (let i = 0; i < count; i++) {
                posAttr.array[i * 3 + 1] += delta * 0.5;
                if (posAttr.array[i * 3 + 1] > 3) posAttr.array[i * 3 + 1] = 0;
            }
        } else if (stage === 'absorb') {
            // Collapse inward
            for (let i = 0; i < count; i++) {
                posAttr.array[i * 3] *= 0.95;
                posAttr.array[i * 3 + 2] *= 0.95;
                posAttr.array[i * 3 + 1] = 1 + Math.sin(Date.now() * 0.01 + i) * 0.2;
            }
        }
        posAttr.needsUpdate = true;
    });

    if (stage === 'idle' || stage === 'complete') return null;

    return (
        <points ref={particlesRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
                <bufferAttribute attach="attributes-color" args={[colors, 3]} />
            </bufferGeometry>
            <pointsMaterial size={tier === 5 ? 0.15 : 0.1} vertexColors transparent opacity={0.8} sizeAttenuation />
        </points>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// RESULT ITEM GLOW
// ─────────────────────────────────────────────────────────────────────────────

function CraftedItemGlow({ color, visible }: { color: string; visible: boolean }) {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((_, delta) => {
        if (meshRef.current && visible) {
            meshRef.current.rotation.y += delta * 2;
            meshRef.current.position.y = 1.5 + Math.sin(Date.now() * 0.003) * 0.1;
        }
    });

    if (!visible) return null;

    return (
        <mesh ref={meshRef} position={[0, 1.5, 0]}>
            <boxGeometry args={[0.4, 0.4, 0.4]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} transparent opacity={0.9} />
        </mesh>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function CraftEffect({ tier, charClass, position, onComplete, isActive }: CraftEffectProps) {
    const [stage, setStage] = useState<CraftStage>('idle');
    const [runeOpacity, setRuneOpacity] = useState(0);
    const startTimeRef = useRef(0);

    const colors = CLASS_COLORS[charClass] || CLASS_COLORS.warrior;
    const duration = tier === 5 ? T5_DURATION : T4_DURATION;
    const particleCount = tier === 5 ? MAX_PARTICLES_T5 : MAX_PARTICLES_T4;

    useEffect(() => {
        if (!isActive) {
            setStage('idle');
            setRuneOpacity(0);
            return;
        }

        startTimeRef.current = Date.now();
        setStage('charge');
        setRuneOpacity(0.6);

        // Stage transitions
        const chargeEnd = duration * 0.4;
        const absorbEnd = duration * 0.75;

        const chargeTimer = setTimeout(() => setStage('absorb'), chargeEnd);
        const absorbTimer = setTimeout(() => {
            setStage('reveal');
            setRuneOpacity(1);
        }, absorbEnd);
        const completeTimer = setTimeout(() => {
            setStage('complete');
            setRuneOpacity(0);
            onComplete();
        }, duration);

        return () => {
            clearTimeout(chargeTimer);
            clearTimeout(absorbTimer);
            clearTimeout(completeTimer);
        };
    }, [isActive, duration, onComplete]);

    if (!isActive && stage === 'idle') return null;

    return (
        <group position={position}>
            {/* Rune Circle */}
            <RuneCircle
                color={tier === 5 ? '#7c3aed' : colors.primary}
                radius={tier === 5 ? 2 : 1.5}
                rotationSpeed={tier === 5 ? (stage === 'absorb' ? 8 : 2) : (stage === 'absorb' ? 5 : 1.5)}
                opacity={runeOpacity}
            />

            {/* Secondary Ring (T5 only) */}
            {tier === 5 && (
                <RuneCircle
                    color={colors.accent}
                    radius={2.5}
                    rotationSpeed={-1}
                    opacity={runeOpacity * 0.5}
                />
            )}

            {/* Particles */}
            <CraftParticles
                count={particleCount}
                color={colors.primary}
                accentColor={colors.accent}
                stage={stage}
                tier={tier}
            />

            {/* Result Item */}
            <CraftedItemGlow color={colors.primary} visible={stage === 'reveal'} />

            {/* Point Light */}
            {stage !== 'idle' && stage !== 'complete' && (
                <pointLight
                    color={tier === 5 ? '#7c3aed' : colors.primary}
                    intensity={stage === 'reveal' ? 3 : 1}
                    distance={5}
                    position={[0, 1, 0]}
                />
            )}
        </group>
    );
}
