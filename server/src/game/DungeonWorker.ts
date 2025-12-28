
import { parentPort, workerData } from 'worker_threads';

// Mock Dungeon Logic for Performance Demo
// In a real implementation, this would handle physics, AI, and game state for a single dungeon instance.

interface DungeonState {
    instanceId: string;
    zoneId: number;
    players: Map<string, { x: number, y: number, hp: number }>;
    mobs: any[];
    isActive: boolean;
    tickCount: number;
}

const state: DungeonState = {
    instanceId: workerData.instanceId,
    zoneId: workerData.zoneId,
    players: new Map(),
    mobs: [],
    isActive: true,
    tickCount: 0
};

// Initialize Mobs based on Zone ID
function initMobs() {
    // Simulate "heavy" initialization logic locally
    const mobCount = 20;
    for (let i = 0; i < mobCount; i++) {
        state.mobs.push({
            id: `mob_${i}`,
            type: 'skeleton',
            x: Math.random() * 50 - 25,
            y: Math.random() * 50 - 25,
            hp: 100
        });
    }
}

initMobs();

// Game Loop
const TICK_RATE = 20; // updates per second
const interval = setInterval(() => {
    if (!state.isActive) return;

    state.tickCount++;

    // Simple AI Tick (Move mobs towards nearest player)
    state.mobs.forEach(mob => {
        // Mock AI calculation
        mob.x += (Math.random() - 0.5) * 0.1;
        mob.y += (Math.random() - 0.5) * 0.1;
    });

    // Send Snapshot
    if (parentPort && state.players.size > 0 && state.tickCount % 5 === 0) {
        parentPort.postMessage({
            type: 'SNAPSHOT',
            instanceId: state.instanceId,
            mobs: state.mobs,
            timestamp: Date.now()
        });
    }

}, 1000 / TICK_RATE);


if (parentPort) {
    parentPort.on('message', (msg) => {
        switch (msg.type) {
            case 'JOIN':
                state.players.set(msg.playerId, { x: 0, y: 0, hp: 100 });
                // console.log(`[Worker ${state.instanceId}] Player ${msg.playerId} joined`);
                break;
            case 'LEAVE':
                state.players.delete(msg.playerId);
                break;
            case 'INPUT':
                // specific input handling
                break;
            case 'STOP':
                state.isActive = false;
                clearInterval(interval);
                process.exit(0);
                break;
        }
    });
}
