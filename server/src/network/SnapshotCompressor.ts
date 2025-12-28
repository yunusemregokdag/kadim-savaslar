
import { NetProfile, ConnectionType, NET_PROFILES } from './MobileNetProfile';

interface EntitySnapshot {
    id: string;
    x: number;
    y: number;
    hp: number;
    maxHp: number;
    state: string; // 'idle' | 'walk' | 'attack'
}

type CompressedEntity = Partial<EntitySnapshot> & { i: string }; // 'i' is ID

export class SnapshotCompressor {

    /**
     * Cache last sent state for Delta Compression.
     * Map<ConnectionID, Map<EntityID, Hash/State>>
     * (Simplified for this example)
     */
    private lastSentState: Map<string, Record<string, any>> = new Map();

    /**
     * Compresses a list of entities for a specific client connection.
     */
    public compress(
        connectionId: string,
        connType: ConnectionType,
        viewerPos: { x: number, y: number },
        entities: EntitySnapshot[],
        serverTick: number
    ): CompressedEntity[] {
        const profile = NET_PROFILES[connType];
        const packet: CompressedEntity[] = [];
        const clientCache = this.getCache(connectionId);
        const currentIds = new Set<string>();

        for (const entity of entities) {
            // 1. Distance Check
            const distSq = (entity.x - viewerPos.x) ** 2 + (entity.y - viewerPos.y) ** 2;
            const isFar = distSq > profile.farDistanceSq;

            // 2. Adaptive Rate Throttling
            const rate = isFar ? profile.sendRateFar : profile.sendRateNear;
            if (serverTick % rate !== 0) continue; // Skip this tick for this entity

            // 3. Compression & Quantization
            const compressed = this.packEntity(entity, profile);

            // 4. Delta Check (Simulated)
            const last = clientCache[entity.id];

            if (profile.deltaCompression && last) {
                // If practically identical, skip
                if (this.isSimilar(last, compressed)) {
                    continue;
                }
                // Send only changed fields? 
                // For simplicity, we send the "packed" version if distinct.
                // A true delta would allow sending { i: '1', x: 10 } without Y if Y unchanged.
            }

            clientCache[entity.id] = compressed;
            currentIds.add(entity.id);
            packet.push(compressed);
        }

        // Cleanup cache for entities no longer in AOI
        // (Omitted for brevity in this snippet)

        return packet;
    }

    private getCache(connId: string) {
        if (!this.lastSentState.has(connId)) {
            this.lastSentState.set(connId, {});
        }
        return this.lastSentState.get(connId)!;
    }

    private packEntity(e: EntitySnapshot, profile: NetProfile): CompressedEntity {
        // Renaming keys to short form is common (i, x, y, h, s)
        // Here we keep schema keys but values are quantized.
        return {
            i: e.id,
            x: Number(e.x.toFixed(profile.positionPrecision)),
            y: Number(e.y.toFixed(profile.positionPrecision)),
            hp: e.hp, // HP is crucial, usually sent full or if changed
            state: e.state // State strings are usually mapped to INTs in real Protobuf
        } as any;
    }

    private isSimilar(a: any, b: any): boolean {
        // Quick check if visual state is same
        return a.x === b.x && a.y === b.y && a.hp === b.hp && a.state === b.state;
    }
}
