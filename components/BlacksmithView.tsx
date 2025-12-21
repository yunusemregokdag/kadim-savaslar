import React, { useState, useEffect } from 'react';
import { Item, PlayerState } from '../types';
import { Hammer, ArrowUp, AlertTriangle, Sparkles, X, Shield, Sword, Package, Wrench, Coins } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface BlacksmithViewProps {
    playerState: any; // Using any for compatibility
    onUpgrade: (item: Item, scroll: Item) => { success: boolean, burned: boolean, newPlus: number };
    onRepair?: (item: Item, cost: number) => boolean;
    onClose: () => void;
}

// Success Rates based on current Plus level (ULTRA ZOR - Knight Online hardcore!)
const getSuccessRate = (currentPlus: number): number => {
    const rates: Record<number, number> = {
        0: 100, 1: 100, 2: 100, 3: 100, // +0 → +3: Garanti
        4: 60,   // +4: %60
        5: 35,   // +5: %35
        6: 15,   // +6: %15
        7: 5,    // +7: %5 (ÇOK ZOR!)
        8: 2,    // +8: %2
        9: 1,    // +9: %1
        10: 0.5, // +10: %0.5
        11: 0.2, // +11: %0.2
        12: 0.1, // +12: %0.1 (EFSANE!)
    };
    return rates[currentPlus] ?? 0.1;
};

const canBurn = (currentPlus: number): boolean => {
    return currentPlus >= 5; // +5'ten itibaren yanma riski!
};

// Repair cost calculation based on item tier and rarity
const getRepairCost = (item: Item): number => {
    const tierMultiplier = item.tier * 100;
    const rarityMultiplier: Record<string, number> = {
        'common': 1,
        'uncommon': 1.5,
        'rare': 2.5,
        'epic': 4,
        'legendary': 8,
        'ancient': 15
    };
    const plusBonus = (item.plus || 0) * 50;
    return Math.floor((tierMultiplier * (rarityMultiplier[item.rarity] || 1)) + plusBonus);
};

type TabType = 'upgrade' | 'repair';

const BlacksmithView: React.FC<BlacksmithViewProps> = ({ playerState, onUpgrade, onRepair, onClose }) => {
    const [activeTab, setActiveTab] = useState<TabType>('upgrade');
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const [selectedScroll, setSelectedScroll] = useState<Item | null>(null);
    const [isUpgrading, setIsUpgrading] = useState(false);
    const [isRepairing, setIsRepairing] = useState(false);
    const [upgradeResult, setUpgradeResult] = useState<'none' | 'success' | 'fail' | 'burn'>('none');
    const [repairResult, setRepairResult] = useState<'none' | 'success' | 'fail'>('none');
    const [message, setMessage] = useState('');

    // Filter upgradeable items
    const upgradeableItems = (playerState.inventory || []).filter((i: Item) =>
        ['weapon', 'armor', 'helmet', 'pants', 'boots', 'necklace', 'earring'].includes(i.type) && i.tier <= 5
    );

    // Filter scrolls
    const scrolls = (playerState.inventory || []).filter((i: Item) =>
        (i.type as string) === 'upgrade_scroll' || i.name.includes('Kutsal Parşömen')
    );

    // All equipment for repair
    const repairableItems = (playerState.inventory || []).filter((i: Item) =>
        ['weapon', 'armor', 'helmet', 'pants', 'boots', 'necklace', 'earring'].includes(i.type)
    );

    const handleUpgradeClick = () => {
        if (!selectedItem || !selectedScroll) return;

        // TIER CHECK: Scroll tier must match item tier!
        if (selectedScroll.tier !== selectedItem.tier) {
            setUpgradeResult('fail');
            setMessage(`HATA: T${selectedScroll.tier} parşömen sadece T${selectedScroll.tier} ekipman yükseltebilir!`);
            return;
        }

        setIsUpgrading(true);
        setUpgradeResult('none');
        setMessage('Demir dövülüyor...');

        // Mock Animation Delay
        setTimeout(() => {
            const result = onUpgrade(selectedItem, selectedScroll);

            if (result.success) {
                setUpgradeResult('success');
                setMessage('BAŞARILI! Eşya seviye atladı.');
            } else if (result.burned) {
                setUpgradeResult('burn');
                setMessage('EŞYA YANDI! Yok oldu...');
                setSelectedItem(null); // Item is gone
            } else {
                setUpgradeResult('fail');
                setMessage('BAŞARISIZ. Eşya seviyesi aynı kaldı.');
            }

            setIsUpgrading(false);
            setSelectedScroll(null); // Consumed
        }, 2000);
    };

    const handleRepairClick = () => {
        if (!selectedItem || !onRepair) return;

        const cost = getRepairCost(selectedItem);
        if (playerState.gold < cost) {
            setRepairResult('fail');
            setMessage('Yeterli altın yok!');
            return;
        }

        setIsRepairing(true);
        setRepairResult('none');
        setMessage('Tamir ediliyor...');

        setTimeout(() => {
            const success = onRepair(selectedItem, cost);
            if (success) {
                setRepairResult('success');
                setMessage(`Eşya tamir edildi! (${cost} altın)`);
            } else {
                setRepairResult('fail');
                setMessage('Tamir başarısız!');
            }
            setIsRepairing(false);
        }, 1500);
    };

    const handleRepairAll = () => {
        if (!onRepair) return;

        let totalCost = 0;
        repairableItems.forEach((item: Item) => {
            totalCost += getRepairCost(item);
        });

        if (playerState.gold < totalCost) {
            setRepairResult('fail');
            setMessage('Tüm eşyaları tamir etmek için yeterli altın yok!');
            return;
        }

        setIsRepairing(true);
        setMessage('Tüm eşyalar tamir ediliyor...');

        setTimeout(() => {
            repairableItems.forEach((item: Item) => {
                onRepair(item, getRepairCost(item));
            });
            setRepairResult('success');
            setMessage(`Tüm eşyalar tamir edildi! (${totalCost} altın)`);
            setIsRepairing(false);
        }, 2000);
    };

    const rate = selectedItem ? getSuccessRate(selectedItem.plus || 0) : 0;
    const burns = selectedItem ? canBurn(selectedItem.plus || 0) : false;

    const getItemColor = (rarity: string) => {
        switch (rarity) {
            case 'legendary': return 'text-yellow-400 border-yellow-600 bg-yellow-900/20';
            case 'ancient': return 'text-orange-400 border-orange-600 bg-orange-900/20';
            case 'epic': return 'text-purple-400 border-purple-600 bg-purple-900/20';
            case 'rare': return 'text-blue-400 border-blue-600 bg-blue-900/20';
            case 'uncommon': return 'text-green-400 border-green-600 bg-green-900/20';
            default: return 'text-slate-300 border-slate-600 bg-slate-800';
        }
    };

    const getItemIcon = (type: string) => {
        switch (type) {
            case 'weapon': return <Sword size={18} />;
            case 'armor': case 'helmet': case 'pants': case 'boots': return <Shield size={18} />;
            default: return <Package size={18} />;
        }
    };

    return (
        <div className="absolute inset-0 z-50 bg-[#0b0f19] flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-slate-800 bg-[#1a120b] flex justify-between items-center shadow-lg">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-900/20 rounded-xl flex items-center justify-center border border-orange-700 shadow-[0_0_15px_rgba(234,88,12,0.3)]">
                        <Hammer className="text-orange-500" size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold rpg-font text-orange-100">KADİM DEMİRCİ</h2>
                        <p className="text-xs text-slate-400">Eşyalarını güçlendir veya tamir et.</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-yellow-900/30 px-4 py-2 rounded-lg border border-yellow-700">
                        <Coins size={18} className="text-yellow-500" />
                        <span className="text-yellow-400 font-bold">{playerState.gold?.toLocaleString() || 0}</span>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                        <X size={24} className="text-slate-400" />
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-800">
                <button
                    onClick={() => { setActiveTab('upgrade'); setSelectedItem(null); setUpgradeResult('none'); }}
                    className={`flex-1 py-4 flex items-center justify-center gap-2 font-bold transition-all ${activeTab === 'upgrade' ? 'bg-orange-900/30 text-orange-400 border-b-2 border-orange-500' : 'bg-slate-900/50 text-slate-500 hover:bg-slate-800'}`}
                >
                    <Sparkles size={20} /> GÜÇLENDİRME
                </button>
                <button
                    onClick={() => { setActiveTab('repair'); setSelectedItem(null); setRepairResult('none'); }}
                    className={`flex-1 py-4 flex items-center justify-center gap-2 font-bold transition-all ${activeTab === 'repair' ? 'bg-green-900/30 text-green-400 border-b-2 border-green-500' : 'bg-slate-900/50 text-slate-500 hover:bg-slate-800'}`}
                >
                    <Wrench size={20} /> TAMİR
                </button>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {activeTab === 'upgrade' ? (
                    <>
                        {/* UPGRADE STATION (Left) */}
                        <div className="flex-1 p-8 flex flex-col items-center justify-center relative bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
                            {/* Anvil Area */}
                            <div className="relative w-full max-w-lg aspect-square flex flex-col items-center justify-center">
                                {/* Slots Container */}
                                <div className="flex gap-8 items-center mb-12">
                                    {/* Item Slot */}
                                    <div className={`w-32 h-32 rounded-xl border-4 border-dashed flex items-center justify-center relative transition-all ${selectedItem ? 'border-orange-500 bg-slate-900' : 'border-slate-700 bg-slate-900/50'}`}>
                                        {selectedItem ? (
                                            <div className="flex flex-col items-center">
                                                {getItemIcon(selectedItem.type)}
                                                <span className="text-xs font-bold text-white mt-2 max-w-[100px] truncate">{selectedItem.name}</span>
                                                <span className="absolute top-2 right-2 bg-black/60 px-2 rounded text-white font-bold">+{selectedItem.plus || 0}</span>
                                            </div>
                                        ) : (
                                            <span className="text-slate-500 text-xs text-center font-bold">EŞYA<br />SEÇ</span>
                                        )}
                                    </div>

                                    <ArrowUp size={32} className={`text-slate-600 ${isUpgrading ? 'animate-bounce text-orange-500' : ''}`} />

                                    {/* Scroll Slot */}
                                    <div className={`w-32 h-32 rounded-xl border-4 border-dashed flex items-center justify-center relative transition-all ${selectedScroll ? 'border-blue-500 bg-slate-900' : 'border-slate-700 bg-slate-900/50'}`}>
                                        {selectedScroll ? (
                                            <div className="flex flex-col items-center">
                                                <Package size={40} className="text-blue-400" />
                                                <span className="text-xs font-bold text-white mt-2">Parşömen</span>
                                                <button onClick={(e) => { e.stopPropagation(); setSelectedScroll(null); }} className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"><X size={12} /></button>
                                            </div>
                                        ) : (
                                            <span className="text-slate-500 text-xs text-center font-bold">KAĞIT<br />SEÇ</span>
                                        )}
                                    </div>
                                </div>

                                {/* Info / Stats */}
                                {selectedItem && (
                                    <div className="bg-slate-900/80 p-6 rounded-xl border border-slate-700 w-full mb-8 backdrop-blur-sm">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-slate-400 text-sm">Başarı Şansı:</span>
                                            <span className={`font-bold text-lg ${rate > 50 ? 'text-green-400' : 'text-red-400'}`}>%{rate}</span>
                                        </div>
                                        {burns && (
                                            <div className="flex items-center gap-2 text-red-500 text-xs font-bold bg-red-950/30 p-2 rounded border border-red-900">
                                                <AlertTriangle size={14} /> DİKKAT: BAŞARISIZ OLURSA EŞYA YOK OLUR!
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Action Button */}
                                <button
                                    onClick={handleUpgradeClick}
                                    disabled={!selectedItem || !selectedScroll || isUpgrading}
                                    className={`w-full py-4 rounded-xl font-bold text-xl shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-3 ${(!selectedItem || !selectedScroll || isUpgrading) ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-gradient-to-r from-orange-700 to-red-600 text-white hover:brightness-110 shadow-orange-900/50'}`}
                                >
                                    {isUpgrading ? (
                                        <><Hammer className="animate-spin" /> DÖVÜLÜYOR...</>
                                    ) : (
                                        <><Sparkles /> GÜÇLENDİR</>
                                    )}
                                </button>

                                {/* Result Overlay */}
                                {upgradeResult !== 'none' && (
                                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-xl z-10 animate-[fadeIn_0.3s]">
                                        <div className={`text-4xl font-black mb-4 ${upgradeResult === 'success' ? 'text-green-400 drop-shadow-[0_0_10px_green]' : upgradeResult === 'burn' ? 'text-red-500 drop-shadow-[0_0_10px_red]' : 'text-slate-300'}`}>
                                            {upgradeResult === 'success' ? 'BAŞARILI!' : upgradeResult === 'burn' ? 'YANDI!' : 'BAŞARISIZ'}
                                        </div>
                                        <div className="text-white text-lg">{message}</div>
                                        <button onClick={() => setUpgradeResult('none')} className="mt-8 px-8 py-2 bg-slate-700 hover:bg-slate-600 rounded text-white font-bold">
                                            DEVAM ET
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* INVENTORY (Right) */}
                        <div className="w-96 bg-[#120d16] border-l border-slate-800 p-6 flex flex-col">
                            <h3 className="text-slate-400 font-bold mb-4 uppercase text-xs tracking-wider flex items-center gap-2">
                                <Sword size={14} /> Geliştirilebilir Eşyalar
                            </h3>
                            <div className="flex-1 overflow-y-auto mb-6 pr-2 custom-scrollbar space-y-2">
                                {upgradeableItems.length === 0 ? (
                                    <div className="text-slate-600 text-center py-8 text-sm italic">Uygun eşya yok.</div>
                                ) : (
                                    upgradeableItems.map((item: any) => (
                                        <div
                                            key={item.id}
                                            onClick={() => !isUpgrading && setSelectedItem(item)}
                                            className={`p-3 rounded border flex items-center gap-3 cursor-pointer transition-all ${selectedItem?.id === item.id ? 'bg-orange-900/30 border-orange-500 ring-1 ring-orange-500' : 'bg-slate-900 border-slate-700 hover:bg-slate-800'}`}
                                        >
                                            <div className={`w-10 h-10 rounded border flex items-center justify-center ${getItemColor(item.rarity)}`}>
                                                {getItemIcon(item.type)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-sm font-bold text-slate-200">{item.name}</div>
                                                <div className="text-xs text-slate-500">+{item.plus || 0} • {item.rarity}</div>
                                            </div>
                                            {selectedItem?.id === item.id && <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse" />}
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="border-t border-slate-800 pt-4">
                                <h3 className="text-slate-400 font-bold mb-4 uppercase text-xs tracking-wider flex items-center gap-2">
                                    <Package size={14} /> Parşömenler
                                </h3>
                                {scrolls.length === 0 ? (
                                    <div className="text-slate-600 text-center py-4 text-sm italic">
                                        Parşömen yok.<br />
                                        <span className="text-[10px] text-slate-700">Pazardan veya droplardan bulabilirsin.</span>
                                    </div>
                                ) : (
                                    scrolls.map((item: any) => (
                                        <div
                                            key={item.id}
                                            onClick={() => !isUpgrading && setSelectedScroll(item)}
                                            className={`p-3 rounded border flex items-center gap-3 cursor-pointer transition-all ${selectedScroll?.id === item.id ? 'bg-blue-900/30 border-blue-500 ring-1 ring-blue-500' : 'bg-slate-900 border-slate-700 hover:bg-slate-800'}`}
                                        >
                                            <div className="w-10 h-10 rounded border border-blue-700 bg-blue-900/20 flex items-center justify-center text-blue-400">
                                                <Package size={18} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-sm font-bold text-slate-200">{item.name}</div>
                                                <div className="text-xs text-blue-400">T{item.tier} Yükseltme</div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        {/* REPAIR STATION (Left) */}
                        <div className="flex-1 p-8 flex flex-col items-center justify-center relative bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
                            <div className="relative w-full max-w-lg flex flex-col items-center justify-center">
                                {/* Selected Item Display */}
                                <div className={`w-40 h-40 rounded-xl border-4 flex items-center justify-center mb-8 transition-all ${selectedItem ? 'border-green-500 bg-slate-900' : 'border-slate-700 bg-slate-900/50 border-dashed'}`}>
                                    {selectedItem ? (
                                        <div className="flex flex-col items-center">
                                            <div className={`w-16 h-16 rounded-lg border-2 flex items-center justify-center ${getItemColor(selectedItem.rarity)}`}>
                                                {getItemIcon(selectedItem.type)}
                                            </div>
                                            <span className="text-sm font-bold text-white mt-3 max-w-[120px] truncate">{selectedItem.name}</span>
                                            <span className="text-xs text-slate-400">+{selectedItem.plus || 0}</span>
                                        </div>
                                    ) : (
                                        <span className="text-slate-500 text-sm text-center font-bold">TAMİR İÇİN<br />EŞYA SEÇ</span>
                                    )}
                                </div>

                                {/* Repair Cost */}
                                {selectedItem && (
                                    <div className="bg-slate-900/80 p-6 rounded-xl border border-slate-700 w-full mb-8 backdrop-blur-sm">
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-400 text-sm">Tamir Ücreti:</span>
                                            <span className="font-bold text-lg text-yellow-400 flex items-center gap-2">
                                                <Coins size={18} /> {getRepairCost(selectedItem).toLocaleString()} Altın
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Repair Buttons */}
                                <div className="w-full space-y-3">
                                    <button
                                        onClick={handleRepairClick}
                                        disabled={!selectedItem || isRepairing}
                                        className={`w-full py-4 rounded-xl font-bold text-xl shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-3 ${(!selectedItem || isRepairing) ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-gradient-to-r from-green-700 to-emerald-600 text-white hover:brightness-110 shadow-green-900/50'}`}
                                    >
                                        {isRepairing ? (
                                            <><Wrench className="animate-spin" /> TAMİR EDİLİYOR...</>
                                        ) : (
                                            <><Wrench /> SEÇİLİ EŞYAYI TAMİR ET</>
                                        )}
                                    </button>

                                    <button
                                        onClick={handleRepairAll}
                                        disabled={repairableItems.length === 0 || isRepairing}
                                        className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${(repairableItems.length === 0 || isRepairing) ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                                    >
                                        <Wrench size={16} /> TÜMÜNÜ TAMİR ET ({repairableItems.reduce((sum: number, i: Item) => sum + getRepairCost(i), 0).toLocaleString()} Altın)
                                    </button>
                                </div>

                                {/* Result Overlay */}
                                {repairResult !== 'none' && (
                                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-xl z-10 animate-[fadeIn_0.3s]">
                                        <div className={`text-4xl font-black mb-4 ${repairResult === 'success' ? 'text-green-400 drop-shadow-[0_0_10px_green]' : 'text-red-400'}`}>
                                            {repairResult === 'success' ? 'TAMİR EDİLDİ!' : 'BAŞARISIZ'}
                                        </div>
                                        <div className="text-white text-lg">{message}</div>
                                        <button onClick={() => setRepairResult('none')} className="mt-8 px-8 py-2 bg-slate-700 hover:bg-slate-600 rounded text-white font-bold">
                                            DEVAM ET
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* REPAIRABLE ITEMS (Right) */}
                        <div className="w-96 bg-[#120d16] border-l border-slate-800 p-6 flex flex-col">
                            <h3 className="text-slate-400 font-bold mb-4 uppercase text-xs tracking-wider flex items-center gap-2">
                                <Wrench size={14} /> Tamir Edilebilir Eşyalar
                            </h3>
                            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2">
                                {repairableItems.length === 0 ? (
                                    <div className="text-slate-600 text-center py-8 text-sm italic">Tamir edilecek eşya yok.</div>
                                ) : (
                                    repairableItems.map((item: any) => (
                                        <div
                                            key={item.id}
                                            onClick={() => !isRepairing && setSelectedItem(item)}
                                            className={`p-3 rounded border flex items-center gap-3 cursor-pointer transition-all ${selectedItem?.id === item.id ? 'bg-green-900/30 border-green-500 ring-1 ring-green-500' : 'bg-slate-900 border-slate-700 hover:bg-slate-800'}`}
                                        >
                                            <div className={`w-10 h-10 rounded border flex items-center justify-center ${getItemColor(item.rarity)}`}>
                                                {getItemIcon(item.type)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-sm font-bold text-slate-200">{item.name}</div>
                                                <div className="text-xs text-slate-500">+{item.plus || 0} • {item.rarity}</div>
                                            </div>
                                            <div className="text-xs text-yellow-400 font-bold">
                                                {getRepairCost(item)} G
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Cost Summary */}
                            <div className="border-t border-slate-800 pt-4 mt-4">
                                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-400">Toplam Eşya:</span>
                                        <span className="text-white font-bold">{repairableItems.length}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm mt-2">
                                        <span className="text-slate-400">Toplam Maliyet:</span>
                                        <span className="text-yellow-400 font-bold flex items-center gap-1">
                                            <Coins size={14} />
                                            {repairableItems.reduce((sum: number, i: Item) => sum + getRepairCost(i), 0).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default BlacksmithView;
