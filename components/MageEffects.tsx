// ═══════════════════════════════════════════════════════════════════════════
// MAGE (ULU BÜYÜCÜ) SKILL EFFECTS
// Ateş, buz, yıldırım ve arcane pixel element efektleri
// ═══════════════════════════════════════════════════════════════════════════

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Instances, Instance } from '@react-three/drei';

// ═══════════════════════════════════════════════════════════════════════════
// 🎨 PIXEL FX MASTER SHADER - Parçalı ve dağılan pixel efekti
// ═══════════════════════════════════════════════════════════════════════════
const PixelFXMaterial = {
    uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color("#bc13fe") },
        uSize: { value: 15.0 },
    },
    vertexShader: `
        uniform float uTime;
        uniform float uSize;
        varying float vOpacity;
        
        float hash(float n) { return fract(sin(n) * 43758.5453123); }

        void main() {
            vec3 pos = position;
            float id = hash(float(gl_VertexID));
            
            pos.x += sin(uTime * 2.0 + id * 10.0) * 0.1;
            pos.y += cos(uTime * 3.0 + id * 5.0) * 0.1;
            
            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            gl_PointSize = uSize * (1.0 / -mvPosition.z) * (0.5 + id); 
            gl_Position = projectionMatrix * mvPosition;
            vOpacity = 0.5 + 0.5 * sin(uTime * 5.0 + id * 10.0);
        }
    `,
    fragmentShader: `
        uniform vec3 uColor;
        varying float vOpacity;
        void main() {
            vec2 cxy = 2.0 * gl_PointCoord - 1.0;
            float r = max(abs(cxy.x), abs(cxy.y));
            if (r > 1.0) discard;
            
            gl_FragColor = vec4(uColor * 2.5, vOpacity);
        }
    `
};

// ═══════════════════════════════════════════════════════════════════════════
// 🔮 ARCANE ORB FX - Mor pixel parçacıkları (500 adet)
// ═══════════════════════════════════════════════════════════════════════════
export const ArcaneOrbFXEffect: React.FC<{
    position: [number, number, number];
    targetPosition?: [number, number, number];
    onComplete: () => void;
}> = ({ position, targetPosition, onComplete }) => {
    const pointsRef = useRef<THREE.Points>(null);
    const startTime = useRef(Date.now());
    const duration = 1200;
    const progressRef = useRef(0);
    const count = 500;

    const direction = useMemo(() => {
        if (targetPosition) {
            return new THREE.Vector3(targetPosition[0] - position[0], 0, targetPosition[2] - position[2]).normalize();
        }
        return new THREE.Vector3(0, 0, 1);
    }, [position, targetPosition]);

    const particles = useMemo(() => {
        const p = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const r = Math.random() * 0.5;
            const theta = Math.random() * Math.PI * 2;
            p[i * 3] = r * Math.cos(theta);
            p[i * 3 + 1] = r * Math.sin(theta);
            p[i * 3 + 2] = (Math.random() - 0.5) * 0.2;
        }
        return p;
    }, []);

    const shaderMaterial = useMemo(() => new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uColor: { value: new THREE.Color("#bc13fe") },
            uSize: { value: 15.0 },
        },
        vertexShader: PixelFXMaterial.vertexShader,
        fragmentShader: PixelFXMaterial.fragmentShader,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
    }), []);

    useFrame((state) => {
        if (!pointsRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;

        shaderMaterial.uniforms.uTime.value = state.clock.elapsedTime;

        // Hedefe doğru hareket
        const distance = progress * 20;
        pointsRef.current.position.set(
            position[0] + direction.x * distance,
            position[1] + 0.8,
            position[2] + direction.z * distance
        );

        if (progress >= 1) onComplete();
    });

    return (
        <points ref={pointsRef} position={position}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={count} array={particles} itemSize={3} />
            </bufferGeometry>
            <primitive object={shaderMaterial} attach="material" />
        </points>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// ⏳ ZAMAN BÜKÜM FX - Altın sarısı dönen saat çarkları
// ═══════════════════════════════════════════════════════════════════════════
export const ZamanBukumFXEffect: React.FC<{
    position: [number, number, number];
    onComplete: () => void;
    playerGroupRef?: React.MutableRefObject<THREE.Group | null>;
    followPlayer?: boolean;
}> = ({ position, onComplete, playerGroupRef, followPlayer = false }) => {
    const groupRef = useRef<THREE.Group>(null);
    const ringRefs = useRef<THREE.Mesh[]>([]);
    const startTime = useRef(Date.now());
    const duration = 3000;
    const progressRef = useRef(0);

    const shaderMaterials = useMemo(() => {
        return [0, 1, 2].map(() => new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uColor: { value: new THREE.Color("#f1c40f") },
                uSize: { value: 5.0 },
            },
            vertexShader: PixelFXMaterial.vertexShader,
            fragmentShader: PixelFXMaterial.fragmentShader,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        }));
    }, []);

    useFrame((state) => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;

        groupRef.current.rotation.y += 0.02;

        // Follow player
        if (followPlayer && playerGroupRef?.current) {
            const playerWorldPos = new THREE.Vector3();
            playerGroupRef.current.getWorldPosition(playerWorldPos);
            groupRef.current.position.copy(playerWorldPos);
        }

        shaderMaterials.forEach(mat => {
            mat.uniforms.uTime.value = state.clock.elapsedTime;
        });

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={position}>
            {[0, 1, 2].map((i) => (
                <mesh key={i} ref={(el) => { if (el) ringRefs.current[i] = el; }} rotation={[Math.PI / 2, 0, i]}>
                    <ringGeometry args={[1.2 + i * 0.1, 1.25 + i * 0.1, 4, 1]} />
                    <primitive object={shaderMaterials[i]} attach="material" />
                </mesh>
            ))}
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// ☄️ KIYAMET ULTI FX - Dev mor girdap + meteorlar
// ═══════════════════════════════════════════════════════════════════════════
export const KiyametUltiFXEffect: React.FC<{
    position: [number, number, number];
    onComplete: () => void;
    playerGroupRef?: React.MutableRefObject<THREE.Group | null>;
    followPlayer?: boolean;
}> = ({ position, onComplete }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 5000;
    const progressRef = useRef(0);

    const vortexMaterial = useMemo(() => new THREE.ShaderMaterial({
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
        uniforms: {
            uTime: { value: 0 },
            uColor: { value: new THREE.Color("#6200ff") }
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            varying vec2 vUv;
            uniform float uTime;
            uniform vec3 uColor;
            void main() {
                vec2 uv = vUv - 0.5;
                float d = length(uv);
                float spiral = sin(d * 50.0 - uTime * 10.0);
                float mask = smoothstep(0.5, 0.2, d);
                gl_FragColor = vec4(uColor * 3.0, step(0.8, spiral) * mask * (1.0 - d));
            }
        `
    }), []);

    useFrame((state) => {
        if (!meshRef.current || !groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;

        vortexMaterial.uniforms.uTime.value = state.clock.elapsedTime;
        meshRef.current.rotation.z -= 0.01;

        // Kamera sarsıntısı
        if (progress < 0.5) {
            const shake = (1 - progress * 2) * 0.15;
            state.camera.position.x += Math.sin(elapsed * 0.02) * shake;
            state.camera.position.y += Math.sin(elapsed * 0.015) * shake;
        }

        if (progress >= 1) onComplete();
    });

    // Meteor pozisyonları
    const meteorPositions = useMemo(() => [
        [2, 10, 0] as [number, number, number],
        [-3, 12, 2] as [number, number, number],
        [4, 11, -1] as [number, number, number],
    ], []);

    return (
        <group ref={groupRef} position={[position[0], 0.1, position[2]]}>
            {/* Yerdeki Girdap */}
            <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[15, 15]} />
                <primitive object={vortexMaterial} attach="material" />
            </mesh>

            {/* Düşen Meteorlar */}
            {meteorPositions.map((pos, i) => (
                <mesh key={i} position={[pos[0], pos[1] - progressRef.current * 12, pos[2]]}>
                    <sphereGeometry args={[0.4, 8, 8]} />
                    <meshStandardMaterial color="#ff4400" emissive="#ff2200" emissiveIntensity={2} />
                </mesh>
            ))}

            <pointLight position={[0, 3, 0]} color="#6200ff" intensity={10} distance={20} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 🔥 PIXEL BASE SHADER - Master Shader Chunk
// ═══════════════════════════════════════════════════════════════════════════
const pixelBaseShader = {
    vertex: `
        varying vec2 vUv;
        varying float vNoise;
        uniform float uTime;
        
        float hash(float n) { return fract(sin(n) * 43758.5453123); }
        
        void main() {
            vUv = uv;
            vNoise = hash(float(gl_VertexID) / 100.0);
            vec3 pos = position;
            pos.x += sin(uTime * 10.0 + vNoise) * 0.02;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
    `
};

// ═══════════════════════════════════════════════════════════════════════════
// ⭐ YILDIZ YAĞMURU GOD FX - Cehennem Ateşi AAA Style
// ═══════════════════════════════════════════════════════════════════════════
export const YildizYagmuruGodFXEffect: React.FC<{
    position: [number, number, number];
    targetPosition?: [number, number, number];
    onComplete: () => void;
}> = ({ position, targetPosition, onComplete }) => {
    const meshRefs = useRef<THREE.Mesh[]>([]);
    const startTime = useRef(Date.now());
    const duration = 3000;
    const progressRef = useRef(0);
    const spawnPos = targetPosition || position;

    const shaderMaterial = useMemo(() => new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uColor: { value: new THREE.Color("#ff4500") }
        },
        vertexShader: pixelBaseShader.vertex,
        fragmentShader: `
            varying vec2 vUv;
            varying float vNoise;
            uniform float uTime;
            uniform vec3 uColor;

            void main() {
                vec2 uv = vUv;
                float flow = sin(uv.y * 10.0 - uTime * 15.0 + vNoise) * 0.5;
                float intensity = smoothstep(0.0, 0.5, uv.y) * step(0.5 + flow, uv.x) * step(uv.x, 0.6 + flow);
                
                vec3 color = mix(uColor, vec3(1.0, 0.8, 0.0), uv.y);
                color = mix(color, vec3(2.0), intensity);
                
                float dither = step(fract(gl_FragCoord.x * 0.5) + fract(gl_FragCoord.y * 0.5), 0.5);
                
                gl_FragColor = vec4(color, intensity * dither);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
    }), []);

    // Meteor pozisyonları
    const meteorData = useMemo(() => {
        return Array.from({ length: 15 }).map(() => ({
            x: (Math.random() - 0.5) * 10,
            startY: 5 + Math.random() * 5,
            z: (Math.random() - 0.5) * 10,
        }));
    }, []);

    useFrame((state) => {
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;

        shaderMaterial.uniforms.uTime.value = state.clock.elapsedTime;

        // Meteorları düşür
        meshRefs.current.forEach((mesh, i) => {
            if (mesh) {
                mesh.position.y = meteorData[i].startY - progress * 10;
            }
        });

        if (progress >= 1) onComplete();
    });

    return (
        <group position={spawnPos}>
            {meteorData.map((data, i) => (
                <mesh
                    key={i}
                    ref={(el) => { if (el) meshRefs.current[i] = el; }}
                    position={[data.x, data.startY, data.z]}
                >
                    <planeGeometry args={[0.5, 2]} />
                    <primitive object={shaderMaterial} attach="material" />
                </mesh>
            ))}
            <pointLight color="#ff4500" intensity={8} distance={15} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// ❄️ MANA BUZ GOD FX - Gökten İnen Buz Sütunları
// ═══════════════════════════════════════════════════════════════════════════
export const ManaBuzGodFXEffect: React.FC<{
    position: [number, number, number];
    onComplete: () => void;
    playerGroupRef?: React.MutableRefObject<THREE.Group | null>;
    followPlayer?: boolean;
}> = ({ position, onComplete }) => {
    const meshRefs = useRef<THREE.Mesh[]>([]);
    const startTime = useRef(Date.now());
    const duration = 2000;
    const progressRef = useRef(0);

    const shaderMaterial = useMemo(() => new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uColor: { value: new THREE.Color("#00f2ff") }
        },
        vertexShader: pixelBaseShader.vertex,
        fragmentShader: `
            varying vec2 vUv;
            uniform float uTime;
            uniform vec3 uColor;

            void main() {
                float border = step(0.4, vUv.x) * step(vUv.x, 0.6);
                float pulse = sin(uTime * 20.0) * 0.5 + 0.5;
                
                float shimmer = step(0.8, fract(vUv.y * 5.0 + uTime * 10.0));
                vec3 finalColor = mix(uColor, vec3(1.0), shimmer);
                
                gl_FragColor = vec4(finalColor * 1.5, border * pulse);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
    }), []);

    const pillarData = useMemo(() => {
        return Array.from({ length: 8 }).map(() => ({
            x: (Math.random() - 0.5) * 5,
            z: (Math.random() - 0.5) * 5,
        }));
    }, []);

    useFrame((state) => {
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;

        shaderMaterial.uniforms.uTime.value = state.clock.elapsedTime;

        if (progress >= 1) onComplete();
    });

    return (
        <group position={position}>
            {pillarData.map((data, i) => (
                <mesh
                    key={i}
                    ref={(el) => { if (el) meshRefs.current[i] = el; }}
                    position={[data.x, 2, data.z]}
                >
                    <planeGeometry args={[2, 4]} />
                    <primitive object={shaderMaterial} attach="material" />
                </mesh>
            ))}
            <pointLight color="#00f2ff" intensity={6} distance={10} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// ☄️ KIYAMET GOD FX - Ekranı Titreten Devasa Mor Kaos
// ═══════════════════════════════════════════════════════════════════════════
export const KiyametGodFXEffect: React.FC<{
    position: [number, number, number];
    onComplete: () => void;
    playerGroupRef?: React.MutableRefObject<THREE.Group | null>;
    followPlayer?: boolean;
}> = ({ position, onComplete }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const startTime = useRef(Date.now());
    const duration = 5000;
    const progressRef = useRef(0);

    const vortexMaterial = useMemo(() => new THREE.ShaderMaterial({
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
        uniforms: {
            uTime: { value: 0 },
            uColor: { value: new THREE.Color("#bc13fe") }
        },
        vertexShader: pixelBaseShader.vertex,
        fragmentShader: `
            varying vec2 vUv;
            uniform float uTime;
            uniform vec3 uColor;
            void main() {
                vec2 uv = vUv - 0.5;
                float d = length(uv);
                
                float angle = atan(uv.y, uv.x);
                float spiral = sin(d * 100.0 - uTime * 20.0 + angle * 5.0);
                float pxl = step(0.7, spiral);
                
                float mask = smoothstep(0.5, 0.0, d);
                vec3 color = uColor * (pxl * 5.0);
                
                gl_FragColor = vec4(color, pxl * mask * (1.0 - d * 0.5));
            }
        `
    }), []);

    useFrame((state) => {
        if (!meshRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;

        vortexMaterial.uniforms.uTime.value = state.clock.elapsedTime;

        // Ekran sarsıntısı + scale pulse
        meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 20.0) * 0.05);

        // Kamera sarsıntısı
        if (progress < 0.6) {
            const shake = (1 - progress * 1.5) * 0.2;
            state.camera.position.x += Math.sin(elapsed * 0.025) * shake;
            state.camera.position.y += Math.sin(elapsed * 0.02) * shake;
        }

        if (progress >= 1) onComplete();
    });

    return (
        <group position={[position[0], 0.02, position[2]]}>
            <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[20, 20]} />
                <primitive object={vortexMaterial} attach="material" />
            </mesh>
            <pointLight position={[0, 2, 0]} color="#bc13fe" intensity={15} distance={25} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// SHADER NOISE FUNCTION
// ═══════════════════════════════════════════════════════════════════════════
const noiseFunction = `
  float hash(float n) { return fract(sin(n) * 43758.5453123); }
  float noise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p);
    f = f*f*(3.0-2.0*f);
    float n = i.x + i.y*57.0;
    return mix(mix(hash(n+0.0), hash(n+1.0),f.x), mix(hash(n+57.0), hash(n+58.0),f.x),f.y);
  }
`;

// ═══════════════════════════════════════════════════════════════════════════
// 🔮 ARCANE ORB SHADER - Pixel Glow Efekt
// ═══════════════════════════════════════════════════════════════════════════
export const ArcaneOrbShaderEffect: React.FC<{
    position: [number, number, number];
    targetPosition?: [number, number, number];
    onComplete: () => void;
}> = ({ position, targetPosition, onComplete }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const startTime = useRef(Date.now());
    const duration = 1000;
    const progressRef = useRef(0);

    const direction = useMemo(() => {
        if (targetPosition) {
            return new THREE.Vector3(targetPosition[0] - position[0], 0, targetPosition[2] - position[2]).normalize();
        }
        return new THREE.Vector3(0, 0, 1);
    }, [position, targetPosition]);

    const shaderMaterial = useMemo(() => new THREE.ShaderMaterial({
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        uniforms: {
            uTime: { value: 0 },
            uColor: { value: new THREE.Color("#d000ff") }
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            varying vec2 vUv;
            uniform float uTime;
            uniform vec3 uColor;
            ${noiseFunction}
            void main() {
                vec2 uv = vUv - 0.5;
                float dist = length(uv);
                float n = noise(uv * 10.0 + uTime * 5.0);
                
                // Pixelated Glow Core
                float core = smoothstep(0.2, 0.15, dist);
                float aura = smoothstep(0.5, 0.2, dist) * n;
                
                // Posterize colors for pixel-art feel
                vec3 finalColor = uColor * (core + aura * 0.5);
                finalColor = floor(finalColor * 5.0) / 5.0; 
                
                gl_FragColor = vec4(finalColor, core + (aura * 0.3));
            }
        `
    }), []);

    useFrame((state) => {
        if (!meshRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;

        // Hareket
        const distance = progress * 18;
        meshRef.current.position.set(
            position[0] + direction.x * distance,
            position[1] + 0.8,
            position[2] + direction.z * distance
        );

        shaderMaterial.uniforms.uTime.value = state.clock.elapsedTime;

        if (progress >= 1) onComplete();
    });

    return (
        <mesh ref={meshRef} position={position}>
            <planeGeometry args={[1.5, 1.5]} />
            <primitive object={shaderMaterial} attach="material" />
        </mesh>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 🐑 POLİMORF SHADER - Gökkuşağı Trail
// ═══════════════════════════════════════════════════════════════════════════
export const PolymorphShaderEffect: React.FC<{
    position: [number, number, number];
    targetPosition?: [number, number, number];
    onComplete: () => void;
}> = ({ position, targetPosition, onComplete }) => {
    const pointsRef = useRef<THREE.Points>(null);
    const startTime = useRef(Date.now());
    const duration = 1200;
    const progressRef = useRef(0);
    const spawnPos = targetPosition || position;

    const particleCount = 40;
    const [positions, colors] = useMemo(() => {
        const pos = new Float32Array(particleCount * 3);
        const cols = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 0.5;
            pos[i * 3 + 1] = (Math.random() - 0.5) * 0.5;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
            const color = new THREE.Color().setHSL(i / particleCount, 1.0, 0.5);
            cols[i * 3] = color.r;
            cols[i * 3 + 1] = color.g;
            cols[i * 3 + 2] = color.b;
        }
        return [pos, cols];
    }, []);

    useFrame((state) => {
        if (!pointsRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;

        pointsRef.current.rotation.z += 0.05;
        const s = Math.sin(state.clock.elapsedTime * 10.0) * 0.2 + 1.0;
        pointsRef.current.scale.set(s * (1 + progress), s * (1 + progress), s * (1 + progress));

        if (progress >= 1) onComplete();
    });

    return (
        <points ref={pointsRef} position={[spawnPos[0], 0.5, spawnPos[2]]}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={particleCount} array={positions} itemSize={3} />
                <bufferAttribute attach="attributes-color" count={particleCount} array={colors} itemSize={3} />
            </bufferGeometry>
            <pointsMaterial size={0.15} vertexColors transparent blending={THREE.AdditiveBlending} opacity={1 - progressRef.current} />
        </points>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// ☄️ DOOM SHADER - Yer Sarsıntılı Ultimate
// ═══════════════════════════════════════════════════════════════════════════
export const DoomShaderEffect: React.FC<{
    position: [number, number, number];
    onComplete: () => void;
    playerGroupRef?: React.MutableRefObject<THREE.Group | null>;
    followPlayer?: boolean;
}> = ({ position, onComplete }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const startTime = useRef(Date.now());
    const duration = 4000;
    const progressRef = useRef(0);

    const shaderMaterial = useMemo(() => new THREE.ShaderMaterial({
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
        uniforms: {
            uTime: { value: 0 },
            uColor: { value: new THREE.Color("#4a0080") }
        },
        vertexShader: `
            varying vec2 vUv;
            uniform float uTime;
            void main() {
                vUv = uv;
                vec3 pos = position;
                // Subtle wave shake
                pos.y += sin(uTime * 20.0 + pos.x * 10.0) * 0.02;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            }
        `,
        fragmentShader: `
            varying vec2 vUv;
            uniform float uTime;
            uniform vec3 uColor;
            ${noiseFunction}
            void main() {
                vec2 uv = (vUv - 0.5) * 2.0;
                float dist = length(uv);
                
                // Expanding ring ripples
                float ripple = sin(dist * 20.0 - uTime * 10.0);
                ripple = step(0.8, ripple); // Hard edge for pixel look
                
                float mask = smoothstep(1.0, 0.8, dist); // Circle mask
                float finalAlpha = ripple * mask * (1.0 - dist);
                
                gl_FragColor = vec4(uColor * 2.0, finalAlpha);
            }
        `
    }), []);

    useFrame((state) => {
        if (!meshRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;

        shaderMaterial.uniforms.uTime.value = state.clock.elapsedTime;

        // Kamera sarsıntısı
        if (progress < 0.5) {
            const shake = (1 - progress * 2) * 0.1;
            state.camera.position.x += Math.sin(elapsed * 0.02) * shake;
            state.camera.position.y += Math.sin(elapsed * 0.015) * shake;
        }

        if (progress >= 1) onComplete();
    });

    return (
        <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[position[0], 0.05, position[2]]}>
            <planeGeometry args={[10, 10]} />
            <primitive object={shaderMaterial} attach="material" />
        </mesh>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// ⚡ MANA ZAP SHADER - Yıldırım Çakması
// ═══════════════════════════════════════════════════════════════════════════
export const ManaZapShaderEffect: React.FC<{
    position: [number, number, number];
    onComplete: () => void;
    playerGroupRef?: React.MutableRefObject<THREE.Group | null>;
    followPlayer?: boolean;
}> = ({ position, onComplete }) => {
    const groupRef = useRef<THREE.Group>(null);
    const lineRefs = useRef<THREE.Mesh[]>([]);
    const startTime = useRef(Date.now());
    const duration = 700;
    const progressRef = useRef(0);

    useFrame(() => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;

        // Flicker efekti
        lineRefs.current.forEach((child) => {
            if (child) {
                child.scale.y = Math.random() * 2.0;
                child.visible = Math.random() > 0.7;
            }
        });

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={[position[0], 0, position[2]]}>
            {[...Array(12)].map((_, i) => (
                <mesh
                    key={i}
                    ref={(el) => { if (el) lineRefs.current[i] = el; }}
                    rotation={[0, (i / 12) * Math.PI * 2, 0]}
                    position={[0, 1, 0]}
                >
                    <planeGeometry args={[0.05, 2]} />
                    <meshBasicMaterial color="#00ffff" transparent blending={THREE.AdditiveBlending} opacity={1 - progressRef.current} />
                </mesh>
            ))}
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 🔮 PIXEL ORB - Yeniden kullanılabilir element küpü
// ═══════════════════════════════════════════════════════════════════════════
const PixelOrb: React.FC<{
    position: [number, number, number];
    rotation?: [number, number, number];
    scale?: number;
    color: string;
    opacity?: number;
}> = ({ position, rotation = [0, 0, 0], scale = 1, color, opacity = 0.95 }) => {
    return (
        <mesh position={position} rotation={rotation} scale={[scale, scale, scale]}>
            <boxGeometry args={[0.2, 0.2, 0.2]} />
            <meshBasicMaterial
                color={color}
                transparent
                opacity={opacity}
                blending={THREE.AdditiveBlending}
            />
        </mesh>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// ARCANE PIXELS - Element parçacıkları
// ═══════════════════════════════════════════════════════════════════════════
const ArcanePixels: React.FC<{
    position: [number, number, number];
    color?: string;
    count?: number;
    spread?: number;
    progress: number;
}> = ({ position, color = '#aa88ff', count = 15, spread = 0.5, progress }) => {
    const pixels = useMemo(() => {
        return Array.from({ length: count }).map(() => ({
            x: (Math.random() - 0.5) * spread,
            y: (Math.random() - 0.5) * spread,
            z: (Math.random() - 0.5) * spread * 2,
            size: 0.05 + Math.random() * 0.05,
            offset: Math.random() * Math.PI * 2,
        }));
    }, [count, spread]);

    return (
        <group position={position}>
            <Instances range={count}>
                <boxGeometry args={[1, 1, 1]} />
                <meshBasicMaterial
                    color={color}
                    transparent
                    opacity={0.9 * (1 - progress)}
                    blending={THREE.AdditiveBlending}
                />
                {pixels.map((px, i) => (
                    <Instance
                        key={i}
                        position={[px.x, px.y, px.z]}
                        scale={[px.size, px.size, px.size]}
                    />
                ))}
            </Instances>
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 🔥 SKILL 1 – FIREBALL (Basic / Burst)
// ═══════════════════════════════════════════════════════════════════════════
export const FireballEffect: React.FC<{
    position: [number, number, number];
    targetPosition?: [number, number, number];
    onComplete: () => void;
}> = ({ position, targetPosition, onComplete }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 600;
    const progressRef = useRef(0);

    const direction = useMemo(() => {
        if (targetPosition) {
            return new THREE.Vector3(
                targetPosition[0] - position[0],
                0,
                targetPosition[2] - position[2]
            ).normalize();
        }
        return new THREE.Vector3(0, 0, 1);
    }, [position, targetPosition]);

    useFrame(() => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;

        // Hareket: oyuncudan hedefe
        const distance = progress * 18;
        groupRef.current.position.set(
            position[0] + direction.x * distance,
            position[1] + 0.8,
            position[2] + direction.z * distance
        );

        // Döndür
        groupRef.current.rotation.x += 0.2;
        groupRef.current.rotation.y += 0.2;

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={position}>
            {/* Ana ateş küpü */}
            <PixelOrb position={[0, 0, 0]} color="#ff5533" scale={1.5} />
            <PixelOrb position={[0.1, 0.1, 0]} color="#ff8844" scale={1} opacity={0.8} />
            <PixelOrb position={[-0.1, -0.1, 0]} color="#ffaa00" scale={0.8} opacity={0.7} />

            {/* Ateş kuyruğu */}
            <ArcanePixels position={[0, 0, 0]} color="#ff6600" count={10} spread={0.3} progress={progressRef.current} />

            <pointLight color="#ff5533" intensity={3 * (1 - progressRef.current)} distance={3} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// ❄️ SKILL 2 – ICE BLOCK (Defans / Shield)
// ═══════════════════════════════════════════════════════════════════════════
export const IceBlockEffect: React.FC<{
    position: [number, number, number];
    onComplete: () => void;
    playerGroupRef?: React.MutableRefObject<THREE.Group | null>;
    followPlayer?: boolean;
}> = ({ position, onComplete, playerGroupRef, followPlayer = false }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 5000;
    const progressRef = useRef(0);
    const blockCount = 12;

    useFrame(() => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;

        if (followPlayer && playerGroupRef?.current) {
            groupRef.current.position.copy(playerGroupRef.current.position);
        }

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={position}>
            {Array.from({ length: blockCount }).map((_, i) => {
                const angle = progressRef.current * 2 + (i / blockCount) * Math.PI * 2;
                return (
                    <PixelOrb
                        key={i}
                        position={[
                            Math.cos(angle) * 1,
                            0.5,
                            Math.sin(angle) * 1
                        ]}
                        color="#66ccff"
                        opacity={0.9 * (1 - progressRef.current * 0.3)}
                        scale={1.2}
                        rotation={[angle, angle, 0]}
                    />
                );
            })}
            <pointLight color="#66ccff" intensity={2} distance={3} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 🟣 SKILL 3 – TELEPORT (Mobility / Blink)
// ═══════════════════════════════════════════════════════════════════════════
export const TeleportEffect: React.FC<{
    position: [number, number, number];
    onComplete: () => void;
}> = ({ position, onComplete }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 500;
    const progressRef = useRef(0);
    const shardCount = 20;

    const shards = useMemo(() => {
        return Array.from({ length: shardCount }).map(() => ({
            x: (Math.random() - 0.5) * 0.5,
            z: (Math.random() - 0.5) * 0.5,
            speed: 0.03 + Math.random() * 0.02,
        }));
    }, [shardCount]);

    useFrame(() => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={position}>
            {shards.map((shard, i) => (
                <PixelOrb
                    key={i}
                    position={[
                        shard.x,
                        progressRef.current * 2,
                        shard.z
                    ]}
                    color="#aa88ff"
                    opacity={1 - progressRef.current}
                    scale={0.8}
                />
            ))}
            <pointLight color="#aa88ff" intensity={4 * (1 - progressRef.current)} distance={3} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// ⚡ SKILL 4 – LIGHTNING (Chain / Burst)
// ═══════════════════════════════════════════════════════════════════════════
export const LightningEffect: React.FC<{
    position: [number, number, number];
    targetPosition?: [number, number, number];
    onComplete: () => void;
}> = ({ position, targetPosition, onComplete }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 300;
    const progressRef = useRef(0);

    const endPos = targetPosition || [position[0], position[1], position[2] + 5];

    // Yıldırım segmentleri
    const segments = useMemo(() => {
        const segs: [number, number, number][] = [];
        const steps = 8;
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            segs.push([
                position[0] + (endPos[0] - position[0]) * t + (Math.random() - 0.5) * 0.3,
                position[1] + (endPos[1] - position[1]) * t + 0.5 + Math.random() * 0.2,
                position[2] + (endPos[2] - position[2]) * t + (Math.random() - 0.5) * 0.3,
            ]);
        }
        return segs;
    }, [position, endPos]);

    useFrame(() => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef}>
            {/* Yıldırım segmentleri */}
            {segments.map((seg, i) => (
                <PixelOrb
                    key={i}
                    position={seg}
                    color="#ffff99"
                    opacity={1 - progressRef.current}
                    scale={0.6 + Math.random() * 0.3}
                />
            ))}
            {/* Flash */}
            <pointLight
                position={[
                    (position[0] + endPos[0]) / 2,
                    1,
                    (position[2] + endPos[2]) / 2
                ]}
                color="#ffff99"
                intensity={10 * (1 - progressRef.current)}
                distance={8}
            />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 🩸 SKILL 5 – DRAIN (DOT / Sustain)
// ═══════════════════════════════════════════════════════════════════════════
export const DrainEffect: React.FC<{
    position: [number, number, number];
    targetPosition?: [number, number, number];
    onComplete: () => void;
}> = ({ position, targetPosition, onComplete }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 2000;
    const progressRef = useRef(0);
    const orbCount = 6;

    const targetPos = targetPosition || [position[0], position[1], position[2] + 3];

    useFrame(() => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef}>
            {Array.from({ length: orbCount }).map((_, i) => {
                // Hedeften oyuncuya giden orblar
                const t = (Math.sin(progressRef.current * 5 + i) + 1) / 2;
                return (
                    <PixelOrb
                        key={i}
                        position={[
                            targetPos[0] + (position[0] - targetPos[0]) * t,
                            0.5 + Math.sin(progressRef.current * 10 + i) * 0.2,
                            targetPos[2] + (position[2] - targetPos[2]) * t
                        ]}
                        color="#aa0000"
                        opacity={0.9 * (1 - progressRef.current * 0.3)}
                        scale={0.8}
                    />
                );
            })}
            {/* Can emme ışığı */}
            <pointLight position={targetPos as [number, number, number]} color="#aa0000" intensity={2} distance={3} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 🌩️ SKILL 6 – ARCANE STORM (ULTİ)
// ═══════════════════════════════════════════════════════════════════════════
export const ArcaneStormEffect: React.FC<{
    position: [number, number, number];
    onComplete: () => void;
    playerGroupRef?: React.MutableRefObject<THREE.Group | null>;
    followPlayer?: boolean;
}> = ({ position, onComplete, playerGroupRef, followPlayer = false }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 8000;
    const progressRef = useRef(0);
    const orbCount = 40;

    const orbs = useMemo(() => {
        return Array.from({ length: orbCount }).map(() => ({
            angle: Math.random() * Math.PI * 2,
            radius: Math.random() * 3,
            height: Math.random() * 2,
            speed: 0.05 + Math.random() * 0.05,
        }));
    }, [orbCount]);

    useFrame(() => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;

        if (followPlayer && playerGroupRef?.current) {
            groupRef.current.position.copy(playerGroupRef.current.position);
        }

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={position}>
            {orbs.map((orb, i) => {
                const angle = orb.angle + progressRef.current * orb.speed * 50;
                return (
                    <PixelOrb
                        key={i}
                        position={[
                            Math.cos(angle) * orb.radius,
                            orb.height + Math.sin(progressRef.current * 5 + i) * 0.3,
                            Math.sin(angle) * orb.radius
                        ]}
                        color="#cc88ff"
                        opacity={0.9 * (1 - progressRef.current * 0.2)}
                        scale={1}
                    />
                );
            })}

            {/* Merkez glow */}
            <mesh>
                <sphereGeometry args={[0.5, 16, 16]} />
                <meshBasicMaterial
                    color="#cc88ff"
                    transparent
                    opacity={0.5}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>

            <pointLight color="#cc88ff" intensity={5} distance={8} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// ESKI EFEKTLER (backward compatibility aliases)
// ═══════════════════════════════════════════════════════════════════════════

// ArcaneOrbEffect = FireballEffect variant
export const ArcaneOrbEffect: React.FC<{
    position: [number, number, number];
    targetPosition?: [number, number, number];
    onComplete: () => void;
}> = ({ position, targetPosition, onComplete }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 700;
    const progressRef = useRef(0);

    const direction = useMemo(() => {
        if (targetPosition) {
            return new THREE.Vector3(
                targetPosition[0] - position[0],
                0,
                targetPosition[2] - position[2]
            ).normalize();
        }
        return new THREE.Vector3(0, 0, 1);
    }, [position, targetPosition]);

    useFrame(() => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;

        const distance = progress * 15;
        groupRef.current.position.set(
            position[0] + direction.x * distance,
            position[1] + 0.8,
            position[2] + direction.z * distance
        );

        groupRef.current.rotation.y += 0.15;

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={position}>
            <PixelOrb position={[0, 0, 0]} color="#8b5cf6" scale={1.2} />
            <ArcanePixels position={[0, 0, 0]} color="#a855f7" count={12} spread={0.4} progress={progressRef.current} />
            <pointLight color="#8b5cf6" intensity={3} distance={3} />
        </group>
    );
};

// FrostShardEffect = IceBlockEffect variant  
export const FrostShardEffect = IceBlockEffect;

// MagicMissileEffect = ArcaneOrbEffect
export const MagicMissileEffect = ArcaneOrbEffect;

// ═══════════════════════════════════════════════════════════════════════════
// ⏳ ZAMAN BÜKÜLMESİ - 3 dönen halka (HTML'den)
// ═══════════════════════════════════════════════════════════════════════════
export const TimeWarpEffect: React.FC<{
    position: [number, number, number];
    onComplete: () => void;
    playerGroupRef?: React.MutableRefObject<THREE.Group | null>;
    followPlayer?: boolean;
}> = ({ position, onComplete, playerGroupRef, followPlayer = false }) => {
    const groupRef = useRef<THREE.Group>(null);
    const ring1Ref = useRef<THREE.Mesh>(null);
    const ring2Ref = useRef<THREE.Mesh>(null);
    const ring3Ref = useRef<THREE.Mesh>(null);
    const startTime = useRef(Date.now());
    const duration = 3000;
    const progressRef = useRef(0);

    useFrame((state) => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;
        const time = state.clock.elapsedTime;

        // Follow player
        if (followPlayer && playerGroupRef?.current) {
            const playerWorldPos = new THREE.Vector3();
            playerGroupRef.current.getWorldPosition(playerWorldPos);
            groupRef.current.position.copy(playerWorldPos);
        }

        // Dönen halkalar
        if (ring1Ref.current) ring1Ref.current.rotation.z = time * 0.8;
        if (ring2Ref.current) ring2Ref.current.rotation.z = -time * 1.0;
        if (ring3Ref.current) ring3Ref.current.rotation.z = time * 1.2;

        if (progress >= 1) onComplete();
    });

    const RingMesh = ({ innerRadius, outerRadius, refProp }: { innerRadius: number; outerRadius: number; refProp: React.RefObject<THREE.Mesh> }) => (
        <mesh ref={refProp} rotation={[-Math.PI / 2, 0, 0]}>
            <torusGeometry args={[innerRadius, 0.05, 8, 40]} />
            <meshStandardMaterial
                color="#66ccff"
                emissive="#66ccff"
                emissiveIntensity={0.6}
                transparent
                opacity={0.8 * (1 - progressRef.current)}
            />
        </mesh>
    );

    return (
        <group ref={groupRef} position={position}>
            <RingMesh innerRadius={1.0} outerRadius={1.05} refProp={ring1Ref} />
            <RingMesh innerRadius={1.2} outerRadius={1.25} refProp={ring2Ref} />
            <RingMesh innerRadius={1.4} outerRadius={1.45} refProp={ring3Ref} />
            <ArcanePixels position={[0, 0.5, 0]} color="#88aaff" count={20} spread={1.5} progress={progressRef.current} />
            <pointLight color="#66ccff" intensity={4} distance={5} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 🐑 POLİMORF - Genişleyen mor dalga
// ═══════════════════════════════════════════════════════════════════════════
export const PolymorphEffect: React.FC<{
    position: [number, number, number];
    targetPosition?: [number, number, number];
    onComplete: () => void;
}> = ({ position, targetPosition, onComplete }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 800;
    const progressRef = useRef(0);
    const spawnPos = targetPosition || position;

    useFrame(() => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;

        // Genişleyen dalga
        groupRef.current.scale.setScalar(1 + progress * 2);

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={[spawnPos[0], 0.1, spawnPos[2]]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.5, 1.5, 32]} />
                <meshStandardMaterial
                    color="#aa66ff"
                    emissive="#aa66ff"
                    emissiveIntensity={0.7}
                    transparent
                    opacity={0.8 * (1 - progressRef.current)}
                    side={THREE.DoubleSide}
                />
            </mesh>
            <ArcanePixels position={[0, 0.3, 0]} color="#cc88ff" count={15} spread={1} progress={progressRef.current} />
            <pointLight color="#aa66ff" intensity={3} distance={4} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// ⭐ YILDIZ YAĞMURU - Düşen buz konileri
// ═══════════════════════════════════════════════════════════════════════════
export const StarfallEffect: React.FC<{
    position: [number, number, number];
    targetPosition?: [number, number, number];
    onComplete: () => void;
}> = ({ position, targetPosition, onComplete }) => {
    const groupRef = useRef<THREE.Group>(null);
    const iceRefs = useRef<THREE.Mesh[]>([]);
    const startTime = useRef(Date.now());
    const duration = 2500;
    const progressRef = useRef(0);
    const spawnPos = targetPosition || position;

    const iceData = useMemo(() => {
        return Array.from({ length: 25 }).map(() => ({
            x: (Math.random() - 0.5) * 5,
            z: (Math.random() - 0.5) * 4,
            startY: 6 + Math.random() * 4,
            delay: Math.random() * 0.5,
        }));
    }, []);

    useFrame(() => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;

        // Buz konileri düşüyor
        iceRefs.current.forEach((ice, i) => {
            if (!ice) return;
            const iceProgress = Math.max(0, Math.min(1, (progress - iceData[i].delay) / 0.4));
            ice.position.y = iceData[i].startY - iceProgress * iceData[i].startY;
            ice.visible = iceProgress > 0 && ice.position.y > 0.1;
        });

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={spawnPos}>
            {iceData.map((ice, i) => (
                <mesh
                    key={i}
                    ref={(el) => { if (el) iceRefs.current[i] = el; }}
                    position={[ice.x, ice.startY, ice.z]}
                    rotation={[Math.PI, 0, 0]}
                >
                    <coneGeometry args={[0.12, 0.6, 8]} />
                    <meshStandardMaterial
                        color="#aaddff"
                        emissive="#88ccff"
                        emissiveIntensity={0.5}
                    />
                </mesh>
            ))}
            <ArcanePixels position={[0, 1, 0]} color="#88ccff" count={30} spread={3} progress={progressRef.current} />
            <pointLight color="#88ccff" intensity={4} distance={6} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 💥 MANA PATLAMASI - Genişleyen halka
// ═══════════════════════════════════════════════════════════════════════════
export const ManaBlastEffect: React.FC<{
    position: [number, number, number];
    onComplete: () => void;
    playerGroupRef?: React.MutableRefObject<THREE.Group | null>;
    followPlayer?: boolean;
}> = ({ position, onComplete }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 700;
    const progressRef = useRef(0);

    useFrame(() => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;

        // Genişleyen halka
        groupRef.current.scale.setScalar(1 + progress * 3);

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={[position[0], 0.15, position[2]]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.3, 2.8, 64]} />
                <meshStandardMaterial
                    color="#99ccff"
                    emissive="#99ccff"
                    emissiveIntensity={0.8}
                    transparent
                    opacity={0.9 * (1 - progressRef.current)}
                    side={THREE.DoubleSide}
                />
            </mesh>
            <ArcanePixels position={[0, 0.5, 0]} color="#aaddff" count={25} spread={2} progress={progressRef.current} />
            <pointLight color="#99ccff" intensity={6} distance={8} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// ☄️ KIYAMET (ULTI) - Mor gökyüzü + kamera sallama
// ═══════════════════════════════════════════════════════════════════════════
export const ApocalypseEffect: React.FC<{
    position: [number, number, number];
    onComplete: () => void;
    playerGroupRef?: React.MutableRefObject<THREE.Group | null>;
    followPlayer?: boolean;
}> = ({ position, onComplete }) => {
    const groupRef = useRef<THREE.Group>(null);
    const skyRef = useRef<THREE.Mesh>(null);
    const startTime = useRef(Date.now());
    const duration = 4000;
    const progressRef = useRef(0);

    useFrame((state) => {
        if (!groupRef.current || !skyRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        progressRef.current = progress;

        // Gökyüzü pulse
        const skyMat = skyRef.current.material as THREE.MeshStandardMaterial;
        skyMat.opacity = 0.4 * (1 - progress) * (0.8 + Math.sin(elapsed * 0.01) * 0.2);

        // Kamera sarsıntısı (ilk 2 saniye)
        if (progress < 0.5) {
            const shake = (1 - progress * 2) * 0.15;
            state.camera.position.x += Math.sin(elapsed * 0.02) * shake;
            state.camera.position.y += Math.sin(elapsed * 0.015) * shake;
        }

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={position}>
            {/* Mor gökyüzü dome */}
            <mesh ref={skyRef} scale={[-1, 1, 1]}>
                <sphereGeometry args={[15, 32, 32]} />
                <meshStandardMaterial
                    color="#6633ff"
                    emissive="#6633ff"
                    emissiveIntensity={0.5}
                    transparent
                    opacity={0.4}
                    side={THREE.BackSide}
                />
            </mesh>

            {/* Merkez patlama */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
                <ringGeometry args={[0.5, 4, 64]} />
                <meshStandardMaterial
                    color="#aa55ff"
                    emissive="#aa55ff"
                    emissiveIntensity={1}
                    transparent
                    opacity={0.7 * (1 - progressRef.current)}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Düşen meteorlar */}
            {Array.from({ length: 15 }).map((_, i) => {
                const angle = (i / 15) * Math.PI * 2;
                const radius = 2 + Math.random() * 4;
                return (
                    <mesh
                        key={i}
                        position={[
                            Math.cos(angle) * radius,
                            4 - progressRef.current * 5,
                            Math.sin(angle) * radius
                        ]}
                        rotation={[Math.PI, 0, 0]}
                    >
                        <coneGeometry args={[0.2, 0.8, 8]} />
                        <meshStandardMaterial
                            color="#ff6644"
                            emissive="#ff4422"
                            emissiveIntensity={0.8}
                        />
                    </mesh>
                );
            })}

            <ArcanePixels position={[0, 2, 0]} color="#8855ff" count={40} spread={5} progress={progressRef.current} />
            <pointLight position={[0, 3, 0]} color="#6633ff" intensity={10} distance={20} />
            <pointLight position={[0, 0.5, 0]} color="#ff4422" intensity={5} distance={8} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// MAGE SKILL MAP
// ═══════════════════════════════════════════════════════════════════════════
export const MAGE_EFFECTS: Record<string, React.FC<any>> = {
    // ✅ CONSTANTS.TS VISUAL KEYS - GOD MODE FX VERSİYONLARI
    archmage_bolt: ArcaneOrbFXEffect,              // am1 - Arcane Küresi (500 Pixel Particles)
    archmage_impact: ZamanBukumFXEffect,           // am2 - Zaman Bükülmesi (Altın Halkalar)
    archmage_void: PolymorphShaderEffect,          // am3 - Polimorf (Gökkuşağı)
    archmage_meteor: YildizYagmuruGodFXEffect,     // am5 - Yıldız Yağmuru (Cehennem Ateşi)
    archmage_blizzard: ManaBuzGodFXEffect,         // am6 - Mana Patlaması (Buz Sütunları)
    archmage_apocalypse: KiyametGodFXEffect,       // am7 - Kıyamet (20m Girdap)

    // GOD MODE FX efektleri
    arcane_orb_fx: ArcaneOrbFXEffect,
    zaman_bukum_fx: ZamanBukumFXEffect,
    kiyamet_fx: KiyametUltiFXEffect,
    yildiz_yagmuru_god: YildizYagmuruGodFXEffect,
    mana_buz_god: ManaBuzGodFXEffect,
    kiyamet_god: KiyametGodFXEffect,

    // Yeni pixel element efektleri
    fireball_effect: FireballEffect,
    iceblock_effect: IceBlockEffect,
    teleport_effect: TeleportEffect,
    lightning_effect: LightningEffect,
    drain_effect: DrainEffect,
    arcane_storm: ArcaneStormEffect,

    // Shader efektler
    arcane_orb_shader: ArcaneOrbShaderEffect,
    polymorph_shader: PolymorphShaderEffect,
    doom_shader: DoomShaderEffect,
    mana_zap_shader: ManaZapShaderEffect,

    // Eski key'ler (backward compat)
    arcane_orb: ArcaneOrbFXEffect,
    frost_shard: FrostShardEffect,
    magic_missile: MagicMissileEffect,
    time_warp: ZamanBukumFXEffect,
    polymorph: PolymorphShaderEffect,
    starfall: StarfallEffect,
    mana_blast: ManaZapShaderEffect,
    apocalypse: KiyametUltiFXEffect,

    // Components/constants.ts keys
    fireball: FireballEffect,
    iceblock: IceBlockEffect,
    teleport: TeleportEffect,
    lightning: LightningEffect,
    drain: DrainEffect,
    meteor: StarfallEffect,

    // Root constants.ts visual keys
    mage_fireball: FireballEffect,
    mage_ice: IceBlockEffect,
    mage_arcane: ArcaneOrbFXEffect,
    mage_blink: TeleportEffect,
    mage_storm: ArcaneStormEffect,

    // Kısa key'ler
    fire: FireballEffect,
    ice: IceBlockEffect,
    blink: TeleportEffect,
    bolt: LightningEffect,
    arcane: ArcaneOrbFXEffect,
    storm: ArcaneStormEffect,
    missile: ArcaneOrbFXEffect,
    doom: KiyametUltiFXEffect,
    zap: ManaZapShaderEffect,
};

export default MAGE_EFFECTS;
