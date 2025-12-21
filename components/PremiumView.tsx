import React, { useState, useEffect } from 'react';
import { PlayerState } from '../types';
import { premiumAPI } from '../utils/api';
import {
    Crown, Sparkles, Star, Coins, Gift, Check, Clock,
    X, ChevronRight, Zap, Shield, Package, RefreshCw,
    TrendingUp, Percent, Award
} from 'lucide-react';

interface PremiumBenefit {
    expMultiplier: number;
    goldMultiplier: number;
    dropRateBonus: number;
    inventorySlots: number;
    storageSlots: number;
    dailyGems: number;
    nameColor: string;
    badge: string;
    priorityQueue: boolean;
    discountPercent: number;
}

interface PremiumPackage {
    tier: string;
    duration: number;
    price: number;
    label: string;
}

interface PremiumViewProps {
    playerState: PlayerState;
    onClose: () => void;
    onRefreshPlayer: () => void;
}

const TIER_COLORS: Record<string, { bg: string; border: string; text: string; gradient: string }> = {
    none: { bg: 'bg-slate-800', border: 'border-slate-600', text: 'text-slate-400', gradient: 'from-slate-700 to-slate-800' },
    bronze: { bg: 'bg-amber-900/30', border: 'border-amber-600/50', text: 'text-amber-400', gradient: 'from-amber-800 to-amber-900' },
    silver: { bg: 'bg-slate-400/20', border: 'border-slate-400/50', text: 'text-slate-300', gradient: 'from-slate-500 to-slate-700' },
    gold: { bg: 'bg-yellow-900/30', border: 'border-yellow-500/50', text: 'text-yellow-400', gradient: 'from-yellow-600 to-amber-700' },
    diamond: { bg: 'bg-cyan-900/30', border: 'border-cyan-400/50', text: 'text-cyan-300', gradient: 'from-cyan-500 to-blue-600' }
};

const TIER_NAMES: Record<string, string> = {
    none: 'Ücretsiz',
    bronze: 'Bronz',
    silver: 'Gümüş',
    gold: 'Altın',
    diamond: 'Elmas'
};

export const PremiumView: React.FC<PremiumViewProps> = ({ playerState, onClose, onRefreshPlayer }) => {
    const [currentTier, setCurrentTier] = useState<string>('none');
    const [expiresAt, setExpiresAt] = useState<Date | null>(null);
    const [benefits, setBenefits] = useState<PremiumBenefit | null>(null);
    const [packages, setPackages] = useState<PremiumPackage[]>([]);
    const [tiers, setTiers] = useState<Record<string, PremiumBenefit>>({});
    const [canClaimDaily, setCanClaimDaily] = useState(false);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState(false);
    const [selectedTier, setSelectedTier] = useState<string>('bronze');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        loadPremiumStatus();
    }, []);

    const loadPremiumStatus = async () => {
        setLoading(true);
        try {
            const data = await premiumAPI.getStatus();
            setCurrentTier(data.premium.tier);
            setExpiresAt(data.premium.expiresAt ? new Date(data.premium.expiresAt) : null);
            setBenefits(data.benefits);
            setPackages(data.packages || []);
            setTiers(data.tiers || {});
            setCanClaimDaily(data.canClaimDaily);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePurchase = async (tier: string, duration: number) => {
        setPurchasing(true);
        setError(null);
        try {
            const result = await premiumAPI.purchase(tier, duration);
            if (result.success) {
                setSuccess(result.message);
                setCurrentTier(result.premium.tier);
                setExpiresAt(new Date(result.premium.expiresAt));
                setBenefits(result.benefits);
                onRefreshPlayer();
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setPurchasing(false);
        }
    };

    const handleClaimDaily = async () => {
        try {
            const result = await premiumAPI.claimDailyGems();
            if (result.success) {
                setSuccess(`${result.gemsReceived} gem kazandın!`);
                setCanClaimDaily(false);
                onRefreshPlayer();
            }
        } catch (err: any) {
            setError(err.message);
        }
    };

    const getTimeRemaining = () => {
        if (!expiresAt) return null;
        const now = new Date();
        const diff = expiresAt.getTime() - now.getTime();
        if (diff <= 0) return 'Süresi doldu';

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (days > 0) return `${days} gün ${hours} saat kaldı`;
        return `${hours} saat kaldı`;
    };

    const tierColors = TIER_COLORS[currentTier] || TIER_COLORS.none;

    if (loading) {
        return (
            <div className="fixed inset-0 z-[90] bg-black/80 flex items-center justify-center">
                <div className="text-white flex items-center gap-3">
                    <RefreshCw className="animate-spin" size={24} />
                    <span>Yükleniyor...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[90] bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl shadow-2xl my-8">
                {/* Header */}
                <div className={`bg-gradient-to-r ${tierColors.gradient} p-6 rounded-t-2xl border-b ${tierColors.border}`}>
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                            <div className={`w-16 h-16 rounded-2xl bg-black/30 flex items-center justify-center text-4xl`}>
                                <Crown className={tierColors.text} size={40} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                    Premium Üyelik
                                    {currentTier !== 'none' && (
                                        <span className={`text-sm ${tierColors.text} px-2 py-0.5 rounded-full border ${tierColors.border}`}>
                                            {TIER_NAMES[currentTier]}
                                        </span>
                                    )}
                                </h2>
                                <p className="text-white/70 text-sm mt-1">
                                    {currentTier === 'none'
                                        ? 'Premium ile özel avantajların tadını çıkar!'
                                        : getTimeRemaining()
                                    }
                                </p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                            <X size={24} className="text-white/70" />
                        </button>
                    </div>

                    {/* Daily Claim */}
                    {currentTier !== 'none' && (
                        <div className="mt-4 flex items-center justify-between bg-black/20 rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <Gift className="text-purple-400" size={24} />
                                <div>
                                    <div className="font-bold text-white">Günlük Gem</div>
                                    <div className="text-sm text-white/60">{benefits?.dailyGems || 0} gem / gün</div>
                                </div>
                            </div>
                            <button
                                onClick={handleClaimDaily}
                                disabled={!canClaimDaily}
                                className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${canClaimDaily
                                        ? 'bg-purple-600 hover:bg-purple-500 text-white'
                                        : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                    }`}
                            >
                                {canClaimDaily ? 'Al' : 'Alındı ✓'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Messages */}
                {error && (
                    <div className="bg-red-900/30 border-b border-red-800 p-3 flex items-center justify-between text-red-300 text-sm">
                        <span>{error}</span>
                        <button onClick={() => setError(null)}><X size={14} /></button>
                    </div>
                )}
                {success && (
                    <div className="bg-green-900/30 border-b border-green-800 p-3 flex items-center justify-between text-green-300 text-sm">
                        <span>{success}</span>
                        <button onClick={() => setSuccess(null)}><X size={14} /></button>
                    </div>
                )}

                <div className="p-6">
                    {/* Tier Selection */}
                    <h3 className="text-lg font-bold text-white mb-4">Premium Paketi Seç</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                        {(['bronze', 'silver', 'gold', 'diamond'] as const).map(tier => {
                            const tierColor = TIER_COLORS[tier];
                            const tierBenefits = tiers[tier];
                            const isSelected = selectedTier === tier;
                            const isOwned = currentTier === tier;

                            return (
                                <button
                                    key={tier}
                                    onClick={() => setSelectedTier(tier)}
                                    className={`p-4 rounded-xl border-2 transition-all ${isSelected
                                            ? `${tierColor.bg} ${tierColor.border} scale-105`
                                            : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                                        }`}
                                >
                                    <div className={`text-2xl mb-2 ${tierColor.text}`}>
                                        {tier === 'bronze' && '🥉'}
                                        {tier === 'silver' && '🥈'}
                                        {tier === 'gold' && '🥇'}
                                        {tier === 'diamond' && '💎'}
                                    </div>
                                    <div className={`font-bold ${isSelected ? tierColor.text : 'text-white'}`}>
                                        {TIER_NAMES[tier]}
                                    </div>
                                    {isOwned && (
                                        <div className="text-xs text-green-400 mt-1">Aktif ✓</div>
                                    )}
                                    {tierBenefits && (
                                        <div className="text-xs text-slate-400 mt-1">
                                            {tierBenefits.expMultiplier}x EXP
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Selected Tier Benefits */}
                    {tiers[selectedTier] && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                                <TrendingUp size={18} className="text-green-400 mb-2" />
                                <div className="text-xs text-slate-400">EXP Bonusu</div>
                                <div className="font-bold text-white">{tiers[selectedTier].expMultiplier}x</div>
                            </div>
                            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                                <Coins size={18} className="text-yellow-400 mb-2" />
                                <div className="text-xs text-slate-400">Altın Bonusu</div>
                                <div className="font-bold text-white">{tiers[selectedTier].goldMultiplier}x</div>
                            </div>
                            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                                <Package size={18} className="text-blue-400 mb-2" />
                                <div className="text-xs text-slate-400">Ekstra Slot</div>
                                <div className="font-bold text-white">+{tiers[selectedTier].inventorySlots}</div>
                            </div>
                            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                                <Sparkles size={18} className="text-purple-400 mb-2" />
                                <div className="text-xs text-slate-400">Günlük Gem</div>
                                <div className="font-bold text-white">{tiers[selectedTier].dailyGems}</div>
                            </div>
                            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                                <Zap size={18} className="text-cyan-400 mb-2" />
                                <div className="text-xs text-slate-400">Drop Bonusu</div>
                                <div className="font-bold text-white">+{tiers[selectedTier].dropRateBonus}%</div>
                            </div>
                            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                                <Percent size={18} className="text-orange-400 mb-2" />
                                <div className="text-xs text-slate-400">İndirim</div>
                                <div className="font-bold text-white">{tiers[selectedTier].discountPercent}%</div>
                            </div>
                            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                                <Award size={18} className={`mb-2`} style={{ color: tiers[selectedTier].nameColor }} />
                                <div className="text-xs text-slate-400">İsim Rengi</div>
                                <div className="font-bold" style={{ color: tiers[selectedTier].nameColor }}>Özel</div>
                            </div>
                            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                                <Shield size={18} className="text-emerald-400 mb-2" />
                                <div className="text-xs text-slate-400">Rozet</div>
                                <div className="font-bold text-white">{tiers[selectedTier].badge}</div>
                            </div>
                        </div>
                    )}

                    {/* Purchase Options */}
                    <h3 className="text-lg font-bold text-white mb-4">Satın Al</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {packages.filter(p => p.tier === selectedTier).map((pkg, idx) => {
                            const tierColor = TIER_COLORS[pkg.tier];

                            return (
                                <button
                                    key={idx}
                                    onClick={() => handlePurchase(pkg.tier, pkg.duration)}
                                    disabled={purchasing || (playerState.gems < pkg.price)}
                                    className={`p-4 rounded-xl border ${tierColor.border} ${tierColor.bg} hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <span className={`font-bold ${tierColor.text}`}>{pkg.label}</span>
                                        {pkg.duration === 30 && (
                                            <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded">Tasarruf!</span>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1 text-purple-400">
                                            <Sparkles size={16} />
                                            <span className="font-bold">{pkg.price}</span>
                                        </div>
                                        <ChevronRight size={18} className="text-slate-400" />
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Current Gems */}
                    <div className="mt-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Sparkles className="text-purple-400" size={24} />
                            <div>
                                <div className="text-sm text-slate-400">Mevcut Gemlerin</div>
                                <div className="font-bold text-purple-400 text-xl">{playerState.gems}</div>
                            </div>
                        </div>
                        <button className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg flex items-center gap-2">
                            <Coins size={16} />
                            Gem Satın Al
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PremiumView;
