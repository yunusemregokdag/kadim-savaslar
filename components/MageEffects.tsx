// ═══════════════════════════════════════════════════════════════════════════
// MAGE (ULU BÜYÜCÜ) SKILL EFFECTS
// Ateş, buz, yıldırım ve arcane pixel element efektleri
// ═══════════════════════════════════════════════════════════════════════════

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Instances, Instance } from '@react-three/drei';

// ═══════════════════════════════════════════════════════════════════════════
// 🔮 PIXEL ORB - Yeniden kullanılabilir element küpü
// ═══════════════════════════════════════════════════════════════════════════
const PixelOrb: React.FC<{
    position: [number, number, number];
    rotation?: [number, number, number];
    scale?: number;
    color: string;
    opacity?: number;
}> = ({ position, rotation = [0, 0, 0], scale = 1, color, opacity = 0.95 }) => {
    return (
        <mesh position={position} rotation={rotation} scale={[scale, scale, scale]}>
            <boxGeometry args={[0.2, 0.2, 0.2]} />
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
// ARCANE PIXELS - Element parçacıkları
// ═══════════════════════════════════════════════════════════════════════════
const ArcanePixels: React.FC<{
    position: [number, number, number];
    color?: string;
    count?: number;
    spread?: number;
    progress: number;
}> = ({ position, color = '#aa88ff', count = 15, spread = 0.5, progress }) => {
    const pixels = useMemo(() => {
        return Array.from({ length: count }).map(() => ({
            x: (Math.random() - 0.5) * spread,
            y: (Math.random() - 0.5) * spread,
            z: (Math.random() - 0.5) * spread * 2,
            size: 0.05 + Math.random() * 0.05,
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
                        position={[px.x, px.y, px.z]}
                        scale={[px.size, px.size, px.size]}
                    />
                ))}
            </Instances>
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 🔥 SKILL 1 – FIREBALL (Basic / Burst)
// ═══════════════════════════════════════════════════════════════════════════
export const FireballEffect: React.FC<{
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

        // Hareket: oyuncudan hedefe
        const distance = progress * 18;
        groupRef.current.position.set(
            position[0] + direction.x * distance,
            position[1] + 0.8,
            position[2] + direction.z * distance
        );

        // Döndür
        groupRef.current.rotation.x += 0.2;
        groupRef.current.rotation.y += 0.2;

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={position}>
            {/* Ana ateş küpü */}
            <PixelOrb position={[0, 0, 0]} color="#ff5533" scale={1.5} />
            <PixelOrb position={[0.1, 0.1, 0]} color="#ff8844" scale={1} opacity={0.8} />
            <PixelOrb position={[-0.1, -0.1, 0]} color="#ffaa00" scale={0.8} opacity={0.7} />

            {/* Ateş kuyruğu */}
            <ArcanePixels position={[0, 0, 0]} color="#ff6600" count={10} spread={0.3} progress={progressRef.current} />

            <pointLight color="#ff5533" intensity={3 * (1 - progressRef.current)} distance={3} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// ❄️ SKILL 2 – ICE BLOCK (Defans / Shield)
// ═══════════════════════════════════════════════════════════════════════════
export const IceBlockEffect: React.FC<{
    position: [number, number, number];
    onComplete: () => void;
    playerGroupRef?: React.MutableRefObject<THREE.Group | null>;
    followPlayer?: boolean;
}> = ({ position, onComplete, playerGroupRef, followPlayer = false }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 5000;
    const progressRef = useRef(0);
    const blockCount = 12;

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
            {Array.from({ length: blockCount }).map((_, i) => {
                const angle = progressRef.current * 2 + (i / blockCount) * Math.PI * 2;
                return (
                    <PixelOrb
                        key={i}
                        position={[
                            Math.cos(angle) * 1,
                            0.5,
                            Math.sin(angle) * 1
                        ]}
                        color="#66ccff"
                        opacity={0.9 * (1 - progressRef.current * 0.3)}
                        scale={1.2}
                        rotation={[angle, angle, 0]}
                    />
                );
            })}
            <pointLight color="#66ccff" intensity={2} distance={3} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 🟣 SKILL 3 – TELEPORT (Mobility / Blink)
// ═══════════════════════════════════════════════════════════════════════════
export const TeleportEffect: React.FC<{
    position: [number, number, number];
    onComplete: () => void;
}> = ({ position, onComplete }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 500;
    const progressRef = useRef(0);
    const shardCount = 20;

    const shards = useMemo(() => {
        return Array.from({ length: shardCount }).map(() => ({
            x: (Math.random() - 0.5) * 0.5,
            z: (Math.random() - 0.5) * 0.5,
            speed: 0.03 + Math.random() * 0.02,
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
        <group ref={groupRef} position={position}>
            {shards.map((shard, i) => (
                <PixelOrb
                    key={i}
                    position={[
                        shard.x,
                        progressRef.current * 2,
                        shard.z
                    ]}
                    color="#aa88ff"
                    opacity={1 - progressRef.current}
                    scale={0.8}
                />
            ))}
            <pointLight color="#aa88ff" intensity={4 * (1 - progressRef.current)} distance={3} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// ⚡ SKILL 4 – LIGHTNING (Chain / Burst)
// ═══════════════════════════════════════════════════════════════════════════
export const LightningEffect: React.FC<{
    position: [number, number, number];
    targetPosition?: [number, number, number];
    onComplete: () => void;
}> = ({ position, targetPosition, onComplete }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 300;
    const progressRef = useRef(0);

    const endPos = targetPosition || [position[0], position[1], position[2] + 5];

    // Yıldırım segmentleri
    const segments = useMemo(() => {
        const segs: [number, number, number][] = [];
        const steps = 8;
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            segs.push([
                position[0] + (endPos[0] - position[0]) * t + (Math.random() - 0.5) * 0.3,
                position[1] + (endPos[1] - position[1]) * t + 0.5 + Math.random() * 0.2,
                position[2] + (endPos[2] - position[2]) * t + (Math.random() - 0.5) * 0.3,
            ]);
        }
        return segs;
    }, [position, endPos]);

    useFrame(() => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef}>
            {/* Yıldırım segmentleri */}
            {segments.map((seg, i) => (
                <PixelOrb
                    key={i}
                    position={seg}
                    color="#ffff99"
                    opacity={1 - progressRef.current}
                    scale={0.6 + Math.random() * 0.3}
                />
            ))}
            {/* Flash */}
            <pointLight
                position={[
                    (position[0] + endPos[0]) / 2,
                    1,
                    (position[2] + endPos[2]) / 2
                ]}
                color="#ffff99"
                intensity={10 * (1 - progressRef.current)}
                distance={8}
            />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 🩸 SKILL 5 – DRAIN (DOT / Sustain)
// ═══════════════════════════════════════════════════════════════════════════
export const DrainEffect: React.FC<{
    position: [number, number, number];
    targetPosition?: [number, number, number];
    onComplete: () => void;
}> = ({ position, targetPosition, onComplete }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 2000;
    const progressRef = useRef(0);
    const orbCount = 6;

    const targetPos = targetPosition || [position[0], position[1], position[2] + 3];

    useFrame(() => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef}>
            {Array.from({ length: orbCount }).map((_, i) => {
                // Hedeften oyuncuya giden orblar
                const t = (Math.sin(progressRef.current * 5 + i) + 1) / 2;
                return (
                    <PixelOrb
                        key={i}
                        position={[
                            targetPos[0] + (position[0] - targetPos[0]) * t,
                            0.5 + Math.sin(progressRef.current * 10 + i) * 0.2,
                            targetPos[2] + (position[2] - targetPos[2]) * t
                        ]}
                        color="#aa0000"
                        opacity={0.9 * (1 - progressRef.current * 0.3)}
                        scale={0.8}
                    />
                );
            })}
            {/* Can emme ışığı */}
            <pointLight position={targetPos as [number, number, number]} color="#aa0000" intensity={2} distance={3} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 🌩️ SKILL 6 – ARCANE STORM (ULTİ)
// ═══════════════════════════════════════════════════════════════════════════
export const ArcaneStormEffect: React.FC<{
    position: [number, number, number];
    onComplete: () => void;
    playerGroupRef?: React.MutableRefObject<THREE.Group | null>;
    followPlayer?: boolean;
}> = ({ position, onComplete, playerGroupRef, followPlayer = false }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 8000;
    const progressRef = useRef(0);
    const orbCount = 40;

    const orbs = useMemo(() => {
        return Array.from({ length: orbCount }).map(() => ({
            angle: Math.random() * Math.PI * 2,
            radius: Math.random() * 3,
            height: Math.random() * 2,
            speed: 0.05 + Math.random() * 0.05,
        }));
    }, [orbCount]);

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
            {orbs.map((orb, i) => {
                const angle = orb.angle + progressRef.current * orb.speed * 50;
                return (
                    <PixelOrb
                        key={i}
                        position={[
                            Math.cos(angle) * orb.radius,
                            orb.height + Math.sin(progressRef.current * 5 + i) * 0.3,
                            Math.sin(angle) * orb.radius
                        ]}
                        color="#cc88ff"
                        opacity={0.9 * (1 - progressRef.current * 0.2)}
                        scale={1}
                    />
                );
            })}

            {/* Merkez glow */}
            <mesh>
                <sphereGeometry args={[0.5, 16, 16]} />
                <meshBasicMaterial
                    color="#cc88ff"
                    transparent
                    opacity={0.5}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>

            <pointLight color="#cc88ff" intensity={5} distance={8} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// ESKI EFEKTLER (backward compatibility aliases)
// ═══════════════════════════════════════════════════════════════════════════

// ArcaneOrbEffect = FireballEffect variant
export const ArcaneOrbEffect: React.FC<{
    position: [number, number, number];
    targetPosition?: [number, number, number];
    onComplete: () => void;
}> = ({ position, targetPosition, onComplete }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 700;
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

        const distance = progress * 15;
        groupRef.current.position.set(
            position[0] + direction.x * distance,
            position[1] + 0.8,
            position[2] + direction.z * distance
        );

        groupRef.current.rotation.y += 0.15;

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={position}>
            <PixelOrb position={[0, 0, 0]} color="#8b5cf6" scale={1.2} />
            <ArcanePixels position={[0, 0, 0]} color="#a855f7" count={12} spread={0.4} progress={progressRef.current} />
            <pointLight color="#8b5cf6" intensity={3} distance={3} />
        </group>
    );
};

// FrostShardEffect = IceBlockEffect variant  
export const FrostShardEffect = IceBlockEffect;

// MagicMissileEffect = ArcaneOrbEffect
export const MagicMissileEffect = ArcaneOrbEffect;

// ═══════════════════════════════════════════════════════════════════════════
// MAGE SKILL MAP
// ═══════════════════════════════════════════════════════════════════════════
export const MAGE_EFFECTS: Record<string, React.FC<any>> = {
    // Yeni pixel element efektleri
    fireball_effect: FireballEffect,
    iceblock_effect: IceBlockEffect,
    teleport_effect: TeleportEffect,
    lightning_effect: LightningEffect,
    drain_effect: DrainEffect,
    arcane_storm: ArcaneStormEffect,

    // Eski key'ler (backward compat)
    arcane_orb: ArcaneOrbEffect,
    frost_shard: FrostShardEffect,
    magic_missile: MagicMissileEffect,

    // Components/constants.ts keys
    fireball: FireballEffect,
    iceblock: IceBlockEffect,
    teleport: TeleportEffect,
    lightning: LightningEffect,
    drain: DrainEffect,
    meteor: ArcaneStormEffect,

    // Root constants.ts visual keys
    mage_fireball: FireballEffect,
    mage_ice: IceBlockEffect,
    mage_arcane: ArcaneOrbEffect,
    mage_blink: TeleportEffect,
    mage_storm: ArcaneStormEffect,

    // Kısa key'ler
    fire: FireballEffect,
    ice: IceBlockEffect,
    blink: TeleportEffect,
    bolt: LightningEffect,
    arcane: ArcaneOrbEffect,
    storm: ArcaneStormEffect,
    missile: ArcaneOrbEffect,
};

export default MAGE_EFFECTS;
