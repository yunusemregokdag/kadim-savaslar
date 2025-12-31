/**
 * IconMapper - Centralized icon mapping for all game assets
 * 
 * STANDARD: All icons must render via this module.
 * No component should directly use emojis for icons except in DEV fallback.
 * 
 * This module provides:
 * - getItemTypeIcon(type) - Returns icon for item types (weapon, armor, etc.)
 * - getRankIcon(rankId) - Returns rank icon path
 * - getSkillIcon(skillId) - Returns skill icon
 * - getMaterialIcon(materialId) - Returns material icon
 */

import React from 'react';
import { getAssetInfo, getMaterialIcon as getAssetMaterialIcon, getSkillIcon as getAssetSkillIcon, getItemIcon, isDevelopmentMode } from './AssetManager';

// =============================================================================
// ITEM TYPE ICONS - Maps item.type to icon
// =============================================================================

export interface IconResult {
    url: string;
    emoji: string;
    isLocal: boolean;
}

/**
 * Item type to icon mapping
 */
const ITEM_TYPE_ICON_MAP: Record<string, { path: string; emoji: string }> = {
    // Weapons
    weapon: { path: 'weapons/sword', emoji: '⚔️' },
    sword: { path: 'weapons/sword', emoji: '⚔️' },
    axe: { path: 'weapons/axe', emoji: '🪓' },
    staff: { path: 'weapons/staff', emoji: '🪄' },
    bow: { path: 'weapons/bow', emoji: '🏹' },
    dagger: { path: 'weapons/dagger', emoji: '🗡️' },
    mace: { path: 'weapons/mace', emoji: '🔨' },
    spear: { path: 'weapons/spear', emoji: '🔱' },

    // Armor
    armor: { path: 'armor/chest', emoji: '🛡️' },
    chest: { path: 'armor/chest', emoji: '👕' },
    helmet: { path: 'armor/helmet', emoji: '⛑️' },
    pants: { path: 'armor/gloves', emoji: '👖' },
    boots: { path: 'armor/boots', emoji: '👢' },
    gloves: { path: 'armor/gloves', emoji: '🧤' },
    shield: { path: 'armor/shield', emoji: '🛡️' },

    // Accessories
    necklace: { path: 'accessories/necklace', emoji: '📿' },
    earring: { path: 'accessories/earring', emoji: '💎' },
    ring: { path: 'accessories/ring', emoji: '💍' },
    accessory: { path: 'accessories/ring', emoji: '💍' },

    // Consumables
    consumable: { path: 'consumables/hp_potion', emoji: '🧪' },
    potion: { path: 'consumables/hp_potion', emoji: '🧪' },
    hp_potion: { path: 'consumables/hp_potion', emoji: '❤️' },
    mp_potion: { path: 'consumables/mp_potion', emoji: '💙' },

    // Materials
    material: { path: 'materials/iron_ore', emoji: '⚙️' },

    // Cosmetics
    wing: { path: 'cosmetics/wing', emoji: '🪽' },
    pet: { path: 'cosmetics/pet', emoji: '🐾' },
    costume: { path: 'cosmetics/costume', emoji: '👔' },
    pet_egg: { path: 'cosmetics/pet', emoji: '🥚' },
    wing_fragment: { path: 'cosmetics/wing', emoji: '🪶' },

    // Default
    default: { path: 'items/default', emoji: '📦' },
};

// =============================================================================
// MOUNT ICONS - Maps mount ID to icon
// =============================================================================

const MOUNT_ICON_MAP: Record<string, { path: string; emoji: string }> = {
    // Tier 1
    horse_brown: { path: 'mounts/horse_brown', emoji: '🐴' },
    donkey: { path: 'mounts/donkey', emoji: '🫏' },
    camel: { path: 'mounts/camel', emoji: '🐪' },
    // Tier 2
    horse_white: { path: 'mounts/horse_white', emoji: '🦄' },
    elephant: { path: 'mounts/elephant', emoji: '🐘' },
    wolf: { path: 'mounts/wolf', emoji: '🐺' },
    // Tier 3
    tiger: { path: 'mounts/tiger', emoji: '🐅' },
    lion: { path: 'mounts/lion', emoji: '🦁' },
    bear: { path: 'mounts/bear', emoji: '🐻' },
    // Tier 4
    dragon_small: { path: 'mounts/dragon_small', emoji: '🐉' },
    phoenix: { path: 'mounts/phoenix', emoji: '🔥' },
    griffin: { path: 'mounts/griffin', emoji: '🦅' },
    // Tier 5
    dragon_ancient: { path: 'mounts/dragon_ancient', emoji: '🐲' },
    unicorn_divine: { path: 'mounts/unicorn_divine', emoji: '🦄' },
    nightmare: { path: 'mounts/nightmare', emoji: '🌙' },
    // Default
    default: { path: 'mounts/horse_brown', emoji: '🐴' },
};

// =============================================================================
// UI ICONS - Status, crafting, tier indicators
// =============================================================================

const UI_ICON_MAP: Record<string, { path: string; emoji: string }> = {
    // Tier badges
    tier_bronze: { path: 'ui/tier_bronze', emoji: '🥉' },
    tier_silver: { path: 'ui/tier_silver', emoji: '🥈' },
    tier_gold: { path: 'ui/tier_gold', emoji: '🥇' },
    tier_diamond: { path: 'ui/tier_diamond', emoji: '💎' },
    tier_t4: { path: 'ui/tier_t4', emoji: '🟣' },
    tier_t5: { path: 'ui/tier_t5', emoji: '🔴' },
    // Crafting materials
    boss_essence: { path: 'ui/boss_essence', emoji: '💀' },
    void_shard: { path: 'ui/void_shard', emoji: '🌀' },
    gold_coin: { path: 'ui/gold_coin', emoji: '💰' },
    diamond_gem: { path: 'ui/diamond_gem', emoji: '💎' },
    puzzle_piece: { path: 'ui/puzzle_piece', emoji: '🧩' },
    blocked: { path: 'ui/blocked', emoji: '🚫' },
    // Status
    crafting: { path: 'ui/crafting', emoji: '⏳' },
    hammer: { path: 'ui/hammer', emoji: '🔨' },
    locked: { path: 'ui/locked', emoji: '🔒' },
    success: { path: 'ui/success', emoji: '✨' },
    failed: { path: 'ui/failed', emoji: '💔' },
    fire: { path: 'ui/fire', emoji: '🔥' },
    // Zone features
    shop: { path: 'ui/shop', emoji: '🏪' },
    blacksmith: { path: 'ui/blacksmith', emoji: '🔨' },
    healer: { path: 'ui/healer', emoji: '💊' },
    arena: { path: 'ui/arena', emoji: '⚔️' },
    castle: { path: 'ui/castle', emoji: '🏰' },
    safe_zone: { path: 'ui/safe_zone', emoji: '🏠' },
    danger_zone: { path: 'ui/danger_zone', emoji: '☠️' },
    boss_zone: { path: 'ui/boss_zone', emoji: '👑' },
    map_marker: { path: 'ui/map_marker', emoji: '🗺️' },
    // Default
    default: { path: 'ui/default', emoji: '❓' },
};

/**
 * Get icon for an item type
 * Returns both URL (for img) and emoji (for fallback)
 */
export function getItemTypeIcon(type: string): IconResult {
    const mapping = ITEM_TYPE_ICON_MAP[type?.toLowerCase()] || ITEM_TYPE_ICON_MAP.default;
    const assetInfo = getItemIcon(mapping.path);

    return {
        url: assetInfo.url,
        emoji: mapping.emoji,
        isLocal: !isDevelopmentMode(),
    };
}

// =============================================================================
// RANK ICONS - Maps rank ID to icon path
// =============================================================================

const RANK_ICON_MAP: Record<number, { file: string; emoji: string }> = {
    1: { file: 'rank_01.png', emoji: '🌿' },
    2: { file: 'rank_02.png', emoji: '✈️' },
    3: { file: 'rank_03.png', emoji: '⚔️' },
    4: { file: 'rank_04.png', emoji: '🛡️' },
    5: { file: 'rank_05.png', emoji: '🎖️' },
    6: { file: 'rank_06.png', emoji: '⚜️' },
    7: { file: 'rank_07.png', emoji: '🏅' },
    8: { file: 'rank_08.png', emoji: '🎗️' },
    9: { file: 'rank_09.png', emoji: '🏆' },
    10: { file: 'rank_10.png', emoji: '⭐' },
    11: { file: 'rank_11.png', emoji: '⚔️⭐' },
    12: { file: 'rank_12.png', emoji: '🔱' },
    13: { file: 'rank_13.png', emoji: '🏵️' },
    14: { file: 'rank_14.png', emoji: '🛡️⭐' },
    15: { file: 'rank_15.png', emoji: '⚜️' },
    16: { file: 'rank_16.png', emoji: '🌟' },
    17: { file: 'rank_17.png', emoji: '💫' },
    18: { file: 'rank_18.png', emoji: '🔥' },
    19: { file: 'rank_19.png', emoji: '👑🔥' },
    20: { file: 'yuce_hukumdar.png', emoji: '👑' },
    21: { file: 'rank_21.png', emoji: '🌌' },
};

/**
 * Get rank icon by rank ID
 * Ranks are stored in /public/ranks/ folder
 */
export function getRankIcon(rankId: number): IconResult {
    const mapping = RANK_ICON_MAP[rankId] || RANK_ICON_MAP[1];

    return {
        url: `/ranks/${mapping.file}`,
        emoji: mapping.emoji,
        isLocal: true, // Ranks are always local PNG files
    };
}

// =============================================================================
// SKILL ICONS - Maps skill ID to icon
// =============================================================================

export function getSkillIcon(skillId: string): IconResult {
    const assetInfo = getAssetSkillIcon(skillId);
    return {
        url: assetInfo.url,
        emoji: assetInfo.emoji,
        isLocal: !isDevelopmentMode(),
    };
}

// =============================================================================
// MATERIAL ICONS - Maps material ID to icon
// =============================================================================

export function getMaterialIconInfo(materialId: string): IconResult {
    const assetInfo = getAssetMaterialIcon(materialId);
    return {
        url: assetInfo.url,
        emoji: assetInfo.emoji,
        isLocal: !isDevelopmentMode(),
    };
}

// =============================================================================
// MOUNT ICONS - Get mount icon by mount ID
// =============================================================================

export function getMountIcon(mountId: string): IconResult {
    const mapping = MOUNT_ICON_MAP[mountId] || MOUNT_ICON_MAP.default;
    return {
        url: `/assets/mounts/${mapping.path.split('/').pop()}.png`,
        emoji: mapping.emoji,
        isLocal: true,
    };
}

// =============================================================================
// UI ICONS - Get UI/status icon by key
// =============================================================================

export function getUIIcon(uiKey: string): IconResult {
    const mapping = UI_ICON_MAP[uiKey] || UI_ICON_MAP.default;
    return {
        url: `/assets/ui/${mapping.path.split('/').pop()}.png`,
        emoji: mapping.emoji,
        isLocal: true,
    };
}

// =============================================================================
// REACT COMPONENT - Universal Icon Renderer
// =============================================================================

export interface GameIconProps {
    /** Icon type category */
    category: 'item' | 'rank' | 'skill' | 'material' | 'mount' | 'ui';
    /** Icon key (item type, rank id, skill id, material id, mount id, ui key) */
    iconKey: string | number;
    /** Size in pixels */
    size?: number;
    /** Additional CSS class */
    className?: string;
    /** Force emoji mode (for debugging) */
    forceEmoji?: boolean;
}

/**
 * Universal game icon component
 * In PRODUCTION: Always renders PNG, shows placeholder on error
 * In DEVELOPMENT: Falls back to emoji if PNG missing
 */
export const GameIcon: React.FC<GameIconProps> = ({
    category,
    iconKey,
    size = 24,
    className = '',
    forceEmoji = false,
}) => {
    const [useFallback, setUseFallback] = React.useState(forceEmoji && isDevelopmentMode());
    const [hasError, setHasError] = React.useState(false);

    // Get icon based on category
    let iconResult: IconResult;
    switch (category) {
        case 'item':
            iconResult = getItemTypeIcon(String(iconKey));
            break;
        case 'rank':
            iconResult = getRankIcon(Number(iconKey));
            break;
        case 'skill':
            iconResult = getSkillIcon(String(iconKey));
            break;
        case 'material':
            iconResult = getMaterialIconInfo(String(iconKey));
            break;
        case 'mount':
            iconResult = getMountIcon(String(iconKey));
            break;
        case 'ui':
            iconResult = getUIIcon(String(iconKey));
            break;
        default:
            iconResult = { url: '', emoji: '❓', isLocal: false };
    }

    const handleError = React.useCallback(() => {
        setHasError(true);
        // Only allow emoji fallback in development mode
        if (isDevelopmentMode()) {
            setUseFallback(true);
        } else {
            console.error(`[GameIcon] PRODUCTION ERROR: Missing asset ${iconResult.url}`);
        }
    }, [iconResult.url]);

    // In PRODUCTION: Never show emoji fallback - show broken indicator or nothing
    if (hasError && !isDevelopmentMode()) {
        return (
            <span
                className={`game-icon game-icon-missing ${className}`}
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: size,
                    height: size,
                    backgroundColor: 'rgba(255,0,0,0.1)',
                    border: '1px dashed rgba(255,0,0,0.3)',
                    borderRadius: 4,
                    fontSize: size * 0.5,
                    color: 'rgba(255,0,0,0.5)',
                }}
                title={`Missing: ${iconResult.url}`}
            >
                ✕
            </span>
        );
    }

    // DEV ONLY: Emoji fallback
    if (useFallback && isDevelopmentMode()) {
        return (
            <span
                className={`game-icon game-icon-emoji ${className}`}
                style={{
                    fontSize: size * 0.75,
                    lineHeight: 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: size,
                    height: size,
                }}
                role="img"
                aria-label={String(iconKey)}
            >
                {iconResult.emoji}
            </span>
        );
    }

    // Image icon
    return (
        <img
            src={iconResult.url}
            alt={String(iconKey)}
            className={`game-icon game-icon-img ${className}`}
            style={{
                width: size,
                height: size,
                objectFit: 'contain',
            }}
            onError={handleError}
            loading="lazy"
            decoding="async"
        />
    );
};

// =============================================================================
// HELPER: Get icon for display (returns JSX or emoji string)
// =============================================================================

/**
 * Get item type icon as displayable content
 * DEV ONLY - returns empty string in production!
 * For inline text usage where JSX isn't needed
 * @deprecated Use <GameIcon> component instead
 */
export function getItemTypeEmoji(type: string): string {
    // PRODUCTION: Never return emoji - force use of GameIcon component
    if (!isDevelopmentMode()) {
        console.error(`[IconMapper] getItemTypeEmoji("${type}") called in PRODUCTION! Use <GameIcon> instead.`);
        return ''; // Return empty - no emoji in production!
    }
    // DEV ONLY: Return emoji as fallback
    const mapping = ITEM_TYPE_ICON_MAP[type?.toLowerCase()] || ITEM_TYPE_ICON_MAP.default;
    return mapping.emoji;
}

// Export default mapping for reference
export default {
    getItemTypeIcon,
    getRankIcon,
    getSkillIcon,
    getMaterialIconInfo,
    getItemTypeEmoji,
    GameIcon,
};
