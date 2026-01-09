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

// Export Configuration for Skill System
// Supports various key formats (1, 2, ultimate, reaper_1, etc.)
export const REAPER_EFFECTS: { [key: string]: React.FC<any> } = {
    '1': ScytheSlash,
    '2': SoulTrap,
    'ultimate': DoomUlti,

    // Skill Visual IDs
    'reaper_1': ScytheSlash,
    'reaper_2': SoulTrap,
    'reaper_ultimate': DoomUlti,

    // Descriptive Names
    'scythe_slash': ScytheSlash,
    'soul_trap': SoulTrap,
    'doom': DoomUlti,
    'doom_ulti': DoomUlti,

    // SkillAssetRegistry Mappings
    'soul_harvest': SoulTrap,
    'shadow_step': ScytheSlash,
    'grim_fear': DoomUlti,
    'death_mark': SoulTrap,
    'ghost_form': SoulTrap,
    'execution': DoomUlti
};
