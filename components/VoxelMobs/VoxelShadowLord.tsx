import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface VoxelShadowLordProps {
    position?: [number, number, number];
    scale?: number;
}

export const VoxelShadowLord: React.FC<VoxelShadowLordProps> = ({
    position = [0, 0, 0],
    scale = 1
}) => {
    const groupRef = useRef<THREE.Group>(null);
    const cloakRef = useRef<THREE.Mesh>(null);
    const orbRef = useRef<THREE.Mesh>(null);
    const shadowRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        const time = state.clock.getElapsedTime();

        // Floating animation
        if (groupRef.current) {
            groupRef.current.position.y = position[1] + Math.sin(time * 1.5) * 0.3;
        }

        // Cloak wave
        if (cloakRef.current) {
            cloakRef.current.rotation.y = Math.sin(time * 2) * 0.1;
        }

        // Orb rotation and pulse
        if (orbRef.current) {
            orbRef.current.rotation.y += 0.05;
            orbRef.current.rotation.x += 0.03;
            const pulse = 1 + Math.sin(time * 4) * 0.2;
            orbRef.current.scale.set(pulse, pulse, pulse);
        }

        // Shadow pulse
        if (shadowRef.current) {
            const shadowPulse = 1 + Math.sin(time * 3) * 0.15;
            shadowRef.current.scale.set(shadowPulse, 1, shadowPulse);
        }
    });

    return (
        <group ref={groupRef} position={position} scale={scale}>
            {/* Shadow on ground */}
            <mesh ref={shadowRef} position={[0, -1.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[1.5, 32]} />
                <meshStandardMaterial
                    color="#000000"
                    transparent
                    opacity={0.6}
                    emissive="#7c3aed"
                    emissiveIntensity={0.2}
                />
            </mesh>

            {/* Cloak - Lower part */}
            <mesh ref={cloakRef} position={[0, -0.5, 0]} castShadow>
                <coneGeometry args={[1.2, 2, 6]} />
                <meshStandardMaterial
                    color="#1e1b4b"
                    emissive="#7c3aed"
                    emissiveIntensity={0.3}
                    transparent
                    opacity={0.9}
                />
            </mesh>

            {/* Body - Torso */}
            <mesh position={[0, 0.8, 0]} castShadow>
                <boxGeometry args={[0.8, 1.2, 0.5]} />
                <meshStandardMaterial
                    color="#312e81"
                    emissive="#7c3aed"
                    emissiveIntensity={0.4}
                />
            </mesh>

            {/* Shoulders - Armor */}
            <mesh position={[-0.6, 1.3, 0]} castShadow>
                <boxGeometry args={[0.5, 0.3, 0.6]} />
                <meshStandardMaterial color="#1e1b4b" />
            </mesh>
            <mesh position={[0.6, 1.3, 0]} castShadow>
                <boxGeometry args={[0.5, 0.3, 0.6]} />
                <meshStandardMaterial color="#1e1b4b" />
            </mesh>

            {/* Arms */}
            <mesh position={[-0.7, 0.5, 0]} castShadow>
                <boxGeometry args={[0.3, 1, 0.3]} />
                <meshStandardMaterial color="#312e81" emissive="#7c3aed" emissiveIntensity={0.2} />
            </mesh>
            <mesh position={[0.7, 0.5, 0]} castShadow>
                <boxGeometry args={[0.3, 1, 0.3]} />
                <meshStandardMaterial color="#312e81" emissive="#7c3aed" emissiveIntensity={0.2} />
            </mesh>

            {/* Hands - Claws */}
            <mesh position={[-0.7, -0.2, 0]} castShadow>
                <boxGeometry args={[0.4, 0.3, 0.4]} />
                <meshStandardMaterial color="#1e1b4b" />
            </mesh>
            <mesh position={[0.7, -0.2, 0]} castShadow>
                <boxGeometry args={[0.4, 0.3, 0.4]} />
                <meshStandardMaterial color="#1e1b4b" />
            </mesh>

            {/* Neck */}
            <mesh position={[0, 1.7, 0]} castShadow>
                <boxGeometry args={[0.4, 0.4, 0.4]} />
                <meshStandardMaterial color="#312e81" />
            </mesh>

            {/* Head - Skull-like */}
            <mesh position={[0, 2.2, 0]} castShadow>
                <boxGeometry args={[0.8, 0.8, 0.8]} />
                <meshStandardMaterial
                    color="#1e1b4b"
                    emissive="#7c3aed"
                    emissiveIntensity={0.5}
                />
            </mesh>

            {/* Eyes - Glowing purple */}
            <mesh position={[-0.2, 2.2, 0.45]}>
                <boxGeometry args={[0.15, 0.25, 0.1]} />
                <meshStandardMaterial color="#a78bfa" emissive="#a78bfa" emissiveIntensity={3} />
            </mesh>
            <mesh position={[0.2, 2.2, 0.45]}>
                <boxGeometry args={[0.15, 0.25, 0.1]} />
                <meshStandardMaterial color="#a78bfa" emissive="#a78bfa" emissiveIntensity={3} />
            </mesh>

            {/* Crown/Horns */}
            <mesh position={[-0.3, 2.7, 0]} rotation={[0, 0, -0.3]} castShadow>
                <boxGeometry args={[0.15, 0.6, 0.15]} />
                <meshStandardMaterial color="#1e1b4b" />
            </mesh>
            <mesh position={[0.3, 2.7, 0]} rotation={[0, 0, 0.3]} castShadow>
                <boxGeometry args={[0.15, 0.6, 0.15]} />
                <meshStandardMaterial color="#1e1b4b" />
            </mesh>

            {/* Floating Dark Orb */}
            <mesh ref={orbRef} position={[0, 3.2, 0]}>
                <octahedronGeometry args={[0.4]} />
                <meshStandardMaterial
                    color="#7c3aed"
                    emissive="#7c3aed"
                    emissiveIntensity={2}
                    transparent
                    opacity={0.8}
                />
            </mesh>

            {/* Shadow particles */}
            <mesh position={[-0.8, 1, 0]}>
                <boxGeometry args={[0.1, 0.1, 0.1]} />
                <meshStandardMaterial
                    color="#000000"
                    emissive="#7c3aed"
                    emissiveIntensity={1}
                    transparent
                    opacity={0.5}
                />
            </mesh>
            <mesh position={[0.8, 1.2, 0]}>
                <boxGeometry args={[0.1, 0.1, 0.1]} />
                <meshStandardMaterial
                    color="#000000"
                    emissive="#7c3aed"
                    emissiveIntensity={1}
                    transparent
                    opacity={0.5}
                />
            </mesh>
            <mesh position={[0, 0.5, 0.6]}>
                <boxGeometry args={[0.1, 0.1, 0.1]} />
                <meshStandardMaterial
                    color="#000000"
                    emissive="#7c3aed"
                    emissiveIntensity={1}
                    transparent
                    opacity={0.5}
                />
            </mesh>

            {/* Point Light for purple glow */}
            <pointLight position={[0, 2, 0]} color="#7c3aed" intensity={2} distance={5} />
        </group>
    );
};

export default VoxelShadowLord;
