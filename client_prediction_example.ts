
// Example Client-Side Prediction & Reconciliation Logic
// Use this pattern in ActiveZoneView.tsx updateMovement() function.

interface InputPacket {
    x: number;
    y: number;
    dt: number;
    seq: number;
}

const PENDING_INPUTS: InputPacket[] = [];
let SEQUENCE = 0;

// 1. LOCAL PREDICTION (Runs in useFrame)
export function updatePlayerMovementPredictive(playerRef: any, joystick: any, dt: number, socket: any) {
    if (!playerRef.current) return;

    // Create Input based on Joystick
    const input: InputPacket = {
        x: joystick.x, // Normalized -1 to 1
        y: joystick.y,
        dt: dt,
        seq: SEQUENCE++
    };

    // APPLY LOCALLY (Prediction)
    // Move the player immediately so it feels responsive (0 lag)
    const speed = 10; // Base speed
    playerRef.current.position.x += input.x * speed * dt;
    playerRef.current.position.z -= input.y * speed * dt;

    // Store input for later reconciliation
    PENDING_INPUTS.push(input);

    // Send to Server
    // In real implementation, limit this emission to 20Hz (every 50ms)
    socket.emit('input_move', { x: input.x, y: input.y, seq: input.seq });
}

// 2. SERVER RECONCILIATION (Runs when 'w_update' is received)
export function handleServerSnapshot(snapshotPlayer: any, playerRef: any) {
    if (!playerRef.current) return;

    const lastAckSeq = snapshotPlayer.lastSeq;

    // 1. Discard inputs already processed by server
    // (We modify the array in place)
    let removeCount = 0;
    for (let i = 0; i < PENDING_INPUTS.length; i++) {
        if (PENDING_INPUTS[i].seq <= lastAckSeq) removeCount++;
        else break;
    }
    PENDING_INPUTS.splice(0, removeCount);

    // 2. Reset Player to Server's Authoritative Position
    // This corrects any cheat/lag/desync discrepancies
    let currentX = snapshotPlayer.x;
    let currentZ = snapshotPlayer.y; // Z is Y in 2D server logic

    // 3. Re-Simulate all pending inputs on top of server state
    // This allows us to keep our "future" position valid relative to the server's "past" truth.
    const speed = 10;
    for (const input of PENDING_INPUTS) {
        currentX += input.x * speed * input.dt;
        currentZ -= input.y * speed * input.dt;
    }

    // 4. Smooth Correction (Optional but recommended)
    // If the difference is small, lerp. If large (teleport), snap.
    const dist = Math.sqrt(
        Math.pow(currentX - playerRef.current.position.x, 2) +
        Math.pow(currentZ - playerRef.current.position.z, 2)
    );

    if (dist > 2.0) {
        // Hard Snap (Teleport / Lag correction)
        playerRef.current.position.x = currentX;
        playerRef.current.position.z = currentZ;
    } else {
        // Soft correction is handled naturally by setting position, 
        // or apply a small lerp factor here if using physics engine.
        // For direct translation, snapping is usually fine if inputs match closely.
        playerRef.current.position.x = currentX;
        playerRef.current.position.z = currentZ;
    }
}
