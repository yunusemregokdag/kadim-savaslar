import React from 'react';
import { Gift, Check, Lock, Calendar, Gem, Coins, Star, Sparkles } from 'lucide-react';
import { DailyLoginState, DailyLoginReward, Item } from '../types';
import { v4 as uuidv4 } from 'uuid';

// 7-Day Login Reward Cycle (Repeats)
const DAILY_REWARDS: DailyLoginReward[] = [
    { day: 1, gold: 500, exp: 100 },
    { day: 2, gold: 1000, gems: 5 },
    { day: 3, gold: 1500, exp: 250, honor: 50 },
    { day: 4, gold: 2000, gems: 10 },
    { day: 5, gold: 3000, exp: 500, item: { id: uuidv4(), name: 'Büyük Can İksiri x5', type: 'consumable', tier: 2, rarity: 'uncommon', value: 100 } },
    { day: 6, gold: 5000, gems: 25, honor: 100 },
    { day: 7, gold: 10000, gems: 50, exp: 1000, item: { id: uuidv4(), name: 'Haftalık Ödül Sandığı', type: 'material', tier: 3, rarity: 'rare', value: 500 } },
];

interface DailyLoginModalProps {
    dailyLogin: DailyLoginState;
    onClaim: (reward: DailyLoginReward) => void;
    onClose: () => void;
}

export const DailyLoginModal: React.FC<DailyLoginModalProps> = ({ dailyLogin, onClaim, onClose }) => {
    const today = new Date().toISOString().split('T')[0];
    const canClaim = !dailyLogin.claimedToday && dailyLogin.lastLoginDate !== today;
    const currentDay = (dailyLogin.consecutiveDays % 7) + 1;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-yellow-600/50 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-yellow-900/50 to-orange-900/50 p-6 border-b border-yellow-700/30">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                                <Calendar className="text-yellow-400" size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-yellow-400">Günlük Giriş Ödülleri</h2>
                                <p className="text-sm text-yellow-200/60">Art arda {dailyLogin.consecutiveDays} gündür oynuyorsun!</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                            <span className="text-2xl text-slate-400">×</span>
                        </button>
                    </div>
                </div>

                {/* Reward Grid */}
                <div className="p-6">
                    <div className="grid grid-cols-7 gap-3">
                        {DAILY_REWARDS.map((reward, idx) => {
                            const dayNum = idx + 1;
                            const isCurrent = dayNum === currentDay;
                            // A day is claimed ONLY if it's before the current day we're on
                            // If claimedToday is true, the current day is also considered claimed
                            const isClaimed = dayNum < currentDay || (dayNum === currentDay && dailyLogin.claimedToday);
                            const isLocked = dayNum > currentDay;

                            return (
                                <div
                                    key={dayNum}
                                    className={`relative p-3 rounded-xl border-2 flex flex-col items-center transition-all ${isCurrent && !dailyLogin.claimedToday
                                        ? 'bg-yellow-900/30 border-yellow-500 animate-pulse shadow-[0_0_20px_rgba(234,179,8,0.3)]'
                                        : isClaimed
                                            ? 'bg-green-900/20 border-green-700/50'
                                            : 'bg-slate-800/50 border-slate-700/50'
                                        }`}
                                >
                                    <span className="text-xs font-bold text-slate-400 mb-2">GÜN {dayNum}</span>

                                    <div className="w-10 h-10 rounded-lg bg-black/40 flex items-center justify-center mb-2">
                                        {isClaimed ? (
                                            <Check className="text-green-400" size={20} />
                                        ) : isLocked ? (
                                            <Lock className="text-slate-500" size={16} />
                                        ) : reward.gems ? (
                                            <Gem className="text-purple-400" size={18} />
                                        ) : reward.item ? (
                                            <Gift className="text-orange-400" size={18} />
                                        ) : (
                                            <Coins className="text-yellow-400" size={18} />
                                        )}
                                    </div>

                                    <div className="text-center text-[10px] space-y-0.5">
                                        {reward.gold && <div className="text-yellow-400">{reward.gold} Altın</div>}
                                        {reward.gems && <div className="text-purple-400">{reward.gems} Elmas</div>}
                                        {reward.exp && <div className="text-blue-400">{reward.exp} XP</div>}
                                        {reward.item && <div className="text-orange-400 truncate">{reward.item.name.split(' ')[0]}</div>}
                                    </div>

                                    {dayNum === 7 && (
                                        <div className="absolute -top-2 -right-2">
                                            <Star className="text-yellow-400 fill-yellow-400" size={16} />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Claim Button */}
                    <div className="mt-6">
                        {canClaim ? (
                            <button
                                onClick={() => onClaim(DAILY_REWARDS[currentDay - 1])}
                                className="w-full py-4 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl font-bold text-white text-lg shadow-lg hover:from-yellow-500 hover:to-orange-500 active:scale-95 transition-all flex items-center justify-center gap-3"
                            >
                                <Sparkles className="animate-pulse" />
                                GÜN {currentDay} ÖDÜLÜNÜ AL!
                            </button>
                        ) : (
                            <div className="w-full py-4 bg-slate-800 rounded-xl text-center text-slate-500">
                                ✓ Bugünkü ödülünü aldın! Yarın tekrar gel.
                            </div>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="mt-4 flex justify-center gap-8 text-sm text-slate-400">
                        <div>Toplam Giriş: <span className="text-white font-bold">{dailyLogin.totalLogins}</span></div>
                        <div>Art Arda: <span className="text-yellow-400 font-bold">{dailyLogin.consecutiveDays} gün</span></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DailyLoginModal;
