import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface VoxelGolemProps {
    position?: [number, number, number];
    scale?: number;
}

export const VoxelGolem: React.FC<VoxelGolemProps> = ({
    position = [0, 0, 0],
    scale = 1
}) => {
    const groupRef = useRef<THREE.Group>(null);
    const leftArmRef = useRef<THREE.Group>(null);
    const rightArmRef = useRef<THREE.Group>(null);
    const coreRef = useRef<THREE.Mesh>(null);
    const runeRefs = useRef<THREE.Mesh[]>([]);

    useFrame((state) => {
        const time = state.clock.getElapsedTime();

        // Heavy arm swinging
        if (leftArmRef.current && rightArmRef.current) {
            const armSwing = Math.sin(time * 0.6) * 0.15;
            leftArmRef.current.rotation.x = armSwing;
            rightArmRef.current.rotation.x = -armSwing;
        }

        // Core glow pulse
        if (coreRef.current) {
            const pulse = 0.8 + Math.sin(time * 2) * 0.4;
            coreRef.current.material.emissiveIntensity = pulse;
        }

        // Rune rotation
        runeRefs.current.forEach((rune, i) => {
            if (rune) {
                rune.rotation.y += 0.02 * (i + 1);
            }
        });

        // Heavy breathing
        if (groupRef.current) {
            const breathScale = 1 + Math.sin(time * 0.8) * 0.015;
            groupRef.current.scale.set(scale * breathScale, scale, scale * breathScale);
        }
    });

    return (
        <group ref={groupRef} position={position} scale={scale}>
            {/* Legs - Massive stone */}
            <mesh position={[-0.7, -2, 0]} castShadow>
                <boxGeometry args={[1, 2.5, 1]} />
                <meshStandardMaterial color="#78716c" roughness={0.95} />
            </mesh>
            <mesh position={[0.7, -2, 0]} castShadow>
                <boxGeometry args={[1, 2.5, 1]} />
                <meshStandardMaterial color="#78716c" roughness={0.95} />
            </mesh>

            {/* Knee joints - Ancient */}
            <mesh position={[-0.7, -1.3, 0]} castShadow>
                <boxGeometry args={[1.1, 0.5, 1.1]} />
                <meshStandardMaterial color="#57534e" />
            </mesh>
            <mesh position={[0.7, -1.3, 0]} castShadow>
                <boxGeometry args={[1.1, 0.5, 1.1]} />
                <meshStandardMaterial color="#57534e" />
            </mesh>

            {/* Feet - Huge blocks */}
            <mesh position={[-0.7, -3.4, 0.2]} castShadow>
                <boxGeometry args={[1.2, 0.5, 1.5]} />
                <meshStandardMaterial color="#a8a29e" />
            </mesh>
            <mesh position={[0.7, -3.4, 0.2]} castShadow>
                <boxGeometry args={[1.2, 0.5, 1.5]} />
                <meshStandardMaterial color="#a8a29e" />
            </mesh>

            {/* Pelvis */}
            <mesh position={[0, -0.5, 0]} castShadow>
                <boxGeometry args={[2.5, 1, 1.5]} />
                <meshStandardMaterial color="#78716c" roughness={0.95} />
            </mesh>

            {/* Torso - Main body */}
            <mesh position={[0, 1, 0]} castShadow>
                <boxGeometry args={[2.8, 2.5, 1.8]} />
                <meshStandardMaterial color="#78716c" roughness={0.95} />
            </mesh>

            {/* Core - Glowing ancient crystal */}
            <mesh ref={coreRef} position={[0, 1, 0.95]}>
                <boxGeometry args={[0.8, 0.8, 0.3]} />
                <meshStandardMaterial
                    color="#ef4444"
                    emissive="#ef4444"
                    emissiveIntensity={1.2}
                    transparent
                    opacity={0.9}
                />
            </mesh>

            {/* Chest plates - Ancient armor */}
            <mesh position={[-1, 1.5, 0.8]} castShadow>
                <boxGeometry args={[0.8, 1, 0.4]} />
                <meshStandardMaterial color="#57534e" />
            </mesh>
            <mesh position={[1, 1.5, 0.8]} castShadow>
                <boxGeometry args={[0.8, 1, 0.4]} />
                <meshStandardMaterial color="#57534e" />
            </mesh>

            {/* Shoulders - Massive */}
            <mesh position={[-1.6, 2.2, 0]} castShadow>
                <boxGeometry args={[1, 1, 1.2]} />
                <meshStandardMaterial color="#57534e" />
            </mesh>
            <mesh position={[1.6, 2.2, 0]} castShadow>
                <boxGeometry args={[1, 1, 1.2]} />
                <meshStandardMaterial color="#57534e" />
            </mesh>

            {/* Shoulder spikes */}
            <mesh position={[-1.6, 2.8, 0]} castShadow>
                <coneGeometry args={[0.3, 0.6, 4]} />
                <meshStandardMaterial color="#292524" />
            </mesh>
            <mesh position={[1.6, 2.8, 0]} castShadow>
                <coneGeometry args={[0.3, 0.6, 4]} />
                <meshStandardMaterial color="#292524" />
            </mesh>

            {/* Left Arm */}
            <group ref={leftArmRef} position={[-1.8, 1.5, 0]}>
                <mesh position={[0, -1.2, 0]} castShadow>
                    <boxGeometry args={[0.7, 2.5, 0.7]} />
                    <meshStandardMaterial color="#78716c" roughness={0.95} />
                </mesh>
                {/* Fist - Massive */}
                <mesh position={[0, -2.8, 0]} castShadow>
                    <boxGeometry args={[1.1, 1.1, 1.1]} />
                    <meshStandardMaterial color="#a8a29e" />
                </mesh>
                {/* Knuckle spikes */}
                <mesh position={[0, -2.8, 0.6]} castShadow>
                    <boxGeometry args={[0.9, 0.3, 0.3]} />
                    <meshStandardMaterial color="#292524" />
                </mesh>
            </group>

            {/* Right Arm */}
            <group ref={rightArmRef} position={[1.8, 1.5, 0]}>
                <mesh position={[0, -1.2, 0]} castShadow>
                    <boxGeometry args={[0.7, 2.5, 0.7]} />
                    <meshStandardMaterial color="#78716c" roughness={0.95} />
                </mesh>
                {/* Fist - Massive */}
                <mesh position={[0, -2.8, 0]} castShadow>
                    <boxGeometry args={[1.1, 1.1, 1.1]} />
                    <meshStandardMaterial color="#a8a29e" />
                </mesh>
                {/* Knuckle spikes */}
                <mesh position={[0, -2.8, 0.6]} castShadow>
                    <boxGeometry args={[0.9, 0.3, 0.3]} />
                    <meshStandardMaterial color="#292524" />
                </mesh>
            </group>

            {/* Neck */}
            <mesh position={[0, 2.7, 0]} castShadow>
                <boxGeometry args={[1, 0.8, 1]} />
                <meshStandardMaterial color="#78716c" />
            </mesh>

            {/* Head - Ancient guardian */}
            <mesh position={[0, 3.7, 0]} castShadow>
                <boxGeometry args={[1.8, 1.5, 1.5]} />
                <meshStandardMaterial color="#78716c" roughness={0.95} />
            </mesh>

            {/* Eyes - Glowing red */}
            <mesh position={[-0.5, 3.8, 0.8]}>
                <boxGeometry args={[0.3, 0.3, 0.1]} />
                <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2.5} />
            </mesh>
            <mesh position={[0.5, 3.8, 0.8]}>
                <boxGeometry args={[0.3, 0.3, 0.1]} />
                <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2.5} />
            </mesh>

            {/* Head crest - Ancient crown */}
            <mesh position={[0, 4.5, 0]} castShadow>
                <boxGeometry args={[2, 0.4, 0.5]} />
                <meshStandardMaterial color="#57534e" />
            </mesh>
            <mesh position={[-0.6, 4.8, 0]} castShadow>
                <boxGeometry args={[0.3, 0.5, 0.3]} />
                <meshStandardMaterial color="#57534e" />
            </mesh>
            <mesh position={[0, 4.9, 0]} castShadow>
                <boxGeometry args={[0.4, 0.7, 0.4]} />
                <meshStandardMaterial color="#57534e" />
            </mesh>
            <mesh position={[0.6, 4.8, 0]} castShadow>
                <boxGeometry args={[0.3, 0.5, 0.3]} />
                <meshStandardMaterial color="#57534e" />
            </mesh>

            {/* Back spikes */}
            <mesh position={[-0.8, 2, -0.9]} rotation={[0.4, 0, 0]} castShadow>
                <boxGeometry args={[0.4, 1, 0.4]} />
                <meshStandardMaterial color="#57534e" />
            </mesh>
            <mesh position={[0, 2.2, -0.9]} rotation={[0.4, 0, 0]} castShadow>
                <boxGeometry args={[0.4, 1.2, 0.4]} />
                <meshStandardMaterial color="#57534e" />
            </mesh>
            <mesh position={[0.8, 2, -0.9]} rotation={[0.4, 0, 0]} castShadow>
                <boxGeometry args={[0.4, 1, 0.4]} />
                <meshStandardMaterial color="#57534e" />
            </mesh>

            {/* Ancient runes - Floating */}
            <mesh ref={(el) => el && (runeRefs.current[0] = el)} position={[-1.2, 2.5, 1.2]}>
                <boxGeometry args={[0.2, 0.2, 0.05]} />
                <meshStandardMaterial
                    color="#ef4444"
                    emissive="#ef4444"
                    emissiveIntensity={1.5}
                    transparent
                    opacity={0.8}
                />
            </mesh>
            <mesh ref={(el) => el && (runeRefs.current[1] = el)} position={[1.2, 2.5, 1.2]}>
                <boxGeometry args={[0.2, 0.2, 0.05]} />
                <meshStandardMaterial
                    color="#ef4444"
                    emissive="#ef4444"
                    emissiveIntensity={1.5}
                    transparent
                    opacity={0.8}
                />
            </mesh>
            <mesh ref={(el) => el && (runeRefs.current[2] = el)} position={[0, 3, 1.2]}>
                <boxGeometry args={[0.2, 0.2, 0.05]} />
                <meshStandardMaterial
                    color="#ef4444"
                    emissive="#ef4444"
                    emissiveIntensity={1.5}
                    transparent
                    opacity={0.8}
                />
            </mesh>

            {/* Cracks - Battle damage */}
            <mesh position={[0, 1, 0.91]}>
                <boxGeometry args={[0.15, 2, 0.05]} />
                <meshStandardMaterial color="#292524" />
            </mesh>
            <mesh position={[0.6, 1.5, 0.91]}>
                <boxGeometry args={[1, 0.1, 0.05]} />
                <meshStandardMaterial color="#292524" />
            </mesh>

            {/* Point Lights for red glow */}
            <pointLight position={[0, 1, 1.2]} color="#ef4444" intensity={2} distance={5} />
            <pointLight position={[0, 3.8, 1]} color="#ef4444" intensity={1.5} distance={4} />
        </group>
    );
};

export default VoxelGolem;
