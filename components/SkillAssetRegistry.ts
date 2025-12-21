
export interface SkillAssetConfig {
    path: string;       // Base path to directory
    modelBase: string;  // Base filename (e.g. "warrior_slash")
    extension: 'json' | 'gltf';
    count: number;      // Number of frames (1 to count)
    startIndex?: number; // Starting index (default 1)
    sound?: string;     // Sound file path
    duration?: number;  // Animation duration in seconds (optional override)
    scale?: number;     // Scale override
    color?: string;     // Color override for reused assets
}

// --- RESOURCE PATHS ---
const MODELS_ROOT = '/models/skills';
const SOUNDS_ROOT = '/models/sounds/skills';

// Helper to build path
const getModelPath = (cls: string) => `${MODELS_ROOT}/${cls}/`;
const getSoundPath = (cls: string, file: string) => `${SOUNDS_ROOT}/${cls}/${file}.ogg`;

export const SKILL_ASSETS: Record<string, SkillAssetConfig> = {
    // --- WARRIOR (JSON) ---
    warrior_slash: {
        path: getModelPath('warrior'),
        modelBase: 'warrior_slash',
        extension: 'json',
        count: 7,
        startIndex: 1,
        sound: getSoundPath('warrior', 'brutal_strike')
    },
    warrior_whirlwind: {
        path: getModelPath('warrior'),
        modelBase: 'whirlwind',
        extension: 'json',
        count: 5,
        startIndex: 1,
        scale: 2,
        sound: getSoundPath('warrior', 'judgement')
    },
    warrior_charge: {
        path: getModelPath('warrior'),
        modelBase: 'charge',
        extension: 'json',
        count: 5,
        startIndex: 1,
        sound: getSoundPath('warrior', 'charge')
    },
    warrior_judgement: {
        path: getModelPath('warrior'),
        modelBase: 'judgement_sword',
        extension: 'json',
        count: 4,
        startIndex: 1,
        scale: 1.5,
        sound: getSoundPath('warrior', 'judgement')
    },
    warrior_pierce: {
        path: getModelPath('warrior'),
        modelBase: 'warrior_pierce',
        extension: 'json',
        count: 6,
        startIndex: 1,
        sound: getSoundPath('warrior', 'pierce')
    },
    warrior_shield: {
        path: getModelPath('warrior'),
        modelBase: 'shield_barrier',
        extension: 'json',
        count: 4,
        startIndex: 1,
        sound: getSoundPath('warrior', 'shield_block')
    },


    // --- ARCHER (GLTF) ---
    archer_shot: {
        path: getModelPath('archer'),
        modelBase: 'quick_shot',
        extension: 'gltf',
        count: 1,
        sound: getSoundPath('archer', 'arrow_shoot_1')
    },
    archer_volley: {
        path: getModelPath('archer'),
        modelBase: 'javelin', // Fallback for windrazor
        extension: 'gltf',
        count: 1,
        sound: getSoundPath('archer', 'arrow_shoot_volley')
    },
    hunters_focus: {
        path: getModelPath('archer'),
        modelBase: 'hunters_focus',
        extension: 'gltf',
        count: 3,
        startIndex: 1,
        sound: getSoundPath('archer', 'hunters_focus')
    },
    archer_backstep: {
        path: getModelPath('archer'),
        modelBase: 'backstep',
        extension: 'gltf',
        count: 5,
        startIndex: 1,
        sound: getSoundPath('archer', 'backstep')
    },
    dragon_arrow: {
        path: getModelPath('archer'),
        modelBase: 'dragon_arrow',
        extension: 'gltf',
        count: 1,
        scale: 1.5,
        sound: getSoundPath('archer', 'dragon_arrow')
    },
    javelin: {
        path: getModelPath('archer'),
        modelBase: 'javelin',
        extension: 'gltf',
        count: 1,
        scale: 1.2,
        sound: getSoundPath('archer', 'javelin_throw')
    },
    backstep: {
        path: getModelPath('archer'),
        modelBase: 'backstep',
        extension: 'gltf',
        count: 5,
        startIndex: 1,
        sound: getSoundPath('archer', 'backstep')
    },

    // --- ARCHMAGE (GLTF) ---
    archmage_bolt: {
        path: getModelPath('archmage'),
        modelBase: 'arcane_magic_circle', // Fallback
        extension: 'gltf',
        count: 1,
        scale: 1,
        sound: getSoundPath('archmage', 'arcane_bolt')
    },
    archmage_impact: {
        path: getModelPath('archmage'),
        modelBase: 'hastur', // Unused asset
        extension: 'gltf',
        count: 1,
        scale: 1.5,
        sound: getSoundPath('archmage', 'time_warp')
    },
    archmage_void: {
        path: getModelPath('archmage'),
        modelBase: 'void_chains',
        extension: 'gltf',
        count: 1,
        sound: getSoundPath('archmage', 'void_rupture')
    },
    archmage_meteor: {
        path: getModelPath('archmage'),
        modelBase: 'meteor_storm_meteor',
        extension: 'gltf',
        count: 1,
        scale: 2,
        sound: getSoundPath('archmage', 'meteor_impact')
    },
    archmage_nova: {
        path: getModelPath('archmage'),
        modelBase: 'arcane_magic_circle', // Reused for burst
        extension: 'gltf',
        count: 1,
        scale: 2.5,
        sound: getSoundPath('archmage', 'arcane_bolt')
    },
    archmage_blizzard: {
        path: getModelPath('archmage'),
        modelBase: 'ice_shard',
        extension: 'gltf',
        count: 1,
        scale: 2, // Larger shard
        color: '#a5f3fc', // Ice tint
        sound: getSoundPath('archmage', 'blizzard_impact')
    },
    archmage_apocalypse: {
        path: getModelPath('archmage'),
        modelBase: 'meteor_storm_magic_circle', // Red Circle
        extension: 'gltf',
        count: 1,
        scale: 3,
        sound: getSoundPath('archmage', 'meteor_impact')
    },

    // --- REAPER (JSON) ---
    reaper_slice: {
        path: getModelPath('reaper'),
        modelBase: 'death_slice',
        extension: 'json',
        count: 6,
        startIndex: 1,
        sound: getSoundPath('reaper', 'scythe_slash')
    },
    reaper_spin: {
        path: getModelPath('reaper'),
        modelBase: 'death_spin',
        extension: 'json',
        count: 1,
        sound: getSoundPath('reaper', 'whirlwind')
    },
    reaper_soul_slice: {
        path: getModelPath('reaper'),
        modelBase: 'soul_slice',
        extension: 'json',
        count: 1,
        sound: getSoundPath('reaper', 'soul_slice')
    },
    reaper_wave: {
        path: getModelPath('reaper'),
        modelBase: 'reaping_wave',
        extension: 'json',
        count: 1,
        sound: getSoundPath('reaper', 'reaping_wave')
    },
    reaper_cross: {
        path: getModelPath('reaper'),
        modelBase: 'cross_slash',
        extension: 'json',
        count: 1,
        sound: getSoundPath('reaper', 'cross_slash')
    },

    // --- MONK (GLTF) ---
    monk_punch: {
        path: getModelPath('monk'),
        modelBase: 'vfx_monk_impact',
        extension: 'gltf',
        count: 6,
        startIndex: 1,
        sound: getSoundPath('monk', 'staff_hit')
    },
    monk_palm: {
        path: getModelPath('monk'),
        modelBase: 'vfx_chi_hit',
        extension: 'gltf',
        count: 1,
        sound: getSoundPath('monk', 'palm_strike')
    },
    monk_blast: {
        path: getModelPath('monk'),
        modelBase: 'vfx_chi_blast',
        extension: 'gltf',
        count: 1,
        sound: getSoundPath('monk', 'chi_blast')
    },
    monk_swift: {
        path: getModelPath('monk'),
        modelBase: 'vfx_swift_strikes',
        extension: 'gltf',
        count: 6,
        startIndex: 1,
        sound: getSoundPath('monk', 'swift_strikes')
    },
    monk_dragon: {
        path: getModelPath('monk'),
        modelBase: 'vfx_monk_dragon_fists',
        extension: 'gltf',
        count: 1,
        sound: getSoundPath('monk', 'dragon_fists')
    },
    monk_meditation: {
        path: getModelPath('monk'),
        modelBase: 'vfx_meditation_beads',
        extension: 'gltf',
        count: 1,
        sound: getSoundPath('monk', 'meditation')
    },
    monk_heal: {
        path: getModelPath('monk'),
        modelBase: 'vfx_chi_heal',
        extension: 'gltf',
        count: 1,
        sound: getSoundPath('monk', 'heal')
    },

    // --- BARD (GLTF) ---
    bard_note: {
        path: getModelPath('bard'),
        modelBase: 'strings',
        extension: 'gltf',
        count: 1,
        sound: getSoundPath('bard', 'note_strike')
    },
    bard_vibration: {
        path: getModelPath('bard'),
        modelBase: 'blue_bird',
        extension: 'gltf',
        count: 1,
        sound: getSoundPath('bard', 'vibration')
    },
    bard_light: {
        path: getModelPath('bard'),
        modelBase: 'healing_aura',
        extension: 'gltf',
        count: 1,
        sound: getSoundPath('bard', 'light')
    },
    bard_explosion: { // Ultimate
        path: getModelPath('bard'),
        modelBase: 'ult_strings',
        extension: 'gltf',
        count: 4,
        startIndex: 1,
        sound: getSoundPath('bard', 'explosion')
    },

    // --- CLERIC (GLTF) ---
    cleric_impact: {
        path: getModelPath('cleric'),
        modelBase: 'divine_cross',
        extension: 'gltf',
        count: 1,
        sound: getSoundPath('cleric', 'impact')
    },
    cleric_immolation: {
        path: getModelPath('cleric'),
        modelBase: 'holy_lantern',
        extension: 'gltf',
        count: 1,
        sound: getSoundPath('cleric', 'immolation')
    },
    cleric_tear: {
        path: getModelPath('cleric'),
        modelBase: 'tear_of_god',
        extension: 'gltf',
        count: 1,
        sound: getSoundPath('cleric', 'tear')
    },
    cleric_wave: { // Ultimate
        path: getModelPath('cleric'),
        modelBase: 'god_embodiment', // Large model
        extension: 'gltf',
        count: 1,
        sound: getSoundPath('cleric', 'wave')
    },

    // --- MARTIAL ARTIST (JSON) ---
    martial_hit: {
        path: getModelPath('martial_artist'),
        modelBase: 'basic_strike',
        extension: 'json',
        count: 6,
        startIndex: 1,
        sound: getSoundPath('martial_artist', 'hit')
    },
    martial_uppercut: {
        path: getModelPath('martial_artist'),
        modelBase: 'uppercut',
        extension: 'json',
        count: 6,
        startIndex: 1,
        sound: getSoundPath('martial_artist', 'uppercut')
    },
    martial_agile: {
        path: getModelPath('martial_artist'),
        modelBase: 'agile_strike',
        extension: 'json',
        count: 4,
        startIndex: 1,
        sound: getSoundPath('martial_artist', 'agile')
    },
    martial_evasion: {
        path: getModelPath('martial_artist'),
        modelBase: 'evasion',
        extension: 'json',
        count: 4,
        startIndex: 1,
        sound: getSoundPath('martial_artist', 'evasion')
    },
    martial_slash: {
        path: getModelPath('martial_artist'),
        modelBase: 'deadly_squash',
        extension: 'json',
        count: 4,
        startIndex: 1,
        sound: getSoundPath('martial_artist', 'slash')
    },
    martial_multi: { // Ultimate
        path: getModelPath('martial_artist'),
        modelBase: 'multi_strike_1', // Simplified for now
        extension: 'json',
        count: 4,
        startIndex: 1,
        sound: getSoundPath('martial_artist', 'multi')
    },

    // --- ARCTIC KNIGHT (GLTF) ---
    arctic_slash: {
        path: getModelPath('arctic_knight'),
        modelBase: 'fx_frost_strike',
        extension: 'gltf',
        count: 7,
        startIndex: 1,
        scale: 1,
        sound: getSoundPath('arctic_knight', 'frost_hit')
    },
    arctic_storm: {
        path: getModelPath('arctic_knight'),
        modelBase: 'fx_frost_shield',
        extension: 'gltf',
        count: 1,
        scale: 1.8,
        sound: getSoundPath('arctic_knight', 'blizzard')
    },
    arctic_shard: {
        path: getModelPath('arctic_knight'),
        modelBase: 'fx_permafrost_lance',
        extension: 'gltf',
        count: 1,
        scale: 1,
        sound: getSoundPath('arctic_knight', 'ice_shard')
    },
    arctic_charge: {
        path: getModelPath('arctic_knight'),
        modelBase: 'fx_arctic_charge',
        extension: 'gltf',
        count: 1,
        scale: 1,
        sound: getSoundPath('arctic_knight', 'charge')
    },
    arctic_freeze: {
        path: getModelPath('arctic_knight'),
        modelBase: 'fx_freeze',
        extension: 'gltf',
        count: 1,
        scale: 1,
        sound: getSoundPath('arctic_knight', 'frostbite')
    },
    arctic_crater: {
        path: getModelPath('arctic_knight'),
        modelBase: 'fx_ice_crater_big',
        extension: 'gltf',
        count: 1,
        scale: 1,
        sound: getSoundPath('arctic_knight', 'glacier_smash')
    },

    // --- GALE GLAIVE (GLTF) ---
    gale_slash: {
        path: getModelPath('gale_glaive'),
        modelBase: 'vfx_gale_slash',
        extension: 'gltf',
        count: 11,
        startIndex: 1,
        scale: 1,
        sound: getSoundPath('gale_glaive', 'wind_slash')
    },
    gale_whirlwind: {
        path: getModelPath('gale_glaive'),
        modelBase: 'vfx_gale_spin',
        extension: 'gltf',
        count: 1,
        scale: 1,
        sound: getSoundPath('gale_glaive', 'tornado')
    },
    gale_thrust: {
        path: getModelPath('gale_glaive'),
        modelBase: 'vfx_gale_thrust',
        extension: 'gltf',
        count: 9,
        startIndex: 1,
        scale: 1,
        sound: getSoundPath('gale_glaive', 'thrust')
    },
    gale_dash: {
        path: getModelPath('gale_glaive'),
        modelBase: 'vfx_gale_dash',
        extension: 'gltf',
        count: 14,
        startIndex: 1,
        scale: 1,
        sound: getSoundPath('gale_glaive', 'dash')
    },
    gale_vault: {
        path: getModelPath('gale_glaive'),
        modelBase: 'vfx_gale_vault',
        extension: 'gltf',
        count: 8,
        startIndex: 1,
        scale: 1,
        sound: getSoundPath('gale_glaive', 'vault')
    },
    gale_tornado: {
        path: getModelPath('gale_glaive'),
        modelBase: 'vfx_gale_tornado',
        extension: 'gltf',
        count: 1,
        scale: 4.0,
        sound: getSoundPath('gale_glaive', 'tornado_loop')
    }
};
