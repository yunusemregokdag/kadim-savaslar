import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface VoxelWolfProps {
    position?: [number, number, number];
    scale?: number;
}

export const VoxelWolf: React.FC<VoxelWolfProps> = ({
    position = [0, 0, 0],
    scale = 1
}) => {
    const groupRef = useRef<THREE.Group>(null);
    const tailRef = useRef<THREE.Mesh>(null);
    const headRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        const time = state.clock.getElapsedTime();

        // Tail wagging
        if (tailRef.current) {
            tailRef.current.rotation.y = Math.sin(time * 5) * 0.5;
        }

        // Head movement (looking around)
        if (headRef.current) {
            headRef.current.rotation.y = Math.sin(time * 2) * 0.2;
        }

        // Walking bob
        if (groupRef.current) {
            groupRef.current.position.y = position[1] + Math.abs(Math.sin(time * 4)) * 0.05;
        }
    });

    return (
        <group ref={groupRef} position={position} scale={scale}>
            {/* Body */}
            <mesh position={[0, 0, 0]} castShadow>
                <boxGeometry args={[0.6, 0.5, 1.2]} />
                <meshStandardMaterial color="#94a3b8" />
            </mesh>

            {/* Chest - Lighter */}
            <mesh position={[0, -0.1, -0.3]}>
                <boxGeometry args={[0.5, 0.3, 0.4]} />
                <meshStandardMaterial color="#cbd5e1" />
            </mesh>

            {/* Neck */}
            <mesh position={[0, 0.2, -0.7]} rotation={[0.3, 0, 0]} castShadow>
                <boxGeometry args={[0.4, 0.4, 0.5]} />
                <meshStandardMaterial color="#94a3b8" />
            </mesh>

            {/* Head */}
            <group ref={headRef} position={[0, 0.4, -1]}>
                <mesh castShadow>
                    <boxGeometry args={[0.5, 0.4, 0.6]} />
                    <meshStandardMaterial color="#94a3b8" />
                </mesh>

                {/* Snout */}
                <mesh position={[0, -0.1, -0.4]} castShadow>
                    <boxGeometry args={[0.3, 0.25, 0.3]} />
                    <meshStandardMaterial color="#cbd5e1" />
                </mesh>

                {/* Ears */}
                <mesh position={[-0.15, 0.3, -0.1]} rotation={[0, 0, -0.3]} castShadow>
                    <boxGeometry args={[0.15, 0.3, 0.1]} />
                    <meshStandardMaterial color="#78716c" />
                </mesh>
                <mesh position={[0.15, 0.3, -0.1]} rotation={[0, 0, 0.3]} castShadow>
                    <boxGeometry args={[0.15, 0.3, 0.1]} />
                    <meshStandardMaterial color="#78716c" />
                </mesh>

                {/* Eyes - Yellow */}
                <mesh position={[-0.15, 0.1, -0.55]}>
                    <boxGeometry args={[0.1, 0.1, 0.05]} />
                    <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={1} />
                </mesh>
                <mesh position={[0.15, 0.1, -0.55]}>
                    <boxGeometry args={[0.1, 0.1, 0.05]} />
                    <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={1} />
                </mesh>

                {/* Nose */}
                <mesh position={[0, -0.15, -0.56]}>
                    <boxGeometry args={[0.1, 0.08, 0.05]} />
                    <meshStandardMaterial color="#1e293b" />
                </mesh>
            </group>

            {/* Front Legs */}
            <mesh position={[-0.2, -0.5, -0.4]} castShadow>
                <boxGeometry args={[0.2, 0.6, 0.2]} />
                <meshStandardMaterial color="#78716c" />
            </mesh>
            <mesh position={[0.2, -0.5, -0.4]} castShadow>
                <boxGeometry args={[0.2, 0.6, 0.2]} />
                <meshStandardMaterial color="#78716c" />
            </mesh>

            {/* Back Legs */}
            <mesh position={[-0.2, -0.5, 0.4]} castShadow>
                <boxGeometry args={[0.2, 0.6, 0.2]} />
                <meshStandardMaterial color="#78716c" />
            </mesh>
            <mesh position={[0.2, -0.5, 0.4]} castShadow>
                <boxGeometry args={[0.2, 0.6, 0.2]} />
                <meshStandardMaterial color="#78716c" />
            </mesh>

            {/* Paws */}
            <mesh position={[-0.2, -0.85, -0.4]}>
                <boxGeometry args={[0.25, 0.1, 0.25]} />
                <meshStandardMaterial color="#64748b" />
            </mesh>
            <mesh position={[0.2, -0.85, -0.4]}>
                <boxGeometry args={[0.25, 0.1, 0.25]} />
                <meshStandardMaterial color="#64748b" />
            </mesh>
            <mesh position={[-0.2, -0.85, 0.4]}>
                <boxGeometry args={[0.25, 0.1, 0.25]} />
                <meshStandardMaterial color="#64748b" />
            </mesh>
            <mesh position={[0.2, -0.85, 0.4]}>
                <boxGeometry args={[0.25, 0.1, 0.25]} />
                <meshStandardMaterial color="#64748b" />
            </mesh>

            {/* Tail */}
            <mesh ref={tailRef} position={[0, 0.1, 0.8]} rotation={[0.5, 0, 0]} castShadow>
                <boxGeometry args={[0.15, 0.15, 0.6]} />
                <meshStandardMaterial color="#94a3b8" />
            </mesh>

            {/* Tail tip - Bushy */}
            <mesh position={[0, 0.3, 1.2]} rotation={[0.5, 0, 0]} castShadow>
                <boxGeometry args={[0.2, 0.2, 0.3]} />
                <meshStandardMaterial color="#cbd5e1" />
            </mesh>
        </group>
    );
};

export default VoxelWolf;
