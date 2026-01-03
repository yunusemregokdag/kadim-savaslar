import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface VoxelStoneGolemProps {
    position?: [number, number, number];
    scale?: number;
}

export const VoxelStoneGolem: React.FC<VoxelStoneGolemProps> = ({
    position = [0, 0, 0],
    scale = 1
}) => {
    const groupRef = useRef<THREE.Group>(null);
    const leftArmRef = useRef<THREE.Group>(null);
    const rightArmRef = useRef<THREE.Group>(null);
    const coreRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        const time = state.clock.getElapsedTime();

        // Heavy walking animation
        if (leftArmRef.current && rightArmRef.current) {
            const armSwing = Math.sin(time * 0.8) * 0.2;
            leftArmRef.current.rotation.x = armSwing;
            rightArmRef.current.rotation.x = -armSwing;
        }

        // Core glow pulse
        if (coreRef.current) {
            const pulse = 0.5 + Math.sin(time * 3) * 0.5;
            coreRef.current.material.emissiveIntensity = pulse;
        }

        // Heavy breathing (slight scale)
        if (groupRef.current) {
            const breathScale = 1 + Math.sin(time * 1) * 0.02;
            groupRef.current.scale.set(scale * breathScale, scale, scale * breathScale);
        }
    });

    return (
        <group ref={groupRef} position={position} scale={scale}>
            {/* Legs - Massive */}
            <mesh position={[-0.6, -1.8, 0]} castShadow>
                <boxGeometry args={[0.8, 2, 0.8]} />
                <meshStandardMaterial color="#78716c" roughness={0.9} />
            </mesh>
            <mesh position={[0.6, -1.8, 0]} castShadow>
                <boxGeometry args={[0.8, 2, 0.8]} />
                <meshStandardMaterial color="#78716c" roughness={0.9} />
            </mesh>

            {/* Knee joints - Darker stone */}
            <mesh position={[-0.6, -1.2, 0]} castShadow>
                <boxGeometry args={[0.9, 0.4, 0.9]} />
                <meshStandardMaterial color="#57534e" />
            </mesh>
            <mesh position={[0.6, -1.2, 0]} castShadow>
                <boxGeometry args={[0.9, 0.4, 0.9]} />
                <meshStandardMaterial color="#57534e" />
            </mesh>

            {/* Feet - Large blocks */}
            <mesh position={[-0.6, -2.9, 0.2]} castShadow>
                <boxGeometry args={[1, 0.4, 1.2]} />
                <meshStandardMaterial color="#a8a29e" />
            </mesh>
            <mesh position={[0.6, -2.9, 0.2]} castShadow>
                <boxGeometry args={[1, 0.4, 1.2]} />
                <meshStandardMaterial color="#a8a29e" />
            </mesh>

            {/* Pelvis */}
            <mesh position={[0, -0.5, 0]} castShadow>
                <boxGeometry args={[2, 0.8, 1.2]} />
                <meshStandardMaterial color="#78716c" roughness={0.9} />
            </mesh>

            {/* Torso - Main body */}
            <mesh position={[0, 0.8, 0]} castShadow>
                <boxGeometry args={[2.2, 2, 1.4]} />
                <meshStandardMaterial color="#78716c" roughness={0.9} />
            </mesh>

            {/* Core - Glowing crystal */}
            <mesh ref={coreRef} position={[0, 0.8, 0.75]}>
                <boxGeometry args={[0.6, 0.6, 0.2]} />
                <meshStandardMaterial
                    color="#fbbf24"
                    emissive="#fbbf24"
                    emissiveIntensity={1}
                    transparent
                    opacity={0.9}
                />
            </mesh>

            {/* Chest plates */}
            <mesh position={[-0.8, 1.2, 0.6]} castShadow>
                <boxGeometry args={[0.6, 0.8, 0.3]} />
                <meshStandardMaterial color="#57534e" />
            </mesh>
            <mesh position={[0.8, 1.2, 0.6]} castShadow>
                <boxGeometry args={[0.6, 0.8, 0.3]} />
                <meshStandardMaterial color="#57534e" />
            </mesh>

            {/* Shoulders - Massive */}
            <mesh position={[-1.3, 1.8, 0]} castShadow>
                <boxGeometry args={[0.8, 0.8, 1]} />
                <meshStandardMaterial color="#57534e" />
            </mesh>
            <mesh position={[1.3, 1.8, 0]} castShadow>
                <boxGeometry args={[0.8, 0.8, 1]} />
                <meshStandardMaterial color="#57534e" />
            </mesh>

            {/* Left Arm */}
            <group ref={leftArmRef} position={[-1.5, 1.2, 0]}>
                <mesh position={[0, -1, 0]} castShadow>
                    <boxGeometry args={[0.6, 2, 0.6]} />
                    <meshStandardMaterial color="#78716c" roughness={0.9} />
                </mesh>
                {/* Fist - Large */}
                <mesh position={[0, -2.3, 0]} castShadow>
                    <boxGeometry args={[0.9, 0.9, 0.9]} />
                    <meshStandardMaterial color="#a8a29e" />
                </mesh>
            </group>

            {/* Right Arm */}
            <group ref={rightArmRef} position={[1.5, 1.2, 0]}>
                <mesh position={[0, -1, 0]} castShadow>
                    <boxGeometry args={[0.6, 2, 0.6]} />
                    <meshStandardMaterial color="#78716c" roughness={0.9} />
                </mesh>
                {/* Fist - Large */}
                <mesh position={[0, -2.3, 0]} castShadow>
                    <boxGeometry args={[0.9, 0.9, 0.9]} />
                    <meshStandardMaterial color="#a8a29e" />
                </mesh>
            </group>

            {/* Neck */}
            <mesh position={[0, 2.2, 0]} castShadow>
                <boxGeometry args={[0.8, 0.6, 0.8]} />
                <meshStandardMaterial color="#78716c" />
            </mesh>

            {/* Head - Block-like */}
            <mesh position={[0, 3, 0]} castShadow>
                <boxGeometry args={[1.4, 1.2, 1.2]} />
                <meshStandardMaterial color="#78716c" roughness={0.9} />
            </mesh>

            {/* Eyes - Glowing yellow */}
            <mesh position={[-0.4, 3.1, 0.65]}>
                <boxGeometry args={[0.25, 0.25, 0.1]} />
                <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={2} />
            </mesh>
            <mesh position={[0.4, 3.1, 0.65]}>
                <boxGeometry args={[0.25, 0.25, 0.1]} />
                <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={2} />
            </mesh>

            {/* Head crest */}
            <mesh position={[0, 3.7, 0]} castShadow>
                <boxGeometry args={[1.6, 0.3, 0.4]} />
                <meshStandardMaterial color="#57534e" />
            </mesh>

            {/* Stone spikes on back */}
            <mesh position={[-0.6, 1.5, -0.7]} rotation={[0.3, 0, 0]} castShadow>
                <boxGeometry args={[0.3, 0.8, 0.3]} />
                <meshStandardMaterial color="#57534e" />
            </mesh>
            <mesh position={[0, 1.6, -0.7]} rotation={[0.3, 0, 0]} castShadow>
                <boxGeometry args={[0.3, 1, 0.3]} />
                <meshStandardMaterial color="#57534e" />
            </mesh>
            <mesh position={[0.6, 1.5, -0.7]} rotation={[0.3, 0, 0]} castShadow>
                <boxGeometry args={[0.3, 0.8, 0.3]} />
                <meshStandardMaterial color="#57534e" />
            </mesh>

            {/* Cracks - Darker lines */}
            <mesh position={[0, 0.8, 0.71]}>
                <boxGeometry args={[0.1, 1.5, 0.05]} />
                <meshStandardMaterial color="#292524" />
            </mesh>
            <mesh position={[0.5, 1.2, 0.71]}>
                <boxGeometry args={[0.8, 0.1, 0.05]} />
                <meshStandardMaterial color="#292524" />
            </mesh>

            {/* Point Light for core glow */}
            <pointLight position={[0, 0.8, 1]} color="#fbbf24" intensity={1.5} distance={4} />
        </group>
    );
};

export default VoxelStoneGolem;
