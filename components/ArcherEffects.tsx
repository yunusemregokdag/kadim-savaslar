// ═══════════════════════════════════════════════════════════════════════════
// ARCHER (OKÇU) SKILL EFFECTS - RESİMLERE UYGUN GERÇEK PİXEL TASARIM
// Voxel bloklar ile oluşturulmuş efektler
// ═══════════════════════════════════════════════════════════════════════════

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

// ═══════════════════════════════════════════════════════════════════════════
// PIXEL BLOCK - Tek voxel blok
// ═══════════════════════════════════════════════════════════════════════════
const PixelBlock: React.FC<{
    position: [number, number, number];
    color: string;
    size?: number;
    opacity?: number;
    emissive?: boolean;
}> = ({ position, color, size = 0.1, opacity = 1, emissive = true }) => {
    return (
        <mesh position={position}>
            <boxGeometry args={[size, size, size]} />
            <meshStandardMaterial
                color={color}
                emissive={emissive ? color : '#000000'}
                emissiveIntensity={emissive ? 0.5 : 0}
                transparent={opacity < 1}
                opacity={opacity}
            />
        </mesh>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// SPARKLE YILDIZLAR - Parlayan yıldız parçacıkları
// ═══════════════════════════════════════════════════════════════════════════
const Sparkles: React.FC<{
    position: [number, number, number];
    color: string;
    count?: number;
    spread?: number;
    progress: number;
}> = ({ position, color, count = 20, spread = 2, progress }) => {
    const groupRef = useRef<THREE.Group>(null);
    const meshRefs = useRef<THREE.Mesh[]>([]);

    const sparkleData = useMemo(() => {
        return Array.from({ length: count }).map(() => ({
            x: (Math.random() - 0.5) * spread,
            y: (Math.random() - 0.5) * spread,
            z: (Math.random() - 0.5) * spread,
            size: 0.04 + Math.random() * 0.06,
            twinkleSpeed: 4 + Math.random() * 6,
            twinkleOffset: Math.random() * Math.PI * 2,
            isWhite: Math.random() > 0.6,
        }));
    }, [count, spread]);

    useFrame((state) => {
        const time = state.clock.elapsedTime;
        meshRefs.current.forEach((mesh, i) => {
            if (!mesh) return;
            const s = sparkleData[i];
            const twinkle = Math.sin(time * s.twinkleSpeed + s.twinkleOffset);
            const mat = mesh.material as THREE.MeshStandardMaterial;
            mat.opacity = Math.max(0, (1 - progress) * (0.5 + twinkle * 0.5));
            mesh.scale.setScalar(s.size * (1 + twinkle * 0.4));
        });
    });

    return (
        <group ref={groupRef} position={position}>
            {sparkleData.map((s, i) => (
                <mesh key={i} ref={(el) => { if (el) meshRefs.current[i] = el; }} position={[s.x, s.y, s.z]}>
                    <boxGeometry args={[1, 1, 1]} />
                    <meshStandardMaterial
                        color={s.isWhite ? '#ffffff' : color}
                        emissive={s.isWhite ? '#ffffff' : color}
                        emissiveIntensity={0.8}
                        transparent
                        opacity={1}
                    />
                </mesh>
            ))}
            <pointLight color={color} intensity={2 * (1 - progress)} distance={spread * 1.5} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 1️⃣ QUICK SHOT - Basit sarı-yeşil ok (Resim 4 gibi)
// ═══════════════════════════════════════════════════════════════════════════
export const RapidShotEffect: React.FC<{
    position: [number, number, number];
    targetPosition?: [number, number, number];
    onComplete: () => void;
}> = ({ position, targetPosition, onComplete }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 1500; // YAVAŞ
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

        const distance = progress * 20;
        groupRef.current.position.set(
            position[0] + direction.x * distance,
            position[1] + 0.8,
            position[2] + direction.z * distance
        );

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} rotation={[0, rotationY, 0]}>
            {/* OK GÖVDESİ - Uzun sarı-yeşil bloklar */}
            {[0, 0.12, 0.24, 0.36, 0.48, 0.6].map((z, i) => (
                <PixelBlock key={i} position={[0, 0, z]} color={i < 2 ? '#88ff44' : '#66dd22'} size={0.08} />
            ))}
            {/* OK UCU - Sivri */}
            <PixelBlock position={[0, 0, 0.75]} color="#ccff66" size={0.1} />
            <PixelBlock position={[0, 0.05, 0.7]} color="#aaff44" size={0.06} />
            <PixelBlock position={[0, -0.05, 0.7]} color="#aaff44" size={0.06} />
            {/* KUYRUK TÜYLERİ */}
            <PixelBlock position={[0.08, 0.08, -0.1]} color="#44aa22" size={0.06} />
            <PixelBlock position={[-0.08, 0.08, -0.1]} color="#44aa22" size={0.06} />
            <PixelBlock position={[0.08, -0.08, -0.1]} color="#44aa22" size={0.06} />
            <PixelBlock position={[-0.08, -0.08, -0.1]} color="#44aa22" size={0.06} />

            <Sparkles position={[0, 0, 0.3]} color="#88ff44" count={8} spread={0.4} progress={progressRef.current} />
            <pointLight color="#88ff44" intensity={1.5} distance={2} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 2️⃣ DEADLY JAVELIN - Büyük turuncu-kırmızı ok
// ═══════════════════════════════════════════════════════════════════════════
export const DeadlyJavelinEffect: React.FC<{
    position: [number, number, number];
    targetPosition?: [number, number, number];
    onComplete: () => void;
}> = ({ position, targetPosition, onComplete }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 1800; // YAVAŞ
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

        const distance = progress * 25;
        groupRef.current.position.set(
            position[0] + direction.x * distance,
            position[1] + 0.8,
            position[2] + direction.z * distance
        );

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} rotation={[0, rotationY, 0]}>
            {/* BÜYÜK OK GÖVDESİ */}
            {[0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9].map((z, i) => (
                <PixelBlock key={i} position={[0, 0, z]} color={i < 3 ? '#ff6600' : '#ff8833'} size={0.12} />
            ))}
            {/* OK UCU */}
            <PixelBlock position={[0, 0, 1.1]} color="#ffaa00" size={0.15} />
            <PixelBlock position={[0, 0.08, 1.0]} color="#ff8800" size={0.08} />
            <PixelBlock position={[0, -0.08, 1.0]} color="#ff8800" size={0.08} />
            {/* KUYRUK */}
            <PixelBlock position={[0.1, 0.1, -0.15]} color="#cc4400" size={0.08} />
            <PixelBlock position={[-0.1, 0.1, -0.15]} color="#cc4400" size={0.08} />
            <PixelBlock position={[0.1, -0.1, -0.15]} color="#cc4400" size={0.08} />
            <PixelBlock position={[-0.1, -0.1, -0.15]} color="#cc4400" size={0.08} />

            <Sparkles position={[0, 0, 0.5]} color="#ff6600" count={12} spread={0.5} progress={progressRef.current} />
            <pointLight color="#ff6600" intensity={2} distance={3} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 3️⃣ HUNTER'S FOCUS - Oyuncuda pençeler + düşmanda halka (Resim 3 gibi)
// ═══════════════════════════════════════════════════════════════════════════
export const HunterFocusEffect: React.FC<{
    position: [number, number, number];
    targetPosition?: [number, number, number];
    onComplete: () => void;
    playerGroupRef?: React.MutableRefObject<THREE.Group | null>;
    followPlayer?: boolean;
}> = ({ position, targetPosition, onComplete }) => {
    const groupRef = useRef<THREE.Group>(null);
    const clawGroupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 4000;
    const progressRef = useRef(0);

    const spawnPos = targetPosition || position;

    useFrame((state) => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;
        const time = state.clock.elapsedTime;

        // Pençeleri döndür
        if (clawGroupRef.current) {
            clawGroupRef.current.rotation.y = time * 2;
        }

        if (progress >= 1) onComplete();
    });

    // Pençe şekli - 3 parmak
    const Claw = ({ rotation }: { rotation: number }) => (
        <group rotation={[0, rotation, 0]} position={[0, 0.5, 0]}>
            <group position={[1.0, 0, 0]}>
                {/* 3 parmak */}
                {[-0.12, 0, 0.12].map((offset, i) => (
                    <group key={i} position={[0, 0, offset]} rotation={[0, 0, (i - 1) * 0.2]}>
                        <PixelBlock position={[0, 0, 0]} color="#66ff44" size={0.08} />
                        <PixelBlock position={[0, 0.1, 0]} color="#88ff66" size={0.07} />
                        <PixelBlock position={[0, 0.2, 0]} color="#aaff88" size={0.06} />
                        <PixelBlock position={[0, 0.28, 0]} color="#ccffaa" size={0.05} />
                    </group>
                ))}
            </group>
        </group>
    );

    return (
        <group ref={groupRef} position={spawnPos}>
            {/* 4 Dönen Pençe */}
            <group ref={clawGroupRef}>
                <Claw rotation={0} />
                <Claw rotation={Math.PI / 2} />
                <Claw rotation={Math.PI} />
                <Claw rotation={Math.PI * 1.5} />
            </group>

            {/* Zemin halkası - yeşil */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
                <ringGeometry args={[0.8, 1.0, 16]} />
                <meshStandardMaterial
                    color="#44ff44"
                    emissive="#44ff44"
                    emissiveIntensity={0.5}
                    transparent
                    opacity={0.6 * (1 - progressRef.current)}
                    side={THREE.DoubleSide}
                />
            </mesh>

            <Sparkles position={[0, 0.5, 0]} color="#66ff44" count={15} spread={1.5} progress={progressRef.current} />
            <pointLight color="#44ff44" intensity={2} distance={3} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 4️⃣ BACKSTEP - Dönen halkalar (Resim 5 gibi)
// ═══════════════════════════════════════════════════════════════════════════
export const BackstepEffect: React.FC<{
    position: [number, number, number];
    targetPosition?: [number, number, number];
    onComplete: () => void;
}> = ({ position, onComplete }) => {
    const groupRef = useRef<THREE.Group>(null);
    const ring1Ref = useRef<THREE.Mesh>(null);
    const ring2Ref = useRef<THREE.Mesh>(null);
    const startTime = useRef(Date.now());
    const duration = 800;
    const progressRef = useRef(0);

    useFrame((state) => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;
        const time = state.clock.elapsedTime;

        // Halkaları döndür
        if (ring1Ref.current) ring1Ref.current.rotation.z = time * 3;
        if (ring2Ref.current) ring2Ref.current.rotation.z = -time * 2;

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={[position[0], 0.05, position[2]]}>
            {/* İç halka - sarı */}
            <mesh ref={ring1Ref} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.5, 0.65, 16]} />
                <meshStandardMaterial
                    color="#ffff44"
                    emissive="#ffff44"
                    emissiveIntensity={0.7}
                    transparent
                    opacity={0.8 * (1 - progressRef.current)}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Dış halka - yeşil */}
            <mesh ref={ring2Ref} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.9, 1.1, 16]} />
                <meshStandardMaterial
                    color="#88ff44"
                    emissive="#88ff44"
                    emissiveIntensity={0.5}
                    transparent
                    opacity={0.6 * (1 - progressRef.current)}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Parçacıklar */}
            {Array.from({ length: 8 }).map((_, i) => {
                const angle = (i / 8) * Math.PI * 2;
                return (
                    <PixelBlock
                        key={i}
                        position={[Math.cos(angle) * 0.7, 0.1, Math.sin(angle) * 0.7]}
                        color="#88ff66"
                        size={0.08}
                        opacity={1 - progressRef.current}
                    />
                );
            })}

            <Sparkles position={[0, 0.3, 0]} color="#88ff44" count={12} spread={1} progress={progressRef.current} />
            <pointLight color="#ffff44" intensity={2} distance={2} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 5️⃣ WIND SLASH - 3 ok AYNI ANDA hedefe gidiyor
// ═══════════════════════════════════════════════════════════════════════════
export const WindSlashEffect: React.FC<{
    position: [number, number, number];
    targetPosition?: [number, number, number];
    onComplete: () => void;
}> = ({ position, targetPosition, onComplete }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 1200; // Biraz daha hızlı
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

        // 3 ok birlikte hedefe gidiyor
        const distance = progress * 25;
        groupRef.current.position.set(
            position[0] + direction.x * distance,
            position[1] + 0.8,
            position[2] + direction.z * distance
        );

        if (progress >= 1) onComplete();
    });

    // Ok bileşeni - hepsi aynı yöne gidiyor
    const Arrow = ({ yOffset }: { yOffset: number }) => (
        <group position={[0, yOffset, 0]}>
            {/* Ok gövdesi */}
            {[0, 0.12, 0.24, 0.36, 0.48].map((z, i) => (
                <PixelBlock key={i} position={[0, 0, z]} color={i < 2 ? '#88ff44' : '#66dd22'} size={0.07} />
            ))}
            {/* Ok ucu */}
            <PixelBlock position={[0, 0, 0.6]} color="#aaff66" size={0.09} />
            <PixelBlock position={[0, 0.04, 0.55]} color="#88ff44" size={0.05} />
            <PixelBlock position={[0, -0.04, 0.55]} color="#88ff44" size={0.05} />
        </group>
    );

    return (
        <group ref={groupRef} rotation={[0, rotationY, 0]}>
            {/* 3 ok paralel - hepsi aynı hedefe */}
            <Arrow yOffset={0.15} />
            <Arrow yOffset={0} />
            <Arrow yOffset={-0.15} />
            <Sparkles position={[0, 0, 0.3]} color="#88ff44" count={18} spread={0.6} progress={progressRef.current} />
            <pointLight color="#88ff44" intensity={2.5} distance={4} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 6️⃣ DRAGON ARROW - GERÇEK VOXEL EJDERHA (Resim 2 gibi) 🐉
// ═══════════════════════════════════════════════════════════════════════════
export const DragonArrowEffect: React.FC<{
    position: [number, number, number];
    targetPosition?: [number, number, number];
    onComplete: () => void;
}> = ({ position, targetPosition, onComplete }) => {
    const groupRef = useRef<THREE.Group>(null);
    const dragonRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 3500; // YAVAŞ
    const progressRef = useRef(0);

    const direction = useMemo(() => {
        if (targetPosition) {
            return new THREE.Vector3(targetPosition[0] - position[0], 0, targetPosition[2] - position[2]).normalize();
        }
        return new THREE.Vector3(0, 0, 1);
    }, [position, targetPosition]);

    const rotationY = Math.atan2(direction.x, direction.z);

    useFrame((state) => {
        if (!groupRef.current || !dragonRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;
        const time = state.clock.elapsedTime;

        const distance = progress * 45;
        groupRef.current.position.set(
            position[0] + direction.x * distance,
            position[1] + 1.2,
            position[2] + direction.z * distance
        );

        // Hafif sallanma
        dragonRef.current.rotation.z = Math.sin(time * 4) * 0.08;
        dragonRef.current.position.y = Math.sin(time * 3) * 0.15;

        if (progress >= 1) onComplete();
    });

    // EJDERHA KAFASI - Resim 2'deki gibi büyük turuncu kafa
    const DragonHead = () => (
        <group position={[0, 0, 2]}>
            {/* Ana kafa - geniş */}
            {[-0.3, -0.15, 0, 0.15, 0.3].map((x) =>
                [-0.2, -0.1, 0, 0.1, 0.2].map((y) => (
                    <PixelBlock
                        key={`head-${x}-${y}`}
                        position={[x, y, 0]}
                        color={Math.abs(x) > 0.2 || Math.abs(y) > 0.15 ? '#ff8844' : '#ffaa66'}
                        size={0.15}
                    />
                ))
            )}
            {/* Burun/Ağız - Uzun */}
            {[0.2, 0.35, 0.5, 0.65].map((z, i) => (
                <group key={`snout-${z}`}>
                    <PixelBlock position={[0, 0.05, z]} color="#ffaa55" size={0.12} />
                    <PixelBlock position={[0, -0.08, z]} color="#ff9944" size={0.1} />
                    <PixelBlock position={[-0.1, 0, z]} color="#ff8833" size={0.1} />
                    <PixelBlock position={[0.1, 0, z]} color="#ff8833" size={0.1} />
                </group>
            ))}
            {/* Gözler - Parlak sarı */}
            <PixelBlock position={[-0.15, 0.12, 0.15]} color="#ffff44" size={0.1} />
            <PixelBlock position={[0.15, 0.12, 0.15]} color="#ffff44" size={0.1} />
            {/* Boynuzlar */}
            <PixelBlock position={[-0.25, 0.3, -0.1]} color="#ff6622" size={0.08} />
            <PixelBlock position={[-0.25, 0.4, -0.15]} color="#ff5511" size={0.06} />
            <PixelBlock position={[0.25, 0.3, -0.1]} color="#ff6622" size={0.08} />
            <PixelBlock position={[0.25, 0.4, -0.15]} color="#ff5511" size={0.06} />
            {/* Dişler - Alt */}
            {[-0.1, 0, 0.1].map((x) => (
                <PixelBlock key={`tooth-${x}`} position={[x, -0.2, 0.4]} color="#ffffff" size={0.06} />
            ))}
        </group>
    );

    // EJDERHA GÖVDESİ
    const DragonBody = () => (
        <group>
            {/* Gövde segmentleri */}
            {[0, -0.4, -0.8, -1.2, -1.6, -2].map((z, i) => {
                const scale = 1 - i * 0.1;
                return (
                    <group key={`body-${z}`} position={[0, 0, z]}>
                        {[-0.2, -0.1, 0, 0.1, 0.2].filter((_, j) => j !== 0 && j !== 4 || i < 3).map((x) =>
                            [-0.15, 0, 0.15].filter((_, k) => k !== 0 && k !== 2 || i < 2).map((y) => (
                                <PixelBlock
                                    key={`seg-${z}-${x}-${y}`}
                                    position={[x * scale, y * scale, 0]}
                                    color={i % 2 === 0 ? '#ff7733' : '#ff8844'}
                                    size={0.12 * scale}
                                />
                            ))
                        )}
                    </group>
                );
            })}
            {/* Kuyruk */}
            {[-2.3, -2.5, -2.7, -2.9].map((z, i) => (
                <PixelBlock
                    key={`tail-${z}`}
                    position={[0, 0, z]}
                    color={i % 2 === 0 ? '#ff6622' : '#ff5511'}
                    size={0.08 - i * 0.01}
                />
            ))}
        </group>
    );

    // EJDERHA KANATLARI
    const DragonWings = () => (
        <group>
            {/* Sol kanat */}
            <group position={[-0.3, 0.2, 0.5]}>
                {[0, -0.2, -0.4, -0.6, -0.8].map((x, i) => (
                    <PixelBlock
                        key={`lwing-${x}`}
                        position={[x, 0.1 - i * 0.05, 0]}
                        color={i % 2 === 0 ? '#ff9944' : '#ffaa55'}
                        size={0.1}
                    />
                ))}
                {[-0.15, -0.35, -0.55].map((x, i) => (
                    <PixelBlock
                        key={`lwing2-${x}`}
                        position={[x, -0.05, 0]}
                        color="#ff8833"
                        size={0.08}
                    />
                ))}
            </group>
            {/* Sağ kanat */}
            <group position={[0.3, 0.2, 0.5]}>
                {[0, 0.2, 0.4, 0.6, 0.8].map((x, i) => (
                    <PixelBlock
                        key={`rwing-${x}`}
                        position={[x, 0.1 - i * 0.05, 0]}
                        color={i % 2 === 0 ? '#ff9944' : '#ffaa55'}
                        size={0.1}
                    />
                ))}
                {[0.15, 0.35, 0.55].map((x, i) => (
                    <PixelBlock
                        key={`rwing2-${x}`}
                        position={[x, -0.05, 0]}
                        color="#ff8833"
                        size={0.08}
                    />
                ))}
            </group>
        </group>
    );

    // ALEV TRAİL
    const FlameTrail = () => {
        const flames = useMemo(() => {
            return Array.from({ length: 20 }).map((_, i) => ({
                x: (Math.random() - 0.5) * 0.4,
                y: (Math.random() - 0.5) * 0.4,
                z: -3 - i * 0.2,
                size: 0.08 + Math.random() * 0.06,
                colorIndex: Math.floor(Math.random() * 3),
            }));
        }, []);

        const colors = ['#ffff44', '#ff8800', '#ff4400'];

        return (
            <group>
                {flames.map((f, i) => (
                    <PixelBlock
                        key={`flame-${i}`}
                        position={[f.x, f.y, f.z]}
                        color={colors[f.colorIndex]}
                        size={f.size}
                        opacity={0.9 - i * 0.03}
                    />
                ))}
            </group>
        );
    };

    return (
        <group ref={groupRef}>
            <group ref={dragonRef} rotation={[0, rotationY, 0]}>
                <DragonHead />
                <DragonBody />
                <DragonWings />
                <FlameTrail />
            </group>

            <Sparkles position={[0, 0, -1]} color="#ff6600" count={30} spread={2.5} progress={progressRef.current} />
            <Sparkles position={[0, 0, 1]} color="#ffaa00" count={20} spread={1.5} progress={progressRef.current} />
            <pointLight position={[0, 0, 2]} color="#ff4400" intensity={5} distance={6} />
            <pointLight position={[0, 0, -2]} color="#ffaa00" intensity={3} distance={4} />
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
    const duration = 1200;
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

        const distance = progress * 20;
        groupRef.current.position.set(position[0] + direction.x * distance, position[1] + 0.8, position[2] + direction.z * distance);

        if (progress >= 1) onComplete();
    });

    const MiniArrow = ({ offset }: { offset: number }) => (
        <group position={[offset * (1 + progressRef.current * 1.5), 0, 0]} rotation={[0, offset * 0.12, 0]}>
            {[0, 0.08, 0.16, 0.24, 0.32].map((z, i) => (
                <PixelBlock key={i} position={[0, 0, z]} color={i < 2 ? '#66ff44' : '#88ff66'} size={0.05} />
            ))}
            <PixelBlock position={[0, 0, 0.4]} color="#aaff88" size={0.06} />
        </group>
    );

    return (
        <group ref={groupRef} rotation={[0, rotationY, 0]}>
            {[-0.4, -0.2, 0, 0.2, 0.4].map((offset, i) => (
                <MiniArrow key={i} offset={offset} />
            ))}
            <Sparkles position={[0, 0, 0.2]} color="#88ff66" count={20} spread={1} progress={progressRef.current} />
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
        progressRef.current = Math.min(elapsed / duration, 1);

        if (followPlayer && playerGroupRef?.current) {
            const playerWorldPos = new THREE.Vector3();
            playerGroupRef.current.getWorldPosition(playerWorldPos);
            groupRef.current.position.copy(playerWorldPos);
        }

        if (progressRef.current >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={position}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
                <ringGeometry args={[0.4, 0.7, 8]} />
                <meshStandardMaterial color="#444444" emissive="#222222" transparent opacity={0.4 * (1 - progressRef.current)} side={THREE.DoubleSide} />
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
                <ringGeometry args={[0.3, 0.5, 6]} />
                <meshStandardMaterial color="#ff4444" emissive="#ff2222" transparent opacity={0.6 * (1 - progressRef.current)} side={THREE.DoubleSide} />
            </mesh>
            <Sparkles position={[0, 0.2, 0]} color="#ff4444" count={8} spread={0.5} progress={progressRef.current} />
        </group>
    );
};

export const ArrowRainEffect: React.FC<{
    position: [number, number, number];
    targetPosition?: [number, number, number];
    onComplete: () => void;
}> = ({ position, targetPosition, onComplete }) => {
    const groupRef = useRef<THREE.Group>(null);
    const arrowRefs = useRef<THREE.Group[]>([]);
    const startTime = useRef(Date.now());
    const duration = 2500;
    const progressRef = useRef(0);
    const spawnPos = targetPosition || position;

    const arrows = useMemo(() => Array.from({ length: 20 }).map(() => ({
        x: (Math.random() - 0.5) * 4,
        z: (Math.random() - 0.5) * 4,
        delay: Math.random() * 0.5,
    })), []);

    useFrame(() => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        progressRef.current = Math.min(elapsed / duration, 1);

        arrowRefs.current.forEach((arrow, i) => {
            if (!arrow) return;
            const arrowProgress = Math.max(0, Math.min(1, (progressRef.current - arrows[i].delay) / 0.4));
            arrow.position.y = 5 - arrowProgress * 5;
            arrow.visible = arrowProgress > 0 && arrow.position.y > 0.1;
        });

        if (progressRef.current >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={spawnPos}>
            {arrows.map((arrow, i) => (
                <group key={i} ref={(el) => { if (el) arrowRefs.current[i] = el; }} position={[arrow.x, 5, arrow.z]} rotation={[Math.PI / 2, 0, 0]}>
                    {[0, 0.08, 0.16, 0.24].map((z, j) => (
                        <PixelBlock key={j} position={[0, 0, z]} color={j < 2 ? '#ffff66' : '#ffdd44'} size={0.05} />
                    ))}
                    <PixelBlock position={[0, 0, 0.32]} color="#ffffff" size={0.06} />
                </group>
            ))}
            <Sparkles position={[0, 0.5, 0]} color="#ffff66" count={25} spread={2.5} progress={progressRef.current} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// ARCHER SKILL MAP
// ═══════════════════════════════════════════════════════════════════════════
export const ARCHER_EFFECTS: Record<string, React.FC<any>> = {
    archer_shot: RapidShotEffect,
    javelin: DeadlyJavelinEffect,
    hunters_focus: HunterFocusEffect,
    archer_volley: MultishotEffect,
    backstep: BackstepEffect,
    dragon_arrow: DragonArrowEffect,
    arrow_shot: RapidShotEffect,
    focus: HunterFocusEffect,
    wind_slash: WindSlashEffect,
    multishot_effect: MultishotEffect,
    stealth_effect: StealthEffect,
    trap_effect: TrapEffect,
    arrow_rain_effect: ArrowRainEffect,
    arrow: RapidShotEffect,
    multishot: MultishotEffect,
    stealth: StealthEffect,
    trap: TrapEffect,
    dash_back: BackstepEffect,
    poison_arrow: DeadlyJavelinEffect,
    arrow_rain: ArrowRainEffect,
    rapid_shot: RapidShotEffect,
    deadly_javelin: DeadlyJavelinEffect,
    hunter_focus: HunterFocusEffect,
    wind_razor: WindSlashEffect,
};

export default ARCHER_EFFECTS;
