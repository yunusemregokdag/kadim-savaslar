
import { MobInstance, GameWorld, GameEvent } from './types';
import { BossAI } from './BossAI';

export interface BossSchedule {
    bossId: string; // 'dragon_lord'
    zoneId: number;
    pos: { x: number, y: number };
    respawnTimeSec: number;
}

export class WorldBossManager {
    private activeBosses: Map<string, BossAI> = new Map();
    private world: GameWorld;

    constructor(world: GameWorld) {
        this.world = world;
    }

    public spawnBoss(config: BossSchedule) {
        const zone = this.world.zones[config.zoneId];
        if (!zone) return;

        const bossId = `wb_${config.bossId}_${Date.now()}`;
        const bossInstance: MobInstance = {
            id: bossId,
            typeId: config.bossId,
            hp: 1000000, // Should come from config
            x: config.pos.x,
            y: config.pos.y,
            rot: 0,
            targetId: null,
            state: 'idle',
            lastAttackTime: 0
        };

        // Add to Zone
        zone.mobs.set(bossId, bossInstance);

        // Attach Controller
        const ai = new BossAI(bossInstance, zone, config.bossId);
        this.activeBosses.set(bossId, ai);

        console.log(`👹 World Boss Spawned: ${config.bossId} in Zone ${config.zoneId}`);
    }

    /**
     * Main Tick - Attach this to GameEngine loop
     */
    public tick(outEvents: GameEvent[]) {
        const now = Date.now();
        this.activeBosses.forEach((ai, _id) => {
            // Cleanup if dead
            // (In real logic, we'd handle respawn timers here)
            ai.tick(now, outEvents);
        });
    }

    // TODO: Contribution tracking integration
    // public onDamage(playerId: string, bossId: string, amount: number) { ... }
}
