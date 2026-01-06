// ═══════════════════════════════════════════════════════════════════════════
// ARCTIC KNIGHT (BUZ ŞÖVALYESİ) SKILL EFFECTS
// Pixel/Shiny buz temalı efektler - WarriorEffects tarzında
// ═══════════════════════════════════════════════════════════════════════════

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

// ═══════════════════════════════════════════════════════════════════════════
// ICE PIXELS - Buz parıltıları
// ═══════════════════════════════════════════════════════════════════════════
const IcePixels: React.FC<{
    position: [number, number, number];
    color?: string;
    count?: number;
    spread?: number;
    progress: number;
    pixelSize?: number;
}> = ({ position, color = '#66ccff', count = 20, spread = 1, progress, pixelSize = 0.06 }) => {
    const pixels = useMemo(() => {
        const arr = [];
        for (let i = 0; i < count; i++) {
            arr.push({
                x: (Math.random() - 0.5) * spread * 2,
                y: Math.random() * spread,
                z: (Math.random() - 0.5) * spread * 2,
                size: pixelSize + Math.random() * pixelSize,
                isWhite: Math.random() > 0.6,
            });
        }
        return arr;
    }, [count, spread, pixelSize]);

    return (
        <group position={position}>
            {pixels.map((px, i) => (
                <mesh key={i} position={[px.x, px.y, px.z]}>
                    <boxGeometry args={[px.size, px.size, px.size]} />
                    <meshBasicMaterial
                        color={px.isWhite ? '#ffffff' : color}
                        transparent
                        opacity={0.9 * (1 - progress)}
                        blending={THREE.AdditiveBlending}
                    />
                </mesh>
            ))}
            <pointLight color={color} intensity={1.5 * (1 - progress)} distance={2} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 1️⃣ BUZ KESİĞİ (Ice Slash) - Genişleyen buz halkası
// ═══════════════════════════════════════════════════════════════════════════
export const IceSlashEffect: React.FC<{
    position: [number, number, number];
    onComplete: () => void;
}> = ({ position, onComplete }) => {
    const groupRef = useRef<THREE.Group>(null);
    const ringRef = useRef<THREE.Mesh>(null);
    const startTime = useRef(Date.now());
    const duration = 400;
    const progressRef = useRef(0);

    useFrame(() => {
        if (!groupRef.current || !ringRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;

        const scale = 0.4 + progress * 2.5;
        ringRef.current.scale.set(scale, scale, 1);
        (ringRef.current.material as THREE.MeshBasicMaterial).opacity = 0.8 * (1 - progress);

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={[position[0], 0.15, position[2]]}>
            <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.4, 1.1, 16]} />
                <meshBasicMaterial
                    color="#66ccff"
                    transparent
                    opacity={0.8}
                    side={THREE.DoubleSide}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.2, 0.5, 12]} />
                <meshBasicMaterial
                    color="#ffffff"
                    transparent
                    opacity={0.9}
                    side={THREE.DoubleSide}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
            <IcePixels position={[0, 0.2, 0]} color="#66ccff" count={25} spread={1.5} progress={progressRef.current} />
            <pointLight color="#66ccff" intensity={4 * (1 - progressRef.current)} distance={4} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 2️⃣ AYAZ ZIRHI (Frost Armor) - Dönen buz kristalleri
// ═══════════════════════════════════════════════════════════════════════════
export const FrostArmorEffect: React.FC<{
    position: [number, number, number];
    onComplete: () => void;
    playerGroupRef?: React.MutableRefObject<THREE.Group | null>;
    followPlayer?: boolean;
}> = ({ position, onComplete, playerGroupRef, followPlayer = false }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 4000;
    const progressRef = useRef(0);

    const crystalPositions = useMemo(() => {
        const positions = [];
        const count = 6;
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            positions.push({
                angle,
                x: Math.cos(angle) * 1.5,
                z: Math.sin(angle) * 1.5,
                height: 0.8 + (i % 2) * 0.3,
            });
        }
        return positions;
    }, []);

    useFrame((state) => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = elapsed / duration;
        progressRef.current = progress;

        if (followPlayer && playerGroupRef?.current) {
            const playerWorldPos = new THREE.Vector3();
            playerGroupRef.current.getWorldPosition(playerWorldPos);
            groupRef.current.position.set(playerWorldPos.x, playerWorldPos.y, playerWorldPos.z);
        }

        groupRef.current.rotation.y += 0.02;

        if (progress > 0.85) {
            groupRef.current.traverse((child) => {
                if ((child as THREE.Mesh).isMesh && (child as THREE.Mesh).material) {
                    ((child as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity *= 0.95;
                }
            });
        }

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={position}>
            {crystalPositions.map((cp, i) => (
                <group key={i} position={[cp.x, cp.height, cp.z]} rotation={[0, cp.angle + Math.PI / 2, 0]}>
                    <mesh>
                        <boxGeometry args={[0.15, 0.8, 0.4]} />
                        <meshBasicMaterial
                            color={i % 2 === 0 ? '#ffffff' : '#66ccff'}
                            transparent
                            opacity={0.7}
                            blending={THREE.AdditiveBlending}
                        />
                    </mesh>
                </group>
            ))}
            {[0, 1, 2].map(ring => (
                <mesh key={ring} rotation={[-Math.PI / 2, 0, ring * 0.2]} position={[0, 0.1 + ring * 0.15, 0]}>
                    <ringGeometry args={[1.0 + ring * 0.25, 1.2 + ring * 0.25, 8]} />
                    <meshBasicMaterial
                        color={ring === 1 ? '#ffffff' : '#66ccff'}
                        transparent
                        opacity={0.3 - ring * 0.08}
                        blending={THREE.AdditiveBlending}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            ))}
            <IcePixels position={[0, 0.8, 0]} color="#ffffff" count={30} spread={2} progress={progressRef.current} pixelSize={0.06} />
            <pointLight color="#66ccff" intensity={3 * (1 - progressRef.current)} distance={4} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 3️⃣ BUZ MIZRAĞI (Ice Spear) - İlerleyen buz mızrağı
// ═══════════════════════════════════════════════════════════════════════════
export const IceSpearEffect: React.FC<{
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
                targetPosition[1] - position[1],
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

        if (progress > 0.8) {
            groupRef.current.traverse((child) => {
                if ((child as THREE.Mesh).isMesh && (child as THREE.Mesh).material) {
                    ((child as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = 1 - (progress - 0.8) / 0.2;
                }
            });
        }

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={position} rotation={[Math.PI / 2, 0, Math.atan2(direction.x, direction.z)]}>
            <mesh>
                <coneGeometry args={[0.15, 1.5, 8]} />
                <meshBasicMaterial color="#aaddff" transparent opacity={1} blending={THREE.AdditiveBlending} />
            </mesh>
            <mesh position={[0, -0.8, 0]}>
                <cylinderGeometry args={[0.08, 0.08, 0.8, 6]} />
                <meshBasicMaterial color="#66ccff" transparent opacity={0.9} blending={THREE.AdditiveBlending} />
            </mesh>
            <IcePixels position={[0, -1, 0]} color="#aaddff" count={15} spread={0.4} progress={progressRef.current} pixelSize={0.04} />
            <pointLight color="#aaddff" intensity={2} distance={3} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 4️⃣ DONDURAN BAKIŞ (Freezing Gaze) - Yavaşlatma aurası
// ═══════════════════════════════════════════════════════════════════════════
export const FreezingGazeEffect: React.FC<{
    position: [number, number, number];
    onComplete: () => void;
}> = ({ position, onComplete }) => {
    const groupRef = useRef<THREE.Group>(null);
    const sphereRef = useRef<THREE.Mesh>(null);
    const startTime = useRef(Date.now());
    const duration = 3000;
    const progressRef = useRef(0);

    useFrame((state) => {
        if (!groupRef.current || !sphereRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = elapsed / duration;
        progressRef.current = progress;
        const time = state.clock.elapsedTime;

        const pulse = 2.5 + Math.sin(time * 4) * 0.3;
        sphereRef.current.scale.set(pulse, pulse, pulse);
        groupRef.current.rotation.y += 0.01;

        if (progress > 0.7) {
            (sphereRef.current.material as THREE.MeshBasicMaterial).opacity = 0.25 * (1 - (progress - 0.7) / 0.3);
        }

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={position}>
            <mesh ref={sphereRef}>
                <sphereGeometry args={[1, 16, 16]} />
                <meshBasicMaterial
                    color="#99ddff"
                    transparent
                    opacity={0.25}
                    blending={THREE.AdditiveBlending}
                    side={THREE.DoubleSide}
                />
            </mesh>
            <IcePixels position={[0, 1, 0]} color="#ffffff" count={40} spread={2.5} progress={progressRef.current} pixelSize={0.05} />
            <pointLight color="#99ddff" intensity={3 * (1 - progressRef.current * 0.5)} distance={5} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 5️⃣ ÇIĞ (Avalanche) - AOE buz dalgası
// ═══════════════════════════════════════════════════════════════════════════
export const AvalancheEffect: React.FC<{
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

        if (progress > 0.7) {
            groupRef.current.traverse((child) => {
                if ((child as THREE.Mesh).isMesh && (child as THREE.Mesh).material) {
                    ((child as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity *= 0.95;
                }
            });
        }

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={[position[0], 0.1, position[2]]}>
            {[0, 1, 2].map(ring => {
                const ringProgress = Math.max(0, progressRef.current - ring * 0.1);
                const scale = 1 + ringProgress * 5;
                const opacity = Math.max(0, 0.7 - ringProgress);

                return (
                    <mesh key={ring} rotation={[-Math.PI / 2, 0, ring * 0.15]} scale={[scale, scale, 1]}>
                        <ringGeometry args={[1 + ring * 0.3, 1.5 + ring * 0.3, 16]} />
                        <meshBasicMaterial
                            color={ring === 0 ? '#ffffff' : '#77ccff'}
                            transparent
                            opacity={opacity}
                            side={THREE.DoubleSide}
                            blending={THREE.AdditiveBlending}
                        />
                    </mesh>
                );
            })}
            <IcePixels position={[0, 0.5, 0]} color="#77ccff" count={50} spread={3.5} progress={progressRef.current} pixelSize={0.07} />
            <pointLight color="#77ccff" intensity={5 * (1 - progressRef.current)} distance={6} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 6️⃣ KAR FIRTINASI (Blizzard) - ULTIMATE
// ═══════════════════════════════════════════════════════════════════════════
export const BlizzardEffect: React.FC<{
    position: [number, number, number];
    onComplete: () => void;
}> = ({ position, onComplete }) => {
    const groupRef = useRef<THREE.Group>(null);
    const stormRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 5000;
    const progressRef = useRef(0);

    const snowflakes = useMemo(() => {
        return Array.from({ length: 60 }).map(() => ({
            angle: Math.random() * Math.PI * 2,
            radius: 0.5 + Math.random() * 4,
            height: Math.random() * 3,
            size: 0.06 + Math.random() * 0.08,
            speed: 1 + Math.random() * 2,
        }));
    }, []);

    useFrame((state) => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;
        const time = state.clock.elapsedTime;

        if (stormRef.current) {
            stormRef.current.rotation.y += 0.1;
        }

        const scalePhase = progress < 0.1 ? progress / 0.1 : 1;
        const shrinkPhase = progress > 0.85 ? 1 - ((progress - 0.85) / 0.15) : 1;
        const scale = scalePhase * shrinkPhase;
        groupRef.current.scale.set(scale, scale, scale);

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={position}>
            <group ref={stormRef}>
                <mesh>
                    <cylinderGeometry args={[0.5, 5, 3, 24, 1, true]} />
                    <meshBasicMaterial
                        color="#ccffff"
                        transparent
                        opacity={0.35}
                        side={THREE.DoubleSide}
                        blending={THREE.AdditiveBlending}
                    />
                </mesh>
                {snowflakes.map((sf, i) => {
                    const t = Date.now() * 0.001 * sf.speed;
                    const x = Math.cos(sf.angle + t) * sf.radius;
                    const z = Math.sin(sf.angle + t) * sf.radius;
                    const y = (sf.height + t * 0.3) % 3;

                    return (
                        <mesh key={i} position={[x, y, z]}>
                            <boxGeometry args={[sf.size, sf.size, sf.size]} />
                            <meshBasicMaterial
                                color={i % 5 === 0 ? '#ccffff' : '#ffffff'}
                                transparent
                                opacity={0.7 * (1 - progressRef.current * 0.3)}
                                blending={THREE.AdditiveBlending}
                            />
                        </mesh>
                    );
                })}
            </group>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
                <ringGeometry args={[0, 5, 16]} />
                <meshBasicMaterial
                    color="#ccffff"
                    transparent
                    opacity={0.2 * (1 - progressRef.current * 0.5)}
                    side={THREE.DoubleSide}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
            <IcePixels position={[0, 1.5, 0]} color="#ffffff" count={60} spread={4} progress={progressRef.current} pixelSize={0.08} />
            <pointLight color="#ccffff" intensity={6 * (1 - progressRef.current)} distance={8} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// ARCTIC KNIGHT SKILL MAP - constants.ts visual değerleriyle eşleşiyor
// ═══════════════════════════════════════════════════════════════════════════
export const ARCTIC_KNIGHT_EFFECTS: Record<string, React.FC<any>> = {
    // constants.ts'deki visual değerler
    ice_slash: IceSlashEffect,
    ice_armor: FrostArmorEffect,
    ice_spear: IceSpearEffect,
    freeze_breath: FreezingGazeEffect,
    ice_floor: AvalancheEffect,
    blizzard: BlizzardEffect,
};

export default ARCTIC_KNIGHT_EFFECTS;
