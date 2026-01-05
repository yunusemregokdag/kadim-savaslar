
import React, { useState } from 'react';
import { PlayerState, Item } from '../types';
import { Hammer, Zap, Wrench, X, Shield, Sword } from 'lucide-react';
import { EnhanceView } from './EnhanceView';
import { RepairView } from './RepairView';
import T4CraftingView from './T4CraftingView';
import { renderItemIcon } from './ui/ItemIcons';

interface BlacksmithViewProps {
    isOpen: boolean;
    onClose: () => void;
    playerState: PlayerState;
    onUpdatePlayer: (updates: Partial<PlayerState>) => void;
    isEmbedded?: boolean;
}

export const BlacksmithView: React.FC<BlacksmithViewProps> = ({
    isOpen,
    onClose,
    playerState,
    onUpdatePlayer,
    isEmbedded = false
}) => {
    const [activeTab, setActiveTab] = useState<'repair' | 'enhance' | 'craft'>('craft');

    if (!isOpen) return null;

    // Handle Craft Success logic (replicated from ActiveZoneView)
    const handleCraftSuccess = (craftedItem: Item, consumedItemIds: string[], goldCost: number, diamondCost: number) => {
        const newInventory = playerState.inventory.filter(item => !consumedItemIds.includes(item.id));
        newInventory.push(craftedItem);
        onUpdatePlayer({
            inventory: newInventory,
            credits: playerState.credits - goldCost,
            gems: playerState.gems - diamondCost
        });
    };



    return (
        <div className={isEmbedded ? "w-full h-full font-sans text-slate-200" : "fixed inset-0 bg-black/90 flex items-center justify-center z-[1000] p-4 font-sans text-slate-200"}>
            <div className={isEmbedded ? "bg-slate-900 w-full h-full flex flex-col overflow-hidden relative" : "bg-slate-900 border-2 border-slate-700 w-full max-w-5xl h-[85vh] rounded-xl shadow-2xl flex flex-col overflow-hidden relative"}>

                {/* HEADLINE */}
                <div className="flex items-center justify-between bg-slate-950 p-4 border-b border-slate-800">
                    <div className="flex items-center gap-4">
                        <div className="bg-amber-700/20 p-2 rounded-lg border border-amber-700/50">
                            <Hammer className="w-6 h-6 text-amber-500" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-amber-500 tracking-wider">DEMİRCİ</h2>
                            <p className="text-xs text-slate-500">Zanaat, Onarım, Yükseltme</p>
                        </div>
                    </div>

                    {/* Currency Display */}
                    <div className="flex gap-4 mr-8">
                        <div className="flex flex-col text-right">
                            <span className="text-[10px] text-slate-500">ALTIN</span>
                            <span className="text-yellow-400 font-mono font-bold">{playerState.credits.toLocaleString()}</span>
                        </div>
                        <div className="flex flex-col text-right">
                            <span className="text-[10px] text-slate-500">ELMAS</span>
                            <span className="text-blue-400 font-mono font-bold">{playerState.gems.toLocaleString()} 💎</span>
                        </div>
                    </div>

                    {!isEmbedded && (
                        <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    )}
                </div>

                {/* SIDEBAR TABS & CONTENT LAYOUT */}
                <div className="flex flex-1 overflow-hidden">
                    {/* SIDEBAR */}
                    <div className="w-20 md:w-48 bg-slate-950 border-r border-slate-800 flex flex-col">
                        <TabButton
                            id="craft" activeTab={activeTab} setActiveTab={setActiveTab}
                            icon={<Hammer />} label="Zanaat" color="text-purple-400"
                        />
                        <TabButton
                            id="enhance" activeTab={activeTab} setActiveTab={setActiveTab}
                            icon={<Zap />} label="Yükselt" color="text-yellow-400"
                        />
                        <TabButton
                            id="repair" activeTab={activeTab} setActiveTab={setActiveTab}
                            icon={<Wrench />} label="Onar" color="text-slate-400"
                        />
                    </div>

                    {/* MAIN CONTENT AREA */}
                    <div className="flex-1 bg-slate-900 overflow-hidden relative flex flex-col">

                        {activeTab === 'craft' && (
                            <T4CraftingView
                                isOpen={true}
                                onClose={() => { }}
                                inventory={playerState.inventory}
                                gold={playerState.credits}
                                diamonds={playerState.gems}
                                charClass={playerState.class || 'warrior'}
                                onCraftSuccess={handleCraftSuccess}
                                isEmbedded={true}
                            />
                        )}

                        {activeTab === 'enhance' && <EnhanceView playerState={playerState} onUpdatePlayer={onUpdatePlayer} />}
                        {activeTab === 'repair' && <RepairView playerState={playerState} onUpdatePlayer={onUpdatePlayer} />}

                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper Components
const TabButton = ({ id, activeTab, setActiveTab, icon, label, color }: any) => (
    <button
        onClick={() => setActiveTab(id)}
        className={`p-4 flex flex-col md:flex-row items-center gap-3 transition-all border-l-4 ${activeTab === id ? `bg-slate-900 border-amber-500 ${color}` : 'bg-transparent border-transparent text-slate-500 hover:bg-slate-900/50 hover:text-slate-300'}`}
    >
        <div className={`${activeTab === id ? 'scale-110' : ''} transition-transform`}>{icon}</div>
        <span className="text-xs md:text-sm font-bold hidden md:block">{label}</span>
    </button>
);

const RepairPlaceholder = ({ playerState }: { playerState: PlayerState }) => (
    <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-4">
        <Wrench className="w-16 h-16 opacity-20" />
        <h3 className="text-xl font-bold">Onarım Tezgahı</h3>
        <p className="max-w-xs text-center text-sm">Eşyalarınızın dayanıklılığını yenilemek için burayı kullanın.</p>
        <button className="px-6 py-2 bg-slate-800 rounded border border-slate-700 text-slate-400 cursor-not-allowed">
            Tümünü Onar (Yakında)
        </button>
    </div>
);

const EnhancePlaceholder = ({ playerState }: { playerState: PlayerState }) => (
    <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-4">
        <Zap className="w-16 h-16 opacity-20 text-yellow-500" />
        <h3 className="text-xl font-bold text-yellow-500/80">Yükseltme Masası</h3>
        <p className="max-w-xs text-center text-sm">Eşya seviyesini (+1..+9) ve nadirliğini artırın.</p>
        <div className="grid grid-cols-5 gap-2 opacity-50">
            {/* Mock visual */}
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-8 h-8 bg-slate-800 rounded border border-slate-700" />)}
        </div>
        <span className="text-xs text-yellow-600 font-mono mt-2">SİSTEM BAKIMDA</span>
    </div>
);
