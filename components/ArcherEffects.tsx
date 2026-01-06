// ═══════════════════════════════════════════════════════════════════════════
// ARCHER (OKÇU) SKILL EFFECTS
// Pixel/Shiny yeşil temalı ok ve rüzgar efektleri
// ═══════════════════════════════════════════════════════════════════════════

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Instances, Instance } from '@react-three/drei';

// ═══════════════════════════════════════════════════════════════════════════
// ARROW PIXELS - Ok parıltıları  
// ═══════════════════════════════════════════════════════════════════════════
const ArrowPixels: React.FC<{
    position: [number, number, number];
    color?: string;
    count?: number;
    spread?: number;
    progress: number;
}> = ({ position, color = '#66ff66', count = 15, spread = 0.5, progress }) => {
    const pixels = useMemo(() => {
        return Array.from({ length: count }).map(() => ({
            x: (Math.random() - 0.5) * spread,
            y: (Math.random() - 0.5) * spread,
            z: (Math.random() - 0.5) * spread * 2,
            size: 0.04 + Math.random() * 0.04,
            isGold: Math.random() > 0.7,
        }));
    }, [count, spread]);

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
                        color={px.isGold ? '#ffdd44' : color}
                    />
                ))}
            </Instances>
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 1️⃣ HIZLI ATIŞ (Rapid Shot) - Hızlı ok
// ═══════════════════════════════════════════════════════════════════════════
export const RapidShotEffect: React.FC<{
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

        const distance = progress * 25;
        groupRef.current.position.set(
            position[0] + direction.x * distance,
            position[1] + 0.8,
            position[2] + direction.z * distance
        );

        if (progress > 0.8) {
            groupRef.current.traverse((child) => {
                if ((child as THREE.Mesh).isMesh) {
                    ((child as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = 1 - (progress - 0.8) / 0.2;
                }
            });
        }

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={position} rotation={[Math.PI / 2, 0, Math.atan2(direction.x, direction.z)]}>
            <mesh>
                <cylinderGeometry args={[0.05, 0.05, 1.2, 6]} />
                <meshBasicMaterial color="#66ff66" transparent opacity={1} blending={THREE.AdditiveBlending} />
            </mesh>
            <mesh position={[0, 0.7, 0]}>
                <coneGeometry args={[0.1, 0.3, 4]} />
                <meshBasicMaterial color="#88ff88" transparent opacity={1} blending={THREE.AdditiveBlending} />
            </mesh>
            <ArrowPixels position={[0, -0.5, 0]} color="#66ff66" count={10} spread={0.3} progress={progressRef.current} />
            <pointLight color="#66ff66" intensity={2} distance={2} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 2️⃣ ÖLÜMCÜL CİRİT (Deadly Javelin) - Kritik mızrak
// ═══════════════════════════════════════════════════════════════════════════
export const DeadlyJavelinEffect: React.FC<{
    position: [number, number, number];
    targetPosition?: [number, number, number];
    onComplete: () => void;
}> = ({ position, targetPosition, onComplete }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 600;
    const progressRef = useRef(0);
    const isCrit = useRef(Math.random() < 0.3);

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

        const distance = progress * 20;
        groupRef.current.position.set(
            position[0] + direction.x * distance,
            position[1] + 0.8,
            position[2] + direction.z * distance
        );

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={position} rotation={[Math.PI / 2, 0, Math.atan2(direction.x, direction.z)]}>
            <mesh>
                <coneGeometry args={[0.15, 2, 8]} />
                <meshBasicMaterial
                    color={isCrit.current ? '#ff3300' : '#ffaa33'}
                    transparent
                    opacity={1}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
            <ArrowPixels
                position={[0, -1, 0]}
                color={isCrit.current ? '#ff6600' : '#ffaa33'}
                count={20}
                spread={0.5}
                progress={progressRef.current}
            />
            <pointLight color={isCrit.current ? '#ff3300' : '#ffaa33'} intensity={3} distance={3} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 3️⃣ AVCI ODAĞI (Hunter Focus) - Kritik buff aurası
// ═══════════════════════════════════════════════════════════════════════════
export const HunterFocusEffect: React.FC<{
    position: [number, number, number];
    onComplete: () => void;
    playerGroupRef?: React.MutableRefObject<THREE.Group | null>;
    followPlayer?: boolean;
}> = ({ position, onComplete, playerGroupRef, followPlayer = false }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 3000;
    const progressRef = useRef(0);

    useFrame((state) => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = elapsed / duration;
        progressRef.current = progress;
        const time = state.clock.elapsedTime;

        if (followPlayer && playerGroupRef?.current) {
            const pos = new THREE.Vector3();
            playerGroupRef.current.getWorldPosition(pos);
            groupRef.current.position.set(pos.x, pos.y, pos.z);
        }

        groupRef.current.rotation.y = time * 2;

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={position}>
            {[0, 1, 2].map(i => (
                <mesh key={i} rotation={[-Math.PI / 2, 0, i * Math.PI * 2 / 3]} position={[0, 0.1 + i * 0.1, 0]}>
                    <ringGeometry args={[0.8 + i * 0.2, 1 + i * 0.2, 6]} />
                    <meshBasicMaterial
                        color={i === 1 ? '#ffdd44' : '#66ff66'}
                        transparent
                        opacity={0.4 * (1 - progressRef.current)}
                        blending={THREE.AdditiveBlending}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            ))}
            <ArrowPixels position={[0, 1, 0]} color="#ffdd44" count={25} spread={1.5} progress={progressRef.current} />
            <pointLight color="#66ff66" intensity={3 * (1 - progressRef.current)} distance={4} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 4️⃣ RÜZGAR KESİĞİ (Wind Slash) - 3x vuruş
// ═══════════════════════════════════════════════════════════════════════════
export const WindSlashEffect: React.FC<{
    position: [number, number, number];
    onComplete: () => void;
}> = ({ position, onComplete }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 600;
    const progressRef = useRef(0);

    useFrame(() => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={[position[0], 0.2, position[2]]}>
            {[0, 1, 2].map(wave => {
                const waveDelay = wave * 0.15;
                const waveProgress = Math.max(0, Math.min((progressRef.current - waveDelay) / 0.5, 1));
                const scale = 0.4 + waveProgress * 2;
                const opacity = 0.7 * (1 - waveProgress);

                return (
                    <mesh key={wave} rotation={[-Math.PI / 2, 0, wave * 0.3]} scale={[scale, scale, 1]}>
                        <ringGeometry args={[0.4, 1.2, 16]} />
                        <meshBasicMaterial
                            color={wave === 1 ? '#aaffaa' : '#99ff99'}
                            transparent
                            opacity={Math.max(0, opacity)}
                            side={THREE.DoubleSide}
                            blending={THREE.AdditiveBlending}
                        />
                    </mesh>
                );
            })}
            <ArrowPixels position={[0, 0.5, 0]} color="#99ff99" count={30} spread={2} progress={progressRef.current} />
            <pointLight color="#99ff99" intensity={4 * (1 - progressRef.current)} distance={4} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 5️⃣ GERİ ADIM (Backstep) - Geri atılma efekti
// ═══════════════════════════════════════════════════════════════════════════
export const BackstepEffect: React.FC<{
    position: [number, number, number];
    onComplete: () => void;
}> = ({ position, onComplete }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 300;
    const progressRef = useRef(0);

    useFrame(() => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={[position[0], 0.1, position[2]]}>
            {[0, 1, 2, 3].map(i => (
                <mesh key={i} position={[0, 0, -i * 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0.2, 0.4, 8]} />
                    <meshBasicMaterial
                        color="#aaffaa"
                        transparent
                        opacity={0.6 * (1 - progressRef.current) * (1 - i * 0.2)}
                        side={THREE.DoubleSide}
                        blending={THREE.AdditiveBlending}
                    />
                </mesh>
            ))}
            <ArrowPixels position={[0, 0.3, 0]} color="#66ff66" count={15} spread={1} progress={progressRef.current} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 6️⃣ EJDER OKU (Dragon Arrow) - ULTIMATE
// ═══════════════════════════════════════════════════════════════════════════
export const DragonArrowEffect: React.FC<{
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

    useFrame((state) => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;

        const distance = progress * 30;
        const scale = 1 + progress * 0.5;

        groupRef.current.position.set(
            position[0] + direction.x * distance,
            position[1] + 0.8,
            position[2] + direction.z * distance
        );
        groupRef.current.scale.set(scale, 1, scale);

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={position} rotation={[Math.PI / 2, 0, Math.atan2(direction.x, direction.z)]}>
            <mesh>
                <cylinderGeometry args={[0.2, 0.2, 3, 8]} />
                <meshBasicMaterial color="#ff6600" transparent opacity={1} blending={THREE.AdditiveBlending} />
            </mesh>
            <mesh position={[0, 1.7, 0]}>
                <coneGeometry args={[0.3, 0.6, 8]} />
                <meshBasicMaterial color="#ff3300" transparent opacity={1} blending={THREE.AdditiveBlending} />
            </mesh>
            {/* Dragon fire trail */}
            {[0, 1, 2, 3].map(i => (
                <mesh key={i} position={[0, -0.5 - i * 0.4, 0]}>
                    <sphereGeometry args={[0.15 + i * 0.05, 8, 8]} />
                    <meshBasicMaterial
                        color={i % 2 === 0 ? '#ff6600' : '#ffaa00'}
                        transparent
                        opacity={0.7 * (1 - i * 0.2) * (1 - progressRef.current * 0.5)}
                        blending={THREE.AdditiveBlending}
                    />
                </mesh>
            ))}
            <ArrowPixels position={[0, -1.5, 0]} color="#ff6600" count={40} spread={0.8} progress={progressRef.current} />
            <pointLight color="#ff6600" intensity={5} distance={5} />
            <pointLight color="#ff3300" intensity={3} distance={3} position={[0, 1, 0]} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// ARCHER SKILL MAP
// ═══════════════════════════════════════════════════════════════════════════
export const ARCHER_EFFECTS: Record<string, React.FC<any>> = {
    // Yeni style keys
    arrow_shot: RapidShotEffect,
    javelin: DeadlyJavelinEffect,
    focus: HunterFocusEffect,
    wind_slash: WindSlashEffect,
    backstep: BackstepEffect,
    dragon_arrow: DragonArrowEffect,

    // Components/constants.ts keys
    arrow: RapidShotEffect,
    multishot: WindSlashEffect,
    stealth: HunterFocusEffect,
    trap: BackstepEffect,
    dash_back: BackstepEffect,
    poison_arrow: DeadlyJavelinEffect,
    arrow_rain: DragonArrowEffect,

    // Root constants.ts visual keys (yeni)
    archer_shot: RapidShotEffect,
    hunters_focus: HunterFocusEffect,
    archer_volley: WindSlashEffect,

    // Ek alias'lar
    rapid_shot: RapidShotEffect,
    deadly_javelin: DeadlyJavelinEffect,
    hunter_focus: HunterFocusEffect,
    wind_razor: WindSlashEffect,
};

export default ARCHER_EFFECTS;
