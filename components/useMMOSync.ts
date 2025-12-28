
import { useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { applyServerSnapshot, updateInterpolation, registerEntityRef, entityVisuals } from '../utils/SnapshotManager';
import { onServerDungeonSignal } from '../utils/DungeonClientLogic';

interface MMOSyncProps {
    socket: any; // SocketIO Client
    setEntities: React.Dispatch<React.SetStateAction<any[]>>;
    setLoading: (loading: boolean, msg?: string) => void;
    playerRef: React.MutableRefObject<any>;
    zoneId: number;
    // Input Control Refs (Passed from parent to avoid Context overhead)
    inputStateRef?: React.MutableRefObject<{ locked: boolean }>;
}

/**
 * 🔗 CLIENT-SIDE GLUE CODE
 * Integrates Server Snapshots + Interpolation + Dungeon Events
 * into the React/R3F Lifecycle without breaking performance rules.
 */
export const useMMOSync = ({ socket, setEntities, setLoading, playerRef, zoneId, inputStateRef }: MMOSyncProps) => {

    // 1️⃣ EVENT LISTENERS (Run once on mount/socket change)
    useEffect(() => {
        if (!socket) return;

        // A. SNAPSHOT SYNC
        // Receives 20Hz updates from server (AOI filtered)
        const handleSnapshot = (snapshot: any) => {
            // "applyServerSnapshot" handles the Diff logic.
            // It calls "setEntities" ONLY if a Spawn/Despawn is detected.
            // Otherwise, it updates the internal Interpolation Buffer silently.
            applyServerSnapshot(snapshot, setEntities);
        };

        // B. DUNGEON HANDSHAKE
        // Handles 'ENTER_DUNGEON' signal
        const handleDungeon = (payload: any) => {
            onServerDungeonSignal(payload, {
                socket,
                ui: { setLoading, setEntities },
                snapshotManager: {
                    clearAll: () => {
                        // Clear visual refs
                        entityVisuals.clear();
                        // Trigger React unmount for all mobs
                        setEntities([]);
                    },
                    applyServerSnapshot
                },
                inputSystem: {
                    lock: () => { if (inputStateRef) inputStateRef.current.locked = true; },
                    unlock: () => { if (inputStateRef) inputStateRef.current.locked = false; }
                },
                playerRef
            });
        };

        socket.on('w_update', handleSnapshot);
        socket.on('ENTER_DUNGEON', handleDungeon);

        return () => {
            socket.off('w_update', handleSnapshot);
            socket.off('ENTER_DUNGEON', handleDungeon);
        };
    }, [socket, zoneId, setEntities, setLoading]);

    // 2️⃣ VISUAL UPDATE LOOP (~60Hz)
    // Pure Ref manipulation. NO State updates. NO GC.
    useFrame(() => {
        updateInterpolation();
    });

    return {
        // EXPOSED API: Link new React Components to the Interpolator
        linkMobRef: (id: string, group: any) => {
            registerEntityRef(id, group);
        }
    };
};
