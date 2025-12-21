
import React, { useState } from 'react';
import { Users, Shield, Crown, UserPlus, LogOut, Coins } from 'lucide-react';
import { PlayerState } from '../types';
import { soundManager } from './SoundManager';

interface GuildModalProps {
    playerState: PlayerState;
    onClose: () => void;
    onCreateGuild: (name: string) => void;
    onInvite: (name: string) => void;
    onLeave: () => void;
}

const GuildModal: React.FC<GuildModalProps> = ({ playerState, onClose, onCreateGuild, onInvite, onLeave }) => {
    const [guildNameInput, setGuildNameInput] = useState('');
    const [inviteInput, setInviteInput] = useState('');
    const [activeTab, setActiveTab] = useState<'info' | 'members' | 'treasury'>('info');

    // Mock Guild Data (In a real app, fetch from server)
    const guildData = playerState.guildName ? {
        name: playerState.guildName,
        level: 5,
        members: [
            { name: playerState.nickname, rank: 'Lider', level: playerState.level, online: true },
            { name: 'Xx_Dragon_xX', rank: 'Üye', level: 42, online: false },
            { name: 'HealerPro', rank: 'Subay', level: 48, online: true },
        ],
        treasury: 500000
    } : null;

    if (!guildData) {
        return (
            <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4">
                <div className="bg-[#1a120b] border-2 border-[#5e4b35] rounded-xl p-8 max-w-md w-full text-center shadow-2xl relative">
                    <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">X</button>
                    <Users size={64} className="mx-auto text-slate-500 mb-6" />
                    <h2 className="text-2xl rpg-font text-[#e6cba5] mb-2">Klanın Yok</h2>
                    <p className="text-slate-400 mb-6">Bir klana katıl veya yeni bir klan kurarak gücünü göster.</p>

                    <div className="flex flex-col gap-4">
                        <input
                            type="text"
                            placeholder="Yeni Klan İsmi"
                            className="bg-slate-900 border border-slate-700 rounded p-3 text-white focus:border-yellow-500 outline-none"
                            value={guildNameInput}
                            onChange={(e) => setGuildNameInput(e.target.value)}
                        />
                        <button
                            onClick={() => {
                                if (guildNameInput.length < 3) return alert('Klan ismi en az 3 harf olmalı.');
                                soundManager.playSFX('click');
                                onCreateGuild(guildNameInput);
                            }}
                            className="bg-yellow-700 hover:bg-yellow-600 text-white font-bold py-3 rounded transition-colors flex items-center justify-center gap-2"
                        >
                            <Crown size={20} /> Klan Kur (1000 Altın)
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4">
            <div className="bg-[#1a120b] border-2 border-[#5e4b35] rounded-xl w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-[#0f0a06] p-4 border-b border-[#3f2e18] flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-yellow-900/20 rounded-lg border border-yellow-700 flex items-center justify-center">
                            <Shield className="text-yellow-500" size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl rpg-font text-[#e6cba5]">{guildData.name}</h2>
                            <div className="text-xs text-slate-400">Seviye {guildData.level} Klan</div>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white p-2">X</button>
                </div>

                {/* Content */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar */}
                    <div className="w-48 bg-[#120d0b] border-r border-[#3f2e18] p-2 flex flex-col gap-1">
                        <button
                            onClick={() => { soundManager.playSFX('click'); setActiveTab('info'); }}
                            className={`p-3 rounded text-left font-bold flex items-center gap-2 ${activeTab === 'info' ? 'bg-[#3f2e18] text-[#e6cba5]' : 'text-slate-400 hover:bg-[#1f1610]'}`}
                        >
                            <Users size={16} /> Genel Bilgi
                        </button>
                        <button
                            onClick={() => { soundManager.playSFX('click'); setActiveTab('members'); }}
                            className={`p-3 rounded text-left font-bold flex items-center gap-2 ${activeTab === 'members' ? 'bg-[#3f2e18] text-[#e6cba5]' : 'text-slate-400 hover:bg-[#1f1610]'}`}
                        >
                            <Crown size={16} /> Üyeler
                        </button>
                        <button
                            onClick={() => { soundManager.playSFX('click'); setActiveTab('treasury'); }}
                            className={`p-3 rounded text-left font-bold flex items-center gap-2 ${activeTab === 'treasury' ? 'bg-[#3f2e18] text-[#e6cba5]' : 'text-slate-400 hover:bg-[#1f1610]'}`}
                        >
                            <Coins size={16} /> Hazine
                        </button>
                    </div>

                    {/* Main Panel */}
                    <div className="flex-1 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] p-6 overflow-y-auto">
                        {activeTab === 'info' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-[#1f1610] p-4 rounded border border-[#3f2e18]">
                                        <h3 className="text-slate-400 text-xs uppercase mb-2">Klan Lideri</h3>
                                        <div className="text-[#e6cba5] font-bold text-lg">{guildData.members.find(m => m.rank === 'Lider')?.name}</div>
                                    </div>
                                    <div className="bg-[#1f1610] p-4 rounded border border-[#3f2e18]">
                                        <h3 className="text-slate-400 text-xs uppercase mb-2">Üye Sayısı</h3>
                                        <div className="text-[#e6cba5] font-bold text-lg">{guildData.members.length} / 30</div>
                                    </div>
                                </div>

                                <div className="bg-[#1f1610] p-4 rounded border border-[#3f2e18]">
                                    <h3 className="text-slate-400 text-xs uppercase mb-2">Klan Duyurusu</h3>
                                    <p className="text-slate-300 italic">"Zafer bizimdir!"</p>
                                </div>

                                <button onClick={() => { soundManager.playSFX('click'); onLeave(); }} className="mt-8 flex items-center gap-2 text-red-400 hover:text-red-300 border border-red-900/50 bg-red-900/10 px-4 py-2 rounded">
                                    <LogOut size={16} /> Klandan Ayrıl
                                </button>
                            </div>
                        )}

                        {activeTab === 'members' && (
                            <div className="space-y-4">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Oyuncu Adı..."
                                        className="flex-1 bg-[#1f1610] border border-[#3f2e18] rounded px-3 py-2 text-white"
                                        value={inviteInput}
                                        onChange={(e) => setInviteInput(e.target.value)}
                                    />
                                    <button
                                        onClick={() => { soundManager.playSFX('click'); onInvite(inviteInput); setInviteInput(''); }}
                                        className="bg-green-700 hover:bg-green-600 text-white px-4 rounded font-bold flex items-center gap-2"
                                    >
                                        <UserPlus size={16} /> Davet Et
                                    </button>
                                </div>

                                <table className="w-full text-left">
                                    <thead className="text-slate-500 border-b border-[#3f2e18] text-sm">
                                        <tr>
                                            <th className="p-2">İsim</th>
                                            <th className="p-2">Rütbe</th>
                                            <th className="p-2">Seviye</th>
                                            <th className="p-2">Durum</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#3f2e18]">
                                        {guildData.members.map((member, i) => (
                                            <tr key={i} className="hover:bg-[#1f1610]/50">
                                                <td className="p-2 font-bold text-[#e6cba5]">{member.name}</td>
                                                <td className="p-2 text-slate-300">{member.rank}</td>
                                                <td className="p-2 text-slate-400">{member.level}</td>
                                                <td className="p-2">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] ${member.online ? 'bg-green-900/30 text-green-400' : 'bg-slate-800 text-slate-500'}`}>
                                                        {member.online ? 'ÇEVRİMİÇİ' : 'ÇEVRİMDIŞI'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {activeTab === 'treasury' && (
                            <div className="text-center py-12">
                                <Coins size={64} className="mx-auto text-yellow-600 mb-4 opacity-50" />
                                <h3 className="text-xl text-[#e6cba5] font-bold mb-2">Klan Hazinesi</h3>
                                <div className="text-3xl font-mono text-yellow-500 mb-6">{guildData.treasury.toLocaleString()} Altın</div>
                                <p className="text-slate-500 text-sm">Bağış sistemi yakında eklenecek.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GuildModal;
