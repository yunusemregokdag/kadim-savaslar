// ═══════════════════════════════════════════════════════════════════════════
// WARRIOR SKILL EFFECTS - Kod ile oluşturulan particle/shader efektleri
// PNG'lere bağlı değil, tamamen Three.js ile dinamik
// ═══════════════════════════════════════════════════════════════════════════

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

// ═══════════════════════════════════════════════════════════════════════════
// SHINY PIXEL PARTICLES - Her skill için parlayan parçacıklar
// ═══════════════════════════════════════════════════════════════════════════
const ShinyPixels: React.FC<{
    position: [number, number, number];
    color: string;
    count?: number;
    spread?: number;
    progress: number;
}> = ({ position, color, count = 20, spread = 2, progress }) => {
    const pointsRef = useRef<THREE.Points>(null);

    const particles = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const sizes = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            // Random pixel positions in a sphere
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            const r = Math.random() * spread;

            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = r * Math.cos(phi);

            // Random sizes for pixel effect
            sizes[i] = 0.1 + Math.random() * 0.2;
        }

        return { positions, sizes };
    }, [count, spread]);

    useFrame(() => {
        if (!pointsRef.current) return;

        // Twinkle effect
        const time = Date.now() * 0.005;
        (pointsRef.current.material as THREE.PointsMaterial).opacity =
            0.5 + Math.sin(time) * 0.3 * (1 - progress);
    });

    return (
        <points ref={pointsRef} position={position}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={particles.positions}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                color={color}
                size={0.15}
                transparent
                opacity={1 - progress}
                blending={THREE.AdditiveBlending}
                sizeAttenuation
            />
        </points>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// SLASH EFFECT - Kılıç Darbesi (Kırmızı arc slash + shiny pixels)
// ═══════════════════════════════════════════════════════════════════════════
export const SlashEffect: React.FC<{
    position: [number, number, number];
    onComplete: () => void;
    color?: string;
}> = ({ position, onComplete, color = '#ff4500' }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 400;
    const progressRef = useRef(0);

    useFrame(() => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;

        // Scale up and fade out
        const scale = 1 + progress * 2;
        groupRef.current.scale.set(scale, scale, scale);

        // Rotate for slash motion
        groupRef.current.rotation.z = progress * Math.PI * 0.5;

        // Fade out
        groupRef.current.traverse((child) => {
            if ((child as THREE.Mesh).isMesh && (child as THREE.Mesh).material) {
                const mat = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
                if (mat.opacity !== undefined) mat.opacity = 1 - progress;
            }
        });

        if (progress >= 1) onComplete();
    });

    const arcGeometry = useMemo(() => {
        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.absarc(0, 0, 1.5, -Math.PI * 0.25, Math.PI * 0.25, false);
        shape.lineTo(0, 0);
        return new THREE.ShapeGeometry(shape, 32);
    }, []);

    return (
        <group ref={groupRef} position={position}>
            {/* Main slash arc */}
            <mesh geometry={arcGeometry}>
                <meshBasicMaterial
                    color={color}
                    transparent
                    opacity={1}
                    side={THREE.DoubleSide}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
            {/* Outer glow */}
            <mesh geometry={arcGeometry} scale={[1.3, 1.3, 1]}>
                <meshBasicMaterial
                    color={color}
                    transparent
                    opacity={0.4}
                    side={THREE.DoubleSide}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
            {/* Shiny pixels */}
            <ShinyPixels position={[0, 0, 0]} color="#ffffff" count={15} spread={1.5} progress={progressRef.current} />
            <ShinyPixels position={[0, 0, 0]} color={color} count={10} spread={1} progress={progressRef.current} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// SHIELD EFFECT - Kalkan Duvarı (Mavi koruyucu dome + shiny)
// ═══════════════════════════════════════════════════════════════════════════
export const ShieldEffect: React.FC<{
    position: [number, number, number];
    onComplete: () => void;
    color?: string;
    duration?: number;
}> = ({ position, onComplete, color = '#3b82f6', duration = 3000 }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const startTime = useRef(Date.now());
    const progressRef = useRef(0);

    useFrame(() => {
        if (!meshRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = elapsed / duration;
        progressRef.current = progress;

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

        if (progress >= 1) onComplete();
    });

    return (
        <group position={position}>
            <mesh ref={meshRef}>
                <sphereGeometry args={[1.5, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
                <meshBasicMaterial
                    color={color}
                    transparent
                    opacity={0.5}
                    side={THREE.DoubleSide}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
            {/* Shiny protection particles */}
            <ShinyPixels position={[0, 0.5, 0]} color="#ffffff" count={30} spread={1.8} progress={progressRef.current} />
            <ShinyPixels position={[0, 0.5, 0]} color={color} count={20} spread={1.5} progress={progressRef.current} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// RAGE BURST EFFECT - Öfke Patlaması (Kırmızı aura + shiny explosions)
// ═══════════════════════════════════════════════════════════════════════════
export const RageBurstEffect: React.FC<{
    position: [number, number, number];
    onComplete: () => void;
    color?: string;
}> = ({ position, onComplete, color = '#dc2626' }) => {
    const pointsRef = useRef<THREE.Points>(null);
    const startTime = useRef(Date.now());
    const duration = 800;
    const progressRef = useRef(0);

    const particles = useMemo(() => {
        const count = 60;
        const positions = new Float32Array(count * 3);
        const velocities: THREE.Vector3[] = [];

        for (let i = 0; i < count; i++) {
            positions[i * 3] = 0;
            positions[i * 3 + 1] = 0;
            positions[i * 3 + 2] = 0;

            velocities.push(new THREE.Vector3(
                (Math.random() - 0.5) * 5,
                Math.random() * 4,
                (Math.random() - 0.5) * 5
            ));
        }

        return { positions, velocities };
    }, []);

    useFrame(() => {
        if (!pointsRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;

        const posArray = pointsRef.current.geometry.attributes.position.array as Float32Array;

        for (let i = 0; i < particles.velocities.length; i++) {
            posArray[i * 3] += particles.velocities[i].x * 0.06;
            posArray[i * 3 + 1] += particles.velocities[i].y * 0.06;
            posArray[i * 3 + 2] += particles.velocities[i].z * 0.06;
        }

        pointsRef.current.geometry.attributes.position.needsUpdate = true;
        (pointsRef.current.material as THREE.PointsMaterial).opacity = 1 - progress;

        if (progress >= 1) onComplete();
    });

    return (
        <group position={position}>
            <points ref={pointsRef}>
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
                    size={0.25}
                    transparent
                    opacity={1}
                    blending={THREE.AdditiveBlending}
                    sizeAttenuation
                />
            </points>
            {/* White shiny core */}
            <ShinyPixels position={[0, 0.5, 0]} color="#ffffff" count={25} spread={1} progress={progressRef.current} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// GROUND SLAM EFFECT - Yere Vurma (Şok dalgası + pixel debris)
// ═══════════════════════════════════════════════════════════════════════════
export const GroundSlamEffect: React.FC<{
    position: [number, number, number];
    onComplete: () => void;
    color?: string;
}> = ({ position, onComplete, color = '#fbbf24' }) => {
    const ringRef = useRef<THREE.Mesh>(null);
    const startTime = useRef(Date.now());
    const duration = 600;
    const progressRef = useRef(0);

    useFrame(() => {
        if (!ringRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;

        const scale = 1 + progress * 5;
        ringRef.current.scale.set(scale, scale, 1);
        (ringRef.current.material as THREE.MeshBasicMaterial).opacity = 1 - progress;

        if (progress >= 1) onComplete();
    });

    return (
        <group position={[position[0], 0.1, position[2]]}>
            {/* Main shockwave ring */}
            <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.8, 1.2, 32]} />
                <meshBasicMaterial
                    color={color}
                    transparent
                    opacity={1}
                    side={THREE.DoubleSide}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
            {/* Inner ring */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} scale={[0.7, 0.7, 1]}>
                <ringGeometry args={[0.5, 0.8, 32]} />
                <meshBasicMaterial
                    color="#ffffff"
                    transparent
                    opacity={0.8}
                    side={THREE.DoubleSide}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
            {/* Ground debris pixels */}
            <ShinyPixels position={[0, 0.3, 0]} color={color} count={30} spread={2} progress={progressRef.current} />
            <ShinyPixels position={[0, 0.2, 0]} color="#8b4513" count={15} spread={1.5} progress={progressRef.current} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// SPEAR THROW EFFECT - Mızrak Atışı (Uçan mızrak + trail pixels)
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
    const progressRef = useRef(0);

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
        progressRef.current = progress;

        groupRef.current.position.x = position[0] + direction.x * progress * 10;
        groupRef.current.position.y = position[1] + direction.y * progress * 10 + 1;
        groupRef.current.position.z = position[2] + direction.z * progress * 10;

        // Spin spear
        groupRef.current.rotation.x += 0.2;

        if (progress > 0.8) {
            groupRef.current.traverse((child) => {
                if ((child as THREE.Mesh).isMesh && (child as THREE.Mesh).material) {
                    ((child as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = 1 - (progress - 0.8) / 0.2;
                }
            });
        }

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={position} rotation={[Math.PI / 2, 0, Math.atan2(direction.x, direction.z)]}>
            {/* Spear body */}
            <mesh>
                <cylinderGeometry args={[0.06, 0.06, 2.5, 8]} />
                <meshBasicMaterial color={color} transparent opacity={1} />
            </mesh>
            {/* Spear tip - glowing */}
            <mesh position={[0, 1.4, 0]}>
                <coneGeometry args={[0.18, 0.5, 8]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={1} blending={THREE.AdditiveBlending} />
            </mesh>
            {/* Trail glow */}
            <mesh position={[0, -0.8, 0]}>
                <cylinderGeometry args={[0.02, 0.15, 1.5, 8]} />
                <meshBasicMaterial
                    color={color}
                    transparent
                    opacity={0.6}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
            {/* Shiny trail particles */}
            <ShinyPixels position={[0, -1, 0]} color={color} count={20} spread={0.5} progress={progressRef.current} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// WHIRLWIND EFFECT - Kıyım Ultimate (360° dönen kılıçlar + karakter dönüşü)
// ═══════════════════════════════════════════════════════════════════════════
export const WhirlwindEffect: React.FC<{
    position: [number, number, number];
    onComplete: () => void;
    onCharacterRotate?: (rotation: number) => void;
    color?: string;
}> = ({ position, onComplete, onCharacterRotate, color = '#dc2626' }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 2000;
    const progressRef = useRef(0);
    const totalRotation = useRef(0);

    useFrame(() => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;

        // Spin effect - very fast
        const spinSpeed = 0.35;
        groupRef.current.rotation.y += spinSpeed;
        totalRotation.current += spinSpeed;

        // Tell parent to rotate character 360 degrees
        if (onCharacterRotate) {
            onCharacterRotate(totalRotation.current);
        }

        // Scale up then down
        const scalePhase = progress < 0.2 ? progress / 0.2 : 1;
        const scale = 1 + scalePhase * 0.5;
        groupRef.current.scale.set(scale, scale, scale);

        // Fade out at end
        if (progress > 0.7) {
            const fade = 1 - (progress - 0.7) / 0.3;
            groupRef.current.traverse((child) => {
                if ((child as THREE.Mesh).isMesh && (child as THREE.Mesh).material) {
                    ((child as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = fade * 0.8;
                }
            });
        }

        if (progress >= 1) onComplete();
    });

    // Create blade slashes in a circle
    const blades = useMemo(() => {
        return [0, 1, 2, 3, 4, 5, 6, 7].map(i => ({
            rotation: (i / 8) * Math.PI * 2,
            offset: (i % 2) * 0.15
        }));
    }, []);

    return (
        <group ref={groupRef} position={position}>
            {/* Spinning blades */}
            {blades.map((blade, i) => (
                <mesh key={i} rotation={[0, blade.rotation, Math.PI * 0.15]} position={[0, 0.6 + blade.offset, 0]}>
                    <boxGeometry args={[3, 0.12, 0.02]} />
                    <meshBasicMaterial
                        color={color}
                        transparent
                        opacity={0.9}
                        blending={THREE.AdditiveBlending}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            ))}

            {/* Center energy core */}
            <mesh>
                <sphereGeometry args={[0.6, 16, 16]} />
                <meshBasicMaterial
                    color="#ffffff"
                    transparent
                    opacity={0.5}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>

            {/* Outer glow ring */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[2.5, 3, 32]} />
                <meshBasicMaterial
                    color={color}
                    transparent
                    opacity={0.3}
                    blending={THREE.AdditiveBlending}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Massive shiny particle explosion */}
            <ShinyPixels position={[0, 0.5, 0]} color="#ffffff" count={50} spread={3} progress={progressRef.current} />
            <ShinyPixels position={[0, 0.5, 0]} color={color} count={40} spread={2.5} progress={progressRef.current} />
            <ShinyPixels position={[0, 1, 0]} color="#ffd700" count={30} spread={2} progress={progressRef.current} />
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
