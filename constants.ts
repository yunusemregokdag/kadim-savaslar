













import { ClassData, CharacterClass, Item, GameEntity, Faction, Portal, Quest, Rank, WingItem, PetItem, HUDLayout } from './types';
import { ALL_CLASS_ITEMS } from './components/ItemGenerator';
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
    arctic_knight: { str: 10, dex: 5, int: 4, vit: 14 },
    gale_glaive: { str: 8, dex: 14, int: 3, vit: 8 },
    archer: { str: 4, dex: 15, int: 3, vit: 8 },
    archmage: { str: 2, dex: 4, int: 16, vit: 5 },
    bard: { str: 4, dex: 12, int: 12, vit: 6 },
    cleric: { str: 6, dex: 4, int: 12, vit: 12 },
    martial_artist: { str: 14, dex: 12, int: 2, vit: 8 },
    monk: { str: 10, dex: 10, int: 8, vit: 10 },
    reaper: { str: 14, dex: 8, int: 6, vit: 6 },
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

    // NEW: BUTTERFLY WINGS (T2-T4)
    { id: 'wing_butterfly_1', name: 'Kelebek Kanadı (Pembe)', type: 'fairy', tier: 2, bonusDamage: 20, bonusHp: 200, color: '#ec4899', modelPath: '/models/wings/butterfly_wings_cosmetic/butterfly_wings_cosmetic1.gltf' },
    { id: 'wing_butterfly_2', name: 'Kelebek Kanadı (Mavi)', type: 'fairy', tier: 2, bonusDamage: 22, bonusHp: 220, color: '#3b82f6', modelPath: '/models/wings/butterfly_wings_cosmetic/butterfly_wings_cosmetic2.gltf' },
    { id: 'wing_butterfly_3', name: 'Kelebek Kanadı (Yeşil)', type: 'fairy', tier: 2, bonusDamage: 24, bonusHp: 240, color: '#22c55e', modelPath: '/models/wings/butterfly_wings_cosmetic/butterfly_wings_cosmetic3.gltf' },
    { id: 'wing_butterfly_4', name: 'Kelebek Kanadı (Mor)', type: 'fairy', tier: 3, bonusDamage: 45, bonusHp: 400, color: '#a855f7', modelPath: '/models/wings/butterfly_wings_cosmetic/butterfly_wings_cosmetic4.gltf' },
    { id: 'wing_butterfly_5', name: 'Kelebek Kanadı (Turuncu)', type: 'fairy', tier: 3, bonusDamage: 50, bonusHp: 450, color: '#f97316', modelPath: '/models/wings/butterfly_wings_cosmetic/butterfly_wings_cosmetic5.gltf' },
    { id: 'wing_butterfly_6', name: 'Kelebek Kanadı (Altın)', type: 'fairy', tier: 3, bonusDamage: 55, bonusHp: 500, color: '#fbbf24', modelPath: '/models/wings/butterfly_wings_cosmetic/butterfly_wings_cosmetic6.gltf' },
    { id: 'wing_butterfly_7', name: 'Kelebek Kanadı (Kırmızı)', type: 'fairy', tier: 4, bonusDamage: 100, bonusHp: 800, bonusDefense: 30, color: '#ef4444', modelPath: '/models/wings/butterfly_wings_cosmetic/butterfly_wings_cosmetic7.gltf' },
    { id: 'wing_butterfly_8', name: 'Kelebek Kanadı (Gök)', type: 'fairy', tier: 4, bonusDamage: 110, bonusHp: 900, bonusDefense: 40, color: '#06b6d4', modelPath: '/models/wings/butterfly_wings_cosmetic/butterfly_wings_cosmetic8.gltf' },
    { id: 'wing_butterfly_9', name: 'Kelebek Kanadı (Karanlık)', type: 'fairy', tier: 4, bonusDamage: 120, bonusHp: 1000, bonusDefense: 50, color: '#1e1b4b', modelPath: '/models/wings/butterfly_wings_cosmetic/butterfly_wings_cosmetic9.gltf' },
    { id: 'wing_butterfly_10', name: 'Kelebek Kanadı (Gökkuşağı)', type: 'fairy', tier: 5, bonusDamage: 200, bonusHp: 2000, bonusDefense: 100, color: '#f472b6', modelPath: '/models/wings/butterfly_wings_cosmetic/butterfly_wings_cosmetic10.gltf' },

    // NEW: VOLT WINGS (T5 PREMIUM)
    { id: 'wing_volt', name: 'Volt Kanatları', type: 'dragon', tier: 5, bonusDamage: 300, bonusHp: 3000, bonusDefense: 200, bonusGoldRate: 30, color: '#facc15', modelPath: '/models/wings/volt_wings/volt_wings.gltf' },
];

// --- NEW: PETS DATA (REBALANCED T4/T5) ---
export const PETS_DATA: PetItem[] = [
    // TIER 1
    { id: 'pet_plains', name: 'Plains', type: 'dragon_baby', tier: 1, bonusExpRate: 5, bonusDefense: 10, color: '#a3e635', modelPath: '/models/pets/cubee-plains.gltf' },
    { id: 'pet_grass', name: 'Grass', type: 'dragon_baby', tier: 1, bonusExpRate: 5, bonusDefense: 12, color: '#4ade80', modelPath: '/models/pets/cubee-grass.gltf' },
    { id: 'pet_desert', name: 'Desert', type: 'dragon_baby', tier: 1, bonusExpRate: 5, bonusDefense: 8, color: '#fde047', modelPath: '/models/pets/cubee-desert.gltf' },
    { id: 'pet_savanna', name: 'Savanna', type: 'dragon_baby', tier: 1, bonusExpRate: 5, bonusDefense: 8, color: '#d97706', modelPath: '/models/pets/cubee-savanna.gltf' },

    // TIER 2
    { id: 'pet_snow', name: 'Snow', type: 'floating_crystal', tier: 2, bonusExpRate: 10, bonusDefense: 20, bonusMana: 50, color: '#e0f2fe', modelPath: '/models/pets/cubee-snow.gltf' },
    { id: 'pet_water', name: 'Water', type: 'floating_crystal', tier: 2, bonusExpRate: 10, bonusDefense: 22, bonusMana: 60, color: '#3b82f6', modelPath: '/models/pets/cubee-water.gltf' },
    { id: 'pet_swamps', name: 'Swamps', type: 'floating_crystal', tier: 2, bonusExpRate: 12, bonusDefense: 18, bonusMana: 40, color: '#10b981', modelPath: '/models/pets/cubee-swamps.gltf' },

    // TIER 3
    { id: 'pet_stone', name: 'Stone', type: 'spirit_wolf', tier: 3, bonusExpRate: 15, bonusDefense: 50, bonusHp: 300, color: '#78716c', modelPath: '/models/pets/cubee-stone.gltf' },
    { id: 'pet_mushroom', name: 'Mushroom', type: 'spirit_wolf', tier: 3, bonusExpRate: 18, bonusDefense: 40, bonusHp: 200, color: '#ef4444', modelPath: '/models/pets/cubee-mushroom.gltf' },
    { id: 'pet_lush', name: 'Lush', type: 'spirit_wolf', tier: 3, bonusExpRate: 20, bonusDefense: 45, bonusHp: 250, color: '#d9f99d', modelPath: '/models/pets/cubee-lush.gltf' },

    // TIER 4
    { id: 'pet_jungle', name: 'Jungle', type: 'phoenix', tier: 4, bonusExpRate: 25, bonusDamage: 50, bonusDefense: 80, color: '#15803d', modelPath: '/models/pets/cubee-jungle.gltf' },
    { id: 'pet_fire', name: 'Fire', type: 'phoenix', tier: 4, bonusExpRate: 30, bonusDamage: 80, bonusDefense: 50, color: '#f97316', modelPath: '/models/pets/cubee-fire.gltf' },
    { id: 'pet_tnt', name: 'TNT', type: 'phoenix', tier: 4, bonusExpRate: 35, bonusDamage: 100, bonusDefense: 20, color: '#b91c1c', modelPath: '/models/pets/cubee-tnt.gltf' },

    // TIER 5
    { id: 'pet_skeleton', name: 'Skeleton', type: 'owl', tier: 5, bonusExpRate: 40, bonusDamage: 120, bonusHp: 1000, bonusDefense: 100, color: '#e5e5e5', modelPath: '/models/pets/cubee-skeleton.gltf' },
    { id: 'pet_evil', name: 'Evil', type: 'owl', tier: 5, bonusExpRate: 50, bonusDamage: 200, bonusHp: 500, bonusDefense: 80, color: '#4c1d95', modelPath: '/models/pets/cubee-evil.gltf' },
    { id: 'pet_good', name: 'Good', type: 'owl', tier: 5, bonusExpRate: 50, bonusDamage: 100, bonusHp: 2000, bonusDefense: 150, color: '#fcd34d', modelPath: '/models/pets/cubee-good.gltf' },

    // BLACK MAGIC SERIES (PREMIUM)
    { id: 'pet_ebony_cat', name: 'Ebony Cat', type: 'phoenix', tier: 4, bonusExpRate: 35, bonusDamage: 90, bonusDefense: 60, color: '#1a1a2e', modelPath: '/models/pets/Cubee Black Magic pet/cubee-ebony_cat.gltf' },
    { id: 'pet_gothic_hag', name: 'Gothic Hag', type: 'phoenix', tier: 4, bonusExpRate: 40, bonusDamage: 110, bonusDefense: 40, color: '#2d132c', modelPath: '/models/pets/Cubee Black Magic pet/cubee-gothic_hag.gltf' },
    { id: 'pet_skelly_warlock', name: 'Skelly Warlock', type: 'owl', tier: 5, bonusExpRate: 55, bonusDamage: 180, bonusHp: 800, bonusDefense: 90, color: '#3d0066', modelPath: '/models/pets/Cubee Black Magic pet/cubee-skelly_warlock.gltf' },
    { id: 'pet_soul_weaver', name: 'Soul Weaver', type: 'owl', tier: 5, bonusExpRate: 60, bonusDamage: 250, bonusHp: 600, bonusDefense: 70, color: '#7b2cbf', modelPath: '/models/pets/Cubee Black Magic pet/cubee-soul_weaver.gltf' },
];

// --- CLASSES WITH 7 SKILLS (UPDATED CDS) ---
export const CLASSES: Record<CharacterClass, ClassData> = {
    warrior: {
        id: 'warrior',
        name: 'Savaşçı',
        name_en: 'Warrior',
        role: 'Tank / Melee',
        role_en: 'Tank / Melee',
        description: 'Yüksek savunma ve yakın dövüş uzmanı.',
        description_en: 'High defense and melee combat expert.',
        mechanic: 'Özellik: Hasar yedikçe "Öfke" biriktirir.',
        mechanic_en: 'Mechanic: Accumulates "Rage" as damage is taken.',
        skills: [
            { id: 'w1', name: 'Kılıç Darbesi', name_en: 'Sword Strike', description: 'Temel hasar verir.', description_en: 'Deals basic damage.', cd: 1.0, manaCost: 5, type: 'damage', icon: '/models/icons/warrior/icon_brutal_strike.png', visual: 'warrior_slash', modelPath: '/models/skills/warrior/warrior_slash_1.json' },
            { id: 'w2', name: 'Kalkan Duvarı', name_en: 'Shield Wall', description: '3sn hasar almazsın.', description_en: 'Become invulnerable for 3s.', cd: 15, manaCost: 40, type: 'buff', icon: '/models/icons/warrior/icon_shield_barrier_e.png', visual: 'warrior_shield', modelPath: '/models/skills/warrior/shield_barrier_1.json' },
            { id: 'w3', name: 'Öfke Patlaması', name_en: 'Rage Burst', description: 'Saldırı gücünü %20 artırır.', description_en: 'Increases attack power by 20%.', cd: 20, manaCost: 30, type: 'buff', icon: '/models/icons/warrior/icon_rampage_e.png', visual: 'warrior_charge', modelPath: '/models/skills/warrior/charge_1.json' },
            { id: 'w4', name: 'Yere Vurma', name_en: 'Ground Slam', description: 'Çevredeki düşmanları sersemletir.', description_en: 'Stuns nearby enemies.', cd: 10, manaCost: 25, type: 'damage', icon: '/models/icons/warrior/icon_charge_e.png', visual: 'warrior_judgement', modelPath: '/models/skills/warrior/judgement_sword_1.json' },
            { id: 'w5', name: 'Mızrak Atışı', name_en: 'Chain Hook', description: 'Uzaktaki düşmana mızrak fırlatır.', description_en: 'Throws a hook at distant enemy.', cd: 8, manaCost: 20, type: 'damage', icon: '/models/icons/warrior/icon_chain_hook_e.png', visual: 'warrior_pierce', modelPath: '/models/skills/warrior/warrior_pierce_1.json' },
            { id: 'w7', name: 'Kıyım (Ulti)', name_en: 'Judgement (Ulti)', description: '360 derece dönerek ölümcül hasar verir.', description_en: 'Deals deadly damage spinning 360 degrees.', cd: 40, manaCost: 60, type: 'ultimate', icon: '/models/icons/warrior/icon_judgement_e.png', visual: 'warrior_whirlwind', modelPath: '/models/skills/warrior/whirlwind_1.json' },
        ]
    },
    // --- NEW CLASSES ---
    arctic_knight: {
        id: 'arctic_knight',
        name: 'Buz Şövalyesi',
        name_en: 'Arctic Knight',
        role: 'Tank / CC',
        role_en: 'Tank / CC',
        description: 'Buzun gücünü kullanan dayanıklı savaşçı.',
        description_en: 'Durable warrior wielding the power of ice.',
        mechanic: 'Özellik: Düşmanları dondurarak yavaşlatır.',
        mechanic_en: 'Mechanic: Freezes and slows enemies.',
        skills: [
            { id: 'ak1', name: 'Buz Kesiği', name_en: 'Frost Strike', description: 'Soğuk hasar verir.', description_en: 'Deals cold damage.', cd: 1.0, manaCost: 5, type: 'damage', icon: '/models/icons/arctic_knight/icon_frost_strike_e.png', visual: 'arctic_slash', modelPath: '/models/skills/arctic_knight/fx_frost_strike_1.gltf' },
            { id: 'ak2', name: 'Ayaz Zırhı', name_en: 'Frost Armor', description: 'Defansı artırır.', description_en: 'Increases defense.', cd: 15, manaCost: 40, type: 'buff', icon: '/models/icons/arctic_knight/icon_frozen_shield_e.png', visual: 'arctic_storm', modelPath: '/models/skills/arctic_knight/fx_frost_shield.gltf' },
            { id: 'ak3', name: 'Buz Mızrağı', name_en: 'Ice Lance', description: 'Uzağa buz fırlatır.', description_en: 'Throws an ice lance.', cd: 8, manaCost: 20, type: 'damage', icon: '/models/icons/arctic_knight/icon_permafrost_lance_e.png', visual: 'arctic_shard', modelPath: '/models/skills/arctic_knight/fx_permafrost_lance.gltf' },
            { id: 'ak4', name: 'Donduran Bakış', name_en: 'Freezing Gaze', description: 'Düşmanları yavaşlatır.', description_en: 'Slows down enemies.', cd: 12, manaCost: 30, type: 'utility', icon: '/models/icons/arctic_knight/icon_frostbite_e.png', visual: 'arctic_freeze', modelPath: '/models/skills/arctic_knight/fx_frostbite.gltf' },
            { id: 'ak5', name: 'Çığ', name_en: 'Avalanche', description: 'Alana buz hasarı.', description_en: 'Area of effect ice damage.', cd: 15, manaCost: 40, type: 'damage', icon: '/models/icons/arctic_knight/icon_arctic_charge.png', visual: 'arctic_charge', modelPath: '/models/skills/arctic_knight/fx_arctic_charge.gltf' },
            { id: 'ak7', name: 'Kar Fırtınası (Ulti)', name_en: 'Blizzard (Ulti)', description: 'Geniş alan dondurucu hasar.', description_en: 'Massive freezing AoE damage.', cd: 45, manaCost: 80, type: 'ultimate', icon: '/models/icons/arctic_knight/icon_glacier_smash_e.png', visual: 'arctic_crater', modelPath: '/models/skills/arctic_knight/fx_ice_crater_big.gltf' },
        ]
    },
    gale_glaive: {
        id: 'gale_glaive',
        name: 'Fırtına Süvarisi',
        name_en: 'Gale Glaive',
        role: 'DPS / Mobile',
        role_en: 'DPS / Mobile',
        description: 'Rüzgar hızında saldıran mızrak ustası.',
        description_en: 'Spear master attacking at wind speed.',
        mechanic: 'Özellik: Hareket ettikçe saldırı hızı artar.',
        mechanic_en: 'Mechanic: Attack speed increases with movement.',
        skills: [
            { id: 'gg1', name: 'Rüzgar Delici', name_en: 'Wind Piercer', description: 'Delici mızrak saldırısı.', description_en: 'Piercing spear attack.', cd: 1.0, manaCost: 5, type: 'damage', icon: '/models/icons/gale_glaive/icon_cloudpiercer.png', visual: 'gale_thrust', modelPath: '/models/skills/gale_glaive/vfx_gale_thrust_1.gltf' },
            { id: 'gg2', name: 'Hava Akımı', name_en: 'Air Current', description: 'Hareket hızını artırır.', description_en: 'Increases movement speed.', cd: 10, manaCost: 25, type: 'buff', icon: '/models/icons/gale_glaive/icon_windbound_fury.png', visual: 'gale_dash', modelPath: '/models/skills/gale_glaive/vfx_gale_dash_1.gltf' },
            { id: 'gg3', name: 'Kasırga Dönüşü', name_en: 'Hurricane Spin', description: 'Etrafındaki düşmanlara hasar.', description_en: 'Damage to surrounding enemies.', cd: 12, manaCost: 35, type: 'damage', icon: '/models/icons/gale_glaive/icon_dancing_blade.png', visual: 'gale_whirlwind', modelPath: '/models/skills/gale_glaive/vfx_gale_spin.gltf' },
            { id: 'gg4', name: 'Gökten İniş', name_en: 'Skyfall', description: 'Havadan yere çarpar.', description_en: 'Crashes down from the sky.', cd: 15, manaCost: 40, type: 'damage', icon: '/models/icons/gale_glaive/icon_vault.png', visual: 'gale_vault', modelPath: '/models/skills/gale_glaive/vfx_gale_vault_1.gltf' },
            { id: 'gg5', name: 'Rüzgar Duvarı', name_en: 'Wind Wall', description: 'Gelen hasarı azaltır.', description_en: 'Reduces incoming damage.', cd: 20, manaCost: 30, type: 'buff', icon: '/models/icons/gale_glaive/icon_windrune_blade.png', visual: 'gale_tornado', modelPath: '/models/skills/gale_glaive/vfx_gale_tornado.gltf' },
            { id: 'gg7', name: 'Fırtına Öfkesi (Ulti)', name_en: 'Storm Fury (Ulti)', description: 'Seri mızrak darbeleri.', description_en: 'Rapid spear strikes.', cd: 40, manaCost: 70, type: 'ultimate', icon: '/models/icons/gale_glaive/icon_torrent.png', visual: 'gale_slash', modelPath: '/models/skills/gale_glaive/vfx_gale_slash_1.gltf' },
        ]
    },
    archer: {
        id: 'archer',
        name: 'Usta Okçu',
        name_en: 'Master Archer',
        role: 'Ranged / DPS',
        role_en: 'Ranged / DPS',
        description: 'Keskin nişancı ve stratejist.',
        description_en: 'Sharpshooter and strategist.',
        mechanic: 'Özellik: Kritik vuruş şansı yüksektir.',
        mechanic_en: 'Mechanic: High critical hit chance.',
        skills: [
            { id: 'ar1', name: 'Hızlı Atış', name_en: 'Quick Shot', description: 'Seri bir ok atışı.', description_en: 'A rapid arrow shot.', cd: 1.5, manaCost: 10, type: 'damage', icon: '/models/icons/archer/icon_quick_shot.png', visual: 'archer_shot', modelPath: '/models/skills/archer/quick_shot.gltf' },
            { id: 'ar2', name: 'Ölümcül Cirit', name_en: 'Deadly Javelin', description: 'Yüksek hasarlı delici atış.', description_en: 'High damage piercing shot.', cd: 8, manaCost: 30, type: 'damage', icon: '/models/icons/archer/icon_deadly_javelin.png', visual: 'javelin', modelPath: '/models/skills/archer/javelin.gltf' },
            { id: 'ar3', name: 'Avcı Odağı', name_en: 'Hunters Focus', description: 'Kritik şansını artırır.', description_en: 'Increases critical chance.', cd: 20, manaCost: 40, type: 'buff', icon: '/models/icons/archer/icon_hunters_focus.png', visual: 'hunters_focus', modelPath: '/models/skills/archer/hunters_focus_1.gltf' },
            { id: 'ar4', name: 'Rüzgar Kesiği', name_en: 'Wind Razor', description: 'Rüzgar hızıyla düşmanları keser.', description_en: 'Cuts enemies with wind speed.', cd: 12, manaCost: 35, type: 'damage', icon: '/models/icons/archer/icon_windrazor.png', visual: 'archer_volley', modelPath: '/models/skills/archer/archer_bow.gltf' },
            { id: 'ar5', name: 'Geri Adım', name_en: 'Backstep', description: 'Geriye doğru hızlıca kaç.', description_en: 'Quickly dash backwards.', cd: 15, manaCost: 20, type: 'utility', icon: '/models/icons/archer/icon_backstep.png', visual: 'backstep', modelPath: '/models/skills/archer/backstep_1.gltf' },
            { id: 'ar6', name: 'Ejder Oku (Ulti)', name_en: 'Dragon Arrow (Ulti)', description: 'Ejderha gücüyle her şeyi deler.', description_en: 'Pierces everything with dragon power.', cd: 50, manaCost: 90, type: 'ultimate', icon: '/models/icons/archer/icon_dragon_piercer.png', visual: 'dragon_arrow', modelPath: '/models/skills/archer/dragon_arrow.gltf' },
        ]
    },
    archmage: {
        id: 'archmage',
        name: 'Ulu Büyücü',
        name_en: 'Grand Archmage',
        role: 'Burst / AoE',
        role_en: 'Burst / AoE',
        description: 'Kadim büyülerin efendisi.',
        description_en: 'Master of ancient spells.',
        mechanic: 'Özellik: Mana havuzu çok geniştir.',
        mechanic_en: 'Mechanic: Huge mana pool.',
        skills: [
            { id: 'am1', name: 'Arcane Küresi', name_en: 'Arcane Orb', description: 'Saf büyü hasarı.', description_en: 'deals pure magic damage.', cd: 1.0, manaCost: 15, type: 'damage', icon: '/models/icons/archmage/icon_arcane_slash.png', visual: 'archmage_bolt', modelPath: '/models/skills/archmage/arcane_magic_circle.gltf' },
            { id: 'am2', name: 'Zaman Bükülmesi', name_en: 'Time Warp', description: 'Cooldownları azaltır.', description_en: 'Reduces cooldowns.', cd: 30, manaCost: 50, type: 'buff', icon: '/models/icons/archmage/icon_cloak_of_hastur_e.png', visual: 'archmage_impact', modelPath: '/models/skills/archmage/hastur.gltf' },
            { id: 'am3', name: 'Polimorf', name_en: 'Polymorph', description: 'Düşmanı zararsız yapar.', description_en: 'Renders enemy harmless.', cd: 20, manaCost: 40, type: 'utility', icon: '/models/icons/archmage/icon_arcane_shield.png', visual: 'archmage_void', modelPath: '/models/skills/archmage/void_chains.gltf' },
            { id: 'am5', name: 'Yıldız Yağmuru', name_en: 'Starfall', description: 'Kozmik hasar.', description_en: 'Deals cosmic damage.', cd: 15, manaCost: 60, type: 'damage', icon: '/models/icons/archmage/icon_meteor_storm_e.png', visual: 'archmage_meteor', modelPath: '/models/skills/archmage/meteor_storm_meteor.gltf' },
            { id: 'am6', name: 'Mana Patlaması', name_en: 'Mana Burst', description: 'Alana ani hasar.', description_en: 'Burst AoE damage.', cd: 12, manaCost: 45, type: 'damage', icon: '/models/icons/archmage/icon_blizzard.png', visual: 'archmage_blizzard', modelPath: '/models/skills/archmage/ice_shard.gltf' },
            { id: 'am7', name: 'Kıyamet (Ulti)', name_en: 'Apocalypse (Ulti)', description: 'Tüm elementlerin birleşimi.', description_en: 'Combination of all elements.', cd: 60, manaCost: 120, type: 'ultimate', icon: '/models/icons/archmage/icon_arcane_devastation.png', visual: 'archmage_apocalypse', modelPath: '/models/skills/archmage/meteor_storm_magic_circle.gltf' },
        ]
    },
    bard: {
        id: 'bard',
        name: 'Ozan',
        name_en: 'Bard',
        role: 'Support / Buff',
        role_en: 'Support / Buff',
        description: 'Müziğiyle dostlarını güçlendirir.',
        description_en: 'Empowers allies with music.',
        mechanic: 'Özellik: Şarkılarla pasif aura sağlar.',
        mechanic_en: 'Mechanic: Songs provide passive auras.',
        skills: [
            { id: 'bd1', name: 'Nota Vuruşu', name_en: 'Note Strike', description: 'Ses dalgası hasarı.', description_en: 'Sound wave damage.', cd: 1.0, manaCost: 5, type: 'damage', icon: '/models/icons/bard/icon_vibrative_strike_e.png', visual: 'bard_note', modelPath: '/models/skills/bard/strings.gltf' },
            { id: 'bd2', name: 'Cesaret Marşı', name_en: 'Anthem of Courage', description: 'Takımın hasarını artırır.', description_en: 'Increases team damage.', cd: 15, manaCost: 30, type: 'buff', icon: '/models/icons/bard/icon_sound_wave_e.png', visual: 'bard_vibration', modelPath: '/models/skills/bard/blue_bird.gltf' },
            { id: 'bd3', name: 'Huzur Melodisi', name_en: 'Melody of Peace', description: 'Takımı iyileştirir.', description_en: 'Heals the team.', cd: 20, manaCost: 40, type: 'heal', icon: '/models/icons/bard/icon_angelic_serenade.png', visual: 'bard_light', modelPath: '/models/skills/bard/healing_aura.gltf' },
            { id: 'bd4', name: 'Uyku Ninnisi', name_en: 'Lullaby', description: 'Düşmanları uyutur (sersemletir).', description_en: 'Puts enemies to sleep (stun).', cd: 25, manaCost: 35, type: 'utility', icon: '/models/icons/bard/icon_shield_of_harmony_e.png', visual: 'bard_note', modelPath: '/models/skills/bard/black_strings.gltf' },
            { id: 'bd5', name: 'Hız Rapsodisi', name_en: 'Rhapsody of Speed', description: 'Hareket hızını artırır.', description_en: 'Increases movement speed.', cd: 18, manaCost: 30, type: 'buff', icon: '/models/icons/bard/icon_rhapsody_e.png', visual: 'bard_vibration', modelPath: '/models/skills/bard/cupid.gltf' },
            { id: 'bd7', name: 'Destansı Final (Ulti)', name_en: 'Epic Finale (Ulti)', description: 'Tüm takıma devasa buff.', description_en: 'Massive buff to the team.', cd: 60, manaCost: 100, type: 'ultimate', icon: '/models/icons/bard/icon_symphony_of_destruction_e.png', visual: 'bard_explosion', modelPath: '/models/skills/bard/ult_strings_1.gltf' },
        ]
    },
    cleric: {
        id: 'cleric',
        name: 'Işık Rahibi',
        name_en: 'Light Cleric',
        role: 'Healer / Tank',
        role_en: 'Healer / Tank',
        description: 'Kutsal ışığın sadık hizmetkarı.',
        description_en: 'Faithful servant of the holy light.',
        mechanic: 'Özellik: İyileştirme gücü yüksektir.',
        mechanic_en: 'Mechanic: High healing power.',
        skills: [
            { id: 'cl1', name: 'Kutsal Işık', name_en: 'Holy Light', description: 'Işık hasarı.', description_en: 'Holy light damage.', cd: 1.0, manaCost: 5, type: 'damage', icon: '/models/icons/cleric/icon_divine_punishment_e.png', visual: 'cleric_impact', modelPath: '/models/skills/cleric/divine_cross.gltf' },
            { id: 'cl2', name: 'Büyük Şifa', name_en: 'Greater Heal', description: 'Tekli güçlü iyileştirme.', description_en: 'Strong single target heal.', cd: 8, manaCost: 30, type: 'heal', icon: '/models/icons/cleric/icon_blessing_of_the_white_lantern.png', visual: 'cleric_immolation', modelPath: '/models/skills/cleric/holy_lantern.gltf' },
            { id: 'cl3', name: 'Kutsama', name_en: 'Blessing', description: 'Tüm statları artırır.', description_en: 'Increases all stats.', cd: 30, manaCost: 50, type: 'buff', icon: '/models/icons/cleric/icon_luminous_wave_e.png', visual: 'cleric_wave', modelPath: '/models/skills/cleric/god_embodiment.gltf' },
            { id: 'cl4', name: 'Işık Patlaması', name_en: 'Light Burst', description: 'Çevredeki düşmanları kör eder.', description_en: 'Blinds nearby enemies.', cd: 15, manaCost: 30, type: 'utility', icon: '/models/icons/cleric/icon_divine_immolation_e.png', visual: 'cleric_impact', modelPath: '/models/skills/cleric/divine_cross.gltf' },
            { id: 'cl5', name: 'Diriltme (Pasif)', name_en: 'Resurrection (Passive)', description: 'Ölümcül darbeden korur (Cooldown).', description_en: 'Protects from fatal blow (Cooldown).', cd: 120, manaCost: 0, type: 'utility', icon: '/models/icons/cleric/icon_dawnbringer_angel.png', visual: 'cleric_tear', modelPath: '/models/skills/cleric/dawnbringer_angel.gltf' },
            { id: 'cl7', name: 'Tanrısal Müdahale (Ulti)', name_en: 'Divine Intervention (Ulti)', description: 'Tüm takımı tamamen iyileştirir.', description_en: 'Fully heals the entire team.', cd: 90, manaCost: 100, type: 'ultimate', icon: '/models/icons/cleric/icon_divine_cross_e.png', visual: 'cleric_tear', modelPath: '/models/skills/cleric/tear_of_god.gltf' },
        ]
    },
    martial_artist: {
        id: 'martial_artist',
        name: 'Dövüş Ustası',
        name_en: 'Martial Artist',
        role: 'Melee / DPS',
        role_en: 'Melee / DPS',
        description: 'Yumruk ve tekmeleri ölümcüldür.',
        description_en: 'Punches and kicks are deadly.',
        mechanic: 'Özellik: Kombo yaptıkça hasar artar.',
        mechanic_en: 'Mechanic: Damage increases with combos.',
        skills: [
            { id: 'ma1', name: 'Seri Yumruk', name_en: 'Rapid Punch', description: 'Hızlı darbeler.', description_en: 'Rapid strikes.', cd: 0.8, manaCost: 5, type: 'damage', icon: '/models/icons/martial_artist/icon_agile_strike.png', visual: 'martial_hit', modelPath: '/models/skills/martial_artist/basic_strike_1.json' },
            { id: 'ma2', name: 'Ejderha Tekmesi', name_en: 'Dragon Kick', description: 'Düşmanı uçurur.', description_en: 'Knocks the enemy up.', cd: 10, manaCost: 20, type: 'damage', icon: '/models/icons/martial_artist/icon_uppercut_e.png', visual: 'martial_uppercut', modelPath: '/models/skills/martial_artist/uppercut_1.json' },
            { id: 'ma3', name: 'Meditasyon', name_en: 'Meditation', description: 'Can ve mana yeniler.', description_en: 'Restores health and mana.', cd: 30, manaCost: 0, type: 'heal', icon: '/models/icons/martial_artist/icon_evasion_e.png', visual: 'martial_evasion', modelPath: '/models/skills/martial_artist/evasion_1.json' },
            { id: 'ma4', name: 'Kaplan Duruşu', name_en: 'Tiger Stance', description: 'Saldırı gücünü artırır.', description_en: 'Increases attack power.', cd: 20, manaCost: 30, type: 'buff', icon: '/models/icons/martial_artist/icon_double_strike_e.png', visual: 'martial_multi', modelPath: '/models/skills/martial_artist/multi_strike_1.json' },
            { id: 'ma5', name: 'Turna Kanadı', name_en: 'Crane Wing', description: 'Geniş alan süpürme.', description_en: 'Wide area sweep.', cd: 12, manaCost: 25, type: 'damage', icon: '/models/icons/martial_artist/icon_deadly_squash_e.png', visual: 'martial_slash', modelPath: '/models/skills/martial_artist/deadly_squash.json' },
            { id: 'ma7', name: 'Yedi Yıldız (Ulti)', name_en: 'Seven Stars (Ulti)', description: 'Gözle görülmeyen hızda vuruşlar.', description_en: 'Strikes at invisible speeds.', cd: 50, manaCost: 80, type: 'ultimate', icon: '/models/icons/martial_artist/icon_multi_strike_e.png', visual: 'martial_multi', modelPath: '/models/skills/martial_artist/multi_strike_1.json' },
        ]
    },
    monk: {
        id: 'monk',
        name: 'Ruhban',
        name_en: 'Monk',
        role: 'Hybrid / Support',
        role_en: 'Hybrid / Support',
        description: 'Ruhsal ve fiziksel denge.',
        description_en: 'Spiritual and physical balance.',
        mechanic: 'Özellik: Hasar verirken takımı iyileştirebilir.',
        mechanic_en: 'Mechanic: Can heal allies while dealing damage.',
        skills: [
            { id: 'mk1', name: 'Asa Vuruşu', name_en: 'Staff Strike', description: 'Silah hasarı.', description_en: 'Weapon damage.', cd: 1.0, manaCost: 5, type: 'damage', icon: '/models/icons/monk/icon_counterstrike_e.png', visual: 'monk_punch', modelPath: '/models/skills/monk/vfx_monk_impact_1.gltf' },
            { id: 'mk2', name: 'Mantra', name_en: 'Mantra', description: 'Koruyucu kalkan.', description_en: 'Protective shield.', cd: 15, manaCost: 30, type: 'buff', icon: '/models/icons/monk/icon_beads_of_karma.png', visual: 'monk_meditation', modelPath: '/models/skills/monk/vfx_meditation_beads.gltf' },
            { id: 'mk3', name: 'Ruh Darbesi', name_en: 'Soul Strike', description: 'Ruhsal hasar verir.', description_en: 'Deals spiritual damage.', cd: 8, manaCost: 20, type: 'damage', icon: '/models/icons/monk/icon_chi_blast_e.png', visual: 'monk_blast', modelPath: '/models/skills/monk/vfx_chi_blast.gltf' },
            { id: 'mk4', name: 'Huzur', name_en: 'Serenity', description: 'Düşranları sakinleştirir.', description_en: 'Calms enemies down.', cd: 20, manaCost: 30, type: 'utility', icon: '/models/icons/monk/icon_focus_chi_e.png', visual: 'monk_heal', modelPath: '/models/skills/monk/vfx_chi_heal.gltf' },
            { id: 'mk5', name: 'Bin El', name_en: 'Thousand Hands', description: 'Seri vuruşlar.', description_en: 'Rapid strikes.', cd: 12, manaCost: 40, type: 'damage', icon: '/models/icons/monk/icon_swift_strikes_e.png', visual: 'monk_punch', modelPath: '/models/skills/monk/vfx_swift_strikes_1.gltf' },
            { id: 'mk7', name: 'Nirvana (Ulti)', name_en: 'Nirvana (Ulti)', description: 'Kısa süre ölümsüzlük ve güç.', description_en: 'Short invulnerability and power.', cd: 80, manaCost: 100, type: 'ultimate', icon: '/models/icons/monk/icon_dragon_fists_e.png', visual: 'monk_palm', modelPath: '/models/skills/monk/vfx_monk_dragon_fists.gltf' },
        ]
    },
    reaper: {
        id: 'reaper',
        name: 'Ölüm Meleği',
        name_en: 'Grim Reaper',
        role: 'DPS / Drain',
        role_en: 'DPS / Drain',
        description: 'Ruhları biçen karanlık savaşçı.',
        description_en: 'Dark warrior reaping souls.',
        mechanic: 'Özellik: Öldürdükçe can yeniler.',
        mechanic_en: 'Mechanic: Regenerates health on kills.',
        skills: [
            { id: 'rp1', name: 'Tırpan', name_en: 'Scythe Slash', description: 'Geniş biçme hareketi.', description_en: 'Wide slashing movement.', cd: 1.2, manaCost: 10, type: 'damage', icon: '/models/icons/reaper/icon_soul_scythe_e.png', visual: 'reaper_slice', modelPath: '/models/skills/reaper/death_slice_1.json' },
            { id: 'rp2', name: 'Ölüm Dokunuşu', name_en: 'Death Touch', description: 'Zamanla hasar verir.', description_en: 'Deals damage over time.', cd: 10, manaCost: 20, type: 'damage', icon: '/models/icons/reaper/icon_reaping_claw.png', visual: 'reaper_soul_slice', modelPath: '/models/skills/reaper/soul_slice_1.json' },
            { id: 'rp3', name: 'Ruh Hasadı', name_en: 'Soul Harvest', description: 'Düşmandan can çalar.', description_en: 'Steals health from enemy.', cd: 12, manaCost: 30, type: 'heal', icon: '/models/icons/reaper/icon_soul_slice_e.png', visual: 'reaper_wave', modelPath: '/models/skills/reaper/soul_wave_1.json' },
            { id: 'rp4', name: 'Karanlık Geçit', name_en: 'Dark Passage', description: 'Gölgelerin içinden geçer.', description_en: 'Passes through shadows.', cd: 15, manaCost: 25, type: 'utility', icon: '/models/icons/reaper/icon_surge_e.png', visual: 'reaper_spin', modelPath: '/models/skills/reaper/death_spin.json' },
            { id: 'rp5', name: 'Korku', name_en: 'Fear', description: 'Düşmanları kaçırır.', description_en: 'Scares enemies away.', cd: 20, manaCost: 40, type: 'utility', icon: '/models/icons/reaper/icon_soul_collector_e.png', visual: 'reaper_cross', modelPath: '/models/skills/reaper/soul_cross_1.json' },
            { id: 'rp7', name: 'Kıyamet Çağrısı (Ulti)', name_en: 'Call of Apocalypse (Ulti)', description: 'Tüm ruhları serbest bırakır.', description_en: 'Releases all souls.', cd: 60, manaCost: 100, type: 'ultimate', icon: '/models/icons/reaper/icon_death_spin.png', visual: 'reaper_spin', modelPath: '/models/skills/reaper/soul_spin.json' },
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
        { id: 'start_w_1', name: 'Eski Kılıç', tier: 1, type: 'weapon', rarity: 'common', classReq: 'warrior', visuals: { model: '/models/items/weapons/warrior/warrior_sword_shiny.gltf', primaryColor: '#94a3b8' } },
        { id: 'start_w_2', name: 'Eski Pantolon', tier: 1, type: 'pants', rarity: 'common', classReq: 'warrior' },
        { id: 'start_w_3', name: 'Paslı Zırh', tier: 1, type: 'armor', rarity: 'common', classReq: 'warrior' }
    ],
    arctic_knight: [
        { id: 'start_ak_1', name: 'Buz Mızrağı', tier: 1, type: 'weapon', rarity: 'common', classReq: 'arctic_knight', visuals: { model: '/models/items/weapons/arctic_knight/frigid_lance_arctic_knight.gltf', primaryColor: '#38bdf8' } },
        { id: 'start_ak_2', name: 'Buz Zırhı', tier: 1, type: 'armor', rarity: 'common', classReq: 'arctic_knight' }
    ],
    gale_glaive: [
        { id: 'start_gg_1', name: 'Rüzgar Mızrağı', tier: 1, type: 'weapon', rarity: 'common', classReq: 'gale_glaive', visuals: { model: '/models/items/weapons/gale_glaive/gale_glaive_windreaver_ancient.gltf', primaryColor: '#14b8a6' } },
        { id: 'start_gg_2', name: 'Hafif Zırh', tier: 1, type: 'armor', rarity: 'common', classReq: 'gale_glaive' }
    ],
    archer: [
        { id: 'start_ar_1', name: 'Avcı Yayı', tier: 1, type: 'weapon', rarity: 'common', classReq: 'archer', visuals: { model: '/models/items/weapons/archer/archer_bow_shiny.gltf', primaryColor: '#a3e635' } },
        { id: 'start_ar_2', name: 'Deri Zırh', tier: 1, type: 'armor', rarity: 'common', classReq: 'archer' }
    ],
    archmage: [
        { id: 'start_am_1', name: 'Büyücü Asası', tier: 1, type: 'weapon', rarity: 'common', classReq: 'archmage', visuals: { model: '/models/items/weapons/archmage/archmage_staff_shiny.gltf', primaryColor: '#8b5cf6' } },
        { id: 'start_am_2', name: 'Cübbe', tier: 1, type: 'armor', rarity: 'common', classReq: 'archmage' }
    ],
    bard: [
        { id: 'start_bd_1', name: 'Lir', tier: 1, type: 'weapon', rarity: 'common', classReq: 'bard', visuals: { model: '/models/items/weapons/bard/bard_harp_shiny.gltf', primaryColor: '#fde047' } },
        { id: 'start_bd_2', name: 'Ozan Kıyafeti', tier: 1, type: 'armor', rarity: 'common', classReq: 'bard' }
    ],
    cleric: [
        { id: 'start_cl_1', name: 'Kutsal Topuz', tier: 1, type: 'weapon', rarity: 'common', classReq: 'cleric', visuals: { model: '/models/items/weapons/cleric/cleric_mace_shiny.gltf', primaryColor: '#facc15' } },
        { id: 'start_cl_2', name: 'Rahip Cübbesi', tier: 1, type: 'armor', rarity: 'common', classReq: 'cleric' }
    ],
    martial_artist: [
        { id: 'start_ma_1', name: 'Dövüş Eldiveni', tier: 1, type: 'weapon', rarity: 'common', classReq: 'martial_artist', visuals: { model: '/models/items/weapons/martial_artist/martial_artist_gauntlet.gltf', primaryColor: '#fca5a5' } },
        { id: 'start_ma_2', name: 'Dövüşçü Giysisi', tier: 1, type: 'armor', rarity: 'common', classReq: 'martial_artist' }
    ],
    monk: [
        { id: 'start_mk_1', name: 'Keşiş Eldiveni', tier: 1, type: 'weapon', rarity: 'common', classReq: 'monk', visuals: { model: '/models/items/weapons/monk/monk_gauntlet_shiny.gltf', primaryColor: '#fbbf24' } },
        { id: 'start_mk_2', name: 'Keşiş Cübbesi', tier: 1, type: 'armor', rarity: 'common', classReq: 'monk' }
    ],
    reaper: [
        { id: 'start_rp_1', name: 'Ölüm Tırpanı', tier: 1, type: 'weapon', rarity: 'common', classReq: 'reaper', visuals: { model: '/models/items/weapons/reaper/scythe_reaper_shiny.gltf', primaryColor: '#1e293b' } },
        { id: 'start_rp_2', name: 'Karanlık Zırh', tier: 1, type: 'armor', rarity: 'common', classReq: 'reaper' }
    ]
};

export const INITIAL_INVENTORY: Item[] = [
    { id: 'item_1', name: 'Paslı Kılıç', tier: 1, type: 'weapon', rarity: 'common' },
    { id: 'item_2', name: 'Deri Zırh', tier: 1, type: 'armor', rarity: 'common' },
    { id: 'item_head', name: 'Deri Miğfer', tier: 1, type: 'helmet', rarity: 'common' },
    { id: 'item_pants', name: 'Deri Pantolon', tier: 1, type: 'pants', rarity: 'common' },
    { id: 'item_3', name: 'Ekmek', tier: 1, type: 'consumable', rarity: 'common', value: 50 },
];

// POTIONS moved to end of file with full tier system

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
    { id: 1, title: 'Acemi Savaşçı', minRP: 0, bonusDamage: 0, bonusShield: 0, icon: '🌱', image: '/ranks/acemi_uzay_pilotu.png', limitType: 'percent', limitValue: 20.0, order: 21 },
    { id: 2, title: 'Gezgin', minRP: 500, bonusDamage: 0, bonusShield: 0, icon: '👟', image: '/ranks/uzay_pilotu.png', limitType: 'percent', limitValue: 12.39, order: 20 },
    { id: 3, title: 'Kadim Gezgin', minRP: 1000, bonusDamage: 1, bonusShield: 1, icon: '🌿', image: '/ranks/acemi_pilot.png', limitType: 'percent', limitValue: 10.0, order: 19 },
    { id: 4, title: 'Kıdemli Gezgin', minRP: 2500, bonusDamage: 2, bonusShield: 1, icon: '✈️', image: '/ranks/acemi_cavus.png', limitType: 'percent', limitValue: 9.0, order: 18 },
    { id: 5, title: 'Acemi Milis', minRP: 5000, bonusDamage: 3, bonusShield: 1, icon: '⚔️', image: '/ranks/cavus.png', limitType: 'percent', limitValue: 8.0, order: 17 },
    { id: 6, title: 'Kıdemli Nefer', minRP: 7500, bonusDamage: 4, bonusShield: 2, icon: '🛡️', image: '/ranks/uzman_cavus.png', limitType: 'percent', limitValue: 7.0, order: 16 },
    { id: 7, title: 'Uzman Milis', minRP: 10000, bonusDamage: 5, bonusShield: 2, icon: '🎖️', image: '/ranks/astegmen.png', limitType: 'percent', limitValue: 6.0, order: 15 },
    { id: 8, title: 'Aday Muhafız', minRP: 25000, bonusDamage: 6, bonusShield: 3, icon: '🥉', image: '/ranks/tegmen.png', limitType: 'percent', limitValue: 5.0, order: 14 },
    { id: 9, title: 'Gezgin Savaşçı', minRP: 50000, bonusDamage: 7, bonusShield: 3, icon: '🥈', image: '/ranks/ustegmen.png', limitType: 'percent', limitValue: 4.5, order: 13 },
    { id: 10, title: 'Karakol Teğmeni', minRP: 100000, bonusDamage: 8, bonusShield: 4, icon: '🥇', image: '/ranks/acemi_yuzbasi.png', limitType: 'percent', limitValue: 4.0, order: 12 },
    { id: 11, title: 'Sınır Bekçisi', minRP: 250000, bonusDamage: 9, bonusShield: 4, icon: '🏰', image: '/ranks/yuzbasi.png', limitType: 'percent', limitValue: 3.5, order: 11 },
    { id: 12, title: 'Kıdemli Akıncı', minRP: 500000, bonusDamage: 10, bonusShield: 5, icon: '🏇', image: '/ranks/uzman_yuzbasi.png', limitType: 'percent', limitValue: 3.0, order: 10 },
    { id: 13, title: 'Uzman Savaşçı', minRP: 750000, bonusDamage: 12, bonusShield: 5, icon: '⚔️⭐', image: '/ranks/acemi_binbasi.png', limitType: 'percent', limitValue: 2.5, order: 9 },
    { id: 14, title: 'Öncü Birliği Lideri', minRP: 1000000, bonusDamage: 15, bonusShield: 6, icon: '🚩', image: '/ranks/binbasi.png', limitType: 'percent', limitValue: 2.0, order: 8 },
    { id: 15, title: 'Bölük Komutanı', minRP: 1500000, bonusDamage: 18, bonusShield: 7, icon: '🏵️', image: '/ranks/kurmay_binbasi.png', limitType: 'percent', limitValue: 1.5, order: 7 },
    { id: 16, title: 'Kıdemli Muhafız', minRP: 2500000, bonusDamage: 20, bonusShield: 8, icon: '🛡️⭐', image: '/ranks/acemi_albay.png', limitType: 'percent', limitValue: 1.0, order: 6 },
    { id: 17, title: 'Seçkin Şövalye', minRP: 5000000, bonusDamage: 25, bonusShield: 10, icon: '⚜️', image: '/ranks/albay.png', limitType: 'count', limitValue: 20, order: 5 },
    { id: 18, title: 'Savaş Lordu', minRP: 10000000, bonusDamage: 30, bonusShield: 12, icon: '👹', image: '/ranks/kurmay_albay.png', limitType: 'count', limitValue: 5, order: 4 },
    { id: 19, title: 'Kurmay Komutan', minRP: 20000000, bonusDamage: 35, bonusShield: 15, icon: '👑', image: '/ranks/tumgeneral.png', limitType: 'count', limitValue: 3, order: 3 },
    { id: 20, title: 'Kadim General', minRP: 50000000, bonusDamage: 40, bonusShield: 20, icon: '🌟', image: '/ranks/general.png', limitType: 'count', limitValue: 2, order: 2 },
    { id: 21, title: 'Yüce Hükümdar', minRP: 100000000, bonusDamage: 50, bonusShield: 25, icon: '👑🔥', image: '/ranks/orgeneral.png', limitType: 'count', limitValue: 1, order: 1 },
];

export const ZONE_CONFIG: Record<number, { name: string, bg: string, factionOwner?: Faction, minLevel: number, isSafeZone?: boolean, enemies: Partial<GameEntity>[], npcs: Partial<GameEntity>[], portals: Portal[] }> = {
    // --- MARSU (ATEŞ) LOW LEVEL 1-1 TO 1-4 ---
    11: {
        name: 'Kül Vadisi (1-1)', bg: '#450a0a', factionOwner: 'marsu', isSafeZone: true, minLevel: 1, // X-1
        enemies: [{ name: 'Ateş Papağanı', level: 1, hp: 200 }],
        npcs: [
            { type: 'npc', npcType: 'quest_giver', name: 'Görev Ustası Kemal', level: 0, hp: 999, maxHp: 999, isHostile: false, x: 30, y: 10, color: '#fbbf24', modelPath: '/models/npcs/plugins/ModelEngine/blueprints/lr_paladin.gltf' },
            { type: 'npc', npcType: 'guild_master', name: 'Lonca Ustası', level: 0, hp: 999, maxHp: 999, isHostile: false, x: -30, y: 15, color: '#3b82f6', modelPath: '/models/npcs/plugins/ModelEngine/blueprints/lr_acolyte.gltf' }
        ],
        portals: [{ id: 'p_11_12', x: 40, z: -40, targetZone: 12, levelReq: 1, name: 'İleri: 1-2' }] // Level 1 can access 1-2
    },
    12: {
        name: 'Yanık Topraklar (1-2)', bg: '#7f1d1d', factionOwner: 'marsu', minLevel: 1, // X-2
        enemies: [{ name: 'Kızıl Kedi', level: 3, hp: 400 }],
        npcs: [],
        portals: [
            { id: 'p_12_11', x: -40, z: 40, targetZone: 11, levelReq: 1, name: 'Geri: 1-1' },
            { id: 'p_12_13', x: 40, z: -40, targetZone: 13, levelReq: 2, name: 'İleri: 1-3' },
            { id: 'p_12_14', x: 0, z: -40, targetZone: 14, levelReq: 2, name: 'İleri: 1-4' } // Split Path
        ]
    },
    13: {
        name: 'Magma Geçidi (1-3)', bg: '#991b1b', factionOwner: 'marsu', minLevel: 2, // X-3 (Level 2 req)
        enemies: [{ name: 'Çöl Akrebi', level: 6, hp: 800 }],
        npcs: [],
        portals: [{ id: 'p_13_12', x: -40, z: 20, targetZone: 12, levelReq: 1, name: 'Geri: 1-2' }, { id: 'p_13_14', x: 20, z: -20, targetZone: 14, levelReq: 2, name: 'İleri: 1-4' }] // Level 2 for 1-4
    },
    14: {
        name: 'Ejderha Sırtı (1-4)', bg: '#b91c1c', factionOwner: 'marsu', minLevel: 2, // X-4 (Level 2 req)
        enemies: [{ name: 'Genç Ejder', level: 9, hp: 1500 }],
        npcs: [],
        portals: [
            { id: 'p_14_13', x: -40, z: 20, targetZone: 13, levelReq: 2, name: 'Geri: 1-3' },
            { id: 'p_14_41', x: 20, z: -20, targetZone: 41, levelReq: 8, name: 'ARENA KAPISI (4-1)' }
        ]
    },

    // --- MARSU HIGH LEVEL 1-5 TO 1-8 ---
    15: {
        name: 'Karanlık Mahzen (1-5)', bg: '#2f0505', factionOwner: 'marsu', minLevel: 10, enemies: [{ name: 'Karanlık Şövalye', level: 16, hp: 8000 }], npcs: [],
        portals: [
            { id: 'p_15_44', x: -40, z: 40, targetZone: 44, levelReq: 9, name: 'Geri: 4-4 SAVAŞ ALANI' }, // To Central/PvP
            { id: 'p_15_16', x: 40, z: -40, targetZone: 16, levelReq: 11, name: 'İleri: 1-6' }
        ]
    },
    16: {
        name: 'Cehennem Kapısı (1-6)', bg: '#450a0a', factionOwner: 'marsu', minLevel: 11, enemies: [{ name: 'Gardiyan Papağan', level: 20, hp: 15000 }], npcs: [],
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
        name: 'Yanardağ Çekirdeği (1-8)', bg: '#000000', factionOwner: 'marsu', minLevel: 12, enemies: [{ name: '[BOSS] Ateş Ejderi (Parrot Boss)', level: 30, hp: 500000 }], npcs: [],
        portals: [
            { id: 'p_18_17', x: 0, z: 40, targetZone: 17, levelReq: 11, name: 'Geri: 1-7' }
        ]
    },


    // --- TERYA (SU) LOW LEVEL 2-1 TO 2-4 ---
    21: {
        name: 'Kristal Nehir (2-1)', bg: '#172554', factionOwner: 'terya', isSafeZone: true, minLevel: 1,
        enemies: [{ name: 'Su Aksolotlu', level: 1, hp: 200 }],
        npcs: [
            { type: 'npc', npcType: 'quest_giver', name: 'Görev Ustası Su', level: 0, hp: 999, maxHp: 999, isHostile: false, x: 25, y: -20, color: '#3b82f6', modelPath: '/models/npcs/plugins/ModelEngine/blueprints/lr_fortuneteller.gltf' },
            { type: 'npc', npcType: 'guild_master', name: 'Lonca Ustası Dalga', level: 0, hp: 999, maxHp: 999, isHostile: false, x: -25, y: -15, color: '#06b6d4', modelPath: '/models/npcs/plugins/ModelEngine/blueprints/lr_acolyte.gltf' }
        ],
        portals: [{ id: 'p_21_22', x: 40, z: -40, targetZone: 22, levelReq: 1, name: 'İleri: 2-2' }]
    },
    22: { name: 'Buzul Mağarası (2-2)', bg: '#1e3a8a', factionOwner: 'terya', minLevel: 1, enemies: [{ name: 'Buz Kedisi', level: 3, hp: 400 }], npcs: [], portals: [{ id: 'p_22_21', x: -40, z: 40, targetZone: 21, levelReq: 1, name: 'Geri: 2-1' }, { id: 'p_22_23', x: 40, z: -40, targetZone: 23, levelReq: 2, name: 'İleri: 2-3' }, { id: 'p_22_24', x: 0, z: -40, targetZone: 24, levelReq: 2, name: 'İleri: 2-4' }] },
    23: { name: 'Derin Okyanus (2-3)', bg: '#1e40af', factionOwner: 'terya', minLevel: 2, enemies: [{ name: 'Derin Aksolotl', level: 6, hp: 800 }], npcs: [], portals: [{ id: 'p_23_22', x: -40, z: 20, targetZone: 22, levelReq: 1, name: 'Geri: 2-2' }, { id: 'p_23_24', x: 20, z: -20, targetZone: 24, levelReq: 2, name: 'İleri: 2-4' }] },
    24: {
        name: 'Atlantis (2-4)', bg: '#1d4ed8', factionOwner: 'terya', minLevel: 2, enemies: [{ name: 'Mızraklı Naga', level: 9, hp: 1500 }], npcs: [], portals: [
            { id: 'p_24_23', x: -40, z: 20, targetZone: 23, levelReq: 2, name: 'Geri: 2-3' },
            { id: 'p_24_42', x: 20, z: -20, targetZone: 42, levelReq: 8, name: 'ARENA KAPISI (4-2)' }
        ]
    },

    // --- TERYA HIGH LEVEL 2-5 TO 2-8 ---
    25: {
        name: 'Abyss (2-5)', bg: '#020617', factionOwner: 'terya', minLevel: 10, enemies: [{ name: 'Abyss Kedisi', level: 16, hp: 8000 }], npcs: [],
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
        name: 'Poseidon Tahtı (2-8)', bg: '#000000', factionOwner: 'terya', minLevel: 12, enemies: [{ name: '[BOSS] Okyanus Pengueni', level: 30, hp: 500000 }], npcs: [],
        portals: [
            { id: 'p_28_27', x: 0, z: 40, targetZone: 27, levelReq: 11, name: 'Geri: 2-7' }
        ]
    },


    // --- VENU (DOĞA) LOW LEVEL 3-1 TO 3-4 ---
    31: {
        name: 'Kadim Orman (3-1)', bg: '#14532d', factionOwner: 'venu', isSafeZone: true, minLevel: 1,
        enemies: [{ name: 'Orman Kedisi', level: 1, hp: 200 }],
        npcs: [
            { type: 'npc', npcType: 'quest_giver', name: 'Görev Ustası Yaprak', level: 0, hp: 999, maxHp: 999, isHostile: false, x: 20, y: 25, color: '#22c55e', modelPath: '/models/npcs/plugins/ModelEngine/blueprints/lr_tinkerer.gltf' },
            { type: 'npc', npcType: 'guild_master', name: 'Lonca Ustası Kök', level: 0, hp: 999, maxHp: 999, isHostile: false, x: -20, y: 20, color: '#16a34a', modelPath: '/models/npcs/plugins/ModelEngine/blueprints/lr_acolyte.gltf' }
        ],
        portals: [{ id: 'p_31_32', x: 40, z: -40, targetZone: 32, levelReq: 1, name: 'İleri: 3-2' }]
    },
    32: { name: 'Bataklık (3-2)', bg: '#166534', factionOwner: 'venu', minLevel: 1, enemies: [{ name: 'Bataklık Papağanı', level: 3, hp: 400 }], npcs: [], portals: [{ id: 'p_32_31', x: -40, z: 40, targetZone: 31, levelReq: 1, name: 'Geri: 3-1' }, { id: 'p_32_33', x: 40, z: -40, targetZone: 33, levelReq: 2, name: 'İleri: 3-3' }, { id: 'p_32_34', x: 0, z: -40, targetZone: 34, levelReq: 2, name: 'İleri: 3-4' }] },
    33: { name: 'Unutulmuş Vadi (3-3)', bg: '#15803d', factionOwner: 'venu', minLevel: 2, enemies: [{ name: 'Yabani Aksolotl', level: 6, hp: 800 }], npcs: [], portals: [{ id: 'p_33_32', x: -40, z: 20, targetZone: 32, levelReq: 1, name: 'Geri: 3-2' }, { id: 'p_33_34', x: 20, z: -20, targetZone: 34, levelReq: 2, name: 'İleri: 3-4' }] },
    34: {
        name: 'Kristal Mağara (3-4)', bg: '#16a34a', factionOwner: 'venu', minLevel: 2, enemies: [{ name: 'Kristal İskelet', level: 9, hp: 1500 }], npcs: [], portals: [
            { id: 'p_34_33', x: -40, z: 20, targetZone: 33, levelReq: 2, name: 'Geri: 3-3' },
            { id: 'p_34_43', x: 0, z: 40, targetZone: 43, levelReq: 8, name: 'ARENA KAPISI (4-3)' }
        ]
    },

    // --- VENU HIGH LEVEL 3-5 TO 3-8 ---
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
        name: 'Gaia Tapınağı (3-8)', bg: '#000000', factionOwner: 'venu', minLevel: 12, enemies: [{ name: '[BOSS] Armadillo Kral', level: 30, hp: 500000 }], npcs: [],
        portals: [
            { id: 'p_38_37', x: 0, z: 40, targetZone: 37, levelReq: 11, name: 'Geri: 3-7' }
        ]
    },

    // --- PVP GATEWAYS (TRANSIT & ARENA ACCESS) ---
    // 4-1: Marsu Gateway 
    41: {
        name: 'MARSU ARENA GİRİŞİ (4-1)', bg: '#854d0e', minLevel: 8, enemies: [{ name: 'Paralı Asker', level: 14, hp: 3000 }], npcs: [], portals: [
            { id: 'p_41_14', x: -50, z: -50, targetZone: 14, levelReq: 2, name: 'GERİ: Marsu 1-4' },
            { id: 'p_41_44', x: 50, z: 0, targetZone: 44, levelReq: 9, name: 'SAVAŞ ALANI (ARENA)' },
            // Transit
            { id: 'p_41_42', x: 0, z: 50, targetZone: 42, levelReq: 8, name: 'GEÇİŞ: TERYA (4-2)' },
            { id: 'p_41_43', x: 50, z: 50, targetZone: 43, levelReq: 8, name: 'GEÇİŞ: VENU (4-3)' }
        ]
    },

    // 4-2: Terya Gateway
    42: {
        name: 'TERYA ARENA GİRİŞİ (4-2)', bg: '#854d0e', minLevel: 8, enemies: [{ name: 'Kaçak Büyücü', level: 14, hp: 3000 }], npcs: [], portals: [
            { id: 'p_42_24', x: 50, z: -50, targetZone: 24, levelReq: 2, name: 'GERİ: Terya 2-4' },
            { id: 'p_42_44', x: -50, z: 0, targetZone: 44, levelReq: 9, name: 'SAVAŞ ALANI (ARENA)' },
            // Transit
            { id: 'p_42_41', x: 0, z: 50, targetZone: 41, levelReq: 8, name: 'GEÇİŞ: MARSU (4-1)' },
            { id: 'p_42_43', x: 50, z: 50, targetZone: 43, levelReq: 8, name: 'GEÇİŞ: VENU (4-3)' }
        ]
    },

    // 4-3: Venu Gateway
    43: {
        name: 'VENU ARENA GİRİŞİ (4-3)', bg: '#854d0e', minLevel: 8, enemies: [{ name: 'Vahşi Barbar', level: 14, hp: 3000 }], npcs: [], portals: [
            { id: 'p_43_34', x: 0, z: 50, targetZone: 34, levelReq: 2, name: 'GERİ: Venu 3-4' },
            { id: 'p_43_44', x: 0, z: -50, targetZone: 44, levelReq: 9, name: 'SAVAŞ ALANI (ARENA)' },
            // Transit
            { id: 'p_43_41', x: 50, z: 0, targetZone: 41, levelReq: 8, name: 'GEÇİŞ: MARSU (4-1)' },
            { id: 'p_43_42', x: -50, z: 0, targetZone: 42, levelReq: 8, name: 'GEÇİŞ: TERYA (4-2)' }
        ]
    },

    // 4-4: ISOLATED ARENA / WAR ZONE
    44: {
        name: 'Savaş Meydanı (4-4)', bg: '#713f12', minLevel: 9,
        enemies: [{ name: '[BOSS] Yengeç Lordu', level: 25, hp: 100000 }],
        npcs: [
            { type: 'npc', npcType: 'arena_master', name: 'Arena Ustası Kılıç', level: 0, hp: 999, maxHp: 999, isHostile: false, x: 0, y: 0, color: '#ef4444', modelPath: '/models/npcs/plugins/ModelEngine/blueprints/lr_assassin.gltf' }
        ],
        portals: [
            // Only Backwards portals to Gateways
            { id: 'p_44_41', x: -40, z: -40, targetZone: 41, levelReq: 8, name: 'ÇIKIŞ: MARSU CAPE' },
            { id: 'p_44_42', x: 40, z: -40, targetZone: 42, levelReq: 8, name: 'ÇIKIŞ: TERYA CAPE' },
            { id: 'p_44_43', x: 0, z: 40, targetZone: 43, levelReq: 8, name: 'ÇIKIŞ: VENU CAPE' },

            // High Level Access (Forwards - THE ONLY WAY)
            { id: 'p_44_15', x: -50, z: 0, targetZone: 15, levelReq: 10, name: 'MARSU ELİT (1-5)' },
            { id: 'p_44_25', x: 50, z: 0, targetZone: 25, levelReq: 10, name: 'TERYA ELİT (2-5)' },
            { id: 'p_44_35', x: 0, z: 50, targetZone: 35, levelReq: 10, name: 'VENU ELİT (3-5)' },
        ]
    },

    // 4-5: Extra High Level
    45: {
        name: 'Solucan Deliği (4-5)', bg: '#000000', minLevel: 25, enemies: [{ name: '[BOSS] Axolotl İmparator', level: 30, hp: 200000 }], npcs: [], portals: [
            { id: 'p_45_44', x: 0, z: 0, targetZone: 44, levelReq: 9, name: 'Geri: Arena' }
        ]
    }
};

export const LEVEL_XP_REQUIREMENTS: number[] = [
    0,
    0,                  // Level 1
    10000,              // Level 2 (User: 10.000)
    20000,              // Level 3 (User: 20.000)
    40000,              // Level 4 (User: 40.000)
    80000,              // Level 5 (User: 80.000)
    160000,             // Level 6 (User: 160.000)
    320000,             // Level 7 (User: 320.000)
    640000,             // Level 8 (User: 640.000)
    1280000,            // Level 9 (User: 1.280.000)
    2560000,            // Level 10 (User: 2.560.000)
    5120000,            // Level 11 (User: 5.120.000)
    10240000,           // Level 12 (User: 10.240.000)
    20480000,           // Level 13 (User: 20.480.000)
    40960000,           // Level 14 (User: 40.960.000)
    81920000,           // Level 15 (User: 81.920.000)
    163840000,          // Level 16 (User: 163.840.000)
    327680000,          // Level 17 (User: 327.680.000)
    655360000,          // Level 18 (User: 655.360.000)
    1310720000,         // Level 19 (User: 1.310.720.000)
    2621440000,         // Level 20 (User: 2.621.440.000)
    5242880000,         // Level 21 (User: 5.242.880.000)
    10485760000,        // Level 22 (User: 10.485.760.000)
    20971520000,        // Level 23 (User: 20.971.520.000)
    41943040000,        // Level 24 (User: 41.943.040.000)
    83886080000,        // Level 25 (User: 83.886.080.000)
    167772160000,       // Level 26 (User: 167.772.160.000)
    335544320000,       // Level 27 (User: 335.544.320.000)
    671088640000,       // Level 28 (User: 671.088.640.000)
    1342177280000,      // Level 29 (User: 1.342.177.280.000)
    2684354560000       // Level 30 (Max)
];

// --- DEFAULT HUD LAYOUT (OPTIMIZED FOR ALL SCREENS - RESİMDEKİ DÜZEN) ---
export const DEFAULT_HUD_LAYOUT: HUDLayout = {
    elements: {
        // Profile - Sol üst köşe (HP/MP barları ile)
        profile: { x: 3, y: 3, scale: 1, enabled: true },

        // Quest Tracker - Profilin altında sol tarafta
        quest: { x: 3, y: 15, scale: 1, enabled: true },

        // Chat - Quest'in altında sol tarafta (Genel/Parti/Klan)
        chat: { x: 3, y: 35, scale: 1, enabled: true },

        // Joystick - Sol alt köşe
        joystick: { x: 12, y: 85, scale: 1, enabled: true },

        // Map + Menu Buttons - Sağ üst köşe
        map: { x: 82, y: 3, scale: 1, enabled: true },

        // Eye Button (Free Look) - Sağ ortada, skills'in üstünde
        eye: { x: 92, y: 32, scale: 1, enabled: true },

        // HP/MP Potları - Sağ tarafta eye'ın altında
        hp_pot: { x: 92, y: 42, scale: 0.9, enabled: true },
        mp_pot: { x: 92, y: 50, scale: 0.9, enabled: true },

        // Skills Arc - Sağ tarafta yukarıdan aşağı arc şeklinde
        skill1: { x: 88, y: 38, scale: 1, enabled: true },
        skill2: { x: 84, y: 45, scale: 1, enabled: true },
        skill3: { x: 80, y: 52, scale: 1, enabled: true },
        skill4: { x: 78, y: 60, scale: 1, enabled: true },
        skill5: { x: 80, y: 68, scale: 1, enabled: true },
        skill6: { x: 84, y: 75, scale: 1, enabled: true },
        skill7: { x: 88, y: 82, scale: 1, enabled: true },

        // Attack Button - Sağ alt köşe (büyük)
        attack: { x: 90, y: 82, scale: 1.2, enabled: true },
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

// --- ARMOR SETS (T1-T5) ---
// Her tier için tam set: Kask, Zırh, Pantolon, Çizme, Kolye, Küpe
export const ARMOR_SETS: Item[] = [
    // ==================== TIER 1 (Level 1-5) - COMMON ====================
    // Kask
    { id: 'helmet_t1_leather', name: 'Deri Başlık', tier: 1, type: 'helmet', rarity: 'common', value: 50, stats: { defense: 5, hp: 20 }, description: 'Acemiler için basit koruma.' },
    // Zırh
    { id: 'armor_t1_leather', name: 'Deri Zırh', tier: 1, type: 'armor', rarity: 'common', value: 100, stats: { defense: 10, hp: 50 }, description: 'Hafif ve esnek.' },
    // Pantolon
    { id: 'pants_t1_leather', name: 'Deri Pantolon', tier: 1, type: 'pants', rarity: 'common', value: 75, stats: { defense: 7, hp: 30 }, description: 'Rahat hareket sağlar.' },
    // Çizme
    { id: 'boots_t1_leather', name: 'Deri Çizme', tier: 1, type: 'boots', rarity: 'common', value: 50, stats: { defense: 3, dexterity: 2 }, description: 'Sessiz adımlar.' },
    // Kolye
    { id: 'necklace_t1_bone', name: 'Kemik Kolye', tier: 1, type: 'necklace', rarity: 'common', value: 40, stats: { hp: 25, strength: 1 }, description: 'Avcıların tılsımı.' },
    // Küpe
    { id: 'earring_t1_copper', name: 'Bakır Küpe', tier: 1, type: 'earring', rarity: 'common', value: 30, stats: { mana: 15, intelligence: 1 }, description: 'Basit bir süs.' },

    // ==================== TIER 2 (Level 6-10) - UNCOMMON ====================
    // Kask
    { id: 'helmet_t2_iron', name: 'Demir Miğfer', tier: 2, type: 'helmet', rarity: 'uncommon', value: 200, stats: { defense: 15, hp: 50, strength: 2 }, description: 'Sert çelikten yapılmış.' },
    // Zırh
    { id: 'armor_t2_iron', name: 'Demir Zırh', tier: 2, type: 'armor', rarity: 'uncommon', value: 400, stats: { defense: 30, hp: 100, vitality: 3 }, description: 'Savaş için uygun.' },
    // Pantolon
    { id: 'pants_t2_chain', name: 'Zincir Pantolon', tier: 2, type: 'pants', rarity: 'uncommon', value: 300, stats: { defense: 20, hp: 60, dexterity: 2 }, description: 'Zincir halkalarından örülmüş.' },
    // Çizme
    { id: 'boots_t2_iron', name: 'Demir Çizme', tier: 2, type: 'boots', rarity: 'uncommon', value: 200, stats: { defense: 10, dexterity: 5, hp: 30 }, description: 'Ağır ama dayanıklı.' },
    // Kolye
    { id: 'necklace_t2_silver', name: 'Gümüş Kolye', tier: 2, type: 'necklace', rarity: 'uncommon', value: 150, stats: { hp: 60, mana: 30, intelligence: 3 }, description: 'Büyülü parıltı.' },
    // Küpe
    { id: 'earring_t2_silver', name: 'Gümüş Küpe', tier: 2, type: 'earring', rarity: 'uncommon', value: 120, stats: { mana: 40, intelligence: 4, critChance: 1 }, description: 'Zarif işçilik.' },

    // ==================== TIER 3 (Level 11-18) - RARE ====================
    // Kask
    { id: 'helmet_t3_steel', name: 'Çelik Miğfer', tier: 3, type: 'helmet', rarity: 'rare', value: 600, stats: { defense: 35, hp: 120, strength: 5, vitality: 3 }, description: 'Güçlendirilmiş çelik.' },
    // Zırh
    { id: 'armor_t3_steel', name: 'Çelik Zırh Takımı', tier: 3, type: 'armor', rarity: 'rare', value: 1200, stats: { defense: 70, hp: 250, vitality: 8, strength: 5 }, description: 'Tam vücut koruması.' },
    // Pantolon
    { id: 'pants_t3_plate', name: 'Plaka Bacaklık', tier: 3, type: 'pants', rarity: 'rare', value: 900, stats: { defense: 45, hp: 150, vitality: 5, dexterity: 3 }, description: 'Metal plakalarla güçlendirilmiş.' },
    // Çizme
    { id: 'boots_t3_steel', name: 'Çelik Çizme', tier: 3, type: 'boots', rarity: 'rare', value: 600, stats: { defense: 25, dexterity: 10, hp: 80, attackSpeed: 2 }, description: 'Hızlı ve dayanıklı.' },
    // Kolye
    { id: 'necklace_t3_gold', name: 'Altın Kolye', tier: 3, type: 'necklace', rarity: 'rare', value: 500, stats: { hp: 150, mana: 80, intelligence: 8, critDamage: 5 }, description: 'Kraliyet eseri.' },
    // Küpe
    { id: 'earring_t3_gold', name: 'Altın Küpe', tier: 3, type: 'earring', rarity: 'rare', value: 400, stats: { mana: 100, intelligence: 10, critChance: 3, critDamage: 5 }, description: 'Büyü gücünü artırır.' },

    // ==================== TIER 4 (Level 19-25) - EPIC ====================
    // Kask
    { id: 'helmet_t4_mithril', name: 'Mithril Miğfer', tier: 4, type: 'helmet', rarity: 'epic', value: 2000, stats: { defense: 70, hp: 300, strength: 12, vitality: 8, critChance: 3 }, description: 'Efsanevi metalden dövülmüş.' },
    // Zırh
    { id: 'armor_t4_mithril', name: 'Mithril Zırh', tier: 4, type: 'armor', rarity: 'epic', value: 4000, stats: { defense: 150, hp: 600, vitality: 20, strength: 15, critChance: 2 }, description: 'Neredeyse yok edilemez.' },
    // Pantolon
    { id: 'pants_t4_mithril', name: 'Mithril Bacaklık', tier: 4, type: 'pants', rarity: 'epic', value: 3000, stats: { defense: 100, hp: 400, vitality: 12, dexterity: 10, attackSpeed: 3 }, description: 'Işık gibi hafif.' },
    // Çizme
    { id: 'boots_t4_mithril', name: 'Mithril Çizme', tier: 4, type: 'boots', rarity: 'epic', value: 2000, stats: { defense: 50, dexterity: 20, hp: 200, attackSpeed: 5, critChance: 2 }, description: 'Rüzgar hızında.' },
    // Kolye
    { id: 'necklace_t4_phoenix', name: 'Anka Kolyesi', tier: 4, type: 'necklace', rarity: 'epic', value: 1800, stats: { hp: 400, mana: 200, intelligence: 18, critDamage: 15, strength: 8 }, description: 'Ölümsüz kuşun gücü.' },
    // Küpe
    { id: 'earring_t4_phoenix', name: 'Anka Küpesi', tier: 4, type: 'earring', rarity: 'epic', value: 1500, stats: { mana: 250, intelligence: 20, critChance: 8, critDamage: 12, hp: 100 }, description: 'Ateşin özü.' },

    // ==================== TIER 5 (Level 26-30) - LEGENDARY ====================
    // Kask
    { id: 'helmet_t5_dragon', name: 'Ejderha Miğferi', tier: 5, type: 'helmet', rarity: 'legendary', value: 8000, stats: { defense: 150, hp: 700, strength: 25, vitality: 20, critChance: 8, critDamage: 15 }, description: 'Ejderha pullarından yapılmış.' },
    // Zırh
    { id: 'armor_t5_dragon', name: 'Ejderha Zırhı', tier: 5, type: 'armor', rarity: 'legendary', value: 15000, stats: { defense: 300, hp: 1500, vitality: 40, strength: 35, critChance: 5, critDamage: 20 }, description: 'Kadim ejderhaların koruması.' },
    // Pantolon
    { id: 'pants_t5_dragon', name: 'Ejderha Bacaklığı', tier: 5, type: 'pants', rarity: 'legendary', value: 10000, stats: { defense: 200, hp: 900, vitality: 25, dexterity: 20, attackSpeed: 8, critChance: 5 }, description: 'Ateşe dayanıklı.' },
    // Çizme
    { id: 'boots_t5_dragon', name: 'Ejderha Çizmesi', tier: 5, type: 'boots', rarity: 'legendary', value: 8000, stats: { defense: 100, dexterity: 35, hp: 500, attackSpeed: 12, critChance: 8, critDamage: 10 }, description: 'Göklerde yürü.' },
    // Kolye
    { id: 'necklace_t5_void', name: 'Hiçlik Kolyesi', tier: 5, type: 'necklace', rarity: 'legendary', value: 7000, stats: { hp: 800, mana: 500, intelligence: 40, critDamage: 30, strength: 20, critChance: 10 }, description: 'Evrenin sırları.' },
    // Küpe
    { id: 'earring_t5_void', name: 'Hiçlik Küpesi', tier: 5, type: 'earring', rarity: 'legendary', value: 6000, stats: { mana: 600, intelligence: 45, critChance: 15, critDamage: 25, hp: 300, attackSpeed: 5 }, description: 'Karanlığın fısıltısı.' },
];

// Export all armor items for shop usage
export const ALL_ARMOR_ITEMS: Item[] = ARMOR_SETS;


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

export const ACHIEVEMENTS_LIST = [
    {
        id: 'first_blood',
        name: 'İlk Kan',
        description: 'İlk düşmanını öldür.',
        icon: 'Sword',
        category: 'combat',
        requirement: 1,
        rewardGold: 100,
        rewardExp: 50
    },
    {
        id: 'novice_hunter',
        name: 'Acemi Avcı',
        description: '10 düşman öldür.',
        icon: 'Target',
        category: 'combat',
        requirement: 10,
        rewardGold: 500,
        rewardExp: 200
    },
    {
        id: 'slayer',
        name: 'Canavar Katili',
        description: '100 düşman öldür.',
        icon: 'Skull',
        category: 'combat',
        requirement: 100,
        rewardGold: 2000,
        rewardGems: 10,
        rewardExp: 1000
    },
    {
        id: 'level_5',
        name: 'Gelecek Vaat Eden',
        description: '5. Seviyeye ulaş.',
        icon: 'Zap',
        category: 'progression',
        requirement: 5,
        rewardGold: 250,
        rewardExp: 100
    },
    {
        id: 'level_10',
        name: 'Deneyimli Savaşçı',
        description: '10. Seviyeye ulaş.',
        icon: 'Star',
        category: 'progression',
        requirement: 10,
        rewardGold: 1000,
        rewardGems: 5,
        rewardExp: 500
    },
    {
        id: 'rich',
        name: 'Tüccar',
        description: 'Envanterinde 5000 Altın biriktir.',
        icon: 'Coins',
        category: 'social',
        requirement: 5000,
        rewardExp: 500,
        rewardGems: 5
    }
];

// --- POTIONS (HP/Mana Consumables for Shop) ---
export const POTIONS: Item[] = [
    // HP Potions (Tier 1-5)
    {
        id: 'hp_pot_small',
        name: 'Küçük Can İksiri',
        type: 'consumable',
        tier: 1,
        rarity: 'common',
        value: 50,
        effect: { type: 'heal', amount: 100 },
        description: 'Anında 100 HP yeniler.'
    },
    {
        id: 'hp_pot_medium',
        name: 'Orta Can İksiri',
        type: 'consumable',
        tier: 2,
        rarity: 'uncommon',
        value: 150,
        effect: { type: 'heal', amount: 300 },
        description: 'Anında 300 HP yeniler.'
    },
    {
        id: 'hp_pot_large',
        name: 'Büyük Can İksiri',
        type: 'consumable',
        tier: 3,
        rarity: 'rare',
        value: 400,
        effect: { type: 'heal', amount: 750 },
        description: 'Anında 750 HP yeniler.'
    },
    {
        id: 'hp_pot_super',
        name: 'Süper Can İksiri',
        type: 'consumable',
        tier: 4,
        rarity: 'epic',
        value: 1000,
        effect: { type: 'heal', amount: 1500 },
        description: 'Anında 1500 HP yeniler.'
    },
    {
        id: 'hp_pot_mega',
        name: 'Mega Can İksiri',
        type: 'consumable',
        tier: 5,
        rarity: 'legendary',
        value: 2500,
        effect: { type: 'heal', amount: 3000 },
        description: 'Anında 3000 HP yeniler.'
    },

    // Mana Potions (Tier 1-5)
    {
        id: 'mana_pot_small',
        name: 'Küçük Mana İksiri',
        type: 'consumable',
        tier: 1,
        rarity: 'common',
        value: 50,
        effect: { type: 'mana', amount: 50 },
        description: 'Anında 50 MP yeniler.'
    },
    {
        id: 'mana_pot_medium',
        name: 'Orta Mana İksiri',
        type: 'consumable',
        tier: 2,
        rarity: 'uncommon',
        value: 150,
        effect: { type: 'mana', amount: 150 },
        description: 'Anında 150 MP yeniler.'
    },
    {
        id: 'mana_pot_large',
        name: 'Büyük Mana İksiri',
        type: 'consumable',
        tier: 3,
        rarity: 'rare',
        value: 400,
        effect: { type: 'mana', amount: 350 },
        description: 'Anında 350 MP yeniler.'
    },
    {
        id: 'mana_pot_super',
        name: 'Süper Mana İksiri',
        type: 'consumable',
        tier: 4,
        rarity: 'epic',
        value: 1000,
        effect: { type: 'mana', amount: 700 },
        description: 'Anında 700 MP yeniler.'
    },
    {
        id: 'mana_pot_mega',
        name: 'Mega Mana İksiri',
        type: 'consumable',
        tier: 5,
        rarity: 'legendary',
        value: 2500,
        effect: { type: 'mana', amount: 1500 },
        description: 'Anında 1500 MP yeniler.'
    },

    // Combo Potions (HP + Mana)
    {
        id: 'combo_pot_small',
        name: 'Küçük Karma İksir',
        type: 'consumable',
        tier: 2,
        rarity: 'uncommon',
        value: 80,
        effect: { type: 'combo', hpAmount: 75, manaAmount: 40 },
        description: 'Anında 75 HP ve 40 MP yeniler.'
    },
    {
        id: 'combo_pot_medium',
        name: 'Orta Karma İksir',
        type: 'consumable',
        tier: 3,
        rarity: 'rare',
        value: 250,
        effect: { type: 'combo', hpAmount: 200, manaAmount: 100 },
        description: 'Anında 200 HP ve 100 MP yeniler.'
    },
    {
        id: 'combo_pot_large',
        name: 'Büyük Karma İksir',
        type: 'consumable',
        tier: 4,
        rarity: 'epic',
        value: 700,
        effect: { type: 'combo', hpAmount: 500, manaAmount: 250 },
        description: 'Anında 500 HP ve 250 MP yeniler.'
    },

    // Special Potions
    {
        id: 'antidote',
        name: 'Panzehir',
        type: 'consumable',
        tier: 2,
        rarity: 'uncommon',
        value: 100,
        effect: { type: 'cleanse' },
        description: 'Tüm zehir ve hastalık etkilerini temizler.'
    },
    {
        id: 'exp_boost_pot',
        name: 'Tecrübe İksiri',
        type: 'consumable',
        tier: 3,
        rarity: 'rare',
        value: 500,
        effect: { type: 'buff', buffType: 'exp', amount: 50, duration: 1800 },
        description: '30 dk boyunca %50 fazla tecrübe kazanılır.'
    },
    {
        id: 'gold_boost_pot',
        name: 'Servet İksiri',
        type: 'consumable',
        tier: 3,
        rarity: 'rare',
        value: 500,
        effect: { type: 'buff', buffType: 'gold', amount: 50, duration: 1800 },
        description: '30 dk boyunca %50 fazla altın kazanılır.'
    },
];

