// ═══════════════════════════════════════════════════════════════════════════
// BARD (OZAN) SKILL EFFECTS
// Müzik notaları ve buff auraları içeren pixel efektler
// ═══════════════════════════════════════════════════════════════════════════

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Instances, Instance } from '@react-three/drei';

// ═══════════════════════════════════════════════════════════════════════════
// 🎵 PIXEL NOTA - Yeniden kullanılabilir nota mesh
// ═══════════════════════════════════════════════════════════════════════════
const PixelNote: React.FC<{
    position: [number, number, number];
    rotation?: number;
    scale?: number;
    color: string;
    opacity?: number;
}> = ({ position, rotation = 0, scale = 1, color, opacity = 0.9 }) => {
    return (
        <mesh position={position} rotation={[0, 0, rotation]} scale={[scale, scale, scale]}>
            <boxGeometry args={[0.15, 0.15, 0.05]} />
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
// MUSIC NOTE PIXELS - Nota parçacıkları (eski - backward compat)
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
// 1️⃣ NOTA VURUŞU (Note Strike) - Mavi nota → düşmana gider
// ═══════════════════════════════════════════════════════════════════════════
export const NoteStrikeEffect: React.FC<{
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
        const distance = progress * 15;
        groupRef.current.position.set(
            position[0] + direction.x * distance,
            position[1] + 0.8,
            position[2] + direction.z * distance
        );

        // Döndür
        groupRef.current.rotation.z += 0.3;

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={position}>
            <PixelNote position={[0, 0, 0]} color="#55ccff" opacity={1 - progressRef.current} scale={1.5} rotation={progressRef.current * 10} />
            <PixelNote position={[0.1, 0.1, 0]} color="#88ddff" opacity={(1 - progressRef.current) * 0.7} scale={1} />
            <pointLight color="#55ccff" intensity={2 * (1 - progressRef.current)} distance={2} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 2️⃣ RİTİM AKIŞI (Rhythm Flow) - Party Buff - Dönen notalar
// ═══════════════════════════════════════════════════════════════════════════
export const RhythmFlowEffect: React.FC<{
    position: [number, number, number];
    onComplete: () => void;
    playerGroupRef?: React.MutableRefObject<THREE.Group | null>;
    followPlayer?: boolean;
}> = ({ position, onComplete, playerGroupRef, followPlayer = false }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 5000;
    const progressRef = useRef(0);
    const noteCount = 8;

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
            {Array.from({ length: noteCount }).map((_, i) => {
                const angle = progressRef.current * 3 + (i / noteCount) * Math.PI * 2;
                return (
                    <PixelNote
                        key={i}
                        position={[
                            Math.cos(angle) * 1.2,
                            0.5,
                            Math.sin(angle) * 1.2
                        ]}
                        color="#88ffcc"
                        opacity={0.9 * (1 - progressRef.current * 0.3)}
                        rotation={angle}
                    />
                );
            })}
            <pointLight color="#88ffcc" intensity={2} distance={3} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 3️⃣ UYUMSUZ AKOR (Dissonant Chord) - Debuff - Titreyen notalar
// ═══════════════════════════════════════════════════════════════════════════
export const DissonantChordEffect: React.FC<{
    position: [number, number, number];
    targetPosition?: [number, number, number];
    onComplete: () => void;
}> = ({ position, targetPosition, onComplete }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 1500;
    const progressRef = useRef(0);
    const noteCount = 12;

    const spawnPos = targetPosition || position;

    const notes = useMemo(() => {
        return Array.from({ length: noteCount }).map(() => ({
            offsetX: (Math.random() - 0.5) * 2,
            offsetZ: (Math.random() - 0.5) * 2,
        }));
    }, [noteCount]);

    useFrame(() => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={spawnPos}>
            {notes.map((note, i) => {
                const shakeX = Math.sin(progressRef.current * 30 + i) * 0.1;
                const shakeZ = Math.cos(progressRef.current * 30 + i) * 0.1;
                return (
                    <PixelNote
                        key={i}
                        position={[
                            note.offsetX + shakeX,
                            0.3 + i * 0.05,
                            note.offsetZ + shakeZ
                        ]}
                        color="#aa66ff"
                        opacity={1 - progressRef.current}
                        scale={0.8}
                    />
                );
            })}
            <pointLight color="#aa66ff" intensity={3 * (1 - progressRef.current)} distance={3} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 4️⃣ İLHAM EZGİSİ (Inspiration Melody) - Heal - Altın notalar
// ═══════════════════════════════════════════════════════════════════════════
export const InspirationMelodyEffect: React.FC<{
    position: [number, number, number];
    onComplete: () => void;
    playerGroupRef?: React.MutableRefObject<THREE.Group | null>;
    followPlayer?: boolean;
}> = ({ position, onComplete, playerGroupRef, followPlayer = false }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 4000;
    const progressRef = useRef(0);
    const noteCount = 10;

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
            {/* Heal aura ring */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
                <ringGeometry args={[0.8, 1.2, 32]} />
                <meshBasicMaterial
                    color="#ffdd66"
                    transparent
                    opacity={0.4 + Math.sin(progressRef.current * 15) * 0.2}
                    blending={THREE.AdditiveBlending}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Spiral notes */}
            {Array.from({ length: noteCount }).map((_, i) => {
                const t = progressRef.current * 2;
                const angle = t + (i / noteCount) * Math.PI * 2;
                return (
                    <PixelNote
                        key={i}
                        position={[
                            Math.sin(angle) * 1,
                            0.3 + i * 0.08 + Math.sin(t * 5 + i) * 0.1,
                            Math.cos(angle) * 1
                        ]}
                        color="#ffdd66"
                        opacity={0.9 * (1 - progressRef.current * 0.3)}
                    />
                );
            })}
            <pointLight color="#ffdd66" intensity={3} distance={4} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 5️⃣ SES PATLAMASI (Sound Burst) - Alan hasarı - Patlayan notalar
// ═══════════════════════════════════════════════════════════════════════════
export const SoundBurstEffect: React.FC<{
    position: [number, number, number];
    targetPosition?: [number, number, number];
    onComplete: () => void;
}> = ({ position, targetPosition, onComplete }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 800;
    const progressRef = useRef(0);
    const noteCount = 24;

    const spawnPos = targetPosition || position;

    const notes = useMemo(() => {
        return Array.from({ length: noteCount }).map(() => ({
            dir: new THREE.Vector3(
                Math.random() - 0.5,
                Math.random() * 0.5,
                Math.random() - 0.5
            ).normalize(),
        }));
    }, [noteCount]);

    useFrame(() => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={spawnPos}>
            {notes.map((note, i) => {
                const dist = progressRef.current * 4;
                return (
                    <PixelNote
                        key={i}
                        position={[
                            note.dir.x * dist,
                            note.dir.y * dist + 0.5,
                            note.dir.z * dist
                        ]}
                        color="#ff5555"
                        opacity={1 - progressRef.current}
                        scale={1 - progressRef.current * 0.5}
                    />
                );
            })}
            <pointLight color="#ff5555" intensity={5 * (1 - progressRef.current)} distance={5} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 6️⃣ KORO SENFONİSİ (Choir Symphony) - ULTİ - Katmanlı nota halkaları
// ═══════════════════════════════════════════════════════════════════════════
export const ChoirSymphonyEffect: React.FC<{
    position: [number, number, number];
    onComplete: () => void;
    playerGroupRef?: React.MutableRefObject<THREE.Group | null>;
    followPlayer?: boolean;
}> = ({ position, onComplete, playerGroupRef, followPlayer = false }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 8000;
    const progressRef = useRef(0);
    const ringCount = 3;
    const notesPerRing = 12;

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
            {/* Multiple rings of notes */}
            {Array.from({ length: ringCount }).map((_, r) => (
                <group key={r}>
                    {Array.from({ length: notesPerRing }).map((_, i) => {
                        const t = progressRef.current;
                        const angle = t + (i / notesPerRing) * Math.PI * 2;
                        const radius = 1.5 + r * 0.6;
                        return (
                            <PixelNote
                                key={i}
                                position={[
                                    Math.cos(angle) * radius,
                                    r * 0.4 + 0.3,
                                    Math.sin(angle) * radius
                                ]}
                                color="#bb88ff"
                                opacity={0.9 * (1 - progressRef.current * 0.2)}
                                scale={1 + r * 0.1}
                            />
                        );
                    })}
                </group>
            ))}

            {/* Central glow */}
            <mesh>
                <sphereGeometry args={[0.5, 16, 16]} />
                <meshBasicMaterial
                    color="#bb88ff"
                    transparent
                    opacity={0.4}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>

            <pointLight color="#bb88ff" intensity={5} distance={8} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// ESKI EFEKTLER (backward compatibility)
// ═══════════════════════════════════════════════════════════════════════════

// CourageMarchEffect = RhythmFlowEffect alias
export const CourageMarchEffect = RhythmFlowEffect;

// DestructionNoteEffect = SoundBurstEffect alias
export const DestructionNoteEffect = SoundBurstEffect;

// LullabyEffect = DissonantChordEffect (uyku = debuff)
export const LullabyEffect = DissonantChordEffect;

// SpeedRhapsodyEffect = RhythmFlowEffect variant
export const SpeedRhapsodyEffect: React.FC<{
    position: [number, number, number];
    onComplete: () => void;
    playerGroupRef?: React.MutableRefObject<THREE.Group | null>;
    followPlayer?: boolean;
}> = ({ position, onComplete, playerGroupRef, followPlayer = false }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 4000;
    const progressRef = useRef(0);
    const noteCount = 6;

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
            {Array.from({ length: noteCount }).map((_, i) => {
                const angle = progressRef.current * 5 + (i / noteCount) * Math.PI * 2;
                return (
                    <PixelNote
                        key={i}
                        position={[
                            Math.cos(angle) * 1,
                            0.3 + Math.sin(progressRef.current * 10 + i) * 0.2,
                            Math.sin(angle) * 1
                        ]}
                        color="#66ffff"
                        opacity={0.9}
                    />
                );
            })}
            <pointLight color="#66ffff" intensity={2} distance={3} />
        </group>
    );
};

// EpicFinaleEffect = ChoirSymphonyEffect alias
export const EpicFinaleEffect = ChoirSymphonyEffect;

// HealSongEffect = InspirationMelodyEffect alias
export const HealSongEffect = InspirationMelodyEffect;

// ═══════════════════════════════════════════════════════════════════════════
// BARD SKILL MAP
// ═══════════════════════════════════════════════════════════════════════════
export const BARD_EFFECTS: Record<string, React.FC<any>> = {
    // Yeni pixel nota efektleri
    note_strike: NoteStrikeEffect,
    rhythm_flow: RhythmFlowEffect,
    dissonant_chord: DissonantChordEffect,
    inspiration_melody: InspirationMelodyEffect,
    sound_burst: SoundBurstEffect,
    choir_symphony: ChoirSymphonyEffect,

    // Eski key'ler (backward compat)
    courage_march: CourageMarchEffect,
    destruction_note: DestructionNoteEffect,
    lullaby: LullabyEffect,
    speed_rhapsody: SpeedRhapsodyEffect,
    epic_finale: EpicFinaleEffect,
    heal_song: HealSongEffect,

    // Components/constants.ts keys
    note_hit: NoteStrikeEffect,
    anthem: CourageMarchEffect,
    lullaby_song: LullabyEffect,
    noise: SoundBurstEffect,
    speed_song: SpeedRhapsodyEffect,
    symphony: ChoirSymphonyEffect,

    // Root constants.ts visual keys
    bard_note: NoteStrikeEffect,
    bard_vibration: RhythmFlowEffect,
    bard_explosion: SoundBurstEffect,

    // Kısa key'ler
    note: NoteStrikeEffect,
    march: CourageMarchEffect,
    break: SoundBurstEffect,
    sleep: LullabyEffect,
    speed: SpeedRhapsodyEffect,
    final: ChoirSymphonyEffect,
    heal: HealSongEffect,
    burst: SoundBurstEffect,
    choir: ChoirSymphonyEffect,
};

export default BARD_EFFECTS;
