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
        return (
            <div className="flex flex-col gap-1">
                {displayData.statsLines.map((stat: any, idx: number) => (
                    <div key={idx} className={`flex items-center gap-2 ${stat.isBonus ? 'text-blue-300' : 'text-slate-300'}`}>
                        <span className="opacity-70">{stat.label}:</span>
                        <span className="font-bold">{stat.value}</span>
                    </div>
                ))}
                {displayData.buffsLines.length > 0 && (
                    <div className="mt-2 text-green-400 text-xs">
                        {displayData.buffsLines.map((buff: string, i: number) => (
                            <div key={i}>• {buff}</div>
                        ))}
                    </div>
                )}
                {displayData.durabilityLine && (
                    <div className="text-slate-500 text-[10px] mt-1">Dayanıklılık: {displayData.durabilityLine}</div>
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
            className="relative"
        >
            {children}

            {showTooltip && (
                <div
                    className="fixed z-[99999] pointer-events-none animate-fadeIn"
                    style={getTooltipStyle()}
                >
                    <div
                        className="bg-slate-900/95 border-2 rounded-lg p-3 min-w-[200px] max-w-[280px] shadow-2xl backdrop-blur-sm"
                        style={{ borderColor: rarityColor }}
                    >
                        {/* Item Name */}
                        <div
                            className="text-sm font-bold mb-1"
                            style={{ color: rarityColor }}
                        >
                            {displayData.name}
                            {displayData.plus > 0 && (
                                <span className="text-yellow-400"> +{displayData.plus}</span>
                            )}
                        </div>

                        {/* Rarity & Tier */}
                        <div className="flex gap-2 text-[10px] mb-2">
                            <span style={{ color: rarityColor }}>{rarityName}</span>
                            <span className="text-slate-400">{displayData.tierLabel}</span>
                            <span className="text-slate-500 capitalize">{displayData.type.replace('_', ' ')}</span>
                        </div>

                        {/* Stats */}
                        <div className="space-y-1 text-xs border-t border-slate-700 pt-2">
                            {renderStats()}
                        </div>

                        {/* Value */}
                        {displayData.value && (
                            <div className="mt-2 pt-2 border-t border-slate-700 text-[10px] text-amber-400">
                                💰 Değer: {displayData.value} Altın
                            </div>
                        )}

                        {/* Description */}
                        {displayData.description && (
                            <div className="mt-2 text-xs italic text-slate-500">
                                {displayData.description}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ItemTooltip;
