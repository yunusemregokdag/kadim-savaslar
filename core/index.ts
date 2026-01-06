// ═══════════════════════════════════════════════════════════════════════════
// CORE MODULE INDEX - Kadim Savaşlar
// Tüm core sistemlerin merkezi export noktası
// ═══════════════════════════════════════════════════════════════════════════

// Types
export * from './types';

// Skill Registry
export { SkillRegistry, registerSkills } from './SkillRegistry';

// Boss Phase
export {
    BossPhaseController,
    BossPhaseManager,
    DEFAULT_BOSS_PHASES
} from './BossPhaseController';
export type { BossPhaseEvent } from './BossPhaseController';

// Cast Pipeline
export {
    castSkillLocal,
    castSkillNetworkSafe,
    dealDamageNetworkSafe,
    validateCast,
    getCooldownRemaining,
    getCooldownRatio,
    canUseSkill,
    resetAllCooldowns,
    removePlayerCooldowns,
    clearAllCooldowns
} from './CastPipeline';
export type { CastValidationResult, CastResult, DealDamageParams, DealDamageResult } from './CastPipeline';

// Game Systems (from utils)
export {
    GameMode,
    CooldownManager,
    StatusManager,
    CombatLog,
    calculateDamage,
    getSkillMultiplier,
    getBossPhaseMultiplier,
    calculateRankTier,
    updateRankPoints
} from '../utils/GameSystems';
export type { StatusType, StatusEffect, CombatLogEntry, DamageContext, DamageResult, RankTier } from '../utils/GameSystems';
