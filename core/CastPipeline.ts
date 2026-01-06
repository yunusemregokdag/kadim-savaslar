// ═══════════════════════════════════════════════════════════════════════════
// CAST PIPELINE - Kadim Savaşlar
// Network-ready skill casting sistemi
// Client prediction + Server validation yapısı
// ═══════════════════════════════════════════════════════════════════════════

import { SkillId, SkillCastContext, EntityId, NetworkPacket } from './types';
import { SkillRegistry } from './SkillRegistry';
import { CooldownManager, CombatLog, GameMode, calculateDamage } from '../utils/GameSystems';

// ═══════════════════════════════════════════════════════════════════════════
// PLAYER COOLDOWN INSTANCES
// ═══════════════════════════════════════════════════════════════════════════
const playerCooldowns = new Map<EntityId, CooldownManager>();

function getPlayerCooldowns(playerId: EntityId): CooldownManager {
    if (!playerCooldowns.has(playerId)) {
        playerCooldowns.set(playerId, new CooldownManager());
    }
    return playerCooldowns.get(playerId)!;
}

// ═══════════════════════════════════════════════════════════════════════════
// CAST VALIDATION
// ═══════════════════════════════════════════════════════════════════════════
export interface CastValidationResult {
    canCast: boolean;
    reason?: 'cooldown' | 'mana' | 'stunned' | 'silenced' | 'dead' | 'skill_not_found';
    cooldownRemaining?: number;
}

export function validateCast(
    playerId: EntityId,
    skillId: SkillId,
    cooldownMs: number,
    playerMana?: number,
    manaCost?: number,
    isStunned?: boolean,
    isSilenced?: boolean,
    isDead?: boolean
): CastValidationResult {
    // Ölü mü?
    if (isDead) {
        return { canCast: false, reason: 'dead' };
    }

    // Stunned mı?
    if (isStunned) {
        return { canCast: false, reason: 'stunned' };
    }

    // Silenced mı?
    if (isSilenced) {
        return { canCast: false, reason: 'silenced' };
    }

    // Skill var mı?
    if (!SkillRegistry.has(skillId)) {
        return { canCast: false, reason: 'skill_not_found' };
    }

    // Cooldown kontrol
    const cooldowns = getPlayerCooldowns(playerId);
    if (!cooldowns.canUse(skillId)) {
        return {
            canCast: false,
            reason: 'cooldown',
            cooldownRemaining: cooldowns.getRemaining(skillId)
        };
    }

    // Mana kontrol
    if (playerMana !== undefined && manaCost !== undefined && playerMana < manaCost) {
        return { canCast: false, reason: 'mana' };
    }

    return { canCast: true };
}

// ═══════════════════════════════════════════════════════════════════════════
// CAST SKILL (LOCAL)
// ═══════════════════════════════════════════════════════════════════════════
export interface CastResult {
    success: boolean;
    reason?: string;
}

export function castSkillLocal(
    skillId: SkillId,
    ctx: SkillCastContext,
    cooldownMs: number
): CastResult {
    const validation = validateCast(ctx.casterId, skillId, cooldownMs);

    if (!validation.canCast) {
        return { success: false, reason: validation.reason };
    }

    // Cooldown başlat
    const cooldowns = getPlayerCooldowns(ctx.casterId);
    cooldowns.use(skillId, cooldownMs);

    // Skill'i çalıştır
    const success = SkillRegistry.cast(skillId, ctx);

    if (success) {
        console.log(`[CastPipeline] ${ctx.casterName || ctx.casterId} cast ${skillId}`);
    }

    return { success };
}

// ═══════════════════════════════════════════════════════════════════════════
// CAST SKILL (NETWORK-READY)
// Client prediction + Server packet
// ═══════════════════════════════════════════════════════════════════════════
export function castSkillNetworkSafe(
    skillId: SkillId,
    ctx: SkillCastContext,
    cooldownMs: number,
    socket?: { send: (data: unknown) => void }
): CastResult {
    // 1. Local prediction (anında oynat)
    const result = castSkillLocal(skillId, ctx, cooldownMs);

    if (!result.success) {
        return result;
    }

    // 2. Server'a gönder (eğer socket varsa)
    if (socket) {
        const packet: NetworkPacket = {
            type: 'CAST_SKILL',
            timestamp: performance.now(),
            senderId: ctx.casterId,
            payload: {
                skillId,
                ctx,
                cooldownMs
            }
        };

        socket.send(packet);
    }

    return result;
}

// ═══════════════════════════════════════════════════════════════════════════
// DEAL DAMAGE (NETWORK-READY)
// ═══════════════════════════════════════════════════════════════════════════
export interface DealDamageParams {
    attackerId: EntityId;
    attackerName?: string;
    targetId: EntityId;
    targetName?: string;
    baseDamage: number;
    attackerPower: number;
    attackerLevel: number;
    targetDefense?: number;
    targetLevel?: number;
    isBoss?: boolean;
    skillId?: SkillId;
    skillName?: string;
    critChance?: number;
    critMultiplier?: number;
}

export interface DealDamageResult {
    finalDamage: number;
    isCritical: boolean;
}

export function dealDamageNetworkSafe(
    params: DealDamageParams,
    socket?: { send: (data: unknown) => void }
): DealDamageResult {
    // Hasar hesapla
    const result = calculateDamage({
        baseDamage: params.baseDamage,
        attackerPower: params.attackerPower,
        attackerLevel: params.attackerLevel,
        targetDefense: params.targetDefense,
        targetLevel: params.targetLevel,
        isBoss: params.isBoss,
        isPvP: GameMode.isPVP(),
        critChance: params.critChance,
        critMultiplier: params.critMultiplier
    });

    // Combat log'a kaydet
    CombatLog.log({
        attackerId: params.attackerId,
        attackerName: params.attackerName || params.attackerId,
        targetId: params.targetId,
        targetName: params.targetName || params.targetId,
        skillId: params.skillId,
        skillName: params.skillName,
        damage: result.finalDamage,
        isCritical: result.isCritical,
        damageType: 'physical' // TODO: skill'e göre belirle
    });

    // Server'a gönder
    if (socket) {
        const packet: NetworkPacket = {
            type: 'DAMAGE_DEALT',
            timestamp: performance.now(),
            senderId: params.attackerId,
            payload: {
                ...params,
                finalDamage: result.finalDamage,
                isCritical: result.isCritical
            }
        };

        socket.send(packet);
    }

    return result;
}

// ═══════════════════════════════════════════════════════════════════════════
// COOLDOWN HELPERS
// ═══════════════════════════════════════════════════════════════════════════
export function getCooldownRemaining(playerId: EntityId, skillId: SkillId): number {
    return getPlayerCooldowns(playerId).getRemaining(skillId);
}

export function getCooldownRatio(playerId: EntityId, skillId: SkillId, totalCd: number): number {
    return getPlayerCooldowns(playerId).getRatio(skillId, totalCd);
}

export function canUseSkill(playerId: EntityId, skillId: SkillId): boolean {
    return getPlayerCooldowns(playerId).canUse(skillId);
}

export function resetAllCooldowns(playerId: EntityId): void {
    getPlayerCooldowns(playerId).resetAll();
}

// ═══════════════════════════════════════════════════════════════════════════
// CLEANUP
// ═══════════════════════════════════════════════════════════════════════════
export function removePlayerCooldowns(playerId: EntityId): void {
    playerCooldowns.delete(playerId);
}

export function clearAllCooldowns(): void {
    playerCooldowns.clear();
}

export default {
    castSkillLocal,
    castSkillNetworkSafe,
    dealDamageNetworkSafe,
    validateCast,
    getCooldownRemaining,
    getCooldownRatio,
    canUseSkill,
    resetAllCooldowns
};
