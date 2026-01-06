// ═══════════════════════════════════════════════════════════════════════════
// WARRIOR SKILL EFFECTS - Kod ile oluşturulan particle/shader efektleri
// PNG'lere bağlı değil, tamamen Three.js ile dinamik
// ═══════════════════════════════════════════════════════════════════════════

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

// ═══════════════════════════════════════════════════════════════════════════
// PIXELATED SHINY PARTICLES - Retro MMO style sparkles
// Uses instanced boxes for true pixel art look
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

    // Generate random pixel positions and properties
    const pixelData = useMemo(() => {
        const data = [];
        for (let i = 0; i < count; i++) {
            // Random positions in a sphere
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
                isGold: Math.random() > 0.7, // 30% golden sparkles
            });
        }
        return data;
    }, [count, spread, pixelSize]);

    useFrame((state) => {
        if (!groupRef.current) return;
        const time = state.clock.elapsedTime;

        // Animate each pixel with individual twinkle
        meshRefs.current.forEach((mesh, i) => {
            if (!mesh) return;
            const pd = pixelData[i];

            // Twinkle effect - oscillating opacity
            const twinkle = Math.sin(time * pd.twinkleSpeed + pd.twinkleOffset);
            const baseOpacity = (1 - progress) * (0.6 + twinkle * 0.4);
            (mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, baseOpacity);

            // Slight floating motion
            mesh.position.y = pd.y + Math.sin(time * 2 + pd.twinkleOffset) * 0.05;

            // Scale pulse
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

            {/* Central glow point */}
            <pointLight color={color} intensity={2 * (1 - progress)} distance={spread * 1.5} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// PIXEL BURST - Explosive pixel particles
// ═══════════════════════════════════════════════════════════════════════════
const PixelBurst: React.FC<{
    position: [number, number, number];
    color: string;
    count?: number;
    speed?: number;
    progress: number;
}> = ({ position, color, count = 30, speed = 3, progress }) => {
    const meshRefs = useRef<THREE.Mesh[]>([]);

    const burstData = useMemo(() => {
        const data = [];
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const upAngle = Math.random() * Math.PI * 0.5;
            data.push({
                vx: Math.cos(angle) * Math.sin(upAngle) * speed * (0.5 + Math.random() * 0.5),
                vy: Math.cos(upAngle) * speed * (0.3 + Math.random() * 0.7),
                vz: Math.sin(angle) * Math.sin(upAngle) * speed * (0.5 + Math.random() * 0.5),
                size: 0.06 + Math.random() * 0.08,
                isWhite: Math.random() > 0.6,
            });
        }
        return data;
    }, [count, speed]);

    useFrame(() => {
        meshRefs.current.forEach((mesh, i) => {
            if (!mesh) return;
            const bd = burstData[i];

            // Move outward
            mesh.position.x += bd.vx * 0.02;
            mesh.position.y += bd.vy * 0.02 - 0.01; // Add gravity
            mesh.position.z += bd.vz * 0.02;

            // Fade and shrink
            (mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1 - progress);
            mesh.scale.setScalar(bd.size * (1 - progress * 0.8));
        });
    });

    return (
        <group position={position}>
            {burstData.map((bd, i) => (
                <mesh
                    key={i}
                    ref={(el) => { if (el) meshRefs.current[i] = el; }}
                    position={[0, 0, 0]}
                >
                    <boxGeometry args={[1, 1, 1]} />
                    <meshBasicMaterial
                        color={bd.isWhite ? '#ffffff' : color}
                        transparent
                        opacity={1}
                        blending={THREE.AdditiveBlending}
                    />
                </mesh>
            ))}
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// SLASH EFFECT - Kılıç Darbesi (Pixelated blade trail + shiny sparkles)
// Original retro MMO style sword slash that user preferred
// ═══════════════════════════════════════════════════════════════════════════
export const SlashEffect: React.FC<{
    position: [number, number, number];
    onComplete: () => void;
    color?: string;
}> = ({ position, onComplete, color = '#ff4500' }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 350;
    const progressRef = useRef(0);

    // Generate pixelated slash trail
    const slashPixels = useMemo(() => {
        const pixels = [];
        const numSegments = 12;
        for (let i = 0; i < numSegments; i++) {
            const angle = -Math.PI * 0.3 + (i / numSegments) * Math.PI * 0.6;
            const radius = 1.2 + (i % 2) * 0.2;
            pixels.push({
                x: Math.cos(angle) * radius,
                y: Math.sin(angle) * radius,
                size: 0.25 - (i / numSegments) * 0.1,
                delay: i * 0.05,
                isCore: i >= 4 && i <= 8,
            });
        }
        return pixels;
    }, []);

    useFrame(() => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;

        // Scale up and rotate for slash motion
        const scale = 1 + progress * 1.5;
        groupRef.current.scale.set(scale, scale, scale);
        groupRef.current.rotation.z = progress * Math.PI * 0.4;

        // Fade out with easing
        const fadeProgress = Math.pow(progress, 0.7);
        groupRef.current.traverse((child) => {
            if ((child as THREE.Mesh).isMesh && (child as THREE.Mesh).material) {
                const mat = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
                if (mat.opacity !== undefined) mat.opacity = (1 - fadeProgress) * 0.95;
            }
        });

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={position}>
            {/* Pixelated blade trail */}
            {slashPixels.map((px, i) => (
                <mesh key={i} position={[px.x, px.y, 0]}>
                    <boxGeometry args={[px.size, px.size * 1.5, 0.08]} />
                    <meshBasicMaterial
                        color={px.isCore ? '#ffffff' : color}
                        transparent
                        opacity={1}
                        blending={THREE.AdditiveBlending}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            ))}

            {/* Secondary trail layer - offset */}
            {slashPixels.filter((_, i) => i % 2 === 0).map((px, i) => (
                <mesh key={`s-${i}`} position={[px.x * 0.85, px.y * 0.85, 0.05]}>
                    <boxGeometry args={[px.size * 0.7, px.size * 1.2, 0.06]} />
                    <meshBasicMaterial
                        color={color}
                        transparent
                        opacity={0.7}
                        blending={THREE.AdditiveBlending}
                    />
                </mesh>
            ))}

            {/* Impact glow at center */}
            <mesh position={[0.8, 0, 0]}>
                <boxGeometry args={[0.3, 0.3, 0.15]} />
                <meshBasicMaterial
                    color="#ffffff"
                    transparent
                    opacity={0.9}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>

            {/* Shiny pixel sparkles */}
            <ShinyPixels position={[0.5, 0, 0]} color="#ffffff" count={20} spread={1.2} progress={progressRef.current} pixelSize={0.06} />
            <ShinyPixels position={[0, 0, 0]} color={color} count={15} spread={1} progress={progressRef.current} pixelSize={0.05} />
            <ShinyPixels position={[0.8, 0.2, 0]} color="#ffd700" count={10} spread={0.6} progress={progressRef.current} pixelSize={0.04} />

            {/* Dynamic lighting */}
            <pointLight color={color} intensity={3 * (1 - progressRef.current)} distance={3} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// SHIELD EFFECT - Dönen Kalkan Panelleri (Enerji dalgalı, pixelated koruma)
// Inspired by MMO shield barriers - rotating panels with energy waves
// Now supports following the player character!
// ═══════════════════════════════════════════════════════════════════════════
export const ShieldEffect: React.FC<{
    position: [number, number, number];
    onComplete: () => void;
    color?: string;
    duration?: number;
    shieldCount?: number; // Level-based shield count
    playerGroupRef?: React.MutableRefObject<THREE.Group | null>; // For following player
    followPlayer?: boolean; // If true, shield follows the player
}> = ({ position, onComplete, color = '#3b82f6', duration = 3000, shieldCount = 5, playerGroupRef, followPlayer = false }) => {
    const groupRef = useRef<THREE.Group>(null);
    const shieldRefs = useRef<THREE.Mesh[]>([]);
    const startTime = useRef(Date.now());
    const progressRef = useRef(0);
    const hitFlashRef = useRef(0);
    const initialPosition = useRef<[number, number, number]>(position);

    // Generate shield panel positions in a circle
    const shieldPositions = useMemo(() => {
        const positions = [];
        const count = Math.max(3, Math.min(8, shieldCount)); // 3-8 shields
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            positions.push({
                angle,
                x: Math.cos(angle) * 1.8,
                z: Math.sin(angle) * 1.8,
                heightOffset: (i % 2) * 0.15, // Staggered heights
            });
        }
        return positions;
    }, [shieldCount]);

    // Pixelated shield panel shape - stacked boxes
    const ShieldPanel = ({ index, baseAngle }: { index: number; baseAngle: number }) => {
        const panelRef = useRef<THREE.Group>(null);

        useFrame((state) => {
            if (!panelRef.current) return;
            const time = state.clock.elapsedTime;

            // Energy wave effect - sine-based opacity pulsing
            const wave = Math.sin((time * 3) + index * 0.5) * 0.3;

            // Make panel face center
            panelRef.current.lookAt(0, 1, 0);

            // Vertical oscillation
            panelRef.current.position.y = 1 + Math.sin(time * 2 + index) * 0.1;
        });

        // Pixelated panel - multiple stacked boxes for retro look
        return (
            <group
                ref={panelRef}
                position={[
                    shieldPositions[index].x,
                    1 + shieldPositions[index].heightOffset,
                    shieldPositions[index].z
                ]}
            >
                {/* Main shield panel - 3x5 pixel grid */}
                {[0, 1, 2].map(row => (
                    [0, 1, 2, 3, 4].map(col => {
                        const isEdge = row === 0 || row === 2 || col === 0 || col === 4;
                        const isCorner = (row === 0 || row === 2) && (col === 0 || col === 4);
                        if (isCorner) return null; // Skip corners for rounded look

                        return (
                            <mesh
                                key={`${row}-${col}`}
                                position={[(row - 1) * 0.22, (col - 2) * 0.28, 0]}
                            >
                                <boxGeometry args={[0.2, 0.26, 0.06]} />
                                <meshBasicMaterial
                                    color={isEdge ? '#ffffff' : color}
                                    transparent
                                    opacity={isEdge ? 0.9 : 0.7}
                                    blending={THREE.AdditiveBlending}
                                    side={THREE.DoubleSide}
                                />
                            </mesh>
                        );
                    })
                ))}

                {/* Center glow core */}
                <mesh position={[0, 0, 0.05]}>
                    <boxGeometry args={[0.3, 0.5, 0.08]} />
                    <meshBasicMaterial
                        color="#ffffff"
                        transparent
                        opacity={0.8}
                        blending={THREE.AdditiveBlending}
                    />
                </mesh>

                {/* Energy glow point */}
                <pointLight color={color} intensity={0.5} distance={1} />
            </group>
        );
    };

    useFrame((state) => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = elapsed / duration;
        progressRef.current = progress;
        const time = state.clock.elapsedTime;

        // ═══ FOLLOW PLAYER LOGIC ═══
        // If followPlayer is enabled, update shield position to match player
        if (followPlayer && playerGroupRef?.current) {
            const playerWorldPos = new THREE.Vector3();
            playerGroupRef.current.getWorldPosition(playerWorldPos);
            groupRef.current.position.set(playerWorldPos.x, playerWorldPos.y, playerWorldPos.z);
        }

        // Rotate entire shield group
        groupRef.current.rotation.y += 0.025;

        // Pulse scale effect
        const pulse = 1 + Math.sin(time * 4) * 0.08;
        groupRef.current.scale.set(pulse, pulse, pulse);

        // Energy wave - update all shield materials
        shieldRefs.current.forEach((mesh, i) => {
            if (!mesh) return;
            const wave = Math.sin((time * 3) + i * 0.8);
            const mat = mesh.material as THREE.MeshBasicMaterial;

            // Hit flash effect
            if (hitFlashRef.current > 0) {
                mat.color.setHex(0xffffff);
                hitFlashRef.current -= 0.1;
            }

            // Opacity wave animation
            mat.opacity = 0.5 + wave * 0.25 * (1 - progress * 0.3);
        });

        // Fade out at end
        if (progress > 0.8) {
            const fadeProgress = (progress - 0.8) / 0.2;
            groupRef.current.traverse((child) => {
                if ((child as THREE.Mesh).isMesh && (child as THREE.Mesh).material) {
                    ((child as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity *= (1 - fadeProgress);
                }
            });
        }

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={position}>
            {/* Rotating shield panels */}
            {shieldPositions.map((_, i) => (
                <ShieldPanel key={i} index={i} baseAngle={shieldPositions[i].angle} />
            ))}

            {/* Central protection aura - pixelated rings */}
            <group>
                {[0, 1, 2].map(ring => (
                    <mesh key={ring} rotation={[-Math.PI / 2, 0, ring * 0.3]} position={[0, 0.1 + ring * 0.2, 0]}>
                        <ringGeometry args={[1.2 + ring * 0.3, 1.4 + ring * 0.3, 8]} />
                        <meshBasicMaterial
                            color={ring === 1 ? '#ffffff' : color}
                            transparent
                            opacity={0.3 - ring * 0.08}
                            blending={THREE.AdditiveBlending}
                            side={THREE.DoubleSide}
                        />
                    </mesh>
                ))}
            </group>

            {/* Ground effect ring */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
                <ringGeometry args={[1.6, 2.0, 12]} />
                <meshBasicMaterial
                    color={color}
                    transparent
                    opacity={0.4}
                    blending={THREE.AdditiveBlending}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Vertical energy pillars at corners */}
            {[0, 1, 2, 3].map(i => {
                const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
                return (
                    <group key={i} position={[Math.cos(angle) * 1.5, 0, Math.sin(angle) * 1.5]}>
                        {[0, 1, 2, 3, 4].map(j => (
                            <mesh key={j} position={[0, j * 0.35 + 0.2, 0]}>
                                <boxGeometry args={[0.12, 0.3, 0.12]} />
                                <meshBasicMaterial
                                    color={j === 2 ? '#ffffff' : color}
                                    transparent
                                    opacity={0.6 - j * 0.08}
                                    blending={THREE.AdditiveBlending}
                                />
                            </mesh>
                        ))}
                    </group>
                );
            })}

            {/* Shiny protection particles */}
            <ShinyPixels position={[0, 0.8, 0]} color="#ffffff" count={35} spread={2.2} progress={progressRef.current} pixelSize={0.07} />
            <ShinyPixels position={[0, 0.5, 0]} color={color} count={25} spread={1.8} progress={progressRef.current} pixelSize={0.06} />
            <ShinyPixels position={[0, 1.2, 0]} color="#00ffff" count={20} spread={1.5} progress={progressRef.current} pixelSize={0.05} />

            {/* Central glow light */}
            <pointLight color={color} intensity={3 * (1 - progressRef.current)} distance={4} />
            <pointLight color="#ffffff" intensity={1.5 * (1 - progressRef.current)} distance={2} position={[0, 1, 0]} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// RAGE BURST EFFECT - Öfke Patlaması (Kırmızı aura + buff state + follows player)
// Inspired by MMO rage buffs - glowing aura that follows the player
// ═══════════════════════════════════════════════════════════════════════════
export const RageBurstEffect: React.FC<{
    position: [number, number, number];
    onComplete: () => void;
    color?: string;
    playerGroupRef?: React.MutableRefObject<THREE.Group | null>;
    followPlayer?: boolean;
}> = ({ position, onComplete, color = '#dc2626', playerGroupRef, followPlayer = false }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 3000; // Longer for buff effect (3 seconds visible)
    const progressRef = useRef(0);

    // Pixelated flame/aura particles rising up
    const flameParticles = useMemo(() => {
        const particles = [];
        for (let i = 0; i < 24; i++) {
            const angle = (i / 24) * Math.PI * 2;
            const radius = 0.8 + Math.random() * 0.4;
            particles.push({
                x: Math.cos(angle) * radius,
                z: Math.sin(angle) * radius,
                speed: 1 + Math.random() * 2,
                offset: Math.random() * Math.PI * 2,
                size: 0.1 + Math.random() * 0.08,
            });
        }
        return particles;
    }, []);

    useFrame((state) => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;
        const time = state.clock.elapsedTime;

        // ═══ FOLLOW PLAYER LOGIC ═══
        if (followPlayer && playerGroupRef?.current) {
            const playerWorldPos = new THREE.Vector3();
            playerGroupRef.current.getWorldPosition(playerWorldPos);
            groupRef.current.position.set(playerWorldPos.x, playerWorldPos.y, playerWorldPos.z);
        }

        // Scale pulse effect - player feels POWERFUL
        const scalePulse = 1 + Math.sin(time * 8) * 0.1;

        // Initial burst then settle
        const burstScale = progress < 0.1 ? 1 + (progress / 0.1) * 0.5 : 1.5 - (progress - 0.1) * 0.3;
        groupRef.current.scale.set(burstScale * scalePulse, burstScale * scalePulse, burstScale * scalePulse);

        // Fade out at end
        if (progress > 0.8) {
            const fadeProgress = (progress - 0.8) / 0.2;
            groupRef.current.traverse((child) => {
                if ((child as THREE.Mesh).isMesh && (child as THREE.Mesh).material) {
                    ((child as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity *= (1 - fadeProgress * 0.5);
                }
            });
        }

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={position}>
            {/* Pixelated rising flame particles */}
            {flameParticles.map((fp, i) => (
                <group key={i}>
                    {[0, 1, 2].map(j => {
                        const yOffset = ((Date.now() * 0.003 * fp.speed + fp.offset) % 2);
                        return (
                            <mesh
                                key={j}
                                position={[fp.x, yOffset + j * 0.3, fp.z]}
                            >
                                <boxGeometry args={[fp.size, fp.size * 1.5, fp.size]} />
                                <meshBasicMaterial
                                    color={j === 0 ? '#ffffff' : j === 1 ? '#ff6600' : color}
                                    transparent
                                    opacity={0.8 - j * 0.2 - yOffset * 0.3}
                                    blending={THREE.AdditiveBlending}
                                />
                            </mesh>
                        );
                    })}
                </group>
            ))}

            {/* Pixelated aura rings */}
            {[0, 1, 2].map(ring => (
                <mesh key={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1 + ring * 0.15, 0]}>
                    <ringGeometry args={[0.9 + ring * 0.2, 1.1 + ring * 0.2, 8]} />
                    <meshBasicMaterial
                        color={ring === 1 ? '#ff6600' : color}
                        transparent
                        opacity={0.5 - ring * 0.12}
                        blending={THREE.AdditiveBlending}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            ))}

            {/* Central power core */}
            <mesh position={[0, 0.8, 0]}>
                <boxGeometry args={[0.25, 0.4, 0.25]} />
                <meshBasicMaterial
                    color="#ffffff"
                    transparent
                    opacity={0.9}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>

            {/* Shiny pixel explosions */}
            <ShinyPixels position={[0, 0.5, 0]} color="#ffffff" count={30} spread={1.5} progress={progressRef.current} pixelSize={0.06} />
            <ShinyPixels position={[0, 0.8, 0]} color={color} count={25} spread={1.2} progress={progressRef.current} pixelSize={0.05} />
            <ShinyPixels position={[0, 0.3, 0]} color="#ff6600" count={20} spread={1} progress={progressRef.current} pixelSize={0.04} />

            {/* Dynamic lighting for dramatic effect */}
            <pointLight color={color} intensity={4 * (1 - progressRef.current * 0.5)} distance={5} />
            <pointLight color="#ff6600" intensity={2 * (1 - progressRef.current * 0.5)} distance={3} position={[0, 1, 0]} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// GROUND SLAM EFFECT - Yere Vurma (Pixelated şok dalgası + flying debris)
// MMO style ground pound with expanding shockwaves
// ═══════════════════════════════════════════════════════════════════════════
export const GroundSlamEffect: React.FC<{
    position: [number, number, number];
    onComplete: () => void;
    color?: string;
}> = ({ position, onComplete, color = '#fbbf24' }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 800;
    const progressRef = useRef(0);

    // Flying debris positions
    const debrisData = useMemo(() => {
        const debris = [];
        for (let i = 0; i < 20; i++) {
            const angle = (i / 20) * Math.PI * 2;
            const distance = 0.5 + Math.random() * 1.5;
            debris.push({
                x: Math.cos(angle) * distance,
                z: Math.sin(angle) * distance,
                vx: Math.cos(angle) * (2 + Math.random() * 2),
                vy: 2 + Math.random() * 3,
                vz: Math.sin(angle) * (2 + Math.random() * 2),
                size: 0.08 + Math.random() * 0.1,
                rotSpeed: Math.random() * 5,
            });
        }
        return debris;
    }, []);

    // Ground crack pattern
    const crackPattern = useMemo(() => {
        const cracks = [];
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            cracks.push({
                angle,
                length: 1.5 + Math.random() * 1.5,
                segments: 3 + Math.floor(Math.random() * 3),
            });
        }
        return cracks;
    }, []);

    useFrame((state) => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;

        // Fade out at end
        if (progress > 0.7) {
            const fadeProgress = (progress - 0.7) / 0.3;
            groupRef.current.traverse((child) => {
                if ((child as THREE.Mesh).isMesh && (child as THREE.Mesh).material) {
                    ((child as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity *= (1 - fadeProgress * 0.5);
                }
            });
        }

        if (progress >= 1) onComplete();
    });

    const progress = progressRef.current;

    return (
        <group ref={groupRef} position={[position[0], 0.05, position[2]]}>
            {/* Multiple expanding shockwave rings - pixelated (8-sided) */}
            {[0, 1, 2].map(ring => {
                const ringProgress = Math.max(0, progressRef.current - ring * 0.1);
                const scale = 1 + ringProgress * 6;
                const opacity = Math.max(0, 1 - ringProgress * 1.2);

                return (
                    <mesh
                        key={ring}
                        rotation={[-Math.PI / 2, 0, ring * 0.2]}
                        scale={[scale, scale, 1]}
                        position={[0, ring * 0.02, 0]}
                    >
                        <ringGeometry args={[0.6 + ring * 0.2, 0.9 + ring * 0.2, 8]} />
                        <meshBasicMaterial
                            color={ring === 0 ? '#ffffff' : ring === 1 ? color : '#ff6600'}
                            transparent
                            opacity={opacity * (1 - ring * 0.2)}
                            side={THREE.DoubleSide}
                            blending={THREE.AdditiveBlending}
                        />
                    </mesh>
                );
            })}

            {/* Ground crack pattern - pixelated lines */}
            {crackPattern.map((crack, i) => (
                <group key={i} rotation={[0, crack.angle, 0]}>
                    {Array.from({ length: crack.segments }).map((_, j) => {
                        const segmentProgress = Math.min(1, progressRef.current * 3);
                        const segmentLength = (crack.length / crack.segments) * segmentProgress;
                        const offset = j * (crack.length / crack.segments) * segmentProgress;

                        return (
                            <mesh
                                key={j}
                                position={[0, 0.01, offset + segmentLength / 2]}
                                rotation={[-Math.PI / 2, 0, 0]}
                            >
                                <boxGeometry args={[0.06 - j * 0.01, segmentLength, 0.02]} />
                                <meshBasicMaterial
                                    color={j === 0 ? '#ffffff' : '#8b4513'}
                                    transparent
                                    opacity={0.8 - j * 0.15 - progressRef.current * 0.5}
                                    blending={THREE.AdditiveBlending}
                                />
                            </mesh>
                        );
                    })}
                </group>
            ))}

            {/* Flying debris blocks */}
            {debrisData.map((db, i) => {
                const t = progressRef.current;
                const gravity = 9.8;
                const px = db.x + db.vx * t;
                const py = db.vy * t - 0.5 * gravity * t * t;
                const pz = db.z + db.vz * t;

                if (py < -0.5) return null;

                return (
                    <mesh
                        key={i}
                        position={[px, Math.max(0, py), pz]}
                        rotation={[t * db.rotSpeed, t * db.rotSpeed * 0.7, 0]}
                    >
                        <boxGeometry args={[db.size, db.size, db.size]} />
                        <meshBasicMaterial
                            color={i % 3 === 0 ? color : i % 3 === 1 ? '#8b4513' : '#a0522d'}
                            transparent
                            opacity={1 - progressRef.current}
                            blending={THREE.AdditiveBlending}
                        />
                    </mesh>
                );
            })}

            {/* Central impact flash */}
            <mesh position={[0, 0.1, 0]}>
                <boxGeometry args={[0.4 * (1 + progressRef.current), 0.3, 0.4 * (1 + progressRef.current)]} />
                <meshBasicMaterial
                    color="#ffffff"
                    transparent
                    opacity={Math.max(0, 1 - progressRef.current * 2)}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>

            {/* Pixelated dust particles */}
            <ShinyPixels position={[0, 0.3, 0]} color={color} count={40} spread={3} progress={progressRef.current} pixelSize={0.08} />
            <ShinyPixels position={[0, 0.5, 0]} color="#ffffff" count={25} spread={2} progress={progressRef.current} pixelSize={0.06} />
            <ShinyPixels position={[0, 0.2, 0]} color="#8b4513" count={20} spread={2.5} progress={progressRef.current} pixelSize={0.07} />

            {/* Impact light */}
            <pointLight color={color} intensity={5 * (1 - progressRef.current)} distance={6} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// SPEAR THROW EFFECT - Mızrak Atışı (Uçan mızrak + trail pixels)
// ═══════════════════════════════════════════════════════════════════════════
export const SpearThrowEffect: React.FC<{
    position: [number, number, number];
    targetPosition?: [number, number, number];
    onComplete: () => void;
    color?: string;
}> = ({ position, targetPosition = [position[0], position[1], position[2] + 5], onComplete, color = '#ef4444' }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 500;
    const progressRef = useRef(0);

    const direction = useMemo(() => {
        return new THREE.Vector3(
            targetPosition[0] - position[0],
            targetPosition[1] - position[1],
            targetPosition[2] - position[2]
        ).normalize();
    }, [position, targetPosition]);

    useFrame(() => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;

        groupRef.current.position.x = position[0] + direction.x * progress * 10;
        groupRef.current.position.y = position[1] + direction.y * progress * 10 + 1;
        groupRef.current.position.z = position[2] + direction.z * progress * 10;

        // Spin spear
        groupRef.current.rotation.x += 0.2;

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
            {/* Spear body */}
            <mesh>
                <cylinderGeometry args={[0.06, 0.06, 2.5, 8]} />
                <meshBasicMaterial color={color} transparent opacity={1} />
            </mesh>
            {/* Spear tip - glowing */}
            <mesh position={[0, 1.4, 0]}>
                <coneGeometry args={[0.18, 0.5, 8]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={1} blending={THREE.AdditiveBlending} />
            </mesh>
            {/* Trail glow */}
            <mesh position={[0, -0.8, 0]}>
                <cylinderGeometry args={[0.02, 0.15, 1.5, 8]} />
                <meshBasicMaterial
                    color={color}
                    transparent
                    opacity={0.6}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
            {/* Shiny trail particles */}
            <ShinyPixels position={[0, -1, 0]} color={color} count={20} spread={0.5} progress={progressRef.current} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// WHIRLWIND EFFECT - Kıyım Ultimate (360° dönen pixelated kılıçlar + karakter dönüşü)
// Enhanced with retro MMO style pixel effects
// ═══════════════════════════════════════════════════════════════════════════
export const WhirlwindEffect: React.FC<{
    position: [number, number, number];
    onComplete: () => void;
    onCharacterRotate?: (rotation: number) => void;
    color?: string;
}> = ({ position, onComplete, onCharacterRotate, color = '#dc2626' }) => {
    const groupRef = useRef<THREE.Group>(null);
    const bladesRef = useRef<THREE.Group>(null);
    const innerRingRef = useRef<THREE.Mesh>(null);
    const outerRingRef = useRef<THREE.Mesh>(null);
    const startTime = useRef(Date.now());
    const duration = 2500; // Longer for more dramatic effect
    const progressRef = useRef(0);
    const totalRotation = useRef(0);

    useFrame((state) => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;
        const time = state.clock.elapsedTime;

        // SUPER FAST Spin effect - ultimate skill should be intense
        const spinSpeed = 0.4 + progress * 0.2; // Accelerates!
        groupRef.current.rotation.y += spinSpeed;
        totalRotation.current += spinSpeed;

        // Tell parent to rotate character 360 degrees
        if (onCharacterRotate) {
            onCharacterRotate(totalRotation.current);
        }

        // Scale up dramatically then down
        const scalePhase = progress < 0.15 ? progress / 0.15 : 1;
        const shrinkPhase = progress > 0.85 ? 1 - ((progress - 0.85) / 0.15) : 1;
        const scale = (1 + scalePhase * 0.8) * shrinkPhase;
        groupRef.current.scale.set(scale, scale, scale);

        // Pulsing rings animation
        if (innerRingRef.current) {
            const pulse = 1 + Math.sin(time * 15) * 0.15;
            innerRingRef.current.scale.set(pulse, pulse, 1);
        }
        if (outerRingRef.current) {
            const pulse = 1 + Math.sin(time * 12 + Math.PI) * 0.1;
            outerRingRef.current.scale.set(pulse, pulse, 1);
        }

        // Vertical oscillation for drama
        if (bladesRef.current) {
            bladesRef.current.position.y = 0.6 + Math.sin(time * 8) * 0.1;
        }

        // Fade out at end
        if (progress > 0.75) {
            const fade = 1 - (progress - 0.75) / 0.25;
            groupRef.current.traverse((child) => {
                if ((child as THREE.Mesh).isMesh && (child as THREE.Mesh).material) {
                    ((child as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = fade * 0.9;
                }
            });
        }

        if (progress >= 1) onComplete();
    });

    // Create PIXELATED blade slashes in a circle - more blades for ultimate!
    const blades = useMemo(() => {
        return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(i => ({
            rotation: (i / 12) * Math.PI * 2,
            yOffset: (i % 3) * 0.12, // Staggered heights
            length: 2.5 + (i % 2) * 0.5, // Varied lengths
            isGold: i % 4 === 0, // Every 4th blade is golden
        }));
    }, []);

    // Spiral trail positions
    const spiralTrail = useMemo(() => {
        const trail = [];
        for (let i = 0; i < 24; i++) {
            const angle = (i / 24) * Math.PI * 4; // 2 full spirals
            const radius = 0.5 + (i / 24) * 2;
            const height = i * 0.05;
            trail.push({
                x: Math.cos(angle) * radius,
                y: height,
                z: Math.sin(angle) * radius,
                size: 0.08 - (i / 24) * 0.04,
            });
        }
        return trail;
    }, []);

    return (
        <group ref={groupRef} position={position}>
            {/* PIXELATED Spinning blades group */}
            <group ref={bladesRef}>
                {blades.map((blade, i) => (
                    <group key={i} rotation={[0, blade.rotation, Math.PI * 0.1]} position={[0, blade.yOffset, 0]}>
                        {/* Main blade - pixelated boxes */}
                        {[0, 1, 2, 3, 4, 5, 6, 7].map(j => (
                            <mesh
                                key={j}
                                position={[(j - 3.5) * 0.35, 0, 0]}
                            >
                                <boxGeometry args={[0.3, 0.15, 0.04]} />
                                <meshBasicMaterial
                                    color={blade.isGold ? '#ffd700' : color}
                                    transparent
                                    opacity={0.95 - j * 0.05}
                                    blending={THREE.AdditiveBlending}
                                    side={THREE.DoubleSide}
                                />
                            </mesh>
                        ))}
                        {/* Blade tip glow */}
                        <mesh position={[blade.length * 0.5, 0, 0]}>
                            <boxGeometry args={[0.2, 0.2, 0.1]} />
                            <meshBasicMaterial
                                color="#ffffff"
                                transparent
                                opacity={0.9}
                                blending={THREE.AdditiveBlending}
                            />
                        </mesh>
                    </group>
                ))}
            </group>

            {/* Pixelated center energy core - stacked boxes */}
            <group>
                {[0, 1, 2, 3, 4].map(i => (
                    <mesh key={i} position={[0, i * 0.15 - 0.3, 0]}>
                        <boxGeometry args={[0.5 - i * 0.08, 0.12, 0.5 - i * 0.08]} />
                        <meshBasicMaterial
                            color={i === 2 ? '#ffffff' : color}
                            transparent
                            opacity={0.7 + i * 0.06}
                            blending={THREE.AdditiveBlending}
                        />
                    </mesh>
                ))}
            </group>

            {/* Inner glow ring - pulsing */}
            <mesh ref={innerRingRef} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[1.5, 2, 16]} />
                <meshBasicMaterial
                    color="#ffffff"
                    transparent
                    opacity={0.5}
                    blending={THREE.AdditiveBlending}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Outer glow ring - pulsing opposite */}
            <mesh ref={outerRingRef} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[2.8, 3.2, 16]} />
                <meshBasicMaterial
                    color={color}
                    transparent
                    opacity={0.35}
                    blending={THREE.AdditiveBlending}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Spiral trail effect - pixelated */}
            {spiralTrail.map((sp, i) => (
                <mesh key={i} position={[sp.x, sp.y, sp.z]}>
                    <boxGeometry args={[sp.size, sp.size, sp.size]} />
                    <meshBasicMaterial
                        color={i % 3 === 0 ? '#ffd700' : color}
                        transparent
                        opacity={0.7 - (i / spiralTrail.length) * 0.5}
                        blending={THREE.AdditiveBlending}
                    />
                </mesh>
            ))}

            {/* ═══ EXPANDING SPHERE BLAST (Friend's concept) ═══ */}
            {/* Massive AOE sphere that expands outward */}
            <mesh scale={[0.5 + progressRef.current * 5, 0.5 + progressRef.current * 5, 0.5 + progressRef.current * 5]}>
                <sphereGeometry args={[1, 16, 16]} />
                <meshBasicMaterial
                    color={color}
                    transparent
                    opacity={0.6 * (1 - progressRef.current)}
                    blending={THREE.AdditiveBlending}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Inner bright sphere core */}
            <mesh scale={[0.3 + progressRef.current * 2, 0.3 + progressRef.current * 2, 0.3 + progressRef.current * 2]}>
                <sphereGeometry args={[1, 12, 12]} />
                <meshBasicMaterial
                    color="#ffffff"
                    transparent
                    opacity={0.8 * (1 - progressRef.current)}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>

            {/* MASSIVE shiny pixel explosions - ULTIMATE STYLE */}
            <ShinyPixels position={[0, 0.5, 0]} color="#ffffff" count={60} spread={3.5} progress={progressRef.current} pixelSize={0.1} />
            <ShinyPixels position={[0, 0.5, 0]} color={color} count={50} spread={3} progress={progressRef.current} pixelSize={0.08} />
            <ShinyPixels position={[0, 1, 0]} color="#ffd700" count={40} spread={2.5} progress={progressRef.current} pixelSize={0.06} />
            <ShinyPixels position={[0, 0, 0]} color="#ff6b00" count={30} spread={2} progress={progressRef.current} pixelSize={0.07} />

            {/* Dynamic point lights for drama */}
            <pointLight color={color} intensity={5 * (1 - progressRef.current)} distance={6} />
            <pointLight color="#ffd700" intensity={3 * (1 - progressRef.current)} distance={4} position={[0, 1, 0]} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// WARRIOR SKILL MAP - Skill visual name -> Component
// ═══════════════════════════════════════════════════════════════════════════
export const WARRIOR_EFFECTS: Record<string, React.FC<any>> = {
    // New style keys
    warrior_slash: SlashEffect,
    warrior_shield: ShieldEffect,
    warrior_charge: RageBurstEffect,
    warrior_judgement: GroundSlamEffect,
    warrior_pierce: SpearThrowEffect,
    warrior_whirlwind: WhirlwindEffect,

    // Legacy keys (constants.ts ile eşleşen) - BU SATIRLAR EKSİKTİ!
    slash: SlashEffect,
    shield: ShieldEffect,
    rage: RageBurstEffect,
    slam: GroundSlamEffect,
    spear: SpearThrowEffect,
    shout: RageBurstEffect, // Shout için RageBurst kullan
    whirlwind: WhirlwindEffect,
};

export default WARRIOR_EFFECTS;
