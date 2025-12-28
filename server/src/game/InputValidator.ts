
export class InputValidator {
    // Map<SocketID, { count: RequestCount, expires: Timestamp }>
    private limits: Map<string, { c: number, t: number }> = new Map();

    // Config
    private readonly MAX_REQUESTS = 20; // Max inputs per second per player
    private readonly INTERVAL = 1000;   // 1 Second window

    /**
     * Checks if the player is spamming inputs.
     * @returns true if allowed, false if rate limited (should drop packet)
     */
    public checkRate(id: string): boolean {
        const now = Date.now();
        let record = this.limits.get(id);

        // Initialize or Reset Window
        if (!record || now > record.t) {
            record = { c: 0, t: now + this.INTERVAL };
            this.limits.set(id, record);
        }

        record.c++;

        if (record.c > this.MAX_REQUESTS) {
            // Optional: Add to blacklist logic / cooldown
            return false;
        }

        return true;
    }
}
