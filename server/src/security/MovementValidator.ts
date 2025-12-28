
import { CheatFlags, CheatViolation } from './CheatFlags';

interface Pos { x: number; y: number; }

export class MovementValidator {

    // Tolerance for network jitter (ms)
    private static readonly LATENCY_BUFFER_MS = 200;
    private static readonly BASE_TOLERANCE_DIST = 2.0; // Units allowed to slip due to lag

    /**
     * @param playerId User ID
     * @param from Previous Server Authoritative Position
     * @param to New Input Position
     * @param dt Time passed since last valid input (ms)
     * @param maxSpeed Total current movement speed (Base + Buffs) in units/sec
     */
    public static validateMove(
        playerId: string,
        from: Pos,
        to: Pos,
        dt: number,
        maxSpeed: number
    ): boolean {
        // 1. Basic sanity (NaN checks)
        if (isNaN(to.x) || isNaN(to.y)) {
            CheatFlags.flag(playerId, CheatViolation.INVALID_COORD);
            return false;
        }

        // 2. Distance Calculation
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const distSq = dx * dx + dy * dy;
        const dist = Math.sqrt(distSq);

        // 3. Max Allowed Distance
        // MaxDist = (Speed * Time) + Tolerance
        // Time = dt + JitterTolerance
        const timeFactor = (dt + this.LATENCY_BUFFER_MS) / 1000;
        const maxDistAllowed = (maxSpeed * timeFactor) + this.BASE_TOLERANCE_DIST;

        if (dist > maxDistAllowed) {
            // Check for Massive Teleport vs Small Speedhack
            if (dist > maxDistAllowed * 3) {
                CheatFlags.flag(playerId, CheatViolation.TELEPORT, 1);
            } else {
                CheatFlags.flag(playerId, CheatViolation.SPEED_HACK, 1);
            }

            console.log(`[Validation] Reject Move: ${dist.toFixed(2)} > ${maxDistAllowed.toFixed(2)} (Speed: ${maxSpeed})`);
            return false; // Reject input
        }

        return true; // Valid
    }
}
