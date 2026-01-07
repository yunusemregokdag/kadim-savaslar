// ═══════════════════════════════════════════════════════════════════════════
// MARTIAL ARTIST (DÖVÜŞ USTASI) SKILL EFFECTS
// Ki enerji, yumruk ve tekme pixel efektleri
// ═══════════════════════════════════════════════════════════════════════════

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Instances, Instance } from '@react-three/drei';

// ═══════════════════════════════════════════════════════════════════════════
// 🟠 KI PARTICLE - Yeniden kullanılabilir enerji küpü
// ═══════════════════════════════════════════════════════════════════════════
const KiParticle: React.FC<{
    position: [number, number, number];
    rotation?: [number, number, number];
    scale?: number;
    color: string;
    opacity?: number;
}> = ({ position, rotation = [0, 0, 0], scale = 1, color, opacity = 0.95 }) => {
    return (
        <mesh position={position} rotation={rotation} scale={[scale, scale, scale]}>
            <boxGeometry args={[0.18, 0.18, 0.18]} />
            <meshBasicMaterial
                color={color}
                transparent
                opacity={opacity}
                blending={THREE.AdditiveBlending}
            />
        </mesh>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// KI PIXELS - Enerji parçacıkları
// ═══════════════════════════════════════════════════════════════════════════
const KiPixels: React.FC<{
    position: [number, number, number];
    color?: string;
    count?: number;
    spread?: number;
    progress: number;
}> = ({ position, color = '#ffaa33', count = 12, spread = 0.5, progress }) => {
    const pixels = useMemo(() => {
        return Array.from({ length: count }).map(() => ({
            x: (Math.random() - 0.5) * spread,
            y: (Math.random() - 0.5) * spread,
            z: (Math.random() - 0.5) * spread * 2,
            size: 0.05 + Math.random() * 0.05,
        }));
    }, [count, spread]);

    return (
        <group position={position}>
            <Instances range={count}>
                <boxGeometry args={[1, 1, 1]} />
                <meshBasicMaterial
                    color={color}
                    transparent
                    opacity={0.9 * (1 - progress)}
                    blending={THREE.AdditiveBlending}
                />
                {pixels.map((px, i) => (
                    <Instance
                        key={i}
                        position={[px.x, px.y, px.z]}
                        scale={[px.size, px.size, px.size]}
                    />
                ))}
            </Instances>
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 🥊 SKILL 1 – HIZLI YUMRUK (Rapid Punch) - Basic Combo
// ═══════════════════════════════════════════════════════════════════════════
export const RapidPunchEffect: React.FC<{
    position: [number, number, number];
    targetPosition?: [number, number, number];
    onComplete: () => void;
}> = ({ position, targetPosition, onComplete }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 400;
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

        // Hızlı hareket
        const distance = progress * 10;
        groupRef.current.position.set(
            position[0] + direction.x * distance,
            position[1] + 0.8,
            position[2] + direction.z * distance
        );

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={position}>
            <KiParticle position={[0, 0, 0]} color="#ffcc66" scale={1.3} opacity={1 - progressRef.current} />
            <KiParticle position={[0.1, 0, 0.1]} color="#ffaa33" scale={0.9} opacity={(1 - progressRef.current) * 0.7} />
            <KiPixels position={[0, 0, 0]} color="#ff9933" count={6} spread={0.3} progress={progressRef.current} />
            <pointLight color="#ffcc66" intensity={2 * (1 - progressRef.current)} distance={2} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 🦵 SKILL 2 – DÖNER TEKME (Spin Kick)
// ═══════════════════════════════════════════════════════════════════════════
export const SpinKickEffect: React.FC<{
    position: [number, number, number];
    onComplete: () => void;
    playerGroupRef?: React.MutableRefObject<THREE.Group | null>;
    followPlayer?: boolean;
}> = ({ position, onComplete, playerGroupRef, followPlayer = false }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 800;
    const progressRef = useRef(0);
    const arcCount = 10;

    useFrame(() => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;

        if (followPlayer && playerGroupRef?.current) {
            groupRef.current.position.copy(playerGroupRef.current.position);
        }

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={position}>
            {Array.from({ length: arcCount }).map((_, i) => {
                const angle = progressRef.current * 8 + i * 0.3;
                return (
                    <KiParticle
                        key={i}
                        position={[
                            Math.cos(angle) * 1.2,
                            0.6,
                            Math.sin(angle) * 1.2
                        ]}
                        color="#ff9933"
                        opacity={0.9 * (1 - progressRef.current * 0.5)}
                        scale={1}
                    />
                );
            })}
            <pointLight color="#ff9933" intensity={2} distance={3} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 💥 SKILL 3 – KI PATLAMASI (Ki Burst)
// ═══════════════════════════════════════════════════════════════════════════
export const KiBurstEffect: React.FC<{
    position: [number, number, number];
    targetPosition?: [number, number, number];
    onComplete: () => void;
}> = ({ position, targetPosition, onComplete }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 600;
    const progressRef = useRef(0);
    const shardCount = 20;

    const spawnPos = targetPosition || position;

    const shards = useMemo(() => {
        return Array.from({ length: shardCount }).map(() => ({
            dir: Math.random() * Math.PI * 2,
        }));
    }, [shardCount]);

    useFrame(() => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={spawnPos}>
            {shards.map((shard, i) => {
                const dist = progressRef.current * 3;
                return (
                    <KiParticle
                        key={i}
                        position={[
                            Math.cos(shard.dir) * dist,
                            0.5,
                            Math.sin(shard.dir) * dist
                        ]}
                        color="#ff7722"
                        opacity={1 - progressRef.current}
                        scale={0.9}
                    />
                );
            })}
            <pointLight color="#ff7722" intensity={5 * (1 - progressRef.current)} distance={4} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 🛡️ SKILL 4 – DEMİR DURUŞ (Iron Stance) - Defans
// ═══════════════════════════════════════════════════════════════════════════
export const IronStanceEffect: React.FC<{
    position: [number, number, number];
    onComplete: () => void;
    playerGroupRef?: React.MutableRefObject<THREE.Group | null>;
    followPlayer?: boolean;
}> = ({ position, onComplete, playerGroupRef, followPlayer = false }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 4000;
    const progressRef = useRef(0);
    const guardCount = 8;

    useFrame(() => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;

        if (followPlayer && playerGroupRef?.current) {
            groupRef.current.position.copy(playerGroupRef.current.position);
        }

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={position}>
            {Array.from({ length: guardCount }).map((_, i) => {
                const t = progressRef.current * 3;
                return (
                    <KiParticle
                        key={i}
                        position={[
                            Math.sin(t + i) * 0.6,
                            0.4 + Math.cos(t + i) * 0.2,
                            Math.cos(t + i) * 0.6
                        ]}
                        color="#ffddaa"
                        opacity={0.9 * (1 - progressRef.current * 0.3)}
                        scale={1.2}
                    />
                );
            })}
            <pointLight color="#ffddaa" intensity={2} distance={2} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// ⚡ SKILL 5 – GÖLGE ADIMI (Shadow Dash)
// ═══════════════════════════════════════════════════════════════════════════
export const ShadowDashEffect: React.FC<{
    position: [number, number, number];
    onComplete: () => void;
}> = ({ position, onComplete }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 500;
    const progressRef = useRef(0);
    const trailCount = 12;

    useFrame(() => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={position}>
            {Array.from({ length: trailCount }).map((_, i) => (
                <KiParticle
                    key={i}
                    position={[
                        0,
                        i * 0.08,
                        -i * 0.15
                    ]}
                    color="#ff8844"
                    opacity={(1 - progressRef.current) * (1 - i / trailCount)}
                    scale={0.9}
                />
            ))}
            <pointLight color="#ff8844" intensity={3 * (1 - progressRef.current)} distance={3} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 🔥 SKILL 6 – EJDER YUMRUĞU (Dragon Fist) - ULTİ
// ═══════════════════════════════════════════════════════════════════════════
export const DragonFistEffect: React.FC<{
    position: [number, number, number];
    onComplete: () => void;
    playerGroupRef?: React.MutableRefObject<THREE.Group | null>;
    followPlayer?: boolean;
}> = ({ position, onComplete, playerGroupRef, followPlayer = false }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 6000;
    const progressRef = useRef(0);
    const waveCount = 25;

    useFrame(() => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;

        if (followPlayer && playerGroupRef?.current) {
            groupRef.current.position.copy(playerGroupRef.current.position);
        }

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={position}>
            {Array.from({ length: waveCount }).map((_, i) => {
                const t = progressRef.current * 3;
                const angle = i + t;
                return (
                    <KiParticle
                        key={i}
                        position={[
                            Math.sin(angle) * 1.8,
                            i * 0.1 + progressRef.current,
                            Math.cos(angle) * 1.8
                        ]}
                        color="#ff5500"
                        opacity={(1 - progressRef.current * 0.4) * 0.9}
                        scale={1.1}
                    />
                );
            })}

            {/* Merkez enerji */}
            <mesh position={[0, progressRef.current * 2, 0]}>
                <sphereGeometry args={[0.4 + progressRef.current * 0.3, 8, 8]} />
                <meshBasicMaterial
                    color="#ff6600"
                    transparent
                    opacity={0.7 * (1 - progressRef.current * 0.5)}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>

            <pointLight color="#ff5500" intensity={6} distance={8} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// ESKI EFEKTLER (backward compatibility aliases)
// ═══════════════════════════════════════════════════════════════════════════

// FlyingKickEffect = SpinKickEffect
export const FlyingKickEffect = SpinKickEffect;

// ComboFuryEffect = RapidPunchEffect variant
export const ComboFuryEffect: React.FC<{
    position: [number, number, number];
    targetPosition?: [number, number, number];
    onComplete: () => void;
}> = ({ position, targetPosition, onComplete }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 600;
    const progressRef = useRef(0);
    const hitCount = 5;

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

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={position}>
            {Array.from({ length: hitCount }).map((_, i) => {
                const hitProgress = Math.max(0, progressRef.current * hitCount - i);
                const dist = Math.min(hitProgress, 1) * 8;
                return (
                    <KiParticle
                        key={i}
                        position={[
                            direction.x * dist + (Math.random() - 0.5) * 0.3,
                            0.8 + i * 0.1,
                            direction.z * dist + (Math.random() - 0.5) * 0.3
                        ]}
                        color="#ffaa00"
                        opacity={hitProgress > 0 && hitProgress < 1.5 ? 0.9 : 0}
                        scale={1.2}
                    />
                );
            })}
            <pointLight color="#ffaa00" intensity={3} distance={3} />
        </group>
    );
};

// MeditationEffect = IronStanceEffect
export const MeditationEffect = IronStanceEffect;

// ChiBlastEffect = KiBurstEffect
export const ChiBlastEffect = KiBurstEffect;

// UltimateStrikeEffect = DragonFistEffect
export const UltimateStrikeEffect = DragonFistEffect;

// ═══════════════════════════════════════════════════════════════════════════
// MARTIAL ARTIST SKILL MAP
// ═══════════════════════════════════════════════════════════════════════════
export const MARTIAL_ARTIST_EFFECTS: Record<string, React.FC<any>> = {
    // Yeni Ki enerji efektleri
    rapid_punch: RapidPunchEffect,
    spin_kick: SpinKickEffect,
    ki_burst: KiBurstEffect,
    iron_stance: IronStanceEffect,
    shadow_dash: ShadowDashEffect,
    dragon_fist: DragonFistEffect,

    // Eski key'ler (backward compat)
    flying_kick: FlyingKickEffect,
    combo_fury: ComboFuryEffect,
    meditation: MeditationEffect,
    chi_blast: ChiBlastEffect,
    ultimate_strike: UltimateStrikeEffect,

    // Components/constants.ts keys
    punch: RapidPunchEffect,
    kick: SpinKickEffect,
    burst: KiBurstEffect,
    stance: IronStanceEffect,
    dash: ShadowDashEffect,
    dragon: DragonFistEffect,

    // Root constants.ts visual keys
    martial_punch: RapidPunchEffect,
    martial_kick: SpinKickEffect,
    martial_ki: KiBurstEffect,
    martial_ult: DragonFistEffect,

    // Kısa key'ler
    fist: RapidPunchEffect,
    spin: SpinKickEffect,
    chi: KiBurstEffect,
    guard: IronStanceEffect,
    blink: ShadowDashEffect,
    fury: ComboFuryEffect,
};

export default MARTIAL_ARTIST_EFFECTS;
