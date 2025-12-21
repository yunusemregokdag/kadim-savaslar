// ============================================
// KOZMETİK SİSTEMİ
// Silah kaplamaları, efektler, pelerinler (P2W DEĞİL)
// ============================================

import { CharacterClass } from '../types';

// Kozmetik Kategorileri
export type CosmeticType =
    | 'weapon_skin'      // Silah kaplaması
    | 'armor_skin'       // Zırh kaplaması
    | 'aura'             // Karakter aurası
    | 'trail'            // Hareket izi
    | 'footprint'        // Ayak izi
    | 'cape'             // Pelerin
    | 'title_effect'     // İsim efekti
    | 'name_color'       // İsim rengi
    | 'chat_bubble'      // Sohbet balonu
    | 'death_effect'     // Ölüm efekti
    | 'spawn_effect';    // Doğuş efekti

// Kozmetik Tanımı
export interface Cosmetic {
    id: string;
    name: string;
    description: string;
    type: CosmeticType;
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
    price: {
        gold?: number;
        gems?: number;
    };
    classReq?: CharacterClass[];
    levelReq?: number;
    seasonExclusive?: string; // Battle Pass season ID
    limited?: boolean; // Sınırlı süre satışta
    preview: {
        color?: string;
        gradient?: string[];
        particleType?: string;
        modelPath?: string;
        animationPath?: string;
    };
    icon: string;
}

// ============================================
// SİLAH KAPLAMALARI
// ============================================
export const WEAPON_SKINS: Cosmetic[] = [
    // Ateş Serisi
    {
        id: 'skin_weapon_inferno',
        name: 'Cehennem Alevi',
        description: 'Silahınız alevler içinde yanar',
        type: 'weapon_skin',
        rarity: 'epic',
        price: { gems: 500 },
        preview: {
            color: '#ff4400',
            particleType: 'fire',
            gradient: ['#ff0000', '#ff6600', '#ffff00']
        },
        icon: '🔥'
    },
    {
        id: 'skin_weapon_frost',
        name: 'Ebedi Buz',
        description: 'Silahınız dondurucu soğuk yayar',
        type: 'weapon_skin',
        rarity: 'epic',
        price: { gems: 500 },
        classReq: ['arctic_knight', 'archmage'],
        preview: {
            color: '#00ccff',
            particleType: 'ice',
            gradient: ['#0066ff', '#00ccff', '#ffffff']
        },
        icon: '❄️'
    },
    {
        id: 'skin_weapon_void',
        name: 'Boşluk Özü',
        description: 'Silahınız karanlık enerji yayar',
        type: 'weapon_skin',
        rarity: 'legendary',
        price: { gems: 1000 },
        classReq: ['reaper'],
        preview: {
            color: '#6600cc',
            particleType: 'void',
            gradient: ['#330066', '#6600cc', '#9900ff']
        },
        icon: '🌑'
    },
    {
        id: 'skin_weapon_lightning',
        name: 'Fırtına Çağırıcı',
        description: 'Silahınızda şimşekler çakar',
        type: 'weapon_skin',
        rarity: 'epic',
        price: { gems: 600 },
        classReq: ['gale_glaive', 'archmage'],
        preview: {
            color: '#ffff00',
            particleType: 'lightning',
            gradient: ['#cccc00', '#ffff00', '#ffffff']
        },
        icon: '⚡'
    },
    {
        id: 'skin_weapon_nature',
        name: 'Orman Ruhu',
        description: 'Silahınız yapraklar ve çiçekler saçar',
        type: 'weapon_skin',
        rarity: 'rare',
        price: { gems: 300 },
        preview: {
            color: '#00cc00',
            particleType: 'leaves',
            gradient: ['#006600', '#00cc00', '#88ff88']
        },
        icon: '🌿'
    },
    {
        id: 'skin_weapon_blood',
        name: 'Kan Emici',
        description: 'Silahınız kırmızı damlar',
        type: 'weapon_skin',
        rarity: 'legendary',
        price: { gems: 800 },
        classReq: ['reaper', 'warrior'],
        preview: {
            color: '#cc0000',
            particleType: 'blood',
            gradient: ['#660000', '#cc0000', '#ff0000']
        },
        icon: '🩸'
    },
    {
        id: 'skin_weapon_holy',
        name: 'Kutsal Işık',
        description: 'Silahınız ilahi ışık yayar',
        type: 'weapon_skin',
        rarity: 'legendary',
        price: { gems: 800 },
        classReq: ['cleric', 'monk'],
        preview: {
            color: '#ffffcc',
            particleType: 'holy',
            gradient: ['#ffff00', '#ffffcc', '#ffffff']
        },
        icon: '✨'
    },
    {
        id: 'skin_weapon_music',
        name: 'Melodi Ustası',
        description: 'Silahınızdan notalar yükselir',
        type: 'weapon_skin',
        rarity: 'rare',
        price: { gems: 350 },
        classReq: ['bard'],
        preview: {
            color: '#ff66cc',
            particleType: 'notes',
            gradient: ['#cc0066', '#ff66cc', '#ffccff']
        },
        icon: '🎵'
    }
];

// ============================================
// PELERİNLER
// ============================================
export const CAPES: Cosmetic[] = [
    {
        id: 'cape_royal',
        name: 'Kraliyet Pelerini',
        description: 'Asil bir görünüm',
        type: 'cape',
        rarity: 'epic',
        price: { gems: 400 },
        preview: {
            color: '#cc0000',
            gradient: ['#660000', '#cc0000'],
            modelPath: '/models/capes/royal.gltf'
        },
        icon: '👑'
    },
    {
        id: 'cape_shadow',
        name: 'Gölge Pelerini',
        description: 'Karanlıkla bir olun',
        type: 'cape',
        rarity: 'legendary',
        price: { gems: 750 },
        preview: {
            color: '#1a1a1a',
            gradient: ['#000000', '#333333'],
            particleType: 'shadow',
            modelPath: '/models/capes/shadow.gltf'
        },
        icon: '🌑'
    },
    {
        id: 'cape_phoenix',
        name: 'Anka Pelerini',
        description: 'Alevlerden doğan',
        type: 'cape',
        rarity: 'legendary',
        price: { gems: 1000 },
        preview: {
            color: '#ff6600',
            gradient: ['#ff0000', '#ff6600', '#ffcc00'],
            particleType: 'fire',
            modelPath: '/models/capes/phoenix.gltf'
        },
        icon: '🐦‍🔥'
    },
    {
        id: 'cape_ice',
        name: 'Buzul Pelerini',
        description: 'Soğuk kuzeyden esen',
        type: 'cape',
        rarity: 'epic',
        price: { gems: 500 },
        classReq: ['arctic_knight'],
        preview: {
            color: '#00ccff',
            gradient: ['#0066cc', '#00ccff'],
            particleType: 'ice',
            modelPath: '/models/capes/ice.gltf'
        },
        icon: '🧊'
    },
    {
        id: 'cape_starlight',
        name: 'Yıldız Işığı',
        description: 'Gece gökyüzünü taşıyın',
        type: 'cape',
        rarity: 'mythic',
        price: { gems: 1500 },
        preview: {
            color: '#000033',
            gradient: ['#000000', '#000033', '#000066'],
            particleType: 'stars',
            modelPath: '/models/capes/starlight.gltf'
        },
        icon: '⭐'
    }
];

// ============================================
// AURALAR
// ============================================
export const AURAS: Cosmetic[] = [
    {
        id: 'aura_fire',
        name: 'Ateş Aurası',
        description: 'Etrafınızda alevler dans eder',
        type: 'aura',
        rarity: 'epic',
        price: { gems: 600 },
        preview: {
            color: '#ff4400',
            particleType: 'fire_aura'
        },
        icon: '🔥'
    },
    {
        id: 'aura_frost',
        name: 'Buz Aurası',
        description: 'Etrafınızda kar taneleri uçuşur',
        type: 'aura',
        rarity: 'epic',
        price: { gems: 600 },
        preview: {
            color: '#00ccff',
            particleType: 'snow_aura'
        },
        icon: '❄️'
    },
    {
        id: 'aura_lightning',
        name: 'Şimşek Aurası',
        description: 'Etrafınızda elektrik kıvılcımları çakar',
        type: 'aura',
        rarity: 'legendary',
        price: { gems: 900 },
        preview: {
            color: '#ffff00',
            particleType: 'electric_aura'
        },
        icon: '⚡'
    },
    {
        id: 'aura_nature',
        name: 'Doğa Aurası',
        description: 'Etrafınızda yapraklar ve çiçekler süzülür',
        type: 'aura',
        rarity: 'rare',
        price: { gems: 400 },
        preview: {
            color: '#00cc00',
            particleType: 'nature_aura'
        },
        icon: '🌸'
    },
    {
        id: 'aura_void',
        name: 'Boşluk Aurası',
        description: 'Etrafınızda karanlık enerji döner',
        type: 'aura',
        rarity: 'legendary',
        price: { gems: 1000 },
        preview: {
            color: '#6600cc',
            particleType: 'void_aura'
        },
        icon: '🌀'
    },
    {
        id: 'aura_divine',
        name: 'İlahi Aura',
        description: 'Etrafınızda altın halkalar döner',
        type: 'aura',
        rarity: 'mythic',
        price: { gems: 1500 },
        classReq: ['cleric', 'monk'],
        preview: {
            color: '#ffcc00',
            particleType: 'divine_aura'
        },
        icon: '😇'
    }
];

// ============================================
// HAREKET İZLERİ (TRAILS)
// ============================================
export const TRAILS: Cosmetic[] = [
    {
        id: 'trail_fire',
        name: 'Ateş İzi',
        description: 'Yürürken arkada alev izi bırakın',
        type: 'trail',
        rarity: 'rare',
        price: { gems: 300 },
        preview: {
            color: '#ff4400',
            particleType: 'fire_trail'
        },
        icon: '🔥'
    },
    {
        id: 'trail_ice',
        name: 'Buz İzi',
        description: 'Yürürken yeri dondurun',
        type: 'trail',
        rarity: 'rare',
        price: { gems: 300 },
        preview: {
            color: '#00ccff',
            particleType: 'ice_trail'
        },
        icon: '❄️'
    },
    {
        id: 'trail_shadow',
        name: 'Gölge İzi',
        description: 'Arkada karanlık iz bırakın',
        type: 'trail',
        rarity: 'epic',
        price: { gems: 500 },
        preview: {
            color: '#1a1a1a',
            particleType: 'shadow_trail'
        },
        icon: '🌑'
    },
    {
        id: 'trail_rainbow',
        name: 'Gökkuşağı İzi',
        description: 'Rengarenk bir iz bırakın',
        type: 'trail',
        rarity: 'epic',
        price: { gems: 600 },
        preview: {
            gradient: ['#ff0000', '#ff7700', '#ffff00', '#00ff00', '#0000ff', '#8b00ff'],
            particleType: 'rainbow_trail'
        },
        icon: '🌈'
    },
    {
        id: 'trail_music',
        name: 'Nota İzi',
        description: 'Müzik notaları bırakın',
        type: 'trail',
        rarity: 'rare',
        price: { gems: 350 },
        classReq: ['bard'],
        preview: {
            color: '#ff66cc',
            particleType: 'music_trail'
        },
        icon: '🎵'
    }
];

// ============================================
// İSİM RENKLERİ
// ============================================
export const NAME_COLORS: Cosmetic[] = [
    {
        id: 'name_gold',
        name: 'Altın İsim',
        description: 'İsminiz altın renkte görünür',
        type: 'name_color',
        rarity: 'rare',
        price: { gems: 200 },
        preview: { color: '#ffd700' },
        icon: '🏆'
    },
    {
        id: 'name_rainbow',
        name: 'Gökkuşağı İsim',
        description: 'İsminiz renk değiştirir',
        type: 'name_color',
        rarity: 'legendary',
        price: { gems: 800 },
        preview: { gradient: ['#ff0000', '#ff7700', '#ffff00', '#00ff00', '#0000ff', '#8b00ff'] },
        icon: '🌈'
    },
    {
        id: 'name_fire',
        name: 'Ateşli İsim',
        description: 'İsminiz turuncu-kırmızı yanar',
        type: 'name_color',
        rarity: 'epic',
        price: { gems: 500 },
        preview: { gradient: ['#ff0000', '#ff6600'] },
        icon: '🔥'
    },
    {
        id: 'name_ice',
        name: 'Buzlu İsim',
        description: 'İsminiz buz mavisi görünür',
        type: 'name_color',
        rarity: 'epic',
        price: { gems: 500 },
        preview: { gradient: ['#00ccff', '#ffffff'] },
        icon: '❄️'
    },
    {
        id: 'name_purple',
        name: 'Mor İsim',
        description: 'İsminiz mor renkte görünür',
        type: 'name_color',
        rarity: 'rare',
        price: { gems: 250 },
        preview: { color: '#9900ff' },
        icon: '💜'
    },
    {
        id: 'name_toxic',
        name: 'Zehirli İsim',
        description: 'İsminiz yeşil parlar',
        type: 'name_color',
        rarity: 'epic',
        price: { gems: 450 },
        preview: { gradient: ['#00ff00', '#99ff00'] },
        icon: '☠️'
    }
];

// ============================================
// TÜM KOZMETİKLER
// ============================================
export const ALL_COSMETICS: Cosmetic[] = [
    ...WEAPON_SKINS,
    ...CAPES,
    ...AURAS,
    ...TRAILS,
    ...NAME_COLORS
];

// ============================================
// KOZMETİK YÖNETİCİSİ
// ============================================
export interface PlayerCosmetics {
    owned: string[];
    equipped: {
        weapon_skin?: string;
        armor_skin?: string;
        aura?: string;
        trail?: string;
        footprint?: string;
        cape?: string;
        title_effect?: string;
        name_color?: string;
        chat_bubble?: string;
        death_effect?: string;
        spawn_effect?: string;
    };
}

export class CosmeticManager {
    private playerData: PlayerCosmetics;

    constructor() {
        this.playerData = this.loadPlayerData();
    }

    private loadPlayerData(): PlayerCosmetics {
        const saved = localStorage.getItem('kadim_cosmetics');
        if (saved) {
            return JSON.parse(saved);
        }
        return {
            owned: [],
            equipped: {}
        };
    }

    private savePlayerData(): void {
        localStorage.setItem('kadim_cosmetics', JSON.stringify(this.playerData));
    }

    // Kozmetik satın al
    purchase(cosmeticId: string): boolean {
        if (this.playerData.owned.includes(cosmeticId)) {
            return false; // Zaten var
        }

        this.playerData.owned.push(cosmeticId);
        this.savePlayerData();
        return true;
    }

    // Kozmetik kuşan
    equip(cosmeticId: string): boolean {
        if (!this.playerData.owned.includes(cosmeticId)) {
            return false; // Sahip değil
        }

        const cosmetic = ALL_COSMETICS.find(c => c.id === cosmeticId);
        if (!cosmetic) return false;

        this.playerData.equipped[cosmetic.type] = cosmeticId;
        this.savePlayerData();
        return true;
    }

    // Kozmetik çıkar
    unequip(type: CosmeticType): void {
        delete this.playerData.equipped[type];
        this.savePlayerData();
    }

    // Sahip olunan kozmetikleri getir
    getOwned(): Cosmetic[] {
        return ALL_COSMETICS.filter(c => this.playerData.owned.includes(c.id));
    }

    // Kuşanılan kozmetikleri getir
    getEquipped(): Record<CosmeticType, Cosmetic | undefined> {
        const result: any = {};

        for (const [type, id] of Object.entries(this.playerData.equipped)) {
            result[type] = ALL_COSMETICS.find(c => c.id === id);
        }

        return result;
    }

    // Belirli bir tipin kuşanılmış kozmetiğini getir
    getEquippedByType(type: CosmeticType): Cosmetic | undefined {
        const id = this.playerData.equipped[type];
        if (!id) return undefined;
        return ALL_COSMETICS.find(c => c.id === id);
    }

    // Kozmetik sahibi mi?
    owns(cosmeticId: string): boolean {
        return this.playerData.owned.includes(cosmeticId);
    }

    // Kategoriye göre kozmetikleri getir
    getByType(type: CosmeticType): Cosmetic[] {
        return ALL_COSMETICS.filter(c => c.type === type);
    }

    // Sınıfa uygun kozmetikleri getir
    getAvailableForClass(playerClass: CharacterClass): Cosmetic[] {
        return ALL_COSMETICS.filter(c => {
            if (!c.classReq) return true;
            return c.classReq.includes(playerClass);
        });
    }
}

// Singleton instance
export const cosmeticManager = new CosmeticManager();
