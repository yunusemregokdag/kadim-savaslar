import React, { useState, useMemo } from 'react';
import { Hammer, Scroll, Lock, CheckCircle, XCircle, Search, Sword, Shield, FlaskConical, Zap } from 'lucide-react';
import { Item, CraftingRecipe, PlayerState } from '../types';
import { soundManager } from './SoundManager';

interface RecipeCraftingViewProps {
    playerState: PlayerState;
    onCraft: (recipe: CraftingRecipe) => void;
    onClose: () => void;
}

// EXPANDED RECIPES LIST
const RECIPES: CraftingRecipe[] = [
    // --- CONSUMABLES ---
    {
        id: 'hp_potion_medium',
        resultItem: { id: 'potion_hp_medium', name: 'Orta Can İksiri', type: 'consumable', tier: 2, rarity: 'common', value: 50, stats: { hp: 500 }, image: 'https://placehold.co/64/red/white?text=HP++' },
        materials: [{ itemId: 'herb_green', count: 3 }],
        goldCost: 50, levelReq: 5, category: 'consumable'
    },
    {
        id: 'hp_potion_large',
        resultItem: { id: 'potion_hp_large', name: 'Büyük Can İksiri', type: 'consumable', tier: 3, rarity: 'uncommon', value: 150, stats: { hp: 1500 }, image: 'https://placehold.co/64/red/white?text=HP+++' },
        materials: [{ itemId: 'herb_green', count: 10 }],
        goldCost: 200, levelReq: 15, category: 'consumable'
    },
    {
        id: 'mp_potion_medium',
        resultItem: { id: 'potion_mp_medium', name: 'Orta Mana İksiri', type: 'consumable', tier: 2, rarity: 'common', value: 50, stats: { mana: 300 }, image: 'https://placehold.co/64/blue/white?text=MP++' },
        materials: [{ itemId: 'herb_green', count: 3 }],
        goldCost: 50, levelReq: 5, category: 'consumable'
    },

    // --- WEAPONS ---
    // TIER 2 (IRON) - Level 10
    {
        id: 'sword_iron',
        resultItem: { id: 'sword_t2_crafted', name: 'Usta İşi Demir Kılıç', type: 'weapon', tier: 2, rarity: 'uncommon', value: 250, stats: { damage: 45, strength: 5 }, visuals: { model: 'sword', subType: 'long', primaryColor: '#aaa' } },
        materials: [{ itemId: 'iron_ore', count: 10 }, { itemId: 'wood_log', count: 5 }],
        goldCost: 200, levelReq: 10, category: 'weapon'
    },
    {
        id: 'staff_oak',
        resultItem: { id: 'staff_t2_crafted', name: 'Budaklı Asa', type: 'weapon', tier: 2, rarity: 'uncommon', value: 250, stats: { damage: 35, intelligence: 8 }, visuals: { model: 'staff', subType: 'nature', primaryColor: '#8B4513' } },
        materials: [{ itemId: 'wood_log', count: 15 }],
        goldCost: 200, levelReq: 10, category: 'weapon'
    },
    {
        id: 'bow_recurve',
        resultItem: { id: 'bow_t2_crafted', name: 'Kompozit Yay', type: 'weapon', tier: 2, rarity: 'uncommon', value: 250, stats: { damage: 40, dexterity: 6 }, visuals: { model: 'bow', subType: 'recurve', primaryColor: '#5C4033' } },
        materials: [{ itemId: 'wood_log', count: 10 }, { itemId: 'leather_scrap', count: 5 }],
        goldCost: 200, levelReq: 10, category: 'weapon'
    },

    // TIER 3 (STEEL/HARD) - Level 18
    {
        id: 'sword_steel',
        resultItem: { id: 'sword_t3_crafted', name: 'Çelik Kılıç', type: 'weapon', tier: 3, rarity: 'rare', value: 1000, stats: { damage: 120, strength: 15, critChance: 5 }, visuals: { model: 'sword', subType: 'broad', primaryColor: '#b0c4de' } },
        materials: [{ itemId: 'iron_ore', count: 40 }, { itemId: 'leather_scrap', count: 10 }],
        goldCost: 1000, levelReq: 18, category: 'weapon'
    },
    {
        id: 'axe_battle',
        resultItem: { id: 'axe_t3_crafted', name: 'Savaş Baltası', type: 'weapon', tier: 3, rarity: 'rare', value: 1000, stats: { damage: 135, strength: 20 }, visuals: { model: 'axe', subType: 'battle', primaryColor: '#708090' } },
        materials: [{ itemId: 'iron_ore', count: 45 }, { itemId: 'wood_log', count: 10 }],
        goldCost: 1000, levelReq: 18, category: 'weapon'
    },

    // TIER 4 (MYTHRIL/ELDER) - Level 24
    {
        id: 'sword_mythril',
        resultItem: { id: 'sword_t4_crafted', name: 'Mithril Kılıç', type: 'weapon', tier: 4, rarity: 'epic', value: 5000, stats: { damage: 250, strength: 30, critChance: 10 }, visuals: { model: 'sword', subType: 'crystal', primaryColor: '#00ffff' } },
        materials: [{ itemId: 'iron_ore', count: 100 }, { itemId: 'leather_scrap', count: 50 }],
        goldCost: 5000, levelReq: 24, category: 'weapon'
    },

    // --- ARMOR ---
    // TIER 2
    {
        id: 'armor_leather_rigid',
        resultItem: { id: 'armor_t2_crafted', name: 'Sertleştirilmiş Deri Zırh', type: 'armor', tier: 2, rarity: 'uncommon', value: 200, stats: { defense: 25, dexterity: 5 }, visuals: { model: 'armor', primaryColor: '#8B4513' } },
        materials: [{ itemId: 'leather_scrap', count: 15 }],
        goldCost: 150, levelReq: 10, category: 'armor'
    },
    // TIER 3
    {
        id: 'armor_chain',
        resultItem: { id: 'armor_t3_crafted', name: 'Zincir Zırh', type: 'armor', tier: 3, rarity: 'rare', value: 800, stats: { defense: 60, strength: 10 }, visuals: { model: 'armor', primaryColor: '#778899' } },
        materials: [{ itemId: 'iron_ore', count: 30 }, { itemId: 'leather_scrap', count: 10 }],
        goldCost: 800, levelReq: 18, category: 'armor'
    },
    // TIER 4
    {
        id: 'armor_plate',
        resultItem: { id: 'armor_t4_crafted', name: 'Ağır Plaka Zırh', type: 'armor', tier: 4, rarity: 'epic', value: 4500, stats: { defense: 150, hp: 500 }, visuals: { model: 'armor', primaryColor: '#ffd700' } },
        materials: [{ itemId: 'iron_ore', count: 150 }],
        goldCost: 4000, levelReq: 24, category: 'armor'
    },
    // --- TIER 5 (LEGENDARY) --- Level 30 (MAX)
    // Requires EXTENSIVE gathering and gold
    {
        id: 'sword_dragon_t5',
        resultItem: { id: 'sword_t5_crafted', name: 'Ejderha Ateşi Kılıcı', type: 'weapon', tier: 5, rarity: 'legendary', value: 20000, stats: { damage: 500, strength: 100, critChance: 25 }, visuals: { model: 'sword', subType: 'magma', primaryColor: '#ef4444' } },
        materials: [{ itemId: 'iron_ore', count: 500 }, { itemId: 'crystal', count: 50 }],
        goldCost: 20000, levelReq: 30, category: 'weapon'
    },
    {
        id: 'staff_void_t5',
        resultItem: { id: 'staff_t5_crafted', name: 'Hiçlik Asası', type: 'weapon', tier: 5, rarity: 'legendary', value: 20000, stats: { damage: 450, intelligence: 120, mana: 500 }, visuals: { model: 'staff', subType: 'crystal', primaryColor: '#8b5cf6' } },
        materials: [{ itemId: 'wood_log', count: 500 }, { itemId: 'crystal', count: 50 }],
        goldCost: 20000, levelReq: 30, category: 'weapon'
    },
    {
        id: 'bow_celestial_t5',
        resultItem: { id: 'bow_t5_crafted', name: 'Gökyüzü Yayı', type: 'weapon', tier: 5, rarity: 'legendary', value: 20000, stats: { damage: 420, dexterity: 110, critChance: 30 }, visuals: { model: 'bow', subType: 'recurve', primaryColor: '#0ea5e9' } },
        materials: [{ itemId: 'wood_log', count: 300 }, { itemId: 'leather_scrap', count: 200 }, { itemId: 'crystal', count: 50 }],
        goldCost: 20000, levelReq: 30, category: 'weapon'
    },
    {
        id: 'armor_dragon_t5',
        resultItem: { id: 'armor_t5_crafted', name: 'Ejderha Pulu Zırh', type: 'armor', tier: 5, rarity: 'legendary', value: 15000, stats: { defense: 300, hp: 2000, strength: 20 }, visuals: { model: 'armor', primaryColor: '#ef4444' } },
        materials: [{ itemId: 'iron_ore', count: 500 }, { itemId: 'leather_scrap', count: 200 }, { itemId: 'crystal', count: 50 }],
        goldCost: 15000, levelReq: 30, category: 'armor'
    }
];

const RecipeCraftingView: React.FC<RecipeCraftingViewProps> = ({ playerState, onCraft, onClose }) => {
    const [selectedCategory, setSelectedCategory] = useState<'all' | 'weapon' | 'armor' | 'consumable'>('all');
    const [selectedRecipe, setSelectedRecipe] = useState<CraftingRecipe | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCrafting, setIsCrafting] = useState(false);

    const filteredRecipes = useMemo(() => {
        return RECIPES.filter(recipe => {
            const matchesCategory = selectedCategory === 'all' || recipe.category === selectedCategory;
            const matchesSearch = recipe.resultItem.name.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [selectedCategory, searchTerm]);

    const canCraft = (recipe: CraftingRecipe) => {
        const playerGold = (playerState as any).gold || playerState.credits || 0;
        if (playerGold < recipe.goldCost) return false;
        if (playerState.level < recipe.levelReq) return false;
        for (const mat of recipe.materials) {
            // Check both exact id match and base id match (for items with UUID suffix)
            const playerMatCount = playerState.inventory.filter(i =>
                i.id === mat.itemId ||
                i.id.startsWith(mat.itemId) ||
                i.id.includes(mat.itemId)
            ).length;
            if (playerMatCount < mat.count) return false;
        }
        return true;
    };

    const handleCraftClick = () => {
        if (!selectedRecipe || !canCraft(selectedRecipe) || isCrafting) return;
        setIsCrafting(true);
        soundManager.playSFX('click');
        setTimeout(() => {
            onCraft(selectedRecipe);
            setIsCrafting(false);
            soundManager.playSFX('upgrade_success'); // Corrected sound key from 'levelUp' to likely 'upgrade_success' or fallback
        }, 1500);
    };

    const getMaterialCount = (itemId: string) => {
        // Check both exact id match and base id match
        return playerState.inventory.filter(i =>
            i.id === itemId ||
            i.id.startsWith(itemId) ||
            i.id.includes(itemId)
        ).length;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-5xl bg-[#12121a] border border-yellow-800/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[85vh]">

                {/* Sidebar */}
                <div className="w-full md:w-1/3 bg-[#0a0a10] border-r border-slate-800 flex flex-col">
                    <div className="p-5 border-b border-slate-800 bg-slate-900/50">
                        <h2 className="text-xl font-bold text-yellow-500 mb-4 flex items-center gap-2">
                            <Hammer size={24} className="text-yellow-600" /> Üretim Tezgahı
                        </h2>

                        <div className="relative mb-4 group">
                            <input
                                type="text"
                                placeholder="Tarif ara..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-black/60 border border-slate-700 rounded-lg p-3 pl-10 text-sm text-white focus:border-yellow-600 outline-none transition-colors group-hover:border-slate-600"
                            />
                            <Search className="absolute left-3 top-3.5 text-slate-500" size={16} />
                        </div>

                        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar no-scrollbar">
                            {[{ id: 'all', icon: Hammer, label: 'Tümü' }, { id: 'weapon', icon: Sword, label: 'Silah' }, { id: 'armor', icon: Shield, label: 'Zırh' }, { id: 'consumable', icon: FlaskConical, label: 'İksir' }].map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id as any)}
                                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${selectedCategory === cat.id
                                        ? 'bg-yellow-700 text-white shadow-lg shadow-yellow-900/20'
                                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                                        }`}
                                >
                                    <cat.icon size={14} /> {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                        {filteredRecipes.map(recipe => (
                            <button
                                key={recipe.id}
                                onClick={() => { setSelectedRecipe(recipe); soundManager.playSFX('click'); }}
                                className={`w-full text-left p-3 rounded-xl border transition-all flex items-center gap-4 group relative overflow-hidden ${selectedRecipe?.id === recipe.id
                                    ? 'bg-gradient-to-r from-yellow-900/20 to-transparent border-yellow-700/50'
                                    : 'bg-slate-900/40 border-transparent hover:bg-slate-800'
                                    }`}
                            >
                                <div className={`relative w-12 h-12 rounded-lg border flex items-center justify-center bg-black/60 shadow-inner ${recipe.resultItem.rarity === 'common' ? 'border-slate-600' :
                                    recipe.resultItem.rarity === 'uncommon' ? 'border-green-600' :
                                        recipe.resultItem.rarity === 'rare' ? 'border-blue-600' :
                                            recipe.resultItem.rarity === 'epic' ? 'border-purple-600' : 'border-orange-600'
                                    }`}>
                                    {recipe.resultItem.image ? (
                                        <img src={recipe.resultItem.image} alt="" className="w-8 h-8 object-contain drop-shadow" />
                                    ) : (
                                        <Hammer size={20} className="text-slate-500" />
                                    )}
                                </div>
                                <div>
                                    <div className={`font-bold text-sm mb-0.5 ${recipe.resultItem.rarity === 'common' ? 'text-slate-300' :
                                        recipe.resultItem.rarity === 'uncommon' ? 'text-green-400' :
                                            recipe.resultItem.rarity === 'rare' ? 'text-blue-400' :
                                                recipe.resultItem.rarity === 'epic' ? 'text-purple-400' : 'text-orange-400'
                                        }`}>{recipe.resultItem.name}</div>
                                    <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Lvl {recipe.levelReq} • Tier {recipe.resultItem.tier}</div>
                                </div>
                                {selectedRecipe?.id === recipe.id && <div className="absolute right-0 top-0 bottom-0 w-1 bg-yellow-600 shadow-[0_0_10px_#ca8a04]" />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 bg-[#151520] p-8 flex flex-col relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #64748b 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

                    <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-slate-800/80 rounded-full hover:bg-red-500/20 hover:text-red-400 text-slate-400 transition-colors z-10"><XCircle size={24} /></button>

                    {selectedRecipe ? (
                        <div className="flex flex-col h-full z-10 animate-in slide-in-from-right-4 duration-300">
                            {/* Detailed Header */}
                            <div className="flex items-start gap-8 mb-8 border-b border-slate-700/50 pb-8">
                                <div className={`w-32 h-32 rounded-2xl border-4 shadow-2xl flex items-center justify-center bg-black/80 relative group ${selectedRecipe.resultItem.rarity === 'common' ? 'border-slate-600 shadow-slate-500/10' :
                                    selectedRecipe.resultItem.rarity === 'uncommon' ? 'border-green-600 shadow-green-500/20' :
                                        selectedRecipe.resultItem.rarity === 'rare' ? 'border-blue-600 shadow-blue-500/20' :
                                            selectedRecipe.resultItem.rarity === 'epic' ? 'border-purple-600 shadow-purple-500/20' : 'border-orange-600 shadow-orange-500/20'
                                    }`}>
                                    <img src={selectedRecipe.resultItem.image} alt="" className="w-20 h-20 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] group-hover:scale-110 transition-transform" />
                                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-slate-800 rounded-full border-2 border-slate-600 flex items-center justify-center text-xs font-bold text-white shadow-lg">T{selectedRecipe.resultItem.tier}</div>
                                </div>
                                <div className="flex-1 pt-2">
                                    <h2 className={`text-4xl font-black tracking-tight mb-2 ${selectedRecipe.resultItem.rarity === 'common' ? 'text-slate-200' :
                                        selectedRecipe.resultItem.rarity === 'uncommon' ? 'text-green-400' :
                                            selectedRecipe.resultItem.rarity === 'rare' ? 'text-blue-400' :
                                                selectedRecipe.resultItem.rarity === 'epic' ? 'text-purple-400' : 'text-orange-400 text-shadow-glow'
                                        }`}>{selectedRecipe.resultItem.name}</h2>
                                    <div className="flex flex-wrap gap-3 mb-4">
                                        <span className="bg-slate-900/80 px-3 py-1 rounded-full border border-slate-700 text-xs font-bold text-slate-400 uppercase tracking-widest">{selectedRecipe.category}</span>
                                        <span className="bg-yellow-900/30 px-3 py-1 rounded-full border border-yellow-700/50 text-xs font-bold text-yellow-500 flex items-center gap-1"><Zap size={10} /> Değer: {selectedRecipe.resultItem.value} Altın</span>
                                    </div>
                                    <p className="text-slate-400 text-sm italic max-w-md">Çok güçlü özelliklere sahip, usta işi bir eşya.</p>
                                </div>
                            </div>

                            {/* Requirements Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-auto">
                                <div className="bg-slate-900/30 p-5 rounded-2xl border border-slate-800/50">
                                    <h3 className="text-yellow-500 font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                                        <Scroll size={16} /> Gerekli Malzemeler
                                    </h3>
                                    <div className="space-y-3">
                                        {selectedRecipe.materials.map((mat, idx) => {
                                            const playerHas = getMaterialCount(mat.itemId);
                                            const isEnough = playerHas >= mat.count;
                                            return (
                                                <div key={idx} className="flex justify-between items-center bg-black/40 p-3 rounded-xl border border-slate-700/50 group hover:border-slate-500 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-xs text-slate-500 font-mono border border-slate-700">IMG</div>
                                                        <span className="text-slate-300 font-medium text-sm capitalize">{mat.itemId.replace('_', ' ')}</span>
                                                    </div>
                                                    <div className={`font-bold flex items-center gap-2 text-sm ${isEnough ? 'text-green-400' : 'text-red-400'}`}>
                                                        {playerHas} / {mat.count}
                                                        {isEnough ? <CheckCircle size={16} className="text-green-500" /> : <XCircle size={16} className="text-red-500" />}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-slate-900/30 p-5 rounded-2xl border border-slate-800/50">
                                        <h3 className="text-blue-400 font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                                            <Search size={16} /> Eşya Nitelikleri
                                        </h3>
                                        <div className="space-y-2">
                                            {Object.entries(selectedRecipe.resultItem.stats || {}).map(([key, val]) => (
                                                <div key={key} className="flex justify-between items-center bg-black/20 px-3 py-2 rounded-lg">
                                                    <span className="text-slate-400 capitalize text-sm font-medium">{key}</span>
                                                    <span className="text-white font-bold text-sm">+{val}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-slate-900/30 p-5 rounded-2xl border border-slate-800/50">
                                        <div className="flex justify-between items-center text-sm mb-3">
                                            <span className="text-slate-400">Üretim Maliyeti</span>
                                            <span className={`font-bold text-lg ${((playerState as any).gold || playerState.credits || 0) >= selectedRecipe.goldCost ? 'text-yellow-400' : 'text-red-400'}`}>
                                                {selectedRecipe.goldCost} <span className="text-xs text-yellow-600">Altın</span>
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-400">Gerekli Seviye</span>
                                            <span className={`font-bold text-lg ${playerState.level >= selectedRecipe.levelReq ? 'text-green-400' : 'text-red-400'}`}>
                                                {selectedRecipe.levelReq}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Craft Button */}
                            <button
                                onClick={handleCraftClick}
                                disabled={!canCraft(selectedRecipe) || isCrafting}
                                className={`w-full py-5 rounded-2xl font-black text-xl shadow-lg flex items-center justify-center gap-3 transition-all transform active:scale-95 ${isCrafting ? 'bg-slate-700 cursor-wait' :
                                    canCraft(selectedRecipe)
                                        ? 'bg-gradient-to-r from-yellow-600 to-orange-700 hover:from-yellow-500 hover:to-orange-600 text-white shadow-orange-900/50'
                                        : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
                                    }`}
                            >
                                {isCrafting ? (
                                    <>
                                        <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                                        ÜRETİLİYOR...
                                    </>
                                ) : canCraft(selectedRecipe) ? (
                                    <>
                                        <Hammer size={24} className="animate-bounce" /> EŞYAYI ÜRET
                                    </>
                                ) : (
                                    <>
                                        <Lock size={20} /> EKSİK MALZEME VEYA ALTIN
                                    </>
                                )}
                            </button>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-600 animate-pulse">
                            <Hammer size={80} className="mb-6 opacity-20" />
                            <p className="text-xl font-bold">Bir tarif seçerek üretime başla.</p>
                            <p className="text-sm mt-2 opacity-60">Sol menüden kategori seçebilir ve arama yapabilirsin.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RecipeCraftingView;
