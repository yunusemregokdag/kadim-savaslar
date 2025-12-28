
// MMO Server Authoritative Schema

// 1. GLOBAL STATE
export interface GameWorld {
    zones: Record<number, ZoneData>;
}

export interface ZoneData {
    mobs: Map<string, MobInstance>;
    players: Map<string, PlayerInstance>;
    drops: Map<string, DropItem>;
}

// 2. ENTITIES
export interface MobInstance {
    id: string;
    typeId: string; // Refers to MobDefinitions config
    hp: number;
    x: number;
    y: number;
    rot: number;
    targetId: string | null;
    state: 'idle' | 'patrol' | 'chase' | 'attack' | 'dead';
    lastAttackTime: number;
}

export interface PlayerInstance {
    id: string;
    socketId: string;
    x: number;
    y: number;
    hp: number;
    inputSequence: number; // For reconciliation
}

// 3. NETWORKING (Snapshots)
export interface WorldSnapshot {
    timestamp: number;
    mobs: CompactMobData[];
    players: CompactPlayerData[];
    events: GameEvent[]; // Instant events like damage numbers, skill fx
}

// Optimization: Float32 Quantization for bandwidth
export interface CompactMobData {
    i: string; // id
    x: number; // x (int16 or float2)
    y: number;
    h: number; // hp
}

export interface GameEvent {
    type: 'damage' | 'heal' | 'spawn' | 'death';
    targetId: string;
    val: number;
    src?: string; // Source ID
}

export interface DropItem {
    id: string;
    itemId: string;
    x: number;
    y: number;
    ownerId?: string;
    createdAt: number;
}

export interface CompactPlayerData {
    i: string; // id
    x: number;
    y: number;
    h: number; // hp
    // Add other fields if necessary for reconciliation like input seq
    s?: number; // inputSequence
}
