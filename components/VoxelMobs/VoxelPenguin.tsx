import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface VoxelPenguinProps {
    isHostile?: boolean;
    scale?: number;
    variety?: 'emperor' | 'normal'; // Emperor has yellow patches
}

export const VoxelPenguin: React.FC<VoxelPenguinProps> = ({
    isHostile = false,
    scale = 1,
    variety = 'normal'
}) => {
    const groupRef = useRef<THREE.Group>(null);
    const bodyRef = useRef<THREE.Group>(null);
    const wingL = useRef<THREE.Mesh>(null);
    const wingR = useRef<THREE.Mesh>(null);
    const footL = useRef<THREE.Mesh>(null);
    const footR = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();

        // Waddle Animation (side to side rotation)
        if (groupRef.current) {
            groupRef.current.rotation.z = Math.sin(t * 4) * 0.1; // Rock left/right
            groupRef.current.position.y = Math.abs(Math.sin(t * 4)) * 0.05; // Hop slightly
        }

        // Wing Flap
        if (wingL.current) wingL.current.rotation.z = Math.sin(t * 4 + 0.5) * 0.2 + 0.2;
        if (wingR.current) wingR.current.rotation.z = -Math.sin(t * 4) * 0.2 - 0.2;

        // Feet movement
        if (footL.current) footL.current.rotation.x = Math.sin(t * 4) * 0.4;
        if (footR.current) footR.current.rotation.x = Math.cos(t * 4) * 0.4;
    });

    return (
        <group ref={groupRef} scale={[scale, scale, scale]}>
            <group ref={bodyRef} position={[0, 0.4, 0]}>
                {/* Main Body (Black) */}
                <mesh position={[0, 0.1, 0]} castShadow>
                    <boxGeometry args={[0.5, 0.7, 0.4]} />
                    <meshStandardMaterial color="#1f2937" />
                </mesh>

                {/* Belly (White) */}
                <mesh position={[0, 0.05, 0.21]}>
                    <boxGeometry args={[0.4, 0.55, 0.05]} />
                    <meshStandardMaterial color="#f3f4f6" />
                </mesh>

                {/* Emperor Yellow Patch */}
                {variety === 'emperor' && (
                    <mesh position={[0, 0.35, 0.21]}>
                        <boxGeometry args={[0.3, 0.1, 0.05]} />
                        <meshStandardMaterial color="#fbbf24" />
                    </mesh>
                )}

                {/* Head */}
                <group position={[0, 0.55, 0]}>
                    <mesh castShadow>
                        <boxGeometry args={[0.4, 0.3, 0.4]} />
                        <meshStandardMaterial color="#1f2937" />
                    </mesh>
                    {/* Beak */}
                    <mesh position={[0, -0.05, 0.25]} rotation={[Math.PI / 2, 0, 0]}>
                        <coneGeometry args={[0.08, 0.2, 4]} />
                        <meshStandardMaterial color="#f97316" />
                    </mesh>
                    {/* Eyes */}
                    <mesh position={[0.12, 0.05, 0.21]}>
                        <boxGeometry args={[0.05, 0.05, 0.01]} />
                        <meshStandardMaterial color="white" />
                    </mesh>
                    <mesh position={[0.12, 0.05, 0.215]}>
                        <boxGeometry args={[0.02, 0.02, 0.01]} />
                        <meshStandardMaterial color="black" />
                    </mesh>

                    <mesh position={[-0.12, 0.05, 0.21]}>
                        <boxGeometry args={[0.05, 0.05, 0.01]} />
                        <meshStandardMaterial color="white" />
                    </mesh>
                    <mesh position={[-0.12, 0.05, 0.215]}>
                        <boxGeometry args={[0.02, 0.02, 0.01]} />
                        <meshStandardMaterial color="black" />
                    </mesh>
                </group>

                {/* Wings */}
                <group position={[0.3, 0.2, 0]}>
                    <mesh ref={wingL} position={[0.05, -0.2, 0]} rotation={[0, 0, 0.2]}>
                        <boxGeometry args={[0.1, 0.5, 0.25]} />
                        <meshStandardMaterial color="#1f2937" />
                    </mesh>
                </group>
                <group position={[-0.3, 0.2, 0]}>
                    <mesh ref={wingR} position={[-0.05, -0.2, 0]} rotation={[0, 0, -0.2]}>
                        <boxGeometry args={[0.1, 0.5, 0.25]} />
                        <meshStandardMaterial color="#1f2937" />
                    </mesh>
                </group>

                {/* Feet */}
                <group position={[0, -0.35, 0]}>
                    <mesh ref={footL} position={[0.15, 0, 0.1]}>
                        <boxGeometry args={[0.15, 0.05, 0.2]} />
                        <meshStandardMaterial color="#f97316" />
                    </mesh>
                    <mesh ref={footR} position={[-0.15, 0, 0.1]}>
                        <boxGeometry args={[0.15, 0.05, 0.2]} />
                        <meshStandardMaterial color="#f97316" />
                    </mesh>
                </group>
            </group>

            {/* Hostile Eyes - Red Glow */}
            {isHostile && (
                <pointLight position={[0, 0.9, 0.3]} color="red" intensity={2} distance={1} />
            )}
        </group>
    );
};
