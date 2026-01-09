import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// 🎨 REAPER RENK PALETİ (Hayalet Yeşili / Turkuaz)
const COLOR_PRIMARY = new THREE.Color("#4fffa7"); // Parlak Yeşil
const COLOR_DARK = new THREE.Color("#008f5e"); // Koyu Yeşil
const COLOR_CORE = new THREE.Color("#ffffff"); // Beyaz Çekirdek

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
            if (!meshRef.current.userData.startTime) meshRef.current.userData.startTime = state.clock.elapsedTime;

            if (state.clock.elapsedTime > meshRef.current.userData.startTime + delay) {
                setStarted(true);
                meshRef.current.visible = true;
                // Shader time'ı sıfırla
                (meshRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = 0;
            } else {
                meshRef.current.visible = false;
                return;
            }
        }

        const mat = meshRef.current.material as THREE.ShaderMaterial;
        mat.uniforms.uTime.value += delta;

        // Tırpanın savrulma hareketi (Y ekseninde dönme)
        meshRef.current.rotation.y -= delta * 12.0;

        // Yok Olma
        if (mat.uniforms.uTime.value > 0.5) {
            mat.uniforms.uOpacity.value -= delta * 3.0;
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
              float handle = step(abs(p.x - p.y), 0.05) * step(p.x, 0.5) * step(p.y, 0.5); // Çapraz sap
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
        groupRef.current.position.y -= delta * 3;
        groupRef.current.position.z += delta * 3;

        groupRef.current.children.forEach((child) => {
            const mat = (child as THREE.Mesh).material as THREE.ShaderMaterial;
            mat.uniforms.uOpacity.value -= delta * 1.5;
        });
    });

    return (
        <group ref={groupRef} position={[position[0], position[1] + 3, position[2] - 1]}>
            {[-0.8, 0, 0.8].map((offset, i) => (
                <mesh key={i} position={[offset, 0, 0]} rotation={[0, 0, 0.3 * (i - 1)]}>
                    <planeGeometry args={[0.8, 3]} />
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
        meshRef.current.position.z += delta * 6.0;
        meshRef.current.position.x += Math.sin(time * 15.0 + offset) * 0.15;

        const mat = meshRef.current.material as THREE.ShaderMaterial;
        mat.uniforms.uTime.value = time;

        if (meshRef.current.position.z > (position[2] + 15)) {
            meshRef.current.visible = false;
        }
    });

    return (
        <mesh ref={meshRef} position={[position[0] + offset, position[1] + 1.2, position[2]]} visible={false}>
            <planeGeometry args={[1.5, 1.5]} />
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
                        float dist = length(p - vec2(0.5, 0.6));
                        float head = step(dist, 0.35);
                        float tail = step(abs(p.x - 0.5), 0.35) * step(p.y, 0.6) * step(0.1 + sin(p.x*10.0 + uTime*8.0)*0.1, p.y);
                        float shape = max(head, tail);
                        
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
            groupRef.current.scale.addScalar(0.01);
        }
    });

    return (
        <group ref={groupRef} position={[position[0], position[1], position[2]]}>
            {[...Array(6)].map((_, i) => (
                <mesh key={i} position={[Math.cos(i) * 2.5, 1, Math.sin(i) * 2.5]} rotation={[0, -i, 0]}>
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
            {/* 1. Vuruş  */}
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
