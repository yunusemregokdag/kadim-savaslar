import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ═══════════════════════════════════════════════════════════════════════════
// 🧠 MASTER PIXEL SHADER (UNITY HLSL PORTED TO GLSL)
// ═══════════════════════════════════════════════════════════════════════════
const MasterPixelShader = {
    uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color('#fbbf24') },
        uType: { value: 0 }, // 0:Punch, 1:FireDragon, 2:HealOrb, 3:SwirlBuff, 4:StarBurst
        uPixelSize: { value: 0.1 }, // Vertex snap size
        uResolution: { value: 32.0 }, // Texture pixelation
        uSpeed: { value: 5.0 },
    },
    vertexShader: `
        uniform float uPixelSize;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vViewDir;
        varying vec3 vWorldPos;

        void main() {
            vUv = uv;
            vNormal = normalize(normalMatrix * normal);
            
            // 3D PIXEL SNAP (Vertex Snapping) - PS1 Style Jitter
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            
            // Snap world position to grid
            if (uPixelSize > 0.0) {
                worldPosition.xyz = floor(worldPosition.xyz / uPixelSize) * uPixelSize;
            }
            
            vWorldPos = worldPosition.xyz;
            vViewDir = normalize(cameraPosition - worldPosition.xyz);
            
            gl_Position = projectionMatrix * viewMatrix * worldPosition;
        }
    `,
    fragmentShader: `
        uniform float uTime;
        uniform vec3 uColor;
        uniform int uType;
        uniform float uResolution;
        uniform float uSpeed;

        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vViewDir;
        varying vec3 vWorldPos;

        // --- NOISE FUNCTIONS ---
        float rand(vec2 n) { 
            return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
        }
        float noise(vec2 n) {
            const vec2 d = vec2(0.0, 1.0);
            vec2 b = floor(n), f = smoothstep(vec2(0.0), vec2(1.0), fract(n));
            return mix(mix(rand(b), rand(b + d.yx), f.x), mix(rand(b + d.xy), rand(b + d.yy), f.x), f.y);
        }

        // --- DITHERING (Bayer Matrix 4x4) ---
        float dither(vec2 uv) {
            int x = int(mod(uv.x * uResolution, 4.0));
            int y = int(mod(uv.y * uResolution, 4.0));
            int index = x + y * 4;
            float limit = 0.0;
            
            if (x < 2) {
                if (y < 2) limit = 0.0; else limit = 12.0;
            } else {
                if (y < 2) limit = 3.0; else limit = 15.0; // Simplified matrix for brevity
            }
            // Full 4x4 Pattern approximation for effect
            if (index == 0) limit = 0.0; else if (index == 1) limit = 8.0;
            else if (index == 2) limit = 2.0; else if (index == 3) limit = 10.0;
            else if (index == 4) limit = 12.0; else if (index == 5) limit = 4.0;
            else limit = 6.0; // ... approximation
            
            return limit / 16.0;
        }

        // --- SKILL PATTERNS ---
        
        // 1. Seri Yumruk (Flash + Noise)
        float patternPunch(vec2 uv) {
            float n = noise(uv * 10.0 + uTime * uSpeed);
            float flash = sin(uTime * 20.0) * 0.5 + 0.5;
            return n + flash;
        }

        // 2. Ejderha (Scroll Flame)
        float patternDragon(vec2 uv) {
            vec2 scrollUV = uv;
            scrollUV.y -= uTime * uSpeed * 0.2; // Scroll up
            float flame = sin(uv.x * 10.0 + uTime * 5.0) * 0.5 + 0.5;
            float n = noise(scrollUV * 5.0);
            return flame * n;
        }

        // 3. Heal (Pulse Orb)
        float patternHeal(vec2 uv) {
            vec2 center = uv - 0.5;
            float dist = length(center);
            float pulse = sin(uTime * uSpeed * 2.0 - dist * 10.0) * 0.5 + 0.5;
            return pulse * (1.0 - smoothstep(0.3, 0.5, dist));
        }

        // 4. Tiger (Swirl)
        float patternSwirl(vec2 uv) {
            vec2 c = uv - 0.5;
            float angle = atan(c.y, c.x);
            float dist = length(c);
            float spiral = sin(angle * 5.0 + dist * 20.0 - uTime * 5.0);
            return spiral * (1.0 - dist);
        }

        // 5. Star Burst (Rings)
        float patternStar(vec2 uv) {
            vec2 c = uv - 0.5;
            float dist = length(c);
            float burst = 0.0;
            for(float i=0.0; i<3.0; i++){
                burst += sin(dist * 20.0 - uTime * 10.0 + i) * 0.5;
            }
            return smoothstep(0.2, 0.8, burst) * (1.0 - dist * 2.0);
        }

        void main() {
            // Pixelate UVs
            vec2 pxUV = floor(vUv * uResolution) / uResolution;
            
            float intensity = 0.0;
            
            if (uType == 0) intensity = patternPunch(pxUV);
            else if (uType == 1) intensity = patternDragon(pxUV);
            else if (uType == 2) intensity = patternHeal(pxUV);
            else if (uType == 3) intensity = patternSwirl(pxUV);
            else if (uType == 4) intensity = patternStar(pxUV);
            
            // Color Snapping (Palette)
            vec3 finalColor = uColor * intensity;
            finalColor = floor(finalColor * 8.0) / 8.0; // 8-bit look
            
            // Fresnel Glow
            float fresnel = pow(1.0 - dot(vViewDir, vNormal), 2.0);
            finalColor += uColor * fresnel * 0.5;
            
            // Dithering Alpha
            float d = dither(gl_FragCoord.xy / 5.0); // Dither in screen space
            float alpha = intensity - d * 0.2;
            
            if (alpha < 0.1) discard;
            
            gl_FragColor = vec4(finalColor, 0.9);
        }
    `
};

// ═══════════════════════════════════════════════════════════════════════════
// SKILL 1: SERİ YUMRUK (Mavi/Cyan - Hızlı Flash)
// ═══════════════════════════════════════════════════════════════════════════
const RapidPunchFX = ({ position, onComplete }: any) => {
    const meshRef = useRef<THREE.Mesh>(null);
    useFrame(({ clock }, delta) => {
        if (!meshRef.current) return;
        meshRef.current.position.z -= delta * 25; // Hızlı ileri
        if (meshRef.current.position.z < position[2] - 15) onComplete?.();

        // Shader update
        const mat = meshRef.current.material as THREE.ShaderMaterial;
        mat.uniforms.uTime.value = clock.elapsedTime;
    });

    return (
        <mesh ref={meshRef} position={[position[0], position[1] + 1.2, position[2]]} scale={[1.2, 1.2, 2]} rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[1, 1, 1]} /> {/* 3D Kutu */}
            <shaderMaterial args={[MasterPixelShader]}
                uniforms-uColor-value={new THREE.Color(0.2, 0.6, 1.0)} // Mavi
                uniforms-uType-value={0} // Punch
                uniforms-uSpeed-value={8.0}
                transparent
            />
        </mesh>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// SKILL 2: EJDERHA TEKMESİ (Kızıl/Turuncu - Yükselen Alev)
// ═══════════════════════════════════════════════════════════════════════════
const DragonKickFX = ({ position, onComplete }: any) => {
    const groupRef = useRef<THREE.Group>(null);
    useFrame(({ clock }, delta) => {
        if (!groupRef.current) return;
        groupRef.current.position.y += delta * 6;
        groupRef.current.rotation.y += delta * 8;
        if (groupRef.current.position.y > 6) onComplete?.();

        groupRef.current.children.forEach((child: any) => {
            if (child.material) child.material.uniforms.uTime.value = clock.elapsedTime;
        });
    });

    return (
        <group ref={groupRef} position={position}>
            {[0, 1, 2, 3].map(i => (
                <mesh key={i} position={[Math.sin(i) * 0.5, -i * 0.6, Math.cos(i) * 0.5]} scale={[1 - i * 0.1, 1, 1 - i * 0.1]}>
                    <boxGeometry />
                    <shaderMaterial args={[MasterPixelShader]}
                        uniforms-uColor-value={new THREE.Color(1.0, 0.3, 0.1)} // Kızıl
                        uniforms-uType-value={1} // Fire Dragon
                        uniforms-uSpeed-value={4.0}
                        transparent
                    />
                </mesh>
            ))}
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// SKILL 3: MEDİTASYON (Sarı - Heal Pulse Orb)
// ═══════════════════════════════════════════════════════════════════════════
const MeditationFX = ({ position, onComplete, playerGroupRef, followPlayer }: any) => {
    const groupRef = useRef<THREE.Group>(null);
    useEffect(() => { const t = setTimeout(() => onComplete?.(), 5000); return () => clearTimeout(t); }, []);

    useFrame(({ clock }) => {
        if (!groupRef.current) return;
        if (followPlayer && playerGroupRef?.current) {
            const p = playerGroupRef.current.position;
            groupRef.current.position.set(p.x, p.y + 1, p.z);
        }
        groupRef.current.children.forEach((child: any) => {
            if (child.material) child.material.uniforms.uTime.value = clock.elapsedTime;
        });
    });

    return (
        <group ref={groupRef} position={[position[0], position[1] + 1, position[2]]}>
            <mesh>
                <sphereGeometry args={[1.5, 16, 16]} /> {/* Orb Shape */}
                <shaderMaterial args={[MasterPixelShader]}
                    uniforms-uColor-value={new THREE.Color(1.0, 1.0, 0.3)} // Sarı
                    uniforms-uType-value={2} // Heal Orb
                    uniforms-uSpeed-value={2.0}
                    transparent
                    side={THREE.DoubleSide}
                    depthWrite={false}
                />
            </mesh>
            <pointLight color="yellow" intensity={2} distance={5} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// SKILL 4: KAPLAN DURUŞU (Yeşil - Swirl Aura)
// ═══════════════════════════════════════════════════════════════════════════
const TigerStanceFX = ({ position, onComplete, playerGroupRef }: any) => {
    const groupRed = useRef<THREE.Group>(null);
    const groupWhite = useRef<THREE.Group>(null);

    // Auto-complete after animation
    useEffect(() => { const t = setTimeout(() => onComplete?.(), 2500); return () => clearTimeout(t); }, []);

    useFrame(({ clock }, delta) => {
        const t = clock.elapsedTime;

        // --- RED DRAGON (Spiral 1) ---
        if (groupRed.current) {
            // Player takibi (varsa) veya sabit pozisyon
            if (playerGroupRef?.current) {
                const p = playerGroupRef.current.position;
                groupRed.current.position.set(p.x, p.y, p.z);
            } else {
                groupRed.current.position.set(position[0], position[1], position[2]);
            }

            // Yükselme ve Dönme Animasyonu
            groupRed.current.children.forEach((child: any, i) => {
                // Her parça kendi ekseninde ve yukarı doğru hareket etsin
                // Y ana grupta değil, child'larda artmalı ki sürekli aksın
                child.position.y = (t * 4 + i * 0.5) % 5; // 0-5 arası sürekli yukarı akış
                child.rotation.y += delta * 5; // Hızlı dönüş

                // Shader update
                if (child.material) child.material.uniforms.uTime.value = t;
            });
        }

        // --- OFF-WHITE DRAGON (Spiral 2 - Ters Yön veya Farklı Faz) ---
        if (groupWhite.current) {
            if (playerGroupRef?.current) {
                const p = playerGroupRef.current.position;
                groupWhite.current.position.set(p.x, p.y, p.z);
            } else {
                groupWhite.current.position.set(position[0], position[1], position[2]);
            }

            groupWhite.current.children.forEach((child: any, i) => {
                child.position.y = (t * 4 + i * 0.5 + 2.5) % 5; // Faz farkı
                child.rotation.y -= delta * 5; // TERS YÖNE DÖNÜŞ

                if (child.material) child.material.uniforms.uTime.value = t;
            });
        }
    });

    // Dragon parçaları (Kutular)
    const parts = [0, 1, 2, 3, 4];

    return (
        <group>
            {/* KIRMIZI EJDERHA SÜTUNU */}
            <group ref={groupRed}>
                {parts.map(i => (
                    <mesh key={`r-${i}`} position={[Math.sin(i) * 0.8, 0, Math.cos(i) * 0.8]} scale={[0.8, 0.8, 0.8]}>
                        <boxGeometry />
                        <shaderMaterial args={[MasterPixelShader]}
                            uniforms-uColor-value={new THREE.Color(1.0, 0.0, 0.0)} // SALT KIRMIZI
                            uniforms-uType-value={1} // Fire Dragon Pattern
                            uniforms-uSpeed-value={5.0} // Daha hızlı
                            transparent
                        />
                    </mesh>
                ))}
            </group>

            {/* KİRLİ BEYAZ EJDERHA SÜTUNU */}
            <group ref={groupWhite}>
                {parts.map(i => (
                    <mesh key={`w-${i}`} position={[Math.sin(i + Math.PI) * 0.8, 0, Math.cos(i + Math.PI) * 0.8]} scale={[0.8, 0.8, 0.8]}>
                        <boxGeometry />
                        <shaderMaterial args={[MasterPixelShader]}
                            uniforms-uColor-value={new THREE.Color(0.9, 0.85, 0.8)} // KİRLİ BEYAZ (Kemik Rengi)
                            uniforms-uType-value={1} // Fire Dragon Pattern
                            uniforms-uSpeed-value={5.0}
                            transparent
                        />
                    </mesh>
                ))}
            </group>
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// SKILL 5: TURNA KANADI (Turuncu - Fire Slash Wing)
// ═══════════════════════════════════════════════════════════════════════════
const CraneWingFX = ({ position, onComplete }: any) => {
    const lWing = useRef<THREE.Mesh>(null);
    const rWing = useRef<THREE.Mesh>(null);

    useFrame(({ clock }, delta) => {
        if (!lWing.current || !rWing.current) return;
        lWing.current.position.x -= delta * 8;
        rWing.current.position.x += delta * 8;
        if (lWing.current.position.x < -6) onComplete?.();

        const t = clock.elapsedTime;
        (lWing.current.material as THREE.ShaderMaterial).uniforms.uTime.value = t;
        (rWing.current.material as THREE.ShaderMaterial).uniforms.uTime.value = t;
    });

    return (
        <group position={[position[0], position[1] + 1.5, position[2]]}>
            <mesh ref={lWing} scale={[2, 1, 0.5]}>
                <boxGeometry />
                <shaderMaterial args={[MasterPixelShader]} uniforms-uColor-value={new THREE.Color(1.0, 0.5, 0.0)} uniforms-uType-value={1} transparent />
            </mesh>
            <mesh ref={rWing} scale={[2, 1, 0.5]}>
                <boxGeometry />
                <shaderMaterial args={[MasterPixelShader]} uniforms-uColor-value={new THREE.Color(1.0, 0.5, 0.0)} uniforms-uType-value={1} transparent />
            </mesh>
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// SKILL 6: YEDİ YILDIZ ULTİ (Mor - Star Burst)
// ═══════════════════════════════════════════════════════════════════════════
const SevenStarsUlti = ({ position, onComplete }: any) => {
    const groupRef = useRef<THREE.Group>(null);
    const [scale, setScale] = useState(0);

    useFrame(({ clock }) => {
        if (scale < 8) setScale(s => s + 0.2);
        else onComplete?.();

        if (groupRef.current) {
            groupRef.current.children.forEach((c: any) => {
                if (c.material) c.material.uniforms.uTime.value = clock.elapsedTime;
            });
        }
    });

    return (
        <group ref={groupRef} position={[position[0], position[1], position[2]]} scale={[scale, scale, scale]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[2, 2]} />
                <shaderMaterial args={[MasterPixelShader]}
                    uniforms-uColor-value={new THREE.Color(0.8, 0.2, 1.0)} // Mor
                    uniforms-uType-value={4} // Star Burst
                    uniforms-uSpeed-value={5.0}
                    transparent
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
            {/* Particles */}
            <mesh position={[0, 0.5, 0]}>
                <boxGeometry args={[0.2, 0.2, 0.2]} />
                <shaderMaterial args={[MasterPixelShader]} uniforms-uColor-value={new THREE.Color(1, 1, 1)} uniforms-uType-value={0} />
            </mesh>
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// MAP
// ═══════════════════════════════════════════════════════════════════════════
export const MARTIAL_ARTIST_EFFECTS: { [key: string]: React.FC<any> } = {
    // Skill IDs
    'ma1': RapidPunchFX,
    'ma2': DragonKickFX,
    'ma3': MeditationFX,
    'ma4': TigerStanceFX,
    'ma5': CraneWingFX,
    'ma6': RapidPunchFX,
    'ma7': SevenStarsUlti,

    // Visual Keys
    'martial_hit': RapidPunchFX,
    'martial_uppercut': DragonKickFX,
    'martial_evasion': MeditationFX,
    'martial_multi': TigerStanceFX,
    'martial_slash': CraneWingFX,
    'martial_ultimate': SevenStarsUlti,

    // Extra Keys
    'punch': RapidPunchFX,
    'kick': DragonKickFX,
    'focus': MeditationFX,
    'sweep': TigerStanceFX,
    'dragon_punch': DragonKickFX,
    'iron_body': TigerStanceFX, // Mapped to Buff
    'ora_ora': SevenStarsUlti,
    'ultimate': SevenStarsUlti,
    'seven_stars': SevenStarsUlti,
};
