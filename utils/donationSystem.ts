import { PlayerState, Item } from '../types';
import { activateVIP } from './vipSystem';

export const DONATION_PACKAGES = [
    { id: 'pack_small', name: 'Avuç Dolusu Elmas', gems: 100, price: 1.99 },
    { id: 'pack_medium', name: 'Elmas Kesesi', gems: 550, price: 9.99 },
    { id: 'pack_large', name: 'Elmas Sandığı', gems: 1200, price: 19.99 },
    { id: 'vip_30', name: '30 Gün VIP', gems: 0, vipDays: 30, price: 9.99 },
];

/**
 * Process a simulated donation/purchase
 */
export function processDonation(
    player: PlayerState,
    packageId: string
): { success: boolean, playerUpdates?: Partial<PlayerState>, message: string } {

    const pack = DONATION_PACKAGES.find(p => p.id === packageId);
    if (!pack) return { success: false, message: 'Paket bulunamadı.' };

    let updates: Partial<PlayerState> = {};
    let messages: string[] = [`Satın alma başarılı: ${pack.name}`];

    // Grant Gems
    if (pack.gems > 0) {
        updates.gems = (player.gems || 0) + pack.gems;
        messages.push(`${pack.gems} Elmas eklendi.`);
    }

    // Grant VIP
    if (pack.vipDays && pack.vipDays > 0) {
        updates.vipUntil = activateVIP(player.vipUntil, pack.vipDays);
        messages.push(`${pack.vipDays} Gün VIP eklendi.`);
    }

    return {
        success: true,
        playerUpdates: updates,
        message: messages.join('\n')
    };
}
