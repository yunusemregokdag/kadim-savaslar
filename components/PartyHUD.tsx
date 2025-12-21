import React from 'react';
import { Party, PartyMember } from './PartyTypes';
import { Crown, LogOut, UserPlus, Shield, Swords, Zap, Heart, Skull } from 'lucide-react';

interface PartyHUDProps {
    party: Party;
    currentPlayerId: string;
    onLeave: () => void;
    onKick: (memberId: string) => void; // Only if leader
}

const PartyHUD: React.FC<PartyHUDProps> = ({ party, currentPlayerId, onLeave, onKick }) => {
    const isLeader = party.leaderId === currentPlayerId;

    const getClassIcon = (cClass: string) => {
        switch (cClass) {
            case 'warrior': return <Shield size={14} className="text-blue-400" />;
            case 'mage': return <Zap size={14} className="text-purple-400" />;
            case 'ranger': return <Swords size={14} className="text-green-400" />;
            case 'shaman': return <Heart size={14} className="text-red-400" />;
            case 'assassin': return <Skull size={14} className="text-slate-400" />;
            default: return <UserPlus size={14} />;
        }
    };

    return (
        <div className="absolute top-1/4 left-4 z-40 w-64 flex flex-col gap-2 pointer-events-none">
            {/* Header */}
            <div className="bg-slate-900/80 p-2 rounded-t-lg border-b border-slate-700 flex justify-between items-center pointer-events-auto">
                <div className="flex items-center gap-2">
                    <Crown size={16} className="text-yellow-500" />
                    <span className="font-bold text-white text-sm">Grup ({party.members.length}/5)</span>
                </div>
                <button
                    onClick={onLeave}
                    className="p-1 hover:bg-slate-700 rounded text-red-400 transition-colors"
                    title="Gruptan Ayrıl"
                >
                    <LogOut size={16} />
                </button>
            </div>

            {/* Members */}
            <div className="flex flex-col gap-1 pointer-events-auto">
                {party.members.map(member => (
                    <div key={member.id} className="bg-slate-900/60 backdrop-blur-sm p-2 rounded border border-slate-700/50 flex flex-col gap-1">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                {getClassIcon(member.class)}
                                <span className={`text-sm font-bold ${member.id === currentPlayerId ? 'text-yellow-200' : 'text-slate-200'}`}>
                                    {member.nickname}
                                </span>
                                {member.isLeader && <Crown size={10} className="text-yellow-500 mb-2" />}
                            </div>
                            <span className="text-xs text-slate-400">Lv.{member.level}</span>
                        </div>

                        {/* HP Bar */}
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-green-500 transition-all duration-300"
                                style={{ width: `${(member.hp / member.maxHp) * 100}%` }}
                            />
                        </div>

                        {/* Leader Actions */}
                        {isLeader && member.id !== currentPlayerId && (
                            <button
                                onClick={() => onKick(member.id)}
                                className="text-[10px] text-red-500 hover:text-red-400 self-end opacity-0 hover:opacity-100 transition-opacity"
                            >
                                Gruptan At
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* Bonus Info */}
            {party.members.length > 1 && (
                <div className="bg-green-900/40 p-2 rounded text-[10px] text-green-300 text-center border border-green-900/50">
                    <span className="font-bold">AKTİF BONUS:</span> +{(party.members.length - 1) * 10}% EXP & Şeref
                </div>
            )}
        </div>
    );
};

export default PartyHUD;
