
import * as THREE from 'three';

// --- DATA STRUCTURES ---
interface EntityState {
    id: string;
    x: number;
    y: number;
    rot: number;
    hp: number;
    timestamp: number;
}

// Global Refs Store (No React State)
// Maps Entity ID -> Three.js Object Group
export const entityVisuals = new Map<string, THREE.Group>();

// History Buffer for Interpolation
// We keep last N snapshots for every entity
const snapshotBuffer = new Map<string, EntityState[]>();

const INTERPOLATION_DELAY = 100; // ms (Server 50ms + 50ms Buffer)

/**
 * 1️⃣ SNAPSHOT APPLIER (Socket Listener)
 * Handles incoming data from server.
 * Triggers React Re-render ONLY for Structural Changes (Spawn/Despawn).
 */
export function applyServerSnapshot(serverSnapshot: any, setEntitiesState: Function) {
    const incomingIds = new Set<string>();
    const now = Date.now();

    // A. BUFFER DATA
    serverSnapshot.entities.forEach((entity: any) => {
        incomingIds.add(entity.id);

        if (!snapshotBuffer.has(entity.id)) snapshotBuffer.set(entity.id, []);
        const buffer = snapshotBuffer.get(entity.id)!;

        buffer.push({
            id: entity.id,
            x: entity.x,
            y: entity.y, // Server Y is usually Z in 3D, parsing logic handles this
            rot: entity.rot,
            hp: entity.hp,
            timestamp: serverSnapshot.t
        });

        // Prune logic: Keep last 5 snapshots
        if (buffer.length > 5) buffer.shift();
    });

    // B. DIFF LOGIC (Structural Changes)
    const currentIds = Array.from(entityVisuals.keys());

    // Detect Despawns (In visuals but not in snapshot)
    const toRemove = currentIds.filter(id => !incomingIds.has(id));

    // Detect Spawns (In snapshot but not in visuals)
    const toAdd = serverSnapshot.entities.filter((e: any) => !entityVisuals.has(e.id));

    // CRITICAL: Only touch React State if list changed
    if (toRemove.length > 0 || toAdd.length > 0) {
        setEntitiesState((prev: any[]) => {
            // Remove old
            const next = prev.filter(e => !toRemove.includes(e.id));
            // Add new (mark as interpolated so VoxelMob knows to use Refs)
            toAdd.forEach((e: any) => next.push({ ...e, interpolated: true }));
            return next;
        });

        // Cleanup Refs immediately
        toRemove.forEach(id => {
            snapshotBuffer.delete(id);
            entityVisuals.delete(id);
        });
    }
}

/**
 * 2️⃣ INTERPOLATION LOOP (useFrame)
 * Updates visual positions based on history buffer.
 * ZERO React renders. Pure DOM/WebGL manipulation.
 */
export function updateInterpolation() {
    const renderTime = Date.now() - INTERPOLATION_DELAY;

    entityVisuals.forEach((ref, id) => {
        const buffer = snapshotBuffer.get(id);
        if (!buffer || buffer.length < 2) return;

        // Find time window [t0, t1] surrounding renderTime
        let t0 = buffer[0];
        let t1 = buffer[1];

        for (let i = 0; i < buffer.length - 1; i++) {
            if (buffer[i].timestamp <= renderTime && buffer[i + 1].timestamp >= renderTime) {
                t0 = buffer[i];
                t1 = buffer[i + 1];
                break;
            }
        }

        // Extrapolation fallback (if lagging)
        if (renderTime > t1.timestamp) t0 = t1;

        // Calculate Ratio
        const duration = t1.timestamp - t0.timestamp;
        const elapsed = renderTime - t0.timestamp;
        const ratio = duration > 0 ? Math.max(0, Math.min(1, elapsed / duration)) : 0;

        // LERP Position (X, Z usually)
        ref.position.set(
            lerp(t0.x, t1.x, ratio),
            ref.position.y, // Keep local Y (height) logic or physics
            lerp(t0.y, t1.y, ratio)
        );

        // LERP Rotation (Shortest path)
        ref.rotation.y = lerpAngle(t0.rot, t1.rot, ratio);
    });
}

// Helpers
function lerp(start: number, end: number, t: number) {
    return start * (1 - t) + end * t;
}

function lerpAngle(start: number, end: number, t: number) {
    let diff = end - start;
    if (diff > Math.PI) diff -= Math.PI * 2;
    if (diff < -Math.PI) diff += Math.PI * 2;
    return start + diff * t;
}

// Helper to register ref from React Component
export function registerEntityRef(id: string, group: THREE.Group) {
    entityVisuals.set(id, group);
}
