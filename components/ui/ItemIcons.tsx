
import React from 'react';
import { Item } from '../../types';
import { Droplet, Box, Bird, Feather } from 'lucide-react';

// Minecraft-style Pixel Art Icons
export const PixelHelmet = ({ color = '#6b7280' }: { color?: string }) => (
    <svg viewBox="0 0 16 16" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
        <rect x="3" y="2" width="10" height="3" fill={color} />
        <rect x="2" y="5" width="12" height="6" fill={color} />
        <rect x="3" y="11" width="10" height="3" fill={color} />
        <rect x="4" y="8" width="3" height="3" fill="#1a1a1a" />
        <rect x="9" y="8" width="3" height="3" fill="#1a1a1a" />
    </svg>
);

export const PixelChestplate = ({ color = '#6b7280' }: { color?: string }) => (
    <svg viewBox="0 0 16 16" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
        <rect x="3" y="1" width="10" height="2" fill={color} />
        <rect x="2" y="3" width="3" height="6" fill={color} />
        <rect x="11" y="3" width="3" height="6" fill={color} />
        <rect x="5" y="3" width="6" height="11" fill={color} />
        <rect x="6" y="4" width="4" height="2" fill="#2a2a2a" />
    </svg>
);

export const PixelLeggings = ({ color = '#6b7280' }: { color?: string }) => (
    <svg viewBox="0 0 16 16" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
        <rect x="4" y="1" width="8" height="3" fill={color} />
        <rect x="4" y="4" width="3" height="11" fill={color} />
        <rect x="9" y="4" width="3" height="11" fill={color} />
    </svg>
);

export const PixelBoots = ({ color = '#6b7280' }: { color?: string }) => (
    <svg viewBox="0 0 16 16" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
        <rect x="2" y="4" width="4" height="8" fill={color} />
        <rect x="10" y="4" width="4" height="8" fill={color} />
        <rect x="1" y="12" width="6" height="3" fill={color} />
        <rect x="9" y="12" width="6" height="3" fill={color} />
    </svg>
);

export const PixelSword = ({ color = '#ef4444' }: { color?: string }) => (
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

export const PixelNecklace = ({ color = '#a855f7' }: { color?: string }) => (
    <svg viewBox="0 0 16 16" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
        <rect x="4" y="2" width="8" height="2" fill="#fbbf24" />
        <rect x="3" y="4" width="2" height="4" fill="#fbbf24" />
        <rect x="11" y="4" width="2" height="4" fill="#fbbf24" />
        <rect x="5" y="8" width="6" height="2" fill="#fbbf24" />
        <rect x="6" y="10" width="4" height="4" fill={color} />
    </svg>
);

export const PixelEarring = ({ color = '#ec4899' }: { color?: string }) => (
    <svg viewBox="0 0 16 16" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
        <rect x="3" y="2" width="3" height="3" fill="#fbbf24" />
        <rect x="4" y="5" width="2" height="3" fill="#fbbf24" />
        <rect x="3" y="8" width="4" height="4" fill={color} />
        <rect x="10" y="2" width="3" height="3" fill="#fbbf24" />
        <rect x="11" y="5" width="2" height="3" fill="#fbbf24" />
        <rect x="10" y="8" width="4" height="4" fill={color} />
    </svg>
);


export const PixelPotion = ({ color = '#ef4444' }: { color?: string }) => (
    <svg viewBox="0 0 16 16" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
        <rect x="7" y="2" width="2" height="3" fill="#cbd5e1" />
        <rect x="6" y="5" width="4" height="1" fill="#cbd5e1" />
        <rect x="5" y="6" width="6" height="8" fill={color} />
        <rect x="6" y="7" width="1" height="1" fill="#ffffff" opacity="0.5" />
        <rect x="5" y="6" width="1" height="8" fill="#1e293b" opacity="0.2" />
        <rect x="10" y="6" width="1" height="8" fill="#1e293b" opacity="0.2" />
        <rect x="5" y="13" width="6" height="1" fill="#1e293b" opacity="0.2" />
    </svg>
);

export const PixelScroll = ({ color = '#fcd34d' }: { color?: string }) => (
    <svg viewBox="0 0 16 16" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
        <rect x="4" y="2" width="8" height="12" fill="#fef3c7" />
        <rect x="3" y="1" width="10" height="2" fill="#d97706" />
        <rect x="3" y="13" width="10" height="2" fill="#d97706" />
        <rect x="6" y="6" width="4" height="4" fill={color} />
    </svg>
);

export const PixelIngot = ({ color = '#94a3b8' }: { color?: string }) => (
    <svg viewBox="0 0 16 16" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
        <rect x="4" y="5" width="8" height="2" fill={color} />
        <rect x="3" y="7" width="10" height="2" fill={color} />
        <rect x="2" y="9" width="12" height="3" fill={color} style={{ filter: 'brightness(0.8)' }} />
    </svg>
);

// Box/Consumable Icon
export const PixelBox = ({ color = '#f59e0b' }: { color?: string }) => (
    <svg viewBox="0 0 16 16" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
        <rect x="3" y="4" width="10" height="2" fill={color} style={{ filter: 'brightness(1.2)' }} />
        <rect x="2" y="6" width="12" height="8" fill={color} />
        <rect x="7" y="4" width="2" height="10" fill={color} style={{ filter: 'brightness(0.7)' }} />
        <rect x="2" y="9" width="12" height="2" fill={color} style={{ filter: 'brightness(0.8)' }} />
    </svg>
);

// Shield Icon
export const PixelShield = ({ color = '#3b82f6' }: { color?: string }) => (
    <svg viewBox="0 0 16 16" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
        <rect x="4" y="2" width="8" height="2" fill={color} />
        <rect x="3" y="4" width="10" height="6" fill={color} />
        <rect x="4" y="10" width="8" height="2" fill={color} />
        <rect x="5" y="12" width="6" height="1" fill={color} />
        <rect x="6" y="13" width="4" height="1" fill={color} />
        <rect x="7" y="14" width="2" height="1" fill={color} />
        {/* Shine */}
        <rect x="5" y="4" width="2" height="3" fill="#ffffff" opacity="0.3" />
    </svg>
);

// Bird/Pet Icon
export const PixelBird = ({ color = '#22c55e' }: { color?: string }) => (
    <svg viewBox="0 0 16 16" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
        {/* Body */}
        <rect x="5" y="6" width="6" height="5" fill={color} />
        {/* Head */}
        <rect x="9" y="4" width="4" height="4" fill={color} />
        {/* Beak */}
        <rect x="13" y="5" width="2" height="2" fill="#f59e0b" />
        {/* Eye */}
        <rect x="11" y="5" width="1" height="1" fill="#1a1a1a" />
        {/* Tail */}
        <rect x="2" y="7" width="3" height="2" fill={color} style={{ filter: 'brightness(0.8)' }} />
        {/* Legs */}
        <rect x="6" y="11" width="1" height="3" fill="#f59e0b" />
        <rect x="9" y="11" width="1" height="3" fill="#f59e0b" />
        {/* Wing */}
        <rect x="6" y="7" width="3" height="3" fill={color} style={{ filter: 'brightness(1.2)' }} />
    </svg>
);

// Coin Icon
export const PixelCoin = ({ color = '#fbbf24' }: { color?: string }) => (
    <svg viewBox="0 0 16 16" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
        <rect x="5" y="2" width="6" height="2" fill={color} />
        <rect x="4" y="4" width="8" height="8" fill={color} />
        <rect x="5" y="12" width="6" height="2" fill={color} />
        <rect x="6" y="5" width="4" height="6" fill={color} style={{ filter: 'brightness(0.8)' }} />
        {/* $ Symbol */}
        <rect x="7" y="4" width="2" height="1" fill={color} style={{ filter: 'brightness(0.6)' }} />
        <rect x="7" y="11" width="2" height="1" fill={color} style={{ filter: 'brightness(0.6)' }} />
    </svg>
);

// Swords Icon (for combat/weapons)
export const PixelSwords = ({ color = '#ef4444' }: { color?: string }) => (
    <svg viewBox="0 0 16 16" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
        {/* Left Sword */}
        <rect x="2" y="2" width="2" height="2" fill={color} />
        <rect x="3" y="4" width="2" height="2" fill={color} />
        <rect x="4" y="6" width="2" height="2" fill={color} />
        <rect x="5" y="8" width="2" height="2" fill="#a16207" />
        <rect x="4" y="10" width="4" height="1" fill="#6b7280" />
        {/* Right Sword */}
        <rect x="12" y="2" width="2" height="2" fill={color} />
        <rect x="11" y="4" width="2" height="2" fill={color} />
        <rect x="10" y="6" width="2" height="2" fill={color} />
        <rect x="9" y="8" width="2" height="2" fill="#a16207" />
        <rect x="8" y="10" width="4" height="1" fill="#6b7280" />
    </svg>
);

// Heart Icon (for HP)
export const PixelHeart = ({ color = '#ef4444' }: { color?: string }) => (
    <svg viewBox="0 0 16 16" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
        <rect x="2" y="4" width="4" height="4" fill={color} />
        <rect x="10" y="4" width="4" height="4" fill={color} />
        <rect x="4" y="3" width="2" height="1" fill={color} />
        <rect x="10" y="3" width="2" height="1" fill={color} />
        <rect x="1" y="5" width="1" height="2" fill={color} />
        <rect x="14" y="5" width="1" height="2" fill={color} />
        <rect x="2" y="8" width="12" height="2" fill={color} />
        <rect x="3" y="10" width="10" height="2" fill={color} />
        <rect x="4" y="12" width="8" height="1" fill={color} />
        <rect x="5" y="13" width="6" height="1" fill={color} />
        <rect x="6" y="14" width="4" height="1" fill={color} />
        <rect x="7" y="15" width="2" height="1" fill={color} />
    </svg>
);

// User/Character Icon
export const PixelUser = ({ color = '#60a5fa' }: { color?: string }) => (
    <svg viewBox="0 0 16 16" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
        {/* Head */}
        <rect x="6" y="2" width="4" height="4" fill={color} />
        {/* Body */}
        <rect x="5" y="6" width="6" height="6" fill={color} />
        {/* Arms */}
        <rect x="3" y="7" width="2" height="4" fill={color} style={{ filter: 'brightness(0.8)' }} />
        <rect x="11" y="7" width="2" height="4" fill={color} style={{ filter: 'brightness(0.8)' }} />
        {/* Legs */}
        <rect x="5" y="12" width="2" height="3" fill={color} style={{ filter: 'brightness(0.9)' }} />
        <rect x="9" y="12" width="2" height="3" fill={color} style={{ filter: 'brightness(0.9)' }} />
    </svg>
);

// Backpack/Inventory Icon
export const PixelBackpack = ({ color = '#f59e0b' }: { color?: string }) => (
    <svg viewBox="0 0 16 16" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
        {/* Straps */}
        <rect x="4" y="1" width="2" height="3" fill={color} style={{ filter: 'brightness(0.7)' }} />
        <rect x="10" y="1" width="2" height="3" fill={color} style={{ filter: 'brightness(0.7)' }} />
        {/* Main bag */}
        <rect x="3" y="4" width="10" height="10" fill={color} />
        {/* Front pocket */}
        <rect x="5" y="8" width="6" height="4" fill={color} style={{ filter: 'brightness(0.8)' }} />
        {/* Buckle */}
        <rect x="7" y="6" width="2" height="2" fill="#fbbf24" />
    </svg>
);

// Scroll/Quest Icon
export const PixelQuest = ({ color = '#fbbf24' }: { color?: string }) => (
    <svg viewBox="0 0 16 16" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
        {/* Top roll */}
        <rect x="3" y="2" width="10" height="2" fill={color} />
        <rect x="2" y="3" width="1" height="2" fill={color} style={{ filter: 'brightness(0.8)' }} />
        <rect x="13" y="3" width="1" height="2" fill={color} style={{ filter: 'brightness(0.8)' }} />
        {/* Paper */}
        <rect x="4" y="4" width="8" height="8" fill="#fef3c7" />
        {/* Lines */}
        <rect x="5" y="5" width="6" height="1" fill="#d97706" />
        <rect x="5" y="7" width="4" height="1" fill="#d97706" />
        <rect x="5" y="9" width="5" height="1" fill="#d97706" />
        {/* Bottom roll */}
        <rect x="3" y="12" width="10" height="2" fill={color} />
    </svg>
);

// Users/Party Icon
export const PixelUsers = ({ color = '#8b5cf6' }: { color?: string }) => (
    <svg viewBox="0 0 16 16" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
        {/* Person 1 (front) */}
        <rect x="6" y="5" width="4" height="3" fill={color} />
        <rect x="5" y="8" width="6" height="5" fill={color} />
        {/* Person 2 (left back) */}
        <rect x="2" y="3" width="3" height="2" fill={color} style={{ filter: 'brightness(0.7)' }} />
        <rect x="1" y="5" width="5" height="4" fill={color} style={{ filter: 'brightness(0.7)' }} />
        {/* Person 3 (right back) */}
        <rect x="11" y="3" width="3" height="2" fill={color} style={{ filter: 'brightness(0.7)' }} />
        <rect x="10" y="5" width="5" height="4" fill={color} style={{ filter: 'brightness(0.7)' }} />
    </svg>
);

// Hammer/Blacksmith Icon
export const PixelHammer = ({ color = '#94a3b8' }: { color?: string }) => (
    <svg viewBox="0 0 16 16" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
        {/* Hammer head */}
        <rect x="8" y="2" width="6" height="4" fill={color} />
        <rect x="7" y="3" width="1" height="2" fill={color} style={{ filter: 'brightness(1.2)' }} />
        {/* Handle */}
        <rect x="4" y="5" width="2" height="9" fill="#a16207" />
        <rect x="3" y="13" width="4" height="2" fill="#a16207" style={{ filter: 'brightness(0.8)' }} />
    </svg>
);

// Map Icon
export const PixelMap = ({ color = '#22c55e' }: { color?: string }) => (
    <svg viewBox="0 0 16 16" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
        {/* Paper background */}
        <rect x="2" y="2" width="12" height="12" fill="#fef3c7" />
        {/* Fold lines */}
        <rect x="6" y="2" width="1" height="12" fill="#d97706" opacity="0.3" />
        <rect x="10" y="2" width="1" height="12" fill="#d97706" opacity="0.3" />
        {/* X mark */}
        <rect x="8" y="5" width="2" height="2" fill="#ef4444" />
        <rect x="7" y="4" width="1" height="1" fill="#ef4444" />
        <rect x="10" y="4" width="1" height="1" fill="#ef4444" />
        <rect x="7" y="7" width="1" height="1" fill="#ef4444" />
        <rect x="10" y="7" width="1" height="1" fill="#ef4444" />
        {/* Path */}
        <rect x="4" y="9" width="8" height="1" fill={color} />
        <rect x="4" y="10" width="1" height="2" fill={color} />
    </svg>
);

// Trophy/Ranking Icon  
export const PixelTrophy = ({ color = '#fbbf24' }: { color?: string }) => (
    <svg viewBox="0 0 16 16" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
        {/* Cup body */}
        <rect x="4" y="2" width="8" height="6" fill={color} />
        {/* Handles */}
        <rect x="2" y="3" width="2" height="3" fill={color} style={{ filter: 'brightness(0.8)' }} />
        <rect x="12" y="3" width="2" height="3" fill={color} style={{ filter: 'brightness(0.8)' }} />
        {/* Stem */}
        <rect x="7" y="8" width="2" height="3" fill={color} style={{ filter: 'brightness(0.9)' }} />
        {/* Base */}
        <rect x="5" y="11" width="6" height="2" fill={color} />
        <rect x="4" y="13" width="8" height="1" fill={color} style={{ filter: 'brightness(0.8)' }} />
        {/* Star */}
        <rect x="7" y="4" width="2" height="2" fill="#ffffff" opacity="0.5" />
    </svg>
);

// Shopping Cart/Market Icon
export const PixelCart = ({ color = '#f59e0b' }: { color?: string }) => (
    <svg viewBox="0 0 16 16" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
        {/* Cart body */}
        <rect x="3" y="4" width="10" height="6" fill={color} />
        {/* Handle */}
        <rect x="1" y="3" width="3" height="2" fill={color} style={{ filter: 'brightness(0.8)' }} />
        {/* Bottom angle */}
        <rect x="4" y="10" width="8" height="1" fill={color} style={{ filter: 'brightness(0.9)' }} />
        {/* Wheels */}
        <rect x="4" y="12" width="2" height="2" fill="#1a1a1a" />
        <rect x="10" y="12" width="2" height="2" fill="#1a1a1a" />
        {/* Items in cart */}
        <rect x="5" y="5" width="2" height="2" fill="#22c55e" />
        <rect x="8" y="5" width="2" height="3" fill="#3b82f6" />
    </svg>
);

export const PixelWing = ({ color = '#a78bfa' }: { color?: string }) => (
    <svg viewBox="0 0 16 16" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
        {/* Left Wing */}
        <rect x="1" y="5" width="2" height="2" fill={color} />
        <rect x="2" y="4" width="2" height="1" fill={color} />
        <rect x="3" y="3" width="2" height="1" fill={color} />
        <rect x="3" y="6" width="2" height="3" fill={color} />
        <rect x="4" y="4" width="2" height="2" fill={color} style={{ filter: 'brightness(1.2)' }} />
        <rect x="5" y="7" width="2" height="4" fill={color} />
        <rect x="6" y="5" width="1" height="2" fill={color} style={{ filter: 'brightness(1.2)' }} />
        {/* Right Wing (mirrored) */}
        <rect x="13" y="5" width="2" height="2" fill={color} />
        <rect x="12" y="4" width="2" height="1" fill={color} />
        <rect x="11" y="3" width="2" height="1" fill={color} />
        <rect x="11" y="6" width="2" height="3" fill={color} />
        <rect x="10" y="4" width="2" height="2" fill={color} style={{ filter: 'brightness(1.2)' }} />
        <rect x="9" y="7" width="2" height="4" fill={color} />
        <rect x="9" y="5" width="1" height="2" fill={color} style={{ filter: 'brightness(1.2)' }} />
        {/* Center body connection */}
        <rect x="7" y="6" width="2" height="5" fill={color} style={{ filter: 'brightness(0.8)' }} />
    </svg>
);

export const renderItemIcon = (item: Item) => {
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
        case 'consumable':
        case 'upgrade_scroll':
            const name = item.name.toLowerCase();
            if (name.includes('parşömen') || item.type === 'upgrade_scroll') return <PixelScroll color="#3b82f6" />;
            if (name.includes('can') || name.includes('super health')) return <PixelPotion color="#ef4444" />;
            if (name.includes('mana')) return <PixelPotion color="#3b82f6" />;
            if (name.includes('karma') || name.includes('mixed')) return <PixelPotion color="#a855f7" />;
            if (name.includes('servet') || name.includes('wealth')) return <PixelPotion color="#fbbf24" />;
            if (name.includes('iksir')) return <PixelPotion color="#22c55e" />;
            return <PixelPotion color="#ef4444" />;
        case 'material': return <PixelIngot color="#94a3b8" />;
        case 'pet_egg': return <Bird className="text-green-400 w-6 h-6" />;
        case 'wing_fragment': return <Feather className="text-yellow-400 w-6 h-6" />;
        default: return <Box className="text-slate-500 w-6 h-6" />;
    }
};
