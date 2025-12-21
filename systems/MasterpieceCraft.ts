// ============================================
// MASTERPIECE CRAFT SİSTEMİ (%2 ŞANS)
// ============================================

import { Item, Equipment } from '../types';

export interface MasterpieceItem extends Equipment {
    isMasterpiece: boolean;
    creatorName: string;
    createdAt: number;
    bonusMultiplier: number; // %5 = 1.05
}

export interface CraftResult {
    success: boolean;
    item: Equipment | MasterpieceItem | null;
    isMasterpiece: boolean;
    message: string;
}

// Masterpiece şansı (%)
export const MASTERPIECE_CHANCE = 2.0;

// Masterpiece bonus çarpanı
export const MASTERPIECE_BONUS = 1.05; // %5 daha güçlü

// Craft işlemi
export function craftItem(
    playerName: string,
    recipeId: string,
    resultItem: Equipment
): CraftResult {
    const roll = Math.random() * 100;

    if (roll <= MASTERPIECE_CHANCE) {
        // MASTERPIECE!
        const masterpieceItem: MasterpieceItem = {
            ...resultItem,
            isMasterpiece: true,
            creatorName: playerName,
            createdAt: Date.now(),
            bonusMultiplier: MASTERPIECE_BONUS,
            // Statları %5 artır
            attack: Math.floor((resultItem.attack || 0) * MASTERPIECE_BONUS),
            defense: Math.floor((resultItem.defense || 0) * MASTERPIECE_BONUS),
            strength: Math.floor((resultItem.strength || 0) * MASTERPIECE_BONUS),
            dexterity: Math.floor((resultItem.dexterity || 0) * MASTERPIECE_BONUS),
            intelligence: Math.floor((resultItem.intelligence || 0) * MASTERPIECE_BONUS),
            vitality: Math.floor((resultItem.vitality || 0) * MASTERPIECE_BONUS),
            hp: Math.floor((resultItem.hp || 0) * MASTERPIECE_BONUS),
            mana: Math.floor((resultItem.mana || 0) * MASTERPIECE_BONUS),
            critChance: (resultItem.critChance || 0) * MASTERPIECE_BONUS,
            critDamage: (resultItem.critDamage || 0) * MASTERPIECE_BONUS,
            // İsmi güncelle
            name: `⭐ ${resultItem.name} (${playerName})`,
        };

        return {
            success: true,
            item: masterpieceItem,
            isMasterpiece: true,
            message: `🌟 USTA İŞİ! ${playerName} efsanevi bir eser üretti!`
        };
    }

    // Normal craft
    return {
        success: true,
        item: resultItem,
        isMasterpiece: false,
        message: `${resultItem.name} başarıyla üretildi.`
    };
}

// Masterpiece kontrolü
export function isMasterpiece(item: Equipment): item is MasterpieceItem {
    return (item as MasterpieceItem).isMasterpiece === true;
}

// Masterpiece tooltip bilgisi
export function getMasterpieceTooltip(item: MasterpieceItem): string {
    const date = new Date(item.createdAt).toLocaleDateString('tr-TR');
    return `⭐ Usta İşi\n👤 Üreten: ${item.creatorName}\n📅 Tarih: ${date}\n💪 Bonus: +%5 Stat`;
}

// Dünya duyurusu için mesaj
export function getMasterpieceAnnouncement(playerName: string, itemName: string): string {
    return `🌟 ${playerName} efsanevi bir ${itemName} üretti!`;
}
