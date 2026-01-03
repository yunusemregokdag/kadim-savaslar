import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface VoxelBatProps {
    position?: [number, number, number];
    scale?: number;
}

export const VoxelBat: React.FC<VoxelBatProps> = ({
    position = [0, 0, 0],
    scale = 1
}) => {
    const groupRef = useRef<THREE.Group>(null);
    const leftWingRef = useRef<THREE.Group>(null);
    const rightWingRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        const time = state.clock.getElapsedTime();

        // Wing flapping - Fast
        if (leftWingRef.current && rightWingRef.current) {
            const flapAngle = Math.sin(time * 8) * 0.8;
            leftWingRef.current.rotation.z = flapAngle;
            rightWingRef.current.rotation.z = -flapAngle;
        }

        // Flying bobbing motion
        if (groupRef.current) {
            groupRef.current.position.y = position[1] + Math.sin(time * 3) * 0.3;
            groupRef.current.position.x = position[0] + Math.sin(time * 2) * 0.1;
        }
    });

    return (
        <group ref={groupRef} position={position} scale={scale}>
            {/* Body - Small */}
            <mesh position={[0, 0, 0]} castShadow>
                <boxGeometry args={[0.3, 0.4, 0.5]} />
                <meshStandardMaterial color="#475569" />
            </mesh>

            {/* Chest - Lighter */}
            <mesh position={[0, -0.05, 0.26]}>
                <boxGeometry args={[0.25, 0.3, 0.05]} />
                <meshStandardMaterial color="#64748b" />
            </mesh>

            {/* Head */}
            <mesh position={[0, 0.4, 0]} castShadow>
                <boxGeometry args={[0.35, 0.3, 0.35]} />
                <meshStandardMaterial color="#475569" />
            </mesh>

            {/* Ears - Large pointy */}
            <mesh position={[-0.2, 0.6, 0]} rotation={[0, 0, -0.3]} castShadow>
                <boxGeometry args={[0.15, 0.4, 0.1]} />
                <meshStandardMaterial color="#334155" />
            </mesh>
            <mesh position={[0.2, 0.6, 0]} rotation={[0, 0, 0.3]} castShadow>
                <boxGeometry args={[0.15, 0.4, 0.1]} />
                <meshStandardMaterial color="#334155" />
            </mesh>

            {/* Eyes - Red glowing */}
            <mesh position={[-0.1, 0.45, 0.19]}>
                <boxGeometry args={[0.08, 0.08, 0.05]} />
                <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2} />
            </mesh>
            <mesh position={[0.1, 0.45, 0.19]}>
                <boxGeometry args={[0.08, 0.08, 0.05]} />
                <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2} />
            </mesh>

            {/* Snout/Nose */}
            <mesh position={[0, 0.35, 0.2]} castShadow>
                <boxGeometry args={[0.12, 0.1, 0.08]} />
                <meshStandardMaterial color="#1e293b" />
            </mesh>

            {/* Fangs */}
            <mesh position={[-0.05, 0.28, 0.2]}>
                <boxGeometry args={[0.04, 0.1, 0.04]} />
                <meshStandardMaterial color="#f8fafc" />
            </mesh>
            <mesh position={[0.05, 0.28, 0.2]}>
                <boxGeometry args={[0.04, 0.1, 0.04]} />
                <meshStandardMaterial color="#f8fafc" />
            </mesh>

            {/* Left Wing */}
            <group ref={leftWingRef} position={[-0.15, 0.1, 0]}>
                {/* Wing arm */}
                <mesh position={[-0.15, 0, 0]} rotation={[0, 0, 0.3]} castShadow>
                    <boxGeometry args={[0.4, 0.08, 0.08]} />
                    <meshStandardMaterial color="#334155" />
                </mesh>
                {/* Wing membrane */}
                <mesh position={[-0.3, -0.15, 0]} rotation={[0, 0, 0.3]} castShadow>
                    <boxGeometry args={[0.5, 0.02, 0.6]} />
                    <meshStandardMaterial
                        color="#1e293b"
                        transparent
                        opacity={0.8}
                    />
                </mesh>
                {/* Wing finger bones */}
                <mesh position={[-0.4, -0.1, 0.15]} rotation={[0, 0, 0.5]}>
                    <boxGeometry args={[0.3, 0.04, 0.04]} />
                    <meshStandardMaterial color="#334155" />
                </mesh>
                <mesh position={[-0.4, -0.2, 0]} rotation={[0, 0, 0.5]}>
                    <boxGeometry args={[0.3, 0.04, 0.04]} />
                    <meshStandardMaterial color="#334155" />
                </mesh>
                <mesh position={[-0.4, -0.1, -0.15]} rotation={[0, 0, 0.5]}>
                    <boxGeometry args={[0.3, 0.04, 0.04]} />
                    <meshStandardMaterial color="#334155" />
                </mesh>
            </group>

            {/* Right Wing */}
            <group ref={rightWingRef} position={[0.15, 0.1, 0]}>
                {/* Wing arm */}
                <mesh position={[0.15, 0, 0]} rotation={[0, 0, -0.3]} castShadow>
                    <boxGeometry args={[0.4, 0.08, 0.08]} />
                    <meshStandardMaterial color="#334155" />
                </mesh>
                {/* Wing membrane */}
                <mesh position={[0.3, -0.15, 0]} rotation={[0, 0, -0.3]} castShadow>
                    <boxGeometry args={[0.5, 0.02, 0.6]} />
                    <meshStandardMaterial
                        color="#1e293b"
                        transparent
                        opacity={0.8}
                    />
                </mesh>
                {/* Wing finger bones */}
                <mesh position={[0.4, -0.1, 0.15]} rotation={[0, 0, -0.5]}>
                    <boxGeometry args={[0.3, 0.04, 0.04]} />
                    <meshStandardMaterial color="#334155" />
                </mesh>
                <mesh position={[0.4, -0.2, 0]} rotation={[0, 0, -0.5]}>
                    <boxGeometry args={[0.3, 0.04, 0.04]} />
                    <meshStandardMaterial color="#334155" />
                </mesh>
                <mesh position={[0.4, -0.1, -0.15]} rotation={[0, 0, -0.5]}>
                    <boxGeometry args={[0.3, 0.04, 0.04]} />
                    <meshStandardMaterial color="#334155" />
                </mesh>
            </group>

            {/* Legs - Hanging */}
            <mesh position={[-0.08, -0.35, 0]} castShadow>
                <boxGeometry args={[0.08, 0.3, 0.08]} />
                <meshStandardMaterial color="#475569" />
            </mesh>
            <mesh position={[0.08, -0.35, 0]} castShadow>
                <boxGeometry args={[0.08, 0.3, 0.08]} />
                <meshStandardMaterial color="#475569" />
            </mesh>

            {/* Claws */}
            <mesh position={[-0.08, -0.52, 0]} castShadow>
                <boxGeometry args={[0.12, 0.08, 0.12]} />
                <meshStandardMaterial color="#1e293b" />
            </mesh>
            <mesh position={[0.08, -0.52, 0]} castShadow>
                <boxGeometry args={[0.12, 0.08, 0.12]} />
                <meshStandardMaterial color="#1e293b" />
            </mesh>

            {/* Point Light for red eye glow */}
            <pointLight position={[0, 0.45, 0.3]} color="#ef4444" intensity={0.5} distance={2} />
        </group>
    );
};

export default VoxelBat;
