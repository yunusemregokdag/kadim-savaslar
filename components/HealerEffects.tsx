// ═══════════════════════════════════════════════════════════════════════════
// HEALER (ŞİFACI/LIGHT PRIEST) SKILL EFFECTS
// Kutsal ışık, şifa ve parıltı efektleri (Altın/Beyaz Pixel)
// ═══════════════════════════════════════════════════════════════════════════

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Instances, Instance } from '@react-three/drei';

// ═══════════════════════════════════════════════════════════════════════════
// HOLY PIXELS - Kutsal ışık parçacıkları
// ═══════════════════════════════════════════════════════════════════════════
const HolyPixels: React.FC<{
    position: [number, number, number];
    color?: string;
    count?: number;
    spread?: number;
    progress: number;
    size?: number;
}> = ({ position, color = '#ffffaa', count = 15, spread = 0.5, progress, size = 0.05 }) => {
    const pixels = useMemo(() => {
        return Array.from({ length: count }).map(() => ({
            x: (Math.random() - 0.5) * spread,
            y: (Math.random() - 0.5) * spread,
            z: (Math.random() - 0.5) * spread * 2,
            size: size + Math.random() * size,
            isWhite: Math.random() > 0.5,
        }));
    }, [count, spread, size]);

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
                        position={[px.x, px.y + Math.sin(progress * 5 + i) * 0.1, px.z]}
                        scale={[px.size, px.size, px.size]}
                        color={px.isWhite ? '#ffffff' : color}
                    />
                ))}
            </Instances>
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 1️⃣ KUTSAL IŞIK (Holy Light) - Mermi/Bolt
// ═══════════════════════════════════════════════════════════════════════════
export const HolyLightEffect: React.FC<{
    position: [number, number, number];
    targetPosition?: [number, number, number];
    onComplete: () => void;
}> = ({ position, targetPosition, onComplete }) => {
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

        const distance = progress * 18;
        groupRef.current.position.set(
            position[0] + direction.x * distance,
            position[1] + 0.8,
            position[2] + direction.z * distance
        );

        // Grow slightly as it travels
        const s = 1 + progress * 0.2;
        groupRef.current.scale.set(s, s, s);

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={position}>
            <mesh>
                <sphereGeometry args={[0.15, 8, 8]} />
                <meshBasicMaterial color="#ffffaa" transparent opacity={0.9} blending={THREE.AdditiveBlending} />
            </mesh>
            <mesh scale={[1.2, 1.2, 1.2]}>
                <sphereGeometry args={[0.15, 8, 8]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={0.4} blending={THREE.AdditiveBlending} />
            </mesh>
            <HolyPixels position={[0, 0, 0]} color="#ffffaa" count={5} spread={0.3} progress={progressRef.current} />
            <pointLight color="#ffffaa" intensity={2} distance={2} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 2️⃣ BÜYÜK ŞİFA (Great Heal) - Yükselen Yeşil/Altın Halka
// ═══════════════════════════════════════════════════════════════════════════
export const GreatHealEffect: React.FC<{
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

        groupRef.current.position.y += 0.02;

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={position}>
            {/* Rising Rings */}
            {[0, 1].map(i => {
                const p = (progressRef.current + i * 0.5) % 1;
                return (
                    <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, p * 2, 0]} scale={[1 - p, 1 - p, 1]}>
                        <ringGeometry args={[0.8, 1, 16]} />
                        <meshBasicMaterial
                            color="#88ffaa"
                            transparent
                            opacity={0.6 * (1 - p)}
                            side={THREE.DoubleSide}
                            blending={THREE.AdditiveBlending}
                        />
                    </mesh>
                );
            })}
            {/* Cross particles + */}
            {[0, 1, 2, 3].map(i => (
                <group key={i} position={[Math.cos(i * Math.PI / 2) * 0.5, 0.5 + progressRef.current, Math.sin(i * Math.PI / 2) * 0.5]}>
                    <mesh scale={[0.1, 0.3, 0.05]}>
                        <boxGeometry />
                        <meshBasicMaterial color="#ffffff" transparent opacity={0.8 * (1 - progressRef.current)} />
                    </mesh>
                    <mesh scale={[0.3, 0.1, 0.05]}>
                        <boxGeometry />
                        <meshBasicMaterial color="#ffffff" transparent opacity={0.8 * (1 - progressRef.current)} />
                    </mesh>
                </group>
            ))}
            <pointLight color="#88ffaa" intensity={3 * (1 - progressRef.current)} distance={4} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 3️⃣ KUTSAMA (Blessing) - Buff Halo + Yakma Aura
// ═══════════════════════════════════════════════════════════════════════════
export const BlessingEffect: React.FC<{
    position: [number, number, number];
    onComplete: () => void;
    playerGroupRef?: React.MutableRefObject<THREE.Group | null>;
    followPlayer?: boolean;
}> = ({ position, onComplete, playerGroupRef, followPlayer = false }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 5000; // Visual effect shorter than buff
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

        groupRef.current.rotation.y = state.clock.elapsedTime * 0.5;

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={position}>
            {/* Ground Aura */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
                <ringGeometry args={[1.5, 2, 32]} />
                <meshBasicMaterial
                    color="#ffcc00"
                    transparent
                    opacity={0.4 * (1 - progressRef.current)}
                    side={THREE.DoubleSide}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
            {/* Floating Halo above head */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 2, 0]}>

                <torusGeometry args={[0.4, 0.05, 8, 24]} />
                <meshBasicMaterial
                    color="#ffff00"
                    transparent
                    opacity={0.8 * (1 - progressRef.current)}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
            <HolyPixels position={[0, 1, 0]} color="#ffaa00" count={10} spread={1.5} progress={progressRef.current} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 4️⃣ IŞIK PATLAMASI (Light Burst) - CC Blind (Flashbang)
// ═══════════════════════════════════════════════════════════════════════════
export const LightBurstEffect: React.FC<{
    position: [number, number, number];
    onComplete: () => void;
}> = ({ position, onComplete }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 500;
    const progressRef = useRef(0);

    useFrame(() => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;

        // Rapid expansion
        const scale = 0.5 + progress * 5;
        groupRef.current.scale.set(scale, scale, scale);

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={[position[0], 1, position[2]]}>
            <mesh>
                <sphereGeometry args={[0.5, 16, 16]} />
                <meshBasicMaterial
                    color="#ffffff"
                    transparent
                    opacity={0.9 * (1 - progressRef.current)}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
            <mesh scale={[1.2, 1.2, 1.2]}>
                <sphereGeometry args={[0.5, 16, 16]} />
                <meshBasicMaterial
                    color="#ffffaa"
                    transparent
                    opacity={0.5 * (1 - progressRef.current)}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
            <pointLight color="#ffffff" intensity={10 * (1 - progressRef.current)} distance={10} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 6️⃣ TANRISAL MÜDAHALE (Divine Intervention) - ULTI (Işık Sütunu)
// ═══════════════════════════════════════════════════════════════════════════
export const DivineInterventionEffect: React.FC<{
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

        // Fade out at end
        if (progress > 0.8) {
            groupRef.current.scale.x = 1 - (progress - 0.8) * 5;
            groupRef.current.scale.z = 1 - (progress - 0.8) * 5;
        }

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={position}>
            {/* Main Pillar */}
            <mesh position={[0, 3, 0]}>
                <cylinderGeometry args={[1.5, 1.5, 6, 16, 1, true]} />
                <meshBasicMaterial
                    color="#ffffee"
                    transparent
                    opacity={0.6 * (1 - progressRef.current * 0.5)}
                    side={THREE.DoubleSide}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
            {/* Inner Beam */}
            <mesh position={[0, 3, 0]}>
                <cylinderGeometry args={[0.5, 0.5, 10, 8, 1, true]} />
                <meshBasicMaterial
                    color="#ffffff"
                    transparent
                    opacity={0.8 * (1 - progressRef.current * 0.5)}
                    side={THREE.DoubleSide}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
            {/* Ground Ring */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
                <ringGeometry args={[1.5, 3, 32]} />
                <meshBasicMaterial
                    color="#ffffee"
                    transparent
                    opacity={0.5 * (1 - progressRef.current)}
                    side={THREE.DoubleSide}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
            <HolyPixels position={[0, 2, 0]} color="#ffffff" count={40} spread={1.5} progress={progressRef.current * 0.3} size={0.08} />
            <pointLight color="#ffffee" intensity={5} distance={10} position={[0, 4, 0]} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// HEALER SKILL MAP
// ═══════════════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════════════
// HEALER SKILL MAP
// ═══════════════════════════════════════════════════════════════════════════
export const HEALER_EFFECTS: Record<string, React.FC<any>> = {
    // Components/constants.ts Cleric Keys
    holy_light: HolyLightEffect,
    great_heal: GreatHealEffect,
    bubble: BlessingEffect,
    cleanse: LightBurstEffect,
    sanctuary: GreatHealEffect,
    resurrect: BlessingEffect,
    divine_intervention: DivineInterventionEffect,

    // Root constants.ts visual keys (yeni - cleric)
    cleric_impact: HolyLightEffect,
    cleric_immolation: GreatHealEffect,
    cleric_wave: BlessingEffect,
    cleric_tear: DivineInterventionEffect,

    // User provided aliases
    holy_bolt: HolyLightEffect,
    heal_ray: GreatHealEffect,
    buff_aura: BlessingEffect,
    flashbang: LightBurstEffect,
    blessing: BlessingEffect,
    light_burst: LightBurstEffect,
    revive: BlessingEffect,
    ultimate_pillar: DivineInterventionEffect,

    // Additional aliases
    heal: GreatHealEffect,
    light: HolyLightEffect,
    blind: LightBurstEffect,
    god_beam: DivineInterventionEffect,
};

export default HEALER_EFFECTS;
