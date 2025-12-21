
import React from 'react';
import { X, ShoppingBag, Droplet, Zap, Bird, Feather, Clock, Gem, Shield, Sword, Hammer, Book, Crosshair } from 'lucide-react';
import { Item, PetItem } from '../types';
import { POTIONS, PETS_DATA, WINGS_DATA, ALL_CLASS_ITEMS } from '../constants';
import { v4 as uuidv4 } from 'uuid';

interface MarketModalProps {
    onClose: () => void;
    playerCredits: number;
    inventory: Item[];
    onBuy: (cost: number, item: Item) => void;
    onSell: (value: number, itemId: string) => void;
}

const MarketModal: React.FC<MarketModalProps> = ({ onClose, playerCredits, inventory = [], onBuy, onSell }) => {
    const [activeTab, setActiveTab] = React.useState<'buy' | 'sell'>('buy');

    // ... (rest of item generation logic remains same for activeTab === 'buy')

    // Regular potions
    const potionItems = POTIONS.map(p => ({
        ...p,
        cost: p.tier === 1 ? 50 : 150,
        currency: 'gold',
        icon: p.name.includes('Can') ? <Droplet className="text-red-500" /> : <Zap className="text-blue-500" />,
        desc: undefined as string | undefined,
        rental: false
    }));

    // Special Market Pet
    const marketPet = PETS_DATA.find(p => p.type === 'owl');
    const petItems = marketPet ? [{
        id: 'market_pet_owl',
        name: marketPet.name,
        tier: 4 as const,
        type: 'pet_egg' as const,
        rarity: 'ancient' as const,
        value: 5000,
        cost: 5000,
        currency: 'gold', // For Rental
        rental: true,
        icon: <Bird className="text-yellow-500" />,
        desc: `PREMIUM: +${marketPet.bonusExpRate}% XP, +${marketPet.bonusDefense} Def, +${marketPet.bonusDamage} Dmg, +${marketPet.bonusHp} HP, +${marketPet.bonusMana} MP`
    }] : [];

    // Special Market Wing
    const marketWing = WINGS_DATA.find(w => w.type === 'seraph');
    const wingItems = marketWing ? [{
        id: 'market_wing_seraph',
        name: marketWing.name,
        tier: 4 as const,
        type: 'wing_fragment' as const,
        rarity: 'ancient' as const,
        value: 5000,
        cost: 5000,
        currency: 'gold', // For Rental
        rental: true,
        icon: <Feather className="text-yellow-400" />,
        desc: `PREMIUM: +${marketWing.bonusHonorRate}% Şeref, +${marketWing.bonusGoldRate}% Altın, +${marketWing.bonusDefense} Def, +${marketWing.bonusDamage} Dmg, +${marketWing.bonusHp} HP`
    }] : [];

    // Equipment Items
    const equipmentItems = ALL_CLASS_ITEMS.map(item => {
        let cost = 100;
        if (item.tier === 2) cost = 500;
        if (item.tier === 3) cost = 2500;
        if (item.tier === 4) cost = 10000;

        // Custom Icons based on logic or just generic lookups
        let icon = <Shield className="text-slate-400" />;
        if (item.type === 'weapon') icon = <Sword className={item.tier >= 4 ? "text-red-500" : "text-slate-300"} />;
        if (item.type === 'armor') icon = <Shield className={item.tier >= 4 ? "text-orange-500" : "text-slate-300"} />;
        if (item.name.includes('Asa') || item.name.includes('Kitap')) icon = <Book className="text-blue-400" />;
        if (item.name.includes('Yay')) icon = <Crosshair className="text-green-400" />;
        if (item.name.includes('Gürz')) icon = <Hammer className="text-yellow-400" />;

        return {
            ...item,
            cost,
            currency: 'gold',
            icon,
            desc: `Sınıf: ${item.classReq ? item.classReq.toUpperCase() : 'HEPSİ'}`,
            rental: false
        };
    });

    const allItems = [...potionItems, ...equipmentItems, ...petItems, ...wingItems];

    // Helper to calculate expiration
    const getExpiration = (type: 'rent' | 'buy') => {
        const now = Date.now();
        if (type === 'rent') return now + 10 * 60 * 1000; // 10 minutes
        return now + 30 * 24 * 60 * 60 * 1000; // 30 Days
    };

    const handleTransaction = (item: any, mode: 'rent' | 'buy') => {
        const cost = mode === 'rent' ? item.cost : 50; // 50 Gems for buy
        const expiration = getExpiration(mode);

        if (item.rental) {
            // Logic for Premium items
            if (item.type === 'pet_egg') {
                const newItem: Item = {
                    id: uuidv4(),
                    name: item.name,
                    tier: item.tier,
                    type: 'pet_egg',
                    rarity: item.rarity,
                    value: expiration // Passing expiration here
                };
                onBuy(cost, newItem);
            } else if (item.type === 'wing_fragment') {
                const newItem: Item = {
                    id: uuidv4(),
                    name: item.name,
                    tier: item.tier,
                    type: 'wing_fragment',
                    rarity: item.rarity,
                    value: expiration // Passing expiration here
                };
                onBuy(cost, newItem);
            }
        } else {
            // Logic for regular items
            const newItem: Item = {
                ...item,
                id: uuidv4()
            };
            onBuy(item.cost, newItem);
        }
    };

    return (
        <div className="absolute inset-0 z-[70] bg-black/70 flex items-center justify-center p-4">
            <div className="bg-[#1a120b] border-2 border-[#5e4b35] rounded-xl w-full max-w-2xl shadow-2xl animate-[fadeIn_0.2s]">
                <div className="flex justify-between items-center p-4 border-b border-[#3f2e18] bg-[#0f0a06]">
                    <h2 className="text-xl rpg-font text-[#e6cba5] flex items-center gap-2">
                        <ShoppingBag size={20} /> Köy Pazarı & Premium Mağaza
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                {/* TABS */}
                <div className="flex bg-[#0f0a06] border-b border-[#3f2e18]">
                    <button
                        onClick={() => setActiveTab('buy')}
                        className={`flex-1 py-3 text-sm font-bold transition-all ${activeTab === 'buy' ? 'bg-[#3f2e18] text-yellow-400' : 'text-slate-400 hover:bg-[#2a1f15]'}`}
                    >
                        SATIN AL
                    </button>
                    <button
                        onClick={() => setActiveTab('sell')}
                        className={`flex-1 py-3 text-sm font-bold transition-all ${activeTab === 'sell' ? 'bg-[#3f2e18] text-green-400' : 'text-slate-400 hover:bg-[#2a1f15]'}`}
                    >
                        EŞYA SAT
                    </button>
                </div>

                <div className="p-4 bg-[#2a1f15]">
                    {/* WALLET */}
                    <div className="flex justify-between items-center mb-4 bg-black/40 p-3 rounded border border-[#3f2e18]">
                        <span className="text-slate-400 text-sm">Cüzdan:</span>
                        <div className="flex gap-4">
                            <span className="text-yellow-400 font-bold">{playerCredits} Gold</span>
                            <span className="text-purple-400 font-bold flex items-center gap-1"><Gem size={12} /> 50 Elmas (Demo)</span>
                        </div>
                    </div>

                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                        {activeTab === 'buy' ? (
                            allItems.map(item => (
                                <div key={item.id} className="flex flex-col p-3 bg-[#0f0a06] border border-[#3f2e18] rounded hover:border-yellow-600 transition-colors">
                                    <div className="flex items-center justify-between w-full">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-[#1a120b] rounded flex items-center justify-center border border-[#3f2e18]">
                                                {item.icon}
                                            </div>
                                            <div>
                                                <div className="text-[#e6cba5] font-bold text-sm">{item.name}</div>
                                                <div className="text-xs text-slate-500">
                                                    T{item.tier} • {item.rarity.toUpperCase()}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            {item.rental ? (
                                                <>
                                                    <button
                                                        onClick={() => handleTransaction(item, 'rent')}
                                                        disabled={playerCredits < item.cost}
                                                        className={`px-3 py-2 rounded text-xs font-bold border flex flex-col items-center min-w-[80px] ${playerCredits >= item.cost ? 'bg-yellow-900/40 border-yellow-600 text-yellow-200 hover:bg-yellow-800/40' : 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed'}`}
                                                    >
                                                        <span>KİRALA (10dk)</span>
                                                        <span className="text-[10px] opacity-70">{item.cost} Gold</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleTransaction(item, 'buy')}
                                                        className="px-3 py-2 rounded text-xs font-bold border flex flex-col items-center min-w-[80px] bg-purple-900/40 border-purple-600 text-purple-200 hover:bg-purple-800/40"
                                                    >
                                                        <span>SATIN AL (30G)</span>
                                                        <span className="text-[10px] opacity-70 flex items-center gap-1"><Gem size={8} /> 50 Elmas</span>
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    onClick={() => handleTransaction(item, 'rent')}
                                                    disabled={playerCredits < item.cost}
                                                    className={`px-4 py-2 rounded text-xs font-bold border whitespace-nowrap ${playerCredits >= item.cost ? 'bg-yellow-900/40 border-yellow-600 text-yellow-200 hover:bg-yellow-800/40' : 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed'}`}
                                                >
                                                    {item.cost} G
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    {item.desc && (
                                        <div className="mt-2 text-[10px] text-yellow-400 bg-yellow-900/10 p-1.5 rounded border border-yellow-900/30">
                                            {item.desc}
                                            {item.rental && <div className="mt-1 text-red-300 font-bold text-[9px]"><Clock size={8} className="inline mr-1" /> Seviye 5 ve üzeri gereklidir.</div>}
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            // SELL TAB CONTENT
                            inventory.length > 0 ? (
                                inventory.map(item => {
                                    const sellValue = Math.floor((item.value || 10) / 2); // Sell for half value
                                    return (
                                        <div key={item.id} className="flex flex-col p-3 bg-[#0f0a06] border border-[#3f2e18] rounded hover:border-red-600 transition-colors">
                                            <div className="flex items-center justify-between w-full">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-[#1a120b] rounded flex items-center justify-center border border-[#3f2e18]">
                                                        {/* Simple icon logic for sell items */}
                                                        {item.type === 'weapon' ? <Sword className="text-slate-300" /> : <Shield className="text-slate-300" />}
                                                    </div>
                                                    <div>
                                                        <div className="text-[#e6cba5] font-bold text-sm">{item.name} {item.plus ? `+${item.plus}` : ''}</div>
                                                        <div className="text-xs text-slate-500">
                                                            T{item.tier} • {item.rarity.toUpperCase()}
                                                        </div>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => onSell(sellValue, item.id)}
                                                    className="px-4 py-2 rounded text-xs font-bold border whitespace-nowrap bg-green-900/40 border-green-600 text-green-200 hover:bg-green-800/40"
                                                >
                                                    SAT +{sellValue} G
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center text-slate-500 py-10">Satılacak eşya yok.</div>
                            )
                        )}
                    </div>
                </div>

                <div className="p-3 text-center text-[10px] text-slate-500 border-t border-[#3f2e18] bg-[#0f0a06]">
                    {activeTab === 'buy' ? 'Satın alınan eşyalar envantere eklenir.' : 'Eşyalar değerinin %50\'sine satılır.'}
                </div>
            </div>
        </div>
    );
};

export default MarketModal;
