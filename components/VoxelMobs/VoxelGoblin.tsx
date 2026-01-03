import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface VoxelGoblinProps {
    position?: [number, number, number];
    scale?: number;
}

export const VoxelGoblin: React.FC<VoxelGoblinProps> = ({
    position = [0, 0, 0],
    scale = 1
}) => {
    const groupRef = useRef<THREE.Group>(null);
    const weaponRef = useRef<THREE.Mesh>(null);
    const headRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        const time = state.clock.getElapsedTime();

        // Weapon swinging
        if (weaponRef.current) {
            weaponRef.current.rotation.z = Math.sin(time * 3) * 0.3;
        }

        // Head bobbing (sneaky movement)
        if (headRef.current) {
            headRef.current.position.y = 0.6 + Math.sin(time * 4) * 0.05;
            headRef.current.rotation.y = Math.sin(time * 2) * 0.1;
        }

        // Crouching animation
        if (groupRef.current) {
            groupRef.current.position.y = position[1] + Math.sin(time * 3) * 0.03;
        }
    });

    return (
        <group ref={groupRef} position={position} scale={scale}>
            {/* Legs - Short */}
            <mesh position={[-0.15, -0.4, 0]} castShadow>
                <boxGeometry args={[0.2, 0.5, 0.2]} />
                <meshStandardMaterial color="#65a30d" />
            </mesh>
            <mesh position={[0.15, -0.4, 0]} castShadow>
                <boxGeometry args={[0.2, 0.5, 0.2]} />
                <meshStandardMaterial color="#65a30d" />
            </mesh>

            {/* Feet - Big */}
            <mesh position={[-0.15, -0.7, 0.1]} castShadow>
                <boxGeometry args={[0.25, 0.1, 0.35]} />
                <meshStandardMaterial color="#4d7c0f" />
            </mesh>
            <mesh position={[0.15, -0.7, 0.1]} castShadow>
                <boxGeometry args={[0.25, 0.1, 0.35]} />
                <meshStandardMaterial color="#4d7c0f" />
            </mesh>

            {/* Torso - Skinny */}
            <mesh position={[0, 0, 0]} castShadow>
                <boxGeometry args={[0.5, 0.6, 0.4]} />
                <meshStandardMaterial color="#84cc16" />
            </mesh>

            {/* Belly - Pot belly */}
            <mesh position={[0, -0.1, 0.25]}>
                <boxGeometry args={[0.4, 0.4, 0.2]} />
                <meshStandardMaterial color="#a3e635" />
            </mesh>

            {/* Left Arm */}
            <mesh position={[-0.35, 0.1, 0]} castShadow>
                <boxGeometry args={[0.15, 0.5, 0.15]} />
                <meshStandardMaterial color="#84cc16" />
            </mesh>

            {/* Right Arm - Holding weapon */}
            <group position={[0.35, 0.1, 0]}>
                <mesh castShadow>
                    <boxGeometry args={[0.15, 0.5, 0.15]} />
                    <meshStandardMaterial color="#84cc16" />
                </mesh>
                {/* Dagger */}
                <mesh ref={weaponRef} position={[0, -0.4, 0]} rotation={[0, 0, -0.5]} castShadow>
                    <boxGeometry args={[0.08, 0.5, 0.08]} />
                    <meshStandardMaterial color="#78716c" metalness={0.8} />
                </mesh>
            </group>

            {/* Head */}
            <group ref={headRef} position={[0, 0.6, 0]}>
                <mesh castShadow>
                    <boxGeometry args={[0.5, 0.5, 0.5]} />
                    <meshStandardMaterial color="#84cc16" />
                </mesh>

                {/* Ears - Pointy */}
                <mesh position={[-0.3, 0.1, 0]} rotation={[0, 0, -0.5]} castShadow>
                    <boxGeometry args={[0.15, 0.3, 0.1]} />
                    <meshStandardMaterial color="#65a30d" />
                </mesh>
                <mesh position={[0.3, 0.1, 0]} rotation={[0, 0, 0.5]} castShadow>
                    <boxGeometry args={[0.15, 0.3, 0.1]} />
                    <meshStandardMaterial color="#65a30d" />
                </mesh>

                {/* Eyes - Beady yellow */}
                <mesh position={[-0.12, 0.1, 0.26]}>
                    <boxGeometry args={[0.1, 0.15, 0.05]} />
                    <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={1.5} />
                </mesh>
                <mesh position={[0.12, 0.1, 0.26]}>
                    <boxGeometry args={[0.1, 0.15, 0.05]} />
                    <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={1.5} />
                </mesh>

                {/* Nose - Big */}
                <mesh position={[0, -0.05, 0.28]} castShadow>
                    <boxGeometry args={[0.15, 0.2, 0.15]} />
                    <meshStandardMaterial color="#65a30d" />
                </mesh>

                {/* Mouth - Grin */}
                <mesh position={[0, -0.15, 0.26]}>
                    <boxGeometry args={[0.25, 0.08, 0.05]} />
                    <meshStandardMaterial color="#1e293b" />
                </mesh>

                {/* Teeth */}
                <mesh position={[-0.08, -0.12, 0.28]}>
                    <boxGeometry args={[0.05, 0.08, 0.03]} />
                    <meshStandardMaterial color="#f8fafc" />
                </mesh>
                <mesh position={[0.08, -0.12, 0.28]}>
                    <boxGeometry args={[0.05, 0.08, 0.03]} />
                    <meshStandardMaterial color="#f8fafc" />
                </mesh>
            </group>

            {/* Ragged cloth/loincloth */}
            <mesh position={[0, -0.3, 0]} castShadow>
                <boxGeometry args={[0.4, 0.3, 0.3]} />
                <meshStandardMaterial color="#78350f" />
            </mesh>

            {/* Backpack/sack */}
            <mesh position={[0, 0.1, -0.25]} castShadow>
                <boxGeometry args={[0.3, 0.3, 0.2]} />
                <meshStandardMaterial color="#78350f" />
            </mesh>
        </group>
    );
};

export default VoxelGoblin;
