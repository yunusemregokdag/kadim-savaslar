import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface VoxelSkeletonProps {
    position?: [number, number, number];
    scale?: number;
}

export const VoxelSkeleton: React.FC<VoxelSkeletonProps> = ({
    position = [0, 0, 0],
    scale = 1
}) => {
    const groupRef = useRef<THREE.Group>(null);
    const staffRef = useRef<THREE.Group>(null);
    const orbRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        const time = state.clock.getElapsedTime();

        // Staff floating/rotating
        if (staffRef.current) {
            staffRef.current.rotation.y += 0.01;
            staffRef.current.position.y = -0.5 + Math.sin(time * 2) * 0.05;
        }

        // Orb pulse
        if (orbRef.current) {
            const pulse = 1 + Math.sin(time * 4) * 0.2;
            orbRef.current.scale.set(pulse, pulse, pulse);
        }

        // Floating animation
        if (groupRef.current) {
            groupRef.current.position.y = position[1] + Math.sin(time * 1.5) * 0.1;
        }
    });

    return (
        <group ref={groupRef} position={position} scale={scale}>
            {/* Legs - Bone */}
            <mesh position={[-0.15, -0.8, 0]} castShadow>
                <boxGeometry args={[0.15, 1, 0.15]} />
                <meshStandardMaterial color="#e7e5e4" />
            </mesh>
            <mesh position={[0.15, -0.8, 0]} castShadow>
                <boxGeometry args={[0.15, 1, 0.15]} />
                <meshStandardMaterial color="#e7e5e4" />
            </mesh>

            {/* Knee joints */}
            <mesh position={[-0.15, -0.5, 0]} castShadow>
                <boxGeometry args={[0.2, 0.2, 0.2]} />
                <meshStandardMaterial color="#d6d3d1" />
            </mesh>
            <mesh position={[0.15, -0.5, 0]} castShadow>
                <boxGeometry args={[0.2, 0.2, 0.2]} />
                <meshStandardMaterial color="#d6d3d1" />
            </mesh>

            {/* Pelvis */}
            <mesh position={[0, -0.2, 0]} castShadow>
                <boxGeometry args={[0.6, 0.3, 0.4]} />
                <meshStandardMaterial color="#e7e5e4" />
            </mesh>

            {/* Spine/Ribcage */}
            <mesh position={[0, 0.3, 0]} castShadow>
                <boxGeometry args={[0.7, 0.8, 0.4]} />
                <meshStandardMaterial color="#e7e5e4" />
            </mesh>

            {/* Ribs - Individual */}
            <mesh position={[-0.25, 0.4, 0.22]}>
                <boxGeometry args={[0.5, 0.05, 0.05]} />
                <meshStandardMaterial color="#d6d3d1" />
            </mesh>
            <mesh position={[-0.25, 0.25, 0.22]}>
                <boxGeometry args={[0.5, 0.05, 0.05]} />
                <meshStandardMaterial color="#d6d3d1" />
            </mesh>
            <mesh position={[-0.25, 0.1, 0.22]}>
                <boxGeometry args={[0.5, 0.05, 0.05]} />
                <meshStandardMaterial color="#d6d3d1" />
            </mesh>

            {/* Shoulders */}
            <mesh position={[-0.45, 0.6, 0]} castShadow>
                <boxGeometry args={[0.2, 0.2, 0.3]} />
                <meshStandardMaterial color="#d6d3d1" />
            </mesh>
            <mesh position={[0.45, 0.6, 0]} castShadow>
                <boxGeometry args={[0.2, 0.2, 0.3]} />
                <meshStandardMaterial color="#d6d3d1" />
            </mesh>

            {/* Left Arm */}
            <mesh position={[-0.5, 0.2, 0]} castShadow>
                <boxGeometry args={[0.12, 0.6, 0.12]} />
                <meshStandardMaterial color="#e7e5e4" />
            </mesh>
            <mesh position={[-0.5, -0.3, 0]} castShadow>
                <boxGeometry args={[0.15, 0.15, 0.15]} />
                <meshStandardMaterial color="#d6d3d1" />
            </mesh>

            {/* Right Arm - Holding staff */}
            <group ref={staffRef} position={[0.5, 0, 0]}>
                <mesh position={[0, 0.2, 0]} castShadow>
                    <boxGeometry args={[0.12, 0.6, 0.12]} />
                    <meshStandardMaterial color="#e7e5e4" />
                </mesh>
                <mesh position={[0, -0.3, 0]} castShadow>
                    <boxGeometry args={[0.15, 0.15, 0.15]} />
                    <meshStandardMaterial color="#d6d3d1" />
                </mesh>

                {/* Magic Staff */}
                <mesh position={[0, -0.8, 0]} castShadow>
                    <boxGeometry args={[0.08, 1.5, 0.08]} />
                    <meshStandardMaterial color="#78350f" />
                </mesh>

                {/* Staff top - Orb holder */}
                <mesh position={[0, 0.4, 0]} castShadow>
                    <boxGeometry args={[0.15, 0.15, 0.15]} />
                    <meshStandardMaterial color="#78350f" />
                </mesh>

                {/* Magic Orb */}
                <mesh ref={orbRef} position={[0, 0.6, 0]}>
                    <sphereGeometry args={[0.15, 8, 8]} />
                    <meshStandardMaterial
                        color="#a78bfa"
                        emissive="#a78bfa"
                        emissiveIntensity={2}
                        transparent
                        opacity={0.9}
                    />
                </mesh>
            </group>

            {/* Neck */}
            <mesh position={[0, 0.8, 0]} castShadow>
                <boxGeometry args={[0.15, 0.2, 0.15]} />
                <meshStandardMaterial color="#e7e5e4" />
            </mesh>

            {/* Skull */}
            <mesh position={[0, 1.1, 0]} castShadow>
                <boxGeometry args={[0.5, 0.5, 0.5]} />
                <meshStandardMaterial color="#e7e5e4" />
            </mesh>

            {/* Jaw */}
            <mesh position={[0, 0.85, 0.15]} castShadow>
                <boxGeometry args={[0.4, 0.15, 0.3]} />
                <meshStandardMaterial color="#d6d3d1" />
            </mesh>

            {/* Eye sockets - Glowing purple */}
            <mesh position={[-0.12, 1.15, 0.26]}>
                <boxGeometry args={[0.12, 0.15, 0.05]} />
                <meshStandardMaterial color="#000000" />
            </mesh>
            <mesh position={[0.12, 1.15, 0.26]}>
                <boxGeometry args={[0.12, 0.15, 0.05]} />
                <meshStandardMaterial color="#000000" />
            </mesh>

            {/* Glowing eyes inside sockets */}
            <mesh position={[-0.12, 1.15, 0.28]}>
                <boxGeometry args={[0.08, 0.08, 0.03]} />
                <meshStandardMaterial color="#a78bfa" emissive="#a78bfa" emissiveIntensity={3} />
            </mesh>
            <mesh position={[0.12, 1.15, 0.28]}>
                <boxGeometry args={[0.08, 0.08, 0.03]} />
                <meshStandardMaterial color="#a78bfa" emissive="#a78bfa" emissiveIntensity={3} />
            </mesh>

            {/* Teeth */}
            <mesh position={[-0.1, 0.88, 0.28]}>
                <boxGeometry args={[0.04, 0.08, 0.02]} />
                <meshStandardMaterial color="#f8fafc" />
            </mesh>
            <mesh position={[0, 0.88, 0.28]}>
                <boxGeometry args={[0.04, 0.08, 0.02]} />
                <meshStandardMaterial color="#f8fafc" />
            </mesh>
            <mesh position={[0.1, 0.88, 0.28]}>
                <boxGeometry args={[0.04, 0.08, 0.02]} />
                <meshStandardMaterial color="#f8fafc" />
            </mesh>

            {/* Tattered robe */}
            <mesh position={[0, 0, 0]} castShadow>
                <coneGeometry args={[0.6, 1, 6]} />
                <meshStandardMaterial
                    color="#4c1d95"
                    transparent
                    opacity={0.7}
                />
            </mesh>

            {/* Point Light for purple glow */}
            <pointLight position={[0, 1.1, 0.3]} color="#a78bfa" intensity={1} distance={3} />
            <pointLight position={[0.5, 0.6, 0]} color="#a78bfa" intensity={1.5} distance={2} />
        </group>
    );
};

export default VoxelSkeleton;
