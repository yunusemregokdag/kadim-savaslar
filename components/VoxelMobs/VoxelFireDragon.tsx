import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface VoxelFireDragonProps {
    position?: [number, number, number];
    scale?: number;
}

export const VoxelFireDragon: React.FC<VoxelFireDragonProps> = ({
    position = [0, 0, 0],
    scale = 1
}) => {
    const groupRef = useRef<THREE.Group>(null);
    const wingLeftRef = useRef<THREE.Group>(null);
    const wingRightRef = useRef<THREE.Group>(null);
    const flameRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        const time = state.clock.getElapsedTime();

        // Wing flapping animation
        if (wingLeftRef.current && wingRightRef.current) {
            const wingAngle = Math.sin(time * 3) * 0.4;
            wingLeftRef.current.rotation.z = wingAngle;
            wingRightRef.current.rotation.z = -wingAngle;
        }

        // Flame pulse
        if (flameRef.current) {
            flameRef.current.scale.y = 1 + Math.sin(time * 5) * 0.3;
        }

        // Floating animation
        if (groupRef.current) {
            groupRef.current.position.y = position[1] + Math.sin(time * 2) * 0.2;
        }
    });

    return (
        <group ref={groupRef} position={position} scale={scale}>
            {/* Body */}
            <mesh position={[0, 0, 0]} castShadow>
                <boxGeometry args={[1.2, 0.8, 2]} />
                <meshStandardMaterial color="#dc2626" emissive="#dc2626" emissiveIntensity={0.3} />
            </mesh>

            {/* Neck */}
            <mesh position={[0, 0.5, -0.8]} castShadow>
                <boxGeometry args={[0.6, 0.8, 0.6]} />
                <meshStandardMaterial color="#b91c1c" emissive="#dc2626" emissiveIntensity={0.2} />
            </mesh>

            {/* Head */}
            <mesh position={[0, 1, -1.2]} castShadow>
                <boxGeometry args={[0.8, 0.6, 0.8]} />
                <meshStandardMaterial color="#991b1b" emissive="#dc2626" emissiveIntensity={0.3} />
            </mesh>

            {/* Horns */}
            <mesh position={[-0.3, 1.4, -1.2]} castShadow>
                <boxGeometry args={[0.15, 0.4, 0.15]} />
                <meshStandardMaterial color="#7c2d12" />
            </mesh>
            <mesh position={[0.3, 1.4, -1.2]} castShadow>
                <boxGeometry args={[0.15, 0.4, 0.15]} />
                <meshStandardMaterial color="#7c2d12" />
            </mesh>

            {/* Eyes - Glowing */}
            <mesh position={[-0.2, 1.1, -1.6]}>
                <boxGeometry args={[0.15, 0.15, 0.1]} />
                <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={2} />
            </mesh>
            <mesh position={[0.2, 1.1, -1.6]}>
                <boxGeometry args={[0.15, 0.15, 0.1]} />
                <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={2} />
            </mesh>

            {/* Flame Breath */}
            <mesh ref={flameRef} position={[0, 0.9, -2]}>
                <coneGeometry args={[0.3, 0.8, 4]} />
                <meshStandardMaterial
                    color="#f97316"
                    emissive="#f97316"
                    emissiveIntensity={1.5}
                    transparent
                    opacity={0.7}
                />
            </mesh>

            {/* Left Wing */}
            <group ref={wingLeftRef} position={[-0.6, 0.3, 0]}>
                <mesh position={[-0.5, 0, 0]} castShadow>
                    <boxGeometry args={[1, 0.05, 1.2]} />
                    <meshStandardMaterial color="#7c2d12" emissive="#dc2626" emissiveIntensity={0.1} />
                </mesh>
                {/* Wing spikes */}
                <mesh position={[-0.8, 0, -0.4]}>
                    <boxGeometry args={[0.1, 0.05, 0.3]} />
                    <meshStandardMaterial color="#7c2d12" />
                </mesh>
            </group>

            {/* Right Wing */}
            <group ref={wingRightRef} position={[0.6, 0.3, 0]}>
                <mesh position={[0.5, 0, 0]} castShadow>
                    <boxGeometry args={[1, 0.05, 1.2]} />
                    <meshStandardMaterial color="#7c2d12" emissive="#dc2626" emissiveIntensity={0.1} />
                </mesh>
                {/* Wing spikes */}
                <mesh position={[0.8, 0, -0.4]}>
                    <boxGeometry args={[0.1, 0.05, 0.3]} />
                    <meshStandardMaterial color="#7c2d12" />
                </mesh>
            </group>

            {/* Tail */}
            <mesh position={[0, -0.2, 1.2]} rotation={[0.3, 0, 0]} castShadow>
                <boxGeometry args={[0.4, 0.4, 1]} />
                <meshStandardMaterial color="#b91c1c" emissive="#dc2626" emissiveIntensity={0.2} />
            </mesh>

            {/* Tail Tip - Spike */}
            <mesh position={[0, -0.4, 2]} rotation={[0.5, 0, 0]} castShadow>
                <coneGeometry args={[0.3, 0.6, 4]} />
                <meshStandardMaterial color="#7c2d12" />
            </mesh>

            {/* Legs */}
            <mesh position={[-0.4, -0.6, -0.5]} castShadow>
                <boxGeometry args={[0.3, 0.6, 0.3]} />
                <meshStandardMaterial color="#991b1b" />
            </mesh>
            <mesh position={[0.4, -0.6, -0.5]} castShadow>
                <boxGeometry args={[0.3, 0.6, 0.3]} />
                <meshStandardMaterial color="#991b1b" />
            </mesh>
            <mesh position={[-0.4, -0.6, 0.5]} castShadow>
                <boxGeometry args={[0.3, 0.6, 0.3]} />
                <meshStandardMaterial color="#991b1b" />
            </mesh>
            <mesh position={[0.4, -0.6, 0.5]} castShadow>
                <boxGeometry args={[0.3, 0.6, 0.3]} />
                <meshStandardMaterial color="#991b1b" />
            </mesh>

            {/* Point Light for fire glow */}
            <pointLight position={[0, 0.9, -2]} color="#f97316" intensity={2} distance={5} />
        </group>
    );
};

export default VoxelFireDragon;
