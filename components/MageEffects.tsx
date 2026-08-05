import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ═══════════════════════════════════════════════════════════════════════════
// 🧠 MASTER PIXEL SHADER (ARCHMAGE EDITION) 
// ═══════════════════════════════════════════════════════════════════════════
const ArchmagePixelShader = {
    uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color('#8b5cf6') }, // Mor Default
        uType: { value: 0 }, // 0:Arcane, 1:TimeWarp, 2:Polymorph, 3:StarRain, 4:ManaBlast, 5:Apocalypse
        uPixelSize: { value: 0.1 },
        uResolution: { value: 32.0 },
        uSpeed: { value: 2.0 },
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
            
            // 3D PIXEL SNAP (Vertex Snapping)
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
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

        // --- NOISE & DITHER ---
        float rand(vec2 n) { return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453); }
        float noise(vec2 n) {
            const vec2 d = vec2(0.0, 1.0);
            vec2 b = floor(n), f = smoothstep(vec2(0.0), vec2(1.0), fract(n));
            return mix(mix(rand(b), rand(b + d.yx), f.x), mix(rand(b + d.xy), rand(b + d.yy), f.x), f.y);
        }
        float dither(vec2 uv) { return (mod(uv.x*uResolution, 4.0) + mod(uv.y*uResolution, 4.0)*4.0) / 16.0; }

        // 1. ARCANE ORB (Rune Spin)
        float patternArcane(vec2 uv) {
            vec2 c = uv - 0.5;
            float angle = atan(c.y, c.x); // Spin
            float dist = length(c);
            float ring = abs(sin(dist * 20.0 - uTime * 5.0)) * 0.7 + 0.3;
            float n = noise(uv * 5.0 + uTime);
            return ring * n * (1.0 - smoothstep(0.3, 0.5, dist));
        }

        // 2. TIME WARP (Clock Swirl)
        float patternTime(vec2 uv) {
            vec2 c = uv - 0.5;
            float angle = atan(c.y, c.x) + uTime * uSpeed;
            float dist = length(c);
            float spiral = sin(angle * 8.0 + dist * 15.0 - uTime * 8.0) * 0.5 + 0.5;
            float tick = step(0.5, fract(dist * 12.0 + uTime));
            return spiral * tick * (1.0 - dist);
        }

        // 3. POLYMORPH (Bubble Sheep)
        float patternPoly(vec2 uv) {
            vec2 c = uv - 0.5;
            float dist = length(c);
            float bubble = 1.0 - smoothstep(0.0, 0.5, dist);
            float wool = noise(uv * 10.0 + uTime);
            return bubble * wool;
        }

        // 4. STAR RAIN (Meteor Trails)
        float patternRain(vec2 uv) {
            vec2 rainUV = uv;
            rainUV.y += uTime * uSpeed; // Fall down
            float trail = sin(rainUV.x * 30.0) * 0.5 + 0.5;
            float met = step(0.7, noise(rainUV * 4.0));
            return trail * met * uv.y; // Fade at top
        }

        // 5. MANA BLAST (Lightning Fork)
        float patternLightning(vec2 uv) {
            float bolt = 0.0;
            for(float i=0.0; i<3.0; i++){
                float branch = sin(uv.x * 20.0 + uTime * 15.0 + i) * exp(-uv.y * 3.0);
                bolt += smoothstep(0.4, 0.5, abs(branch));
            }
            return bolt * noise(uv + uTime);
        }

        // 6. APOCALYPSE (Crystal Nuke)
        float patternNuke(vec2 uv) {
            vec2 c = uv - 0.5;
            float dist = length(c);
            float pulse = sin(dist * 20.0 - uTime * 10.0) * 0.5 + 0.5;
            float rings = 0.0;
            for(float i=0.0; i<5.0; i++) rings += sin(dist * 10.0 - uTime * 15.0 + i) * 0.2;
            return (pulse + rings) * (1.0 - smoothstep(0.0, 0.5, dist));
        }

        void main() {
            vec2 pxUV = floor(vUv * uResolution) / uResolution;
            float i = 0.0;

            if (uType == 0) i = patternArcane(pxUV);
            else if (uType == 1) i = patternTime(pxUV);
            else if (uType == 2) i = patternPoly(pxUV);
            else if (uType == 3) i = patternRain(pxUV);
            else if (uType == 4) i = patternLightning(pxUV);
            else if (uType == 5) i = patternNuke(pxUV);

            vec3 col = uColor * i;
            col = floor(col * 8.0) / 8.0; // Palette Snap

            // Dithering
            float d = dither(gl_FragCoord.xy);
            float alpha = i - d * 0.2;
            
            // Fresnel
            float fresnel = pow(1.0 - dot(vViewDir, vNormal), 3.0);
            col += uColor * fresnel * 0.5;

            if (alpha < 0.1) discard;
            gl_FragColor = vec4(col, 0.9);
        }
    `
};

// ═══════════════════════════════════════════════════════════════════════════
// SKILL 1: ARCANE KÜRESİ (Mor - Spinning Rune Orb)
// ═══════════════════════════════════════════════════════════════════════════
const ArcaneOrbFX = ({ position, onComplete }: any) => {
    const ref = useRef<THREE.Mesh>(null);
    useFrame(({ clock }, delta) => {
        if (!ref.current) return;
        ref.current.position.z -= delta * 15; // Shoot forward
        ref.current.rotation.z += delta * 5; // Spin
        if (ref.current.position.z < position[2] - 15) onComplete?.();
        (ref.current.material as THREE.ShaderMaterial).uniforms.uTime.value = clock.elapsedTime;
    });

    return (
        <mesh ref={ref} position={[position[0], position[1] + 1.2, position[2]]}>
            <sphereGeometry args={[0.8, 16, 16]} />
            <shaderMaterial args={[ArchmagePixelShader]}
                uniforms-uColor-value={new THREE.Color(0.6, 0.1, 1.0)} // MOR
                uniforms-uType-value={0}
                transparent side={THREE.DoubleSide}
            />
        </mesh>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// SKILL 2: ZAMAN BÜKÜLMESİ (Lacivert - Clock Swirl Buff)
// ═══════════════════════════════════════════════════════════════════════════
const TimeWarpFX = ({ onComplete, playerGroupRef }: any) => {
    const ref = useRef<THREE.Mesh>(null);
    useEffect(() => { const t = setTimeout(() => onComplete?.(), 3000); return () => clearTimeout(t); }, []);

    useFrame(({ clock }) => {
        if (!ref.current || !playerGroupRef?.current) return;
        const p = playerGroupRef.current.position;
        ref.current.position.set(p.x, p.y + 0.1, p.z); // Ground Aura
        (ref.current.material as THREE.ShaderMaterial).uniforms.uTime.value = clock.elapsedTime;
    });

    return (
        <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[4, 4]} />
            <shaderMaterial args={[ArchmagePixelShader]}
                uniforms-uColor-value={new THREE.Color(0.2, 0.2, 0.8)} // LACİVERT
                uniforms-uType-value={1}
                transparent side={THREE.DoubleSide} blending={THREE.AdditiveBlending}
            />
        </mesh>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// SKILL 3: POLİMORF (Yeşil - Sheep Bubble)
// ═══════════════════════════════════════════════════════════════════════════
const PolymorphFX = ({ position, onComplete }: any) => {
    const ref = useRef<THREE.Mesh>(null);
    useEffect(() => { const t = setTimeout(() => onComplete?.(), 2000); return () => clearTimeout(t); }, []);

    useFrame(({ clock }) => {
        if (!ref.current) return;
        ref.current.position.y += Math.sin(clock.elapsedTime * 5) * 0.02; // Float
        (ref.current.material as THREE.ShaderMaterial).uniforms.uTime.value = clock.elapsedTime;
    });

    return (
        <mesh ref={ref} position={[position[0], position[1] + 1.5, position[2]]}>
            <sphereGeometry args={[1.2, 16, 16]} />
            <shaderMaterial args={[ArchmagePixelShader]}
                uniforms-uColor-value={new THREE.Color(0.2, 1.0, 0.4)} // YEŞİL
                uniforms-uType-value={2}
                transparent side={THREE.DoubleSide}
            />
        </mesh>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// SKILL 4: YILDIZ YAĞMURU (Turuncu - Meteor Rain)
// ═══════════════════════════════════════════════════════════════════════════
const StarRainFX = ({ position, onComplete }: any) => {
    const groupRef = useRef<THREE.Group>(null);
    useEffect(() => { const t = setTimeout(() => onComplete?.(), 3000); return () => clearTimeout(t); }, []);

    useFrame(({ clock }, delta) => {
        if (!groupRef.current) return;
        groupRef.current.children.forEach((child: any) => {
            child.position.y -= delta * 15; // Rain down
            if (child.position.y < 0) child.position.y = 8 + Math.random() * 5; // Reset
            if (child.material) child.material.uniforms.uTime.value = clock.elapsedTime;
        });
    });

    return (
        <group ref={groupRef} position={position}>
            {[...Array(8)].map((_, i) => (
                <mesh key={i} position={[Math.random() * 6 - 3, 8 + Math.random() * 5, Math.random() * 6 - 3]}>
                    <boxGeometry args={[0.3, 1.5, 0.3]} />
                    <shaderMaterial args={[ArchmagePixelShader]}
                        uniforms-uColor-value={new THREE.Color(1.0, 0.4, 0.1)} // TURUNCU
                        uniforms-uType-value={3}
                        transparent
                    />
                </mesh>
            ))}
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// SKILL 5: MANA PATLAMASI (Mavi - Lightning Cascade)
// ═══════════════════════════════════════════════════════════════════════════
const ManaBlastFX = ({ position, onComplete }: any) => {
    const ref = useRef<THREE.Mesh>(null);
    useEffect(() => { const t = setTimeout(() => onComplete?.(), 1000); return () => clearTimeout(t); }, []);

    useFrame(({ clock }) => {
        if (ref.current) (ref.current.material as THREE.ShaderMaterial).uniforms.uTime.value = clock.elapsedTime;
    });

    return (
        <mesh ref={ref} position={[position[0], position[1] + 2, position[2]]}>
            <cylinderGeometry args={[0.5, 3, 4, 8, 1, true]} />
            <shaderMaterial args={[ArchmagePixelShader]}
                uniforms-uColor-value={new THREE.Color(0.1, 0.6, 1.0)} // MAVİ
                uniforms-uType-value={4}
                transparent side={THREE.DoubleSide} blending={THREE.AdditiveBlending}
            />
        </mesh>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// SKILL 6: KIYAMET (ULTI) (Mor - Crystal Nuke)
// ═══════════════════════════════════════════════════════════════════════════
const ApocalypseFX = ({ position, onComplete }: any) => {
    const ref = useRef<THREE.Mesh>(null);
    useEffect(() => { const t = setTimeout(() => onComplete?.(), 2500); return () => clearTimeout(t); }, []);

    useFrame(({ clock }) => {
        if (!ref.current) return;
        const s = 1 + Math.sin(clock.elapsedTime * 2) * 5; // Expand
        ref.current.scale.set(s, s, s);
        (ref.current.material as THREE.ShaderMaterial).uniforms.uTime.value = clock.elapsedTime;
    });

    return (
        <mesh ref={ref} position={[position[0], position[1] + 0.5, position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[10, 10]} />
            <shaderMaterial args={[ArchmagePixelShader]}
                uniforms-uColor-value={new THREE.Color(0.7, 0.0, 1.0)} // KOYU MOR
                uniforms-uType-value={5}
                transparent side={THREE.DoubleSide} blending={THREE.AdditiveBlending}
            />
        </mesh>
    );
};

export const MAGE_EFFECTS: { [key: string]: React.FC<any> } = {
    // ID Mappings (constants.ts'dekiler)
    'am1': ArcaneOrbFX,
    'am2': TimeWarpFX,
    'am3': PolymorphFX,
    'am5': StarRainFX,
    'am6': ManaBlastFX,
    'am7': ApocalypseFX,

    // Visual Key Mappings (constants.ts'den asıl kullanılanlar)
    'archmage_bolt': ArcaneOrbFX,       // Arcane Küresi
    'archmage_impact': TimeWarpFX,      // Zaman Bükülmesi
    'archmage_void': PolymorphFX,       // Polimorf
    'archmage_meteor': StarRainFX,      // Yıldız Yağmuru
    'archmage_blizzard': ManaBlastFX,   // Mana Patlaması
    'archmage_apocalypse': ApocalypseFX,// Kıyamet (Ulti)

    // Eski/Alternatif Keyler (Yedek)
    'fireball': ArcaneOrbFX,
    'iceblock': TimeWarpFX,
    'teleport': TimeWarpFX,
    'lightning': ManaBlastFX,
    'meteor': StarRainFX,
    'drain': PolymorphFX,
    'blackhole': ApocalypseFX,
    'arcane_orb': ArcaneOrbFX,
    'time_warp': TimeWarpFX,
    'polymorph': PolymorphFX,
    'star_rain': StarRainFX,
    'mana_blast': ManaBlastFX,
    'apocalypse': ApocalypseFX
};
