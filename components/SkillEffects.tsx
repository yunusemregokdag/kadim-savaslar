
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { MinecraftModelLoader } from '../utils/MinecraftModelLoader';
import { SKILL_ASSETS, SkillAssetConfig } from './SkillAssetRegistry';
import { soundManager } from './SoundManager';

interface SkillEffectsProps {
    activeSkills: { id: string, visual: string, modelPath?: string, position: [number, number, number], targetPosition?: [number, number, number] }[];
    onEffectComplete: (id: string) => void;
}

interface LoadedModelProps {
    path: string;
    position: [number, number, number];
    targetPosition?: [number, number, number];
    onComplete: () => void;
    visualType: string;
    sound?: string;
    scale?: number;
}

const applyVisualEnhancements = (scene: THREE.Object3D, visualType: string, colorOverride?: string) => {
    scene.traverse((child) => {
        if ((child as unknown as THREE.Mesh).isMesh) {
            const m = (child as unknown as THREE.Mesh).material as THREE.MeshStandardMaterial;
            if (m) {
                m.transparent = true;
                m.alphaTest = 0.5; // FIX: Renders transparent pixels correctly (removes white box)
                m.side = THREE.DoubleSide; // Render both sides

                if (visualType.includes('arctic') || visualType.includes('frost') || visualType.includes('ice') || colorOverride === '#38bdf8') {
                    const iceColor = new THREE.Color('#00ffff'); // Cyan/Ice Blue
                    m.emissive = iceColor;
                    m.emissiveIntensity = 2.0; // Reduce bloom slightly
                    m.color.lerp(iceColor, 0.5); // Tint texture slightly blue
                } else if (colorOverride) {
                    const c = new THREE.Color(colorOverride);
                    m.emissive = c;
                    m.color.lerp(c, 0.3);
                    m.emissiveIntensity = 2.0;
                } else {
                    if (m.map) {
                        m.emissive = new THREE.Color(0xffffff);
                        m.emissiveMap = m.map;
                        m.emissiveIntensity = 2.0;
                    } else {
                        m.emissive = m.color;
                        m.emissiveIntensity = 4.0;
                    }
                }
                m.toneMapped = false;
            }
        }
    });
};

// --- PROCEDURAL HELPERS ---
const ProceduralTimer: React.FC<{ duration: number, onComplete: () => void }> = ({ duration, onComplete }) => {
    const startTime = useRef(Date.now());
    useFrame(() => {
        if (Date.now() - startTime.current > duration) {
            onComplete();
        }
    });
    return null;
};

const ProceduralSpin: React.FC<{ axis: 'x' | 'y' | 'z', speed: number }> = ({ axis, speed }) => {
    const ref = useRef<THREE.Group>(null);
    useFrame((state, delta) => {
        if (ref.current && ref.current.parent) {
            ref.current.parent.rotation[axis] += delta * speed;
        }
    });
    return <group ref={ref} />;
};

const ProceduralMoveTo: React.FC<{ target: [number, number, number], speed: number }> = ({ target, speed }) => {
    const ref = useRef<THREE.Group>(null);
    useFrame((state, delta) => {
        if (ref.current && ref.current.parent) {
            ref.current.parent.position.lerp(new THREE.Vector3(...target), speed);
        }
    });
    return <group ref={ref} />;
};

const ProceduralScale: React.FC<{ encodedSpeed: number, maxScale: number }> = ({ encodedSpeed, maxScale }) => {
    const ref = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    useFrame((state, delta) => {
        if (ref.current && ref.current.parent) {
            const elapsed = Date.now() - startTime.current;
            const s = 1 + elapsed * encodedSpeed; // approximate expansion
            if (s < maxScale) ref.current.parent.scale.setScalar(s);
        }
    });
    return <group ref={ref} />;
};

const GltfModelEffect: React.FC<LoadedModelProps> = ({ path, position, targetPosition, onComplete, visualType, sound, scale = 1 }) => {
    const { scene } = useGLTF(path);

    useEffect(() => {
        if (sound) soundManager.playUrl(sound);
    }, [sound]);

    const clonedScene = useMemo(() => {
        const s = scene.clone();
        applyVisualEnhancements(s, visualType);
        return s;
    }, [scene, visualType]);

    const ref = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 2000;

    useFrame((state, delta) => {
        if (!ref.current) return;
        const elapsed = Date.now() - startTime.current;
        const baseScale = scale; // Use passed scale

        if (visualType.includes('projectile') && targetPosition) {
            const t = Math.min(1, elapsed / 500);
            ref.current.position.lerp(new THREE.Vector3(...targetPosition), t * 0.1);
        } else if (visualType.includes('aoe') || visualType.includes('shield') || visualType === 'arctic_storm') {
            ref.current.rotation.y += delta * 2;
            const s = 1 + Math.sin(elapsed * 0.005) * 0.1;
            ref.current.scale.set(s * baseScale, s * baseScale, s * baseScale);
        } else {
            const s = 1 + elapsed * 0.001;
            ref.current.scale.setScalar(s * baseScale);
            if (elapsed < 200) ref.current.position.y += delta * 2;
        }

        if (elapsed > duration - 500) {
            const fade = (duration - elapsed) / 500;
            const currentS = ref.current.scale.x / baseScale; // preserve animation scale relative to base
            ref.current.scale.setScalar(fade * baseScale);
        }

        if (elapsed > duration) {
            onComplete();
        }
    });

    const isIce = visualType.includes('arctic') || visualType.includes('frost') || visualType.includes('ice');

    // DEBUG: Lift shield up slightly
    const yOffset = visualType === 'arctic_storm' ? 1.0 : 0;

    // DEBUG: Log mount for arctic_storm
    useEffect(() => {
        if (visualType === 'arctic_storm') {
            console.log(`[GltfModelEffect] Mounting arctic_storm. Path: ${path}, Scale: ${scale}`);
        }
    }, [visualType, path, scale]);

    return (
        <group position={[position[0], position[1] + yOffset, position[2]]} ref={ref}>
            {/* FALLBACK: Procedural Ice Shield for 'arctic_storm' if GLTF fails (which it did) */}
            <primitive object={clonedScene} traverse={(obj: any) => {
                if (obj.isMesh) {
                    obj.material.transparent = true;
                    obj.material.side = THREE.DoubleSide;

                    // Fix for Arctic Storm / Shield Transparency
                    if (visualType === 'arctic_storm' || isIce) {
                        obj.material.depthWrite = false; // Important for transparency sorting
                        obj.material.alphaTest = 0.01;
                        obj.material.opacity = visualType === 'arctic_storm' ? 0.6 : 0.8;

                        // Increase brightness for ice effect
                        obj.material.emissive = new THREE.Color(0x00ffff);
                        obj.material.emissiveIntensity = 2.0;

                        if (obj.material.color) obj.material.color.set(0xa5f3fc);
                    }
                }
            }} />
            <Sparkles count={isIce ? 40 : 20} scale={3 * scale} size={isIce ? 6 : 4} speed={0.4} opacity={0.8} color={isIce ? "#a5f3fc" : "#bdbfff"} />
            <pointLight distance={8} intensity={8} color={isIce ? "#00ffff" : "#ffffff"} />
        </group>
    );
};

const JsonModelEffect: React.FC<LoadedModelProps> = ({ path, position, targetPosition, onComplete, visualType, sound, scale = 1 }) => {
    const [scene, setScene] = useState<THREE.Group | null>(null);
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 2000;

    useEffect(() => {
        if (sound) soundManager.playUrl(sound);
    }, [sound]);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            try {
                const loadedGroup = await MinecraftModelLoader.load(path);
                if (mounted && loadedGroup) {
                    applyVisualEnhancements(loadedGroup as any, visualType);
                    setScene(loadedGroup as any);
                }
            } catch (err) {
                console.error("Failed to load JSON effect:", path, err);
            }
        };
        load();
        return () => { mounted = false; };
    }, [path, visualType]);

    useFrame((state, delta) => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;
        const baseScale = scale;

        if (visualType.includes('projectile') && targetPosition) {
            const t = Math.min(1, elapsed / 500);
            groupRef.current.position.lerp(new THREE.Vector3(...targetPosition), t * 0.1);
        } else if (visualType.includes('aoe') || visualType.includes('shield')) {
            groupRef.current.rotation.y += delta * 2;
            const s = 1 + Math.sin(elapsed * 0.005) * 0.1;
            groupRef.current.scale.set(s * baseScale, s * baseScale, s * baseScale);
        } else {
            const s = 1 + elapsed * 0.001;
            groupRef.current.scale.setScalar(s * baseScale);
            if (elapsed < 200) groupRef.current.position.y += delta * 2;
        }

        if (elapsed > duration - 500) {
            const fade = (duration - elapsed) / 500;
            groupRef.current.scale.setScalar(fade * baseScale);
        }

        if (elapsed > duration) {
            onComplete();
        }
    });

    const isIce = visualType.includes('arctic') || visualType.includes('frost') || visualType.includes('ice');
    if (!scene) return null;

    return (
        <group position={position} ref={groupRef}>
            <primitive object={scene} />
            <Sparkles count={isIce ? 40 : 20} scale={3 * scale} size={isIce ? 6 : 4} speed={0.4} opacity={0.8} color={isIce ? "#a5f3fc" : "#bdbffff"} />
            <pointLight distance={8} intensity={8} color={isIce ? "#00ffff" : "#ffffff"} />
        </group>
    );
};

const AnimatedGltfEffect: React.FC<{
    config: SkillAssetConfig;
    position: [number, number, number];
    targetPosition?: [number, number, number];
    onComplete: () => void;
    visualType: string;
}> = ({ config, position, targetPosition, onComplete, visualType }) => {

    useEffect(() => {
        if (config.sound) soundManager.playUrl(config.sound);
    }, [config.sound]);

    // Generate URLs based on startIndex and count
    const urls = useMemo(() => {
        const start = config.startIndex ?? 1;
        return Array.from({ length: config.count }).map((_, i) => `${config.path}${config.modelBase}_${start + i}.gltf`);
    }, [config]);

    // Load all GLTFs
    const gltfs = useGLTF(urls) as unknown as any[];

    // Process Frames
    const frames = useMemo(() => {
        const list = Array.isArray(gltfs) ? gltfs : [gltfs];
        return list.map((gltf: any) => {
            const s = gltf.scene.clone();
            applyVisualEnhancements(s, visualType, config.color);
            if (config.scale) s.scale.set(config.scale, config.scale, config.scale);
            return s;
        });
    }, [gltfs, visualType, config.color, config.scale]);

    const [currentFrame, setCurrentFrame] = useState(0);
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const totalDuration = (config.duration || 0.8) * 1000;
    const frameInterval = totalDuration / Math.max(1, config.count);

    useFrame(() => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;

        // Frame Logic
        const frameIndex = Math.min(frames.length - 1, Math.floor(elapsed / frameInterval));
        setCurrentFrame(frameIndex);

        // Movement Logic
        if (visualType.includes('projectile') && targetPosition) {
            const t = Math.min(1, elapsed / 500);
            groupRef.current.position.lerp(new THREE.Vector3(...targetPosition), t * 0.1);
        }

        if (elapsed > totalDuration + 200) {
            onComplete();
        }
    });

    if (frames.length === 0) return null;

    return (
        <group position={position} ref={groupRef}>
            <primitive object={frames[currentFrame]} />
            <pointLight distance={5} intensity={5} color={config.color || "#ffffff"} />
        </group>
    );
};

const AnimatedJsonEffect: React.FC<{
    config: SkillAssetConfig;
    position: [number, number, number];
    targetPosition?: [number, number, number];
    onComplete: () => void;
    visualType: string;
}> = ({ config, position, targetPosition, onComplete, visualType }) => {
    const [frames, setFrames] = useState<THREE.Group[]>([]);
    const [currentFrame, setCurrentFrame] = useState(0);
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());

    useEffect(() => {
        if (config.sound) soundManager.playUrl(config.sound);
    }, [config.sound]);

    const totalDuration = (config.duration || 0.8) * 1000;
    const frameInterval = totalDuration / Math.max(1, config.count);

    useEffect(() => {
        let mounted = true;
        const loadFrames = async () => {
            const promises = [];
            const start = config.startIndex ?? 1;
            for (let i = 0; i < config.count; i++) {
                const url = `${config.path}${config.modelBase}_${start + i}.json`;
                promises.push(MinecraftModelLoader.load(url));
            }

            try {
                const results = await Promise.all(promises);
                if (mounted) {
                    results.forEach(group => {
                        if (group) {
                            applyVisualEnhancements(group as any, visualType, config.color);
                            if (config.scale) {
                                group.scale.set(config.scale, config.scale, config.scale);
                            }
                        }
                    });
                    setFrames(results as any[]);
                }
            } catch (err) {
                console.error("Failed to load animated frames:", err);
            }
        };
        loadFrames();
        return () => { mounted = false; };
    }, [config, visualType]);

    useFrame(() => {
        if (!groupRef.current) return;
        const elapsed = Date.now() - startTime.current;

        if (frames.length > 0) {
            const frameIndex = Math.min(frames.length - 1, Math.floor(elapsed / frameInterval));
            setCurrentFrame(frameIndex);
        }

        if (visualType.includes('projectile') && targetPosition) {
            const t = Math.min(1, elapsed / 500);
            groupRef.current.position.lerp(new THREE.Vector3(...targetPosition), t * 0.1);
        }

        if (elapsed > totalDuration + 200) {
            onComplete();
        }
    });

    if (frames.length === 0) return null;

    return (
        <group position={position} ref={groupRef}>
            {frames.map((frame, i) => (
                <primitive key={i} object={frame} visible={currentFrame === i} />
            ))}
            <pointLight distance={5} intensity={5} color={config.color || "#ffffff"} />
        </group>
    );
};

export const SkillEffects: React.FC<SkillEffectsProps> = ({ activeSkills, onEffectComplete }) => {
    return (
        <group>
            {activeSkills.map(skill => {
                const assetConfig = SKILL_ASSETS[skill.visual];






                // 1. ANIMATED EFFECT (Sequence)
                if (assetConfig && assetConfig.count > 1) {
                    const commonAnimProps = {
                        key: skill.id,
                        config: assetConfig,
                        position: skill.position,
                        targetPosition: skill.targetPosition,
                        onComplete: () => onEffectComplete(skill.id),
                        visualType: skill.visual,
                    };

                    if (assetConfig.extension === 'gltf') {
                        return <AnimatedGltfEffect {...commonAnimProps} />;
                    } else {
                        return <AnimatedJsonEffect {...commonAnimProps} />;
                    }
                }

                // 2. SINGLE EFFECT
                // Determine Path and Extension
                let effectivePath = skill.modelPath;
                let isJson = false;

                if (effectivePath) {
                    isJson = effectivePath.endsWith('.json');
                } else if (assetConfig) {
                    // Fallback to registry single file
                    effectivePath = assetConfig.path + assetConfig.modelBase + '.' + assetConfig.extension;
                    isJson = assetConfig.extension === 'json';
                }

                if (!effectivePath) return null;

                const commonProps = {
                    key: skill.id,
                    path: effectivePath,
                    position: skill.position,
                    targetPosition: skill.targetPosition,
                    onComplete: () => onEffectComplete(skill.id),
                    visualType: skill.visual,
                    sound: assetConfig?.sound,
                    scale: assetConfig?.scale || 1, // Pass scale
                };

                return isJson ? (
                    <JsonModelEffect {...commonProps} />
                ) : (
                    <GltfModelEffect {...commonProps} />
                );
            })}
        </group>
    );
};
