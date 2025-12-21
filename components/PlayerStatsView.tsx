import React, { useState, useEffect } from 'react';
import { PlayerState } from '../types';
import {
    BarChart3, Sword, Skull, Trophy, Clock, Target, Coins,
    Star, Shield, Zap, Heart, TrendingUp, Award, X,
    Crosshair, Users, MapPin, Flame
} from 'lucide-react';

interface PlayerStats {
    // Combat
    totalKills: number;
    totalDeaths: number;
    pvpKills: number;
    pvpDeaths: number;
    bossKills: number;
    highestDamage: number;
    totalDamageDealt: number;
    criticalHits: number;

    // Progression
    totalExpEarned: number;
    totalGoldEarned: number;
    questsCompleted: number;
    dungeonsCleared: number;
    achievementsUnlocked: number;

    // Social
    duelsWon: number;
    duelsLost: number;
    friendsAdded: number;
    partiesJoined: number;
    guildsJoined: number;
    messageseSent: number;

    // Time
    totalPlayTime: number; // minutes
    longestSession: number;
    loginStreak: number;
    firstLoginDate: string;

    // Economy
    itemsCrafted: number;
    itemsSold: number;
    itemsBought: number;
    gemsSpent: number;

    // Misc
    portalsTraveled: number;
    potionsUsed: number;
    skillsUsed: number;
    favoritZone: string;
    favoriteClass: string;
}

const DEFAULT_STATS: PlayerStats = {
    totalKills: 0,
    totalDeaths: 0,
    pvpKills: 0,
    pvpDeaths: 0,
    bossKills: 0,
    highestDamage: 0,
    totalDamageDealt: 0,
    criticalHits: 0,
    totalExpEarned: 0,
    totalGoldEarned: 0,
    questsCompleted: 0,
    dungeonsCleared: 0,
    achievementsUnlocked: 0,
    duelsWon: 0,
    duelsLost: 0,
    friendsAdded: 0,
    partiesJoined: 0,
    guildsJoined: 0,
    messageseSent: 0,
    totalPlayTime: 0,
    longestSession: 0,
    loginStreak: 0,
    firstLoginDate: new Date().toISOString(),
    itemsCrafted: 0,
    itemsSold: 0,
    itemsBought: 0,
    gemsSpent: 0,
    portalsTraveled: 0,
    potionsUsed: 0,
    skillsUsed: 0,
    favoritZone: 'Başlangıç Koyu',
    favoriteClass: 'warrior',
};

interface PlayerStatsViewProps {
    playerState: PlayerState;
    onClose: () => void;
}

// Stats tracking hook
export const usePlayerStats = () => {
    const [stats, setStats] = useState<PlayerStats>(() => {
        const saved = localStorage.getItem('playerStats');
        if (saved) {
            try {
                return { ...DEFAULT_STATS, ...JSON.parse(saved) };
            } catch {
                return DEFAULT_STATS;
            }
        }
        return DEFAULT_STATS;
    });

    // Save to localStorage
    useEffect(() => {
        localStorage.setItem('playerStats', JSON.stringify(stats));
    }, [stats]);

    // Track play time
    useEffect(() => {
        const interval = setInterval(() => {
            setStats(prev => ({ ...prev, totalPlayTime: prev.totalPlayTime + 1 }));
        }, 60000); // Every minute
        return () => clearInterval(interval);
    }, []);

    const trackKill = (isPvP: boolean = false, isBoss: boolean = false) => {
        setStats(prev => ({
            ...prev,
            totalKills: prev.totalKills + 1,
            pvpKills: isPvP ? prev.pvpKills + 1 : prev.pvpKills,
            bossKills: isBoss ? prev.bossKills + 1 : prev.bossKills,
        }));
    };

    const trackDeath = (isPvP: boolean = false) => {
        setStats(prev => ({
            ...prev,
            totalDeaths: prev.totalDeaths + 1,
            pvpDeaths: isPvP ? prev.pvpDeaths + 1 : prev.pvpDeaths,
        }));
    };

    const trackDamage = (damage: number, isCrit: boolean = false) => {
        setStats(prev => ({
            ...prev,
            totalDamageDealt: prev.totalDamageDealt + damage,
            highestDamage: Math.max(prev.highestDamage, damage),
            criticalHits: isCrit ? prev.criticalHits + 1 : prev.criticalHits,
        }));
    };

    const trackExp = (amount: number) => {
        setStats(prev => ({ ...prev, totalExpEarned: prev.totalExpEarned + amount }));
    };

    const trackGold = (amount: number) => {
        setStats(prev => ({ ...prev, totalGoldEarned: prev.totalGoldEarned + amount }));
    };

    const trackQuest = () => {
        setStats(prev => ({ ...prev, questsCompleted: prev.questsCompleted + 1 }));
    };

    const trackDuel = (won: boolean) => {
        setStats(prev => ({
            ...prev,
            duelsWon: won ? prev.duelsWon + 1 : prev.duelsWon,
            duelsLost: !won ? prev.duelsLost + 1 : prev.duelsLost,
        }));
    };

    const trackSkillUse = () => {
        setStats(prev => ({ ...prev, skillsUsed: prev.skillsUsed + 1 }));
    };

    const trackPotionUse = () => {
        setStats(prev => ({ ...prev, potionsUsed: prev.potionsUsed + 1 }));
    };

    return {
        stats,
        trackKill,
        trackDeath,
        trackDamage,
        trackExp,
        trackGold,
        trackQuest,
        trackDuel,
        trackSkillUse,
        trackPotionUse,
    };
};

export const PlayerStatsView: React.FC<PlayerStatsViewProps> = ({ playerState, onClose }) => {
    const { stats } = usePlayerStats();
    const [activeTab, setActiveTab] = useState<'combat' | 'progress' | 'social' | 'economy'>('combat');

    const formatTime = (minutes: number): string => {
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        if (days > 0) return `${days}g ${hours % 24}s`;
        if (hours > 0) return `${hours}s ${minutes % 60}d`;
        return `${minutes}d`;
    };

    const kdRatio = stats.totalDeaths > 0 ? (stats.totalKills / stats.totalDeaths).toFixed(2) : stats.totalKills.toString();
    const pvpKdRatio = stats.pvpDeaths > 0 ? (stats.pvpKills / stats.pvpDeaths).toFixed(2) : stats.pvpKills.toString();
    const duelWinRate = (stats.duelsWon + stats.duelsLost) > 0
        ? ((stats.duelsWon / (stats.duelsWon + stats.duelsLost)) * 100).toFixed(1)
        : '0';

    const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number; color?: string; subValue?: string }> =
        ({ icon, label, value, color = 'text-white', subValue }) => (
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg bg-slate-900 flex items-center justify-center ${color}`}>
                    {icon}
                </div>
                <div>
                    <div className="text-xs text-slate-400">{label}</div>
                    <div className={`text-xl font-bold ${color}`}>{value.toLocaleString()}</div>
                    {subValue && <div className="text-xs text-slate-500">{subValue}</div>}
                </div>
            </div>
        );

    const tabs = [
        { id: 'combat' as const, label: 'Savaş', icon: <Sword size={14} /> },
        { id: 'progress' as const, label: 'İlerleme', icon: <TrendingUp size={14} /> },
        { id: 'social' as const, label: 'Sosyal', icon: <Users size={14} /> },
        { id: 'economy' as const, label: 'Ekonomi', icon: <Coins size={14} /> },
    ];

    return (
        <div className="fixed inset-0 z-[90] bg-black/80 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="bg-gradient-to-r from-cyan-900 to-blue-900 p-6 border-b border-cyan-700">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                                <BarChart3 size={32} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">İstatistikler</h2>
                                <p className="text-cyan-200 text-sm">{playerState.nickname}'in Savaş Geçmişi</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
                            <X size={24} className="text-white" />
                        </button>
                    </div>

                    {/* Quick Stats */}
                    <div className="mt-4 grid grid-cols-4 gap-4">
                        <div className="bg-black/30 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-red-400">{stats.totalKills}</div>
                            <div className="text-xs text-slate-400">Toplam Kill</div>
                        </div>
                        <div className="bg-black/30 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-yellow-400">{kdRatio}</div>
                            <div className="text-xs text-slate-400">K/D Oranı</div>
                        </div>
                        <div className="bg-black/30 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-green-400">{formatTime(stats.totalPlayTime)}</div>
                            <div className="text-xs text-slate-400">Oynama Süresi</div>
                        </div>
                        <div className="bg-black/30 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-purple-400">{stats.questsCompleted}</div>
                            <div className="text-xs text-slate-400">Görev Tamam</div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-700">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === tab.id
                                    ? 'bg-slate-800 text-cyan-400 border-b-2 border-cyan-400'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[45vh]">
                    {activeTab === 'combat' && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <StatCard icon={<Sword size={20} />} label="Toplam Kill" value={stats.totalKills} color="text-red-400" />
                            <StatCard icon={<Skull size={20} />} label="Toplam Ölüm" value={stats.totalDeaths} color="text-slate-400" />
                            <StatCard icon={<Target size={20} />} label="K/D Oranı" value={kdRatio} color="text-yellow-400" />
                            <StatCard icon={<Crosshair size={20} />} label="PvP Kill" value={stats.pvpKills} color="text-orange-400" subValue={`K/D: ${pvpKdRatio}`} />
                            <StatCard icon={<Flame size={20} />} label="Boss Kill" value={stats.bossKills} color="text-purple-400" />
                            <StatCard icon={<Zap size={20} />} label="En Yüksek Hasar" value={stats.highestDamage} color="text-cyan-400" />
                            <StatCard icon={<Shield size={20} />} label="Toplam Hasar" value={stats.totalDamageDealt} color="text-blue-400" />
                            <StatCard icon={<Star size={20} />} label="Kritik Vuruş" value={stats.criticalHits} color="text-yellow-400" />
                            <StatCard icon={<Heart size={20} />} label="Yetenek Kullanımı" value={stats.skillsUsed} color="text-pink-400" />
                        </div>
                    )}

                    {activeTab === 'progress' && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <StatCard icon={<Zap size={20} />} label="Kazanılan EXP" value={stats.totalExpEarned} color="text-green-400" />
                            <StatCard icon={<Coins size={20} />} label="Kazanılan Altın" value={stats.totalGoldEarned} color="text-yellow-400" />
                            <StatCard icon={<Trophy size={20} />} label="Tamamlanan Görev" value={stats.questsCompleted} color="text-purple-400" />
                            <StatCard icon={<MapPin size={20} />} label="Zindan Temizlendi" value={stats.dungeonsCleared} color="text-red-400" />
                            <StatCard icon={<Award size={20} />} label="Başarım Açıldı" value={stats.achievementsUnlocked} color="text-cyan-400" />
                            <StatCard icon={<Clock size={20} />} label="Oynama Süresi" value={formatTime(stats.totalPlayTime)} color="text-blue-400" />
                        </div>
                    )}

                    {activeTab === 'social' && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <StatCard icon={<Trophy size={20} />} label="Düello Kazanılan" value={stats.duelsWon} color="text-green-400" subValue={`%${duelWinRate} Kazanma`} />
                            <StatCard icon={<Skull size={20} />} label="Düello Kaybedilen" value={stats.duelsLost} color="text-red-400" />
                            <StatCard icon={<Users size={20} />} label="Arkadaş Eklendi" value={stats.friendsAdded} color="text-blue-400" />
                            <StatCard icon={<Users size={20} />} label="Parti Katılımı" value={stats.partiesJoined} color="text-purple-400" />
                            <StatCard icon={<Shield size={20} />} label="Lonca Katılımı" value={stats.guildsJoined} color="text-cyan-400" />
                        </div>
                    )}

                    {activeTab === 'economy' && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <StatCard icon={<Coins size={20} />} label="Toplam Altın" value={stats.totalGoldEarned} color="text-yellow-400" />
                            <StatCard icon={<Star size={20} />} label="Harcanan Gem" value={stats.gemsSpent} color="text-purple-400" />
                            <StatCard icon={<Shield size={20} />} label="Üretilen Eşya" value={stats.itemsCrafted} color="text-orange-400" />
                            <StatCard icon={<Coins size={20} />} label="Satılan Eşya" value={stats.itemsSold} color="text-green-400" />
                            <StatCard icon={<Coins size={20} />} label="Alınan Eşya" value={stats.itemsBought} color="text-red-400" />
                            <StatCard icon={<Heart size={20} />} label="İksir Kullanıldı" value={stats.potionsUsed} color="text-pink-400" />
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-800/50 border-t border-slate-700 text-center text-xs text-slate-500">
                    İlk giriş: {new Date(stats.firstLoginDate).toLocaleDateString('tr-TR')} •
                    Giriş serisi: {stats.loginStreak} gün
                </div>
            </div>
        </div>
    );
};

export default PlayerStatsView;
