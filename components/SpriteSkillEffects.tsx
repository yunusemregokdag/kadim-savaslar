// ═══════════════════════════════════════════════════════════════════════════
// 2D SPRITE SKILL EFFECT SYSTEM
// PNG frame sequences played as sprite animations in 3D space
// ═══════════════════════════════════════════════════════════════════════════

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture, Billboard } from '@react-three/drei';
import * as THREE from 'three';

// --- SPRITE ANIMATION CONFIG ---
export interface SpriteSkillConfig {
    basePath: string;          // e.g. '/assets/skills/warrior_texture/'
    prefix: string;            // e.g. 'warrior_slash'
    frameCount: number;        // e.g. 7 (for warrior_slash1.png to warrior_slash7.png)
    startIndex?: number;       // Default 1
    fps?: number;              // Frames per second, default 12
    scale?: number;            // Billboard scale, default 2
    loop?: boolean;            // Loop animation, default false
    color?: string;            // Tint color
    variants?: string[];       // e.g. ['', '_2'] for alternate versions
}

// --- ALL SPRITE SKILL DEFINITIONS ---
export const SPRITE_SKILLS: Record<string, SpriteSkillConfig> = {
    // ═══════════════════════ WARRIOR ═══════════════════════
    warrior_slash: {
        basePath: '/assets/skills/warrior_texture/',
        prefix: 'warrior_slash',
        frameCount: 7,
        fps: 15,
        scale: 2.5,
        color: '#ff6b35'
    },
    warrior_thrust: {
        basePath: '/assets/skills/warrior_texture/',
        prefix: 'warrior_thrust',
        frameCount: 6,
        fps: 14,
        scale: 2,
        color: '#ff4500'
    },
    warrior_whirlwind: {
        basePath: '/assets/skills/warrior_texture/',
        prefix: 'whirlwind',
        frameCount: 5,
        fps: 18,
        scale: 3,
        color: '#dc2626'
    },
    warrior_charge: {
        basePath: '/assets/skills/warrior_texture/',
        prefix: 'charge',
        frameCount: 5,
        fps: 12,
        scale: 2,
        color: '#f59e0b'
    },
    warrior_shield: {
        basePath: '/assets/skills/warrior_texture/',
        prefix: 'shield_barrier',
        frameCount: 3,
        startIndex: 1,
        fps: 8,
        scale: 2.5,
        color: '#3b82f6',
        loop: true
    },

    // ═══════════════════════ ARCHER ═══════════════════════
    archer_backstep: {
        basePath: '/assets/skills/archer_texture/',
        prefix: 'backstep',
        frameCount: 5,
        fps: 14,
        scale: 2,
        color: '#22c55e'
    },
    archer_dragon_spirit: {
        basePath: '/assets/skills/archer_texture/',
        prefix: 'dragon_spirit_',
        frameCount: 4,
        fps: 10,
        scale: 3,
        color: '#10b981'
    },
    archer_quick_shot: {
        basePath: '/assets/skills/archer_texture/',
        prefix: 'quick_shot',
        frameCount: 1,
        fps: 1,
        scale: 1.5,
        color: '#a3e635'
    },

    // ═══════════════════════ ARCHMAGE ═══════════════════════
    archmage_arcane_slash: {
        basePath: '/assets/skills/archmage_texture/',
        prefix: 'arcane_slash_',
        frameCount: 7,
        fps: 15,
        scale: 2.5,
        color: '#8b5cf6'
    },
    archmage_arcane_impact: {
        basePath: '/assets/skills/archmage_texture/',
        prefix: 'arcane_impact_',
        frameCount: 7,
        fps: 14,
        scale: 2,
        color: '#a78bfa'
    },
    archmage_arcane_thunder: {
        basePath: '/assets/skills/archmage_texture/',
        prefix: 'arcane_thunder_',
        frameCount: 9,
        fps: 16,
        scale: 3.5,
        color: '#c4b5fd'
    },
    archmage_blizzard: {
        basePath: '/assets/skills/archmage_texture/',
        prefix: 'blizzard_impact_',
        frameCount: 7,
        fps: 12,
        scale: 3,
        color: '#67e8f9'
    },
    archmage_meteor: {
        basePath: '/assets/skills/archmage_texture/',
        prefix: 'meteor_storm_explosion_',
        frameCount: 6,
        fps: 10,
        scale: 4,
        color: '#f97316'
    },
    archmage_void: {
        basePath: '/assets/skills/archmage_texture/',
        prefix: 'void_rupture_',
        frameCount: 6,
        fps: 12,
        scale: 2.5,
        color: '#7c3aed'
    },

    // ═══════════════════════ ARCTIC KNIGHT ═══════════════════════
    arctic_lance: {
        basePath: '/assets/skills/arctic_knight_texture/',
        prefix: 'frigid_lance',
        frameCount: 1,
        fps: 1,
        scale: 2.5,
        color: '#38bdf8'
    },

    // ═══════════════════════ BARD ═══════════════════════
    bard_clef: {
        basePath: '/assets/skills/bard_texture/',
        prefix: 'clef_',
        frameCount: 13,
        fps: 14,
        scale: 2,
        color: '#ec4899'
    },
    bard_vibration: {
        basePath: '/assets/skills/bard_texture/',
        prefix: 'vibration_',
        frameCount: 6,
        fps: 12,
        scale: 2.5,
        color: '#f472b6'
    },
    bard_symphony: {
        basePath: '/assets/skills/bard_texture/',
        prefix: 'symphony_explosion_',
        frameCount: 9,
        fps: 15,
        scale: 3.5,
        color: '#db2777'
    },

    // ═══════════════════════ CLERIC ═══════════════════════
    cleric_divine_immolation: {
        basePath: '/assets/skills/cleric_texture/',
        prefix: 'divine_immolation_',
        frameCount: 6,
        fps: 12,
        scale: 3,
        color: '#fcd34d'
    },
    cleric_divine_impact: {
        basePath: '/assets/skills/cleric_texture/',
        prefix: 'divine_impact_',
        frameCount: 8,
        fps: 14,
        scale: 2.5,
        color: '#fef08a'
    },
    cleric_luminous_wave: {
        basePath: '/assets/skills/cleric_texture/',
        prefix: 'luminous_wave_',
        frameCount: 9,
        fps: 12,
        scale: 4,
        color: '#fffbeb'
    },
    cleric_tear: {
        basePath: '/assets/skills/cleric_texture/',
        prefix: 'tear_impact_',
        frameCount: 8,
        fps: 14,
        scale: 2,
        color: '#bfdbfe'
    },

    // ═══════════════════════ MARTIAL ARTIST ═══════════════════════
    martial_strike: {
        basePath: '/assets/skills/martial_artist_texture/',
        prefix: 'strike_',
        frameCount: 6,
        fps: 18,
        scale: 2,
        color: '#ef4444'
    },
    martial_strike_slash: {
        basePath: '/assets/skills/martial_artist_texture/',
        prefix: 'strike_slash_',
        frameCount: 6,
        fps: 16,
        scale: 2.5,
        color: '#dc2626'
    },
    martial_blue_strike: {
        basePath: '/assets/skills/martial_artist_texture/',
        prefix: 'blue_strike_',
        frameCount: 6,
        fps: 16,
        scale: 2.5,
        color: '#3b82f6'
    },
    martial_blue_slash: {
        basePath: '/assets/skills/martial_artist_texture/',
        prefix: 'blue_strike_slash_',
        frameCount: 6,
        fps: 16,
        scale: 2.5,
        color: '#60a5fa'
    },
    martial_agile: {
        basePath: '/assets/skills/martial_artist_texture/',
        prefix: 'agile_strike_',
        frameCount: 4,
        fps: 14,
        scale: 2,
        color: '#f97316'
    },
    martial_impact: {
        basePath: '/assets/skills/martial_artist_texture/',
        prefix: 'impact_',
        frameCount: 6,
        fps: 14,
        scale: 3,
        color: '#fbbf24'
    },
    martial_deadly_squash: {
        basePath: '/assets/skills/martial_artist_texture/',
        prefix: 'deadly_squash',
        frameCount: 4,
        fps: 10,
        scale: 3.5,
        color: '#b91c1c'
    },
    martial_diving: {
        basePath: '/assets/skills/martial_artist_texture/',
        prefix: 'diving_strike_rupture_',
        frameCount: 6,
        fps: 12,
        scale: 3,
        color: '#991b1b'
    },

    // ═══════════════════════ REAPER ═══════════════════════
    reaper_soul_slice: {
        basePath: '/assets/skills/reaper_texture/',
        prefix: 'soul_slice_',
        frameCount: 8,
        fps: 16,
        scale: 2.5,
        color: '#a855f7'
    },
    reaper_soul_wave: {
        basePath: '/assets/skills/reaper_texture/',
        prefix: 'soul_wave_',
        frameCount: 7,
        fps: 14,
        scale: 3,
        color: '#c084fc'
    },
};

// --- GENERATE FRAME PATHS ---
function getFramePaths(config: SpriteSkillConfig): string[] {
    const paths: string[] = [];
    const start = config.startIndex ?? 1;

    for (let i = start; i < start + config.frameCount; i++) {
        paths.push(`${config.basePath}${config.prefix}${i}.png`);
    }

    return paths;
}

// --- SINGLE SPRITE EFFECT COMPONENT ---
interface SpriteSkillEffectProps {
    skillKey: string;
    position: [number, number, number];
    onComplete?: () => void;
    active?: boolean;
}

export const SpriteSkillEffect: React.FC<SpriteSkillEffectProps> = ({
    skillKey,
    position,
    onComplete,
    active = true
}) => {
    const config = SPRITE_SKILLS[skillKey];
    if (!config) {
        console.warn(`Unknown sprite skill: ${skillKey}`);
        return null;
    }

    const framePaths = useMemo(() => getFramePaths(config), [skillKey]);
    const [currentFrame, setCurrentFrame] = useState(0);
    const frameTimeRef = useRef(0);
    const completedRef = useRef(false);
    const meshRef = useRef<THREE.Mesh>(null);

    // Load all textures
    const textures = useTexture(framePaths);
    const textureArray = useMemo(() => {
        return Array.isArray(textures) ? textures : [textures];
    }, [textures]);

    // Configure textures
    useEffect(() => {
        textureArray.forEach(tex => {
            tex.magFilter = THREE.NearestFilter;
            tex.minFilter = THREE.NearestFilter;
            tex.colorSpace = THREE.SRGBColorSpace;
        });
    }, [textureArray]);

    // Animation loop
    useFrame((state, delta) => {
        if (!active || completedRef.current) return;

        frameTimeRef.current += delta;
        const frameInterval = 1 / (config.fps ?? 12);

        if (frameTimeRef.current >= frameInterval) {
            frameTimeRef.current = 0;

            const nextFrame = currentFrame + 1;

            if (nextFrame >= config.frameCount) {
                if (config.loop) {
                    setCurrentFrame(0);
                } else {
                    completedRef.current = true;
                    onComplete?.();
                }
            } else {
                setCurrentFrame(nextFrame);
            }
        }

        // Slight animation
        if (meshRef.current) {
            meshRef.current.rotation.z += delta * 0.5;
        }
    });

    // Reset on re-activation
    useEffect(() => {
        if (active) {
            setCurrentFrame(0);
            frameTimeRef.current = 0;
            completedRef.current = false;
        }
    }, [active, skillKey]);

    if (!active || completedRef.current) return null;

    const currentTexture = textureArray[Math.min(currentFrame, textureArray.length - 1)];
    const scale = config.scale ?? 2;

    return (
        <Billboard position={position} follow={true} lockX={false} lockY={false} lockZ={false}>
            <mesh ref={meshRef}>
                <planeGeometry args={[scale, scale]} />
                <meshBasicMaterial
                    map={currentTexture}
                    transparent={true}
                    alphaTest={0.1}
                    side={THREE.DoubleSide}
                    color={config.color || '#ffffff'}
                />
            </mesh>
        </Billboard>
    );
};

// --- POOLED SPRITE EFFECTS MANAGER ---
interface ActiveSpriteSkill {
    id: string;
    skillKey: string;
    position: [number, number, number];
}

interface SpriteSkillEffectsProps {
    activeSkills: ActiveSpriteSkill[];
    onEffectComplete: (id: string) => void;
}

export const SpriteSkillEffects: React.FC<SpriteSkillEffectsProps> = ({
    activeSkills,
    onEffectComplete
}) => {
    return (
        <group>
            {activeSkills.map(skill => (
                <SpriteSkillEffect
                    key={skill.id}
                    skillKey={skill.skillKey}
                    position={skill.position}
                    onComplete={() => onEffectComplete(skill.id)}
                    active={true}
                />
            ))}
        </group>
    );
};

// --- SKILL VISUAL TO SPRITE MAPPING ---
// Maps the 'visual' field from constants.ts skills to sprite keys
export const VISUAL_TO_SPRITE: Record<string, string> = {
    // Warrior
    'warrior_slash': 'warrior_slash',
    'warrior_charge': 'warrior_charge',
    'warrior_shield': 'warrior_shield',
    'warrior_whirlwind': 'warrior_whirlwind',
    'warrior_pierce': 'warrior_thrust',
    'warrior_judgement': 'warrior_slash',

    // Archer
    'archer_shot': 'archer_quick_shot',
    'archer_backstep': 'archer_backstep',
    'archer_dragon': 'archer_dragon_spirit',

    // Archmage
    'arcane_slash': 'archmage_arcane_slash',
    'arcane_bolt': 'archmage_arcane_impact',
    'arcane_shield': 'archmage_arcane_impact',
    'arcane_chain': 'archmage_arcane_thunder',
    'arcane_void': 'archmage_void',
    'arcane_meteor': 'archmage_meteor',
    'arcane_blizzard': 'archmage_blizzard',

    // Arctic Knight
    'arctic_slash': 'arctic_lance',
    'arctic_charge': 'arctic_lance',
    'arctic_freeze': 'archmage_blizzard',
    'arctic_crater': 'archmage_blizzard',
    'arctic_shield': 'warrior_shield',

    // Bard
    'bard_note': 'bard_clef',
    'bard_wave': 'bard_vibration',
    'bard_symphony': 'bard_symphony',
    'bard_buff': 'bard_clef',

    // Cleric
    'cleric_smite': 'cleric_divine_impact',
    'cleric_heal': 'cleric_luminous_wave',
    'cleric_buff': 'cleric_divine_immolation',
    'cleric_cross': 'cleric_divine_impact',
    'cleric_wave': 'cleric_luminous_wave',
    'cleric_tear': 'cleric_tear',

    // Martial Artist
    'martial_hit': 'martial_strike',
    'martial_uppercut': 'martial_impact',
    'martial_evasion': 'martial_agile',
    'martial_multi': 'martial_strike_slash',
    'martial_slash': 'martial_blue_slash',

    // Reaper
    'reaper_slice': 'reaper_soul_slice',
    'reaper_soul_slice': 'reaper_soul_slice',
    'reaper_wave': 'reaper_soul_wave',
    'reaper_spin': 'reaper_soul_slice',
    'reaper_cross': 'reaper_soul_wave',
};

export default SpriteSkillEffects;
