/**
 * ExpBar.tsx
 * EXP Progress Bar UI Component
 * - Shows current level
 * - Shows EXP progress to next level
 * - Smooth transition animations
 */

import React from 'react';
import { getExpProgress, getExpForLevel, getExpForNextLevel, formatExp, MAX_LEVEL } from '../../utils/levelSystem';

interface ExpBarProps {
    level: number;
    exp: number;
    className?: string;
    showNumbers?: boolean;
}

export const ExpBar: React.FC<ExpBarProps> = ({
    level,
    exp,
    className = '',
    showNumbers = true
}) => {
    const progress = getExpProgress(exp, level);
    const currentLevelExp = getExpForLevel(level);
    const nextLevelExp = getExpForNextLevel(level);
    const expInLevel = exp - currentLevelExp;
    const expNeeded = nextLevelExp - currentLevelExp;
    const isMaxLevel = level >= MAX_LEVEL;

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {/* Level Badge */}
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-yellow-600 to-amber-800 rounded-full border-2 border-yellow-400 shadow-lg shadow-yellow-600/30">
                <span className="text-xs font-bold text-white drop-shadow-md">{level}</span>
            </div>

            {/* EXP Bar Container */}
            <div className="flex-1 flex flex-col">
                {/* Progress Bar */}
                <div className="h-3 bg-slate-900/80 rounded-full overflow-hidden border border-slate-600/50 relative">
                    {/* Glow Effect */}
                    <div
                        className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-transparent"
                        style={{ width: `${progress}%` }}
                    />

                    {/* Progress Fill */}
                    <div
                        className="h-full bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-500 transition-all duration-500 ease-out relative"
                        style={{ width: `${progress}%` }}
                    >
                        {/* Shine Effect */}
                        <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent" />

                        {/* Animated Glow on edge */}
                        <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/50 blur-sm" />
                    </div>

                    {/* Max Level Indicator */}
                    {isMaxLevel && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[8px] font-bold text-yellow-300 drop-shadow-md animate-pulse">MAX</span>
                        </div>
                    )}
                </div>

                {/* EXP Numbers (Optional) */}
                {showNumbers && !isMaxLevel && (
                    <div className="flex justify-between text-[9px] text-slate-400 mt-0.5 px-1">
                        <span>{formatExp(expInLevel)}</span>
                        <span>{formatExp(expNeeded)}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

/**
 * Compact version for HUD
 */
export const ExpBarCompact: React.FC<ExpBarProps> = ({ level, exp, className = '' }) => {
    const progress = getExpProgress(exp, level);
    const isMaxLevel = level >= MAX_LEVEL;

    return (
        <div className={`flex items-center gap-1.5 ${className}`}>
            {/* Level Number */}
            <span className="text-xs font-bold text-yellow-400 min-w-[24px]">Lv.{level}</span>

            {/* Thin Progress Bar */}
            <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                <div
                    className={`h-full transition-all duration-300 ${isMaxLevel ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gradient-to-r from-yellow-600 to-yellow-400'}`}
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Percentage */}
            <span className="text-[10px] text-slate-400 min-w-[28px] text-right">
                {isMaxLevel ? 'MAX' : `${Math.floor(progress)}%`}
            </span>
        </div>
    );
};

export default ExpBar;
