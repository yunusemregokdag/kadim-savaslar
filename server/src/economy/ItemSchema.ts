
// Database Schemas for Economy

export interface Item {
    id: string; // Instance ID (UUID)
    templateId: string; // e.g. 'sword_01'
    ownerId: string;
    stackCount: number;
    stats?: Record<string, number>; // Dynamic stats for crafted items
    enchantLevel?: number;
    durability: number;
}

export interface Wallet {
    playerId: string;
    gold: number; // Stored as integer (copper). 100 copper = 1 silver, 100 silver = 1 gold.
    gems: number; // Premium currency
}

export interface AuctionListing {
    id: string; // UUID
    sellerId: string;
    itemSnapshot: Item; // Freeze item state
    priceCopper: number;
    createdAt: number;
    expiresAt: number; // 24h or 48h
    status: 'active' | 'sold' | 'expired' | 'cancelled';
}

export interface TransactionLog {
    id: string;
    type: 'trade' | 'auction_buy' | 'auction_sell' | 'shop' | 'loot';
    sourceId: string;
    targetId: string;
    amount: number;
    timestamp: number;
}
