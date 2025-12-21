// ============================================
// KOSTÜM SİSTEMİ (Costume System)
// Karakter üzerinde gözüken görsel sistemler
// ============================================

import { CharacterClass, ItemStats } from '../types';

// Kostüm Tipi
export type CostumeType = 'armor' | 'helmet' | 'weapon' | 'full_set' | 'accessory';

// Kostüm Kategorisi
export type CostumeCategory =
    | 'normal'      // Temel kostümler
    | 'premium'     // Premium kostümler
    | 'event'       // Event kostümleri
    | 'achievement' // Başarım kostümleri
    | 'limited';    // Sınırlı sayıda

// Kostüm Tanımı
export interface Costume {
    id: string;
    name: string;
    description: string;
    type: CostumeType;
    category: CostumeCategory;
    classReq?: CharacterClass[]; // Boş ise tüm sınıflar
    stats: Partial<ItemStats>;
    visualEffect?: {
        auraColor?: string;
        particleType?: string;
        trailEffect?: boolean;
        glowIntensity?: number;
    };
    modelPath: string;
    thumbnailPath: string;
    price: { gold?: number; gems?: number };
    duration?: number; // Gün cinsinden, undefined = kalıcı
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
    releaseDate?: string;
    expiryDate?: string; // Satın alınamaz hale gelir
}

// ============================================
// KOSTÜMLER
// ============================================
export const COSTUMES: Costume[] = [
    // ========== ZIRH KOSTÜMLERİ ==========
    {
        id: 'costume_iron_warrior',
        name: 'Demir Şövalye Zırhı',
        description: 'Klasik demir zırh görünümü. Savaşçılar için ideal.',
        type: 'armor',
        category: 'normal',
        classReq: ['warrior', 'arctic_knight'],
        stats: { defense: 10, hp: 50 },
        modelPath: '/models/costumes/armor/iron_warrior.gltf',
        thumbnailPath: '/images/costumes/iron_warrior.png',
        price: { gold: 50000 },
        rarity: 'common'
    },
    {
        id: 'costume_shadow_assassin',
        name: 'Gölge Suikastçı Takımı',
        description: 'Karanlıkta kaybolmak için mükemmel.',
        type: 'armor',
        category: 'normal',
        classReq: ['reaper', 'martial_artist'],
        stats: { dexterity: 15, critChance: 3 },
        visualEffect: { auraColor: '#1a1a2e', particleType: 'shadow' },
        modelPath: '/models/costumes/armor/shadow_assassin.gltf',
        thumbnailPath: '/images/costumes/shadow_assassin.png',
        price: { gold: 75000 },
        rarity: 'uncommon'
    },
    {
        id: 'costume_frost_king',
        name: 'Buzul Kralı Zırhı',
        description: 'Kadim buz krallarının zırhı. Soğuktan etkilenmezsiniz.',
        type: 'armor',
        category: 'premium',
        classReq: ['arctic_knight'],
        stats: { defense: 25, hp: 100, vitality: 10 },
        visualEffect: { auraColor: '#00bcd4', particleType: 'snowflake', glowIntensity: 0.8 },
        modelPath: '/models/costumes/armor/frost_king.gltf',
        thumbnailPath: '/images/costumes/frost_king.png',
        price: { gems: 500 },
        rarity: 'epic'
    },
    {
        id: 'costume_inferno_lord',
        name: 'Cehennem Lordu Zırhı',
        description: 'Ateşten doğmuş, ateşle yok eder.',
        type: 'armor',
        category: 'premium',
        classReq: ['warrior', 'martial_artist'],
        stats: { damage: 30, strength: 15, critDamage: 10 },
        visualEffect: { auraColor: '#ff4500', particleType: 'fire', trailEffect: true, glowIntensity: 1.2 },
        modelPath: '/models/costumes/armor/inferno_lord.gltf',
        thumbnailPath: '/images/costumes/inferno_lord.png',
        price: { gems: 800 },
        rarity: 'legendary'
    },
    {
        id: 'costume_celestial_mage',
        name: 'Göksel Büyücü Cübbesi',
        description: 'Yıldızların gücünü taşıyan cübbe.',
        type: 'armor',
        category: 'premium',
        classReq: ['archmage', 'cleric'],
        stats: { intelligence: 25, mana: 100, damage: 15 },
        visualEffect: { auraColor: '#fde047', particleType: 'stars', glowIntensity: 1.0 },
        modelPath: '/models/costumes/armor/celestial_mage.gltf',
        thumbnailPath: '/images/costumes/celestial_mage.png',
        price: { gems: 600 },
        rarity: 'epic'
    },

    // ========== FULL SET KOSTÜMLERİ ==========
    {
        id: 'costume_dragon_slayer_set',
        name: 'Ejderha Avcısı Seti',
        description: 'Ejderha kemiklerinden yapılmış efsanevi set.',
        type: 'full_set',
        category: 'limited',
        stats: { damage: 50, defense: 40, hp: 200, critChance: 5, critDamage: 20 },
        visualEffect: { auraColor: '#dc2626', particleType: 'dragon_scales', trailEffect: true, glowIntensity: 1.5 },
        modelPath: '/models/costumes/sets/dragon_slayer.gltf',
        thumbnailPath: '/images/costumes/dragon_slayer_set.png',
        price: { gems: 2000 },
        rarity: 'mythic',
        expiryDate: '2025-02-28'
    },
    {
        id: 'costume_void_emperor_set',
        name: 'Boşluk İmparatoru Seti',
        description: 'Karanlık boyutların efendisine ait set.',
        type: 'full_set',
        category: 'limited',
        classReq: ['reaper', 'archmage'],
        stats: { damage: 45, intelligence: 30, critChance: 8, mana: 150 },
        visualEffect: { auraColor: '#6b21a8', particleType: 'void', trailEffect: true, glowIntensity: 2.0 },
        modelPath: '/models/costumes/sets/void_emperor.gltf',
        thumbnailPath: '/images/costumes/void_emperor_set.png',
        price: { gems: 2500 },
        rarity: 'mythic',
        expiryDate: '2025-03-15'
    },

    // ========== EVENT KOSTÜMLERİ ==========
    {
        id: 'costume_winter_guardian',
        name: 'Kış Koruyucusu',
        description: 'Kış festivali özel kostümü.',
        type: 'full_set',
        category: 'event',
        stats: { defense: 20, hp: 100, vitality: 8 },
        visualEffect: { auraColor: '#a5f3fc', particleType: 'snowflake' },
        modelPath: '/models/costumes/event/winter_guardian.gltf',
        thumbnailPath: '/images/costumes/winter_guardian.png',
        price: { gems: 300 },
        duration: 30,
        rarity: 'rare'
    },
    {
        id: 'costume_spring_blossom',
        name: 'Bahar Çiçeği',
        description: 'Bahar festivali özel kostümü.',
        type: 'full_set',
        category: 'event',
        stats: { hp: 80, mana: 80, intelligence: 10 },
        visualEffect: { auraColor: '#f472b6', particleType: 'petals' },
        modelPath: '/models/costumes/event/spring_blossom.gltf',
        thumbnailPath: '/images/costumes/spring_blossom.png',
        price: { gems: 300 },
        duration: 30,
        rarity: 'rare'
    },

    // ========== BAŞARIM KOSTÜMLERİ ==========
    {
        id: 'costume_champion',
        name: 'Şampiyon Zırhı',
        description: 'Arena şampiyonlarına verilen özel zırh.',
        type: 'armor',
        category: 'achievement',
        stats: { damage: 20, defense: 20, hp: 100 },
        visualEffect: { auraColor: '#fbbf24', particleType: 'golden_sparks', glowIntensity: 1.0 },
        modelPath: '/models/costumes/achievement/champion.gltf',
        thumbnailPath: '/images/costumes/champion.png',
        price: {}, // Satın alınamaz, kazanılır
        rarity: 'legendary'
    },
    {
        id: 'costume_world_boss_slayer',
        name: 'Dünya Bossu Avcısı',
        description: 'Tüm dünya bosslarını yenen kahramana verilir.',
        type: 'full_set',
        category: 'achievement',
        stats: { damage: 35, defense: 30, hp: 150, critChance: 5 },
        visualEffect: { auraColor: '#ef4444', particleType: 'boss_essence', trailEffect: true, glowIntensity: 1.5 },
        modelPath: '/models/costumes/achievement/boss_slayer.gltf',
        thumbnailPath: '/images/costumes/boss_slayer.png',
        price: {}, // Kazanılır
        rarity: 'mythic'
    },

    // ========== SİLAH KOSTÜMLERİ ==========
    {
        id: 'costume_weapon_flame_sword',
        name: 'Alev Kılıcı Görünümü',
        description: 'Kılıcınızı alevlerle kaplar.',
        type: 'weapon',
        category: 'premium',
        classReq: ['warrior'],
        stats: { damage: 10 },
        visualEffect: { auraColor: '#ff4500', particleType: 'fire' },
        modelPath: '/models/costumes/weapons/flame_sword.gltf',
        thumbnailPath: '/images/costumes/flame_sword.png',
        price: { gems: 200 },
        rarity: 'rare'
    },
    {
        id: 'costume_weapon_frost_bow',
        name: 'Buzul Yayı Görünümü',
        description: 'Yayınızı buz kristalleriyle kaplar.',
        type: 'weapon',
        category: 'premium',
        classReq: ['archer'],
        stats: { damage: 8, dexterity: 5 },
        visualEffect: { auraColor: '#00bcd4', particleType: 'ice' },
        modelPath: '/models/costumes/weapons/frost_bow.gltf',
        thumbnailPath: '/images/costumes/frost_bow.png',
        price: { gems: 200 },
        rarity: 'rare'
    },

    // ========== AKSESUAR KOSTÜMLERİ ==========
    {
        id: 'costume_acc_crown',
        name: 'Altın Taç',
        description: 'Kraliyet tacı. Saygınlık sembolü.',
        type: 'accessory',
        category: 'premium',
        stats: { intelligence: 10, vitality: 5 },
        visualEffect: { auraColor: '#fbbf24', glowIntensity: 0.5 },
        modelPath: '/models/costumes/accessories/crown.gltf',
        thumbnailPath: '/images/costumes/crown.png',
        price: { gems: 150 },
        rarity: 'rare'
    },
    {
        id: 'costume_acc_demon_horns',
        name: 'İblis Boynuzları',
        description: 'Karanlık güçlerin sembolü.',
        type: 'accessory',
        category: 'premium',
        stats: { damage: 15, critDamage: 5 },
        visualEffect: { auraColor: '#dc2626', particleType: 'dark_flames' },
        modelPath: '/models/costumes/accessories/demon_horns.gltf',
        thumbnailPath: '/images/costumes/demon_horns.png',
        price: { gems: 250 },
        rarity: 'epic'
    }
];

// ============================================
// OYUNCU KOSTÜM DURUMU
// ============================================
export interface PlayerCostumeData {
    ownedCostumes: string[]; // Sahip olunan kostüm ID'leri
    equipped: {
        armor?: string;
        helmet?: string;
        weapon?: string;
        fullSet?: string; // Full set varsa diğerlerini override eder
        accessory?: string;
    };
    expiryDates: Record<string, number>; // Süreli kostümler için son kullanma tarihi
}

// ============================================
// KOSTÜM YÖNETİCİSİ
// ============================================
export class CostumeManager {
    private static STORAGE_KEY = 'player_costumes';

    static loadPlayerData(playerId: string): PlayerCostumeData {
        try {
            const data = localStorage.getItem(`${this.STORAGE_KEY}_${playerId}`);
            if (data) return JSON.parse(data);
        } catch (e) { }
        return { ownedCostumes: [], equipped: {}, expiryDates: {} };
    }

    static savePlayerData(playerId: string, data: PlayerCostumeData): void {
        try {
            localStorage.setItem(`${this.STORAGE_KEY}_${playerId}`, JSON.stringify(data));
        } catch (e) { }
    }

    static purchaseCostume(playerId: string, costumeId: string, playerGold: number, playerGems: number): { success: boolean; message: string; newGold: number; newGems: number } {
        const costume = COSTUMES.find(c => c.id === costumeId);
        if (!costume) return { success: false, message: 'Kostüm bulunamadı', newGold: playerGold, newGems: playerGems };

        const data = this.loadPlayerData(playerId);

        if (data.ownedCostumes.includes(costumeId)) {
            return { success: false, message: 'Bu kostüme zaten sahipsin', newGold: playerGold, newGems: playerGems };
        }

        // Fiyat kontrolü
        const goldCost = costume.price.gold || 0;
        const gemCost = costume.price.gems || 0;

        if (playerGold < goldCost || playerGems < gemCost) {
            return { success: false, message: 'Yeterli paran yok', newGold: playerGold, newGems: playerGems };
        }

        // Satın al
        data.ownedCostumes.push(costumeId);

        // Süreli ise bitiş tarihi ekle
        if (costume.duration) {
            const expiryDate = Date.now() + (costume.duration * 24 * 60 * 60 * 1000);
            data.expiryDates[costumeId] = expiryDate;
        }

        this.savePlayerData(playerId, data);

        return {
            success: true,
            message: `${costume.name} satın alındı!`,
            newGold: playerGold - goldCost,
            newGems: playerGems - gemCost
        };
    }

    static equipCostume(playerId: string, costumeId: string): { success: boolean; message: string } {
        const costume = COSTUMES.find(c => c.id === costumeId);
        if (!costume) return { success: false, message: 'Kostüm bulunamadı' };

        const data = this.loadPlayerData(playerId);

        if (!data.ownedCostumes.includes(costumeId)) {
            return { success: false, message: 'Bu kostüme sahip değilsin' };
        }

        // Süresi dolmuş mu kontrol et
        if (data.expiryDates[costumeId] && Date.now() > data.expiryDates[costumeId]) {
            return { success: false, message: 'Bu kostümün süresi dolmuş' };
        }

        // Kostümü kuşan
        switch (costume.type) {
            case 'armor':
                data.equipped.armor = costumeId;
                break;
            case 'helmet':
                data.equipped.helmet = costumeId;
                break;
            case 'weapon':
                data.equipped.weapon = costumeId;
                break;
            case 'full_set':
                data.equipped.fullSet = costumeId;
                break;
            case 'accessory':
                data.equipped.accessory = costumeId;
                break;
        }

        this.savePlayerData(playerId, data);
        return { success: true, message: `${costume.name} kuşanıldı!` };
    }

    static unequipCostume(playerId: string, type: CostumeType): void {
        const data = this.loadPlayerData(playerId);

        switch (type) {
            case 'armor': data.equipped.armor = undefined; break;
            case 'helmet': data.equipped.helmet = undefined; break;
            case 'weapon': data.equipped.weapon = undefined; break;
            case 'full_set': data.equipped.fullSet = undefined; break;
            case 'accessory': data.equipped.accessory = undefined; break;
        }

        this.savePlayerData(playerId, data);
    }

    static getEquippedCostumes(playerId: string): Costume[] {
        const data = this.loadPlayerData(playerId);
        const costumes: Costume[] = [];

        // Full set varsa sadece onu döndür
        if (data.equipped.fullSet) {
            const fullSet = COSTUMES.find(c => c.id === data.equipped.fullSet);
            if (fullSet) return [fullSet];
        }

        // Diğer kostümleri ekle
        if (data.equipped.armor) {
            const costume = COSTUMES.find(c => c.id === data.equipped.armor);
            if (costume) costumes.push(costume);
        }
        if (data.equipped.helmet) {
            const costume = COSTUMES.find(c => c.id === data.equipped.helmet);
            if (costume) costumes.push(costume);
        }
        if (data.equipped.weapon) {
            const costume = COSTUMES.find(c => c.id === data.equipped.weapon);
            if (costume) costumes.push(costume);
        }
        if (data.equipped.accessory) {
            const costume = COSTUMES.find(c => c.id === data.equipped.accessory);
            if (costume) costumes.push(costume);
        }

        return costumes;
    }

    static getTotalCostumeStats(playerId: string): Partial<ItemStats> {
        const costumes = this.getEquippedCostumes(playerId);
        const totalStats: Partial<ItemStats> = {};

        for (const costume of costumes) {
            for (const [key, value] of Object.entries(costume.stats)) {
                const statKey = key as keyof ItemStats;
                totalStats[statKey] = (totalStats[statKey] || 0) + (value as number);
            }
        }

        return totalStats;
    }

    static getCostumeVisualEffect(playerId: string): {
        auraColor?: string;
        particleType?: string;
        trailEffect?: boolean;
        glowIntensity?: number;
    } | null {
        const costumes = this.getEquippedCostumes(playerId);

        // En güçlü efekti döndür (full set veya en yüksek rarity)
        const withEffects = costumes.filter(c => c.visualEffect);
        if (withEffects.length === 0) return null;

        // Rarity sıralaması
        const rarityOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];
        withEffects.sort((a, b) => rarityOrder.indexOf(b.rarity) - rarityOrder.indexOf(a.rarity));

        return withEffects[0].visualEffect || null;
    }
}

export const costumeManager = CostumeManager;
