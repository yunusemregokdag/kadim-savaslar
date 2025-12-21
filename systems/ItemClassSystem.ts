// ============================================
// ITEM SINIF SİSTEMİ (Normal / High Class / Unique)
// Knight Online tarzı item kategorileri
// ============================================

import { ItemStats, CharacterClass } from '../types';

// Item Sınıfı
export type ItemClassType = 'normal' | 'high_class' | 'unique' | 'legendary';

// Item Sınıf Bilgisi
export interface ItemClassInfo {
    type: ItemClassType;
    name: string;
    nameColor: string;
    glowColor: string;
    statMultiplier: number; // Base stat çarpanı
    upgradeScrollType: string; // Hangi scroll ile basılabilir
    maxUpgrade: number;
    tradeRestriction: 'none' | 'bound_on_equip' | 'bound_on_pickup';
    dropChance: number; // Düşme şansı (%)
    icon: string;
}

// ============================================
// ITEM SINIFLARI
// ============================================
export const ITEM_CLASSES: Record<ItemClassType, ItemClassInfo> = {
    normal: {
        type: 'normal',
        name: 'Normal',
        nameColor: '#ffffff',
        glowColor: '#888888',
        statMultiplier: 1.0,
        upgradeScrollType: 'scroll_normal',
        maxUpgrade: 7,
        tradeRestriction: 'none',
        dropChance: 70,
        icon: '⚪'
    },
    high_class: {
        type: 'high_class',
        name: 'High Class',
        nameColor: '#3b82f6',
        glowColor: '#3b82f6',
        statMultiplier: 1.25,
        upgradeScrollType: 'scroll_high_class',
        maxUpgrade: 9,
        tradeRestriction: 'none',
        dropChance: 20,
        icon: '🔵'
    },
    unique: {
        type: 'unique',
        name: 'Unique',
        nameColor: '#a855f7',
        glowColor: '#a855f7',
        statMultiplier: 1.5,
        upgradeScrollType: 'scroll_unique',
        maxUpgrade: 11,
        tradeRestriction: 'bound_on_equip',
        dropChance: 8,
        icon: '🟣'
    },
    legendary: {
        type: 'legendary',
        name: 'Legendary',
        nameColor: '#f59e0b',
        glowColor: '#f59e0b',
        statMultiplier: 2.0,
        upgradeScrollType: 'scroll_legendary',
        maxUpgrade: 12,
        tradeRestriction: 'bound_on_pickup',
        dropChance: 2,
        icon: '🟠'
    }
};

// ============================================
// BASMA KAĞITLARI (Upgrade Scrolls)
// ============================================
export interface UpgradeScroll {
    id: string;
    name: string;
    description: string;
    targetItemClass: ItemClassType[];
    minUpgrade: number; // Bu scroll kaçtan başlar
    maxUpgrade: number; // Bu scroll kaça kadar basar
    successRate: number; // Base başarı oranı (%)
    protectsItem: boolean; // Yanmayı engeller mi
    price: { gold?: number; gems?: number };
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
    icon: string;
}

export const UPGRADE_SCROLLS: UpgradeScroll[] = [
    // Normal Item Scrollları
    {
        id: 'scroll_normal_1_4',
        name: 'Normal Basma Kağıdı (1-4)',
        description: 'Normal itemları +1\'den +4\'e kadar basar',
        targetItemClass: ['normal'],
        minUpgrade: 0,
        maxUpgrade: 4,
        successRate: 100,
        protectsItem: false,
        price: { gold: 1000 },
        rarity: 'common',
        icon: '📜'
    },
    {
        id: 'scroll_normal_5_7',
        name: 'Normal Basma Kağıdı (5-7)',
        description: 'Normal itemları +5\'den +7\'ye kadar basar',
        targetItemClass: ['normal'],
        minUpgrade: 4,
        maxUpgrade: 7,
        successRate: 70,
        protectsItem: false,
        price: { gold: 5000 },
        rarity: 'uncommon',
        icon: '📜'
    },

    // High Class Scrollları
    {
        id: 'scroll_hc_1_5',
        name: 'High Class Kağıdı (1-5)',
        description: 'High Class itemları +1\'den +5\'e kadar basar',
        targetItemClass: ['high_class'],
        minUpgrade: 0,
        maxUpgrade: 5,
        successRate: 90,
        protectsItem: false,
        price: { gold: 10000 },
        rarity: 'uncommon',
        icon: '📘'
    },
    {
        id: 'scroll_hc_6_9',
        name: 'High Class Kağıdı (6-9)',
        description: 'High Class itemları +6\'dan +9\'a kadar basar',
        targetItemClass: ['high_class'],
        minUpgrade: 5,
        maxUpgrade: 9,
        successRate: 50,
        protectsItem: false,
        price: { gold: 50000, gems: 50 },
        rarity: 'rare',
        icon: '📘'
    },

    // Unique Scrollları
    {
        id: 'scroll_unique_1_6',
        name: 'Unique Kağıdı (1-6)',
        description: 'Unique itemları +1\'den +6\'ya kadar basar',
        targetItemClass: ['unique'],
        minUpgrade: 0,
        maxUpgrade: 6,
        successRate: 80,
        protectsItem: false,
        price: { gold: 25000, gems: 25 },
        rarity: 'rare',
        icon: '📕'
    },
    {
        id: 'scroll_unique_7_11',
        name: 'Unique Kağıdı (7-11)',
        description: 'Unique itemları +7\'den +11\'e kadar basar',
        targetItemClass: ['unique'],
        minUpgrade: 6,
        maxUpgrade: 11,
        successRate: 30,
        protectsItem: false,
        price: { gold: 100000, gems: 200 },
        rarity: 'epic',
        icon: '📕'
    },

    // Legendary Scrollları
    {
        id: 'scroll_legendary_1_7',
        name: 'Efsane Kağıdı (1-7)',
        description: 'Legendary itemları +1\'den +7\'ye kadar basar',
        targetItemClass: ['legendary'],
        minUpgrade: 0,
        maxUpgrade: 7,
        successRate: 70,
        protectsItem: false,
        price: { gold: 100000, gems: 100 },
        rarity: 'epic',
        icon: '📙'
    },
    {
        id: 'scroll_legendary_8_12',
        name: 'Efsane Kağıdı (8-12)',
        description: 'Legendary itemları +8\'den +12\'ye kadar basar',
        targetItemClass: ['legendary'],
        minUpgrade: 7,
        maxUpgrade: 12,
        successRate: 15,
        protectsItem: false,
        price: { gold: 500000, gems: 500 },
        rarity: 'legendary',
        icon: '📙'
    },

    // Koruma Kağıtları
    {
        id: 'scroll_protection_hc',
        name: 'High Class Koruma Kağıdı',
        description: 'High Class item basarken yanmayı engeller',
        targetItemClass: ['high_class'],
        minUpgrade: 5,
        maxUpgrade: 9,
        successRate: 0, // Bu scroll başarı vermez, korur
        protectsItem: true,
        price: { gems: 100 },
        rarity: 'rare',
        icon: '🛡️'
    },
    {
        id: 'scroll_protection_unique',
        name: 'Unique Koruma Kağıdı',
        description: 'Unique item basarken yanmayı engeller',
        targetItemClass: ['unique'],
        minUpgrade: 6,
        maxUpgrade: 11,
        successRate: 0,
        protectsItem: true,
        price: { gems: 250 },
        rarity: 'epic',
        icon: '🛡️'
    },
    {
        id: 'scroll_protection_legendary',
        name: 'Efsane Koruma Kağıdı',
        description: 'Legendary item basarken yanmayı engeller',
        targetItemClass: ['legendary'],
        minUpgrade: 7,
        maxUpgrade: 12,
        successRate: 0,
        protectsItem: true,
        price: { gems: 500 },
        rarity: 'legendary',
        icon: '🛡️'
    }
];

// ============================================
// YATIRIM İTEMLERİ (Değerli Trade Itemları)
// ============================================
export interface InvestmentItem {
    id: string;
    name: string;
    description: string;
    baseValue: number; // Temel değer (gold)
    volatility: number; // Fiyat dalgalanması (0-1 arası)
    rarity: 'rare' | 'epic' | 'legendary' | 'mythic';
    dropSource: string[];
    icon: string;
    color: string;
}

export const INVESTMENT_ITEMS: InvestmentItem[] = [
    // Değerli Taşlar
    {
        id: 'diamond_shard',
        name: 'Elmas Parçası',
        description: 'Nadir bulunan elmas parçası. Yüksek değerde.',
        baseValue: 50000,
        volatility: 0.2,
        rarity: 'rare',
        dropSource: ['Kristal Mağarası', 'Derin Madencilik'],
        icon: '💎',
        color: '#00bcd4'
    },
    {
        id: 'ruby_heart',
        name: 'Yakut Kalbi',
        description: 'Kusursuz yakut. Koleksiyoncular için değerli.',
        baseValue: 150000,
        volatility: 0.3,
        rarity: 'epic',
        dropSource: ['Ateş Ejderhası', 'Volkanik Mağara'],
        icon: '❤️',
        color: '#ef4444'
    },
    {
        id: 'sapphire_tear',
        name: 'Safir Gözyaşı',
        description: 'Efsanevi safir. Büyücüler tarafından aranır.',
        baseValue: 200000,
        volatility: 0.25,
        rarity: 'epic',
        dropSource: ['Buzul Kolosu', 'Donmuş Tapınak'],
        icon: '💧',
        color: '#3b82f6'
    },
    {
        id: 'void_essence',
        name: 'Boşluk Özü',
        description: 'Karanlık boyutlardan gelen nadir öz.',
        baseValue: 500000,
        volatility: 0.4,
        rarity: 'legendary',
        dropSource: ['Boşluk Lordu', 'Gölge Kapısı'],
        icon: '🌑',
        color: '#6b21a8'
    },
    {
        id: 'phoenix_feather',
        name: 'Anka Kuşu Tüyü',
        description: 'Ölümsüz kuşun tüyü. Çok nadir.',
        baseValue: 1000000,
        volatility: 0.35,
        rarity: 'mythic',
        dropSource: ['Anka Kuşu (Event)', 'Efsanevi Sandık'],
        icon: '🪶',
        color: '#f97316'
    },
    {
        id: 'dragons_blood',
        name: 'Ejderha Kanı',
        description: 'Kadim ejderhadan damıtılmış kan.',
        baseValue: 750000,
        volatility: 0.45,
        rarity: 'legendary',
        dropSource: ['Kadim Ejderha Tiamat'],
        icon: '🩸',
        color: '#dc2626'
    },
    {
        id: 'ancient_coin',
        name: 'Kadim Sikke',
        description: 'Antik medeniyetten kalma altın sikke.',
        baseValue: 100000,
        volatility: 0.15,
        rarity: 'rare',
        dropSource: ['Antik Tapınak', 'Hazine Sandığı'],
        icon: '🪙',
        color: '#fbbf24'
    },
    {
        id: 'star_fragment',
        name: 'Yıldız Parçası',
        description: 'Gökyüzünden düşen yıldız parçası.',
        baseValue: 300000,
        volatility: 0.5,
        rarity: 'epic',
        dropSource: ['Meteor Yağmuru (Event)', 'Gök Tapınağı'],
        icon: '⭐',
        color: '#fde047'
    }
];

// ============================================
// YARDIMCI FONKSİYONLAR
// ============================================

// Item sınıfını belirle (drop için)
export function rollItemClass(): ItemClassType {
    const roll = Math.random() * 100;

    if (roll <= ITEM_CLASSES.legendary.dropChance) {
        return 'legendary';
    } else if (roll <= ITEM_CLASSES.legendary.dropChance + ITEM_CLASSES.unique.dropChance) {
        return 'unique';
    } else if (roll <= ITEM_CLASSES.legendary.dropChance + ITEM_CLASSES.unique.dropChance + ITEM_CLASSES.high_class.dropChance) {
        return 'high_class';
    }
    return 'normal';
}

// Item için uygun scroll bul
export function findCompatibleScroll(itemClass: ItemClassType, currentUpgrade: number): UpgradeScroll | null {
    return UPGRADE_SCROLLS.find(scroll =>
        scroll.targetItemClass.includes(itemClass) &&
        currentUpgrade >= scroll.minUpgrade &&
        currentUpgrade < scroll.maxUpgrade &&
        !scroll.protectsItem
    ) || null;
}

// Koruma scrollu bul
export function findProtectionScroll(itemClass: ItemClassType, currentUpgrade: number): UpgradeScroll | null {
    return UPGRADE_SCROLLS.find(scroll =>
        scroll.targetItemClass.includes(itemClass) &&
        currentUpgrade >= scroll.minUpgrade &&
        currentUpgrade < scroll.maxUpgrade &&
        scroll.protectsItem
    ) || null;
}

// Yatırım item fiyatını hesapla (dalgalanma ile)
export function calculateInvestmentPrice(item: InvestmentItem): number {
    const fluctuation = (Math.random() - 0.5) * 2 * item.volatility;
    return Math.floor(item.baseValue * (1 + fluctuation));
}

// Item sınıfına göre stat çarpanı uygula
export function applyItemClassMultiplier(baseStats: Partial<ItemStats>, itemClass: ItemClassType): Partial<ItemStats> {
    const multiplier = ITEM_CLASSES[itemClass].statMultiplier;
    const result: Partial<ItemStats> = {};

    for (const [key, value] of Object.entries(baseStats)) {
        if (typeof value === 'number') {
            result[key as keyof ItemStats] = Math.floor(value * multiplier);
        }
    }

    return result;
}

// Export all
export const itemClassSystem = {
    ITEM_CLASSES,
    UPGRADE_SCROLLS,
    INVESTMENT_ITEMS,
    rollItemClass,
    findCompatibleScroll,
    findProtectionScroll,
    calculateInvestmentPrice,
    applyItemClassMultiplier
};
