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
    // TEMEL MALZEMELER (T1-T3 için, kolay toplanır)
    'wood_log': { name: 'Odun Kütüğü', tier: 1, rarity: 'common', dropSource: 'Ağaçlar' },
    'iron_ore': { name: 'Demir Cevheri', tier: 1, rarity: 'common', dropSource: 'Kayalar' },
    'leather_scrap': { name: 'Deri Parçası', tier: 1, rarity: 'common', dropSource: 'Kurt, Domuz' },
    'herb_green': { name: 'Yeşil Ot', tier: 1, rarity: 'common', dropSource: 'Çalılar' },
    'crystal': { name: 'Kristal Parçası', tier: 2, rarity: 'uncommon', dropSource: 'Kristal Kayalar' },

    // EPİK MALZEMELER (T4 için - Orta Bosslardan)
    'ancient_core': { name: 'Kadim Öz', tier: 4, rarity: 'epic', dropSource: 'Orman Bekçisi (Boss)' },
    'shadow_essence': { name: 'Gölge Özü', tier: 4, rarity: 'epic', dropSource: 'Karanlık Lord (Boss)' },
    'flame_heart': { name: 'Alev Kalbi', tier: 4, rarity: 'epic', dropSource: 'Ateş Devası (Boss)' },
    'frost_shard': { name: 'Buz Kırıntısı', tier: 4, rarity: 'epic', dropSource: 'Buzul Kolosu (Boss)' },
    'storm_crystal': { name: 'Fırtına Kristali', tier: 4, rarity: 'epic', dropSource: 'Fırtına Devası (Boss)' },

    // EFSANE MALZEMELER (T5 için - En Zor Bosslardan)
    'dragon_scale': { name: 'Ejderha Pulu', tier: 5, rarity: 'legendary', dropSource: 'Kadim Ejderha Tiamat' },
    'void_fragment': { name: 'Boşluk Parçası', tier: 5, rarity: 'legendary', dropSource: 'Hiçlik Lordu' },
    'celestial_essence': { name: 'Göksel Öz', tier: 5, rarity: 'legendary', dropSource: 'Işık Muhafızı' },
    'demonic_core': { name: 'Şeytani Çekirdek', tier: 5, rarity: 'legendary', dropSource: 'Cehennem Prensi' },
    'phoenix_feather': { name: 'Anka Tüyü', tier: 5, rarity: 'legendary', dropSource: 'Anka Kuşu' },

    // SET MALZEMELER (Özel Set Parçaları için)
    'dragon_set_fragment': { name: 'Ejderha Set Parçası', tier: 5, rarity: 'legendary', dropSource: 'Tiamat (Nadir)' },
    'void_set_fragment': { name: 'Hiçlik Set Parçası', tier: 5, rarity: 'legendary', dropSource: 'Hiçlik Lordu (Nadir)' },
    'celestial_set_fragment': { name: 'Göksel Set Parçası', tier: 5, rarity: 'legendary', dropSource: 'Işık Muhafızı (Nadir)' },
};

// ==============================================================
// CRAFT TARİFLERİ
// ==============================================================
const RECIPES: CraftingRecipe[] = [
    // ============= CONSUMABLES (Kolay) =============
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

    // ============= T2 SİLAHLAR (Kolay) =============
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

    // ============= T3 SİLAHLAR (Orta) =============
    {
        id: 'sword_steel', category: 'weapon', levelReq: 18, goldCost: 2000,
        resultItem: { id: 'sword_t3', name: 'Çelik Kılıç', type: 'weapon', tier: 3, rarity: 'rare', value: 1000, stats: { damage: 120, strength: 15, critChance: 5 } },
        materials: [{ itemId: 'iron_ore', count: 40 }, { itemId: 'leather_scrap', count: 10 }, { itemId: 'crystal', count: 5 }],
    },
    {
        id: 'axe_battle', category: 'weapon', levelReq: 18, goldCost: 2000,
        resultItem: { id: 'axe_t3', name: 'Savaş Baltası', type: 'weapon', tier: 3, rarity: 'rare', value: 1000, stats: { damage: 135, strength: 20 } },
        materials: [{ itemId: 'iron_ore', count: 45 }, { itemId: 'wood_log', count: 20 }, { itemId: 'crystal', count: 5 }],
    },

    // ============= T2-T3 ZIRHLAR =============
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

    // ============= T4 SİLAHLAR (ZOR - EPİK MALZEME GEREKLİ) =============
    {
        id: 'sword_mythril', category: 'weapon', levelReq: 24, goldCost: 15000,
        resultItem: { id: 'sword_t4', name: 'Mithril Kılıç', type: 'weapon', tier: 4, rarity: 'epic', value: 5000, stats: { damage: 250, strength: 30, critChance: 10 } },
        materials: [
            { itemId: 'iron_ore', count: 100 },
            { itemId: 'crystal', count: 25 },
            { itemId: 'ancient_core', count: 3 }, // Boss drop!
        ],
    },
    {
        id: 'staff_arcane', category: 'weapon', levelReq: 24, goldCost: 15000,
        resultItem: { id: 'staff_t4', name: 'Kadim Asa', type: 'weapon', tier: 4, rarity: 'epic', value: 5000, stats: { damage: 200, intelligence: 50, mana: 300 } },
        materials: [
            { itemId: 'wood_log', count: 100 },
            { itemId: 'crystal', count: 30 },
            { itemId: 'shadow_essence', count: 3 }, // Boss drop!
        ],
    },
    {
        id: 'bow_hunter', category: 'weapon', levelReq: 24, goldCost: 15000,
        resultItem: { id: 'bow_t4', name: 'Avcı Yayı', type: 'weapon', tier: 4, rarity: 'epic', value: 5000, stats: { damage: 220, dexterity: 40, critChance: 15 } },
        materials: [
            { itemId: 'wood_log', count: 80 },
            { itemId: 'leather_scrap', count: 50 },
            { itemId: 'storm_crystal', count: 3 }, // Boss drop!
        ],
    },
    {
        id: 'armor_plate_t4', category: 'armor', levelReq: 24, goldCost: 12000,
        resultItem: { id: 'armor_t4', name: 'Plaka Zırh', type: 'armor', tier: 4, rarity: 'epic', value: 4500, stats: { defense: 150, hp: 500 } },
        materials: [
            { itemId: 'iron_ore', count: 150 },
            { itemId: 'crystal', count: 20 },
            { itemId: 'flame_heart', count: 2 }, // Boss drop!
        ],
    },

    // ============= T5 SİLAHLAR (ÇOK ZOR - EFSANE MALZEME GEREKLİ) =============
    {
        id: 'sword_dragon_t5', category: 'weapon', levelReq: 30, goldCost: 50000,
        resultItem: { id: 'sword_t5', name: 'Ejderha Ateşi Kılıcı', type: 'weapon', tier: 5, rarity: 'legendary', value: 20000, stats: { damage: 500, strength: 100, critChance: 25 } },
        materials: [
            { itemId: 'iron_ore', count: 300 },
            { itemId: 'crystal', count: 50 },
            { itemId: 'dragon_scale', count: 5 }, // Tiamat'tan!
            { itemId: 'flame_heart', count: 10 },
        ],
    },
    {
        id: 'staff_void_t5', category: 'weapon', levelReq: 30, goldCost: 50000,
        resultItem: { id: 'staff_t5', name: 'Hiçlik Asası', type: 'weapon', tier: 5, rarity: 'legendary', value: 20000, stats: { damage: 450, intelligence: 120, mana: 500 } },
        materials: [
            { itemId: 'wood_log', count: 300 },
            { itemId: 'crystal', count: 50 },
            { itemId: 'void_fragment', count: 5 }, // Hiçlik Lordu'ndan!
            { itemId: 'shadow_essence', count: 10 },
        ],
    },
    {
        id: 'bow_celestial_t5', category: 'weapon', levelReq: 30, goldCost: 50000,
        resultItem: { id: 'bow_t5', name: 'Göksel Yay', type: 'weapon', tier: 5, rarity: 'legendary', value: 20000, stats: { damage: 420, dexterity: 110, critChance: 30 } },
        materials: [
            { itemId: 'wood_log', count: 200 },
            { itemId: 'leather_scrap', count: 150 },
            { itemId: 'crystal', count: 50 },
            { itemId: 'celestial_essence', count: 5 }, // Işık Muhafızı'ndan!
            { itemId: 'phoenix_feather', count: 3 },
        ],
    },
    {
        id: 'armor_dragon_t5', category: 'armor', levelReq: 30, goldCost: 40000,
        resultItem: { id: 'armor_t5', name: 'Ejderha Zırhı', type: 'armor', tier: 5, rarity: 'legendary', value: 15000, stats: { defense: 300, hp: 2000, strength: 20 } },
        materials: [
            { itemId: 'iron_ore', count: 400 },
            { itemId: 'leather_scrap', count: 100 },
            { itemId: 'dragon_scale', count: 10 }, // Tiamat'tan çok!
            { itemId: 'flame_heart', count: 5 },
        ],
    },

    // ============= SET PARÇALARI (EN ZOR - TAM SET İÇİN) =============
    // EJDERHA SETİ
    {
        id: 'dragon_set_helmet', category: 'set', levelReq: 30, goldCost: 30000,
        resultItem: { id: 'helmet_dragon_set', name: 'Ejderha Miğferi', type: 'helmet', tier: 5, rarity: 'legendary', value: 10000, stats: { defense: 100, hp: 500, strength: 15 }, setId: 'dragon_set' },
        materials: [
            { itemId: 'dragon_scale', count: 3 },
            { itemId: 'dragon_set_fragment', count: 1 },
            { itemId: 'iron_ore', count: 100 },
        ],
    },
    {
        id: 'dragon_set_armor', category: 'set', levelReq: 30, goldCost: 50000,
        resultItem: { id: 'armor_dragon_set', name: 'Ejderha Göğüslüğü', type: 'armor', tier: 5, rarity: 'legendary', value: 18000, stats: { defense: 250, hp: 1500, strength: 30 }, setId: 'dragon_set' },
        materials: [
            { itemId: 'dragon_scale', count: 8 },
            { itemId: 'dragon_set_fragment', count: 2 },
            { itemId: 'iron_ore', count: 200 },
            { itemId: 'flame_heart', count: 5 },
        ],
    },
    {
        id: 'dragon_set_pants', category: 'set', levelReq: 30, goldCost: 35000,
        resultItem: { id: 'pants_dragon_set', name: 'Ejderha Pantolonu', type: 'pants', tier: 5, rarity: 'legendary', value: 12000, stats: { defense: 150, hp: 800, dexterity: 20 }, setId: 'dragon_set' },
        materials: [
            { itemId: 'dragon_scale', count: 5 },
            { itemId: 'dragon_set_fragment', count: 1 },
            { itemId: 'leather_scrap', count: 150 },
        ],
    },
    {
        id: 'dragon_set_boots', category: 'set', levelReq: 30, goldCost: 25000,
        resultItem: { id: 'boots_dragon_set', name: 'Ejderha Çizmeleri', type: 'boots', tier: 5, rarity: 'legendary', value: 8000, stats: { defense: 80, dexterity: 25, speed: 10 }, setId: 'dragon_set' },
        materials: [
            { itemId: 'dragon_scale', count: 2 },
            { itemId: 'dragon_set_fragment', count: 1 },
            { itemId: 'leather_scrap', count: 100 },
        ],
    },
    {
        id: 'dragon_set_weapon', category: 'set', levelReq: 30, goldCost: 60000,
        resultItem: { id: 'weapon_dragon_set', name: 'Ejderha Kılıcı', type: 'weapon', tier: 5, rarity: 'legendary', value: 25000, stats: { damage: 600, strength: 80, critChance: 20, fireDamage: 100 }, setId: 'dragon_set' },
        materials: [
            { itemId: 'dragon_scale', count: 10 },
            { itemId: 'dragon_set_fragment', count: 3 },
            { itemId: 'flame_heart', count: 10 },
            { itemId: 'iron_ore', count: 300 },
        ],
    },

    // HİÇLİK SETİ
    {
        id: 'void_set_armor', category: 'set', levelReq: 30, goldCost: 55000,
        resultItem: { id: 'armor_void_set', name: 'Hiçlik Zırhı', type: 'armor', tier: 5, rarity: 'legendary', value: 20000, stats: { defense: 200, hp: 1000, intelligence: 50, mana: 500 }, setId: 'void_set' },
        materials: [
            { itemId: 'void_fragment', count: 8 },
            { itemId: 'void_set_fragment', count: 2 },
            { itemId: 'shadow_essence', count: 10 },
            { itemId: 'crystal', count: 100 },
        ],
    },
    {
        id: 'void_set_weapon', category: 'set', levelReq: 30, goldCost: 65000,
        resultItem: { id: 'weapon_void_set', name: 'Hiçlik Asası', type: 'weapon', tier: 5, rarity: 'legendary', value: 28000, stats: { damage: 500, intelligence: 150, mana: 800, voidDamage: 150 }, setId: 'void_set' },
        materials: [
            { itemId: 'void_fragment', count: 12 },
            { itemId: 'void_set_fragment', count: 3 },
            { itemId: 'shadow_essence', count: 15 },
            { itemId: 'crystal', count: 150 },
        ],
    },
];

// ==============================================================
// COMPONENT
// ==============================================================
const RecipeCraftingView: React.FC<RecipeCraftingViewProps> = ({ playerState, onCraft, onClose }) => {
    const [selectedCategory, setSelectedCategory] = useState<'all' | 'weapon' | 'armor' | 'consumable' | 'set' | 'craftable'>('all');
    const [selectedRecipe, setSelectedRecipe] = useState<CraftingRecipe | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCrafting, setIsCrafting] = useState(false);

    // Malzeme sayısını al
    const getMaterialCount = (itemId: string) => {
        return playerState.inventory.filter(i =>
            i.id === itemId ||
            i.id.startsWith(itemId) ||
            i.id.includes(itemId)
        ).length;
    };

    // Craft yapılabilir mi?
    const canCraft = (recipe: CraftingRecipe) => {
        const playerGold = (playerState as any).gold || playerState.credits || 0;
        if (playerGold < recipe.goldCost) return false;
        if (playerState.level < recipe.levelReq) return false;
        for (const mat of recipe.materials) {
            if (getMaterialCount(mat.itemId) < mat.count) return false;
        }
        return true;
    };

    // Filtreleme - "Üretilebilir" kategorisi için sadece yapılabilenleri göster
    const filteredRecipes = useMemo(() => {
        return RECIPES.filter(recipe => {
            // Kategori filtresi
            if (selectedCategory === 'craftable') {
                return canCraft(recipe);
            }
            const matchesCategory = selectedCategory === 'all' || recipe.category === selectedCategory;
            const matchesSearch = recipe.resultItem.name.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [selectedCategory, searchTerm, playerState.inventory]);

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
        return CRAFT_MATERIALS[itemId as keyof typeof CRAFT_MATERIALS] || { name: itemId.replace(/_/g, ' '), tier: 1, rarity: 'common', dropSource: 'Bilinmiyor' };
    };

    return (
        <div className="w-full h-full flex flex-col bg-[#0a0a12]">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
                <h2 className="text-xl font-bold text-blue-400 mb-3 flex items-center gap-2">
                    <FlaskConical size={24} /> Üretim Tezgahı
                </h2>

                {/* Arama */}
                <div className="relative mb-3">
                    <input
                        type="text"
                        placeholder="Tarif ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-black/60 border border-slate-700 rounded-lg p-2 pl-9 text-sm text-white focus:border-blue-600 outline-none"
                    />
                    <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
                </div>

                {/* Kategoriler */}
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {[
                        { id: 'all', icon: Hammer, label: 'Tümü', color: 'yellow' },
                        { id: 'craftable', icon: Sparkles, label: 'Üretilebilir', color: 'green' },
                        { id: 'weapon', icon: Sword, label: 'Silah', color: 'red' },
                        { id: 'armor', icon: Shield, label: 'Zırh', color: 'blue' },
                        { id: 'consumable', icon: FlaskConical, label: 'İksir', color: 'pink' },
                        { id: 'set', icon: Crown, label: 'Set', color: 'orange' },
                    ].map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id as any)}
                            className={`px-3 py-1.5 rounded text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${selectedCategory === cat.id
                                ? `bg-${cat.color}-700 text-white`
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                }`}
                        >
                            <cat.icon size={14} /> {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* İçerik */}
            <div className="flex-1 flex overflow-hidden">
                {/* Sol - Tarif Listesi */}
                <div className="w-1/3 border-r border-slate-800 overflow-y-auto p-2 space-y-1">
                    {filteredRecipes.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                            <p>Bu kategoride tarif bulunamadı.</p>
                        </div>
                    ) : (
                        filteredRecipes.map(recipe => {
                            const craftable = canCraft(recipe);
                            return (
                                <button
                                    key={recipe.id}
                                    onClick={() => setSelectedRecipe(recipe)}
                                    className={`w-full text-left p-2 rounded-lg border transition-all flex items-center gap-3 ${selectedRecipe?.id === recipe.id
                                        ? 'bg-blue-900/30 border-blue-600'
                                        : craftable
                                            ? 'bg-slate-900/60 border-green-700/50 hover:border-green-500'
                                            : 'bg-slate-900/40 border-slate-700/50 hover:border-slate-600'
                                        }`}
                                >
                                    <div className={`w-10 h-10 rounded border flex items-center justify-center bg-black/60 ${getRarityColor(recipe.resultItem.rarity)}`}>
                                        <span className="text-lg">T{recipe.resultItem.tier}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className={`font-bold text-sm truncate ${getRarityColor(recipe.resultItem.rarity).split(' ')[0]}`}>
                                            {recipe.resultItem.name}
                                        </div>
                                        <div className="text-[10px] text-slate-500">Lvl {recipe.levelReq}</div>
                                    </div>
                                    {craftable && <CheckCircle size={16} className="text-green-500 flex-shrink-0" />}
                                </button>
                            );
                        })
                    )}
                </div>

                {/* Sağ - Detay */}
                <div className="flex-1 p-4 overflow-y-auto">
                    {selectedRecipe ? (
                        <div className="space-y-4">
                            {/* Başlık */}
                            <div className="flex items-center gap-4 pb-4 border-b border-slate-700">
                                <div className={`w-16 h-16 rounded-xl border-2 flex items-center justify-center bg-black/60 ${getRarityColor(selectedRecipe.resultItem.rarity)}`}>
                                    <span className="text-2xl font-bold">T{selectedRecipe.resultItem.tier}</span>
                                </div>
                                <div>
                                    <h3 className={`text-2xl font-bold ${getRarityColor(selectedRecipe.resultItem.rarity).split(' ')[0]}`}>
                                        {selectedRecipe.resultItem.name}
                                    </h3>
                                    <div className="flex gap-2 mt-1">
                                        <span className="text-xs bg-slate-800 px-2 py-0.5 rounded">{selectedRecipe.category}</span>
                                        <span className="text-xs bg-yellow-900/50 text-yellow-400 px-2 py-0.5 rounded">Seviye {selectedRecipe.levelReq}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Statlar */}
                            <div className="bg-slate-900/50 p-3 rounded-lg">
                                <h4 className="text-sm font-bold text-blue-400 mb-2 flex items-center gap-2"><Star size={14} /> Özellikler</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {Object.entries(selectedRecipe.resultItem.stats || {}).map(([key, val]) => (
                                        <div key={key} className="flex justify-between bg-black/30 px-2 py-1 rounded text-sm">
                                            <span className="text-slate-400 capitalize">{key}</span>
                                            <span className="text-white font-bold">+{val}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Malzemeler */}
                            <div className="bg-slate-900/50 p-3 rounded-lg">
                                <h4 className="text-sm font-bold text-yellow-400 mb-2 flex items-center gap-2"><Scroll size={14} /> Gerekli Malzemeler</h4>
                                <div className="space-y-2">
                                    {selectedRecipe.materials.map((mat, idx) => {
                                        const playerHas = getMaterialCount(mat.itemId);
                                        const isEnough = playerHas >= mat.count;
                                        const matInfo = getMaterialInfo(mat.itemId);
                                        return (
                                            <div key={idx} className="flex justify-between items-center bg-black/40 p-2 rounded-lg border border-slate-700/50">
                                                <div>
                                                    <div className={`font-medium text-sm ${getRarityColor(matInfo.rarity).split(' ')[0]}`}>
                                                        {matInfo.name}
                                                    </div>
                                                    <div className="text-[10px] text-slate-500">📍 {matInfo.dropSource}</div>
                                                </div>
                                                <div className={`font-bold flex items-center gap-2 ${isEnough ? 'text-green-400' : 'text-red-400'}`}>
                                                    {playerHas} / {mat.count}
                                                    {isEnough ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Maliyet */}
                            <div className="flex justify-between items-center bg-yellow-900/20 p-3 rounded-lg border border-yellow-700/50">
                                <span className="text-slate-300">Üretim Maliyeti</span>
                                <span className={`font-bold text-lg ${((playerState as any).gold || playerState.credits || 0) >= selectedRecipe.goldCost ? 'text-yellow-400' : 'text-red-400'}`}>
                                    {selectedRecipe.goldCost.toLocaleString()} Altın
                                </span>
                            </div>

                            {/* Craft Butonu */}
                            <button
                                onClick={handleCraftClick}
                                disabled={!canCraft(selectedRecipe) || isCrafting}
                                className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${isCrafting
                                    ? 'bg-slate-700 cursor-wait'
                                    : canCraft(selectedRecipe)
                                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg'
                                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                    }`}
                            >
                                {isCrafting ? (
                                    <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> ÜRETİLİYOR...</>
                                ) : canCraft(selectedRecipe) ? (
                                    <><Hammer size={20} /> EŞYAYI ÜRET</>
                                ) : (
                                    <><Lock size={18} /> EKSİK MALZEME</>
                                )}
                            </button>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-600">
                            <Hammer size={60} className="mb-4 opacity-30" />
                            <p className="font-bold">Bir tarif seç</p>
                            <p className="text-sm mt-1 opacity-60">Sol menüden tarif seçerek detayları gör</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RecipeCraftingView;
