import { Item } from '../types';

export interface MarketListing {
    id: string;
    sellerName: string;
    sellerId: string; // nickname for now
    item: Item;
    price: number;
    currency: 'credits' | 'gems';
    listedAt: number;
    expiresAt: number;
}

export interface PlayerStallData {
    ownerName: string;
    items: MarketListing[];
    position: [number, number, number]; // x, y, z
    theme: 'wood' | 'stone' | 'luxury';
}
