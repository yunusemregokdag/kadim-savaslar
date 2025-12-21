import React, { useState, useEffect } from 'react';
import { Item, PlayerState } from '../types';
import { MarketListing } from './MarketTypes';
import { Search, ShoppingBag, DollarSign, Gem, X, Filter, Package, Tag, Clock, ArrowRight, Shield, Sword, Crown, Crosshair, Hammer, Book, Zap, Footprints, Shirt, HelpCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface MarketViewProps {
    playerState: any; // Using any to bypass strict PlayerState check since we can't edit types.ts
    onBuy: (listing: MarketListing) => void;
    onSell: (item: Item, price: number, currency: 'credits' | 'gems') => void;
    onClose: () => void;
}

const MOCK_LISTINGS: MarketListing[] = [
    { id: '1', sellerName: 'EjderAvcısı', sellerId: 'p1', item: { id: 'm1', name: 'Alev Kılıcı', tier: 3, type: 'weapon', rarity: 'rare', plus: 5 }, price: 50000, currency: 'credits', listedAt: Date.now(), expiresAt: Date.now() + 86400000 },
    { id: '2', sellerName: 'BüyücüUsta', sellerId: 'p2', item: { id: 'm2', name: 'Kristal Asa', tier: 4, type: 'weapon', rarity: 'legendary', plus: 3 }, price: 2500, currency: 'gems', listedAt: Date.now(), expiresAt: Date.now() + 86400000 },
    { id: '3', sellerName: 'GizliGölge', sellerId: 'p3', item: { id: 'm3', name: 'Gölge Zırhı', tier: 3, type: 'armor', rarity: 'epic', plus: 4 }, price: 120000, currency: 'credits', listedAt: Date.now(), expiresAt: Date.now() + 86400000 },
];

const MarketView: React.FC<MarketViewProps> = ({ playerState, onBuy, onSell, onClose }) => {
    const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
    const [filter, setFilter] = useState<'all' | 'weapon' | 'armor' | 'accessory'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [listings, setListings] = useState<MarketListing[]>(MOCK_LISTINGS);

    // Sell Tab State
    const [selectedSellItem, setSelectedSellItem] = useState<Item | null>(null);
    const [sellPrice, setSellPrice] = useState<string>('');
    const [sellCurrency, setSellCurrency] = useState<'credits' | 'gems'>('credits');

    // Filter Listings
    const filteredListings = listings.filter(l => {
        if (activeTab === 'sell' && l.sellerId !== playerState.nickname) return false; // Show only my listings in sell tab? No, sell tab is for creating listings.

        // Basic Search
        if (searchQuery && !l.item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;

        // Category Filter
        if (filter === 'weapon' && l.item.type !== 'weapon') return false;
        if (filter === 'armor' && !['armor', 'helmet', 'pants'].includes(l.item.type)) return false;
        if (filter === 'accessory') return false; // Removed accessories

        return true;
    });

    const handleCreateListing = () => {
        if (!selectedSellItem || !sellPrice) return;
        const price = parseInt(sellPrice);
        if (isNaN(price) || price <= 0) return;

        onSell(selectedSellItem, price, sellCurrency);
        setSelectedSellItem(null);
        setSellPrice('');
        // Switch to view listings
        alert("Eşya başarıyla listelendi (Mock)");
    };

    const getItemColor = (rarity: string) => {
        switch (rarity) {
            case 'legendary': return 'text-yellow-400 border-yellow-600 bg-yellow-900/20';
            case 'ancient': return 'text-orange-400 border-orange-600 bg-orange-900/20';
            case 'epic': return 'text-purple-400 border-purple-600 bg-purple-900/20';
            case 'rare': return 'text-blue-400 border-blue-600 bg-blue-900/20';
            default: return 'text-slate-300 border-slate-600 bg-slate-800';
        }
    };

    const getIconForItem = (item: Item) => {
        if (item.type === 'weapon') {
            if (item.classReq === 'ranger') return <Crosshair size={32} />;
            if (item.classReq === 'mage') return <Zap size={32} />;
            if (item.classReq === 'shaman') return item.name.includes('Kitap') ? <Book size={32} /> : <Hammer size={32} />;
            return <Sword size={32} />;
        }
        if (item.type === 'armor') return <Shirt size={32} />;
        if (item.type === 'helmet') return <Crown size={32} />;
        if (item.type === 'pants') return <Footprints size={32} />;
        return <Package size={32} />;
    };

    return (
        <div className="flex flex-col h-full bg-[#0b0f19] text-white">
            {/* Header */}
            <div className="p-6 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-yellow-900/20 rounded-xl flex items-center justify-center border border-yellow-700">
                        <ShoppingBag className="text-yellow-500" size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold rpg-font text-yellow-100">KADİM PAZAR</h2>
                        <p className="text-xs text-slate-400">Tüm diyarlardan eşyalar burada buluşuyor.</p>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 bg-slate-950 px-4 py-2 rounded-full border border-slate-800">
                        <DollarSign size={16} className="text-yellow-500" />
                        <span className="font-bold text-yellow-100">{playerState.credits.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-950 px-4 py-2 rounded-full border border-slate-800">
                        <Gem size={16} className="text-purple-500" />
                        <span className="font-bold text-purple-100">{playerState.gems.toLocaleString()}</span>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                        <X size={24} className="text-slate-400 hover:text-white" />
                    </button>
                </div>
            </div>

            {/* Navigation & Filters */}
            <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex gap-4">
                <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-800">
                    <button
                        onClick={() => setActiveTab('buy')}
                        className={`px-6 py-2 rounded-md font-bold transition-all ${activeTab === 'buy' ? 'bg-yellow-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        SATIN AL
                    </button>
                    <button
                        onClick={() => setActiveTab('sell')}
                        className={`px-6 py-2 rounded-md font-bold transition-all ${activeTab === 'sell' ? 'bg-green-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        SATIŞ YAP
                    </button>
                </div>

                {activeTab === 'buy' && (
                    <>
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Eşya ara..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-yellow-600 transition-colors"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg border text-sm font-bold transition-all ${filter === 'all' ? 'bg-slate-700 border-slate-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>Tümü</button>
                            <button onClick={() => setFilter('weapon')} className={`px-4 py-2 rounded-lg border text-sm font-bold transition-all flex items-center gap-2 ${filter === 'weapon' ? 'bg-red-900/30 border-red-500 text-red-200' : 'bg-slate-950 border-slate-800 text-slate-400'}`}><Sword size={14} /> Silah</button>
                            <button onClick={() => setFilter('armor')} className={`px-4 py-2 rounded-lg border text-sm font-bold transition-all flex items-center gap-2 ${filter === 'armor' ? 'bg-blue-900/30 border-blue-500 text-blue-200' : 'bg-slate-950 border-slate-800 text-slate-400'}`}><Shield size={14} /> Zırh</button>
                        </div>
                    </>
                )}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">

                {activeTab === 'buy' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filteredListings.map(listing => (
                            <div key={listing.id} className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex gap-4 group hover:border-yellow-500/50 transition-all hover:shadow-[0_0_20px_rgba(234,179,8,0.1)]">
                                <div className={`w-20 h-20 rounded-lg border-2 flex items-center justify-center shrink-0 relative ${getItemColor(listing.item.rarity)}`}>
                                    {getIconForItem(listing.item)}
                                    <div className="absolute top-1 right-1 text-[10px] bg-black/80 text-white px-1 rounded">+{listing.item.plus || 0}</div>
                                    <div className="absolute bottom-1 left-1 text-[10px] bg-black/80 text-slate-300 px-1 rounded">T{listing.item.tier}</div>
                                </div>
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start">
                                            <h3 className={`font-bold ${listing.item.rarity === 'legendary' ? 'text-yellow-400' : 'text-white'}`}>{listing.item.name}</h3>
                                            <span className="text-[10px] text-slate-500 flex items-center gap-1"><Clock size={10} /> 23sa</span>
                                        </div>
                                        <p className="text-xs text-slate-400 mt-1">Satıcı: <span className="text-slate-300 font-bold">{listing.sellerName}</span></p>
                                    </div>
                                    <div className="flex justify-between items-end mt-4">
                                        <div className={`font-bold text-lg flex items-center gap-1 ${listing.currency === 'gems' ? 'text-purple-400' : 'text-yellow-400'}`}>
                                            {listing.currency === 'gems' ? <Gem size={16} /> : <DollarSign size={16} />}
                                            {listing.price.toLocaleString()}
                                        </div>
                                        <button
                                            onClick={() => onBuy(listing)}
                                            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded-lg text-xs transition-colors shadow-lg active:scale-95"
                                        >
                                            SATIN AL
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'sell' && (
                    <div className="flex gap-8 h-full">
                        {/* Sell Form */}
                        <div className="w-1/3 bg-slate-900 border border-slate-700 rounded-xl p-6 flex flex-col">
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Tag size={20} /> Satış İlanı Oluştur</h3>

                            <div className="flex-1">
                                {selectedSellItem ? (
                                    <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 mb-6 flex gap-4 items-center">
                                        <div className={`w-16 h-16 rounded-lg border-2 flex items-center justify-center ${getItemColor(selectedSellItem.rarity)}`}>
                                            <Package size={24} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-white">{selectedSellItem.name}</div>
                                            <div className="text-xs text-slate-400">Tier {selectedSellItem.tier} • +{selectedSellItem.plus || 0}</div>
                                            <button onClick={() => setSelectedSellItem(null)} className="text-xs text-red-400 hover:text-red-300 mt-2">İptal Et</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-slate-950/50 p-8 rounded-lg border-2 border-dashed border-slate-800 text-center text-slate-500 mb-6">
                                        <ArrowRight className="mx-auto mb-2 opacity-50" />
                                        <p>Envanterden satılacak eşyayı seçin</p>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs text-slate-400 mb-1 font-bold">FİYAT</label>
                                        <input
                                            type="number"
                                            value={sellPrice}
                                            onChange={(e) => setSellPrice(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white font-mono focus:border-yellow-600 outline-none"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-400 mb-1 font-bold">PARA BİRİMİ</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                onClick={() => setSellCurrency('credits')}
                                                className={`p-3 rounded-lg border font-bold text-sm flex items-center justify-center gap-2 transition-all ${sellCurrency === 'credits' ? 'bg-yellow-900/40 border-yellow-500 text-yellow-400' : 'bg-slate-950 border-slate-800 text-slate-500'}`}
                                            >
                                                <DollarSign size={14} /> Altın
                                            </button>
                                            <button
                                                onClick={() => setSellCurrency('gems')}
                                                className={`p-3 rounded-lg border font-bold text-sm flex items-center justify-center gap-2 transition-all ${sellCurrency === 'gems' ? 'bg-purple-900/40 border-purple-500 text-purple-400' : 'bg-slate-950 border-slate-800 text-slate-500'}`}
                                            >
                                                <Gem size={14} /> Elmas
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 bg-slate-950 p-3 rounded text-xs text-slate-400 flex justify-between">
                                    <span>Pazar Vergisi (%5):</span>
                                    <span className="text-red-400 font-mono">-{Math.floor(parseInt(sellPrice || '0') * 0.05).toLocaleString()}</span>
                                </div>
                            </div>

                            <button
                                disabled={!selectedSellItem || !sellPrice}
                                onClick={handleCreateListing}
                                className="w-full py-4 bg-green-600 disabled:bg-slate-800 disabled:text-slate-600 hover:bg-green-500 text-white font-bold rounded-lg shadow-lg transition-all mt-6"
                            >
                                İLANI YAYINLA
                            </button>
                        </div>

                        {/* Inventory Selection */}
                        <div className="flex-1 bg-slate-900 border border-slate-700 rounded-xl p-6 overflow-hidden flex flex-col">
                            <h3 className="text-xl font-bold text-white mb-4">Envanter</h3>
                            <div className="flex-1 overflow-y-auto grid grid-cols-4 gap-3 pr-2">
                                {playerState.inventory.map((item: any) => (
                                    <div
                                        key={item.id}
                                        onClick={() => setSelectedSellItem(item)}
                                        className={`aspect-square bg-slate-950 border-2 rounded-lg relative cursor-pointer hover:border-white transition-all ${selectedSellItem?.id === item.id ? 'border-green-500 ring-2 ring-green-500/30' : 'border-slate-800'} ${getItemColor(item.rarity)}`}
                                    >
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            {getIconForItem(item) && React.cloneElement(getIconForItem(item) as any, { size: 20 })}
                                        </div>
                                        <div className="absolute bottom-1 right-1 text-[10px] bg-black/80 px-1 rounded font-bold text-white">
                                            +{item.plus || 0}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MarketView;
