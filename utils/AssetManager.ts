/**
 * AssetManager - Local Asset Pipeline for Production
 * 
 * RELEASE REQUIREMENT: All icons MUST load from local PNG assets in production.
 * Emoji fallback is allowed ONLY in development mode.
 * 
 * Asset Structure:
 * /public/assets/materials/*.png (32x32 or 64x64)
 * /public/assets/skills/*.png (48x48 or 96x96)
 * /public/assets/items/*.png (48x48 or 96x96)
 * /public/assets/vfx/*.png (sprite atlases 512x512)
 */

// Environment detection
const IS_DEV = import.meta.env.DEV;
const IS_PROD = import.meta.env.PROD;

// Asset base path
const ASSET_BASE = '/assets';

/**
 * Asset Manifest - Maps keys to their asset files and fallback emojis
 */
interface AssetEntry {
    file: string;
    emoji: string;
}

type AssetManifest = Record<string, AssetEntry>;

// =============================================================================
// MATERIAL ASSETS (32x32 or 64x64 PNG with alpha)
// =============================================================================
const MATERIAL_MANIFEST: AssetManifest = {
    // Basic Materials
    iron_ore: { file: 'iron_ore.png', emoji: '⚙️' },
    copper_ore: { file: 'copper_ore.png', emoji: '🟤' },
    gold_ore: { file: 'gold_ore.png', emoji: '🪙' },
    diamond_ore: { file: 'diamond_ore.png', emoji: '💎' },
    wood_log: { file: 'wood_log.png', emoji: '🪵' },
    stone: { file: 'stone.png', emoji: '🪨' },
    leather_scrap: { file: 'leather_scrap.png', emoji: '🥩' },
    herb_green: { file: 'herb_green.png', emoji: '🌿' },
    cloth: { file: 'cloth.png', emoji: '🧵' },
    bone: { file: 'bone.png', emoji: '🦴' },

    // Boss & Elite Materials
    dragon_scale: { file: 'dragon_scale.png', emoji: '🐉' },
    phoenix_feather: { file: 'phoenix_feather.png', emoji: '🔥' },
    titan_essence: { file: 'titan_essence.png', emoji: '⚡' },
    void_crystal: { file: 'void_crystal.png', emoji: '🔮' },
    ancient_rune: { file: 'ancient_rune.png', emoji: '📜' },
    soul_shard: { file: 'soul_shard.png', emoji: '👻' },

    // Crafting Materials
    magic_dust: { file: 'magic_dust.png', emoji: '✨' },
    enchant_scroll: { file: 'enchant_scroll.png', emoji: '📜' },
    upgrade_stone: { file: 'upgrade_stone.png', emoji: '💠' },
    protection_scroll: { file: 'protection_scroll.png', emoji: '🛡️' },
};

// =============================================================================
// SKILL ASSETS (48x48 or 96x96 PNG with alpha)
// =============================================================================
const SKILL_MANIFEST: AssetManifest = {
    // Warrior Skills
    w1: { file: 'warrior/sword_strike.png', emoji: '⚔️' },
    w2: { file: 'warrior/shield_wall.png', emoji: '🛡️' },
    w3: { file: 'warrior/rage_burst.png', emoji: '💢' },
    w4: { file: 'warrior/ground_slam.png', emoji: '💥' },
    w5: { file: 'warrior/spear_throw.png', emoji: '🔱' },
    w6: { file: 'warrior/war_cry.png', emoji: '📢' },
    w7: { file: 'warrior/whirlwind.png', emoji: '🌀' },

    // Mage Skills
    m1: { file: 'mage/fireball.png', emoji: '🔥' },
    m2: { file: 'mage/ice_shield.png', emoji: '❄️' },
    m3: { file: 'mage/teleport.png', emoji: '💨' },
    m4: { file: 'mage/lightning_chain.png', emoji: '⚡' },
    m5: { file: 'mage/meteor.png', emoji: '☄️' },
    m6: { file: 'mage/mana_drain.png', emoji: '💧' },
    m7: { file: 'mage/cosmic_destruction.png', emoji: '🌌' },

    // Shaman Skills
    s1: { file: 'shaman/spirit_bolt.png', emoji: '✨' },
    s2: { file: 'shaman/heal_light.png', emoji: '💚' },
    s3: { file: 'shaman/speed_totem.png', emoji: '🏃' },
    s4: { file: 'shaman/poison_vine.png', emoji: '🌿' },
    s5: { file: 'shaman/earth_shield.png', emoji: '🪨' },
    s6: { file: 'shaman/cleanse.png', emoji: '💦' },
    s7: { file: 'shaman/ancestor_wrath.png', emoji: '👻' },

    // Archer Skills
    a1: { file: 'archer/arrow_shot.png', emoji: '🏹' },
    a2: { file: 'archer/evasion.png', emoji: '💨' },
    a3: { file: 'archer/multishot.png', emoji: '🎯' },
    a4: { file: 'archer/poison_arrow.png', emoji: '☠️' },
    a5: { file: 'archer/trap.png', emoji: '🪤' },
    a6: { file: 'archer/eagle_eye.png', emoji: '🦅' },
    a7: { file: 'archer/arrow_rain.png', emoji: '🌧️' },

    // Generic/Lucide Icon Names (for constants.ts compatibility)
    Sword: { file: 'common/sword.png', emoji: '⚔️' },
    Shield: { file: 'common/shield.png', emoji: '🛡️' },
    Zap: { file: 'common/zap.png', emoji: '⚡' },
    Flame: { file: 'common/flame.png', emoji: '🔥' },
    Heart: { file: 'common/heart.png', emoji: '❤️' },
    Snowflake: { file: 'common/snowflake.png', emoji: '❄️' },
    Wind: { file: 'common/wind.png', emoji: '💨' },
    Orbit: { file: 'common/orbit.png', emoji: '🌙' },
    Droplet: { file: 'common/droplet.png', emoji: '💧' },
    Sun: { file: 'common/sun.png', emoji: '☀️' },
    Sparkles: { file: 'common/sparkles.png', emoji: '✨' },
    Feather: { file: 'common/feather.png', emoji: '🪶' },
    Trees: { file: 'common/trees.png', emoji: '🌲' },
    Ghost: { file: 'common/ghost.png', emoji: '👻' },
    MoveDown: { file: 'common/move_down.png', emoji: '⬇️' },
    ArrowUp: { file: 'common/arrow_up.png', emoji: '⬆️' },
    Mic: { file: 'common/mic.png', emoji: '🎤' },
    RotateCw: { file: 'common/rotate.png', emoji: '🔄' },
    Target: { file: 'common/target.png', emoji: '🎯' },
    Crosshair: { file: 'common/crosshair.png', emoji: '⊕' },
};

// =============================================================================
// ITEM ASSETS (48x48 or 96x96 PNG with alpha)
// =============================================================================
const ITEM_MANIFEST: AssetManifest = {
    // Weapons
    sword: { file: 'weapons/sword.png', emoji: '⚔️' },
    axe: { file: 'weapons/axe.png', emoji: '🪓' },
    staff: { file: 'weapons/staff.png', emoji: '🪄' },
    bow: { file: 'weapons/bow.png', emoji: '🏹' },
    dagger: { file: 'weapons/dagger.png', emoji: '🗡️' },
    mace: { file: 'weapons/mace.png', emoji: '🔨' },
    spear: { file: 'weapons/spear.png', emoji: '🔱' },

    // Armor
    helmet: { file: 'armor/helmet.png', emoji: '🪖' },
    chest: { file: 'armor/chest.png', emoji: '👕' },
    gloves: { file: 'armor/gloves.png', emoji: '🧤' },
    boots: { file: 'armor/boots.png', emoji: '👢' },
    shield: { file: 'armor/shield.png', emoji: '🛡️' },

    // Accessories
    ring: { file: 'accessories/ring.png', emoji: '💍' },
    necklace: { file: 'accessories/necklace.png', emoji: '📿' },
    earring: { file: 'accessories/earring.png', emoji: '💎' },

    // Consumables
    hp_potion: { file: 'consumables/hp_potion.png', emoji: '❤️' },
    mp_potion: { file: 'consumables/mp_potion.png', emoji: '💙' },
    buff_potion: { file: 'consumables/buff_potion.png', emoji: '💪' },

    // Pets & Wings
    pet: { file: 'cosmetics/pet.png', emoji: '🐾' },
    wing: { file: 'cosmetics/wing.png', emoji: '🪽' },
    costume: { file: 'cosmetics/costume.png', emoji: '👔' },
};

// =============================================================================
// VFX SPRITE ATLAS (512x512 sheets)
// =============================================================================
const VFX_MANIFEST: AssetManifest = {
    fire_particles: { file: 'fire_particles.png', emoji: '🔥' },
    ice_particles: { file: 'ice_particles.png', emoji: '❄️' },
    lightning_particles: { file: 'lightning_particles.png', emoji: '⚡' },
    heal_particles: { file: 'heal_particles.png', emoji: '💚' },
    poison_particles: { file: 'poison_particles.png', emoji: '☠️' },
    physical_particles: { file: 'physical_particles.png', emoji: '💥' },
    dark_particles: { file: 'dark_particles.png', emoji: '🌑' },
    holy_particles: { file: 'holy_particles.png', emoji: '✨' },
};

// =============================================================================
// ASSET LOADING CACHE
// =============================================================================
const assetCache: Map<string, string> = new Map();
const assetValidationErrors: string[] = [];

/**
 * Check if a local asset file exists (client-side check via fetch HEAD)
 */
async function checkAssetExists(path: string): Promise<boolean> {
    try {
        const response = await fetch(path, { method: 'HEAD' });
        return response.ok;
    } catch {
        return false;
    }
}

/**
 * Normalize a key for fuzzy matching
 */
function normalizeKey(key: string): string {
    return key
        .toLowerCase()
        .replace(/[\s_-]+/g, '_')
        .replace(/[^a-z0-9_]/g, '')
        .trim();
}

/**
 * Find asset entry with fallback chain:
 * 1. Exact match
 * 2. Normalized key match
 * 3. Default placeholder
 */
function findAssetEntry(
    manifest: AssetManifest,
    key: string,
    defaultEmoji: string = '❓'
): AssetEntry {
    // 1. Exact match
    if (manifest[key]) {
        return manifest[key];
    }

    // 2. Normalized key match
    const normalizedKey = normalizeKey(key);
    for (const [manifestKey, entry] of Object.entries(manifest)) {
        if (normalizeKey(manifestKey) === normalizedKey) {
            return entry;
        }
    }

    // 3. Default placeholder
    return { file: 'placeholder.png', emoji: defaultEmoji };
}

/**
 * Get asset URL with fallback chain
 */
function getAssetUrl(
    manifest: AssetManifest,
    basePath: string,
    key: string,
    defaultEmoji: string = '❓'
): string {
    const entry = findAssetEntry(manifest, key, defaultEmoji);
    const assetPath = `${ASSET_BASE}/${basePath}/${entry.file}`;

    // Check cache first
    if (assetCache.has(assetPath)) {
        return assetCache.get(assetPath)!;
    }

    // In production, we MUST use the local asset path
    // If the file doesn't exist, it will show a broken image (intentional for debugging)
    if (IS_PROD) {
        assetCache.set(assetPath, assetPath);
        return assetPath;
    }

    // In development, return the asset path (will fallback to emoji in UI if broken)
    assetCache.set(assetPath, assetPath);
    return assetPath;
}

/**
 * Get fallback display for an asset (emoji only in DEV, error in PROD)
 */
function getAssetFallback(
    manifest: AssetManifest,
    key: string,
    defaultEmoji: string = '❓'
): string {
    const entry = findAssetEntry(manifest, key, defaultEmoji);

    if (IS_PROD) {
        // In production, log error but still return emoji as last resort
        // The build validation should have caught missing assets
        console.error(`[AssetManager] PRODUCTION ERROR: Missing asset for key "${key}"`);
        assetValidationErrors.push(`Missing asset: ${key}`);
    }

    return entry.emoji;
}

// =============================================================================
// PUBLIC API - Asset Getters
// =============================================================================

/**
 * Get material icon path or fallback
 * @param materialKey - Material identifier (e.g., 'iron_ore', 'wood_log')
 * @returns Object with url (for <img>) and emoji (for fallback display)
 */
export function getMaterialIcon(materialKey: string): { url: string; emoji: string } {
    const entry = findAssetEntry(MATERIAL_MANIFEST, materialKey, '📦');
    const url = getAssetUrl(MATERIAL_MANIFEST, 'materials', materialKey, '📦');
    return { url, emoji: entry.emoji };
}

/**
 * Get skill icon path or fallback
 * @param skillKey - Skill identifier (e.g., 'w1', 'm3', 'Flame')
 * @returns Object with url (for <img>) and emoji (for fallback display)
 */
export function getSkillIcon(skillKey: string): { url: string; emoji: string } {
    const entry = findAssetEntry(SKILL_MANIFEST, skillKey, '⚡');
    const url = getAssetUrl(SKILL_MANIFEST, 'skills', skillKey, '⚡');
    return { url, emoji: entry.emoji };
}

/**
 * Get item icon path or fallback
 * @param itemKey - Item identifier (e.g., 'sword', 'helmet', 'hp_potion')
 * @returns Object with url (for <img>) and emoji (for fallback display)
 */
export function getItemIcon(itemKey: string): { url: string; emoji: string } {
    const entry = findAssetEntry(ITEM_MANIFEST, itemKey, '📦');
    const url = getAssetUrl(ITEM_MANIFEST, 'items', itemKey, '📦');
    return { url, emoji: entry.emoji };
}

/**
 * Get VFX sprite atlas path or fallback
 * @param atlasName - Atlas identifier (e.g., 'fire_particles', 'heal_particles')
 * @returns Object with url (for texture loading) and emoji (for fallback)
 */
export function getVfxSpriteAtlas(atlasName: string): { url: string; emoji: string } {
    const entry = findAssetEntry(VFX_MANIFEST, atlasName, '✨');
    const url = getAssetUrl(VFX_MANIFEST, 'vfx', atlasName, '✨');
    return { url, emoji: entry.emoji };
}

// =============================================================================
// ASSET IMAGE COMPONENT - React Component with fallback
// =============================================================================

/**
 * Asset image component that handles loading and fallback
 */
export interface AssetImageProps {
    type: 'material' | 'skill' | 'item' | 'vfx';
    assetKey: string;
    size?: number;
    className?: string;
    alt?: string;
}

/**
 * Get asset info based on type and key
 */
export function getAssetInfo(type: AssetImageProps['type'], assetKey: string): { url: string; emoji: string } {
    switch (type) {
        case 'material':
            return getMaterialIcon(assetKey);
        case 'skill':
            return getSkillIcon(assetKey);
        case 'item':
            return getItemIcon(assetKey);
        case 'vfx':
            return getVfxSpriteAtlas(assetKey);
        default:
            return { url: '', emoji: '❓' };
    }
}

// =============================================================================
// VALIDATION & BUILD HELPERS
// =============================================================================

/**
 * Get all required asset paths for build validation
 */
export function getAllRequiredAssets(): { path: string; key: string; type: string }[] {
    const assets: { path: string; key: string; type: string }[] = [];

    // Materials
    for (const [key, entry] of Object.entries(MATERIAL_MANIFEST)) {
        assets.push({
            path: `${ASSET_BASE}/materials/${entry.file}`,
            key,
            type: 'material'
        });
    }

    // Skills
    for (const [key, entry] of Object.entries(SKILL_MANIFEST)) {
        assets.push({
            path: `${ASSET_BASE}/skills/${entry.file}`,
            key,
            type: 'skill'
        });
    }

    // Items
    for (const [key, entry] of Object.entries(ITEM_MANIFEST)) {
        assets.push({
            path: `${ASSET_BASE}/items/${entry.file}`,
            key,
            type: 'item'
        });
    }

    // VFX
    for (const [key, entry] of Object.entries(VFX_MANIFEST)) {
        assets.push({
            path: `${ASSET_BASE}/vfx/${entry.file}`,
            key,
            type: 'vfx'
        });
    }

    return assets;
}

/**
 * Export manifests for build validation script
 */
export const ASSET_MANIFESTS = {
    materials: MATERIAL_MANIFEST,
    skills: SKILL_MANIFEST,
    items: ITEM_MANIFEST,
    vfx: VFX_MANIFEST,
};

/**
 * Check if running in development mode
 */
export function isDevelopmentMode(): boolean {
    return IS_DEV;
}

/**
 * Check if running in production mode
 */
export function isProductionMode(): boolean {
    return IS_PROD;
}

/**
 * Get list of validation errors (missing assets in production)
 */
export function getAssetValidationErrors(): string[] {
    return [...assetValidationErrors];
}

/**
 * Clear validation errors
 */
export function clearAssetValidationErrors(): void {
    assetValidationErrors.length = 0;
}

// Default export for convenience
export default {
    getMaterialIcon,
    getSkillIcon,
    getItemIcon,
    getVfxSpriteAtlas,
    getAssetInfo,
    getAllRequiredAssets,
    isDevelopmentMode,
    isProductionMode,
    getAssetValidationErrors,
    ASSET_MANIFESTS,
};
