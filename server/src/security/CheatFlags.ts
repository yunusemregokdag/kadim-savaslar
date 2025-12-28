
export enum CheatViolation {
    SPEED_HACK = 'SPEED_HACK',
    TELEPORT = 'TELEPORT',
    ATTACK_SPEED = 'ATTACK_SPEED',
    INVALID_COORD = 'INVALID_COORD'
}

interface ViolationRecord {
    count: number;
    lastViolation: number;
}

export class CheatFlags {
    private static violations: Map<string, Map<CheatViolation, ViolationRecord>> = new Map();

    private static readonly THRESHOLDS = {
        [CheatViolation.SPEED_HACK]: { limit: 5, window: 60000 }, // 5 flags in 1 min
        [CheatViolation.TELEPORT]: { limit: 3, window: 60000 },
        [CheatViolation.ATTACK_SPEED]: { limit: 5, window: 60000 },
        [CheatViolation.INVALID_COORD]: { limit: 1, window: 60000 },
    };

    public static flag(playerId: string, type: CheatViolation, severity: number = 1) {
        if (!this.violations.has(playerId)) {
            this.violations.set(playerId, new Map());
        }

        const playerStats = this.violations.get(playerId)!;
        if (!playerStats.has(type)) {
            playerStats.set(type, { count: 0, lastViolation: Date.now() });
        }

        const stats = playerStats.get(type)!;
        const now = Date.now();
        const config = this.THRESHOLDS[type];

        // Reset if window passed
        if (now - stats.lastViolation > config.window) {
            stats.count = 0;
        }

        stats.count += severity;
        stats.lastViolation = now;

        console.warn(`[🛡️ AntiCheat] Player ${playerId} flagged for ${type}. Count: ${stats.count}/${config.limit}`);

        if (stats.count >= config.limit) {
            this.punish(playerId, type);
        }
    }

    private static punish(playerId: string, type: CheatViolation) {
        console.error(`[🚨 KICK] Player ${playerId} kicked for excessive ${type}`);
        // In real connection, socket.disconnect() would happen here
        // EventBus.emit('player_kick', { playerId, reason: type });
    }
}
