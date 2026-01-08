// ═══════════════════════════════════════════════════════════════════════════
// ARCHER (OKÇU) SKILL EFFECTS - Warrior tarzında pixel efektler
// Pixelated shiny particles, box geometriler, MMO retro stil
// ═══════════════════════════════════════════════════════════════════════════

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

// ═══════════════════════════════════════════════════════════════════════════
// 🌟 SHINY PIXELS - Parıldayan pixel parçacıkları (Warrior'dan)
// ═══════════════════════════════════════════════════════════════════════════
const ShinyPixels: React.FC<{
    position: [number, number, number];
    color: string;
    count?: number;
    spread?: number;
    progress: number;
    pixelSize?: number;
}> = ({ position, color, count = 20, spread = 2, progress, pixelSize = 0.08 }) => {
    const groupRef = useRef<THREE.Group>(null);
    const meshRefs = useRef<THREE.Mesh[]>([]);

    const pixelData = useMemo(() => {
        const data = [];
        for (let i = 0; i < count; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            const r = Math.random() * spread;

            data.push({
                x: r * Math.sin(phi) * Math.cos(theta),
                y: r * Math.sin(phi) * Math.sin(theta),
                z: r * Math.cos(phi),
                size: pixelSize * (0.5 + Math.random() * 1.0),
                twinkleOffset: Math.random() * Math.PI * 2,
                twinkleSpeed: 5 + Math.random() * 10,
                isGold: Math.random() > 0.7,
            });
        }
        return data;
    }, [count, spread, pixelSize]);

    useFrame((state) => {
        if (!groupRef.current) return;
        const time = state.clock.elapsedTime;

        meshRefs.current.forEach((mesh, i) => {
            if (!mesh) return;
            const pd = pixelData[i];

            const twinkle = Math.sin(time * pd.twinkleSpeed + pd.twinkleOffset);
            const baseOpacity = (1 - progress) * (0.6 + twinkle * 0.4);
            (mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, baseOpacity);

            mesh.position.y = pd.y + Math.sin(time * 2 + pd.twinkleOffset) * 0.05;

            const scalePulse = 1 + twinkle * 0.3;
            mesh.scale.setScalar(pd.size * scalePulse * (1 - progress * 0.5));
        });
    });

    return (
        <group ref={groupRef} position={position}>
            {pixelData.map((pd, i) => (
                <mesh
                    key={i}
                    ref={(el) => { if (el) meshRefs.current[i] = el; }}
                    position={[pd.x, pd.y, pd.z]}
                >
                    <boxGeometry args={[1, 1, 1]} />
                    <meshBasicMaterial
                        color={pd.isGold ? '#ffd700' : color}
                        transparent
                        opacity={1}
                        blending={THREE.AdditiveBlending}
                    />
                </mesh>
            ))}
            <pointLight color={color} intensity={2 * (1 - progress)} distance={spread * 1.5} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 🏹 PIXELATED ARROW - Tek ok parçacığı
// ═══════════════════════════════════════════════════════════════════════════
const PixelArrow: React.FC<{
    position: [number, number, number];
    rotation: number;
    color: string;
    size?: number;
    trailColor?: string;
}> = ({ position, rotation, color, size = 1, trailColor }) => {
    return (
        <group position={position} rotation={[0, rotation, 0]}>
            {/* Ok ucu - üçgen piramit */}
            <mesh position={[0, 0, 0.6 * size]}>
                <coneGeometry args={[0.08 * size, 0.25 * size, 4]} />
                <meshBasicMaterial color="#ffffff" />
            </mesh>

            {/* Ok gövdesi - uzun kutu */}
            <mesh position={[0, 0, 0]}>
                <boxGeometry args={[0.06 * size, 0.06 * size, 1 * size]} />
                <meshBasicMaterial
                    color={color}
                    transparent
                    opacity={0.95}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>

            {/* Ok kuyruk tüyleri */}
            {[-0.08, 0, 0.08].map((offset, i) => (
                <mesh key={i} position={[offset * size, 0, -0.5 * size]}>
                    <boxGeometry args={[0.04 * size, 0.1 * size, 0.15 * size]} />
                    <meshBasicMaterial
                        color={trailColor || color}
                        transparent
                        opacity={0.8}
                        blending={THREE.AdditiveBlending}
                    />
                </mesh>
            ))}

            {/* Parlama noktası */}
            <pointLight color={color} intensity={1.5} distance={2} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 💫 ARROW TRAIL - Ok izi parçacıkları
// ═══════════════════════════════════════════════════════════════════════════
const ArrowTrail: React.FC<{
    positions: [number, number, number][];
    color: string;
}> = ({ positions, color }) => {
    return (
        <group>
            {positions.map((pos, i) => (
                <mesh key={i} position={pos}>
                    <boxGeometry args={[0.05, 0.05, 0.05]} />
                    <meshBasicMaterial
                        color={i % 2 === 0 ? '#ffffff' : color}
                        transparent
                        opacity={0.8 - i * 0.1}
                        blending={THREE.AdditiveBlending}
                    />
                </mesh>
            ))}
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 1️⃣ HIZLI ATIŞ (Rapid Shot) - Yeşil ok + parlayan iz
// ═══════════════════════════════════════════════════════════════════════════
export const RapidShotEffect: React.FC<{
    position: [number, number, number];
    targetPosition?: [number, number, number];
    onComplete: () => void;
}> = ({ position, targetPosition, onComplete }) => {
    const groupRef = useRef<THREE.Group>(null);
    const trailPositions = useRef<[number, number, number][]>([]);
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

    const rotationY = Math.atan2(direction.x, direction.z);

    useFrame(() => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;

        const distance = progress * 35;
        const currentPos: [number, number, number] = [
            position[0] + direction.x * distance,
            position[1] + 0.8,
            position[2] + direction.z * distance
        ];

        groupRef.current.position.set(...currentPos);

        // Trail güncelle
        if (trailPositions.current.length < 8) {
            trailPositions.current.push([...currentPos]);
        }

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef}>
            <PixelArrow position={[0, 0, 0]} rotation={rotationY} color="#66ff66" trailColor="#88ffaa" />
            <ShinyPixels position={[0, 0, -0.5]} color="#66ff66" count={12} spread={0.4} progress={progressRef.current} pixelSize={0.04} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 2️⃣ ÖLÜMCÜL CİRİT (Deadly Javelin) - Turuncu kritik ok + aura
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

    const rotationY = Math.atan2(direction.x, direction.z);

    // Dönen aura parçacıkları
    const auraParticles = useMemo(() => {
        return Array.from({ length: 8 }).map((_, i) => ({
            angle: (i / 8) * Math.PI * 2,
            radius: 0.3,
        }));
    }, []);

    useFrame((state) => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;

        const distance = progress * 40;
        groupRef.current.position.set(
            position[0] + direction.x * distance,
            position[1] + 0.8,
            position[2] + direction.z * distance
        );

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef}>
            <PixelArrow position={[0, 0, 0]} rotation={rotationY} color="#ff9933" size={1.3} trailColor="#ffcc66" />

            {/* Dönen aura */}
            {auraParticles.map((p, i) => {
                const time = Date.now() * 0.005;
                const x = Math.cos(p.angle + time) * p.radius;
                const y = Math.sin(p.angle + time) * p.radius;
                return (
                    <mesh key={i} position={[x, y, 0]}>
                        <boxGeometry args={[0.08, 0.08, 0.08]} />
                        <meshBasicMaterial
                            color={i % 2 === 0 ? '#ff6600' : '#ffaa00'}
                            transparent
                            opacity={0.9}
                            blending={THREE.AdditiveBlending}
                        />
                    </mesh>
                );
            })}

            <ShinyPixels position={[0, 0, -0.3]} color="#ffaa00" count={15} spread={0.5} progress={progressRef.current} pixelSize={0.05} />
            <pointLight color="#ff9933" intensity={3} distance={4} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 3️⃣ AVCI ODAĞI (Hunter Focus) - Dönen yeşil aura buff
// ═══════════════════════════════════════════════════════════════════════════
export const HunterFocusEffect: React.FC<{
    position: [number, number, number];
    onComplete: () => void;
    playerGroupRef?: React.MutableRefObject<THREE.Group | null>;
    followPlayer?: boolean;
}> = ({ position, onComplete, playerGroupRef, followPlayer = false }) => {
    const groupRef = useRef<THREE.Group>(null);
    const panelRefs = useRef<THREE.Mesh[]>([]);
    const startTime = useRef(Date.now());
    const duration = 10000;
    const progressRef = useRef(0);

    // Dönen paneller
    const panels = useMemo(() => {
        return Array.from({ length: 6 }).map((_, i) => ({
            angle: (i / 6) * Math.PI * 2,
            radius: 1.2,
            height: 1 + (i % 2) * 0.2,
        }));
    }, []);

    useFrame((state) => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;
        const time = state.clock.elapsedTime;

        // Oyuncuyu takip et
        if (followPlayer && playerGroupRef?.current) {
            const playerWorldPos = new THREE.Vector3();
            playerGroupRef.current.getWorldPosition(playerWorldPos);
            groupRef.current.position.copy(playerWorldPos);
        }

        // Panelleri döndür
        panelRefs.current.forEach((mesh, i) => {
            if (!mesh) return;
            const p = panels[i];
            const angle = p.angle + time * 1.5;
            mesh.position.x = Math.cos(angle) * p.radius;
            mesh.position.z = Math.sin(angle) * p.radius;
            mesh.position.y = p.height + Math.sin(time * 2 + i) * 0.1;
            mesh.rotation.y = angle + Math.PI / 2;

            // Fade out
            if (progress > 0.85) {
                (mesh.material as THREE.MeshBasicMaterial).opacity = (1 - (progress - 0.85) / 0.15) * 0.8;
            }
        });

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={position}>
            {/* Dönen koruyucu paneller */}
            {panels.map((p, i) => (
                <mesh
                    key={i}
                    ref={(el) => { if (el) panelRefs.current[i] = el; }}
                    position={[Math.cos(p.angle) * p.radius, p.height, Math.sin(p.angle) * p.radius]}
                >
                    <boxGeometry args={[0.15, 0.6, 0.4]} />
                    <meshBasicMaterial
                        color={i % 2 === 0 ? '#55ff55' : '#88ffaa'}
                        transparent
                        opacity={0.8}
                        blending={THREE.AdditiveBlending}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            ))}

            {/* Zemin halkası */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
                <ringGeometry args={[0.8, 1.3, 16]} />
                <meshBasicMaterial
                    color="#44ff88"
                    transparent
                    opacity={0.5 * (1 - progressRef.current)}
                    blending={THREE.AdditiveBlending}
                    side={THREE.DoubleSide}
                />
            </mesh>

            <ShinyPixels position={[0, 1, 0]} color="#55ff55" count={20} spread={1.5} progress={progressRef.current} pixelSize={0.06} />
            <pointLight color="#55ff55" intensity={2} distance={4} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 4️⃣ RÜZGAR KESİĞİ (Wind Slash) - 3 Ok yayılarak
// ═══════════════════════════════════════════════════════════════════════════
export const WindSlashEffect: React.FC<{
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

    const rotationY = Math.atan2(direction.x, direction.z);

    useFrame(() => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;

        const distance = progress * 35;
        groupRef.current.position.set(
            position[0] + direction.x * distance,
            position[1] + 0.8,
            position[2] + direction.z * distance
        );

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef}>
            {/* 3 ok - yayılarak */}
            {[-0.25, 0, 0.25].map((offset, i) => (
                <group key={i} position={[offset * (1 + progressRef.current * 2), 0, 0]}>
                    <PixelArrow position={[0, 0, 0]} rotation={rotationY + offset * 0.3} color="#33ccff" trailColor="#66ddff" />
                </group>
            ))}

            {/* Yay glow efekti */}
            <mesh position={[0, 0, -1]}>
                <boxGeometry args={[0.8, 0.1, 0.1]} />
                <meshBasicMaterial
                    color="#ffffff"
                    transparent
                    opacity={0.7 * (1 - progressRef.current)}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>

            <ShinyPixels position={[0, 0, 0]} color="#33ccff" count={18} spread={0.8} progress={progressRef.current} pixelSize={0.05} />
            <pointLight color="#33ccff" intensity={2.5} distance={4} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 5️⃣ GERİ ADIM (Backstep) - Geri itme dalgası
// ═══════════════════════════════════════════════════════════════════════════
export const BackstepEffect: React.FC<{
    position: [number, number, number];
    targetPosition?: [number, number, number];
    onComplete: () => void;
}> = ({ position, targetPosition, onComplete }) => {
    const groupRef = useRef<THREE.Group>(null);
    const waveRef = useRef<THREE.Mesh>(null);
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

    const rotationY = Math.atan2(direction.x, direction.z);

    useFrame(() => {
        if (!groupRef.current || !waveRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;

        const distance = progress * 20;
        groupRef.current.position.set(
            position[0] + direction.x * distance,
            position[1] + 0.5,
            position[2] + direction.z * distance
        );

        // Genişleyen dalga
        const scale = 1 + progress * 2;
        waveRef.current.scale.set(scale, 1, scale);
        (waveRef.current.material as THREE.MeshBasicMaterial).opacity = 0.7 * (1 - progress);

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} rotation={[0, rotationY, 0]}>
            {/* Knockback dalgası */}
            <mesh ref={waveRef} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.3, 0.8, 8]} />
                <meshBasicMaterial
                    color="#ff6666"
                    transparent
                    opacity={0.7}
                    blending={THREE.AdditiveBlending}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Pixel parçacıklar */}
            {Array.from({ length: 8 }).map((_, i) => {
                const angle = (i / 8) * Math.PI * 2;
                return (
                    <mesh key={i} position={[Math.cos(angle) * 0.5, 0, Math.sin(angle) * 0.5]}>
                        <boxGeometry args={[0.1, 0.1, 0.1]} />
                        <meshBasicMaterial
                            color={i % 2 === 0 ? '#ff4444' : '#ffffff'}
                            transparent
                            opacity={0.9 * (1 - progressRef.current)}
                            blending={THREE.AdditiveBlending}
                        />
                    </mesh>
                );
            })}

            <pointLight color="#ff6666" intensity={3} distance={4} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 6️⃣ EJDER OKU (Dragon Arrow) - DEV EJDERHA ULTİ 🔥🐉
// ═══════════════════════════════════════════════════════════════════════════
export const DragonArrowEffect: React.FC<{
    position: [number, number, number];
    targetPosition?: [number, number, number];
    onComplete: () => void;
}> = ({ position, targetPosition, onComplete }) => {
    const groupRef = useRef<THREE.Group>(null);
    const dragonRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 1500;
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

    const rotationY = Math.atan2(direction.x, direction.z);

    // Ejderha gövde segmentleri
    const bodySegments = useMemo(() => {
        return Array.from({ length: 12 }).map((_, i) => ({
            offset: i * 0.35,
            scale: 1 - i * 0.05,
            wobble: Math.random() * Math.PI * 2,
        }));
    }, []);

    // Alev parçacıkları
    const flameParticles = useMemo(() => {
        return Array.from({ length: 25 }).map(() => ({
            x: (Math.random() - 0.5) * 0.8,
            y: (Math.random() - 0.5) * 0.8,
            z: -Math.random() * 3,
            size: 0.08 + Math.random() * 0.12,
            speed: 0.5 + Math.random() * 0.5,
        }));
    }, []);

    useFrame((state) => {
        if (!groupRef.current || !dragonRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;
        const time = state.clock.elapsedTime;

        const distance = progress * 60;
        groupRef.current.position.set(
            position[0] + direction.x * distance,
            position[1] + 0.8,
            position[2] + direction.z * distance
        );

        // Ejderha sallanma
        dragonRef.current.rotation.z = Math.sin(time * 8) * 0.08;
        dragonRef.current.rotation.x = Math.sin(time * 6) * 0.05;

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} rotation={[0, rotationY, 0]}>
            <group ref={dragonRef}>
                {/* 🐉 EJDERHA BAŞI */}
                <group position={[0, 0, 1.5]}>
                    {/* Ana kafa */}
                    <mesh>
                        <boxGeometry args={[0.6, 0.5, 0.8]} />
                        <meshBasicMaterial
                            color="#ff4400"
                            transparent
                            opacity={0.95}
                            blending={THREE.AdditiveBlending}
                        />
                    </mesh>

                    {/* Boynuzlar */}
                    <mesh position={[-0.25, 0.35, 0.1]} rotation={[0, 0, -0.3]}>
                        <coneGeometry args={[0.08, 0.4, 4]} />
                        <meshBasicMaterial color="#ff6600" />
                    </mesh>
                    <mesh position={[0.25, 0.35, 0.1]} rotation={[0, 0, 0.3]}>
                        <coneGeometry args={[0.08, 0.4, 4]} />
                        <meshBasicMaterial color="#ff6600" />
                    </mesh>

                    {/* Gözler - parlayan */}
                    <mesh position={[-0.15, 0.1, 0.35]}>
                        <boxGeometry args={[0.12, 0.08, 0.08]} />
                        <meshBasicMaterial color="#ffffff" />
                    </mesh>
                    <mesh position={[0.15, 0.1, 0.35]}>
                        <boxGeometry args={[0.12, 0.08, 0.08]} />
                        <meshBasicMaterial color="#ffffff" />
                    </mesh>

                    {/* Ağız - ateş çıkış noktası */}
                    <mesh position={[0, -0.1, 0.4]}>
                        <boxGeometry args={[0.3, 0.15, 0.2]} />
                        <meshBasicMaterial
                            color="#ffaa00"
                            transparent
                            opacity={0.9}
                            blending={THREE.AdditiveBlending}
                        />
                    </mesh>
                </group>

                {/* 🔥 EJDERHA GÖVDESİ - Segmentli */}
                {bodySegments.map((seg, i) => {
                    const time = Date.now() * 0.003;
                    const wobbleX = Math.sin(time + seg.wobble) * 0.1 * (i * 0.1);
                    const wobbleY = Math.cos(time * 0.7 + seg.wobble) * 0.08 * (i * 0.1);

                    return (
                        <mesh
                            key={i}
                            position={[wobbleX, wobbleY, -seg.offset]}
                            scale={[seg.scale, seg.scale, 1]}
                        >
                            <boxGeometry args={[0.45, 0.4, 0.3]} />
                            <meshBasicMaterial
                                color={i % 2 === 0 ? '#ff5500' : '#ff7700'}
                                transparent
                                opacity={0.9 - i * 0.05}
                                blending={THREE.AdditiveBlending}
                            />
                        </mesh>
                    );
                })}

                {/* 🔥 ALEV TRAIL */}
                {flameParticles.map((flame, i) => (
                    <mesh key={i} position={[flame.x, flame.y, flame.z - progressRef.current * 2]}>
                        <boxGeometry args={[flame.size, flame.size, flame.size]} />
                        <meshBasicMaterial
                            color={i % 3 === 0 ? '#ffff00' : i % 3 === 1 ? '#ff8800' : '#ff4400'}
                            transparent
                            opacity={0.85 * (1 - progressRef.current * 0.3)}
                            blending={THREE.AdditiveBlending}
                        />
                    </mesh>
                ))}

                {/* Kanatlar */}
                <mesh position={[-0.6, 0.2, 0]} rotation={[0, 0, -0.4]}>
                    <boxGeometry args={[0.8, 0.1, 0.5]} />
                    <meshBasicMaterial
                        color="#ff6600"
                        transparent
                        opacity={0.8}
                        blending={THREE.AdditiveBlending}
                    />
                </mesh>
                <mesh position={[0.6, 0.2, 0]} rotation={[0, 0, 0.4]}>
                    <boxGeometry args={[0.8, 0.1, 0.5]} />
                    <meshBasicMaterial
                        color="#ff6600"
                        transparent
                        opacity={0.8}
                        blending={THREE.AdditiveBlending}
                    />
                </mesh>

                {/* Shiny parçacıklar */}
                <ShinyPixels position={[0, 0, -2]} color="#ff6600" count={35} spread={2} progress={progressRef.current} pixelSize={0.08} />
                <ShinyPixels position={[0, 0, 1]} color="#ffaa00" count={20} spread={1} progress={progressRef.current} pixelSize={0.06} />
            </group>

            {/* Işıklar */}
            <pointLight position={[0, 0, 1.5]} color="#ff4400" intensity={6} distance={6} />
            <pointLight position={[0, 0, -1]} color="#ffaa00" intensity={4} distance={5} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// EK EFEKTLER
// ═══════════════════════════════════════════════════════════════════════════

export const MultishotEffect: React.FC<{
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
            return new THREE.Vector3(targetPosition[0] - position[0], 0, targetPosition[2] - position[2]).normalize();
        }
        return new THREE.Vector3(0, 0, 1);
    }, [position, targetPosition]);

    const rotationY = Math.atan2(direction.x, direction.z);

    useFrame(() => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;

        const distance = progress * 35;
        groupRef.current.position.set(position[0] + direction.x * distance, position[1] + 0.8, position[2] + direction.z * distance);

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef}>
            {[-0.4, -0.2, 0, 0.2, 0.4].map((offset, i) => (
                <group key={i} position={[offset * (1 + progressRef.current * 1.5), 0, 0]}>
                    <PixelArrow position={[0, 0, 0]} rotation={rotationY + offset * 0.2} color="#88ff88" size={0.8} />
                </group>
            ))}
            <ShinyPixels position={[0, 0, 0]} color="#88ff88" count={25} spread={1.2} progress={progressRef.current} pixelSize={0.05} />
        </group>
    );
};

export const StealthEffect: React.FC<{
    position: [number, number, number];
    onComplete: () => void;
    playerGroupRef?: React.MutableRefObject<THREE.Group | null>;
    followPlayer?: boolean;
}> = ({ position, onComplete, playerGroupRef, followPlayer = false }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 5000;
    const progressRef = useRef(0);

    useFrame(() => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;

        if (followPlayer && playerGroupRef?.current) {
            const playerWorldPos = new THREE.Vector3();
            playerGroupRef.current.getWorldPosition(playerWorldPos);
            groupRef.current.position.copy(playerWorldPos);
        }

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={position}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
                <ringGeometry args={[0.5, 1, 8]} />
                <meshBasicMaterial color="#444444" transparent opacity={0.4 * (1 - progressRef.current)} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
            </mesh>
        </group>
    );
};

export const TrapEffect: React.FC<{
    position: [number, number, number];
    targetPosition?: [number, number, number];
    onComplete: () => void;
}> = ({ position, targetPosition, onComplete }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 3000;
    const progressRef = useRef(0);
    const spawnPos = targetPosition || position;

    useFrame((state) => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        progressRef.current = Math.min(elapsed / duration, 1);

        const pulse = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.1;
        groupRef.current.scale.setScalar(pulse);

        if (progressRef.current >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={[spawnPos[0], 0.1, spawnPos[2]]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.4, 0.7, 6]} />
                <meshBasicMaterial color="#ff4444" transparent opacity={0.7 * (1 - progressRef.current)} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
            </mesh>
            {Array.from({ length: 6 }).map((_, i) => {
                const angle = (i / 6) * Math.PI * 2;
                return (
                    <mesh key={i} position={[Math.cos(angle) * 0.55, 0.15, Math.sin(angle) * 0.55]}>
                        <coneGeometry args={[0.05, 0.25, 4]} />
                        <meshBasicMaterial color="#ff6666" />
                    </mesh>
                );
            })}
        </group>
    );
};

export const ArrowRainEffect: React.FC<{
    position: [number, number, number];
    targetPosition?: [number, number, number];
    onComplete: () => void;
}> = ({ position, targetPosition, onComplete }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 2000;
    const progressRef = useRef(0);
    const spawnPos = targetPosition || position;

    const arrows = useMemo(() => Array.from({ length: 25 }).map(() => ({
        x: (Math.random() - 0.5) * 5,
        z: (Math.random() - 0.5) * 5,
        delay: Math.random() * 0.6,
        rotation: (Math.random() - 0.5) * 0.3,
    })), []);

    useFrame(() => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        progressRef.current = Math.min(elapsed / duration, 1);
        if (progressRef.current >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={spawnPos}>
            {arrows.map((arrow, i) => {
                const arrowProgress = Math.max(0, Math.min(1, (progressRef.current - arrow.delay) / 0.4));
                const y = 6 - arrowProgress * 6;
                if (arrowProgress <= 0 || y < 0.1) return null;
                return (
                    <group key={i} position={[arrow.x, y, arrow.z]} rotation={[Math.PI / 2, 0, arrow.rotation]}>
                        <mesh>
                            <boxGeometry args={[0.04, 0.04, 0.5]} />
                            <meshBasicMaterial color="#ffff88" transparent opacity={0.9} blending={THREE.AdditiveBlending} />
                        </mesh>
                        <mesh position={[0, 0, 0.28]}>
                            <coneGeometry args={[0.05, 0.12, 4]} />
                            <meshBasicMaterial color="#ffffff" />
                        </mesh>
                    </group>
                );
            })}
            <ShinyPixels position={[0, 0.5, 0]} color="#ffff88" count={30} spread={3} progress={progressRef.current} pixelSize={0.06} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// ARCHER SKILL MAP
// ═══════════════════════════════════════════════════════════════════════════
export const ARCHER_EFFECTS: Record<string, React.FC<any>> = {
    // ✅ CONSTANTS.TS VISUAL KEYS
    archer_shot: RapidShotEffect,
    javelin: DeadlyJavelinEffect,
    hunters_focus: HunterFocusEffect,
    archer_volley: MultishotEffect,
    backstep: BackstepEffect,
    dragon_arrow: DragonArrowEffect,

    // Yeni style keys
    arrow_shot: RapidShotEffect,
    focus: HunterFocusEffect,
    wind_slash: WindSlashEffect,

    // Ek efektler
    multishot_effect: MultishotEffect,
    stealth_effect: StealthEffect,
    trap_effect: TrapEffect,
    arrow_rain_effect: ArrowRainEffect,

    // Components/constants.ts keys
    arrow: RapidShotEffect,
    multishot: MultishotEffect,
    stealth: StealthEffect,
    trap: TrapEffect,
    dash_back: BackstepEffect,
    poison_arrow: DeadlyJavelinEffect,
    arrow_rain: ArrowRainEffect,

    // Alias'lar
    rapid_shot: RapidShotEffect,
    deadly_javelin: DeadlyJavelinEffect,
    hunter_focus: HunterFocusEffect,
    wind_razor: WindSlashEffect,
};

export default ARCHER_EFFECTS;
