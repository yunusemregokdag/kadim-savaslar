
/**
 * Middleware to protect sensitive Economy transactions.
 * Acts as a firewall between Game Logic and Economy Service.
 */

export type TransactionSource = 'SHOP_PURCHASE' | 'TRADE' | 'LOOT' | 'QUEST_REWARD' | 'AUCTION';



export class TransactionGuard {
    private static pendingLocks: Set<string> = new Set();

    /**
     * Prevents Double-Spend.
     * Uses a lock mechanism. If a player is currently in a transaction, reject others.
     */
    public static async wrap<T>(
        playerId: string,
        source: TransactionSource,
        fn: () => Promise<T>
    ): Promise<T | null> {

        if (this.pendingLocks.has(playerId)) {
            console.warn(`[EconomyGuard] Blocked concurrent transaction for ${playerId}`);
            return null;
        }

        this.pendingLocks.add(playerId);

        try {
            // Validation Logic based on source
            if (!this.validateSource(source)) {
                throw new Error("Invalid Transaction Source");
            }

            const result = await fn();
            return result;
        } catch (e) {
            console.error(`[EconomyGuard] Transaction Failed:`, e);
            return null;
        } finally {
            this.pendingLocks.delete(playerId);
        }
    }

    private static validateSource(_source: TransactionSource): boolean {
        // Example: If source is QUEST_REWARD, we might verify Quest Status here
        // For now, allow known sources.
        return true;
    }
}
