import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// 🎨 REAPER RENK PALETİ
const COLOR_PRIMARY = new THREE.Color('#4fffa7'); // Parlak Yeşil
const COLOR_DARK = new THREE.Color('#008f5e');    // Koyu Yeşil
const COLOR_CORE = new THREE.Color('#ffffff');    // Beyaz Çekirdek

// ═══════════════════════════════════════════════════════════════════════════
// SHINY PIXELS - Parıldayan Pixel Parçacıklar
// ═══════════════════════════════════════════════════════════════════════════
const ShinyPixels = ({ position, color, count = 20, spread = 2, progress, pixelSize = 0.08 }: {
    position: [number, number, number];
    color: string;
    count?: number;
    spread?: number;
    progress: number;
    pixelSize?: number;
}) => {
    const particles = useMemo(() => {
        return Array.from({ length: count }, () => ({
            x: (Math.random() - 0.5) * spread,
            y: (Math.random() - 0.5) * spread,
            z: (Math.random() - 0.5) * spread * 0.5,
            scale: 0.5 + Math.random() * 0.5,
            speed: 0.5 + Math.random() * 0.5,
        }));
    }, [count, spread]);

    return (
        <group position={position}>
            {particles.map((p, i) => (
                <mesh
                    key={i}
                    position={[p.x * (1 + progress * p.speed), p.y * (1 + progress * p.speed), p.z]}
                    scale={p.scale * (1 - progress * 0.8)}
                >
                    <boxGeometry args={[pixelSize, pixelSize, pixelSize]} />
                    <meshBasicMaterial
                        color={color}
                        transparent
                        opacity={(1 - progress) * 0.9}
                        blending={THREE.AdditiveBlending}
                    />
                </mesh>
            ))}
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// REAPER SLASH - Warrior tarzı ama yeşil
// ═══════════════════════════════════════════════════════════════════════════
const ReaperSlash = ({ position, onComplete, rotation = 0 }: {
    position: [number, number, number];
    onComplete?: () => void;
    rotation?: number;
}) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 400;
    const progressRef = useRef(0);

    const slashPixels = useMemo(() => {
        const pixels = [];
        const numSegments = 14;
        for (let i = 0; i < numSegments; i++) {
            const angle = -Math.PI * 0.35 + (i / numSegments) * Math.PI * 0.7;
            const radius = 1.4 + (i % 2) * 0.25;
            pixels.push({
                x: Math.cos(angle) * radius,
                y: Math.sin(angle) * radius,
                size: 0.28 - (i / numSegments) * 0.12,
                isCore: i >= 5 && i <= 9,
            });
        }
        return pixels;
    }, []);

    useFrame(() => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;

        const scale = 1 + progress * 1.8;
        groupRef.current.scale.set(scale, scale, scale);
        groupRef.current.rotation.z = rotation + progress * Math.PI * 0.5;

        const fadeProgress = Math.pow(progress, 0.6);
        groupRef.current.traverse((child) => {
            if ((child as THREE.Mesh).isMesh && (child as THREE.Mesh).material) {
                const mat = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
                if (mat.opacity !== undefined) mat.opacity = (1 - fadeProgress) * 0.95;
            }
        });

        if (progress >= 1 && onComplete) onComplete();
    });

    return (
        <group ref={groupRef} position={position}>
            {slashPixels.map((px, i) => (
                <mesh key={i} position={[px.x, px.y, 0]}>
                    <boxGeometry args={[px.size, px.size * 1.6, 0.1]} />
                    <meshBasicMaterial
                        color={px.isCore ? '#ffffff' : '#4fffa7'}
                        transparent
                        opacity={1}
                        blending={THREE.AdditiveBlending}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            ))}

            {slashPixels.filter((_, i) => i % 2 === 0).map((px, i) => (
                <mesh key={`s-${i}`} position={[px.x * 0.8, px.y * 0.8, 0.05]}>
                    <boxGeometry args={[px.size * 0.65, px.size * 1.3, 0.08]} />
                    <meshBasicMaterial
                        color="#008f5e"
                        transparent
                        opacity={0.7}
                        blending={THREE.AdditiveBlending}
                    />
                </mesh>
            ))}

            <mesh position={[0.9, 0, 0]}>
                <boxGeometry args={[0.35, 0.35, 0.18]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={0.9} blending={THREE.AdditiveBlending} />
            </mesh>

            <ShinyPixels position={[0.6, 0, 0]} color="#ffffff" count={18} spread={1.3} progress={progressRef.current} pixelSize={0.07} />
            <ShinyPixels position={[0, 0, 0]} color="#4fffa7" count={12} spread={1} progress={progressRef.current} pixelSize={0.06} />

            <pointLight color="#4fffa7" intensity={3.5 * (1 - progressRef.current)} distance={4} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// SKILL 1 - TIRPAN (Tek Vuruş)
// ═══════════════════════════════════════════════════════════════════════════
const ScytheSlash = ({ position, onComplete }: { position: [number, number, number]; onComplete?: () => void }) => {
    return <ReaperSlash position={position} onComplete={onComplete} />;
};

// ═══════════════════════════════════════════════════════════════════════════
// SKILL 2 - ÖLÜM DOKUNUŞU (Büyük Pençe - Shader ile)
// ═══════════════════════════════════════════════════════════════════════════
const DeathTouchFX = ({ position, onComplete }: { position: [number, number, number]; onComplete?: () => void }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 600;

    useFrame(() => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);

        groupRef.current.position.y = position[1] + 4 - progress * 5;
        groupRef.current.position.z = position[2] + progress * 2.5;

        groupRef.current.children.forEach((child) => {
            if ((child as THREE.Mesh).material) {
                const mat = (child as THREE.Mesh).material as THREE.ShaderMaterial;
                if (mat.uniforms?.uOpacity) {
                    mat.uniforms.uOpacity.value = 1 - Math.pow(progress, 0.4);
                }
            }
        });

        if (progress >= 1 && onComplete) onComplete();
    });

    return (
        <group ref={groupRef} position={[position[0], position[1] + 4, position[2] - 1]}>
            {[-1.0, 0, 1.0].map((offset, i) => (
                <mesh key={i} position={[offset, 0, 0]} rotation={[0, 0, 0.25 * (i - 1)]}>
                    <planeGeometry args={[0.5, 4.5]} />
                    <shaderMaterial
                        transparent
                        side={THREE.DoubleSide}
                        blending={THREE.AdditiveBlending}
                        uniforms={{
                            uOpacity: { value: 1.0 },
                            uColor: { value: COLOR_PRIMARY }
                        }}
                        vertexShader={`varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`}
                        fragmentShader={`
                            varying vec2 vUv;
                            uniform float uOpacity;
                            uniform vec3 uColor;
                            void main() {
                                vec2 p = floor(vUv * 16.0) / 16.0;
                                float w = 0.5 - abs(p.x - 0.5);
                                float shape = step(0.1, w * (1.0 - p.y) * 2.0);
                                if (shape < 0.1) discard;
                                vec3 col = mix(uColor, vec3(1.0), p.y * 0.5);
                                gl_FragColor = vec4(col, uOpacity);
                            }
                        `}
                    />
                </mesh>
            ))}
            <pointLight color="#4fffa7" intensity={4} distance={6} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// SOUL PROJECTILE - Pixel Art Uçan Ruh (Shader ile)
// ═══════════════════════════════════════════════════════════════════════════
const SoulProjectile = ({ position, offset, delay }: {
    position: [number, number, number];
    offset: number;
    delay: number;
}) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const [active, setActive] = useState(false);
    const startTimeRef = useRef(0);
    const duration = 2500;

    useFrame((state) => {
        if (!meshRef.current) return;
        const time = state.clock.elapsedTime * 1000;

        if (!active) {
            if (startTimeRef.current === 0) startTimeRef.current = time;
            if (time - startTimeRef.current > delay) {
                setActive(true);
                meshRef.current.visible = true;
            }
            return;
        }

        const elapsed = time - startTimeRef.current - delay;
        const progress = Math.min(elapsed / duration, 1);

        // ÖNEYE DOĞRU hareket (düşmana!) + zigzag
        meshRef.current.position.z = position[2] - progress * 18;
        meshRef.current.position.x = position[0] + offset + Math.sin(elapsed * 0.008) * 0.5;
        meshRef.current.position.y = position[1] + 1.5 + Math.sin(elapsed * 0.006) * 0.3;

        // Shader time güncelle
        const mat = meshRef.current.material as THREE.ShaderMaterial;
        mat.uniforms.uTime.value = elapsed * 0.001;
        mat.uniforms.uOpacity.value = 1 - Math.pow(progress, 0.5);

        if (progress >= 1) {
            meshRef.current.visible = false;
        }
    });

    return (
        <mesh ref={meshRef} position={[position[0] + offset, position[1] + 1.5, position[2]]} visible={false}>
            <planeGeometry args={[1.8, 1.8]} />
            <shaderMaterial
                transparent
                side={THREE.DoubleSide}
                blending={THREE.AdditiveBlending}
                uniforms={{
                    uTime: { value: 0 },
                    uOpacity: { value: 1.0 },
                    uColor: { value: COLOR_PRIMARY },
                    uCore: { value: COLOR_CORE }
                }}
                vertexShader={`varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`}
                fragmentShader={`
                    varying vec2 vUv;
                    uniform float uTime;
                    uniform float uOpacity;
                    uniform vec3 uColor;
                    uniform vec3 uCore;

                    void main() {
                        vec2 p = floor(vUv * 16.0) / 16.0;
                        
                        // Hayalet kafa (yuvarlak)
                        float dist = length(p - vec2(0.5, 0.55));
                        float head = step(dist, 0.38);
                        
                        // Dalgalı kuyruk
                        float tailWave = sin(p.x * 12.0 + uTime * 5.0) * 0.08;
                        float tail = step(abs(p.x - 0.5), 0.32) * step(p.y, 0.55) * step(0.1 + tailWave, p.y);
                        
                        float shape = max(head, tail);
                        
                        // Gözler (kare delikler)
                        float eyeL = step(length(p - vec2(0.35, 0.6)), 0.08);
                        float eyeR = step(length(p - vec2(0.65, 0.6)), 0.08);
                        
                        // Ağız (oval)
                        float mouth = step(length((p - vec2(0.5, 0.42)) * vec2(1.0, 1.5)), 0.08);
                        
                        shape -= (eyeL + eyeR + mouth);

                        if (shape < 0.1) discard;
                        
                        vec3 col = mix(uColor, uCore, 0.3 + p.y * 0.3);
                        gl_FragColor = vec4(col, uOpacity);
                    }
                `}
            />
        </mesh>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// SKILL 3 - RUH HASADI (2 Slash Vuruş - HIZLI)
// ═══════════════════════════════════════════════════════════════════════════
const SoulHarvestFX = ({ position, onComplete }: { position: [number, number, number]; onComplete?: () => void }) => {
    const [slashIndex, setSlashIndex] = useState(0);
    const [completed, setCompleted] = useState(false);

    useEffect(() => {
        if (slashIndex < 2) {
            const timer = setTimeout(() => setSlashIndex(prev => prev + 1), 80); // HIZLI!
            return () => clearTimeout(timer);
        } else if (!completed) {
            const timer = setTimeout(() => {
                setCompleted(true);
                if (onComplete) onComplete();
            }, 350);
            return () => clearTimeout(timer);
        }
    }, [slashIndex, completed, onComplete]);

    if (completed) return null;

    return (
        <group>
            {slashIndex >= 1 && <ReaperSlash position={[position[0] - 0.5, position[1] + 1, position[2]]} rotation={-0.4} />}
            {slashIndex >= 2 && <ReaperSlash position={[position[0] + 0.5, position[1] + 1, position[2]]} rotation={0.4} />}
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// SKILL 4 - KARANLIK GEÇİT (3 Slash Vuruş - HIZLI)
// ═══════════════════════════════════════════════════════════════════════════
const DarkPassageFX = ({ position, onComplete }: { position: [number, number, number]; onComplete?: () => void }) => {
    const [slashIndex, setSlashIndex] = useState(0);
    const [completed, setCompleted] = useState(false);

    useEffect(() => {
        if (slashIndex < 3) {
            const timer = setTimeout(() => setSlashIndex(prev => prev + 1), 60); // ÇOK HIZLI!
            return () => clearTimeout(timer);
        } else if (!completed) {
            const timer = setTimeout(() => {
                setCompleted(true);
                if (onComplete) onComplete();
            }, 350);
            return () => clearTimeout(timer);
        }
    }, [slashIndex, completed, onComplete]);

    if (completed) return null;

    // X şeklinde çapraz vuruş
    const configs = [
        { x: -0.6, rot: -0.5 },  // Sol çapraz
        { x: 0.6, rot: 0.5 },   // Sağ çapraz
        { x: 0, rot: 0 },       // Ortadan düz
    ];

    return (
        <group>
            {Array.from({ length: slashIndex }).map((_, i) => (
                <ReaperSlash key={i} position={[position[0] + configs[i].x, position[1] + 1, position[2]]} rotation={configs[i].rot} />
            ))}
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// SKILL 5 - KORKU (4 Uçan Pixel Hayalet Ruhu)
// ═══════════════════════════════════════════════════════════════════════════
const FearFX = ({ position, onComplete }: { position: [number, number, number]; onComplete?: () => void }) => {
    const [completed, setCompleted] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setCompleted(true);
            if (onComplete) onComplete();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onComplete]);

    if (completed) return null;

    return (
        <group>
            <SoulProjectile position={position} offset={-1.2} delay={0} />
            <SoulProjectile position={position} offset={-0.4} delay={80} />
            <SoulProjectile position={position} offset={0.4} delay={160} />
            <SoulProjectile position={position} offset={1.2} delay={240} />
            <pointLight position={[position[0], position[1] + 1, position[2]]} color="#4fffa7" intensity={3} distance={5} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// SKILL 6 - KIYAMET ÇAĞRISI / ULTİ (6 Slash - X ÇAPRAZ SONRA DÜZ KOMBO)
// ═══════════════════════════════════════════════════════════════════════════
const DoomUlti = ({ position, onComplete }: { position: [number, number, number]; onComplete?: () => void }) => {
    const [slashIndex, setSlashIndex] = useState(0);
    const [completed, setCompleted] = useState(false);

    useEffect(() => {
        if (slashIndex < 6) {
            const timer = setTimeout(() => setSlashIndex(prev => prev + 1), 50); // ULTRA HIZLI!
            return () => clearTimeout(timer);
        } else if (!completed) {
            const timer = setTimeout(() => {
                setCompleted(true);
                if (onComplete) onComplete();
            }, 400);
            return () => clearTimeout(timer);
        }
    }, [slashIndex, completed, onComplete]);

    if (completed) return null;

    // X ÇAPRAZ + DÜZ KOMBO
    // 1-2: X şeklinde çapraz
    // 3-4: Ters X çapraz
    // 5-6: Çift düz vuruş
    const slashConfigs = [
        { x: -1.0, z: 0, rot: -0.6 },   // Sol çapraz \
        { x: 1.0, z: 0, rot: 0.6 },     // Sağ çapraz /
        { x: 1.0, z: 0.5, rot: -0.6 },  // Ters sağ \
        { x: -1.0, z: 0.5, rot: 0.6 },  // Ters sol /
        { x: -0.5, z: 1, rot: 0 },      // Düz sol
        { x: 0.5, z: 1, rot: 0 },       // Düz sağ
    ];

    return (
        <group>
            {Array.from({ length: slashIndex }).map((_, i) => (
                <ReaperSlash
                    key={i}
                    position={[position[0] + slashConfigs[i].x, position[1] + 1, position[2] + slashConfigs[i].z]}
                    rotation={slashConfigs[i].rot}
                />
            ))}
        </group>
    );
};


// ═══════════════════════════════════════════════════════════════════════════
// EXPORT MAPPING
// ═══════════════════════════════════════════════════════════════════════════
export const REAPER_EFFECTS: { [key: string]: React.FC<any> } = {
    // Skills by number
    '1': ScytheSlash,
    '2': DeathTouchFX,
    '3': SoulHarvestFX,
    '4': DarkPassageFX,
    '5': FearFX,
    '6': DoomUlti,
    'ultimate': DoomUlti,

    // Aliases by reaper_X
    'reaper_1': ScytheSlash,
    'reaper_2': DeathTouchFX,
    'reaper_3': SoulHarvestFX,
    'reaper_4': DarkPassageFX,
    'reaper_5': FearFX,
    'reaper_6': DoomUlti,
    'reaper_ultimate': DoomUlti,

    // GERÇEK VISUAL DEĞERLERİ (constants.ts ile eşleşen)
    'reaper_slice': ScytheSlash,
    'reaper_soul_slice': DeathTouchFX,
    'reaper_wave': SoulHarvestFX,
    'reaper_spin': DarkPassageFX,
    'reaper_cross': FearFX,

    // Descriptive Names
    'scythe_slash': ScytheSlash,
    'soul_trap': DeathTouchFX,
    'soul_reap': SoulHarvestFX,
    'shadow_step': DarkPassageFX,
    'fear': FearFX,
    'doom': DoomUlti,

    // Fallbacks
    'ghost_form': DarkPassageFX,
    'execution': DoomUlti,
    'soul_burst': SoulHarvestFX,
    'deaths_grip': DeathTouchFX,
    'doom_ulti': DoomUlti,
};
