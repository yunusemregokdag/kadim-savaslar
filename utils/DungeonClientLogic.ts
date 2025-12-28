
/**
 * 3️⃣ DUNGEON HANDSHAKE FLOW
 * Pseudocode implementation of the Client-Side State Machine for Dungeon Transition.
 */

export function onServerDungeonSignal(payload: { instanceId: string, zoneId: number }, context: any) {
    const { socket, ui, snapshotManager } = context;

    console.log(`🌀 PORTAL SEQUENCE INITIATED: ${payload.instanceId}`);

    // 1. INPUT LOCK
    // Immediate freeze to prevent client prediction from diverging
    context.inputSystem.lock();
    context.playerRef.current.visible = false; // Hide player until spawn confirm

    // 2. LOADING SCREEN
    // Mask the asset loading / connection switching
    ui.setLoading(true, "Zindana Işınlanıyor...");

    // 3. FLUSH STATE
    // Clear Overworld entities from memory
    snapshotManager.clearAll();     // Clear Ref Maps
    ui.setEntities([]);             // Clear React DOM

    // 4. CONNECTION SWITCH
    // Inform server we are ready for the new stream
    socket.emit('dungeon_handshake_ack', { instanceId: payload.instanceId });

    // 5. WAIT FOR SYNC
    // Do NOTHING until the Worker Thread sends the first 'w_init' or 'w_update'

    const initListener = (data: any) => {
        if (data.t < 0) return; // Ignore stale packets

        console.log("✅ DUNGEON DATA RECEIVED");
        socket.off('w_update', initListener);

        // 6. RESUME
        snapshotManager.applyServerSnapshot(data, ui.setEntities);

        // Teleport player visual to spawn point strictly
        const localPlayer = data.players.find((p: any) => p.id === socket.id);
        if (localPlayer) {
            context.playerRef.current.position.set(localPlayer.x, 0, localPlayer.y);
            context.playerRef.current.visible = true;
        }

        ui.setLoading(false);
        context.inputSystem.unlock();
    };

    socket.on('w_update', initListener);
}
