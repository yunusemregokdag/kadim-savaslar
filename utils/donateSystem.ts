/**
 * donateSystem.ts
 * Real Money -> Premium Currency (DonateCoin) Loop
 * 
 * CORE RULES:
 * - NO Direct Power Sales (T4/T5 Gear)
 * - Selling: Cosmetics, VIP, Convenience (Slots, Rename), Time Savers
 */

import { PlayerState } from '../types';
import { activateVip, VipTier } from './vipSystem';

export const SHOP_CONFIG = {
    PACKAGES: [
        { id: 'dc_100', name: 'Kese Altın (DC)', amount: 100, price: 1.99 },
        { id: 'dc_550', name: 'Sandık Altın (DC)', amount: 550, price: 9.99 },
        { id: 'dc_1200', name: 'Hazine (DC)', amount: 1200, price: 19.99 },
    ],
    ITEMS: [
        // VIP
        { id: 'vip_silver_30', name: 'Gümüş VIP (30 Gün)', cost: 500, type: 'vip', tier: VipTier.SILVER, days: 30 },
        { id: 'vip_gold_30', name: 'Altın VIP (30 Gün)', cost: 1000, type: 'vip', tier: VipTier.GOLD, days: 30 },

        // Convenience
        { id: 'market_slot_1', name: '+1 Pazar Slotu', cost: 100, type: 'upgrade', key: 'extraMarketSlots', value: 1 },
        { id: 'storage_slot_5', name: '+5 Depo Slotu', cost: 200, type: 'upgrade', key: 'extraStorage', value: 5 },

        // Cosmetics
        { id: 'name_color_red', name: 'Kırmızı İsim', cost: 300, type: 'cosmetic', color: '#ff0000' }
    ]
};

/**
 * Buy Donate Coins (Simulated Payment)
 */
export function buyDonateCoins(player: PlayerState, packageId: string): { success: boolean, updatedPlayer?: PlayerState, message: string } {
    const pack = SHOP_CONFIG.PACKAGES.find(p => p.id === packageId);
    if (!pack) return { success: false, message: 'Paket geçersiz.' };

    return {
        success: true,
        updatedPlayer: {
            ...player,
            donateCoins: (player.donateCoins || 0) + pack.amount
        },
        message: `${pack.amount} DonateCoin satın alındı!`
    };
}

/**
 * Spend Donate Coins in Shop
 */
export function buyShopItem(player: PlayerState, itemId: string): { success: boolean, updatedPlayer?: PlayerState, message: string } {
    const item = SHOP_CONFIG.ITEMS.find(i => i.id === itemId);
    if (!item) return { success: false, message: 'Eşya bulunamadı.' };

    if ((player.donateCoins || 0) < item.cost) {
        return { success: false, message: 'Yetersiz DonateCoin.' };
    }

    let updates: any = {
        donateCoins: (player.donateCoins || 0) - item.cost
    };
    let message = `${item.name} satın alındı.`;

    // Process Item Type
    switch (item.type) {
        case 'vip':
            updates.vipUntil = activateVip(player.vipUntil, item.days || 30, item.tier || VipTier.SILVER);
            updates.vipTier = item.tier; // Store tier
            message += ' VIP aktif edildi!';
            break;

        case 'upgrade':
            if (item.key) {
                const currentVal = (player as any)[item.key] || 0;
                updates[item.key] = currentVal + (item.value || 1);
            }
            break;

        case 'cosmetic':
            // Logic to unlock cosmetic would go here (e.g., adding to ownedCosmetics list)
            break;
    }

    return {
        success: true,
        updatedPlayer: { ...player, ...updates },
        message
    };
}
