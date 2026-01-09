import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// --- DARK SOUL SHADER (Ruh Enerjisi) ---
const DarkSoulShader = {
    uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color("#2a0052") }, // Çok koyu mor
        uGlowColor: { value: new THREE.Color("#a020f0") } // Parlayan mor
    },
    vertexShader: `
    varying vec2 vUv;
    uniform float uTime;
    void main() {
      vUv = uv;
      vec3 pos = position;
      // Pixel titremesi ve ruhsal dalgalanma
      pos.x += sin(uTime * 5.0 + pos.y * 10.0) * 0.05;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
    fragmentShader: `
    varying vec2 vUv;
    uniform float uTime;
    uniform vec3 uColor;
    uniform vec3 uGlowColor;

    void main() {
      vec2 uv = vUv - 0.5;
      float d = length(uv);
      
      // 1. GİRDAP MATEMATİĞİ (Texture yerine Spiral Formülü)
      float angle = atan(uv.y, uv.x);
      float spiral = sin(d * 60.0 - uTime * 20.0 + angle * 3.0);
      
      // 2. AAA PIXEL DITHER (Keskinlik)
      float dither = step(0.5, spiral);
      float mask = smoothstep(0.5, 0.1, d);
      
      // 3. RENK KATMANLARI
      vec3 finalColor = mix(uColor, uGlowColor, dither);
      finalColor *= (1.0 + sin(uTime * 10.0) * 0.2); // Nabız gibi atma efekti
      
      gl_FragColor = vec4(finalColor, dither * mask);
    }
  `
};

// 1. RUH KAPAN (Soul Trap - Advanced Shader + Particles)
const SoulTrap = ({ position }: { position: [number, number, number] }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const particlesRef = useRef<THREE.Group>(null);

    // 1. Ruh Parçacıkları (Math-based, no texture)
    const particleCount = 40;
    const particles = useMemo(() => {
        const data = [];
        for (let i = 0; i < particleCount; i++) {
            data.push({
                r: Math.random() * 3 + 1, // Uzaklık
                angle: Math.random() * Math.PI * 2,
                speed: 0.02 + Math.random() * 0.05,
                size: 0.1 + Math.random() * 0.2
            });
        }
        return data;
    }, []);

    useFrame((state, delta) => {
        // Ana girdabı döndür
        if (meshRef.current) {
            (meshRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = state.clock.elapsedTime;
        }

        // Ruhları merkeze doğru çek (Spiral hareketi)
        if (particlesRef.current) {
            particlesRef.current.children.forEach((p, i) => {
                const data = particles[i];
                data.r -= data.speed; // Merkeze yaklaşma
                data.angle += 0.05; // Dönme
                if (data.r < 0.1) data.r = 4; // Başa dön

                p.position.x = Math.cos(data.angle) * data.r;
                p.position.z = Math.sin(data.angle) * data.r;
                p.position.y = Math.sin(state.clock.elapsedTime * 2 + i) * 0.5 + 0.5;
            });
        }
    });

    return (
        <group position={position}>
            {/* ANA MÜHÜR VE GİRDAP */}
            <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
                <planeGeometry args={[8, 8]} />
                <shaderMaterial
                    transparent
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                    side={THREE.DoubleSide}
                    uniforms={{
                        uTime: { value: 0 },
                        uColor: { value: new THREE.Color("#4b0082") }, // Resimdeki koyu mor
                        uInnerColor: { value: new THREE.Color("#9400d3") } // Parlak merkez
                    }}
                    vertexShader={`
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
                    fragmentShader={`
            varying vec2 vUv;
            uniform float uTime;
            uniform vec3 uColor;
            uniform vec3 uInnerColor;

            void main() {
              vec2 uv = vUv - 0.5;
              float dist = length(uv);
              
              // 1. Girdap Matematiği
              float angle = atan(uv.y, uv.x);
              float spiral = sin(dist * 50.0 - uTime * 15.0 + angle * 4.0);
              
              // 2. Pixel Dither (AAA Retro Görünüm)
              float dither = step(0.5, fract(gl_FragCoord.x * 0.5 + gl_FragCoord.y * 0.5));
              
              // 3. Merkeze doğru parlayan katman
              float mask = smoothstep(0.5, 0.0, dist);
              vec3 color = mix(uColor, uInnerColor, step(0.3, spiral));
              
              gl_FragColor = vec4(color * 2.0, dither * mask * step(0.4, spiral));
            }
          `}
                />
            </mesh>

            {/* YÜKSELEN RUHLAR (2.5D Pixel Spirits) */}
            <group ref={particlesRef}>
                {particles.map((_, i) => (
                    <mesh key={i}>
                        <planeGeometry args={[0.2, 0.4]} />
                        <meshBasicMaterial color="#bc13fe" transparent opacity={0.6} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
                    </mesh>
                ))}
            </group>
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 1. SCYTHE SLASH (TIRPAN) - Pixel Art Shader
// ═══════════════════════════════════════════════════════════════════════════
const ScytheSlash = ({ position, delay = 0 }: { position: [number, number, number], delay?: number }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const [started, setStarted] = useState(false);

    useFrame((state, delta) => {
        if (!meshRef.current) return;

        // Gecikme Kontrolü
        if (!started) {
            if (state.clock.elapsedTime > (meshRef.current.userData.startTime || 0) + delay) {
                setStarted(true);
                meshRef.current.visible = true;
            } else {
                meshRef.current.visible = false;
                if (!meshRef.current.userData.startTime) meshRef.current.userData.startTime = state.clock.elapsedTime;
                return;
            }
        }

        const mat = meshRef.current.material as THREE.ShaderMaterial;
        mat.uniforms.uTime.value += delta;

        // Tırpanın savrulma hareketi
        meshRef.current.rotation.y -= delta * 12.0;

        // Yok Olma
        if (mat.uniforms.uTime.value > 0.5) {
            mat.uniforms.uOpacity.value -= delta * 3.0;
        }
        if (mat.uniforms.uOpacity.value <= 0) {
            // Eğer tek seferlikse gizle, değilse parent yönetir
            // meshRef.current.visible = false; 
        }
    });

    return (
        <group position={position} rotation={[0, Math.PI / 2, 0]}>
            <mesh ref={meshRef} position={[0, 1.5, 0]} rotation={[-Math.PI / 4, 0, 0]} visible={false}>
                <planeGeometry args={[5, 5]} />
                <shaderMaterial
                    transparent
                    side={THREE.DoubleSide}
                    uniforms={{
                        uTime: { value: 0 },
                        uOpacity: { value: 1.0 },
                        uColor: { value: COLOR_PRIMARY },
                        uColorDark: { value: COLOR_DARK }
                    }}
                    vertexShader={`varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`}
                    fragmentShader={`
            varying vec2 vUv;
            uniform float uTime;
            uniform float uOpacity;
            uniform vec3 uColor;
            uniform vec3 uColorDark;

            void main() {
              vec2 uv = vUv;
              float resolution = 24.0;
              vec2 p = floor(uv * resolution) / resolution;
              
              // Tırpan Şekli
              float dist = length(p - vec2(0.5, 0.5));
              float outer = step(dist, 0.45);
              float inner = step(length(p - vec2(0.4, 0.4)), 0.35);
              float blade = outer - inner;
              float handle = step(abs(p.x - p.y), 0.05) * step(p.x, 0.5) * step(p.y, 0.5);
              float shape = max(blade, handle);

              if (shape < 0.1) discard;
              vec3 finalColor = mix(uColorDark, uColor, p.y + p.x);
              gl_FragColor = vec4(finalColor, uOpacity);
            }
          `}
                />
            </mesh>
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 2. DEATH'S TOUCH (ÖLÜM DOKUNUŞU) - Claw/Pençe
// ═══════════════════════════════════════════════════════════════════════════
const DeathTouchFX = ({ position }: { position: [number, number, number] }) => {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state, delta) => {
        if (!groupRef.current) return;
        groupRef.current.position.y -= delta * 3; // Daha hızlı in
        groupRef.current.position.z += delta * 3; // İleri atıl

        groupRef.current.children.forEach((child) => {
            const mat = (child as THREE.Mesh).material as THREE.ShaderMaterial;
            mat.uniforms.uOpacity.value -= delta * 1.5;
        });
    });

    return (
        <group ref={groupRef} position={[position[0], position[1] + 3, position[2] - 1]}>
            {[-0.8, 0, 0.8].map((offset, i) => ( // Daha geniş pençe
                <mesh key={i} position={[offset, 0, 0]} rotation={[0, 0, 0.3 * (i - 1)]}>
                    <planeGeometry args={[0.8, 3]} /> {/* Daha büyük pençeler */}
                    <shaderMaterial
                        transparent
                        side={THREE.DoubleSide}
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
                                // Sivri Tırnak Şekli
                                float w = 0.5 - abs(p.x - 0.5); 
                                float shape = step(0.15, w * p.y * 1.5); 
                                if (shape < 0.1) discard;
                                gl_FragColor = vec4(uColor, uOpacity);
                            }
                        `}
                    />
                </mesh>
            ))}
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 3. SOUL HARVEST (RUH HASADI) - Uçan Ruhlar
// ═══════════════════════════════════════════════════════════════════════════
const SoulProjectile = ({ position, offset, delay }: { position: [number, number, number], offset: number, delay: number }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const [active, setActive] = useState(false);
    const [startTime, setStartTime] = useState(0);

    useFrame((state, delta) => {
        if (!meshRef.current) return;
        const time = state.clock.elapsedTime;

        if (!active) {
            if (startTime === 0) setStartTime(time);
            if (time - startTime > delay) setActive(true);
            return;
        }

        meshRef.current.visible = true;
        meshRef.current.position.z += delta * 6.0; // Orta hız
        meshRef.current.position.x += Math.sin(time * 15.0 + offset) * 0.15; // Daha geniş zigzag

        const mat = meshRef.current.material as THREE.ShaderMaterial;
        mat.uniforms.uTime.value = time;

        // Uzaklaşınca gizle
        if (meshRef.current.position.z > (position[2] + 15)) {
            meshRef.current.visible = false;
        }
    });

    return (
        <mesh ref={meshRef} position={[position[0] + offset, position[1] + 1.2, position[2]]} visible={false}>
            <planeGeometry args={[1.5, 1.5]} /> {/* Ruhlar büyüdü */}
            <shaderMaterial
                transparent
                uniforms={{
                    uTime: { value: 0 },
                    uColor: { value: COLOR_PRIMARY },
                    uCore: { value: COLOR_CORE }
                }}
                vertexShader={`varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`}
                fragmentShader={`
                    varying vec2 vUv;
                    uniform float uTime;
                    uniform vec3 uColor;
                    uniform vec3 uCore;

                    void main() {
                        vec2 p = floor(vUv * 16.0) / 16.0;
                        // Hayalet Sprite
                        float dist = length(p - vec2(0.5, 0.6));
                        float head = step(dist, 0.35);
                        float tail = step(abs(p.x - 0.5), 0.35) * step(p.y, 0.6) * step(0.1 + sin(p.x*10.0 + uTime*8.0)*0.1, p.y);
                        float shape = max(head, tail);
                        
                        // Gözler
                        float eyeL = step(length(p - vec2(0.35, 0.65)), 0.05);
                        float eyeR = step(length(p - vec2(0.65, 0.65)), 0.05);
                        shape -= (eyeL + eyeR);

                        if (shape < 0.1) discard;
                        gl_FragColor = vec4(mix(uColor, uCore, 0.3), 1.0);
                    }
                `}
            />
        </mesh>
    );
};

const SoulHarvestFX = ({ position }: { position: [number, number, number] }) => (
    <group>
        <SoulProjectile position={position} offset={-0.6} delay={0} />
        <SoulProjectile position={position} offset={0.6} delay={0.2} />
    </group>
);

// ═══════════════════════════════════════════════════════════════════════════
// 4. DARK PASSAGE (KARANLIK GEÇİT) - 3'lü Ruh
// ═══════════════════════════════════════════════════════════════════════════
const DarkPassageFX = ({ position }: { position: [number, number, number] }) => (
    <group>
        {[-1.2, 0, 1.2].map((offset, i) => (
            <SoulProjectile key={i} position={position} offset={offset} delay={i * 0.15} />
        ))}
    </group>
);

// ═══════════════════════════════════════════════════════════════════════════
// 5. FEAR (KORKU) - Hayalet Suratlar
// ═══════════════════════════════════════════════════════════════════════════
const FearFX = ({ position }: { position: [number, number, number] }) => {
    const groupRef = useRef<THREE.Group>(null);
    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.position.y += 0.02;
            groupRef.current.rotation.y += 0.04;
            groupRef.current.scale.addScalar(0.01); // Büyüyerek yayılma
        }
    });

    return (
        <group ref={groupRef} position={[position[0], position[1], position[2]]}>
            {[...Array(6)].map((_, i) => (
                <mesh key={i} position={[Math.cos(i) * 2.5, 1, Math.sin(i) * 2.5]} rotation={[0, -i, 0]}> {/* Dışa dönük */}
                    <planeGeometry args={[1.5, 1.5]} />
                    <shaderMaterial
                        transparent
                        side={THREE.DoubleSide}
                        uniforms={{ uColor: { value: COLOR_PRIMARY } }}
                        vertexShader={`varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`}
                        fragmentShader={`
                            varying vec2 vUv;
                            uniform vec3 uColor;
                            void main() {
                                vec2 p = floor(vUv * 16.0) / 16.0;
                                // Kuru Kafa Sprite
                                float shape = step(length(p - 0.5), 0.42);
                                float eyes = step(length(p - vec2(0.32, 0.55)), 0.1) + step(length(p - vec2(0.68, 0.55)), 0.1);
                                float mouth = step(length(p - vec2(0.5, 0.25)), 0.12);
                                shape -= (eyes + mouth);
                                if (shape < 0.1) discard;
                                gl_FragColor = vec4(uColor, 1.0);
                            }
                        `}
                    />
                </mesh>
            ))}
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 6. ULTIMATE (KIYAMET ÇAĞRISI) - 6'lı Seri Vuruş
// ═══════════════════════════════════════════════════════════════════════════
const DoomUlti = ({ position }: { position: [number, number, number] }) => {
    return (
        <group>
            {/* 1. Vuruş (Hemen) */}
            <group position={[2, 0, 2]} rotation={[0, -Math.PI / 4, 0]}>
                <ScytheSlash position={[0, 0, 0]} delay={0.0} />
            </group>

            {/* 2. Vuruş */}
            <group position={[-2, 0, 2]} rotation={[0, Math.PI / 4, 0]}>
                <ScytheSlash position={[0, 0, 0]} delay={0.2} />
            </group>

            {/* 3. Vuruş */}
            <group position={[2, 0, -2]} rotation={[0, -Math.PI / 2, 0]}>
                <ScytheSlash position={[0, 0, 0]} delay={0.4} />
            </group>

            {/* 4. Vuruş */}
            <group position={[-2, 0, -2]} rotation={[0, Math.PI / 2, 0]}>
                <ScytheSlash position={[0, 0, 0]} delay={0.6} />
            </group>

            {/* 5 & 6. Vuruş (Çifte Final) */}
            <group position={[0, 0, 4]} rotation={[0, 0, 0]}>
                <ScytheSlash position={[0, 0, 0]} delay={0.8} />
            </group>
            <group position={[0, 0, -4]} rotation={[0, Math.PI, 0]}>
                <ScytheSlash position={[0, 0, 0]} delay={0.8} />
            </group>
        </group>
    );
};


// ═══════════════════════════════════════════════════════════════════════════
// EXPORT MAPPING
// ═══════════════════════════════════════════════════════════════════════════
export const REAPER_EFFECTS: { [key: string]: React.FC<any> } = {
    // Skills
    '1': ScytheSlash,
    '2': DeathTouchFX,
    '3': SoulHarvestFX,
    '4': DarkPassageFX,
    '5': FearFX,
    '6': DoomUlti,
    'ultimate': DoomUlti,

    // Aliases
    'reaper_1': ScytheSlash,
    'reaper_2': DeathTouchFX,
    'reaper_3': SoulHarvestFX,
    'reaper_4': DarkPassageFX,
    'reaper_5': FearFX,
    'reaper_6': DoomUlti,
    'reaper_ultimate': DoomUlti,

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
const DarkTransitionFX = ({ position }: { position: [number, number, number] }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const trailRef = useRef<THREE.Group>(null);

    // Simüle edilmiş Start/End (Dikey dash efekti için)
    const startPos = useMemo(() => new THREE.Vector3(position[0], position[1], position[2]), [position]);
    const endPos = useMemo(() => new THREE.Vector3(position[0], position[1], position[2] - 5), [position]);

    // Geçiş yolu üzerindeki gölge parçacıkları
    const shadowParticles = useMemo(() => {
        return [...Array(10)].map((_, i) => ({
            pos: new THREE.Vector3().lerpVectors(startPos, endPos, i / 10),
            scale: 1.0 - i * 0.1
        }));
    }, [startPos, endPos]);

    useFrame((state, delta) => {
        const time = state.clock.elapsedTime;
        if (meshRef.current) {
            (meshRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = time;
            // Geçiş efekti opaklık kontrolü (Hızlıca yanıp sönme)
            (meshRef.current.material as THREE.ShaderMaterial).uniforms.uOpacity.value -= delta * 2.0;
            if ((meshRef.current.material as THREE.ShaderMaterial).uniforms.uOpacity.value <= 0) {
                meshRef.current.visible = false;
            }
        }
    });

    return (
        <group>
            {/* 1. KARANLIK KORİDOR (Geçiş Hattı) */}
            <mesh ref={meshRef} position={new THREE.Vector3().addVectors(startPos, endPos).multiplyScalar(0.5)} rotation={[0, Math.PI, 0]}>
                {/* Hattın uzunluğunu hesaplayıp plane'i ona göre ölçeklendiriyoruz */}
                <planeGeometry args={[1, 5]} />
                <shaderMaterial
                    transparent
                    blending={THREE.AdditiveBlending}
                    side={THREE.DoubleSide}
                    uniforms={{
                        uTime: { value: 0 },
                        uOpacity: { value: 1.0 },
                        uColor: { value: new THREE.Color("#1a0033") }, // Koyu mor/siyah
                        uGlow: { value: new THREE.Color("#8a2be2") }   // Parlayan kenar
                    }}
                    vertexShader={`
            varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`}
                    fragmentShader={`
            varying vec2 vUv;
            uniform float uTime;
            uniform float uOpacity;
            uniform vec3 uColor;
            uniform vec3 uGlow;

void main() {
              // Pixel Dither efekti (Noktalı geçiş)
              float dither = step(0.5, fract(gl_FragCoord.x * 0.5 + gl_FragCoord.y * 0.5));

              // Akış efekti
              float flow = step(0.7, sin(vUv.y * 10.0 - uTime * 30.0));
              float edge = smoothstep(0.0, 0.2, vUv.x) * smoothstep(1.0, 0.8, vUv.x);
              
              vec3 color = mix(uColor, uGlow, flow);
    gl_FragColor = vec4(color, uOpacity * edge * dither);
}
`}
                />
            </mesh>

            {/* 2. HAYALET İZLERİ (Ghost Trails) */}
            <group ref={trailRef}>
                {shadowParticles.map((p, i) => (
                    <mesh key={i} position={p.pos} rotation={[-Math.PI / 2, 0, 0]}>
                        <planeGeometry args={[0.8, 1.5]} />
                        <meshBasicMaterial
                            color="#4b0082"
                            transparent
                            opacity={0.3}
                            blending={THREE.AdditiveBlending}
                            side={THREE.DoubleSide}
                        />
                    </mesh>
                ))}
            </group>
        </group>
    );
};

// 5. RUH PATLAMASI (Soul Burst - CC/İtme Efekti)
const SoulBurstFX = ({ position }: { position: [number, number, number] }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    useFrame((state, delta) => {
        if (meshRef.current) {
            meshRef.current.scale.x += delta * 15.0;
            meshRef.current.scale.y += delta * 15.0;
            const mat = meshRef.current.material as THREE.ShaderMaterial;
            mat.uniforms.uOpacity.value -= delta * 2.0;
            if (mat.uniforms.uOpacity.value <= 0) meshRef.current.visible = false;
        }
    });

    return (
        <mesh ref={meshRef} position={[position[0], 0.1, position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[1, 32]} />
            <shaderMaterial
                transparent
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                uniforms={{ uOpacity: { value: 1.0 }, uColor: { value: new THREE.Color("#9400d3") } }}
                vertexShader={`varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); } `}
                fragmentShader={`varying vec2 vUv; uniform float uOpacity; uniform vec3 uColor; void main() { 
          float d = length(vUv - 0.5);
          float ring = smoothstep(0.4, 0.5, d) - smoothstep(0.5, 0.52, d);
    gl_FragColor = vec4(uColor, ring * uOpacity);
} `}
            />
        </mesh>
    );
};

// 6. ÖLÜMÜN PENÇESİ (Death's Grip - Uzaktan Çekme + Zincir)
// Not: Chain efekti için hedef nokta lazım ama şimdilik pozisyon merkezli dikey bir efekt yapalım.
const DeathsGripFX = ({ position }: { position: [number, number, number] }) => {
    const lineRef = useRef<THREE.Mesh>(null);
    useFrame((state) => {
        if (lineRef.current) {
            (lineRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = state.clock.elapsedTime;
        }
    });

    return (
        <mesh ref={lineRef} position={[position[0], 2.5, position[2]]} rotation={[0, 0, Math.PI / 2]}>
            <planeGeometry args={[0.5, 5]} />
            <shaderMaterial
                transparent
                side={THREE.DoubleSide}
                blending={THREE.AdditiveBlending}
                uniforms={{ uTime: { value: 0 }, uColor: { value: new THREE.Color("#4b0082") } }}
                vertexShader={`varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); } `}
                fragmentShader={`varying vec2 vUv; uniform float uTime; uniform vec3 uColor; void main() {
          float wave = step(0.5, sin(vUv.y * 20.0 - uTime * 40.0));
          vec3 finalColor = uColor * 2.0;
          float alpha = wave * step(0.2, vUv.x) * step(vUv.x, 0.8);
    gl_FragColor = vec4(finalColor, alpha);
} `}
            />
        </mesh>
    );
};

// 3. RUH HASADI (Soul Reap - X Slash + Soul Absorb)
const SoulReapFX = ({ position }: { position: [number, number, number] }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const harvestRef = useRef<THREE.Group>(null);

    useFrame((state, delta) => {
        const time = state.clock.elapsedTime;

        // 1. Tırpanın "Hasat" Patlaması (Pulse)
        if (meshRef.current) {
            (meshRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = time;
            meshRef.current.scale.setScalar(1 + Math.sin(time * 20.0) * 0.2);
        }

        // 2. Ruhların Karaktere Çekilmesi (Harvest Trail)
        if (harvestRef.current) {
            harvestRef.current.children.forEach((p, i) => {
                // Ruhlar hedeften (position) karaktere (0,1,0) doğru akar
                const target = new THREE.Vector3(0, 1, 0);
                p.position.lerp(target, 0.1);

                if (p.position.distanceTo(target) < 0.2) {
                    // Hedefe ulaşınca tekrar spawn noktasına dön
                    p.position.set(position[0], position[1], position[2]);
                }
            });
        }
    });

    return (
        <group>
            {/* ANA HASAT ETKİSİ (X Şeklinde Enerji) */}
            <mesh ref={meshRef} position={position}>
                <planeGeometry args={[3, 3]} />
                <shaderMaterial
                    transparent
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                    side={THREE.DoubleSide}
                    uniforms={{
                        uTime: { value: 0 },
                        uColor: { value: new THREE.Color("#9d00ff") } // Resimdeki parlak mor
                    }}
                    vertexShader={`varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); } `}
                    fragmentShader={`
            varying vec2 vUv;
            uniform float uTime;
            uniform vec3 uColor;
void main() {
              vec2 uv = vUv - 0.5;
              // Resimdeki X şeklindeki kesiş izi matematiği
              float line1 = step(0.02, abs(uv.x - uv.y)) * step(abs(uv.x - uv.y), 0.15);
              float line2 = step(0.02, abs(uv.x + uv.y)) * step(abs(uv.x + uv.y), 0.15);

              // Pixel Dither (AAA Görünüm)
              float dither = step(0.5, fract(gl_FragCoord.x * 0.5 + gl_FragCoord.y * 0.5));
              float alpha = (line1 + line2) * dither * smoothstep(0.5, 0.2, length(uv));

    gl_FragColor = vec4(uColor * 3.0, alpha);
}
`}
                />
            </mesh>

            {/* HASAT EDİLEN RUH PARÇACIKLARI */}
            <group ref={harvestRef}>
                {[...Array(15)].map((_, i) => (
                    <mesh key={i} position={[position[0], position[1], position[2]]}>
                        <planeGeometry args={[0.15, 0.15]} />
                        <meshBasicMaterial color="#bc13fe" transparent opacity={0.7} />
                    </mesh>
                ))}
            </group>
        </group>
    );
};

// 5. KORKU SALINIMI (Fear - Shockwave + Ghastly Faces)
const FearSkillFX = ({ position }: { position: [number, number, number] }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const facesRef = useRef<THREE.Group>(null);

    useFrame((state, delta) => {
        const time = state.clock.elapsedTime;

        // 1. Korku Dalgası (Şok Etkisi)
        if (meshRef.current) {
            (meshRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = time;
            meshRef.current.scale.x = meshRef.current.scale.y += delta * 8.0;
            (meshRef.current.material as THREE.ShaderMaterial).uniforms.uOpacity.value -= delta * 1.5;

            if ((meshRef.current.material as THREE.ShaderMaterial).uniforms.uOpacity.value <= 0) {
                meshRef.current.visible = false;
            }
        }

        // 2. Hortlak Suratların Titremesi
        if (facesRef.current) {
            facesRef.current.children.forEach((face, i) => {
                face.position.y += Math.sin(time * 10 + i) * 0.02;
                (face.material as THREE.Material).opacity -= delta * 1.2;
            });
        }
    });

    return (
        <group position={position}>
            {/* ANA KORKU DALGASI */}
            <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[1, 1]} />
                <shaderMaterial
                    transparent
                    blending={THREE.AdditiveBlending}
                    uniforms={{
                        uTime: { value: 0 },
                        uOpacity: { value: 1.0 },
                        uColor: { value: new THREE.Color("#483d8b") } // Dark Slate Blue / Mor
                    }}
                    vertexShader={`varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); } `}
                    fragmentShader={`
            varying vec2 vUv;
            uniform float uTime;
            uniform float uOpacity;
            uniform vec3 uColor;
void main() {
              vec2 uv = vUv - 0.5;
              float d = length(uv);
              // Pixel Dither (Retro Görünüm)
              float dither = step(0.5, fract(gl_FragCoord.x * 0.5 + gl_FragCoord.y * 0.5));
              float ring = smoothstep(0.4, 0.5, d) * dither;
    gl_FragColor = vec4(uColor * 2.0, ring * uOpacity);
}
`}
                />
            </mesh>

            {/* HAYALETİMSİ SURATLAR (Ghastly Faces - Math Generated) */}
            <group ref={facesRef}>
                {[...Array(4)].map((_, i) => (
                    <mesh key={i} position={[Math.cos(i * (Math.PI / 2)) * 2, 1, Math.sin(i * (Math.PI / 2)) * 2]}>
                        <planeGeometry args={[1, 1]} />
                        <meshBasicMaterial
                            color="#9370db"
                            transparent
                            opacity={0.6}
                            blending={THREE.AdditiveBlending}
                            side={THREE.DoubleSide}
                        />
                    </mesh>
                ))}
            </group>
        </group>
    );
};

// 6. ÖLÜMCÜL DARBE ULTİSİ (Ultimate Death Smash - Ground Crack + Shockwave)
const UltimateDeathSmash = ({ position }: { position: [number, number, number] }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const shockwaveRef = useRef<THREE.Mesh>(null);

    useFrame((state, delta) => {
        const time = state.clock.elapsedTime;

        // 1. Ulti Darbe Efekti (Büyüme ve Kaybolma)
        if (meshRef.current) {
            (meshRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = time;
            meshRef.current.scale.lerp(new THREE.Vector3(15, 15, 1), 0.1);
        }

        // 2. Şok Dalgası Hızı
        if (shockwaveRef.current) {
            shockwaveRef.current.scale.addScalar(delta * 20);
            (shockwaveRef.current.material as THREE.Material).opacity -= delta * 0.5;
            if ((shockwaveRef.current.material as THREE.Material).opacity <= 0) {
                shockwaveRef.current.visible = false;
            }
        }
    });

    return (
        <group position={position}>
            {/* ANA ETKİ: MOR ÖLÜM YARIĞI */}
            <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[1, 1]} />
                <shaderMaterial
                    transparent
                    blending={THREE.AdditiveBlending}
                    uniforms={{
                        uTime: { value: 0 },
                        uColor: { value: new THREE.Color("#6a0dad") }, // Koyu Mor
                        uCore: { value: new THREE.Color("#ffffff") }  // Parlayan Merkez
                    }}
                    vertexShader={`varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); } `}
                    fragmentShader={`
            varying vec2 vUv;
            uniform float uTime;
            uniform vec3 uColor;
            uniform vec3 uCore;

void main() {
              vec2 uv = vUv - 0.5;
              float dist = length(uv);

              // 1. Yıldırım ve Çatlak Matematiği
              float angle = atan(uv.y, uv.x);
              float noise = sin(angle * 12.0 + uTime * 20.0) * 0.1;
              float crack = step(0.4 + noise, 0.5 - dist);

              // 2. Pixel Dither (Retro AAA Görünüm)
              float dither = step(0.5, fract(gl_FragCoord.x * 0.5 + gl_FragCoord.y * 0.5));

              // 3. Renk Karışımı
              vec3 finalColor = mix(uColor, uCore, crack);
    gl_FragColor = vec4(finalColor, crack * dither * (1.0 - dist * 2.0));
}
`}
                />
            </mesh>

            {/* DIŞ ŞOK DALGASI */}
            <mesh ref={shockwaveRef} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.9, 1.0, 32]} />
                <meshBasicMaterial color="#bc13fe" transparent opacity={0.8} />
            </mesh>
        </group>
    );
};

// Export Configuration for Skill System
// Supports various key formats (1, 2, ultimate, reaper_1, etc.)
export const REAPER_EFFECTS: { [key: string]: React.FC<any> } = {
    '1': ScytheSlash,
    '2': SoulTrap,
    '3': SoulReapFX,
    '4': DarkTransitionFX,
    '5': FearSkillFX,
    '6': UltimateDeathSmash,
    'ultimate': UltimateDeathSmash,

    // Skill Visual IDs
    'reaper_1': ScytheSlash,
    'reaper_2': SoulTrap,
    'reaper_3': SoulReapFX,
    'reaper_4': DarkTransitionFX,
    'reaper_5': FearSkillFX,
    'reaper_6': UltimateDeathSmash,
    'reaper_ultimate': UltimateDeathSmash,

    // Descriptive Names
    'scythe_slash': ScytheSlash,
    'soul_trap': SoulTrap,
    'soul_reap': SoulReapFX,
    'shadow_step': DarkTransitionFX,
    'grim_fear': FearSkillFX,
    'death_mark': DeathsGripFX,
    'ghost_form': DarkTransitionFX,
    'execution': UltimateDeathSmash,

    // New Additions
    'shadow_dash': DarkTransitionFX,
    'soul_burst': SoulBurstFX,
    'deaths_grip': DeathsGripFX,
    'fear': FearSkillFX,
    'doom': UltimateDeathSmash,
    'doom_ulti': UltimateDeathSmash,
};
