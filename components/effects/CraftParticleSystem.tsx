/**
 * CraftParticleSystem.tsx
 * Rising/falling particles for craft animation
 * LowFXMode aware, tier-based particle count
 */

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CraftPhase, getParticleCount, getClassPalette, isLowFXMode } from '../../systems/CraftEffectController';
import { CharacterClass } from '../../types';

interface CraftParticleSystemProps {
    tier: 4 | 5;
    phase: CraftPhase;
    charClass: CharacterClass;
    position: [number, number, number];
    isFailure?: boolean;
}

export default function CraftParticleSystem({ tier, phase, charClass, position, isFailure = false }: CraftParticleSystemProps) {
    const pointsRef = useRef<THREE.Points>(null);
    const velocitiesRef = useRef<Float32Array | null>(null);

    const particleCount = getParticleCount(tier);
    const palette = getClassPalette(charClass);

    // Initialize particle positions
    const { positions, colors } = useMemo(() => {
        const pos = new Float32Array(particleCount * 3);
        const col = new Float32Array(particleCount * 3);
        const vel = new Float32Array(particleCount * 3);

        const primaryColor = new THREE.Color(palette.primary);
        const accentColor = new THREE.Color(palette.accent);

        for (let i = 0; i < particleCount; i++) {
            // Start in a circle around center
            const angle = (i / particleCount) * Math.PI * 2;
            const radius = 1 + Math.random() * 1.5;

            pos[i * 3] = Math.cos(angle) * radius;
            pos[i * 3 + 1] = -0.5 + Math.random() * 0.5; // Start below ground
            pos[i * 3 + 2] = Math.sin(angle) * radius;

            // Random velocity (upward)
            vel[i * 3] = (Math.random() - 0.5) * 0.2;
            vel[i * 3 + 1] = 0.5 + Math.random() * 1; // Upward speed
            vel[i * 3 + 2] = (Math.random() - 0.5) * 0.2;

            // Color variation
            const c = Math.random() > 0.6 ? primaryColor : accentColor;
            col[i * 3] = c.r;
            col[i * 3 + 1] = c.g;
            col[i * 3 + 2] = c.b;
        }

        velocitiesRef.current = vel;
        return { positions: pos, colors: col };
    }, [particleCount, palette]);

    // Reset particles when phase changes
    useEffect(() => {
        if (phase === 'particle_rise' && pointsRef.current) {
            const geo = pointsRef.current.geometry;
            const posAttr = geo.attributes.position as THREE.BufferAttribute;

            for (let i = 0; i < particleCount; i++) {
                const angle = (i / particleCount) * Math.PI * 2;
                const radius = 1 + Math.random() * 1.5;
                posAttr.array[i * 3] = Math.cos(angle) * radius;
                posAttr.array[i * 3 + 1] = -0.5 + Math.random() * 0.5;
                posAttr.array[i * 3 + 2] = Math.sin(angle) * radius;
            }
            posAttr.needsUpdate = true;
        }
    }, [phase, particleCount]);

    // Animate particles
    useFrame((_, delta) => {
        if (!pointsRef.current || !velocitiesRef.current) return;
        if (phase !== 'particle_rise' && phase !== 'item_manifest' && phase !== 'result') return;

        const geo = pointsRef.current.geometry;
        const posAttr = geo.attributes.position as THREE.BufferAttribute;
        const vel = velocitiesRef.current;

        const direction = isFailure ? -1 : 1; // Failure = particles fall down

        for (let i = 0; i < particleCount; i++) {
            // Apply velocity
            posAttr.array[i * 3] += vel[i * 3] * delta;
            posAttr.array[i * 3 + 1] += vel[i * 3 + 1] * delta * direction;
            posAttr.array[i * 3 + 2] += vel[i * 3 + 2] * delta;

            // Converge toward center during 'item_manifest'
            if (phase === 'item_manifest') {
                posAttr.array[i * 3] *= 0.98;
                posAttr.array[i * 3 + 2] *= 0.98;
            }

            // Reset if too high or too low
            const y = posAttr.array[i * 3 + 1];
            if ((direction > 0 && y > 4) || (direction < 0 && y < -2)) {
                const angle = Math.random() * Math.PI * 2;
                const radius = 1 + Math.random() * 1.5;
                posAttr.array[i * 3] = Math.cos(angle) * radius;
                posAttr.array[i * 3 + 1] = isFailure ? 3 : -0.5;
                posAttr.array[i * 3 + 2] = Math.sin(angle) * radius;
            }
        }

        posAttr.needsUpdate = true;
    });

    // Don't render in certain phases
    if (phase === 'idle' || phase === 'ui_lock' || phase === 'energy_circle' || phase === 'complete') {
        return null;
    }

    const opacity = phase === 'impact_flash' ? 1 : phase === 'result' ? 0.5 : 0.8;
    const size = isLowFXMode() ? 0.08 : 0.12;

    return (
        <points ref={pointsRef} position={position}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
                <bufferAttribute attach="attributes-color" args={[colors, 3]} />
            </bufferGeometry>
            <pointsMaterial
                size={size}
                vertexColors
                transparent
                opacity={opacity}
                sizeAttenuation
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </points>
    );
}
