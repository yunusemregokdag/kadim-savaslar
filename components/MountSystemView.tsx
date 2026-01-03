import React, { useState, useEffect } from 'react';
import { PlayerState } from '../types';
import {
    Zap, X, Lock, Star, Crown, Timer, Coins, Check,
    TrendingUp, Shield, Heart, Sparkles
} from 'lucide-react';
import { GameIcon } from '../utils/IconMapper';

export interface Mount {
    id: string;
    name: string;
    emoji: string;        // DEV fallback only
    tier: 1 | 2 | 3 | 4 | 5;
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
    speedBonus: number; // Percentage
    staminaBonus?: number;
    specialAbility?: string;
    price?: number; // Gold price
    gemPrice?: number; // Gem price
    obtained?: 'shop' | 'quest' | 'event' | 'drop' | 'premium';
}

export const ALL_MOUNTS: Mount[] = [
    // Tier 1 - Common
    { id: 'horse_brown', name: 'Kahverengi At', emoji: '🐴', tier: 1, rarity: 'common', speedBonus: 20, price: 1000, obtained: 'shop' },
    { id: 'donkey', name: 'Eşek', emoji: '🫏', tier: 1, rarity: 'common', speedBonus: 15, price: 500, obtained: 'shop' },
    { id: 'camel', name: 'Deve', emoji: '🐪', tier: 1, rarity: 'common', speedBonus: 18, staminaBonus: 20, price: 800, obtained: 'shop' },

    // Tier 2 - Uncommon
    { id: 'horse_white', name: 'Beyaz At', emoji: '🦄', tier: 2, rarity: 'uncommon', speedBonus: 30, price: 3000, obtained: 'shop' },
    { id: 'elephant', name: 'Fil', emoji: '🐘', tier: 2, rarity: 'uncommon', speedBonus: 15, staminaBonus: 50, price: 4000, obtained: 'shop' },
    { id: 'wolf', name: 'Kurt', emoji: '🐺', tier: 2, rarity: 'uncommon', speedBonus: 35, price: 5000, obtained: 'quest' },

    // Tier 3 - Rare
    { id: 'tiger', name: 'Kaplan', emoji: '🐅', tier: 3, rarity: 'rare', speedBonus: 45, specialAbility: 'Düşmana Kükreme', price: 15000, obtained: 'shop' },
    { id: 'lion', name: 'Aslan', emoji: '🦁', tier: 3, rarity: 'rare', speedBonus: 45, specialAbility: 'Korku Salma', price: 15000, obtained: 'shop' },
    { id: 'bear', name: 'Ayı', emoji: '🐻', tier: 3, rarity: 'rare', speedBonus: 30, staminaBonus: 40, specialAbility: 'Ezme Saldırısı', price: 12000, obtained: 'drop' },

    // Tier 4 - Epic
    { id: 'dragon_small', name: 'Yavru Ejderha', emoji: '🐉', tier: 4, rarity: 'epic', speedBonus: 60, specialAbility: 'Ateş Nefesi', gemPrice: 200, obtained: 'premium' },
    { id: 'phoenix', name: 'Anka Kuşu', emoji: '🦅', tier: 4, rarity: 'epic', speedBonus: 70, specialAbility: 'Yeniden Doğuş', gemPrice: 250, obtained: 'premium' },
    { id: 'griffin', name: 'Grifon', emoji: '🦅', tier: 4, rarity: 'epic', speedBonus: 65, staminaBonus: 30, specialAbility: 'Süzülme', gemPrice: 220, obtained: 'event' },

    // Tier 5 - Legendary
    { id: 'dragon_ancient', name: 'Kadim Ejderha', emoji: '🐲', tier: 5, rarity: 'legendary', speedBonus: 100, staminaBonus: 50, specialAbility: 'Uçuş + Ateş Yağmuru', gemPrice: 1000, obtained: 'premium' },
    { id: 'unicorn_divine', name: 'Kutsal Unicorn', emoji: '🦄', tier: 5, rarity: 'legendary', speedBonus: 80, staminaBonus: 100, specialAbility: 'Işınlanma', gemPrice: 800, obtained: 'event' },
    { id: 'nightmare', name: 'Kabus Atı', emoji: '🐴', tier: 5, rarity: 'legendary', speedBonus: 90, specialAbility: 'Gölge Geçişi (Görünmezlik)', gemPrice: 900, obtained: 'drop' },
];

interface MountSystemViewProps {
    playerState: PlayerState;
    onClose: () => void;
    onEquipMount: (mount: Mount) => void;
    onPurchaseMount: (mount: Mount) => void;
}

export const MountSystemView: React.FC<MountSystemViewProps> = ({
    playerState,
    onClose,
    onEquipMount,
    onPurchaseMount,
}) => {
    const [ownedMounts, setOwnedMounts] = useState<string[]>(() => {
        const saved = localStorage.getItem('ownedMounts');
        return saved ? JSON.parse(saved) : ['horse_brown']; // Start with basic horse
    });
    const [equippedMount, setEquippedMount] = useState<string | null>(() => {
        return localStorage.getItem('equippedMount') || null;
    });
    const [selectedMount, setSelectedMount] = useState<Mount | null>(null);
    const [activeTab, setActiveTab] = useState<'owned' | 'shop'>('owned');
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Save state
    useEffect(() => {
        localStorage.setItem('ownedMounts', JSON.stringify(ownedMounts));
        if (equippedMount) {
            localStorage.setItem('equippedMount', equippedMount);
        } else {
            localStorage.removeItem('equippedMount');
        }
    }, [ownedMounts, equippedMount]);

    const handleEquip = (mount: Mount) => {
        if (!ownedMounts.includes(mount.id)) return;

        if (equippedMount === mount.id) {
            setEquippedMount(null);
            setMessage({ type: 'success', text: 'Binek çıkarıldı' });
        } else {
            setEquippedMount(mount.id);
            onEquipMount(mount);
            setMessage({ type: 'success', text: `${mount.name} kuşanıldı! +${mount.speedBonus}% Hız` });
        }
    };

    const handlePurchase = (mount: Mount) => {
        if (ownedMounts.includes(mount.id)) return;

        if (mount.gemPrice) {
            if (playerState.gems < mount.gemPrice) {
                setMessage({ type: 'error', text: 'Yeterli gem yok!' });
                return;
            }
        } else if (mount.price) {
            if (playerState.credits < mount.price) {
                setMessage({ type: 'error', text: 'Yeterli altın yok!' });
                return;
            }
        }

        setOwnedMounts(prev => [...prev, mount.id]);
        onPurchaseMount(mount);
        setMessage({ type: 'success', text: `${mount.name} satın alındı!` });
        setSelectedMount(null);
    };

    const getRarityColor = (rarity: string): string => {
        switch (rarity) {
            case 'common': return 'border-slate-500 bg-slate-800/50';
            case 'uncommon': return 'border-green-500 bg-green-900/30';
            case 'rare': return 'border-blue-500 bg-blue-900/30';
            case 'epic': return 'border-purple-500 bg-purple-900/30';
            case 'legendary': return 'border-orange-500 bg-gradient-to-br from-orange-900/50 to-yellow-900/50';
            default: return 'border-slate-500';
        }
    };

    const getRarityTextColor = (rarity: string): string => {
        switch (rarity) {
            case 'common': return 'text-slate-400';
            case 'uncommon': return 'text-green-400';
            case 'rare': return 'text-blue-400';
            case 'epic': return 'text-purple-400';
            case 'legendary': return 'text-orange-400';
            default: return 'text-slate-400';
        }
    };

    const equippedMountData = equippedMount ? ALL_MOUNTS.find(m => m.id === equippedMount) : null;
    const ownedMountsList = ALL_MOUNTS.filter(m => ownedMounts.includes(m.id));
    const shopMountsList = ALL_MOUNTS.filter(m => !ownedMounts.includes(m.id) && (m.price || m.gemPrice));

    return (
        <div className="fixed inset-0 z-[90] bg-black/80 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="bg-gradient-to-r from-amber-900 to-orange-900 p-4 md:p-6 border-b border-amber-700">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3 md:gap-4">
                            <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                                {equippedMountData ? (
                                    <GameIcon category="mount" iconKey={equippedMountData.id} size={40} />
                                ) : (
                                    <GameIcon category="mount" iconKey="horse_brown" size={40} />
                                )}
                            </div>
                            <div>
                                <h2 className="text-xl md:text-2xl font-bold text-white">Binek Ahırı</h2>
                                <p className="text-amber-200 text-xs md:text-sm">
                                    {equippedMountData
                                        ? `${equippedMountData.name} kuşanılmış (+${equippedMountData.speedBonus}% Hız)`
                                        : 'Binek kuşanılmamış'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 md:gap-4">
                            <div className="hidden md:flex flex-col text-right text-xs">
                                <span className="text-yellow-400">{playerState.credits.toLocaleString()} G</span>
                                <span className="text-purple-400">{playerState.gems.toLocaleString()} 💎</span>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
                                <X size={24} className="text-white" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Message */}
                {message && (
                    <div className={`p-3 text-sm flex justify-between items-center ${message.type === 'success' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'
                        }`}>
                        <span>{message.text}</span>
                        <button onClick={() => setMessage(null)}><X size={14} /></button>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex border-b border-slate-700">
                    <button
                        onClick={() => setActiveTab('owned')}
                        className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'owned'
                            ? 'bg-slate-800 text-amber-400 border-b-2 border-amber-400'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                            }`}
                    >
                        <Star size={16} /> Bineklerim ({ownedMountsList.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('shop')}
                        className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'shop'
                            ? 'bg-slate-800 text-amber-400 border-b-2 border-amber-400'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                            }`}
                    >
                        <Coins size={16} /> Mağaza
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 overflow-y-auto max-h-[50vh]">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {(activeTab === 'owned' ? ownedMountsList : shopMountsList).map(mount => {
                            const isEquipped = equippedMount === mount.id;
                            const isOwned = ownedMounts.includes(mount.id);

                            return (
                                <div
                                    key={mount.id}
                                    onClick={() => setSelectedMount(mount)}
                                    className={`relative p-3 rounded-xl border-2 cursor-pointer transition-all hover:scale-105 ${getRarityColor(mount.rarity)} ${isEquipped ? 'ring-2 ring-green-400 ring-offset-2 ring-offset-slate-900' : ''
                                        }`}
                                >
                                    {/* Equipped Badge */}
                                    {isEquipped && (
                                        <div className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                            <Check size={10} /> Aktif
                                        </div>
                                    )}

                                    {/* Mount Icon */}
                                    <div className="text-center mb-2 flex justify-center">
                                        <GameIcon category="mount" iconKey={mount.id} size={48} className="filter drop-shadow-lg" />
                                    </div>

                                    {/* Name */}
                                    <div className="text-center">
                                        <div className={`font-bold text-sm truncate ${getRarityTextColor(mount.rarity)}`}>
                                            {mount.name}
                                        </div>
                                        <div className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
                                            <Zap size={10} className="text-yellow-400" />
                                            +{mount.speedBonus}% Hız
                                        </div>
                                    </div>

                                    {/* Price (for shop) */}
                                    {!isOwned && (
                                        <div className="mt-2 text-center">
                                            {mount.gemPrice ? (
                                                <span className="text-xs text-purple-400 font-bold">{mount.gemPrice} 💎</span>
                                            ) : (
                                                <span className="text-xs text-yellow-400 font-bold">{mount.price?.toLocaleString()} G</span>
                                            )}
                                        </div>
                                    )}

                                    {/* Tier Stars */}
                                    <div className="flex justify-center gap-0.5 mt-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                size={10}
                                                className={i < mount.tier ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}
                                            />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {activeTab === 'owned' && ownedMountsList.length === 0 && (
                        <div className="text-center py-12 text-slate-500">
                            Henüz binek yok. Mağazadan satın al!
                        </div>
                    )}
                </div>

                {/* Selected Mount Details Modal */}
                {selectedMount && (
                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4 z-10">
                        <div className={`bg-slate-900 border-2 rounded-2xl p-6 max-w-sm w-full ${getRarityColor(selectedMount.rarity)}`}>
                            <div className="flex justify-end">
                                <button onClick={() => setSelectedMount(null)}><X size={20} className="text-slate-400" /></button>
                            </div>

                            <div className="text-center mb-4">
                                <div className="mb-2 flex justify-center">
                                    <GameIcon category="mount" iconKey={selectedMount.id} size={64} className="animate-bounce" />
                                </div>
                                <h3 className={`text-xl font-bold ${getRarityTextColor(selectedMount.rarity)}`}>
                                    {selectedMount.name}
                                </h3>
                                <div className="flex justify-center gap-1 mt-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            size={14}
                                            className={i < selectedMount.tier ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400 flex items-center gap-1"><Zap size={14} /> Hız Bonusu</span>
                                    <span className="text-green-400 font-bold">+{selectedMount.speedBonus}%</span>
                                </div>
                                {selectedMount.staminaBonus && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400 flex items-center gap-1"><Heart size={14} /> Stamina Bonusu</span>
                                        <span className="text-blue-400 font-bold">+{selectedMount.staminaBonus}%</span>
                                    </div>
                                )}
                                {selectedMount.specialAbility && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400 flex items-center gap-1"><Sparkles size={14} /> Özel Yetenek</span>
                                        <span className="text-purple-400 font-bold">{selectedMount.specialAbility}</span>
                                    </div>
                                )}
                            </div>

                            {ownedMounts.includes(selectedMount.id) ? (
                                <button
                                    onClick={() => handleEquip(selectedMount)}
                                    className={`w-full py-3 rounded-lg font-bold ${equippedMount === selectedMount.id
                                        ? 'bg-red-600 hover:bg-red-500 text-white'
                                        : 'bg-green-600 hover:bg-green-500 text-white'
                                        }`}
                                >
                                    {equippedMount === selectedMount.id ? 'Çıkar' : 'Kuşan'}
                                </button>
                            ) : (
                                <button
                                    onClick={() => handlePurchase(selectedMount)}
                                    className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg flex items-center justify-center gap-2"
                                >
                                    <Coins size={16} />
                                    Satın Al ({selectedMount.gemPrice ? `${selectedMount.gemPrice} 💎` : `${selectedMount.price?.toLocaleString()} G`})
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="p-4 bg-slate-800/50 border-t border-slate-700 text-center text-xs text-slate-500">
                    Binekler hareket hızını artırır. Efsanevi binekler özel yeteneklere sahiptir!
                </div>
            </div>
        </div>
    );
};

export default MountSystemView;
