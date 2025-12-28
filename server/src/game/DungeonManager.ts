
import { Worker } from 'worker_threads';
import { join } from 'path';

interface InstanceData {
    id: string;
    worker: Worker;
    players: Set<string>;
}



interface InstanceData {
    id: string;
    worker: Worker;
    players: Set<string>;
    zoneId: number;
    active: boolean; // Is this instance currently hosting a game?
}

export class DungeonManager {
    private activeInstances: Map<string, InstanceData> = new Map();
    private workerPool: Worker[] = [];
    private readonly MIN_WORKERS = 2; // Pre-warm these many workers
    private readonly MAX_WORKERS = 10;
    private currentWorkerCount = 0;

    constructor() {
        this.initializePool();
    }

    private initializePool() {
        console.log(`[DungeonManager] Pre-warming ${this.MIN_WORKERS} workers...`);
        for (let i = 0; i < this.MIN_WORKERS; i++) {
            const worker = this.createWorker();
            if (worker) {
                this.workerPool.push(worker);
            }
        }
    }

    private createWorker(): Worker | null {
        if (this.currentWorkerCount >= this.MAX_WORKERS) return null;

        try {
            // Determine worker script path based on execution environment
            const isTsNode = __filename.endsWith('.ts');
            const workerFileName = isTsNode ? 'DungeonWorker.ts' : 'DungeonWorker.js';
            const workerPath = join(__dirname, workerFileName);

            // For ts-node/tsx, we need to register the loader if we are running .ts files directly
            const worker = new Worker(workerPath, {
                execArgv: isTsNode ? ['--import', 'tsx/esm'] : undefined, // Support for TSX/TS-Node
                workerData: { mode: 'idle' }
            });

            this.currentWorkerCount++;

            worker.on('error', (err) => {
                console.error('Worker error:', err);
                // Handle worker death?
            });

            return worker;
        } catch (error) {
            console.error("Failed to create worker:", error);
            return null;
        }
    }

    private getIdleWorker(): Worker {
        if (this.workerPool.length > 0) {
            return this.workerPool.pop()!;
        }
        const newWorker = this.createWorker();
        if (newWorker) return newWorker;

        // Fallback: This shouldn't happen often if limits are reasonable. 
        // In a real system, we might queue the request.
        // For now, try to steal from pool or force create (ignoring soft limit?)
        console.warn("[DungeonManager] Pool exhausted! Force creating worker.");
        return this.createWorker()!; // Risk of overflow handled by try/catch in createWorker
    }

    private returnWorkerToPool(worker: Worker) {
        // Reset worker state if necessary via message
        worker.postMessage({ type: 'RESET' });
        this.workerPool.push(worker);
    }

    public createInstance(templateId: number): string {
        const id = `inst_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

        const worker = this.getIdleWorker();
        if (!worker) {
            console.error("No workers available!");
            return '';
        }

        // Initialize the worker for this specific dungeon
        worker.postMessage({ type: 'INIT_DUNGEON', instanceId: id, zoneId: templateId });

        const instance: InstanceData = {
            id,
            worker,
            players: new Set(),
            zoneId: templateId,
            active: true
        };

        worker.on('message', (msg) => this.handleMessage(id, msg));
        // Remove 'exit' listener that auto-cleans up, because we want to reuse it.
        // Instead, we handle explicit shutdown or errors.

        this.activeInstances.set(id, instance);
        console.log(`🏰 Dungeon Instance Created: ${id} (Worker Pool: ${this.workerPool.length} idle)`);
        return id;
    }

    public playerJoin(instanceId: string, playerId: string) {
        const inst = this.activeInstances.get(instanceId);
        if (inst) {
            inst.players.add(playerId);
            inst.worker.postMessage({ type: 'JOIN', playerId });
        }
    }

    public playerLeave(instanceId: string, playerId: string) {
        const inst = this.activeInstances.get(instanceId);
        if (inst) {
            inst.players.delete(playerId);
            inst.worker.postMessage({ type: 'LEAVE', playerId });

            if (inst.players.size === 0) {
                // Auto-shutdown empty dungeon after 10 seconds (Recycle worker)
                setTimeout(() => {
                    const currentInst = this.activeInstances.get(instanceId);
                    if (currentInst && currentInst.players.size === 0) {
                        this.closeInstance(instanceId);
                    }
                }, 10000);
            }
        }
    }

    public routeInput(instanceId: string, playerId: string, input: any) {
        const inst = this.activeInstances.get(instanceId);
        if (inst) inst.worker.postMessage({ type: 'INPUT', playerId, input });
    }

    private handleMessage(_instanceId: string, msg: any) {
        if (msg.type === 'SNAPSHOT') {
            // Broadcast logic would go here
            // this.io.to(instanceId).emit('w_update', msg);
        }
    }

    private closeInstance(id: string) {
        const inst = this.activeInstances.get(id);
        if (inst) {
            inst.active = false;
            inst.worker.removeAllListeners('message'); // Clean up listeners for this instance
            this.returnWorkerToPool(inst.worker);
            this.activeInstances.delete(id);
            console.log(`[DungeonManager] Instance ${id} closed. Worker returned to pool.`);
        }
    }
}
