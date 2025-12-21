import React, { useState, useEffect } from 'react';
import { PlayerState } from '../types';
import { houseAPI } from '../utils/api';
import {
    Home, Package, Sofa, Sparkles, ArrowUp, Settings, Users,
    X, ChevronRight, Coins, Lock, Unlock, ShoppingCart, Trash2,
    RefreshCw, Box, Hammer, Bed, Star, Eye, ChevronLeft
} from 'lucide-react';

interface FurnitureItem {
    id: string;
    furnitureId: string;
    name: string;
    type: string;
    position: { x: number, y: number, z: number };
    rotation: number;
    level: number;
}

interface StorageItem {
    itemId: string;
    name: string;
    type: string;
    rarity: string;
    quantity: number;
}

interface HouseData {
    _id: string;
    ownerName: string;
    houseType: string;
    level: number;
    name: string;
    furniture: FurnitureItem[];
    storage: StorageItem[];
    storageCapacity: number;
    decorationPoints: number;
    permissions: {
        friendsCanVisit: boolean;
        guildCanVisit: boolean;
        publicVisit: boolean;
    };
}

interface HouseConfig {
    name: string;
    maxFurniture: number;
    baseStorage: number;
    upgradeCost: number;
    description: string;
}

interface CatalogItem {
    id: string;
    name: string;
    type: string;
    cost: number;
    level: number;
    storageBonus?: number;
    decorPoints?: number;
    craftingBonus?: number;
    buffType?: string;
    buffValue?: number;
}

interface HouseViewProps {
    playerState: PlayerState;
    onClose: () => void;
    onRefreshPlayer: () => void;
}

export const HouseView: React.FC<HouseViewProps> = ({ playerState, onClose, onRefreshPlayer }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'furniture' | 'storage' | 'settings'>('overview');
    const [house, setHouse] = useState<HouseData | null>(null);
    const [config, setConfig] = useState<HouseConfig | null>(null);
    const [catalog, setCatalog] = useState<CatalogItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('storage');

    useEffect(() => {
        loadHouse();
    }, []);

    const loadHouse = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await houseAPI.getHouse();
            setHouse(data.house);
            setConfig(data.config);
            setCatalog(data.catalog || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpgrade = async (targetType: string) => {
        try {
            const result = await houseAPI.upgradeHouse(targetType);
            if (result.success) {
                setHouse(result.house);
                onRefreshPlayer();
            }
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleBuyFurniture = async (furnitureId: string) => {
        try {
            const result = await houseAPI.buyFurniture(furnitureId);
            if (result.success) {
                loadHouse();
                onRefreshPlayer();
            }
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleRemoveFurniture = async (furnitureInstanceId: string) => {
        try {
            const result = await houseAPI.removeFurniture(furnitureInstanceId);
            if (result.success) {
                loadHouse();
                onRefreshPlayer();
            }
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleWithdrawItem = async (itemId: string) => {
        try {
            const result = await houseAPI.removeFromStorage(itemId, 1);
            if (result.success) {
                setHouse(prev => prev ? { ...prev, storage: result.storage } : null);
                onRefreshPlayer();
            }
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleUpdateSettings = async (name?: string, permissions?: any) => {
        try {
            const result = await houseAPI.updateSettings(name, permissions);
            if (result.success) {
                setHouse(result.house);
            }
        } catch (err: any) {
            setError(err.message);
        }
    };

    const getHouseIcon = (type: string) => {
        switch (type) {
            case 'cottage': return '🏠';
            case 'villa': return '🏡';
            case 'mansion': return '🏰';
            case 'castle': return '🏯';
            default: return '🏠';
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'storage': return 'text-amber-400 bg-amber-900/30 border-amber-600/50';
            case 'decoration': return 'text-purple-400 bg-purple-900/30 border-purple-600/50';
            case 'crafting': return 'text-blue-400 bg-blue-900/30 border-blue-600/50';
            case 'buff': return 'text-green-400 bg-green-900/30 border-green-600/50';
            default: return 'text-slate-400 bg-slate-900/30 border-slate-600/50';
        }
    };

    const getRarityColor = (rarity: string) => {
        switch (rarity) {
            case 'legendary': return 'text-orange-400 border-orange-500';
            case 'epic': return 'text-purple-400 border-purple-500';
            case 'rare': return 'text-blue-400 border-blue-500';
            case 'uncommon': return 'text-green-400 border-green-500';
            default: return 'text-slate-300 border-slate-600';
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 z-[80] bg-black/80 flex items-center justify-center">
                <div className="text-white flex items-center gap-3">
                    <RefreshCw className="animate-spin" size={24} />
                    <span>Yükleniyor...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[80] bg-black/80 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-900/40 to-teal-900/40 p-4 border-b border-slate-700 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="text-4xl">{house ? getHouseIcon(house.houseType) : '🏠'}</div>
                        <div>
                            <h2 className="text-xl font-bold text-white">{house?.name || 'Evim'}</h2>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="text-sm text-emerald-300">{config?.name || 'Kulübe'}</span>
                                <span className="text-xs text-slate-400">|</span>
                                <span className="text-sm text-slate-400">Level {house?.level || 1}</span>
                                <span className="text-xs text-slate-400">|</span>
                                <span className="text-sm text-purple-300 flex items-center gap-1">
                                    <Sparkles size={12} /> {house?.decorationPoints || 0} Puan
                                </span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <X size={24} className="text-slate-400" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-700">
                    {[
                        { id: 'overview', label: 'Genel Bakış', icon: Home },
                        { id: 'furniture', label: 'Mobilya', icon: Sofa },
                        { id: 'storage', label: 'Depo', icon: Package },
                        { id: 'settings', label: 'Ayarlar', icon: Settings }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-1 py-3 font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === tab.id ? 'bg-slate-800 text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-400 hover:text-white'}`}
                        >
                            <tab.icon size={18} />
                            <span className="hidden md:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Error Display */}
                {error && (
                    <div className="bg-red-900/30 border-b border-red-800 p-3 flex items-center justify-between text-red-300 text-sm">
                        <span>{error}</span>
                        <button onClick={() => setError(null)}><X size={14} /></button>
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* OVERVIEW TAB */}
                    {activeTab === 'overview' && house && config && (
                        <div className="space-y-6">
                            {/* House Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                                    <div className="text-slate-400 text-xs mb-1">Ev Tipi</div>
                                    <div className="text-white font-bold">{config.name}</div>
                                </div>
                                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                                    <div className="text-slate-400 text-xs mb-1">Depo Kapasitesi</div>
                                    <div className="text-white font-bold">
                                        {house.storage.reduce((s, i) => s + i.quantity, 0)} / {house.storageCapacity}
                                    </div>
                                </div>
                                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                                    <div className="text-slate-400 text-xs mb-1">Mobilya</div>
                                    <div className="text-white font-bold">{house.furniture.length} / {config.maxFurniture}</div>
                                </div>
                                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                                    <div className="text-slate-400 text-xs mb-1">Dekorasyon Puanı</div>
                                    <div className="text-purple-400 font-bold">{house.decorationPoints}</div>
                                </div>
                            </div>

                            {/* Upgrade Section */}
                            <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 rounded-xl p-6 border border-slate-700">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <ArrowUp size={20} className="text-emerald-400" />
                                    Ev Yükseltme
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {[
                                        { type: 'villa', name: 'Villa', cost: 50000, icon: '🏡' },
                                        { type: 'mansion', name: 'Konak', cost: 200000, icon: '🏰' },
                                        { type: 'castle', name: 'Kale', cost: 1000000, icon: '🏯' }
                                    ].map(upgrade => {
                                        const owned = ['cottage', 'villa', 'mansion', 'castle'].indexOf(house.houseType) >= ['cottage', 'villa', 'mansion', 'castle'].indexOf(upgrade.type);
                                        return (
                                            <div key={upgrade.type} className={`rounded-lg p-4 border ${owned ? 'bg-emerald-900/20 border-emerald-700/50' : 'bg-slate-800/50 border-slate-700'}`}>
                                                <div className="flex items-center gap-3 mb-3">
                                                    <span className="text-2xl">{upgrade.icon}</span>
                                                    <div>
                                                        <div className="font-bold text-white">{upgrade.name}</div>
                                                        <div className="text-xs text-slate-400">{upgrade.cost.toLocaleString()} Altın</div>
                                                    </div>
                                                </div>
                                                {owned ? (
                                                    <div className="text-sm text-emerald-400 text-center py-2">✓ Sahipsin</div>
                                                ) : (
                                                    <button
                                                        onClick={() => handleUpgrade(upgrade.type)}
                                                        disabled={playerState.credits < upgrade.cost}
                                                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors"
                                                    >
                                                        Yükselt
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Current Furniture */}
                            {house.furniture.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-4">Mevcut Mobilyalar</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {house.furniture.map(f => (
                                            <div key={f.id} className={`rounded-lg p-3 border ${getTypeColor(f.type)}`}>
                                                <div className="font-bold text-sm">{f.name}</div>
                                                <div className="text-xs opacity-70 capitalize">{f.type}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* FURNITURE TAB */}
                    {activeTab === 'furniture' && (
                        <div className="space-y-6">
                            {/* Category Filter */}
                            <div className="flex gap-2 flex-wrap">
                                {['storage', 'decoration', 'crafting', 'buff'].map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`px-4 py-2 rounded-lg font-bold text-sm capitalize transition-colors ${selectedCategory === cat ? getTypeColor(cat) + ' border' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}
                                    >
                                        {cat === 'storage' ? 'Depolama' : cat === 'decoration' ? 'Dekorasyon' : cat === 'crafting' ? 'Üretim' : 'Buff'}
                                    </button>
                                ))}
                            </div>

                            {/* Catalog */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {catalog.filter(c => c.type === selectedCategory).map(item => {
                                    const owned = house?.furniture.filter(f => f.furnitureId === item.id).length || 0;
                                    const canAfford = playerState.credits >= item.cost;
                                    const meetsLevel = (house?.level || 1) >= item.level;

                                    return (
                                        <div key={item.id} className={`rounded-xl p-4 border ${getTypeColor(item.type)}`}>
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h4 className="font-bold text-white">{item.name}</h4>
                                                    <div className="text-xs opacity-70">Level {item.level} gerekli</div>
                                                </div>
                                                {owned > 0 && <span className="text-xs bg-emerald-600 text-white px-2 py-1 rounded">{owned}x</span>}
                                            </div>

                                            <div className="text-sm mb-3 opacity-80">
                                                {item.storageBonus && <span>+{item.storageBonus} Depo</span>}
                                                {item.decorPoints && <span>+{item.decorPoints} Dekor Puanı</span>}
                                                {item.craftingBonus && <span>+{item.craftingBonus}% Üretim</span>}
                                                {item.buffType && <span>+{item.buffValue}% {item.buffType}</span>}
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1 text-yellow-400">
                                                    <Coins size={14} />
                                                    <span className="font-bold">{item.cost.toLocaleString()}</span>
                                                </div>
                                                <button
                                                    onClick={() => handleBuyFurniture(item.id)}
                                                    disabled={!canAfford || !meetsLevel}
                                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2"
                                                >
                                                    <ShoppingCart size={14} />
                                                    Satın Al
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Owned Furniture Management */}
                            {house && house.furniture.length > 0 && (
                                <div className="mt-8">
                                    <h3 className="text-lg font-bold text-white mb-4">Sahip Olduklarınız</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {house.furniture.map(f => (
                                            <div key={f.id} className="bg-slate-800 rounded-lg p-3 border border-slate-700 flex items-center justify-between">
                                                <div>
                                                    <div className="font-bold text-white text-sm">{f.name}</div>
                                                    <div className="text-xs text-slate-400 capitalize">{f.type}</div>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveFurniture(f.id)}
                                                    className="p-2 hover:bg-red-900/30 rounded text-red-400"
                                                    title="Sat (%50 iade)"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* STORAGE TAB */}
                    {activeTab === 'storage' && house && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-white">
                                    Depo ({house.storage.reduce((s, i) => s + i.quantity, 0)} / {house.storageCapacity})
                                </h3>
                            </div>

                            {house.storage.length === 0 ? (
                                <div className="text-center py-12 text-slate-500">
                                    <Box size={48} className="mx-auto mb-4 opacity-30" />
                                    <p>Deponuz boş</p>
                                    <p className="text-sm">Eşyalarınızı buraya saklayabilirsiniz</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                    {house.storage.map((item, idx) => (
                                        <div
                                            key={`${item.itemId}-${idx}`}
                                            className={`rounded-lg p-3 border cursor-pointer hover:scale-105 transition-transform ${getRarityColor(item.rarity)}`}
                                            onClick={() => handleWithdrawItem(item.itemId)}
                                        >
                                            <div className="font-bold text-sm truncate">{item.name}</div>
                                            <div className="flex items-center justify-between mt-1">
                                                <span className="text-xs opacity-70">{item.type}</span>
                                                {item.quantity > 1 && (
                                                    <span className="text-xs bg-black/30 px-1.5 rounded">x{item.quantity}</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <p className="text-xs text-slate-500">* Eşyaya tıklayarak envanterinize çekebilirsiniz</p>
                        </div>
                    )}

                    {/* SETTINGS TAB */}
                    {activeTab === 'settings' && house && (
                        <div className="space-y-6 max-w-lg">
                            <div>
                                <label className="block text-slate-400 text-sm mb-2">Ev Adı</label>
                                <input
                                    type="text"
                                    defaultValue={house.name}
                                    onBlur={(e) => handleUpdateSettings(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-emerald-500 focus:outline-none"
                                />
                            </div>

                            <div className="space-y-4">
                                <h4 className="font-bold text-white">Ziyaret İzinleri</h4>

                                <label className="flex items-center justify-between p-4 bg-slate-800 rounded-lg border border-slate-700 cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <Users size={20} className="text-blue-400" />
                                        <div>
                                            <div className="font-bold text-white">Arkadaşlar</div>
                                            <div className="text-xs text-slate-400">Arkadaşların evini ziyaret edebilir</div>
                                        </div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={house.permissions.friendsCanVisit}
                                        onChange={(e) => handleUpdateSettings(undefined, { friendsCanVisit: e.target.checked })}
                                        className="w-5 h-5 accent-emerald-500"
                                    />
                                </label>

                                <label className="flex items-center justify-between p-4 bg-slate-800 rounded-lg border border-slate-700 cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <Users size={20} className="text-purple-400" />
                                        <div>
                                            <div className="font-bold text-white">Klan Üyeleri</div>
                                            <div className="text-xs text-slate-400">Klan arkadaşların evini ziyaret edebilir</div>
                                        </div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={house.permissions.guildCanVisit}
                                        onChange={(e) => handleUpdateSettings(undefined, { guildCanVisit: e.target.checked })}
                                        className="w-5 h-5 accent-emerald-500"
                                    />
                                </label>

                                <label className="flex items-center justify-between p-4 bg-slate-800 rounded-lg border border-slate-700 cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <Eye size={20} className="text-yellow-400" />
                                        <div>
                                            <div className="font-bold text-white">Herkese Açık</div>
                                            <div className="text-xs text-slate-400">Herkes evini ziyaret edebilir</div>
                                        </div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={house.permissions.publicVisit}
                                        onChange={(e) => handleUpdateSettings(undefined, { publicVisit: e.target.checked })}
                                        className="w-5 h-5 accent-emerald-500"
                                    />
                                </label>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HouseView;
