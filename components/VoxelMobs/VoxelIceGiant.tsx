import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface VoxelIceGiantProps {
    position?: [number, number, number];
    scale?: number;
}

export const VoxelIceGiant: React.FC<VoxelIceGiantProps> = ({
    position = [0, 0, 0],
    scale = 1
}) => {
    const groupRef = useRef<THREE.Group>(null);
    const leftArmRef = useRef<THREE.Group>(null);
    const rightArmRef = useRef<THREE.Group>(null);
    const iceShardRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        const time = state.clock.getElapsedTime();

        // Arm swinging animation
        if (leftArmRef.current && rightArmRef.current) {
            const armAngle = Math.sin(time * 1.5) * 0.3;
            leftArmRef.current.rotation.x = armAngle;
            rightArmRef.current.rotation.x = -armAngle;
        }

        // Ice shard rotation
        if (iceShardRef.current) {
            iceShardRef.current.rotation.y += 0.02;
        }

        // Breathing animation (scale pulse)
        if (groupRef.current) {
            const breathScale = 1 + Math.sin(time * 2) * 0.05;
            groupRef.current.scale.set(scale * breathScale, scale * breathScale, scale * breathScale);
        }
    });

    return (
        <group ref={groupRef} position={position} scale={scale}>
            {/* Legs */}
            <mesh position={[-0.4, -1.5, 0]} castShadow>
                <boxGeometry args={[0.6, 1.5, 0.6]} />
                <meshStandardMaterial color="#60a5fa" emissive="#3b82f6" emissiveIntensity={0.2} />
            </mesh>
            <mesh position={[0.4, -1.5, 0]} castShadow>
                <boxGeometry args={[0.6, 1.5, 0.6]} />
                <meshStandardMaterial color="#60a5fa" emissive="#3b82f6" emissiveIntensity={0.2} />
            </mesh>

            {/* Feet - Ice blocks */}
            <mesh position={[-0.4, -2.3, 0.2]} castShadow>
                <boxGeometry args={[0.7, 0.3, 0.9]} />
                <meshStandardMaterial color="#93c5fd" />
            </mesh>
            <mesh position={[0.4, -2.3, 0.2]} castShadow>
                <boxGeometry args={[0.7, 0.3, 0.9]} />
                <meshStandardMaterial color="#93c5fd" />
            </mesh>

            {/* Torso */}
            <mesh position={[0, 0, 0]} castShadow>
                <boxGeometry args={[1.6, 2, 1]} />
                <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.3} />
            </mesh>

            {/* Chest armor - Ice crystals */}
            <mesh position={[0, 0.3, 0.55]}>
                <boxGeometry args={[1.2, 0.8, 0.2]} />
                <meshStandardMaterial
                    color="#dbeafe"
                    emissive="#60a5fa"
                    emissiveIntensity={0.5}
                    transparent
                    opacity={0.8}
                />
            </mesh>

            {/* Left Arm */}
            <group ref={leftArmRef} position={[-1, 0.5, 0]}>
                <mesh position={[0, -0.8, 0]} castShadow>
                    <boxGeometry args={[0.5, 1.6, 0.5]} />
                    <meshStandardMaterial color="#60a5fa" emissive="#3b82f6" emissiveIntensity={0.2} />
                </mesh>
                {/* Ice club */}
                <mesh position={[0, -1.8, 0]} castShadow>
                    <boxGeometry args={[0.6, 0.8, 0.6]} />
                    <meshStandardMaterial color="#93c5fd" />
                </mesh>
            </group>

            {/* Right Arm */}
            <group ref={rightArmRef} position={[1, 0.5, 0]}>
                <mesh position={[0, -0.8, 0]} castShadow>
                    <boxGeometry args={[0.5, 1.6, 0.5]} />
                    <meshStandardMaterial color="#60a5fa" emissive="#3b82f6" emissiveIntensity={0.2} />
                </mesh>
                {/* Fist */}
                <mesh position={[0, -1.8, 0]} castShadow>
                    <boxGeometry args={[0.6, 0.6, 0.6]} />
                    <meshStandardMaterial color="#93c5fd" />
                </mesh>
            </group>

            {/* Neck */}
            <mesh position={[0, 1.3, 0]} castShadow>
                <boxGeometry args={[0.7, 0.6, 0.7]} />
                <meshStandardMaterial color="#60a5fa" />
            </mesh>

            {/* Head */}
            <mesh position={[0, 2.2, 0]} castShadow>
                <boxGeometry args={[1.2, 1.2, 1.2]} />
                <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.3} />
            </mesh>

            {/* Ice beard */}
            <mesh position={[0, 1.8, 0.5]} castShadow>
                <boxGeometry args={[0.8, 0.6, 0.3]} />
                <meshStandardMaterial color="#dbeafe" transparent opacity={0.7} />
            </mesh>

            {/* Eyes - Glowing blue */}
            <mesh position={[-0.3, 2.3, 0.65]}>
                <boxGeometry args={[0.2, 0.2, 0.1]} />
                <meshStandardMaterial color="#60a5fa" emissive="#60a5fa" emissiveIntensity={3} />
            </mesh>
            <mesh position={[0.3, 2.3, 0.65]}>
                <boxGeometry args={[0.2, 0.2, 0.1]} />
                <meshStandardMaterial color="#60a5fa" emissive="#60a5fa" emissiveIntensity={3} />
            </mesh>

            {/* Ice crown */}
            <mesh position={[0, 2.9, 0]} castShadow>
                <boxGeometry args={[1.4, 0.3, 0.3]} />
                <meshStandardMaterial color="#dbeafe" emissive="#60a5fa" emissiveIntensity={0.5} />
            </mesh>
            <mesh position={[-0.5, 3.1, 0]}>
                <coneGeometry args={[0.15, 0.5, 4]} />
                <meshStandardMaterial color="#dbeafe" emissive="#60a5fa" emissiveIntensity={0.5} />
            </mesh>
            <mesh position={[0, 3.2, 0]}>
                <coneGeometry args={[0.2, 0.7, 4]} />
                <meshStandardMaterial color="#dbeafe" emissive="#60a5fa" emissiveIntensity={0.5} />
            </mesh>
            <mesh position={[0.5, 3.1, 0]}>
                <coneGeometry args={[0.15, 0.5, 4]} />
                <meshStandardMaterial color="#dbeafe" emissive="#60a5fa" emissiveIntensity={0.5} />
            </mesh>

            {/* Floating ice shard */}
            <mesh ref={iceShardRef} position={[0, 3.5, 0]}>
                <octahedronGeometry args={[0.3]} />
                <meshStandardMaterial
                    color="#dbeafe"
                    emissive="#60a5fa"
                    emissiveIntensity={1}
                    transparent
                    opacity={0.8}
                />
            </mesh>

            {/* Point Light for ice glow */}
            <pointLight position={[0, 2, 0]} color="#60a5fa" intensity={1.5} distance={6} />
        </group>
    );
};

export default VoxelIceGiant;
