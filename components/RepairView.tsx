import React, { useState } from 'react';
import { PlayerState, Item, Equipment } from '../types';
import { renderItemIcon } from './ui/ItemIcons';
import { Wrench, Hammer, Shield, RefreshCw } from 'lucide-react';
import { soundManager } from './SoundManager';

interface RepairViewProps {
    playerState: PlayerState;
    onUpdatePlayer: (updates: Partial<PlayerState>) => void;
}

export const RepairView: React.FC<RepairViewProps> = ({ playerState, onUpdatePlayer }) => {
    const [repairingId, setRepairingId] = useState<string | null>(null);

    // Get all repairable items (Equipped + Inventory)
    const getRepairableItems = () => {
        const items: { item: Item, location: 'equipped' | 'inventory', slot?: string }[] = [];

        // Check Equipment
        Object.entries(playerState.equipment).forEach(([slot, item]) => {
            if (item && item.maxDurability && (item.durability ?? item.maxDurability) < item.maxDurability) {
                items.push({ item, location: 'equipped', slot });
            }
        });

        // Check Inventory
        playerState.inventory.forEach((item, index) => {
            if (item.maxDurability && (item.durability ?? item.maxDurability) < item.maxDurability) {
                // Only gear usually has durability
                if (['weapon', 'armor', 'helmet', 'pants', 'boots', 'shield'].includes(item.type)) {
                    items.push({ item, location: 'inventory' }); // Inventory items don't strictly need slot index for logic if ID unique
                }
            }
        });

        return items;
    };

    const repairableItems = getRepairableItems();

    const calculateCost = (item: Item) => {
        const missing = (item.maxDurability || 100) - (item.durability || 0);
        const tier = item.tier || 1;
        const rarityMult = { common: 1, uncommon: 2, rare: 3, epic: 5, legendary: 10, ancient: 20 }[item.rarity] || 1;
        return Math.floor(missing * tier * rarityMult * 2); // 2 Gold per point adjusted
    };

    const totalCost = repairableItems.reduce((acc, { item }) => acc + calculateCost(item), 0);

    const handleRepair = (targetItem: Item, cost: number) => {
        if (playerState.credits < cost) {
            // Show error (toast logic inside dashboard usually, here just return)
            return;
        }

        soundManager.playSFX('anvil');

        // Update Item
        const newDurability = targetItem.maxDurability || 100;

        // Update Player State
        const newCredits = playerState.credits - cost;

        let newEquipment = { ...playerState.equipment };
        let newInventory = [...playerState.inventory];

        // Find and update item
        let found = false;

        // Search Equipment
        Object.keys(newEquipment).forEach((key) => {
            const slot = key as keyof Equipment;
            if (newEquipment[slot]?.id === targetItem.id) {
                newEquipment[slot] = { ...newEquipment[slot]!, durability: newDurability };
                found = true;
            }
        });

        // Search Inventory
        if (!found) {
            newInventory = newInventory.map(i => i.id === targetItem.id ? { ...i, durability: newDurability } : i);
        }

        onUpdatePlayer({
            credits: newCredits,
            equipment: newEquipment,
            inventory: newInventory
        });
    };

    const handleRepairAll = () => {
        if (playerState.credits < totalCost) return;

        soundManager.playSFX('anvil');

        const newCredits = playerState.credits - totalCost;
        let newEquipment = { ...playerState.equipment };
        let newInventory = [...playerState.inventory];

        repairableItems.forEach(({ item }) => {
            const newDur = item.maxDurability || 100;
            // Search Equipment
            Object.keys(newEquipment).forEach((key) => {
                const slot = key as keyof Equipment;
                if (newEquipment[slot]?.id === item.id) {
                    newEquipment[slot] = { ...newEquipment[slot]!, durability: newDur };
                }
            });
            // Inventory
            newInventory = newInventory.map(i => i.id === item.id ? { ...i, durability: newDur } : i);
        });

        onUpdatePlayer({
            credits: newCredits,
            equipment: newEquipment,
            inventory: newInventory
        });
    };

    return (
        <div className="flex flex-col h-full bg-slate-900 text-slate-200 p-6 gap-6 relative">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-300 flex items-center justify-center gap-3">
                    <Wrench className="text-slate-500" />
                    ONARIM TEZGAHI
                    <Wrench className="text-slate-500 transform scale-x-[-1]" />
                </h2>
                <p className="text-slate-500 text-sm mt-2">Eşyalarınızın dayanıklılığını yenilemek için burayı kullanın.</p>
            </div>

            {/* REPAIR LIST */}
            <div className="flex-1 overflow-y-auto border border-slate-800 rounded-lg bg-slate-950 p-4">
                {repairableItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-4">
                        <Shield className="w-16 h-16 opacity-20" />
                        <p>Onarılacak eşya yok. Hepsi sapasağlam!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {repairableItems.map(({ item }) => {
                            const cost = calculateCost(item);
                            const percent = Math.floor(((item.durability || 0) / (item.maxDurability || 100)) * 100);

                            return (
                                <div key={item.id} className="flex items-center gap-3 bg-slate-900 border border-slate-700 p-3 rounded hover:border-slate-500 transition-colors">
                                    <div className="w-12 h-12 bg-black/40 rounded border border-slate-800">
                                        {renderItemIcon(item)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-bold text-sm text-slate-200">{item.name}</div>
                                        <div className="text-xs text-slate-500 capitalize">{item.rarity} {item.type}</div>
                                        <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
                                            <div
                                                className={`h-full ${percent < 30 ? 'bg-red-500' : percent < 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                                style={{ width: `${percent}%` }}
                                            />
                                        </div>
                                        <div className="text-[10px] text-right mt-0.5 text-slate-400">{item.durability}/{item.maxDurability}</div>
                                    </div>
                                    <button
                                        onClick={() => handleRepair(item, cost)}
                                        disabled={playerState.credits < cost}
                                        className={`px-3 py-2 rounded font-bold text-xs flex flex-col items-center min-w-[80px]
                                            ${playerState.credits >= cost ? 'bg-amber-700 hover:bg-amber-600 text-white' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}
                                        `}
                                    >
                                        <div className="flex items-center gap-1">
                                            <span>{cost}</span>
                                            <span className="text-yellow-400">G</span>
                                        </div>
                                        <span>Onar</span>
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* FOOTER ACTION */}
            <div className="flex flex-col items-center gap-4">
                <button
                    onClick={handleRepairAll}
                    disabled={totalCost === 0 || playerState.credits < totalCost}
                    className={`w-full max-w-md py-3 rounded-lg font-bold text-lg flex items-center justify-center gap-3 transition-all
                        ${totalCost > 0 && playerState.credits >= totalCost
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/40 hover:-translate-y-1'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'}
                    `}
                >
                    <RefreshCw className={`${totalCost > 0 ? 'animate-spin-slow' : ''}`} />
                    Tümünü Onar ({totalCost.toLocaleString()} G)
                </button>
                {totalCost > 0 && playerState.credits < totalCost && (
                    <span className="text-red-500 text-xs font-bold animate-pulse">Yetersiz Altın!</span>
                )}
            </div>

        </div>
    );
};
