import React from 'react';
import { PlayerState } from '../types';
import { Sword, Shield, Zap, Heart, Plus, Minus, Sparkles } from 'lucide-react';

interface StatPointsPanelProps {
    playerState: PlayerState;
    onAddStat: (stat: 'strength' | 'dexterity' | 'intelligence' | 'vitality') => void;
    compact?: boolean;
}

const STAT_INFO = {
    strength: {
        name: 'Güç (STR)',
        abbr: 'STR',
        icon: Sword,
        color: 'text-red-400',
        bgColor: 'bg-red-600/20',
        borderColor: 'border-red-600/50',
        description: '+2 Fiziksel Hasar'
    },
    dexterity: {
        name: 'Çeviklik (DEX)',
        abbr: 'DEX',
        icon: Zap,
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-600/20',
        borderColor: 'border-yellow-600/50',
        description: '+1% Kritik Şans'
    },
    intelligence: {
        name: 'Zeka (INT)',
        abbr: 'INT',
        icon: Sparkles,
        color: 'text-blue-400',
        bgColor: 'bg-blue-600/20',
        borderColor: 'border-blue-600/50',
        description: '+5 Mana, +1 Büyü Hasarı'
    },
    vitality: {
        name: 'Dayanıklılık (VIT)',
        abbr: 'VIT',
        icon: Heart,
        color: 'text-green-400',
        bgColor: 'bg-green-600/20',
        borderColor: 'border-green-600/50',
        description: '+10 Can'
    }
};

const StatPointsPanel: React.FC<StatPointsPanelProps> = ({ playerState, onAddStat, compact = false }) => {
    const statPoints = playerState.statPoints || 0;
    const hasPoints = statPoints > 0;

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
                                    <Icon className={`w-4 h-4 mx-auto ${info.color}`} />
                                    <div className={`text-center text-xs font-bold mt-1 ${info.color}`}>{value}</div>
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
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-4 border border-slate-700 shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Shield className="text-purple-400" size={20} />
                    Karakter Statları
                </h3>
                <div className={`px-3 py-1 rounded-full font-bold text-sm ${hasPoints ? 'bg-green-600/30 text-green-400 animate-pulse' : 'bg-slate-700 text-slate-400'}`}>
                    {statPoints} Puan
                </div>
            </div>

            {/* Stats Grid */}
            <div className="space-y-3">
                {(Object.keys(STAT_INFO) as Array<keyof typeof STAT_INFO>).map(stat => {
                    const info = STAT_INFO[stat];
                    const Icon = info.icon;
                    const value = playerState[stat] || 0;

                    return (
                        <div key={stat} className={`flex items-center gap-3 p-3 rounded-lg border ${info.borderColor} ${info.bgColor} transition-all hover:scale-[1.02]`}>
                            <div className={`w-10 h-10 rounded-lg ${info.bgColor} flex items-center justify-center border ${info.borderColor}`}>
                                <Icon className={info.color} size={20} />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <span className={`font-bold ${info.color}`}>{info.name}</span>
                                    <span className="text-white font-bold text-lg">{value}</span>
                                </div>
                                <div className="text-[10px] text-slate-400">{info.description}</div>
                            </div>
                            <button
                                onClick={() => onAddStat(stat)}
                                disabled={!hasPoints}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${hasPoints
                                        ? 'bg-green-600 hover:bg-green-500 text-white shadow-lg hover:shadow-green-500/30'
                                        : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                    }`}
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Info Footer */}
            <div className="mt-4 p-3 bg-slate-800/50 rounded-lg text-xs text-slate-400 text-center">
                💡 Her level'da <span className="text-yellow-400 font-bold">5 stat puanı</span> kazanırsın!
            </div>
        </div>
    );
};

export default StatPointsPanel;
