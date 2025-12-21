import React, { useState } from 'react';
import { Item, PlayerState, PetItem, WingItem } from '../types';
import { ShoppingBasket, Shield, Sword, Box, DollarSign, X, Bird, Feather, Sparkles } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { POTIONS, PETS_DATA, WINGS_DATA, ARMOR_SETS } from '../constants';

interface NpcShopViewProps {
    playerState: PlayerState;
    onBuy: (item: Item, cost: number) => void;
    onBuyPet?: (pet: PetItem, cost: number) => void;
    onBuyWing?: (wing: WingItem, cost: number) => void;
    onClose: () => void;
}

// Free pets (first 3)
const FREE_PETS = ['pet_plains', 'pet_grass', 'pet_desert'];

// Pet prices by tier
const PET_PRICES: Record<number, number> = {
    1: 5000,
    2: 15000,
    3: 50000,
    4: 150000,
    5: 500000
};

// Wing prices by tier
const WING_PRICES: Record<number, number> = {
    1: 10000,
    2: 30000,
    3: 100000,
    4: 300000,
    5: 1000000
};

// Basic Shops Stock - ONLY T1-T2 ITEMS (Higher tiers from drops/crafting)
// Prices are HIGH to encourage player economy
const SHOP_ITEMS: Item[] = [
    // Consumables (pahalı!)
    ...POTIONS.map(p => ({ ...p, value: (p.value || 50) * 5 })), // 5x pahalı
    // Basic Gear (ONLY T1-T2)
    { id: 'shop_w1', name: 'Acemi Kılıcı', tier: 1, type: 'weapon', rarity: 'common', value: 500 },
    { id: 'shop_w2', name: 'Çelik Kılıcı', tier: 2, type: 'weapon', rarity: 'uncommon', value: 2500 },
    { id: 'shop_a1', name: 'Deri Zırh', tier: 1, type: 'armor', rarity: 'common', value: 400 },
    { id: 'shop_a2', name: 'Çelik Zırh', tier: 2, type: 'armor', rarity: 'uncommon', value: 2000 },
    // Materials (pahalı - oyuncular arasında ekonomi için)
    { id: 'shop_m1', name: 'Boş Şişe', tier: 1, type: 'material', rarity: 'common', value: 50 },
    { id: 'shop_m2', name: 'Demir Külçe', tier: 1, type: 'material', rarity: 'common', value: 200 },
    // Upgrade Scrolls - ONLY T1-T2 (T3+ from drops/crafting!)
    { id: 'scroll_t1', name: 'Kutsal Parşömen (T1)', tier: 1, type: 'upgrade_scroll', rarity: 'common', value: 2500, description: 'Sadece T1 ekipman yükseltir' },
    { id: 'scroll_t2', name: 'Kutsal Parşömen (T2)', tier: 2, type: 'upgrade_scroll', rarity: 'uncommon', value: 10000, description: 'Sadece T2 ekipman yükseltir' },
];

const NpcShopView: React.FC<NpcShopViewProps> = ({ playerState, onBuy, onBuyPet, onBuyWing, onClose }) => {
    const [filter, setFilter] = useState<'all' | 'consumable' | 'gear' | 'pets' | 'wings'>('all');

    // Calculate discounted price based on premium benefits
    const getDiscountedPrice = (basePrice: number): number => {
        if (playerState.premiumBenefits?.discountPercent) {
            return Math.floor(basePrice * (1 - playerState.premiumBenefits.discountPercent / 100));
        }
        return basePrice;
    };

    const filteredItems = SHOP_ITEMS.filter(item => {
        if (filter === 'consumable') return item.type === 'consumable' || item.type === 'material' || item.type === 'upgrade_scroll';
        if (filter === 'gear') return ['weapon', 'armor', 'helmet', 'pants', 'necklace', 'earring'].includes(item.type);
        if (filter === 'pets' || filter === 'wings') return false; // handled separately
        return true;
    });

    // Check if player owns pet
    const ownsPet = (petId: string) => playerState.ownedPets?.some(p => p.id === petId);
    const ownsWing = (wingId: string) => playerState.ownedWings?.some(w => w.id === wingId);

    const getTierColor = (tier: number) => {
        switch (tier) {
            case 1: return 'text-slate-400';
            case 2: return 'text-green-400';
            case 3: return 'text-blue-400';
            case 4: return 'text-purple-400';
            case 5: return 'text-orange-400';
            default: return 'text-slate-400';
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#1a1410] text-amber-100 border-l border-[#3f2e26]">
            {/* Header */}
            <div className="p-6 border-b border-[#5e4b35] flex justify-between items-center bg-[#291d18]">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-amber-900/40 rounded-lg flex items-center justify-center border border-amber-700">
                        <ShoppingBasket size={24} className="text-amber-500" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold font-serif text-amber-200">Köy Pazarı</h2>
                        <p className="text-xs text-amber-500/80">
                            Temel İhtiyaçlar, Teçhizat, Yoldaşlar ve Kanatlar
                            {playerState.premiumBenefits?.discountPercent && (
                                <span className="ml-2 text-green-400">({playerState.premiumBenefits.discountPercent}% İndirim!)</span>
                            )}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-black/30 px-4 py-2 rounded flex items-center gap-2 border border-amber-900/30">
                        <DollarSign size={16} className="text-yellow-500" />
                        <span className="font-mono font-bold">{playerState.credits.toLocaleString()}</span>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full"><X size={20} /></button>
                </div>
            </div>

            {/* Filters */}
            <div className="p-2 bg-[#231814] flex gap-2 overflow-x-auto shadow-inner">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded text-xs font-bold transition-all ${filter === 'all' ? 'bg-amber-700 text-white' : 'bg-transparent text-amber-700 hover:bg-amber-900/20'}`}
                >
                    TÜMÜ
                </button>
                <button
                    onClick={() => setFilter('consumable')}
                    className={`px-4 py-2 rounded text-xs font-bold transition-all flex items-center gap-2 ${filter === 'consumable' ? 'bg-amber-700 text-white' : 'bg-transparent text-amber-700 hover:bg-amber-900/20'}`}
                >
                    <Box size={14} /> TÜKETİM
                </button>
                <button
                    onClick={() => setFilter('gear')}
                    className={`px-4 py-2 rounded text-xs font-bold transition-all flex items-center gap-2 ${filter === 'gear' ? 'bg-amber-700 text-white' : 'bg-transparent text-amber-700 hover:bg-amber-900/20'}`}
                >
                    <Shield size={14} /> EKİPMAN
                </button>
                <button
                    onClick={() => setFilter('pets')}
                    className={`px-4 py-2 rounded text-xs font-bold transition-all flex items-center gap-2 ${filter === 'pets' ? 'bg-green-700 text-white' : 'bg-transparent text-green-700 hover:bg-green-900/20'}`}
                >
                    <Bird size={14} /> YOLDAŞLAR
                </button>
                <button
                    onClick={() => setFilter('wings')}
                    className={`px-4 py-2 rounded text-xs font-bold transition-all flex items-center gap-2 ${filter === 'wings' ? 'bg-purple-700 text-white' : 'bg-transparent text-purple-700 hover:bg-purple-900/20'}`}
                >
                    <Feather size={14} /> KANATLAR
                </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-amber-800">
                {/* PETS TAB */}
                {filter === 'pets' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {PETS_DATA.map(pet => {
                            const isFree = FREE_PETS.includes(pet.id);
                            const owned = ownsPet(pet.id);
                            const basePrice = isFree ? 0 : PET_PRICES[pet.tier] || 10000;
                            const price = getDiscountedPrice(basePrice);

                            return (
                                <div key={pet.id} className={`bg-[#291d18] border ${owned ? 'border-green-600' : 'border-[#4a3b32]'} p-3 rounded hover:border-amber-600 transition-colors group`}>
                                    <div className="flex gap-3">
                                        <div className="w-14 h-14 bg-black/40 rounded-lg flex items-center justify-center border border-[#3f2e26]" style={{ borderColor: pet.color }}>
                                            <span className="text-2xl">🐾</span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <div className={`text-sm font-bold ${getTierColor(pet.tier)}`}>{pet.name}</div>
                                                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-700" style={{ color: pet.color }}>T{pet.tier}</span>
                                            </div>
                                            <div className="text-[10px] text-slate-400 mt-1">
                                                +{pet.bonusExpRate}% EXP • +{pet.bonusDefense} Zırh
                                                {pet.bonusDamage && ` • +${pet.bonusDamage} Hasar`}
                                            </div>
                                            <div className="flex justify-between items-center mt-2">
                                                {owned ? (
                                                    <span className="text-green-400 text-xs font-bold">✓ SAHİPSİN</span>
                                                ) : (
                                                    <>
                                                        <span className="text-yellow-500 font-mono text-xs font-bold">
                                                            {isFree ? 'ÜCRETSİZ' : `${price.toLocaleString()} G`}
                                                        </span>
                                                        <button
                                                            onClick={() => onBuyPet?.(pet, price)}
                                                            disabled={playerState.credits < price && !isFree}
                                                            className={`px-3 py-1 text-[10px] font-bold rounded border ${playerState.credits >= price || isFree
                                                                ? 'bg-green-700 hover:bg-green-600 border-green-600 text-white'
                                                                : 'bg-slate-700 border-slate-600 text-slate-400 cursor-not-allowed'
                                                                }`}
                                                        >
                                                            {isFree ? 'AL' : 'SATIN AL'}
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* WINGS TAB */}
                {filter === 'wings' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {WINGS_DATA.map(wing => {
                            const owned = ownsWing(wing.id);
                            const basePrice = WING_PRICES[wing.tier] || 50000;
                            const price = getDiscountedPrice(basePrice);

                            return (
                                <div key={wing.id} className={`bg-[#291d18] border ${owned ? 'border-purple-600' : 'border-[#4a3b32]'} p-3 rounded hover:border-amber-600 transition-colors group`}>
                                    <div className="flex gap-3">
                                        <div className="w-14 h-14 bg-black/40 rounded-lg flex items-center justify-center border border-[#3f2e26]" style={{ borderColor: wing.color }}>
                                            <span className="text-2xl">🪽</span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <div className={`text-sm font-bold ${getTierColor(wing.tier)}`}>{wing.name}</div>
                                                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-700" style={{ color: wing.color }}>T{wing.tier}</span>
                                            </div>
                                            <div className="text-[10px] text-slate-400 mt-1">
                                                +{wing.bonusDamage} Hasar • +{wing.bonusHp} Can
                                                {wing.bonusDefense && ` • +${wing.bonusDefense} Zırh`}
                                            </div>
                                            <div className="flex justify-between items-center mt-2">
                                                {owned ? (
                                                    <span className="text-purple-400 text-xs font-bold">✓ SAHİPSİN</span>
                                                ) : (
                                                    <>
                                                        <span className="text-yellow-500 font-mono text-xs font-bold">{price.toLocaleString()} G</span>
                                                        <button
                                                            onClick={() => onBuyWing?.(wing, price)}
                                                            disabled={playerState.credits < price}
                                                            className={`px-3 py-1 text-[10px] font-bold rounded border ${playerState.credits >= price
                                                                ? 'bg-purple-700 hover:bg-purple-600 border-purple-600 text-white'
                                                                : 'bg-slate-700 border-slate-600 text-slate-400 cursor-not-allowed'
                                                                }`}
                                                        >
                                                            SATIN AL
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ITEMS (default view) */}
                {filter !== 'pets' && filter !== 'wings' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {filteredItems.map(item => {
                            const originalPrice = item.value || 100;
                            const discountedPrice = getDiscountedPrice(originalPrice);
                            const hasDiscount = discountedPrice < originalPrice;

                            return (
                                <div key={item.id} className="bg-[#291d18] border border-[#4a3b32] p-3 rounded flex gap-3 hover:border-amber-600 transition-colors group">
                                    <div className="w-12 h-12 bg-black/40 rounded flex items-center justify-center border border-[#3f2e26] relative">
                                        {item.type === 'consumable' ? <Box size={20} className="text-red-400" /> :
                                            item.type === 'upgrade_scroll' ? <Sparkles size={20} className="text-blue-400" /> :
                                                <Sword size={20} className="text-slate-400" />}
                                        {item.tier && <span className="absolute -top-1 -right-1 bg-slate-800 text-[8px] px-1 rounded text-amber-400">T{item.tier}</span>}
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="text-sm font-bold text-amber-100 group-hover:text-white">{item.name}</div>
                                            <div className="text-[10px] text-amber-500/60 uppercase">{item.type}</div>
                                            {/* Show stats/buffs */}
                                            {(item as any).damage && <div className="text-[9px] text-red-400">+{(item as any).damage} Hasar</div>}
                                            {(item as any).defense && <div className="text-[9px] text-blue-400">+{(item as any).defense} Savunma</div>}
                                            {(item as any).hp && <div className="text-[9px] text-green-400">+{(item as any).hp} Can</div>}
                                            {(item as any).description && <div className="text-[9px] text-slate-400 italic">{(item as any).description}</div>}
                                        </div>
                                        <div className="flex justify-between items-center mt-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-yellow-500 font-mono text-xs font-bold">{discountedPrice.toLocaleString()} G</span>
                                                {hasDiscount && (
                                                    <span className="text-slate-500 font-mono text-[10px] line-through">{originalPrice.toLocaleString()} G</span>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => onBuy({ ...item, id: uuidv4() }, discountedPrice)}
                                                className="px-3 py-1 bg-[#3f2e26] hover:bg-amber-700 text-[10px] font-bold rounded border border-amber-900/50 text-amber-200"
                                            >
                                                SATIN AL
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NpcShopView;

