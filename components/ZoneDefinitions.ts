
export interface ZoneConfig {
    id: number;
    name: string;
    // PURE DATA Ambient Settings (No Logic)
    ambient: {
        skyColor: string;
        fogColor: string;
        fogDensity: number; // 0.0 - 0.1
        lightIntensity: number; // 0.0 - 2.0
        rainChance: number; // 0.0 - 1.0
    };
    rules: {
        maxMobs: number;
        respawnTime: number;
        isSafeZone: boolean;
        pvpEnabled: boolean;
    };
    mobPool: {
        mobId: string;       // Matches MobDefinitions
        weight: number;
        minLevel: number;
        maxLevel: number;
        groupSize: number;   // Spawn as pack?
    }[];
    bossRule?: {
        mobId: string;
        spawnType: 'timer' | 'kill_count';
        spawnValue: number; // ms or kill count
        announcement: string;
    };
}

export const ZONES: Record<number, ZoneConfig> = {
    // 1: STARTING FOREST
    1: {
        id: 1, name: 'Başlangıç Ormanı',
        ambient: { skyColor: '#87CEEB', fogColor: '#E0F7FA', fogDensity: 0.02, lightIntensity: 1.2, rainChance: 0.1 },
        rules: { maxMobs: 20, respawnTime: 10000, isSafeZone: false, pvpEnabled: false },
        mobPool: [
            { mobId: 'slime_green', weight: 60, minLevel: 1, maxLevel: 3, groupSize: 1 },
            { mobId: 'wolf_grey', weight: 40, minLevel: 3, maxLevel: 5, groupSize: 2 }
        ]
    },

    // 11: CRYSTAL CAVES
    11: {
        id: 11, name: 'Karanlık Mağara',
        ambient: { skyColor: '#0f172a', fogColor: '#1e1b4b', fogDensity: 0.05, lightIntensity: 0.5, rainChance: 0.0 },
        rules: { maxMobs: 25, respawnTime: 15000, isSafeZone: false, pvpEnabled: true },
        mobPool: [
            { mobId: 'bat_giant', weight: 50, minLevel: 10, maxLevel: 13, groupSize: 3 },
            { mobId: 'skeleton_warrior', weight: 50, minLevel: 12, maxLevel: 15, groupSize: 1 }
        ],
        bossRule: { mobId: 'boss_ancient_guardian', spawnType: 'timer', spawnValue: 300000, announcement: 'Kadim Muhafız uyandı!' }
    },

    // 99: BOSS DUNGEON
    99: {
        id: 99, name: 'Slime Zindanı',
        ambient: { skyColor: '#052e16', fogColor: '#14532d', fogDensity: 0.08, lightIntensity: 0.8, rainChance: 0.0 },
        rules: { maxMobs: 30, respawnTime: 5000, isSafeZone: false, pvpEnabled: true },
        mobPool: [
            { mobId: 'slime_blue', weight: 100, minLevel: 25, maxLevel: 35, groupSize: 1 }
        ],
        bossRule: { mobId: 'boss_slime_king', spawnType: 'timer', spawnValue: 60000, announcement: 'Slime Kralı tahtına oturdu!' }
    }
};
