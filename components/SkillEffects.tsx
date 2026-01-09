import React, { useEffect, useRef, useMemo, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Billboard, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { SKILL_ASSETS, SkillAssetConfig } from './SkillAssetRegistry';
import { soundManager } from './SoundManager';
import { WARRIOR_EFFECTS } from './WarriorEffects';
import { ARCTIC_KNIGHT_EFFECTS } from './ArcticKnightEffects';
import { ARCHER_EFFECTS } from './ArcherEffects';
import { MAGE_EFFECTS } from './MageEffects';
import { BARD_EFFECTS } from './BardEffects';
import { HEALER_EFFECTS } from './HealerEffects';
import { MARTIAL_ARTIST_EFFECTS } from './MartialArtistEffects';
import { REAPER_EFFECTS } from './ReaperEffects';

// --- FALLBACK ASSET (Prevents Crash) ---
const SAFE_MODEL_PATH = '/models/items/weapons/warrior/warrior_sword_shiny.gltf';

// --- VISUAL ENHANCEMENT LOGIC (Reused) ---
const applyVisualEnhancements = (scene: THREE.Object3D, visualType: string, colorOverride?: string) => {
    scene.traverse((child) => {
        if ((child as unknown as THREE.Mesh).isMesh) {
            const m = (child as unknown as THREE.Mesh).material as THREE.MeshStandardMaterial;
            if (m) {
                m.transparent = true;
                m.alphaTest = 0.5;
                m.side = THREE.DoubleSide;
                m.precision = 'lowp';
                m.flatShading = false;

                let targetColor = new THREE.Color(0xffffff);

                if (visualType.includes('arctic') || visualType.includes('frost')) targetColor.set('#00ffff');
                else if (visualType.includes('warrior')) targetColor.set('#ff4500');
                else if (visualType.includes('archer')) targetColor.set('#22c55e');
                else if (visualType.includes('mage')) targetColor.set('#8b5cf6');
                else if (visualType.includes('cleric')) targetColor.set('#fef3c7');

                if (colorOverride) targetColor.set(colorOverride);

                m.emissive = targetColor;
                m.emissiveIntensity = 2.0;
                m.color.lerp(targetColor, 0.5);
            }
        }
    });
};

interface SkillEffectsProps {
    activeSkills: { id: string, visual: string, modelPath?: string, position: [number, number, number], targetPosition?: [number, number, number] }[];
    onEffectComplete: (id: string) => void;
    playerGroupRef?: React.MutableRefObject<THREE.Group | null>;
}

// ═══════════════════════════════════════════════════════════════════════════
// SINGLE SPRITE FRAME COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
const SingleSpriteFrame: React.FC<{
    texturePath: string;
    position: [number, number, number];
    scale: number;
    opacity: number;
}> = ({ texturePath, position, scale, opacity }) => {
    const [texture, setTexture] = useState<THREE.Texture | null>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        const loader = new THREE.TextureLoader();
        loader.load(
            texturePath,
            (loadedTexture) => {
                // Pixel art settings
                loadedTexture.minFilter = THREE.NearestFilter;
                loadedTexture.magFilter = THREE.NearestFilter;
                loadedTexture.colorSpace = THREE.SRGBColorSpace;
                loadedTexture.needsUpdate = true;
                setTexture(loadedTexture);
            },
            undefined,
            (err) => {
                console.error('Failed to load texture:', texturePath, err);
                setError(true);
            }
        );
    }, [texturePath]);

    if (error || !texture) {
        return null; // Don't render if texture failed to load
    }

    return (
        <Billboard position={position} follow={true} lockX={false} lockY={false} lockZ={false}>
            <mesh scale={[scale, scale, 1]} rotation={[0, 0, Math.PI / 2]}>
                <planeGeometry args={[1, 1]} />
                <meshBasicMaterial
                    map={texture}
                    transparent={true}
                    alphaTest={0.1}
                    side={THREE.DoubleSide}
                    depthWrite={false}
                    opacity={opacity}
                />
            </mesh>
        </Billboard>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// SPRITE ANIMATION COMPONENT (PNG Kare Kare Animasyon)
// ═══════════════════════════════════════════════════════════════════════════
const SpriteSkillEffect: React.FC<{
    config: SkillAssetConfig;
    position: [number, number, number];
    onComplete: () => void;
}> = ({ config, position, onComplete }) => {
    const [currentFrame, setCurrentFrame] = useState(1);
    const [opacity, setOpacity] = useState(1);
    const startTimeRef = useRef(Date.now());
    const completedRef = useRef(false);

    const frameCount = config.spriteFrames || 1;
    const fps = config.spriteFps || 12;
    const frameDuration = 1000 / fps;
    const totalDuration = frameDuration * frameCount;

    // Generate texture path for current frame
    const currentTexturePath = `${config.spritePath}${config.spriteBase}${currentFrame}.png`;

    useFrame(() => {
        if (completedRef.current) return;

        const elapsed = Date.now() - startTimeRef.current;
        const newFrame = Math.min(Math.floor(elapsed / frameDuration) + 1, frameCount);

        if (newFrame !== currentFrame && newFrame <= frameCount) {
            setCurrentFrame(newFrame);
        }

        // Fade out at end
        const progress = elapsed / totalDuration;
        if (progress > 0.7) {
            setOpacity(Math.max(0, 1 - ((progress - 0.7) / 0.3)));
        }

        // Effect complete
        if (elapsed > totalDuration && !completedRef.current) {
            completedRef.current = true;
            onComplete();
        }
    });

    if (!config.spritePath || !config.spriteBase) return null;

    const scale = config.scale || 1.5;

    return (
        <React.Suspense fallback={null}>
            <SingleSpriteFrame
                texturePath={currentTexturePath}
                position={position}
                scale={scale}
                opacity={opacity}
            />
        </React.Suspense>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 3D MODEL POOL COMPONENT (GLTF modeller için)
// ═══════════════════════════════════════════════════════════════════════════
const SkillTypePool: React.FC<{
    type: string;
    config: SkillAssetConfig;
    activeRequests: any[];
    onComplete: (id: string) => void;
}> = ({ type, config, activeRequests, onComplete }) => {

    // Sprite animasyonu varsa, sprite component kullan
    if (config.spritePath && config.spriteBase && config.spriteFrames) {
        return (
            <group>
                {activeRequests.map(req => (
                    <SpriteSkillEffect
                        key={req.id}
                        config={config}
                        position={req.position}
                        onComplete={() => onComplete(req.id)}
                    />
                ))}
            </group>
        );
    }

    // 3D Model için eski logic
    const isMissing = config.path.includes('/models/skills');
    const loadPath = isMissing
        ? SAFE_MODEL_PATH
        : (config.extension === 'gltf' && (!config.count || config.count <= 1))
            ? `${config.path}${config.modelBase}.gltf`
            : SAFE_MODEL_PATH;

    const { scene } = useGLTF(loadPath);
    const POOL_SIZE = 6;

    const template = useMemo(() => {
        const t = scene.clone();
        applyVisualEnhancements(t, type, config.color);
        return t;
    }, [scene, type, config.color]);

    const poolRef = useRef<{
        group: THREE.Group;
        active: boolean;
        id: string | null;
        startTime: number;
    }[]>([]);

    const groupRef = useRef<THREE.Group>(null);
    const initialized = useRef(false);

    useEffect(() => {
        if (initialized.current || !groupRef.current) return;

        for (let i = 0; i < POOL_SIZE; i++) {
            const instance = template.clone();
            instance.visible = false;
            groupRef.current.add(instance);

            poolRef.current.push({
                group: instance,
                active: false,
                id: null,
                startTime: 0
            });
        }
        initialized.current = true;
    }, [template]);

    useEffect(() => {
        activeRequests.forEach(req => {
            const existing = poolRef.current.find(p => p.id === req.id);
            if (existing) return;

            const slot = poolRef.current.find(p => !p.active);
            if (slot) {
                slot.active = true;
                slot.id = req.id;
                slot.startTime = Date.now();
                slot.group.visible = true;
                slot.group.position.set(req.position[0], req.position[1], req.position[2]);
                slot.group.scale.setScalar(config.scale || 1);

                if (config.sound) soundManager.playUrl(config.sound);
            }
        });
    }, [activeRequests, config.sound, config.scale]);

    useFrame((state, delta) => {
        const now = Date.now();
        poolRef.current.forEach(slot => {
            if (!slot.active) return;

            const elapsed = now - slot.startTime;
            const duration = (config.duration || 1) * 1000;

            slot.group.rotation.y += delta * 5;
            let s = config.scale || 1;
            if (elapsed < 100) s *= elapsed / 100;
            if (elapsed > duration - 200) s *= (duration - elapsed) / 200;
            slot.group.scale.setScalar(Math.max(0.01, s));

            if (elapsed > duration) {
                slot.active = false;
                slot.group.visible = false;
                if (slot.id) onComplete(slot.id);
                slot.id = null;
            }
        });
    });

    return <group ref={groupRef} />;
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN SKILL EFFECTS COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
export const SkillEffects: React.FC<SkillEffectsProps> = ({ activeSkills, onEffectComplete, playerGroupRef }) => {
    // Oyuncuyu takip eden efektler (hem yeni hem eski key'ler)
    const PLAYER_ATTACHED_EFFECTS = [
        // Warrior
        'warrior_shield', 'warrior_charge', 'shield', 'rage',
        // Arctic Knight
        'ice_armor', 'frost_armor', 'arctic_storm', 'iceblock',
        // Mage
        'teleport', 'time_warp', 'time',
        // Bard
        'march', 'speed', 'anthem', 'speed_song', 'rhythm_flow', 'choir_symphony',
        // Healer
        'blessing', 'buff_aura', 'revive', 'holy_circle', 'holy_shield', 'sanctuary', 'light_rain',
        // Martial Artist
        'focus', 'iron_skin', 'meditation',
        // Reaper
        'soul_trap', 'ghost_form', 'shadow_step', 'death_mark'
    ];

    return (
        <group>
            {/* WARRIOR EFFECTS - Pixel bazlı */}
            {activeSkills
                .filter(s => WARRIOR_EFFECTS[s.visual])
                .map(skill => {
                    const EffectComponent = WARRIOR_EFFECTS[skill.visual];
                    if (!EffectComponent) return null;

                    const isPlayerAttached = PLAYER_ATTACHED_EFFECTS.includes(skill.visual);

                    return (
                        <EffectComponent
                            key={skill.id}
                            position={skill.position}
                            targetPosition={skill.targetPosition}
                            onComplete={() => onEffectComplete(skill.id)}
                            playerGroupRef={isPlayerAttached ? playerGroupRef : undefined}
                            followPlayer={isPlayerAttached}
                        />
                    );
                })}

            {/* ARCTIC KNIGHT EFFECTS - Buz bazlı */}
            {activeSkills
                .filter(s => ARCTIC_KNIGHT_EFFECTS[s.visual])
                .map(skill => {
                    const EffectComponent = ARCTIC_KNIGHT_EFFECTS[skill.visual];
                    if (!EffectComponent) return null;

                    const isPlayerAttached = PLAYER_ATTACHED_EFFECTS.includes(skill.visual);

                    return (
                        <EffectComponent
                            key={skill.id}
                            position={skill.position}
                            targetPosition={skill.targetPosition}
                            onComplete={() => onEffectComplete(skill.id)}
                            playerGroupRef={isPlayerAttached ? playerGroupRef : undefined}
                            followPlayer={isPlayerAttached}
                        />
                    );
                })}

            {/* ARCHER EFFECTS - Yeşil/Altın bazlı */}
            {activeSkills
                .filter(s => ARCHER_EFFECTS[s.visual])
                .map(skill => {
                    const EffectComponent = ARCHER_EFFECTS[skill.visual];
                    if (!EffectComponent) return null;

                    const isPlayerAttached = PLAYER_ATTACHED_EFFECTS.includes(skill.visual);

                    return (
                        <EffectComponent
                            key={skill.id}
                            position={skill.position}
                            targetPosition={skill.targetPosition}
                            onComplete={() => onEffectComplete(skill.id)}
                            playerGroupRef={isPlayerAttached ? playerGroupRef : undefined}
                            followPlayer={isPlayerAttached}
                        />
                    );
                })}

            {/* MAGE EFFECTS - Arcane/Purple bazlı */}
            {activeSkills
                .filter(s => MAGE_EFFECTS[s.visual])
                .map(skill => {
                    const EffectComponent = MAGE_EFFECTS[skill.visual];
                    if (!EffectComponent) return null;

                    const isPlayerAttached = PLAYER_ATTACHED_EFFECTS.includes(skill.visual);

                    return (
                        <EffectComponent
                            key={skill.id}
                            position={skill.position}
                            targetPosition={skill.targetPosition}
                            onComplete={() => onEffectComplete(skill.id)}
                            playerGroupRef={isPlayerAttached ? playerGroupRef : undefined}
                            followPlayer={isPlayerAttached}
                        />
                    );
                })}

            {/* BARD EFFECTS - Müzik/Nota bazlı */}
            {activeSkills
                .filter(s => BARD_EFFECTS[s.visual])
                .map(skill => {
                    const EffectComponent = BARD_EFFECTS[skill.visual];
                    if (!EffectComponent) return null;

                    const isPlayerAttached = PLAYER_ATTACHED_EFFECTS.includes(skill.visual);

                    return (
                        <EffectComponent
                            key={skill.id}
                            position={skill.position}
                            targetPosition={skill.targetPosition}
                            onComplete={() => onEffectComplete(skill.id)}
                            playerGroupRef={isPlayerAttached ? playerGroupRef : undefined}
                            followPlayer={isPlayerAttached}
                        />
                    );
                })}

            {/* HEALER EFFECTS - Kutsal/Işık bazlı */}
            {activeSkills
                .filter(s => HEALER_EFFECTS[s.visual])
                .map(skill => {
                    const EffectComponent = HEALER_EFFECTS[skill.visual];
                    if (!EffectComponent) return null;

                    const isPlayerAttached = PLAYER_ATTACHED_EFFECTS.includes(skill.visual);

                    return (
                        <EffectComponent
                            key={skill.id}
                            position={skill.position}
                            targetPosition={skill.targetPosition}
                            onComplete={() => onEffectComplete(skill.id)}
                            playerGroupRef={isPlayerAttached ? playerGroupRef : undefined}
                            followPlayer={isPlayerAttached}
                        />
                    );
                })}

            {/* MARTIAL ARTIST EFFECTS - Uzak Doğu/Combo bazlı */}
            {activeSkills
                .filter(s => MARTIAL_ARTIST_EFFECTS[s.visual])
                .map(skill => {
                    const EffectComponent = MARTIAL_ARTIST_EFFECTS[skill.visual];
                    if (!EffectComponent) return null;

                    const isPlayerAttached = PLAYER_ATTACHED_EFFECTS.includes(skill.visual);

                    return (
                        <EffectComponent
                            key={skill.id}
                            position={skill.position}
                            targetPosition={skill.targetPosition}
                            onComplete={() => onEffectComplete(skill.id)}
                            playerGroupRef={isPlayerAttached ? playerGroupRef : undefined}
                            followPlayer={isPlayerAttached}
                        />
                    );
                })}

            {/* REAPER EFFECTS - Karanlık/Gölge bazlı */}
            {activeSkills
                .filter(s => REAPER_EFFECTS[s.visual])
                .map(skill => {
                    const EffectComponent = REAPER_EFFECTS[skill.visual];
                    if (!EffectComponent) return null;

                    const isPlayerAttached = PLAYER_ATTACHED_EFFECTS.includes(skill.visual);

                    return (
                        <EffectComponent
                            key={skill.id}
                            position={skill.position}
                            targetPosition={skill.targetPosition}
                            onComplete={() => onEffectComplete(skill.id)}
                            playerGroupRef={isPlayerAttached ? playerGroupRef : undefined}
                            followPlayer={isPlayerAttached}
                        />
                    );
                })}
        </group>
    );
};
