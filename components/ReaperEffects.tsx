// ═══════════════════════════════════════════════════════════════════════════
// REAPER (ÖLÜM MELEĞİ) SKILL EFFECTS
// Tırpan, ruh hasadı ve karanlık portal pixel efektleri
// Box/plane tabanlı - Keskin köşe, canlı düz renk
// ═══════════════════════════════════════════════════════════════════════════

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Instances, Instance } from '@react-three/drei';

// ═══════════════════════════════════════════════════════════════════════════
// 🟢 DEATH PIXEL - Yeniden kullanılabilir ölüm enerjisi küpü
// ═══════════════════════════════════════════════════════════════════════════
const DeathPixel: React.FC<{
    position: [number, number, number];
    rotation?: [number, number, number];
    scale?: number;
    color: string;
    opacity?: number;
}> = ({ position, rotation = [0, 0, 0], scale = 1, color, opacity = 0.95 }) => {
    return (
        <mesh position={position} rotation={rotation} scale={[scale, scale, scale]}>
            <boxGeometry args={[0.14, 0.14, 0.14]} />
            <meshBasicMaterial
                color={color}
                transparent
                opacity={opacity}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </mesh>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// SOUL PIXELS - Ruh parçacıkları
// ═══════════════════════════════════════════════════════════════════════════
const SoulPixels: React.FC<{
    position: [number, number, number];
    color?: string;
    count?: number;
    spread?: number;
    progress: number;
}> = ({ position, color = '#3dffcf', count = 15, spread = 0.5, progress }) => {
    const pixels = useMemo(() => {
        return Array.from({ length: count }).map(() => ({
            x: (Math.random() - 0.5) * spread,
            y: (Math.random() - 0.5) * spread,
            z: (Math.random() - 0.5) * spread * 2,
            size: 0.04 + Math.random() * 0.04,
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
                    depthWrite={false}
                />
                {pixels.map((px, i) => (
                    <Instance
                        key={i}
                        position={[px.x, px.y + progress * 0.3, px.z]}
                        scale={[px.size, px.size, px.size]}
                    />
                ))}
            </Instances>
        </group>
    );
};

// Easing fonksiyonları
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInCubic = (t: number) => t * t * t;

// ═══════════════════════════════════════════════════════════════════════════
// 🗡️ SKILL 1 – TIRPAN (Scythe Sweep) - Geniş biçme hareketi
// ═══════════════════════════════════════════════════════════════════════════
export const ScytheSweepEffect: React.FC<{
    position: [number, number, number];
    targetPosition?: [number, number, number];
    onComplete: () => void;
}> = ({ position, targetPosition, onComplete }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 500;
    const progressRef = useRef(0);
    const arcCount = 24;
    const sparkCount = 16;

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

    const baseAngle = Math.atan2(direction.x, direction.z);

    // Spark yönleri
    const sparkVel = useMemo(() => {
        return Array.from({ length: sparkCount }).map(() => ({
            angle: baseAngle + (Math.random() - 0.5) * 1.2,
            speed: 0.12 + Math.random() * 0.12,
        }));
    }, [baseAngle, sparkCount]);

    useFrame(() => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={position}>
            {/* Arc küpleri - biçme yayı */}
            {Array.from({ length: arcCount }).map((_, i) => {
                const p = i / (arcCount - 1);
                const arcSpan = Math.PI * 0.95;
                const ang = baseAngle - arcSpan / 2 + p * arcSpan;
                const r = 1.7 * (0.85 + p * 0.25) * (0.65 + easeOutCubic(progressRef.current) * 0.7);

                return (
                    <DeathPixel
                        key={`arc-${i}`}
                        position={[
                            Math.sin(ang) * r,
                            0.35 + (i % 3) * 0.08,
                            Math.cos(ang) * r
                        ]}
                        color="#3dffcf"
                        opacity={0.9 * (1 - progressRef.current)}
                        scale={0.9 + (1 - progressRef.current) * 0.5}
                    />
                );
            })}

            {/* Spark küpleri - uç kıvılcımlar */}
            {sparkVel.map((spark, i) => {
                const dist = progressRef.current * 10 * spark.speed;
                return (
                    <DeathPixel
                        key={`spark-${i}`}
                        position={[
                            Math.sin(spark.angle) * dist,
                            0.5 + (1 - progressRef.current) * 0.3,
                            Math.cos(spark.angle) * dist
                        ]}
                        color="#9affff"
                        opacity={0.9 * (1 - progressRef.current)}
                        scale={0.8 + (1 - progressRef.current) * 0.6}
                    />
                );
            })}

            <pointLight color="#3dffcf" intensity={3 * (1 - progressRef.current)} distance={4} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// ☠️ SKILL 2 – ÖLÜM DOKUNUŞU (Death Touch) - DOT
// ═══════════════════════════════════════════════════════════════════════════
export const DeathTouchEffect: React.FC<{
    position: [number, number, number];
    targetPosition?: [number, number, number];
    onComplete: () => void;
}> = ({ position, targetPosition, onComplete }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 2500; // DOT daha uzun
    const progressRef = useRef(0);
    const tickCount = 18;

    const spawnPos = targetPosition || position;

    const ticks = useMemo(() => {
        return Array.from({ length: tickCount }).map(() => ({
            y: Math.random() * 0.5,
            drift: 0.02 + Math.random() * 0.03,
            ang: Math.random() * Math.PI * 2,
        }));
    }, [tickCount]);

    useFrame(() => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;

        groupRef.current.rotation.y += 0.04;

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={spawnPos}>
            {/* Zemin rune halkası */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
                <ringGeometry args={[0.5, 0.7, 16]} />
                <meshBasicMaterial
                    color="#33ffd4"
                    transparent
                    opacity={0.75 * (1 - easeInCubic(progressRef.current) * 0.35)}
                    blending={THREE.AdditiveBlending}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Yukarı çıkan ruh parçaları */}
            {ticks.map((tick, i) => {
                const currentY = (tick.y + progressRef.current * tick.drift * 30) % 1.2;
                const r = 0.65 + (i % 3) * 0.12;
                const ang = tick.ang + progressRef.current * 6;

                return (
                    <DeathPixel
                        key={i}
                        position={[
                            Math.sin(ang) * r,
                            0.2 + currentY,
                            Math.cos(ang) * r
                        ]}
                        color="#33ffd4"
                        opacity={0.95 * (1 - progressRef.current * 0.5)}
                        scale={0.8 + Math.sin(progressRef.current * 18 + i) * 0.15}
                    />
                );
            })}

            <pointLight color="#33ffd4" intensity={2} distance={3} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 🟢 SKILL 3 – RUH HASADI (Soul Reap) - Life Steal
// ═══════════════════════════════════════════════════════════════════════════
export const SoulReapEffect: React.FC<{
    position: [number, number, number];
    targetPosition?: [number, number, number];
    onComplete: () => void;
}> = ({ position, targetPosition, onComplete }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 800;
    const progressRef = useRef(0);
    const soulCount = 22;

    const fromPos = targetPosition || [position[0] + 3, position[1], position[2]];
    const toPos = position;

    const souls = useMemo(() => {
        return Array.from({ length: soulCount }).map(() => ({
            phase: Math.random() * Math.PI * 2,
            amp: 0.08 + Math.random() * 0.12,
            lift: 0.05 + Math.random() * 0.06,
        }));
    }, [soulCount]);

    useFrame(() => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef}>
            {souls.map((soul, i) => {
                const p = i / (soulCount - 1);
                const e = easeOutCubic(progressRef.current);
                const along = (p * 0.9 + e * 0.35);

                const baseX = fromPos[0] + (toPos[0] - fromPos[0]) * along;
                const baseZ = fromPos[2] + (toPos[2] - fromPos[2]) * along;

                // Yan sapma
                const dir = new THREE.Vector3(toPos[0] - fromPos[0], 0, toPos[2] - fromPos[2]).normalize();
                const sideX = -dir.z * Math.sin(progressRef.current * 18 + soul.phase) * soul.amp;
                const sideZ = dir.x * Math.sin(progressRef.current * 18 + soul.phase) * soul.amp;

                return (
                    <DeathPixel
                        key={i}
                        position={[
                            baseX + sideX,
                            0.9 + Math.sin(progressRef.current * 15 + soul.phase) * soul.lift,
                            baseZ + sideZ
                        ]}
                        color="#54ffe2"
                        opacity={0.95 * (1 - progressRef.current)}
                        scale={0.75 + (1 - progressRef.current) * 0.45}
                    />
                );
            })}

            <pointLight position={toPos as [number, number, number]} color="#54ffe2" intensity={3} distance={4} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 🌑 SKILL 4 – KARANLIK GEÇİT (Dark Passage) - Portal
// ═══════════════════════════════════════════════════════════════════════════
export const DarkPassageEffect: React.FC<{
    position: [number, number, number];
    onComplete: () => void;
}> = ({ position, onComplete }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 800;
    const progressRef = useRef(0);

    // Kapı çerçevesi noktaları
    const framePts = useMemo(() => {
        const pts: [number, number, number][] = [];
        const w = 0.9, h = 1.6;
        // Sol kenar
        for (let i = 0; i < 10; i++) pts.push([-w, 0.2 + (h * i) / 9, 0]);
        // Sağ kenar
        for (let i = 0; i < 10; i++) pts.push([w, 0.2 + (h * i) / 9, 0]);
        // Alt
        for (let i = 0; i < 4; i++) pts.push([-w + (2 * w * i) / 3, 0.2, 0]);
        // Üst
        for (let i = 0; i < 4; i++) pts.push([-w + (2 * w * i) / 3, 0.2 + h, 0]);
        return pts;
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
            {/* Zemin portal */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} scale={[0.6 + easeOutCubic(progressRef.current), 0.6 + easeOutCubic(progressRef.current), 1]}>
                <planeGeometry args={[1.7, 1.7]} />
                <meshBasicMaterial
                    color="#071b17"
                    transparent
                    opacity={0.85 * (1 - progressRef.current * 0.25)}
                    depthWrite={false}
                />
            </mesh>

            {/* Kapı çerçevesi */}
            {framePts.map((pt, i) => (
                <DeathPixel
                    key={i}
                    position={[
                        pt[0],
                        pt[1],
                        pt[2] + Math.sin(progressRef.current * 18 + i) * 0.08
                    ]}
                    color="#7bffe9"
                    opacity={0.95 * (1 - progressRef.current * 0.15)}
                    scale={0.9 + Math.sin(progressRef.current * 24 + i) * 0.15}
                />
            ))}

            <pointLight color="#7bffe9" intensity={4} distance={5} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 😱 SKILL 5 – KORKU (Fear) - Düşmanları kaçırır
// ═══════════════════════════════════════════════════════════════════════════
export const FearEffect: React.FC<{
    position: [number, number, number];
    targetPosition?: [number, number, number];
    onComplete: () => void;
}> = ({ position, targetPosition, onComplete }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 500;
    const progressRef = useRef(0);
    const ringCount = 26;
    const spikeCount = 18;

    const spawnPos = targetPosition || position;

    // Kırık halka için bazı boşluklar
    const aliveRing = useMemo(() => {
        return Array.from({ length: ringCount }, (_, i) => (i % 5 !== 0));
    }, [ringCount]);

    useFrame(() => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={spawnPos}>
            {/* Kırık halka */}
            {Array.from({ length: ringCount }).map((_, i) => {
                if (!aliveRing[i]) return null;
                const a = (i / ringCount) * Math.PI * 2;
                const r = 0.6 + easeOutCubic(progressRef.current) * 1.25;

                return (
                    <DeathPixel
                        key={`ring-${i}`}
                        position={[
                            Math.sin(a) * r,
                            0.15 + (i % 2) * 0.07,
                            Math.cos(a) * r
                        ]}
                        color="#2fffd6"
                        opacity={0.9 * (1 - progressRef.current)}
                        scale={0.9 + (1 - progressRef.current) * 0.6}
                    />
                );
            })}

            {/* Korku dikenleri */}
            {Array.from({ length: spikeCount }).map((_, i) => {
                const a = (i / spikeCount) * Math.PI * 2;
                const r = 0.35 + easeOutCubic(progressRef.current) * 0.95;

                return (
                    <DeathPixel
                        key={`spike-${i}`}
                        position={[
                            Math.sin(a) * r,
                            0.25 + easeOutCubic(progressRef.current) * 0.35,
                            Math.cos(a) * r
                        ]}
                        color="#b2fff3"
                        opacity={0.95 * (1 - progressRef.current)}
                        scale={0.7 + (1 - progressRef.current) * 0.9}
                    />
                );
            })}

            <pointLight color="#2fffd6" intensity={5 * (1 - progressRef.current)} distance={4} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 💜 SKILL 6 – KIYAMET ÇAĞRISI (Apocalypse Call) - ULTİ
// ═══════════════════════════════════════════════════════════════════════════
export const ApocalypseCallEffect: React.FC<{
    position: [number, number, number];
    onComplete: () => void;
    playerGroupRef?: React.MutableRefObject<THREE.Group | null>;
    followPlayer?: boolean;
}> = ({ position, onComplete, playerGroupRef, followPlayer = false }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 8000; // Ulti daha uzun
    const progressRef = useRef(0);
    const soulCount = 90;
    const columnCount = 36;

    const souls = useMemo(() => {
        return Array.from({ length: soulCount }).map(() => ({
            ang: Math.random() * Math.PI * 2,
            rad: 0.4 + Math.random() * 1.6,
            rise: 0.02 + Math.random() * 0.05,
            wob: 0.06 + Math.random() * 0.12,
        }));
    }, [soulCount]);

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
            {/* Zemin koyu alan */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} scale={[0.6 + easeOutCubic(Math.min(progressRef.current * 1.2, 1)), 0.6 + easeOutCubic(Math.min(progressRef.current * 1.2, 1)), 1]}>
                <planeGeometry args={[3.2, 3.2]} />
                <meshBasicMaterial
                    color="#05040a"
                    transparent
                    opacity={0.9 * (1 - progressRef.current * 0.55)}
                    depthWrite={false}
                />
            </mesh>

            {/* Dönen rune halkası */}
            <mesh rotation={[-Math.PI / 2, progressRef.current * 3, 0]} position={[0, 0.03, 0]} scale={[0.6 + easeOutCubic(Math.min(progressRef.current * 1.2, 1)) * 0.96, 0.6 + easeOutCubic(Math.min(progressRef.current * 1.2, 1)) * 0.96, 1]}>
                <ringGeometry args={[1.2, 1.5, 32]} />
                <meshBasicMaterial
                    color="#9b5cff"
                    transparent
                    opacity={0.55 * (1 - easeInCubic(progressRef.current) * 0.3)}
                    blending={THREE.AdditiveBlending}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Dikey sütun - blok spiral */}
            {Array.from({ length: columnCount }).map((_, i) => {
                const p = i / (columnCount - 1);
                const y = 0.2 + p * 2.8 * easeOutCubic(Math.min(progressRef.current * 1.1, 1));
                const a = progressRef.current * 9 + i * 0.35;
                const r = 0.18 + Math.sin(i * 0.6 + progressRef.current * 12) * 0.06;

                return (
                    <DeathPixel
                        key={`col-${i}`}
                        position={[
                            Math.sin(a) * r,
                            y,
                            Math.cos(a) * r
                        ]}
                        color="#9b5cff"
                        opacity={0.9 * (1 - progressRef.current * 0.25)}
                        scale={1.1}
                    />
                );
            })}

            {/* Ruh sürüsü */}
            {souls.map((soul, i) => {
                const currentRad = soul.rad + progressRef.current * 0.3;
                const a = soul.ang + progressRef.current * 6.6;
                const y = Math.min(progressRef.current * 9.6 * soul.rise * 18, 3.2);
                const wobX = Math.sin(progressRef.current * 18 + i) * soul.wob;
                const wobZ = Math.cos(progressRef.current * 18 + i) * soul.wob;

                return (
                    <DeathPixel
                        key={`soul-${i}`}
                        position={[
                            Math.sin(a) * currentRad + wobX,
                            0.25 + y,
                            Math.cos(a) * currentRad + wobZ
                        ]}
                        color="#2fffd6"
                        opacity={0.95 * (1 - progressRef.current * 0.35)}
                        scale={0.85 + (1 - progressRef.current) * 0.35}
                    />
                );
            })}

            <pointLight color="#9b5cff" intensity={6} distance={10} />
            <pointLight position={[0, 2, 0]} color="#2fffd6" intensity={4} distance={6} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// ESKI EFEKTLER (backward compatibility aliases)
// ═══════════════════════════════════════════════════════════════════════════

// ShadowSlashEffect = ScytheSweepEffect
export const ShadowSlashEffect = ScytheSweepEffect;

// SoulDrainEffect = SoulReapEffect
export const SoulDrainEffect = SoulReapEffect;

// ShadowBlastEffect = FearEffect
export const ShadowBlastEffect = FearEffect;

// DoomEffect = DeathTouchEffect
export const DoomEffect = DeathTouchEffect;

// ═══════════════════════════════════════════════════════════════════════════
// REAPER SKILL MAP
// ═══════════════════════════════════════════════════════════════════════════
export const REAPER_EFFECTS: Record<string, React.FC<any>> = {
    // ✅ CONSTANTS.TS VISUAL KEYS (GERÇEK KEY'LER)
    reaper_slice: ScytheSweepEffect,
    reaper_soul_slice: DeathTouchEffect,
    reaper_wave: SoulReapEffect,
    reaper_spin: DarkPassageEffect,
    reaper_cross: FearEffect,

    // Yeni pixel death efektleri
    scythe_sweep: ScytheSweepEffect,
    death_touch: DeathTouchEffect,
    soul_reap: SoulReapEffect,
    dark_passage: DarkPassageEffect,
    fear: FearEffect,
    apocalypse_call: ApocalypseCallEffect,

    // Eski key'ler (backward compat)
    shadow_slash: ShadowSlashEffect,
    soul_drain: SoulDrainEffect,
    shadow_blast: ShadowBlastEffect,
    doom: DoomEffect,

    // Components/constants.ts keys
    scythe: ScytheSweepEffect,
    reap: SoulReapEffect,
    portal: DarkPassageEffect,
    terror: FearEffect,
    apocalypse: ApocalypseCallEffect,

    // Root constants.ts visual keys
    reaper_slash: ScytheSweepEffect,
    reaper_drain: SoulReapEffect,
    reaper_shadow: DarkPassageEffect,
    reaper_ult: ApocalypseCallEffect,

    // Kısa key'ler
    slash: ScytheSweepEffect,
    touch: DeathTouchEffect,
    harvest: SoulReapEffect,
    passage: DarkPassageEffect,
    scare: FearEffect,
    ulti: ApocalypseCallEffect,
};

export default REAPER_EFFECTS;
