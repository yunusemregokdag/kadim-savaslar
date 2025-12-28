
import { Server } from 'socket.io';
import { GameWorld, ZoneData, MobInstance, WorldSnapshot } from './types';

export class GameEngine {
    private io: Server;
    private world: GameWorld = { zones: {} };
    private TICK_RATE = 20; // 20 Updates per second (50ms)
    private interval: NodeJS.Timeout | null = null;

    constructor(io: Server) {
        this.io = io;
        // Initialize Zones (Mock)
        this.world.zones[1] = { mobs: new Map(), players: new Map(), drops: new Map() };
    }

    public start() {
        console.log(`⚔️ Game Engine Started (Tick: ${this.TICK_RATE}Hz)`);
        this.interval = setInterval(() => this.gameLoop(), 1000 / this.TICK_RATE);
    }

    public stop() {
        if (this.interval) clearInterval(this.interval);
    }

    // --- MAIN LOOP ---
    private gameLoop() {
        const now = Date.now();

        // Iterate all active zones
        for (const [id, zone] of Object.entries(this.world.zones)) {
            const zoneId = Number(id);
            if (zone.players.size === 0 && zone.mobs.size === 0) continue; // Skip empty zones (Optimization)

            // 1. Update Mobs (AI)
            const mobUpdates: any[] = [];
            zone.mobs.forEach(mob => {
                this.updateMob(mob, zone);
                // Quantize data for bandwidth
                if (mob.state !== 'dead') {
                    mobUpdates.push({ i: mob.id, x: Math.round(mob.x * 10) / 10, y: Math.round(mob.y * 10) / 10, h: mob.hp });
                }
            });

            // 2. Prepare Snapshot
            const snapshot: WorldSnapshot = {
                timestamp: now,
                mobs: mobUpdates, // Client interpolates these
                players: [], // Add player sync here
                events: [] // Combat events
            };

            // 3. Broadcast to Zone (Interest Management would filter here)
            this.io.to(`zone_${zoneId}`).emit('w_update', snapshot);
        }
    }

    // --- AI LOGIC (Server Side) ---
    private updateMob(mob: MobInstance, zone: ZoneData) {
        if (mob.state === 'dead') return;

        // Simple Aggro Check
        if (!mob.targetId) {
            // Scan for nearby players
            for (const [pid, player] of zone.players) {
                const dist = Math.sqrt(Math.pow(player.x - mob.x, 2) + Math.pow(player.y - mob.y, 2));
                if (dist < 10) { // Aggro Range
                    mob.targetId = pid;
                    mob.state = 'chase';
                    break;
                }
            }
        }

        // Chase Logic
        if (mob.targetId && zone.players.has(mob.targetId)) {
            const target = zone.players.get(mob.targetId)!;
            const dx = target.x - mob.x;
            const dy = target.y - mob.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 1.5) {
                // Move
                const speed = 0.05; // Base speed per tick
                mob.x += (dx / dist) * speed;
                mob.y += (dy / dist) * speed;
                mob.rot = Math.atan2(dx, dy);
            } else {
                // Attack
                if (Date.now() - mob.lastAttackTime > 1500) {
                    mob.lastAttackTime = Date.now();
                    // Queue Attack Event
                }
            }
        }
    }

    // --- EXTERNAL API ---
    public addPlayer(socketId: string, zoneId: number, data: any) {
        if (!this.world.zones[zoneId]) this.world.zones[zoneId] = { mobs: new Map(), players: new Map(), drops: new Map() };
        this.world.zones[zoneId].players.set(socketId, { ...data, socketId, inputSequence: 0 });
    }

    public removePlayer(socketId: string) {
        // Find and remove from all zones
        for (const zone of Object.values(this.world.zones)) {
            zone.players.delete(socketId);
        }
    }

    public handleInput(socketId: string, zoneId: number, input: any) {
        const zone = this.world.zones[zoneId];
        if (!zone) return;
        const player = zone.players.get(socketId);
        if (player) {
            // Server Authoritative Movement Validation
            // player.x = input.x (with speed check)
            player.x = input.x;
            player.y = input.y;
            player.inputSequence = input.seq;
        }
    }
}
