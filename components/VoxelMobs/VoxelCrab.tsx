import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface VoxelCrabProps {
    isHostile?: boolean;
    scale?: number;
    color?: string;
}

export const VoxelCrab: React.FC<VoxelCrabProps> = ({
    isHostile = false,
    scale = 1,
    color = '#ef4444' // Red default
}) => {
    const groupRef = useRef<THREE.Group>(null);
    const clawL = useRef<THREE.Group>(null);
    const clawR = useRef<THREE.Group>(null);
    const legsRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();

        // Bobbing
        if (groupRef.current) {
            groupRef.current.position.y = Math.sin(t * 3) * 0.05;
        }

        // Claw Pinching
        if (clawL.current) clawL.current.rotation.y = -0.2 + Math.sin(t * 2) * 0.2;
        if (clawR.current) clawR.current.rotation.y = 0.2 - Math.sin(t * 2) * 0.2;

        // Leg Wave
        if (legsRef.current) {
            legsRef.current.children.forEach((leg, i) => {
                leg.rotation.z = Math.sin(t * 5 + i) * 0.3;
            });
        }
    });

    return (
        <group ref={groupRef} scale={[scale, scale, scale]}>
            <group position={[0, 0.2, 0]}>
                {/* Body */}
                <mesh castShadow receiveShadow>
                    <boxGeometry args={[0.7, 0.25, 0.5]} />
                    <meshStandardMaterial color={color} />
                </mesh>

                {/* Eyes on Stalks */}
                <group position={[0, 0.125, 0.2]}>
                    <mesh position={[0.15, 0.1, 0]}>
                        <cylinderGeometry args={[0.03, 0.03, 0.2]} />
                        <meshStandardMaterial color={color} />
                    </mesh>
                    <mesh position={[0.15, 0.2, 0]}>
                        <boxGeometry args={[0.06, 0.06, 0.06]} />
                        <meshStandardMaterial color="black" />
                    </mesh>

                    <mesh position={[-0.15, 0.1, 0]}>
                        <cylinderGeometry args={[0.03, 0.03, 0.2]} />
                        <meshStandardMaterial color={color} />
                    </mesh>
                    <mesh position={[-0.15, 0.2, 0]}>
                        <boxGeometry args={[0.06, 0.06, 0.06]} />
                        <meshStandardMaterial color="black" />
                    </mesh>
                </group>

                {/* Claws */}
                <group ref={clawL} position={[0.4, 0, 0.3]} rotation={[0, -0.2, 0]}>
                    <mesh position={[0.2, 0, 0]}>
                        <boxGeometry args={[0.3, 0.2, 0.15]} />
                        <meshStandardMaterial color={color} />
                    </mesh>
                    <mesh position={[0.35, 0.05, 0.1]} rotation={[0, -0.5, 0]}>
                        <boxGeometry args={[0.2, 0.05, 0.05]} />
                        <meshStandardMaterial color="#fca5a5" />
                    </mesh>
                    <mesh position={[0.35, -0.05, 0.1]} rotation={[0, -0.2, 0]}>
                        <boxGeometry args={[0.2, 0.05, 0.05]} />
                        <meshStandardMaterial color="#fca5a5" />
                    </mesh>
                </group>

                <group ref={clawR} position={[-0.4, 0, 0.3]} rotation={[0, 0.2, 0]}>
                    <mesh position={[-0.2, 0, 0]}>
                        <boxGeometry args={[0.3, 0.2, 0.15]} />
                        <meshStandardMaterial color={color} />
                    </mesh>
                    <mesh position={[-0.35, 0.05, 0.1]} rotation={[0, 0.5, 0]}>
                        <boxGeometry args={[0.2, 0.05, 0.05]} />
                        <meshStandardMaterial color="#fca5a5" />
                    </mesh>
                    <mesh position={[-0.35, -0.05, 0.1]} rotation={[0, 0.2, 0]}>
                        <boxGeometry args={[0.2, 0.05, 0.05]} />
                        <meshStandardMaterial color="#fca5a5" />
                    </mesh>
                </group>

                {/* Legs */}
                <group ref={legsRef}>
                    {[-0.3, -0.15, 0.15, 0.3].map((z, i) => (
                        <React.Fragment key={i}>
                            <mesh position={[0.4, -0.1, z]} rotation={[0, 0, -0.5]}>
                                <boxGeometry args={[0.4, 0.05, 0.05]} />
                                <meshStandardMaterial color={color} />
                            </mesh>
                            <mesh position={[-0.4, -0.1, z]} rotation={[0, 0, 0.5]}>
                                <boxGeometry args={[0.4, 0.05, 0.05]} />
                                <meshStandardMaterial color={color} />
                            </mesh>
                        </React.Fragment>
                    ))}
                </group>
            </group>

            {isHostile && (
                <pointLight position={[0, 0.5, 0]} color="orange" intensity={1.5} distance={2} />
            )}
        </group>
    );
};
