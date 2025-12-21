import React, { useState } from 'react';
import { X, MessageCircle, Hammer, ShoppingBag, Scroll, Swords, Building, Coins, ChevronRight } from 'lucide-react';
import { NPCData, NPCType, PlayerState, Quest, Item } from '../types';
import { v4 as uuidv4 } from 'uuid';

// NPC Registry with Model Paths
export const NPC_REGISTRY: Record<string, NPCData> = {
    quest_giver: {
        id: 'npc_quest_master',
        name: 'Görev Ustası Kemal',
        type: 'quest_giver',
        modelPath: '/models/npcs/plugins/ModelEngine/blueprints/lr_paladin.gltf',
        dialogues: [
            'Cesur savaşçı! Krallık senin yardımına ihtiyaç duyuyor.',
            'Görevlerini tamamla, bol ödüller kazan!',
            'Düşmanları yok et, şerefini yükselt!'
        ],
        zoneId: 11
    },
    arena_master: {
        id: 'npc_arena',
        name: 'Arena Ustası Kılıç',
        type: 'arena_master',
        modelPath: '/models/npcs/plugins/ModelEngine/blueprints/lr_assassin.gltf',
        dialogues: [
            'PvP arenasına hoş geldin!',
            'Burada gerçek savaşçılar yarışır.',
            'Düelloya hazır mısın?'
        ],
        zoneId: 44
    },
    guild_master: {
        id: 'npc_guild',
        name: 'Lonca Ustası',
        type: 'guild_master',
        modelPath: '/models/npcs/plugins/ModelEngine/blueprints/lr_acolyte.gltf',
        dialogues: [
            'Klan kurmak ister misin?',
            'Birlikte daha güçlüyüz!',
            'Klan savaşları yakında başlıyor.'
        ],
        zoneId: 11
    }
};

// Available Quests from NPC
const NPC_QUESTS: Quest[] = [
    {
        id: 'daily_hunt',
        title: 'Günlük Avlanma',
        description: '20 düşman öldür',
        targetEnemyName: 'Düşman',
        requiredCount: 20,
        currentCount: 0,
        rewardGold: 500,
        rewardXp: 200,
        rewardHonor: 25,
        isCompleted: false
    },
    {
        id: 'elite_bounty',
        title: 'Elit Ödül Avı',
        description: '5 elit düşman öldür',
        targetEnemyName: 'Elit',
        requiredCount: 5,
        currentCount: 0,
        rewardGold: 2000,
        rewardXp: 1000,
        rewardHonor: 100,
        isCompleted: false
    },
    {
        id: 'boss_challenge',
        title: 'Boss Meydan Okuması',
        description: '1 boss öldür',
        targetEnemyName: 'Boss',
        requiredCount: 1,
        currentCount: 0,
        rewardGold: 5000,
        rewardXp: 3000,
        rewardHonor: 250,
        isCompleted: false
    }
];

interface NPCInteractionModalProps {
    npc: NPCData;
    playerState: PlayerState;
    onClose: () => void;
    onOpenBlacksmith: () => void;
    onOpenShop: () => void;
    onAcceptQuest: (quest: Quest) => void;
    onOpenGuild: () => void;
    onOpenArena: () => void;
}

export const NPCInteractionModal: React.FC<NPCInteractionModalProps> = ({
    npc,
    playerState,
    onClose,
    onOpenBlacksmith,
    onOpenShop,
    onAcceptQuest,
    onOpenGuild,
    onOpenArena
}) => {
    const [currentDialogue, setCurrentDialogue] = useState(0);
    const [showQuests, setShowQuests] = useState(false);

    const getTypeIcon = (type: NPCType) => {
        switch (type) {
            case 'blacksmith': return Hammer;
            case 'merchant': return ShoppingBag;
            case 'quest_giver': return Scroll;
            case 'arena_master': return Swords;
            case 'guild_master': return Building;
            default: return MessageCircle;
        }
    };

    const getTypeColor = (type: NPCType) => {
        switch (type) {
            case 'blacksmith': return 'from-orange-900/50 to-red-900/50';
            case 'merchant': return 'from-green-900/50 to-teal-900/50';
            case 'quest_giver': return 'from-yellow-900/50 to-amber-900/50';
            case 'arena_master': return 'from-red-900/50 to-purple-900/50';
            case 'guild_master': return 'from-blue-900/50 to-indigo-900/50';
            default: return 'from-slate-900/50 to-slate-800/50';
        }
    };

    const Icon = getTypeIcon(npc.type);

    const handleAction = () => {
        switch (npc.type) {
            case 'blacksmith':
                onOpenBlacksmith();
                onClose();
                break;
            case 'merchant':
                onOpenShop();
                onClose();
                break;
            case 'quest_giver':
                setShowQuests(true);
                break;
            case 'arena_master':
                onOpenArena();
                onClose();
                break;
            case 'guild_master':
                onOpenGuild();
                onClose();
                break;
        }
    };

    const getActionLabel = () => {
        switch (npc.type) {
            case 'blacksmith': return 'Demirciye Git';
            case 'merchant': return 'Mağazayı Aç';
            case 'quest_giver': return 'Görevlere Bak';
            case 'arena_master': return 'Arenaya Gir';
            case 'guild_master': return 'Klana Bak';
            default: return 'Devam Et';
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className={`bg-gradient-to-b ${getTypeColor(npc.type)} border border-slate-600 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden`}>
                {/* Header */}
                <div className={`bg-gradient-to-r ${getTypeColor(npc.type)} p-6 border-b border-slate-700/50`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-black/30 rounded-full flex items-center justify-center border-2 border-slate-500">
                                <Icon className="text-white" size={32} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">{npc.name}</h2>
                                <p className="text-sm text-slate-300 capitalize">{npc.type.replace('_', ' ')}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                            <X className="text-slate-400" size={24} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {showQuests ? (
                        // Quest Selection
                        <div className="space-y-3">
                            <h3 className="text-lg font-bold text-yellow-400 mb-4">Mevcut Görevler</h3>
                            {NPC_QUESTS.map(quest => (
                                <div
                                    key={quest.id}
                                    className="p-4 bg-black/30 rounded-xl border border-slate-700 hover:border-yellow-600 transition-all"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-bold text-white">{quest.title}</h4>
                                            <p className="text-sm text-slate-400">{quest.description}</p>
                                            <div className="flex gap-4 mt-2 text-xs">
                                                <span className="text-yellow-400">{quest.rewardGold} Altın</span>
                                                <span className="text-blue-400">{quest.rewardXp} XP</span>
                                                <span className="text-purple-400">{quest.rewardHonor} Şeref</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                onAcceptQuest(quest);
                                                onClose();
                                            }}
                                            className="p-3 bg-yellow-600 hover:bg-yellow-500 rounded-lg transition-all"
                                        >
                                            <ChevronRight className="text-white" size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <button
                                onClick={() => setShowQuests(false)}
                                className="w-full py-2 text-slate-400 hover:text-white transition-colors text-sm"
                            >
                                ← Geri Dön
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Dialogue */}
                            <div className="bg-black/30 p-4 rounded-xl border border-slate-700 mb-6">
                                <p className="text-white text-lg italic">"{npc.dialogues[currentDialogue]}"</p>
                            </div>

                            {/* Navigation */}
                            {npc.dialogues.length > 1 && (
                                <div className="flex justify-center gap-2 mb-6">
                                    {npc.dialogues.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setCurrentDialogue(idx)}
                                            className={`w-3 h-3 rounded-full transition-all ${idx === currentDialogue ? 'bg-yellow-500' : 'bg-slate-600 hover:bg-slate-500'
                                                }`}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Action Button */}
                            <button
                                onClick={handleAction}
                                className="w-full py-4 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl font-bold text-white text-lg shadow-lg hover:from-yellow-500 hover:to-orange-500 active:scale-95 transition-all flex items-center justify-center gap-3"
                            >
                                <Icon size={20} />
                                {getActionLabel()}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NPCInteractionModal;
