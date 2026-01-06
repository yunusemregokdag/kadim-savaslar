// ═══════════════════════════════════════════════════════════════════════════
// MARTIAL ARTIST (DÖVÜŞ USTASI) SKILL EFFECTS
// Combo, hız ve enerji odaklı pixel efektler
// ═══════════════════════════════════════════════════════════════════════════

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Instances, Instance } from '@react-three/drei';

// ═══════════════════════════════════════════════════════════════════════════
// ENERGY PIXELS - Chi enerjisi parçacıkları
// ═══════════════════════════════════════════════════════════════════════════
const ChiPixels: React.FC<{
    position: [number, number, number];
    color?: string;
    count?: number;
    spread?: number;
    progress: number;
}> = ({ position, color = '#ffaa00', count = 10, spread = 0.5, progress }) => {
    const pixels = useMemo(() => {
        return Array.from({ length: count }).map(() => ({
            x: (Math.random() - 0.5) * spread,
            y: (Math.random() - 0.5) * spread,
            z: (Math.random() - 0.5) * spread * 2,
            size: 0.05 + Math.random() * 0.05,
            speed: 1 + Math.random(),
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
                        position={[px.x * (1 + progress), px.y * (1 + progress), px.z + progress * px.speed]}
                        scale={[px.size, px.size, px.size]}
                    />
                ))}
            </Instances>
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 👊 1️⃣ BASIC PUNCH - Seri Yumruk Efekti
// ═══════════════════════════════════════════════════════════════════════════
export const PunchEffect: React.FC<{
    position: [number, number, number];
    targetPosition?: [number, number, number];
    onComplete: () => void;
}> = ({ position, targetPosition, onComplete }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 200; // Very fast
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

        const distance = progress * 2.0;
        groupRef.current.position.set(
            position[0] + direction.x * distance,
            position[1] + 1.2,
            position[2] + direction.z * distance
        );

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={position} rotation={[0, Math.atan2(direction.x, direction.z), 0]}>
            {/* Fist shockwave */}
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.5]}>
                <ringGeometry args={[0.2, 0.4, 8]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={0.5 * (1 - progressRef.current)} />
            </mesh>
            <ChiPixels position={[0, 0, 0]} color="#ffff00" count={5} spread={0.3} progress={progressRef.current} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 🌀 AKIŞ MODU (Flow Mode) - Z Skill Aura
// ═══════════════════════════════════════════════════════════════════════════
export const FlowModeEffect: React.FC<{
    position: [number, number, number];
    onComplete: () => void;
    playerGroupRef?: React.MutableRefObject<THREE.Group | null>;
    followPlayer?: boolean;
}> = ({ position, onComplete, playerGroupRef, followPlayer = false }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 6000;
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

        // Rotate fast
        groupRef.current.rotation.y = state.clock.elapsedTime * 3;

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={position}>
            {/* Swirling wind lines */}
            {[0, 1, 2].map(i => (
                <mesh key={i} rotation={[0, i * 2, 0]} position={[Math.cos(i) * 0.8, 1, Math.sin(i) * 0.8]}>
                    <boxGeometry args={[0.1, 1.5, 0.1]} />
                    <meshBasicMaterial
                        color="#aaddff"
                        transparent
                        opacity={0.4}
                        blending={THREE.AdditiveBlending}
                    />
                </mesh>
            ))}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
                <ringGeometry args={[0.8, 1.2, 16]} />
                <meshBasicMaterial
                    color="#aaddff"
                    transparent
                    opacity={0.3 * (1 - progressRef.current)}
                    side={THREE.DoubleSide}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 🐉 1️⃣ EJDERHA TEKMESİ (Dragon Kick) - Uppercut
// ═══════════════════════════════════════════════════════════════════════════
export const DragonKickEffect: React.FC<{
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

        groupRef.current.position.y += 0.1;

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={position}>
            {/* Burning uppercut trail */}
            <mesh position={[0, 1, 0.5]} rotation={[-0.5, 0, 0]}>
                <cylinderGeometry args={[0.2, 0.5, 2, 8]} />
                <meshBasicMaterial
                    color="#ff4400"
                    transparent
                    opacity={0.8 * (1 - progressRef.current)}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
            <ChiPixels position={[0, 0.5, 0.5]} color="#ffaa00" count={15} spread={0.8} progress={progressRef.current} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 🧘 2️⃣ MEDİTASYON (Meditation) - Heal Aura
// ═══════════════════════════════════════════════════════════════════════════
export const MeditationEffect: React.FC<{
    position: [number, number, number];
    onComplete: () => void;
    playerGroupRef?: React.MutableRefObject<THREE.Group | null>;
    followPlayer?: boolean;
}> = ({ position, onComplete, playerGroupRef, followPlayer = false }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 5000;
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

        groupRef.current.rotation.y = state.clock.elapsedTime * 0.2;

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={position}>
            {/* Lotus Flower Base */}
            {[0, 1, 2, 3].map(i => (
                <mesh key={i} rotation={[-Math.PI / 2, 0, i * Math.PI / 2]} position={[0, 0.1, 0]}>
                    <ringGeometry args={[0.5, 1.5, 3]} />
                    <meshBasicMaterial
                        color="#00ff88"
                        transparent
                        opacity={0.4}
                        side={THREE.DoubleSide}
                        blending={THREE.AdditiveBlending}
                    />
                </mesh>
            ))}
            <ChiPixels position={[0, 1, 0]} color="#00ff00" count={10} spread={1} progress={progressRef.current % 0.2 * 5} />
            <pointLight color="#00ff00" intensity={2} distance={3} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 🐅 3️⃣ KAPLAN DURUŞU (Tiger Stance) - Buff
// ═══════════════════════════════════════════════════════════════════════════
export const TigerStanceEffect: React.FC<{
    position: [number, number, number];
    onComplete: () => void;
    playerGroupRef?: React.MutableRefObject<THREE.Group | null>;
    followPlayer?: boolean;
}> = ({ position, onComplete, playerGroupRef, followPlayer = false }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 15000;
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
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
                <ringGeometry args={[1.2, 1.5, 6]} />
                <meshBasicMaterial
                    color="#ff3300"
                    transparent
                    opacity={0.5 * (1 - progressRef.current)}
                    side={THREE.DoubleSide}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
            {/* Tiger Stripes Aura */}
            {[0, 1, 2].map(i => (
                <mesh key={i} position={[0, 1 + i * 0.5, 0]} scale={[1 + i * 0.2, 1, 1 + i * 0.2]}>
                    <ringGeometry args={[0.5, 0.6, 16]} />
                    <meshBasicMaterial color="#ffaa00" transparent opacity={0.3} />
                </mesh>
            ))}
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 🔥 4️⃣ TURNA KANADI (Crane Wing) - AOE Sweep
// ═══════════════════════════════════════════════════════════════════════════
export const CraneWingEffect: React.FC<{
    position: [number, number, number];
    onComplete: () => void;
}> = ({ position, onComplete }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 400;
    const progressRef = useRef(0);

    useFrame(() => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;

        const scale = 0.5 + progress * 5;
        groupRef.current.scale.set(scale, scale, 1);
        groupRef.current.rotation.z += 0.2;

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={[position[0], 0.5, position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
            {/* Left and Right "Wings" (Arcs) */}
            <mesh>
                <ringGeometry args={[0.5, 1, 32, 2, 0, Math.PI]} />
                <meshBasicMaterial
                    color="#ffffff"
                    transparent
                    opacity={0.6 * (1 - progressRef.current)}
                    side={THREE.DoubleSide}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
            <mesh rotation={[0, 0, Math.PI]}>
                <ringGeometry args={[0.5, 1, 32, 2, 0, Math.PI]} />
                <meshBasicMaterial
                    color="#aaddff"
                    transparent
                    opacity={0.6 * (1 - progressRef.current)}
                    side={THREE.DoubleSide}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 🌌 5️⃣ YEDİ YILDIZ (Seven Stars) - ULTI
// ═══════════════════════════════════════════════════════════════════════════
export const SevenStarsEffect: React.FC<{
    position: [number, number, number];
    targetPosition?: [number, number, number];
    onComplete: () => void;
}> = ({ position, targetPosition, onComplete }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 2100; // 7 hits * 300ms
    const progressRef = useRef(0);

    const targetPos = useMemo(() => targetPosition || position, [position, targetPosition]);
    const hits = useMemo(() => Array.from({ length: 7 }), []);

    useFrame((state) => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={targetPos}>
            {hits.map((_, i) => {
                const hitDelay = i * 0.14; // normalized delay
                const hitProgress = Math.max(0, Math.min((progressRef.current - hitDelay) * 7, 1));
                if (hitProgress === 0 || hitProgress === 1) return null;

                const angle = (i / 7) * Math.PI * 2;
                const x = Math.cos(angle) * 1;
                const z = Math.sin(angle) * 1;

                return (
                    <group key={i} position={[x, 1, z]} rotation={[0, Math.atan2(x, z) + Math.PI, 0]}>
                        <mesh position={[0, 0, -hitProgress * 2]}>
                            {/* Moving inward to center */}
                            <boxGeometry args={[0.3, 0.3, 1]} />
                            <meshBasicMaterial
                                color={i % 2 === 0 ? '#ff0000' : '#ffffff'}
                                transparent
                                opacity={1 - hitProgress}
                                blending={THREE.AdditiveBlending}
                            />
                        </mesh>
                        <mesh position={[0, 0, 0]} scale={[hitProgress * 3, hitProgress * 3, hitProgress * 3]}>
                            {/* Impact flash at center */}
                            <sphereGeometry args={[0.2, 8, 8]} />
                            <meshBasicMaterial color="#ffff00" transparent opacity={0.5} />
                        </mesh>
                    </group>
                );
            })}
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// MARTIAL ARTIST SKILL MAP
// ═══════════════════════════════════════════════════════════════════════════
export const MARTIAL_ARTIST_EFFECTS: Record<string, React.FC<any>> = {
    // New keys
    punch: PunchEffect,
    flow: FlowModeEffect,
    dragon: DragonKickEffect,
    meditate: MeditationEffect,
    tiger: TigerStanceEffect,
    crane: CraneWingEffect,
    seven: SevenStarsEffect,

    // Components/constants.ts mapping
    kick: DragonKickEffect, // Uçan tekme -> Dragon Kick visual
    focus: TigerStanceEffect, // Odak -> Tiger Buff
    sweep: CraneWingEffect, // Süpürme -> Crane AOE
    dragon_punch: DragonKickEffect,
    iron_body: FlowModeEffect, // Demir vücut -> Akış modu visual
    ora_ora: SevenStarsEffect, // 100 yumruk -> Seven stars visual

    // Root constants.ts mapping (yeni visual key'ler)
    martial_hit: PunchEffect,
    martial_uppercut: DragonKickEffect,
    martial_evasion: MeditationEffect,
    martial_multi: TigerStanceEffect,
    martial_slash: CraneWingEffect,

    // Extra aliases
    rapid_punch: PunchEffect,
    tiger_stance: TigerStanceEffect,
    crane_wing: CraneWingEffect,
    seven_stars: SevenStarsEffect,
    meditation: MeditationEffect,
    flow_mode: FlowModeEffect,
};

export default MARTIAL_ARTIST_EFFECTS;
