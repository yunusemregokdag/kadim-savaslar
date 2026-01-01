
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
    // --- WARRIOR (w) ---
    slash: { path: BASE_PATH, modelBase: 'slash', extension: 'gltf', count: 1, color: '#ef4444', scale: 1.0, visualFx: { trailType: 'ribbon', impactScale: 1.2 } },
    shield: { path: BASE_PATH, modelBase: 'shield', extension: 'gltf', count: 1, color: '#94a3b8', scale: 1.5 },
    rage: { path: BASE_PATH, modelBase: 'rage', extension: 'gltf', count: 1, color: '#b91c1c', scale: 1.5, visualFx: { trailType: 'particle', groundFx: 'burn' } },
    slam: { path: BASE_PATH, modelBase: 'slam', extension: 'gltf', count: 1, color: '#7f1d1d', scale: 2.0, visualFx: { groundFx: 'crater' } },
    spear: { path: BASE_PATH, modelBase: 'spear', extension: 'gltf', count: 1, color: '#ef4444', scale: 1.2, visualFx: { trailType: 'ribbon' } },
    shout: { path: BASE_PATH, modelBase: 'shout', extension: 'gltf', count: 1, color: '#fbbf24', scale: 2.0 },
    whirlwind: { path: BASE_PATH, modelBase: 'spin', extension: 'gltf', count: 1, color: '#dc2626', scale: 2.5, duration: 2, visualFx: { trailType: 'ribbon' } },

    // --- ARCTIC KNIGHT (ak) ---
    ice_slash: { path: BASE_PATH, modelBase: 'slash', extension: 'gltf', count: 1, color: '#06b6d4', scale: 1.1, visualFx: { trailType: 'ribbon', trailColor: '#a5f3fc' } },
    ice_armor: { path: BASE_PATH, modelBase: 'shield', extension: 'gltf', count: 1, color: '#22d3ee', scale: 1.5 },
    freeze_breath: { path: BASE_PATH, modelBase: 'fire', extension: 'gltf', count: 1, color: '#e0f2fe', scale: 1.8, visualFx: { trailType: 'particle' } },
    ice_spear: { path: BASE_PATH, modelBase: 'spear', extension: 'gltf', count: 1, color: '#0ea5e9', scale: 1.3, visualFx: { trailType: 'ribbon' } },
    ice_floor: { path: BASE_PATH, modelBase: 'slam', extension: 'gltf', count: 1, color: '#38bdf8', scale: 3.0, visualFx: { groundFx: 'ice' } },
    winter_fury: { path: BASE_PATH, modelBase: 'rage', extension: 'gltf', count: 1, color: '#0891b2', scale: 1.6 },
    blizzard: { path: BASE_PATH, modelBase: 'meteor', extension: 'gltf', count: 1, color: '#cffafe', scale: 4.0, visualFx: { trailType: 'particle', groundFx: 'ice', lifetime: 5 } },

    // --- GALE GLAIVE (gg) ---
    wind_slash: { path: BASE_PATH, modelBase: 'slash', extension: 'gltf', count: 1, color: '#14b8a6', scale: 1.2, visualFx: { trailType: 'ribbon', trailColor: '#99f6e4' } },
    dash: { path: BASE_PATH, modelBase: 'dash', extension: 'gltf', count: 1, color: '#5eead4', scale: 1.0, visualFx: { trailType: 'ribbon' } },
    tornado: { path: BASE_PATH, modelBase: 'spin', extension: 'gltf', count: 1, color: '#0d9488', scale: 2.5, visualFx: { trailType: 'particle' } },
    wind_wall: { path: BASE_PATH, modelBase: 'shield', extension: 'gltf', count: 1, color: '#ccfbf1', scale: 2.0 },
    air_blade: { path: BASE_PATH, modelBase: 'bolt', extension: 'gltf', count: 1, color: '#2dd4bf', scale: 1.5, visualFx: { trailType: 'ribbon' } },
    speed_boost: { path: BASE_PATH, modelBase: 'buff', extension: 'gltf', count: 1, color: '#f0fdfa', scale: 1.0, visualFx: { trailType: 'particle' } },
    storm: { path: BASE_PATH, modelBase: 'meteor', extension: 'gltf', count: 1, color: '#0f766e', scale: 4.0, visualFx: { impactScale: 3.0 } },

    // --- ARCHER (r) ---
    arrow: { path: BASE_PATH, modelBase: 'shot', extension: 'gltf', count: 1, color: '#4ade80', scale: 0.8 },
    multishot: { path: BASE_PATH, modelBase: 'shot', extension: 'gltf', count: 3, color: '#86efac', scale: 0.8, visualFx: { trailType: 'particle' } },
    stealth: { path: BASE_PATH, modelBase: 'buff', extension: 'gltf', count: 1, color: '#dcfce7', scale: 1.0 },
    trap: { path: BASE_PATH, modelBase: 'mine', extension: 'gltf', count: 1, color: '#166534', scale: 1.0 },
    dash_back: { path: BASE_PATH, modelBase: 'dash', extension: 'gltf', count: 1, color: '#86efac', scale: 1.0 },
    poison_arrow: { path: BASE_PATH, modelBase: 'shot', extension: 'gltf', count: 1, color: '#a3e635', scale: 1.0, visualFx: { trailType: 'particle' } },
    arrow_rain: { path: BASE_PATH, modelBase: 'rain', extension: 'gltf', count: 10, color: '#22c55e', scale: 5.0, visualFx: { trailType: 'ribbon', lifetime: 3 } },

    // --- MARTIAL ARTIST (ma) ---
    punch: { path: BASE_PATH, modelBase: 'punch', extension: 'gltf', count: 1, color: '#f59e0b', scale: 1.0, visualFx: { impactScale: 1.2 } },
    kick: { path: BASE_PATH, modelBase: 'kick', extension: 'gltf', count: 1, color: '#d97706', scale: 1.2 },
    focus: { path: BASE_PATH, modelBase: 'buff', extension: 'gltf', count: 1, color: '#fef3c7', scale: 1.0 },
    dragon_kick: { path: BASE_PATH, modelBase: 'kick', extension: 'gltf', count: 1, color: '#ef4444', scale: 1.5, visualFx: { trailType: 'ribbon' } },
    zen_strike: { path: BASE_PATH, modelBase: 'slash', extension: 'gltf', count: 1, color: '#fcd34d', scale: 1.4 },
    counter: { path: BASE_PATH, modelBase: 'shield', extension: 'gltf', count: 1, color: '#fbbf24', scale: 1.2 },
    dragon_fury: { path: BASE_PATH, modelBase: 'rage', extension: 'gltf', count: 1, color: '#b45309', scale: 2.0, visualFx: { trailType: 'particle', groundFx: 'burn' } },

    // --- MONK (mk) ---
    palm_strike: { path: BASE_PATH, modelBase: 'punch', extension: 'gltf', count: 1, color: '#eab308', scale: 1.1 },
    mantra: { path: BASE_PATH, modelBase: 'buff', extension: 'gltf', count: 1, color: '#fef9c3', scale: 1.5 },
    force_wave: { path: BASE_PATH, modelBase: 'slam', extension: 'gltf', count: 1, color: '#facc15', scale: 2.0 },
    meditation: { path: BASE_PATH, modelBase: 'buff', extension: 'gltf', count: 1, color: '#fef08a', scale: 1.0 },
    spirit_bomb: { path: BASE_PATH, modelBase: 'meteor', extension: 'gltf', count: 1, color: '#ca8a04', scale: 1.8 },
    iron_skin: { path: BASE_PATH, modelBase: 'shield', extension: 'gltf', count: 1, color: '#a16207', scale: 1.3 },
    thousand_palms: { path: BASE_PATH, modelBase: 'punch', extension: 'gltf', count: 10, color: '#eab308', scale: 3.0, visualFx: { impactScale: 2.0 } },

    // --- REAPER (rp) ---
    scythe_slash: { path: BASE_PATH, modelBase: 'slash', extension: 'gltf', count: 1, color: '#581c87', scale: 1.5, visualFx: { trailType: 'ribbon', trailColor: '#a855f7' } },
    soul_harvest: { path: BASE_PATH, modelBase: 'buff', extension: 'gltf', count: 1, color: '#7e22ce', scale: 1.2, visualFx: { trailType: 'particle' } },
    shadow_step: { path: BASE_PATH, modelBase: 'dash', extension: 'gltf', count: 1, color: '#3b0764', scale: 1.0 },
    grim_fear: { path: BASE_PATH, modelBase: 'shout', extension: 'gltf', count: 1, color: '#4c1d95', scale: 2.0 },
    death_mark: { path: BASE_PATH, modelBase: 'skull', extension: 'gltf', count: 1, color: '#6b21a8', scale: 1.0 },
    ghost_form: { path: BASE_PATH, modelBase: 'buff', extension: 'gltf', count: 1, color: '#c084fc', scale: 1.1, visualFx: { trailType: 'particle' } },
    execution: { path: BASE_PATH, modelBase: 'slam', extension: 'gltf', count: 1, color: '#2e1065', scale: 3.0, visualFx: { groundFx: 'crater' } },

    // --- NINJA (nj) ---
    katana_slash: { path: BASE_PATH, modelBase: 'slash', extension: 'gltf', count: 1, color: '#111827', scale: 1.0 },
    shuriken: { path: BASE_PATH, modelBase: 'shot', extension: 'gltf', count: 3, color: '#374151', scale: 0.5 },
    smoke_bomb: { path: BASE_PATH, modelBase: 'cloud', extension: 'gltf', count: 1, color: '#9ca3af', scale: 4.0 },
    assassinate: { path: BASE_PATH, modelBase: 'dash', extension: 'gltf', count: 1, color: '#dc2626', scale: 1.0, visualFx: { trailType: 'ribbon' } },
    shadow_clone: { path: BASE_PATH, modelBase: 'buff', extension: 'gltf', count: 2, color: '#000000', scale: 1.0 },
    caltrops: { path: BASE_PATH, modelBase: 'mine', extension: 'gltf', count: 1, color: '#4b5563', scale: 1.0 },
    dragon_blade: { path: BASE_PATH, modelBase: 'rage', extension: 'gltf', count: 1, color: '#991b1b', scale: 2.0, visualFx: { trailType: 'ribbon' } },

    // --- ARCHMAGE (am) ---
    fireball: { path: BASE_PATH, modelBase: 'fire', extension: 'gltf', count: 1, color: '#f97316', scale: 1.5, visualFx: { trailType: 'particle', groundFx: 'burn' } },
    ice_wall: { path: BASE_PATH, modelBase: 'shield', extension: 'gltf', count: 1, color: '#67e8f9', scale: 2.0 },
    lightning: { path: BASE_PATH, modelBase: 'bolt', extension: 'gltf', count: 1, color: '#e879f9', scale: 1.2 },
    teleport: { path: BASE_PATH, modelBase: 'dash', extension: 'gltf', count: 1, color: '#c026d3', scale: 1.0 },
    mana_shield: { path: BASE_PATH, modelBase: 'shield', extension: 'gltf', count: 1, color: '#3b82f6', scale: 1.5 },
    arcane_beam: { path: BASE_PATH, modelBase: 'bolt', extension: 'gltf', count: 1, color: '#8b5cf6', scale: 3.0, visualFx: { lifetime: 2 } },
    cataclysm: { path: BASE_PATH, modelBase: 'meteor', extension: 'gltf', count: 1, color: '#4c1d95', scale: 5.0, visualFx: { groundFx: 'burn' } },

    // --- SUMMONER (sm) ---
    summon_minion: { path: BASE_PATH, modelBase: 'spawn', extension: 'gltf', count: 1, color: '#84cc16', scale: 1.0 },
    toxic_blast: { path: BASE_PATH, modelBase: 'poison', extension: 'gltf', count: 1, color: '#65a30d', scale: 1.2 },
    root_bind: { path: BASE_PATH, modelBase: 'mine', extension: 'gltf', count: 1, color: '#3f6212', scale: 1.5 },
    life_link: { path: BASE_PATH, modelBase: 'buff', extension: 'gltf', count: 1, color: '#86efac', scale: 1.0 },
    swarm: { path: BASE_PATH, modelBase: 'cloud', extension: 'gltf', count: 1, color: '#166534', scale: 2.0 },
    enrage_pet: { path: BASE_PATH, modelBase: 'rage', extension: 'gltf', count: 1, color: '#ef4444', scale: 1.5 },
    beast_mode: { path: BASE_PATH, modelBase: 'rage', extension: 'gltf', count: 1, color: '#a3e635', scale: 3.0, visualFx: { trailType: 'particle' } },

    // --- BARD (bd) ---
    note_strike: { path: BASE_PATH, modelBase: 'shot', extension: 'gltf', count: 1, color: '#db2777', scale: 1.0 },
    healing_melody: { path: BASE_PATH, modelBase: 'heal', extension: 'gltf', count: 1, color: '#fbcfe8', scale: 1.5 },
    discord: { path: BASE_PATH, modelBase: 'shout', extension: 'gltf', count: 1, color: '#be185d', scale: 1.5 },
    speed_song: { path: BASE_PATH, modelBase: 'buff', extension: 'gltf', count: 1, color: '#f472b6', scale: 1.0 },
    lullaby: { path: BASE_PATH, modelBase: 'cloud', extension: 'gltf', count: 1, color: '#fce7f3', scale: 2.0 },
    inspiration: { path: BASE_PATH, modelBase: 'buff', extension: 'gltf', count: 1, color: '#fdf2f8', scale: 1.5 },
    grand_finale: { path: BASE_PATH, modelBase: 'meteor', extension: 'gltf', count: 1, color: '#ec4899', scale: 4.0, visualFx: { impactScale: 3.0 } },

    // --- CLERIC (cl) ---
    holy_light: { path: BASE_PATH, modelBase: 'bolt', extension: 'gltf', count: 1, color: '#fde047', scale: 1.0 },
    heal: { path: BASE_PATH, modelBase: 'heal', extension: 'gltf', count: 1, color: '#fef08a', scale: 1.5 },
    smite: { path: BASE_PATH, modelBase: 'slam', extension: 'gltf', count: 1, color: '#eab308', scale: 1.5 },
    bless: { path: BASE_PATH, modelBase: 'buff', extension: 'gltf', count: 1, color: '#fef9c3', scale: 1.2 },
    cleanse: { path: BASE_PATH, modelBase: 'buff', extension: 'gltf', count: 1, color: '#ffffff', scale: 1.2 },
    holy_fire: { path: BASE_PATH, modelBase: 'fire', extension: 'gltf', count: 1, color: '#fb923c', scale: 2.0, visualFx: { groundFx: 'burn' } },
    resurrection: { path: BASE_PATH, modelBase: 'heal', extension: 'gltf', count: 1, color: '#fbbf24', scale: 5.0, visualFx: { lifetime: 4 } },
};
