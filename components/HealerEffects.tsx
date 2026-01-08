// ═══════════════════════════════════════════════════════════════════════════
// HEALER (IŞIK RAHİBİ) SKILL EFFECTS
// Kutsal ışık, heal auraları ve arındırma pixel efektleri
// ═══════════════════════════════════════════════════════════════════════════

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Instances, Instance } from '@react-three/drei';

// ═══════════════════════════════════════════════════════════════════════════
// ✨ PIXEL LIGHT - Yeniden kullanılabilir kutsal ışık küpü
// ═══════════════════════════════════════════════════════════════════════════
const PixelLight: React.FC<{
    position: [number, number, number];
    rotation?: [number, number, number];
    scale?: number;
    color: string;
    opacity?: number;
}> = ({ position, rotation = [0, 0, 0], scale = 1, color, opacity = 0.95 }) => {
    return (
        <mesh position={position} rotation={rotation} scale={[scale, scale, scale]}>
            <boxGeometry args={[0.15, 0.15, 0.15]} />
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
// HOLY PIXELS - Kutsal ışık parçacıkları
// ═══════════════════════════════════════════════════════════════════════════
const HolyPixels: React.FC<{
    position: [number, number, number];
    color?: string;
    count?: number;
    spread?: number;
    progress: number;
}> = ({ position, color = '#ffffcc', count = 15, spread = 0.5, progress }) => {
    const pixels = useMemo(() => {
        return Array.from({ length: count }).map(() => ({
            x: (Math.random() - 0.5) * spread,
            y: (Math.random() - 0.5) * spread,
            z: (Math.random() - 0.5) * spread * 2,
            size: 0.04 + Math.random() * 0.04,
            offset: Math.random() * Math.PI * 2,
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
                        position={[px.x, px.y + progress * 0.5, px.z]}
                        scale={[px.size, px.size, px.size]}
                    />
                ))}
            </Instances>
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 🟡 SKILL 1 – IŞIK VURUŞU (Light Strike) - Basic
// ═══════════════════════════════════════════════════════════════════════════
export const LightStrikeEffect: React.FC<{
    position: [number, number, number];
    targetPosition?: [number, number, number];
    onComplete: () => void;
}> = ({ position, targetPosition, onComplete }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 500;
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

        // Hareket: oyuncudan hedefe
        const distance = progress * 15;
        groupRef.current.position.set(
            position[0] + direction.x * distance,
            position[1] + 0.8,
            position[2] + direction.z * distance
        );

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={position}>
            <PixelLight position={[0, 0, 0]} color="#ffff99" scale={1.5} opacity={1 - progressRef.current} />
            <PixelLight position={[0.1, 0.1, 0]} color="#ffffcc" scale={1} opacity={(1 - progressRef.current) * 0.8} />
            <HolyPixels position={[0, 0, 0]} color="#ffffaa" count={8} spread={0.3} progress={progressRef.current} />
            <pointLight color="#ffff99" intensity={3 * (1 - progressRef.current)} distance={3} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 💛 SKILL 2 – KUTSAL HALKA (Holy Circle) - Heal Aura
// ═══════════════════════════════════════════════════════════════════════════
export const HolyCircleEffect: React.FC<{
    position: [number, number, number];
    onComplete: () => void;
    playerGroupRef?: React.MutableRefObject<THREE.Group | null>;
    followPlayer?: boolean;
}> = ({ position, onComplete, playerGroupRef, followPlayer = false }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 6000;
    const progressRef = useRef(0);
    const lightCount = 16;

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
            {/* Zemin halkası */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
                <ringGeometry args={[1.6, 2.0, 32]} />
                <meshBasicMaterial
                    color="#fff2aa"
                    transparent
                    opacity={0.4 + Math.sin(progressRef.current * 15) * 0.2}
                    blending={THREE.AdditiveBlending}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Dönen kutsal ışıklar */}
            {Array.from({ length: lightCount }).map((_, i) => {
                const angle = progressRef.current * 2 + (i / lightCount) * Math.PI * 2;
                return (
                    <PixelLight
                        key={i}
                        position={[
                            Math.cos(angle) * 1.8,
                            0.1,
                            Math.sin(angle) * 1.8
                        ]}
                        color="#fff2aa"
                        opacity={0.9 * (1 - progressRef.current * 0.3)}
                    />
                );
            })}
            <pointLight color="#fff2aa" intensity={3} distance={4} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 🟣 SKILL 3 – ARINMA IŞIĞI (Purify Light) - Cleanse
// ═══════════════════════════════════════════════════════════════════════════
export const PurifyLightEffect: React.FC<{
    position: [number, number, number];
    targetPosition?: [number, number, number];
    onComplete: () => void;
}> = ({ position, targetPosition, onComplete }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 1000;
    const progressRef = useRef(0);
    const shardCount = 20;

    const spawnPos = targetPosition || position;

    useFrame(() => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={spawnPos}>
            {Array.from({ length: shardCount }).map((_, i) => (
                <PixelLight
                    key={i}
                    position={[
                        Math.sin(i + progressRef.current * 3) * 0.4,
                        progressRef.current * 2,
                        Math.cos(i + progressRef.current * 3) * 0.4
                    ]}
                    color="#ffffff"
                    opacity={1 - progressRef.current}
                    scale={0.8}
                />
            ))}
            <pointLight color="#ffffff" intensity={4 * (1 - progressRef.current)} distance={3} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 🛡️ SKILL 4 – KUTSAL KALKAN (Holy Shield)
// ═══════════════════════════════════════════════════════════════════════════
export const HolyShieldEffect: React.FC<{
    position: [number, number, number];
    onComplete: () => void;
    playerGroupRef?: React.MutableRefObject<THREE.Group | null>;
    followPlayer?: boolean;
}> = ({ position, onComplete, playerGroupRef, followPlayer = false }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 5000;
    const progressRef = useRef(0);
    const shieldCount = 12;

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
            {Array.from({ length: shieldCount }).map((_, i) => {
                const angle = progressRef.current * 3 + (i / shieldCount) * Math.PI * 2;
                return (
                    <PixelLight
                        key={i}
                        position={[
                            Math.cos(angle) * 1.1,
                            0.6,
                            Math.sin(angle) * 1.1
                        ]}
                        color="#ffee88"
                        opacity={0.9 * (1 - progressRef.current * 0.3)}
                        scale={1.2}
                    />
                );
            })}
            <pointLight color="#ffee88" intensity={2} distance={3} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 🌞 SKILL 5 – IŞIK YAĞMURU (Light Rain) - Area Heal
// ═══════════════════════════════════════════════════════════════════════════
export const LightRainEffect: React.FC<{
    position: [number, number, number];
    onComplete: () => void;
}> = ({ position, onComplete }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 4000;
    const progressRef = useRef(0);
    const dropCount = 25;

    const drops = useMemo(() => {
        return Array.from({ length: dropCount }).map(() => ({
            x: (Math.random() - 0.5) * 4,
            z: (Math.random() - 0.5) * 4,
            startY: 3 + Math.random() * 2,
            speed: 0.03 + Math.random() * 0.02,
        }));
    }, [dropCount]);

    useFrame(() => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={position}>
            {/* Heal alanı */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
                <circleGeometry args={[2.5, 32]} />
                <meshBasicMaterial
                    color="#ffffcc"
                    transparent
                    opacity={0.3 * (1 - progressRef.current * 0.5)}
                    blending={THREE.AdditiveBlending}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Yağan ışık damlaları */}
            {drops.map((drop, i) => {
                const y = drop.startY - (progressRef.current * 5 * drop.speed * 100) % drop.startY;
                return (
                    <PixelLight
                        key={i}
                        position={[drop.x, y, drop.z]}
                        color="#ffffcc"
                        opacity={0.9}
                        scale={0.7}
                    />
                );
            })}
            <pointLight color="#ffffcc" intensity={3} distance={5} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 🌈 SKILL 6 – KUTSAL SENARYO (Sanctuary) - ULTİ
// ═══════════════════════════════════════════════════════════════════════════
export const SanctuaryEffect: React.FC<{
    position: [number, number, number];
    onComplete: () => void;
    playerGroupRef?: React.MutableRefObject<THREE.Group | null>;
    followPlayer?: boolean;
}> = ({ position, onComplete, playerGroupRef, followPlayer = false }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 10000;
    const progressRef = useRef(0);
    const ringCount = 3;
    const lightsPerRing = 18;

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
            {/* Çoklu halkalar */}
            {Array.from({ length: ringCount }).map((_, r) => (
                <group key={r}>
                    {Array.from({ length: lightsPerRing }).map((_, i) => {
                        const angle = progressRef.current + (i / lightsPerRing) * Math.PI * 2;
                        const radius = 1.5 + r * 0.7;
                        return (
                            <PixelLight
                                key={i}
                                position={[
                                    Math.cos(angle) * radius,
                                    r * 0.4 + 0.1,
                                    Math.sin(angle) * radius
                                ]}
                                color="#fff8cc"
                                opacity={0.9 * (1 - progressRef.current * 0.2)}
                            />
                        );
                    })}
                </group>
            ))}

            {/* Merkez ışık */}
            <mesh>
                <sphereGeometry args={[0.4, 16, 16]} />
                <meshBasicMaterial
                    color="#ffffcc"
                    transparent
                    opacity={0.6}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>

            <pointLight color="#ffffcc" intensity={5} distance={8} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// ESKI EFEKTLER (backward compatibility aliases)
// ═══════════════════════════════════════════════════════════════════════════

// HolyLightEffect = LightStrikeEffect
export const HolyLightEffect = LightStrikeEffect;

// GreatHealEffect = HolyCircleEffect
export const GreatHealEffect = HolyCircleEffect;

// BlessingEffect = HolyShieldEffect
export const BlessingEffect = HolyShieldEffect;

// LightBurstEffect = LightRainEffect
export const LightBurstEffect = LightRainEffect;

// DivineInterventionEffect = SanctuaryEffect
export const DivineInterventionEffect = SanctuaryEffect;

// ResurrectEffect
export const ResurrectEffect: React.FC<{
    position: [number, number, number];
    targetPosition?: [number, number, number];
    onComplete: () => void;
}> = ({ position, targetPosition, onComplete }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 3000;
    const progressRef = useRef(0);

    const spawnPos = targetPosition || position;

    useFrame(() => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={spawnPos}>
            {/* Yükselen ışık sütunu */}
            <mesh position={[0, progressRef.current * 3, 0]}>
                <cylinderGeometry args={[0.3, 0.5, 2, 8]} />
                <meshBasicMaterial
                    color="#ffff88"
                    transparent
                    opacity={0.6 * (1 - progressRef.current)}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>

            {/* Spiral ışıklar */}
            {Array.from({ length: 12 }).map((_, i) => {
                const angle = progressRef.current * 5 + (i / 12) * Math.PI * 2;
                const y = progressRef.current * 3 * (i / 12);
                return (
                    <PixelLight
                        key={i}
                        position={[
                            Math.cos(angle) * 0.8,
                            y,
                            Math.sin(angle) * 0.8
                        ]}
                        color="#ffffaa"
                        opacity={1 - progressRef.current}
                    />
                );
            })}

            <pointLight color="#ffff88" intensity={5 * (1 - progressRef.current)} distance={5} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// HEALER SKILL MAP
// ═══════════════════════════════════════════════════════════════════════════
export const HEALER_EFFECTS: Record<string, React.FC<any>> = {
    // ✅ CONSTANTS.TS VISUAL KEYS (GERÇEK KEY'LER)
    cleric_impact: LightStrikeEffect,
    cleric_immolation: HolyCircleEffect,
    cleric_wave: HolyShieldEffect,
    cleric_tear: SanctuaryEffect,

    // Yeni pixel ışık efektleri
    light_strike: LightStrikeEffect,
    holy_circle: HolyCircleEffect,
    purify_light: PurifyLightEffect,
    holy_shield: HolyShieldEffect,
    light_rain: LightRainEffect,
    sanctuary: SanctuaryEffect,

    // Eski key'ler (backward compat)
    holy_light: HolyLightEffect,
    great_heal: GreatHealEffect,
    blessing: BlessingEffect,
    light_burst: LightBurstEffect,
    divine_intervention: DivineInterventionEffect,
    resurrect: ResurrectEffect,

    // Components/constants.ts keys
    heal: HolyCircleEffect,
    purify: PurifyLightEffect,
    shield: HolyShieldEffect,
    rain: LightRainEffect,

    // Root constants.ts visual keys
    healer_light: LightStrikeEffect,
    healer_aura: HolyCircleEffect,
    healer_shield: HolyShieldEffect,
    healer_ult: SanctuaryEffect,

    // Kısa key'ler
    light: LightStrikeEffect,
    circle: HolyCircleEffect,
    cleanse: PurifyLightEffect,
    protect: HolyShieldEffect,
    holy: SanctuaryEffect,
    revive: ResurrectEffect,
};

export default HEALER_EFFECTS;
