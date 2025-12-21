
import React from 'react';
import { PlayerState, Item, Equipment } from '../types';
import { X, Droplet, Box, Bird, Feather, Shirt } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import { VoxelSpartan } from './VoxelSpartan';

interface InventoryModalProps {
    playerState: PlayerState;
    onClose?: () => void;
    isOverlay?: boolean;
    onEquip?: (item: Item) => void;
    onUnequip?: (slot: keyof Equipment) => void;
    onUse?: (item: Item) => void;
    onEquipSkin?: (skinId: string | null) => void;
}


// Minecraft-style Pixel Art Icons
const PixelHelmet = ({ color = '#6b7280' }: { color?: string }) => (
    <svg viewBox="0 0 16 16" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
        <rect x="3" y="2" width="10" height="3" fill={color} />
        <rect x="2" y="5" width="12" height="6" fill={color} />
        <rect x="3" y="11" width="10" height="3" fill={color} />
        <rect x="4" y="8" width="3" height="3" fill="#1a1a1a" />
        <rect x="9" y="8" width="3" height="3" fill="#1a1a1a" />
    </svg>
);

const PixelChestplate = ({ color = '#6b7280' }: { color?: string }) => (
    <svg viewBox="0 0 16 16" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
        <rect x="3" y="1" width="10" height="2" fill={color} />
        <rect x="2" y="3" width="3" height="6" fill={color} />
        <rect x="11" y="3" width="3" height="6" fill={color} />
        <rect x="5" y="3" width="6" height="11" fill={color} />
        <rect x="6" y="4" width="4" height="2" fill="#2a2a2a" />
    </svg>
);

const PixelLeggings = ({ color = '#6b7280' }: { color?: string }) => (
    <svg viewBox="0 0 16 16" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
        <rect x="4" y="1" width="8" height="3" fill={color} />
        <rect x="4" y="4" width="3" height="11" fill={color} />
        <rect x="9" y="4" width="3" height="11" fill={color} />
    </svg>
);

const PixelBoots = ({ color = '#6b7280' }: { color?: string }) => (
    <svg viewBox="0 0 16 16" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
        <rect x="2" y="4" width="4" height="8" fill={color} />
        <rect x="10" y="4" width="4" height="8" fill={color} />
        <rect x="1" y="12" width="6" height="3" fill={color} />
        <rect x="9" y="12" width="6" height="3" fill={color} />
    </svg>
);

const PixelSword = ({ color = '#ef4444' }: { color?: string }) => (
    <svg viewBox="0 0 16 16" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
        <rect x="12" y="1" width="2" height="2" fill={color} />
        <rect x="10" y="3" width="2" height="2" fill={color} />
        <rect x="8" y="5" width="2" height="2" fill={color} />
        <rect x="6" y="7" width="2" height="2" fill={color} />
        <rect x="4" y="9" width="2" height="2" fill="#8b5cf6" />
        <rect x="2" y="11" width="2" height="2" fill="#a16207" />
        <rect x="3" y="13" width="2" height="2" fill="#a16207" />
    </svg>
);

const PixelNecklace = ({ color = '#a855f7' }: { color?: string }) => (
    <svg viewBox="0 0 16 16" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
        <rect x="4" y="2" width="8" height="2" fill="#fbbf24" />
        <rect x="3" y="4" width="2" height="4" fill="#fbbf24" />
        <rect x="11" y="4" width="2" height="4" fill="#fbbf24" />
        <rect x="5" y="8" width="6" height="2" fill="#fbbf24" />
        <rect x="6" y="10" width="4" height="4" fill={color} />
    </svg>
);

const PixelEarring = ({ color = '#ec4899' }: { color?: string }) => (
    <svg viewBox="0 0 16 16" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
        <rect x="3" y="2" width="3" height="3" fill="#fbbf24" />
        <rect x="4" y="5" width="2" height="3" fill="#fbbf24" />
        <rect x="3" y="8" width="4" height="4" fill={color} />
        <rect x="10" y="2" width="3" height="3" fill="#fbbf24" />
        <rect x="11" y="5" width="2" height="3" fill="#fbbf24" />
        <rect x="10" y="8" width="4" height="4" fill={color} />
    </svg>
);

const InventoryModal: React.FC<InventoryModalProps> = ({ playerState, onClose, isOverlay = false, onEquip, onUnequip, onUse, onEquipSkin }) => {
    const [activeTab, setActiveTab] = React.useState<'inventory' | 'skins'>('inventory');

    const getItemIcon = (item: Item) => {
        if (item.image) {
            return <img src={item.image} alt={item.name} className="w-full h-full object-contain p-1" />;
        }

        const rarityColors: Record<string, string> = {
            common: '#6b7280',
            uncommon: '#22c55e',
            rare: '#3b82f6',
            epic: '#a855f7',
            legendary: '#f97316',
            ancient: '#ec4899'
        };
        const color = rarityColors[item.rarity] || '#6b7280';

        switch (item.type) {
            case 'weapon': return <PixelSword color={color} />;
            case 'armor': return <PixelChestplate color={color} />;
            case 'helmet': return <PixelHelmet color={color} />;
            case 'pants': return <PixelLeggings color={color} />;
            case 'boots': return <PixelBoots color={color} />;
            case 'necklace': return <PixelNecklace color={color} />;
            case 'earring': return <PixelEarring color={color} />;
            case 'consumable': return <Droplet className="text-green-400 w-6 h-6" />;
            case 'pet_egg': return <Bird className="text-green-400 w-6 h-6" />;
            case 'wing_fragment': return <Feather className="text-yellow-400 w-6 h-6" />;
            default: return <Box className="text-slate-500 w-6 h-6" />;
        }
    };

    const getRarityColor = (rarity: string) => {
        switch (rarity) {
            case 'common': return 'text-slate-400 border-slate-600';
            case 'uncommon': return 'text-green-400 border-green-600';
            case 'rare': return 'text-blue-400 border-blue-600';
            case 'legendary': return 'text-orange-400 border-orange-600 shadow-[0_0_10px_orange]';
            case 'ancient': return 'text-purple-400 border-purple-600 shadow-[0_0_15px_purple]';
            default: return 'text-slate-400 border-slate-600';
        }
    };

    return (
        <div className={`${isOverlay ? 'fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4' : 'w-full h-full'}`}>

            <div className={`bg-[#1a120b] w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-xl border-2 border-[#5e4b35] shadow-2xl flex flex-col ${isOverlay ? 'animate-[fadeIn_0.3s]' : ''}`}>

                {isOverlay && (
                    <div className="flex justify-between items-center p-4 border-b border-[#3f2e18] bg-[#0f0a06]">
                        <h2 className="text-xl rpg-font text-[#e6cba5] flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-yellow-500" /> Kahraman Envanteri</h2>
                        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                    </div>
                )}

                <div className="flex flex-col md:flex-row h-full overflow-hidden">
                    {/* CHARACTER PREVIEW PANEL */}
                    <div className="w-full md:w-1/3 bg-[#0a0705] relative border-r border-[#3f2e18] flex flex-col items-center justify-center p-4">
                        <div className="absolute top-2 left-2 text-xs text-slate-500 uppercase font-bold tracking-widest">Önizleme</div>
                        <div className="w-full h-full min-h-[400px] relative overflow-hidden rounded-lg shadow-2xl border border-slate-800 bg-black">
                            {/* Radial Gradient Background */}
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#3f2e18_0%,_#0a0705_100%)] z-0" />

                            <React.Suspense fallback={<div className="text-white relative z-10 flex items-center justify-center h-full">Yükleniyor...</div>}>
                                <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, toneMapping: 3 }} className="z-10 relative">
                                    <PerspectiveCamera makeDefault position={[0, 1.6, 5]} fov={42} />
                                    <ambientLight intensity={0.8} color="#ffffff" />
                                    <spotLight position={[5, 10, 5]} angle={0.5} penumbra={1} intensity={2} castShadow shadow-bias={-0.0001} />
                                    <pointLight position={[-5, 5, -5]} intensity={1.5} color="#fbbf24" />
                                    <pointLight position={[0, -2, 2]} intensity={0.8} color="#3b82f6" />
                                    <Environment preset="city" />

                                    <group position={[0, -1.1, 0]}>
                                        <VoxelSpartan
                                            position={[0, 0, 0]}
                                            rotation={[0, Math.PI + 0.1, 0]}
                                            charClass={playerState.class || 'warrior'}
                                            weaponItem={playerState.equipment.weapon}
                                            armorItem={playerState.equipment.armor}
                                            helmetItem={playerState.equipment.helmet}
                                            pantsItem={playerState.equipment.pants}
                                            wingType={playerState.equippedWing}
                                            petType={playerState.equippedPet}
                                            skinId={playerState.equippedSkin}
                                            isAttacking={false}
                                            isMoving={false}
                                        />
                                        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
                                            <planeGeometry args={[2, 2]} />
                                            <shadowMaterial opacity={0.4} />
                                        </mesh>
                                    </group>

                                    <OrbitControls enableZoom={true} minZoom={0.8} maxZoom={2} enablePan={false} minPolarAngle={Math.PI / 3} maxPolarAngle={Math.PI / 1.8} enableRotate={true} target={[0, 0, 0]} />
                                </Canvas>
                            </React.Suspense>
                        </div>
                        {/* Equipped Items Summary */}
                        <div className="grid grid-cols-4 gap-2 mt-4">
                            {Object.entries(playerState.equipment).map(([slot, item]) => (
                                item ? (
                                    <div key={slot} className="w-10 h-10 border border-slate-700 bg-slate-900 rounded cursor-pointer relative group" onClick={() => onUnequip && onUnequip(slot as keyof Equipment)} title={`Çıkar: ${item.name}`}>
                                        <div className="absolute -top-1 -right-1 bg-red-500 rounded-full w-3 h-3 flex items-center justify-center text-[8px] text-white opacity-0 group-hover:opacity-100">x</div>
                                        <div className="flex items-center justify-center w-full h-full p-1 opacity-75 group-hover:opacity-100 transition-opacity">
                                            {React.cloneElement(getItemIcon(item) as any, { size: 16 })}
                                        </div>
                                    </div>
                                ) : (
                                    <div key={slot} className="w-10 h-10 border border-slate-800 bg-black/20 rounded flex items-center justify-center text-[9px] text-slate-700 uppercase">
                                        {slot.substring(0, 2)}
                                    </div>
                                )
                            ))}
                        </div>
                    </div>

                    {/* INVENTORY / SKINS LIST */}
                    <div className="flex-1 flex flex-col bg-[#0f0a06] overflow-hidden">

                        {/* TABS */}
                        <div className="flex border-b border-[#3f2e18]">
                            <button onClick={() => setActiveTab('inventory')} className={`flex-1 py-3 text-sm font-bold uppercase transition-colors ${activeTab === 'inventory' ? 'bg-[#2a1f15] text-[#e6cba5] border-b-2 border-yellow-600' : 'text-slate-500 hover:text-slate-300'}`}>
                                🎒 Çanta ({playerState.inventory.length})
                            </button>
                            <button onClick={() => setActiveTab('skins')} className={`flex-1 py-3 text-sm font-bold uppercase transition-colors ${activeTab === 'skins' ? 'bg-[#2a1f15] text-[#e6cba5] border-b-2 border-yellow-600' : 'text-slate-500 hover:text-slate-300'}`}>
                                👕 Kostümler ({playerState.ownedSkins.length})
                            </button>
                        </div>

                        {/* CONTENT */}
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">

                            {/* SKINS TAB */}
                            {activeTab === 'skins' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div onClick={() => onEquipSkin && onEquipSkin(null)} className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center gap-2 relative group hover:bg-[#1a120b] ${playerState.equippedSkin === null ? 'border-green-500 bg-[#1a120b] shadow-[0_0_15px_green]' : 'border-slate-700 bg-black/20'}`}>
                                        <Shirt size={32} className={playerState.equippedSkin === null ? 'text-green-400' : 'text-slate-500'} />
                                        <span className={`font-bold text-sm ${playerState.equippedSkin === null ? 'text-green-400' : 'text-slate-400'}`}>Varsayılan</span>
                                        {playerState.equippedSkin === null && <div className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full animate-pulse" />}
                                    </div>

                                    {playerState.ownedSkins.map(skinId => (
                                        <div key={skinId} onClick={() => onEquipSkin && onEquipSkin(skinId)} className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center gap-2 relative group hover:bg-[#1a120b] ${playerState.equippedSkin === skinId ? 'border-green-500 bg-[#1a120b] shadow-[0_0_15px_green]' : 'border-slate-700 bg-black/20'}`}>
                                            <Shirt size={32} className={playerState.equippedSkin === skinId ? 'text-green-400' : 'text-purple-400'} />
                                            <span className={`font-bold text-sm text-center ${playerState.equippedSkin === skinId ? 'text-green-400' : 'text-purple-300'}`}>
                                                {skinId.replace('_bundle', '').toUpperCase()} KOSTÜMÜ
                                            </span>
                                            {playerState.equippedSkin === skinId && <div className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full animate-pulse" />}
                                        </div>
                                    ))}

                                    {playerState.ownedSkins.length === 0 && (
                                        <div className="col-span-2 text-center text-slate-500 py-10 italic">
                                            Henüz hiç kostümün yok. <br /> Premium Market'ten satın alabilirsin!
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* INVENTORY TAB */}
                            {activeTab === 'inventory' && (
                                <>
                                    {playerState.inventory.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full text-slate-600 min-h-[300px]">
                                            <div className="text-4xl mb-2">🎒</div>
                                            <p>Çantan bomboş...</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {playerState.inventory.map((item, idx) => {
                                                const canEquip = (item.type === 'weapon' || item.type === 'armor' || item.type === 'helmet' || item.type === 'pants' || item.type === 'boots' || item.type === 'necklace' || item.type === 'earring');
                                                const canUse = item.type === 'consumable';
                                                const rarityClass = getRarityColor(item.rarity);
                                                const isPlus = (item.plus || 0) > 0;

                                                return (
                                                    <div key={item.id + idx} className={`flex items-center justify-between p-3 bg-[#1a120b] border border-[#3f2e18] rounded-lg group hover:border-yellow-600 hover:bg-[#2a1f15] transition-all`}>
                                                        <div className="flex items-center gap-4">
                                                            <div className={`w-12 h-12 rounded bg-black/40 border-2 flex items-center justify-center shadow-inner ${rarityClass}`}>
                                                                {getItemIcon(item)}
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className={`font-bold text-sm ${item.rarity === 'legendary' ? 'text-orange-400' : item.rarity === 'ancient' ? 'text-purple-400' : 'text-[#e6cba5]'}`}>
                                                                        {item.name}
                                                                    </span>
                                                                    {isPlus && <span className="text-xs bg-yellow-900/40 text-yellow-400 px-1.5 rounded border border-yellow-700">+{item.plus}</span>}
                                                                </div>
                                                                <div className="text-[10px] text-slate-500 flex gap-2 mt-0.5">
                                                                    <span className="uppercase">{item.rarity}</span> • <span>Tier {item.tier}</span>
                                                                </div>
                                                                <div className="flex flex-wrap gap-1 mt-1 text-[10px]">
                                                                    {item.stats ? (
                                                                        <>
                                                                            {item.stats.damage && <span className="text-red-400 font-bold">+{item.stats.damage} Hasar</span>}
                                                                            {item.stats.defense && <span className="text-blue-400 font-bold">+{item.stats.defense} Zırh</span>}
                                                                            {item.stats.hp && <span className="text-green-400 font-bold">+{item.stats.hp} Can</span>}
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            {item.type === 'weapon' && <span className="text-red-400 font-bold">Hasar</span>}
                                                                            {item.type === 'armor' && <span className="text-blue-400 font-bold">Zırh</span>}
                                                                            {item.type === 'consumable' && <span className="text-green-400 font-bold">Kullanılabilir</span>}
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {canEquip && (
                                                                <button onClick={() => onEquip && onEquip(item)} className="px-4 py-2 bg-yellow-700/20 text-yellow-500 border border-yellow-700/50 rounded hover:bg-yellow-600 hover:text-black font-bold text-xs transition-colors">
                                                                    KUŞAN
                                                                </button>
                                                            )}
                                                            {canUse && (
                                                                <button onClick={() => onUse && onUse(item)} className="px-4 py-2 bg-green-700/20 text-green-500 border border-green-700/50 rounded hover:bg-green-600 hover:text-black font-bold text-xs transition-colors">
                                                                    KULLAN
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </>
                            )}

                        </div>
                        {/* Footer info */}
                        <div className="p-3 bg-[#140e08] border-t border-[#3f2e18] text-center text-xs text-slate-500">
                            {playerState.inventory.length} / {50 + (playerState.premiumBenefits?.inventorySlots || 0)} Eşya Kapasitesi
                            {playerState.premiumBenefits?.inventorySlots && (
                                <span className="text-green-400 ml-2">(+{playerState.premiumBenefits.inventorySlots} Premium)</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InventoryModal;
