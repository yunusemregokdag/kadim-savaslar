/**
 * HonorDisplay.tsx
 * Honor ve Rank gösterimi için HUD bileşeni
 */

import React from 'react';
import { HONOR_LIMITS } from '../../utils/rankSystem';
import { RANKS } from '../../constants';

interface HonorDisplayProps {
    honor: number;
    dailyHonor?: number;
    className?: string;
    compact?: boolean;
    showAmount?: boolean;
}

/**
 * Compact Honor + Rank gösterimi (HUD için)
 */
export const HonorDisplayCompact: React.FC<HonorDisplayProps> = ({
    honor,
    dailyHonor = 0,
    className = '',
    showAmount = true
}) => {
    // Rank Calculation
    const rank = [...RANKS].sort((a, b) => b.minRP - a.minRP).find(r => honor >= r.minRP) || RANKS[0];
    const nextRankObj = [...RANKS].sort((a, b) => a.minRP - b.minRP).find(r => r.minRP > honor);
    const needed = nextRankObj ? nextRankObj.minRP : rank.minRP;
    const nextRank = nextRankObj;
    const dailyRemaining = HONOR_LIMITS.DAILY_CAP - dailyHonor;
    const isAtLimit = dailyRemaining <= 0;

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {/* Rank Icon */}
            <div
                className="w-6 h-6 flex items-center justify-center rounded-full border-2 shadow-lg"
                style={{
                    backgroundColor: `${rank.color}20`,
                    borderColor: rank.color
                }}
            >
                <span className="text-sm">{rank.icon}</span>
            </div>

            {/* Honor Info */}
            <div className="flex flex-col">
                <div className="flex items-center gap-1">
                    <span
                        className="text-xs font-bold"
                        style={{ color: rank.color }}
                    >
                        {rank.name}
                    </span>
                    {showAmount && <span className="text-[10px] text-slate-400">
                        {formatHonor(honor)} ŞP
                    </span>}
                </div>

                {/* Günlük limit uyarısı */}
                {isAtLimit && (
                    <span className="text-[8px] text-red-400 animate-pulse">
                        Günlük limit doldu!
                    </span>
                )}
            </div>
        </div>
    );
};

/**
 * Full Honor Panel (Profil/Menu için)
 */
export const HonorPanel: React.FC<HonorDisplayProps> = ({
    honor,
    dailyHonor = 0,
    className = ''
}) => {
    // Rank Calculation Inline
    const rank = [...RANKS].sort((a, b) => b.minRP - a.minRP).find(r => honor >= r.minRP) || RANKS[0];
    const nextRank = [...RANKS].sort((a, b) => a.minRP - b.minRP).find(r => r.minRP > honor);
    const needed = nextRank ? nextRank.minRP : rank.minRP;

    const dailyRemaining = Math.max(0, HONOR_LIMITS.DAILY_CAP - dailyHonor);
    const dailyProgress = Math.min(100, (dailyHonor / HONOR_LIMITS.DAILY_CAP) * 100);

    return (
        <div className={`bg-slate-900/90 border border-slate-700 rounded-lg p-3 ${className}`}>
            {/* Rank Header */}
            <div className="flex items-center gap-3 mb-3">
                <div
                    className="w-12 h-12 flex items-center justify-center rounded-full border-2 shadow-lg"
                    style={{
                        backgroundColor: `${rank.color}20`,
                        borderColor: rank.color
                    }}
                >
                    <span className="text-2xl">{rank.icon}</span>
                </div>
                <div>
                    <div
                        className="text-lg font-bold"
                        style={{ color: rank.color }}
                    >
                        {rank.name}
                    </div>
                    <div className="text-sm text-slate-400">
                        {formatHonor(honor)} Şeref Puanı
                    </div>
                </div>
            </div>

            {/* Sonraki Rank Progress */}
            {nextRank && (
                <div className="mb-3">
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Sonraki: {nextRank.name}</span>
                        <span>{formatHonor(needed)} ŞP gerekiyor</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className="h-full transition-all duration-300"
                            style={{
                                width: `${Math.min(100, ((honor - rank.minHonor) / (nextRank.minHonor - rank.minHonor)) * 100)}%`,
                                backgroundColor: rank.color
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Günlük Limit */}
            <div>
                <div className="flex justify-between text-xs mb-1">
                    <span className="text-yellow-500">Günlük Honor</span>
                    <span className={dailyRemaining <= 0 ? 'text-red-400' : 'text-slate-400'}>
                        {formatHonor(dailyHonor)} / {formatHonor(HONOR_LIMITS.DAILY_CAP)}
                    </span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-300 ${dailyRemaining <= 0 ? 'bg-red-500' : 'bg-yellow-500'}`}
                        style={{ width: `${dailyProgress}%` }}
                    />
                </div>
            </div>
        </div>
    );
};

/**
 * Honor sayısını formatla
 */
function formatHonor(honor: number): string {
    if (honor >= 1000000) return (honor / 1000000).toFixed(1) + 'M';
    if (honor >= 1000) return (honor / 1000).toFixed(1) + 'K';
    return honor.toString();
}

export default HonorDisplayCompact;
