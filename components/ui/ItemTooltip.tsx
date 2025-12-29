import React, { useState, useRef, useEffect } from 'react';
import { Item, WingItem, PetItem } from '../../types';
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

    const rarityColor = RARITY_COLORS[(item as any).rarity || 'common'];
    const rarityName = RARITY_NAMES[(item as any).rarity || 'common'];

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
        const stats: JSX.Element[] = [];

        // Item stats
        if ((item as Item).stats) {
            const itemStats = (item as Item).stats;
            if (itemStats?.damage) stats.push(
                <div key="dmg" className="flex items-center gap-2 text-red-400">
                    <Sword size={12} /> +{itemStats.damage} Hasar
                </div>
            );
            if (itemStats?.defense) stats.push(
                <div key="def" className="flex items-center gap-2 text-blue-400">
                    <Shield size={12} /> +{itemStats.defense} Savunma
                </div>
            );
            if (itemStats?.hp) stats.push(
                <div key="hp" className="flex items-center gap-2 text-green-400">
                    <Heart size={12} /> +{itemStats.hp} Can
                </div>
            );
            if (itemStats?.mana) stats.push(
                <div key="mana" className="flex items-center gap-2 text-blue-300">
                    <Zap size={12} /> +{itemStats.mana} Mana
                </div>
            );
            if (itemStats?.critChance) stats.push(
                <div key="crit" className="flex items-center gap-2 text-yellow-400">
                    <Target size={12} /> +{itemStats.critChance}% Kritik Şansı
                </div>
            );
            if (itemStats?.attackSpeed) stats.push(
                <div key="as" className="flex items-center gap-2 text-orange-400">
                    <Wind size={12} /> +{itemStats.attackSpeed}% Saldırı Hızı
                </div>
            );
            if (itemStats?.strength) stats.push(
                <div key="str" className="flex items-center gap-2 text-red-300">
                    <TrendingUp size={12} /> +{itemStats.strength} Güç
                </div>
            );
            if (itemStats?.dexterity) stats.push(
                <div key="dex" className="flex items-center gap-2 text-green-300">
                    <TrendingUp size={12} /> +{itemStats.dexterity} Çeviklik
                </div>
            );
            if (itemStats?.intelligence) stats.push(
                <div key="int" className="flex items-center gap-2 text-purple-300">
                    <TrendingUp size={12} /> +{itemStats.intelligence} Zeka
                </div>
            );
            if (itemStats?.vitality) stats.push(
                <div key="vit" className="flex items-center gap-2 text-pink-300">
                    <TrendingUp size={12} /> +{itemStats.vitality} Dayanıklılık
                </div>
            );
        }

        // Wing stats
        if ((item as WingItem).flySpeed) {
            const wing = item as WingItem;
            stats.push(
                <div key="fly" className="flex items-center gap-2 text-purple-400">
                    <Wind size={12} /> +{wing.flySpeed}% Uçuş Hızı
                </div>
            );
            if (wing.bonusDamage) stats.push(
                <div key="wdmg" className="flex items-center gap-2 text-red-400">
                    <Sword size={12} /> +{wing.bonusDamage}% Hasar
                </div>
            );
            if (wing.bonusDefense) stats.push(
                <div key="wdef" className="flex items-center gap-2 text-blue-400">
                    <Shield size={12} /> +{wing.bonusDefense}% Savunma
                </div>
            );
        }

        // Pet stats
        if ((item as PetItem).bonusDamage !== undefined) {
            const pet = item as PetItem;
            if (pet.bonusDamage) stats.push(
                <div key="pdmg" className="flex items-center gap-2 text-red-400">
                    <Sword size={12} /> +{pet.bonusDamage}% Hasar
                </div>
            );
            if (pet.bonusDefense) stats.push(
                <div key="pdef" className="flex items-center gap-2 text-blue-400">
                    <Shield size={12} /> +{pet.bonusDefense}% Savunma
                </div>
            );
            if (pet.bonusExp) stats.push(
                <div key="pexp" className="flex items-center gap-2 text-yellow-400">
                    <Star size={12} /> +{pet.bonusExp}% Tecrübe
                </div>
            );
            if (pet.bonusGold) stats.push(
                <div key="pgold" className="flex items-center gap-2 text-amber-400">
                    <Star size={12} /> +{pet.bonusGold}% Altın
                </div>
            );
        }

        return stats;
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
                    className="fixed z-[9999] pointer-events-none animate-fadeIn"
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
                            {item.name}
                            {(item as Item).enhanceLevel && (item as Item).enhanceLevel! > 0 && (
                                <span className="text-yellow-400"> +{(item as Item).enhanceLevel}</span>
                            )}
                        </div>

                        {/* Rarity & Tier */}
                        <div className="flex gap-2 text-[10px] mb-2">
                            <span style={{ color: rarityColor }}>{rarityName}</span>
                            {(item as Item).tier && (
                                <span className="text-slate-400">T{(item as Item).tier}</span>
                            )}
                            {(item as Item).type && (
                                <span className="text-slate-500 capitalize">{(item as Item).type}</span>
                            )}
                        </div>

                        {/* Stats */}
                        <div className="space-y-1 text-xs border-t border-slate-700 pt-2">
                            {renderStats()}
                        </div>

                        {/* Value */}
                        {(item as Item).value && (
                            <div className="mt-2 pt-2 border-t border-slate-700 text-[10px] text-amber-400">
                                💰 Değer: {(item as Item).value} Altın
                            </div>
                        )}

                        {/* Pet Level */}
                        {(item as PetItem).level !== undefined && (
                            <div className="mt-1 text-[10px] text-green-400">
                                ⭐ Seviye: {(item as PetItem).level}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ItemTooltip;
