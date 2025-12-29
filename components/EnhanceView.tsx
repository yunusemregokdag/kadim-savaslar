import React, { useState } from 'react';
import { PlayerState, Item } from '../types';
import { renderItemIcon } from './ui/ItemIcons';
import { Zap, Shield, ArrowUp, AlertTriangle } from 'lucide-react';
import { soundManager } from './SoundManager'; // Ensure this path is correct relative to components/

interface EnhanceViewProps {
    playerState: PlayerState;
    onUpdatePlayer: (updates: Partial<PlayerState>) => void;
}

// Knight Online Style Rates
const SUCCESS_RATES: Record<number, number> = {
    0: 100, 1: 100, 2: 100, 3: 100,
    4: 60,
    5: 35,
    6: 15,
    7: 5,    // +7 Very Hard
    8: 2,
    9: 1,
    10: 0.5,
    11: 0.2,
    12: 0.1
};

const BURN_RATES: Record<number, number> = {
    5: 10,
    6: 20,
    7: 35,
    8: 50,
    9: 60,
    10: 70,
    11: 80,
    12: 90
};

export const EnhanceView: React.FC<EnhanceViewProps> = ({ playerState, onUpdatePlayer }) => {
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const [selectedScroll, setSelectedScroll] = useState<Item | null>(null);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'fail' | 'burn' | null }>({ text: '', type: null });
    const [isAnimating, setIsAnimating] = useState(false);

    // Filter upgradeable items
    const upgradeableItems = playerState.inventory.filter(i =>
        ['weapon', 'armor', 'helmet', 'pants', 'boots', 'shield'].includes(i.type) && (i.plus === undefined || i.plus < 12)
    );

    // Filter scrolls
    // Filter scrolls (include 'upgrade_scroll', 'consumable' and check for 'Scroll', 'Kağıdı', 'Parşömen')
    const scrolls = playerState.inventory.filter(i =>
        (i.type === 'upgrade_scroll' || i.type === 'consumable') &&
        (i.name.includes('Scroll') || i.name.includes('Kağıdı') || i.name.includes('Parşömen'))
    );

    const handleUpgrade = () => {
        if (!selectedItem || !selectedScroll || isAnimating) return;

        // TIER MATCH CHECK
        const itemTier = selectedItem.tier || 1;
        const scrollTier = selectedScroll.tier || 1;
        if (itemTier !== scrollTier) {
            setMessage({ text: `Tier uyuşmuyor! T${scrollTier} kağıt sadece T${scrollTier} eşya yükseltir.`, type: 'fail' });
            soundManager.playSFX('error');
            return;
        }

        setIsAnimating(true);
        setMessage({ text: 'Yükseltiliyor...', type: null });
        soundManager.playSFX('anvil');

        setTimeout(() => {
            const currentPlus = selectedItem.plus || 0;
            const successRate = SUCCESS_RATES[currentPlus] ?? 0.1;
            const burnRate = BURN_RATES[currentPlus] ?? 0;

            const roll = Math.random() * 100;
            const isSuccess = roll < successRate;
            const isBurned = !isSuccess && burnRate > 0 && (Math.random() * 100) < burnRate;

            let finalInventory = [...playerState.inventory];
            // Remove Scroll
            const scrollIndex = finalInventory.findIndex(i => i.id === selectedScroll.id);
            if (scrollIndex > -1) finalInventory.splice(scrollIndex, 1);

            if (isSuccess) {
                // Success
                const newPlus = currentPlus + 1;
                finalInventory = finalInventory.map(i => i.id === selectedItem.id ? { ...i, plus: newPlus } : i);
                setMessage({ text: `BAŞARILI! +${newPlus}`, type: 'success' });
                soundManager.playSFX('success_jingle');
                setSelectedItem(prev => prev ? { ...prev, plus: newPlus } : null);
            } else if (isBurned) {
                // Burn
                finalInventory = finalInventory.filter(i => i.id !== selectedItem.id);
                setMessage({ text: 'EŞYA YANDI!', type: 'burn' });
                soundManager.playSFX('break');
                setSelectedItem(null);
            } else {
                // Fail (No Burn)
                setMessage({ text: 'Başarısız.', type: 'fail' });
                soundManager.playSFX('error');
            }

            onUpdatePlayer({ inventory: finalInventory });
            setIsAnimating(false);

            // Check if scroll still exists
            if (!finalInventory.find(i => i.id === selectedScroll.id)) setSelectedScroll(null);

        }, 2000);
    };

    const rate = selectedItem ? (SUCCESS_RATES[selectedItem.plus || 0] ?? 0) : 0;
    const burn = selectedItem ? (BURN_RATES[selectedItem.plus || 0] ?? 0) : 0;

    // Check if tiers match for button state
    const tiersMatch = selectedItem && selectedScroll ? (selectedItem.tier || 1) === (selectedScroll.tier || 1) : true;

    return (
        <div className="flex flex-col h-full bg-slate-900 text-slate-200 p-4 gap-4">

            {/* WORKBENCH AREA */}
            <div className="flex-1 bg-slate-950/50 rounded-xl border border-dashed border-slate-700 relative flex items-center justify-center gap-8 md:gap-16">

                {/* ITEM SLOT */}
                <div className="flex flex-col items-center gap-2">
                    <span className="text-xs uppercase font-bold text-slate-500">Eşya</span>
                    <div
                        className={`w-24 h-24 bg-slate-900 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all ${selectedItem ? 'border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'border-slate-700 hover:border-slate-500'}`}
                        onClick={() => setSelectedItem(null)}
                    >
                        {selectedItem ? renderItemIcon(selectedItem) : <Shield className="w-8 h-8 opacity-20" />}
                    </div>
                </div>

                {/* ARROW & STATS */}
                <div className="flex flex-col items-center justify-center gap-2">
                    <ArrowUp className={`w-8 h-8 transition-all ${isAnimating ? 'text-amber-400 animate-bounce' : 'text-slate-600'}`} />
                    {selectedItem && (
                        <div className="flex flex-col items-center text-xs font-mono bg-black/50 p-2 rounded border border-slate-800">
                            <span className="text-green-400">Şans: %{rate}</span>
                            {burn > 0 && <span className="text-red-500 animate-pulse">Yanma: %{burn}</span>}
                        </div>
                    )}
                </div>

                {/* SCROLL SLOT */}
                <div className="flex flex-col items-center gap-2">
                    <span className="text-xs uppercase font-bold text-slate-500">Kağıt</span>
                    <div
                        className={`w-24 h-24 bg-slate-900 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all ${selectedScroll ? 'border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'border-slate-700 hover:border-slate-500'}`}
                        onClick={() => setSelectedScroll(null)}
                    >
                        {selectedScroll ? renderItemIcon(selectedScroll) : <Zap className="w-8 h-8 opacity-20" />}
                    </div>
                </div>

            </div>

            {/* MESSAGE BOX */}
            <div className="h-10 flex items-center justify-center">
                {message.text && (
                    <span className={`text-lg font-bold ${message.type === 'success' ? 'text-green-400 drop-shadow-md' :
                        message.type === 'burn' ? 'text-red-600 drop-shadow-md animate-shake' :
                            message.type === 'fail' ? 'text-red-400' : 'text-slate-400'
                        }`}>
                        {message.text}
                    </span>
                )}
            </div>

            {/* TIER MISMATCH WARNING */}
            {selectedItem && selectedScroll && !tiersMatch && (
                <div className="text-center text-red-400 text-sm font-bold animate-pulse">
                    ⚠️ T{selectedScroll.tier || 1} Kağıt sadece T{selectedScroll.tier || 1} eşya yükseltebilir!
                </div>
            )}

            {/* ACTION BUTTON */}
            <button
                onClick={handleUpgrade}
                disabled={!selectedItem || !selectedScroll || isAnimating || !tiersMatch}
                className={`w-full py-4 text-lg font-bold tracking-widest uppercase transition-all rounded-lg 
                    ${!selectedItem || !selectedScroll || !tiersMatch ? 'bg-slate-800 text-slate-500 cursor-not-allowed' :
                        isAnimating ? 'bg-amber-700 text-amber-200 cursor-wait' :
                            'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-900/40 active:translate-y-1'}`}
            >
                {isAnimating ? 'İşleniyor...' : 'Yükselt'}
            </button>


            {/* INVENTORY LIST */}
            <div className="h-1/3 bg-slate-950 rounded-lg border border-slate-800 p-2 overflow-y-auto">
                <span className="text-xs font-bold text-slate-500 block mb-2 px-1">ENVANTER (Eşya & Kağıt Seçin)</span>
                <div className="grid grid-cols-6 md:grid-cols-10 gap-2">
                    {/* Items */}
                    {upgradeableItems.map(item => (
                        <div
                            key={item.id}
                            onClick={() => !isAnimating && setSelectedItem(item)}
                            className={`aspect-square bg-slate-900 border rounded cursor-pointer hover:border-amber-400 transition-colors relative ${selectedItem?.id === item.id ? 'border-amber-500 ring-1 ring-amber-500' : 'border-slate-700'}`}
                        >
                            {renderItemIcon(item)}
                            {item.tier && <span className="absolute top-[2px] right-[2px] bg-black/60 text-[9px] text-amber-500 px-1 rounded font-mono">T{item.tier}</span>}
                        </div>
                    ))}
                    {/* Separator if needed, but grid flows */}
                    {scrolls.map(item => (
                        <div
                            key={item.id}
                            onClick={() => !isAnimating && setSelectedScroll(item)}
                            className={`aspect-square bg-slate-900 border rounded cursor-pointer hover:border-purple-400 transition-colors relative ${selectedScroll?.id === item.id ? 'border-purple-500 ring-1 ring-purple-500' : 'border-slate-700'}`}
                        >
                            {renderItemIcon(item)}
                            {item.tier && <span className="absolute top-[2px] right-[2px] bg-black/60 text-[9px] text-purple-300 px-1 rounded font-mono">T{item.tier}</span>}
                        </div>
                    ))}
                </div>
                {upgradeableItems.length === 0 && scrolls.length === 0 && (
                    <div className="text-center text-slate-600 py-4 text-sm">Hiç uygun eşya veya kağıt yok.</div>
                )}
            </div>
        </div>
    );
};
