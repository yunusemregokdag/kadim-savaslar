import React, { useState, useEffect } from 'react';
import { PlayerState, Item } from '../types';
import {
    Trophy, Star, Lock, Gift, Crown, Sparkles, ChevronRight,
    ChevronLeft, Check, X, Zap, Shield, Sword, Clock
} from 'lucide-react';

// Battle Pass Tier Rewards
interface BattlePassReward {
    tier: number;
    freeReward?: {
        type: 'gold' | 'gems' | 'exp' | 'item';
        amount?: number;
        item?: Partial<Item>;
    };
    premiumReward?: {
        type: 'gold' | 'gems' | 'exp' | 'item' | 'skin' | 'pet' | 'wing';
        amount?: number;
        item?: Partial<Item>;
        skinId?: string;
    };
    expRequired: number;
}

// Season 1 Battle Pass
const BATTLE_PASS_REWARDS: BattlePassReward[] = [
    { tier: 1, freeReward: { type: 'gold', amount: 500 }, premiumReward: { type: 'gold', amount: 1500 }, expRequired: 100 },
    { tier: 2, freeReward: { type: 'exp', amount: 200 }, premiumReward: { type: 'gems', amount: 10 }, expRequired: 250 },
    { tier: 3, premiumReward: { type: 'item', item: { name: 'Bronz Kılıç', tier: 2, type: 'weapon', rarity: 'uncommon' } }, expRequired: 450 },
    { tier: 4, freeReward: { type: 'gold', amount: 750 }, premiumReward: { type: 'gold', amount: 2000 }, expRequired: 700 },
    { tier: 5, freeReward: { type: 'gems', amount: 5 }, premiumReward: { type: 'gems', amount: 25 }, expRequired: 1000 },
    { tier: 6, premiumReward: { type: 'skin', skinId: 'warrior_flame' }, expRequired: 1350 },
    { tier: 7, freeReward: { type: 'gold', amount: 1000 }, premiumReward: { type: 'item', item: { name: 'Gümüş Zırh', tier: 2, type: 'armor', rarity: 'rare' } }, expRequired: 1750 },
    { tier: 8, freeReward: { type: 'exp', amount: 500 }, premiumReward: { type: 'gems', amount: 30 }, expRequired: 2200 },
    { tier: 9, premiumReward: { type: 'pet', item: { name: 'Ateş Ejderhası' } }, expRequired: 2700 },
    { tier: 10, freeReward: { type: 'gold', amount: 1500 }, premiumReward: { type: 'gold', amount: 5000 }, expRequired: 3250 },
    { tier: 11, freeReward: { type: 'gems', amount: 10 }, premiumReward: { type: 'gems', amount: 50 }, expRequired: 3850 },
    { tier: 12, premiumReward: { type: 'item', item: { name: 'Altın Miğfer', tier: 3, type: 'helmet', rarity: 'epic' } }, expRequired: 4500 },
    { tier: 13, freeReward: { type: 'gold', amount: 2000 }, premiumReward: { type: 'gold', amount: 7500 }, expRequired: 5200 },
    { tier: 14, freeReward: { type: 'exp', amount: 1000 }, premiumReward: { type: 'gems', amount: 75 }, expRequired: 5950 },
    { tier: 15, premiumReward: { type: 'wing', item: { name: 'Melek Kanatları' } }, expRequired: 6750 },
    { tier: 16, freeReward: { type: 'gold', amount: 2500 }, premiumReward: { type: 'item', item: { name: 'Elmas Kılıç', tier: 4, type: 'weapon', rarity: 'legendary' } }, expRequired: 7600 },
    { tier: 17, freeReward: { type: 'gems', amount: 15 }, premiumReward: { type: 'gems', amount: 100 }, expRequired: 8500 },
    { tier: 18, premiumReward: { type: 'skin', skinId: 'warrior_shadow' }, expRequired: 9450 },
    { tier: 19, freeReward: { type: 'gold', amount: 3000 }, premiumReward: { type: 'gold', amount: 10000 }, expRequired: 10450 },
    { tier: 20, freeReward: { type: 'gems', amount: 25 }, premiumReward: { type: 'item', item: { name: 'Efsanevi Set Kutusu', tier: 5, type: 'consumable', rarity: 'ancient' } }, expRequired: 11500 },
];

// Season Info
const CURRENT_SEASON = {
    id: 1,
    name: 'Ateş ve Buz',
    startDate: new Date('2024-12-01'),
    endDate: new Date('2025-02-28'),
    premiumPrice: 500, // gems
};

interface BattlePassViewProps {
    playerState: PlayerState;
    onClose: () => void;
    onClaimReward: (tier: number, isPremium: boolean, reward: any) => void;
    onPurchasePremium: () => void;
}

export const BattlePassView: React.FC<BattlePassViewProps> = ({
    playerState,
    onClose,
    onClaimReward,
    onPurchasePremium,
}) => {
    // Battle pass state (would be from backend in real app)
    const [battlePassExp, setBattlePassExp] = useState(() => {
        const saved = localStorage.getItem('battlePassExp');
        return saved ? parseInt(saved) : 0;
    });
    const [claimedFree, setClaimedFree] = useState<number[]>(() => {
        const saved = localStorage.getItem('battlePassClaimedFree');
        return saved ? JSON.parse(saved) : [];
    });
    const [claimedPremium, setClaimedPremium] = useState<number[]>(() => {
        const saved = localStorage.getItem('battlePassClaimedPremium');
        return saved ? JSON.parse(saved) : [];
    });
    const [hasPremium, setHasPremium] = useState(() => {
        return localStorage.getItem('battlePassPremium') === 'true';
    });
    const [visibleTierStart, setVisibleTierStart] = useState(0);

    // Calculate current tier
    const currentTier = BATTLE_PASS_REWARDS.findIndex(r => battlePassExp < r.expRequired);
    const actualTier = currentTier === -1 ? BATTLE_PASS_REWARDS.length : currentTier;

    // Current progress
    const currentTierData = BATTLE_PASS_REWARDS[actualTier] || BATTLE_PASS_REWARDS[BATTLE_PASS_REWARDS.length - 1];
    const prevTierExp = actualTier > 0 ? BATTLE_PASS_REWARDS[actualTier - 1].expRequired : 0;
    const tierProgress = actualTier < BATTLE_PASS_REWARDS.length
        ? ((battlePassExp - prevTierExp) / (currentTierData.expRequired - prevTierExp)) * 100
        : 100;

    // Days remaining
    const daysRemaining = Math.max(0, Math.ceil((CURRENT_SEASON.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

    // Save state
    useEffect(() => {
        localStorage.setItem('battlePassExp', battlePassExp.toString());
        localStorage.setItem('battlePassClaimedFree', JSON.stringify(claimedFree));
        localStorage.setItem('battlePassClaimedPremium', JSON.stringify(claimedPremium));
        localStorage.setItem('battlePassPremium', hasPremium.toString());
    }, [battlePassExp, claimedFree, claimedPremium, hasPremium]);

    // Add exp periodically (simulating gameplay)
    useEffect(() => {
        const interval = setInterval(() => {
            setBattlePassExp(prev => prev + 10);
        }, 30000); // Every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const handleClaimFree = (tier: number) => {
        const reward = BATTLE_PASS_REWARDS[tier - 1]?.freeReward;
        if (!reward || claimedFree.includes(tier) || tier > actualTier + 1) return;

        onClaimReward(tier, false, reward);
        setClaimedFree(prev => [...prev, tier]);
    };

    const handleClaimPremium = (tier: number) => {
        const reward = BATTLE_PASS_REWARDS[tier - 1]?.premiumReward;
        if (!reward || !hasPremium || claimedPremium.includes(tier) || tier > actualTier + 1) return;

        onClaimReward(tier, true, reward);
        setClaimedPremium(prev => [...prev, tier]);
    };

    const handlePurchasePremium = () => {
        if (playerState.gems >= CURRENT_SEASON.premiumPrice) {
            setHasPremium(true);
            onPurchasePremium();
        }
    };

    const getRewardIcon = (reward: any) => {
        switch (reward?.type) {
            case 'gold': return <span className="text-yellow-400">💰</span>;
            case 'gems': return <span className="text-purple-400">💎</span>;
            case 'exp': return <span className="text-green-400">⚡</span>;
            case 'item': return <span className="text-orange-400">📦</span>;
            case 'skin': return <span className="text-pink-400">👕</span>;
            case 'pet': return <span className="text-cyan-400">🐉</span>;
            case 'wing': return <span className="text-blue-400">🪽</span>;
            default: return <Gift size={16} />;
        }
    };

    const visibleRewards = BATTLE_PASS_REWARDS.slice(visibleTierStart, visibleTierStart + 5);

    return (
        <div className="fixed inset-0 z-[90] bg-black/90 flex items-center justify-center p-4">
            <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-700 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="relative bg-gradient-to-r from-amber-900 via-orange-800 to-red-900 p-6 border-b border-orange-700">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml,...')] opacity-10" />
                    <div className="relative flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                                <Trophy size={36} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">Battle Pass</h2>
                                <p className="text-orange-200 text-sm">Sezon {CURRENT_SEASON.id}: {CURRENT_SEASON.name}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <div className="text-xs text-orange-300">Sezon Bitiş</div>
                                <div className="text-white font-bold flex items-center gap-1">
                                    <Clock size={14} />
                                    {daysRemaining} gün kaldı
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
                                <X size={24} className="text-white" />
                            </button>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-orange-200">Tier {actualTier + 1} / {BATTLE_PASS_REWARDS.length}</span>
                            <span className="text-orange-200">{battlePassExp} / {currentTierData.expRequired} XP</span>
                        </div>
                        <div className="h-4 bg-black/40 rounded-full overflow-hidden border border-orange-800">
                            <div
                                className="h-full bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 transition-all duration-500"
                                style={{ width: `${tierProgress}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Premium Banner */}
                {!hasPremium && (
                    <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 p-4 border-b border-purple-700 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Crown className="text-yellow-400" size={24} />
                            <div>
                                <div className="font-bold text-white">Premium Battle Pass</div>
                                <div className="text-xs text-purple-200">Tüm premium ödüllerin kilidini aç!</div>
                            </div>
                        </div>
                        <button
                            onClick={handlePurchasePremium}
                            disabled={playerState.gems < CURRENT_SEASON.premiumPrice}
                            className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Sparkles size={16} />
                            {CURRENT_SEASON.premiumPrice} Gem
                        </button>
                    </div>
                )}

                {/* Tier Navigation */}
                <div className="flex items-center justify-between px-4 py-2 bg-slate-800/50">
                    <button
                        onClick={() => setVisibleTierStart(Math.max(0, visibleTierStart - 5))}
                        disabled={visibleTierStart === 0}
                        className="p-2 hover:bg-white/10 rounded-lg disabled:opacity-30"
                    >
                        <ChevronLeft size={24} className="text-white" />
                    </button>
                    <span className="text-slate-400 text-sm">
                        Tier {visibleTierStart + 1} - {Math.min(visibleTierStart + 5, BATTLE_PASS_REWARDS.length)}
                    </span>
                    <button
                        onClick={() => setVisibleTierStart(Math.min(BATTLE_PASS_REWARDS.length - 5, visibleTierStart + 5))}
                        disabled={visibleTierStart >= BATTLE_PASS_REWARDS.length - 5}
                        className="p-2 hover:bg-white/10 rounded-lg disabled:opacity-30"
                    >
                        <ChevronRight size={24} className="text-white" />
                    </button>
                </div>

                {/* Rewards Grid */}
                <div className="p-6 overflow-y-auto max-h-[50vh]">
                    <div className="grid grid-cols-5 gap-4">
                        {visibleRewards.map((reward) => {
                            const isUnlocked = reward.tier <= actualTier + 1;
                            const freeClaimable = reward.freeReward && isUnlocked && !claimedFree.includes(reward.tier);
                            const premiumClaimable = reward.premiumReward && hasPremium && isUnlocked && !claimedPremium.includes(reward.tier);

                            return (
                                <div key={reward.tier} className="flex flex-col gap-2">
                                    {/* Tier Number */}
                                    <div className={`text-center text-sm font-bold ${isUnlocked ? 'text-yellow-400' : 'text-slate-500'}`}>
                                        Tier {reward.tier}
                                    </div>

                                    {/* Premium Reward */}
                                    <div className={`relative p-3 rounded-xl border-2 transition-all ${premiumClaimable
                                            ? 'border-yellow-500 bg-gradient-to-b from-yellow-900/30 to-orange-900/30 animate-pulse'
                                            : claimedPremium.includes(reward.tier)
                                                ? 'border-green-600 bg-green-900/20'
                                                : isUnlocked
                                                    ? 'border-purple-700 bg-purple-900/20'
                                                    : 'border-slate-700 bg-slate-800/30'
                                        }`}>
                                        {!hasPremium && (
                                            <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center">
                                                <Lock size={20} className="text-slate-400" />
                                            </div>
                                        )}
                                        {claimedPremium.includes(reward.tier) && (
                                            <div className="absolute top-1 right-1">
                                                <Check size={14} className="text-green-400" />
                                            </div>
                                        )}
                                        <div className="flex flex-col items-center gap-1">
                                            <Crown size={14} className="text-yellow-400" />
                                            {reward.premiumReward ? (
                                                <>
                                                    <div className="text-2xl">{getRewardIcon(reward.premiumReward)}</div>
                                                    <div className="text-[10px] text-center text-white/80">
                                                        {reward.premiumReward.amount || reward.premiumReward.item?.name || reward.premiumReward.skinId || 'Özel'}
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="text-slate-500 text-xs">-</div>
                                            )}
                                        </div>
                                        {premiumClaimable && (
                                            <button
                                                onClick={() => handleClaimPremium(reward.tier)}
                                                className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-yellow-500 text-black text-[10px] font-bold rounded"
                                            >
                                                AL
                                            </button>
                                        )}
                                    </div>

                                    {/* Free Reward */}
                                    <div className={`relative p-3 rounded-xl border-2 transition-all ${freeClaimable
                                            ? 'border-green-500 bg-gradient-to-b from-green-900/30 to-emerald-900/30 animate-pulse'
                                            : claimedFree.includes(reward.tier)
                                                ? 'border-green-600 bg-green-900/20'
                                                : isUnlocked
                                                    ? 'border-slate-600 bg-slate-800/30'
                                                    : 'border-slate-700 bg-slate-800/30 opacity-50'
                                        }`}>
                                        {claimedFree.includes(reward.tier) && (
                                            <div className="absolute top-1 right-1">
                                                <Check size={14} className="text-green-400" />
                                            </div>
                                        )}
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="text-[10px] text-slate-400">ÜCRETSİZ</span>
                                            {reward.freeReward ? (
                                                <>
                                                    <div className="text-2xl">{getRewardIcon(reward.freeReward)}</div>
                                                    <div className="text-[10px] text-center text-white/80">
                                                        {reward.freeReward.amount || reward.freeReward.item?.name || 'Özel'}
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="text-slate-500 text-xs">-</div>
                                            )}
                                        </div>
                                        {freeClaimable && (
                                            <button
                                                onClick={() => handleClaimFree(reward.tier)}
                                                className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-green-500 text-black text-[10px] font-bold rounded"
                                            >
                                                AL
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-800/50 border-t border-slate-700 flex justify-between items-center">
                    <div className="text-xs text-slate-400">
                        Battle Pass XP kazanmak için: Mob öldür, görev tamamla, düello kazan
                    </div>
                    {hasPremium && (
                        <div className="flex items-center gap-2 text-yellow-400">
                            <Crown size={16} />
                            <span className="text-sm font-bold">Premium Aktif</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BattlePassView;
