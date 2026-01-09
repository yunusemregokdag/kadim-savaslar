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

// 1. RUH KAPAN (Soul Trap - AoE)
const SoulTrap = ({ position }: { position: [number, number, number] }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.z -= 0.03;
            (meshRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = state.clock.elapsedTime;
        }
    });

    return (
        <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={position}>
            <planeGeometry args={[6, 6]} />
            <shaderMaterial args={[DarkSoulShader]} transparent blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
    );
};

// 2. TIRPAN KESİŞİ (Scythe Slash - Textureless)
const ScytheSlash = ({ position }: { position: [number, number, number] }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.scale.x += 0.2;
            const mat = meshRef.current.material as THREE.MeshBasicMaterial;
            mat.opacity -= 0.05;
            if (mat.opacity <= 0) meshRef.current.visible = false;
        }
    });

    return (
        <mesh ref={meshRef} position={position} rotation={[0, 0, Math.random() * Math.PI]}>
            <ringGeometry args={[1.8, 2.0, 32, 1, 0, Math.PI * 0.7]} />
            <meshBasicMaterial color="#ff00ff" transparent blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
        </mesh>
    );
};

// 3. ÖLÜMÜN SESİ (ULTI - Ekranı Karartan Kaos)
const DoomUlti = ({ position }: { position: [number, number, number] }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    useFrame((state) => {
        if (meshRef.current) {
            (meshRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = state.clock.elapsedTime;
            meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 25.0) * 0.02);
        }
    });

    return (
        <mesh ref={meshRef} position={[position[0], position[1] + 0.1, position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[10, 64]} />
            <shaderMaterial
                transparent
                blending={THREE.MultiplyBlending} // Etrafı karartmak için Multiply kullanıyoruz
                uniforms={{ uTime: { value: 0 }, uColor: { value: new THREE.Color("#110022") } }}
                vertexShader={DarkSoulShader.vertexShader}
                fragmentShader={`
          varying vec2 vUv;
          uniform float uTime;
          void main() {
            vec2 uv = vUv - 0.5;
            float d = length(uv);
            float noise = sin(d * 100.0 - uTime * 30.0);
            gl_FragColor = vec4(0.0, 0.0, 0.0, smoothstep(0.0, 0.5, d) * step(0.5, noise));
          }
        `}
            />
        </mesh>
    );
};

// Export Component
export const ReaperEffects = ({ skillKey, position }: { skillKey: string, position: [number, number, number] }) => {
    return (
        <group>
            {skillKey === '1' && <ScytheSlash position={[position[0], position[1] + 1.0, position[2]]} />}
            {skillKey === '2' && <SoulTrap position={[position[0], 0.2, position[2]]} />}
            {skillKey === 'ultimate' && <DoomUlti position={position} />}
        </group>
    );
};

// 4. GÖLGE ADIM (Shadow Dash - Kaçış/Hız)
const ShadowDashFX = ({ position }: { position: [number, number, number] }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.position.z -= 0.5; // İleri atılma
            const mat = meshRef.current.material as THREE.MeshBasicMaterial;
            mat.opacity -= 0.05; // İz bırakarak kaybolma
            if (mat.opacity <= 0) meshRef.current.visible = false;
        }
    });

    return (
        <mesh ref={meshRef} position={position} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[1, 4]} />
            <meshBasicMaterial color="#1a0033" transparent opacity={0.8} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
        </mesh>
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
                vertexShader={`varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`}
                fragmentShader={`varying vec2 vUv; uniform float uOpacity; uniform vec3 uColor; void main() { 
          float d = length(vUv - 0.5);
          float ring = smoothstep(0.4, 0.5, d) - smoothstep(0.5, 0.52, d);
          gl_FragColor = vec4(uColor, ring * uOpacity); 
        }`}
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
                vertexShader={`varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`}
                fragmentShader={`varying vec2 vUv; uniform float uTime; uniform vec3 uColor; void main() {
          float wave = step(0.5, sin(vUv.y * 20.0 - uTime * 40.0));
          vec3 finalColor = uColor * 2.0;
          float alpha = wave * step(0.2, vUv.x) * step(vUv.x, 0.8);
          gl_FragColor = vec4(finalColor, alpha);
        }`}
            />
        </mesh>
    );
};

// Export Configuration for Skill System
// Supports various key formats (1, 2, ultimate, reaper_1, etc.)
export const REAPER_EFFECTS: { [key: string]: React.FC<any> } = {
    '1': ScytheSlash,
    '2': SoulTrap,
    '3': ShadowDashFX,
    '4': SoulBurstFX,
    'ultimate': DoomUlti,

    // Skill Visual IDs
    'reaper_1': ScytheSlash,
    'reaper_2': SoulTrap,
    'reaper_3': ShadowDashFX,
    'reaper_4': SoulBurstFX,
    'reaper_ultimate': DoomUlti,

    // Descriptive Names
    'scythe_slash': ScytheSlash,
    'soul_trap': SoulTrap,
    'shadow_step': ShadowDashFX,
    'soul_harvest': SoulBurstFX,
    'grim_fear': DoomUlti,
    'death_mark': DeathsGripFX,
    'ghost_form': ShadowDashFX,
    'execution': DoomUlti,

    // New Additions
    'shadow_dash': ShadowDashFX,
    'soul_burst': SoulBurstFX,
    'deaths_grip': DeathsGripFX,
    'doom': DoomUlti,
    'doom_ulti': DoomUlti,
};
