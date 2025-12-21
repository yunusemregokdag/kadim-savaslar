
import { Item, CharacterClass } from '../types';

// Helper for visuals
const v = (model: string, color: string, glow?: string) => ({
    model,
    primaryColor: color,
    glowColor: glow,
    glowIntensity: glow ? 2 : 0
});

// TIER COLORS & GLOW
const TIER_COLORS: Record<number, { primary: string, glow?: string }> = {
    1: { primary: '#94a3b8' },           // Gray - Common
    2: { primary: '#22c55e' },           // Green - Uncommon
    3: { primary: '#3b82f6' },           // Blue - Rare
    4: { primary: '#a855f7', glow: '#c084fc' }, // Purple - Epic (with glow)
    5: { primary: '#f97316', glow: '#fbbf24' }  // Orange - Legendary (with glow)
};

const TIER_RARITY: Record<number, 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'ancient'> = {
    1: 'common',
    2: 'uncommon',
    3: 'rare',
    4: 'epic',
    5: 'legendary'
};

// CLASS WEAPON TYPES
const CLASS_WEAPON: Record<CharacterClass, { type: string, nameTR: string }> = {
    warrior: { type: 'sword', nameTR: 'Kılıç' },
    arctic_knight: { type: 'lance', nameTR: 'Mızrak' },
    gale_glaive: { type: 'spear', nameTR: 'Mızrak' },
    archer: { type: 'bow', nameTR: 'Yay' },
    archmage: { type: 'staff', nameTR: 'Asa' },
    bard: { type: 'harp', nameTR: 'Lir' },
    cleric: { type: 'mace', nameTR: 'Topuz' },
    martial_artist: { type: 'gauntlet', nameTR: 'Eldiven' },
    monk: { type: 'gauntlet', nameTR: 'Eldiven' },
    reaper: { type: 'scythe', nameTR: 'Tırpan' }
};

// CLASS NAMES (TR)
const CLASS_NAMES: Record<CharacterClass, string> = {
    warrior: 'Savaşçı',
    arctic_knight: 'Buz Şövalyesi',
    gale_glaive: 'Fırtına Süvarisi',
    archer: 'Okçu',
    archmage: 'Büyücü',
    bard: 'Ozan',
    cleric: 'Rahip',
    martial_artist: 'Dövüşçü',
    monk: 'Keşiş',
    reaper: 'Azrail'
};

// TIER NAMES
const TIER_NAMES: Record<number, { weapon: string[], armor: string[], helmet: string[], pants: string[], boots: string[], necklace: string[], earring: string[] }> = {
    1: {
        weapon: ['Acemi', 'Paslı', 'Eski', 'İlkel', 'Yıpranmış'],
        armor: ['Bez', 'Deri', 'Paslı', 'Eski', 'Yırtık'],
        helmet: ['Bez', 'Deri', 'Basit', 'Eski', 'Yıpranmış'],
        pants: ['Bez', 'Deri', 'Basit', 'Eski', 'Yırtık'],
        boots: ['Deri', 'Bez', 'Basit', 'Eski', 'Yıpranmış'],
        necklace: ['Bakır', 'Taş', 'Basit', 'Eski', 'Ahşap'],
        earring: ['Bakır', 'Taş', 'Basit', 'Eski', 'Ahşap']
    },
    2: {
        weapon: ['Demir', 'Güçlü', 'Sağlam', 'Gelişmiş', 'Pratik'],
        armor: ['Demir', 'Zincir', 'Sert', 'Güçlü', 'Dayanıklı'],
        helmet: ['Demir', 'Zincir', 'Sert', 'Güçlü', 'Koruyucu'],
        pants: ['Demir', 'Zincir', 'Sert', 'Güçlü', 'Dayanıklı'],
        boots: ['Demir', 'Zincir', 'Sert', 'Hızlı', 'Dayanıklı'],
        necklace: ['Gümüş', 'Safir', 'Parlak', 'Büyülü', 'Kadim'],
        earring: ['Gümüş', 'Safir', 'Parlak', 'Büyülü', 'Kadim']
    },
    3: {
        weapon: ['Şövalye', 'Elit', 'Kadim', 'Usta', 'Mükemmel'],
        armor: ['Şövalye', 'Plaka', 'Elit', 'Usta', 'Mükemmel'],
        helmet: ['Şövalye', 'Plaka', 'Elit', 'Usta', 'Mükemmel'],
        pants: ['Şövalye', 'Plaka', 'Elit', 'Usta', 'Mükemmel'],
        boots: ['Şövalye', 'Plaka', 'Elit', 'Hızlı', 'Sessiz'],
        necklace: ['Altın', 'Yakut', 'Rünlü', 'Büyülü', 'Parlak'],
        earring: ['Altın', 'Yakut', 'Rünlü', 'Büyülü', 'Parlak']
    },
    4: {
        weapon: ['Ejderha', 'Yıldırım', 'Ateş', 'Buz', 'Karanlık'],
        armor: ['Ejderha', 'Magma', 'Fırtına', 'Buz', 'Gölge'],
        helmet: ['Ejderha', 'Magma', 'Fırtına', 'Buz', 'Gölge'],
        pants: ['Ejderha', 'Magma', 'Fırtına', 'Buz', 'Gölge'],
        boots: ['Ejderha', 'Yıldırım', 'Rüzgar', 'Buz', 'Gölge'],
        necklace: ['Elmas', 'Zümrüt', 'Titan', 'Kristal', 'Karanlık'],
        earring: ['Elmas', 'Zümrüt', 'Titan', 'Kristal', 'Karanlık']
    },
    5: {
        weapon: ['Tanrısal', 'Efsane', 'Kadim', 'Yüce', 'Ölümsüz'],
        armor: ['Tanrısal', 'Olimpos', 'Kadim', 'Yüce', 'Ölümsüz'],
        helmet: ['Tanrısal', 'Olimpos', 'Kadim', 'Yüce', 'Ölümsüz'],
        pants: ['Tanrısal', 'Olimpos', 'Kadim', 'Yüce', 'Ölümsüz'],
        boots: ['Hermes', 'Titan', 'Kadim', 'Yüce', 'Ölümsüz'],
        necklace: ['Tanrısal', 'Efsane', 'Kadim', 'Kozmik', 'Ölümsüz'],
        earring: ['Tanrısal', 'Efsane', 'Kadim', 'Kozmik', 'Ölümsüz']
    }
};

// BASE STATS BY TIER
const BASE_STATS: Record<number, { damage: number, defense: number, hp: number, mana: number }> = {
    1: { damage: 5, defense: 3, hp: 20, mana: 10 },
    2: { damage: 15, defense: 8, hp: 50, mana: 25 },
    3: { damage: 35, defense: 18, hp: 100, mana: 50 },
    4: { damage: 60, defense: 35, hp: 200, mana: 100 },
    5: { damage: 100, defense: 60, hp: 400, mana: 200 }
};

// LEVEL REQUIREMENTS
const LEVEL_REQ: Record<number, number> = {
    1: 1,
    2: 5,
    3: 10,
    4: 18,
    5: 25
};

// Generate all items
export const ALL_CLASS_ITEMS: Item[] = [];

// Generate for each class
const CLASSES: CharacterClass[] = ['warrior', 'arctic_knight', 'gale_glaive', 'archer', 'archmage', 'bard', 'cleric', 'martial_artist', 'monk', 'reaper'];

CLASSES.forEach((charClass) => {
    const classAbbr = charClass.substring(0, 2).toUpperCase();
    const className = CLASS_NAMES[charClass];
    const weaponInfo = CLASS_WEAPON[charClass];

    // Generate T1-T5 items for each class
    for (let tier = 1; tier <= 5; tier++) {
        const tierColor = TIER_COLORS[tier];
        const rarity = TIER_RARITY[tier];
        const stats = BASE_STATS[tier];
        const names = TIER_NAMES[tier];
        const levelReq = LEVEL_REQ[tier];

        // WEAPON
        ALL_CLASS_ITEMS.push({
            id: `${classAbbr}_W_T${tier}`,
            name: `${names.weapon[tier % 5]} ${className} ${weaponInfo.nameTR}`,
            tier,
            type: 'weapon',
            rarity,
            classReq: charClass,
            levelReq,
            stats: { damage: stats.damage + tier * 5, critChance: tier },
            visuals: v(weaponInfo.type, tierColor.primary, tierColor.glow)
        });

        // ARMOR (Gövde Zırhı)
        ALL_CLASS_ITEMS.push({
            id: `${classAbbr}_A_T${tier}`,
            name: `${names.armor[tier % 5]} ${className} Zırhı`,
            tier,
            type: 'armor',
            rarity,
            classReq: charClass,
            levelReq,
            stats: { defense: stats.defense + tier * 3, hp: stats.hp },
            visuals: { primaryColor: tierColor.primary, glowColor: tierColor.glow } as any
        });

        // HELMET (Miğfer)
        ALL_CLASS_ITEMS.push({
            id: `${classAbbr}_H_T${tier}`,
            name: `${names.helmet[tier % 5]} ${className} Miğferi`,
            tier,
            type: 'helmet',
            rarity,
            classReq: charClass,
            levelReq,
            stats: { defense: Math.floor(stats.defense * 0.6), hp: Math.floor(stats.hp * 0.5) },
            visuals: { primaryColor: tierColor.primary, glowColor: tierColor.glow } as any
        });

        // PANTS (Pantolon)
        ALL_CLASS_ITEMS.push({
            id: `${classAbbr}_P_T${tier}`,
            name: `${names.pants[tier % 5]} ${className} Pantolonu`,
            tier,
            type: 'pants',
            rarity,
            classReq: charClass,
            levelReq,
            stats: { defense: Math.floor(stats.defense * 0.7), hp: Math.floor(stats.hp * 0.3) },
            visuals: { primaryColor: tierColor.primary, glowColor: tierColor.glow } as any
        });
    }
});

// UNIVERSAL BOOTS (Herkes giyebilir)
for (let tier = 1; tier <= 5; tier++) {
    const tierColor = TIER_COLORS[tier];
    const rarity = TIER_RARITY[tier];
    const stats = BASE_STATS[tier];
    const names = TIER_NAMES[tier];
    const levelReq = LEVEL_REQ[tier];

    ALL_CLASS_ITEMS.push({
        id: `BOOT_T${tier}_1`,
        name: `${names.boots[0]} Çizmeler`,
        tier,
        type: 'boots',
        rarity,
        levelReq,
        stats: { defense: Math.floor(stats.defense * 0.5), hp: Math.floor(stats.hp * 0.2) },
        visuals: { primaryColor: tierColor.primary, glowColor: tierColor.glow } as any
    });

    ALL_CLASS_ITEMS.push({
        id: `BOOT_T${tier}_2`,
        name: `${names.boots[1]} Ayakkabılar`,
        tier,
        type: 'boots',
        rarity,
        levelReq,
        stats: { defense: Math.floor(stats.defense * 0.4), mana: stats.mana },
        visuals: { primaryColor: tierColor.primary, glowColor: tierColor.glow } as any
    });
}

// NECKLACE (Kolye) - Universal
for (let tier = 1; tier <= 5; tier++) {
    const tierColor = TIER_COLORS[tier];
    const rarity = TIER_RARITY[tier];
    const stats = BASE_STATS[tier];
    const names = TIER_NAMES[tier];
    const levelReq = LEVEL_REQ[tier];

    // STR Necklace
    ALL_CLASS_ITEMS.push({
        id: `NECK_STR_T${tier}`,
        name: `${names.necklace[0]} Güç Kolyesi`,
        tier,
        type: 'necklace',
        rarity,
        levelReq,
        stats: { strength: tier * 3, damage: Math.floor(stats.damage * 0.3) },
        visuals: { primaryColor: '#ef4444', glowColor: tierColor.glow } as any
    });

    // DEX Necklace
    ALL_CLASS_ITEMS.push({
        id: `NECK_DEX_T${tier}`,
        name: `${names.necklace[1]} Çeviklik Kolyesi`,
        tier,
        type: 'necklace',
        rarity,
        levelReq,
        stats: { dexterity: tier * 3, critChance: tier },
        visuals: { primaryColor: '#22c55e', glowColor: tierColor.glow } as any
    });

    // INT Necklace
    ALL_CLASS_ITEMS.push({
        id: `NECK_INT_T${tier}`,
        name: `${names.necklace[2]} Zeka Kolyesi`,
        tier,
        type: 'necklace',
        rarity,
        levelReq,
        stats: { intelligence: tier * 3, mana: stats.mana },
        visuals: { primaryColor: '#3b82f6', glowColor: tierColor.glow } as any
    });

    // VIT Necklace
    ALL_CLASS_ITEMS.push({
        id: `NECK_VIT_T${tier}`,
        name: `${names.necklace[3]} Dayanıklılık Kolyesi`,
        tier,
        type: 'necklace',
        rarity,
        levelReq,
        stats: { vitality: tier * 3, hp: stats.hp },
        visuals: { primaryColor: '#f59e0b', glowColor: tierColor.glow } as any
    });
}

// EARRING (Küpe) - Universal
for (let tier = 1; tier <= 5; tier++) {
    const tierColor = TIER_COLORS[tier];
    const rarity = TIER_RARITY[tier];
    const stats = BASE_STATS[tier];
    const names = TIER_NAMES[tier];
    const levelReq = LEVEL_REQ[tier];

    // Attack Earring
    ALL_CLASS_ITEMS.push({
        id: `EAR_ATK_T${tier}`,
        name: `${names.earring[0]} Saldırı Küpesi`,
        tier,
        type: 'earring',
        rarity,
        levelReq,
        stats: { damage: Math.floor(stats.damage * 0.4), critDamage: tier * 2 },
        visuals: { primaryColor: '#dc2626', glowColor: tierColor.glow } as any
    });

    // Defense Earring
    ALL_CLASS_ITEMS.push({
        id: `EAR_DEF_T${tier}`,
        name: `${names.earring[1]} Savunma Küpesi`,
        tier,
        type: 'earring',
        rarity,
        levelReq,
        stats: { defense: Math.floor(stats.defense * 0.5), hp: Math.floor(stats.hp * 0.3) },
        visuals: { primaryColor: '#2563eb', glowColor: tierColor.glow } as any
    });

    // Magic Earring
    ALL_CLASS_ITEMS.push({
        id: `EAR_MAG_T${tier}`,
        name: `${names.earring[2]} Büyü Küpesi`,
        tier,
        type: 'earring',
        rarity,
        levelReq,
        stats: { intelligence: tier * 2, mana: Math.floor(stats.mana * 0.5) },
        visuals: { primaryColor: '#a855f7', glowColor: tierColor.glow } as any
    });

    // Balanced Earring
    ALL_CLASS_ITEMS.push({
        id: `EAR_BAL_T${tier}`,
        name: `${names.earring[3]} Denge Küpesi`,
        tier,
        type: 'earring',
        rarity,
        levelReq,
        stats: {
            strength: tier,
            dexterity: tier,
            intelligence: tier,
            vitality: tier
        },
        visuals: { primaryColor: '#fbbf24', glowColor: tierColor.glow } as any
    });
}

// Summary:
// 10 Classes x 5 Tiers x 4 Items (Weapon, Armor, Helmet, Pants) = 200 class-specific items
// 5 Tiers x 2 Boots = 10 universal boots
// 5 Tiers x 4 Necklaces = 20 necklaces
// 5 Tiers x 4 Earrings = 20 earrings
// TOTAL: 250 items

console.log(`[ItemGenerator] Generated ${ALL_CLASS_ITEMS.length} items!`);
