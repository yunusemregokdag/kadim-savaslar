import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ═══════════════════════════════════════════════════════════════════════════
// 🧠 MASTER PIXEL SHADER (CLERIC EDITION)
// ═══════════════════════════════════════════════════════════════════════════
const ClericPixelShader = {
    uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color('#facc15') }, // Altın-Sarı Default
        uType: { value: 0 }, // 0:Beam, 1:CrossHeal, 2:Blessing, 3:Nova, 4:DivineUlt
        uPixelSize: { value: 0.05 }, // Pixel snap size
        uResolution: { value: 32.0 }, // Texture resolution
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
            
            // 3D PIXEL SNAP
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

        // --- NOISE ---
        float rand(vec2 n) { return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453); }
        float noise(vec2 n) {
            const vec2 d = vec2(0.0, 1.0);
            vec2 b = floor(n), f = smoothstep(vec2(0.0), vec2(1.0), fract(n));
            return mix(mix(rand(b), rand(b + d.yx), f.x), mix(rand(b + d.xy), rand(b + d.yy), f.x), f.y);
        }

        // --- BAYER MATRIX (4x4) ---
        float bayer4(vec2 coord) {
            float x = mod(coord.x, 4.0);
            float y = mod(coord.y, 4.0);
            int index = int(x + y * 4.0);
            
            if(index == 0) return 0.0/16.0;  if(index == 1) return 12.0/16.0; if(index == 2) return 3.0/16.0;  if(index == 3) return 15.0/16.0;
            if(index == 4) return 8.0/16.0;  if(index == 5) return 4.0/16.0;  if(index == 6) return 11.0/16.0; if(index == 7) return 7.0/16.0;
            if(index == 8) return 2.0/16.0;  if(index == 9) return 14.0/16.0; if(index == 10) return 1.0/16.0; if(index == 11) return 13.0/16.0;
            if(index == 12) return 10.0/16.0; if(index == 13) return 6.0/16.0;  if(index == 14) return 9.0/16.0;  if(index == 15) return 5.0/16.0;
            return 0.5;
        }

        // 1. KUTSAL IŞIK (Huzme)
        float patternBeam(vec2 uv) {
            float n = noise(uv * 3.0 + uTime * uSpeed * 0.5);
            float beam = sin(uv.x * 40.0 + uTime * uSpeed * 4.0) * 0.5 + 0.5;
            beam *= smoothstep(0.0, 0.4, 1.0 - abs(uv.y - 0.5));
            return beam * n * 1.8;
        }

        // 2. BÜYÜK ŞİFA (Cross + Wave)
        float patternCrossHeal(vec2 uv) {
            float n = noise(uv * 3.0 + uTime * uSpeed * 0.5);
            float cross = max(
                step(abs(uv.x - 0.5), 0.15) * step(abs(uv.y - 0.5), 0.4), // Vertical 
                step(abs(uv.y - 0.5), 0.15) * step(abs(uv.x - 0.5), 0.4)  // Horizontal
            );
            cross += n * 0.4;
            cross *= 1.0 + sin(uTime * uSpeed * 5.0) * 0.3; 

            float heal_wave = sin(length(uv - 0.5) * 25.0 - uTime * uSpeed * 3.0) * 0.5 + 0.5;
            heal_wave *= smoothstep(0.5, 0.0, length(uv - 0.5));
            return (cross + heal_wave) * 1.3;
        }

        // 3. KUTSAMA (Wings + Fire)
        float patternBlessing(vec2 uv) {
            vec2 c = uv - 0.5;
            float angle = atan(c.y, c.x) + uTime * uSpeed * 1.2;
            vec2 rot_uv = vec2(cos(angle), sin(angle)) * length(c) + 0.5;

            float wings = sin(rot_uv.x * 15.0 + uTime * uSpeed) * 0.5 + 0.5;
            wings *= smoothstep(0.5, 0.2, abs(rot_uv.y - 0.5));

            float n = noise(uv * 5.0 + uTime);
            float fire_crackle = n * (1.0 + sin(uTime * uSpeed * 8.0) * 0.7);
            return wings + fire_crackle * 0.6;
        }

        // 4. IŞIK PATLAMASI (Nova)
        float patternNova(vec2 uv) {
            float n = noise(uv * 3.0);
            float dist = length(uv - 0.5);
            float nova = sin(dist * 35.0 - uTime * uSpeed * 6.0) * 0.5 + 0.5;
            nova *= 1.0 - smoothstep(0.0, 0.5, dist * 1.8);
            nova += pow(n, 2.0) * 1.5;
            return nova * 2.0 * (1.0 - dist * 2.0);
        }

        // 5. TANRISAL MÜDAHALE (Ulti - Melek)
        float patternDivineUlt(vec2 uv) {
            float pulse = sin(uTime * uSpeed * 3.0) * 0.5 + 0.5;
            float wings_big = 0.0;
            for(float i = 1.0; i <= 4.0; i += 1.0) {
                float wing = sin((uv.x + i * 0.3) * 20.0 + uTime * uSpeed * 1.5) * 
                             smoothstep(0.0, 0.8, 1.0 - abs(uv.y - 0.5 - i*0.15));
                wings_big += wing * (1.0 / i);
            }
            float divine_burst = sin(length(uv - 0.5) * 12.0 + uTime * uSpeed * 4.0 + 3.14) * 0.6 + 0.6;
            divine_burst *= smoothstep(0.0, 0.6, 0.5 - length(uv - 0.5));
            return wings_big * 1.2 + divine_burst * 2.0 + pulse * 0.8;
        }

        // 6. DİRİLTME (Pasif - Resurrection)
        float patternRevive(vec2 uv) {
            float n = noise(uv * 3.0 + uTime);
            // Halka
            float revive_ring = sin(length(uv - 0.5) * 18.0 + uTime * uSpeed * 5.0) * 0.5 + 0.5;
            revive_ring *= smoothstep(0.0, 0.8, 1.0 - length(uv - 0.5) * 1.5);

            // Ruh Yükselişi
            vec2 soul_uv = uv;
            soul_uv.y -= uTime * uSpeed * 0.8; 
            float soul_glow = smoothstep(0.0, 0.4, 1.0 - abs(soul_uv.y - 0.5)) * 
                              (0.6 + sin(uTime * uSpeed * 4.0 + uv.x * 20.0) * 0.4);

            // Kanat
            float wings_revive = 0.0;
            for(float i = 0.5; i <= 3.0; i += 0.8) {
                float wing = sin((uv.x - 0.5) * 25.0 + i * 1.5) * 
                             smoothstep(0.0, 0.7, 1.0 - abs(uv.y - 0.5 - i * 0.2));
                wings_revive += abs(wing) * 0.6;
            }

            float phoenix_crackle = pow(n, 1.5) * (1.0 + sin(uTime * uSpeed * 10.0) * 0.5); 
            
            return (revive_ring * 1.4 + soul_glow * 1.2 + wings_revive * 1.0 + phoenix_crackle * 0.7);
        }

        void main() {
            vec2 pxUV = floor(vUv * uResolution) / uResolution;
            
            float i = 0.0;
            if (uType == 0) i = patternBeam(pxUV);
            else if (uType == 1) i = patternCrossHeal(pxUV);
            else if (uType == 2) i = patternBlessing(pxUV);
            else if (uType == 3) i = patternNova(pxUV);
            else if (uType == 4) i = patternDivineUlt(pxUV);
            else if (uType == 5) i = patternRevive(pxUV);
            
            vec3 col = uColor * i;
            col = floor(col * 8.0) / 8.0; 

            // Pixel Dithering
            float dith = bayer4(gl_FragCoord.xy);
            float alpha = i - dith * 0.6;
            alpha = clamp(alpha, 0.0, 1.0);

            // Fresnel Glow
            float fresnel = pow(1.0 - dot(vViewDir, vNormal), 3.0);
            col += vec3(1.0, 0.9, 0.6) * fresnel * 1.5;

            // Revive Pulse (Ekstra)
            if (uType == 5) {
                float pulse = 0.8 + sin(uTime * 8.0) * 0.2;
                col *= pulse;
            }

            if (alpha < 0.1) discard;
            gl_FragColor = vec4(col, 0.95);
        }
    `
};

// ═══════════════════════════════════════════════════════════════════════════
// SKILL 1: KUTSAL IŞIK (Altın Beam)
// ═══════════════════════════════════════════════════════════════════════════
const HolyBeamFX = ({ position, onComplete }: any) => {
    const ref = useRef<THREE.Mesh>(null);
    useEffect(() => { const t = setTimeout(() => onComplete?.(), 1500); return () => clearTimeout(t); }, []);
    useFrame(({ clock }) => { if (ref.current) (ref.current.material as THREE.ShaderMaterial).uniforms.uTime.value = clock.elapsedTime; });
    return (
        <mesh ref={ref} position={[position[0], position[1] + 2, position[2]]}>
            <cylinderGeometry args={[0.5, 0.5, 6, 8, 1, true]} />
            <shaderMaterial args={[ClericPixelShader]} uniforms-uColor-value={new THREE.Color(1.0, 0.95, 0.6)} uniforms-uType-value={0} transparent side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
        </mesh>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// SKILL 2: BÜYÜK ŞİFA (Cross + Wave)
// ═══════════════════════════════════════════════════════════════════════════
const GreatHealFX = ({ position, onComplete }: any) => {
    const ref = useRef<THREE.Mesh>(null);
    useEffect(() => { const t = setTimeout(() => onComplete?.(), 2000); return () => clearTimeout(t); }, []);
    useFrame(({ clock }) => { if (ref.current) { ref.current.rotation.z += 0.01; (ref.current.material as THREE.ShaderMaterial).uniforms.uTime.value = clock.elapsedTime; } });
    return (
        <mesh ref={ref} position={[position[0], position[1] + 0.1, position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[4, 4]} />
            <shaderMaterial args={[ClericPixelShader]} uniforms-uColor-value={new THREE.Color(0.2, 1.0, 0.2)} uniforms-uType-value={1} transparent side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
        </mesh>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// SKILL 3: KUTSAMA (Wings + Fire Buff)
// ═══════════════════════════════════════════════════════════════════════════
const BlessingFX = ({ onComplete, playerGroupRef }: any) => {
    const ref = useRef<THREE.Mesh>(null);
    useEffect(() => { const t = setTimeout(() => onComplete?.(), 3000); return () => clearTimeout(t); }, []);
    useFrame(({ clock }) => { if (ref.current && playerGroupRef?.current) { const p = playerGroupRef.current.position; ref.current.position.set(p.x, p.y + 1, p.z); (ref.current.material as THREE.ShaderMaterial).uniforms.uTime.value = clock.elapsedTime; } });
    return (
        <mesh ref={ref}>
            <cylinderGeometry args={[1.5, 1.5, 3, 16, 1, true]} />
            <shaderMaterial args={[ClericPixelShader]} uniforms-uColor-value={new THREE.Color(1.0, 0.6, 0.2)} uniforms-uType-value={2} transparent side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
        </mesh>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// SKILL 4: IŞIK PATLAMASI (Nova CC)
// ═══════════════════════════════════════════════════════════════════════════
const HolyNovaFX = ({ position, onComplete }: any) => {
    const ref = useRef<THREE.Mesh>(null);
    useEffect(() => { const t = setTimeout(() => onComplete?.(), 1000); return () => clearTimeout(t); }, []);
    useFrame(({ clock }) => { if (ref.current) { const s = 1 + clock.elapsedTime * 10; ref.current.scale.set(s, s, s); (ref.current.material as THREE.ShaderMaterial).uniforms.uTime.value = clock.elapsedTime; } });
    return (
        <mesh ref={ref} position={[position[0], position[1] + 1, position[2]]}>
            <sphereGeometry args={[1, 16, 16]} />
            <shaderMaterial args={[ClericPixelShader]} uniforms-uColor-value={new THREE.Color(1.0, 1.0, 1.0)} uniforms-uType-value={3} transparent side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
        </mesh>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// SKILL 6: DİRİLTME (PASİF - Resurrection)
// ═══════════════════════════════════════════════════════════════════════════
const ResurrectionFX = ({ position, onComplete, playerGroupRef }: any) => {
    const ref = useRef<THREE.Mesh>(null);
    useEffect(() => { const t = setTimeout(() => onComplete?.(), 2500); return () => clearTimeout(t); }, []);
    useFrame(({ clock }) => {
        if (ref.current) {
            if (playerGroupRef?.current) { const p = playerGroupRef.current.position; ref.current.position.set(p.x, p.y + 1.5, p.z); }
            (ref.current.material as THREE.ShaderMaterial).uniforms.uTime.value = clock.elapsedTime;
        }
    });
    return (
        <mesh ref={ref}>
            <cylinderGeometry args={[2, 2, 4, 16, 1, true]} />
            <shaderMaterial args={[ClericPixelShader]} uniforms-uColor-value={new THREE.Color(0.2, 0.8, 1.0)} uniforms-uType-value={5} transparent side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
        </mesh>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// SKILL 7: TANRISAL MÜDAHALE (Ulti - Melek Kanatları)
// ═══════════════════════════════════════════════════════════════════════════
const DivineInterventionFX = ({ position, onComplete, playerGroupRef }: any) => {
    const ref = useRef<THREE.Mesh>(null);
    useEffect(() => { const t = setTimeout(() => onComplete?.(), 4000); return () => clearTimeout(t); }, []);
    useFrame(({ clock }) => { if (ref.current) { if (playerGroupRef?.current) { const p = playerGroupRef.current.position; ref.current.position.set(p.x, p.y + 2, p.z); } (ref.current.material as THREE.ShaderMaterial).uniforms.uTime.value = clock.elapsedTime; } });
    return (
        <mesh ref={ref} position={[position[0], position[1] + 2, position[2]]}>
            <planeGeometry args={[6, 4]} />
            <shaderMaterial args={[ClericPixelShader]} uniforms-uColor-value={new THREE.Color(1.0, 0.84, 0.0)} uniforms-uType-value={4} transparent side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
        </mesh>
    );
};

export const HEALER_EFFECTS: { [key: string]: React.FC<any> } = {
    // ID Mappings
    'cl1': HolyBeamFX,
    'cl2': GreatHealFX,
    'cl3': BlessingFX,
    'cl4': HolyNovaFX,
    'cl5': ResurrectionFX,
    'cl7': DivineInterventionFX,

    // Visual Keys (Corrected from constants.ts)
    'cleric_impact': HolyBeamFX,     // cl1 ve cl4
    'cleric_immolation': GreatHealFX,// cl2
    'cleric_wave': BlessingFX,       // cl3
    'cleric_tear': DivineInterventionFX, // cl7 (veya cl5 için de kullanılabilir)

    // Skill Names & Fallbacks
    'cleric_smite': HolyBeamFX,
    'cleric_heal': GreatHealFX,
    'cleric_buff': BlessingFX,
    'cleric_nova': HolyNovaFX,
    'cleric_divine': DivineInterventionFX,
    'cleric_resurrection': ResurrectionFX,
    'holy_rain': HolyBeamFX,

    // Generic Keys
    'blessing': BlessingFX,
    'buff_aura': BlessingFX,
    'revive': ResurrectionFX,
    'resurrection': ResurrectionFX,
    'holy_circle': GreatHealFX,
    'holy_shield': BlessingFX,
    'sanctuary': GreatHealFX,
    'light_rain': HolyBeamFX,
    'divine_intervention': DivineInterventionFX
};
