
import { Worker } from 'worker_threads';
import { join } from 'path';

interface InstanceData {
    id: string;
    worker: Worker;
    players: Set<string>;
}

export class DungeonManager {
    private instances: Map<string, InstanceData> = new Map();

    public createInstance(templateId: number): string {
        const id = `inst_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

        // NOTE: In production, ensure this points to the compiled JS worker file
        // For development (ts-node), this might need adjustment or specific loader
        const workerScript = join(__dirname, 'DungeonWorker.js');

        const worker = new Worker(workerScript, {
            workerData: { instanceId: id, zoneId: templateId }
        });

        const instance: InstanceData = { id, worker, players: new Set() };

        worker.on('message', (msg) => this.handleMessage(id, msg));
        worker.on('error', (err) => console.error(`Dungeon ${id} error:`, err));
        worker.on('exit', () => this.cleanup(id));

        this.instances.set(id, instance);
        console.log(`🏰 Dungeon Instance Created: ${id}`);
        return id;
    }

    public playerJoin(instanceId: string, playerId: string) {
        const inst = this.instances.get(instanceId);
        if (inst) {
            inst.players.add(playerId);
            inst.worker.postMessage({ type: 'JOIN', playerId });
        }
    }

    public playerLeave(instanceId: string, playerId: string) {
        const inst = this.instances.get(instanceId);
        if (inst) {
            inst.players.delete(playerId);
            inst.worker.postMessage({ type: 'LEAVE', playerId });

            if (inst.players.size === 0) {
                // Auto-shutdown empty dungeon after 10 seconds
                setTimeout(() => {
                    if (this.instances.has(instanceId) && this.instances.get(instanceId)!.players.size === 0) {
                        inst.worker.terminate();
                    }
                }, 10000);
            }
        }
    }

    public routeInput(instanceId: string, playerId: string, input: any) {
        const inst = this.instances.get(instanceId);
        if (inst) inst.worker.postMessage({ type: 'INPUT', playerId, input });
    }

    private handleMessage(_instanceId: string, msg: any) {
        if (msg.type === 'SNAPSHOT') {
            // Logic to broadcast snapshot to instance.players via Socket.IO
            // Would call an injected callback or event emitter here.
        }
    }

    private cleanup(id: string) {
        this.instances.delete(id);
        console.log(`Dungeon ${id} closed.`);
    }
}
