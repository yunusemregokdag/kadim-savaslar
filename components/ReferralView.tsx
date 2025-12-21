import React, { useState, useEffect, useMemo } from 'react';
import { PlayerState } from '../types';
import {
    Users, Gift, Copy, Check, X, Share2, Crown, Star,
    ChevronRight, Trophy, Coins, Sparkles, Link2
} from 'lucide-react';

interface ReferralReward {
    milestone: number; // Number of referrals needed
    rewards: {
        gold?: number;
        gems?: number;
        item?: string;
        title?: string;
    };
    claimed: boolean;
}

const REFERRAL_REWARDS: Omit<ReferralReward, 'claimed'>[] = [
    { milestone: 1, rewards: { gold: 500, gems: 10 } },
    { milestone: 3, rewards: { gold: 1500, gems: 30, item: 'Bronz Sandık' } },
    { milestone: 5, rewards: { gold: 3000, gems: 50, title: 'Sosyal Kelebek' } },
    { milestone: 10, rewards: { gold: 5000, gems: 100, item: 'Gümüş Sandık' } },
    { milestone: 20, rewards: { gold: 10000, gems: 200, item: 'Altın Sandık' } },
    { milestone: 50, rewards: { gold: 25000, gems: 500, title: 'Avcı Lider', item: 'Efsanevi Sandık' } },
];

// Bonus for both referrer and referee
const NEW_USER_BONUS = {
    gold: 200,
    gems: 5,
};

interface ReferralViewProps {
    playerState: PlayerState;
    onClose: () => void;
    onClaimReward: (rewards: { gold?: number; gems?: number; item?: string; title?: string }) => void;
}

export const ReferralView: React.FC<ReferralViewProps> = ({ playerState, onClose, onClaimReward }) => {
    const [referralCode, setReferralCode] = useState<string>('');
    const [referredUsers, setReferredUsers] = useState<{ name: string; date: string; level: number }[]>([]);
    const [claimedMilestones, setClaimedMilestones] = useState<number[]>([]);
    const [inputCode, setInputCode] = useState('');
    const [codeUsed, setCodeUsed] = useState(false);
    const [copied, setCopied] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Generate/load referral code
    useEffect(() => {
        const savedCode = localStorage.getItem('myReferralCode');
        if (savedCode) {
            setReferralCode(savedCode);
        } else {
            const newCode = `KS-${playerState.nickname.substring(0, 4).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
            setReferralCode(newCode);
            localStorage.setItem('myReferralCode', newCode);
        }

        // Load referred users
        const savedReferrals = localStorage.getItem('referredUsers');
        if (savedReferrals) {
            setReferredUsers(JSON.parse(savedReferrals));
        }

        // Load claimed milestones
        const savedClaimed = localStorage.getItem('claimedReferralMilestones');
        if (savedClaimed) {
            setClaimedMilestones(JSON.parse(savedClaimed));
        }

        // Check if already used a code
        setCodeUsed(localStorage.getItem('usedReferralCode') !== null);
    }, [playerState.nickname]);

    // Save state
    useEffect(() => {
        if (referredUsers.length > 0) {
            localStorage.setItem('referredUsers', JSON.stringify(referredUsers));
        }
        if (claimedMilestones.length > 0) {
            localStorage.setItem('claimedReferralMilestones', JSON.stringify(claimedMilestones));
        }
    }, [referredUsers, claimedMilestones]);

    const totalReferrals = referredUsers.length;

    const handleCopyCode = () => {
        navigator.clipboard.writeText(referralCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleUseCode = () => {
        if (!inputCode.trim()) {
            setMessage({ type: 'error', text: 'Lütfen bir kod girin' });
            return;
        }

        if (inputCode.toUpperCase() === referralCode) {
            setMessage({ type: 'error', text: 'Kendi kodunuzu kullanamazsınız!' });
            return;
        }

        if (codeUsed) {
            setMessage({ type: 'error', text: 'Zaten bir davet kodu kullandınız!' });
            return;
        }

        // Mark as used
        localStorage.setItem('usedReferralCode', inputCode.toUpperCase());
        setCodeUsed(true);

        // Give bonus to this user
        onClaimReward(NEW_USER_BONUS);

        setMessage({ type: 'success', text: `Kod kullanıldı! ${NEW_USER_BONUS.gold} Altın ve ${NEW_USER_BONUS.gems} Gem kazandınız!` });
        setInputCode('');

        // Simulate the referrer getting credit (in real app this would be server-side)
        // For demo, we add a fake referral
    };

    const handleClaimMilestone = (milestone: number, rewards: any) => {
        if (claimedMilestones.includes(milestone)) return;
        if (totalReferrals < milestone) return;

        setClaimedMilestones(prev => [...prev, milestone]);
        onClaimReward(rewards);
        setMessage({ type: 'success', text: `Ödül alındı! ${rewards.gold ? rewards.gold + ' Altın' : ''} ${rewards.gems ? rewards.gems + ' Gem' : ''}` });
    };

    // For demo: add fake referrals
    const addDemoReferral = () => {
        const names = ['Kahraman123', 'SavaşLordu', 'EjderhaAvcı', 'GölgeNinja', 'BuzKral'];
        const randomName = names[Math.floor(Math.random() * names.length)] + Math.floor(Math.random() * 100);
        setReferredUsers(prev => [...prev, {
            name: randomName,
            date: new Date().toISOString(),
            level: Math.floor(Math.random() * 20) + 1
        }]);
    };

    const shareUrl = `https://kadimsavaslar.com/register?ref=${referralCode}`;

    return (
        <div className="fixed inset-0 z-[90] bg-black/80 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-900 to-purple-900 p-6 border-b border-blue-700">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                <Users size={28} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">Arkadaş Davet</h2>
                                <p className="text-blue-200 text-sm">Arkadaşlarını davet et, birlikte kazan!</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
                            <X size={24} className="text-white" />
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="mt-4 grid grid-cols-3 gap-4">
                        <div className="bg-black/30 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-cyan-400">{totalReferrals}</div>
                            <div className="text-xs text-slate-400">Davet Edildi</div>
                        </div>
                        <div className="bg-black/30 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-green-400">{claimedMilestones.length}</div>
                            <div className="text-xs text-slate-400">Ödül Alındı</div>
                        </div>
                        <div className="bg-black/30 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-yellow-400">{REFERRAL_REWARDS.length - claimedMilestones.length}</div>
                            <div className="text-xs text-slate-400">Bekleyen Ödül</div>
                        </div>
                    </div>
                </div>

                {/* Message */}
                {message && (
                    <div className={`p-3 text-sm flex justify-between items-center ${message.type === 'success' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'
                        }`}>
                        <span>{message.text}</span>
                        <button onClick={() => setMessage(null)}><X size={14} /></button>
                    </div>
                )}

                <div className="p-6 overflow-y-auto max-h-[50vh]">
                    {/* Referral Code Section */}
                    <div className="mb-6">
                        <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                            <Share2 size={18} className="text-blue-400" />
                            Senin Davet Kodun
                        </h3>
                        <div className="flex gap-2">
                            <div className="flex-1 bg-slate-800 border border-slate-600 rounded-lg p-3 font-mono text-lg text-cyan-400 text-center">
                                {referralCode}
                            </div>
                            <button
                                onClick={handleCopyCode}
                                className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors ${copied ? 'bg-green-600 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'
                                    }`}
                            >
                                {copied ? <Check size={18} /> : <Copy size={18} />}
                                {copied ? 'Kopyalandı!' : 'Kopyala'}
                            </button>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                            Bu kodu arkadaşlarınla paylaş. Kayıt olduklarında ikisi de ödül kazansın!
                        </p>
                    </div>

                    {/* Use a Code Section */}
                    {!codeUsed && (
                        <div className="mb-6">
                            <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                                <Gift size={18} className="text-purple-400" />
                                Davet Kodu Kullan
                            </h3>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={inputCode}
                                    onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                                    placeholder="KS-XXXX-XXXX"
                                    className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                                />
                                <button
                                    onClick={handleUseCode}
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg"
                                >
                                    Kullan
                                </button>
                            </div>
                            <p className="text-xs text-slate-500 mt-2">
                                Bir arkadaşının kodunu girerek {NEW_USER_BONUS.gold} Altın ve {NEW_USER_BONUS.gems} Gem kazan!
                            </p>
                        </div>
                    )}

                    {/* Milestone Rewards */}
                    <div className="mb-6">
                        <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                            <Trophy size={18} className="text-yellow-400" />
                            Davet Ödülleri
                        </h3>
                        <div className="space-y-2">
                            {REFERRAL_REWARDS.map(reward => {
                                const isUnlocked = totalReferrals >= reward.milestone;
                                const isClaimed = claimedMilestones.includes(reward.milestone);

                                return (
                                    <div
                                        key={reward.milestone}
                                        className={`p-3 rounded-lg border flex items-center justify-between ${isClaimed
                                                ? 'bg-green-900/20 border-green-700'
                                                : isUnlocked
                                                    ? 'bg-yellow-900/20 border-yellow-600 animate-pulse'
                                                    : 'bg-slate-800/50 border-slate-700'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${isClaimed ? 'bg-green-600 text-white' :
                                                    isUnlocked ? 'bg-yellow-600 text-black' :
                                                        'bg-slate-700 text-slate-400'
                                                }`}>
                                                {reward.milestone}
                                            </div>
                                            <div>
                                                <div className="text-white font-medium text-sm">{reward.milestone} Davet</div>
                                                <div className="flex gap-2 text-xs text-slate-400">
                                                    {reward.rewards.gold && <span className="text-yellow-400">{reward.rewards.gold} Altın</span>}
                                                    {reward.rewards.gems && <span className="text-purple-400">{reward.rewards.gems} Gem</span>}
                                                    {reward.rewards.item && <span className="text-orange-400">{reward.rewards.item}</span>}
                                                    {reward.rewards.title && <span className="text-cyan-400">"{reward.rewards.title}"</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            {isClaimed ? (
                                                <span className="text-green-400 text-xs font-bold flex items-center gap-1">
                                                    <Check size={14} /> Alındı
                                                </span>
                                            ) : isUnlocked ? (
                                                <button
                                                    onClick={() => handleClaimMilestone(reward.milestone, reward.rewards)}
                                                    className="px-3 py-1 bg-yellow-600 hover:bg-yellow-500 text-black font-bold text-xs rounded"
                                                >
                                                    AL
                                                </button>
                                            ) : (
                                                <span className="text-slate-500 text-xs">{totalReferrals}/{reward.milestone}</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Referred Users List */}
                    <div>
                        <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                            <Users size={18} className="text-green-400" />
                            Davet Ettiğin Oyuncular ({totalReferrals})
                        </h3>
                        {referredUsers.length === 0 ? (
                            <div className="text-center py-8 text-slate-500">
                                Henüz kimseyi davet etmedin
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                {referredUsers.map((user, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-xs font-bold text-white">
                                                {user.name[0]}
                                            </div>
                                            <span className="text-white text-sm">{user.name}</span>
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            Lv.{user.level}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer - Demo button */}
                <div className="p-4 bg-slate-800/50 border-t border-slate-700 flex justify-between items-center">
                    <div className="text-xs text-slate-500">
                        Her davet için sen ve arkadaşın ödül kazanır!
                    </div>
                    <button
                        onClick={addDemoReferral}
                        className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs rounded"
                    >
                        + Demo Davet Ekle
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReferralView;
