import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ═══════════════════════════════════════════════════════════════════════════
// 🎻 OZAN (BARD) - MÜZİK NOTALARI İÇEREN PİXEL SHADER'LAR
// Her skill gerçek müzik notası shape'leri içeriyor
// ═══════════════════════════════════════════════════════════════════════════

// Shader 0: MOR - Nota Vuruşu (Uçan Nota Dalgası)
const shader0_NoteStrike = `
    uniform float uTime;
    varying vec2 vUv;
    
    float music_note(vec2 uv, float size, float rot, float bounce) {
        float c = cos(rot), s = sin(rot);
        uv = mat2(c, -s, s, c) * (uv - 0.5) * size + 0.5;
        float head = 1.0 - smoothstep(0.0, 0.15, length(uv - vec2(0.5, 0.4)) * 1.5);
        float stem = smoothstep(0.02, 0.0, abs(uv.x - 0.6)) * smoothstep(0.0, 0.6, uv.y);
        float flag = smoothstep(0.03, 0.0, abs(uv.x - 0.65)) * smoothstep(0.55, 0.75, uv.y) * 
                     (0.5 + sin((uv.y - 0.65) * 40.0 + bounce * 10.0) * 0.5);
        return max(head, max(stem, flag)) * (0.8 + sin(bounce * 8.0) * 0.2);
    }
    
    void main() {
        vec2 px = floor(vUv * 32.0) / 32.0;
        float speed = 4.0;
        
        // Dalga efekti
        float wave = sin(length(px - 0.5) * 25.0 - uTime * speed * 6.0) * 0.5 + 0.5;
        wave *= smoothstep(0.0, 1.0, 1.0 - length(px - 0.5) * 2.0);
        
        // 5 uçan nota
        float notes = 0.0;
        for(float i = 0.0; i < 5.0; i += 1.0) {
            vec2 note_pos = vec2(0.2 + fract(uTime * speed * 0.8 + i * 0.15) * 0.8, 0.3 + sin(uTime * speed * 2.0 + i) * 0.2);
            notes += music_note(px - note_pos, 0.12, uTime * 3.0 + i, uTime * 5.0 + i * 2.0);
        }
        
        vec3 col = vec3(0.8, 0.4, 1.0) * (wave * 1.5 + notes * 2.2);
        float a = max(wave, notes) * 1.5;
        if (a < 0.1) discard;
        gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));
    }
`;

// Shader 1: YEŞİL - Cesaret Marşı (Dönen Nota Aura)
const shader1_Anthem = `
    uniform float uTime;
    varying vec2 vUv;
    
    float music_note(vec2 uv, float size, float rot, float bounce) {
        float c = cos(rot), s = sin(rot);
        uv = mat2(c, -s, s, c) * (uv - 0.5) * size + 0.5;
        float head = 1.0 - smoothstep(0.0, 0.15, length(uv - vec2(0.5, 0.4)) * 1.5);
        float stem = smoothstep(0.02, 0.0, abs(uv.x - 0.6)) * smoothstep(0.0, 0.6, uv.y);
        float flag = smoothstep(0.03, 0.0, abs(uv.x - 0.65)) * smoothstep(0.55, 0.75, uv.y) * 
                     (0.5 + sin((uv.y - 0.65) * 40.0 + bounce * 10.0) * 0.5);
        return max(head, max(stem, flag)) * (0.8 + sin(bounce * 8.0) * 0.2);
    }
    
    void main() {
        vec2 px = floor(vUv * 32.0) / 32.0;
        float speed = 4.0;
        
        // Marş dalgası
        float march = sin(px.y * 30.0 + uTime * speed * 2.0) * 0.5 + 0.5;
        
        // 8 dönen nota (marş gibi)
        float notes = 0.0;
        for(float i = 0.0; i < 8.0; i += 1.0) {
            float angle = uTime * speed * 1.5 + i * 0.785;
            vec2 note_pos = vec2(0.5 + cos(angle) * 0.3, 0.5 + sin(angle) * 0.3);
            notes += music_note(px - note_pos, 0.1, angle * 0.5, uTime * 4.0);
        }
        
        vec3 col = vec3(0.3, 1.0, 0.5) * (march * 0.8 + notes * 1.8);
        float a = march * 0.8 + notes * 1.2;
        if (a < 0.1) discard;
        gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));
    }
`;

// Shader 2: KIRMIZI - Yıkım Notası (Kırılan Dev Nota + Parçalar)
const shader2_Ruin = `
    uniform float uTime;
    varying vec2 vUv;
    
    float music_note(vec2 uv, float size, float rot, float bounce) {
        float c = cos(rot), s = sin(rot);
        uv = mat2(c, -s, s, c) * (uv - 0.5) * size + 0.5;
        float head = 1.0 - smoothstep(0.0, 0.15, length(uv - vec2(0.5, 0.4)) * 1.5);
        float stem = smoothstep(0.02, 0.0, abs(uv.x - 0.6)) * smoothstep(0.0, 0.6, uv.y);
        float flag = smoothstep(0.03, 0.0, abs(uv.x - 0.65)) * smoothstep(0.55, 0.75, uv.y) * 
                     (0.5 + sin((uv.y - 0.65) * 40.0 + bounce * 10.0) * 0.5);
        return max(head, max(stem, flag)) * (0.8 + sin(bounce * 8.0) * 0.2);
    }
    
    void main() {
        vec2 px = floor(vUv * 36.0) / 36.0;
        float speed = 4.0;
        float n = fract(sin(dot(floor(px * 5.0), vec2(12.9898, 4.1414))) * 43758.5453);
        
        // Kırılma efekti
        float shatter = sin(length(px - 0.5) * 40.0 + uTime * speed * 7.0) * 0.6 + 0.4;
        
        // Büyük kırılan nota ortada
        float big_note = music_note(px - vec2(0.5, 0.5), 0.35, uTime * 2.0, uTime * 10.0) * pow(n, 1.5);
        
        // 6 parça nota dağılıyor
        float shards = 0.0;
        for(float i = 0.0; i < 6.0; i += 1.0) {
            vec2 shard_pos = vec2(0.5 + cos(i * 1.047 + uTime * 8.0) * fract(uTime * 0.5) * 0.4, 
                                  0.5 + sin(i * 1.047 + uTime * 8.0) * fract(uTime * 0.5) * 0.4);
            shards += music_note(px - shard_pos, 0.08, uTime * 6.0, 0.0) * 0.7;
        }
        
        vec3 col = vec3(1.0, 0.4, 0.3) * (shatter * 0.8 + big_note * 2.5 + shards * 1.8);
        float a = max(big_note, shards) * 1.3;
        if (a < 0.1) discard;
        gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));
    }
`;

// Shader 3: MOR - Uyku Ninnisi (Yavaş Süzülen ZZZ Notaları)
const shader3_Lullaby = `
    uniform float uTime;
    varying vec2 vUv;
    
    float noise(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 4.1414))) * 43758.5453);
    }
    float noise2(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        float a = noise(i);
        float b = noise(i + vec2(1.0, 0.0));
        float c = noise(i + vec2(0.0, 1.0));
        float d = noise(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
    }
    
    float music_note(vec2 uv, float size, float rot, float bounce) {
        float c = cos(rot), s = sin(rot);
        uv = mat2(c, -s, s, c) * (uv - 0.5) * size + 0.5;
        float head = 1.0 - smoothstep(0.0, 0.15, length(uv - vec2(0.5, 0.4)) * 1.5);
        float stem = smoothstep(0.02, 0.0, abs(uv.x - 0.6)) * smoothstep(0.0, 0.6, uv.y);
        float flag = smoothstep(0.03, 0.0, abs(uv.x - 0.65)) * smoothstep(0.55, 0.75, uv.y) * 
                     (0.5 + sin((uv.y - 0.65) * 40.0 + bounce * 10.0) * 0.5);
        return max(head, max(stem, flag)) * (0.8 + sin(bounce * 8.0) * 0.2);
    }
    
    void main() {
        vec2 px = floor(vUv * 30.0) / 30.0;
        float n = noise(px * 4.0 + uTime * 0.3);
        
        // Sis bulutları
        float cloud = smoothstep(0.4, 0.8, n + sin(length(px - 0.5) * 15.0 - uTime * 1.5) * 0.3);
        
        // 7 nota yukarı yavaş süzülüyor (ninni efekti)
        float notes = 0.0;
        for(float i = 0.0; i < 7.0; i += 1.0) {
            vec2 note_pos = vec2(0.2 + i * 0.12 + sin(uTime * 1.0 + i) * 0.05, 
                                 0.8 - fract(uTime * 0.6 + i * 0.1) * 1.2);
            notes += music_note(px - note_pos, 0.11, uTime * 1.5 + i, sin(uTime * 3.0 + i) * 2.0);
        }
        
        vec3 col = vec3(0.6, 0.3, 1.0) * (cloud * 0.8 + notes * 2.0);
        float a = notes * 1.1 + cloud * 0.6;
        if (a < 0.1) discard;
        gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));
    }
`;

// Shader 4: ALTIN - Şifa Melodisi
const shader4_HealSong = `
    uniform float uTime;
    varying vec2 vUv;
    
    float music_note(vec2 uv, float size, float rot, float bounce) {
        float c = cos(rot), s = sin(rot);
        uv = mat2(c, -s, s, c) * (uv - 0.5) * size + 0.5;
        float head = 1.0 - smoothstep(0.0, 0.15, length(uv - vec2(0.5, 0.4)) * 1.5);
        float stem = smoothstep(0.02, 0.0, abs(uv.x - 0.6)) * smoothstep(0.0, 0.6, uv.y);
        float flag = smoothstep(0.03, 0.0, abs(uv.x - 0.65)) * smoothstep(0.55, 0.75, uv.y) * 
                     (0.5 + sin((uv.y - 0.65) * 40.0 + bounce * 10.0) * 0.5);
        return max(head, max(stem, flag)) * (0.8 + sin(bounce * 8.0) * 0.2);
    }
    
    void main() {
        vec2 px = floor(vUv * 32.0) / 32.0;
        
        // İyileştirme halkası
        float ring = abs(length(px - 0.5) - 0.38) * 30.0;
        ring = sin(ring + uTime * 3.0) * 0.5 + 0.5;
        float pulse = pow(sin(uTime * 8.0) * 0.5 + 0.5, 2.0) * 2.5;
        
        // Yukarı yükselen iyileştirme notaları
        float notes = 0.0;
        for(float i = 0.0; i < 5.0; i += 1.0) {
            vec2 note_pos = vec2(0.3 + i * 0.1, 0.5 - fract(uTime * 0.5 + i * 0.15) * 0.6);
            notes += music_note(px - note_pos, 0.1, 0.0, uTime * 4.0 + i);
        }
        
        vec3 col = vec3(1.0, 0.85, 0.2) * (ring * pulse * 0.8 + notes * 2.0);
        float a = ring * pulse * 0.5 + notes * 1.2;
        if (a < 0.1) discard;
        gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));
    }
`;

// Shader 5: CYAN - Hız Rapsodisi (Zıplayan Notalar + Ritim Çizgileri)
const shader5_SpeedSong = `
    uniform float uTime;
    varying vec2 vUv;
    
    float music_note(vec2 uv, float size, float rot, float bounce) {
        float c = cos(rot), s = sin(rot);
        uv = mat2(c, -s, s, c) * (uv - 0.5) * size + 0.5;
        float head = 1.0 - smoothstep(0.0, 0.15, length(uv - vec2(0.5, 0.4)) * 1.5);
        float stem = smoothstep(0.02, 0.0, abs(uv.x - 0.6)) * smoothstep(0.0, 0.6, uv.y);
        float flag = smoothstep(0.03, 0.0, abs(uv.x - 0.65)) * smoothstep(0.55, 0.75, uv.y) * 
                     (0.5 + sin((uv.y - 0.65) * 40.0 + bounce * 10.0) * 0.5);
        return max(head, max(stem, flag)) * (0.8 + sin(bounce * 8.0) * 0.2);
    }
    
    void main() {
        vec2 px = floor(vUv * 32.0) / 32.0;
        float speed = 1.0;
        float n = fract(sin(dot(floor(px * 5.0), vec2(12.9898, 4.1414))) * 43758.5453);
        
        // Ritim çizgileri (2 katman)
        float ritim_layer1 = step(0.035, abs(fract(px.x * 32.0 + uTime * speed * 20.0) - 0.5));
        float ritim_layer2 = step(0.025, abs(fract(px.x * 28.0 + uTime * speed * 18.0 + n * 0.3) - 0.5)) * 0.7;
        float ritim_lines = ritim_layer1 + ritim_layer2;
        
        // 8 zıplayan nota
        float bounce_notes = 0.0;
        for(float i = 0.0; i < 8.0; i += 1.0) {
            float freq = 10.0 + i * 3.0;
            float velocity = sin(uTime * speed * freq + i * 1.57) * 0.4 * exp(-fract(uTime * 0.2) * 0.5);
            float bounce_y = 0.5 + velocity;
            vec2 note_pos = vec2(0.22 + i * 0.1, bounce_y);
            float trail = music_note(px - vec2(note_pos.x, note_pos.y - 0.03), 0.07, 0.0, uTime * freq) * 0.5;
            bounce_notes += music_note(px - note_pos, 0.07, 0.0, uTime * freq) + trail;
        }
        
        vec3 col = vec3(0.2, 0.8, 1.0) * (ritim_lines * 1.8 + bounce_notes * 2.7);
        float a = ritim_lines * 1.1 + bounce_notes * 1.6;
        if (a < 0.1) discard;
        gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));
    }
`;

// Shader 6: TURUNCU - Gürültü
const shader6_Noise = `
    uniform float uTime;
    varying vec2 vUv;
    
    float music_note(vec2 uv, float size, float rot, float bounce) {
        float c = cos(rot), s = sin(rot);
        uv = mat2(c, -s, s, c) * (uv - 0.5) * size + 0.5;
        float head = 1.0 - smoothstep(0.0, 0.15, length(uv - vec2(0.5, 0.4)) * 1.5);
        float stem = smoothstep(0.02, 0.0, abs(uv.x - 0.6)) * smoothstep(0.0, 0.6, uv.y);
        float flag = smoothstep(0.03, 0.0, abs(uv.x - 0.65)) * smoothstep(0.55, 0.75, uv.y) * 
                     (0.5 + sin((uv.y - 0.65) * 40.0 + bounce * 10.0) * 0.5);
        return max(head, max(stem, flag)) * (0.8 + sin(bounce * 8.0) * 0.2);
    }
    
    void main() {
        vec2 px = floor(vUv * 40.0) / 40.0;
        float r = length(px - 0.5);
        
        // Shockwave
        float shock = sin(r * 50.0 - uTime * 15.0) * 0.5 + 0.5;
        shock *= smoothstep(0.0, 0.8, 1.0 - r * 2.5);
        
        // Kaotik notalar
        float notes = 0.0;
        for(float i = 0.0; i < 8.0; i += 1.0) {
            float angle = i * 0.785 + uTime * 5.0;
            vec2 note_pos = vec2(0.5 + cos(angle) * r * 2.0, 0.5 + sin(angle) * r * 2.0);
            notes += music_note(px - note_pos, 0.06, uTime * 8.0 + i, uTime * 15.0);
        }
        
        vec3 col = vec3(1.0, 0.6, 0.2) * (shock * 4.0 + notes * 2.5);
        float a = shock * 2.0 + notes * 1.5;
        if (a < 0.1) discard;
        gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));
    }
`;

// Shader 7: ALTIN - Destansı Final (ULTI) - Nota Yağmuru + Büyük Senfoni
const shader7_Symphony = `
    uniform float uTime;
    varying vec2 vUv;
    
    float music_note(vec2 uv, float size, float rot, float bounce, float noteType, float stemWidth, float headSize) {
        float c = cos(rot), s = sin(rot);
        uv = mat2(c, -s, s, c) * (uv - 0.5) * (1.0 / size) + 0.5;
        
        float head = 1.0 - smoothstep(0.0, headSize, length(uv - vec2(0.5, 0.4)) * 1.5);
        float stem = smoothstep(stemWidth, 0.0, abs(uv.x - 0.6)) * smoothstep(0.0, 0.6, uv.y);
        
        float flag = 0.0;
        if (noteType < 1.0) {
            flag = smoothstep(0.03, 0.0, abs(uv.x - 0.65)) * smoothstep(0.55, 0.75, uv.y) * 
                   (0.5 + sin((uv.y - 0.65) * 40.0 + bounce * 10.0) * 0.5);
        } else if (noteType < 2.0) {
            flag = smoothstep(0.02, 0.0, abs(uv.x - 0.65)) * (smoothstep(0.55, 0.7, uv.y) + smoothstep(0.45, 0.55, uv.y) * 0.5);
        }
        
        return max(head, max(stem, flag)) * (0.8 + sin(bounce * 8.0) * 0.2);
    }
    
    void main() {
        vec2 px = floor(vUv * 40.0) / 40.0;
        float n = fract(sin(dot(floor(px * 5.0), vec2(12.9898, 4.1414))) * 43758.5453);
        float speed = 1.0;
        
        // 5 katmanlı orkestra dalgaları
        float orkestra = 0.0;
        for(float i = 1.0; i <= 5.0; i += 1.0) {
            float freq = 9.0 + i * 5.0;
            float distort = n * 0.2;
            orkestra += sin(length(px - 0.5) * freq + uTime * speed * (2.5 + i * 0.4) + distort) * (1.0 / i) * 1.2;
        }
        
        // 20 düşen müzik notası
        float rain_notes = 0.0;
        for(float i = 0.0; i < 20.0; i += 1.0) {
            float noteType = mod(i, 3.0);
            float rain_speed = 2.2 + noteType * 0.6;
            float rain_rot = sin(uTime * 3.0 + i) * 0.5;
            float ramp = smoothstep(0.0, 0.8, fract(uTime * 0.3));
            vec2 rain_pos = vec2(
                fract(uTime * speed * rain_speed * 0.1 + i * 0.22), 
                1.0 - fract(uTime * speed * rain_speed * 0.15 + i * 0.16) * 1.4 * ramp
            );
            float mini_burst = pow(max(0.0, 1.0 - rain_pos.y), 3.0) * 1.5;
            rain_notes += music_note(px - rain_pos, 0.06 + noteType * 0.03, rain_rot, uTime * 9.0 + i * 2.5, noteType, 0.04, 0.7) + mini_burst * 0.3;
        }
        
        // Global bloom
        float global_bloom = pow(max(0.0, orkestra), 2.3) * 1.4;
        
        // Altın renk
        vec3 col = vec3(1.0, 0.8, 0.4) * (orkestra * 2.6 + rain_notes * 3.5 + global_bloom * 1.8);
        col += vec3(1.0, 0.9, 0.6) * global_bloom * 2.0;
        
        float a = rain_notes * 1.9 + orkestra * 1.4;
        if (a < 0.1) discard;
        gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));
    }
`;

const vertexShader = `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const createShader = (fragmentCode: string) => ({
    uniforms: { uTime: { value: 0 } },
    vertexShader,
    fragmentShader: fragmentCode,
    transparent: true,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
});

// ═══════════════════════════════════════════════════════════════════════════
// SKILL COMPONENTS - HER BİRİ FARKLI SHADER
// ═══════════════════════════════════════════════════════════════════════════

// b1: NOTA VURUŞU - MOR
const NoteStrikeFX = ({ position, onComplete }: any) => {
    const ref = useRef<THREE.Mesh>(null);
    const shaderData = useMemo(() => createShader(shader0_NoteStrike), []);
    useEffect(() => { const t = setTimeout(() => onComplete?.(), 1200); return () => clearTimeout(t); }, []);
    useFrame(({ clock }) => {
        if (ref.current) {
            (ref.current.material as THREE.ShaderMaterial).uniforms.uTime.value = clock.elapsedTime;
            const scale = 1 + clock.elapsedTime * 2;
            ref.current.scale.set(scale, scale, 1);
        }
    });
    return (
        <mesh ref={ref} position={[position[0], position[1] + 2, position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[2, 2]} />
            <shaderMaterial {...shaderData} />
        </mesh>
    );
};

// b2: CESARET MARŞI - YEŞİL
const AnthemFX = ({ position, onComplete, playerGroupRef, followPlayer }: any) => {
    const ref = useRef<THREE.Mesh>(null);
    const shaderData = useMemo(() => createShader(shader1_Anthem), []);
    useEffect(() => { const t = setTimeout(() => onComplete?.(), 3500); return () => clearTimeout(t); }, []);
    useFrame(({ clock }) => {
        if (ref.current) {
            if (playerGroupRef?.current && followPlayer) {
                const p = playerGroupRef.current.position;
                ref.current.position.set(p.x, p.y + 0.3, p.z);
            }
            (ref.current.material as THREE.ShaderMaterial).uniforms.uTime.value = clock.elapsedTime;
        }
    });
    return (
        <mesh ref={ref} position={position ? [position[0], position[1] + 0.3, position[2]] : [0, 0.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[5, 5]} />
            <shaderMaterial {...shaderData} />
        </mesh>
    );
};

// b3: NİNNİ - MOR
const LullabyFX = ({ position, onComplete }: any) => {
    const ref = useRef<THREE.Mesh>(null);
    const shaderData = useMemo(() => createShader(shader3_Lullaby), []);
    useEffect(() => { const t = setTimeout(() => onComplete?.(), 3500); return () => clearTimeout(t); }, []);
    useFrame(({ clock }) => {
        if (ref.current) {
            ref.current.position.y += 0.015;
            (ref.current.material as THREE.ShaderMaterial).uniforms.uTime.value = clock.elapsedTime;
        }
    });
    return (
        <mesh ref={ref} position={[position[0], position[1] + 2.5, position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[4, 4]} />
            <shaderMaterial {...shaderData} />
        </mesh>
    );
};

// b4: ŞİFA MELODİSİ - ALTIN
const HealSongFX = ({ position, onComplete, playerGroupRef, followPlayer }: any) => {
    const ref = useRef<THREE.Mesh>(null);
    const shaderData = useMemo(() => createShader(shader4_HealSong), []);
    useEffect(() => { const t = setTimeout(() => onComplete?.(), 3500); return () => clearTimeout(t); }, []);
    useFrame(({ clock }) => {
        if (ref.current) {
            if (playerGroupRef?.current && followPlayer) {
                const p = playerGroupRef.current.position;
                ref.current.position.set(p.x, p.y + 0.3, p.z);
            }
            (ref.current.material as THREE.ShaderMaterial).uniforms.uTime.value = clock.elapsedTime;
        }
    });
    return (
        <mesh ref={ref} position={position ? [position[0], position[1] + 0.3, position[2]] : [0, 0.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[5, 5]} />
            <shaderMaterial {...shaderData} />
        </mesh>
    );
};

// b5: HIZ RAPSODİSİ - CYAN
const SpeedSongFX = ({ position, onComplete, playerGroupRef, followPlayer }: any) => {
    const ref = useRef<THREE.Mesh>(null);
    const shaderData = useMemo(() => createShader(shader5_SpeedSong), []);
    useEffect(() => { const t = setTimeout(() => onComplete?.(), 2800); return () => clearTimeout(t); }, []);
    useFrame(({ clock }) => {
        if (ref.current) {
            if (playerGroupRef?.current && followPlayer) {
                const p = playerGroupRef.current.position;
                ref.current.position.set(p.x, p.y + 0.5, p.z);
            }
            (ref.current.material as THREE.ShaderMaterial).uniforms.uTime.value = clock.elapsedTime;
        }
    });
    return (
        <mesh ref={ref} position={position ? [position[0], position[1] + 0.5, position[2]] : [0, 0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[5, 3]} />
            <shaderMaterial {...shaderData} />
        </mesh>
    );
};

// b6: GÜRÜLTÜ - TURUNCU
const NoiseFX = ({ position, onComplete }: any) => {
    const ref = useRef<THREE.Mesh>(null);
    const shaderData = useMemo(() => createShader(shader6_Noise), []);
    useEffect(() => { const t = setTimeout(() => onComplete?.(), 1500); return () => clearTimeout(t); }, []);
    useFrame(({ clock }) => {
        if (ref.current) {
            const scale = 1 + clock.elapsedTime * 2;
            ref.current.scale.set(scale, scale, 1);
            (ref.current.material as THREE.ShaderMaterial).uniforms.uTime.value = clock.elapsedTime;
        }
    });
    return (
        <mesh ref={ref} position={[position[0], position[1] + 2, position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[4, 4]} />
            <shaderMaterial {...shaderData} />
        </mesh>
    );
};

// b7: SENFONİ - ALTIN (ULTI)
const SymphonyFX = ({ position, onComplete }: any) => {
    const ref = useRef<THREE.Mesh>(null);
    const shaderData = useMemo(() => createShader(shader7_Symphony), []);
    useEffect(() => { const t = setTimeout(() => onComplete?.(), 4500); return () => clearTimeout(t); }, []);
    useFrame(({ clock }) => {
        if (ref.current) {
            ref.current.rotation.z = clock.elapsedTime * 0.3;
            (ref.current.material as THREE.ShaderMaterial).uniforms.uTime.value = clock.elapsedTime;
        }
    });
    return (
        <mesh ref={ref} position={[position[0], position[1] + 0.5, position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[8, 8]} />
            <shaderMaterial {...shaderData} />
        </mesh>
    );
};

// b3 için kullanılan ayrı component (Yıkım Notası)
const RuinNoteFX = ({ position, onComplete }: any) => {
    const ref = useRef<THREE.Mesh>(null);
    const shaderData = useMemo(() => createShader(shader2_Ruin), []);
    useEffect(() => { const t = setTimeout(() => onComplete?.(), 1800); return () => clearTimeout(t); }, []);
    useFrame(({ clock }) => {
        if (ref.current) {
            const scale = 1 + clock.elapsedTime * 2;
            ref.current.scale.set(scale, scale, 1);
            (ref.current.material as THREE.ShaderMaterial).uniforms.uTime.value = clock.elapsedTime;
        }
    });
    return (
        <mesh ref={ref} position={[position[0], position[1] + 2, position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[2.5, 2.5]} />
            <shaderMaterial {...shaderData} />
        </mesh>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT - HER SKILL FARKLI RENK
// ═══════════════════════════════════════════════════════════════════════════
export const BARD_EFFECTS: { [key: string]: React.FC<any> } = {
    // Skill IDs
    'b1': NoteStrikeFX,      // MOR
    'b2': AnthemFX,          // YEŞİL
    'b3': LullabyFX,         // MOR
    'b4': HealSongFX,        // ALTIN
    'b5': SpeedSongFX,       // CYAN
    'b6': NoiseFX,           // TURUNCU
    'b7': SymphonyFX,        // ALTIN

    // Visual keys
    'note_hit': NoteStrikeFX,
    'anthem': AnthemFX,
    'lullaby': LullabyFX,
    'heal_song': HealSongFX,
    'speed_song': SpeedSongFX,
    'noise': NoiseFX,
    'symphony': SymphonyFX,

    // Fallbacks - ESKİ KEY'LER
    'bard_note': NoteStrikeFX,
    'bard_vibration': AnthemFX,
    'bard_explosion': SymphonyFX,

    // YENİ UNIQUE KEY'LER (constants.ts ile eşleşiyor)
    'bard_anthem': AnthemFX,
    'bard_ruin': RuinNoteFX,
    'bard_lullaby': LullabyFX,
    'bard_speed': SpeedSongFX,

    'march': AnthemFX,
    'speed': SpeedSongFX,
    'ruin': RuinNoteFX,

    // Türkçe
    'Nota Vuruşu': NoteStrikeFX,
    'Cesaret Marşı': AnthemFX,
    'Ninni': LullabyFX,
    'Şifa Melodisi': HealSongFX,
    'Hız Ritmi': SpeedSongFX,
    'Gürültü': NoiseFX,
    'Senfoni': SymphonyFX
};
