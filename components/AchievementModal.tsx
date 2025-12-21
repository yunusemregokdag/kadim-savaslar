import React, { useState } from 'react';
import { Trophy, Star, Sword, Map, Hammer, Users, TrendingUp, Gift, Lock, Check, Coins, Gem } from 'lucide-react';
import { Achievement } from '../types';

// Default Achievements List
export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
    // Combat
    { id: 'first_blood', name: 'İlk Kan', description: 'İlk düşmanını yenilgiye uğrat', icon: 'Sword', category: 'combat', requirement: 1, currentProgress: 0, isCompleted: false, rewardGold: 100, rewardExp: 50 },
    { id: 'monster_hunter', name: 'Canavar Avcısı', description: '100 düşman öldür', icon: 'Sword', category: 'combat', requirement: 100, currentProgress: 0, isCompleted: false, rewardGold: 1000, rewardGems: 10 },
    { id: 'demon_slayer', name: 'İblis Avcısı', description: '500 düşman öldür', icon: 'Sword', category: 'combat', requirement: 500, currentProgress: 0, isCompleted: false, rewardGold: 5000, rewardGems: 50 },
    { id: 'elite_killer', name: 'Elit Katil', description: '10 elit düşman öldür', icon: 'Star', category: 'combat', requirement: 10, currentProgress: 0, isCompleted: false, rewardGold: 2000, rewardExp: 500 },
    { id: 'boss_hunter', name: 'Boss Avcısı', description: '5 boss öldür', icon: 'Trophy', category: 'combat', requirement: 5, currentProgress: 0, isCompleted: false, rewardGold: 10000, rewardGems: 100 },

    // Exploration
    { id: 'explorer', name: 'Kaşif', description: '5 farklı bölge keşfet', icon: 'Map', category: 'exploration', requirement: 5, currentProgress: 0, isCompleted: false, rewardGold: 500, rewardExp: 200 },
    { id: 'world_traveler', name: 'Dünya Gezgini', description: '15 farklı bölge keşfet', icon: 'Map', category: 'exploration', requirement: 15, currentProgress: 0, isCompleted: false, rewardGold: 3000, rewardGems: 25 },
    { id: 'portal_master', name: 'Portal Ustası', description: '50 kez portal kullan', icon: 'Map', category: 'exploration', requirement: 50, currentProgress: 0, isCompleted: false, rewardGold: 1500, rewardExp: 300 },

    // Crafting
    { id: 'apprentice_smith', name: 'Çırak Demirci', description: '10 eşya yükselt', icon: 'Hammer', category: 'crafting', requirement: 10, currentProgress: 0, isCompleted: false, rewardGold: 500 },
    { id: 'master_smith', name: 'Usta Demirci', description: '50 eşya yükselt', icon: 'Hammer', category: 'crafting', requirement: 50, currentProgress: 0, isCompleted: false, rewardGold: 3000, rewardGems: 20 },
    { id: 'legendary_forge', name: 'Efsanevi Demirci', description: '+10 eşya yap', icon: 'Hammer', category: 'crafting', requirement: 1, currentProgress: 0, isCompleted: false, rewardGold: 20000, rewardGems: 200 },

    // Social
    { id: 'guild_member', name: 'Klan Üyesi', description: 'Bir klana katıl', icon: 'Users', category: 'social', requirement: 1, currentProgress: 0, isCompleted: false, rewardGold: 500 },
    { id: 'guild_master', name: 'Klan Lideri', description: 'Bir klan kur', icon: 'Users', category: 'social', requirement: 1, currentProgress: 0, isCompleted: false, rewardGold: 2000, rewardGems: 30 },
    { id: 'social_butterfly', name: 'Sosyal Kelebek', description: '100 mesaj gönder', icon: 'Users', category: 'social', requirement: 100, currentProgress: 0, isCompleted: false, rewardGold: 1000 },

    // Progression
    { id: 'level_10', name: 'Acemi Savaşçı', description: 'Seviye 10 ol', icon: 'TrendingUp', category: 'progression', requirement: 10, currentProgress: 0, isCompleted: false, rewardGold: 1000, rewardExp: 500 },
    { id: 'level_25', name: 'Tecrübeli Savaşçı', description: 'Seviye 25 ol', icon: 'TrendingUp', category: 'progression', requirement: 25, currentProgress: 0, isCompleted: false, rewardGold: 5000, rewardGems: 50 },
    { id: 'level_50', name: 'Efsane Savaşçı', description: 'Seviye 50 ol', icon: 'TrendingUp', category: 'progression', requirement: 50, currentProgress: 0, isCompleted: false, rewardGold: 20000, rewardGems: 200 },
    { id: 'millionaire', name: 'Milyoner', description: '1.000.000 altın topla', icon: 'Coins', category: 'progression', requirement: 1000000, currentProgress: 0, isCompleted: false, rewardGems: 500 },
];

interface AchievementModalProps {
    achievements: Achievement[];
    onClaim: (achievement: Achievement) => void;
    onClose: () => void;
}

const CATEGORY_INFO: Record<string, { icon: any, label: string, color: string }> = {
    combat: { icon: Sword, label: 'Savaş', color: 'text-red-400' },
    exploration: { icon: Map, label: 'Keşif', color: 'text-blue-400' },
    crafting: { icon: Hammer, label: 'Üretim', color: 'text-orange-400' },
    social: { icon: Users, label: 'Sosyal', color: 'text-green-400' },
    progression: { icon: TrendingUp, label: 'İlerleme', color: 'text-purple-400' },
};

export const AchievementModal: React.FC<AchievementModalProps> = ({ achievements, onClaim, onClose }) => {
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const filteredAchievements = achievements.filter(a =>
        selectedCategory === 'all' || a.category === selectedCategory
    );

    const completedCount = achievements.filter(a => a.isCompleted).length;
    const totalCount = achievements.length;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-purple-600/50 rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 p-6 border-b border-purple-700/30">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                                <Trophy className="text-purple-400" size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-purple-400">Başarımlar</h2>
                                <p className="text-sm text-purple-200/60">{completedCount} / {totalCount} Tamamlandı</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                            <span className="text-2xl text-slate-400">×</span>
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4 h-2 bg-black/40 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                            style={{ width: `${(completedCount / totalCount) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Category Tabs */}
                <div className="p-4 border-b border-slate-800 flex gap-2 overflow-x-auto">
                    <button
                        onClick={() => setSelectedCategory('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${selectedCategory === 'all'
                                ? 'bg-purple-600 text-white'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                            }`}
                    >
                        Tümü
                    </button>
                    {Object.entries(CATEGORY_INFO).map(([key, { icon: Icon, label, color }]) => (
                        <button
                            key={key}
                            onClick={() => setSelectedCategory(key)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${selectedCategory === key
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                }`}
                        >
                            <Icon size={14} />
                            {label}
                        </button>
                    ))}
                </div>

                {/* Achievements List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {filteredAchievements.map(achievement => {
                        const progress = Math.min(100, (achievement.currentProgress / achievement.requirement) * 100);
                        const catInfo = CATEGORY_INFO[achievement.category];
                        const Icon = catInfo?.icon || Star;

                        return (
                            <div
                                key={achievement.id}
                                className={`p-4 rounded-xl border transition-all ${achievement.isCompleted
                                        ? 'bg-green-900/20 border-green-700/50'
                                        : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${achievement.isCompleted ? 'bg-green-500/20' : 'bg-black/40'
                                        }`}>
                                        {achievement.isCompleted ? (
                                            <Check className="text-green-400" size={24} />
                                        ) : (
                                            <Icon className={catInfo?.color || 'text-slate-400'} size={24} />
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <h3 className={`font-bold ${achievement.isCompleted ? 'text-green-400' : 'text-white'}`}>
                                                {achievement.name}
                                            </h3>
                                            <div className="flex items-center gap-2 text-xs">
                                                {achievement.rewardGold && (
                                                    <span className="flex items-center gap-1 text-yellow-400">
                                                        <Coins size={12} /> {achievement.rewardGold}
                                                    </span>
                                                )}
                                                {achievement.rewardGems && (
                                                    <span className="flex items-center gap-1 text-purple-400">
                                                        <Gem size={12} /> {achievement.rewardGems}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-sm text-slate-400">{achievement.description}</p>

                                        {/* Progress Bar */}
                                        <div className="mt-2 flex items-center gap-3">
                                            <div className="flex-1 h-2 bg-black/40 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all ${achievement.isCompleted
                                                            ? 'bg-green-500'
                                                            : 'bg-gradient-to-r from-purple-500 to-pink-500'
                                                        }`}
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-slate-500">
                                                {achievement.currentProgress} / {achievement.requirement}
                                            </span>
                                        </div>
                                    </div>

                                    {achievement.isCompleted && achievement.currentProgress >= achievement.requirement && (
                                        <button
                                            onClick={() => onClaim(achievement)}
                                            className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-white text-sm font-bold transition-all"
                                        >
                                            <Gift size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default AchievementModal;
