import React from 'react';
import { X, Sword, Target, Skull, Zap, Star, Coins, Trophy } from 'lucide-react';
import { Achievement } from '../types';
import { ACHIEVEMENTS_LIST } from '../constants';

interface AchievementsModalProps {
    playerAchievements?: Achievement[];
    onClose: () => void;
}

const AchievementsModal: React.FC<AchievementsModalProps> = ({ playerAchievements, onClose }) => {
    // Display list logic: Merge static list with player progress
    const displayList = ACHIEVEMENTS_LIST.map(staticAch => {
        const playerAch = playerAchievements?.find(pa => pa.id === staticAch.id);

        return {
            ...staticAch,
            currentProgress: playerAch?.currentProgress || 0,
            isCompleted: playerAch?.isCompleted || false
        };
    });

    const getIcon = (iconName: string) => {
        switch (iconName) {
            case 'Sword': return <Sword size={24} className="text-red-400" />;
            case 'Target': return <Target size={24} className="text-orange-400" />;
            case 'Skull': return <Skull size={24} className="text-gray-400" />;
            case 'Zap': return <Zap size={24} className="text-yellow-400" />;
            case 'Star': return <Star size={24} className="text-purple-400" />;
            case 'Coins': return <Coins size={24} className="text-yellow-200" />;
            default: return <Trophy size={24} className="text-blue-400" />;
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-2xl bg-[#0f172a] border-2 border-slate-700 rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center p-4 bg-slate-900 border-b border-slate-700">
                    <div className="flex items-center gap-2">
                        <Trophy className="text-yellow-500" />
                        <h2 className="text-xl font-bold text-white tracking-widest uppercase">Başarımlar</h2>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {displayList.map((ach) => {
                        const progressPercent = Math.min(100, Math.max(0, (ach.currentProgress / ach.requirement) * 100));

                        return (
                            <div key={ach.id} className={`relative p-4 rounded-lg border ${ach.isCompleted ? 'bg-slate-800/50 border-green-900/50' : 'bg-slate-900/50 border-slate-800'}`}>
                                <div className="flex items-start gap-4">
                                    {/* Icon Box */}
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${ach.isCompleted ? 'bg-gradient-to-br from-green-900 to-slate-900 shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'bg-slate-800 grayscale'}`}>
                                        {getIcon(ach.icon)}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h3 className={`font-bold ${ach.isCompleted ? 'text-green-400' : 'text-slate-200'}`}>{ach.name}</h3>
                                            {ach.isCompleted && <span className="text-[10px] bg-green-900 text-green-200 px-2 py-0.5 rounded border border-green-700">TAMAMLANDI</span>}
                                        </div>
                                        <p className="text-xs text-slate-400 mt-0.5">{ach.description}</p>

                                        {/* Rewards */}
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {ach.rewardGold && <span className="text-[10px] text-yellow-300 flex items-center gap-1"><Coins size={10} /> +{ach.rewardGold} Altın</span>}
                                            {ach.rewardExp && <span className="text-[10px] text-purple-300 flex items-center gap-1"><Zap size={10} /> +{ach.rewardExp} XP</span>}
                                            {ach.rewardGems && <span className="text-[10px] text-blue-300 flex items-center gap-1"><Star size={10} /> +{ach.rewardGems} Elmas</span>}
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="mt-3 relative h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                                            <div
                                                className={`absolute top-0 left-0 h-full transition-all duration-500 ${ach.isCompleted ? 'bg-green-500' : 'bg-blue-600'}`}
                                                style={{ width: `${progressPercent}%` }}
                                            />
                                        </div>
                                        <div className="text-[10px] text-right text-slate-500 mt-1">
                                            {ach.currentProgress} / {ach.requirement}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default AchievementsModal;
