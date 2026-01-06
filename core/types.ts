// ═══════════════════════════════════════════════════════════════════════════
// CORE TYPES - Kadim Savaşlar
// Tüm sistemlerde kullanılan temel tipler
// ═══════════════════════════════════════════════════════════════════════════

export type SkillId = string;
export type EntityId = string;

// ═══════════════════════════════════════════════════════════════════════════
// SKILL CAST CONTEXT
// ═══════════════════════════════════════════════════════════════════════════
export interface SkillCastContext {
    casterId: EntityId;
    casterName?: string;
    targetId?: EntityId;
    targetName?: string;
    position: [number, number, number];
    targetPosition?: [number, number, number];
    direction?: [number, number, number];
    level: number;
    isPvP: boolean;
    timestamp: number;
    skillId: SkillId;
    skillName?: string;
    manaCost?: number;
    cooldown?: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// STATUS EFFECT TYPE
// ═══════════════════════════════════════════════════════════════════════════
export interface StatusEffectDef {
    id: string;
    name: string;
    duration: number;
    tickRate?: number;
    tickDamage?: number;
    value?: number;
    stackable?: boolean;
    maxStacks?: number;
    onApply?: (targetId: EntityId) => void;
    onTick?: (targetId: EntityId) => void;
    onEnd?: (targetId: EntityId) => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMBAT EVENT TYPE
// ═══════════════════════════════════════════════════════════════════════════
export interface CombatEvent {
    time: number;
    source: EntityId;
    sourceName?: string;
    target: EntityId;
    targetName?: string;
    skill: SkillId;
    skillName?: string;
    damage: number;
    isCritical: boolean;
    type: 'hit' | 'dot' | 'heal' | 'shield' | 'reflect';
}

// ═══════════════════════════════════════════════════════════════════════════
// ENTITY STATS
// ═══════════════════════════════════════════════════════════════════════════
export interface EntityStats {
    power: number;
    defense: number;
    critChance: number;
    critMultiplier: number;
    attackSpeed: number;
    moveSpeed: number;
    cooldownReduction: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// BOSS PHASE TYPE
// ═══════════════════════════════════════════════════════════════════════════
export type BossPhaseNumber = 1 | 2 | 3;

export interface BossPhaseConfig {
    phase: BossPhaseNumber;
    hpThreshold: number;
    auraColor: string;
    screenShake: boolean;
    soundEffect?: string;
    skillPriority?: SkillId[];
}

// ═══════════════════════════════════════════════════════════════════════════
// NETWORK PACKET TYPES
// ═══════════════════════════════════════════════════════════════════════════
export type NetworkPacketType =
    | 'CAST_SKILL'
    | 'DAMAGE_DEALT'
    | 'STATUS_APPLIED'
    | 'ENTITY_MOVE'
    | 'ENTITY_DIE'
    | 'BOSS_PHASE'
    | 'GAME_STATE';

export interface NetworkPacket {
    type: NetworkPacketType;
    timestamp: number;
    senderId: EntityId;
    payload: unknown;
}

// ═══════════════════════════════════════════════════════════════════════════
// SKILL HANDLER TYPE
// ═══════════════════════════════════════════════════════════════════════════
export type SkillHandler = (ctx: SkillCastContext) => void;

// ═══════════════════════════════════════════════════════════════════════════
// PVP RANK TYPES
// ═══════════════════════════════════════════════════════════════════════════
export type RankTier =
    | 'Bronze'
    | 'Silver'
    | 'Gold'
    | 'Platinum'
    | 'Diamond'
    | 'Master'
    | 'Grandmaster'
    | 'Legend';

// ═══════════════════════════════════════════════════════════════════════════
// GAME MODE TYPE
// ═══════════════════════════════════════════════════════════════════════════
export type GameModeType = 'PVE' | 'PVP';
