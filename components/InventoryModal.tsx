import React, { useState, useMemo, Suspense } from 'react';
import { PlayerState, Item, Equipment, ItemStats } from '../types';
import { getItemDisplayData } from '../utils/ItemDisplayAdapter';
import { X, Search, Sword, Shield, Zap, Heart, Star, Lock, Info, Filter, ArrowUpDown, User } from 'lucide-react';
import { renderItemIcon } from './ui/ItemIcons';
import { ItemTooltipContent } from './ui/ItemTooltip';
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
    onLock?: (itemId: string, locked: boolean) => void;
}

const RARITY_COLORS: Record<string, string> = {
    common: 'border-slate-600',
    uncommon: 'border-green-600 shadow-[0_0_5px_rgba(34,197,94,0.3)]',
    rare: 'border-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]',
    epic: 'border-purple-600 shadow-[0_0_10px_rgba(147,51,234,0.5)]',
    legendary: 'border-orange-600 shadow-[0_0_15px_rgba(234,88,12,0.6)]',
    ancient: 'border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.7)]',
};

const RARITY_TEXT_COLORS: Record<string, string> = {
    common: 'text-slate-400',
    uncommon: 'text-green-400',
    rare: 'text-blue-400',
    epic: 'text-purple-400',
    legendary: 'text-orange-400',
    ancient: 'text-red-500',
};

type InventoryFilter = 'all' | 'gear' | 'consumable' | 'material';

const InventoryModal: React.FC<InventoryModalProps> = ({
    playerState,
    onClose,
    isOverlay = false,
    onEquip,
    onUnequip,
    onUse,
    onEquipSkin,
    onLock
}) => {
    // State
    const [hoveredItem, setHoveredItem] = useState<Item | null>(null); // For PC Hover
    const [clickedItem, setClickedItem] = useState<Item | null>(null); // For Mobile Stickiness
    const [filter, setFilter] = useState<InventoryFilter>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'rarity' | 'tier' | 'newest'>('newest');
    const [lockedItems, setLockedItems] = useState<Set<string>>(new Set());

    // --- Helper for Tooltip Display ---
    const activeTooltipItem = clickedItem || hoveredItem;

    // --- Actions ---
    const handleItemAction = (item: Item) => {
        // Double click / Tap action
        if (item.type === 'consumable' && onUse) {
            onUse(item);
        } else if (onEquip) {
            onEquip(item);
        }
    };

    const handleUnequipAction = (slot: keyof Equipment) => {
        if (onUnequip) onUnequip(slot);
    };

    const toggleLock = (itemId: string) => {
        const next = new Set(lockedItems);
        if (next.has(itemId)) next.delete(itemId);
        else next.add(itemId);
        setLockedItems(next);
        if (onLock) onLock(itemId, !next.has(itemId));
    };

    // Filter Logic
    const filteredInventory = useMemo(() => {
        let items = [...playerState.inventory];

        // 1. Text Search
        if (searchQuery) {
            const low = searchQuery.toLowerCase();
            items = items.filter(i => i.name.toLowerCase().includes(low));
        }

        // 2. Category Filter
        if (filter !== 'all') {
            items = items.filter(i => {
                if (filter === 'gear') return ['weapon', 'helmet', 'armor', 'pants', 'boots', 'necklace', 'earring'].includes(i.type);
                if (filter === 'consumable') return i.type === 'consumable';
                if (filter === 'material') return i.type === 'material';
                return true;
            });
        }

        // 3. Sort
        return items.sort((a, b) => {
            if (sortBy === 'rarity') {
                const rMap: Record<string, number> = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4, ancient: 5 };
                if (rMap[b.rarity] !== rMap[a.rarity]) return (rMap[b.rarity] || 0) - (rMap[a.rarity] || 0);
            }
            if (sortBy === 'tier') return b.tier - a.tier;
            return 0; // newest/default
        });
    }, [playerState.inventory, filter, searchQuery, sortBy]);


    // --- RENDER HELPERS ---
    const renderInventorySlot = (item: Item, index: number) => {
        const rarityClass = RARITY_COLORS[item.rarity] || 'border-slate-700';
        const isSelected = clickedItem?.id === item.id;
        const isLocked = lockedItems.has(item.id);

        return (
            <div
                key={item.id}
                className={`
                    relative w-14 h-14 md:w-16 md:h-16 bg-[#1a1410] rounded-lg border-2 
                    flex items-center justify-center cursor-pointer transition-all group
                    ${isSelected ? 'border-yellow-500 scale-110 z-20 shadow-[0_0_20px_rgba(234,179,8,0.4)]' : rarityClass}
                    hover:scale-105 hover:z-10 hover:border-yellow-600/70
                `}
                onMouseEnter={() => setHoveredItem(item)}
                onMouseLeave={() => setHoveredItem(null)}
                onClick={() => {
                    if (clickedItem?.id === item.id) setClickedItem(null);
                    else setClickedItem(item);
                }}
                onDoubleClick={(e) => {
                    e.stopPropagation();
                    handleItemAction(item);
                    setClickedItem(null);
                }}
            >
                {/* Item Icon */}
                <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center">
                    {renderItemIcon(item)}
                </div>

                {/* Plus Badge */}
                {item.plus > 0 && (
                    <div className="absolute -top-1 -right-1 bg-black/90 px-1 rounded text-[9px] font-bold text-yellow-400 border border-yellow-900 shadow-sm z-10">
                        +{item.plus}
                    </div>
                )}

                {/* Tier Badge */}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-[#1a1410] px-1 rounded text-[8px] font-bold text-slate-500 border border-[#3f2e24] z-10">
                    T{item.tier}
                </div>

                {/* Lock indicator */}
                {isLocked && (
                    <div className="absolute top-0 left-0 p-0.5">
                        <Lock size={10} className="text-red-500" />
                    </div>
                )}

                {/* Quantity for consumables */}
                {item.type === 'consumable' && (item as any).quantity > 1 && (
                    <div className="absolute bottom-0 right-0 bg-black/80 px-1 rounded-tl text-[9px] font-bold text-white">
                        x{(item as any).quantity}
                    </div>
                )}
            </div>
        );
    };

    const renderEquipmentSlot = (slotName: keyof Equipment, label: string) => {
        const item = playerState.equipment[slotName];

        return (
            <div
                className={`
                    relative w-14 h-14 md:w-16 md:h-16 bg-[#1a1410] rounded-lg border border-[#3f2e24] 
                    flex items-center justify-center cursor-pointer hover:border-yellow-600/50 transition-colors
                    ${clickedItem?.id === item?.id ? 'border-yellow-500 shadow-lg scale-105 z-10' : ''}
                `}
                onMouseEnter={() => item && setHoveredItem(item)}
                onMouseLeave={() => setHoveredItem(null)}
                onClick={() => {
                    if (item) {
                        if (clickedItem?.id === item.id) setClickedItem(null);
                        else setClickedItem(item);
                    }
                }}
                onDoubleClick={(e) => {
                    e.stopPropagation();
                    if (item) {
                        handleUnequipAction(slotName);
                        setClickedItem(null);
                    }
                }}
                title={label}
            >
                {item ? (
                    <>
                        <div className="absolute inset-0 bg-slate-900/40 rounded-lg"></div>
                        <div className={`absolute inset-0 border-2 rounded-lg opacity-70 ${RARITY_COLORS[item.rarity] || 'border-slate-600'}`}></div>
                        <div className="relative z-10 text-white transform scale-110 md:scale-125">
                            {renderItemIcon(item)}
                        </div>
                        {item.plus > 0 && <span className="absolute bottom-0 right-1 text-[9px] md:text-[10px] font-bold text-yellow-400 drop-shadow-md">+{item.plus}</span>}
                    </>
                ) : (
                    <span className="text-[9px] text-slate-600 font-bold uppercase select-none">{label}</span>
                )}
            </div>
        );
    };

    // --- MAIN RENDER ---
    return (
        <div className={`fixed inset-0 z-[200] flex items-center justify-center p-2 md:p-6 pointer-events-none`}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 pointer-events-auto backdrop-blur-sm" onClick={onClose} />

            {/* Character & Inventory Container */}
            <div className={`relative w-full max-w-6xl h-[85vh] bg-[#0c0906] grid grid-cols-1 md:grid-cols-[320px_1fr] rounded-xl overflow-hidden shadow-2xl border border-yellow-900/30 pointer-events-auto`}>

                {/* CLOSE BUTTON */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 z-50 p-2 bg-red-900/20 hover:bg-red-900/50 text-red-500 rounded-lg transition-colors border border-red-900/30"
                >
                    <X size={20} />
                </button>

                {/* ════ LEFT COLUMN: CHARACTER ════ */}
                <div className="bg-[#100c08] border-b md:border-b-0 md:border-r border-[#3f2e24] flex flex-col relative overflow-hidden">

                    {/* Character Header & 3D Preview */}
                    <div className="relative h-[280px] md:h-[350px] bg-gradient-to-b from-[#1a1410] to-[#100c08] border-b border-[#3f2e24]/50">
                        <div className="absolute top-4 left-4 z-10">
                            <h2 className="text-white font-bold text-lg leading-none tracking-wider drop-shadow-md">LV.{playerState.level} {playerState.class?.toUpperCase()}</h2>
                            <p className="text-[#8a725f] text-xs mt-1 font-semibold">{playerState.nickname}</p>
                        </div>

                        <div className="w-full h-full cursor-move">
                            <Canvas shadows dpr={[1, 1.5]}>
                                <PerspectiveCamera makeDefault position={[0, 1.2, 3.8]} fov={35} />
                                <ambientLight intensity={0.6} />
                                <pointLight position={[5, 10, 5]} intensity={1.2} />
                                <spotLight position={[-5, 5, 5]} angle={0.3} penumbra={1} intensity={1} castShadow />
                                <Suspense fallback={null}>
                                    <VoxelSpartan
                                        position={[0, -1.2, 0]}
                                        rotation={[0, 0.2, 0]}
                                        charClass={playerState.class}
                                        weaponItem={playerState.equipment.weapon}
                                        armorItem={playerState.equipment.armor}
                                        helmetItem={playerState.equipment.helmet}
                                        pantsItem={playerState.equipment.pants}
                                        wingType={playerState.equippedWing}
                                        petType={playerState.equippedPet}
                                        skinId={playerState.equippedSkin}
                                    />
                                    <Environment preset="city" />
                                </Suspense>
                                <OrbitControls enableZoom={false} enablePan={false} minPolarAngle={Math.PI / 2.5} maxPolarAngle={Math.PI / 1.8} />
                            </Canvas>
                        </div>

                        {/* Floating Stats over Preview */}
                        <div className="absolute bottom-4 left-0 right-0 px-6 flex justify-between items-end">
                            <div className="text-right w-full flex justify-between px-2">
                                <div className="flex flex-col items-center">
                                    <div className="text-xs text-slate-400 font-bold mb-0.5">HP</div>
                                    <div className="text-white font-bold text-sm drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">{playerState.hp}/{playerState.maxHp}</div>
                                    <div className="w-16 h-1 bg-slate-800 rounded-full mt-1 overflow-hidden">
                                        <div className="h-full bg-red-600 w-full" style={{ width: `${(playerState.hp / playerState.maxHp) * 100}%` }}></div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-center">
                                    <div className="text-xs text-slate-400 font-bold mb-0.5">MANA</div>
                                    <div className="text-blue-400 font-bold text-sm drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">{playerState.mana}/{playerState.maxMana}</div>
                                    <div className="w-16 h-1 bg-slate-800 rounded-full mt-1 overflow-hidden">
                                        <div className="h-full bg-blue-500 w-full" style={{ width: `${(playerState.mana / playerState.maxMana) * 100}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Equipment Slots */}
                    <div className="flex-1 p-4 overflow-y-auto custom-scrollbar bg-[#100c08]">
                        <div className="flex items-center gap-2 mb-3">
                            <Shield size={14} className="text-[#8a725f]" />
                            <span className="text-[#8a725f] text-xs font-bold tracking-widest uppercase">Ekipmanlar</span>
                        </div>

                        <div className="flex flex-wrap gap-2 justify-center mb-6">
                            {renderEquipmentSlot('helmet', 'Kask')}
                            {renderEquipmentSlot('necklace', 'Kolye')}
                            {renderEquipmentSlot('weapon', 'Silah')}
                            {renderEquipmentSlot('armor', 'Zırh')}
                            {renderEquipmentSlot('pants', 'Pnt')}
                            {renderEquipmentSlot('boots', 'Bot')}
                            {renderEquipmentSlot('earring', 'Küpe')}
                        </div>

                        <div className="flex items-center gap-2 mb-3 pt-4 border-t border-[#3f2e24]">
                            <Star size={14} className="text-[#8a725f]" />
                            <span className="text-[#8a725f] text-xs font-bold tracking-widest uppercase">Görünüm</span>
                        </div>

                        <div className="flex gap-2 justify-center">
                            {/* Mock Cosmetic Slots */}
                            <div className="w-14 h-14 bg-[#1a1410] rounded border border-[#3f2e24] flex items-center justify-center opacity-50 relative">
                                <User size={16} className="text-[#8a725f] opacity-50 absolute" />
                                <span className="text-[8px] text-[#8a725f] mt-4 font-bold">KOSTÜM</span>
                            </div>
                            <div className="w-14 h-14 bg-[#1a1410] rounded border border-[#3f2e24] flex items-center justify-center opacity-50 relative">
                                <Star size={16} className="text-[#8a725f] opacity-50 absolute" />
                                <span className="text-[8px] text-[#8a725f] mt-4 font-bold">KANAT</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ════ RIGHT COLUMN: INVENTORY GRID ════ */}
                <div className="bg-[#0c0906] flex flex-col min-h-0 relative h-full">

                    {/* Header: Search & Filters */}
                    <div className="p-4 border-b border-[#3f2e24] flex flex-col md:flex-row gap-4 justify-between items-center bg-[#100c08]">
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                            <input
                                type="text"
                                placeholder="Eşya Ara..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[#1a1410] border border-[#3f2e24] rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-yellow-700 transition-colors placeholder:text-slate-600"
                            />
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto pr-12">
                            <div className="flex gap-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 hide-scrollbar">
                                {(['all', 'gear', 'consumable', 'material'] as InventoryFilter[]).map(f => (
                                    <button
                                        key={f}
                                        onClick={() => setFilter(f)}
                                        className={`px-3 py-1.5 rounded text-xs font-bold transition-all whitespace-nowrap ${filter === f
                                            ? 'bg-yellow-900/40 text-yellow-500 border border-yellow-700/50'
                                            : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                                            }`}
                                    >
                                        {f === 'all' && 'Tümü'}
                                        {f === 'gear' && 'Ekipman'}
                                        {f === 'consumable' && 'İksir'}
                                        {f === 'material' && 'Materyal'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Inventory Grid */}
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
                        {/* Grid Layout - MMO Style */}
                        <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-8 gap-2 justify-items-center">
                            {filteredInventory.map((item, idx) => renderInventorySlot(item, idx))}

                            {filteredInventory.length === 0 && (
                                <div className="text-center py-10 text-slate-500 italic">
                                    Bu kategoride eşya bulunamadı.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bottom Info Bar */}
                    <div className="p-3 border-t border-[#3f2e24] bg-[#100c08] flex justify-between items-center text-xs text-[#8a725f]">
                        <span>Kapasite: <span className="text-white">{playerState.inventory.length}</span> / 50</span>
                        <div className="flex items-center gap-3">
                            {/* Gold */}
                            <div className="flex items-center gap-1.5 bg-[#1a1410] px-3 py-1 rounded-full border border-[#3f2e24]">
                                <div className="w-3 h-3 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 border border-yellow-700 shadow-sm"></div>
                                <span className="text-yellow-400 font-bold tracking-wide">{playerState.credits.toLocaleString()}</span>
                            </div>
                            {/* Gems */}
                            <div className="flex items-center gap-1.5 bg-[#1a1410] px-3 py-1 rounded-full border border-[#3f2e24]">
                                <span className="text-lg">💎</span>
                                <span className="text-blue-400 font-bold tracking-wide">{playerState.gems.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* TOOLTIP OVERLAY (Fixed Center-Right or Center) */}
                    {activeTooltipItem && (
                        <div
                            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none w-full max-w-sm px-4"
                        >
                            <div className="pointer-events-auto shadow-2xl drop-shadow-[0_20px_20px_rgba(0,0,0,0.8)]">
                                <ItemTooltipContent item={activeTooltipItem} />

                                {/* On Mobile: Show a subtle hint to double tap */}
                                {clickedItem && (
                                    <div className="mt-2 text-center">
                                        <span className="bg-black/80 text-white text-[10px] px-3 py-1 rounded-full border border-white/10 animate-pulse">
                                            {clickedItem.type === 'consumable' ? 'Kullanmak için Çift Dokun' : 'Kuşanmak/Çıkarmak için Çift Dokun'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InventoryModal;
