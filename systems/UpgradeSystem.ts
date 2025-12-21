// ============================================
// UPGRADE SİSTEMİ - YANMA/ESKİME MEKANİĞİ
// ============================================

export interface UpgradeResult {
    success: boolean;
    newLevel: number;
    itemDestroyed: boolean;  // %90 şans - item tamamen yanıyor
    itemDamaged: boolean;    // %10 şans - item hasar alıyor, tamir gerekli
    damageAmount?: number;   // 0-100 arası hasar
    message: string;
}

export interface ItemDurability {
    current: number;  // Şu anki dayanıklılık
    max: number;      // Maksimum dayanıklılık
}

// Upgrade başarı şansları (level bazlı)
export const UPGRADE_SUCCESS_RATES: { [key: number]: number } = {
    1: 100,  // +1 -> +2: %100
    2: 95,   // +2 -> +3: %95
    3: 90,   // +3 -> +4: %90
    4: 85,   // +4 -> +5: %85
    5: 75,   // +5 -> +6: %75
    6: 60,   // +6 -> +7: %60
    7: 45,   // +7 -> +8: %45 (Parlama başlangıcı)
    8: 35,   // +8 -> +9: %35
    9: 25,   // +9 -> +10: %25 (Renk değişimi)
    10: 15,  // +10 -> +11: %15 (Parçacıklar)
    11: 10,  // +11 -> +12: %10 (Maksimum efekt)
    12: 0,   // +12 maksimum
};

// Upgrade malzeme maliyetleri
export const UPGRADE_COSTS: { [key: number]: { gold: number; stones: number } } = {
    1: { gold: 100, stones: 1 },
    2: { gold: 200, stones: 2 },
    3: { gold: 500, stones: 3 },
    4: { gold: 1000, stones: 5 },
    5: { gold: 2000, stones: 8 },
    6: { gold: 5000, stones: 12 },
    7: { gold: 10000, stones: 20 },
    8: { gold: 25000, stones: 35 },
    9: { gold: 50000, stones: 50 },
    10: { gold: 100000, stones: 75 },
    11: { gold: 200000, stones: 100 },
};

// Upgrade işlemi
export function attemptUpgrade(
    currentLevel: number,
    itemTier: number,
    useProtectionScroll: boolean = false
): UpgradeResult {
    const maxLevel = 12;

    if (currentLevel >= maxLevel) {
        return {
            success: false,
            newLevel: currentLevel,
            itemDestroyed: false,
            itemDamaged: false,
            message: 'Item zaten maksimum seviyede!'
        };
    }

    const successRate = UPGRADE_SUCCESS_RATES[currentLevel] || 0;
    const roll = Math.random() * 100;

    // Başarılı upgrade
    if (roll <= successRate) {
        return {
            success: true,
            newLevel: currentLevel + 1,
            itemDestroyed: false,
            itemDamaged: false,
            message: `Başarılı! Item +${currentLevel + 1} oldu!`
        };
    }

    // Başarısız - +7 ve üzeri için yanma/eskime riski
    if (currentLevel >= 7 && !useProtectionScroll) {
        const destructionRoll = Math.random() * 100;

        // %90 yanma, %10 eskime
        if (destructionRoll <= 90) {
            return {
                success: false,
                newLevel: currentLevel,
                itemDestroyed: true,
                itemDamaged: false,
                message: '💥 Item yandı ve yok oldu!'
            };
        } else {
            // Eskime - hasar alır
            const damageAmount = Math.floor(Math.random() * 30) + 20; // 20-50 hasar
            return {
                success: false,
                newLevel: currentLevel,
                itemDestroyed: false,
                itemDamaged: true,
                damageAmount,
                message: `⚠️ Upgrade başarısız! Item ${damageAmount} hasar aldı.`
            };
        }
    }

    // +7 altı - sadece başarısız, kayıp yok
    return {
        success: false,
        newLevel: currentLevel,
        itemDestroyed: false,
        itemDamaged: false,
        message: 'Upgrade başarısız oldu.'
    };
}

// Tamir maliyeti hesaplama
export function calculateRepairCost(durability: ItemDurability, itemTier: number): number {
    const damagePercent = 1 - (durability.current / durability.max);
    const baseCost = itemTier * 500;
    return Math.floor(baseCost * damagePercent);
}

// Item tamiri
export function repairItem(durability: ItemDurability): ItemDurability {
    return {
        current: durability.max,
        max: durability.max
    };
}
