/**
 * marketSystem.ts
 * Player Economy & Trading
 * 
 * FEATURES:
 * - Gold & Diamond (DonateCoin) Trading
 * - Tax Sink (Controlled by VIP)
 * - Listing Limits (Expandable)
 * - Value Preservation (T4/T5 traded player-to-player)
 */

import { PlayerState, Item } from '../types';
import { calculateVipTax, getVipBonus } from './vipSystem';

export interface MarketListing {
    id: string;
    sellerId: string;
    item: Item;
    price: number;
    currency: 'gold' | 'gems';
    listedAt: number;
    expiresAt: number;
}

const MARKET_CONFIG = {
    BASE_TAX: 0.10, // 10%
    BASE_SLOTS: 5,
    LISTING_DURATION: 7 * 24 * 60 * 60 * 1000 // 7 Days
};

/**
 * Calculate Tax
 */
export function calculateTax(price: number, player: PlayerState): number {
    const reduction = getVipBonus(player, 'MARKET_TAX_REDUCTION');
    const rate = MARKET_CONFIG.BASE_TAX * (1 - reduction);
    return Math.floor(price * rate);
}

// In-memory listings
let activeListings: MarketListing[] = [];

/**
 * Load listings from persistence
 */
export function loadListings(data: MarketListing[]) {
    activeListings = data;
}

/**
 * Get Max Listing Slots for Player
 */
export function getMaxSlots(player: PlayerState): number {
    const vipBonus = getVipBonus(player, 'MARKET_SLOTS_BONUS');
    // Assume 'extraMarketSlots' is a purchased persistent upgrade
    const purchasedSlots = (player as any).extraMarketSlots || 0;
    return MARKET_CONFIG.BASE_SLOTS + vipBonus + purchasedSlots;
}

/**
 * List Item
 */
export function listItem(
    player: PlayerState,
    item: Item,
    price: number,
    currency: 'gold' | 'gems'
): { success: boolean, listing?: MarketListing, updatedPlayer?: PlayerState, error?: string } {

    // 1. Slot Check
    const currentListings = activeListings.filter(l => l.sellerId === player.nickname);
    if (currentListings.length >= getMaxSlots(player)) {
        return { success: false, error: 'Pazar slotu dolu. VIP ile artırılabilir.' };
    }

    // 2. Ownership Check
    const itemIndex = player.inventory.findIndex(i => i.id === item.id);
    if (itemIndex === -1) return { success: false, error: 'Eşya yok.' };

    // 3. Create Listing
    const listing: MarketListing = {
        id: Math.random().toString(36).substring(7),
        sellerId: player.nickname,
        item: item,
        price,
        currency,
        listedAt: Date.now(),
        expiresAt: Date.now() + MARKET_CONFIG.LISTING_DURATION
    };

    activeListings.push(listing);

    // 4. Update Player (Remove Item) - SAFETY: Immediate removal prevents duping
    const newInventory = [...player.inventory];
    newInventory.splice(itemIndex, 1);

    return {
        success: true,
        listing,
        updatedPlayer: { ...player, inventory: newInventory }
    };
}

/**
 * Buy Item
 */
export function buyItem(
    buyer: PlayerState,
    listingId: string
): { success: boolean, updatedBuyer?: PlayerState, sellerRevenue?: number, error?: string } {

    const index = activeListings.findIndex(l => l.id === listingId);
    if (index === -1) return { success: false, error: 'İlan bulunamadı.' };

    const listing = activeListings[index];
    if (listing.sellerId === buyer.nickname) return { success: false, error: 'Kendi ilanını alamazsın.' };

    // Balance Check
    if (listing.currency === 'gold' && buyer.credits < listing.price) {
        return { success: false, error: 'Yetersiz Altın.' };
    }
    if (listing.currency === 'gems' && (buyer.donateCoins || 0) < listing.price) {
        return { success: false, error: 'Yetersiz DonateCoin.' };
    }

    // Tax Calculation (Seller pays tax on revenue)
    // We simulate seller state retrieval - in real app, we'd fetch seller DB
    // Here we assume standard tax unless we can check seller VIP status
    // For safety/simplicity in simulation: Buyer pays full price, System burns tax, Seller gets net.

    let taxAmount = 0;
    if (listing.currency === 'gold') {
        // Base tax calculation
        taxAmount = Math.floor(listing.price * MARKET_CONFIG.BASE_TAX);
        // Note: Real implementation would check Seller VIP here to reduce tax
    }

    const revenue = listing.price - taxAmount;

    // Execute Trade
    activeListings.splice(index, 1);

    const updatedBuyer = { ...buyer };
    // Deduct Cost
    if (listing.currency === 'gold') {
        updatedBuyer.credits -= listing.price;
    } else {
        updatedBuyer.donateCoins = (updatedBuyer.donateCoins || 0) - listing.price;
    }

    // Add Item
    updatedBuyer.inventory = [...updatedBuyer.inventory, listing.item];

    return { success: true, updatedBuyer, sellerRevenue: revenue };
}

/**
 * Cancel a listing
 */
export function cancelListing(player: PlayerState, listingId: string): { success: boolean, updatedPlayer?: PlayerState, error?: string } {
    const index = activeListings.findIndex(l => l.id === listingId && l.sellerId === player.nickname);
    if (index === -1) return { success: false, error: 'İlan bulunamadı.' };

    const item = activeListings[index].item;
    activeListings.splice(index, 1);

    // Return item to inventory
    const newInventory = [...player.inventory, item];

    return {
        success: true,
        updatedPlayer: { ...player, inventory: newInventory }
    };
}

/**
 * Get Listings
 */
export function getListings(): MarketListing[] {
    return activeListings;
}
