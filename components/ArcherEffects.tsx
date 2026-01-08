// ═══════════════════════════════════════════════════════════════════════════
// ARCHER (OKÇU) SKILL EFFECTS - SHADER TABANLI
// Pixel/Shiny yeşil temalı ok ve rüzgar efektleri
// ═══════════════════════════════════════════════════════════════════════════

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Instances, Instance } from '@react-three/drei';

// ═══════════════════════════════════════════════════════════════════════════
// 🎨 SHADER OK MATERYALİ - Tüm oklar için ortak glow shader
// ═══════════════════════════════════════════════════════════════════════════
const createArrowShaderMaterial = (color: string) => {
    return new THREE.ShaderMaterial({
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        uniforms: {
            time: { value: 0 },
            glowColor: { value: new THREE.Color(color) }
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            uniform vec3 glowColor;
            varying vec2 vUv;

            void main() {
                float core = smoothstep(0.4, 0.0, abs(vUv.x - 0.5));
                float pulse = 0.6 + sin(time * 8.0) * 0.2;
                float fade = 1.0 - vUv.y * 0.3;
                gl_FragColor = vec4(glowColor, core * pulse * fade);
            }
        `
    });
};

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
// 🏹 SHADER OK BİLEŞENİ - Yeniden kullanılabilir
// ═══════════════════════════════════════════════════════════════════════════
const ShaderArrow: React.FC<{
    position: [number, number, number];
    rotation?: [number, number, number];
    scale?: [number, number, number];
    color: string;
    timeOffset?: number;
}> = ({ position, rotation = [0, 0, 0], scale = [0.1, 1.2, 1], color, timeOffset = 0 }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const material = useMemo(() => createArrowShaderMaterial(color), [color]);

    useFrame((state) => {
        if (meshRef.current && material.uniforms) {
            material.uniforms.time.value = state.clock.elapsedTime + timeOffset;
        }
    });

    return (
        <mesh ref={meshRef} position={position} rotation={rotation} scale={scale} material={material}>
            <planeGeometry args={[1, 1]} />
        </mesh>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 1️⃣ HIZLI ATIŞ (Quick Shot) - Normal Renkli Ok + Shader
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
        <group ref={groupRef} rotation={[Math.PI / 2, rotationY, 0]}>
            <ShaderArrow position={[0, 0, 0]} color="#66ff66" scale={[0.1, 1.2, 1]} />
            {/* Trail particles */}
            {Array.from({ length: 6 }).map((_, i) => (
                <mesh key={i} position={[0, -0.2 * (i + 1), 0]}>
                    <boxGeometry args={[0.06, 0.06, 0.06]} />
                    <meshBasicMaterial
                        color="#00ffaa"
                        transparent
                        opacity={0.8 - i * 0.1}
                        blending={THREE.AdditiveBlending}
                    />
                </mesh>
            ))}
            <pointLight color="#66ff66" intensity={2} distance={3} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 2️⃣ ÖLÜMCÜL CİRİT (Deadly Javelin) - Daha Parlak Kritik Ok
// ═══════════════════════════════════════════════════════════════════════════
export const DeadlyJavelinEffect: React.FC<{
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

    useFrame((state) => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;

        const distance = progress * 30;
        groupRef.current.position.set(
            position[0] + direction.x * distance,
            position[1] + 0.8,
            position[2] + direction.z * distance
        );

        // Büyüyen efekt
        const scale = 1 + progress * 0.3;
        groupRef.current.scale.setScalar(scale);

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} rotation={[Math.PI / 2, rotationY, 0]}>
            <ShaderArrow position={[0, 0, 0]} color="#ffaa00" scale={[0.15, 1.5, 1]} />
            {/* Aura particles */}
            {Array.from({ length: 12 }).map((_, i) => {
                const angle = (i / 12) * Math.PI * 2;
                return (
                    <mesh key={i} position={[Math.cos(angle) * 0.3, 0, Math.sin(angle) * 0.3]}>
                        <boxGeometry args={[0.08, 0.08, 0.08]} />
                        <meshBasicMaterial
                            color="#ff5500"
                            transparent
                            opacity={0.9}
                            blending={THREE.AdditiveBlending}
                        />
                    </mesh>
                );
            })}
            <pointLight color="#ffaa00" intensity={4} distance={4} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 3️⃣ AVCI ODAĞI (Hunter Focus) - Vücuda Yapışan Buff Aurası
// ═══════════════════════════════════════════════════════════════════════════
export const HunterFocusEffect: React.FC<{
    position: [number, number, number];
    onComplete: () => void;
    playerGroupRef?: React.MutableRefObject<THREE.Group | null>;
    followPlayer?: boolean;
}> = ({ position, onComplete, playerGroupRef, followPlayer = false }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 10000; // 10 saniye buff
    const progressRef = useRef(0);

    // Ring shader material
    const ringMaterial = useMemo(() => {
        return new THREE.ShaderMaterial({
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            side: THREE.DoubleSide,
            uniforms: { time: { value: 0 } },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                varying vec2 vUv;
                void main() {
                    float ring = sin((length(vUv - 0.5) * 12.0) - time * 6.0);
                    float alpha = ring * 0.4;
                    gl_FragColor = vec4(0.2, 1.0, 0.3, alpha);
                }
            `
        });
    }, []);

    useFrame((state) => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;

        // Oyuncuyu takip et
        if (followPlayer && playerGroupRef?.current) {
            const playerWorldPos = new THREE.Vector3();
            playerGroupRef.current.getWorldPosition(playerWorldPos);
            groupRef.current.position.copy(playerWorldPos);
        }

        // Shader time update
        ringMaterial.uniforms.time.value = state.clock.elapsedTime;

        // Fade out son %15'te
        if (progress > 0.85) {
            const fadeProgress = (progress - 0.85) / 0.15;
            ringMaterial.opacity = 1 - fadeProgress;
        }

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={position}>
            {/* Ana ring aurası */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]} material={ringMaterial}>
                <planeGeometry args={[2.2, 2.2]} />
            </mesh>

            {/* Dönen parçacıklar */}
            {Array.from({ length: 8 }).map((_, i) => {
                const angle = (i / 8) * Math.PI * 2;
                return (
                    <mesh key={i} position={[Math.cos(angle) * 0.5, 1 + Math.sin(angle) * 0.2, Math.sin(angle) * 0.5]}>
                        <boxGeometry args={[0.1, 0.1, 0.1]} />
                        <meshBasicMaterial
                            color="#55ff55"
                            transparent
                            opacity={0.9}
                            blending={THREE.AdditiveBlending}
                        />
                    </mesh>
                );
            })}

            <pointLight color="#55ff55" intensity={2} distance={3} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 4️⃣ RÜZGAR KESİĞİ (Wind Slash) - 3 Ok + Yay Effect
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

        const distance = progress * 25;
        groupRef.current.position.set(
            position[0] + direction.x * distance,
            position[1] + 0.8,
            position[2] + direction.z * distance
        );

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} rotation={[Math.PI / 2, rotationY, 0]}>
            {/* 3 yay ok */}
            {[-0.3, 0, 0.3].map((offset, i) => (
                <group key={i} position={[offset, 0, 0]} rotation={[0, 0, offset * 0.6]}>
                    <ShaderArrow position={[0, 0, 0]} color="#33ffcc" scale={[0.12, 1.3, 1]} timeOffset={i * 0.2} />
                </group>
            ))}
            {/* Yay glow */}
            <mesh position={[0, -0.5, 0]}>
                <boxGeometry args={[0.8, 0.15, 0.15]} />
                <meshBasicMaterial
                    color="#ffffff"
                    transparent
                    opacity={0.8 * (1 - progressRef.current)}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
            <pointLight color="#33ffcc" intensity={3} distance={4} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 5️⃣ GERİ ADIM (Backstep) - Geri İten Ok
// ═══════════════════════════════════════════════════════════════════════════
export const BackstepEffect: React.FC<{
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

    const rotationY = Math.atan2(direction.x, direction.z);

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

        // Genişleyen efekt
        const scaleX = 1 + progress * 0.5;
        groupRef.current.scale.x = scaleX;

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} rotation={[Math.PI / 2, rotationY, 0]}>
            <ShaderArrow position={[0, 0, 0]} color="#66ccff" scale={[0.18, 1.6, 1]} />
            {/* Knockback wave */}
            <mesh position={[0, 0.5, 0]}>
                <ringGeometry args={[0.3, 0.5, 16]} />
                <meshBasicMaterial
                    color="#66ccff"
                    transparent
                    opacity={0.6}
                    blending={THREE.AdditiveBlending}
                    side={THREE.DoubleSide}
                />
            </mesh>
            <pointLight color="#66ccff" intensity={3} distance={4} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 6️⃣ EJDER OKU (Dragon Arrow) - Dev Ejderha Formlu Ok (ULTİ)
// ═══════════════════════════════════════════════════════════════════════════
export const DragonArrowEffect: React.FC<{
    position: [number, number, number];
    targetPosition?: [number, number, number];
    onComplete: () => void;
}> = ({ position, targetPosition, onComplete }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 1200; // Ulti daha uzun
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

    // Alev parçacıkları
    const flames = useMemo(() => {
        return Array.from({ length: 20 }).map((_, i) => ({
            offset: i * 0.15,
            angle: (i / 20) * Math.PI * 2,
            size: 0.12 + Math.random() * 0.08,
        }));
    }, []);

    useFrame((state) => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;

        const distance = progress * 50;
        groupRef.current.position.set(
            position[0] + direction.x * distance,
            position[1] + 0.8,
            position[2] + direction.z * distance
        );

        // Sallanma efekti
        groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 6) * 0.05;

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} rotation={[Math.PI / 2, rotationY, 0]}>
            {/* Dev ejderha ok */}
            <ShaderArrow position={[0, 0, 0]} color="#ff3300" scale={[0.6, 3.5, 1]} />

            {/* Alev trail */}
            {flames.map((flame, i) => {
                const x = Math.cos(flame.angle + progressRef.current * 3) * 0.4;
                const y = -flame.offset;
                const z = Math.sin(flame.angle + progressRef.current * 3) * 0.4;
                return (
                    <mesh key={i} position={[x, y, z]}>
                        <boxGeometry args={[flame.size, flame.size, flame.size]} />
                        <meshBasicMaterial
                            color="#ffaa00"
                            transparent
                            opacity={0.9 - i * 0.03}
                            blending={THREE.AdditiveBlending}
                        />
                    </mesh>
                );
            })}

            {/* Ejderha başı hissi */}
            <mesh position={[0, 1.8, 0]}>
                <coneGeometry args={[0.3, 0.6, 4]} />
                <meshBasicMaterial
                    color="#ff6600"
                    transparent
                    opacity={0.8}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>

            <pointLight color="#ff3300" intensity={8} distance={8} />
            <pointLight position={[0, 1, 0]} color="#ffaa00" intensity={5} distance={5} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// MULTISHOT EFEKTİ - Çoklu ok
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

        const distance = progress * 25;
        groupRef.current.position.set(
            position[0] + direction.x * distance,
            position[1] + 0.8,
            position[2] + direction.z * distance
        );

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} rotation={[Math.PI / 2, rotationY, 0]}>
            {/* 5 ok yayılarak */}
            {[-0.4, -0.2, 0, 0.2, 0.4].map((offset, i) => (
                <group key={i} position={[offset * progressRef.current * 2, 0, 0]} rotation={[0, 0, offset * 0.4]}>
                    <ShaderArrow position={[0, 0, 0]} color="#88ff88" scale={[0.08, 1.0, 1]} timeOffset={i * 0.1} />
                </group>
            ))}
            <pointLight color="#88ff88" intensity={3} distance={4} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// STEALTH EFEKTİ - Gizlenme
// ═══════════════════════════════════════════════════════════════════════════
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
                <ringGeometry args={[0.8, 1.2, 16]} />
                <meshBasicMaterial
                    color="#333333"
                    transparent
                    opacity={0.5 * (1 - progressRef.current)}
                    blending={THREE.AdditiveBlending}
                    side={THREE.DoubleSide}
                />
            </mesh>
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// TRAP EFEKTİ - Tuzak
// ═══════════════════════════════════════════════════════════════════════════
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
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;

        // Pulse efekti
        const pulse = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.1;
        groupRef.current.scale.setScalar(pulse);

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={spawnPos}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
                <ringGeometry args={[0.5, 0.8, 6]} />
                <meshBasicMaterial
                    color="#ff4444"
                    transparent
                    opacity={0.7 * (1 - progressRef.current)}
                    blending={THREE.AdditiveBlending}
                    side={THREE.DoubleSide}
                />
            </mesh>
            {/* Dikenler */}
            {Array.from({ length: 6 }).map((_, i) => {
                const angle = (i / 6) * Math.PI * 2;
                return (
                    <mesh key={i} position={[Math.cos(angle) * 0.6, 0.2, Math.sin(angle) * 0.6]} rotation={[0, angle, 0]}>
                        <coneGeometry args={[0.05, 0.3, 4]} />
                        <meshBasicMaterial color="#ff6666" />
                    </mesh>
                );
            })}
            <pointLight color="#ff4444" intensity={2} distance={3} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// ARROW RAIN EFEKTİ - Ok Yağmuru
// ═══════════════════════════════════════════════════════════════════════════
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

    const arrows = useMemo(() => {
        return Array.from({ length: 30 }).map(() => ({
            x: (Math.random() - 0.5) * 4,
            z: (Math.random() - 0.5) * 4,
            delay: Math.random() * 0.5,
            speed: 0.8 + Math.random() * 0.4,
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
        <group ref={groupRef} position={spawnPos}>
            {arrows.map((arrow, i) => {
                const arrowProgress = Math.max(0, Math.min(1, (progressRef.current - arrow.delay) / 0.5));
                const y = 5 - arrowProgress * 5 * arrow.speed;
                return (
                    <mesh key={i} position={[arrow.x, Math.max(0.1, y), arrow.z]} rotation={[0, 0, 0]}>
                        <boxGeometry args={[0.05, 0.4, 0.05]} />
                        <meshBasicMaterial
                            color="#ffff88"
                            transparent
                            opacity={arrowProgress > 0 && y > 0 ? 0.9 : 0}
                            blending={THREE.AdditiveBlending}
                        />
                    </mesh>
                );
            })}
            <ArrowPixels position={[0, 0.5, 0]} color="#ffff88" count={35} spread={3} progress={progressRef.current} />
            <pointLight color="#ffaa00" intensity={3 * progressRef.current} distance={5} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// ARCHER SKILL MAP
// ═══════════════════════════════════════════════════════════════════════════
export const ARCHER_EFFECTS: Record<string, React.FC<any>> = {
    // ✅ CONSTANTS.TS VISUAL KEYS (GERÇEK KEY'LER)
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

    // Yeni efektler
    multishot_effect: MultishotEffect,
    stealth_effect: StealthEffect,
    trap_effect: TrapEffect,
    arrow_rain_effect: ArrowRainEffect,

    // Components/constants.ts keys - DOĞRU MAPPING
    arrow: RapidShotEffect,
    multishot: MultishotEffect,
    stealth: StealthEffect,
    trap: TrapEffect,
    dash_back: BackstepEffect,
    poison_arrow: DeadlyJavelinEffect,
    arrow_rain: ArrowRainEffect,

    // Ek alias'lar
    rapid_shot: RapidShotEffect,
    deadly_javelin: DeadlyJavelinEffect,
    hunter_focus: HunterFocusEffect,
    wind_razor: WindSlashEffect,
};

export default ARCHER_EFFECTS;
