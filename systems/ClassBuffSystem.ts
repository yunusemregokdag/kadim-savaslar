// ============================================
// SINIF GRUPLARI VE ITEM BUFF MANTIĞI
// Sınıfa özel stat bonusları ve sinerjiler
// ============================================

import { CharacterClass, ItemStats } from '../types';

// Sınıf Grubu Tanımı
export type ClassGroup = 'tank_dps' | 'mobile_agile' | 'ranged_damage' | 'support_healer' | 'special_assassin';

// Grup Bilgisi
export interface ClassGroupInfo {
    id: ClassGroup;
    name: string;
    description: string;
    classes: CharacterClass[];
    primaryStats: (keyof ItemStats)[];
    icon: string;
    color: string;
}

// ============================================
// SINIF GRUPLARI
// ============================================
export const CLASS_GROUPS: ClassGroupInfo[] = [
    {
        id: 'tank_dps',
        name: 'Öncü (Tank/DPS)',
        description: 'Ön safta savaşan, dayanıklı ve güçlü savaşçılar',
        classes: ['warrior', 'arctic_knight'],
        primaryStats: ['defense', 'hp', 'vitality', 'strength'],
        icon: '🛡️',
        color: '#cc0000'
    },
    {
        id: 'mobile_agile',
        name: 'Mobil/Çevik',
        description: 'Hızlı hareket eden, yüksek saldırı hızlı savaşçılar',
        classes: ['gale_glaive', 'martial_artist'],
        primaryStats: ['attackSpeed', 'dexterity', 'critChance', 'damage'],
        icon: '⚡',
        color: '#00ccff'
    },
    {
        id: 'ranged_damage',
        name: 'Menzilli Hasar',
        description: 'Uzak mesafeden yüksek hasar veren sınıflar',
        classes: ['archer', 'archmage'],
        primaryStats: ['critChance', 'critDamage', 'intelligence', 'damage'],
        icon: '🎯',
        color: '#ff6600'
    },
    {
        id: 'support_healer',
        name: 'Destek/Şifacı',
        description: 'Takım arkadaşlarına destek ve şifa veren sınıflar',
        classes: ['bard', 'cleric', 'monk'],
        primaryStats: ['intelligence', 'mana', 'vitality', 'hp'],
        icon: '💚',
        color: '#00cc00'
    },
    {
        id: 'special_assassin',
        name: 'Özel/Yıkıcı',
        description: 'Yüksek tek hedef hasarı veren suikastçılar',
        classes: ['reaper'],
        primaryStats: ['critChance', 'critDamage', 'damage', 'dexterity'],
        icon: '💀',
        color: '#6600cc'
    }
];

// ============================================
// SINIF ÖZEL BUFFLARI
// ============================================
export interface CharacterClassBuff {
    id: string;
    name: string;
    description: string;
    classes: CharacterClass[];
    statModifiers: Partial<ItemStats>;
    conditions?: {
        minLevel?: number;
        requiresSet?: string;
        requiresWeather?: string;
        requiresParty?: boolean;
    };
    icon: string;
}

export const CLASS_BUFFS: CharacterClassBuff[] = [
    // Tank/DPS Buffları
    {
        id: 'iron_will',
        name: 'Demir İrade',
        description: 'HP %20 altındayken savunma %30 artar',
        classes: ['warrior', 'arctic_knight'],
        statModifiers: { defense: 30 },
        icon: '🛡️'
    },
    {
        id: 'frost_resistance',
        name: 'Donma Direnci',
        description: 'Buz hasarına %25 direnç, karlı havada +%15 savunma',
        classes: ['arctic_knight'],
        statModifiers: { defense: 15 },
        conditions: { requiresWeather: 'snowy' },
        icon: '❄️'
    },
    {
        id: 'berserker_rage',
        name: 'Berserker Öfkesi',
        description: 'HP %50 altındayken hasar %20 artar',
        classes: ['warrior'],
        statModifiers: { damage: 20 },
        icon: '😤'
    },

    // Mobil/Çevik Buffları
    {
        id: 'wind_dancer',
        name: 'Rüzgar Dansçısı',
        description: 'Fırtınalı havada saldırı hızı %25 artar',
        classes: ['gale_glaive'],
        statModifiers: { attackSpeed: 25 },
        conditions: { requiresWeather: 'stormy' },
        icon: '💨'
    },
    {
        id: 'combo_master',
        name: 'Kombo Ustası',
        description: 'Ardışık vuruşlarda hasar %5 artar (max %25)',
        classes: ['martial_artist'],
        statModifiers: { damage: 5 },
        icon: '👊'
    },
    {
        id: 'evasion_expert',
        name: 'Kaçınma Uzmanı',
        description: '%15 şans ile hasardan tamamen kaçınma',
        classes: ['gale_glaive', 'martial_artist'],
        statModifiers: { dexterity: 10 },
        icon: '🌀'
    },

    // Menzilli Hasar Buffları
    {
        id: 'eagle_eye',
        name: 'Kartal Gözü',
        description: 'Kritik şans %10 artar, menzil %20 artar',
        classes: ['archer'],
        statModifiers: { critChance: 10 },
        icon: '🦅'
    },
    {
        id: 'arcane_power',
        name: 'Arkan Güç',
        description: 'Büyü hasarı %15 artar, mana maliyeti %10 azalır',
        classes: ['archmage'],
        statModifiers: { intelligence: 15 },
        icon: '🔮'
    },
    {
        id: 'headshot',
        name: 'Kafa Vuruşu',
        description: 'Kritik vuruşlarda %50 ekstra hasar',
        classes: ['archer'],
        statModifiers: { critDamage: 50 },
        icon: '🎯'
    },

    // Destek/Şifacı Buffları
    {
        id: 'healing_amplifier',
        name: 'Şifa Güçlendirici',
        description: 'Şifa etkinliği %25 artar',
        classes: ['cleric', 'monk'],
        statModifiers: { intelligence: 20 },
        icon: '💚'
    },
    {
        id: 'mana_flow',
        name: 'Mana Akışı',
        description: 'Mana yenilenmesi %30 artar',
        classes: ['bard', 'cleric', 'monk'],
        statModifiers: { mana: 50 },
        icon: '💧'
    },
    {
        id: 'protective_blessing',
        name: 'Koruyucu Bereket',
        description: 'Parti üyelerinin savunması %10 artar',
        classes: ['cleric', 'monk'],
        statModifiers: { defense: 10 },
        conditions: { requiresParty: true },
        icon: '🙏'
    },

    // Ozan Özel Buffları
    {
        id: 'inspiring_melody',
        name: 'İlham Veren Melodi',
        description: 'Parti üyelerinin saldırı hızı %10 artar',
        classes: ['bard'],
        statModifiers: { attackSpeed: 10 },
        conditions: { requiresParty: true },
        icon: '🎵'
    },
    {
        id: 'rhythm_of_war',
        name: 'Savaş Ritmi',
        description: 'Parti üyelerinin kritik şansı %5 artar',
        classes: ['bard'],
        statModifiers: { critChance: 5 },
        conditions: { requiresParty: true },
        icon: '🥁'
    },
    {
        id: 'song_of_restoration',
        name: 'Restorasyon Şarkısı',
        description: 'Yakındaki dostlar saniyede HP yeniler',
        classes: ['bard'],
        statModifiers: { hp: 10 },
        icon: '🎶'
    },

    // Özel/Yıkıcı Buffları
    {
        id: 'shadow_strike',
        name: 'Gölge Vuruşu',
        description: 'Arkadan saldırıda %100 ekstra hasar',
        classes: ['reaper'],
        statModifiers: { damage: 100 },
        icon: '🗡️'
    },
    {
        id: 'life_steal',
        name: 'Hayat Çalma',
        description: 'Verilen hasarın %15\'i kadar HP kazanılır',
        classes: ['reaper'],
        statModifiers: { hp: 0 }, // Special mechanic
        icon: '🩸'
    },
    {
        id: 'execute',
        name: 'İnfaz',
        description: 'HP %20 altındaki düşmanlara %50 ekstra hasar',
        classes: ['reaper'],
        statModifiers: { damage: 50 },
        icon: '💀'
    },
    {
        id: 'fog_hunter',
        name: 'Sis Avcısı',
        description: 'Sisli havada kritik şans %25 artar',
        classes: ['reaper'],
        statModifiers: { critChance: 25 },
        conditions: { requiresWeather: 'foggy' },
        icon: '🌫️'
    }
];

// ============================================
// SİNERJİ BONUSLARI
// ============================================
export interface ClassSynergy {
    id: string;
    name: string;
    description: string;
    requiredClasses: CharacterClass[];
    bonusStats: Partial<ItemStats>;
    icon: string;
}

export const CLASS_SYNERGIES: ClassSynergy[] = [
    {
        id: 'frost_warrior',
        name: 'Buzul Savaşçıları',
        description: 'Savaşçı + Buz Şövalyesi: Tüm partiye %5 savunma',
        requiredClasses: ['warrior', 'arctic_knight'],
        bonusStats: { defense: 5 },
        icon: '🧊⚔️'
    },
    {
        id: 'swift_assault',
        name: 'Hızlı Saldırı',
        description: 'Fırtına Süvarisi + Dövüş Ustası: Tüm partiye %10 saldırı hızı',
        requiredClasses: ['gale_glaive', 'martial_artist'],
        bonusStats: { attackSpeed: 10 },
        icon: '⚡👊'
    },
    {
        id: 'ranged_dominance',
        name: 'Menzilli Hakimiyet',
        description: 'Okçu + Büyücü: Tüm partiye %8 kritik şans',
        requiredClasses: ['archer', 'archmage'],
        bonusStats: { critChance: 8 },
        icon: '🏹🔮'
    },
    {
        id: 'holy_choir',
        name: 'Kutsal Koro',
        description: 'Ozan + Rahip + Ruhban: Tüm partiye %15 şifa bonusu',
        requiredClasses: ['bard', 'cleric', 'monk'],
        bonusStats: { hp: 100, mana: 50 },
        icon: '🎵💚🙏'
    },
    {
        id: 'assassin_support',
        name: 'Suikastçı Desteği',
        description: 'Ölüm Meleği + Ozan: Reaper\'a %20 kritik hasar',
        requiredClasses: ['reaper', 'bard'],
        bonusStats: { critDamage: 20 },
        icon: '💀🎵'
    }
];

// ============================================
// SİSTEM YÖNETİCİSİ
// ============================================
export class ClassBuffManager {

    // Sınıfın grubunu bul
    static getClassGroup(characterClass: CharacterClass): ClassGroupInfo | undefined {
        return CLASS_GROUPS.find(group => group.classes.includes(characterClass));
    }

    // Sınıfa özel buffları getir
    static getClassBuffs(characterClass: CharacterClass): CharacterClassBuff[] {
        return CLASS_BUFFS.filter(buff => buff.classes.includes(characterClass));
    }

    // Aktif buffları hesapla (koşullar dahil)
    static getActiveBuffs(
        characterClass: CharacterClass,
        context: {
            level: number;
            currentWeather?: string;
            isInParty: boolean;
            hpPercent: number;
            equippedSetId?: string;
        }
    ): CharacterClassBuff[] {
        const classBuffs = this.getClassBuffs(characterClass);

        return classBuffs.filter(buff => {
            if (!buff.conditions) return true;

            const { minLevel, requiresSet, requiresWeather, requiresParty } = buff.conditions;

            if (minLevel && context.level < minLevel) return false;
            if (requiresSet && context.equippedSetId !== requiresSet) return false;
            if (requiresWeather && context.currentWeather !== requiresWeather) return false;
            if (requiresParty && !context.isInParty) return false;

            return true;
        });
    }

    // Toplam stat bonuslarını hesapla
    static calculateTotalBuffStats(activeBuffs: CharacterClassBuff[]): Partial<ItemStats> {
        const totalStats: Partial<ItemStats> = {};

        activeBuffs.forEach(buff => {
            Object.entries(buff.statModifiers).forEach(([stat, value]) => {
                const key = stat as keyof ItemStats;
                totalStats[key] = (totalStats[key] || 0) + (value || 0);
            });
        });

        return totalStats;
    }

    // Parti sinerjilerini kontrol et
    static checkPartySynergies(partyClasses: CharacterClass[]): ClassSynergy[] {
        return CLASS_SYNERGIES.filter(synergy => {
            return synergy.requiredClasses.every(reqClass => partyClasses.includes(reqClass));
        });
    }

    // Parti için toplam sinerji bonuslarını hesapla
    static calculateSynergyBonuses(partyClasses: CharacterClass[]): Partial<ItemStats> {
        const activeSynergies = this.checkPartySynergies(partyClasses);
        const totalStats: Partial<ItemStats> = {};

        activeSynergies.forEach(synergy => {
            Object.entries(synergy.bonusStats).forEach(([stat, value]) => {
                const key = stat as keyof ItemStats;
                totalStats[key] = (totalStats[key] || 0) + (value || 0);
            });
        });

        return totalStats;
    }

    // Sınıf için önerilen statları getir
    static getRecommendedStats(characterClass: CharacterClass): (keyof ItemStats)[] {
        const group = this.getClassGroup(characterClass);
        return group?.primaryStats || ['damage', 'hp', 'defense'];
    }
}

// Export singleton-like access
export const classBuffManager = ClassBuffManager;
