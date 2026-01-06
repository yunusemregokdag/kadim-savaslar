// ═══════════════════════════════════════════════════════════════════════════
// BARD (OZAN) SKILL EFFECTS
// Müzik notaları ve buff auraları içeren pixel efektler
// ═══════════════════════════════════════════════════════════════════════════

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Instances, Instance } from '@react-three/drei';

// ═══════════════════════════════════════════════════════════════════════════
// MUSIC NOTE PIXELS - Nota parçacıkları
// ═══════════════════════════════════════════════════════════════════════════
const NotePixels: React.FC<{
    position: [number, number, number];
    color?: string;
    count?: number;
    spread?: number;
    progress: number;
}> = ({ position, color = '#ffdd88', count = 10, spread = 0.5, progress }) => {
    const pixels = useMemo(() => {
        return Array.from({ length: count }).map(() => ({
            x: (Math.random() - 0.5) * spread,
            y: (Math.random() - 0.5) * spread,
            z: (Math.random() - 0.5) * spread * 2,
            size: 0.04 + Math.random() * 0.05,
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
                    opacity={0.8 * (1 - progress)}
                    blending={THREE.AdditiveBlending}
                />
                {pixels.map((px, i) => (
                    <Instance
                        key={i}
                        position={[px.x, px.y + Math.sin(progress * 10 + px.offset) * 0.2, px.z]}
                        scale={[px.size, px.size, px.size]}
                    />
                ))}
            </Instances>
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 1️⃣ NOTA VURUŞU (Note Strike) - İlerleyen müzik notası
// ═══════════════════════════════════════════════════════════════════════════
export const NoteStrikeEffect: React.FC<{
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

        const distance = progress * 20;
        groupRef.current.position.set(
            position[0] + direction.x * distance,
            position[1] + 0.8,
            position[2] + direction.z * distance
        );

        // Spin the note
        groupRef.current.rotation.z += 0.3;

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={position} rotation={[Math.PI / 2, 0, Math.atan2(direction.x, direction.z)]}>
            {/* Torus Geometry for Note Head */}
            <mesh>
                <torusGeometry args={[0.15, 0.05, 8, 16]} />
                <meshBasicMaterial color="#ffdd88" transparent opacity={1} blending={THREE.AdditiveBlending} />
            </mesh>
            <NotePixels position={[0, -0.5, 0]} color="#ffdd88" count={8} spread={0.3} progress={progressRef.current} />
            <pointLight color="#ffdd88" intensity={2} distance={2} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 2️⃣ CESARET MARŞI (Courage March) - Buff Aurası
// ═══════════════════════════════════════════════════════════════════════════
export const CourageMarchEffect: React.FC<{
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

        groupRef.current.rotation.y = state.clock.elapsedTime;

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={position}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[2, 2.6, 32]} />
                <meshBasicMaterial
                    color="#ffaa33"
                    transparent
                    opacity={0.6 * (1 - progressRef.current)}
                    side={THREE.DoubleSide}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
            <NotePixels position={[0, 1, 0]} color="#ffaa33" count={15} spread={2} progress={progressRef.current % 0.1 * 10} />
            <pointLight color="#ffaa33" intensity={3} distance={4} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 3️⃣ YIKIM NOTASI (Destruction Note) - Def Kırma (Slam gibi)
// ═══════════════════════════════════════════════════════════════════════════
export const DestructionNoteEffect: React.FC<{
    position: [number, number, number];
    targetPosition?: [number, number, number];
    onComplete: () => void;
}> = ({ position, targetPosition, onComplete }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 600;
    const progressRef = useRef(0);

    const targetPos = useMemo(() => targetPosition || position, [position, targetPosition]);

    useFrame(() => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;

        const scale = 1 + progress * 2;
        groupRef.current.scale.set(scale, scale, 1);

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={[targetPos[0], 0.2, targetPos[2]]} rotation={[-Math.PI / 2, 0, 0]}>
            <mesh>
                <ringGeometry args={[0.5, 1.2, 16]} />
                <meshBasicMaterial
                    color="#ff4444"
                    transparent
                    opacity={0.8 * (1 - progressRef.current)}
                    side={THREE.DoubleSide}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
            <mesh position={[0, 0, 0.1]}>
                <torusGeometry args={[0.8, 0.1, 8, 16]} />
                <meshBasicMaterial
                    color="#ff8888"
                    transparent
                    opacity={0.8 * (1 - progressRef.current)}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 4️⃣ UYKU NİNNİSİ (Lullaby) - Uyutma Efekti (Zzz...)
// ═══════════════════════════════════════════════════════════════════════════
export const LullabyEffect: React.FC<{
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

        groupRef.current.position.y += 0.02;

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={position}>
            {/* Zzz... particles */}
            {[0, 1, 2].map(i => (
                <group key={i} position={[Math.sin(i * 2) * 0.5, 1 + i * 0.5, 0]}>
                    <mesh rotation={[0, 0, 0.5]}>
                        <boxGeometry args={[0.4, 0.1, 0.05]} />
                        <meshBasicMaterial color="#aavvff" transparent opacity={0.8 * (1 - progressRef.current)} />
                    </mesh>
                    <mesh position={[0, -0.2, 0]} rotation={[0, 0, 0.5]}>
                        <boxGeometry args={[0.4, 0.1, 0.05]} />
                        <meshBasicMaterial color="#aavvff" transparent opacity={0.6 * (1 - progressRef.current)} />
                    </mesh>
                </group>
            ))}
            <pointLight color="#8888ff" intensity={2 * (1 - progressRef.current)} distance={3} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 5️⃣ HIZ RAPSODİSİ (Speed Rhapsody) - Hız Buff (Yıldırımlar)
// ═══════════════════════════════════════════════════════════════════════════
export const SpeedRhapsodyEffect: React.FC<{
    position: [number, number, number];
    onComplete: () => void;
    playerGroupRef?: React.MutableRefObject<THREE.Group | null>;
    followPlayer?: boolean;
}> = ({ position, onComplete, playerGroupRef, followPlayer = false }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 10000;
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
            <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[1, 1.5, 16]} />
                <meshBasicMaterial
                    color="#ffff66"
                    transparent
                    opacity={0.3 * (1 - progressRef.current)}
                    side={THREE.DoubleSide}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
            {/* Speed trails */}
            {[0, 1, 2].map(i => (
                <mesh key={i} position={[Math.cos(i * 2 + Date.now() * 0.005) * 1.2, 1, Math.sin(i * 2 + Date.now() * 0.005) * 1.2]}>
                    <boxGeometry args={[0.2, 0.2, 0.2]} />
                    <meshBasicMaterial color="#ffffaa" transparent opacity={0.8} />
                </mesh>
            ))}
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 6️⃣ DESTANSI FİNAL (Epic Finale) - ULTI (Konser Alanı)
// ═══════════════════════════════════════════════════════════════════════════
export const EpicFinaleEffect: React.FC<{
    position: [number, number, number];
    onComplete: () => void;
}> = ({ position, onComplete }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 13000;
    const progressRef = useRef(0);

    // Disco lights
    const lights = useMemo(() => {
        return Array.from({ length: 6 }).map((_, i) => ({
            angle: (i / 6) * Math.PI * 2,
            color: i % 2 === 0 ? '#ff66ff' : '#66ffff',
            speed: 1 + Math.random(),
        }));
    }, []);

    useFrame((state) => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;
        const time = state.clock.elapsedTime;

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={position}>
            {/* Stage Floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
                <circleGeometry args={[6, 32]} />
                <meshBasicMaterial
                    color="#ff66ff"
                    transparent
                    opacity={0.3 * (1 - progressRef.current * 0.2)}
                    side={THREE.DoubleSide}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
            {/* Disco Lights */}
            {lights.map((l, i) => {
                const x = Math.cos(l.angle + Date.now() * 0.001 * l.speed) * 4;
                const z = Math.sin(l.angle + Date.now() * 0.001 * l.speed) * 4;
                return (
                    <pointLight key={i} position={[x, 3, z]} color={l.color} intensity={2} distance={8} />
                );
            })}
            <NotePixels position={[0, 2, 0]} color="#ffffff" count={50} spread={4} progress={0} />
            {/* Spotlights */}
            <spotLight position={[0, 10, 0]} angle={0.5} penumbra={0.5} intensity={5} color="#ffffff" />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 🎶 ŞİFA MELODİSİ (Heal Song) - İyileştiren nota aurası
// ═══════════════════════════════════════════════════════════════════════════
export const HealSongEffect: React.FC<{
    position: [number, number, number];
    onComplete: () => void;
    playerGroupRef?: React.MutableRefObject<THREE.Group | null>;
    followPlayer?: boolean;
}> = ({ position, onComplete, playerGroupRef, followPlayer = false }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 6000;
    const progressRef = useRef(0);
    const radius = 3.5;
    const noteCount = 12;

    const notes = useMemo(() => {
        return Array.from({ length: noteCount }).map((_, i) => ({
            angle: (i / noteCount) * Math.PI * 2,
            yOffset: Math.random() * 0.5,
        }));
    }, [noteCount]);

    useFrame(() => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;

        if (followPlayer && playerGroupRef?.current) {
            groupRef.current.position.copy(playerGroupRef.current.position);
        }

        groupRef.current.rotation.y += 0.01;

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={position}>
            {/* Aura ring */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
                <ringGeometry args={[radius - 0.2, radius + 0.2, 32]} />
                <meshBasicMaterial
                    color="#ff88ff"
                    transparent
                    opacity={0.4 + Math.sin(progressRef.current * 20) * 0.15}
                    blending={THREE.AdditiveBlending}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Musical notes */}
            {notes.map((note, i) => {
                const angle = note.angle + progressRef.current * Math.PI * 2;
                return (
                    <mesh
                        key={i}
                        position={[
                            Math.cos(angle) * radius,
                            0.5 + Math.sin(progressRef.current * 10 + i) * 0.3 + note.yOffset,
                            Math.sin(angle) * radius
                        ]}
                        rotation={[progressRef.current * 5, progressRef.current * 5, 0]}
                    >
                        <torusGeometry args={[0.15, 0.05, 8, 16]} />
                        <meshBasicMaterial
                            color="#ffccff"
                            transparent
                            opacity={0.8 * (1 - progressRef.current * 0.3)}
                            blending={THREE.AdditiveBlending}
                        />
                    </mesh>
                );
            })}

            {/* Center heal glow */}
            <mesh>
                <sphereGeometry args={[0.5, 16, 16]} />
                <meshBasicMaterial
                    color="#ff88ff"
                    transparent
                    opacity={0.3 + Math.sin(progressRef.current * 15) * 0.1}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>

            <pointLight color="#ff88ff" intensity={3 * (1 - progressRef.current * 0.5)} distance={radius + 1} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// BARD SKILL MAP
// ═══════════════════════════════════════════════════════════════════════════
export const BARD_EFFECTS: Record<string, React.FC<any>> = {
    // New keys
    note_strike: NoteStrikeEffect,
    courage_march: CourageMarchEffect,
    destruction_note: DestructionNoteEffect,
    lullaby: LullabyEffect,
    speed_rhapsody: SpeedRhapsodyEffect,
    epic_finale: EpicFinaleEffect,

    // Components/constants.ts keys
    note_hit: NoteStrikeEffect,
    anthem: CourageMarchEffect,
    lullaby_song: LullabyEffect,
    noise: DestructionNoteEffect,
    speed_song: SpeedRhapsodyEffect,
    heal_song: HealSongEffect,
    symphony: EpicFinaleEffect,

    // Root constants.ts visual keys (yeni)
    bard_note: NoteStrikeEffect,
    bard_vibration: CourageMarchEffect,
    bard_explosion: EpicFinaleEffect,

    // User provided short keys
    note: NoteStrikeEffect,
    march: CourageMarchEffect,
    break: DestructionNoteEffect,
    sleep: LullabyEffect,
    speed: SpeedRhapsodyEffect,
    final: EpicFinaleEffect,
};

export default BARD_EFFECTS;
