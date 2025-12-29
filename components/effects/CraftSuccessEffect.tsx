/**
 * CraftSuccessEffect.tsx
 * Post-craft glow effect attached to character
 * T4: Soft orbiting particles (6s)
 * T5: Wing-like arcs + chest pulse (10s)
 */

import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getTierConfig, getClassPalette, isLowFXMode } from '../../systems/CraftEffectController';
import { CharacterClass } from '../../types';

interface CraftSuccessEffectProps {
    tier: 4 | 5;
    charClass: CharacterClass;
    isActive: boolean;
    onComplete?: () => void;
}

export default function CraftSuccessEffect({ tier, charClass, isActive, onComplete }: CraftSuccessEffectProps) {
    const groupRef = useRef<THREE.Group>(null);
    const [opacity, setOpacity] = useState(1);
    const startTimeRef = useRef(0);

    const palette = getClassPalette(charClass);
    const tierConfig = getTierConfig(tier);

    // Start timer
    useEffect(() => {
        if (isActive) {
            startTimeRef.current = Date.now();
            setOpacity(1);
        }
    }, [isActive]);

    // Fade out and cleanup
    useFrame(() => {
        if (!isActive) return;

        const elapsed = Date.now() - startTimeRef.current;
        const duration = tierConfig.successEffectDuration;

        // Start fading at 80% duration
        if (elapsed > duration * 0.8) {
            const fadeProgress = (elapsed - duration * 0.8) / (duration * 0.2);
            setOpacity(Math.max(0, 1 - fadeProgress));
        }

        // Complete
        if (elapsed >= duration) {
            onComplete?.();
        }
    });

    if (!isActive || opacity <= 0) return null;

    return (
        <group ref={groupRef}>
            {/* Orbiting Particles (Both T4 and T5) */}
            <OrbitingParticles color={palette.primary} accentColor={palette.accent} opacity={opacity} />

            {/* T5 Only: Wing Arcs */}
            {tier === 5 && !isLowFXMode() && (
                <>
                    <WingArc side="left" color={palette.glow} opacity={opacity} />
                    <WingArc side="right" color={palette.glow} opacity={opacity} />
                    <ChestPulse color={palette.primary} opacity={opacity} />
                </>
            )}

            {/* Ambient Light */}
            <pointLight
                color={palette.primary}
                intensity={opacity * (tier === 5 ? 1.5 : 0.8)}
                distance={3}
                position={[0, 1, 0]}
            />
        </group>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

function OrbitingParticles({ color, accentColor, opacity }: { color: string; accentColor: string; opacity: number }) {
    const pointsRef = useRef<THREE.Points>(null);
    const count = isLowFXMode() ? 8 : 20;

    const { positions, colors } = useMemo(() => {
        const pos = new Float32Array(count * 3);
        const col = new Float32Array(count * 3);
        const primary = new THREE.Color(color);
        const accent = new THREE.Color(accentColor);

        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            pos[i * 3] = Math.cos(angle) * 0.8;
            pos[i * 3 + 1] = 1 + (i % 3) * 0.3;
            pos[i * 3 + 2] = Math.sin(angle) * 0.8;

            const c = i % 2 === 0 ? primary : accent;
            col[i * 3] = c.r;
            col[i * 3 + 1] = c.g;
            col[i * 3 + 2] = c.b;
        }

        return { positions: pos, colors: col };
    }, [count, color, accentColor]);

    useFrame((_, delta) => {
        if (!pointsRef.current) return;

        const geo = pointsRef.current.geometry;
        const posAttr = geo.attributes.position as THREE.BufferAttribute;

        // Orbit around Y axis
        for (let i = 0; i < count; i++) {
            const x = posAttr.array[i * 3];
            const z = posAttr.array[i * 3 + 2];
            const angle = Math.atan2(z, x) + delta * 1.5;
            const radius = Math.sqrt(x * x + z * z);

            posAttr.array[i * 3] = Math.cos(angle) * radius;
            posAttr.array[i * 3 + 2] = Math.sin(angle) * radius;

            // Bobbing
            posAttr.array[i * 3 + 1] += Math.sin(Date.now() * 0.005 + i) * 0.002;
        }

        posAttr.needsUpdate = true;
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
                <bufferAttribute attach="attributes-color" args={[colors, 3]} />
            </bufferGeometry>
            <pointsMaterial
                size={0.15}
                vertexColors
                transparent
                opacity={opacity}
                sizeAttenuation
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
}

function WingArc({ side, color, opacity }: { side: 'left' | 'right'; color: string; opacity: number }) {
    const meshRef = useRef<THREE.Mesh>(null);
    const xOffset = side === 'left' ? -0.5 : 0.5;
    const rotation = side === 'left' ? 0.3 : -0.3;

    useFrame(() => {
        if (meshRef.current) {
            meshRef.current.rotation.z = rotation + Math.sin(Date.now() * 0.003) * 0.1;
        }
    });

    return (
        <mesh ref={meshRef} position={[xOffset, 1.2, -0.3]} rotation={[0, 0, rotation]}>
            <planeGeometry args={[0.8, 1.5]} />
            <meshBasicMaterial
                color={color}
                transparent
                opacity={opacity * 0.4}
                side={THREE.DoubleSide}
                blending={THREE.AdditiveBlending}
            />
        </mesh>
    );
}

function ChestPulse({ color, opacity }: { color: string; opacity: number }) {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame(() => {
        if (meshRef.current) {
            const scale = 0.15 + Math.sin(Date.now() * 0.008) * 0.05;
            meshRef.current.scale.setScalar(scale);
        }
    });

    return (
        <mesh ref={meshRef} position={[0, 1.2, 0.2]}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshBasicMaterial
                color={color}
                transparent
                opacity={opacity * 0.5}
                blending={THREE.AdditiveBlending}
            />
        </mesh>
    );
}
