import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface VoxelAxolotlProps {
    color?: string; // Main body color (pink, yellow, blue, etc.)
    gillColor?: string; // Usually pink/red
    isHostile?: boolean;
    scale?: number;
}

export const VoxelAxolotl: React.FC<VoxelAxolotlProps> = ({
    color = '#f472b6', // Default Pink
    gillColor = '#be185d', // Default Dark Pink
    isHostile = false,
    scale = 1
}) => {
    const bodyRef = useRef<THREE.Group>(null);
    const tailRef = useRef<THREE.Group>(null);
    const headRef = useRef<THREE.Group>(null);
    const legFL = useRef<THREE.Mesh>(null);
    const legFR = useRef<THREE.Mesh>(null);
    const legBL = useRef<THREE.Mesh>(null);
    const legBR = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();

        // Floating/Swimming Motion
        if (bodyRef.current) {
            bodyRef.current.position.y = Math.sin(t * 1.5) * 0.1;
            bodyRef.current.rotation.z = Math.sin(t * 2) * 0.05; // Slight roll
        }

        // Tail Wagging
        if (tailRef.current) {
            tailRef.current.rotation.y = Math.sin(t * 5) * 0.4; // Fast wag
        }

        // Head Bobble
        if (headRef.current) {
            headRef.current.rotation.x = Math.sin(t * 2) * 0.05;
        }

        // Leg Movement (Swimming paddle)
        const legSpeed = 5;
        const legAmp = 0.3;
        if (legFL.current) legFL.current.rotation.x = Math.sin(t * legSpeed) * legAmp;
        if (legFR.current) legFR.current.rotation.x = Math.cos(t * legSpeed) * legAmp;
        if (legBL.current) legBL.current.rotation.x = Math.cos(t * legSpeed) * legAmp;
        if (legBR.current) legBR.current.rotation.x = Math.sin(t * legSpeed) * legAmp;
    });

    return (
        <group ref={bodyRef} scale={[scale, scale, scale]}>
            {/* Main Body Segment */}
            <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.6, 0.4, 0.9]} />
                <meshStandardMaterial color={color} />
            </mesh>

            {/* Head Group */}
            <group ref={headRef} position={[0, 0.45, 0.45]}>
                {/* Head Box */}
                <mesh position={[0, 0, 0.25]} castShadow>
                    <boxGeometry args={[0.7, 0.5, 0.5]} />
                    <meshStandardMaterial color={color} />
                </mesh>

                {/* Face (White part implied or texture, lets keeps simple voxel) */}

                {/* Eyes */}
                <mesh position={[0.2, 0.05, 0.51]}>
                    <boxGeometry args={[0.08, 0.08, 0.02]} />
                    <meshStandardMaterial color="black" />
                </mesh>
                <mesh position={[-0.2, 0.05, 0.51]}>
                    <boxGeometry args={[0.08, 0.08, 0.02]} />
                    <meshStandardMaterial color="black" />
                </mesh>

                {/* Mouth */}
                <mesh position={[0, -0.15, 0.51]}>
                    <boxGeometry args={[0.2, 0.05, 0.02]} />
                    <meshStandardMaterial color="black" opacity={0.5} transparent />
                </mesh>

                {/* Gills (Left) */}
                <group position={[0.4, 0, 0.2]} rotation={[0, -0.2, 0]}>
                    {[0.1, 0, -0.1].map((y, i) => (
                        <mesh key={i} position={[0, y, 0]} rotation={[0, 0, -0.2]}>
                            <boxGeometry args={[0.2, 0.1, 0.05]} />
                            <meshStandardMaterial color={gillColor} />
                        </mesh>
                    ))}
                </group>
                {/* Gills (Right) */}
                <group position={[-0.4, 0, 0.2]} rotation={[0, 0.2, 0]}>
                    {[0.1, 0, -0.1].map((y, i) => (
                        <mesh key={i} position={[0, y, 0]} rotation={[0, 0, 0.2]}>
                            <boxGeometry args={[0.2, 0.1, 0.05]} />
                            <meshStandardMaterial color={gillColor} />
                        </mesh>
                    ))}
                </group>
            </group>

            {/* Tail Group */}
            <group ref={tailRef} position={[0, 0.4, -0.45]}>
                <mesh position={[0, 0, -0.4]}>
                    <boxGeometry args={[0.2, 0.35, 0.8]} />
                    <meshStandardMaterial color={color} />
                </mesh>
                {/* Tail Fin Top */}
                <mesh position={[0, 0.25, -0.4]}>
                    <boxGeometry args={[0.05, 0.15, 0.7]} />
                    <meshStandardMaterial color={gillColor} transparent opacity={0.8} />
                </mesh>
                {/* Tail Fin Bottom */}
                <mesh position={[0, -0.25, -0.4]}>
                    <boxGeometry args={[0.05, 0.15, 0.7]} />
                    <meshStandardMaterial color={gillColor} transparent opacity={0.8} />
                </mesh>
            </group>

            {/* Legs */}
            <mesh ref={legFL} position={[0.3, 0.1, 0.3]} castShadow>
                <boxGeometry args={[0.15, 0.3, 0.15]} />
                <meshStandardMaterial color={color} />
            </mesh>
            <mesh ref={legFR} position={[-0.3, 0.1, 0.3]} castShadow>
                <boxGeometry args={[0.15, 0.3, 0.15]} />
                <meshStandardMaterial color={color} />
            </mesh>
            <mesh ref={legBL} position={[0.3, 0.1, -0.3]} castShadow>
                <boxGeometry args={[0.15, 0.3, 0.15]} />
                <meshStandardMaterial color={color} />
            </mesh>
            <mesh ref={legBR} position={[-0.3, 0.1, -0.3]} castShadow>
                <boxGeometry args={[0.15, 0.3, 0.15]} />
                <meshStandardMaterial color={color} />
            </mesh>

            {/* Hostile Indicator */}
            {isHostile && (
                <pointLight position={[0, 1, 0.5]} color="red" intensity={1} distance={2} />
            )}
        </group>
    );
};
