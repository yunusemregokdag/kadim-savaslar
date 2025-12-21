import React, { useState } from 'react';
import { Hammer, ArrowUp, AlertCircle, Zap } from 'lucide-react';
import { Item } from '../types';

interface CraftingViewProps {
    playerInventory: Item[];
    onUpdateItem: (item: Item) => void;
}

const CraftingView: React.FC<CraftingViewProps> = ({ playerInventory, onUpdateItem }) => {
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const [isForging, setIsForging] = useState(false);
    const [result, setResult] = useState<'success' | 'fail' | null>(null);

    // Filter upgradeable items (Weapons/Armor)
    const upgradeableItems = playerInventory.filter(i =>
        ['weapon', 'armor', 'helmet', 'shield'].includes(i.type) && (i.plus === undefined || i.plus < 10)
    );

    const getUpgradeCost = (item: Item) => {
        const tier = item.tier;
        const plus = item.plus || 0;
        // Cost increases exponentially after +6
        if (plus >= 7) return (plus + 1) * tier * 500; // 5x cost after +7
        if (plus >= 5) return (plus + 1) * tier * 200; // 2x cost at +5-6
        return (plus + 1) * tier * 100;
    };

    const getSuccessRate = (currentPlus: number) => {
        // OLD-SCHOOL MMORPG STYLE - Very hard after +7
        if (currentPlus === 0) return 100;  // Target +1
        if (currentPlus === 1) return 95;   // Target +2
        if (currentPlus === 2) return 85;   // Target +3
        if (currentPlus === 3) return 70;   // Target +4
        if (currentPlus === 4) return 55;   // Target +5
        if (currentPlus === 5) return 35;   // Target +6
        if (currentPlus === 6) return 9;    // Target +7 (harder - was 15)
        if (currentPlus === 7) return 5;    // Target +8 (very hard)
        if (currentPlus === 8) return 1;    // Target +9 (legendary)
        if (currentPlus === 9) return 0.1;  // Target +10 (mythical - 1 in 1000)
        return 0;
    };

    // Burn severity based on enhancement level
    const getBurnResult = (currentPlus: number): { newPlus: number, isDestroyed: boolean, message: string } => {
        if (currentPlus === 7) {
            // +7 -> +8 fail: Drop 3 levels
            return { newPlus: Math.max(0, currentPlus - 3), isDestroyed: false, message: '3 seviye düştü!' };
        }
        if (currentPlus === 8) {
            // +8 -> +9 fail: 30% destroy, 70% drop to +3
            if (Math.random() < 0.3) {
                return { newPlus: 0, isDestroyed: true, message: 'EŞYA YOK OLDU!' };
            }
            return { newPlus: 3, isDestroyed: false, message: '+3 seviyesine düştü!' };
        }
        if (currentPlus >= 9) {
            // +9 -> +10 fail: 50% destroy, 50% drop to +5
            if (Math.random() < 0.5) {
                return { newPlus: 0, isDestroyed: true, message: 'EŞYA TAMAMEN YOK OLDU!' };
            }
            return { newPlus: 5, isDestroyed: false, message: '+5 seviyesine düştü!' };
        }
        // Default for +7 and below - no burn
        return { newPlus: currentPlus, isDestroyed: false, message: '' };
    };

    const [burnMessage, setBurnMessage] = useState<string>('');

    const handleUpgrade = () => {
        if (!selectedItem) return;
        setIsForging(true);
        setResult(null);
        setBurnMessage('');

        const currentPlus = selectedItem.plus || 0;
        const chance = getSuccessRate(currentPlus);
        const cost = getUpgradeCost(selectedItem);

        // Simulating the forging process with dramatic timing
        setTimeout(() => {
            setIsForging(false);
            const roll = Math.random() * 100;
            const isSuccess = roll < chance;

            if (isSuccess) {
                setResult('success');
                const newItem = { ...selectedItem, plus: currentPlus + 1 };
                onUpdateItem(newItem);
                setSelectedItem(newItem);
            } else {
                setResult('fail');

                // BURN RISK ONLY AFTER +6
                if (currentPlus >= 7) {
                    const burnResult = getBurnResult(currentPlus);
                    setBurnMessage(burnResult.message);

                    if (burnResult.isDestroyed) {
                        // Item is destroyed - remove from inventory would need parent callback
                        // For now, set to +0 with a destroyed flag visual
                        const destroyedItem = { ...selectedItem, plus: 0 };
                        onUpdateItem(destroyedItem);
                        setSelectedItem(null);
                    } else if (burnResult.newPlus !== currentPlus) {
                        // Item burns but survives
                        const burnedItem = { ...selectedItem, plus: burnResult.newPlus };
                        onUpdateItem(burnedItem);
                        setSelectedItem(burnedItem);
                    }
                }
                // +6 and below: Just fails, no burn
            }
        }, 2000); // Longer suspense for high risk upgrades
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
            {/* Upgradeable Items List */}
            <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-6 flex flex-col">
                <h3 className="text-xl font-bold rpg-font text-yellow-500 mb-4 flex items-center gap-2">
                    <Hammer size={20} /> Demirci (Yükseltme)
                </h3>
                <p className="text-sm text-slate-400 mb-4">
                    Eşyalarını güçlendir. +7'den sonra yanma riski vardır!
                </p>

                <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {upgradeableItems.length === 0 && <p className="text-slate-500 text-center py-4">Yükseltilecek eşya yok.</p>}
                    {upgradeableItems.map(item => (
                        <div
                            key={item.id}
                            onClick={() => { setSelectedItem(item); setResult(null); }}
                            className={`p-3 rounded-lg border cursor-pointer flex justify-between items-center transition-all ${selectedItem?.id === item.id ? 'bg-indigo-900/40 border-indigo-500' : 'bg-slate-800 border-slate-700 hover:border-slate-500'}`}
                        >
                            <div>
                                <div className="font-bold text-white flex items-center gap-2">
                                    {item.name}
                                    {(item.plus || 0) > 0 && <span className="text-yellow-400">+{item.plus}</span>}
                                </div>
                                <div className="text-xs text-slate-500">Tier {item.tier} • {item.rarity}</div>
                            </div>
                            <div className="text-xs bg-black/40 px-2 py-1 rounded text-slate-300">
                                Seviye {item.plus || 0}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Upgrade Panel */}
            <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center relative overflow-hidden">
                {!selectedItem ? (
                    <div className="text-center text-slate-600">
                        <ArrowUp size={48} className="mx-auto mb-2 opacity-20" />
                        <p>Yükseltmek için bir eşya seç.</p>
                    </div>
                ) : (
                    <div className="w-full text-center">
                        <div className="mb-6 relative">
                            <div className="text-2xl font-bold text-white mb-1">{selectedItem.name}</div>
                            <div className="text-4xl font-black text-yellow-500 my-4 flex items-center justify-center gap-4">
                                <span className="opacity-50">+{selectedItem.plus || 0}</span>
                                <ArrowUp size={24} className="text-green-500 animate-pulse" />
                                <span className="text-green-400">+{(selectedItem.plus || 0) + 1}</span>
                            </div>
                        </div>

                        <div className="bg-black/40 p-4 rounded-lg border border-slate-700 mb-6">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-slate-400">Başarı Şansı:</span>
                                <span className={`font-bold ${(selectedItem.plus || 0) >= 8 ? 'text-red-400' :
                                    (selectedItem.plus || 0) >= 6 ? 'text-purple-400' :
                                        (selectedItem.plus || 0) >= 4 ? 'text-yellow-400' : 'text-green-400'
                                    }`}>
                                    {(selectedItem.plus || 0) >= 7 ? '???' : `%${getSuccessRate(selectedItem.plus || 0)}`}
                                </span>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-slate-400">Ücret:</span>
                                <span className="font-bold text-yellow-400">{getUpgradeCost(selectedItem)} Altın</span>
                            </div>
                            {(selectedItem.plus || 0) >= 7 && (
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400">Yanma Riski:</span>
                                    <span className={`font-bold ${(selectedItem.plus || 0) >= 9 ? 'text-red-500' : 'text-orange-400'}`}>
                                        {(selectedItem.plus || 0) === 7 && '3 Seviye Düşme'}
                                        {(selectedItem.plus || 0) === 8 && '%30 Yok Olma'}
                                        {(selectedItem.plus || 0) >= 9 && '%50 Yok Olma'}
                                    </span>
                                </div>
                            )}
                        </div>

                        {isForging ? (
                            <div className="flex flex-col items-center py-8">
                                <div className={`w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mb-4 ${(selectedItem.plus || 0) >= 7 ? 'border-red-500' : 'border-yellow-500'
                                    }`}></div>
                                <div className={`font-bold animate-pulse ${(selectedItem.plus || 0) >= 7 ? 'text-red-500' : 'text-yellow-500'
                                    }`}>
                                    {(selectedItem.plus || 0) >= 7 ? '🔥 Kaderin Belirleniyor...' : 'Çekiç Vuruluyor...'}
                                </div>
                            </div>
                        ) : result ? (
                            <div className={`p-6 rounded-xl border-2 mb-4 animate-[fadeIn_0.5s] ${result === 'success' ? 'bg-green-900/20 border-green-500' : 'bg-red-900/20 border-red-500'}`}>
                                <h3 className={`text-2xl font-bold mb-2 ${result === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                                    {result === 'success' ? '✨ BAŞARILI!' : '💔 BAŞARISIZ!'}
                                </h3>
                                <p className="text-sm text-slate-300">
                                    {result === 'success'
                                        ? `Eşya +${selectedItem.plus} oldu! (+%10 Güç)`
                                        : burnMessage || 'Yükseltme başarısız oldu. Eşya zarar görmedi.'}
                                </p>
                                {burnMessage && (
                                    <p className="text-xs text-red-400 mt-2 font-bold">🔥 {burnMessage}</p>
                                )}
                            </div>
                        ) : (
                            <>
                                {(selectedItem.plus || 0) >= 5 && (selectedItem.plus || 0) < 7 && (
                                    <div className="bg-yellow-900/20 p-3 rounded-lg border border-yellow-700/50 mb-4 text-xs text-yellow-200 flex items-start gap-2 text-left">
                                        <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                        <span>DİKKAT: Başarı oranı düşük! +7'den sonra yanma riski başlayacak.</span>
                                    </div>
                                )}
                                {(selectedItem.plus || 0) === 7 && (
                                    <div className="bg-orange-900/20 p-3 rounded-lg border border-orange-700/50 mb-4 text-xs text-orange-200 flex items-start gap-2 text-left">
                                        <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                        <span>⚠️ UYARI: Başarısız olursa eşya 3 SEVİYE DÜŞER! (+7 → +4)</span>
                                    </div>
                                )}
                                {(selectedItem.plus || 0) === 8 && (
                                    <div className="bg-red-900/20 p-3 rounded-lg border border-red-700/50 mb-4 text-xs text-red-200 flex items-start gap-2 text-left">
                                        <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                        <span>🔥 TEHLİKE: %30 ihtimalle EŞYA TAMAMEN YOK OLUR! Aksi halde +3'e düşer.</span>
                                    </div>
                                )}
                                {(selectedItem.plus || 0) >= 9 && (
                                    <div className="bg-red-900/40 p-3 rounded-lg border border-red-500 mb-4 text-xs text-red-100 flex items-start gap-2 text-left animate-pulse">
                                        <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                        <span>💀 ÖLÜMCÜL RİSK: %50 ihtimalle EŞYA YOK OLUR! Bu efsanevi bir deneme...</span>
                                    </div>
                                )}
                                <button
                                    onClick={handleUpgrade}
                                    className={`w-full py-4 rounded-lg font-bold text-white text-lg shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 ${(selectedItem.plus || 0) >= 8
                                        ? 'bg-gradient-to-r from-red-700 to-red-900 hover:from-red-600 hover:to-red-800'
                                        : (selectedItem.plus || 0) >= 6
                                            ? 'bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-500 hover:to-red-500'
                                            : 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500'
                                        }`}
                                >
                                    <Hammer /> {(selectedItem.plus || 0) >= 8 ? '🔥 RİSKİ GÖZE AL' : 'YÜKSELT'}
                                </button>
                            </>
                        )}

                        {result && (
                            <button onClick={() => { setResult(null); setBurnMessage(''); }} className="mt-4 text-slate-400 hover:text-white underline text-sm">
                                Tekrar Dene
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CraftingView;