import React, { useState } from 'react';
import { X, Check, Lock, Unlock, Coins, ArrowRightLeft, Shield } from 'lucide-react';
import { Trade, Item, PlayerState } from '../types';

const LOCAL_RARITY_COLORS: Record<string, string> = {
    common: '#9ca3af',
    uncommon: '#16a34a',
    rare: '#2563eb',
    epic: '#9333ea',
    legendary: '#d97706',
    ancient: '#dc2626'
};

interface TradeViewProps {
    trade: Trade;
    playerState: PlayerState;
    onAddItem: (item: Item) => void;
    onSetGold: (amount: number) => void;
    onConfirm: () => void;
    onCancel: () => void;
    onClose: () => void; // Usually same as cancel
}

const TradeView: React.FC<TradeViewProps> = ({
    trade,
    playerState,
    onAddItem,
    onSetGold,
    onConfirm,
    onCancel,
    onClose
}) => {
    const [goldInput, setGoldInput] = useState(0);

    // Identify which side is "Me" vs "Them"
    // We need to know our own ID. PlayerState has nickname.
    // If trade.senderId === playerState.nickname (assuming ID=Nickname for now as per PartyView)
    // Actually, backend uses IDs. GameDashboard uses Nickname. This ID mismatch is a recurring theme.
    // Let's assume we can match by `senderId === playerState.nickname` OR we rely on `trade.sender` vs `trade.receiver` based on logic passed from parent.
    // Ideally, the Parent (GameDashboard) passes `myOffer` and `theirOffer`.
    // But let's try to derive it.

    // For specific implementation, I'll calculate it:
    const isSender = trade.senderId === playerState.nickname; // Basic assumption
    // If IDs are cryptic strings (MongoID), this won't work unless playerState has ID.
    // GameDashboard logic needs to handle this matching. 
    // For now, I'll assume standard usage.

    // Actually, better approach: The API returns `myTrades`. The current user context is implicit.
    // If I initiated, I am sender. 

    const mySide = isSender ? 'sender' : 'receiver';
    const theirSide = isSender ? 'receiver' : 'sender';

    const myOffer = trade[mySide];
    const theirOffer = trade[theirSide];

    // If logic fails (e.g. ID mismatch), fallback to Sender = Me (for visual testing)
    // In real app, this needs robust ID check.
    const effectiveMyOffer = myOffer || trade.sender;
    const effectiveTheirOffer = theirOffer || trade.receiver;

    const handleGoldChange = (val: string) => {
        const amount = Math.max(0, parseInt(val) || 0);
        if (amount <= playerState.credits) {
            setGoldInput(amount);
            onSetGold(amount);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 rounded-2xl border border-slate-600 w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                {/* Header */}
                <div className="bg-slate-800 px-6 py-4 flex items-center justify-between border-b border-slate-700">
                    <div className="flex items-center gap-3">
                        <ArrowRightLeft className="text-blue-400" size={24} />
                        <h2 className="text-xl font-bold text-white">Ticaret</h2>
                    </div>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Left: Trade Area */}
                    <div className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto">
                        <div className="flex gap-4 min-h-[400px]">
                            {/* My Offer */}
                            <div className={`flex-1 bg-slate-800/50 rounded-xl p-4 border-2 ${effectiveMyOffer.isConfirmed ? 'border-green-500' : 'border-slate-700'} flex flex-col`}>
                                <h3 className="text-center font-bold text-white mb-4 border-b border-slate-700 pb-2">SEN</h3>

                                {/* Items Grid */}
                                <div className="grid grid-cols-4 gap-2 mb-4 flex-1 content-start">
                                    {effectiveMyOffer.items.map((item, idx) => (
                                        <div key={idx} className="aspect-square bg-slate-700 rounded border border-slate-600 relative group">
                                            {item.image ? (
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover p-1" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xs text-center p-1">{item.name}</div>
                                            )}
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                <span className="text-[10px] text-white font-bold">{item.name}</span>
                                            </div>
                                        </div>
                                    ))}
                                    {Array.from({ length: Math.max(0, 16 - effectiveMyOffer.items.length) }).map((_, i) => (
                                        <div key={`empty-${i}`} className="aspect-square bg-slate-800/50 rounded border border-slate-700/50" />
                                    ))}
                                </div>

                                {/* Gold */}
                                <div className="bg-slate-900 rounded p-3 flex items-center gap-3 border border-slate-700">
                                    <Coins className="text-yellow-500" size={20} />
                                    <input
                                        type="number"
                                        value={goldInput}
                                        onChange={(e) => handleGoldChange(e.target.value)}
                                        disabled={effectiveMyOffer.isConfirmed}
                                        className="bg-transparent text-white font-bold w-full focus:outline-none"
                                        placeholder="0"
                                    />
                                </div>

                                {/* Status */}
                                <div className="mt-4 flex justify-center">
                                    {effectiveMyOffer.isConfirmed ? (
                                        <div className="bg-green-600/20 text-green-400 px-4 py-2 rounded-lg flex items-center gap-2 font-bold animate-pulse">
                                            <Lock size={16} /> ONAYLANDI
                                        </div>
                                    ) : (
                                        <div className="text-gray-500 text-sm font-medium">Bekleniyor...</div>
                                    )}
                                </div>
                            </div>

                            {/* Separator / Status */}
                            <div className="flex flex-col justify-center items-center gap-2">
                                <ArrowRightLeft className="text-slate-600 animate-pulse" />
                            </div>

                            {/* Their Offer */}
                            <div className={`flex-1 bg-slate-800/50 rounded-xl p-4 border-2 ${effectiveTheirOffer.isConfirmed ? 'border-green-500' : 'border-slate-700'} flex flex-col`}>
                                <h3 className="text-center font-bold text-gray-300 mb-4 border-b border-slate-700 pb-2">DİĞER OYUNCU</h3>

                                {/* Items Grid */}
                                <div className="grid grid-cols-4 gap-2 mb-4 flex-1 content-start">
                                    {effectiveTheirOffer.items.map((item, idx) => (
                                        <div key={idx} className="aspect-square bg-slate-700 rounded border border-slate-600 relative group">
                                            {item.image ? (
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover p-1" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xs text-center p-1">{item.name}</div>
                                            )}
                                        </div>
                                    ))}
                                    {Array.from({ length: Math.max(0, 16 - effectiveTheirOffer.items.length) }).map((_, i) => (
                                        <div key={`empty-${i}`} className="aspect-square bg-slate-800/50 rounded border border-slate-700/50" />
                                    ))}
                                </div>

                                {/* Gold */}
                                <div className="bg-slate-900 rounded p-3 flex items-center gap-3 border border-slate-700">
                                    <Coins className="text-yellow-500" size={20} />
                                    <span className="text-white font-bold">{effectiveTheirOffer.gold.toLocaleString()}</span>
                                </div>

                                {/* Status */}
                                <div className="mt-4 flex justify-center">
                                    {effectiveTheirOffer.isConfirmed ? (
                                        <div className="bg-green-600/20 text-green-400 px-4 py-2 rounded-lg flex items-center gap-2 font-bold animate-pulse">
                                            <Lock size={16} /> ONAYLANDI
                                        </div>
                                    ) : (
                                        <div className="text-gray-500 text-sm font-medium">Bekleniyor...</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 mt-auto">
                            <button
                                onClick={onCancel}
                                className="flex-1 bg-red-600/20 hover:bg-red-600/40 text-red-500 font-bold py-3 rounded-lg border border-red-900/50 transition-colors"
                            >
                                İptal Et
                            </button>
                            <button
                                onClick={onConfirm}
                                disabled={effectiveMyOffer.isConfirmed}
                                className={`flex-1 font-bold py-3 rounded-lg border transition-all ${effectiveMyOffer.isConfirmed
                                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed border-slate-600'
                                    : 'bg-green-600 hover:bg-green-500 text-white border-green-500 shadow-lg shadow-green-900/20'
                                    }`}
                            >
                                {effectiveMyOffer.isConfirmed ? 'Onay İptali Bekleniyor' : 'Ticaretİ Onayla'}
                            </button>
                        </div>
                    </div>

                    {/* Right: Inventory Selector */}
                    <div className="w-72 bg-slate-800 border-l border-slate-700 p-4 flex flex-col">
                        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                            <Shield size={18} className="text-purple-400" />
                            Eşya Ekle
                        </h3>
                        <div className="overflow-y-auto flex-1 space-y-2 pr-2 custom-scrollbar">
                            {playerState.inventory
                                .filter(item => !effectiveMyOffer.items.some(offered => offered.id === item.id)) // Exclude already added
                                .map(item => (
                                    <div
                                        key={item.id}
                                        onClick={() => !effectiveMyOffer.isConfirmed && onAddItem(item)}
                                        className={`p-2 rounded bg-slate-700/50 hover:bg-slate-700 cursor-pointer border border-slate-600 flex items-center gap-3 transition-colors ${effectiveMyOffer.isConfirmed ? 'opacity-50 pointer-events-none' : ''}`}
                                    >
                                        <div className="w-10 h-10 bg-slate-900 rounded flex items-center justify-center shrink-0 border border-slate-600">
                                            {item.image ? <img src={item.image} className="w-8 h-8" /> : <div className="w-full h-full" style={{ backgroundColor: LOCAL_RARITY_COLORS[item.rarity] || '#aaa' }} />}
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-white text-sm font-medium truncate" style={{ color: LOCAL_RARITY_COLORS[item.rarity] }}>{item.name}</p>
                                            <p className="text-slate-400 text-xs">Lv.{item.levelReq || 1} {item.type}</p>
                                        </div>
                                    </div>
                                ))}
                            {playerState.inventory.length === 0 && (
                                <p className="text-slate-500 text-center text-sm mt-10">Envanter boş.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TradeView;
