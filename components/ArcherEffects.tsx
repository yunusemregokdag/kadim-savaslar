// ═══════════════════════════════════════════════════════════════════════════
// ARCHER (OKÇU) SKILL EFFECTS - 2D PİXEL ART STİLİ
// Düz plane geometri, pixel shader, YAVAŞ hareketler
// ═══════════════════════════════════════════════════════════════════════════

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

// ═══════════════════════════════════════════════════════════════════════════
// 🎨 2D PIXEL SHADER - Düz yüzeyde pixel grid çizimi
// ═══════════════════════════════════════════════════════════════════════════
const createPixelMaterial = (mainColor: string, secondaryColor: string, pixelSize: number = 16) => {
    const c1 = new THREE.Color(mainColor);
    const c2 = new THREE.Color(secondaryColor);

    return new THREE.ShaderMaterial({
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
            time: { value: 0 },
            color1: { value: new THREE.Vector3(c1.r, c1.g, c1.b) },
            color2: { value: new THREE.Vector3(c2.r, c2.g, c2.b) },
            pixelSize: { value: pixelSize }
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
            uniform vec3 color1;
            uniform vec3 color2;
            uniform float pixelSize;
            varying vec2 vUv;

            void main() {
                // Pixelate UV
                vec2 pUv = floor(vUv * pixelSize) / pixelSize;
                
                // Arrow shape - pointed tip
                float arrow = 1.0 - smoothstep(0.3, 0.7, abs(pUv.y - 0.5) * 2.0);
                arrow *= smoothstep(0.0, 0.3, pUv.x);
                
                // Color mix with time
                vec3 col = mix(color1, color2, sin(time * 3.0) * 0.5 + 0.5);
                
                // Glow
                float glow = arrow * (0.8 + sin(time * 5.0) * 0.2);
                
                gl_FragColor = vec4(col, glow);
            }
        `
    });
};

// ═══════════════════════════════════════════════════════════════════════════
// 🌟 SHINY SPARKLES - Parıldayan pixel yıldızlar
// ═══════════════════════════════════════════════════════════════════════════
const Sparkles: React.FC<{
    position: [number, number, number];
    color: string;
    count?: number;
    spread?: number;
    progress: number;
}> = ({ position, color, count = 15, spread = 1.5, progress }) => {
    const groupRef = useRef<THREE.Group>(null);
    const meshRefs = useRef<THREE.Mesh[]>([]);

    const sparkleData = useMemo(() => {
        return Array.from({ length: count }).map(() => ({
            x: (Math.random() - 0.5) * spread,
            y: (Math.random() - 0.5) * spread,
            z: (Math.random() - 0.5) * spread * 0.3,
            size: 0.03 + Math.random() * 0.04,
            twinkleSpeed: 3 + Math.random() * 5,
            twinkleOffset: Math.random() * Math.PI * 2,
        }));
    }, [count, spread]);

    useFrame((state) => {
        const time = state.clock.elapsedTime;
        meshRefs.current.forEach((mesh, i) => {
            if (!mesh) return;
            const s = sparkleData[i];
            const twinkle = Math.sin(time * s.twinkleSpeed + s.twinkleOffset);
            (mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, (1 - progress) * (0.5 + twinkle * 0.5));
            mesh.scale.setScalar(s.size * (1 + twinkle * 0.3));
        });
    });

    return (
        <group ref={groupRef} position={position}>
            {sparkleData.map((s, i) => (
                <mesh key={i} ref={(el) => { if (el) meshRefs.current[i] = el; }} position={[s.x, s.y, s.z]}>
                    <planeGeometry args={[0.1, 0.1]} />
                    <meshBasicMaterial color={color} transparent opacity={1} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
                </mesh>
            ))}
            <pointLight color={color} intensity={1.5 * (1 - progress)} distance={spread} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 1️⃣ QUICK SHOT - Basit yeşil ok (YAVAŞ)
// ═══════════════════════════════════════════════════════════════════════════
export const RapidShotEffect: React.FC<{
    position: [number, number, number];
    targetPosition?: [number, number, number];
    onComplete: () => void;
}> = ({ position, targetPosition, onComplete }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 1500; // YAVAŞ - 1.5 saniye
    const progressRef = useRef(0);

    const direction = useMemo(() => {
        if (targetPosition) {
            return new THREE.Vector3(targetPosition[0] - position[0], 0, targetPosition[2] - position[2]).normalize();
        }
        return new THREE.Vector3(0, 0, 1);
    }, [position, targetPosition]);

    const material = useMemo(() => createPixelMaterial('#66ff66', '#aaff88', 12), []);

    useFrame(() => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;

        // YAVAŞ hareket
        const distance = progress * 20;
        groupRef.current.position.set(
            position[0] + direction.x * distance,
            position[1] + 0.8,
            position[2] + direction.z * distance
        );

        material.uniforms.time.value += 0.02;

        if (progress >= 1) onComplete();
    });

    // Ok yönünü hesapla
    const rotationY = Math.atan2(direction.x, direction.z);

    return (
        <group ref={groupRef}>
            {/* 2D Pixel Ok - Billboard */}
            <mesh rotation={[0, rotationY, 0]} material={material}>
                <planeGeometry args={[1.2, 0.3]} />
            </mesh>
            <Sparkles position={[0, 0, 0]} color="#66ff66" count={8} spread={0.5} progress={progressRef.current} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 2️⃣ DEADLY JAVELIN - Büyük kırmızı/turuncu ok (YAVAŞ)
// ═══════════════════════════════════════════════════════════════════════════
export const DeadlyJavelinEffect: React.FC<{
    position: [number, number, number];
    targetPosition?: [number, number, number];
    onComplete: () => void;
}> = ({ position, targetPosition, onComplete }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 1800; // YAVAŞ - 1.8 saniye
    const progressRef = useRef(0);

    const direction = useMemo(() => {
        if (targetPosition) {
            return new THREE.Vector3(targetPosition[0] - position[0], 0, targetPosition[2] - position[2]).normalize();
        }
        return new THREE.Vector3(0, 0, 1);
    }, [position, targetPosition]);

    const material = useMemo(() => createPixelMaterial('#ff6633', '#ffaa44', 14), []);

    useFrame(() => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;

        // YAVAŞ hareket
        const distance = progress * 25;
        groupRef.current.position.set(
            position[0] + direction.x * distance,
            position[1] + 0.8,
            position[2] + direction.z * distance
        );

        material.uniforms.time.value += 0.025;

        if (progress >= 1) onComplete();
    });

    const rotationY = Math.atan2(direction.x, direction.z);

    return (
        <group ref={groupRef}>
            {/* Daha büyük ok */}
            <mesh rotation={[0, rotationY, 0]} material={material}>
                <planeGeometry args={[1.6, 0.4]} />
            </mesh>
            <Sparkles position={[0, 0, 0]} color="#ff6633" count={12} spread={0.6} progress={progressRef.current} />
            <pointLight color="#ff6633" intensity={2} distance={3} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 3️⃣ HUNTER'S FOCUS - Düşmanın etrafında dönen pençeler
// ═══════════════════════════════════════════════════════════════════════════
export const HunterFocusEffect: React.FC<{
    position: [number, number, number];
    targetPosition?: [number, number, number];
    onComplete: () => void;
    playerGroupRef?: React.MutableRefObject<THREE.Group | null>;
    followPlayer?: boolean;
}> = ({ position, targetPosition, onComplete }) => {
    const groupRef = useRef<THREE.Group>(null);
    const clawRefs = useRef<THREE.Group[]>([]);
    const startTime = useRef(Date.now());
    const duration = 3000; // 3 saniye
    const progressRef = useRef(0);

    // Hedef pozisyonu
    const spawnPos = targetPosition || position;

    // 4 pençe pozisyonu
    const claws = useMemo(() => [0, 1, 2, 3].map(i => ({
        angle: (i / 4) * Math.PI * 2,
        radius: 1.2,
    })), []);

    useFrame((state) => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;
        const time = state.clock.elapsedTime;

        // Pençeleri döndür
        clawRefs.current.forEach((claw, i) => {
            if (!claw) return;
            const baseAngle = claws[i].angle;
            const currentAngle = baseAngle + time * 2; // Dönen
            claw.position.x = Math.cos(currentAngle) * claws[i].radius;
            claw.position.z = Math.sin(currentAngle) * claws[i].radius;
            claw.rotation.y = currentAngle + Math.PI / 2;

            // Fade out
            claw.traverse((child) => {
                if ((child as THREE.Mesh).isMesh) {
                    ((child as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = (1 - progress) * 0.9;
                }
            });
        });

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={spawnPos}>
            {/* 4 Dönen Pençe */}
            {claws.map((claw, i) => (
                <group
                    key={i}
                    ref={(el) => { if (el) clawRefs.current[i] = el; }}
                    position={[Math.cos(claw.angle) * claw.radius, 0.5, Math.sin(claw.angle) * claw.radius]}
                >
                    {/* Pençe - 3 çizgi */}
                    {[-0.15, 0, 0.15].map((offset, j) => (
                        <mesh key={j} position={[offset, 0, 0]} rotation={[0, 0, (j - 1) * 0.3]}>
                            <planeGeometry args={[0.08, 0.5]} />
                            <meshBasicMaterial
                                color="#44ff44"
                                transparent
                                opacity={0.9}
                                blending={THREE.AdditiveBlending}
                                side={THREE.DoubleSide}
                            />
                        </mesh>
                    ))}
                </group>
            ))}

            {/* Zemin halkası */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
                <ringGeometry args={[0.9, 1.3, 16]} />
                <meshBasicMaterial
                    color="#44ff44"
                    transparent
                    opacity={0.4 * (1 - progressRef.current)}
                    blending={THREE.AdditiveBlending}
                    side={THREE.DoubleSide}
                />
            </mesh>

            <Sparkles position={[0, 0.5, 0]} color="#44ff44" count={20} spread={1.5} progress={progressRef.current} />
            <pointLight color="#44ff44" intensity={2} distance={3} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 4️⃣ WIND SLASH - 3 ok yayılarak (YAVAŞ)
// ═══════════════════════════════════════════════════════════════════════════
export const WindSlashEffect: React.FC<{
    position: [number, number, number];
    targetPosition?: [number, number, number];
    onComplete: () => void;
}> = ({ position, targetPosition, onComplete }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 1400; // YAVAŞ
    const progressRef = useRef(0);

    const direction = useMemo(() => {
        if (targetPosition) {
            return new THREE.Vector3(targetPosition[0] - position[0], 0, targetPosition[2] - position[2]).normalize();
        }
        return new THREE.Vector3(0, 0, 1);
    }, [position, targetPosition]);

    const materials = useMemo(() => [
        createPixelMaterial('#33ccff', '#88ddff', 10),
        createPixelMaterial('#33ccff', '#88ddff', 10),
        createPixelMaterial('#33ccff', '#88ddff', 10),
    ], []);

    useFrame(() => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;

        const distance = progress * 22;
        groupRef.current.position.set(
            position[0] + direction.x * distance,
            position[1] + 0.8,
            position[2] + direction.z * distance
        );

        materials.forEach(m => m.uniforms.time.value += 0.02);

        if (progress >= 1) onComplete();
    });

    const rotationY = Math.atan2(direction.x, direction.z);

    return (
        <group ref={groupRef}>
            {[-0.3, 0, 0.3].map((offset, i) => (
                <mesh key={i} position={[offset * (1 + progressRef.current), 0, 0]} rotation={[0, rotationY + offset * 0.2, 0]} material={materials[i]}>
                    <planeGeometry args={[1.0, 0.25]} />
                </mesh>
            ))}
            <Sparkles position={[0, 0, 0]} color="#33ccff" count={15} spread={0.8} progress={progressRef.current} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 5️⃣ BACKSTEP - Karakteri geri zıplatır (basit efekt)
// ═══════════════════════════════════════════════════════════════════════════
export const BackstepEffect: React.FC<{
    position: [number, number, number];
    targetPosition?: [number, number, number];
    onComplete: () => void;
}> = ({ position, onComplete }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 500;
    const progressRef = useRef(0);

    useFrame(() => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;

        // Fade out
        groupRef.current.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                ((child as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = (1 - progress) * 0.7;
            }
        });

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={[position[0], 0.1, position[2]]}>
            {/* Basit toz bulutu efekti */}
            {Array.from({ length: 8 }).map((_, i) => {
                const angle = (i / 8) * Math.PI * 2;
                const r = 0.5 + Math.random() * 0.3;
                return (
                    <mesh key={i} position={[Math.cos(angle) * r, 0.1 + Math.random() * 0.2, Math.sin(angle) * r]}>
                        <planeGeometry args={[0.15, 0.15]} />
                        <meshBasicMaterial
                            color="#aaaaaa"
                            transparent
                            opacity={0.6}
                            blending={THREE.AdditiveBlending}
                            side={THREE.DoubleSide}
                        />
                    </mesh>
                );
            })}
            <Sparkles position={[0, 0.2, 0]} color="#ffffff" count={10} spread={0.8} progress={progressRef.current} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 6️⃣ DRAGON ARROW - 2D PIXEL ART EJDERHA (YAVAŞ)
// ═══════════════════════════════════════════════════════════════════════════
export const DragonArrowEffect: React.FC<{
    position: [number, number, number];
    targetPosition?: [number, number, number];
    onComplete: () => void;
}> = ({ position, targetPosition, onComplete }) => {
    const groupRef = useRef<THREE.Group>(null);
    const dragonRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 3000; // YAVAŞ - 3 saniye
    const progressRef = useRef(0);

    const direction = useMemo(() => {
        if (targetPosition) {
            return new THREE.Vector3(targetPosition[0] - position[0], 0, targetPosition[2] - position[2]).normalize();
        }
        return new THREE.Vector3(0, 0, 1);
    }, [position, targetPosition]);

    const rotationY = Math.atan2(direction.x, direction.z);

    // 2D Pixel ejderha shader
    const dragonMaterial = useMemo(() => {
        return new THREE.ShaderMaterial({
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
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
                    vec2 uv = vUv;
                    
                    // Pixelate
                    vec2 pUv = floor(uv * 24.0) / 24.0;
                    
                    // Dragon head shape
                    float head = step(0.6, pUv.x) * step(0.25, pUv.y) * step(pUv.y, 0.75);
                    
                    // Snout
                    float snout = step(0.75, pUv.x) * step(0.35, pUv.y) * step(pUv.y, 0.65);
                    
                    // Body
                    float body = step(0.2, pUv.x) * step(pUv.x, 0.65) * step(0.3, pUv.y) * step(pUv.y, 0.7);
                    
                    // Tail
                    float tail = step(0.0, pUv.x) * step(pUv.x, 0.25) * step(0.4, pUv.y) * step(pUv.y, 0.6);
                    
                    // Wing (top)
                    float wing = step(0.3, pUv.x) * step(pUv.x, 0.6) * step(0.65, pUv.y) * step(pUv.y, 0.9);
                    wing += step(0.35, pUv.x) * step(pUv.x, 0.55) * step(0.1, pUv.y) * step(pUv.y, 0.35);
                    
                    // Eyes
                    float eye = step(0.68, pUv.x) * step(pUv.x, 0.73) * step(0.55, pUv.y) * step(pUv.y, 0.62);
                    
                    // Combined shape
                    float dragon = head + snout + body + tail + wing;
                    dragon = clamp(dragon, 0.0, 1.0);
                    
                    // Colors - orange/red with fire
                    vec3 bodyColor = vec3(1.0, 0.4, 0.1);
                    vec3 hotColor = vec3(1.0, 0.7, 0.2);
                    float fire = sin(time * 5.0 + pUv.x * 10.0) * 0.2 + 0.8;
                    
                    vec3 col = mix(bodyColor, hotColor, fire);
                    
                    // Eye is white/yellow
                    if (eye > 0.5) col = vec3(1.0, 1.0, 0.5);
                    
                    float alpha = dragon * 0.95;
                    
                    gl_FragColor = vec4(col, alpha);
                }
            `
        });
    }, []);

    useFrame((state) => {
        if (!groupRef.current || !dragonRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;
        const time = state.clock.elapsedTime;

        // YAVAŞ hareket
        const distance = progress * 40;
        groupRef.current.position.set(
            position[0] + direction.x * distance,
            position[1] + 1,
            position[2] + direction.z * distance
        );

        // Hafif sallanma
        dragonRef.current.rotation.z = Math.sin(time * 4) * 0.05;
        dragonRef.current.position.y = Math.sin(time * 3) * 0.1;

        dragonMaterial.uniforms.time.value = time;

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef}>
            <group ref={dragonRef} rotation={[0, rotationY, 0]}>
                {/* 2D Pixel Ejderha */}
                <mesh material={dragonMaterial}>
                    <planeGeometry args={[4, 2]} />
                </mesh>

                {/* Alev parçacıkları */}
                {Array.from({ length: 15 }).map((_, i) => {
                    const x = -1.5 - i * 0.15;
                    const y = (Math.random() - 0.5) * 0.5;
                    return (
                        <mesh key={i} position={[x, y, 0]}>
                            <planeGeometry args={[0.15 + Math.random() * 0.1, 0.15 + Math.random() * 0.1]} />
                            <meshBasicMaterial
                                color={i % 3 === 0 ? '#ffff44' : i % 3 === 1 ? '#ff8800' : '#ff4400'}
                                transparent
                                opacity={0.9 - i * 0.04}
                                blending={THREE.AdditiveBlending}
                                side={THREE.DoubleSide}
                            />
                        </mesh>
                    );
                })}
            </group>

            <Sparkles position={[0, 0, 0]} color="#ff6600" count={30} spread={2} progress={progressRef.current} />
            <Sparkles position={[-1, 0, 0]} color="#ffaa00" count={20} spread={1.5} progress={progressRef.current} />
            <pointLight color="#ff4400" intensity={5} distance={6} />
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
    const materials = useMemo(() => Array.from({ length: 5 }).map(() => createPixelMaterial('#88ff88', '#aaffaa', 10)), []);

    useFrame(() => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;

        const distance = progress * 20;
        groupRef.current.position.set(position[0] + direction.x * distance, position[1] + 0.8, position[2] + direction.z * distance);

        materials.forEach(m => m.uniforms.time.value += 0.02);

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef}>
            {[-0.4, -0.2, 0, 0.2, 0.4].map((offset, i) => (
                <mesh key={i} position={[offset * (1 + progressRef.current), 0, 0]} rotation={[0, rotationY + offset * 0.15, 0]} material={materials[i]}>
                    <planeGeometry args={[0.8, 0.2]} />
                </mesh>
            ))}
            <Sparkles position={[0, 0, 0]} color="#88ff88" count={20} spread={1} progress={progressRef.current} />
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
                <ringGeometry args={[0.4, 0.8, 8]} />
                <meshBasicMaterial color="#555555" transparent opacity={0.3 * (1 - progressRef.current)} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
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
                <ringGeometry args={[0.3, 0.6, 6]} />
                <meshBasicMaterial color="#ff4444" transparent opacity={0.6 * (1 - progressRef.current)} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
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
    const startTime = useRef(Date.now());
    const duration = 2500;
    const progressRef = useRef(0);
    const spawnPos = targetPosition || position;

    const arrows = useMemo(() => Array.from({ length: 20 }).map(() => ({
        x: (Math.random() - 0.5) * 4,
        z: (Math.random() - 0.5) * 4,
        delay: Math.random() * 0.5,
    })), []);

    const material = useMemo(() => createPixelMaterial('#ffff66', '#ffaa44', 8), []);

    useFrame(() => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        progressRef.current = Math.min(elapsed / duration, 1);
        material.uniforms.time.value += 0.02;
        if (progressRef.current >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={spawnPos}>
            {arrows.map((arrow, i) => {
                const arrowProgress = Math.max(0, Math.min(1, (progressRef.current - arrow.delay) / 0.4));
                const y = 5 - arrowProgress * 5;
                if (arrowProgress <= 0 || y < 0.1) return null;
                return (
                    <mesh key={i} position={[arrow.x, y, arrow.z]} rotation={[Math.PI / 2, 0, 0]} material={material}>
                        <planeGeometry args={[0.2, 0.6]} />
                    </mesh>
                );
            })}
            <Sparkles position={[0, 0.5, 0]} color="#ffff66" count={25} spread={2.5} progress={progressRef.current} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// ARCHER SKILL MAP
// ═══════════════════════════════════════════════════════════════════════════
export const ARCHER_EFFECTS: Record<string, React.FC<any>> = {
    // CONSTANTS.TS VISUAL KEYS
    archer_shot: RapidShotEffect,
    javelin: DeadlyJavelinEffect,
    hunters_focus: HunterFocusEffect,
    archer_volley: MultishotEffect,
    backstep: BackstepEffect,
    dragon_arrow: DragonArrowEffect,

    // Style keys
    arrow_shot: RapidShotEffect,
    focus: HunterFocusEffect,
    wind_slash: WindSlashEffect,

    // Ek efektler
    multishot_effect: MultishotEffect,
    stealth_effect: StealthEffect,
    trap_effect: TrapEffect,
    arrow_rain_effect: ArrowRainEffect,

    // Alias
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
