import React, { useState, useEffect } from 'react';
import { PlayerState } from '../types';
import {
    Calendar, Star, Coins, Sparkles, Check, Gift,
    RefreshCw, Clock, Award, X, Skull, Sword, Users, Hammer, ShoppingBag
} from 'lucide-react';

// MOCK Daily Quests (works offline)
interface DailyQuest {
    questId: string;
    type: string;
    name: string;
    description: string;
    targetAmount: number;
    currentAmount: number;
    completed: boolean;
    claimed: boolean;
    rewards: {
        gold?: number;
        exp?: number;
        gems?: number;
    };
}

// Default daily quests template
const DAILY_QUEST_TEMPLATES: Omit<DailyQuest, 'currentAmount' | 'completed' | 'claimed'>[] = [
    {
        questId: 'dq_kill_mobs',
        type: 'kill_mobs',
        name: 'Canavar Avcısı',
        description: '20 düşman öldür',
        targetAmount: 20,
        rewards: { gold: 500, exp: 200 }
    },
    {
        questId: 'dq_use_skills',
        type: 'use_skills',
        name: 'Yetenek Ustası',
        description: '15 yetenek kullan',
        targetAmount: 15,
        rewards: { gold: 300, exp: 150 }
    },
    {
        questId: 'dq_collect_gold',
        type: 'collect_gold',
        name: 'Altın Toplayıcı',
        description: '1000 altın topla',
        targetAmount: 1000,
        rewards: { exp: 300, gems: 5 }
    },
    {
        questId: 'dq_craft_item',
        type: 'craft_item',
        name: 'Zanaatkar',
        description: '3 eşya üret',
        targetAmount: 3,
        rewards: { gold: 400, exp: 100 }
    },
    {
        questId: 'dq_buy_item',
        type: 'buy_item',
        name: 'Alışverişçi',
        description: '5 eşya satın al',
        targetAmount: 5,
        rewards: { gold: 200, exp: 100, gems: 2 }
    },
    {
        questId: 'dq_boss_kill',
        type: 'boss_kill',
        name: 'Boss Katili',
        description: '1 boss öldür',
        targetAmount: 1,
        rewards: { gold: 1000, exp: 500, gems: 10 }
    }
];

const BONUS_REWARD = { gold: 2000, exp: 1000, gems: 20 };

interface DailyQuestViewProps {
    playerState: PlayerState;
    onClose: () => void;
    onClaimReward?: (rewards: { gold?: number; exp?: number; gems?: number }) => void;
}

const STORAGE_KEY = 'kadim_daily_quests';
const STORAGE_DATE_KEY = 'kadim_daily_quests_date';

export const DailyQuestView: React.FC<DailyQuestViewProps> = ({
    playerState,
    onClose,
    onClaimReward
}) => {
    const [quests, setQuests] = useState<DailyQuest[]>([]);
    const [bonusClaimed, setBonusClaimed] = useState(false);
    const [claimingId, setClaimingId] = useState<string | null>(null);

    // Initialize quests from localStorage or create new ones
    useEffect(() => {
        const today = new Date().toDateString();
        const savedDate = localStorage.getItem(STORAGE_DATE_KEY);

        if (savedDate === today) {
            // Load existing quests
            const savedQuests = localStorage.getItem(STORAGE_KEY);
            if (savedQuests) {
                const parsed = JSON.parse(savedQuests);
                setQuests(parsed.quests || []);
                setBonusClaimed(parsed.bonusClaimed || false);
                return;
            }
        }

        // Reset for new day
        const newQuests: DailyQuest[] = DAILY_QUEST_TEMPLATES.map(template => ({
            ...template,
            currentAmount: Math.floor(Math.random() * template.targetAmount * 0.5), // Random starting progress
            completed: false,
            claimed: false
        }));

        // Set some quests as already partially completed (simulating gameplay)
        newQuests.forEach(q => {
            if (Math.random() > 0.5) {
                q.currentAmount = Math.min(q.targetAmount, Math.floor(Math.random() * q.targetAmount));
            }
            q.completed = q.currentAmount >= q.targetAmount;
        });

        setQuests(newQuests);
        setBonusClaimed(false);
        localStorage.setItem(STORAGE_DATE_KEY, today);
        saveQuests(newQuests, false);
    }, []);

    const saveQuests = (questsToSave: DailyQuest[], bonusClaimedVal: boolean) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ quests: questsToSave, bonusClaimed: bonusClaimedVal }));
    };

    const handleClaimReward = (questId: string) => {
        setClaimingId(questId);

        setTimeout(() => {
            const quest = quests.find(q => q.questId === questId);
            if (quest && quest.completed && !quest.claimed) {
                const updatedQuests = quests.map(q =>
                    q.questId === questId ? { ...q, claimed: true } : q
                );
                setQuests(updatedQuests);
                saveQuests(updatedQuests, bonusClaimed);

                // Trigger reward callback
                if (onClaimReward && quest.rewards) {
                    onClaimReward(quest.rewards);
                }
            }
            setClaimingId(null);
        }, 500);
    };

    const handleClaimBonus = () => {
        const allClaimed = quests.every(q => q.claimed);
        if (allClaimed && !bonusClaimed) {
            setBonusClaimed(true);
            saveQuests(quests, true);

            if (onClaimReward) {
                onClaimReward(BONUS_REWARD);
            }
        }
    };

    // Simulate progress update (for demo purposes)
    const simulateProgress = (questId: string) => {
        const updatedQuests = quests.map(q => {
            if (q.questId === questId && !q.completed) {
                const newAmount = Math.min(q.targetAmount, q.currentAmount + 1);
                return {
                    ...q,
                    currentAmount: newAmount,
                    completed: newAmount >= q.targetAmount
                };
            }
            return q;
        });
        setQuests(updatedQuests);
        saveQuests(updatedQuests, bonusClaimed);
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'kill_mobs': return <Skull size={24} className="text-red-400" />;
            case 'use_skills': return <Sparkles size={24} className="text-purple-400" />;
            case 'collect_gold': return <Coins size={24} className="text-yellow-400" />;
            case 'craft_item': return <Hammer size={24} className="text-orange-400" />;
            case 'buy_item': return <ShoppingBag size={24} className="text-green-400" />;
            case 'boss_kill': return <Sword size={24} className="text-red-600" />;
            case 'join_party': return <Users size={24} className="text-blue-400" />;
            default: return <Star size={24} className="text-slate-400" />;
        }
    };

    const getProgressPercent = (quest: DailyQuest) => {
        return Math.min(100, (quest.currentAmount / quest.targetAmount) * 100);
    };

    // Calculate time until reset (midnight)
    const getTimeUntilReset = () => {
        const now = new Date();
        const midnight = new Date(now);
        midnight.setHours(24, 0, 0, 0);
        const diff = midnight.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}:${String(minutes).padStart(2, '0')}`;
    };

    const claimedCount = quests.filter(q => q.claimed).length;
    const completedCount = quests.filter(q => q.completed).length;
    const allClaimed = quests.length > 0 && quests.every(q => q.claimed);

    return (
        <div className="fixed inset-0 z-[80] bg-black/80 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-900/40 to-amber-900/40 p-4 border-b border-slate-700">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                                <Calendar className="text-white" size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Günlük Görevler</h2>
                                <div className="flex items-center gap-2 text-sm text-slate-400">
                                    <Clock size={14} />
                                    <span>Sıfırlanmaya {getTimeUntilReset()} kaldı</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                            <X size={24} className="text-slate-400" />
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-slate-400">Tamamlanan: {claimedCount}/{quests.length}</span>
                            {allClaimed && !bonusClaimed && (
                                <span className="text-yellow-400 animate-pulse font-bold">🎁 Bonus Hazır!</span>
                            )}
                        </div>
                        <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500"
                                style={{ width: `${(claimedCount / Math.max(1, quests.length)) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Quest List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {quests.map(quest => (
                        <div
                            key={quest.questId}
                            className={`rounded-xl p-4 border transition-all ${quest.claimed
                                ? 'bg-emerald-900/20 border-emerald-700/50'
                                : quest.completed
                                    ? 'bg-yellow-900/20 border-yellow-700/50 shadow-lg shadow-yellow-900/20'
                                    : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                                }`}
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-lg bg-black/40 flex items-center justify-center border border-slate-700">
                                    {getTypeIcon(quest.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-white">{quest.name}</h3>
                                        {quest.claimed && (
                                            <div className="bg-emerald-600/30 px-2 py-0.5 rounded text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                                                <Check size={10} /> Alındı
                                            </div>
                                        )}
                                        {quest.completed && !quest.claimed && (
                                            <div className="bg-yellow-600/30 px-2 py-0.5 rounded text-[10px] text-yellow-400 font-bold animate-pulse">
                                                TAMAMLANDI!
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-400 mb-3">{quest.description}</p>

                                    {/* Progress */}
                                    <div className="mb-3">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-slate-400">İlerleme</span>
                                            <span className={quest.completed ? 'text-emerald-400 font-bold' : 'text-white'}>
                                                {quest.currentAmount}/{quest.targetAmount}
                                            </span>
                                        </div>
                                        <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-300 ${quest.completed
                                                    ? 'bg-gradient-to-r from-emerald-500 to-green-500'
                                                    : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                                                    }`}
                                                style={{ width: `${getProgressPercent(quest)}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Rewards & Actions */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 text-sm">
                                            {quest.rewards.gold && (
                                                <span className="flex items-center gap-1 text-yellow-400 bg-yellow-900/20 px-2 py-1 rounded">
                                                    <Coins size={14} />
                                                    {quest.rewards.gold}
                                                </span>
                                            )}
                                            {quest.rewards.exp && (
                                                <span className="flex items-center gap-1 text-green-400 bg-green-900/20 px-2 py-1 rounded">
                                                    <Star size={14} />
                                                    {quest.rewards.exp}
                                                </span>
                                            )}
                                            {quest.rewards.gems && (
                                                <span className="flex items-center gap-1 text-purple-400 bg-purple-900/20 px-2 py-1 rounded">
                                                    <Sparkles size={14} />
                                                    {quest.rewards.gems}
                                                </span>
                                            )}
                                        </div>

                                        {/* Claim Button */}
                                        {quest.completed && !quest.claimed && (
                                            <button
                                                onClick={() => handleClaimReward(quest.questId)}
                                                disabled={claimingId === quest.questId}
                                                className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-white text-sm font-bold rounded-lg flex items-center gap-2 shadow-lg transition-all hover:scale-105 disabled:opacity-50"
                                            >
                                                {claimingId === quest.questId ? (
                                                    <RefreshCw size={14} className="animate-spin" />
                                                ) : (
                                                    <Gift size={14} />
                                                )}
                                                Ödülü Al
                                            </button>
                                        )}

                                        {/* Test: Simulate progress button (only for incomplete) */}
                                        {!quest.completed && (
                                            <button
                                                onClick={() => simulateProgress(quest.questId)}
                                                className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs rounded transition-colors"
                                            >
                                                +1 İlerleme
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bonus Reward Section */}
                <div className={`p-4 border-t ${allClaimed ? 'bg-gradient-to-r from-yellow-900/30 to-amber-900/30 border-yellow-700/50' : 'bg-slate-800/50 border-slate-700'}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${allClaimed && !bonusClaimed ? 'bg-yellow-500 animate-pulse shadow-lg shadow-yellow-500/50' : bonusClaimed ? 'bg-emerald-600' : 'bg-slate-700'}`}>
                                <Award className={allClaimed || bonusClaimed ? 'text-white' : 'text-slate-500'} size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-white">Günlük Bonus</h4>
                                <p className="text-xs text-slate-400">Tüm görevleri tamamla ve ödül al!</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3 text-sm">
                                <span className="flex items-center gap-1 text-yellow-400">
                                    <Coins size={14} />
                                    {BONUS_REWARD.gold}
                                </span>
                                <span className="flex items-center gap-1 text-green-400">
                                    <Star size={14} />
                                    {BONUS_REWARD.exp}
                                </span>
                                <span className="flex items-center gap-1 text-purple-400">
                                    <Sparkles size={14} />
                                    {BONUS_REWARD.gems}
                                </span>
                            </div>

                            {bonusClaimed ? (
                                <div className="px-4 py-2 bg-emerald-600/30 text-emerald-400 font-bold rounded-lg flex items-center gap-2">
                                    <Check size={16} />
                                    Alındı
                                </div>
                            ) : (
                                <button
                                    onClick={handleClaimBonus}
                                    disabled={!allClaimed}
                                    className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-bold rounded-lg flex items-center gap-2 shadow-lg transition-all hover:scale-105"
                                >
                                    <Gift size={16} />
                                    <span>Bonus Al</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DailyQuestView;
