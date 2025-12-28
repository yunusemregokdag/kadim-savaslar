
import { MobInstance, GameEvent, ZoneData } from './types';
import { BossPhase, BOSS_PHASE_CONFIGS } from './BossPhases';

export class BossAI {
    private boss: MobInstance;
    // private zone: ZoneData; // Unused
    private currentPhaseIndex: number = 0;
    private configPhases: BossPhase[];
    private lastTick: number = 0;

    // AI Tick Rate: 5Hz (Every 200ms) to save CPU
    private readonly TICK_RATE_MS = 200;

    constructor(boss: MobInstance, _zone: ZoneData, bossTypeId: string) {
        this.boss = boss;
        // this.zone = zone;
        this.configPhases = BOSS_PHASE_CONFIGS[bossTypeId] || [];
        this.lastTick = Date.now();
    }

    public tick(now: number, outEvents: GameEvent[]) {
        if (now - this.lastTick < this.TICK_RATE_MS) return;
        this.lastTick = now;

        if (this.boss.state === 'dead') return;

        this.checkPhases(outEvents);
        this.executeMechanics(outEvents);
    }

    private checkPhases(outEvents: GameEvent[]) {
        if (this.currentPhaseIndex >= this.configPhases.length) return;

        // Assuming MaxHP is 1000000 for now, ideally passed in config
        // In real app, MobInstance would have maxHp.
        const maxHp = 1000000;
        const hpPct = this.boss.hp / maxHp;

        const nextPhase = this.configPhases[this.currentPhaseIndex];
        if (hpPct <= nextPhase.thresholdPct) {
            this.triggerPhase(nextPhase, outEvents);
            this.currentPhaseIndex++;
        }
    }

    private triggerPhase(phase: BossPhase, outEvents: GameEvent[]) {
        // Visual Event
        outEvents.push({
            type: 'spawn', // Reusing spawn for generic "Big Event" visual
            targetId: this.boss.id,
            val: 0,
            src: 'PHASE_CHANGE'
        });

        // Broadcast Announcement (Chat/System Message)
        // In a real system, we'd push to a chat service here
        console.log(`[BOSS] ${phase.announcement}`);

        // Apply stat changes
        // e.g. this.boss.stats.damageMult = phase.damageMultiplier;
    }

    private executeMechanics(_outEvents: GameEvent[]) {
        // Example: Periodic AOE if in 'lava_floor' phase?
        // Logic would go here

        // Simple Target Switching for Threat
        // (Combatsystem handles main threat generation, AI just reads it)
    }
}
