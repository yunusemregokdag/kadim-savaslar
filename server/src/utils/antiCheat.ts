import { Socket } from 'socket.io';

interface PlayerMetrics {
    lastMoveTime: number;
    lastPosition: { x: number, y: number };
    moveCount: number;
    damageDealt: number;
    lastDamageTime: number;
    actionCount: number;
    actionResetTime: number;
    suspicionScore: number;
    warnings: string[];
    isBanned: boolean;
}

interface AntiCheatConfig {
    maxMoveSpeed: number;           // Max units per second
    maxDamagePerHit: number;        // Max damage in single hit
    maxActionsPerSecond: number;    // Max actions per second
    maxDamagePerMinute: number;     // Max total damage per minute
    suspicionThreshold: number;     // Score before auto-ban
    warningThreshold: number;       // Score before warning
}

const DEFAULT_CONFIG: AntiCheatConfig = {
    maxMoveSpeed: 50,               // 50 units per second max
    maxDamagePerHit: 10000,         // Max 10k damage per hit (high level players)
    maxActionsPerSecond: 20,        // 20 actions per second max
    maxDamagePerMinute: 500000,     // 500k damage per minute max
    suspicionThreshold: 100,        // Auto-ban at 100 suspicion
    warningThreshold: 50            // Warning at 50 suspicion
};

class AntiCheatSystem {
    private playerMetrics: Map<string, PlayerMetrics> = new Map();
    private config: AntiCheatConfig;
    private bannedPlayers: Set<string> = new Set();
    private suspiciousLogs: Array<{
        playerId: string,
        reason: string,
        timestamp: Date,
        data: any
    }> = [];

    constructor(config: Partial<AntiCheatConfig> = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
    }

    // Initialize player tracking
    initPlayer(playerId: string): void {
        this.playerMetrics.set(playerId, {
            lastMoveTime: Date.now(),
            lastPosition: { x: 0, y: 0 },
            moveCount: 0,
            damageDealt: 0,
            lastDamageTime: Date.now(),
            actionCount: 0,
            actionResetTime: Date.now(),
            suspicionScore: 0,
            warnings: [],
            isBanned: false
        });
    }

    // Clean up when player disconnects
    removePlayer(playerId: string): void {
        this.playerMetrics.delete(playerId);
    }

    // Check if player is banned
    isBanned(playerId: string): boolean {
        return this.bannedPlayers.has(playerId);
    }

    // Validate movement
    validateMove(playerId: string, newX: number, newY: number): { valid: boolean, reason?: string } {
        const metrics = this.playerMetrics.get(playerId);
        if (!metrics) {
            this.initPlayer(playerId);
            return { valid: true };
        }

        const now = Date.now();
        const timeDelta = (now - metrics.lastMoveTime) / 1000; // seconds

        if (timeDelta < 0.01) {
            // Too fast, likely packet spam
            return { valid: true }; // Allow but track
        }

        const distance = Math.sqrt(
            Math.pow(newX - metrics.lastPosition.x, 2) +
            Math.pow(newY - metrics.lastPosition.y, 2)
        );

        const speed = distance / timeDelta;

        if (speed > this.config.maxMoveSpeed) {
            this.addSuspicion(playerId, 5, 'speed_hack', { speed, maxSpeed: this.config.maxMoveSpeed });

            // Allow the move but flag it
            if (speed > this.config.maxMoveSpeed * 3) {
                // Extreme speed hack - reject
                return { valid: false, reason: 'Hareket hızı çok yüksek (hile tespit edildi)' };
            }
        }

        // Update metrics
        metrics.lastMoveTime = now;
        metrics.lastPosition = { x: newX, y: newY };
        metrics.moveCount++;

        return { valid: true };
    }

    // Validate damage
    validateDamage(playerId: string, damage: number, targetId: string): { valid: boolean, adjustedDamage: number, reason?: string } {
        const metrics = this.playerMetrics.get(playerId);
        if (!metrics) {
            this.initPlayer(playerId);
            return { valid: true, adjustedDamage: damage };
        }

        const now = Date.now();

        // Reset damage counter every minute
        if (now - metrics.lastDamageTime > 60000) {
            metrics.damageDealt = 0;
            metrics.lastDamageTime = now;
        }

        // Check single hit damage
        if (damage > this.config.maxDamagePerHit) {
            this.addSuspicion(playerId, 20, 'damage_hack', { damage, maxDamage: this.config.maxDamagePerHit });

            // Cap damage instead of rejecting
            const cappedDamage = this.config.maxDamagePerHit;
            metrics.damageDealt += cappedDamage;

            return {
                valid: true,
                adjustedDamage: cappedDamage,
                reason: 'Hasar sınırlandı'
            };
        }

        // Check total damage per minute
        metrics.damageDealt += damage;
        if (metrics.damageDealt > this.config.maxDamagePerMinute) {
            this.addSuspicion(playerId, 15, 'dps_hack', {
                totalDamage: metrics.damageDealt,
                maxDamage: this.config.maxDamagePerMinute
            });

            return {
                valid: false,
                adjustedDamage: 0,
                reason: 'Dakikalık hasar limiti aşıldı'
            };
        }

        return { valid: true, adjustedDamage: damage };
    }

    // Validate action rate (clicks, skill usage, etc.)
    validateAction(playerId: string, actionType: string): { valid: boolean, reason?: string } {
        const metrics = this.playerMetrics.get(playerId);
        if (!metrics) {
            this.initPlayer(playerId);
            return { valid: true };
        }

        const now = Date.now();

        // Reset action counter every second
        if (now - metrics.actionResetTime > 1000) {
            metrics.actionCount = 0;
            metrics.actionResetTime = now;
        }

        metrics.actionCount++;

        if (metrics.actionCount > this.config.maxActionsPerSecond) {
            this.addSuspicion(playerId, 3, 'action_spam', {
                actionType,
                count: metrics.actionCount
            });

            return { valid: false, reason: 'Çok fazla aksiyon (yavaşlayın)' };
        }

        return { valid: true };
    }

    // Validate gold/item transactions
    validateTransaction(playerId: string, type: 'gold' | 'gems' | 'item', amount: number, expected: number): { valid: boolean, reason?: string } {
        // Check if client reported value matches server expectation
        const tolerance = 0.1; // 10% tolerance for network delays
        const diff = Math.abs(amount - expected) / expected;

        if (diff > tolerance && expected > 0) {
            this.addSuspicion(playerId, 30, 'value_manipulation', {
                type,
                clientValue: amount,
                serverValue: expected,
                difference: diff * 100
            });

            return { valid: false, reason: 'Değer uyuşmazlığı tespit edildi' };
        }

        return { valid: true };
    }

    // Add suspicion points
    private addSuspicion(playerId: string, points: number, reason: string, data: any): void {
        const metrics = this.playerMetrics.get(playerId);
        if (!metrics) return;

        metrics.suspicionScore += points;
        metrics.warnings.push(`[${new Date().toISOString()}] ${reason}`);

        // Log suspicious activity
        this.suspiciousLogs.push({
            playerId,
            reason,
            timestamp: new Date(),
            data
        });

        console.log(`⚠️ Anti-Cheat: ${playerId} - ${reason} (+${points} suspicion, total: ${metrics.suspicionScore})`);

        // Check thresholds
        if (metrics.suspicionScore >= this.config.suspicionThreshold) {
            this.banPlayer(playerId, 'Otomatik yasak: Şüpheli aktivite eşik değeri aşıldı');
        }
    }

    // Ban a player
    banPlayer(playerId: string, reason: string): void {
        const metrics = this.playerMetrics.get(playerId);
        if (metrics) {
            metrics.isBanned = true;
        }
        this.bannedPlayers.add(playerId);

        console.log(`🚫 Anti-Cheat: ${playerId} BANNED - ${reason}`);

        // TODO: Persist ban to database
    }

    // Get player suspicion info
    getPlayerStatus(playerId: string): PlayerMetrics | null {
        return this.playerMetrics.get(playerId) || null;
    }

    // Get suspicious activity logs (for admin panel)
    getSuspiciousLogs(limit: number = 100): typeof this.suspiciousLogs {
        return this.suspiciousLogs.slice(-limit);
    }

    // Clear old logs (call periodically)
    cleanupLogs(maxAgeHours: number = 24): void {
        const cutoff = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);
        this.suspiciousLogs = this.suspiciousLogs.filter(log => log.timestamp > cutoff);
    }

    // Decay suspicion over time (call every minute)
    decaySuspicion(): void {
        for (const [playerId, metrics] of this.playerMetrics.entries()) {
            if (metrics.suspicionScore > 0) {
                metrics.suspicionScore = Math.max(0, metrics.suspicionScore - 1);
            }
        }
    }
}

// Singleton instance
export const antiCheat = new AntiCheatSystem();

// Middleware for socket events
export const createAntiCheatMiddleware = (io: any) => {
    // Start suspicion decay timer
    setInterval(() => antiCheat.decaySuspicion(), 60000);

    // Cleanup logs daily
    setInterval(() => antiCheat.cleanupLogs(24), 24 * 60 * 60 * 1000);

    return {
        onConnect: (socket: Socket) => {
            const playerId = socket.id;

            if (antiCheat.isBanned(playerId)) {
                socket.emit('banned', { reason: 'Hesabınız yasaklandı' });
                socket.disconnect();
                return false;
            }

            antiCheat.initPlayer(playerId);
            return true;
        },

        onDisconnect: (socket: Socket) => {
            antiCheat.removePlayer(socket.id);
        },

        validateMove: (playerId: string, x: number, y: number) => {
            return antiCheat.validateMove(playerId, x, y);
        },

        validateDamage: (playerId: string, damage: number, targetId: string) => {
            return antiCheat.validateDamage(playerId, damage, targetId);
        },

        validateAction: (playerId: string, actionType: string) => {
            return antiCheat.validateAction(playerId, actionType);
        }
    };
};

export default antiCheat;
