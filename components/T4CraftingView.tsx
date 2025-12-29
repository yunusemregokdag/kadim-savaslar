/**
 * T4CraftingView.tsx
 * Premium T4/T5 Crafting Modal with Animation Triggers & Failure UX
 * Uses craftingSystem.ts for validation/execution
 */

import React, { useState, useMemo, useCallback } from 'react';
import { X, Hammer, Gem, Coins, AlertTriangle, CheckCircle, Package, XCircle } from 'lucide-react';
import { Item, CharacterClass } from '../types';
import { getAllRecipes, validateCraft, craftItem, getRecipesByTier, CraftingRecipe } from '../utils/craftingSystem';
import { CRAFTING_MATERIALS } from '../constants';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface T4CraftingViewProps {
    isOpen: boolean;
    onClose: () => void;
    inventory: Item[];
    gold: number;
    diamonds: number;
    charClass: CharacterClass;
    onCraftSuccess: (craftedItem: Item, consumedItemIds: string[], goldCost: number, diamondCost: number) => void;
    onStartCraftAnimation?: (tier: 4 | 5) => void;
    isEmbedded?: boolean;
}

type CraftState = 'idle' | 'crafting' | 'success' | 'error';

// ─────────────────────────────────────────────────────────────────────────────
// FAILURE ICONS
// ─────────────────────────────────────────────────────────────────────────────

const FAILURE_ICONS = {
    gold: { icon: '💰', message: 'Yetersiz altın' },
    diamond: { icon: '💎', message: 'Yetersiz elmas' },
    materials: { icon: '🧩', message: 'Malzeme eksik' },
    tier: { icon: '🚫', message: 'Geçersiz tier' },
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function T4CraftingView({
    isOpen,
    onClose,
    inventory,
    gold,
    diamonds,
    charClass,
    onCraftSuccess,
    onStartCraftAnimation,
    isEmbedded = false
}: T4CraftingViewProps) {
    const [selectedTier, setSelectedTier] = useState<4 | 5>(4);
    const [selectedRecipe, setSelectedRecipe] = useState<CraftingRecipe | null>(null);
    const [craftState, setCraftState] = useState<CraftState>('idle');
    const [errorDetails, setErrorDetails] = useState<string[]>([]);
    const [shakeButton, setShakeButton] = useState(false);

    const recipes = useMemo(() => getRecipesByTier(selectedTier), [selectedTier]);

    const validation = useMemo(() => {
        if (!selectedRecipe) return null;
        return validateCraft(selectedRecipe.id, inventory, gold, diamonds);
    }, [selectedRecipe, inventory, gold, diamonds]);

    // Count helpers
    const countMaterial = useCallback((materialId: string): number => {
        return inventory.filter(i => i.id.startsWith(materialId) || i.id === materialId).length;
    }, [inventory]);

    const countSlotItems = useCallback((tier: number, slot: string): number => {
        return inventory.filter(i => i.tier === tier && i.type === slot).length;
    }, [inventory]);

    // Craft handler
    const handleCraft = useCallback(() => {
        if (!selectedRecipe) return;

        // Re-validate
        const check = validateCraft(selectedRecipe.id, inventory, gold, diamonds);
        if (!check.valid) {
            // Collect error reasons
            const errors: string[] = [];
            if (check.missingGold) errors.push(FAILURE_ICONS.gold.message);
            if (check.missingDiamond) errors.push(FAILURE_ICONS.diamond.message);
            if (check.missingMaterials?.length) errors.push(FAILURE_ICONS.materials.message);
            if (check.missingItems?.length) errors.push(...check.missingItems);

            setErrorDetails(errors);
            setCraftState('error');
            setShakeButton(true);
            setTimeout(() => setShakeButton(false), 500);
            setTimeout(() => setCraftState('idle'), 2500);
            return;
        }

        // Start animation (T4/T5 only)
        setCraftState('crafting');
        onStartCraftAnimation?.(selectedRecipe.resultTier);

        // Animation duration
        const duration = selectedRecipe.resultTier === 5 ? 4000 : 2500;

        setTimeout(() => {
            const result = craftItem(selectedRecipe.id, inventory, gold, diamonds);

            if (result.success && result.craftedItem) {
                setCraftState('success');
                onCraftSuccess(result.craftedItem, result.consumedItemIds, result.goldCost, result.diamondCost);
                setTimeout(() => {
                    setCraftState('idle');
                    setSelectedRecipe(null);
                }, 2000);
            } else {
                setErrorDetails([result.error || 'Bilinmeyen hata']);
                setCraftState('error');
                setTimeout(() => setCraftState('idle'), 2000);
            }
        }, duration);
    }, [selectedRecipe, inventory, gold, diamonds, onCraftSuccess, onStartCraftAnimation]);

    if (!isOpen) return null;

    return (
        <div className={isEmbedded ? "w-full h-full flex flex-col" : "fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4"}>
            <div className={`${isEmbedded ? 'w-full h-full border-none rounded-none shadow-none' : 'rounded-2xl border border-amber-500/40 w-full max-w-2xl max-h-[90vh] shadow-2xl shadow-amber-500/10'} bg-gradient-to-b from-slate-900 via-slate-950 to-black overflow-hidden flex flex-col`}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-700/50 bg-gradient-to-r from-amber-900/40 to-purple-900/40">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                            <Hammer className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-amber-400">Efsanevi Zanaat</h2>
                            <p className="text-xs text-slate-400">T4 & T5 Artifact Forge</p>
                        </div>
                    </div>
                    {!isEmbedded && <button onClick={onClose} className="text-slate-400 hover:text-white transition p-2">
                        <X className="w-6 h-6" />
                    </button>}
                </div>

                {/* Tier Tabs */}
                <div className="flex border-b border-slate-700/50">
                    <button
                        onClick={() => { setSelectedTier(4); setSelectedRecipe(null); setCraftState('idle'); }}
                        className={`flex-1 py-3 text-center font-semibold transition ${selectedTier === 4
                            ? 'bg-purple-900/50 text-purple-300 border-b-2 border-purple-400'
                            : 'text-slate-500 hover:bg-slate-800/50 hover:text-slate-300'
                            }`}
                    >
                        🟣 T4 Kadim
                    </button>
                    <button
                        onClick={() => { setSelectedTier(5); setSelectedRecipe(null); setCraftState('idle'); }}
                        className={`flex-1 py-3 text-center font-semibold transition ${selectedTier === 5
                            ? 'bg-orange-900/50 text-orange-300 border-b-2 border-orange-400'
                            : 'text-slate-500 hover:bg-slate-800/50 hover:text-slate-300'
                            }`}
                    >
                        🔴 T5 Efsanevi
                    </button>
                </div>

                <div className="flex flex-col md:flex-row h-[55vh]">
                    {/* Recipe List */}
                    <div className="w-full md:w-2/5 border-r border-slate-700/50 overflow-y-auto p-3 space-y-2">
                        {recipes.map(recipe => (
                            <button
                                key={recipe.id}
                                onClick={() => { setSelectedRecipe(recipe); setCraftState('idle'); setErrorDetails([]); }}
                                className={`w-full text-left p-3 rounded-xl border transition-all ${selectedRecipe?.id === recipe.id
                                    ? 'bg-gradient-to-r from-amber-900/40 to-orange-900/40 border-amber-500 shadow-lg shadow-amber-500/20'
                                    : 'bg-slate-800/30 border-slate-700/50 hover:border-slate-500 hover:bg-slate-800/50'
                                    }`}
                            >
                                <div className="font-bold text-white">{recipe.name}</div>
                                <div className="text-xs text-slate-400 uppercase tracking-wide">{recipe.resultSlot}</div>
                            </button>
                        ))}
                    </div>

                    {/* Recipe Details */}
                    <div className="w-full md:w-3/5 p-4 overflow-y-auto">
                        {selectedRecipe ? (
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    {selectedRecipe.resultTier === 5 ? '🔴' : '🟣'} {selectedRecipe.name}
                                </h3>

                                {/* Requirements */}
                                <div className="space-y-2">
                                    <div className="text-sm font-semibold text-slate-300 mb-2">Gerekli Malzemeler</div>

                                    {/* Slot Items */}
                                    <RequirementRow
                                        label={`T${selectedRecipe.requirements.itemTier} ${selectedRecipe.requirements.itemSlot}`}
                                        have={countSlotItems(selectedRecipe.requirements.itemTier, selectedRecipe.requirements.itemSlot)}
                                        need={selectedRecipe.requirements.itemCount}
                                    />

                                    {/* Boss Essence */}
                                    <RequirementRow
                                        label="💀 Boss Özü"
                                        have={countMaterial(CRAFTING_MATERIALS.BOSS_ESSENCE)}
                                        need={selectedRecipe.requirements.bossEssence}
                                    />

                                    {/* Void Shard (T5) */}
                                    {selectedRecipe.requirements.voidShard > 0 && (
                                        <RequirementRow
                                            label="🌀 Boşluk Parçası"
                                            have={countMaterial(CRAFTING_MATERIALS.VOID_SHARD)}
                                            need={selectedRecipe.requirements.voidShard}
                                        />
                                    )}

                                    {/* Gold */}
                                    <RequirementRow
                                        label="💰 Altın"
                                        have={gold}
                                        need={selectedRecipe.cost.gold}
                                        format
                                    />

                                    {/* Diamonds */}
                                    <RequirementRow
                                        label="💎 Elmas"
                                        have={diamonds}
                                        need={selectedRecipe.cost.diamond}
                                    />
                                </div>

                                {/* Result Stats */}
                                <div className="bg-slate-800/30 rounded-xl p-3 border border-slate-700/50">
                                    <div className="text-sm font-semibold text-slate-300 mb-2">Sonuç Statları</div>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        {Object.entries(selectedRecipe.resultBaseStats).map(([stat, value]) => (
                                            <div key={stat} className="flex justify-between bg-black/30 p-2 rounded-lg">
                                                <span className="text-slate-400 capitalize">{stat}</span>
                                                <span className="text-green-400 font-bold">+{value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Error Display */}
                                {craftState === 'error' && errorDetails.length > 0 && (
                                    <div className="bg-red-900/30 border border-red-500/50 rounded-xl p-3 space-y-1">
                                        {errorDetails.map((err, i) => (
                                            <div key={i} className="text-sm text-red-300 flex items-center gap-2">
                                                <XCircle className="w-4 h-4" /> {err}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Success Display */}
                                {craftState === 'success' && (
                                    <div className="bg-green-900/30 border border-green-500/50 rounded-xl p-4 text-center">
                                        <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                                        <div className="text-green-300 font-bold">ZANAAT BAŞARILI!</div>
                                    </div>
                                )}

                                {/* Craft Button */}
                                <button
                                    onClick={handleCraft}
                                    disabled={craftState === 'crafting' || craftState === 'success'}
                                    className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${shakeButton ? 'animate-[shake_0.5s]' : ''
                                        } ${craftState === 'crafting'
                                            ? 'bg-slate-700 text-slate-400 cursor-wait'
                                            : validation?.valid
                                                ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-lg shadow-amber-500/30'
                                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                        }`}
                                >
                                    {craftState === 'crafting' ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-t-transparent border-amber-400 rounded-full animate-spin" />
                                            Zanaat Yapılıyor...
                                        </>
                                    ) : (
                                        <>
                                            <Hammer className="w-5 h-5" />
                                            ZANAAT YAP
                                        </>
                                    )}
                                </button>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-600">
                                <Package className="w-16 h-16 mb-3 opacity-30" />
                                <span className="text-lg">Tarif Seçin</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-slate-700/50 bg-slate-900/50 text-xs text-slate-500 text-center">
                    T4/T5 eşyalar SADECE zanaat ile elde edilir. Boss Özü için Lv25+ Boss öldürün.
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

function RequirementRow({ label, have, need, format = false }: { label: string; have: number; need: number; format?: boolean }) {
    const sufficient = have >= need;
    return (
        <div className={`flex items-center justify-between p-2.5 rounded-lg bg-slate-800/40 border ${sufficient ? 'border-green-500/30' : 'border-red-500/40'}`}>
            <span className="text-sm text-slate-300">{label}</span>
            <span className={`text-sm font-bold ${sufficient ? 'text-green-400' : 'text-red-400'}`}>
                {format ? have.toLocaleString() : have} / {format ? need.toLocaleString() : need}
            </span>
        </div>
    );
}
