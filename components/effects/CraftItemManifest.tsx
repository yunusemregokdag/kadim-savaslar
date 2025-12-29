/**
 * CraftItemManifest.tsx
 * Item silhouette appearing during craft
 * Rotating glow box with tier-based intensity
 */

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CraftPhase, getTierConfig, getClassPalette, isLowFXMode } from '../../systems/CraftEffectController';
import { CharacterClass } from '../../types';

interface CraftItemManifestProps {
    tier: 4 | 5;
    phase: CraftPhase;
    charClass: CharacterClass;
    position: [number, number, number];
    isSuccess: boolean;
}

export default function CraftItemManifest({ tier, phase, charClass, position, isSuccess }: CraftItemManifestProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const glowRef = useRef<THREE.Mesh>(null);

    const palette = getClassPalette(charClass);
    const tierConfig = getTierConfig(tier);

    // Visibility
    const isVisible = phase === 'item_manifest' || phase === 'impact_flash' || phase === 'result';

    // Animation
    useFrame((_, delta) => {
        if (!meshRef.current || !isVisible) return;

        // Rotate
        meshRef.current.rotation.y += delta * 2;

        // Float up and down
        meshRef.current.position.y = 1.5 + Math.sin(Date.now() * 0.003) * 0.1;

        // Scale pulse during impact
        if (phase === 'impact_flash') {
            const scale = 1 + Math.sin(Date.now() * 0.02) * 0.2;
            meshRef.current.scale.setScalar(scale);
        } else {
            meshRef.current.scale.setScalar(1);
        }

        // Glow pulse
        if (glowRef.current) {
            const glowScale = 1.2 + Math.sin(Date.now() * 0.005) * 0.1;
            glowRef.current.scale.setScalar(glowScale);
        }
    });

    // Opacity based on phase and success
    const opacity = useMemo(() => {
        if (!isSuccess && phase === 'result') return 0.3; // Fade on failure
        switch (phase) {
            case 'item_manifest': return 0.7;
            case 'impact_flash': return 1;
            case 'result': return isSuccess ? 1 : 0;
            default: return 0;
        }
    }, [phase, isSuccess]);

    if (!isVisible) return null;

    const color = isSuccess ? palette.primary : '#dc2626';
    const emissiveIntensity = tierConfig.glowIntensity * (phase === 'impact_flash' ? 2 : 1);

    return (
        <group position={position}>
            {/* Main Item Box */}
            <mesh ref={meshRef} position={[0, 1.5, 0]}>
                <boxGeometry args={[0.5, 0.5, 0.5]} />
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={emissiveIntensity}
                    transparent
                    opacity={opacity}
                    metalness={0.8}
                    roughness={0.2}
                />
            </mesh>

            {/* Outer Glow */}
            {!isLowFXMode() && (
                <mesh ref={glowRef} position={[0, 1.5, 0]}>
                    <sphereGeometry args={[0.6, 16, 16]} />
                    <meshBasicMaterial
                        color={palette.glow}
                        transparent
                        opacity={opacity * 0.3}
                        blending={THREE.AdditiveBlending}
                        depthWrite={false}
                    />
                </mesh>
            )}

            {/* Point Light */}
            <pointLight
                color={color}
                intensity={opacity * emissiveIntensity}
                distance={4}
                position={[0, 1.5, 0]}
            />

            {/* Impact Flash Sphere (T5 only) */}
            {tier === 5 && phase === 'impact_flash' && !isLowFXMode() && (
                <mesh position={[0, 1.5, 0]}>
                    <sphereGeometry args={[2, 16, 16]} />
                    <meshBasicMaterial
                        color="#fbbf24"
                        transparent
                        opacity={0.4}
                        blending={THREE.AdditiveBlending}
                        depthWrite={false}
                    />
                </mesh>
            )}
        </group>
    );
}
