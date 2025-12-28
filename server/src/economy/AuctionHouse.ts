
import { EconomyService } from './EconomyService';
import { AuctionListing, Item } from './ItemSchema';

export class AuctionHouse {
    private listings: Map<string, AuctionListing> = new Map();
    private readonly TAX_PERCENT = 0.05; // 5% Cut
    private readonly LISTING_FEE = 100; // Flat fee in copper

    /**
     * User creates a listing from their inventory.
     * 1. Remove Item from Inventory (handled by caller/inventory service)
     * 2. Pay Listing Fee (Gold Sink)
     * 3. Create Listing Object
     */
    public createListing(sellerId: string, item: Item, price: number, durationHours: number): AuctionListing | null {
        // 1. Check Fee
        if (!EconomyService.sinkGold(sellerId, this.LISTING_FEE, 'auction_listing_fee')) {
            return null; // Cannot afford fee
        }

        // 2. Create Object
        const listing: AuctionListing = {
            id: `auc_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            sellerId,
            itemSnapshot: item, // In real app, item is removed from Inventory DB and stored here
            priceCopper: price,
            createdAt: Date.now(),
            expiresAt: Date.now() + (durationHours * 3600000),
            status: 'active'
        };

        this.listings.set(listing.id, listing);
        console.log(`[Auction] Listing created: ${listing.id} for ${price}`);
        return listing;
    }

    /**
     * User buys an item.
     * 1. Check Active
     * 2. Check Expiry
     * 3. Atomic Money Transfer
     * 4. Mark Sold
     */
    public buyNow(buyerId: string, listingId: string): { success: boolean, item?: Item } {
        const listing = this.listings.get(listingId);

        // Validation
        if (!listing) return { success: false };
        if (listing.status !== 'active') return { success: false };
        if (Date.now() > listing.expiresAt) {
            this.expireListing(listingId);
            return { success: false };
        }
        if (buyerId === listing.sellerId) return { success: false }; // Cannot buy own

        // Calculate Tax
        const price = listing.priceCopper;
        const tax = Math.floor(price * this.TAX_PERCENT);
        const sellerRevenue = price - tax;

        // Transaction: Buyer -> Seller (Revenue)
        // We use a 2-step transfer to simulate tax.
        // Actually EconomyService.transaction moves A -> B directly.
        // So we move (Price - Tax) to seller. The Tax vanishes (Gold Sink).
        // BUT we must check if Buyer has FULL Price.

        if (!EconomyService.canAfford(buyerId, price)) return { success: false };

        // 1. Deduct Full Price from Buyer (Atomic Sink technically, then Grant to seller)
        // Better: Transfer Revenue to Seller, Sink Tax from Buyer.
        // If Buyer has 100, Price 100. Seller gets 95. Tax 5.

        // Step A: Pay Revenue to Seller
        // Note: This implementation assumes transaction checks balance.
        // If we do two steps, we might fail halfway. 
        // EconomyService should generally support "Transfer with Tax".
        // Here we'll do: Sink(Buyer, Price) -> Grant(Seller, Revenue).

        const sinkSuccess = EconomyService.sinkGold(buyerId, price, `buy_auction_${listingId}`);
        if (!sinkSuccess) return { success: false }; // Should be caught by canAfford but safe double check

        EconomyService.grantGold(listing.sellerId, sellerRevenue, `sold_auction_${listingId}`);

        // Mark Sold
        listing.status = 'sold';
        this.listings.delete(listingId);

        console.log(`[Auction] Sold ${listingId}. Tax Burned: ${tax}`);

        // Return Item
        return { success: true, item: listing.itemSnapshot };
    }

    public expireListing(listingId: string) {
        const listing = this.listings.get(listingId);
        if (listing) {
            listing.status = 'expired';
            this.listings.delete(listingId);
            // In real app, mail item back to seller
            console.log(`[Auction] Expired ${listingId}`);
        }
    }

    /**
     * Maintenance Tick (Run every minute)
     */
    public tick() {
        const now = Date.now();
        for (const [id, listing] of this.listings) {
            if (now > listing.expiresAt) {
                this.expireListing(id);
            }
        }
    }
}
