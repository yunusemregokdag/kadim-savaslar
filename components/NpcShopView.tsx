import React, { useState, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Item, PlayerState, PetItem, WingItem } from '../types';
import { ShoppingBasket, Shield, Sword, Box, DollarSign, X, Bird, Sparkles } from 'lucide-react';
import { renderItemIcon, PixelWing, PixelBox, PixelShield, PixelBird } from './ui/ItemIcons';
import { ItemTooltip } from './ui/ItemTooltip';
import { v4 as uuidv4 } from 'uuid';
import { POTIONS, PETS_DATA, WINGS_DATA, ARMOR_SETS } from '../constants';
import { DynamicPet } from './DynamicPet';
import * as THREE from 'three';

interface NpcShopViewProps {
    playerState: PlayerState;
    onBuy: (item: Item, cost: number) => void;
    onBuyPet?: (pet: PetItem, cost: number) => void;
    onBuyWing?: (wing: WingItem, cost: number) => void;
    onClose: () => void;
}

// Free pets (first 3)
const FREE_PETS = ['pet_plains', 'pet_grass', 'pet_desert'];

// Pet prices by tier
const PET_PRICES: Record<number, number> = {
    1: 5000,
    2: 15000,
    3: 50000,
    4: 150000,
    5: 500000
};

// Wing prices by tier
const WING_PRICES: Record<number, number> = {
    1: 10000,
    2: 30000,
    3: 100000,
    4: 300000,
    5: 1000000
};

// Basic Shops Stock - ONLY T1-T2 ITEMS (Higher tiers from drops/crafting)
// Prices are HIGH to encourage player economy
const SHOP_ITEMS: Item[] = [
    // Consumables (Çok Pahalı - Ekonomi Dengesi İçin)
    ...POTIONS.map(p => ({ ...p, value: (p.value || 50) * 15 })), // 15x Enflasyon! (50 -> 750 Gold)
    // Basic Gear (ONLY T1-T2)
    { id: 'shop_w1', name: 'Acemi Kılıcı', tier: 1, type: 'weapon', rarity: 'common', value: 500 },
    { id: 'shop_w2', name: 'Çelik Kılıcı', tier: 2, type: 'weapon', rarity: 'uncommon', value: 2500 },
    { id: 'shop_a1', name: 'Deri Zırh', tier: 1, type: 'armor', rarity: 'common', value: 400 },
    { id: 'shop_a2', name: 'Çelik Zırh', tier: 2, type: 'armor', rarity: 'uncommon', value: 2000 },
    // Materials (pahalı - oyuncular arasında ekonomi için)
    { id: 'shop_m1', name: 'Boş Şişe', tier: 1, type: 'material', rarity: 'common', value: 50 },
    { id: 'shop_m2', name: 'Demir Külçe', tier: 1, type: 'material', rarity: 'common', value: 200 },
    // Upgrade Scrolls - ONLY T1-T2 (T3+ from drops/crafting!)
    { id: 'scroll_t1', name: 'Kutsal Parşömen (T1)', tier: 1, type: 'upgrade_scroll', rarity: 'common', value: 2500, description: 'Sadece T1 ekipman yükseltir' },
    { id: 'scroll_t2', name: 'Kutsal Parşömen (T2)', tier: 2, type: 'upgrade_scroll', rarity: 'uncommon', value: 10000, description: 'Sadece T2 ekipman yükseltir' },
];

// 🔄 AutoRotate: Canvas içindeki modeli yavaşça döndürür
function AutoRotate({ children, speed = 0.6 }: { children: React.ReactNode; speed?: number }) {
    const groupRef = useRef<THREE.Group>(null);
    useFrame((_, delta) => {
        if (groupRef.current) groupRef.current.rotation.y += delta * speed;
    });
    return <group ref={groupRef}>{children}</group>;
}

// 🪽 WingPreview3D: Kanat önizlemesi (3 geometri parça)
function WingPreview3D({ color }: { color: string }) {
    const groupRef = useRef<THREE.Group>(null);
    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.6) * 0.4;
            groupRef.current.children.forEach((child, i) => {
                (child as THREE.Mesh).position.y = Math.sin(state.clock.elapsedTime * 2 + i) * 0.05;
            });
        }
    });
    const wingColor = new THREE.Color(color);
    const mat = new THREE.MeshStandardMaterial({
        color: wingColor,
        emissive: wingColor,
        emissiveIntensity: 0.4,
        roughness: 0.3,
        metalness: 0.5,
        transparent: true,
        opacity: 0.9,
    });
    return (
        <group ref={groupRef}>
            {/* Sol kanat */}
            <mesh position={[-0.4, 0, 0]} rotation={[0.1, 0.3, 0.2]} material={mat}>
                <planeGeometry args={[0.5, 0.9]} />
            </mesh>
            {/* Sağ kanat */}
            <mesh position={[0.4, 0, 0]} rotation={[0.1, -0.3, -0.2]} material={mat}>
                <planeGeometry args={[0.5, 0.9]} />
            </mesh>
            {/* Orta gövde */}
            <mesh position={[0, -0.1, 0]} material={mat}>
                <boxGeometry args={[0.15, 0.3, 0.1]} />
            </mesh>
        </group>
    );
}

const NpcShopView: React.FC<NpcShopViewProps> = ({ playerState, onBuy, onBuyPet, onBuyWing, onClose }) => {
    const [filter, setFilter] = useState<'all' | 'consumable' | 'gear' | 'pets' | 'wings'>('all');

    // Calculate discounted price based on premium benefits
    const getDiscountedPrice = (basePrice: number): number => {
        if (playerState.premiumBenefits?.discountPercent) {
            return Math.floor(basePrice * (1 - playerState.premiumBenefits.discountPercent / 100));
        }
        return basePrice;
    };

    const filteredItems = SHOP_ITEMS.filter(item => {
        if (filter === 'consumable') return item.type === 'consumable' || item.type === 'material' || item.type === 'upgrade_scroll';
        if (filter === 'gear') return ['weapon', 'armor', 'helmet', 'pants', 'necklace', 'earring'].includes(item.type);
        if (filter === 'pets' || filter === 'wings') return false; // handled separately
        return true;
    });

    // Check if player owns pet
    const ownsPet = (petId: string) => playerState.ownedPets?.some(p => p.id === petId);
    const ownsWing = (wingId: string) => playerState.ownedWings?.some(w => w.id === wingId);

    const getTierColor = (tier: number) => {
        switch (tier) {
            case 1: return 'text-slate-400';
            case 2: return 'text-green-400';
            case 3: return 'text-blue-400';
            case 4: return 'text-purple-400';
            case 5: return 'text-orange-400';
            default: return 'text-slate-400';
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#1a1410] text-amber-100 border-l border-[#3f2e26]">
            {/* Header */}
            <div className="p-6 border-b border-[#5e4b35] flex justify-between items-center bg-[#291d18]">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-amber-900/40 rounded-lg flex items-center justify-center border border-amber-700">
                        <ShoppingBasket size={24} className="text-amber-500" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold font-serif text-amber-200">Köy Pazarı</h2>
                        <p className="text-xs text-amber-500/80">
                            Temel İhtiyaçlar, Teçhizat, Yoldaşlar ve Kanatlar
                            {playerState.premiumBenefits?.discountPercent && (
                                <span className="ml-2 text-green-400">({playerState.premiumBenefits.discountPercent}% İndirim!)</span>
                            )}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-black/30 px-4 py-2 rounded flex items-center gap-2 border border-amber-900/30">
                        <DollarSign size={16} className="text-yellow-500" />
                        <span className="font-mono font-bold">{playerState.credits.toLocaleString()}</span>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full"><X size={20} /></button>
                </div>
            </div>

            {/* Filters */}
            <div className="p-2 bg-[#231814] flex gap-2 overflow-x-auto shadow-inner">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded text-xs font-bold transition-all ${filter === 'all' ? 'bg-amber-700 text-white' : 'bg-transparent text-amber-700 hover:bg-amber-900/20'}`}
                >
                    TÜMÜ
                </button>
                <button
                    onClick={() => setFilter('consumable')}
                    className={`px-4 py-2 rounded text-xs font-bold transition-all flex items-center gap-2 ${filter === 'consumable' ? 'bg-amber-700 text-white' : 'bg-transparent text-amber-700 hover:bg-amber-900/20'}`}
                >
                    <div className="w-4 h-4"><PixelBox color="#f59e0b" /></div> TÜKETİM
                </button>
                <button
                    onClick={() => setFilter('gear')}
                    className={`px-4 py-2 rounded text-xs font-bold transition-all flex items-center gap-2 ${filter === 'gear' ? 'bg-amber-700 text-white' : 'bg-transparent text-amber-700 hover:bg-amber-900/20'}`}
                >
                    <div className="w-4 h-4"><PixelShield color="#f59e0b" /></div> EKİPMAN
                </button>
                <button
                    onClick={() => setFilter('pets')}
                    className={`px-4 py-2 rounded text-xs font-bold transition-all flex items-center gap-2 ${filter === 'pets' ? 'bg-green-700 text-white' : 'bg-transparent text-green-700 hover:bg-green-900/20'}`}
                >
                    <div className="w-4 h-4"><PixelBird color="#22c55e" /></div> YOLDAŞLAR
                </button>
                <button
                    onClick={() => setFilter('wings')}
                    className={`px-4 py-2 rounded text-xs font-bold transition-all flex items-center gap-2 ${filter === 'wings' ? 'bg-purple-700 text-white' : 'bg-transparent text-purple-700 hover:bg-purple-900/20'}`}
                >
                    <div className="w-4 h-4"><PixelWing color="#a78bfa" /></div> KANATLAR
                </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-amber-800">
                {/* PETS TAB */}
                {filter === 'pets' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {PETS_DATA.map(pet => {
                            const isFree = FREE_PETS.includes(pet.id);
                            const owned = ownsPet(pet.id);
                            const basePrice = isFree ? 0 : PET_PRICES[pet.tier] || 10000;
                            const price = getDiscountedPrice(basePrice);

                            return (
                                <div key={pet.id} className={`bg-[#291d18] border ${owned ? 'border-green-600' : 'border-[#4a3b32]'} p-3 rounded hover:border-amber-600 transition-colors group`}>
                                    <div className="flex gap-3">
                                        {/* 3D Pet Preview */}
                                        <div
                                            className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 relative"
                                            style={{
                                                background: `radial-gradient(circle at center, ${pet.color}22, #0a0a0a)`,
                                                border: `1px solid ${pet.color}55`,
                                            }}
                                        >
                                            {pet.modelPath ? (
                                                <Canvas
                                                    camera={{ position: [0, 1.2, 2.5], fov: 45 }}
                                                    gl={{ antialias: false, powerPreference: 'low-power' }}
                                                    dpr={1}
                                                    style={{ width: '100%', height: '100%' }}
                                                >
                                                    <ambientLight intensity={0.7} />
                                                    <pointLight position={[2, 2, 2]} intensity={1.5} color={pet.color} />
                                                    <pointLight position={[-2, 1, -2]} intensity={0.5} color="#ffffff" />
                                                    <Suspense fallback={null}>
                                                        <AutoRotate>
                                                            <DynamicPet
                                                                modelPath={pet.modelPath}
                                                                color={pet.color}
                                                                scale={0.8}
                                                            />
                                                        </AutoRotate>
                                                    </Suspense>
                                                </Canvas>
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-2xl">🐾</div>
                                            )}
                                            {/* Tier Badge overlay */}
                                            <div
                                                className="absolute top-0.5 right-0.5 text-[8px] font-bold px-1 rounded"
                                                style={{ background: '#000000aa', color: pet.color }}
                                            >
                                                T{pet.tier}
                                            </div>
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <div className={`text-sm font-bold ${getTierColor(pet.tier)}`}>{pet.name}</div>
                                            </div>
                                            <div className="text-[10px] text-slate-400 mt-1">
                                                +{pet.bonusExpRate}% EXP • +{pet.bonusDefense} Zırh
                                                {pet.bonusDamage && ` • +${pet.bonusDamage} Hasar`}
                                            </div>
                                            <div className="flex justify-between items-center mt-2">
                                                {owned ? (
                                                    <span className="text-green-400 text-xs font-bold">✓ SAHİPSİN</span>
                                                ) : (
                                                    <>
                                                        <span className="text-yellow-500 font-mono text-xs font-bold">
                                                            {isFree ? 'ÜCRETSİZ' : `${price.toLocaleString()} G`}
                                                        </span>
                                                        <button
                                                            onClick={() => onBuyPet?.(pet, price)}
                                                            disabled={playerState.credits < price && !isFree}
                                                            className={`px-3 py-1 text-[10px] font-bold rounded border ${playerState.credits >= price || isFree
                                                                ? 'bg-green-700 hover:bg-green-600 border-green-600 text-white'
                                                                : 'bg-slate-700 border-slate-600 text-slate-400 cursor-not-allowed'
                                                                }`}
                                                        >
                                                            {isFree ? 'AL' : 'SATIN AL'}
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* WINGS TAB */}
                {filter === 'wings' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {WINGS_DATA.map(wing => {
                            const owned = ownsWing(wing.id);
                            const basePrice = WING_PRICES[wing.tier] || 50000;
                            const price = getDiscountedPrice(basePrice);

                            return (
                                <div key={wing.id} className={`bg-[#291d18] border ${owned ? 'border-purple-600' : 'border-[#4a3b32]'} p-3 rounded hover:border-amber-600 transition-colors group`}>
                                    <div className="flex gap-3">
                                        {/* 3D Wing Preview */}
                                        <div
                                            className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 relative"
                                            style={{
                                                background: `radial-gradient(circle at center, ${wing.color}22, #0a0a0a)`,
                                                border: `1px solid ${wing.color}55`,
                                            }}
                                        >
                                            <Canvas
                                                camera={{ position: [0, 0, 2.2], fov: 50 }}
                                                gl={{ antialias: false, powerPreference: 'low-power' }}
                                                dpr={1}
                                                style={{ width: '100%', height: '100%' }}
                                            >
                                                <ambientLight intensity={0.5} />
                                                <pointLight position={[2, 2, 2]} intensity={2} color={wing.color} />
                                                <WingPreview3D color={wing.color} />
                                            </Canvas>
                                            {/* Tier Badge */}
                                            <div
                                                className="absolute top-0.5 right-0.5 text-[8px] font-bold px-1 rounded"
                                                style={{ background: '#000000aa', color: wing.color }}
                                            >
                                                T{wing.tier}
                                            </div>
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <div className={`text-sm font-bold ${getTierColor(wing.tier)}`}>{wing.name}</div>
                                            </div>
                                            <div className="text-[10px] text-slate-400 mt-1">
                                                +{wing.bonusDamage} Hasar • +{wing.bonusHp} Can
                                                {wing.bonusDefense && ` • +${wing.bonusDefense} Zırh`}
                                            </div>
                                            <div className="flex justify-between items-center mt-2">
                                                {owned ? (
                                                    <span className="text-purple-400 text-xs font-bold">✓ SAHİPSİN</span>
                                                ) : (
                                                    <>
                                                        <span className="text-yellow-500 font-mono text-xs font-bold">{price.toLocaleString()} G</span>
                                                        <button
                                                            onClick={() => onBuyWing?.(wing, price)}
                                                            disabled={playerState.credits < price}
                                                            className={`px-3 py-1 text-[10px] font-bold rounded border ${playerState.credits >= price
                                                                ? 'bg-purple-700 hover:bg-purple-600 border-purple-600 text-white'
                                                                : 'bg-slate-700 border-slate-600 text-slate-400 cursor-not-allowed'
                                                                }`}
                                                        >
                                                            SATIN AL
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}


                {/* ITEMS (default view) */}
                {filter !== 'pets' && filter !== 'wings' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {filteredItems.map(item => {
                            const originalPrice = item.value || 100;
                            const discountedPrice = getDiscountedPrice(originalPrice);
                            const hasDiscount = discountedPrice < originalPrice;

                            return (
                                <div key={item.id} className="bg-[#291d18] border border-[#4a3b32] p-3 rounded flex gap-3 hover:border-amber-600 transition-colors group">
                                    <div className="w-12 h-12 bg-black/40 rounded flex items-center justify-center border border-[#3f2e26] relative p-1">
                                        {renderItemIcon(item)}
                                        {item.tier && <span className="absolute -top-1 -right-1 bg-slate-800 text-[8px] px-1 rounded text-amber-400">T{item.tier}</span>}
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="text-sm font-bold text-amber-100 group-hover:text-white">{item.name}</div>
                                            <div className="text-[10px] text-amber-500/60 uppercase">{item.type}</div>
                                            {/* Show stats/buffs */}
                                            {(item as any).damage && <div className="text-[9px] text-red-400">+{(item as any).damage} Hasar</div>}
                                            {(item as any).defense && <div className="text-[9px] text-blue-400">+{(item as any).defense} Savunma</div>}
                                            {(item as any).hp && <div className="text-[9px] text-green-400">+{(item as any).hp} Can</div>}
                                            {(item as any).description && <div className="text-[9px] text-slate-400 italic">{(item as any).description}</div>}
                                        </div>
                                        <div className="flex justify-between items-center mt-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-yellow-500 font-mono text-xs font-bold">{discountedPrice.toLocaleString()} G</span>
                                                {hasDiscount && (
                                                    <span className="text-slate-500 font-mono text-[10px] line-through">{originalPrice.toLocaleString()} G</span>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => onBuy({ ...item, id: uuidv4() }, discountedPrice)}
                                                className="px-3 py-1 bg-[#3f2e26] hover:bg-amber-700 text-[10px] font-bold rounded border border-amber-900/50 text-amber-200"
                                            >
                                                SATIN AL
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NpcShopView;

