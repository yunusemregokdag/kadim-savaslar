import React, { useState, useMemo, Suspense } from 'react';
import { PlayerState, Item, Equipment, ItemStats } from '../types';
import { getItemDisplayData } from '../utils/ItemDisplayAdapter';
import { X, Search, Filter, ArrowUpDown, Shield, Sword, Zap, Heart, Star, User, Lock } from 'lucide-react';
import { renderItemIcon } from './ui/ItemIcons';
import { ItemTooltip } from './ui/ItemTooltip';
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

const RARITY_COLORS = {
    common: 'text-slate-400 border-slate-600',
    uncommon: 'text-green-400 border-green-600',
    rare: 'text-blue-400 border-blue-600',
    epic: 'text-purple-400 border-purple-600',
    legendary: 'text-orange-400 border-orange-600 shadow-[0_0_10px_orange]',
    ancient: 'text-red-500 border-red-600 shadow-[0_0_15px_red]',
};

type InventoryFilter = 'all' | 'gear' | 'cosmetic' | 'consumable' | 'material';

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
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const [filter, setFilter] = useState<InventoryFilter>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'rarity' | 'tier' | 'newest'>('newest');

    // New States
    const [lockedItems, setLockedItems] = useState<Set<string>>(new Set()); // In real app, this should come from playerState

    // In a real scenario, lockedItems should be passed via props or contained in Item object.
    // For now, we simulate it locally or derived from prop if available.

    // Lock Handler
    const toggleLock = (itemId: string) => {
        const next = new Set(lockedItems);
        const isLocked = next.has(itemId);
        if (isLocked) next.delete(itemId);
        else next.add(itemId);
        setLockedItems(next);
        if (onLock) onLock(itemId, !isLocked);
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
                if (filter === 'cosmetic') return ['costume', 'wing_fragment', 'pet_egg'].includes(i.type); // Pending real types
                if (filter === 'consumable') return i.type === 'consumable';
                if (filter === 'material') return i.type === 'material';
                return true;
            });
        }

        // 3. Sort
        return items.sort((a, b) => {
            if (sortBy === 'rarity') {
                const rMap = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4, ancient: 5 };
                return (rMap[b.rarity] || 0) - (rMap[a.rarity] || 0);
            }
            if (sortBy === 'tier') return b.tier - a.tier;
            // newest is default (index based usually but here stable sort or id?)
            return 0;
        });
    }, [playerState.inventory, filter, searchQuery, sortBy]);

    // Handlers
    const handleEquip = () => {
        if (!selectedItem || !onEquip) return;
        onEquip(selectedItem);
        // Maybe sound?
    };

    const handleUse = () => {
        if (!selectedItem || !onUse) return;
        onUse(selectedItem);
    };

    // Helper: Slot Renderer
    const renderEquipSlot = (slotName: string, slotKey: keyof Equipment | 'wing' | 'pet' | 'skin', item: any) => {
        const isCosmetic = ['wing', 'pet', 'skin'].includes(slotKey);

        return (
            <div
                className={`relative w-14 h-14 bg-[#140e08] border border-[#3f2e18] rounded-lg flex items-center justify-center cursor-pointer hover:border-yellow-600 transition-colors group ${item ? 'border-yellow-900/50' : ''}`}
                title={slotName}
                onClick={() => {
                    if (!isCosmetic && item && onUnequip) onUnequip(slotKey as keyof Equipment);
                    // Logic for cosmetic unequip?
                    if (slotKey === 'skin' && onEquipSkin) onEquipSkin(null); // click to unequip skin
                }}
            >
                {item ? (
                    <>
                        <div className="p-1">{renderItemIcon(item)}</div>
                        <div className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full shadow-lg" />
                        {/* Unequip Overlay */}
                        <div className="absolute inset-0 bg-red-900/80 items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 flex text-[10px] uppercase font-bold text-white tracking-tighter">
                            Çıkar
                        </div>
                    </>
                ) : (
                    <span className="text-[#3f2e18] text-[8px] uppercase font-bold tracking-widest text-center">{slotName}</span>
                )}
            </div>
        );
    };

    return (
        <div className={`${isOverlay
            ? 'fixed inset-0 z-[60] pointer-events-none flex items-start justify-end'
            : 'w-full h-full'}`}
        >
            {/* NOWA Style Right Overlay Panel */}
            <div className={`
                ${isOverlay
                    ? 'pointer-events-auto m-2 md:m-4 w-[calc(100%-16px)] md:w-[560px] h-[60vh] md:h-[calc(100vh-32px)] fixed bottom-2 left-2 right-2 md:bottom-auto md:left-auto md:right-4 md:top-4 rounded-2xl border border-[#3f2e18]/80 bg-[#0c0906]/90 backdrop-blur-sm shadow-[0_10px_40px_rgba(0,0,0,0.7)]'
                    : 'w-full h-full bg-[#0c0906] border border-[#3f2e18]'
                } 
                flex flex-col overflow-hidden relative group
            `}>
                {/* Subtle MMO texture overlay */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

                {/* Light radial gradient for MMO feel */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.04),transparent_40%),radial-gradient(circle_at_70%_70%,rgba(255,255,255,0.02),transparent_45%)] opacity-60 pointer-events-none" />

                {/* HEADLINE */}
                {isOverlay && (
                    <div className="h-12 border-b border-[#3f2e18]/50 flex items-center justify-between px-4 bg-[#16100a]/80 shrink-0">
                        <h2 className="text-[#e6cba5] font-bold text-sm flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-yellow-600 rotate-45" />
                            ENVANTER
                        </h2>
                        <button onClick={onClose} className="p-1.5 hover:bg-red-900/30 rounded-full transition-colors text-slate-400 hover:text-red-400">
                            <X size={18} />
                        </button>
                    </div>
                )}

                {/* LAYOUT - Compact for overlay, 3-column for full page */}
                <div className={`flex flex-1 overflow-hidden relative z-10 ${isOverlay ? 'flex-col' : 'flex-col lg:flex-row'}`}>

                    {/* CHARACTER & SLOTS - Compact in overlay */}
                    <div className={`${isOverlay
                        ? 'flex-shrink-0 bg-[#0f0b08]/50 border-b border-[#3f2e18]/30 overflow-y-auto custom-scrollbar'
                        : 'w-full lg:w-[320px] flex-shrink-0 bg-[#0f0b08] border-b lg:border-b-0 lg:border-r border-[#3f2e18] flex flex-col overflow-y-auto custom-scrollbar h-[350px] lg:h-full'
                        }`}>
                        {/* 3D PREVIEW - Shorter in overlay mode */}
                        <div className={`${isOverlay ? 'h-[160px]' : 'h-[320px]'} relative bg-gradient-to-b from-[#1a1410] to-[#0f0b08]`}>
                            <Suspense fallback={<div className="text-white/20 flex items-center justify-center h-full">...</div>}>
                                <Canvas shadows dpr={[1, 1.5]} gl={{ preserveDrawingBuffer: true }}>
                                    <PerspectiveCamera makeDefault position={[0, 1.4, isOverlay ? 5.5 : 4.5]} fov={35} />
                                    <ambientLight intensity={0.6} />
                                    <pointLight position={[10, 10, 10]} intensity={1.5} castShadow />
                                    <pointLight position={[-10, 0, 5]} intensity={1} color="#fbbf24" />
                                    <Environment preset="city" />

                                    <VoxelSpartan
                                        position={[0, -1, 0]}
                                        rotation={[0, 0.2, 0]}
                                        charClass={playerState.class || 'warrior'}
                                        weaponItem={playerState.equipment.weapon}
                                        armorItem={playerState.equipment.armor}
                                        helmetItem={playerState.equipment.helmet}
                                        pantsItem={playerState.equipment.pants}
                                        wingType={playerState.equippedWing}
                                        petType={playerState.equippedPet}
                                        skinId={playerState.equippedSkin}
                                    />

                                    <mesh position={[0, -1.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                                        <planeGeometry args={[3, 3]} />
                                        <shadowMaterial opacity={0.3} color="#000" />
                                    </mesh>

                                    <OrbitControls enableZoom={false} enablePan={false} minPolarAngle={Math.PI / 3} maxPolarAngle={Math.PI / 1.8} />
                                </Canvas>
                            </Suspense>
                            <div className={`absolute top-2 left-3 text-[10px] font-bold text-[#e6cba5]/50 uppercase tracking-widest`}>
                                Lv.{playerState.level} {playerState.class?.toUpperCase()}
                            </div>
                            {/* HP/MP - Only show in full mode */}
                            {!isOverlay && (
                                <div className="absolute bottom-4 w-full flex justify-center gap-6 text-[#e6cba5]">
                                    <div className="text-center">
                                        <div className="text-xs text-slate-500">HP</div>
                                        <div className="font-bold">{playerState.hp}/{playerState.maxHp}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xs text-slate-500">MANA</div>
                                        <div className="font-bold text-blue-400">{playerState.mana}/{playerState.maxMana}</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* SLOTS GRID - Compact horizontal in overlay */}
                        <div className={`${isOverlay ? 'p-3 flex gap-2 overflow-x-auto' : 'p-6 flex flex-col gap-6'}`}>
                            {isOverlay ? (
                                /* Compact horizontal slot row */
                                <div className="flex gap-2 flex-wrap justify-center">
                                    {renderEquipSlot('Miğfer', 'helmet', playerState.equipment.helmet)}
                                    {renderEquipSlot('Zırh', 'armor', playerState.equipment.armor)}
                                    {renderEquipSlot('Silah', 'weapon', playerState.equipment.weapon)}
                                    {renderEquipSlot('Alt', 'pants', playerState.equipment.pants)}
                                    {renderEquipSlot('Ayak', 'boots', playerState.equipment.boots)}
                                    {renderEquipSlot('Kolye', 'necklace', playerState.equipment.necklace)}
                                    {renderEquipSlot('Küpe', 'earring', playerState.equipment.earring)}
                                    {renderEquipSlot('Kanat', 'wing', playerState.equippedWing)}
                                    {renderEquipSlot('Yoldaş', 'pet', playerState.equippedPet)}
                                </div>
                            ) : (
                                /* Full layout with sections */
                                <>
                                    {/* Armor Section */}
                                    <div>
                                        <h3 className="text-xs font-bold text-[#e6cba5]/40 uppercase mb-3 flex items-center gap-2">
                                            <Shield size={10} /> Ekipmanlar
                                        </h3>
                                        <div className="flex justify-center gap-4 flex-wrap">
                                            {renderEquipSlot('Miğfer', 'helmet', playerState.equipment.helmet)}
                                            {renderEquipSlot('Zırh', 'armor', playerState.equipment.armor)}
                                            {renderEquipSlot('Alt', 'pants', playerState.equipment.pants)}
                                            {renderEquipSlot('Ayak', 'boots', playerState.equipment.boots)}
                                            {renderEquipSlot('Silah', 'weapon', playerState.equipment.weapon)}
                                        </div>
                                    </div>

                                    {/* Accessory Section */}
                                    <div>
                                        <h3 className="text-xs font-bold text-[#e6cba5]/40 uppercase mb-3 flex items-center gap-2">
                                            <Star size={10} /> Takılar
                                        </h3>
                                        <div className="flex justify-center gap-4">
                                            {renderEquipSlot('Kolye', 'necklace', playerState.equipment.necklace)}
                                            {renderEquipSlot('Küpe', 'earring', playerState.equipment.earring)}
                                        </div>
                                    </div>

                                    {/* Cosmetics Section */}
                                    <div>
                                        <h3 className="text-xs font-bold text-[#e6cba5]/40 uppercase mb-3 flex items-center gap-2">
                                            <User size={10} /> Görünüm
                                        </h3>
                                        <div className="flex justify-center gap-4">
                                            {renderEquipSlot('Kostüm', 'skin', playerState.equippedSkin ? { type: 'costume', name: 'Kostüm' } : null)}
                                            {renderEquipSlot('Kanat', 'wing', playerState.equippedWing)}
                                            {renderEquipSlot('Yoldaş', 'pet', playerState.equippedPet)}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>


                    {/* CENTER: INVENTORY GRID */}
                    <div className="flex-1 bg-[#0c0906] flex flex-col lg:border-r border-[#3f2e18] overflow-hidden min-h-0 order-3 lg:order-none">
                        {/* Toolbar */}
                        <div className="p-4 border-b border-[#3f2e18] flex gap-3 items-center sticky top-0 bg-[#0c0906] z-10">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                <input
                                    type="text"
                                    placeholder="Eşya Ara..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full h-10 bg-[#16100a] border border-[#3f2e18] rounded pl-9 text-sm text-[#e6cba5] focus:border-yellow-600 outline-none"
                                />
                            </div>
                            <div className="flex gap-1 h-10 p-1 bg-[#16100a] border border-[#3f2e18] rounded">
                                {(['all', 'gear', 'consumable', 'material'] as InventoryFilter[]).map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setFilter(f)}
                                        className={`px-3 h-full rounded text-xs font-bold capitalize transition-all ${filter === f ? 'bg-yellow-700/30 text-yellow-500' : 'text-slate-500 hover:text-slate-300'}`}
                                    >
                                        {f === 'all' ? 'Tümü' : f === 'gear' ? 'Ekipman' : f === 'consumable' ? 'İksir' : 'Materyal'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Grid */}
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            {filteredInventory.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-slate-600">
                                    <Filter size={48} className="mb-4 opacity-50" />
                                    <p>Eşya bulunamadı.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-auto-fill-50 gap-2">
                                    {filteredInventory.map((item, idx) => {
                                        const displayData = getItemDisplayData(item);
                                        return (
                                            <ItemTooltip key={item.id + idx} item={item}>
                                                <div
                                                    onClick={(e) => {
                                                        e.stopPropagation();

                                                        // If filtered to locked/unlocked specifically? No.
                                                        // Default Select
                                                        setSelectedItem(item);

                                                        // Quick Action: Single Click Equip/Use
                                                        // Check lock state? If locked, maybe warn? Or allow equip? Usually locked items can be equipped, just not sold/deleted.
                                                        // We will trigger equip.
                                                        if (['weapon', 'helmet', 'armor', 'pants', 'boots', 'necklace', 'earring', 'wing', 'pet', 'costume'].includes(item.type)) {
                                                            if (onEquip) onEquip(item);
                                                        } else if (item.type === 'consumable' && onUse) {
                                                            // Consumables might need confirmation or double click to prevent accidental waste? 
                                                            // User said "tek tıklama ile giysin çıkarsın", implying gear. 
                                                            // For consistency let's keep consumables as select-first or use button. 
                                                            // But for GEAR it is requested.
                                                        }
                                                    }}
                                                    className={`
                                                        relative w-14 h-14 rounded border cursor-pointer group transition-all
                                                        flex items-center justify-center
                                                        ${selectedItem?.id === item.id ? 'border-yellow-400 bg-yellow-900/20' : 'border-[#3f2e18] bg-[#16100a] hover:border-slate-500'}
                                                        ${RARITY_COLORS[item.rarity as keyof typeof RARITY_COLORS]}
                                                    `}
                                                >
                                                    <div className="scale-75">{renderItemIcon(item)}</div>

                                                    {/* Tier Badge (Restored) */}
                                                    <div className="absolute top-0.5 right-0.5 z-10 px-1 rounded bg-black/60 border border-slate-700 text-[9px] font-bold text-slate-300">
                                                        {displayData.tierLabel}
                                                    </div>

                                                    {item.plus ? (
                                                        <div className="absolute bottom-1 right-1 text-[9px] font-bold text-yellow-400 bg-black/50 px-1 rounded">+{item.plus}</div>
                                                    ) : null}

                                                    {/* Lock Icon */}
                                                    {lockedItems.has(item.id) && (
                                                        <div className="absolute top-0.5 left-0.5 text-slate-400 z-10">
                                                            <Lock size={10} />
                                                        </div>
                                                    )}

                                                    {(item.type === 'consumable' || item.type === 'material') && (
                                                        <div className="absolute bottom-1 right-1 text-[9px] font-bold text-slate-400">x1</div>
                                                    )}
                                                </div>
                                            </ItemTooltip>
                                        );
                                    })}
                                </div>
                            )}
                        </div>



                        {/* Footer Capacity */}
                        <div className="p-3 border-t border-[#3f2e18] text-xs text-slate-500 flex justify-between">
                            <span>Kapasite: {playerState.inventory.length} / 50</span>
                            <span>Altın: {playerState.credits} 🟡</span>
                        </div>
                    </div>


                    {/* RIGHT: SELECTED DETAILS */}
                    <div className={`w-full lg:w-[300px] bg-[#0f0b08] flex flex-col lg:h-full border-t lg:border-t-0 border-[#3f2e18] transition-all ${selectedItem ? 'h-[350px] lg:h-full order-2 lg:order-none' : 'h-0 lg:h-full hidden lg:flex'}`}>
                        {selectedItem ? (
                            <div className="flex flex-col h-full animate-[fadeIn_0.2s]">
                                {/* Header */}
                                <div className="p-6 border-b border-[#3f2e18] bg-gradient-to-b from-[#16100a] to-transparent items-center flex flex-col text-center">
                                    <div className={`w-20 h-20 rounded-lg flex items-center justify-center mb-4 bg-black/40 border-2 shadow-2xl ${RARITY_COLORS[selectedItem.rarity as keyof typeof RARITY_COLORS]}`}>
                                        <div className="scale-125">{renderItemIcon(selectedItem)}</div>
                                    </div>
                                    <h3 className={`font-bold text-lg leading-tight uppercase ${selectedItem.rarity === 'legendary' ? 'text-orange-400' : 'text-[#e6cba5]'}`}>
                                        {selectedItem.name} {selectedItem.plus ? `+${selectedItem.plus}` : ''}
                                    </h3>
                                    <span className="text-xs uppercase tracking-widest text-slate-500 mt-1">
                                        {selectedItem.rarity} • Tier {selectedItem.tier}
                                    </span>
                                </div>

                                {/* Stats Scrollable */}
                                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                                    {selectedItem.type === 'weapon' && (
                                        <div className="bg-red-900/10 border border-red-900/30 p-3 rounded flex items-center justify-between">
                                            <span className="text-red-400 font-bold uppercase text-xs">Saldırı Gücü</span>
                                            <span className="text-xl font-bold text-[#e6cba5]">
                                                {selectedItem.stats?.damage || 0}
                                            </span>
                                        </div>
                                    )}
                                    {['armor', 'helmet', 'pants', 'boots'].includes(selectedItem.type) && (
                                        <div className="bg-blue-900/10 border border-blue-900/30 p-3 rounded flex items-center justify-between">
                                            <span className="text-blue-400 font-bold uppercase text-xs">Zırh Değeri</span>
                                            <span className="text-xl font-bold text-[#e6cba5]">
                                                {selectedItem.stats?.defense || 0}
                                            </span>
                                        </div>
                                    )}

                                    {/* Stat Grid */}
                                    <div className="space-y-2">
                                        {selectedItem.stats?.hp && <StatRow label="Can (HP)" val={selectedItem.stats.hp} color="text-green-400" />}
                                        {selectedItem.stats?.mana && <StatRow label="Mana" val={selectedItem.stats.mana} color="text-blue-300" />}
                                        {selectedItem.stats?.strength && <StatRow label="Güç (STR)" val={selectedItem.stats.strength} color="text-orange-400" />}
                                        {selectedItem.stats?.dexterity && <StatRow label="Çeviklik (DEX)" val={selectedItem.stats.dexterity} color="text-emerald-400" />}
                                        {selectedItem.stats?.intelligence && <StatRow label="Zeka (INT)" val={selectedItem.stats.intelligence} color="text-cyan-400" />}
                                        {selectedItem.stats?.vitality && <StatRow label="Dayanıklılık (VIT)" val={selectedItem.stats.vitality} color="text-pink-400" />}

                                        {/* Combat Stats */}
                                        {selectedItem.stats?.critChance && <StatRow label="Kritik Şansı" val={selectedItem.stats.critChance} color="text-yellow-400" isPercent />}
                                        {selectedItem.stats?.critDamage && <StatRow label="Kritik Hasarı" val={selectedItem.stats.critDamage} color="text-red-400" isPercent />}
                                        {selectedItem.stats?.attackSpeed && <StatRow label="Saldırı Hızı" val={selectedItem.stats.attackSpeed} color="text-green-400" isPercent />}
                                        {selectedItem.stats?.blockChance && <StatRow label="Blok Şansı" val={selectedItem.stats.blockChance} color="text-cyan-400" isPercent />}
                                    </div>

                                    {/* Description/Lore */}
                                    <p className="text-xs italic text-slate-600 mt-6 leading-relaxed">
                                        "{selectedItem.description || "Kadim zamanlardan kalma bu eşya, içinde büyük bir güç barındırıyor..."}"
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="p-6 border-t border-[#3f2e18] flex flex-col gap-2">
                                    {['weapon', 'helmet', 'armor', 'pants', 'boots', 'necklace', 'earring'].includes(selectedItem.type) && (
                                        <button
                                            onClick={handleEquip}
                                            className="w-full py-3 bg-yellow-700 hover:bg-yellow-600 text-black font-bold uppercase rounded shadow-lg transition-transform active:scale-95"
                                        >
                                            KUŞAN
                                        </button>
                                    )}
                                    {selectedItem.type === 'consumable' && (
                                        <button
                                            onClick={handleUse}
                                            className="w-full py-3 bg-green-700 hover:bg-green-600 text-white font-bold uppercase rounded shadow-lg transition-transform active:scale-95"
                                        >
                                            KULLAN
                                        </button>
                                    )}
                                    {/* Cosmetic Apply Logic */}
                                    {selectedItem.type === 'costume' && (
                                        <button
                                            onClick={() => onEquipSkin && onEquipSkin('some_skin_id_from_item')}
                                            className="w-full py-3 bg-purple-700 hover:bg-purple-600 text-white font-bold uppercase rounded"
                                        >
                                            GÖRÜNÜMÜ UYGULA
                                        </button>
                                    )}

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => toggleLock(selectedItem.id)}
                                            className={`flex-1 py-2 border ${lockedItems.has(selectedItem.id) ? 'border-yellow-500 text-yellow-500 bg-yellow-900/20' : 'border-[#3f2e18] text-slate-400 hover:bg-white/5'} rounded uppercase text-xs font-bold transition-all`}
                                        >
                                            {lockedItems.has(selectedItem.id) ? <><Lock size={12} className="inline mr-1" /> Kilitli</> : 'Kilitle'}
                                        </button>
                                        <button className="flex-1 py-2 border border-red-900/30 text-red-500 hover:bg-red-900/20 rounded uppercase text-xs font-bold disabled:opacity-50" disabled={lockedItems.has(selectedItem.id)}>
                                            Sat
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-700 p-8 text-center">
                                <Search size={48} className="mb-4 opacity-20" />
                                <h3 className="text-[#e6cba5] font-bold mb-2">Eşya Seçilmedi</h3>
                                <p className="text-xs">Detaylarını görmek veya işlem yapmak için listeden bir eşya seç.</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* INLINE CSS FOR SCROLLBAR & GRID */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { bg: #000; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f2e18; border-radius: 2px; }
                .grid-cols-auto-fill-50 {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(56px, 1fr));
                }
            `}</style>
        </div>
    );
};

const StatRow = ({ label, val, color, isPercent }: { label: string, val: number, color: string, isPercent?: boolean }) => (
    <div className="flex justify-between text-sm border-b border-white/5 pb-1">
        <span className="text-slate-400">{label}</span>
        <span className={`font-bold ${color}`}>+{val}{isPercent ? '%' : ''}</span>
    </div>
);

export default InventoryModal;
