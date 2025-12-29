/**
 * CraftRuneCircle.tsx
 * Animated magic rune circle for crafting
 * Tier-based colors, rotation speed, pulse effects
 */

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CraftPhase, isLowFXMode } from '../../systems/CraftEffectController';

interface CraftRuneCircleProps {
    tier: 4 | 5;
    phase: CraftPhase;
    position: [number, number, number];
}

// Rune texture pattern (procedural)
function createRuneTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    // Transparent background
    ctx.clearRect(0, 0, 256, 256);

    // Draw rune symbols (simplified)
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();

    // Outer circle
    ctx.arc(128, 128, 120, 0, Math.PI * 2);
    ctx.stroke();

    // Inner circle
    ctx.beginPath();
    ctx.arc(128, 128, 80, 0, Math.PI * 2);
    ctx.stroke();

    // Rune lines (hexagram pattern)
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const x1 = 128 + Math.cos(angle) * 80;
        const y1 = 128 + Math.sin(angle) * 80;
        const x2 = 128 + Math.cos(angle) * 120;
        const y2 = 128 + Math.sin(angle) * 120;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }

    // Inner hexagon
    ctx.beginPath();
    for (let i = 0; i <= 6; i++) {
        const angle = (i / 6) * Math.PI * 2 - Math.PI / 6;
        const x = 128 + Math.cos(angle) * 50;
        const y = 128 + Math.sin(angle) * 50;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}

export default function CraftRuneCircle({ tier, phase, position }: CraftRuneCircleProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const innerMeshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.MeshBasicMaterial>(null);

    const runeTexture = useMemo(() => createRuneTexture(), []);

    // Tier-based colors
    const colors = useMemo(() => {
        if (tier === 5) {
            return {
                primary: new THREE.Color('#dc2626'),
                pulse: new THREE.Color('#fbbf24'),
            };
        }
        return {
            primary: new THREE.Color('#8b5cf6'),
            pulse: new THREE.Color('#a855f7'),
        };
    }, [tier]);

    // Animation
    useFrame((_, delta) => {
        if (!meshRef.current || phase === 'idle' || phase === 'complete') return;

        // Rotation speed based on phase
        let rotSpeed = 0.5;
        if (phase === 'particle_rise') rotSpeed = 1.5;
        if (phase === 'item_manifest') rotSpeed = 2.5;
        if (phase === 'impact_flash') rotSpeed = 4;

        meshRef.current.rotation.z += delta * rotSpeed;

        if (innerMeshRef.current) {
            innerMeshRef.current.rotation.z -= delta * rotSpeed * 0.7;
        }

        // Color pulsing for T5
        if (tier === 5 && materialRef.current) {
            const t = (Math.sin(Date.now() * 0.005) + 1) / 2;
            materialRef.current.color.lerpColors(colors.primary, colors.pulse, t);
        }
    });

    // Opacity based on phase
    const opacity = useMemo(() => {
        switch (phase) {
            case 'idle': return 0;
            case 'ui_lock': return 0.3;
            case 'energy_circle': return 0.7;
            case 'particle_rise': return 0.9;
            case 'item_manifest': return 1;
            case 'impact_flash': return 1;
            case 'result': return 0.5;
            default: return 0;
        }
    }, [phase]);

    // Scale based on phase
    const scale = useMemo(() => {
        switch (phase) {
            case 'energy_circle': return 0.8;
            case 'particle_rise': return 1;
            case 'item_manifest': return 1.2;
            case 'impact_flash': return 1.5;
            default: return 1;
        }
    }, [phase]);

    if (phase === 'idle' || phase === 'complete') return null;

    const radius = tier === 5 ? 2.5 : 2;

    return (
        <group position={position}>
            {/* Main Rune Circle */}
            <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} scale={scale}>
                <circleGeometry args={[radius, 64]} />
                <meshBasicMaterial
                    ref={materialRef}
                    color={colors.primary}
                    transparent
                    opacity={opacity * 0.6}
                    side={THREE.DoubleSide}
                    map={runeTexture}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>

            {/* Inner Rotating Ring */}
            <mesh ref={innerMeshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} scale={scale * 0.6}>
                <ringGeometry args={[radius * 0.3, radius * 0.5, 6]} />
                <meshBasicMaterial
                    color={tier === 5 ? '#fbbf24' : '#c084fc'}
                    transparent
                    opacity={opacity * 0.8}
                    side={THREE.DoubleSide}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>

            {/* Glow Light */}
            {!isLowFXMode() && (
                <pointLight
                    color={tier === 5 ? '#fbbf24' : '#8b5cf6'}
                    intensity={opacity * (tier === 5 ? 2 : 1.5)}
                    distance={5}
                    position={[0, 0.5, 0]}
                />
            )}
        </group>
    );
}
