
import { Wallet, TransactionLog } from './ItemSchema';

// Mock Database Interface (In production, replace with MongoDB/Postgres driver)
interface DBContext {
    wallets: Map<string, Wallet>;
    logs: TransactionLog[];
}
const DB: DBContext = {
    wallets: new Map(),
    logs: []
};

/**
 * EconomyService
 * Handles all currency mutations.
 * MUST BE CHEAT-SAFE & ATOMIC.
 */
export class EconomyService {

    /**
     * Initializes a player's wallet if not exists.
     */
    public static ensureWallet(playerId: string): Wallet {
        if (!DB.wallets.has(playerId)) {
            DB.wallets.set(playerId, { playerId, gold: 0, gems: 0 });
        }
        return DB.wallets.get(playerId)!;
    }

    /**
     * 🔒 ATOMIC TRANSFER
     * Moves gold from A to B.
     * Returns true if successful, false if insufficient funds.
     */
    public static transactiom(fromId: string, toId: string, amount: number, reason: string): boolean {
        if (amount <= 0) return false;

        const sender = this.ensureWallet(fromId);
        const receiver = this.ensureWallet(toId);

        if (sender.gold < amount) {
            console.warn(`[Economy] TX Failed: ${fromId} has insufficient funds.`);
            return false;
        }

        // Execute atomically (JavaScript is single-threaded, so this block is safe conceptually)
        sender.gold -= amount;
        receiver.gold += amount;

        // Audit Log
        DB.logs.push({
            id: `tx_${Date.now()}_${Math.random()}`,
            type: 'trade',
            sourceId: fromId,
            targetId: toId,
            amount: amount,
            timestamp: Date.now()
        });

        console.log(`[Economy] TX Success: ${fromId} -> ${toId} (${amount}) [${reason}]`);
        return true;
    }

    /**
     * System grants gold (Loot/Quest)
     */
    public static grantGold(playerId: string, amount: number, _source: string) {
        if (amount <= 0) return;
        const wallet = this.ensureWallet(playerId);
        wallet.gold += amount;
    }

    /**
     * System removes gold (Sink/Tax/Repair)
     */
    public static sinkGold(playerId: string, amount: number, _reason: string): boolean {
        const wallet = this.ensureWallet(playerId);
        if (wallet.gold < amount) return false;
        wallet.gold -= amount;
        return true;
    }

    /**
     * Validates if a player can afford an amount
     */
    public static canAfford(playerId: string, amount: number): boolean {
        const wallet = this.ensureWallet(playerId);
        return wallet.gold >= amount;
    }
}
