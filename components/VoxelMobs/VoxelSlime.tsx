import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface VoxelSlimeProps {
    color?: string;
    isHostile?: boolean;
    scale?: number;
}

export const VoxelSlime: React.FC<VoxelSlimeProps> = ({ color = '#4ade80', isHostile = false, scale = 1 }) => {
    const groupRef = useRef<THREE.Group>(null);
    const isRainbow = color === 'rainbow';

    // Slime Animation
    useFrame((state) => {
        if (groupRef.current) {
            const time = state.clock.getElapsedTime();

            // Bounce Effect (Jump)
            const jumpHeight = Math.abs(Math.sin(time * 3)) * 0.5;
            groupRef.current.position.y = jumpHeight;

            // Squash and Stretch
            const scaleY = 1 - jumpHeight * 0.3;
            const scaleXZ = 1 + jumpHeight * 0.2;
            groupRef.current.scale.set(scaleXZ * scale, scaleY * scale, scaleXZ * scale);

            // Rainbow Effect
            if (isRainbow) {
                const hue = (time * 0.5) % 1;
                const colorObj = new THREE.Color().setHSL(hue, 0.8, 0.5);
                groupRef.current.traverse((child) => {
                    if ((child as THREE.Mesh).isMesh) {
                        const m = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
                        if (m.name !== 'eye') {
                            m.color.set(colorObj);
                            m.emissive.setHSL(hue, 0.8, 0.2);
                        }
                    }
                });
            }
        }
    });

    return (
        <group ref={groupRef}>
            {/* Main Body */}
            <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.6, 0.6, 0.6]} />
                <meshStandardMaterial color={isRainbow ? 'white' : color} transparent opacity={0.8} />
            </mesh>

            {/* Inner Core (Nucleus) */}
            <mesh position={[0, 0.3, 0]}>
                <boxGeometry args={[0.3, 0.3, 0.3]} />
                <meshStandardMaterial color={isRainbow ? 'white' : color} emissive={isRainbow ? 'white' : color} emissiveIntensity={0.5} />
            </mesh>

            {/* Eyes */}
            <mesh position={[0.15, 0.45, 0.3]} name="eye">
                <boxGeometry args={[0.1, 0.1, 0.05]} />
                <meshStandardMaterial name="eye" color="black" />
            </mesh>
            <mesh position={[-0.15, 0.45, 0.3]} name="eye">
                <boxGeometry args={[0.1, 0.1, 0.05]} />
                <meshStandardMaterial name="eye" color="black" />
            </mesh>

            {/* Hostile Indicator (Tiny Sword on head) */}
            {isHostile && (
                <group position={[0, 0.8, 0]} rotation={[0, 0, Math.PI / 4]}>
                    <mesh position={[0, 0, 0]}>
                        <boxGeometry args={[0.05, 0.4, 0.05]} />
                        <meshStandardMaterial color="#94a3b8" />
                    </mesh>
                    <mesh position={[0, 0.1, 0]}>
                        <boxGeometry args={[0.15, 0.05, 0.05]} />
                        <meshStandardMaterial color="#cbd5e1" />
                    </mesh>
                </group>
            )}
        </group>
    );
};
