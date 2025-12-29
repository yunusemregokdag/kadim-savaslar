/**
 * LeaderboardPanel.tsx
 * Günlük Sıralama Paneli
 */

import React from 'react';
import { X, Trophy, Medal, Crown } from 'lucide-react';
import { DailyPlayerStats, getDailyTopPlayers, getPlayerDailyRank, getRewardForRank } from '../../utils/dailyLeaderboard';
import { RANKS } from '../../constants';

interface LeaderboardPanelProps {
    currentPlayerId: string;
    onClose: () => void;
}

export const LeaderboardPanel: React.FC<LeaderboardPanelProps> = ({ currentPlayerId, onClose }) => {
    const topPlayers = getDailyTopPlayers(10);
    const myRank = getPlayerDailyRank(currentPlayerId);

    const getRankIcon = (position: number) => {
        switch (position) {
            case 1: return <Crown className="text-yellow-400" size={20} />;
            case 2: return <Medal className="text-slate-300" size={18} />;
            case 3: return <Medal className="text-amber-600" size={18} />;
            default: return <span className="text-slate-400 font-bold text-sm">{position}</span>;
        }
    };

    const getRowStyle = (position: number, isMe: boolean) => {
        let bg = 'bg-slate-800/50';
        if (position === 1) bg = 'bg-yellow-900/30 border-yellow-600';
        else if (position === 2) bg = 'bg-slate-700/30 border-slate-400';
        else if (position === 3) bg = 'bg-amber-900/20 border-amber-600';

        if (isMe) bg += ' ring-2 ring-blue-500';

        return bg;
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-yellow-900/50 to-amber-900/50 p-4 border-b border-slate-700/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Trophy className="text-yellow-500" size={28} />
                            <div>
                                <h2 className="text-xl font-bold text-white">Günlük Sıralama</h2>
                                <p className="text-xs text-slate-400">Her gece 00:00'da sıfırlanır</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                            <X className="text-slate-400" size={24} />
                        </button>
                    </div>
                </div>

                {/* Leaderboard List */}
                <div className="p-4 max-h-96 overflow-y-auto">
                    {topPlayers.length === 0 ? (
                        <div className="text-center py-8">
                            <Trophy className="text-slate-600 mx-auto mb-2" size={48} />
                            <p className="text-slate-400">Henüz sıralama yok</p>
                            <p className="text-xs text-slate-500">Düşman öldürerek honor kazanın!</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {topPlayers.map((player, index) => {
                                const position = index + 1;
                                const isMe = player.playerId === currentPlayerId;
                                const rank = [...RANKS].sort((a, b) => b.minRP - a.minRP).find(r => player.dailyHonor >= r.minRP) || RANKS[0];
                                const reward = getRewardForRank(position);

                                return (
                                    <div
                                        key={player.playerId}
                                        className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${getRowStyle(position, isMe)}`}
                                    >
                                        {/* Position */}
                                        <div className="w-8 flex items-center justify-center">
                                            {getRankIcon(position)}
                                        </div>

                                        {/* Player Info */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm">{rank.icon}</span>
                                                <span className={`font-bold ${isMe ? 'text-blue-400' : 'text-white'}`}>
                                                    {player.playerName}
                                                    {isMe && <span className="text-xs ml-1">(Sen)</span>}
                                                </span>
                                            </div>
                                            <div className="flex gap-3 text-xs text-slate-400">
                                                <span>⚔️ {player.dailyKills} kill</span>
                                                <span>💀 {player.dailyDeaths} death</span>
                                            </div>
                                        </div>

                                        {/* Honor */}
                                        <div className="text-right">
                                            <div className="text-yellow-500 font-bold">
                                                {formatNumber(player.dailyHonor)}
                                            </div>
                                            <div className="text-[10px] text-slate-500">Şeref</div>
                                        </div>

                                        {/* Reward Badge */}
                                        {reward && (
                                            <div className="bg-yellow-900/50 border border-yellow-600 rounded px-2 py-1">
                                                <span className="text-xs text-yellow-400">💎 {reward.diamonds}</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* My Rank Footer */}
                {myRank > 0 && myRank > 10 && (
                    <div className="p-4 border-t border-slate-700 bg-slate-800/50">
                        <div className="flex items-center justify-between">
                            <span className="text-slate-400">Senin sıran:</span>
                            <span className="text-white font-bold">#{myRank}</span>
                        </div>
                    </div>
                )}

                {/* Rewards Info */}
                <div className="p-4 border-t border-slate-700 bg-slate-900/50">
                    <h3 className="text-xs font-bold text-yellow-500 mb-2">GÜNLÜK ÖDÜLLER</h3>
                    <div className="grid grid-cols-5 gap-1 text-center text-[10px]">
                        <div className="bg-yellow-900/30 p-1 rounded">
                            <div>🥇</div>
                            <div className="text-yellow-400">200💎</div>
                        </div>
                        <div className="bg-slate-700/30 p-1 rounded">
                            <div>🥈</div>
                            <div className="text-slate-300">100💎</div>
                        </div>
                        <div className="bg-amber-900/30 p-1 rounded">
                            <div>🥉</div>
                            <div className="text-amber-500">50💎</div>
                        </div>
                        <div className="bg-slate-800/30 p-1 rounded col-span-2">
                            <div>4-10</div>
                            <div className="text-slate-400">10💎</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

function formatNumber(n: number): string {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
}

export default LeaderboardPanel;
