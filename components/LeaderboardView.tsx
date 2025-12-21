import React, { useState, useEffect } from 'react';
import { Crown, Trophy, Swords, Coins, Shield, Star, Medal, Target, User } from 'lucide-react';
import { leaderboardAPI } from '../utils/api';
import { Guild } from '../types';

interface LeaderboardEntry {
    rank: number;
    name: string;
    value: number; // XP, Gold, Rating, etc.
    class?: string;
    tag?: string; // Guild Tag
    id?: string;
}

interface GuildLeaderboardEntry {
    rank: number;
    name: string;
    tag: string;
    level: number;
    exp: number;
    memberCount: number;
    id: string;
}

interface LeaderboardViewProps {
    onJoinGuild?: (guildId: string) => void;
    onClose?: () => void;
}

const LeaderboardView: React.FC<LeaderboardViewProps> = ({ onJoinGuild, onClose }) => {
    const [activeTab, setActiveTab] = useState<'level' | 'pvp' | 'wealth' | 'guilds'>('level');
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const loadData = async () => {
        setLoading(true);
        try {
            let res;
            switch (activeTab) {
                case 'level':
                    res = await leaderboardAPI.level();
                    setData(res.leaderboard);
                    break;
                case 'pvp':
                    res = await leaderboardAPI.pvp();
                    setData(res.leaderboard);
                    break;
                case 'wealth':
                    res = await leaderboardAPI.wealth();
                    setData(res.leaderboard);
                    break;
                case 'guilds':
                    res = await leaderboardAPI.guilds();
                    setData(res.leaderboard);
                    break;
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const getRankIcon = (rank: number) => {
        if (rank === 1) return <Crown className="text-yellow-500 fill-yellow-500 animate-bounce" size={24} />;
        if (rank === 2) return <Medal className="text-gray-300" size={24} />;
        if (rank === 3) return <Medal className="text-orange-400" size={24} />;
        return <span className="text-xl font-bold text-slate-500 w-6 text-center">{rank}</span>;
    };

    return (
        <div className="bg-[#0b0f19] h-full flex flex-col rounded-xl overflow-hidden border border-slate-800">
            {/* Header */}
            <div className="p-6 bg-slate-900 border-b border-slate-700 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-yellow-900/20 rounded-xl flex items-center justify-center border border-yellow-700 shadow-lg shadow-yellow-900/20">
                        <Trophy className="text-yellow-500" size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white rpg-font">SIRALAMA</h2>
                        <p className="text-xs text-slate-400">Kadim Evren'in En Güçlüleri</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-700 bg-slate-900/50">
                <button
                    onClick={() => setActiveTab('level')}
                    className={`flex-1 py-4 flex items-center justify-center gap-2 font-bold transition-all ${activeTab === 'level' ? 'text-yellow-500 bg-yellow-900/10 border-b-2 border-yellow-500' : 'text-slate-500 hover:text-white'}`}
                >
                    <Star size={18} /> SEVİYE
                </button>
                <button
                    onClick={() => setActiveTab('pvp')}
                    className={`flex-1 py-4 flex items-center justify-center gap-2 font-bold transition-all ${activeTab === 'pvp' ? 'text-red-500 bg-red-900/10 border-b-2 border-red-500' : 'text-slate-500 hover:text-white'}`}
                >
                    <Swords size={18} /> PvP
                </button>
                <button
                    onClick={() => setActiveTab('wealth')}
                    className={`flex-1 py-4 flex items-center justify-center gap-2 font-bold transition-all ${activeTab === 'wealth' ? 'text-green-500 bg-green-900/10 border-b-2 border-green-500' : 'text-slate-500 hover:text-white'}`}
                >
                    <Coins size={18} /> ZENGİNLİK
                </button>
                <button
                    onClick={() => setActiveTab('guilds')}
                    className={`flex-1 py-4 flex items-center justify-center gap-2 font-bold transition-all ${activeTab === 'guilds' ? 'text-purple-500 bg-purple-900/10 border-b-2 border-purple-500' : 'text-slate-500 hover:text-white'}`}
                >
                    <Shield size={18} /> KLANLAR
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
                {loading ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500 mb-4"></div>
                        <span>Sıralama yükleniyor...</span>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-900/90 backdrop-blur sticky top-0 z-10 shadow-md">
                            <tr>
                                <th className="p-4 w-20 text-center text-xs font-bold text-slate-500 uppercase">Sıra</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase">{activeTab === 'guilds' ? 'Klan Adı' : 'Oyuncu'}</th>
                                {activeTab === 'guilds' && <th className="p-4 text-xs font-bold text-slate-500 uppercase">Etiket</th>}
                                {activeTab !== 'guilds' && <th className="p-4 text-xs font-bold text-slate-500 uppercase">Sınıf</th>}
                                <th className="p-4 text-right text-xs font-bold text-slate-500 uppercase">
                                    {activeTab === 'level' ? 'Seviye' : activeTab === 'pvp' ? 'Puan' : activeTab === 'wealth' ? 'Altın' : 'Seviye / Üye'}
                                </th>
                                {activeTab === 'guilds' && <th className="p-4 w-24"></th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {data.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-10 text-center text-slate-600 italic">
                                        Henüz sıralama verisi yok.
                                    </td>
                                </tr>
                            ) : (
                                data.map((item, index) => (
                                    <tr
                                        key={index}
                                        className={`hover:bg-slate-800/50 transition-colors ${index < 3 ? 'bg-gradient-to-r from-yellow-900/10 to-transparent' : ''}`}
                                    >
                                        <td className="p-4 text-center">
                                            <div className="flex justify-center items-center">
                                                {getRankIcon(item.rank)}
                                            </div>
                                        </td>
                                        <td className="p-4 font-bold text-white flex items-center gap-3">
                                            {activeTab === 'guilds' ? (
                                                <div className="w-8 h-8 rounded bg-purple-900/50 border border-purple-500 flex items-center justify-center text-purple-300 font-bold text-xs">{item.tag?.substring(0, 1)}</div>
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center">
                                                    <User size={16} className="text-slate-400" />
                                                </div>
                                            )}
                                            {item.name}
                                        </td>

                                        {activeTab === 'guilds' && (
                                            <td className="p-4 text-slate-400 font-mono text-sm">[{item.tag}]</td>
                                        )}

                                        {activeTab !== 'guilds' && (
                                            <td className="p-4 text-slate-400 text-sm capitalize">{item.class || 'Bilinmiyor'}</td>
                                        )}

                                        <td className="p-4 text-right font-mono font-bold text-yellow-500">
                                            {activeTab === 'level' && `Lv.${item.level || 0}`}
                                            {activeTab === 'pvp' && `${item.points || 0} RP`}
                                            {activeTab === 'wealth' && `${(item.gold || 0).toLocaleString()} 🟡`}
                                            {activeTab === 'guilds' && (
                                                <div className="flex flex-col items-end">
                                                    <span className="text-white">Lv.{item.level}</span>
                                                    <span className="text-xs text-slate-500">{item.memberCount} Üye</span>
                                                </div>
                                            )}
                                        </td>

                                        {activeTab === 'guilds' && onJoinGuild && (
                                            <td className="p-4 text-right">
                                                <button
                                                    onClick={() => item.id && onJoinGuild(item.id)}
                                                    className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded shadow-lg transition-colors"
                                                >
                                                    KATIL
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default LeaderboardView;
