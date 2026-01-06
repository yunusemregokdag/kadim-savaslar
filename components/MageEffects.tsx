// ═══════════════════════════════════════════════════════════════════════════
// MAGE (ULU BÜYÜCÜ) SKILL EFFECTS
// Arcane/Purple temalı pixel büyü efektleri (Saf Büyü Hasarı)
// ═══════════════════════════════════════════════════════════════════════════

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Instances, Instance } from '@react-three/drei';

// ═══════════════════════════════════════════════════════════════════════════
// ARCANE PIXELS - Mor parıltılar
// ═══════════════════════════════════════════════════════════════════════════
const ArcanePixels: React.FC<{
    position: [number, number, number];
    color?: string;
    count?: number;
    spread?: number;
    progress: number;
    pixelSize?: number;
}> = ({ position, color = '#aa66ff', count = 20, spread = 0.5, progress, pixelSize = 0.05 }) => {
    const pixels = useMemo(() => {
        return Array.from({ length: count }).map(() => ({
            x: (Math.random() - 0.5) * spread,
            y: (Math.random() - 0.5) * spread,
            z: (Math.random() - 0.5) * spread * 2,
            size: pixelSize + Math.random() * pixelSize,
            isBright: Math.random() > 0.7,
        }));
    }, [count, spread, pixelSize]);

    return (
        <group position={position}>
            <Instances range={count}>
                <boxGeometry args={[1, 1, 1]} />
                <meshBasicMaterial
                    color="#ffffff"
                    transparent
                    opacity={0.8 * (1 - progress)}
                    blending={THREE.AdditiveBlending}
                />
                {pixels.map((px, i) => (
                    <Instance
                        key={i}
                        position={[px.x, px.y, px.z]}
                        scale={[px.size, px.size, px.size]}
                        color={px.isBright ? '#ffffff' : color}
                    />
                ))}
            </Instances>
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 🖱️ ARCANE BOLT & ORB (Basic & Skill 1) - Mor küre atışı
// ═══════════════════════════════════════════════════════════════════════════
export const ArcaneOrbEffect: React.FC<{
    position: [number, number, number];
    targetPosition?: [number, number, number];
    onComplete: () => void;
    isBasic?: boolean; // Basic attack ise daha küçük
}> = ({ position, targetPosition, onComplete, isBasic = false }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 600;
    const progressRef = useRef(0);

    const direction = useMemo(() => {
        if (targetPosition) {
            return new THREE.Vector3(
                targetPosition[0] - position[0],
                0,
                targetPosition[2] - position[2]
            ).normalize();
        }
        return new THREE.Vector3(0, 0, 1);
    }, [position, targetPosition]);

    useFrame(() => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;

        const distance = progress * (isBasic ? 20 : 18);
        groupRef.current.position.set(
            position[0] + direction.x * distance,
            position[1] + 0.8,
            position[2] + direction.z * distance
        );

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={position}>
            {/* Core Orb */}
            <mesh>
                <sphereGeometry args={[isBasic ? 0.2 : 0.5, 12, 12]} />
                <meshStandardMaterial
                    color="#9966ff"
                    emissive="#5522aa"
                    emissiveIntensity={2}
                    transparent
                    opacity={0.9}
                />
            </mesh>
            {/* Outer Glow Ring */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[isBasic ? 0.2 : 0.5, isBasic ? 0.3 : 0.7, 16]} />
                <meshBasicMaterial
                    color="#aa66ff"
                    transparent
                    opacity={0.6}
                    blending={THREE.AdditiveBlending}
                    side={THREE.DoubleSide}
                />
            </mesh>
            <ArcanePixels position={[0, 0, 0]} color="#aa66ff" count={isBasic ? 5 : 15} spread={0.4} progress={progressRef.current} />
            <pointLight color="#aa66ff" intensity={isBasic ? 2 : 4} distance={3} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// ⏳ 2️⃣ ZAMAN BÜKÜLMESİ (Time Warp) - Buff Aurası
// ═══════════════════════════════════════════════════════════════════════════
export const TimeWarpEffect: React.FC<{
    position: [number, number, number];
    onComplete: () => void;
    playerGroupRef?: React.MutableRefObject<THREE.Group | null>;
    followPlayer?: boolean;
}> = ({ position, onComplete, playerGroupRef, followPlayer = false }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 2000;
    const progressRef = useRef(0);

    useFrame((state) => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;

        if (followPlayer && playerGroupRef?.current) {
            const pos = new THREE.Vector3();
            playerGroupRef.current.getWorldPosition(pos);
            groupRef.current.position.set(pos.x, pos.y, pos.z);
        }

        // Rotate like a clock
        groupRef.current.rotation.y = -state.clock.elapsedTime * 2;

        if (progress > 0.8) {
            groupRef.current.scale.multiplyScalar(0.95);
        }

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={position}>
            {/* Clock-like rings */}
            {[0, 1].map(i => (
                <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1 + i * 0.1, 0]}>
                    <ringGeometry args={[1.0 + i * 0.2, 1.1 + i * 0.2, 32]} />
                    <meshBasicMaterial
                        color={i === 0 ? '#66ccff' : '#ffffff'}
                        transparent
                        opacity={0.5}
                        blending={THREE.AdditiveBlending}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            ))}
            {/* Hourglass shape particles */}
            <ArcanePixels position={[0, 1, 0]} color="#66ccff" count={30} spread={1} progress={progressRef.current * 0.5} />
            <pointLight color="#66ccff" intensity={3} distance={4} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 🐑 3️⃣ POLİMORF (Polymorph) - Dönüştürme Poof Efekti
// ═══════════════════════════════════════════════════════════════════════════
export const PolymorphEffect: React.FC<{
    position: [number, number, number];
    targetPosition?: [number, number, number];
    onComplete: () => void;
}> = ({ position, targetPosition, onComplete }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 1000;
    const progressRef = useRef(0);

    const targetPos = useMemo(() => targetPosition || position, [position, targetPosition]);

    useFrame(() => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={[targetPos[0], 1, targetPos[2]]}>
            <mesh scale={[1 + progressRef.current * 2, 1 + progressRef.current * 2, 1 + progressRef.current * 2]}>
                <sphereGeometry args={[0.5, 16, 16]} />
                <meshBasicMaterial
                    color="#ff66cc"
                    transparent
                    opacity={0.8 * (1 - progressRef.current)}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
            <ArcanePixels position={[0, 0, 0]} color="#ffddff" count={40} spread={1.5} progress={progressRef.current} />
            <pointLight color="#ff66cc" intensity={5 * (1 - progressRef.current)} distance={3} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 🌠 4️⃣ YILDIZ YAĞMURU (Star Rain) - Düşen yıldızlar
// ═══════════════════════════════════════════════════════════════════════════
export const StarRainEffect: React.FC<{
    position: [number, number, number];
    onComplete: () => void;
}> = ({ position, onComplete }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 2000;
    const progressRef = useRef(0);

    const stars = useMemo(() => {
        return Array.from({ length: 15 }).map((_, i) => ({
            x: (Math.random() - 0.5) * 6,
            z: (Math.random() - 0.5) * 6,
            delay: i * 100,
            speed: 0.2 + Math.random() * 0.2
        }));
    }, []);

    useFrame(() => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={position}>
            {stars.map((star, i) => {
                const age = Date.now() - startTime.current - star.delay;
                if (age < 0) return null;
                const dropProgress = Math.min(age / 500, 1);
                const y = 6 - dropProgress * 6;

                if (y <= 0) return null; // Hit ground

                return (
                    <mesh key={i} position={[star.x, y, star.z]}>
                        <sphereGeometry args={[0.25, 8, 8]} />
                        <meshBasicMaterial color="#ffffaa" />
                        <pointLight color="#ffffaa" intensity={1} distance={2} />
                    </mesh>
                );
            })}
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 💥 5️⃣ MANA PATLAMASI (Mana Explosion) - AOE
// ═══════════════════════════════════════════════════════════════════════════
export const ManaExplosionEffect: React.FC<{
    position: [number, number, number];
    onComplete: () => void;
}> = ({ position, onComplete }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 800;
    const progressRef = useRef(0);

    useFrame(() => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;

        const scale = 0.5 + progress * 7; // Expands to 4 radius (diameter 8 approx)
        groupRef.current.scale.set(scale, scale, 1);

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={[position[0], 0.2, position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
            <mesh>
                <ringGeometry args={[0.5, 0.8, 32]} />
                <meshBasicMaterial
                    color="#66ccff"
                    transparent
                    opacity={0.8 * (1 - progressRef.current)}
                    side={THREE.DoubleSide}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
            <mesh position={[0, 0, 0.1]}>
                <ringGeometry args={[0.2, 0.4, 32]} />
                <meshBasicMaterial
                    color="#ffffff"
                    transparent
                    opacity={0.9 * (1 - progressRef.current)}
                    side={THREE.DoubleSide}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// ☄️ 6️⃣ KIYAMET (Apocalypse) - ULTI
// ═══════════════════════════════════════════════════════════════════════════
export const ApocalypseEffect: React.FC<{
    position: [number, number, number];
    onComplete: () => void;
}> = ({ position, onComplete }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 2000;
    const progressRef = useRef(0);

    useFrame(() => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={position}>
            {/* Huge Dome */}
            <mesh>
                <sphereGeometry args={[10, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshBasicMaterial
                    color="#9933ff"
                    transparent
                    opacity={0.3 * (1 - progressRef.current)}
                    side={THREE.DoubleSide}
                    blending={THREE.AdditiveBlending}
                // wireframe // Optional wireframe look
                />
            </mesh>
            {/* Inner Core */}
            <mesh scale={[0.5 + Math.sin(progressRef.current * 10) * 0.1, 1, 0.5 + Math.sin(progressRef.current * 10) * 0.1]}>
                <cylinderGeometry args={[2, 2, 20]} />
                <meshBasicMaterial
                    color="#5500aa"
                    transparent
                    opacity={0.5 * (1 - progressRef.current)}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
            <ArcanePixels position={[0, 5, 0]} color="#aa66ff" count={100} spread={8} progress={progressRef.current * 0.5} pixelSize={0.2} />
            <pointLight color="#9933ff" intensity={10 * (1 - progressRef.current)} distance={20} />
        </group>
    );
};


// ═══════════════════════════════════════════════════════════════════════════
// MAGE SKILL MAP
// ═══════════════════════════════════════════════════════════════════════════
export const MAGE_EFFECTS: Record<string, React.FC<any>> = {
    // New keys
    arcane_orb: ArcaneOrbEffect,
    time_warp: TimeWarpEffect,
    polymorph: PolymorphEffect,
    star_rain: StarRainEffect,
    mana_explosion: ManaExplosionEffect,
    apocalypse: ApocalypseEffect,

    // Legacy/Constants keys (Mapping to provided constants.ts archmage skills)
    // m1 Fireball -> Arcane Orb
    fireball: ArcaneOrbEffect,
    // m2 Iceblock -> Time Warp (Buff style)
    iceblock: TimeWarpEffect,
    // m3 Teleport -> Polymorph (maybe?) or just let teleport be
    teleport: TimeWarpEffect, // Reusing time warp effect as a placeholder for teleport buff
    // m4 Lightning -> Polymorph?
    lightning: PolymorphEffect,
    // m5 Meteor -> Star Rain
    meteor: StarRainEffect,
    // m6 Drain -> Mana Explosion
    drain: ManaExplosionEffect,
    // m7 Blackhole -> Apocalypse
    blackhole: ApocalypseEffect,

    // Extra user keys
    orb: ArcaneOrbEffect,
    time: TimeWarpEffect,
    poly: PolymorphEffect,
    rain: StarRainEffect,
    explode: ManaExplosionEffect,
    apoc: ApocalypseEffect,
};

export default MAGE_EFFECTS;
