
export interface WeaponConfig {
    path: string;       // Path to the model file
    model: string;      // Model name (for our loader)
    scale?: number;     // Optional scale
    rotation?: [number, number, number]; // Optional rotation offset [x, y, z] in radians
    position?: [number, number, number]; // Optional position offset [x, y, z]
}

const ROOT = '/Character';

// Helper for paths
const getPath = (pack: string, modelDir: string) => `${ROOT}/${pack}/resourcepack (for players)/assets/minecraft/models/${modelDir}/`;

export const CLASS_WEAPONS: Record<string, WeaponConfig> = {
    warrior: {
        path: getPath('warrior', 'warrior_model'),
        model: 'warrior_sword',
        scale: 0.5,
        rotation: [0, -Math.PI / 2, -Math.PI / 2], // Rotated to point forward/horizontal
        position: [0, -0.5, 0.1] // Adjusted to align handle with hand
    },
    arctic_knight: {
        path: getPath('arctic_knight', 'arctic_knight_model'),
        model: 'frigid_lance_arctic_knight',
        scale: 0.6,
        rotation: [0, -Math.PI / 2, -Math.PI / 2],
        position: [0, -0.5, 0.1]
    },
    gale_glaive: {
        path: getPath('gale_glaive', 'gale_glaive_model'),
        model: 'gale_glaive_windreaver',
        scale: 0.5,
        rotation: [0, Math.PI / 2, 0],
        position: [0, -0.2, 0.1]
    },
    archer: {
        path: getPath('archer', 'archer_model'),
        model: 'archer_bow',
        scale: 0.5,
        rotation: [-Math.PI / 2, 0, 0.61], // Vertical + 35 degree tilt outward
        position: [0, 0.3, 0.15]
    },
    reaper: {
        path: getPath('reaper', 'reaper_model'),
        model: 'scythe_reaper',
        scale: 0.6,
        rotation: [0, Math.PI / 2, Math.PI / 3], // Steeper diagonal
        position: [0, 0.4, 0.2] // Higher position (hand holds lower on shaft)
    },
    bard: {
        path: getPath('bard', 'bard_model'),
        model: 'bard_harp',
        scale: 0.4,
        position: [0, 0, 0.2] // Back to hand level
    },
    archmage: {
        path: getPath('archmage', 'archmage_model'),
        model: 'archmage_staff',
        scale: 0.5,
        position: [0, 0, 0.15] // Back to hand level
    },
    cleric: {
        path: getPath('cleric', 'cleric_model'),
        model: 'cleric_mace',
        scale: 0.35,
        position: [0, 0.1, 0]
    },
    martial_artist: {
        path: getPath('martial_artist', 'martial_artist_model'),
        model: 'martial_artist_gauntlet',
        scale: 0.4,
        position: [0, 0.1, 0]
    },
    monk: {
        path: getPath('monk', 'monk_model'),
        model: 'monk_gauntlet',
        scale: 0.4,
        position: [0, 0.1, 0]
    },
};

// Helper to resolve generic item visuals to existing assets
export const getWeaponConfig = (item: any | null, charClass: string): WeaponConfig => {
    const defaultWeapon = CLASS_WEAPONS[charClass] || CLASS_WEAPONS['warrior'];

    if (!item || !item.visuals) {
        return defaultWeapon;
    }

    const modelType = item.visuals.model;

    // Map generic generic visual types to available class assets
    // We reuse existing class models for generic items for now
    switch (modelType) {
        case 'sword':
            return {
                ...CLASS_WEAPONS['warrior'],
                scale: 0.5,
                model: 'warrior_sword'
            };
        case 'axe':
            return {
                ...CLASS_WEAPONS['warrior'],
                scale: 0.5,
                model: 'warrior_sword'
            };
        case 'bow':
            return {
                ...CLASS_WEAPONS['archer'],
                scale: 0.5,
                rotation: [-Math.PI / 2, 0, 0.61], // 35 degrees outward
                position: [0, 0.3, 0.15]
            };
        case 'staff':
            return {
                ...CLASS_WEAPONS['archmage'],
                scale: 0.5
            };
        case 'harp':
        case 'book':
            return CLASS_WEAPONS['bard'] || defaultWeapon;
        case 'mace':
        case 'hammer':
            return {
                ...CLASS_WEAPONS['cleric'],
                scale: 0.5
            };
        case 'dagger':
            return {
                ...CLASS_WEAPONS['reaper'] || CLASS_WEAPONS['warrior'],
                rotation: [Math.PI, 0, 0],
                scale: 0.35,
                position: [0, 0.5, 0.1]
            };
        case 'spear':
        case 'scythe':
            return {
                ...CLASS_WEAPONS['reaper'],
                scale: 0.6
            };
        case 'gauntlet':
            return {
                ...CLASS_WEAPONS['monk'],
                scale: 0.4
            };
        default:
            return defaultWeapon;
    }
};
