
export interface SkillAssetConfig {
    path: string;
    modelBase: string;
    extension: 'json' | 'gltf';
    count: number;
    startIndex?: number;
    sound?: string;
    duration?: number;
    scale?: number;
    color?: string;
    // EXTENDED VISUAL CONFIG
    visualFx?: {
        trailColor?: string;
        trailType?: 'ribbon' | 'particle' | 'none';
        groundFx?: 'crater' | 'burn' | 'ice' | 'none';
        impactScale?: number;
        lifetime?: number;
    };
}

const BASE_PATH = '/models/skills/placeholder/';

export const SKILL_ASSETS: Record<string, SkillAssetConfig> = {
    // --- WARRIOR (Melee / Physical) ---
    warrior_1: { path: BASE_PATH, modelBase: 'slash', extension: 'gltf', count: 1, color: '#ef4444', scale: 1.0, visualFx: { trailType: 'ribbon', trailColor: '#ef4444', impactScale: 1.2 } },
    warrior_2: { path: BASE_PATH, modelBase: 'bash', extension: 'gltf', count: 1, color: '#f87171', scale: 1.2, visualFx: { impactScale: 1.5, groundFx: 'crater' } },
    warrior_3: { path: BASE_PATH, modelBase: 'spin', extension: 'gltf', count: 1, color: '#dc2626', scale: 2.0, duration: 2, visualFx: { trailType: 'ribbon', trailColor: '#ff0000' } },
    warrior_4: { path: BASE_PATH, modelBase: 'shout', extension: 'gltf', count: 1, color: '#fbbf24', scale: 1.5 },
    warrior_7: { path: BASE_PATH, modelBase: 'rage', extension: 'gltf', count: 1, color: '#ff0000', scale: 2.5, visualFx: { trailType: 'particle', trailColor: '#ffaaaa', groundFx: 'burn', lifetime: 5 } },

    // --- ARCHER (Ranged / Nature) ---
    archer_1: { path: BASE_PATH, modelBase: 'shot', extension: 'gltf', count: 1, color: '#4ade80', scale: 0.8, visualFx: { trailType: 'particle', trailColor: '#ffffff' } },
    archer_5: { path: BASE_PATH, modelBase: 'poison', extension: 'gltf', count: 1, color: '#a3e635', scale: 1.0, visualFx: { trailType: 'particle', trailColor: '#00ff00', groundFx: 'burn' } },

    // --- MAGE (Magic / Cosmic) ---
    mage_1: { path: BASE_PATH, modelBase: 'bolt', extension: 'gltf', count: 1, color: '#a855f7', scale: 1.0, visualFx: { trailType: 'ribbon', trailColor: '#d8b4fe' } },
    mage_2: { path: BASE_PATH, modelBase: 'fire', extension: 'gltf', count: 1, color: '#f97316', scale: 1.2, visualFx: { trailType: 'particle', trailColor: '#ffedd5', impactScale: 2.0, groundFx: 'burn' } },
    mage_6: { path: BASE_PATH, modelBase: 'meteor', extension: 'gltf', count: 1, color: '#fcd34d', scale: 3.0, visualFx: { impactScale: 5.0, groundFx: 'crater' } },

    // --- CLERIC (Holy) ---
    cleric_1: { path: BASE_PATH, modelBase: 'heal', extension: 'gltf', count: 1, color: '#fde047', scale: 1.5, visualFx: { impactScale: 2.0 } },
    cleric_6: { path: BASE_PATH, modelBase: 'holyfire', extension: 'gltf', count: 1, color: '#fb923c', scale: 2.0, visualFx: { groundFx: 'burn' } },
};
