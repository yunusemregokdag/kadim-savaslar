// ═══════════════════════════════════════════════════════════════════════════
// WARRIOR SKILL EFFECTS - Kod ile oluşturulan particle/shader efektleri
// PNG'lere bağlı değil, tamamen Three.js ile dinamik
// ═══════════════════════════════════════════════════════════════════════════

import React, { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

// ═══════════════════════════════════════════════════════════════════════════
// SLASH EFFECT - Kılıç Darbesi (Kırmızı arc slash)
// ═══════════════════════════════════════════════════════════════════════════
export const SlashEffect: React.FC<{
    position: [number, number, number];
    onComplete: () => void;
    color?: string;
}> = ({ position, onComplete, color = '#ff4500' }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 400; // ms

    useFrame(() => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);

        // Scale up and fade out
        const scale = 1 + progress * 2;
        groupRef.current.scale.set(scale, scale, scale);

        // Rotate for slash motion
        groupRef.current.rotation.z = progress * Math.PI * 0.5;

        // Fade out
        groupRef.current.children.forEach(child => {
            if ((child as THREE.Mesh).material) {
                ((child as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = 1 - progress;
            }
        });

        if (progress >= 1) {
            onComplete();
        }
    });

    const arcGeometry = useMemo(() => {
        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.absarc(0, 0, 1.5, -Math.PI * 0.25, Math.PI * 0.25, false);
        shape.lineTo(0, 0);
        return new THREE.ShapeGeometry(shape, 32);
    }, []);

    return (
        <group ref={groupRef} position={position} rotation={[0, 0, 0]}>
            <mesh geometry={arcGeometry}>
                <meshBasicMaterial
                    color={color}
                    transparent
                    opacity={1}
                    side={THREE.DoubleSide}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
            {/* Glow effect */}
            <mesh geometry={arcGeometry} scale={[1.2, 1.2, 1]}>
                <meshBasicMaterial
                    color={color}
                    transparent
                    opacity={0.3}
                    side={THREE.DoubleSide}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// SHIELD EFFECT - Kalkan Duvarı (Mavi koruyucu dome)
// ═══════════════════════════════════════════════════════════════════════════
export const ShieldEffect: React.FC<{
    position: [number, number, number];
    onComplete: () => void;
    color?: string;
    duration?: number;
}> = ({ position, onComplete, color = '#3b82f6', duration = 3000 }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const startTime = useRef(Date.now());

    useFrame(() => {
        if (!meshRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = elapsed / duration;

        // Pulse effect
        const pulse = 1 + Math.sin(elapsed * 0.01) * 0.1;
        meshRef.current.scale.set(pulse, pulse, pulse);

        // Rotate slowly
        meshRef.current.rotation.y += 0.01;

        // Fade out at end
        if (progress > 0.8) {
            const fadeProgress = (progress - 0.8) / 0.2;
            (meshRef.current.material as THREE.MeshBasicMaterial).opacity = 0.5 * (1 - fadeProgress);
        }

        if (progress >= 1) {
            onComplete();
        }
    });

    return (
        <mesh ref={meshRef} position={position}>
            <sphereGeometry args={[1.5, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
            <meshBasicMaterial
                color={color}
                transparent
                opacity={0.5}
                side={THREE.DoubleSide}
                blending={THREE.AdditiveBlending}
                wireframe={false}
            />
        </mesh>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// RAGE BURST EFFECT - Öfke Patlaması (Kırmızı aura partikülleri)
// ═══════════════════════════════════════════════════════════════════════════
export const RageBurstEffect: React.FC<{
    position: [number, number, number];
    onComplete: () => void;
    color?: string;
}> = ({ position, onComplete, color = '#dc2626' }) => {
    const pointsRef = useRef<THREE.Points>(null);
    const startTime = useRef(Date.now());
    const duration = 800;

    const particles = useMemo(() => {
        const count = 50;
        const positions = new Float32Array(count * 3);
        const velocities: THREE.Vector3[] = [];

        for (let i = 0; i < count; i++) {
            positions[i * 3] = 0;
            positions[i * 3 + 1] = 0;
            positions[i * 3 + 2] = 0;

            // Random outward velocity
            velocities.push(new THREE.Vector3(
                (Math.random() - 0.5) * 4,
                Math.random() * 3,
                (Math.random() - 0.5) * 4
            ));
        }

        return { positions, velocities };
    }, []);

    useFrame(() => {
        if (!pointsRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);

        const posArray = pointsRef.current.geometry.attributes.position.array as Float32Array;

        for (let i = 0; i < particles.velocities.length; i++) {
            posArray[i * 3] += particles.velocities[i].x * 0.05;
            posArray[i * 3 + 1] += particles.velocities[i].y * 0.05;
            posArray[i * 3 + 2] += particles.velocities[i].z * 0.05;
        }

        pointsRef.current.geometry.attributes.position.needsUpdate = true;

        // Fade out
        (pointsRef.current.material as THREE.PointsMaterial).opacity = 1 - progress;

        if (progress >= 1) {
            onComplete();
        }
    });

    return (
        <points ref={pointsRef} position={position}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={particles.positions.length / 3}
                    array={particles.positions}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                color={color}
                size={0.2}
                transparent
                opacity={1}
                blending={THREE.AdditiveBlending}
                sizeAttenuation
            />
        </points>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// GROUND SLAM EFFECT - Yere Vurma (Şok dalgası)
// ═══════════════════════════════════════════════════════════════════════════
export const GroundSlamEffect: React.FC<{
    position: [number, number, number];
    onComplete: () => void;
    color?: string;
}> = ({ position, onComplete, color = '#fbbf24' }) => {
    const ringRef = useRef<THREE.Mesh>(null);
    const startTime = useRef(Date.now());
    const duration = 600;

    useFrame(() => {
        if (!ringRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);

        // Expand ring
        const scale = 1 + progress * 4;
        ringRef.current.scale.set(scale, scale, 1);

        // Fade out
        (ringRef.current.material as THREE.MeshBasicMaterial).opacity = 1 - progress;

        if (progress >= 1) {
            onComplete();
        }
    });

    return (
        <group position={[position[0], 0.1, position[2]]}>
            <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.8, 1, 32]} />
                <meshBasicMaterial
                    color={color}
                    transparent
                    opacity={1}
                    side={THREE.DoubleSide}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// SPEAR THROW EFFECT - Mızrak Atışı (Uçan mızrak)
// ═══════════════════════════════════════════════════════════════════════════
export const SpearThrowEffect: React.FC<{
    position: [number, number, number];
    targetPosition?: [number, number, number];
    onComplete: () => void;
    color?: string;
}> = ({ position, targetPosition = [position[0], position[1], position[2] + 5], onComplete, color = '#ef4444' }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 500;

    const direction = useMemo(() => {
        return new THREE.Vector3(
            targetPosition[0] - position[0],
            targetPosition[1] - position[1],
            targetPosition[2] - position[2]
        ).normalize();
    }, [position, targetPosition]);

    useFrame(() => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);

        // Move towards target
        groupRef.current.position.x = position[0] + direction.x * progress * 8;
        groupRef.current.position.y = position[1] + direction.y * progress * 8;
        groupRef.current.position.z = position[2] + direction.z * progress * 8;

        // Fade at end
        if (progress > 0.7) {
            groupRef.current.children.forEach(child => {
                if ((child as THREE.Mesh).material) {
                    ((child as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = 1 - (progress - 0.7) / 0.3;
                }
            });
        }

        if (progress >= 1) {
            onComplete();
        }
    });

    return (
        <group ref={groupRef} position={position} rotation={[0, Math.atan2(direction.x, direction.z), 0]}>
            {/* Spear body */}
            <mesh>
                <cylinderGeometry args={[0.05, 0.05, 2, 8]} />
                <meshBasicMaterial color={color} transparent opacity={1} />
            </mesh>
            {/* Spear tip */}
            <mesh position={[0, 1.1, 0]}>
                <coneGeometry args={[0.15, 0.4, 8]} />
                <meshBasicMaterial color={color} transparent opacity={1} />
            </mesh>
            {/* Trail */}
            <mesh position={[0, -0.5, 0]}>
                <cylinderGeometry args={[0.02, 0.1, 1, 8]} />
                <meshBasicMaterial
                    color={color}
                    transparent
                    opacity={0.5}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// WHIRLWIND EFFECT - Kıyım Ultimate (360° dönen kılıçlar)
// ═══════════════════════════════════════════════════════════════════════════
export const WhirlwindEffect: React.FC<{
    position: [number, number, number];
    onComplete: () => void;
    color?: string;
}> = ({ position, onComplete, color = '#dc2626' }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 2000;

    useFrame(() => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);

        // Spin fast
        groupRef.current.rotation.y += 0.3;

        // Fade out at end
        if (progress > 0.7) {
            const fade = 1 - (progress - 0.7) / 0.3;
            groupRef.current.children.forEach(child => {
                if ((child as THREE.Mesh).material) {
                    ((child as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = fade;
                }
            });
        }

        if (progress >= 1) {
            onComplete();
        }
    });

    // Create multiple blade slashes
    const blades = useMemo(() => {
        return [0, 1, 2, 3, 4, 5].map(i => ({
            rotation: (i / 6) * Math.PI * 2,
            offset: i * 0.1
        }));
    }, []);

    return (
        <group ref={groupRef} position={position}>
            {blades.map((blade, i) => (
                <mesh key={i} rotation={[0, blade.rotation, Math.PI * 0.1]} position={[0, 0.5 + blade.offset, 0]}>
                    <boxGeometry args={[2.5, 0.1, 0.02]} />
                    <meshBasicMaterial
                        color={color}
                        transparent
                        opacity={0.8}
                        blending={THREE.AdditiveBlending}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            ))}
            {/* Center glow */}
            <mesh>
                <sphereGeometry args={[0.5, 16, 16]} />
                <meshBasicMaterial
                    color={color}
                    transparent
                    opacity={0.3}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// WARRIOR SKILL MAP - Skill visual name -> Component
// ═══════════════════════════════════════════════════════════════════════════
export const WARRIOR_EFFECTS: Record<string, React.FC<any>> = {
    warrior_slash: SlashEffect,
    warrior_shield: ShieldEffect,
    warrior_charge: RageBurstEffect,
    warrior_judgement: GroundSlamEffect,
    warrior_pierce: SpearThrowEffect,
    warrior_whirlwind: WhirlwindEffect,
};

export default WARRIOR_EFFECTS;
