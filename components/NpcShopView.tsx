import React, { useState, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Item, PlayerState, PetItem, WingItem } from '../types';
import { ShoppingBasket, DollarSign, X } from 'lucide-react';
import { renderItemIcon, PixelWing, PixelBox, PixelShield, PixelBird } from './ui/ItemIcons';
import { v4 as uuidv4 } from 'uuid';
import { POTIONS, PETS_DATA, WINGS_DATA } from '../constants';
import { DynamicPet } from './DynamicPet';
import * as THREE from 'three';

interface NpcShopViewProps {
    playerState: PlayerState;
    onBuy: (item: Item, cost: number) => void;
    onBuyPet?: (pet: PetItem, cost: number) => void;
    onBuyWing?: (wing: WingItem, cost: number) => void;
    onClose: () => void;
}

const FREE_PETS = ['pet_plains', 'pet_grass', 'pet_desert'];
const PET_PRICES: Record<number, number> = { 1: 5000, 2: 15000, 3: 50000, 4: 150000, 5: 500000 };
const WING_PRICES: Record<number, number> = { 1: 10000, 2: 30000, 3: 100000, 4: 300000, 5: 1000000 };

const SHOP_ITEMS: Item[] = [
    ...POTIONS.map(p => ({ ...p, value: (p.value || 50) * 15 })),
    { id: 'shop_w1', name: 'Acemi Kilici', tier: 1, type: 'weapon', rarity: 'common', value: 500 },
    { id: 'shop_w2', name: 'Celik Kilici', tier: 2, type: 'weapon', rarity: 'uncommon', value: 2500 },
    { id: 'shop_a1', name: 'Deri Zirh', tier: 1, type: 'armor', rarity: 'common', value: 400 },
    { id: 'shop_a2', name: 'Celik Zirh', tier: 2, type: 'armor', rarity: 'uncommon', value: 2000 },
    { id: 'shop_m1', name: 'Bos Sise', tier: 1, type: 'material', rarity: 'common', value: 50 },
    { id: 'shop_m2', name: 'Demir Kulce', tier: 1, type: 'material', rarity: 'common', value: 200 },
    { id: 'scroll_t1', name: 'Kutsal Parsomen (T1)', tier: 1, type: 'upgrade_scroll', rarity: 'common', value: 2500, description: 'Sadece T1 ekipman yukselir' },
    { id: 'scroll_t2', name: 'Kutsal Parsomen (T2)', tier: 2, type: 'upgrade_scroll', rarity: 'uncommon', value: 10000, description: 'Sadece T2 ekipman yukselir' },
];

function AutoRotate({ children }: { children: React.ReactNode }) {
    const ref = useRef<THREE.Group>(null);
    useFrame((_, delta) => { if (ref.current) ref.current.rotation.y += delta * 0.8; });
    return <group ref={ref}>{children}</group>;
}

function WingScene({ color }: { color: string }) {
    const ref = useRef<THREE.Group>(null);
    useFrame((state) => {
        if (ref.current) {
            ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.5;
            ref.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.05;
        }
    });
    const c = new THREE.Color(color);
    const mat = new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 0.5, roughness: 0.2, metalness: 0.6, transparent: true, opacity: 0.92, side: THREE.DoubleSide });
    return (
        <group ref={ref}>
            <mesh position={[-0.45, 0.1, 0]} rotation={[0, 0.15, 0.25]} material={mat}><planeGeometry args={[0.6, 1.0]} /></mesh>
            <mesh position={[0.45, 0.1, 0]} rotation={[0, -0.15, -0.25]} material={mat}><planeGeometry args={[0.6, 1.0]} /></mesh>
            <mesh position={[-0.2, -0.2, 0.05]} rotation={[0, 0.1, 0.1]} material={mat}><planeGeometry args={[0.3, 0.5]} /></mesh>
            <mesh position={[0.2, -0.2, 0.05]} rotation={[0, -0.1, -0.1]} material={mat}><planeGeometry args={[0.3, 0.5]} /></mesh>
            <mesh position={[0, -0.25, 0]} material={mat}><boxGeometry args={[0.12, 0.35, 0.1]} /></mesh>
        </group>
    );
}

interface PreviewState { type: 'pet' | 'wing' | null; modelPath?: string; color?: string; name?: string; }

function SharedPreviewCanvas({ preview }: { preview: PreviewState }) {
    if (!preview.type) return null;
    return (
        <div className="sticky top-0 w-full rounded-xl overflow-hidden border border-white/10 mb-4"
            style={{ height: 200, background: `radial-gradient(circle at 50% 70%, ${preview.color}33, #050508)`, boxShadow: `0 0 40px ${preview.color}44` }}>
            <Canvas camera={{ position: [0, 1, 3], fov: 45 }} gl={{ antialias: true, powerPreference: 'low-power' }} dpr={[1, 1.5]} style={{ width: '100%', height: '100%' }}>
                <ambientLight intensity={0.6} />
                <pointLight position={[3, 3, 3]} intensity={2} color={preview.color} />
                <pointLight position={[-3, 2, -3]} intensity={0.6} color="#ffffff" />
                <Suspense fallback={null}>
                    {preview.type === 'pet' && preview.modelPath ? (
                        <AutoRotate><DynamicPet modelPath={preview.modelPath} color={preview.color} scale={1.2} /></AutoRotate>
                    ) : preview.type === 'wing' ? (
                        <WingScene color={preview.color || '#a78bfa'} />
                    ) : null}
                </Suspense>
            </Canvas>
            <div className="absolute bottom-2 left-0 right-0 text-center text-xs font-bold tracking-widest uppercase"
                style={{ color: preview.color, textShadow: `0 0 10px ${preview.color}` }}>{preview.name}</div>
        </div>
    );
}

const NpcShopView: React.FC<NpcShopViewProps> = ({ playerState, onBuy, onBuyPet, onBuyWing, onClose }) => {
    const [filter, setFilter] = useState<'all' | 'consumable' | 'gear' | 'pets' | 'wings'>('all');
    const [preview, setPreview] = useState<PreviewState>({ type: null });

    const getDiscountedPrice = (basePrice: number): number => {
        if (playerState.premiumBenefits?.discountPercent) return Math.floor(basePrice * (1 - playerState.premiumBenefits.discountPercent / 100));
        return basePrice;
    };

    const filteredItems = SHOP_ITEMS.filter(item => {
        if (filter === 'consumable') return item.type === 'consumable' || item.type === 'material' || item.type === 'upgrade_scroll';
        if (filter === 'gear') return ['weapon', 'armor', 'helmet', 'pants', 'necklace', 'earring'].includes(item.type);
        if (filter === 'pets' || filter === 'wings') return false;
        return true;
    });

    const ownsPet = (petId: string) => playerState.ownedPets?.some(p => p.id === petId);
    const ownsWing = (wingId: string) => playerState.ownedWings?.some(w => w.id === wingId);

    const getTierColor = (tier: number) => ['text-slate-400','text-slate-400','text-green-400','text-blue-400','text-purple-400','text-orange-400'][tier] || 'text-slate-400';
    const getTierBg = (tier: number) => ['#64748b','#64748b','#22c55e','#3b82f6','#a855f7','#f97316'][tier] || '#64748b';

    return (
        <div className="flex flex-col h-full bg-[#1a1410] text-amber-100 border-l border-[#3f2e26]">
            <div className="p-6 border-b border-[#5e4b35] flex justify-between items-center bg-[#291d18]">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-amber-900/40 rounded-lg flex items-center justify-center border border-amber-700"><ShoppingBasket size={24} className="text-amber-500" /></div>
                    <div>
                        <h2 className="text-xl font-bold font-serif text-amber-200">Koy Pazari</h2>
                        <p className="text-xs text-amber-500/80">Temel Ihtiyaclar, Techizat, Yoldaslar ve Kanatlar</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-black/30 px-4 py-2 rounded flex items-center gap-2 border border-amber-900/30">
                        <DollarSign size={16} className="text-yellow-500" /><span className="font-mono font-bold">{playerState.credits.toLocaleString()}</span>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full"><X size={20} /></button>
                </div>
            </div>

            <div className="p-2 bg-[#231814] flex gap-2 overflow-x-auto shadow-inner">
                {[['all','TUMU','amber'],['consumable','TUKETIM','amber'],['gear','EKIPMAN','amber'],['pets','YOLDASLAR','green'],['wings','KANATLAR','purple']].map(([f,label,c]) => (
                    <button key={f} onClick={() => { setFilter(f as any); setPreview({ type: null }); }}
                        className={`px-4 py-2 rounded text-xs font-bold transition-all ${filter === f ? `bg-${c}-700 text-white` : `bg-transparent text-${c}-700 hover:bg-${c}-900/20`}`}>
                        {label}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-amber-800">

                {filter === 'pets' && (
                    <>
                        <SharedPreviewCanvas preview={preview} />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {PETS_DATA.map(pet => {
                                const isFree = FREE_PETS.includes(pet.id);
                                const owned = ownsPet(pet.id);
                                const basePrice = isFree ? 0 : PET_PRICES[pet.tier] || 10000;
                                const price = getDiscountedPrice(basePrice);
                                const isHov = preview.name === pet.name;
                                return (
                                    <div key={pet.id}
                                        className={`bg-[#291d18] border ${owned ? 'border-green-600' : isHov ? 'border-amber-500' : 'border-[#4a3b32]'} p-3 rounded transition-all cursor-pointer`}
                                        onMouseEnter={() => setPreview({ type: 'pet', modelPath: pet.modelPath, color: pet.color, name: pet.name })}
                                        onMouseLeave={() => setPreview({ type: null })}
                                        style={{ boxShadow: isHov ? `0 0 16px ${pet.color}55` : undefined }}>
                                        <div className="flex gap-3 items-center">
                                            <div className="w-14 h-14 rounded-lg flex-shrink-0 flex items-center justify-center relative text-2xl"
                                                style={{ background: `radial-gradient(circle, ${pet.color}33, #0a0a0a)`, border: `2px solid ${pet.color}${isHov ? 'ff' : '55'}`, boxShadow: isHov ? `0 0 20px ${pet.color}88` : undefined }}>
                                                🐾
                                                <div className="absolute top-0.5 right-0.5 text-[8px] font-bold px-1 rounded" style={{ background: getTierBg(pet.tier) + 'cc', color: '#fff' }}>T{pet.tier}</div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className={`text-sm font-bold truncate ${getTierColor(pet.tier)}`}>{pet.name}</div>
                                                <div className="text-[10px] text-slate-400 mt-0.5">+{pet.bonusExpRate}% EXP • +{pet.bonusDefense} Zirh{pet.bonusDamage ? ` • +${pet.bonusDamage} Hasar` : ''}</div>
                                                <div className="text-[9px] text-slate-500 italic mt-0.5">Onizlemek icin uzerine gel 👆</div>
                                                <div className="flex justify-between items-center mt-2">
                                                    {owned ? <span className="text-green-400 text-xs font-bold">✓ SAHIPSIN</span> : (
                                                        <>
                                                            <span className="text-yellow-500 font-mono text-xs font-bold">{isFree ? 'UCRETSIZ' : `${price.toLocaleString()} G`}</span>
                                                            <button onClick={() => onBuyPet?.(pet, price)} disabled={playerState.credits < price && !isFree}
                                                                className={`px-3 py-1 text-[10px] font-bold rounded border ${playerState.credits >= price || isFree ? 'bg-green-700 hover:bg-green-600 border-green-600 text-white' : 'bg-slate-700 border-slate-600 text-slate-400 cursor-not-allowed'}`}>
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
                    </>
                )}

                {filter === 'wings' && (
                    <>
                        <SharedPreviewCanvas preview={preview} />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {WINGS_DATA.map(wing => {
                                const owned = ownsWing(wing.id);
                                const basePrice = WING_PRICES[wing.tier] || 50000;
                                const price = getDiscountedPrice(basePrice);
                                const isHov = preview.name === wing.name;
                                return (
                                    <div key={wing.id}
                                        className={`bg-[#291d18] border ${owned ? 'border-purple-600' : isHov ? 'border-amber-500' : 'border-[#4a3b32]'} p-3 rounded transition-all cursor-pointer`}
                                        onMouseEnter={() => setPreview({ type: 'wing', color: wing.color, name: wing.name })}
                                        onMouseLeave={() => setPreview({ type: null })}
                                        style={{ boxShadow: isHov ? `0 0 16px ${wing.color}55` : undefined }}>
                                        <div className="flex gap-3 items-center">
                                            <div className="w-14 h-14 rounded-lg flex-shrink-0 flex items-center justify-center relative"
                                                style={{ background: `radial-gradient(circle, ${wing.color}33, #0a0a0a)`, border: `2px solid ${wing.color}${isHov ? 'ff' : '55'}`, boxShadow: isHov ? `0 0 20px ${wing.color}88` : undefined }}>
                                                <div className="w-10 h-10"><PixelWing color={wing.color} /></div>
                                                <div className="absolute top-0.5 right-0.5 text-[8px] font-bold px-1 rounded" style={{ background: getTierBg(wing.tier) + 'cc', color: '#fff' }}>T{wing.tier}</div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className={`text-sm font-bold truncate ${getTierColor(wing.tier)}`}>{wing.name}</div>
                                                <div className="text-[10px] text-slate-400 mt-0.5">+{wing.bonusDamage} Hasar • +{wing.bonusHp} Can{wing.bonusDefense ? ` • +${wing.bonusDefense} Zirh` : ''}</div>
                                                <div className="text-[9px] text-slate-500 italic mt-0.5">Onizlemek icin uzerine gel 👆</div>
                                                <div className="flex justify-between items-center mt-2">
                                                    {owned ? <span className="text-purple-400 text-xs font-bold">✓ SAHIPSIN</span> : (
                                                        <>
                                                            <span className="text-yellow-500 font-mono text-xs font-bold">{price.toLocaleString()} G</span>
                                                            <button onClick={() => onBuyWing?.(wing, price)} disabled={playerState.credits < price}
                                                                className={`px-3 py-1 text-[10px] font-bold rounded border ${playerState.credits >= price ? 'bg-purple-700 hover:bg-purple-600 border-purple-600 text-white' : 'bg-slate-700 border-slate-600 text-slate-400 cursor-not-allowed'}`}>
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
                    </>
                )}

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
                                            {(item as any).damage && <div className="text-[9px] text-red-400">+{(item as any).damage} Hasar</div>}
                                            {(item as any).defense && <div className="text-[9px] text-blue-400">+{(item as any).defense} Savunma</div>}
                                            {(item as any).hp && <div className="text-[9px] text-green-400">+{(item as any).hp} Can</div>}
                                            {(item as any).description && <div className="text-[9px] text-slate-400 italic">{(item as any).description}</div>}
                                        </div>
                                        <div className="flex justify-between items-center mt-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-yellow-500 font-mono text-xs font-bold">{discountedPrice.toLocaleString()} G</span>
                                                {hasDiscount && <span className="text-slate-500 font-mono text-[10px] line-through">{originalPrice.toLocaleString()} G</span>}
                                            </div>
                                            <button onClick={() => onBuy({ ...item, id: uuidv4() }, discountedPrice)}
                                                className="px-3 py-1 bg-[#3f2e26] hover:bg-amber-700 text-[10px] font-bold rounded border border-amber-900/50 text-amber-200">
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