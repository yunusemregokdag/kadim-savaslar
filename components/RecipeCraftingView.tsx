import React, { useState, useMemo } from 'react';
import { Hammer, Scroll, Lock, CheckCircle, XCircle, Search, Sword, Shield, FlaskConical, Zap, Crown, Star, Sparkles } from 'lucide-react';
import { Item, CraftingRecipe, PlayerState } from '../types';
import { soundManager } from './SoundManager';

interface RecipeCraftingViewProps {
    playerState: PlayerState;
    onCraft: (recipe: CraftingRecipe) => void;
    onClose: () => void;
}

// ==============================================================
// CRAFT MALZEMELERİ - BOSS'LARDAN DÜŞER
// ==============================================================
export const CRAFT_MATERIALS = {
    // TEMEL MALZEMELER (T1-T3 için)
    'wood_log': { name: 'Odun Kütüğü', tier: 1, rarity: 'common', dropSource: 'Ağaçlar' },
    'iron_ore': { name: 'Demir Cevheri', tier: 1, rarity: 'common', dropSource: 'Kayalar' },
    'leather_scrap': { name: 'Deri Parçası', tier: 1, rarity: 'common', dropSource: 'Kurt, Domuz' },
    'herb_green': { name: 'Yeşil Ot', tier: 1, rarity: 'common', dropSource: 'Çalılar' },
    'crystal': { name: 'Kristal Parçası', tier: 2, rarity: 'uncommon', dropSource: 'Kristal Kayalar' },

    // T4 EPİK MALZEMELER (Orta Bosslardan)
    'ancient_core': { name: 'Kadim Öz', tier: 4, rarity: 'epic', dropSource: 'Orman Bekçisi' },
    'shadow_essence': { name: 'Gölge Özü', tier: 4, rarity: 'epic', dropSource: 'Karanlık Lord' },
    'flame_heart': { name: 'Alev Kalbi', tier: 4, rarity: 'epic', dropSource: 'Ateş Devası' },
    'frost_shard': { name: 'Buz Kırıntısı', tier: 4, rarity: 'epic', dropSource: 'Buzul Kolosu' },
    'storm_crystal': { name: 'Fırtına Kristali', tier: 4, rarity: 'epic', dropSource: 'Fırtına Devası' },
    'holy_light': { name: 'Kutsal Işık', tier: 4, rarity: 'epic', dropSource: 'Işık Meleği' },
    'dark_matter': { name: 'Karanlık Madde', tier: 4, rarity: 'epic', dropSource: 'Gölge Lordu' },
    'nature_essence': { name: 'Doğa Özü', tier: 4, rarity: 'epic', dropSource: 'Orman Ruhu' },

    // T5 EFSANE MALZEMELER (En Zor Bosslardan)
    'dragon_scale': { name: 'Ejderha Pulu', tier: 5, rarity: 'legendary', dropSource: 'Kadim Ejderha Tiamat' },
    'void_fragment': { name: 'Boşluk Parçası', tier: 5, rarity: 'legendary', dropSource: 'Hiçlik Lordu' },
    'celestial_essence': { name: 'Göksel Öz', tier: 5, rarity: 'legendary', dropSource: 'Cennet Muhafızı' },
    'demonic_core': { name: 'Şeytani Çekirdek', tier: 5, rarity: 'legendary', dropSource: 'Cehennem Prensi' },
    'phoenix_feather': { name: 'Anka Tüyü', tier: 5, rarity: 'legendary', dropSource: 'Anka Kuşu' },
    'titan_bone': { name: 'Titan Kemiği', tier: 5, rarity: 'legendary', dropSource: 'Kadim Titan' },
    'arcane_crystal': { name: 'Büyülü Kristal', tier: 5, rarity: 'legendary', dropSource: 'Büyü Lordu' },
    'divine_thread': { name: 'İlahi İplik', tier: 5, rarity: 'legendary', dropSource: 'Işık Tanrıçası' },
};

// ==============================================================
// SINIF VE SET BİLGİLERİ
// ==============================================================
const CLASSES = [
    { id: 'warrior', name: 'Savaşçı', t4Set: 'Demir Fırtına', t5Set: 'Savaş Lordu', statType: 'strength' },
    { id: 'arctic_knight', name: 'Buz Şövalyesi', t4Set: 'Buzul Muhafızı', t5Set: 'Ebedi Buz', statType: 'strength' },
    { id: 'storm_rider', name: 'Fırtına Süvarisi', t4Set: 'Şimşek Atlısı', t5Set: 'Fırtına Lordu', statType: 'dexterity' },
    { id: 'martial_artist', name: 'Dövüş Ustası', t4Set: 'Çelik Yumruk', t5Set: 'Ejderha Ustası', statType: 'dexterity' },
    { id: 'ranger', name: 'Usta Okçu', t4Set: 'Orman Avcısı', t5Set: 'Gölge Okçu', statType: 'dexterity' },
    { id: 'mage', name: 'Ulu Büyücü', t4Set: 'Kadim Büyü', t5Set: 'Arşibüyücü', statType: 'intelligence' },
    { id: 'bard', name: 'Ozan', t4Set: 'Melodi Ustası', t5Set: 'Efsane Ozan', statType: 'intelligence' },
    { id: 'priest', name: 'Işık Rahibi', t4Set: 'Kutsal Rahip', t5Set: 'Işık Peygamberi', statType: 'intelligence' },
    { id: 'cleric', name: 'Ruhban', t4Set: 'Şifa Ustası', t5Set: 'Kutsal Şifacı', statType: 'intelligence' },
    { id: 'reaper', name: 'Ölüm Meleği', t4Set: 'Gölge Avcısı', t5Set: 'Ölüm Lordu', statType: 'strength' },
];

// ==============================================================
// TARİF OLUŞTURUCU FONKSİYONLARI
// ==============================================================
function generateClassRecipes(): CraftingRecipe[] {
    const recipes: CraftingRecipe[] = [];

    CLASSES.forEach(cls => {
        // T4 Malzemeleri
        const t4Mat = cls.statType === 'strength' ? 'flame_heart' :
            cls.statType === 'dexterity' ? 'storm_crystal' : 'ancient_core';

        // T5 Malzemeleri  
        const t5Mat = cls.statType === 'strength' ? 'dragon_scale' :
            cls.statType === 'dexterity' ? 'phoenix_feather' : 'arcane_crystal';

        // ============= T4 SET =============
        // T4 Silah
        recipes.push({
            id: `${cls.id}_weapon_t4`, category: 'weapon', levelReq: 24, goldCost: 15000,
            resultItem: {
                id: `${cls.id}_weapon_t4`, name: `${cls.t4Set} Silahı`, type: 'weapon', tier: 4,
                rarity: 'epic', value: 8000, setId: `${cls.id}_t4_set`,
                stats: { damage: 200 + (cls.statType === 'strength' ? 50 : 0), [cls.statType]: 40, critChance: 10 }
            },
            materials: [
                { itemId: 'iron_ore', count: 80 },
                { itemId: 'crystal', count: 20 },
                { itemId: t4Mat, count: 5 },
            ],
        });

        // T4 Zırh
        recipes.push({
            id: `${cls.id}_armor_t4`, category: 'armor', levelReq: 24, goldCost: 12000,
            resultItem: {
                id: `${cls.id}_armor_t4`, name: `${cls.t4Set} Zırhı`, type: 'armor', tier: 4,
                rarity: 'epic', value: 6000, setId: `${cls.id}_t4_set`,
                stats: { defense: 120, hp: 400, [cls.statType]: 25 }
            },
            materials: [
                { itemId: 'iron_ore', count: 100 },
                { itemId: 'leather_scrap', count: 40 },
                { itemId: t4Mat, count: 4 },
            ],
        });

        // T4 Miğfer
        recipes.push({
            id: `${cls.id}_helmet_t4`, category: 'armor', levelReq: 24, goldCost: 8000,
            resultItem: {
                id: `${cls.id}_helmet_t4`, name: `${cls.t4Set} Miğferi`, type: 'helmet', tier: 4,
                rarity: 'epic', value: 4000, setId: `${cls.id}_t4_set`,
                stats: { defense: 60, hp: 200, [cls.statType]: 15 }
            },
            materials: [
                { itemId: 'iron_ore', count: 50 },
                { itemId: 'leather_scrap', count: 20 },
                { itemId: t4Mat, count: 2 },
            ],
        });

        // T4 Pantolon
        recipes.push({
            id: `${cls.id}_pants_t4`, category: 'armor', levelReq: 24, goldCost: 10000,
            resultItem: {
                id: `${cls.id}_pants_t4`, name: `${cls.t4Set} Pantolonu`, type: 'pants', tier: 4,
                rarity: 'epic', value: 5000, setId: `${cls.id}_t4_set`,
                stats: { defense: 80, hp: 300, [cls.statType]: 20 }
            },
            materials: [
                { itemId: 'iron_ore', count: 60 },
                { itemId: 'leather_scrap', count: 30 },
                { itemId: t4Mat, count: 3 },
            ],
        });

        // ============= T5 SET (LEGENDARY) =============
        // T5 Silah
        recipes.push({
            id: `${cls.id}_weapon_t5`, category: 'weapon', levelReq: 30, goldCost: 50000,
            resultItem: {
                id: `${cls.id}_weapon_t5`, name: `${cls.t5Set} Silahı`, type: 'weapon', tier: 5,
                rarity: 'legendary', value: 25000, setId: `${cls.id}_t5_set`,
                stats: { damage: 450 + (cls.statType === 'strength' ? 100 : 0), [cls.statType]: 100, critChance: 25 }
            },
            materials: [
                { itemId: 'iron_ore', count: 200 },
                { itemId: 'crystal', count: 50 },
                { itemId: t5Mat, count: 8 },
                { itemId: t4Mat, count: 15 },
            ],
        });

        // T5 Zırh
        recipes.push({
            id: `${cls.id}_armor_t5`, category: 'armor', levelReq: 30, goldCost: 40000,
            resultItem: {
                id: `${cls.id}_armor_t5`, name: `${cls.t5Set} Zırhı`, type: 'armor', tier: 5,
                rarity: 'legendary', value: 20000, setId: `${cls.id}_t5_set`,
                stats: { defense: 280, hp: 1500, [cls.statType]: 60 }
            },
            materials: [
                { itemId: 'iron_ore', count: 250 },
                { itemId: 'leather_scrap', count: 100 },
                { itemId: t5Mat, count: 6 },
                { itemId: t4Mat, count: 12 },
            ],
        });

        // T5 Miğfer
        recipes.push({
            id: `${cls.id}_helmet_t5`, category: 'armor', levelReq: 30, goldCost: 25000,
            resultItem: {
                id: `${cls.id}_helmet_t5`, name: `${cls.t5Set} Miğferi`, type: 'helmet', tier: 5,
                rarity: 'legendary', value: 12000, setId: `${cls.id}_t5_set`,
                stats: { defense: 140, hp: 800, [cls.statType]: 35 }
            },
            materials: [
                { itemId: 'iron_ore', count: 120 },
                { itemId: 'leather_scrap', count: 50 },
                { itemId: t5Mat, count: 4 },
                { itemId: t4Mat, count: 8 },
            ],
        });

        // T5 Pantolon
        recipes.push({
            id: `${cls.id}_pants_t5`, category: 'armor', levelReq: 30, goldCost: 30000,
            resultItem: {
                id: `${cls.id}_pants_t5`, name: `${cls.t5Set} Pantolonu`, type: 'pants', tier: 5,
                rarity: 'legendary', value: 15000, setId: `${cls.id}_t5_set`,
                stats: { defense: 180, hp: 1000, [cls.statType]: 45 }
            },
            materials: [
                { itemId: 'iron_ore', count: 150 },
                { itemId: 'leather_scrap', count: 70 },
                { itemId: t5Mat, count: 5 },
                { itemId: t4Mat, count: 10 },
            ],
        });
    });

    return recipes;
}

// Universal Aksesuarlar (Çizme, Kolye, Küpe)
function generateAccessoryRecipes(): CraftingRecipe[] {
    const recipes: CraftingRecipe[] = [];
    const statTypes = [
        { id: 'str', name: 'Güç', stat: 'strength', t4Mat: 'flame_heart', t5Mat: 'dragon_scale' },
        { id: 'dex', name: 'Çeviklik', stat: 'dexterity', t4Mat: 'storm_crystal', t5Mat: 'phoenix_feather' },
        { id: 'int', name: 'Zeka', stat: 'intelligence', t4Mat: 'ancient_core', t5Mat: 'arcane_crystal' },
        { id: 'vit', name: 'Dayanıklılık', stat: 'vitality', t4Mat: 'frost_shard', t5Mat: 'titan_bone' },
        { id: 'lck', name: 'Şans', stat: 'luck', t4Mat: 'nature_essence', t5Mat: 'celestial_essence' },
    ];

    // T4 ve T5 Çizmeler
    statTypes.forEach(st => {
        // T4 Çizme
        recipes.push({
            id: `boots_${st.id}_t4`, category: 'armor', levelReq: 24, goldCost: 8000,
            resultItem: {
                id: `boots_${st.id}_t4`, name: `${st.name} Çizmeleri (T4)`, type: 'boots', tier: 4,
                rarity: 'epic', value: 4000,
                stats: { defense: 50, [st.stat]: 30, speed: 5 }
            },
            materials: [
                { itemId: 'leather_scrap', count: 60 },
                { itemId: st.t4Mat, count: 2 },
            ],
        });

        // T5 Çizme
        recipes.push({
            id: `boots_${st.id}_t5`, category: 'armor', levelReq: 30, goldCost: 20000,
            resultItem: {
                id: `boots_${st.id}_t5`, name: `${st.name} Çizmeleri (T5)`, type: 'boots', tier: 5,
                rarity: 'legendary', value: 10000,
                stats: { defense: 100, [st.stat]: 60, speed: 15 }
            },
            materials: [
                { itemId: 'leather_scrap', count: 150 },
                { itemId: st.t5Mat, count: 3 },
                { itemId: st.t4Mat, count: 6 },
            ],
        });

        // T4 Kolye
        recipes.push({
            id: `necklace_${st.id}_t4`, category: 'accessory', levelReq: 24, goldCost: 10000,
            resultItem: {
                id: `necklace_${st.id}_t4`, name: `${st.name} Kolyesi (T4)`, type: 'necklace', tier: 4,
                rarity: 'epic', value: 5000,
                stats: { [st.stat]: 40, hp: 200 }
            },
            materials: [
                { itemId: 'crystal', count: 30 },
                { itemId: st.t4Mat, count: 3 },
            ],
        });

        // T5 Kolye
        recipes.push({
            id: `necklace_${st.id}_t5`, category: 'accessory', levelReq: 30, goldCost: 30000,
            resultItem: {
                id: `necklace_${st.id}_t5`, name: `${st.name} Kolyesi (T5)`, type: 'necklace', tier: 5,
                rarity: 'legendary', value: 15000,
                stats: { [st.stat]: 80, hp: 600, mana: 300 }
            },
            materials: [
                { itemId: 'crystal', count: 80 },
                { itemId: st.t5Mat, count: 4 },
                { itemId: st.t4Mat, count: 8 },
            ],
        });

        // T4 Küpe
        recipes.push({
            id: `earring_${st.id}_t4`, category: 'accessory', levelReq: 24, goldCost: 10000,
            resultItem: {
                id: `earring_${st.id}_t4`, name: `${st.name} Küpesi (T4)`, type: 'earring', tier: 4,
                rarity: 'epic', value: 5000,
                stats: { [st.stat]: 35, critChance: 5 }
            },
            materials: [
                { itemId: 'crystal', count: 25 },
                { itemId: st.t4Mat, count: 2 },
            ],
        });

        // T5 Küpe
        recipes.push({
            id: `earring_${st.id}_t5`, category: 'accessory', levelReq: 30, goldCost: 25000,
            resultItem: {
                id: `earring_${st.id}_t5`, name: `${st.name} Küpesi (T5)`, type: 'earring', tier: 5,
                rarity: 'legendary', value: 12000,
                stats: { [st.stat]: 70, critChance: 15, critDamage: 25 }
            },
            materials: [
                { itemId: 'crystal', count: 60 },
                { itemId: st.t5Mat, count: 3 },
                { itemId: st.t4Mat, count: 6 },
            ],
        });
    });

    return recipes;
}

// Temel Tarifler (T1-T3 + İksirler)
const BASE_RECIPES: CraftingRecipe[] = [
    // İksirler
    {
        id: 'hp_potion_medium', category: 'consumable', levelReq: 5, goldCost: 50,
        resultItem: { id: 'potion_hp_medium', name: 'Orta Can İksiri', type: 'consumable', tier: 2, rarity: 'common', value: 50, stats: { hp: 500 } },
        materials: [{ itemId: 'herb_green', count: 3 }],
    },
    {
        id: 'hp_potion_large', category: 'consumable', levelReq: 15, goldCost: 200,
        resultItem: { id: 'potion_hp_large', name: 'Büyük Can İksiri', type: 'consumable', tier: 3, rarity: 'uncommon', value: 150, stats: { hp: 1500 } },
        materials: [{ itemId: 'herb_green', count: 10 }],
    },
    {
        id: 'mp_potion_medium', category: 'consumable', levelReq: 5, goldCost: 50,
        resultItem: { id: 'potion_mp_medium', name: 'Orta Mana İksiri', type: 'consumable', tier: 2, rarity: 'common', value: 50, stats: { mana: 300 } },
        materials: [{ itemId: 'herb_green', count: 3 }],
    },

    // T2 Silahlar
    {
        id: 'sword_iron', category: 'weapon', levelReq: 10, goldCost: 500,
        resultItem: { id: 'sword_t2', name: 'Demir Kılıç', type: 'weapon', tier: 2, rarity: 'uncommon', value: 250, stats: { damage: 45, strength: 5 } },
        materials: [{ itemId: 'iron_ore', count: 10 }, { itemId: 'wood_log', count: 5 }],
    },
    {
        id: 'staff_oak', category: 'weapon', levelReq: 10, goldCost: 500,
        resultItem: { id: 'staff_t2', name: 'Meşe Asası', type: 'weapon', tier: 2, rarity: 'uncommon', value: 250, stats: { damage: 35, intelligence: 8 } },
        materials: [{ itemId: 'wood_log', count: 15 }],
    },
    {
        id: 'bow_recurve', category: 'weapon', levelReq: 10, goldCost: 500,
        resultItem: { id: 'bow_t2', name: 'Kompozit Yay', type: 'weapon', tier: 2, rarity: 'uncommon', value: 250, stats: { damage: 40, dexterity: 6 } },
        materials: [{ itemId: 'wood_log', count: 10 }, { itemId: 'leather_scrap', count: 5 }],
    },

    // T3 Silahlar
    {
        id: 'sword_steel', category: 'weapon', levelReq: 18, goldCost: 2000,
        resultItem: { id: 'sword_t3', name: 'Çelik Kılıç', type: 'weapon', tier: 3, rarity: 'rare', value: 1000, stats: { damage: 120, strength: 15, critChance: 5 } },
        materials: [{ itemId: 'iron_ore', count: 40 }, { itemId: 'leather_scrap', count: 10 }, { itemId: 'crystal', count: 5 }],
    },
    {
        id: 'staff_crystal', category: 'weapon', levelReq: 18, goldCost: 2000,
        resultItem: { id: 'staff_t3', name: 'Kristal Asa', type: 'weapon', tier: 3, rarity: 'rare', value: 1000, stats: { damage: 100, intelligence: 25, mana: 100 } },
        materials: [{ itemId: 'wood_log', count: 30 }, { itemId: 'crystal', count: 15 }],
    },
    {
        id: 'bow_hunter', category: 'weapon', levelReq: 18, goldCost: 2000,
        resultItem: { id: 'bow_t3', name: 'Avcı Yayı', type: 'weapon', tier: 3, rarity: 'rare', value: 1000, stats: { damage: 110, dexterity: 20, critChance: 8 } },
        materials: [{ itemId: 'wood_log', count: 25 }, { itemId: 'leather_scrap', count: 15 }, { itemId: 'crystal', count: 5 }],
    },

    // T2-T3 Zırhlar
    {
        id: 'armor_leather', category: 'armor', levelReq: 10, goldCost: 400,
        resultItem: { id: 'armor_t2', name: 'Sert Deri Zırh', type: 'armor', tier: 2, rarity: 'uncommon', value: 200, stats: { defense: 25, dexterity: 5 } },
        materials: [{ itemId: 'leather_scrap', count: 15 }],
    },
    {
        id: 'armor_chain', category: 'armor', levelReq: 18, goldCost: 1500,
        resultItem: { id: 'armor_t3', name: 'Zincir Zırh', type: 'armor', tier: 3, rarity: 'rare', value: 800, stats: { defense: 60, strength: 10 } },
        materials: [{ itemId: 'iron_ore', count: 30 }, { itemId: 'leather_scrap', count: 10 }, { itemId: 'crystal', count: 3 }],
    },
];

// TÜM TARİFLERİ BİRLEŞTİR
const RECIPES: CraftingRecipe[] = [
    ...BASE_RECIPES,
    ...generateClassRecipes(),      // 80 tarif (10 sınıf x 4 parça x 2 tier)
    ...generateAccessoryRecipes(),  // 30 tarif (5 stat x 3 aksesuar x 2 tier)
];

// ==============================================================
// COMPONENT
// ==============================================================
const RecipeCraftingView: React.FC<RecipeCraftingViewProps> = ({ playerState, onCraft, onClose }) => {
    const [selectedCategory, setSelectedCategory] = useState<'all' | 'weapon' | 'armor' | 'accessory' | 'consumable' | 'craftable'>('all');
    const [selectedRecipe, setSelectedRecipe] = useState<CraftingRecipe | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCrafting, setIsCrafting] = useState(false);
    const [tierFilter, setTierFilter] = useState<number | null>(null);

    const getMaterialCount = (itemId: string) => {
        return playerState.inventory.filter(i =>
            i.id === itemId || i.id.startsWith(itemId) || i.id.includes(itemId)
        ).length;
    };

    const canCraft = (recipe: CraftingRecipe) => {
        const playerGold = (playerState as any).gold || playerState.credits || 0;
        if (playerGold < recipe.goldCost) return false;
        if (playerState.level < recipe.levelReq) return false;
        for (const mat of recipe.materials) {
            if (getMaterialCount(mat.itemId) < mat.count) return false;
        }
        return true;
    };

    const filteredRecipes = useMemo(() => {
        return RECIPES.filter(recipe => {
            if (selectedCategory === 'craftable') return canCraft(recipe);

            const matchesCategory = selectedCategory === 'all' ||
                recipe.category === selectedCategory ||
                (selectedCategory === 'armor' && ['armor', 'helmet', 'pants', 'boots'].includes(recipe.resultItem.type));
            const matchesSearch = recipe.resultItem.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesTier = tierFilter === null || recipe.resultItem.tier === tierFilter;

            return matchesCategory && matchesSearch && matchesTier;
        });
    }, [selectedCategory, searchTerm, tierFilter, playerState.inventory]);

    const handleCraftClick = () => {
        if (!selectedRecipe || !canCraft(selectedRecipe) || isCrafting) return;
        setIsCrafting(true);
        soundManager.playSFX('click');
        setTimeout(() => {
            onCraft(selectedRecipe);
            setIsCrafting(false);
            soundManager.playSFX('upgrade_success');
        }, 1500);
    };

    const getRarityColor = (rarity: string) => {
        switch (rarity) {
            case 'common': return 'text-slate-300 border-slate-600';
            case 'uncommon': return 'text-green-400 border-green-600';
            case 'rare': return 'text-blue-400 border-blue-600';
            case 'epic': return 'text-purple-400 border-purple-600';
            case 'legendary': return 'text-orange-400 border-orange-600';
            default: return 'text-slate-300 border-slate-600';
        }
    };

    const getMaterialInfo = (itemId: string) => {
        return CRAFT_MATERIALS[itemId as keyof typeof CRAFT_MATERIALS] ||
            { name: itemId.replace(/_/g, ' '), tier: 1, rarity: 'common', dropSource: 'Bilinmiyor' };
    };

    return (
        <div className="w-full h-full flex flex-col bg-[#0a0a12]">
            {/* Header */}
            <div className="p-3 border-b border-slate-800 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-bold text-blue-400 flex items-center gap-2">
                        <FlaskConical size={20} /> Üretim ({RECIPES.length} Tarif)
                    </h2>
                    <div className="flex gap-1">
                        {[null, 2, 3, 4, 5].map(t => (
                            <button
                                key={t || 'all'}
                                onClick={() => setTierFilter(t)}
                                className={`px-2 py-1 text-xs rounded ${tierFilter === t ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                            >
                                {t ? `T${t}` : 'Tümü'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="relative mb-2">
                    <input
                        type="text"
                        placeholder="Tarif ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-black/60 border border-slate-700 rounded p-2 pl-8 text-sm text-white focus:border-blue-600 outline-none"
                    />
                    <Search className="absolute left-2 top-2.5 text-slate-500" size={14} />
                </div>

                <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
                    {[
                        { id: 'all', label: 'Tümü' },
                        { id: 'craftable', label: '✓ Yapılabilir' },
                        { id: 'weapon', label: '⚔️ Silah' },
                        { id: 'armor', label: '🛡️ Zırh' },
                        { id: 'accessory', label: '💎 Aksesuar' },
                        { id: 'consumable', label: '🧪 İksir' },
                    ].map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id as any)}
                            className={`px-2 py-1 rounded text-xs font-bold whitespace-nowrap ${selectedCategory === cat.id
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left - Recipe List */}
                <div className="w-2/5 border-r border-slate-800 overflow-y-auto p-1 space-y-0.5">
                    {filteredRecipes.length === 0 ? (
                        <div className="text-center py-8 text-slate-500 text-sm">Tarif bulunamadı</div>
                    ) : (
                        filteredRecipes.map(recipe => {
                            const craftable = canCraft(recipe);
                            return (
                                <button
                                    key={recipe.id}
                                    onClick={() => setSelectedRecipe(recipe)}
                                    className={`w-full text-left p-1.5 rounded border transition-all flex items-center gap-2 ${selectedRecipe?.id === recipe.id
                                        ? 'bg-blue-900/40 border-blue-500'
                                        : craftable ? 'bg-green-900/20 border-green-700/30' : 'bg-slate-900/40 border-slate-700/30'
                                        }`}
                                >
                                    <div className={`w-8 h-8 rounded border flex items-center justify-center text-xs font-bold bg-black/60 ${getRarityColor(recipe.resultItem.rarity)}`}>
                                        T{recipe.resultItem.tier}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className={`text-xs font-bold truncate ${getRarityColor(recipe.resultItem.rarity).split(' ')[0]}`}>
                                            {recipe.resultItem.name}
                                        </div>
                                        <div className="text-[9px] text-slate-500">Lv{recipe.levelReq} • {recipe.goldCost.toLocaleString()}G</div>
                                    </div>
                                    {craftable && <CheckCircle size={12} className="text-green-500" />}
                                </button>
                            );
                        })
                    )}
                </div>

                {/* Right - Detail */}
                <div className="flex-1 p-3 overflow-y-auto">
                    {selectedRecipe ? (
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 pb-3 border-b border-slate-700">
                                <div className={`w-14 h-14 rounded-lg border-2 flex items-center justify-center bg-black/60 text-xl font-bold ${getRarityColor(selectedRecipe.resultItem.rarity)}`}>
                                    T{selectedRecipe.resultItem.tier}
                                </div>
                                <div>
                                    <h3 className={`text-xl font-bold ${getRarityColor(selectedRecipe.resultItem.rarity).split(' ')[0]}`}>
                                        {selectedRecipe.resultItem.name}
                                    </h3>
                                    {selectedRecipe.resultItem.setId && (
                                        <div className="text-xs text-orange-400">🛡️ Set: {selectedRecipe.resultItem.setId.replace(/_/g, ' ')}</div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-slate-900/50 p-2 rounded">
                                <h4 className="text-xs font-bold text-blue-400 mb-1">📊 Özellikler</h4>
                                <div className="grid grid-cols-2 gap-1">
                                    {Object.entries(selectedRecipe.resultItem.stats || {}).map(([key, val]) => (
                                        <div key={key} className="flex justify-between bg-black/30 px-2 py-0.5 rounded text-xs">
                                            <span className="text-slate-400">{key}</span>
                                            <span className="text-white font-bold">+{val}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-slate-900/50 p-2 rounded">
                                <h4 className="text-xs font-bold text-yellow-400 mb-1">📦 Malzemeler</h4>
                                <div className="space-y-1">
                                    {selectedRecipe.materials.map((mat, idx) => {
                                        const has = getMaterialCount(mat.itemId);
                                        const enough = has >= mat.count;
                                        const info = getMaterialInfo(mat.itemId);
                                        return (
                                            <div key={idx} className="flex justify-between items-center bg-black/40 p-1.5 rounded text-xs">
                                                <div>
                                                    <div className={getRarityColor(info.rarity).split(' ')[0]}>{info.name}</div>
                                                    <div className="text-[9px] text-slate-500">📍 {info.dropSource}</div>
                                                </div>
                                                <div className={`font-bold ${enough ? 'text-green-400' : 'text-red-400'}`}>
                                                    {has}/{mat.count}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="flex justify-between bg-yellow-900/20 p-2 rounded text-sm">
                                <span>Maliyet</span>
                                <span className={((playerState as any).gold || playerState.credits || 0) >= selectedRecipe.goldCost ? 'text-yellow-400' : 'text-red-400'}>
                                    {selectedRecipe.goldCost.toLocaleString()}G
                                </span>
                            </div>

                            <button
                                onClick={handleCraftClick}
                                disabled={!canCraft(selectedRecipe) || isCrafting}
                                className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 ${isCrafting ? 'bg-slate-700' :
                                    canCraft(selectedRecipe) ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'bg-slate-800 text-slate-500'
                                    }`}
                            >
                                {isCrafting ? '⏳ Üretiliyor...' : canCraft(selectedRecipe) ? '🔨 ÜRET' : '🔒 Eksik'}
                            </button>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-600 text-sm">
                            <Hammer size={40} className="mb-2 opacity-30" />
                            <p>Tarif seç</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RecipeCraftingView;
