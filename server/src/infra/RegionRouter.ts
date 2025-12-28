
import { ShardManager, ShardNode } from './ShardManager';

export class RegionRouter {
    private manager: ShardManager;

    constructor(manager: ShardManager) {
        this.manager = manager;
    }

    /**
     * Determines the best shard for a player connecting to a specific region.
     * Logic:
     * 1. Check if specific shard requested (reconnect).
     * 2. Filter by Regiom.
     * 3. Filter by Status (Online).
     * 4. Sort by Load (Least populated first).
     */
    public routePlayer(region: 'EU' | 'NA' | 'ASIA', preferredShardId?: string): ShardNode | null {
        // 1. Reconnect Preference
        if (preferredShardId) {
            const preferred = this.manager.getShard(preferredShardId);
            if (preferred && preferred.status === 'online' && preferred.currentPlayers < preferred.capacity) {
                return preferred;
            }
        }

        // 2. Find Candidates
        const candidates = this.manager.getAllShards().filter(s =>
            s.region === region &&
            (s.status === 'online')
        );

        if (candidates.length === 0) return null;

        // 3. Load Balance (Sort by fill rate)
        candidates.sort((a, b) => {
            const loadA = a.currentPlayers / a.capacity;
            const loadB = b.currentPlayers / b.capacity;
            return loadA - loadB; // Lowest load first
        });

        // 4. Return Best
        return candidates[0];
    }
}
