import React, { useState, useEffect } from 'react';
import {
    Skull, Clock, MapPin, AlertTriangle, X, ChevronDown, ChevronUp,
    Flame, Snowflake, Zap, Wind, Shield, Crown
} from 'lucide-react';

interface WorldBoss {
    id: string;
    name: string;
    zoneId: number;
    zoneName: string;
    level: number;
    respawnMinutes: number; // Minutes between spawns
    lastKillTime?: number; // Timestamp
    element: 'fire' | 'ice' | 'lightning' | 'wind' | 'dark' | 'holy';
    rewards: string[];
    difficulty: 1 | 2 | 3 | 4 | 5;
}

const WORLD_BOSSES: WorldBoss[] = [
    {
        id: 'boss_fire_dragon',
        name: 'Ateş Ejderhası',
        zoneId: 3,
        zoneName: 'Yanardağ Vadisi',
        level: 15,
        respawnMinutes: 30,
        element: 'fire',
        rewards: ['T3 Silah', '5000 Altın', '50 Gem'],
        difficulty: 3,
    },
    {
        id: 'boss_ice_titan',
        name: 'Buz Titanı',
        zoneId: 5,
        zoneName: 'Donmuş Göller',
        level: 20,
        respawnMinutes: 45,
        element: 'ice',
        rewards: ['T4 Zırh', '10000 Altın', '100 Gem'],
        difficulty: 4,
    },
    {
        id: 'boss_storm_lord',
        name: 'Fırtına Lordu',
        zoneId: 7,
        zoneName: 'Gök Kulesi',
        level: 25,
        respawnMinutes: 60,
        element: 'lightning',
        rewards: ['T4 Silah', '15000 Altın', '150 Gem'],
        difficulty: 4,
    },
    {
        id: 'boss_shadow_king',
        name: 'Karanlık Kral',
        zoneId: 8,
        zoneName: 'Uçurum Mağarası',
        level: 28,
        respawnMinutes: 90,
        element: 'dark',
        rewards: ['T5 Set Parçası', '25000 Altın', '250 Gem'],
        difficulty: 5,
    },
    {
        id: 'boss_ancient_guardian',
        name: 'Kadim Koruyucu',
        zoneId: 10,
        zoneName: 'Antik Tapınak',
        level: 30,
        respawnMinutes: 120,
        element: 'holy',
        rewards: ['Efsanevi Kutu', '50000 Altın', '500 Gem'],
        difficulty: 5,
    },
];

interface BossTimerViewProps {
    onClose: () => void;
    playerLevel: number;
    onNavigate?: (zoneId: number) => void;
}

export const BossTimerView: React.FC<BossTimerViewProps> = ({ onClose, playerLevel, onNavigate }) => {
    const [bossKillTimes, setBossKillTimes] = useState<Record<string, number>>(() => {
        const saved = localStorage.getItem('bossKillTimes');
        return saved ? JSON.parse(saved) : {};
    });
    const [now, setNow] = useState(Date.now());
    const [expandedBoss, setExpandedBoss] = useState<string | null>(null);

    // Update timer every second
    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(interval);
    }, []);

    // Save kill times
    useEffect(() => {
        localStorage.setItem('bossKillTimes', JSON.stringify(bossKillTimes));
    }, [bossKillTimes]);

    const getElementIcon = (element: string) => {
        switch (element) {
            case 'fire': return <Flame className="text-orange-500" size={18} />;
            case 'ice': return <Snowflake className="text-cyan-400" size={18} />;
            case 'lightning': return <Zap className="text-yellow-400" size={18} />;
            case 'wind': return <Wind className="text-green-400" size={18} />;
            case 'dark': return <Skull className="text-purple-400" size={18} />;
            case 'holy': return <Crown className="text-yellow-300" size={18} />;
            default: return <Skull size={18} />;
        }
    };

    const getElementColor = (element: string) => {
        switch (element) {
            case 'fire': return 'from-orange-900/50 to-red-900/50 border-orange-700';
            case 'ice': return 'from-cyan-900/50 to-blue-900/50 border-cyan-700';
            case 'lightning': return 'from-yellow-900/50 to-amber-900/50 border-yellow-700';
            case 'wind': return 'from-green-900/50 to-emerald-900/50 border-green-700';
            case 'dark': return 'from-purple-900/50 to-violet-900/50 border-purple-700';
            case 'holy': return 'from-yellow-900/50 to-orange-900/50 border-yellow-600';
            default: return 'from-slate-800 to-slate-900 border-slate-700';
        }
    };

    const getBossStatus = (boss: WorldBoss) => {
        const lastKill = bossKillTimes[boss.id];
        if (!lastKill) {
            // Never killed or unknown - assume spawned
            return { status: 'spawned', timeLeft: 0 };
        }

        const respawnTime = lastKill + (boss.respawnMinutes * 60 * 1000);
        const timeLeft = respawnTime - now;

        if (timeLeft <= 0) {
            return { status: 'spawned', timeLeft: 0 };
        } else if (timeLeft <= 5 * 60 * 1000) { // 5 minutes
            return { status: 'soon', timeLeft };
        } else {
            return { status: 'respawning', timeLeft };
        }
    };

    const formatTimeLeft = (ms: number): string => {
        if (ms <= 0) return 'ŞİMDİ!';
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        if (hours > 0) return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        return `${minutes}:${String(seconds).padStart(2, '0')}`;
    };

    const markAsKilled = (bossId: string) => {
        setBossKillTimes(prev => ({ ...prev, [bossId]: Date.now() }));
    };

    const resetTimer = (bossId: string) => {
        setBossKillTimes(prev => {
            const newTimes = { ...prev };
            delete newTimes[bossId];
            return newTimes;
        });
    };

    // Sort bosses: spawned first, then by time left
    const sortedBosses = [...WORLD_BOSSES].sort((a, b) => {
        const statusA = getBossStatus(a);
        const statusB = getBossStatus(b);
        if (statusA.status === 'spawned' && statusB.status !== 'spawned') return -1;
        if (statusB.status === 'spawned' && statusA.status !== 'spawned') return 1;
        return statusA.timeLeft - statusB.timeLeft;
    });

    return (
        <div className="fixed inset-0 z-[90] bg-black/80 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="bg-gradient-to-r from-red-900 to-orange-900 p-6 border-b border-red-700">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-red-600 to-orange-600 rounded-xl flex items-center justify-center shadow-lg animate-pulse">
                                <Skull size={28} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">Boss Zamanlayıcı</h2>
                                <p className="text-red-200 text-sm">Dünya bosslarını takip et</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
                            <X size={24} className="text-white" />
                        </button>
                    </div>
                </div>

                {/* Boss List */}
                <div className="p-4 overflow-y-auto max-h-[60vh] space-y-3">
                    {sortedBosses.map(boss => {
                        const { status, timeLeft } = getBossStatus(boss);
                        const isExpanded = expandedBoss === boss.id;
                        const canFight = playerLevel >= boss.level - 5;

                        return (
                            <div
                                key={boss.id}
                                className={`bg-gradient-to-r ${getElementColor(boss.element)} border rounded-xl overflow-hidden transition-all`}
                            >
                                {/* Main Row */}
                                <div
                                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5"
                                    onClick={() => setExpandedBoss(isExpanded ? null : boss.id)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-black/40 rounded-lg flex items-center justify-center">
                                            {getElementIcon(boss.element)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-white flex items-center gap-2">
                                                {boss.name}
                                                <span className="text-xs px-2 py-0.5 bg-black/40 rounded text-slate-300">
                                                    Lv.{boss.level}
                                                </span>
                                            </div>
                                            <div className="text-xs text-slate-400 flex items-center gap-1">
                                                <MapPin size={12} />
                                                {boss.zoneName}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        {/* Status */}
                                        <div className={`text-right ${status === 'spawned' ? 'text-green-400' :
                                                status === 'soon' ? 'text-yellow-400' : 'text-slate-400'
                                            }`}>
                                            <div className="text-xs uppercase">
                                                {status === 'spawned' ? 'AKTİF' :
                                                    status === 'soon' ? 'YAKINDA' : 'BEKLEME'}
                                            </div>
                                            <div className="font-mono font-bold text-lg">
                                                {status === 'spawned' ? (
                                                    <span className="animate-pulse">⚔️ ŞİMDİ!</span>
                                                ) : (
                                                    formatTimeLeft(timeLeft)
                                                )}
                                            </div>
                                        </div>
                                        {isExpanded ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {isExpanded && (
                                    <div className="px-4 pb-4 border-t border-white/10 pt-4">
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            {/* Difficulty */}
                                            <div>
                                                <div className="text-xs text-slate-400 mb-1">Zorluk</div>
                                                <div className="flex gap-1">
                                                    {[1, 2, 3, 4, 5].map(d => (
                                                        <Skull
                                                            key={d}
                                                            size={16}
                                                            className={d <= boss.difficulty ? 'text-red-500' : 'text-slate-700'}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            {/* Respawn Time */}
                                            <div>
                                                <div className="text-xs text-slate-400 mb-1">Yeniden Doğma</div>
                                                <div className="text-white font-bold">{boss.respawnMinutes} dakika</div>
                                            </div>
                                        </div>

                                        {/* Rewards */}
                                        <div className="mb-4">
                                            <div className="text-xs text-slate-400 mb-2">Ödüller</div>
                                            <div className="flex flex-wrap gap-2">
                                                {boss.rewards.map((reward, idx) => (
                                                    <span key={idx} className="px-2 py-1 bg-black/40 rounded text-xs text-yellow-400">
                                                        {reward}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Level Warning */}
                                        {!canFight && (
                                            <div className="flex items-center gap-2 text-yellow-500 text-xs mb-4 bg-yellow-900/20 p-2 rounded">
                                                <AlertTriangle size={14} />
                                                Önerilen seviye: {boss.level - 5}+
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            {status === 'spawned' ? (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); markAsKilled(boss.id); }}
                                                    className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-sm"
                                                >
                                                    ☠️ Öldürüldü Olarak İşaretle
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); resetTimer(boss.id); }}
                                                    className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg text-sm"
                                                >
                                                    🔄 Zamanlayıcıyı Sıfırla
                                                </button>
                                            )}
                                            {onNavigate && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onNavigate(boss.zoneId); onClose(); }}
                                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-sm"
                                                >
                                                    🗺️ Git
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-800/50 border-t border-slate-700 text-center text-xs text-slate-500">
                    Zamanlayıcılar tahminidir. Gerçek spawn süreleri değişebilir.
                </div>
            </div>
        </div>
    );
};

export default BossTimerView;
