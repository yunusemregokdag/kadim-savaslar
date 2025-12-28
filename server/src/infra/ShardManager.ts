
export interface ShardNode {
    id: string; // Unique ID (e.g. 'eu-central-1')
    region: 'EU' | 'NA' | 'ASIA';
    host: string; // IP or Hostname
    port: number; // WebSocket Port
    capacity: number;
    currentPlayers: number;
    status: 'online' | 'full' | 'maintenance' | 'offline';
    lastHeartbeat: number;
}

/**
 * Manages the registry of active game servers (Shards).
 * This typically runs on the Login/Auth server or a Redis coordinator.
 */
export class ShardManager {
    private shards: Map<string, ShardNode> = new Map();

    public registerShard(node: ShardNode) {
        this.shards.set(node.id, node);
        console.log(`[ShardMgr] Registered ${node.id} (${node.region})`);
    }

    public updateHeartbeat(shardId: string, currentPlayers: number) {
        const shard = this.shards.get(shardId);
        if (shard) {
            shard.currentPlayers = currentPlayers;
            shard.lastHeartbeat = Date.now();

            // Auto-update status based on capacity
            if (shard.currentPlayers >= shard.capacity) {
                shard.status = 'full';
            } else if (shard.status === 'full') {
                shard.status = 'online';
            }
        }
    }

    public getShard(shardId: string) {
        return this.shards.get(shardId);
    }

    public getAllShards() {
        return Array.from(this.shards.values());
    }

    /**
     * Removes dead shards (>30s no heartbeat)
     */
    public pruneDeadShards() {
        const now = Date.now();
        for (const [id, shard] of this.shards) {
            if (now - shard.lastHeartbeat > 30000) {
                console.warn(`[ShardMgr] Pruning dead shard: ${id}`);
                shard.status = 'offline';
                this.shards.delete(id);
            }
        }
    }
}
