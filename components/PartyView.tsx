import React, { useState } from 'react';
import { X, Users, Crown, UserPlus, UserMinus, Settings, Shield, Heart, Zap, MapPin, Globe, Lock, Unlock, ArrowRightLeft } from 'lucide-react';
import { Party, PartyMember, PlayerState, CharacterClass } from '../types';

interface PartyViewProps {
    playerState: PlayerState;
    party: Party | null;
    onCreateParty: (name: string, isPublic: boolean) => void;
    onLeaveParty: () => void;
    onKickMember: (memberId: string) => void;
    onInvitePlayer: (playerName: string) => void;
    onTradeRequest?: (playerId: string) => void;
    onChangeLootRule: (rule: Party['lootRule']) => void;
    onClose: () => void;
}

const CLASS_COLORS: Record<string, string> = {
    warrior: '#ef4444',
    arctic_knight: '#06b6d4',
    gale_glaive: '#22c55e',
    archer: '#eab308',
    archmage: '#8b5cf6',
    bard: '#ec4899',
    cleric: '#f59e0b',
    martial_artist: '#f97316',
    monk: '#14b8a6',
    reaper: '#6366f1',
    unknown: '#9ca3af'
};

const CLASS_NAMES: Record<string, string> = {
    warrior: 'Savaşçı',
    arctic_knight: 'Buz Şövalyesi',
    gale_glaive: 'Fırtına Süvarisi',
    archer: 'Okçu',
    archmage: 'Büyücü',
    bard: 'Ozan',
    cleric: 'Rahip',
    martial_artist: 'Dövüşçü',
    monk: 'Keşiş',
    reaper: 'Azrail',
    unknown: 'Bilinmiyor'
};

const PartyView: React.FC<PartyViewProps> = ({
    playerState,
    party,
    onCreateParty,
    onLeaveParty,
    onKickMember,
    onInvitePlayer,
    onTradeRequest,
    onChangeLootRule,
    onClose
}) => {
    const [tab, setTab] = useState<'party' | 'find'>('party');
    const [createMode, setCreateMode] = useState(false);
    const [newPartyName, setNewPartyName] = useState('');
    const [newPartyPublic, setNewPartyPublic] = useState(true);
    const [inviteName, setInviteName] = useState('');
    const [showLeaveConfirm, setShowLeaveConfirm] = useState(false); // Ayrılma onay modalı

    const isLeader = party?.leaderId === playerState.nickname; // Actually leaderId is an ID, not nickname. Needs fix.

    // Map backend members to UI format
    // Backend party.members are populated Users (userId, username, etc.) based on previous file analysis or types?
    // In types.ts PartyMember has: id, nickname, class, level, hp, maxHp...
    // But backend probably sends: { _id, username } if populated.
    // We need to robustly handle this.
    // If party members are strings (IDs), we can't show much.
    // If objects, we try to use them.

    const membersList = party?.members?.map((m: any) => {
        // Backend 'populate' usually returns properties on the object itself if defined as Ref, 
        // OR it replaces the ID string with the object.
        // Assuming m is the member object from the 'members' array in Party model.
        // If Party model is `members: [{ type: ObjectId, ref: 'User' }]`, then m is the User object.

        const isMe = (m._id || m.id) === playerState.nickname || m.username === playerState.nickname; // ID or Name match attempt

        return {
            id: m._id || m.id || 'unknown',
            nickname: m.username || m.nickname || 'Unknown',
            class: (m.class || 'unknown') as CharacterClass,
            level: m.level || 1,
            hp: m.hp || 100,
            maxHp: m.maxHp || 100,
            mana: m.mana || 100,
            maxMana: m.maxMana || 100,
            isOnline: true, // No online status yet
            isLeader: (party.leaderId === (m._id || m.id)) || (party.leaderId === (m.username || m.nickname)), // Try to match leader ID
            zoneId: m.zoneId || 0
        };
    }) || [];

    // Correct isLeader check based on mapped data
    // We check if the current player's ID matches party leader ID.
    // But we don't have player's ID in playerState easily (it is not in PlayerState interface usually).
    // Let's assume we are leader if we are in the list and marked as leader, OR if `party.leaderId` matches our nickname (unlikely for ID).
    // For now, let's trust the mapped `isLeader` on the member that matches our nickname.
    const myMember = membersList.find(m => m.nickname === playerState.nickname);
    const amILeader = myMember?.isLeader || false;

    const handleCreate = () => {
        if (newPartyName.trim().length >= 3) {
            onCreateParty(newPartyName.trim(), newPartyPublic);
            setCreateMode(false);
            setNewPartyName('');
        }
    };

    const handleInvite = () => {
        if (inviteName.trim()) {
            onInvitePlayer(inviteName.trim());
            setInviteName('');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl border border-slate-600 w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 px-6 py-4 flex items-center justify-between border-b border-slate-600">
                    <div className="flex items-center gap-3">
                        <Users className="text-purple-400" size={28} />
                        <h2 className="text-xl font-bold text-white">Parti Sistemi</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <X className="text-gray-400" size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-700">
                    <button
                        onClick={() => setTab('party')}
                        className={`flex-1 py-3 text-center font-medium transition-colors ${tab === 'party' ? 'bg-purple-600/30 text-purple-300 border-b-2 border-purple-500' : 'text-gray-400 hover:text-white hover:bg-slate-700/50'}`}
                    >
                        <Users className="inline mr-2" size={18} />
                        Partim
                    </button>
                    <button
                        onClick={() => setTab('find')}
                        className={`flex-1 py-3 text-center font-medium transition-colors ${tab === 'find' ? 'bg-purple-600/30 text-purple-300 border-b-2 border-purple-500' : 'text-gray-400 hover:text-white hover:bg-slate-700/50'}`}
                    >
                        <Globe className="inline mr-2" size={18} />
                        Parti Bul
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    {tab === 'party' && (
                        <>
                            {!party ? (
                                <div className="text-center py-8">
                                    {!createMode ? (
                                        <>
                                            <Users className="mx-auto text-gray-500 mb-4" size={64} />
                                            <p className="text-gray-400 mb-6">Henüz bir partide değilsin.</p>
                                            <button
                                                onClick={() => setCreateMode(true)}
                                                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all"
                                            >
                                                <UserPlus className="inline mr-2" size={20} />
                                                Parti Oluştur
                                            </button>
                                        </>
                                    ) : (
                                        <div className="bg-slate-800/50 rounded-xl p-6 max-w-md mx-auto">
                                            <h3 className="text-lg font-bold text-white mb-4">Yeni Parti Oluştur</h3>
                                            <input
                                                type="text"
                                                placeholder="Parti Adı (min 3 karakter)"
                                                value={newPartyName}
                                                onChange={(e) => setNewPartyName(e.target.value)}
                                                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white mb-4 focus:outline-none focus:border-purple-500"
                                                maxLength={20}
                                            />
                                            <div className="flex items-center justify-between mb-6">
                                                <span className="text-gray-300">Herkese Açık</span>
                                                <button
                                                    onClick={() => setNewPartyPublic(!newPartyPublic)}
                                                    className={`p-2 rounded-lg transition-colors ${newPartyPublic ? 'bg-green-600' : 'bg-red-600'}`}
                                                >
                                                    {newPartyPublic ? <Unlock size={20} /> : <Lock size={20} />}
                                                </button>
                                            </div>
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => setCreateMode(false)}
                                                    className="flex-1 bg-slate-600 hover:bg-slate-500 text-white py-2 rounded-lg"
                                                >
                                                    İptal
                                                </button>
                                                <button
                                                    onClick={handleCreate}
                                                    disabled={newPartyName.trim().length < 3}
                                                    className="flex-1 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 rounded-lg"
                                                >
                                                    Oluştur
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div>
                                    {/* Party Info */}
                                    <div className="bg-slate-800/50 rounded-xl p-4 mb-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-lg font-bold text-white">{party.name || 'İsimsiz Parti'}</h3>
                                                {party.isPublic ? (
                                                    <span className="bg-green-600/30 text-green-400 text-xs px-2 py-1 rounded-full">Açık</span>
                                                ) : (
                                                    <span className="bg-red-600/30 text-red-400 text-xs px-2 py-1 rounded-full">Özel</span>
                                                )}
                                            </div>
                                            <span className="text-gray-400 text-sm">{membersList.length}/{party.maxMembers || 5} Üye</span>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-400">
                                            <span>Loot: {party.lootRule === 'free_for_all' ? 'Serbest' : party.lootRule === 'round_robin' ? 'Sıralı' : 'Lider Atar'}</span>
                                        </div>
                                    </div>

                                    {/* Members */}
                                    <h4 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wide">Üyeler</h4>
                                    <div className="space-y-2 mb-6">
                                        {membersList.map((member) => (
                                            <div
                                                key={member.id}
                                                className="bg-slate-800/50 rounded-lg p-3 flex items-center justify-between"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                                                        style={{ backgroundColor: CLASS_COLORS[member.class] || '#999' }}
                                                    >
                                                        {member.nickname ? member.nickname.charAt(0).toUpperCase() : '?'}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-white font-medium">{member.nickname}</span>
                                                            {member.isLeader && <Crown className="text-yellow-400" size={14} />}
                                                            <span className={`w-2 h-2 rounded-full ${member.isOnline ? 'bg-green-500' : 'bg-gray-500'}`} />
                                                        </div>
                                                        <div className="text-xs text-gray-400">
                                                            Lv.{member.level} {CLASS_NAMES[member.class] || 'Bilinmiyor'}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    {/* HP/Mana bars (Mocked for now as backend doesn't send them) */}
                                                    <div className="w-24 opacity-50 block" title="Can/Mana verisi henüz yok">
                                                        <div className="flex items-center gap-1 mb-1">
                                                            <Heart className="text-red-400" size={12} />
                                                            <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                                                <div className="h-full bg-red-500" style={{ width: `100%` }} />
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Zap className="text-blue-400" size={12} />
                                                            <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                                                <div className="h-full bg-blue-500" style={{ width: `100%` }} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {/* Trade Button - Only for others */}
                                                    {member.nickname !== playerState.nickname && (
                                                        <button
                                                            onClick={() => onTradeRequest && onTradeRequest(member.id)}
                                                            className="p-1.5 bg-yellow-600/30 hover:bg-yellow-600/50 rounded text-yellow-400 mr-2"
                                                            title="Ticaret İsteği"
                                                        >
                                                            <ArrowRightLeft size={16} />
                                                        </button>
                                                    )}
                                                    {/* Kick button (only for leader) */}
                                                    {amILeader && !member.isLeader && (
                                                        <button
                                                            onClick={() => onKickMember(member.id)}
                                                            className="p-1.5 bg-red-600/30 hover:bg-red-600/50 rounded text-red-400"
                                                        >
                                                            <UserMinus size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Invite Player (Leader only) */}
                                    {amILeader && membersList.length < (party.maxMembers || 5) && (
                                        <div className="bg-slate-800/50 rounded-xl p-4 mb-4">
                                            <h4 className="text-sm font-bold text-gray-400 mb-3">Oyuncu Davet Et</h4>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Oyuncu adı..."
                                                    value={inviteName}
                                                    onChange={(e) => setInviteName(e.target.value)}
                                                    className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                                                />
                                                <button
                                                    onClick={handleInvite}
                                                    className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg"
                                                >
                                                    <UserPlus size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Leave Party */}
                                    <button
                                        onClick={() => setShowLeaveConfirm(true)}
                                        className="w-full bg-red-600/30 hover:bg-red-600/50 text-red-400 font-medium py-3 rounded-xl transition-colors"
                                    >
                                        {amILeader ? 'Partiyi Dağıt' : 'Partiden Ayrıl'}
                                    </button>

                                    {/* Ayrılma Onay Modalı */}
                                    {showLeaveConfirm && (
                                        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                                            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-red-500/50 p-6 max-w-sm w-full shadow-2xl animate-[fadeIn_0.2s]">
                                                <div className="text-center mb-6">
                                                    <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                                        <UserMinus className="text-red-500" size={32} />
                                                    </div>
                                                    <h3 className="text-xl font-bold text-white mb-2">
                                                        {amILeader ? 'Partiyi Dağıt' : 'Partiden Ayrıl'}
                                                    </h3>
                                                    <p className="text-gray-400">
                                                        {amILeader
                                                            ? 'Partiyi dağıtmak istediğine emin misin? Tüm üyeler partiden çıkarılacak.'
                                                            : 'Partiden ayrılmak istediğine emin misin?'
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
                                                            onLeaveParty();
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
                        </>
                    )}

                    {tab === 'find' && (
                        <div>
                            <h4 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wide">Açık Partiler</h4>
                            <div className="text-center py-8">
                                <Globe className="mx-auto text-gray-500 mb-4" size={48} />
                                <p className="text-gray-400">Şu an açık parti listeleme özelliği bakımda.</p>
                                <p className="text-gray-500 text-sm mt-2">Lütfen arkadaşlarından davet iste.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PartyView;
