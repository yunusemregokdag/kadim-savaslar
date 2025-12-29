import React, { useState, useEffect } from 'react';
import { PlayerState, Item } from '../types';
import { listItem, buyItem, cancelListing, getListings, MarketListing, getMaxSlots } from '../utils/marketSystem';
import { renderItemIcon } from './ui/ItemIcons';
import { calculateTax } from '../utils/marketSystem';

interface MarketViewProps {
    playerState: PlayerState;
    onClose: () => void;
    onUpdatePlayer: (updates: Partial<PlayerState>) => void;
    isEmbedded?: boolean;
}

export const MarketView: React.FC<MarketViewProps> = ({ playerState, onClose, onUpdatePlayer, isEmbedded = false }) => {
    const [activeTab, setActiveTab] = useState<'buy' | 'sell' | 'my_listings'>('buy');
    const [listings, setListings] = useState<MarketListing[]>([]);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    // Sell Form State
    const [selectedSellItem, setSelectedSellItem] = useState<Item | null>(null);
    const [sellPrice, setSellPrice] = useState<number>(0);
    const [sellCurrency, setSellCurrency] = useState<'gold' | 'gems'>('gold');

    // Refresh Listings
    useEffect(() => {
        const timer = setInterval(() => {
            setListings([...getListings()]);
        }, 1000);
        setListings([...getListings()]);
        return () => clearInterval(timer);
    }, []);

    const handleBuy = (listingId: string) => {
        const result = buyItem(playerState, listingId);
        if (result.success && result.updatedBuyer) {
            onUpdatePlayer(result.updatedBuyer);
            setSuccessMsg('Satın alma başarılı!');
            setListings([...getListings()]);
        } else {
            setErrorMsg(result.error || 'Hata oluştu.');
        }
        setTimeout(() => { setErrorMsg(null); setSuccessMsg(null); }, 3000);
    };

    const handleSell = () => {
        if (!selectedSellItem) return;
        if (sellPrice <= 0) {
            setErrorMsg('Geçersiz fiyat.');
            return;
        }

        const result = listItem(playerState, selectedSellItem, sellPrice, sellCurrency);
        if (result.success && result.updatedPlayer) {
            onUpdatePlayer(result.updatedPlayer);
            setSuccessMsg('İlan oluşturuldu!');
            setSelectedSellItem(null);
            setSellPrice(0);
            setActiveTab('my_listings');
        } else {
            setErrorMsg(result.error || 'İlan oluşturulamadı.');
        }
        setTimeout(() => { setErrorMsg(null); setSuccessMsg(null); }, 3000);
    };

    const handleCancel = (listingId: string) => {
        const result = cancelListing(playerState, listingId);
        if (result.success && result.updatedPlayer) {
            onUpdatePlayer(result.updatedPlayer);
            setSuccessMsg('İlan iptal edildi.');
        } else {
            setErrorMsg(result.error || 'İptal edilemedi.');
        }
        setTimeout(() => { setErrorMsg(null); setSuccessMsg(null); }, 3000);
    };

    // Render Helpers
    const renderRarityColor = (rarity: string) => {
        switch (rarity) {
            case 'legendary': return 'text-yellow-400 font-bold drop-shadow-md';
            case 'epic': return 'text-purple-400 font-bold';
            case 'rare': return 'text-blue-400';
            default: return 'text-gray-200';
        }
    };

    const containerClasses = isEmbedded
        ? "w-full h-full bg-slate-900 flex flex-col"
        : "fixed inset-0 bg-black/80 flex items-center justify-center z-[1000] p-4";

    const contentClasses = isEmbedded
        ? "flex-1 flex flex-col"
        : "bg-slate-900 border-2 border-slate-700 w-full max-w-4xl h-[80vh] rounded-lg shadow-2xl flex flex-col relative";

    return (
        <div className={containerClasses}>
            <div className={contentClasses}>

                {/* HEADER */}
                <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800">
                    <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-bold text-yellow-500 font-cinzel">PAZAR YERİ</h2>
                        <div className="flex gap-2">
                            <span className="text-yellow-400 font-mono text-sm bg-black/40 px-2 py-1 rounded">
                                💰 {playerState.credits.toLocaleString()}
                            </span>
                            <span className="text-emerald-400 font-mono text-sm bg-black/40 px-2 py-1 rounded">
                                💎 {playerState.donateCoins?.toLocaleString() || 0}
                            </span>
                        </div>
                    </div>
                    {!isEmbedded && <button onClick={onClose} className="text-red-500 hover:text-red-400 font-bold text-xl">X</button>}
                </div>

                {/* TABS */}
                <div className="flex bg-slate-800 border-b border-slate-700">
                    <button
                        onClick={() => setActiveTab('buy')}
                        className={`flex-1 py-3 font-bold ${activeTab === 'buy' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-700/50'}`}
                    >
                        SATIN AL
                    </button>
                    <button
                        onClick={() => setActiveTab('sell')}
                        className={`flex-1 py-3 font-bold ${activeTab === 'sell' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-700/50'}`}
                    >
                        EŞYA SAT
                    </button>
                    <button
                        onClick={() => setActiveTab('my_listings')}
                        className={`flex-1 py-3 font-bold ${activeTab === 'my_listings' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-700/50'}`}
                    >
                        İLANLARIM ({listings.filter(l => l.sellerId === playerState.nickname).length} / {getMaxSlots(playerState)})
                    </button>
                </div>

                {/* NOTIFICATIONS */}
                {errorMsg && <div className="bg-red-900/80 text-white p-2 text-center absolute top-16 w-full z-10">{errorMsg}</div>}
                {successMsg && <div className="bg-green-900/80 text-white p-2 text-center absolute top-16 w-full z-10">{successMsg}</div>}

                {/* CONTENT */}
                <div className="flex-1 overflow-auto p-4 bg-slate-900/50">

                    {/* BUY TAB */}
                    {activeTab === 'buy' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {listings
                                // .filter(l => l.sellerId !== playerState.nickname) // Filters disabled to show ALL
                                .sort((a, b) => b.listedAt - a.listedAt)
                                .map(listing => (
                                    <div key={listing.id} className="bg-slate-800 border border-slate-700 p-3 rounded hover:border-slate-500 transition-colors">
                                        <div className="flex items-start gap-3">
                                            <div className="w-12 h-12 bg-slate-900 border border-slate-600 rounded flex items-center justify-center p-1">
                                                {renderItemIcon(listing.item)}
                                            </div>
                                            <div className="flex-1">
                                                <div className={`font-bold ${renderRarityColor(listing.item.rarity)}`}>
                                                    {listing.item.name} <span className="text-xs text-gray-500">+{listing.item.plus || 0}</span>
                                                </div>
                                                <div className="text-xs text-slate-400">Satıcı: {listing.sellerId}</div>
                                                <div className="text-xs text-slate-500">Tier {listing.item.tier} - {listing.item.type.toUpperCase()}</div>
                                            </div>
                                        </div>
                                        <div className="mt-3 flex justify-between items-center">
                                            <div className={`font-bold font-mono ${listing.currency === 'gold' ? 'text-yellow-400' : 'text-emerald-400'}`}>
                                                {listing.price.toLocaleString()} {listing.currency === 'gold' ? 'Altın' : 'DC'}
                                            </div>
                                            <button
                                                onClick={() => handleBuy(listing.id)}
                                                className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm font-bold shadow-sm"
                                            >
                                                SATIN AL
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            {listings.length === 0 && <div className="text-slate-400 text-center col-span-full py-10">Pazarda hiç ilan yok.</div>}
                        </div>
                    )}

                    {/* SELL TAB */}
                    {activeTab === 'sell' && (
                        <div className="flex flex-col md:flex-row gap-6 h-full">
                            {/* Inventory List */}
                            <div className="flex-1 bg-slate-800/50 p-3 rounded border border-slate-700 overflow-auto max-h-[60vh]">
                                <h3 className="text-slate-300 font-bold mb-3">Envanterindeki Eşyalar</h3>
                                <div className="grid grid-cols-4 gap-2">
                                    {playerState.inventory.map((item, idx) => (
                                        <button
                                            key={item.id + idx}
                                            onClick={() => setSelectedSellItem(item)}
                                            className={`p-2 border rounded relative group ${selectedSellItem?.id === item.id ? 'border-yellow-500 bg-slate-700' : 'border-slate-600 bg-slate-800 hover:border-slate-400'}`}
                                            title={item.name}
                                        >
                                            <div className="w-10 h-10 mx-auto flex items-center justify-center">
                                                {renderItemIcon(item)}
                                            </div>
                                            <div className="absolute top-0 right-0 text-[10px] bg-black/60 px-1">{item.tier}</div>
                                            {item.plus && <div className="absolute bottom-0 right-0 text-[10px] text-yellow-300">+{item.plus}</div>}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Sell Form */}
                            <div className="w-full md:w-1/3 bg-slate-800 p-4 rounded border border-slate-700 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
                                <h3 className="text-yellow-400 font-bold text-center border-b border-slate-700 pb-2">SATIŞ İŞLEMİ</h3>

                                {selectedSellItem ? (
                                    <>
                                        <div className="text-center">
                                            <div className={`text-lg font-bold ${renderRarityColor(selectedSellItem.rarity)}`}>{selectedSellItem.name}</div>
                                            <div className="text-slate-400 text-sm">Tier {selectedSellItem.tier} - {selectedSellItem.type}</div>
                                        </div>

                                        <div className="flex flex-col gap-1">
                                            <label className="text-sm text-slate-300">Fiyat:</label>
                                            <input
                                                type="number"
                                                value={sellPrice}
                                                onChange={(e) => setSellPrice(Number(e.target.value))}
                                                className="bg-slate-900 border border-slate-600 p-2 rounded text-white"
                                                min={1}
                                            />
                                        </div>

                                        <div className="flex flex-col gap-1">
                                            <label className="text-sm text-slate-300">Para Birimi:</label>
                                            <select
                                                value={sellCurrency}
                                                onChange={(e) => setSellCurrency(e.target.value as any)}
                                                className="bg-slate-900 border border-slate-600 p-2 rounded text-white"
                                            >
                                                <option value="gold">Altın (Gold)</option>
                                                <option value="gems">Donate Coin (DC)</option>
                                            </select>
                                        </div>

                                        <div className="mt-auto pt-4 border-t border-slate-700">
                                            <div className="flex justify-between text-xs text-slate-400 mb-2">
                                                <span>Pazar Vergisi:</span>
                                                <span>%10</span>
                                            </div>
                                            <button
                                                onClick={handleSell}
                                                className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded shadow-lg"
                                            >
                                                İLANI OLUŞTUR
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-slate-500 text-center">
                                        Satmak istediğin eşyayı seç.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* MY LISTINGS TAB */}
                    {activeTab === 'my_listings' && (
                        <div className="space-y-2">
                            {listings
                                .filter(l => l.sellerId === playerState.nickname)
                                .map(listing => (
                                    <div key={listing.id} className="bg-slate-800 border-l-4 border-blue-500 p-3 rounded flex justify-between items-center">
                                        <div className="flex items-center gap-4">
                                            <div className={`font-bold ${renderRarityColor(listing.item.rarity)}`}>{listing.item.name}</div>
                                            <div className="text-slate-400 text-sm">{listing.price} {listing.currency}</div>
                                        </div>
                                        <button
                                            onClick={() => handleCancel(listing.id)}
                                            className="px-4 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-600/50 rounded text-sm"
                                        >
                                            İPTAL ET
                                        </button>
                                    </div>
                                ))}
                            {listings.filter(l => l.sellerId === playerState.nickname).length === 0 && <div className="text-slate-400 text-center py-10">Aktif ilanınız yok.</div>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
