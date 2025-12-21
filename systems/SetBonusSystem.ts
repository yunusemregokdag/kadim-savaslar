// ============================================
// SET BONUS SİSTEMİ
// ============================================

export interface SetBonus {
    piecesRequired: number;
    name: string;
    description: string;
    stats: SetBonusStats;
}

export interface SetBonusStats {
    attack?: number;
    defense?: number;
    hp?: number;
    mana?: number;
    critChance?: number;
    critDamage?: number;
    attackSpeed?: number;
    moveSpeed?: number;
    manaRegen?: number;
    hpRegen?: number;
    elementalDamage?: { type: string; percent: number };
    elementalResist?: { type: string; percent: number };
    specialEffect?: string;
}

export interface ArmorSet {
    id: string;
    name: string;
    tier: number;
    classRestriction: string | null;
    theme: string; // 'fire', 'ice', 'shadow', etc.
    pieces: string[]; // Item ID'leri
    bonuses: SetBonus[];
}

// Set tanımları
export const ARMOR_SETS: ArmorSet[] = [
    // ========== T3 SETLER ==========
    {
        id: 'warrior_iron_set',
        name: 'Demir Savaşçı Seti',
        tier: 3,
        classRestriction: 'warrior',
        theme: 'iron',
        pieces: ['warrior_armor_t3', 'warrior_helm_t3', 'warrior_pants_t3', 'boots_heavy_t3'],
        bonuses: [
            { piecesRequired: 2, name: '2 Parça', description: '+50 HP', stats: { hp: 50 } },
            { piecesRequired: 4, name: '4 Parça', description: '+15 Savunma, +%5 Hasar Azaltma', stats: { defense: 15, specialEffect: 'damage_reduction_5' } },
        ],
    },
    {
        id: 'arctic_frost_set',
        name: 'Buzul Şövalye Seti',
        tier: 3,
        classRestriction: 'arctic_knight',
        theme: 'ice',
        pieces: ['arctic_armor_t3', 'arctic_helm_t3', 'arctic_pants_t3', 'boots_heavy_t3'],
        bonuses: [
            { piecesRequired: 2, name: '2 Parça', description: '+%5 Buz Hasarı', stats: { elementalDamage: { type: 'ice', percent: 5 } } },
            { piecesRequired: 4, name: '4 Parça', description: '+%10 Dondurma Şansı, +30 Savunma', stats: { defense: 30, specialEffect: 'freeze_chance_10' } },
        ],
    },
    {
        id: 'archmage_mystic_set',
        name: 'Mistik Büyücü Seti',
        tier: 3,
        classRestriction: 'archmage',
        theme: 'arcane',
        pieces: ['archmage_robe_t3', 'archmage_hood_t3', 'archmage_pants_t3', 'boots_light_t3'],
        bonuses: [
            { piecesRequired: 2, name: '2 Parça', description: '+50 Mana', stats: { mana: 50 } },
            { piecesRequired: 4, name: '4 Parça', description: '+%10 Büyü Gücü, +%5 Mana Yenileme', stats: { attack: 10, manaRegen: 5 } },
        ],
    },

    // ========== T4 SETLER ==========
    {
        id: 'warrior_steel_set',
        name: 'Çelik Muhafız Seti',
        tier: 4,
        classRestriction: 'warrior',
        theme: 'steel',
        pieces: ['warrior_armor_t4', 'warrior_helm_t4', 'warrior_pants_t4', 'boots_heavy_t4', 'warrior_weapon_t4'],
        bonuses: [
            { piecesRequired: 2, name: '2 Parça', description: '+100 HP, +10 Savunma', stats: { hp: 100, defense: 10 } },
            { piecesRequired: 3, name: '3 Parça', description: '+%5 Hasar Azaltma', stats: { specialEffect: 'damage_reduction_5' } },
            { piecesRequired: 5, name: '5 Parça', description: '+25 Saldırı, +%10 Hasar Yansıtma', stats: { attack: 25, specialEffect: 'damage_reflect_10' } },
        ],
    },
    {
        id: 'arctic_blizzard_set',
        name: 'Kar Fırtınası Seti',
        tier: 4,
        classRestriction: 'arctic_knight',
        theme: 'blizzard',
        pieces: ['arctic_armor_t4', 'arctic_helm_t4', 'arctic_pants_t4', 'boots_heavy_t4', 'arctic_weapon_t4'],
        bonuses: [
            { piecesRequired: 2, name: '2 Parça', description: '+%10 Buz Hasarı', stats: { elementalDamage: { type: 'ice', percent: 10 } } },
            { piecesRequired: 3, name: '3 Parça', description: '+%15 Ateş Direnci', stats: { elementalResist: { type: 'fire', percent: 15 } } },
            { piecesRequired: 5, name: '5 Parça', description: '+%20 Dondurma Şansı, Yakındaki düşmanları yavaşlat', stats: { specialEffect: 'freeze_aura_20' } },
        ],
    },
    {
        id: 'reaper_shadow_set',
        name: 'Gölge Biçici Seti',
        tier: 4,
        classRestriction: 'reaper',
        theme: 'shadow',
        pieces: ['reaper_armor_t4', 'reaper_helm_t4', 'reaper_pants_t4', 'boots_light_t4', 'reaper_weapon_t4'],
        bonuses: [
            { piecesRequired: 2, name: '2 Parça', description: '+%5 Kritik Şansı', stats: { critChance: 5 } },
            { piecesRequired: 3, name: '3 Parça', description: '+%15 Kritik Hasar', stats: { critDamage: 15 } },
            { piecesRequired: 5, name: '5 Parça', description: '+%10 Vampirizm, Öldürmelerde görünmezlik', stats: { specialEffect: 'lifesteal_10_stealth_on_kill' } },
        ],
    },
    {
        id: 'bard_melody_set',
        name: 'Melodi Ustası Seti',
        tier: 4,
        classRestriction: 'bard',
        theme: 'music',
        pieces: ['bard_armor_t4', 'bard_helm_t4', 'bard_pants_t4', 'boots_light_t4', 'bard_weapon_t4'],
        bonuses: [
            { piecesRequired: 2, name: '2 Parça', description: '+%5 Mana Yenileme', stats: { manaRegen: 5 } },
            { piecesRequired: 3, name: '3 Parça', description: 'Aura menzili +%20', stats: { specialEffect: 'aura_range_20' } },
            { piecesRequired: 5, name: '5 Parça', description: 'Takım arkadaşlarına +%10 Saldırı Hızı, +%5 Hareket Hızı', stats: { specialEffect: 'team_buff_atk_10_spd_5' } },
        ],
    },

    // ========== T5 SETLER (EFSANEVİ) ==========
    {
        id: 'warrior_titan_set',
        name: 'Titan Savaş Lordu Seti',
        tier: 5,
        classRestriction: 'warrior',
        theme: 'titan',
        pieces: ['warrior_armor_t5', 'warrior_helm_t5', 'warrior_pants_t5', 'boots_heavy_t5', 'warrior_weapon_t5'],
        bonuses: [
            { piecesRequired: 2, name: '2 Parça', description: '+200 HP, +25 Savunma', stats: { hp: 200, defense: 25 } },
            { piecesRequired: 3, name: '3 Parça', description: '+%10 Hasar Azaltma, Sersemletme bağışıklığı', stats: { specialEffect: 'damage_reduction_10_stun_immune' } },
            { piecesRequired: 5, name: '5 Parça', description: '+50 Saldırı, HP %30 altına düşünce +%50 Savunma', stats: { attack: 50, specialEffect: 'last_stand_defense_50' } },
        ],
    },
    {
        id: 'arctic_eternal_set',
        name: 'Sonsuz Kış Seti',
        tier: 5,
        classRestriction: 'arctic_knight',
        theme: 'eternal_ice',
        pieces: ['arctic_armor_t5', 'arctic_helm_t5', 'arctic_pants_t5', 'boots_heavy_t5', 'arctic_weapon_t5'],
        bonuses: [
            { piecesRequired: 2, name: '2 Parça', description: '+%20 Buz Hasarı, +%25 Ateş Direnci', stats: { elementalDamage: { type: 'ice', percent: 20 }, elementalResist: { type: 'fire', percent: 25 } } },
            { piecesRequired: 3, name: '3 Parça', description: 'Saldırılar %25 şansla düşmanı dondurur', stats: { specialEffect: 'freeze_on_hit_25' } },
            { piecesRequired: 5, name: '5 Parça', description: 'Buz Kalkanı: 10 saniyede bir %20 HP kalkan oluştur', stats: { specialEffect: 'ice_shield_20_hp_10s' } },
        ],
    },
    {
        id: 'archmage_void_set',
        name: 'Boşluk Büyücüsü Seti',
        tier: 5,
        classRestriction: 'archmage',
        theme: 'void',
        pieces: ['archmage_robe_t5', 'archmage_hood_t5', 'archmage_pants_t5', 'boots_light_t5', 'archmage_weapon_t5'],
        bonuses: [
            { piecesRequired: 2, name: '2 Parça', description: '+100 Mana, +%10 Büyü Gücü', stats: { mana: 100, attack: 15 } },
            { piecesRequired: 3, name: '3 Parça', description: 'Büyü maliyeti -%15', stats: { specialEffect: 'spell_cost_reduction_15' } },
            { piecesRequired: 5, name: '5 Parça', description: '+%30 Büyü Gücü, Büyüler %20 şansla iki kez vurur', stats: { attack: 30, specialEffect: 'spell_echo_20' } },
        ],
    },
];

// Oyuncunun giydiği set parçalarını say
export function countSetPieces(setId: string, equippedItemIds: string[]): number {
    const set = ARMOR_SETS.find(s => s.id === setId);
    if (!set) return 0;

    return set.pieces.filter(pieceId => equippedItemIds.includes(pieceId)).length;
}

// Aktif set bonuslarını hesapla
export function getActiveSetBonuses(equippedItemIds: string[]): { set: ArmorSet; bonus: SetBonus }[] {
    const activeBonuses: { set: ArmorSet; bonus: SetBonus }[] = [];

    ARMOR_SETS.forEach(set => {
        const pieceCount = countSetPieces(set.id, equippedItemIds);

        set.bonuses.forEach(bonus => {
            if (pieceCount >= bonus.piecesRequired) {
                activeBonuses.push({ set, bonus });
            }
        });
    });

    return activeBonuses;
}

// Toplam set bonus statlarını hesapla
export function calculateSetBonusStats(equippedItemIds: string[]): SetBonusStats {
    const totalStats: SetBonusStats = {};
    const activeBonuses = getActiveSetBonuses(equippedItemIds);

    activeBonuses.forEach(({ bonus }) => {
        Object.entries(bonus.stats).forEach(([key, value]) => {
            if (key === 'elementalDamage' || key === 'elementalResist' || key === 'specialEffect') {
                return; // Özel efektler ayrı işlenir
            }
            (totalStats as any)[key] = ((totalStats as any)[key] || 0) + (value as number);
        });
    });

    return totalStats;
}

// Set tooltip bilgisi
export function getSetTooltip(setId: string, equippedItemIds: string[]): string {
    const set = ARMOR_SETS.find(s => s.id === setId);
    if (!set) return '';

    const pieceCount = countSetPieces(setId, equippedItemIds);
    let tooltip = `⚔️ ${set.name} (${pieceCount}/${set.pieces.length})\n\n`;

    set.bonuses.forEach(bonus => {
        const isActive = pieceCount >= bonus.piecesRequired;
        const prefix = isActive ? '✅' : '❌';
        tooltip += `${prefix} ${bonus.name}: ${bonus.description}\n`;
    });

    return tooltip;
}
