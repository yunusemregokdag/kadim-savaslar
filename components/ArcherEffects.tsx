// ═══════════════════════════════════════════════════════════════════════════
// ARCHER (OKÇU) SKILL EFFECTS - PİXEL SHADER TABANLI
// Pixelated glow efektli oklar
// ═══════════════════════════════════════════════════════════════════════════

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

// ═══════════════════════════════════════════════════════════════════════════
// 🎨 PİXEL SHADER CORE - Tüm oklar için ortak pixelated glow shader
// ═══════════════════════════════════════════════════════════════════════════
const createPixelShaderMaterial = (color1: string, color2: string) => {
    // RGB değerlerini parse et
    const c1 = new THREE.Color(color1);
    const c2 = new THREE.Color(color2);

    return new THREE.ShaderMaterial({
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
        uniforms: {
            time: { value: 0 },
            color1: { value: new THREE.Vector3(c1.r, c1.g, c1.b) },
            color2: { value: new THREE.Vector3(c2.r, c2.g, c2.b) }
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            uniform vec3 color1;
            uniform vec3 color2;
            varying vec2 vUv;

            float pixel(vec2 uv) {
                uv = floor(uv * 32.0) / 32.0;
                return length(uv - 0.5);
            }

            void main() {
                float d = pixel(vUv);
                float glow = smoothstep(0.6, 0.25, d);
                vec3 col = mix(color1, color2, sin(time * 4.0) * 0.5 + 0.5);
                gl_FragColor = vec4(col, glow);
            }
        `
    });
};

// ═══════════════════════════════════════════════════════════════════════════
// 🐉 EJDERHA SHADER - Ulti için özel dragon shader
// ═══════════════════════════════════════════════════════════════════════════
const createDragonShaderMaterial = () => {
    return new THREE.ShaderMaterial({
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
        uniforms: {
            time: { value: 0 }
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            varying vec2 vUv;

            float head(vec2 uv) {
                return smoothstep(0.4, 0.0, length(uv - vec2(0.2, 0.5)));
            }

            float body(vec2 uv) {
                return smoothstep(0.3, 0.05, abs(uv.y - 0.5)) * (1.0 - uv.x);
            }

            void main() {
                float h = head(vUv);
                float b = body(vUv);
                float fire = sin((vUv.x + time) * 12.0) * 0.2;

                vec3 col = vec3(1.0, 0.4, 0.1) + fire;
                gl_FragColor = vec4(col, h + b);
            }
        `
    });
};

// ═══════════════════════════════════════════════════════════════════════════
// 1️⃣ HIZLI ATIŞ (Rapid Shot) - Normal Sarı/Turuncu Ok
// ═══════════════════════════════════════════════════════════════════════════
export const RapidShotEffect: React.FC<{
    position: [number, number, number];
    targetPosition?: [number, number, number];
    onComplete: () => void;
}> = ({ position, targetPosition, onComplete }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const startTime = useRef(Date.now());
    const duration = 600;

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

    const rotationY = Math.atan2(direction.x, direction.z);
    const material = useMemo(() => createPixelShaderMaterial('#ffee66', '#ff9933'), []);

    useFrame(() => {
        if (!meshRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);

        const distance = progress * 40;
        meshRef.current.position.set(
            position[0] + direction.x * distance,
            position[1] + 0.8,
            position[2] + direction.z * distance
        );

        material.uniforms.time.value += 0.1;

        if (progress >= 1) onComplete();
    });

    return (
        <mesh ref={meshRef} rotation={[0, rotationY, 0]} material={material}>
            <planeGeometry args={[1.2, 0.25]} />
        </mesh>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 2️⃣ ÖLÜMCÜL CİRİT (Deadly Javelin) - Elemental Mavi/Mor Ok
// ═══════════════════════════════════════════════════════════════════════════
export const DeadlyJavelinEffect: React.FC<{
    position: [number, number, number];
    targetPosition?: [number, number, number];
    onComplete: () => void;
}> = ({ position, targetPosition, onComplete }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const startTime = useRef(Date.now());
    const duration = 700;

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

    const rotationY = Math.atan2(direction.x, direction.z);
    const material = useMemo(() => createPixelShaderMaterial('#66ccff', '#cc66ff'), []);

    useFrame(() => {
        if (!meshRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);

        const distance = progress * 45;
        meshRef.current.position.set(
            position[0] + direction.x * distance,
            position[1] + 0.8,
            position[2] + direction.z * distance
        );

        material.uniforms.time.value += 0.15;

        if (progress >= 1) onComplete();
    });

    return (
        <mesh ref={meshRef} rotation={[0, rotationY, 0]} material={material}>
            <planeGeometry args={[1.4, 0.3]} />
        </mesh>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 3️⃣ AVCI ODAĞI (Hunter Focus) - Buff Aurası (Oyuncuya Yapışık Döner)
// ═══════════════════════════════════════════════════════════════════════════
export const HunterFocusEffect: React.FC<{
    position: [number, number, number];
    onComplete: () => void;
    playerGroupRef?: React.MutableRefObject<THREE.Group | null>;
    followPlayer?: boolean;
}> = ({ position, onComplete, playerGroupRef, followPlayer = false }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const startTime = useRef(Date.now());
    const duration = 10000; // 10 saniye buff

    const material = useMemo(() => createPixelShaderMaterial('#66ff99', '#339966'), []);

    useFrame(() => {
        if (!meshRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);

        // Oyuncuyu takip et
        if (followPlayer && playerGroupRef?.current) {
            const playerWorldPos = new THREE.Vector3();
            playerGroupRef.current.getWorldPosition(playerWorldPos);
            meshRef.current.position.set(playerWorldPos.x, playerWorldPos.y + 1.2, playerWorldPos.z);
        }

        // Döndür
        meshRef.current.rotation.z += 0.03;
        material.uniforms.time.value += 0.08;

        // Fade out
        if (progress > 0.85) {
            const fade = 1 - (progress - 0.85) / 0.15;
            material.opacity = fade;
        }

        if (progress >= 1) onComplete();
    });

    return (
        <mesh ref={meshRef} position={position} rotation={[-Math.PI / 2, 0, 0]} material={material}>
            <planeGeometry args={[2, 2]} />
        </mesh>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 4️⃣ RÜZGAR KESİĞİ (Wind Slash) - 3 Ok Salvo
// ═══════════════════════════════════════════════════════════════════════════
export const WindSlashEffect: React.FC<{
    position: [number, number, number];
    targetPosition?: [number, number, number];
    onComplete: () => void;
}> = ({ position, targetPosition, onComplete }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 600;

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

    const rotationY = Math.atan2(direction.x, direction.z);

    const materials = useMemo(() => [
        createPixelShaderMaterial('#ffbb66', '#ff6633'),
        createPixelShaderMaterial('#ffbb66', '#ff6633'),
        createPixelShaderMaterial('#ffbb66', '#ff6633'),
    ], []);

    useFrame(() => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);

        const distance = progress * 40;
        groupRef.current.position.set(
            position[0] + direction.x * distance,
            position[1] + 0.8,
            position[2] + direction.z * distance
        );

        materials.forEach(m => m.uniforms.time.value += 0.12);

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} rotation={[0, rotationY, 0]}>
            {[-0.2, 0, 0.2].map((offset, i) => (
                <mesh key={i} position={[offset, 0, 0]} material={materials[i]}>
                    <planeGeometry args={[1.3, 0.25]} />
                </mesh>
            ))}
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 5️⃣ GERİ ADIM (Backstep) - Geri İtici Ok/Dalga
// ═══════════════════════════════════════════════════════════════════════════
export const BackstepEffect: React.FC<{
    position: [number, number, number];
    targetPosition?: [number, number, number];
    onComplete: () => void;
}> = ({ position, targetPosition, onComplete }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const startTime = useRef(Date.now());
    const duration = 500;

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

    const rotationY = Math.atan2(direction.x, direction.z);
    const material = useMemo(() => createPixelShaderMaterial('#ff6666', '#ff9933'), []);

    useFrame(() => {
        if (!meshRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);

        const distance = progress * 35;
        meshRef.current.position.set(
            position[0] + direction.x * distance,
            position[1] + 0.8,
            position[2] + direction.z * distance
        );

        // Genişleyen dalga
        meshRef.current.scale.x = 1 + progress * 0.5;
        material.uniforms.time.value += 0.1;

        if (progress >= 1) onComplete();
    });

    return (
        <mesh ref={meshRef} rotation={[0, rotationY, 0]} material={material}>
            <planeGeometry args={[2.5, 0.6]} />
        </mesh>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 6️⃣ EJDER OKU (Dragon Arrow) - Dev Ejderha Oku (ULTİ) 🔥🐉
// ═══════════════════════════════════════════════════════════════════════════
export const DragonArrowEffect: React.FC<{
    position: [number, number, number];
    targetPosition?: [number, number, number];
    onComplete: () => void;
}> = ({ position, targetPosition, onComplete }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const startTime = useRef(Date.now());
    const duration = 1500; // Ulti daha uzun

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

    const rotationY = Math.atan2(direction.x, direction.z);
    const material = useMemo(() => createDragonShaderMaterial(), []);

    useFrame((state) => {
        if (!meshRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);

        const distance = progress * 60;
        meshRef.current.position.set(
            position[0] + direction.x * distance,
            position[1] + 0.8,
            position[2] + direction.z * distance
        );

        // Sallanma efekti
        meshRef.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 6) * 0.1;
        material.uniforms.time.value += 0.08;

        if (progress >= 1) onComplete();
    });

    return (
        <mesh ref={meshRef} rotation={[0, rotationY, 0]} material={material}>
            <planeGeometry args={[4, 2]} />
        </mesh>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// MULTISHOT EFEKTİ - 5 Ok Yayılarak
// ═══════════════════════════════════════════════════════════════════════════
export const MultishotEffect: React.FC<{
    position: [number, number, number];
    targetPosition?: [number, number, number];
    onComplete: () => void;
}> = ({ position, targetPosition, onComplete }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 600;

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

    const rotationY = Math.atan2(direction.x, direction.z);

    const materials = useMemo(() =>
        Array.from({ length: 5 }).map(() => createPixelShaderMaterial('#88ff88', '#44cc44'))
        , []);

    useFrame(() => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);

        const distance = progress * 40;
        groupRef.current.position.set(
            position[0] + direction.x * distance,
            position[1] + 0.8,
            position[2] + direction.z * distance
        );

        materials.forEach(m => m.uniforms.time.value += 0.1);

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} rotation={[0, rotationY, 0]}>
            {[-0.4, -0.2, 0, 0.2, 0.4].map((offset, i) => (
                <mesh key={i} position={[offset * (1 + groupRef.current ? 0.5 : 0), 0, 0]} material={materials[i]}>
                    <planeGeometry args={[1.0, 0.2]} />
                </mesh>
            ))}
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// STEALTH EFEKTİ - Gizlenme
// ═══════════════════════════════════════════════════════════════════════════
export const StealthEffect: React.FC<{
    position: [number, number, number];
    onComplete: () => void;
    playerGroupRef?: React.MutableRefObject<THREE.Group | null>;
    followPlayer?: boolean;
}> = ({ position, onComplete, playerGroupRef, followPlayer = false }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const startTime = useRef(Date.now());
    const duration = 5000;

    const material = useMemo(() => createPixelShaderMaterial('#666666', '#333333'), []);

    useFrame(() => {
        if (!meshRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);

        if (followPlayer && playerGroupRef?.current) {
            const playerWorldPos = new THREE.Vector3();
            playerGroupRef.current.getWorldPosition(playerWorldPos);
            meshRef.current.position.set(playerWorldPos.x, playerWorldPos.y + 0.1, playerWorldPos.z);
        }

        meshRef.current.rotation.z += 0.02;
        material.uniforms.time.value += 0.05;

        if (progress >= 1) onComplete();
    });

    return (
        <mesh ref={meshRef} position={position} rotation={[-Math.PI / 2, 0, 0]} material={material}>
            <planeGeometry args={[1.5, 1.5]} />
        </mesh>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// TRAP EFEKTİ - Tuzak
// ═══════════════════════════════════════════════════════════════════════════
export const TrapEffect: React.FC<{
    position: [number, number, number];
    targetPosition?: [number, number, number];
    onComplete: () => void;
}> = ({ position, targetPosition, onComplete }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const startTime = useRef(Date.now());
    const duration = 3000;

    const spawnPos = targetPosition || position;
    const material = useMemo(() => createPixelShaderMaterial('#ff4444', '#cc2222'), []);

    useFrame((state) => {
        if (!meshRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);

        // Pulse
        const pulse = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.1;
        meshRef.current.scale.setScalar(pulse);

        meshRef.current.rotation.z += 0.02;
        material.uniforms.time.value += 0.08;

        if (progress >= 1) onComplete();
    });

    return (
        <mesh ref={meshRef} position={[spawnPos[0], 0.1, spawnPos[2]]} rotation={[-Math.PI / 2, 0, 0]} material={material}>
            <planeGeometry args={[1.5, 1.5]} />
        </mesh>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// ARROW RAIN EFEKTİ - Ok Yağmuru
// ═══════════════════════════════════════════════════════════════════════════
export const ArrowRainEffect: React.FC<{
    position: [number, number, number];
    targetPosition?: [number, number, number];
    onComplete: () => void;
}> = ({ position, targetPosition, onComplete }) => {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 2000;

    const spawnPos = targetPosition || position;

    const arrows = useMemo(() => {
        return Array.from({ length: 20 }).map(() => ({
            x: (Math.random() - 0.5) * 4,
            z: (Math.random() - 0.5) * 4,
            delay: Math.random() * 0.5,
            material: createPixelShaderMaterial('#ffff88', '#ffaa44'),
        }));
    }, []);

    useFrame(() => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);

        arrows.forEach(arrow => {
            arrow.material.uniforms.time.value += 0.1;
        });

        if (progress >= 1) onComplete();
    });

    return (
        <group ref={groupRef} position={spawnPos}>
            {arrows.map((arrow, i) => {
                const elapsed = (Date.now() - startTime.current) / duration;
                const arrowProgress = Math.max(0, Math.min(1, (elapsed - arrow.delay) / 0.5));
                const y = 5 - arrowProgress * 5;

                return (
                    <mesh
                        key={i}
                        position={[arrow.x, Math.max(0.1, y), arrow.z]}
                        rotation={[Math.PI / 2, 0, 0]}
                        material={arrow.material}
                        visible={arrowProgress > 0 && y > 0}
                    >
                        <planeGeometry args={[0.15, 0.8]} />
                    </mesh>
                );
            })}
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// ARCHER SKILL MAP
// ═══════════════════════════════════════════════════════════════════════════
export const ARCHER_EFFECTS: Record<string, React.FC<any>> = {
    // ✅ CONSTANTS.TS VISUAL KEYS (GERÇEK KEY'LER)
    archer_shot: RapidShotEffect,
    javelin: DeadlyJavelinEffect,
    hunters_focus: HunterFocusEffect,
    archer_volley: MultishotEffect,
    backstep: BackstepEffect,
    dragon_arrow: DragonArrowEffect,

    // Yeni style keys
    arrow_shot: RapidShotEffect,
    focus: HunterFocusEffect,
    wind_slash: WindSlashEffect,

    // Yeni efektler
    multishot_effect: MultishotEffect,
    stealth_effect: StealthEffect,
    trap_effect: TrapEffect,
    arrow_rain_effect: ArrowRainEffect,

    // Components/constants.ts keys
    arrow: RapidShotEffect,
    multishot: MultishotEffect,
    stealth: StealthEffect,
    trap: TrapEffect,
    dash_back: BackstepEffect,
    poison_arrow: DeadlyJavelinEffect,
    arrow_rain: ArrowRainEffect,

    // Ek alias'lar
    rapid_shot: RapidShotEffect,
    deadly_javelin: DeadlyJavelinEffect,
    hunter_focus: HunterFocusEffect,
    wind_razor: WindSlashEffect,
};

export default ARCHER_EFFECTS;
