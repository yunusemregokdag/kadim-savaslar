// ═══════════════════════════════════════════════════════════════════════════
// REAPER (AZRAİL/ÖLÜM MELEĞİ) SKILL EFFECTS
// Karanlık, ruh ve kan temalı pixel efektler (Siyah/Mor/Yeşil)
// ═══════════════════════════════════════════════════════════════════════════

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Instances, Instance } from '@react-three/drei';

// ═══════════════════════════════════════════════════════════════════════════
// SOUL PIXELS - Ruh parçacıkları
// ═══════════════════════════════════════════════════════════════════════════
const SoulPixels: React.FC<{
    position: [number, number, number];
    color?: string;
    count?: number;
    spread?: number;
    progress: number;
    rise?: boolean;
}> = ({ position, color = '#5500aa', count = 15, spread = 0.5, progress, rise = true }) => {
    const pixels = useMemo(() => {
        return Array.from({ length: count }).map(() => ({
            x: (Math.random() - 0.5) * spread,
            y: (Math.random() - 0.5) * spread,
            z: (Math.random() - 0.5) * spread * 2,
            size: 0.05 + Math.random() * 0.05,
            speed: 0.5 + Math.random(),
        }));
    }, [count, spread]);

    return (
        <group position={position}>
            <Instances range={count}>
                <boxGeometry args={[1, 1, 1]} />
                <meshBasicMaterial
                    color={color}
                    transparent
                    opacity={0.8 * (1 - progress)}
                    blending={THREE.AdditiveBlending}
                />
                {pixels.map((px, i) => (
                    <Instance
                        key={i}
                        position={[px.x, px.y + (rise ? progress * px.speed : 0), px.z]}
                        scale={[px.size, px.size, px.size]}
                    />
                ))}
            </Instances>
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 🪓 SCYTHE SLASH (Tırpan Biçişi) - Geniş Yarım Ay
// ═══════════════════════════════════════════════════════════════════════════
export const ScytheSlashEffect: React.FC<{
    position: [number, number, number];
    onComplete: () => void;
}> = ({ position, onComplete }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 400; // Fast slash
    const progressRef = useRef(0);

    useFrame(() => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;

        const scale = 1 + progress * 2;
        groupRef.current.scale.set(scale, scale, 1);
        // Swing rotation
        groupRef.current.rotation.z = -Math.PI / 4 + progress * Math.PI;

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={[position[0], 1, position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
            {/* Scythe Blade trail */}
            <mesh position={[1, 0, 0]}>
                <ringGeometry args={[1.5, 2, 32, 2, 0, Math.PI / 2]} />
                <meshBasicMaterial
                    color="#440055"
                    transparent
                    opacity={0.8 * (1 - progressRef.current)}
                    side={THREE.DoubleSide}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
            {/* Inner edge */}
            <mesh position={[1, 0, 0]}>
                <ringGeometry args={[1.5, 1.6, 32, 2, 0, Math.PI / 2]} />
                <meshBasicMaterial
                    color="#ffffff"
                    transparent
                    opacity={0.9 * (1 - progressRef.current)}
                    side={THREE.DoubleSide}
                />
            </mesh>
            <SoulPixels position={[1.5, 1, 0]} color="#8800ff" count={8} spread={1} progress={progressRef.current} rise={false} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 🌑 KARANLIK GEÇİT (Dark Passage) - Z Skill Shadow Form
// ═══════════════════════════════════════════════════════════════════════════
export const DarkPassageEffect: React.FC<{
    position: [number, number, number];
    onComplete: () => void;
    playerGroupRef?: React.MutableRefObject<THREE.Group | null>;
    followPlayer?: boolean;
}> = ({ position, onComplete, playerGroupRef, followPlayer = false }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 1500;
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

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={position}>
            {/* Shadow particles trailing */}
            {[0, 1, 2, 3, 4].map(i => (
                <mesh key={i} position={[
                    Math.sin(i + Date.now() * 0.01) * 0.5,
                    1 + Math.cos(i + Date.now() * 0.01) * 1,
                    Math.cos(i * 2) * 0.5
                ]}>
                    <boxGeometry args={[0.3, 0.3, 0.3]} />
                    <meshBasicMaterial
                        color="#110022"
                        transparent
                        opacity={0.6}
                    />
                </mesh>
            ))}
            {/* Fog on ground */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
                <ringGeometry args={[0.5, 1.5, 16]} />
                <meshBasicMaterial
                    color="#000000"
                    transparent
                    opacity={0.4 * (1 - progressRef.current) + 0.1}
                />
            </mesh>
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 🩸 1️⃣ ÖLÜM DOKUNUŞU (Death Touch) - DOT Mark
// ═══════════════════════════════════════════════════════════════════════════
export const DeathTouchEffect: React.FC<{
    position: [number, number, number];
    targetPosition?: [number, number, number];
    onComplete: () => void;
}> = ({ position, targetPosition, onComplete }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 5000; // Duration matches DOT
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
        <group ref={groupRef} position={[targetPos[0], 2, targetPos[2]]}>
            {/* Skull or Mark symbol pulsing */}
            <mesh scale={[0.5, 0.5, 0.5]} position={[0, Math.sin(Date.now() * 0.005) * 0.2, 0]}>
                <sphereGeometry args={[0.5, 8, 8]} />
                <meshBasicMaterial color="#550000" transparent opacity={0.8} wireframe />
            </mesh>
            <SoulPixels position={[0, -1, 0]} color="#ff0000" count={5} spread={0.5} progress={progressRef.current % 0.2 * 5} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 🩸 2️⃣ RUH HASADI (Soul Harvest / Lifesteal) - Düşmandan can çalma
// ═══════════════════════════════════════════════════════════════════════════
export const SoulHarvestEffect: React.FC<{
    position: [number, number, number];
    targetPosition?: [number, number, number];
    onComplete: () => void;
    playerGroupRef?: React.MutableRefObject<THREE.Group | null>;
}> = ({ position, targetPosition, onComplete, playerGroupRef }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 800;
    const progressRef = useRef(0);

    const targetPos = useMemo(() => targetPosition || position, [position, targetPosition]);

    useFrame(() => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;

        // Visuals travel from target to player
        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={targetPos}>
            {/* Drain lines */}
            {Array.from({ length: 5 }).map((_, i) => (
                <mesh key={i} position={[
                    (Math.random() - 0.5) * 2 * (1 - progressRef.current),
                    1 + Math.random(),
                    (Math.random() - 0.5) * 2 * (1 - progressRef.current)
                ]}>
                    <boxGeometry args={[0.05, 0.5, 0.05]} />
                    <meshBasicMaterial color="#00ff00" transparent opacity={1 - progressRef.current} />
                </mesh>
            ))}
            {/* Impact on target */}
            <mesh position={[0, 1, 0]} scale={[1 - progressRef.current, 1 - progressRef.current, 1 - progressRef.current]}>
                <sphereGeometry args={[0.8, 8, 8]} />
                <meshBasicMaterial color="#33ff33" transparent opacity={0.4} />
            </mesh>
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 🌫️ 3️⃣ KORKU (Fear) - Skull Shockwave
// ═══════════════════════════════════════════════════════════════════════════
export const FearEffect: React.FC<{
    position: [number, number, number];
    onComplete: () => void;
}> = ({ position, onComplete }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 1000;
    const progressRef = useRef(0);

    useFrame(() => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;

        const scale = 0.5 + progress * 8;
        groupRef.current.scale.set(scale, scale, scale);

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={[position[0], 1.5, position[2]]}>
            {/* Spooky face/skull representation */}
            <mesh rotation={[0, 0, 0]}>
                <sphereGeometry args={[0.5, 8, 8]} />
                <meshBasicMaterial
                    color="#440044"
                    transparent
                    opacity={0.8 * (1 - progressRef.current)}
                    wireframe
                />
            </mesh>
            <mesh>
                <sphereGeometry args={[0.3, 8, 8]} />
                <meshBasicMaterial color="#000000" />
            </mesh>
            {/* Screaming wave */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.8, 1.2, 16]} />
                <meshBasicMaterial
                    color="#880088"
                    transparent
                    opacity={0.5 * (1 - progressRef.current)}
                    side={THREE.DoubleSide}
                />
            </mesh>
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 💀 4️⃣ KIYAMET ÇAĞRISI (Apocalypse Call) - ULTI
// ═══════════════════════════════════════════════════════════════════════════
export const ApocalypseCallEffect: React.FC<{
    position: [number, number, number];
    onComplete: () => void;
}> = ({ position, onComplete }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 3000;
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
            {/* Ground fissures */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
                <ringGeometry args={[0, progressRef.current * 6, 32]} />
                <meshBasicMaterial
                    color="#110011"
                    transparent
                    opacity={0.8}
                />
            </mesh>
            {/* Rising Souls */}
            <SoulPixels position={[0, 0, 0]} color="#8800ff" count={40} spread={6} progress={progressRef.current} rise={true} />
            <SoulPixels position={[0, 0, 0]} color="#00ff00" count={20} spread={4} progress={progressRef.current} rise={true} />

            {/* Main Blast */}
            <mesh position={[0, 2, 0]} scale={[1 + progressRef.current * 4, 1 + progressRef.current * 4, 1 + progressRef.current * 4]}>
                <sphereGeometry args={[0.5, 16, 16]} />
                <meshBasicMaterial
                    color="#440044"
                    transparent
                    opacity={0.5 * (1 - progressRef.current)}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
            <pointLight color="#8800ff" intensity={5 * (1 - progressRef.current)} distance={10} position={[0, 3, 0]} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 🌑 GÖLGE PATLAMASI (Shadow Blast) - Karanlık alan hasarı
// ═══════════════════════════════════════════════════════════════════════════
export const ShadowBlastEffect: React.FC<{
    position: [number, number, number];
    onComplete: () => void;
}> = ({ position, onComplete }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 1200;
    const progressRef = useRef(0);
    const radius = 3;

    useFrame(() => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;

        // Expand
        groupRef.current.scale.setScalar(1 + progress * 2);

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={position}>
            {/* Dark core */}
            <mesh>
                <sphereGeometry args={[0.6, 16, 16]} />
                <meshBasicMaterial
                    color="#220022"
                    transparent
                    opacity={0.9 * (1 - progressRef.current)}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>

            {/* Shockwave ring */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
                <ringGeometry args={[0.2, radius, 32]} />
                <meshBasicMaterial
                    color="#aa00ff"
                    transparent
                    opacity={0.6 * (1 - progressRef.current)}
                    blending={THREE.AdditiveBlending}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Vertical dark pillar */}
            <mesh>
                <cylinderGeometry args={[0.3, 0.5, 2]} />
                <meshBasicMaterial
                    color="#550055"
                    transparent
                    opacity={0.5 * (1 - progressRef.current)}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>

            <SoulPixels position={[0, 0.5, 0]} color="#aa00ff" count={40} spread={radius} progress={progressRef.current} pixelSize={0.08} />
            <pointLight color="#aa00ff" intensity={6 * (1 - progressRef.current)} distance={radius + 2} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// ☠️ KIYAMET LANETİ (Doom) - DOT + İnfaz hasarı
// ═══════════════════════════════════════════════════════════════════════════
export const DoomEffect: React.FC<{
    position: [number, number, number];
    onComplete: () => void;
}> = ({ position, onComplete }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 5000;
    const progressRef = useRef(0);

    useFrame(() => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;

        // Pulse effect
        groupRef.current.rotation.y += 0.02;

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={position}>
            {/* Doom skull indicator */}
            <mesh position={[0, 2, 0]}>
                <sphereGeometry args={[0.4, 8, 8]} />
                <meshBasicMaterial
                    color="#550055"
                    transparent
                    opacity={0.7 + Math.sin(progressRef.current * 30) * 0.2}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>

            {/* Curse aura */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
                <ringGeometry args={[1, 1.5, 16]} />
                <meshBasicMaterial
                    color="#660066"
                    transparent
                    opacity={0.4 + Math.sin(progressRef.current * 20) * 0.2}
                    blending={THREE.AdditiveBlending}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* DOT particles */}
            <SoulPixels position={[0, 1, 0]} color="#880088" count={15} spread={1.5} progress={progressRef.current * 0.3} pixelSize={0.05} />

            {/* Execution flash at end */}
            {progressRef.current > 0.9 && (
                <mesh>
                    <sphereGeometry args={[2, 16, 16]} />
                    <meshBasicMaterial
                        color="#ff00ff"
                        transparent
                        opacity={(progressRef.current - 0.9) * 10}
                        blending={THREE.AdditiveBlending}
                    />
                </mesh>
            )}

            <pointLight color="#880088" intensity={2 + Math.sin(progressRef.current * 25) * 1} distance={4} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// REAPER SKILL MAP
// ═══════════════════════════════════════════════════════════════════════════
export const REAPER_EFFECTS: Record<string, React.FC<any>> = {
    // New keys
    scythe: ScytheSlashEffect,
    passage: DarkPassageEffect,
    death_touch: DeathTouchEffect,
    harvest: SoulHarvestEffect,
    fear: FearEffect,
    apocalypse: ApocalypseCallEffect,

    // Yeni efektler
    shadow_blast: ShadowBlastEffect,
    doom: DoomEffect,

    // Components/constants.ts mapping
    scythe_slash: ScytheSlashEffect,
    shroud: DarkPassageEffect,
    mark: DeathTouchEffect,
    lifesteal: SoulHarvestEffect,
    grim_fear: FearEffect,
    execution: ApocalypseCallEffect,

    // Root constants.ts mapping (yeni visual key'ler)
    reaper_slice: ScytheSlashEffect,
    reaper_soul_slice: DeathTouchEffect,
    reaper_wave: SoulHarvestEffect,
    reaper_spin: DarkPassageEffect,
    reaper_cross: FearEffect,

    // Additional mapping
    pull: SoulHarvestEffect,
    dark_passage: DarkPassageEffect,
    soul_harvest: SoulHarvestEffect,
    apocalypse_call: ApocalypseCallEffect,
    shadow: ShadowBlastEffect,
    curse: DoomEffect,
};

export default REAPER_EFFECTS;
