import React, { useState, useEffect } from 'react';
import { PlayerState, Item } from '../types';
import {
    Gavel, Search, Filter, Clock, Coins, TrendingUp, TrendingDown,
    Plus, X, ChevronDown, Check, AlertTriangle, Package, Star
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface AuctionListing {
    id: string;
    sellerId: string;
    sellerName: string;
    item: Item;
    startPrice: number;
    currentBid: number;
    buyoutPrice?: number;
    highestBidderId?: string;
    highestBidderName?: string;
    endsAt: number;
    createdAt: number;
    bids: number;
}

// Demo listings
const generateDemoListings = (): AuctionListing[] => {
    const items: Partial<Item>[] = [
        { name: 'Ateş Kılıcı', tier: 3, type: 'weapon', rarity: 'rare' },
        { name: 'Buz Zırhı', tier: 4, type: 'armor', rarity: 'epic' },
        { name: 'Şimşek Miğferi', tier: 3, type: 'helmet', rarity: 'rare' },
        { name: 'Ejderha Kolyesi', tier: 4, type: 'necklace', rarity: 'epic' },
        { name: 'Gölge Botu', tier: 2, type: 'boots', rarity: 'uncommon' },
        { name: 'Altın Küpe', tier: 3, type: 'earring', rarity: 'rare' },
        { name: 'Efsanevi Kılıç', tier: 5, type: 'weapon', rarity: 'legendary' },
        { name: 'Kadim Zırh', tier: 5, type: 'armor', rarity: 'ancient' },
    ];

    const sellers = ['EjderhaAvcı', 'GölgeNinja', 'BuzKralı', 'AteşLordu', 'RuhKaçıran'];

    return items.map((item, idx) => ({
        id: uuidv4(),
        sellerId: `seller_${idx}`,
        sellerName: sellers[idx % sellers.length],
        item: { ...item, id: uuidv4() } as Item,
        startPrice: (item.tier || 1) * 500,
        currentBid: (item.tier || 1) * 500 + Math.floor(Math.random() * 1000),
        buyoutPrice: (item.tier || 1) * 2000,
        highestBidderId: Math.random() > 0.5 ? 'bidder_1' : undefined,
        highestBidderName: Math.random() > 0.5 ? 'GizliAlıcı' : undefined,
        endsAt: Date.now() + (Math.floor(Math.random() * 24) + 1) * 60 * 60 * 1000,
        createdAt: Date.now() - Math.floor(Math.random() * 12) * 60 * 60 * 1000,
        bids: Math.floor(Math.random() * 20),
    }));
};

interface AuctionHouseViewProps {
    playerState: PlayerState;
    onClose: () => void;
    onBid: (listingId: string, amount: number) => void;
    onBuyout: (listingId: string) => void;
    onCreateListing: (item: Item, startPrice: number, buyoutPrice: number, duration: number) => void;
}

export const AuctionHouseView: React.FC<AuctionHouseViewProps> = ({
    playerState,
    onClose,
    onBid,
    onBuyout,
    onCreateListing,
}) => {
    const [listings, setListings] = useState<AuctionListing[]>(() => {
        const saved = localStorage.getItem('auctionListings');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch {
                return generateDemoListings();
            }
        }
        return generateDemoListings();
    });

    const [activeTab, setActiveTab] = useState<'browse' | 'my_bids' | 'my_listings' | 'create'>('browse');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<string>('all');
    const [filterRarity, setFilterRarity] = useState<string>('all');
    const [sortBy, setSortBy] = useState<'ending' | 'price_low' | 'price_high' | 'newest'>('ending');
    const [selectedListing, setSelectedListing] = useState<AuctionListing | null>(null);
    const [bidAmount, setBidAmount] = useState<number>(0);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Create listing state
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const [startPrice, setStartPrice] = useState<number>(100);
    const [buyoutPrice, setBuyoutPrice] = useState<number>(500);
    const [duration, setDuration] = useState<number>(24);

    const [now, setNow] = useState(Date.now());

    // Update timer
    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(interval);
    }, []);

    // Save listings
    useEffect(() => {
        localStorage.setItem('auctionListings', JSON.stringify(listings));
    }, [listings]);

    const formatTimeLeft = (endsAt: number): string => {
        const diff = endsAt - now;
        if (diff <= 0) return 'Bitti';

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (hours >= 24) return `${Math.floor(hours / 24)}g ${hours % 24}s`;
        if (hours > 0) return `${hours}s ${minutes}d`;
        return `${minutes}d`;
    };

    const getRarityColor = (rarity: string): string => {
        switch (rarity) {
            case 'common': return 'text-slate-400 border-slate-600';
            case 'uncommon': return 'text-green-400 border-green-600';
            case 'rare': return 'text-blue-400 border-blue-600';
            case 'epic': return 'text-purple-400 border-purple-600';
            case 'legendary': return 'text-orange-400 border-orange-600';
            case 'ancient': return 'text-red-400 border-red-600';
            default: return 'text-slate-400 border-slate-600';
        }
    };

    const getTypeIcon = (type: string): string => {
        switch (type) {
            case 'weapon': return '⚔️';
            case 'armor': return '🛡️';
            case 'helmet': return '⛑️';
            case 'boots': return '👢';
            case 'necklace': return '📿';
            case 'earring': return '💎';
            case 'pants': return '👖';
            default: return '📦';
        }
    };

    // Filter and sort listings
    const filteredListings = listings
        .filter(l => l.endsAt > now) // Only active
        .filter(l => searchTerm === '' || l.item.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .filter(l => filterType === 'all' || l.item.type === filterType)
        .filter(l => filterRarity === 'all' || l.item.rarity === filterRarity)
        .sort((a, b) => {
            switch (sortBy) {
                case 'ending': return a.endsAt - b.endsAt;
                case 'price_low': return a.currentBid - b.currentBid;
                case 'price_high': return b.currentBid - a.currentBid;
                case 'newest': return b.createdAt - a.createdAt;
                default: return 0;
            }
        });

    const myBids = listings.filter(l => l.highestBidderId === playerState.nickname);
    const myListings = listings.filter(l => l.sellerName === playerState.nickname);

    const handleBid = (listing: AuctionListing) => {
        if (bidAmount <= listing.currentBid) {
            setMessage({ type: 'error', text: 'Teklif mevcut tekliften yüksek olmalı!' });
            return;
        }
        if (bidAmount > playerState.credits) {
            setMessage({ type: 'error', text: 'Yeterli altın yok!' });
            return;
        }

        setListings(prev => prev.map(l =>
            l.id === listing.id
                ? { ...l, currentBid: bidAmount, highestBidderId: playerState.nickname, highestBidderName: playerState.nickname, bids: l.bids + 1 }
                : l
        ));
        onBid(listing.id, bidAmount);
        setMessage({ type: 'success', text: `${bidAmount} altın teklif verildi!` });
        setSelectedListing(null);
    };

    const handleBuyout = (listing: AuctionListing) => {
        if (!listing.buyoutPrice) return;
        if (listing.buyoutPrice > playerState.credits) {
            setMessage({ type: 'error', text: 'Yeterli altın yok!' });
            return;
        }

        setListings(prev => prev.filter(l => l.id !== listing.id));
        onBuyout(listing.id);
        setMessage({ type: 'success', text: `${listing.item.name} satın alındı!` });
        setSelectedListing(null);
    };

    const handleCreateListing = () => {
        if (!selectedItem) {
            setMessage({ type: 'error', text: 'Bir eşya seçin!' });
            return;
        }
        if (startPrice < 1) {
            setMessage({ type: 'error', text: 'Başlangıç fiyatı en az 1 olmalı!' });
            return;
        }

        const newListing: AuctionListing = {
            id: uuidv4(),
            sellerId: playerState.nickname,
            sellerName: playerState.nickname,
            item: selectedItem,
            startPrice,
            currentBid: startPrice,
            buyoutPrice: buyoutPrice > startPrice ? buyoutPrice : undefined,
            endsAt: Date.now() + duration * 60 * 60 * 1000,
            createdAt: Date.now(),
            bids: 0,
        };

        setListings(prev => [newListing, ...prev]);
        onCreateListing(selectedItem, startPrice, buyoutPrice, duration);
        setMessage({ type: 'success', text: 'İlan oluşturuldu!' });
        setSelectedItem(null);
        setActiveTab('my_listings');
    };

    const tabs = [
        { id: 'browse' as const, label: 'Göz At', icon: <Search size={14} /> },
        { id: 'my_bids' as const, label: 'Tekliflerim', icon: <Gavel size={14} />, count: myBids.length },
        { id: 'my_listings' as const, label: 'İlanlarım', icon: <Package size={14} />, count: myListings.length },
        { id: 'create' as const, label: 'İlan Ver', icon: <Plus size={14} /> },
    ];

    return (
        <div className="fixed inset-0 z-[90] bg-black/90 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-amber-900 to-yellow-900 p-4 md:p-6 border-b border-amber-700">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3 md:gap-4">
                            <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
                                <Gavel size={24} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl md:text-2xl font-bold text-white">Açık Artırma Evi</h2>
                                <p className="text-amber-200 text-xs md:text-sm">{filteredListings.length} aktif ilan</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="hidden md:flex bg-black/30 px-4 py-2 rounded-lg items-center gap-2">
                                <Coins size={16} className="text-yellow-400" />
                                <span className="font-mono font-bold text-white">{playerState.credits.toLocaleString()}</span>
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
                <div className="flex border-b border-slate-700 overflow-x-auto">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 min-w-[80px] py-3 px-2 md:px-4 text-xs md:text-sm font-medium flex items-center justify-center gap-1 md:gap-2 transition-colors whitespace-nowrap ${activeTab === tab.id
                                    ? 'bg-slate-800 text-amber-400 border-b-2 border-amber-400'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                }`}
                        >
                            {tab.icon}
                            {tab.label}
                            {tab.count !== undefined && tab.count > 0 && (
                                <span className="bg-amber-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">{tab.count}</span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden flex flex-col">
                    {activeTab === 'browse' && (
                        <>
                            {/* Filters */}
                            <div className="p-3 md:p-4 bg-slate-800/50 border-b border-slate-700 flex flex-wrap gap-2 md:gap-3">
                                <div className="flex-1 min-w-[150px]">
                                    <div className="relative">
                                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                        <input
                                            type="text"
                                            placeholder="Eşya ara..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:border-amber-500 focus:outline-none"
                                        />
                                    </div>
                                </div>
                                <select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                    className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm"
                                >
                                    <option value="all">Tüm Tipler</option>
                                    <option value="weapon">Silah</option>
                                    <option value="armor">Zırh</option>
                                    <option value="helmet">Miğfer</option>
                                    <option value="boots">Bot</option>
                                    <option value="necklace">Kolye</option>
                                    <option value="earring">Küpe</option>
                                </select>
                                <select
                                    value={filterRarity}
                                    onChange={(e) => setFilterRarity(e.target.value)}
                                    className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm"
                                >
                                    <option value="all">Tüm Nadirlik</option>
                                    <option value="common">Sıradan</option>
                                    <option value="uncommon">Yaygın Değil</option>
                                    <option value="rare">Nadir</option>
                                    <option value="epic">Epik</option>
                                    <option value="legendary">Efsanevi</option>
                                    <option value="ancient">Kadim</option>
                                </select>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as any)}
                                    className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm"
                                >
                                    <option value="ending">Bitiş Zamanı</option>
                                    <option value="price_low">Fiyat (Düşük)</option>
                                    <option value="price_high">Fiyat (Yüksek)</option>
                                    <option value="newest">En Yeni</option>
                                </select>
                            </div>

                            {/* Listings Grid */}
                            <div className="flex-1 overflow-y-auto p-3 md:p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {filteredListings.map(listing => (
                                        <div
                                            key={listing.id}
                                            onClick={() => { setSelectedListing(listing); setBidAmount(listing.currentBid + 100); }}
                                            className={`bg-slate-800/50 border rounded-xl p-3 cursor-pointer hover:bg-slate-800 transition-colors ${getRarityColor(listing.item.rarity || 'common')}`}
                                        >
                                            <div className="flex gap-3">
                                                <div className="w-12 h-12 bg-black/40 rounded-lg flex items-center justify-center text-2xl">
                                                    {getTypeIcon(listing.item.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-bold text-white truncate">{listing.item.name}</div>
                                                    <div className="text-xs text-slate-500">T{listing.item.tier} • {listing.sellerName}</div>
                                                </div>
                                            </div>
                                            <div className="mt-3 flex justify-between items-end">
                                                <div>
                                                    <div className="text-xs text-slate-400">Mevcut Teklif</div>
                                                    <div className="text-yellow-400 font-bold">{listing.currentBid.toLocaleString()} G</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xs text-slate-400 flex items-center gap-1">
                                                        <Clock size={10} /> {formatTimeLeft(listing.endsAt)}
                                                    </div>
                                                    <div className="text-xs text-slate-500">{listing.bids} teklif</div>
                                                </div>
                                            </div>
                                            {listing.buyoutPrice && (
                                                <div className="mt-2 pt-2 border-t border-slate-700 flex justify-between">
                                                    <span className="text-xs text-slate-400">Hemen Al</span>
                                                    <span className="text-green-400 font-bold text-sm">{listing.buyoutPrice.toLocaleString()} G</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                {filteredListings.length === 0 && (
                                    <div className="text-center py-12 text-slate-500">
                                        İlan bulunamadı
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* My Bids / My Listings tabs similar structure */}
                    {(activeTab === 'my_bids' || activeTab === 'my_listings') && (
                        <div className="flex-1 overflow-y-auto p-4">
                            {(activeTab === 'my_bids' ? myBids : myListings).length === 0 ? (
                                <div className="text-center py-12 text-slate-500">
                                    {activeTab === 'my_bids' ? 'Henüz teklif vermediniz' : 'Henüz ilan oluşturmadınız'}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {(activeTab === 'my_bids' ? myBids : myListings).map(listing => (
                                        <div key={listing.id} className={`bg-slate-800/50 border rounded-xl p-4 ${getRarityColor(listing.item.rarity || 'common')}`}>
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 bg-black/40 rounded-lg flex items-center justify-center text-3xl">
                                                    {getTypeIcon(listing.item.type)}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-bold text-white">{listing.item.name}</div>
                                                    <div className="text-sm text-slate-400">Mevcut: {listing.currentBid.toLocaleString()} G</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className={`px-2 py-1 rounded text-xs font-bold ${listing.endsAt < now ? 'bg-red-900/50 text-red-400' : 'bg-green-900/50 text-green-400'
                                                        }`}>
                                                        {listing.endsAt < now ? 'Bitti' : formatTimeLeft(listing.endsAt)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Create Listing */}
                    {activeTab === 'create' && (
                        <div className="flex-1 overflow-y-auto p-4">
                            <div className="max-w-md mx-auto space-y-4">
                                <div>
                                    <label className="block text-sm text-slate-400 mb-2">Satılacak Eşya</label>
                                    <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto bg-slate-800 p-2 rounded-lg">
                                        {playerState.inventory.filter(i => i.type !== 'consumable' && i.type !== 'material').map(item => (
                                            <div
                                                key={item.id}
                                                onClick={() => setSelectedItem(item)}
                                                className={`p-2 rounded cursor-pointer border-2 transition-colors ${selectedItem?.id === item.id
                                                        ? 'border-amber-500 bg-amber-900/30'
                                                        : 'border-transparent hover:border-slate-600'
                                                    }`}
                                            >
                                                <div className="text-center text-xl">{getTypeIcon(item.type)}</div>
                                                <div className="text-[10px] text-center text-white truncate">{item.name}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm text-slate-400 mb-2">Başlangıç Fiyatı</label>
                                    <input
                                        type="number"
                                        value={startPrice}
                                        onChange={(e) => setStartPrice(parseInt(e.target.value) || 0)}
                                        className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-slate-400 mb-2">Hemen Al Fiyatı (Opsiyonel)</label>
                                    <input
                                        type="number"
                                        value={buyoutPrice}
                                        onChange={(e) => setBuyoutPrice(parseInt(e.target.value) || 0)}
                                        className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-slate-400 mb-2">Süre</label>
                                    <select
                                        value={duration}
                                        onChange={(e) => setDuration(parseInt(e.target.value))}
                                        className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                                    >
                                        <option value={12}>12 Saat</option>
                                        <option value={24}>24 Saat</option>
                                        <option value={48}>48 Saat</option>
                                    </select>
                                </div>

                                <button
                                    onClick={handleCreateListing}
                                    className="w-full py-3 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white font-bold rounded-lg"
                                >
                                    İlan Oluştur
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Bid Modal */}
                {selectedListing && (
                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4 z-10">
                        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-sm w-full">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex gap-3">
                                    <div className="w-14 h-14 bg-black/40 rounded-lg flex items-center justify-center text-3xl">
                                        {getTypeIcon(selectedListing.item.type)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-white">{selectedListing.item.name}</div>
                                        <div className="text-sm text-slate-400">T{selectedListing.item.tier} • {selectedListing.item.rarity}</div>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedListing(null)}><X size={20} className="text-slate-400" /></button>
                            </div>

                            <div className="space-y-3 mb-4">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Mevcut Teklif</span>
                                    <span className="text-yellow-400 font-bold">{selectedListing.currentBid.toLocaleString()} G</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Kalan Süre</span>
                                    <span className="text-white">{formatTimeLeft(selectedListing.endsAt)}</span>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm text-slate-400 mb-2">Teklifin</label>
                                <input
                                    type="number"
                                    value={bidAmount}
                                    onChange={(e) => setBidAmount(parseInt(e.target.value) || 0)}
                                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                                />
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleBid(selectedListing)}
                                    className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg"
                                >
                                    Teklif Ver
                                </button>
                                {selectedListing.buyoutPrice && (
                                    <button
                                        onClick={() => handleBuyout(selectedListing)}
                                        className="flex-1 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg"
                                    >
                                        Hemen Al ({selectedListing.buyoutPrice.toLocaleString()})
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuctionHouseView;
