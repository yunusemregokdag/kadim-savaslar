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
// 🔥 ATEŞ TOPU (Fireball) - İleri fırlayan ateş küresi
// ═══════════════════════════════════════════════════════════════════════════
export const FireballEffect: React.FC<{
    position: [number, number, number];
    targetPosition?: [number, number, number];
    onComplete: () => void;
}> = ({ position, targetPosition, onComplete }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 800;
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

        groupRef.current.rotation.x += 0.1;
        groupRef.current.rotation.y += 0.15;

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={position}>
            {/* Core fireball */}
            <mesh>
                <sphereGeometry args={[0.35, 12, 12]} />
                <meshBasicMaterial
                    color="#ff5522"
                    transparent
                    opacity={0.9}
                />
            </mesh>
            {/* Outer glow */}
            <mesh>
                <sphereGeometry args={[0.5, 12, 12]} />
                <meshBasicMaterial
                    color="#ff8800"
                    transparent
                    opacity={0.4}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
            <ArcanePixels position={[0, 0, 0]} color="#ff6600" count={15} spread={0.5} progress={progressRef.current} pixelSize={0.04} />
            <pointLight color="#ff6600" intensity={4} distance={4} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 🧊 BUZ BLOĞU (IceBlock) - Koruyucu buz zırhı
// ═══════════════════════════════════════════════════════════════════════════
export const IceBlockEffect: React.FC<{
    position: [number, number, number];
    onComplete: () => void;
    playerGroupRef?: React.MutableRefObject<THREE.Group | null>;
    followPlayer?: boolean;
}> = ({ position, onComplete, playerGroupRef, followPlayer = false }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 3500;
    const progressRef = useRef(0);

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
            {/* Ice block */}
            <mesh>
                <boxGeometry args={[1.2, 2, 1.2]} />
                <meshBasicMaterial
                    color="#99ddff"
                    transparent
                    opacity={0.5 * (1 - progressRef.current * 0.3)}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
            {/* Inner glow */}
            <mesh>
                <boxGeometry args={[1, 1.8, 1]} />
                <meshBasicMaterial
                    color="#ffffff"
                    transparent
                    opacity={0.3}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
            <ArcanePixels position={[0, 0.5, 0]} color="#aaeeff" count={20} spread={1.5} progress={progressRef.current * 0.5} pixelSize={0.04} />
            <pointLight color="#66ccff" intensity={2} distance={3} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// ✨ IŞINLANMA (Teleport) - Blink efekti
// ═══════════════════════════════════════════════════════════════════════════
export const TeleportEffect: React.FC<{
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

        // Scale pulse
        const scale = progress < 0.5 ? 1 + progress * 2 : 3 - progress * 2;
        groupRef.current.scale.setScalar(scale);

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={position}>
            {/* Flash sphere */}
            <mesh>
                <sphereGeometry args={[0.6, 16, 16]} />
                <meshBasicMaterial
                    color="#ffffff"
                    transparent
                    opacity={0.8 * (1 - progressRef.current)}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
            {/* Outer ring */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.8, 1.2, 16]} />
                <meshBasicMaterial
                    color="#aa88ff"
                    transparent
                    opacity={0.6 * (1 - progressRef.current)}
                    blending={THREE.AdditiveBlending}
                    side={THREE.DoubleSide}
                />
            </mesh>
            <ArcanePixels position={[0, 0.5, 0]} color="#ffffff" count={25} spread={1.5} progress={progressRef.current} pixelSize={0.05} />
            <pointLight color="#ffffff" intensity={5 * (1 - progressRef.current)} distance={4} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// ⚡ YILDIRIM ZİNCİRİ (Lightning) - Sıçrayan elektrik
// ═══════════════════════════════════════════════════════════════════════════
export const LightningEffect: React.FC<{
    position: [number, number, number];
    targetPosition?: [number, number, number];
    onComplete: () => void;
}> = ({ position, targetPosition, onComplete }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 500;
    const progressRef = useRef(0);

    const bolts = useMemo(() => {
        return Array.from({ length: 4 }).map((_, i) => ({
            angle: (i / 4) * Math.PI * 2 + Math.random() * 0.5,
            distance: 2 + Math.random() * 2,
            delay: i * 0.1,
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
            {/* Central bolt */}
            <mesh position={[0, 2, 0]}>
                <cylinderGeometry args={[0.05, 0.1, 4]} />
                <meshBasicMaterial
                    color="#88ffff"
                    transparent
                    opacity={0.9 * (1 - progressRef.current)}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
            {/* Chain bolts */}
            {bolts.map((bolt, i) => {
                const boltProgress = Math.max(0, Math.min(1, (progressRef.current - bolt.delay) * 2));
                return (
                    <mesh
                        key={i}
                        position={[
                            Math.cos(bolt.angle) * bolt.distance * boltProgress,
                            1,
                            Math.sin(bolt.angle) * bolt.distance * boltProgress
                        ]}
                        rotation={[Math.random(), Math.random(), Math.PI / 4]}
                    >
                        <cylinderGeometry args={[0.03, 0.05, 2]} />
                        <meshBasicMaterial
                            color="#aaffff"
                            transparent
                            opacity={boltProgress > 0 ? 0.8 : 0}
                            blending={THREE.AdditiveBlending}
                        />
                    </mesh>
                );
            })}
            <ArcanePixels position={[0, 1, 0]} color="#88ffff" count={30} spread={3} progress={progressRef.current} pixelSize={0.05} />
            <pointLight color="#88ffff" intensity={6 * (1 - progressRef.current)} distance={5} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 🩸 MANA EMİLİMİ (Drain) - Can çalan ışın
// ═══════════════════════════════════════════════════════════════════════════
export const DrainEffect: React.FC<{
    position: [number, number, number];
    targetPosition?: [number, number, number];
    onComplete: () => void;
}> = ({ position, targetPosition, onComplete }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 3000;
    const progressRef = useRef(0);

    const target = targetPosition || [position[0], position[1], position[2] + 3];

    useFrame(() => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;

        if (progress >= 1) onComplete();
    });

    const midPoint: [number, number, number] = [
        (position[0] + target[0]) / 2,
        (position[1] + target[1]) / 2 + 0.8,
        (position[2] + target[2]) / 2
    ];

    const distance = Math.sqrt(
        Math.pow(target[0] - position[0], 2) +
        Math.pow(target[2] - position[2], 2)
    );

    return (
        <group ref={groupRef}>
            {/* Drain beam */}
            <mesh position={midPoint} rotation={[0, Math.atan2(target[0] - position[0], target[2] - position[2]), Math.PI / 2]}>
                <cylinderGeometry args={[0.08, 0.08, distance]} />
                <meshBasicMaterial
                    color="#aa00ff"
                    transparent
                    opacity={0.6 + Math.sin(progressRef.current * 20) * 0.2}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
            {/* Particles flowing along beam */}
            <ArcanePixels position={midPoint} color="#cc44ff" count={20} spread={distance / 2} progress={progressRef.current * 0.3} pixelSize={0.04} />
            <pointLight color="#aa00ff" intensity={2} distance={4} position={midPoint} />
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

    // Yeni efektler
    fireball_effect: FireballEffect,
    iceblock_effect: IceBlockEffect,
    teleport_effect: TeleportEffect,
    lightning_effect: LightningEffect,
    drain_effect: DrainEffect,

    // Components/constants.ts keys - DOĞRU MAPPING
    fireball: FireballEffect,
    iceblock: IceBlockEffect,
    teleport: TeleportEffect,
    lightning: LightningEffect,
    meteor: StarRainEffect,
    drain: DrainEffect,
    blackhole: ApocalypseEffect,

    // Root constants.ts visual keys (yeni - archmage)
    archmage_bolt: FireballEffect,
    archmage_impact: IceBlockEffect,
    archmage_void: PolymorphEffect,
    archmage_meteor: StarRainEffect,
    archmage_blizzard: ManaExplosionEffect,
    archmage_apocalypse: ApocalypseEffect,

    // Extra user keys
    orb: ArcaneOrbEffect,
    time: TimeWarpEffect,
    poly: PolymorphEffect,
    rain: StarRainEffect,
    explode: ManaExplosionEffect,
    apoc: ApocalypseEffect,
    fire: FireballEffect,
    ice: IceBlockEffect,
    blink: TeleportEffect,
    chain: LightningEffect,
};

export default MAGE_EFFECTS;
