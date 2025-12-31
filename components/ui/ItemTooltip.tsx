import React, { useState, useRef, useEffect } from 'react';
import { Item, WingItem, PetItem } from '../../types';
import { getItemDisplayData } from '../../utils/ItemDisplayAdapter';
import { Sword, Shield, Heart, Zap, Target, Wind, Star, TrendingUp } from 'lucide-react';

interface ItemTooltipProps {
    item: Item | WingItem | PetItem | null;
    children: React.ReactNode;
    disabled?: boolean;
}

// Rarity colors
const RARITY_COLORS: Record<string, string> = {
    common: '#9ca3af',
    uncommon: '#22c55e',
    rare: '#3b82f6',
    epic: '#a855f7',
    legendary: '#f59e0b',
    mythic: '#ef4444',
};

const RARITY_NAMES: Record<string, string> = {
    common: 'Sıradan',
    uncommon: 'Nadir Olmayan',
    rare: 'Nadir',
    epic: 'Destansı',
    legendary: 'Efsanevi',
    mythic: 'Mitik',
};

export const ItemTooltip: React.FC<ItemTooltipProps> = ({ item, children, disabled = false }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
    const longPressTimer = useRef<NodeJS.Timeout | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (longPressTimer.current) {
                clearTimeout(longPressTimer.current);
            }
        };
    }, []);

    const handleMouseEnter = (e: React.MouseEvent) => {
        if (disabled || !item) return;
        setTooltipPos({ x: e.clientX, y: e.clientY });
        setShowTooltip(true);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (showTooltip) {
            setTooltipPos({ x: e.clientX, y: e.clientY });
        }
    };

    const handleMouseLeave = () => {
        setShowTooltip(false);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        if (disabled || !item) return;
        const touch = e.touches[0];
        setTooltipPos({ x: touch.clientX, y: touch.clientY });

        longPressTimer.current = setTimeout(() => {
            setShowTooltip(true);
        }, 400); // 400ms long press
    };

    const handleTouchEnd = () => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
        }
        // Hide tooltip after a short delay on touch end
        setTimeout(() => setShowTooltip(false), 1500);
    };

    const handleTouchMove = () => {
        // Cancel long press if user moves finger
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
        }
    };

    if (!item) return <>{children}</>;

    const displayData = getItemDisplayData(item);

    // Rarity Colors and Names
    const rarityColor = RARITY_COLORS[displayData.rarity] || RARITY_COLORS.common;
    const rarityName = RARITY_NAMES[displayData.rarity] || 'Sıradan';

    // Calculate tooltip position to keep it on screen
    const getTooltipStyle = () => {
        const padding = 10;
        let left = tooltipPos.x + padding;
        let top = tooltipPos.y + padding;

        // Adjust if tooltip would go off screen
        if (typeof window !== 'undefined') {
            if (left + 250 > window.innerWidth) {
                left = tooltipPos.x - 260;
            }
            if (top + 300 > window.innerHeight) {
                top = tooltipPos.y - 300;
            }
        }

        return { left, top };
    };

    const renderStats = () => {
        // If displayData doesn't give us raw stats easily, we might want to check the item prop directly if possible.
        // However, item prop is Item | WingItem | PetItem. Let's cast it safely if it has stats.
        const itemStats = (item as any).stats || {};

        return (
            <div className="flex flex-col gap-1.5 mt-2">
                {/* DEFENSE / ARMOR */}
                {itemStats.defense > 0 && (
                    <div className="flex items-center gap-2 text-blue-400">
                        <Shield size={12} className="fill-blue-500/20" />
                        <span className="font-bold">+{itemStats.defense} Savunma</span>
                    </div>
                )}

                {/* ATTACK DAMAGE */}
                {itemStats.damage > 0 && (
                    <div className="flex items-center gap-2 text-red-500">
                        <Sword size={12} className="fill-red-500/20" />
                        <span className="font-bold">+{itemStats.damage} Hasar</span>
                    </div>
                )}

                {/* HP */}
                {itemStats.hp > 0 && (
                    <div className="flex items-center gap-2 text-emerald-400">
                        <Heart size={12} className="fill-emerald-500/20" />
                        <span className="font-bold">+{itemStats.hp} Can</span>
                    </div>
                )}

                {/* MANA */}
                {itemStats.mana > 0 && (
                    <div className="flex items-center gap-2 text-blue-300">
                        <Zap size={12} className="fill-blue-400/20" />
                        <span className="font-bold">+{itemStats.mana} Mana</span>
                    </div>
                )}

                {/* CRIT CHANCE */}
                {itemStats.critChance > 0 && (
                    <div className="flex items-center gap-2 text-yellow-400">
                        <Target size={12} className="fill-yellow-500/20" />
                        <span className="font-bold">+{itemStats.critChance}% Kritik Şansı</span>
                    </div>
                )}

                {/* ATTACK SPEED */}
                {itemStats.attackSpeed > 0 && (
                    <div className="flex items-center gap-2 text-orange-300">
                        <Wind size={12} className="fill-orange-400/20" />
                        <span className="font-bold">+{itemStats.attackSpeed}% Saldırı Hızı</span>
                    </div>
                )}

                {/* STR */}
                {itemStats.strength > 0 && (
                    <div className="flex items-center gap-2 text-orange-500">
                        <TrendingUp size={12} className="fill-orange-600/20" />
                        <span className="font-bold">+{itemStats.strength} Güç</span>
                    </div>
                )}

                {/* DEX */}
                {itemStats.dexterity > 0 && (
                    <div className="flex items-center gap-2 text-green-500">
                        <TrendingUp size={12} className="fill-green-600/20" />
                        <span className="font-bold">+{itemStats.dexterity} Çeviklik</span>
                    </div>
                )}

                {/* INT */}
                {itemStats.intelligence > 0 && (
                    <div className="flex items-center gap-2 text-cyan-400">
                        <TrendingUp size={12} className="fill-cyan-500/20" />
                        <span className="font-bold">+{itemStats.intelligence} Zeka</span>
                    </div>
                )}

                {/* VIT */}
                {itemStats.vitality > 0 && (
                    <div className="flex items-center gap-2 text-pink-400">
                        <TrendingUp size={12} className="fill-pink-500/20" />
                        <span className="font-bold">+{itemStats.vitality} Dayanıklılık</span>
                    </div>
                )}

                {/* Other buffs/lines that might not be in stats object directly */}
                {displayData.buffsLines.length > 0 && (
                    <div className="mt-1 pt-1 border-t border-slate-700/50">
                        {displayData.buffsLines.map((buff: string, i: number) => (
                            <div key={i} className="text-green-400 text-[10px] flex items-center gap-1">
                                <Star size={8} /> {buff}
                            </div>
                        ))}
                    </div>
                )}

                {displayData.durabilityLine && (
                    <div className="text-slate-500 text-[10px] mt-1 border-t border-slate-700/50 pt-1">
                        Dayanıklılık: {displayData.durabilityLine}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div
            ref={containerRef}
            onMouseEnter={handleMouseEnter}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchMove={handleTouchMove}
            className="relative group"
        >
            {children}

            {showTooltip && (
                <div
                    className="fixed z-[99999] pointer-events-none animate-fadeIn"
                    style={getTooltipStyle()}
                >
                    <div
                        className="bg-[#0f0b08]/95 border-2 rounded-xl p-4 min-w-[220px] max-w-[300px] shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-md"
                        style={{ borderColor: rarityColor, boxShadow: `0 0 15px ${rarityColor}20` }}
                    >
                        {/* Item Name */}
                        <div className="flex justify-between items-start mb-1">
                            <div
                                className="text-base font-bold leading-tight"
                                style={{ color: rarityColor }}
                            >
                                {displayData.name}
                            </div>
                            {displayData.plus > 0 && (
                                <div className="ml-2 px-1.5 py-0.5 bg-yellow-900/40 border border-yellow-700/50 rounded text-yellow-400 text-xs font-bold whitespace-nowrap">
                                    +{displayData.plus}
                                </div>
                            )}
                        </div>

                        {/* Rarity & Tier */}
                        <div className="flex gap-2 text-[10px] mb-3 uppercase tracking-wider font-bold opacity-80 border-b border-white/10 pb-2">
                            <span style={{ color: displayData.tierLabel.includes('T5') ? '#ef4444' : displayData.tierLabel.includes('T4') ? '#a855f7' : '#94a3b8' }}>{displayData.tierLabel}</span>
                            <span className="text-slate-500">•</span>
                            <span className="text-slate-400 capitalize">{displayData.type.replace('_', ' ')}</span>
                        </div>

                        {/* Stats Section with Custom Colors */}
                        <div className="text-xs">
                            {renderStats()}
                        </div>

                        {/* Value */}
                        {displayData.value && (
                            <div className="mt-3 pt-2 border-t border-white/10 text-[10px] text-amber-500 font-bold flex items-center gap-1.5">
                                💰 Değer: <span className="text-amber-300 text-xs">{displayData.value} Altın</span>
                            </div>
                        )}

                        {/* Description */}
                        {displayData.description && (
                            <div className="mt-2 text-[10px] text-slate-500 italic leading-relaxed">
                                "{displayData.description}"
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ItemTooltip;
