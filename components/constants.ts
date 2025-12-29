













import { ClassData, CharacterClass, Item, GameEntity, Faction, Portal, Quest, Rank, WingItem, PetItem, HUDLayout } from './types';
import { ALL_CLASS_ITEMS } from './ItemGenerator';
export { ALL_CLASS_ITEMS };

// --- FACTION DATA ---
export const FACTIONS: Record<Faction, { name: string, color: string, description: string }> = {
    marsu: { name: 'ATEŞ LEJYONU', color: '#ef4444', description: 'Volkanik topraklarda doğan savaşçılar. Güç ve onur.' },
    terya: { name: 'SU MUHAFIZLARI', color: '#3b82f6', description: 'Okyanus derinliklerinin bilgeleri. Denge ve huzur.' },
    venu: { name: 'DOĞA BEKÇİLERİ', color: '#22c55e', description: 'Kadim ormanların koruyucuları. Hız ve çeviklik.' }
};

// --- BASE STATS FOR BALANCING (UPDATED FOR RPG ROLES) ---
export const CLASS_BASE_STATS: Record<CharacterClass, { str: number, dex: number, int: number, vit: number }> = {
    warrior: { str: 12, dex: 4, int: 2, vit: 15 },     // Tank: High HP (VIT), Good Dmg (STR)
    mage: { str: 2, dex: 4, int: 15, vit: 6 },         // DPS: High Magic (INT), Low HP
    ranger: { str: 4, dex: 15, int: 3, vit: 8 },       // DPS: High Speed/Range (DEX), Med HP
    assassin: { str: 12, dex: 14, int: 2, vit: 4 },    // Burst: Very High Dmg (STR/DEX), Very Low HP (Glass Cannon)
    shaman: { str: 4, dex: 4, int: 10, vit: 10 },      // Support: Balanced Magic/HP for survival & healing
};

// --- NEW: WINGS DATA (REBALANCED T4/T5) ---
export const WINGS_DATA: WingItem[] = [
    // TIER 1
    { id: 'wing_angel', name: 'Başmelek Kanatları', type: 'angel', tier: 1, bonusDamage: 10, bonusHp: 100, color: '#fef3c7' },
    { id: 'wing_fairy', name: 'Peri Kanatları', type: 'fairy', tier: 1, bonusDamage: 5, bonusHp: 200, color: '#a78bfa' },

    // TIER 2
    { id: 'wing_demon', name: 'İblis Kanatları', type: 'demon', tier: 2, bonusDamage: 25, bonusHp: 300, color: '#991b1b' },

    // TIER 3
    { id: 'wing_dragon', name: 'Ejderha Kanatları', type: 'dragon', tier: 3, bonusDamage: 60, bonusHp: 600, color: '#ea580c' },

    // TIER 4 (NERFED VOID)
    {
        id: 'wing_void',
        name: 'Hiçlik Kanatları',
        type: 'void',
        tier: 4,
        bonusDamage: 120,
        bonusHp: 1200,
        bonusDefense: 50,
        color: '#8b5cf6'
    },

    // TIER 5: PREMIUM (SERAPH - BUFFED & BONUSES)
    {
        id: 'wing_seraph',
        name: 'Seraph Kanatları',
        type: 'seraph',
        tier: 5,
        bonusDamage: 250,
        bonusHp: 2500,
        bonusDefense: 150,
        bonusGoldRate: 25, // ADDED BACK
        bonusHonorRate: 25, // ADDED BACK
        color: '#FFD700'
    },
];

// --- NEW: PETS DATA (REBALANCED T4/T5) ---
export const PETS_DATA: PetItem[] = [
    // TIER 1
    { id: 'pet_plains', name: 'Plains', type: 'dragon_baby', tier: 1, bonusExpRate: 5, bonusDefense: 10, color: '#a3e635', modelPath: '/Pets/cubee-plains.gltf' },
    { id: 'pet_grass', name: 'Grass', type: 'dragon_baby', tier: 1, bonusExpRate: 5, bonusDefense: 12, color: '#4ade80', modelPath: '/Pets/cubee-grass.gltf' },
    { id: 'pet_desert', name: 'Desert', type: 'dragon_baby', tier: 1, bonusExpRate: 5, bonusDefense: 8, color: '#fde047', modelPath: '/Pets/cubee-desert.gltf' },
    { id: 'pet_savanna', name: 'Savanna', type: 'dragon_baby', tier: 1, bonusExpRate: 5, bonusDefense: 8, color: '#d97706', modelPath: '/Pets/cubee-savanna.obj' },

    // TIER 2
    { id: 'pet_snow', name: 'Snow', type: 'floating_crystal', tier: 2, bonusExpRate: 10, bonusDefense: 20, bonusMana: 50, color: '#e0f2fe', modelPath: '/Pets/cubee-snow.gltf' },
    { id: 'pet_water', name: 'Water', type: 'floating_crystal', tier: 2, bonusExpRate: 10, bonusDefense: 22, bonusMana: 60, color: '#3b82f6', modelPath: '/Pets/cubee-water.gltf' },
    { id: 'pet_swamps', name: 'Swamps', type: 'floating_crystal', tier: 2, bonusExpRate: 12, bonusDefense: 18, bonusMana: 40, color: '#10b981', modelPath: '/Pets/cubee-swamps.gltf' },

    // TIER 3
    { id: 'pet_stone', name: 'Stone', type: 'spirit_wolf', tier: 3, bonusExpRate: 15, bonusDefense: 50, bonusHp: 300, color: '#78716c', modelPath: '/Pets/cubee-stone.gltf' },
    { id: 'pet_mushroom', name: 'Mushroom', type: 'spirit_wolf', tier: 3, bonusExpRate: 18, bonusDefense: 40, bonusHp: 200, color: '#ef4444', modelPath: '/Pets/cubee-mushroom.gltf' },
    { id: 'pet_lush', name: 'Lush', type: 'spirit_wolf', tier: 3, bonusExpRate: 20, bonusDefense: 45, bonusHp: 250, color: '#d9f99d', modelPath: '/Pets/cubee-lush.gltf' },

    // TIER 4
    { id: 'pet_jungle', name: 'Jungle', type: 'phoenix', tier: 4, bonusExpRate: 25, bonusDamage: 50, bonusDefense: 80, color: '#15803d', modelPath: '/Pets/cubee-jungle.gltf' },
    { id: 'pet_fire', name: 'Fire', type: 'phoenix', tier: 4, bonusExpRate: 30, bonusDamage: 80, bonusDefense: 50, color: '#f97316', modelPath: '/Pets/cubee-fire.gltf' },
    { id: 'pet_tnt', name: 'TNT', type: 'phoenix', tier: 4, bonusExpRate: 35, bonusDamage: 100, bonusDefense: 20, color: '#b91c1c', modelPath: '/Pets/cubee-tnt.gltf' },

    // TIER 5
    { id: 'pet_skeleton', name: 'Skeleton', type: 'owl', tier: 5, bonusExpRate: 40, bonusDamage: 120, bonusHp: 1000, bonusDefense: 100, color: '#e5e5e5', modelPath: '/Pets/cubee-skeleton.gltf' },
    { id: 'pet_evil', name: 'Evil', type: 'owl', tier: 5, bonusExpRate: 50, bonusDamage: 200, bonusHp: 500, bonusDefense: 80, color: '#4c1d95', modelPath: '/Pets/cubee-evil.gltf' },
    { id: 'pet_good', name: 'Good', type: 'owl', tier: 5, bonusExpRate: 50, bonusDamage: 100, bonusHp: 2000, bonusDefense: 150, color: '#fcd34d', modelPath: '/Pets/cubee-good.gltf' },
];

// --- CLASSES WITH 7 SKILLS (UPDATED CDS) ---
export const CLASSES: Record<CharacterClass, ClassData> = {
    warrior: {
        id: 'warrior',
        name: 'Savaşçı (Knight)',
        role: 'Tank / Melee',
        description: 'Yüksek savunma ve yakın dövüş uzmanı.',
        mechanic: 'Özellik: Hasar yedikçe "Öfke" biriktirir.',
        skills: [
            { id: 'w1', name: 'Kılıç Darbesi', description: 'Temel hasar verir.', cd: 1.0, manaCost: 5, type: 'damage', icon: 'Sword', visual: 'slash' },
            { id: 'w2', name: 'Kalkan Duvarı', description: '3sn hasar almazsın.', cd: 15, manaCost: 40, type: 'buff', icon: 'Shield', visual: 'shield' },
            { id: 'w3', name: 'Öfke Patlaması', description: 'Saldırı gücünü %20 artırır.', cd: 20, manaCost: 30, type: 'buff', icon: 'Zap', visual: 'rage' },
            { id: 'w4', name: 'Yere Vurma', description: 'Çevredeki düşmanları sersemletir.', cd: 10, manaCost: 25, type: 'damage', icon: 'MoveDown', visual: 'slam' },
            { id: 'w5', name: 'Mızrak Atışı', description: 'Uzaktaki düşmana mızrak fırlatır.', cd: 8, manaCost: 20, type: 'damage', icon: 'ArrowUp', visual: 'spear' },
            { id: 'w6', name: 'Savaş Çığlığı', description: 'Düşmanların defansını düşürür.', cd: 25, manaCost: 35, type: 'utility', icon: 'Mic', visual: 'shout' },
            { id: 'w7', name: 'Kıyım (Ulti)', description: '360 derece dönerek ölümcül hasar verir.', cd: 40, manaCost: 60, type: 'ultimate', icon: 'RotateCw', visual: 'whirlwind' },
        ]
    },
    mage: {
        id: 'mage',
        name: 'Büyücü (Mage)',
        role: 'DPS / Ranged',
        description: 'Yüksek alan hasarı ama kırılgan yapı.',
        mechanic: 'Özellik: Yüksek büyü gücü, düşük defans.',
        skills: [
            { id: 'm1', name: 'Ateş Topu', description: 'Tekli hedefe hasar.', cd: 1.0, manaCost: 10, type: 'damage', icon: 'Flame', visual: 'fireball' },
            { id: 'm2', name: 'Buz Kalkanı', description: 'Hasarı emer ve dondurur.', cd: 18, manaCost: 40, type: 'buff', icon: 'Snowflake', visual: 'iceblock' },
            { id: 'm3', name: 'Işınlanma', description: 'İleriye sıçrar.', cd: 8, manaCost: 20, type: 'utility', icon: 'Wind', visual: 'teleport' },
            { id: 'm4', name: 'Yıldırım Zinciri', description: '3 düşmana seken hasar.', cd: 12, manaCost: 35, type: 'damage', icon: 'Zap', visual: 'lightning' },
            { id: 'm5', name: 'Meteor', description: 'Alana devasa hasar verir.', cd: 20, manaCost: 60, type: 'damage', icon: 'Orbit', visual: 'meteor' },
            { id: 'm6', name: 'Mana Emilimi', description: 'Düşmandan mana çalar.', cd: 30, manaCost: 0, type: 'utility', icon: 'Droplet', visual: 'drain' },
            { id: 'm7', name: 'Kozmik Yıkım', description: 'Tüm haritayı titretir.', cd: 60, manaCost: 100, type: 'ultimate', icon: 'Sun', visual: 'blackhole' },
        ]
    },
    shaman: {
        id: 'shaman',
        name: 'Şaman (Healer)',
        role: 'Support / Buff',
        description: 'Takım iyileştirme ve totem ustası.',
        mechanic: 'Özellik: Totem dikerek alan buffları sağlar.',
        skills: [
            { id: 's1', name: 'Ruh Oku', description: 'Büyü hasarı verir.', cd: 1.0, manaCost: 5, type: 'damage', icon: 'Sparkles', visual: 'spirit' },
            { id: 's2', name: 'Şifa Işığı', description: 'Kendini ve dostları iyileştirir (AoE).', cd: 10, manaCost: 30, type: 'heal', icon: 'Heart', visual: 'heal' },
            { id: 's3', name: 'Hız Totemi', description: 'Takımın hızını artırır.', cd: 20, manaCost: 40, type: 'buff', icon: 'Feather', visual: 'totem_speed' },
            { id: 's4', name: 'Zehirli Sarmaşık', description: 'Düşmanları yavaşlatır ve zehirler.', cd: 15, manaCost: 25, type: 'utility', icon: 'Trees', visual: 'roots' },
            { id: 's5', name: 'Toprak Kalkanı', description: 'Takımın defansını artırır.', cd: 25, manaCost: 35, type: 'buff', icon: 'Shield', visual: 'earth_shield' },
            { id: 's6', name: 'Arındırma', description: 'Negatif etkileri siler.', cd: 20, manaCost: 20, type: 'utility', icon: 'Droplet', visual: 'cleanse' },
            { id: 's7', name: 'Ataların Gazabı', description: 'Devasa bir ruh çağırır.', cd: 50, manaCost: 80, type: 'ultimate', icon: 'Ghost', visual: 'ancestor' },
        ]
    },
    ranger: {
        id: 'ranger',
        name: 'Okçu (Ranger)',
        role: 'Sniper / Scout',
        description: 'Uzak mesafe ve tuzak uzmanı.',
        mechanic: 'Özellik: Mesafe arttıkça hasar artar.',
        skills: [
            { id: 'r1', name: 'Hızlı Ok', description: 'Seri atış yapar.', cd: 1.0, manaCost: 5, type: 'damage', icon: 'ArrowRight', visual: 'arrow' },
            { id: 'r2', name: 'Çoklu Atış', description: '5 ok birden fırlatır.', cd: 8, manaCost: 25, type: 'damage', icon: 'Diff', visual: 'multishot' },
            { id: 'r3', name: 'Görünmezlik', description: '3sn görünmez olur.', cd: 20, manaCost: 30, type: 'buff', icon: 'EyeOff', visual: 'stealth' },
            { id: 'r4', name: 'Kapan', description: 'Düşmanı tuzağa düşürür.', cd: 15, manaCost: 20, type: 'utility', icon: 'Crosshair', visual: 'trap' },
            { id: 'r5', name: 'Rüzgar Adımı', description: 'Geriye doğru hızla kaçar.', cd: 10, manaCost: 15, type: 'utility', icon: 'Wind', visual: 'dash_back' },
            { id: 'r6', name: 'Zehirli Ok', description: 'Düşmanı zehirler (DoT).', cd: 12, manaCost: 20, type: 'damage', icon: 'Skull', visual: 'poison_arrow' },
            { id: 'r7', name: 'Ok Yağmuru', description: 'Gökten ok yağdırır.', cd: 40, manaCost: 50, type: 'ultimate', icon: 'CloudRain', visual: 'arrow_rain' },
        ]
    },
    assassin: {
        id: 'assassin',
        name: 'Suikastçı (Assassin)',
        role: 'Burst / Stealth',
        description: 'Gölge savaşçısı. Kritik hasar ustası.',
        mechanic: 'Özellik: Arkadan vuruşlarda %200 hasar.',
        skills: [
            { id: 'a1', name: 'Hançer Darbesi', description: 'Hızlı yakın saldırı.', cd: 1.0, manaCost: 5, type: 'damage', icon: 'Sword', visual: 'stab' },
            { id: 'a2', name: 'Gölge Adım', description: 'Düşmanın arkasına ışınlanır.', cd: 10, manaCost: 25, type: 'utility', icon: 'Ghost', visual: 'shadow_step' },
            { id: 'a3', name: 'Sis Bombası', description: 'Görünmez olur ve hedef şaşırtır.', cd: 20, manaCost: 30, type: 'buff', icon: 'Cloud', visual: 'smoke' },
            { id: 'a4', name: 'Zehirli Bıçak', description: 'Kanama hasarı verir.', cd: 15, manaCost: 20, type: 'damage', icon: 'Droplet', visual: 'poison_blade' },
            { id: 'a5', name: 'Suikast', description: 'Tek seferlik devasa kritik hasar.', cd: 30, manaCost: 50, type: 'damage', icon: 'Target', visual: 'assassinate' },
            { id: 'a6', name: 'Refleks', description: 'Saldırılardan kaçınma şansı.', cd: 25, manaCost: 30, type: 'buff', icon: 'Activity', visual: 'dodge' },
            { id: 'a7', name: 'Gölge Kopyası', description: 'Kendinin 3 kopyasını yaratır.', cd: 60, manaCost: 70, type: 'ultimate', icon: 'Users', visual: 'clones' },
        ]
    }
};

// --- HELPER FOR VISUALS ---
const visuals = (model: any, color: string, glow?: string) => ({
    model,
    primaryColor: color,
    glowColor: glow,
    glowIntensity: glow ? 2 : 0
} as const);

export const CLASS_STARTER_ITEMS: Record<CharacterClass, Item[]> = {
    warrior: [
        { id: 'start_w_1', name: 'Eski Kılıç', tier: 1, type: 'weapon', rarity: 'common', classReq: 'warrior', visuals: { model: 'sword', primaryColor: '#94a3b8' } },
        { id: 'start_w_2', name: 'Eski Pantolon', tier: 1, type: 'pants', rarity: 'common', classReq: 'warrior' },
        { id: 'start_w_3', name: 'Paslı Zırh', tier: 1, type: 'armor', rarity: 'common', classReq: 'warrior' }
    ],
    mage: [
        { id: 'start_m_1', name: 'Çırak Asası', tier: 1, type: 'weapon', rarity: 'common', classReq: 'mage', visuals: { model: 'staff', primaryColor: '#8b5cf6', glowColor: '#a78bfa' } },
        { id: 'start_m_2', name: 'Büyücü Cübbesi', tier: 1, type: 'armor', rarity: 'common', classReq: 'mage' }
    ],
    ranger: [
        { id: 'start_r_1', name: 'Avcı Yayı', tier: 1, type: 'weapon', rarity: 'common', classReq: 'ranger', visuals: { model: 'bow', primaryColor: '#a3e635' } },
        { id: 'start_r_2', name: 'Deri Zırh', tier: 1, type: 'armor', rarity: 'common', classReq: 'ranger' }
    ],
    shaman: [
        { id: 'start_s_1', name: 'Ruh Değneği', tier: 1, type: 'weapon', rarity: 'common', classReq: 'shaman', visuals: { model: 'hammer', primaryColor: '#14b8a6' } },
        { id: 'start_s_2', name: 'Kabile Zırhı', tier: 1, type: 'armor', rarity: 'common', classReq: 'shaman' }
    ],
    assassin: [
        { id: 'start_a_1', name: 'Paslı Hançer', tier: 1, type: 'weapon', rarity: 'common', classReq: 'assassin', visuals: { model: 'dagger', primaryColor: '#64748b' } },
        { id: 'start_a_2', name: 'Kamuflaj Zırhı', tier: 1, type: 'armor', rarity: 'common', classReq: 'assassin' }
    ]
};

export const INITIAL_INVENTORY: Item[] = [
    { id: 'item_1', name: 'Paslı Kılıç', tier: 1, type: 'weapon', rarity: 'common' },
    { id: 'item_2', name: 'Deri Zırh', tier: 1, type: 'armor', rarity: 'common' },
    { id: 'item_head', name: 'Deri Miğfer', tier: 1, type: 'helmet', rarity: 'common' },
    { id: 'item_pants', name: 'Deri Pantolon', tier: 1, type: 'pants', rarity: 'common' },
    { id: 'item_3', name: 'Ekmek', tier: 1, type: 'consumable', rarity: 'common', value: 50 },
];

export const POTIONS: Item[] = [
    { id: 'hp_pot', name: 'Can İksiri (Küçük)', tier: 1, type: 'consumable', rarity: 'common', value: 50 },
    { id: 'mp_pot', name: 'Mana İksiri (Küçük)', tier: 1, type: 'consumable', rarity: 'common', value: 50 },
    { id: 'hp_pot_l', name: 'Can İksiri (Büyük)', tier: 3, type: 'consumable', rarity: 'rare', value: 200 },
    { id: 'mp_pot_l', name: 'Mana İksiri (Büyük)', tier: 3, type: 'consumable', rarity: 'rare', value: 200 },
];

// --- QUEST DATA (CHAIN) ---
export const QUEST_DATA: Record<number, Partial<Quest>> = {
    1: { title: 'Acemi Eğitimi', description: 'Savaş sanatını öğren. 2 Düşman yok et.', requiredCount: 2, rewardGold: 100, rewardXp: 500, rewardHonor: 50 },
    2: { title: 'İlk Kan', description: 'Vahşi doğaya çık. 5 Düşman yok et.', requiredCount: 5, rewardGold: 200, rewardXp: 1000, rewardHonor: 100 },
    3: { title: 'Köyün Güvenliği', description: 'Köy çevresini temizle. 10 Düşman yok et.', requiredCount: 10, rewardGold: 500, rewardXp: 2000, rewardHonor: 150 },
    4: { title: 'Casus Avı', description: 'Düşman gözcülerini avla. 15 Düşman yok et.', requiredCount: 15, rewardGold: 1000, rewardXp: 4000, rewardHonor: 200 },
    5: { title: 'Generalin Emri', description: 'Savaş kızışıyor. 25 Düşman yok et.', requiredCount: 25, rewardGold: 2000, rewardXp: 8000, rewardHonor: 300 },
    6: { title: 'Sınır İhlali', description: 'Karşı ırkın bölgesine sız (4-x). 30 Düşman yok et.', requiredCount: 30, rewardGold: 3000, rewardXp: 12000, rewardHonor: 500 },
    7: { title: 'Onur Savaşı', description: 'Kendini kanıtla. 40 Düşman yok et.', requiredCount: 40, rewardGold: 5000, rewardXp: 20000, rewardHonor: 750 },
    8: { title: 'Elit Avcı', description: 'Güçlü düşmanlarla yüzleş. 50 Düşman yok et.', requiredCount: 50, rewardGold: 7500, rewardXp: 30000, rewardHonor: 1000 },
    9: { title: 'Efsanevi Yükseliş', description: 'Adını tarihe yaz. 100 Düşman yok et.', requiredCount: 100, rewardGold: 15000, rewardXp: 50000, rewardHonor: 2000 },
    10: { title: 'Savaş Lordu', description: 'Sen artık bir efsanesin. 200 Düşman yok et.', requiredCount: 200, rewardGold: 50000, rewardXp: 100000, rewardHonor: 5000 },
};

// --- MOCK LEADERBOARD DATA ---
export const MOCK_LEADERBOARD = [
    { rank: 1, name: 'Ares', level: 30, honor: 15420, faction: 'marsu', gold: 5000000 },
    { rank: 2, name: 'Poseidon', level: 29, honor: 14200, faction: 'terya', gold: 4200000 },
    { rank: 3, name: 'Gaia', level: 28, honor: 12500, faction: 'venu', gold: 3800000 },
    { rank: 4, name: 'Kratos', level: 27, honor: 11000, faction: 'marsu', gold: 3500000 },
    { rank: 5, name: 'Merlin', level: 25, honor: 9800, faction: 'terya', gold: 3200000 },
];

export const RANKS: Rank[] = [
    { id: 0, title: 'Acemi Gezgin', minRP: 0, bonusDamage: 0, bonusShield: 0, icon: '🌱' },
    { id: 1, title: 'Kadim Gezgin', minRP: 100, bonusDamage: 1, bonusShield: 0, icon: '🌿' },
    { id: 2, title: 'Kıdemli Pilot', minRP: 500, bonusDamage: 2, bonusShield: 1, icon: '✈️' },
    { id: 3, title: 'Acemi Milis', minRP: 1000, bonusDamage: 3, bonusShield: 1, icon: '⚔️' },
    { id: 4, title: 'Kıdemli Nefer', minRP: 2000, bonusDamage: 4, bonusShield: 2, icon: '🛡️' },
    { id: 5, title: 'Uzman Milis', minRP: 5000, bonusDamage: 5, bonusShield: 2, icon: '🎖️' },
    { id: 6, title: 'Aday Muhafız', minRP: 10000, bonusDamage: 6, bonusShield: 3, icon: '🥉' },
    { id: 7, title: 'Gezgin Savaşçı', minRP: 20000, bonusDamage: 7, bonusShield: 3, icon: '🥈' },
    { id: 8, title: 'Karakol Teğmeni', minRP: 50000, bonusDamage: 8, bonusShield: 4, icon: '🥇' },
    { id: 9, title: 'Sınır Bekçisi', minRP: 100000, bonusDamage: 9, bonusShield: 4, icon: '🏰' },
    { id: 10, title: 'Kıdemli Akıncı', minRP: 200000, bonusDamage: 10, bonusShield: 5, icon: '🏇' },
    { id: 11, title: 'Uzman Savaşçı', minRP: 500000, bonusDamage: 12, bonusShield: 5, icon: '⚔️⭐' },
    { id: 12, title: 'Öncü Birliği Lideri', minRP: 1000000, bonusDamage: 15, bonusShield: 6, icon: '🚩' },
    { id: 13, title: 'Bölük Komutanı', minRP: 2000000, bonusDamage: 18, bonusShield: 7, icon: '🏵️' },
    { id: 14, title: 'Kıdemli Muhafız', minRP: 5000000, bonusDamage: 20, bonusShield: 8, icon: '🛡️⭐' },
    { id: 15, title: 'Seçkin Şövalye', minRP: 10000000, bonusDamage: 25, bonusShield: 10, icon: '⚜️' },
    { id: 16, title: 'Savaş Lordu', minRP: 20000000, bonusDamage: 30, bonusShield: 12, icon: '👹' },
    { id: 17, title: 'Kurmay Komutan', minRP: 50000000, bonusDamage: 35, bonusShield: 15, icon: '👑' },
    { id: 18, title: 'Kadim General', minRP: 100000000, bonusDamage: 40, bonusShield: 20, icon: '🌟' },
    { id: 19, title: 'Yüce Hükümdar', minRP: 500000000, bonusDamage: 50, bonusShield: 25, icon: '👑🔥' },
];

export const ZONE_CONFIG: Record<number, { name: string, bg: string, factionOwner?: Faction, minLevel: number, isSafeZone?: boolean, enemies: Partial<GameEntity>[], npcs: Partial<GameEntity>[], portals: Portal[] }> = {
    // --- MARSU (ATEŞ) LOW LEVEL 1-1 TO 1-4 ---
    11: {
        name: 'Kül Vadisi (1-1)', bg: '#450a0a', factionOwner: 'marsu', isSafeZone: true, minLevel: 1, // X-1
        enemies: [{ name: 'Ateş Böceği', level: 1, hp: 200 }],
        npcs: [],
        portals: [{ id: 'p_11_12', x: 40, z: -40, targetZone: 12, levelReq: 1, name: 'İleri: 1-2' }] // Level 1 can access 1-2
    },
    12: {
        name: 'Yanık Topraklar (1-2)', bg: '#7f1d1d', factionOwner: 'marsu', minLevel: 1, // X-2
        enemies: [{ name: 'İskelet Savaşçı', level: 3, hp: 400 }],
        npcs: [],
        portals: [
            { id: 'p_12_11', x: -40, z: 40, targetZone: 11, levelReq: 1, name: 'Geri: 1-1' },
            { id: 'p_12_13', x: 40, z: -40, targetZone: 13, levelReq: 2, name: 'İleri: 1-3' } // Level 2 req for 1-3
        ]
    },
    13: {
        name: 'Magma Geçidi (1-3)', bg: '#991b1b', factionOwner: 'marsu', minLevel: 2, // X-3 (Level 2 req)
        enemies: [{ name: 'Cehennem Tazısı', level: 6, hp: 800 }],
        npcs: [],
        portals: [{ id: 'p_13_12', x: -40, z: 20, targetZone: 12, levelReq: 1, name: 'Geri: 1-2' }, { id: 'p_13_14', x: 20, z: -20, targetZone: 14, levelReq: 2, name: 'İleri: 1-4' }] // Level 2 for 1-4
    },
    14: {
        name: 'Ejderha Sırtı (1-4)', bg: '#b91c1c', factionOwner: 'marsu', minLevel: 2, // X-4 (Level 2 req)
        enemies: [{ name: 'Genç Ejder', level: 9, hp: 1500 }],
        npcs: [],
        portals: [
            { id: 'p_14_13', x: -40, z: 20, targetZone: 13, levelReq: 2, name: 'Geri: 1-3' },
            { id: 'p_14_41', x: 20, z: -20, targetZone: 41, levelReq: 8, name: 'PORTAL: 4-1 GEÇİT' } // Level 8 req for 4-1
        ]
    },

    // --- MARSU HIGH LEVEL 1-5 TO 1-8 ---
    // Access only via 4-4 Central Hub
    15: {
        name: 'Karanlık Mahzen (1-5)', bg: '#2f0505', factionOwner: 'marsu', minLevel: 10, enemies: [{ name: 'Karanlık Şövalye', level: 16, hp: 8000 }], npcs: [],
        portals: [
            { id: 'p_15_44', x: -40, z: 40, targetZone: 44, levelReq: 9, name: 'Geri: 4-4 SAVAŞ ALANI' }, // To Central
            { id: 'p_15_16', x: 40, z: -40, targetZone: 16, levelReq: 11, name: 'İleri: 1-6' }
        ]
    },
    16: {
        name: 'Cehennem Kapısı (1-6)', bg: '#450a0a', factionOwner: 'marsu', minLevel: 11, enemies: [{ name: 'İfrit', level: 20, hp: 15000 }], npcs: [],
        portals: [
            { id: 'p_16_15', x: -40, z: 0, targetZone: 15, levelReq: 10, name: 'Geri: 1-5' },
            { id: 'p_16_17', x: 40, z: 0, targetZone: 17, levelReq: 11, name: 'İleri: 1-7' }
        ]
    },
    17: {
        name: 'Ejderha Yuvası (1-7)', bg: '#450a0a', factionOwner: 'marsu', minLevel: 11, enemies: [{ name: 'Kadim Ejder', level: 25, hp: 30000 }], npcs: [],
        portals: [
            { id: 'p_17_16', x: -40, z: 0, targetZone: 16, levelReq: 11, name: 'Geri: 1-6' },
            { id: 'p_17_18', x: 40, z: 0, targetZone: 18, levelReq: 12, name: 'İleri: 1-8' }
        ]
    },
    18: {
        name: 'Yanardağ Çekirdeği (1-8)', bg: '#000000', factionOwner: 'marsu', minLevel: 12, enemies: [{ name: 'VOLKAN TANRISI (BOSS)', level: 30, hp: 500000 }], npcs: [],
        portals: [
            { id: 'p_18_17', x: 0, z: 40, targetZone: 17, levelReq: 11, name: 'Geri: 1-7' }
        ]
    },


    // --- TERYA (SU) LOW LEVEL 2-1 TO 2-4 ---
    21: { name: 'Kristal Nehir (2-1)', bg: '#172554', factionOwner: 'terya', isSafeZone: true, minLevel: 1, enemies: [{ name: 'Su Perisi', level: 1, hp: 200 }], npcs: [{ name: 'Su Bilgesi', color: 'blue' }], portals: [{ id: 'p_21_22', x: 40, z: -40, targetZone: 22, levelReq: 1, name: 'İleri: 2-2' }] },
    22: { name: 'Buzul Mağarası (2-2)', bg: '#1e3a8a', factionOwner: 'terya', minLevel: 1, enemies: [{ name: 'Buz Golemi', level: 3, hp: 400 }], npcs: [], portals: [{ id: 'p_22_21', x: -40, z: 40, targetZone: 21, levelReq: 1, name: 'Geri: 2-1' }, { id: 'p_22_23', x: 40, z: -40, targetZone: 23, levelReq: 2, name: 'İleri: 2-3' }] },
    23: { name: 'Derin Okyanus (2-3)', bg: '#1e40af', factionOwner: 'terya', minLevel: 2, enemies: [{ name: 'Siren', level: 6, hp: 800 }], npcs: [], portals: [{ id: 'p_23_22', x: -40, z: 20, targetZone: 22, levelReq: 1, name: 'Geri: 2-2' }, { id: 'p_23_24', x: 20, z: -20, targetZone: 24, levelReq: 2, name: 'İleri: 2-4' }] },
    24: {
        name: 'Atlantis (2-4)', bg: '#1d4ed8', factionOwner: 'terya', minLevel: 2, enemies: [{ name: 'Mızraklı Naga', level: 9, hp: 1500 }], npcs: [], portals: [
            { id: 'p_24_23', x: -40, z: 20, targetZone: 23, levelReq: 2, name: 'Geri: 2-3' },
            { id: 'p_24_42', x: 20, z: -20, targetZone: 42, levelReq: 8, name: 'PORTAL: 4-2 GEÇİT' }
        ]
    },

    // --- TERYA HIGH LEVEL 2-5 TO 2-8 ---
    // Access only via 4-4 Central Hub
    25: {
        name: 'Abyss (2-5)', bg: '#020617', factionOwner: 'terya', minLevel: 10, enemies: [{ name: 'Abyss Canavarı', level: 16, hp: 8000 }], npcs: [],
        portals: [
            { id: 'p_25_44', x: 0, z: 40, targetZone: 44, levelReq: 9, name: 'Geri: 4-4 SAVAŞ ALANI' },
            { id: 'p_25_26', x: 40, z: 0, targetZone: 26, levelReq: 11, name: 'İleri: 2-6' }
        ]
    },
    26: {
        name: 'Mercan Resifi (2-6)', bg: '#172554', factionOwner: 'terya', minLevel: 11, enemies: [{ name: 'Kraken Yavrusu', level: 20, hp: 15000 }], npcs: [],
        portals: [
            { id: 'p_26_25', x: -40, z: 0, targetZone: 25, levelReq: 10, name: 'Geri: 2-5' },
            { id: 'p_26_27', x: 40, z: 0, targetZone: 27, levelReq: 11, name: 'İleri: 2-7' }
        ]
    },
    27: {
        name: 'Batık Şehir (2-7)', bg: '#172554', factionOwner: 'terya', minLevel: 11, enemies: [{ name: 'Poseidon Muhafızı', level: 25, hp: 30000 }], npcs: [],
        portals: [
            { id: 'p_27_26', x: -40, z: 0, targetZone: 26, levelReq: 11, name: 'Geri: 2-6' },
            { id: 'p_27_28', x: 40, z: 0, targetZone: 28, levelReq: 12, name: 'İleri: 2-8' }
        ]
    },
    28: {
        name: 'Poseidon Tahtı (2-8)', bg: '#000000', factionOwner: 'terya', minLevel: 12, enemies: [{ name: 'OKYANUS TANRISI (BOSS)', level: 30, hp: 500000 }], npcs: [],
        portals: [
            { id: 'p_28_27', x: 0, z: 40, targetZone: 27, levelReq: 11, name: 'Geri: 2-7' }
        ]
    },


    // --- VENU (DOĞA) LOW LEVEL 3-1 TO 3-4 ---
    31: { name: 'Kadim Orman (3-1)', bg: '#14532d', factionOwner: 'venu', isSafeZone: true, minLevel: 1, enemies: [{ name: 'Yosun Adam', level: 1, hp: 200 }], npcs: [{ name: 'Orman Ruhu', color: 'green' }], portals: [{ id: 'p_31_32', x: 40, z: -40, targetZone: 32, levelReq: 1, name: 'İleri: 3-2' }] },
    32: { name: 'Bataklık (3-2)', bg: '#166534', factionOwner: 'venu', minLevel: 1, enemies: [{ name: 'Dev Sinek', level: 3, hp: 400 }], npcs: [], portals: [{ id: 'p_32_31', x: -40, z: 40, targetZone: 31, levelReq: 1, name: 'Geri: 3-1' }, { id: 'p_32_33', x: 40, z: -40, targetZone: 33, levelReq: 2, name: 'İleri: 3-3' }] },
    33: { name: 'Unutulmuş Vadi (3-3)', bg: '#15803d', factionOwner: 'venu', minLevel: 2, enemies: [{ name: 'Ent Savaşçı', level: 6, hp: 800 }], npcs: [], portals: [{ id: 'p_33_32', x: -40, z: 20, targetZone: 32, levelReq: 1, name: 'Geri: 3-2' }, { id: 'p_33_34', x: 20, z: -20, targetZone: 34, levelReq: 2, name: 'İleri: 3-4' }] },
    34: {
        name: 'Kristal Mağara (3-4)', bg: '#16a34a', factionOwner: 'venu', minLevel: 2, enemies: [{ name: 'Taş Golem', level: 9, hp: 1500 }], npcs: [], portals: [
            { id: 'p_34_33', x: -40, z: 20, targetZone: 33, levelReq: 2, name: 'Geri: 3-3' },
            { id: 'p_34_43', x: 20, z: -20, targetZone: 43, levelReq: 8, name: 'PORTAL: 4-3 GEÇİT' }
        ]
    },

    // --- VENU HIGH LEVEL 3-5 TO 3-8 ---
    // Access only via 4-4 Central Hub
    35: {
        name: 'Yasak Bölge (3-5)', bg: '#052e16', factionOwner: 'venu', minLevel: 10, enemies: [{ name: 'Kadim Ent', level: 16, hp: 8000 }], npcs: [],
        portals: [
            { id: 'p_35_44', x: 0, z: 40, targetZone: 44, levelReq: 9, name: 'Geri: 4-4 SAVAŞ ALANI' },
            { id: 'p_35_36', x: 40, z: -40, targetZone: 36, levelReq: 11, name: 'İleri: 3-6' }
        ]
    },
    36: {
        name: 'Ruhlar Ormanı (3-6)', bg: '#14532d', factionOwner: 'venu', minLevel: 11, enemies: [{ name: 'Orman Ruhu', level: 20, hp: 15000 }], npcs: [],
        portals: [
            { id: 'p_36_35', x: -40, z: 0, targetZone: 35, levelReq: 10, name: 'Geri: 3-5' },
            { id: 'p_36_37', x: 40, z: 0, targetZone: 37, levelReq: 11, name: 'İleri: 3-7' }
        ]
    },
    37: {
        name: 'Fısıldayan Vadi (3-7)', bg: '#14532d', factionOwner: 'venu', minLevel: 11, enemies: [{ name: 'Vahşi Druid', level: 25, hp: 30000 }], npcs: [],
        portals: [
            { id: 'p_37_36', x: -40, z: 0, targetZone: 36, levelReq: 11, name: 'Geri: 3-6' },
            { id: 'p_37_38', x: 40, z: 0, targetZone: 38, levelReq: 12, name: 'İleri: 3-8' }
        ]
    },
    38: {
        name: 'Gaia Tapınağı (3-8)', bg: '#000000', factionOwner: 'venu', minLevel: 12, enemies: [{ name: 'DOĞA ANA (BOSS)', level: 30, hp: 500000 }], npcs: [],
        portals: [
            { id: 'p_38_37', x: 0, z: 40, targetZone: 37, levelReq: 11, name: 'Geri: 3-7' }
        ]
    },

    // --- PVP GATEWAYS (ONLY CONNECT LOW LEVEL TO CENTER) ---
    // 4-1: Marsu Gateway 
    41: {
        name: 'MARSU KAPISI (4-1)', bg: '#854d0e', minLevel: 8, enemies: [{ name: 'Paralı Asker', level: 14, hp: 3000 }], npcs: [], portals: [
            { id: 'p_41_14', x: -50, z: -50, targetZone: 14, levelReq: 2, name: 'GERİ: Marsu 1-4' },
            { id: 'p_41_44', x: 50, z: 0, targetZone: 44, levelReq: 9, name: 'MERKEZ: 4-4 ARENA' }
        ]
    },

    // 4-2: Terya Gateway
    42: {
        name: 'TERYA KAPISI (4-2)', bg: '#854d0e', minLevel: 8, enemies: [{ name: 'Kaçak Büyücü', level: 14, hp: 3000 }], npcs: [], portals: [
            { id: 'p_42_24', x: 50, z: -50, targetZone: 24, levelReq: 2, name: 'GERİ: Terya 2-4' },
            { id: 'p_42_44', x: -50, z: 0, targetZone: 44, levelReq: 9, name: 'MERKEZ: 4-4 ARENA' }
        ]
    },

    // 4-3: Venu Gateway
    43: {
        name: 'VENU KAPISI (4-3)', bg: '#854d0e', minLevel: 8, enemies: [{ name: 'Vahşi Barbar', level: 14, hp: 3000 }], npcs: [], portals: [
            { id: 'p_43_34', x: 0, z: 50, targetZone: 34, levelReq: 2, name: 'GERİ: Venu 3-4' },
            { id: 'p_43_44', x: 0, z: -50, targetZone: 44, levelReq: 9, name: 'MERKEZ: 4-4 ARENA' }
        ]
    },

    // 4-4: CENTRAL WAR ZONE - THE HUB FOR HIGH LEVEL CONTENT
    44: {
        name: 'Savaş Meydanı (4-4)', bg: '#713f12', minLevel: 9, enemies: [{ name: 'Gladyatör', level: 25, hp: 10000 }], npcs: [], portals: [
            // Gateways (Backwards)
            { id: 'p_44_41', x: -40, z: -40, targetZone: 41, levelReq: 8, name: 'MARSU KAPISI (4-1)' },
            { id: 'p_44_42', x: 40, z: -40, targetZone: 42, levelReq: 8, name: 'TERYA KAPISI (4-2)' },
            { id: 'p_44_43', x: 0, z: 40, targetZone: 43, levelReq: 8, name: 'VENU KAPISI (4-3)' },
            // High Level Access (Forwards)
            { id: 'p_44_15', x: -50, z: 0, targetZone: 15, levelReq: 10, name: 'MARSU ELİT (1-5)' },
            { id: 'p_44_25', x: 50, z: 0, targetZone: 25, levelReq: 10, name: 'TERYA ELİT (2-5)' },
            { id: 'p_44_35', x: 0, z: 50, targetZone: 35, levelReq: 10, name: 'VENU ELİT (3-5)' },

            { id: 'p_44_45', x: 0, z: 0, targetZone: 45, levelReq: 25, name: 'SOLUCAN DELİĞİ (4-5)' }
        ]
    },

    // 4-5: Extra High Level
    45: {
        name: 'Solucan Deliği (4-5)', bg: '#000000', minLevel: 25, enemies: [{ name: 'Uzaylı Gözcü', level: 30, hp: 20000 }], npcs: [], portals: [
            { id: 'p_45_44', x: 0, z: 0, targetZone: 44, levelReq: 9, name: 'Geri: 4-4' }
        ]
    }
};

export const LEVEL_XP_REQUIREMENTS: number[] = [
    0,
    0,                  // Level 1
    10000,              // Level 2
    20000,              // Level 3
    40000,              // Level 4
    80000,              // Level 5
    160000,             // Level 6
    320000,             // Level 7
    640000,             // Level 8
    1280000,            // Level 9
    2560000,            // Level 10
    5120000,            // Level 11
    10240000,           // Level 12
    20480000,           // Level 13
    40960000,           // Level 14
    81920000,           // Level 15
    163840000,          // Level 16
    327680000,          // Level 17
    655360000,          // Level 18
    1310720000,         // Level 19
    2621440000,         // Level 20
    5242880000,         // Level 21
    10485760000,        // Level 22
    20971520000,        // Level 23
    41943040000,        // Level 24
    83886080000,        // Level 25
    167772160000,       // Level 26
    335544320000,       // Level 27
    671088640000,       // Level 28
    1342177280000,      // Level 29
    2684354560000       // Level 30 (Max XP needed to reach here)
];

// --- DEFAULT HUD LAYOUT (SYNCED WITH MAIN CONSTANTS) ---
export const DEFAULT_HUD_LAYOUT: HUDLayout = {
    elements: {
        // ═══════════ SOL TARAF ═══════════
        // Profile - Sol üst köşe (Seviye, İsim, HP/MP barları)
        profile: { x: 2, y: 2, scale: 1, enabled: true },

        // Quest Tracker - Profilin hemen altında
        quest: { x: 2, y: 14, scale: 1, enabled: true },

        // Chat - Quest'in altında (Genel/Parti/Klan sekmeleri)
        chat: { x: 2, y: 28, scale: 1, enabled: true },

        // Joystick - Sol alt köşe (sabit)
        joystick: { x: 8, y: 75, scale: 1, enabled: true },

        // ═══════════ SAĞ ÜST ═══════════
        // Map + Menu Buttons - Sağ üst köşe (Minimap, Zone ismi, butonlar)
        map: { x: 72, y: 2, scale: 1, enabled: true },

        // ═══════════ SAĞ TARAF SKİLL'LER ═══════════
        // Eye Button (Free Look) - Sağ orta
        eye: { x: 92, y: 30, scale: 1, enabled: true },

        // HP/MP Potları - Eye'ın altında
        hp_pot: { x: 92, y: 38, scale: 0.85, enabled: true },
        mp_pot: { x: 92, y: 46, scale: 0.85, enabled: true },
        potions: { x: 92, y: 38, scale: 0.9, enabled: true },

        // Skills - Dikey sıralı, sağ tarafta (ekran içinde)
        skill1: { x: 70, y: 30, scale: 1, enabled: true },
        skill2: { x: 70, y: 38, scale: 1, enabled: true },
        skill3: { x: 70, y: 46, scale: 1, enabled: true },
        skill4: { x: 70, y: 54, scale: 1, enabled: true },
        skill5: { x: 70, y: 62, scale: 1, enabled: true },
        skill6: { x: 70, y: 70, scale: 1, enabled: true },
        skill7: { x: 70, y: 78, scale: 1, enabled: true },

        // ═══════════ SAĞ ALT ═══════════
        // Attack Button - Sağ alt köşe (büyük kırmızı, ekran içinde)
        attack: { x: 85, y: 75, scale: 1.2, enabled: true },
    }
};

// --- NEW GENERIC ITEMS (LOOT & MATERIALS) ---
export const GENERIC_ITEMS: Item[] = [
    { id: 'mat_cloth', name: 'Yırtık Kumaş', tier: 1, type: 'material', rarity: 'common', value: 10, image: '/items/cloth.png' },
    { id: 'mat_leather', name: 'Sert Deri', tier: 2, type: 'material', rarity: 'common', value: 25, image: '/items/leather.png' },
    { id: 'mat_iron_ore', name: 'Demir Cevheri', tier: 2, type: 'material', rarity: 'common', value: 30, image: '/items/iron_ore.png' },
    { id: 'mat_gold_ore', name: 'Altın Cevheri', tier: 3, type: 'material', rarity: 'uncommon', value: 50, image: '/items/gold_ore.png' },
    { id: 'mat_wood', name: 'Meşe Odunu', tier: 1, type: 'material', rarity: 'common', value: 15, image: '/items/wood.png' },
    { id: 'mat_magic_dust', name: 'Büyülü Toz', tier: 1, type: 'material', rarity: 'uncommon', value: 40, image: '/items/magic_dust.png' },
    { id: 'mat_essence_fire', name: 'Ateş Özü', tier: 4, type: 'material', rarity: 'rare', value: 100, image: '/items/fire_essence.png' },
    { id: 'mat_essence_water', name: 'Su Özü', tier: 4, type: 'material', rarity: 'rare', value: 100, image: '/items/water_essence.png' },
    { id: 'mat_essence_void', name: 'Hiçlik Özü', tier: 5, type: 'material', rarity: 'epic', value: 500, image: '/items/void_essence.png' },
    { id: 'misc_key_bronze', name: 'Bronz Anahtar', tier: 1, type: 'material', rarity: 'manual', value: 75, image: '/items/key_bronze.png' } as any,
    { id: 'misc_key_gold', name: 'Altın Anahtar', tier: 3, type: 'material', rarity: 'rare', value: 250, image: '/items/key_gold.png' },
    { id: 'misc_scroll_empty', name: 'Boş Parşömen', tier: 2, type: 'material', rarity: 'common', value: 20, image: '/items/scroll.png' },
];

// --- COSTUMES ---
export const MOCK_COSTUMES: Item[] = [
    { id: 'costume_ninja', name: 'Gölge Ninja Kostümü', tier: 3, type: 'costume', rarity: 'epic', value: 1000, description: 'Sessiz ve ölümcül.', image: '/items/costume_ninja.png' } as any,
    { id: 'costume_santa', name: 'Noel Baba Kostümü', tier: 3, type: 'costume', rarity: 'rare', value: 1000, description: 'Mutlu yıllar!', image: '/items/costume_santa.png' } as any,
    { id: 'costume_void_lord', name: 'Hiçlik Lordu Zırhı', tier: 5, type: 'costume', rarity: 'legendary', value: 5000, description: 'Karanlığın gücü.', image: '/items/costume_void.png' } as any,
];

// --- ZONE REWARDS CONFIG ---
export const ZONE_REWARDS: Record<number, { minGold: number, maxGold: number, honor: number, maxTier: number, dropChance: number }> = {
    // TIER 1 ZONES (1-1 to 1-4, 2-1 to 2-4, 3-1 to 3-4)
    11: { minGold: 10, maxGold: 30, honor: 1, maxTier: 1, dropChance: 0.1 },
    12: { minGold: 20, maxGold: 40, honor: 2, maxTier: 1, dropChance: 0.1 },
    13: { minGold: 30, maxGold: 50, honor: 3, maxTier: 2, dropChance: 0.1 },
    14: { minGold: 40, maxGold: 60, honor: 4, maxTier: 2, dropChance: 0.1 },
    21: { minGold: 10, maxGold: 30, honor: 1, maxTier: 1, dropChance: 0.1 },
    22: { minGold: 20, maxGold: 40, honor: 2, maxTier: 1, dropChance: 0.1 },
    23: { minGold: 30, maxGold: 50, honor: 3, maxTier: 2, dropChance: 0.1 },
    24: { minGold: 40, maxGold: 60, honor: 4, maxTier: 2, dropChance: 0.1 },
    31: { minGold: 10, maxGold: 30, honor: 1, maxTier: 1, dropChance: 0.1 },
    32: { minGold: 20, maxGold: 40, honor: 2, maxTier: 1, dropChance: 0.1 },
    33: { minGold: 30, maxGold: 50, honor: 3, maxTier: 2, dropChance: 0.1 },
    34: { minGold: 40, maxGold: 60, honor: 4, maxTier: 2, dropChance: 0.1 },

    // GATEWAYS (4-1, 4-2, 4-3)
    41: { minGold: 50, maxGold: 80, honor: 10, maxTier: 2, dropChance: 0.12 },
    42: { minGold: 50, maxGold: 80, honor: 10, maxTier: 2, dropChance: 0.12 },
    43: { minGold: 50, maxGold: 80, honor: 10, maxTier: 2, dropChance: 0.12 },

    // ARENA (4-4)
    44: { minGold: 100, maxGold: 200, honor: 50, maxTier: 3, dropChance: 0.15 },

    // HIGH LEVEL ZONES (1-5 to 1-8, etc)
    15: { minGold: 80, maxGold: 120, honor: 15, maxTier: 3, dropChance: 0.1 },
    16: { minGold: 100, maxGold: 150, honor: 20, maxTier: 3, dropChance: 0.1 },
    17: { minGold: 150, maxGold: 250, honor: 30, maxTier: 4, dropChance: 0.1 },
    18: { minGold: 500, maxGold: 1000, honor: 100, maxTier: 5, dropChance: 0.2 }, // BOSS
    25: { minGold: 80, maxGold: 120, honor: 15, maxTier: 3, dropChance: 0.1 },
    26: { minGold: 100, maxGold: 150, honor: 20, maxTier: 3, dropChance: 0.1 },
    27: { minGold: 150, maxGold: 250, honor: 30, maxTier: 4, dropChance: 0.1 },
    28: { minGold: 500, maxGold: 1000, honor: 100, maxTier: 5, dropChance: 0.2 }, // BOSS
    35: { minGold: 80, maxGold: 120, honor: 15, maxTier: 3, dropChance: 0.1 },
    36: { minGold: 100, maxGold: 150, honor: 20, maxTier: 3, dropChance: 0.1 },
    37: { minGold: 150, maxGold: 250, honor: 30, maxTier: 4, dropChance: 0.1 },
    38: { minGold: 500, maxGold: 1000, honor: 100, maxTier: 5, dropChance: 0.2 }, // BOSS
};

export const DEFAULT_ZONE_REWARD = { minGold: 5, maxGold: 15, honor: 0, maxTier: 1, dropChance: 0.05 };

