import React from 'react';
import { PlayerState } from '../types';
import { Sword, Shield, Zap, Heart, Plus, Sparkles, Target, Flame, Activity } from 'lucide-react';

interface StatPointsPanelProps {
    playerState: PlayerState;
    onAddStat: (stat: 'strength' | 'dexterity' | 'intelligence' | 'vitality') => void;
    compact?: boolean;
    showCalculatedStats?: boolean;
}

const STAT_INFO = {
    strength: {
        name: 'Güç (STR)',
        abbr: 'STR',
        icon: Sword,
        color: '#ef4444', // Red
        bgColor: 'bg-red-900/40',
        borderColor: 'border-red-600/60',
        description: '+2 Fiziksel Hasar'
    },
    dexterity: {
        name: 'Çeviklik (DEX)',
        abbr: 'DEX',
        icon: Zap,
        color: '#eab308', // Yellow
        bgColor: 'bg-yellow-900/40',
        borderColor: 'border-yellow-600/60',
        description: '+1% Kritik Şans'
    },
    intelligence: {
        name: 'Zeka (INT)',
        abbr: 'INT',
        icon: Sparkles,
        color: '#3b82f6', // Blue
        bgColor: 'bg-blue-900/40',
        borderColor: 'border-blue-600/60',
        description: '+5 Mana, +1 Büyü Hasarı'
    },
    vitality: {
        name: 'Dayanıklılık (VIT)',
        abbr: 'VIT',
        icon: Heart,
        color: '#a855f7', // Purple (matching image)
        bgColor: 'bg-purple-900/40',
        borderColor: 'border-purple-600/60',
        description: '+10 Can'
    }
};

const StatPointsPanel: React.FC<StatPointsPanelProps> = ({ playerState, onAddStat, compact = false, showCalculatedStats = true }) => {
    const statPoints = playerState.statPoints || 0;
    const hasPoints = statPoints > 0;

    // Calculate derived stats
    const str = playerState.strength || 0;
    const dex = playerState.dexterity || 0;
    const int = playerState.intelligence || 0;
    const vit = playerState.vitality || 0;

    const baseDamage = str * 2 + int;
    const baseDefense = vit * 2 + Math.floor(str / 2);
    const critChance = Math.min(dex, 50); // Max 50%
    const attackSpeed = 1 + (dex * 0.5); // Base 1.0 + dex bonus

    if (compact) {
        return (
            <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-700">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400 uppercase font-bold">Stat Puanları</span>
                    <span className={`text-sm font-bold ${hasPoints ? 'text-green-400 animate-pulse' : 'text-slate-500'}`}>
                        {statPoints} Puan
                    </span>
                </div>
                <div className="grid grid-cols-4 gap-1">
                    {(Object.keys(STAT_INFO) as Array<keyof typeof STAT_INFO>).map(stat => {
                        const info = STAT_INFO[stat];
                        const Icon = info.icon;
                        const value = playerState[stat] || 0;
                        return (
                            <div key={stat} className="relative group">
                                <button
                                    onClick={() => hasPoints && onAddStat(stat)}
                                    disabled={!hasPoints}
                                    className={`w-full p-2 rounded-lg border ${info.borderColor} ${info.bgColor} transition-all ${hasPoints ? 'hover:scale-105 cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
                                    title={`${info.name}: ${value} (${info.description})`}
                                >
                                    <Icon className="w-4 h-4 mx-auto" style={{ color: info.color }} />
                                    <div className="text-center text-xs font-bold mt-1" style={{ color: info.color }}>{value}</div>
                                </button>
                                {hasPoints && (
                                    <div className="absolute -top-1 -right-1 bg-green-500 rounded-full w-4 h-4 flex items-center justify-center">
                                        <Plus size={10} className="text-white" />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-b from-[#1a2332] to-[#0f1520] rounded-xl border border-[#2a3a4a] shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#1e2a3a] border-b border-[#2a3a4a]">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Shield className="text-cyan-400" size={18} />
                    KARAKTER STATLARI
                </h3>
                <div className={`px-3 py-1 rounded-full font-bold text-sm ${hasPoints ? 'bg-green-600/40 text-green-400 border border-green-500/50 animate-pulse' : 'bg-slate-700/50 text-slate-400 border border-slate-600/50'}`}>
                    {statPoints} Puan
                </div>
            </div>

            {/* Stats Grid - Matching Reference Image */}
            <div className="p-3 space-y-2">
                {(Object.keys(STAT_INFO) as Array<keyof typeof STAT_INFO>).map(stat => {
                    const info = STAT_INFO[stat];
                    const Icon = info.icon;
                    const value = playerState[stat] || 0;

                    return (
                        <div
                            key={stat}
                            className={`flex items-center gap-3 p-3 rounded-lg border ${info.borderColor} ${info.bgColor} transition-all hover:brightness-110`}
                        >
                            {/* Icon */}
                            <div
                                className="w-9 h-9 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: `${info.color}30`, borderColor: info.color, borderWidth: 1 }}
                            >
                                <Icon size={18} style={{ color: info.color }} />
                            </div>

                            {/* Name & Description */}
                            <div className="flex-1">
                                <div className="font-bold" style={{ color: info.color }}>{info.name}</div>
                                <div className="text-[10px] text-slate-500">{info.description}</div>
                            </div>

                            {/* Value */}
                            <div className="text-white font-bold text-xl min-w-[50px] text-right">{value}</div>

                            {/* Add Button */}
                            <button
                                onClick={() => onAddStat(stat)}
                                disabled={!hasPoints}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${hasPoints
                                    ? 'bg-green-600 hover:bg-green-500 text-white shadow-lg hover:shadow-green-500/40 hover:scale-110'
                                    : 'bg-slate-700/50 text-slate-600 cursor-not-allowed'
                                    }`}
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Info Footer */}
            <div className="px-4 py-2 bg-[#0d1218] text-xs text-slate-500 text-center border-t border-[#2a3a4a]">
                💡 Her level'da <span className="text-yellow-400 font-bold">5 stat puanı</span> kazanırsın!
            </div>

            {/* CALCULATED STATS SECTION */}
            {showCalculatedStats && (
                <div className="border-t border-[#2a3a4a]">
                    <div className="px-4 py-2 bg-[#1a2332] border-b border-[#2a3a4a]">
                        <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wide">Hesaplanan Statlar</h4>
                    </div>
                    <div className="p-3 grid grid-cols-2 gap-2">
                        {/* Total Damage */}
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-red-900/20 border border-red-800/40">
                            <Flame size={14} className="text-red-400" />
                            <div className="flex-1">
                                <div className="text-[10px] text-slate-500">Hasar</div>
                                <div className="text-sm font-bold text-red-400">{baseDamage + (playerState.damage || 0)}</div>
                            </div>
                        </div>

                        {/* Defense */}
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-900/20 border border-blue-800/40">
                            <Shield size={14} className="text-blue-400" />
                            <div className="flex-1">
                                <div className="text-[10px] text-slate-500">Defans</div>
                                <div className="text-sm font-bold text-blue-400">{baseDefense + (playerState.defense || 0)}</div>
                            </div>
                        </div>

                        {/* Crit Chance */}
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-yellow-900/20 border border-yellow-800/40">
                            <Target size={14} className="text-yellow-400" />
                            <div className="flex-1">
                                <div className="text-[10px] text-slate-500">Kritik Şansı</div>
                                <div className="text-sm font-bold text-yellow-400">{critChance}%</div>
                            </div>
                        </div>

                        {/* Attack Speed */}
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-green-900/20 border border-green-800/40">
                            <Activity size={14} className="text-green-400" />
                            <div className="flex-1">
                                <div className="text-[10px] text-slate-500">Saldırı Hızı</div>
                                <div className="text-sm font-bold text-green-400">{attackSpeed.toFixed(1)}</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StatPointsPanel;

