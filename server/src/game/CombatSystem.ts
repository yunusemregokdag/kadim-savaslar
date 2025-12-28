
import { MobInstance } from './types';

// Enums for Event Types (Must match protocol)
const EV_DAMAGE = 1;
const EV_HEAL = 2;
const EV_DEATH = 3;

export class CombatSystem {
    // Aggro Map: MobID -> Map<PlayerID, ThreatValue>
    private threatMap: Map<string, Map<string, number>> = new Map();

    /**
     * ⚔️ PROCESS ATTACK INPUT (Server Authoritative)
     * Handles damage calculation, critical hits, hp updates, and threat generation.
     */
    public resolveAttack(
        attackerId: string,
        skillId: string,
        target: MobInstance,
        outEvents: any[]
    ): void {
        if (target.state === 'dead' || target.hp <= 0) return;

        // 1. DAMAGE CALC FORMULA
        // TODO: Retrieve stats from Player/Mob config
        let damage = 25; // Base Damage Mock

        // Crit Check (10%)
        const isCrit = Math.random() < 0.1;
        if (isCrit) damage *= 2.0;

        // Apply Damage
        target.hp -= damage;
        if (target.hp < 0) target.hp = 0;

        // 2. THREAT UPDATE
        this.addThreat(target.id, attackerId, damage);

        // 3. GENERATE VISUAL EVENT
        // This is sent to client for parsing "floating text"
        outEvents.push({
            type: EV_DAMAGE,
            src: attackerId, // Mapping to UINT required for Proto usually
            dst: target.id,  // Target ID
            val: damage,
            meta: isCrit ? 'crit' : ''
        });

        // 4. DEATH CHECK
        if (target.hp === 0) {
            target.state = 'dead';
            this.threatMap.delete(target.id); // Clear aggro

            outEvents.push({
                type: EV_DEATH,
                dst: target.id,
                val: 0
            });

            // Trigger Loot Drop Logic here...
        }
    }

    /**
     * 🛡️ AGGRO SYSTEM (Threat Table)
     * Mobs target the player with the highest threat.
     */
    public addThreat(mobId: string, playerId: string, amount: number) {
        if (!this.threatMap.has(mobId)) {
            this.threatMap.set(mobId, new Map());
        }

        const table = this.threatMap.get(mobId)!;
        const current = table.get(playerId) || 0;
        table.set(playerId, current + amount);
    }

    public getTopThreat(mobId: string): string | null {
        const table = this.threatMap.get(mobId);
        if (!table || table.size === 0) return null;

        let topPlayer: string | null = null;
        let maxThreat = -1;

        // Simple Loop - Optimization: Maintenance on add
        for (const [pid, val] of table.entries()) {
            if (val > maxThreat) {
                maxThreat = val;
                topPlayer = pid;
            }
        }

        return topPlayer;
    }

    public clearThreat(mobId: string) {
        this.threatMap.delete(mobId);
    }
}
