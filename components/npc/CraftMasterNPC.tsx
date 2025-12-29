/**
 * CraftMasterNPC.tsx
 * T4/T5 Artifact Forge NPC
 * Static NPC with floating rune circle, interaction opens crafting modal
 */

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface CraftMasterNPCProps {
    position: [number, number, number];
    onInteract: () => void;
    isNearby: boolean;
}

export default function CraftMasterNPC({ position, onInteract, isNearby }: CraftMasterNPCProps) {
    const groupRef = useRef<THREE.Group>(null);
    const runeRef = useRef<THREE.Mesh>(null);
    const glowRef = useRef<THREE.PointLight>(null);

    // Idle animation: subtle glow pulse + rune rotation
    useFrame((_, delta) => {
        if (runeRef.current) {
            runeRef.current.rotation.z += delta * 0.5;
        }
        if (glowRef.current) {
            glowRef.current.intensity = 0.5 + Math.sin(Date.now() * 0.002) * 0.3;
        }
    });

    return (
        <group ref={groupRef} position={position}>
            {/* NPC Body (simple humanoid placeholder) */}
            <mesh position={[0, 1, 0]}>
                <capsuleGeometry args={[0.3, 1, 8, 16]} />
                <meshStandardMaterial color="#6b21a8" metalness={0.3} roughness={0.7} />
            </mesh>

            {/* Head */}
            <mesh position={[0, 1.9, 0]}>
                <sphereGeometry args={[0.25, 16, 16]} />
                <meshStandardMaterial color="#fbbf24" metalness={0.5} roughness={0.3} />
            </mesh>

            {/* Floating Rune Circle */}
            <mesh ref={runeRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
                <ringGeometry args={[1.2, 1.5, 32]} />
                <meshBasicMaterial color="#fbbf24" transparent opacity={0.4} side={THREE.DoubleSide} />
            </mesh>

            {/* Inner Rune */}
            <mesh rotation={[-Math.PI / 2, 0, Math.PI / 4]} position={[0, 0.06, 0]}>
                <ringGeometry args={[0.8, 1, 6]} />
                <meshBasicMaterial color="#a855f7" transparent opacity={0.3} side={THREE.DoubleSide} />
            </mesh>

            {/* Ambient Glow */}
            <pointLight ref={glowRef} color="#fbbf24" intensity={0.5} distance={4} position={[0, 1.5, 0]} />

            {/* Nameplate */}
            <Html position={[0, 2.8, 0]} center distanceFactor={15} zIndexRange={[100, 0]}>
                <div className="text-center pointer-events-none select-none">
                    <div className="text-sm font-bold text-yellow-400 drop-shadow-lg whitespace-nowrap">
                        ⚒️ CRAFT MASTER
                    </div>
                    <div className="text-[10px] text-purple-300 opacity-80">
                        T4 / T5 Artifact Forge
                    </div>
                </div>
            </Html>

            {/* Interaction Prompt */}
            {isNearby && (
                <Html position={[0, 2.2, 0]} center distanceFactor={10} zIndexRange={[100, 0]}>
                    <button
                        onClick={onInteract}
                        className="px-3 py-1.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white text-xs font-bold rounded-lg shadow-lg hover:from-amber-500 hover:to-orange-500 transition-all animate-pulse whitespace-nowrap"
                    >
                        [E] Zanaat Yap
                    </button>
                </Html>
            )}

            {/* Clickable Hitbox */}
            <mesh position={[0, 1, 0]} onClick={isNearby ? onInteract : undefined}>
                <boxGeometry args={[1.5, 2.5, 1.5]} />
                <meshBasicMaterial visible={false} />
            </mesh>
        </group>
    );
}
