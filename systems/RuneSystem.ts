// ============================================
// RÜN VE TAŞ CRAFT SİSTEMİ
// Emek bazlı ekonomi (P2W karşıtı)
// ============================================

import { CharacterClass, ItemStats } from '../types';

// Rün Tipleri
export type RuneElement = 'fire' | 'ice' | 'lightning' | 'earth' | 'void' | 'holy' | 'nature';

// Rün Tanımı
export interface Rune {
    id: string;
    name: string;
    element: RuneElement;
    tier: number; // 1-5
    stats: Partial<ItemStats>;
    specialEffect?: string;
    icon: string;
    color: string;
}

// Rün Yuvası
export interface RuneSlot {
    id: string;
    isUnlocked: boolean;
    insertedRune: Rune | null;
    slotLevel: number; // 1-3 (daha yüksek tier rünler için)
}

// Rün Craft Tarifi
export interface RuneCraftRecipe {
    resultRuneId: string;
    materials: { itemId: string; count: number }[];
    goldCost: number;
    successRate: number; // %
    requiredLevel: number;
    craftingTime: number; // Saniye
}

// ============================================
// RÜNLER (TÜM TİERLAR)
// ============================================
export const RUNES: Rune[] = [
    // ATEŞ RÜNLER
    {
        id: 'rune_fire_t1',
        name: 'Küçük Ateş Rünü',
        element: 'fire',
        tier: 1,
        stats: { damage: 5 },
        icon: '🔥',
        color: '#ff4400'
    },
    {
        id: 'rune_fire_t2',
        name: 'Ateş Rünü',
        element: 'fire',
        tier: 2,
        stats: { damage: 12 },
        specialEffect: '%5 yanma şansı',
        icon: '🔥',
        color: '#ff6600'
    },
    {
        id: 'rune_fire_t3',
        name: 'Büyük Ateş Rünü',
        element: 'fire',
        tier: 3,
        stats: { damage: 25, critChance: 3 },
        specialEffect: '%10 yanma şansı',
        icon: '🔥',
        color: '#ff8800'
    },
    {
        id: 'rune_fire_t4',
        name: 'Yüce Ateş Rünü',
        element: 'fire',
        tier: 4,
        stats: { damage: 45, critChance: 5, critDamage: 10 },
        specialEffect: '%15 yanma şansı, yakın düşmanlara hasar',
        icon: '🔥',
        color: '#ffaa00'
    },
    {
        id: 'rune_fire_t5',
        name: 'Efsanevi Ateş Rünü',
        element: 'fire',
        tier: 5,
        stats: { damage: 75, critChance: 8, critDamage: 20 },
        specialEffect: '%25 yanma şansı, alan hasarı',
        icon: '🔥',
        color: '#ffcc00'
    },

    // BUZ RÜNLER
    {
        id: 'rune_ice_t1',
        name: 'Küçük Buz Rünü',
        element: 'ice',
        tier: 1,
        stats: { defense: 5 },
        icon: '❄️',
        color: '#00ccff'
    },
    {
        id: 'rune_ice_t2',
        name: 'Buz Rünü',
        element: 'ice',
        tier: 2,
        stats: { defense: 12, hp: 20 },
        specialEffect: '%5 yavaşlatma şansı',
        icon: '❄️',
        color: '#00ddff'
    },
    {
        id: 'rune_ice_t3',
        name: 'Büyük Buz Rünü',
        element: 'ice',
        tier: 3,
        stats: { defense: 25, hp: 50, mana: 20 },
        specialEffect: '%10 dondurma şansı',
        icon: '❄️',
        color: '#00eeff'
    },
    {
        id: 'rune_ice_t4',
        name: 'Yüce Buz Rünü',
        element: 'ice',
        tier: 4,
        stats: { defense: 45, hp: 100, mana: 40 },
        specialEffect: '%15 dondurma şansı, buz zırhı',
        icon: '❄️',
        color: '#66ffff'
    },
    {
        id: 'rune_ice_t5',
        name: 'Efsanevi Buz Rünü',
        element: 'ice',
        tier: 5,
        stats: { defense: 75, hp: 200, mana: 80 },
        specialEffect: '%25 dondurma şansı, buz patlaması',
        icon: '❄️',
        color: '#aaffff'
    },

    // ŞİMŞEK RÜNLER
    {
        id: 'rune_lightning_t1',
        name: 'Küçük Şimşek Rünü',
        element: 'lightning',
        tier: 1,
        stats: { attackSpeed: 3 },
        icon: '⚡',
        color: '#ffff00'
    },
    {
        id: 'rune_lightning_t2',
        name: 'Şimşek Rünü',
        element: 'lightning',
        tier: 2,
        stats: { attackSpeed: 6, damage: 8 },
        specialEffect: '%5 sersemletme şansı',
        icon: '⚡',
        color: '#ffff33'
    },
    {
        id: 'rune_lightning_t3',
        name: 'Büyük Şimşek Rünü',
        element: 'lightning',
        tier: 3,
        stats: { attackSpeed: 10, damage: 15, critChance: 5 },
        specialEffect: '%10 zincir şimşek şansı',
        icon: '⚡',
        color: '#ffff66'
    },
    {
        id: 'rune_lightning_t4',
        name: 'Yüce Şimşek Rünü',
        element: 'lightning',
        tier: 4,
        stats: { attackSpeed: 15, damage: 30, critChance: 8 },
        specialEffect: '%15 zincir şimşek, enerji kalkanı',
        icon: '⚡',
        color: '#ffff99'
    },
    {
        id: 'rune_lightning_t5',
        name: 'Efsanevi Şimşek Rünü',
        element: 'lightning',
        tier: 5,
        stats: { attackSpeed: 20, damage: 50, critChance: 12, critDamage: 15 },
        specialEffect: '%25 zincir şimşek, fırtına çağırma',
        icon: '⚡',
        color: '#ffffcc'
    },

    // TOPRAK RÜNLER
    {
        id: 'rune_earth_t1',
        name: 'Küçük Toprak Rünü',
        element: 'earth',
        tier: 1,
        stats: { hp: 15, defense: 3 },
        icon: '🪨',
        color: '#8b4513'
    },
    {
        id: 'rune_earth_t2',
        name: 'Toprak Rünü',
        element: 'earth',
        tier: 2,
        stats: { hp: 40, defense: 8, vitality: 3 },
        specialEffect: '%5 hasar yansıtma',
        icon: '🪨',
        color: '#a0522d'
    },
    {
        id: 'rune_earth_t3',
        name: 'Büyük Toprak Rünü',
        element: 'earth',
        tier: 3,
        stats: { hp: 80, defense: 20, vitality: 8 },
        specialEffect: '%10 hasar yansıtma, taş zırh',
        icon: '🪨',
        color: '#b8860b'
    },
    {
        id: 'rune_earth_t4',
        name: 'Yüce Toprak Rünü',
        element: 'earth',
        tier: 4,
        stats: { hp: 150, defense: 40, vitality: 15 },
        specialEffect: '%15 hasar yansıtma, deprem şansı',
        icon: '🪨',
        color: '#daa520'
    },
    {
        id: 'rune_earth_t5',
        name: 'Efsanevi Toprak Rünü',
        element: 'earth',
        tier: 5,
        stats: { hp: 300, defense: 70, vitality: 25 },
        specialEffect: '%25 hasar yansıtma, toprak kalkanı',
        icon: '🪨',
        color: '#ffd700'
    },

    // BOŞLUK RÜNLER
    {
        id: 'rune_void_t1',
        name: 'Küçük Boşluk Rünü',
        element: 'void',
        tier: 1,
        stats: { critDamage: 5 },
        icon: '🌑',
        color: '#4b0082'
    },
    {
        id: 'rune_void_t2',
        name: 'Boşluk Rünü',
        element: 'void',
        tier: 2,
        stats: { critDamage: 12, critChance: 3 },
        specialEffect: '%3 hayat çalma',
        icon: '🌑',
        color: '#6600cc'
    },
    {
        id: 'rune_void_t3',
        name: 'Büyük Boşluk Rünü',
        element: 'void',
        tier: 3,
        stats: { critDamage: 25, critChance: 6, damage: 15 },
        specialEffect: '%6 hayat çalma, gölge hasarı',
        icon: '🌑',
        color: '#8800ff'
    },
    {
        id: 'rune_void_t4',
        name: 'Yüce Boşluk Rünü',
        element: 'void',
        tier: 4,
        stats: { critDamage: 40, critChance: 10, damage: 30 },
        specialEffect: '%10 hayat çalma, gölge patlaması',
        icon: '🌑',
        color: '#aa00ff'
    },
    {
        id: 'rune_void_t5',
        name: 'Efsanevi Boşluk Rünü',
        element: 'void',
        tier: 5,
        stats: { critDamage: 60, critChance: 15, damage: 50 },
        specialEffect: '%15 hayat çalma, infaz bonusu',
        icon: '🌑',
        color: '#cc00ff'
    },

    // KUTSAL RÜNLER
    {
        id: 'rune_holy_t1',
        name: 'Küçük Kutsal Rünü',
        element: 'holy',
        tier: 1,
        stats: { mana: 10, intelligence: 2 },
        icon: '✨',
        color: '#ffffcc'
    },
    {
        id: 'rune_holy_t2',
        name: 'Kutsal Rünü',
        element: 'holy',
        tier: 2,
        stats: { mana: 25, intelligence: 5, hp: 20 },
        specialEffect: '%3 şifa artışı',
        icon: '✨',
        color: '#ffffdd'
    },
    {
        id: 'rune_holy_t3',
        name: 'Büyük Kutsal Rünü',
        element: 'holy',
        tier: 3,
        stats: { mana: 50, intelligence: 12, hp: 50 },
        specialEffect: '%8 şifa artışı, kutsama',
        icon: '✨',
        color: '#ffffee'
    },
    {
        id: 'rune_holy_t4',
        name: 'Yüce Kutsal Rünü',
        element: 'holy',
        tier: 4,
        stats: { mana: 100, intelligence: 25, hp: 100 },
        specialEffect: '%15 şifa artışı, ilahi kalkan',
        icon: '✨',
        color: '#ffffff'
    },
    {
        id: 'rune_holy_t5',
        name: 'Efsanevi Kutsal Rünü',
        element: 'holy',
        tier: 5,
        stats: { mana: 200, intelligence: 40, hp: 200 },
        specialEffect: '%25 şifa artışı, diriliş şansı',
        icon: '✨',
        color: '#ffffff'
    },

    // DOĞA RÜNLER
    {
        id: 'rune_nature_t1',
        name: 'Küçük Doğa Rünü',
        element: 'nature',
        tier: 1,
        stats: { hp: 10, mana: 5 },
        icon: '🌿',
        color: '#00cc00'
    },
    {
        id: 'rune_nature_t2',
        name: 'Doğa Rünü',
        element: 'nature',
        tier: 2,
        stats: { hp: 30, mana: 15, vitality: 3 },
        specialEffect: 'HP yenileme +1/sn',
        icon: '🌿',
        color: '#00dd00'
    },
    {
        id: 'rune_nature_t3',
        name: 'Büyük Doğa Rünü',
        element: 'nature',
        tier: 3,
        stats: { hp: 70, mana: 35, vitality: 8 },
        specialEffect: 'HP yenileme +3/sn, zehir bağışıklığı',
        icon: '🌿',
        color: '#00ee00'
    },
    {
        id: 'rune_nature_t4',
        name: 'Yüce Doğa Rünü',
        element: 'nature',
        tier: 4,
        stats: { hp: 130, mana: 65, vitality: 15 },
        specialEffect: 'HP yenileme +6/sn, doğa kalkanı',
        icon: '🌿',
        color: '#33ff33'
    },
    {
        id: 'rune_nature_t5',
        name: 'Efsanevi Doğa Rünü',
        element: 'nature',
        tier: 5,
        stats: { hp: 250, mana: 120, vitality: 25 },
        specialEffect: 'HP yenileme +10/sn, yeniden doğuş',
        icon: '🌿',
        color: '#66ff66'
    }
];

// ============================================
// RÜN CRAFT TARİFLERİ
// ============================================
export const RUNE_RECIPES: RuneCraftRecipe[] = [
    // Tier 1 - Basit
    { resultRuneId: 'rune_fire_t1', materials: [{ itemId: 'fire_essence', count: 3 }, { itemId: 'crystal_shard', count: 1 }], goldCost: 500, successRate: 100, requiredLevel: 1, craftingTime: 30 },
    { resultRuneId: 'rune_ice_t1', materials: [{ itemId: 'ice_essence', count: 3 }, { itemId: 'crystal_shard', count: 1 }], goldCost: 500, successRate: 100, requiredLevel: 1, craftingTime: 30 },
    { resultRuneId: 'rune_lightning_t1', materials: [{ itemId: 'lightning_essence', count: 3 }, { itemId: 'crystal_shard', count: 1 }], goldCost: 500, successRate: 100, requiredLevel: 1, craftingTime: 30 },
    { resultRuneId: 'rune_earth_t1', materials: [{ itemId: 'earth_essence', count: 3 }, { itemId: 'crystal_shard', count: 1 }], goldCost: 500, successRate: 100, requiredLevel: 1, craftingTime: 30 },
    { resultRuneId: 'rune_void_t1', materials: [{ itemId: 'void_essence', count: 3 }, { itemId: 'crystal_shard', count: 1 }], goldCost: 500, successRate: 100, requiredLevel: 1, craftingTime: 30 },
    { resultRuneId: 'rune_holy_t1', materials: [{ itemId: 'holy_essence', count: 3 }, { itemId: 'crystal_shard', count: 1 }], goldCost: 500, successRate: 100, requiredLevel: 1, craftingTime: 30 },
    { resultRuneId: 'rune_nature_t1', materials: [{ itemId: 'nature_essence', count: 3 }, { itemId: 'crystal_shard', count: 1 }], goldCost: 500, successRate: 100, requiredLevel: 1, craftingTime: 30 },

    // Tier 2
    { resultRuneId: 'rune_fire_t2', materials: [{ itemId: 'rune_fire_t1', count: 3 }, { itemId: 'fire_essence', count: 5 }], goldCost: 2000, successRate: 90, requiredLevel: 10, craftingTime: 60 },
    { resultRuneId: 'rune_ice_t2', materials: [{ itemId: 'rune_ice_t1', count: 3 }, { itemId: 'ice_essence', count: 5 }], goldCost: 2000, successRate: 90, requiredLevel: 10, craftingTime: 60 },
    { resultRuneId: 'rune_lightning_t2', materials: [{ itemId: 'rune_lightning_t1', count: 3 }, { itemId: 'lightning_essence', count: 5 }], goldCost: 2000, successRate: 90, requiredLevel: 10, craftingTime: 60 },
    { resultRuneId: 'rune_earth_t2', materials: [{ itemId: 'rune_earth_t1', count: 3 }, { itemId: 'earth_essence', count: 5 }], goldCost: 2000, successRate: 90, requiredLevel: 10, craftingTime: 60 },
    { resultRuneId: 'rune_void_t2', materials: [{ itemId: 'rune_void_t1', count: 3 }, { itemId: 'void_essence', count: 5 }], goldCost: 2000, successRate: 90, requiredLevel: 10, craftingTime: 60 },
    { resultRuneId: 'rune_holy_t2', materials: [{ itemId: 'rune_holy_t1', count: 3 }, { itemId: 'holy_essence', count: 5 }], goldCost: 2000, successRate: 90, requiredLevel: 10, craftingTime: 60 },
    { resultRuneId: 'rune_nature_t2', materials: [{ itemId: 'rune_nature_t1', count: 3 }, { itemId: 'nature_essence', count: 5 }], goldCost: 2000, successRate: 90, requiredLevel: 10, craftingTime: 60 },

    // Tier 3
    { resultRuneId: 'rune_fire_t3', materials: [{ itemId: 'rune_fire_t2', count: 3 }, { itemId: 'fire_essence', count: 10 }, { itemId: 'rare_crystal', count: 1 }], goldCost: 8000, successRate: 75, requiredLevel: 18, craftingTime: 120 },
    { resultRuneId: 'rune_ice_t3', materials: [{ itemId: 'rune_ice_t2', count: 3 }, { itemId: 'ice_essence', count: 10 }, { itemId: 'rare_crystal', count: 1 }], goldCost: 8000, successRate: 75, requiredLevel: 18, craftingTime: 120 },

    // Tier 4
    { resultRuneId: 'rune_fire_t4', materials: [{ itemId: 'rune_fire_t3', count: 3 }, { itemId: 'fire_essence', count: 20 }, { itemId: 'epic_crystal', count: 1 }], goldCost: 25000, successRate: 50, requiredLevel: 25, craftingTime: 300 },

    // Tier 5 (Çok zor)
    { resultRuneId: 'rune_fire_t5', materials: [{ itemId: 'rune_fire_t4', count: 3 }, { itemId: 'fire_essence', count: 50 }, { itemId: 'legendary_crystal', count: 1 }, { itemId: 'ancient_tome', count: 1 }], goldCost: 100000, successRate: 25, requiredLevel: 30, craftingTime: 600 }
];

// ============================================
// RÜN YUVASI AÇMA (MARKET GELİRİ)
// ============================================
export interface RuneSlotScroll {
    id: string;
    name: string;
    slotLevel: number; // 1-3
    price: { gems: number };
    description: string;
}

export const RUNE_SLOT_SCROLLS: RuneSlotScroll[] = [
    {
        id: 'scroll_rune_slot_1',
        name: 'Rün Yuvası Parşömeni (Temel)',
        slotLevel: 1,
        price: { gems: 100 },
        description: 'Bir iteme Tier 1-2 rün yuvası açar'
    },
    {
        id: 'scroll_rune_slot_2',
        name: 'Rün Yuvası Parşömeni (Gelişmiş)',
        slotLevel: 2,
        price: { gems: 250 },
        description: 'Bir iteme Tier 1-3 rün yuvası açar'
    },
    {
        id: 'scroll_rune_slot_3',
        name: 'Rün Yuvası Parşömeni (Efsanevi)',
        slotLevel: 3,
        price: { gems: 500 },
        description: 'Bir iteme Tier 1-5 rün yuvası açar'
    }
];

// ============================================
// RÜN SİSTEMİ YÖNETİCİSİ
// ============================================
export interface PlayerRuneData {
    ownedRunes: { runeId: string; count: number }[];
    craftingQueue: { recipeId: string; startTime: number; endTime: number }[];
    itemRuneSlots: Record<string, RuneSlot[]>; // item_id -> slots
}

export class RuneSystemManager {
    private playerData: PlayerRuneData;

    constructor() {
        this.playerData = this.loadPlayerData();
    }

    private loadPlayerData(): PlayerRuneData {
        const saved = localStorage.getItem('kadim_rune_system');
        if (saved) {
            return JSON.parse(saved);
        }
        return {
            ownedRunes: [],
            craftingQueue: [],
            itemRuneSlots: {}
        };
    }

    private savePlayerData(): void {
        localStorage.setItem('kadim_rune_system', JSON.stringify(this.playerData));
    }

    // Rün craft et
    startCrafting(recipeId: string): { success: boolean; message: string } {
        const recipe = RUNE_RECIPES.find(r => r.resultRuneId === recipeId);
        if (!recipe) {
            return { success: false, message: 'Geçersiz tarif' };
        }

        const now = Date.now();
        const endTime = now + (recipe.craftingTime * 1000);

        this.playerData.craftingQueue.push({
            recipeId: recipe.resultRuneId,
            startTime: now,
            endTime
        });

        this.savePlayerData();
        return { success: true, message: `Craft başladı! ${recipe.craftingTime} saniye` };
    }

    // Craft tamamlandı mı kontrol et
    checkCraftingComplete(): Rune[] {
        const now = Date.now();
        const completedRunes: Rune[] = [];

        this.playerData.craftingQueue = this.playerData.craftingQueue.filter(craft => {
            if (craft.endTime <= now) {
                // Başarı şansı kontrolü
                const recipe = RUNE_RECIPES.find(r => r.resultRuneId === craft.recipeId);
                if (recipe && Math.random() * 100 <= recipe.successRate) {
                    const rune = RUNES.find(r => r.id === craft.recipeId);
                    if (rune) {
                        this.addRune(rune.id);
                        completedRunes.push(rune);
                    }
                }
                return false; // Remove from queue
            }
            return true; // Keep in queue
        });

        this.savePlayerData();
        return completedRunes;
    }

    // Rün ekle
    addRune(runeId: string, count: number = 1): void {
        const existing = this.playerData.ownedRunes.find(r => r.runeId === runeId);
        if (existing) {
            existing.count += count;
        } else {
            this.playerData.ownedRunes.push({ runeId, count });
        }
        this.savePlayerData();
    }

    // Rün kullan (item'a tak)
    insertRune(itemId: string, slotIndex: number, runeId: string): { success: boolean; message: string } {
        const slots = this.playerData.itemRuneSlots[itemId];
        if (!slots || !slots[slotIndex]) {
            return { success: false, message: 'Geçersiz yuva' };
        }

        const slot = slots[slotIndex];
        if (!slot.isUnlocked) {
            return { success: false, message: 'Yuva kilitli' };
        }

        const rune = RUNES.find(r => r.id === runeId);
        if (!rune) {
            return { success: false, message: 'Geçersiz rün' };
        }

        if (rune.tier > slot.slotLevel) {
            return { success: false, message: `Bu yuva sadece Tier ${slot.slotLevel} ve altı rünleri kabul eder` };
        }

        // Rün var mı kontrol et
        const owned = this.playerData.ownedRunes.find(r => r.runeId === runeId);
        if (!owned || owned.count <= 0) {
            return { success: false, message: 'Bu rüne sahip değilsiniz' };
        }

        // Eski rünü çıkar
        if (slot.insertedRune) {
            this.addRune(slot.insertedRune.id);
        }

        // Yeni rünü tak
        slot.insertedRune = rune;
        owned.count--;

        this.savePlayerData();
        return { success: true, message: `${rune.name} takıldı!` };
    }

    // Rün çıkar
    removeRune(itemId: string, slotIndex: number): { success: boolean; message: string } {
        const slots = this.playerData.itemRuneSlots[itemId];
        if (!slots || !slots[slotIndex]) {
            return { success: false, message: 'Geçersiz yuva' };
        }

        const slot = slots[slotIndex];
        if (!slot.insertedRune) {
            return { success: false, message: 'Bu yuvada rün yok' };
        }

        this.addRune(slot.insertedRune.id);
        slot.insertedRune = null;

        this.savePlayerData();
        return { success: true, message: 'Rün çıkarıldı' };
    }

    // Yuva aç
    unlockSlot(itemId: string, scrollId: string): { success: boolean; message: string } {
        const scroll = RUNE_SLOT_SCROLLS.find(s => s.id === scrollId);
        if (!scroll) {
            return { success: false, message: 'Geçersiz parşömen' };
        }

        if (!this.playerData.itemRuneSlots[itemId]) {
            this.playerData.itemRuneSlots[itemId] = [];
        }

        const slots = this.playerData.itemRuneSlots[itemId];
        if (slots.length >= 3) {
            return { success: false, message: 'Bu itemde maksimum yuva sayısına ulaşıldı' };
        }

        slots.push({
            id: `slot_${Date.now()}`,
            isUnlocked: true,
            insertedRune: null,
            slotLevel: scroll.slotLevel
        });

        this.savePlayerData();
        return { success: true, message: `Tier ${scroll.slotLevel} yuva açıldı!` };
    }

    // Item'ın toplam rün bonuslarını hesapla
    getItemRuneStats(itemId: string): Partial<ItemStats> {
        const slots = this.playerData.itemRuneSlots[itemId];
        if (!slots) return {};

        const totalStats: Partial<ItemStats> = {};

        slots.forEach(slot => {
            if (slot.insertedRune) {
                Object.entries(slot.insertedRune.stats).forEach(([stat, value]) => {
                    const key = stat as keyof ItemStats;
                    totalStats[key] = (totalStats[key] || 0) + (value || 0);
                });
            }
        });

        return totalStats;
    }

    // Sahip olunan rünleri getir
    getOwnedRunes(): { rune: Rune; count: number }[] {
        return this.playerData.ownedRunes
            .map(owned => ({
                rune: RUNES.find(r => r.id === owned.runeId)!,
                count: owned.count
            }))
            .filter(r => r.rune && r.count > 0);
    }

    // Item rün yuvalarını getir
    getItemSlots(itemId: string): RuneSlot[] {
        return this.playerData.itemRuneSlots[itemId] || [];
    }
}

// Singleton instance
export const runeSystemManager = new RuneSystemManager();
