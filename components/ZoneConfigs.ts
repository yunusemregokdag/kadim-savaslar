
export interface MobSpawnRule {
    mobId: string; // Must match a key in MOB_TYPES (MobDefinitions.ts)
    weight: number; // Probability weight (e.g. 60 = 60%)
    minLevel: number;
    maxLevel: number;
}

export interface ZoneConfig {
    id: number;
    name: string;
    mobCap: number; // Max concurrent mobs in zone
    respawnTime: number; // Milliseconds to respawn dead mobs
    mobs: MobSpawnRule[];
    boss?: {
        bossId: string; // Must match MOB_TYPES
        spawnChance: number; // 0.0 - 1.0
        cooldown: number; // Milliseconds
    };
}

// Config-Driven Zone Logic
// Defines WHICH mobs spawn WHERE, without changing AI code.
export const ZONE_CONFIGS: Record<number, ZoneConfig> = {
    // --- ZONE 1: STARTING FOREST ---
    1: {
        id: 1, name: 'Başlangıç Ormanı', mobCap: 15, respawnTime: 10000,
        mobs: [
            { mobId: 'slime_green', weight: 70, minLevel: 1, maxLevel: 3 },
            { mobId: 'wolf_grey', weight: 30, minLevel: 3, maxLevel: 5 }
        ]
    },

    // --- ZONE 11: CRYSTAL CAVES (Marsu) ---
    11: {
        id: 11, name: 'Marsu Mağaraları', mobCap: 20, respawnTime: 15000,
        mobs: [
            { mobId: 'bat_giant', weight: 50, minLevel: 10, maxLevel: 12 },
            { mobId: 'skeleton_warrior', weight: 50, minLevel: 12, maxLevel: 15 }
        ],
        boss: { bossId: 'boss_king', spawnChance: 0.05, cooldown: 300000 } // 5 min CD
    },

    // --- ZONE 21: CRYSTAL CAVES (Terya) ---
    21: {
        id: 21, name: 'Terya Mağaraları', mobCap: 20, respawnTime: 15000,
        mobs: [
            { mobId: 'slime_blue', weight: 60, minLevel: 10, maxLevel: 13 },
            { mobId: 'bat_giant', weight: 40, minLevel: 12, maxLevel: 14 }
        ],
        // Different boss or rare mob could be configured here
    },

    // --- ZONE 99: DUNGEON (Event) ---
    99: {
        id: 99, name: 'Slime Zindanı', mobCap: 30, respawnTime: 5000, // Fast respawn
        mobs: [
            { mobId: 'slime_green', weight: 50, minLevel: 25, maxLevel: 30 },
            { mobId: 'slime_blue', weight: 50, minLevel: 28, maxLevel: 32 }
        ],
        boss: { bossId: 'boss_slime_king', spawnChance: 1.0, cooldown: 60000 } // Always spawn boss if dead
    }
};
