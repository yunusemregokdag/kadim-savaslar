
export interface MobConfig {
    id: string;
    name: string;
    level: number;
    stats: { hp: number; damage: number; speed: number; exp: number };
    visual: { modelBase: string; scale: number; color?: string };
    // ENHANCED AI CONFIG (Data Only)
    aiSchema: {
        behavior: 'passive' | 'aggressive' | 'ambush' | 'boss';
        combatStyle: 'melee' | 'ranged' | 'magic';
        movePattern: 'idle' | 'patrol' | 'charge';
        aggroRadius: number;
        attackRange: number;
        attackSpeed: number; // ms
        bossPhases?: { hpThreshold: number; type: 'enrage' | 'summon' }[];
    };
    lootTable?: { itemId: string, chance: number }[];
}

export const MOB_TYPES: Record<string, MobConfig> = {
    // --- TIER 1 ---
    'slime_green': {
        id: 'slime_green', name: 'Yeşil Slime', level: 1,
        stats: { hp: 50, damage: 5, speed: 0.03, exp: 10 },
        visual: { modelBase: 'slime', scale: 0.8, color: '#4ade80' },
        aiSchema: { behavior: 'passive', combatStyle: 'melee', movePattern: 'idle', aggroRadius: 8, attackRange: 1.5, attackSpeed: 2000 },
        lootTable: [{ itemId: 'herb_green', chance: 0.3 }]
    },
    'wolf_grey': {
        id: 'wolf_grey', name: 'Bozkurt', level: 5,
        stats: { hp: 150, damage: 15, speed: 0.06, exp: 40 },
        visual: { modelBase: 'wolf', scale: 1.0, color: '#94a3b8' },
        aiSchema: { behavior: 'aggressive', combatStyle: 'melee', movePattern: 'patrol', aggroRadius: 12, attackRange: 2, attackSpeed: 1200 }
    },

    // --- TIER 2 ---
    'goblin_scout': {
        id: 'goblin_scout', name: 'Goblin Gözcü', level: 8,
        stats: { hp: 120, damage: 18, speed: 0.05, exp: 50 },
        visual: { modelBase: 'goblin', scale: 0.85, color: '#84cc16' },
        aiSchema: { behavior: 'ambush', combatStyle: 'melee', movePattern: 'patrol', aggroRadius: 10, attackRange: 1.8, attackSpeed: 1500 }
    },
    'bat_giant': {
        id: 'bat_giant', name: 'Dev Yarasa', level: 12,
        stats: { hp: 200, damage: 25, speed: 0.07, exp: 80 },
        visual: { modelBase: 'bat', scale: 1.2, color: '#475569' },
        aiSchema: { behavior: 'aggressive', combatStyle: 'melee', movePattern: 'charge', aggroRadius: 15, attackRange: 1.5, attackSpeed: 1000 }
    },
    'skeleton_mage': {
        id: 'skeleton_mage', name: 'İskelet Büyücü', level: 16,
        stats: { hp: 300, damage: 40, speed: 0.03, exp: 150 },
        visual: { modelBase: 'skeleton', scale: 1.0, color: '#a855f7' },
        aiSchema: { behavior: 'aggressive', combatStyle: 'ranged', movePattern: 'idle', aggroRadius: 18, attackRange: 10, attackSpeed: 3000 }
    },

    // --- BOSSES ---
    'boss_slime_king': {
        id: 'boss_slime_king', name: 'Slime Kralı', level: 10,
        stats: { hp: 5000, damage: 50, speed: 0.03, exp: 1000 },
        visual: { modelBase: 'slime', scale: 3.0, color: '#facc15' },
        aiSchema: {
            behavior: 'boss', combatStyle: 'melee', movePattern: 'idle', aggroRadius: 20, attackRange: 3, attackSpeed: 1800,
            bossPhases: [{ hpThreshold: 0.5, type: 'enrage' }]
        },
        lootTable: [{ itemId: 'slime_crown', chance: 1.0 }]
    },
    'boss_ancient_guardian': {
        id: 'boss_ancient_guardian', name: 'Kadim Muhafız', level: 25,
        stats: { hp: 15000, damage: 120, speed: 0.04, exp: 5000 },
        visual: { modelBase: 'golem', scale: 3.5, color: '#ef4444' },
        aiSchema: {
            behavior: 'boss', combatStyle: 'melee', movePattern: 'charge', aggroRadius: 30, attackRange: 4, attackSpeed: 3000,
            bossPhases: [{ hpThreshold: 0.7, type: 'summon' }, { hpThreshold: 0.3, type: 'enrage' }]
        }
    },
    'boss_stone_golem': {
        id: 'boss_stone_golem', name: 'Taş Golem', level: 30,
        stats: { hp: 20000, damage: 150, speed: 0.03, exp: 8000 },
        visual: { modelBase: 'stone_golem', scale: 3.0, color: '#78716c' },
        aiSchema: { behavior: 'boss', combatStyle: 'melee', movePattern: 'charge', aggroRadius: 25, attackRange: 3.5, attackSpeed: 2500, bossPhases: [{ hpThreshold: 0.5, type: 'enrage' }] }
    },
    'boss_ice_giant': {
        id: 'boss_ice_giant', name: 'Buz Devi', level: 40,
        stats: { hp: 35000, damage: 250, speed: 0.025, exp: 12000 },
        visual: { modelBase: 'ice_giant', scale: 3.5, color: '#0ea5e9' },
        aiSchema: { behavior: 'boss', combatStyle: 'melee', movePattern: 'charge', aggroRadius: 30, attackRange: 4, attackSpeed: 3000, bossPhases: [{ hpThreshold: 0.6, type: 'summon' }] }
    },
    'boss_fire_dragon': {
        id: 'boss_fire_dragon', name: 'Ateş Ejderhası', level: 50,
        stats: { hp: 60000, damage: 500, speed: 0.04, exp: 25000 },
        visual: { modelBase: 'fire_dragon', scale: 4.0, color: '#f97316' },
        aiSchema: { behavior: 'boss', combatStyle: 'ranged', movePattern: 'charge', aggroRadius: 40, attackRange: 15, attackSpeed: 2000, bossPhases: [{ hpThreshold: 0.4, type: 'enrage' }] }
    },
    'boss_shadow_lord': {
        id: 'boss_shadow_lord', name: 'Gölge Lordu', level: 60,
        stats: { hp: 80000, damage: 800, speed: 0.05, exp: 50000 },
        visual: { modelBase: 'shadow_lord', scale: 2.5, color: '#4c1d95' },
        aiSchema: { behavior: 'boss', combatStyle: 'magic', movePattern: 'patrol', aggroRadius: 35, attackRange: 12, attackSpeed: 1500, bossPhases: [{ hpThreshold: 0.8, type: 'summon' }, { hpThreshold: 0.3, type: 'enrage' }] }
    }
};
