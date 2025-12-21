import React, { useState, useEffect, useRef } from 'react';
import { X, Shield, Crown, Users, Settings, Scroll, Coins, Trophy, Plus, Search, LogOut, UserPlus, Star, Sword, MessageCircle, Vault, Send, ArrowUp, ArrowDown, Gift } from 'lucide-react';
import { Guild, GuildMember, GuildRank, PlayerState, CharacterClass } from '../types';
import { guildAPI } from '../utils/api';

interface GuildViewProps {
    playerState: PlayerState;
    guild: Guild | null;
    onCreateGuild: (name: string, tag: string) => void;
    onLeaveGuild: () => void;
    onKickMember: (memberId: string) => void;
    onPromoteMember: (memberId: string) => void;
    onDemoteMember: (memberId: string) => void;
    onDonate: (amount: number) => void;
    onJoinGuild: (guildId: string) => void;
    onClose: () => void;
}

const RANK_NAMES: Record<string, string> = {
    leader: 'Lider',
    co_leader: 'Yardımcı Lider',
    vice_leader: 'Yrd. Lider', // Backend uses VICE_LEADER
    officer: 'Subay',
    member: 'Üye',
    recruit: 'Çaylak'
};

const RANK_COLORS: Record<string, string> = {
    leader: '#fcd34d',
    co_leader: '#f97316',
    vice_leader: '#f97316',
    officer: '#8b5cf6',
    member: '#3b82f6',
    recruit: '#6b7280'
};

const GuildView: React.FC<GuildViewProps> = ({
    playerState,
    guild,
    onCreateGuild,
    onLeaveGuild,
    onKickMember,
    onPromoteMember,
    onDemoteMember,
    onDonate,
    onJoinGuild,
    onClose
}) => {
    const [tab, setTab] = useState<'info' | 'members' | 'browse' | 'chat' | 'treasury'>('info');
    const [createMode, setCreateMode] = useState(false);
    const [newGuildName, setNewGuildName] = useState('');
    const [newGuildTag, setNewGuildTag] = useState('');
    const [donateAmount, setDonateAmount] = useState(1000);
    const [searchTerm, setSearchTerm] = useState('');
    const [browseList, setBrowseList] = useState<any[]>([]);
    const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

    // Chat State
    const [chatMessages, setChatMessages] = useState<{ id: string, sender: string, text: string, time: Date }[]>([]);
    const [chatInput, setChatInput] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Treasury State
    const [treasuryGold, setTreasuryGold] = useState(0);
    const [treasuryHistory, setTreasuryHistory] = useState<{ id: string, type: 'deposit' | 'withdraw', amount: number, player: string, time: Date }[]>([]);
    const [depositAmount, setDepositAmount] = useState(100);

    useEffect(() => {
        if (!guild) {
            setTab('browse');
            guildAPI.leaderboard().then(data => {
                if (data.leaderboard) {
                    setBrowseList(data.leaderboard);
                }
            }).catch(console.error);
        } else {
            setTab('info');
            // Initialize mock treasury
            setTreasuryGold(guild.treasury || 50000);
            setTreasuryHistory([
                { id: '1', type: 'deposit', amount: 5000, player: 'Lider', time: new Date(Date.now() - 3600000) },
                { id: '2', type: 'deposit', amount: 2000, player: 'Yardımcı', time: new Date(Date.now() - 7200000) },
            ]);
            // Initialize mock chat messages
            setChatMessages([
                { id: '1', sender: 'Sistem', text: `${guild.name} lonca sohbetine hoş geldiniz!`, time: new Date() }
            ]);
        }
    }, [guild]);

    // Auto-scroll chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    const handleSendChat = () => {
        if (chatInput.trim()) {
            setChatMessages(prev => [...prev, {
                id: Date.now().toString(),
                sender: playerState.nickname,
                text: chatInput.trim(),
                time: new Date()
            }]);
            setChatInput('');
        }
    };

    const handleDeposit = () => {
        const amount = Math.min(depositAmount, playerState.credits || 0);
        if (amount > 0) {
            setTreasuryGold(prev => prev + amount);
            setTreasuryHistory(prev => [{
                id: Date.now().toString(),
                type: 'deposit',
                amount,
                player: playerState.nickname,
                time: new Date()
            }, ...prev]);
            // In real app, would call API and update playerState.credits
            alert(`${amount} altın kasaya yatırıldı!`);
        }
    };

    // Map backend members to UI format
    const membersList = guild?.members?.map((m: any) => ({
        id: m.userId?._id || m.userId, // Populated vs Unpopulated
        nickname: m.userId?.username || 'Unknown',
        class: 'warrior' as CharacterClass, // Placeholder
        level: 1, // Placeholder
        ranks: (m.role || 'member').toLowerCase(),
        rank: (m.role || 'member').toLowerCase(),
        contribution: m.contribution || 0,
        lastOnline: Date.now(),
        joinedAt: new Date(m.joinedAt).getTime()
    })) || [];

    const myMemberInfo = membersList.find(m => m.nickname === playerState.nickname);
    const myRank = myMemberInfo?.rank || 'member';
    const canManageMembers = myRank === 'leader' || myRank === 'vice_leader' || myRank === 'co_leader';

    const handleCreate = () => {
        if (newGuildName.trim().length >= 3 && newGuildTag.trim().length >= 2) {
            onCreateGuild(newGuildName.trim(), newGuildTag.trim().toUpperCase());
            setCreateMode(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl border border-slate-600 w-full max-w-3xl max-h-[85vh] overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="bg-gradient-to-r from-amber-900/50 to-orange-900/50 px-6 py-4 flex items-center justify-between border-b border-slate-600">
                    <div className="flex items-center gap-3">
                        <Shield className="text-amber-400" size={28} />
                        <h2 className="text-xl font-bold text-white">Lonca Sistemi</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <X className="text-gray-400" size={24} />
                    </button>
                </div>

                {!guild ? (
                    /* No Guild State */
                    <div className="p-6">
                        {/* Tabs for No Guild */}
                        <div className="flex border-b border-slate-700 mb-6">
                            <button
                                onClick={() => { setTab('info'); setCreateMode(true); }}
                                className={`flex-1 py-3 text-center font-medium transition-colors ${createMode ? 'bg-amber-600/30 text-amber-300 border-b-2 border-amber-500' : 'text-gray-400 hover:text-white hover:bg-slate-700/50'}`}
                            >
                                <Plus className="inline mr-2" size={18} />
                                Lonca Kur
                            </button>
                            <button
                                onClick={() => { setTab('browse'); setCreateMode(false); }}
                                className={`flex-1 py-3 text-center font-medium transition-colors ${tab === 'browse' && !createMode ? 'bg-amber-600/30 text-amber-300 border-b-2 border-amber-500' : 'text-gray-400 hover:text-white hover:bg-slate-700/50'}`}
                            >
                                <Search className="inline mr-2" size={18} />
                                Lonca Sıralaması
                            </button>
                        </div>

                        {createMode ? (
                            <div className="max-w-md mx-auto">
                                <div className="bg-slate-800/50 rounded-xl p-6">
                                    <h3 className="text-lg font-bold text-white mb-6 text-center">Yeni Lonca Oluştur</h3>

                                    <div className="mb-4">
                                        <label className="block text-gray-400 text-sm mb-2">Lonca Adı</label>
                                        <input
                                            type="text"
                                            placeholder="Örn: Ejderha Şövalyeleri"
                                            value={newGuildName}
                                            onChange={(e) => setNewGuildName(e.target.value)}
                                            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500"
                                            maxLength={24}
                                        />
                                    </div>

                                    <div className="mb-6">
                                        <label className="block text-gray-400 text-sm mb-2">Kısaltma (2-4 karakter)</label>
                                        <input
                                            type="text"
                                            placeholder="Örn: EŞ"
                                            value={newGuildTag}
                                            onChange={(e) => setNewGuildTag(e.target.value.toUpperCase())}
                                            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500"
                                            maxLength={4}
                                        />
                                    </div>

                                    <div className="bg-slate-700/50 rounded-lg p-4 mb-6">
                                        <p className="text-gray-400 text-sm">
                                            <Coins className="inline mr-2 text-yellow-400" size={16} />
                                            Lonca kurma ücreti: <span className="text-yellow-400 font-bold">10,000 Altın</span>
                                            <span className="block text-xs text-gray-500 mt-1">(Mevcut: {playerState.credits})</span>
                                        </p>
                                    </div>

                                    <button
                                        onClick={handleCreate}
                                        disabled={newGuildName.trim().length < 3 || newGuildTag.trim().length < 2 || playerState.credits < 10000}
                                        className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl shadow-lg transition-all"
                                    >
                                        {playerState.credits < 10000 ? 'Yetersiz Altın' : 'Lonca Kur'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                {/* Guild List from Leaderboard */}
                                <div className="space-y-3 max-h-[50vh] overflow-y-auto">
                                    {browseList.length === 0 && <p className="text-center text-gray-500 py-8">Henüz hiç lonca yok veya yüklenemedi.</p>}
                                    {browseList.map((g, idx) => (
                                        <div
                                            key={idx}
                                            className="bg-slate-800/50 rounded-xl p-4 hover:bg-slate-700/50 transition-colors border border-slate-700"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded bg-slate-700 flex items-center justify-center font-bold text-white">
                                                        {g.tag}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-white font-bold">{g.name}</h3>
                                                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                                                            <span><Users className="inline" size={12} /> {g.memberCount} Üye</span>
                                                            <span><Star className="inline" size={12} /> Lv.{g.level}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right flex flex-col items-end gap-2">
                                                    <span className="text-slate-500 text-xs">Sıralama #{idx + 1}</span>
                                                    {g.id && g.id !== 'unknown' && (
                                                        <button
                                                            onClick={() => onJoinGuild(g.id)}
                                                            className="text-xs bg-amber-700 hover:bg-amber-600 text-white px-3 py-1 rounded"
                                                        >
                                                            KATIL
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-center text-slate-500 mt-4">Not: Sıralamadaki loncalara katılmak için davet almalısınız.</p>
                            </div>
                        )}
                    </div>
                ) : (
                    /* In Guild State */
                    <>
                        {/* Tabs */}
                        <div className="flex border-b border-slate-700 overflow-x-auto">
                            <button
                                onClick={() => setTab('info')}
                                className={`flex-1 py-3 text-center font-medium transition-colors whitespace-nowrap ${tab === 'info' ? 'bg-amber-600/30 text-amber-300 border-b-2 border-amber-500' : 'text-gray-400 hover:text-white hover:bg-slate-700/50'}`}
                            >
                                <Scroll className="inline mr-1" size={16} />
                                Bilgi
                            </button>
                            <button
                                onClick={() => setTab('members')}
                                className={`flex-1 py-3 text-center font-medium transition-colors whitespace-nowrap ${tab === 'members' ? 'bg-amber-600/30 text-amber-300 border-b-2 border-amber-500' : 'text-gray-400 hover:text-white hover:bg-slate-700/50'}`}
                            >
                                <Users className="inline mr-1" size={16} />
                                Üyeler
                            </button>
                            <button
                                onClick={() => setTab('chat')}
                                className={`flex-1 py-3 text-center font-medium transition-colors whitespace-nowrap ${tab === 'chat' ? 'bg-green-600/30 text-green-300 border-b-2 border-green-500' : 'text-gray-400 hover:text-white hover:bg-slate-700/50'}`}
                            >
                                <MessageCircle className="inline mr-1" size={16} />
                                Sohbet
                            </button>
                            <button
                                onClick={() => setTab('treasury')}
                                className={`flex-1 py-3 text-center font-medium transition-colors whitespace-nowrap ${tab === 'treasury' ? 'bg-yellow-600/30 text-yellow-300 border-b-2 border-yellow-500' : 'text-gray-400 hover:text-white hover:bg-slate-700/50'}`}
                            >
                                <Vault className="inline mr-1" size={16} />
                                Kasa
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto max-h-[60vh]">
                            {tab === 'info' && (
                                <div>
                                    {/* Guild Header */}
                                    <div className="bg-slate-800/50 rounded-xl p-6 mb-6 relative overflow-hidden">
                                        <div className="relative z-10 flex items-center gap-4 mb-4">
                                            <div
                                                className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg bg-indigo-600"
                                            >
                                                {guild.tag}
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-bold text-white">{guild.name}</h2>
                                                <p className="text-gray-400">{guild.description || `${guild.name} loncasına hoş geldiniz.`}</p>
                                            </div>
                                        </div>

                                        <div className="bg-slate-700/50 rounded-lg p-4 mb-4">
                                            <p className="text-amber-300 italic">"{guild.motd || 'Zafer yakındır!'}"</p>
                                        </div>

                                        {/* Stats Grid */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
                                            <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                                                <Star className="mx-auto text-yellow-400 mb-1" size={24} />
                                                <p className="text-white font-bold">Lv.{guild.level}</p>
                                                <p className="text-gray-500 text-xs">Seviye</p>
                                            </div>
                                            <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                                                <Users className="mx-auto text-blue-400 mb-1" size={24} />
                                                <p className="text-white font-bold">{membersList.length}/{guild.maxMembers}</p>
                                                <p className="text-gray-500 text-xs">Üyeler</p>
                                            </div>
                                            <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                                                <Coins className="mx-auto text-yellow-400 mb-1" size={24} />
                                                <p className="text-white font-bold">{((guild.gold || 0) / 1000).toFixed(1)}K</p>
                                                <p className="text-gray-500 text-xs">Hazine</p>
                                            </div>
                                            <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                                                <Trophy className="mx-auto text-purple-400 mb-1" size={24} />
                                                <p className="text-white font-bold">{(guild.exp || 0).toLocaleString()}</p>
                                                <p className="text-gray-500 text-xs">Deneyim</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Donate */}
                                    <div className="bg-slate-800/50 rounded-xl p-4 mb-4">
                                        <h4 className="text-gray-400 font-bold mb-3">Loncaya Bağış Yap</h4>
                                        <div className="flex gap-3">
                                            <input
                                                type="number"
                                                value={donateAmount}
                                                onChange={(e) => setDonateAmount(Math.max(100, parseInt(e.target.value) || 0))}
                                                className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                                                min={100}
                                                step={100}
                                            />
                                            <button
                                                onClick={() => onDonate(donateAmount)}
                                                className="bg-amber-600 hover:bg-amber-500 text-white px-6 py-2 rounded-lg font-medium"
                                                disabled={playerState.credits < donateAmount}
                                            >
                                                <Coins className="inline mr-2" size={16} />
                                                Bağışla
                                            </button>
                                        </div>
                                    </div>

                                    {/* Leave */}
                                    <button
                                        onClick={() => setShowLeaveConfirm(true)}
                                        className="w-full bg-red-600/30 hover:bg-red-600/50 text-red-400 font-medium py-3 rounded-xl transition-colors"
                                    >
                                        <LogOut className="inline mr-2" size={18} />
                                        {myRank === 'leader' ? 'Loncayı Dağıt' : 'Loncadan Ayrıl'}
                                    </button>

                                    {/* Lonca Ayrılma Onay Modalı */}
                                    {showLeaveConfirm && (
                                        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                                            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-red-500/50 p-6 max-w-sm w-full shadow-2xl animate-[fadeIn_0.2s]">
                                                <div className="text-center mb-6">
                                                    <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                                        <LogOut className="text-red-500" size={32} />
                                                    </div>
                                                    <h3 className="text-xl font-bold text-white mb-2">
                                                        {myRank === 'leader' ? 'Loncayı Dağıt' : 'Loncadan Ayrıl'}
                                                    </h3>
                                                    <p className="text-gray-400">
                                                        {myRank === 'leader'
                                                            ? 'Loncayı dağıtmak istediğine emin misin? Bu işlem geri alınamaz!'
                                                            : 'Loncadan ayrılmak istediğine emin misin?'
                                                        }
                                                    </p>
                                                </div>
                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={() => setShowLeaveConfirm(false)}
                                                        className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 rounded-xl transition-colors"
                                                    >
                                                        İptal
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setShowLeaveConfirm(false);
                                                            onLeaveGuild();
                                                        }}
                                                        className="flex-1 bg-red-600 hover:bg-red-500 text-white font-medium py-3 rounded-xl transition-colors"
                                                    >
                                                        Evet, Ayrıl
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {tab === 'members' && (
                                <div className="space-y-2">
                                    {membersList
                                        .sort((a: any, b: any) => {
                                            const rankOrder: Record<string, number> = { leader: 0, vice_leader: 1, co_leader: 1, officer: 2, member: 3, recruit: 4 };
                                            return (rankOrder[a.rank] || 5) - (rankOrder[b.rank] || 5);
                                        })
                                        .map((member: any) => (
                                            <div
                                                key={member.id}
                                                className="bg-slate-800/50 rounded-lg p-3 flex items-center justify-between"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="relative">
                                                        <div className="w-10 h-10 rounded-lg bg-slate-600 flex items-center justify-center text-white font-bold">
                                                            {(member.nickname || '?').charAt(0)}
                                                        </div>
                                                        <div
                                                            className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                                                            style={{ backgroundColor: RANK_COLORS[member.rank] || '#999' }}
                                                        >
                                                            {member.rank === 'leader' && <Crown size={10} className="text-white" />}
                                                            {(member.rank === 'co_leader' || member.rank === 'vice_leader') && <Star size={10} className="text-white" />}
                                                            {member.rank === 'officer' && <Shield size={10} className="text-white" />}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-white font-medium">{member.nickname}</span>
                                                            <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: (RANK_COLORS[member.rank] || '#666') + '30', color: RANK_COLORS[member.rank] || '#ccc' }}>
                                                                {RANK_NAMES[member.rank] || member.rank}
                                                            </span>
                                                        </div>
                                                        <div className="text-xs text-gray-400">
                                                            {new Date(member.joinedAt).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-yellow-400 text-sm">{member.contribution.toLocaleString()} ⭐</span>
                                                    {canManageMembers && member.id !== myMemberInfo?.id && member.rank !== 'leader' && (
                                                        <div className="flex gap-1">
                                                            {member.rank !== 'vice_leader' && member.rank !== 'co_leader' && (
                                                                <button
                                                                    onClick={() => onPromoteMember(member.id)} // Pass direct user ID or Member ID? Controller expects memberId (which is userId in the array)
                                                                    className="p-1.5 bg-green-600/30 hover:bg-green-600/50 rounded text-green-400 text-xs"
                                                                    title="Terfi Et"
                                                                >
                                                                    ↑
                                                                </button>
                                                            )}
                                                            {member.rank !== 'member' && (
                                                                <button
                                                                    onClick={() => onDemoteMember(member.id)}
                                                                    className="p-1.5 bg-orange-600/30 hover:bg-orange-600/50 rounded text-orange-400 text-xs"
                                                                    title="Rütbe Düşür"
                                                                >
                                                                    ↓
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => onKickMember(member.id)}
                                                                className="p-1.5 bg-red-600/30 hover:bg-red-600/50 rounded text-red-400 text-xs"
                                                                title="At"
                                                            >
                                                                X
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            )}

                            {/* Chat Tab */}
                            {tab === 'chat' && (
                                <div className="flex flex-col h-[50vh]">
                                    {/* Chat Messages */}
                                    <div className="flex-1 overflow-y-auto bg-slate-800/30 rounded-lg p-3 mb-3 space-y-2">
                                        {chatMessages.map(msg => (
                                            <div key={msg.id} className={`${msg.sender === 'Sistem' ? 'text-center' : ''}`}>
                                                {msg.sender === 'Sistem' ? (
                                                    <span className="text-xs text-green-400 italic">{msg.text}</span>
                                                ) : (
                                                    <div className={`flex gap-2 ${msg.sender === playerState.nickname ? 'flex-row-reverse' : ''}`}>
                                                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
                                                            {msg.sender.charAt(0)}
                                                        </div>
                                                        <div className={`max-w-[70%] ${msg.sender === playerState.nickname ? 'bg-green-700/40' : 'bg-slate-700/60'} rounded-lg p-2`}>
                                                            <div className="text-xs text-amber-400 font-bold mb-1">{msg.sender}</div>
                                                            <div className="text-sm text-white">{msg.text}</div>
                                                            <div className="text-[10px] text-slate-500 mt-1">
                                                                {msg.time.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        <div ref={chatEndRef} />
                                    </div>

                                    {/* Chat Input */}
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={chatInput}
                                            onChange={(e) => setChatInput(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                                            placeholder="Mesaj yaz..."
                                            className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500"
                                        />
                                        <button
                                            onClick={handleSendChat}
                                            disabled={!chatInput.trim()}
                                            className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg text-white font-bold transition-colors"
                                        >
                                            <Send size={18} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Treasury Tab */}
                            {tab === 'treasury' && (
                                <div>
                                    {/* Treasury Balance */}
                                    <div className="bg-gradient-to-br from-yellow-900/40 to-amber-900/40 rounded-xl p-6 mb-6 border border-yellow-700/50">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-lg font-bold text-yellow-300 mb-1">Lonca Kasası</h3>
                                                <p className="text-xs text-slate-400">Tüm üyeler katkıda bulunabilir</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-3xl font-bold text-yellow-400 flex items-center gap-2">
                                                    <Coins size={28} />
                                                    {treasuryGold.toLocaleString()}
                                                </div>
                                                <div className="text-xs text-slate-400">Altın</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Deposit Section */}
                                    <div className="bg-slate-800/50 rounded-xl p-4 mb-6">
                                        <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                                            <Gift size={18} className="text-green-400" />
                                            Kasaya Altın Yatır
                                        </h4>
                                        <div className="flex gap-3">
                                            <div className="flex-1">
                                                <input
                                                    type="number"
                                                    value={depositAmount}
                                                    onChange={(e) => setDepositAmount(Math.max(0, parseInt(e.target.value) || 0))}
                                                    min={0}
                                                    max={playerState.credits}
                                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500"
                                                />
                                                <div className="text-xs text-slate-500 mt-1">Mevcut: {(playerState.credits || 0).toLocaleString()} Altın</div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => setDepositAmount(100)} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-xs text-white">100</button>
                                                <button onClick={() => setDepositAmount(1000)} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-xs text-white">1K</button>
                                                <button onClick={() => setDepositAmount(10000)} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-xs text-white">10K</button>
                                            </div>
                                            <button
                                                onClick={handleDeposit}
                                                disabled={depositAmount <= 0 || depositAmount > (playerState.credits || 0)}
                                                className="px-6 py-2 bg-green-600 hover:bg-green-500 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg text-white font-bold transition-colors flex items-center gap-2"
                                            >
                                                <ArrowUp size={16} /> Yatır
                                            </button>
                                        </div>
                                    </div>

                                    {/* Transaction History */}
                                    <div className="bg-slate-800/50 rounded-xl p-4">
                                        <h4 className="font-bold text-white mb-3">İşlem Geçmişi</h4>
                                        <div className="space-y-2 max-h-48 overflow-y-auto">
                                            {treasuryHistory.length === 0 ? (
                                                <p className="text-slate-500 text-center text-sm py-4">Henüz işlem yok</p>
                                            ) : (
                                                treasuryHistory.map(tx => (
                                                    <div key={tx.id} className="flex justify-between items-center bg-slate-700/50 rounded-lg p-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.type === 'deposit' ? 'bg-green-600/30' : 'bg-red-600/30'}`}>
                                                                {tx.type === 'deposit' ? <ArrowUp size={14} className="text-green-400" /> : <ArrowDown size={14} className="text-red-400" />}
                                                            </div>
                                                            <div>
                                                                <div className="text-sm text-white font-medium">{tx.player}</div>
                                                                <div className="text-xs text-slate-400">{tx.time.toLocaleString('tr-TR')}</div>
                                                            </div>
                                                        </div>
                                                        <div className={`font-bold ${tx.type === 'deposit' ? 'text-green-400' : 'text-red-400'}`}>
                                                            {tx.type === 'deposit' ? '+' : '-'}{tx.amount.toLocaleString()}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default GuildView;
