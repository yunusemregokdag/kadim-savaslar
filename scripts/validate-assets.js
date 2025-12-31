/**
 * Asset Build Validation Script - Validates all required assets exist before production build
 * 
 * Run: node scripts/validate-assets.js
 * 
 * This script MUST pass before `npm run build` succeeds in production.
 * Missing assets = BUILD FAILURE
 * Placeholder assets in PRODUCTION = BUILD FAILURE
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const ASSETS_DIR = path.join(PUBLIC_DIR, 'assets');

// =============================================================================
// PLACEHOLDER DETECTION
// =============================================================================

// Known placeholder PNG file size (our minimal 1x1 transparent PNG is 69 bytes)
const PLACEHOLDER_SIZE_THRESHOLD = 100; // bytes

// Placeholder signature bytes (first 8 bytes of our generated PNG)
const PLACEHOLDER_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

// Placeholder filename prefix - used to detect dev placeholders in production
const PLACEHOLDER_PREFIX = '_PH_';

/**
 * Check if a file is a placeholder (generated minimal PNG)
 * Detection methods:
 * 1. Filename starts with _PH_ prefix
 * 2. File size < 100 bytes (our placeholder is 69 bytes, real icons should be larger)
 * 3. File is exactly our known placeholder size
 */
function isPlaceholderFile(filePath) {
    try {
        const filename = path.basename(filePath);

        // Check for _PH_ prefix in filename
        if (filename.startsWith(PLACEHOLDER_PREFIX)) {
            return true;
        }

        const stats = fs.statSync(filePath);

        // Our generated placeholder is exactly 69 bytes
        if (stats.size === 69) {
            return true;
        }

        // Any PNG under 100 bytes is suspicious
        if (stats.size < PLACEHOLDER_SIZE_THRESHOLD) {
            return true;
        }

        // Read first few bytes to check if it's our specific placeholder
        const fd = fs.openSync(filePath, 'r');
        const buffer = Buffer.alloc(8);
        fs.readSync(fd, buffer, 0, 8, 0);
        fs.closeSync(fd);

        // Verify it's a PNG
        if (!buffer.equals(PLACEHOLDER_SIGNATURE)) {
            // Not a valid PNG - could be a placeholder text file
            return true;
        }

        return false;
    } catch {
        return true; // If we can't read it, treat as placeholder
    }
}

// =============================================================================
// COLOR CODES
// =============================================================================

const COLORS = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    bold: '\x1b[1m',
};

function log(color, message) {
    console.log(`${color}${message}${COLORS.reset}`);
}

function logError(message) {
    log(COLORS.red, `❌ ${message}`);
}

function logSuccess(message) {
    log(COLORS.green, `✅ ${message}`);
}

function logWarning(message) {
    log(COLORS.yellow, `⚠️  ${message}`);
}

function logInfo(message) {
    log(COLORS.cyan, `ℹ️  ${message}`);
}

// =============================================================================
// ASSET MANIFEST
// =============================================================================

const ASSET_MANIFESTS = {
    materials: {
        iron_ore: 'iron_ore.png',
        copper_ore: 'copper_ore.png',
        gold_ore: 'gold_ore.png',
        diamond_ore: 'diamond_ore.png',
        wood_log: 'wood_log.png',
        stone: 'stone.png',
        leather_scrap: 'leather_scrap.png',
        herb_green: 'herb_green.png',
        cloth: 'cloth.png',
        bone: 'bone.png',
        dragon_scale: 'dragon_scale.png',
        phoenix_feather: 'phoenix_feather.png',
        titan_essence: 'titan_essence.png',
        void_crystal: 'void_crystal.png',
        ancient_rune: 'ancient_rune.png',
        soul_shard: 'soul_shard.png',
        magic_dust: 'magic_dust.png',
        enchant_scroll: 'enchant_scroll.png',
        upgrade_stone: 'upgrade_stone.png',
        protection_scroll: 'protection_scroll.png',
    },
    skills: {
        'warrior/sword_strike': 'warrior/sword_strike.png',
        'warrior/shield_wall': 'warrior/shield_wall.png',
        'warrior/rage_burst': 'warrior/rage_burst.png',
        'warrior/ground_slam': 'warrior/ground_slam.png',
        'warrior/spear_throw': 'warrior/spear_throw.png',
        'warrior/war_cry': 'warrior/war_cry.png',
        'warrior/whirlwind': 'warrior/whirlwind.png',
        'mage/fireball': 'mage/fireball.png',
        'mage/ice_shield': 'mage/ice_shield.png',
        'mage/teleport': 'mage/teleport.png',
        'mage/lightning_chain': 'mage/lightning_chain.png',
        'mage/meteor': 'mage/meteor.png',
        'mage/mana_drain': 'mage/mana_drain.png',
        'mage/cosmic_destruction': 'mage/cosmic_destruction.png',
        'shaman/spirit_bolt': 'shaman/spirit_bolt.png',
        'shaman/heal_light': 'shaman/heal_light.png',
        'shaman/speed_totem': 'shaman/speed_totem.png',
        'shaman/poison_vine': 'shaman/poison_vine.png',
        'shaman/earth_shield': 'shaman/earth_shield.png',
        'shaman/cleanse': 'shaman/cleanse.png',
        'shaman/ancestor_wrath': 'shaman/ancestor_wrath.png',
        'archer/arrow_shot': 'archer/arrow_shot.png',
        'archer/evasion': 'archer/evasion.png',
        'archer/multishot': 'archer/multishot.png',
        'archer/poison_arrow': 'archer/poison_arrow.png',
        'archer/trap': 'archer/trap.png',
        'archer/eagle_eye': 'archer/eagle_eye.png',
        'archer/arrow_rain': 'archer/arrow_rain.png',
        'common/sword': 'common/sword.png',
        'common/shield': 'common/shield.png',
        'common/zap': 'common/zap.png',
        'common/flame': 'common/flame.png',
        'common/heart': 'common/heart.png',
        'common/snowflake': 'common/snowflake.png',
        'common/wind': 'common/wind.png',
        'common/orbit': 'common/orbit.png',
        'common/droplet': 'common/droplet.png',
        'common/sun': 'common/sun.png',
        'common/sparkles': 'common/sparkles.png',
        'common/feather': 'common/feather.png',
        'common/trees': 'common/trees.png',
        'common/ghost': 'common/ghost.png',
        'common/move_down': 'common/move_down.png',
        'common/arrow_up': 'common/arrow_up.png',
        'common/mic': 'common/mic.png',
        'common/rotate': 'common/rotate.png',
        'common/target': 'common/target.png',
        'common/crosshair': 'common/crosshair.png',
    },
    items: {
        'weapons/sword': 'weapons/sword.png',
        'weapons/axe': 'weapons/axe.png',
        'weapons/staff': 'weapons/staff.png',
        'weapons/bow': 'weapons/bow.png',
        'weapons/dagger': 'weapons/dagger.png',
        'weapons/mace': 'weapons/mace.png',
        'weapons/spear': 'weapons/spear.png',
        'armor/helmet': 'armor/helmet.png',
        'armor/chest': 'armor/chest.png',
        'armor/gloves': 'armor/gloves.png',
        'armor/boots': 'armor/boots.png',
        'armor/shield': 'armor/shield.png',
        'accessories/ring': 'accessories/ring.png',
        'accessories/necklace': 'accessories/necklace.png',
        'accessories/earring': 'accessories/earring.png',
        'consumables/hp_potion': 'consumables/hp_potion.png',
        'consumables/mp_potion': 'consumables/mp_potion.png',
        'consumables/buff_potion': 'consumables/buff_potion.png',
        'cosmetics/pet': 'cosmetics/pet.png',
        'cosmetics/wing': 'cosmetics/wing.png',
        'cosmetics/costume': 'cosmetics/costume.png',
    },
    vfx: {
        fire_particles: 'fire_particles.png',
        ice_particles: 'ice_particles.png',
        lightning_particles: 'lightning_particles.png',
        heal_particles: 'heal_particles.png',
        poison_particles: 'poison_particles.png',
        physical_particles: 'physical_particles.png',
        dark_particles: 'dark_particles.png',
        holy_particles: 'holy_particles.png',
    },
    mounts: {
        horse_brown: 'horse_brown.png',
        donkey: 'donkey.png',
        camel: 'camel.png',
        horse_white: 'horse_white.png',
        elephant: 'elephant.png',
        wolf: 'wolf.png',
        tiger: 'tiger.png',
        lion: 'lion.png',
        bear: 'bear.png',
        dragon_small: 'dragon_small.png',
        phoenix: 'phoenix.png',
        griffin: 'griffin.png',
        dragon_ancient: 'dragon_ancient.png',
        unicorn_divine: 'unicorn_divine.png',
        nightmare: 'nightmare.png',
    },
    ui: {
        tier_bronze: 'tier_bronze.png',
        tier_silver: 'tier_silver.png',
        tier_gold: 'tier_gold.png',
        tier_diamond: 'tier_diamond.png',
        tier_t4: 'tier_t4.png',
        tier_t5: 'tier_t5.png',
        boss_essence: 'boss_essence.png',
        void_shard: 'void_shard.png',
        gold_coin: 'gold_coin.png',
        diamond_gem: 'diamond_gem.png',
        puzzle_piece: 'puzzle_piece.png',
        blocked: 'blocked.png',
        crafting: 'crafting.png',
        hammer: 'hammer.png',
        locked: 'locked.png',
        success: 'success.png',
        failed: 'failed.png',
        fire: 'fire.png',
        // Zone features
        shop: 'shop.png',
        blacksmith: 'blacksmith.png',
        healer: 'healer.png',
        arena: 'arena.png',
        castle: 'castle.png',
        safe_zone: 'safe_zone.png',
        danger_zone: 'danger_zone.png',
        boss_zone: 'boss_zone.png',
        map_marker: 'map_marker.png',
    },
};

const REQUIRED_FOLDERS = [
    'assets/materials',
    'assets/skills',
    'assets/skills/warrior',
    'assets/skills/mage',
    'assets/skills/shaman',
    'assets/skills/archer',
    'assets/skills/common',
    'assets/items',
    'assets/items/weapons',
    'assets/items/armor',
    'assets/items/accessories',
    'assets/items/consumables',
    'assets/items/cosmetics',
    'assets/vfx',
    'assets/mounts',
    'assets/ui',
];

// =============================================================================
// VALIDATION STATE
// =============================================================================

let totalAssets = 0;
let missingAssets = [];
let placeholderAssets = [];
let validAssets = [];
let missingFolders = [];

function checkFolder(folderPath, shouldFix = false) {
    const fullPath = path.join(PUBLIC_DIR, folderPath);
    if (!fs.existsSync(fullPath)) {
        missingFolders.push(folderPath);
        if (shouldFix) {
            fs.mkdirSync(fullPath, { recursive: true });
            logSuccess(`Created folder: ${folderPath}`);
        }
        return false;
    }
    return true;
}

function checkAsset(category, key, filename, isProduction) {
    totalAssets++;
    const assetPath = path.join(ASSETS_DIR, category, filename);
    const relativePath = path.relative(PUBLIC_DIR, assetPath);

    if (!fs.existsSync(assetPath)) {
        missingAssets.push({
            category,
            key,
            filename,
            path: relativePath,
            status: 'missing',
        });
        return false;
    }

    // Check if it's a placeholder
    if (isPlaceholderFile(assetPath)) {
        const stats = fs.statSync(assetPath);
        placeholderAssets.push({
            category,
            key,
            filename,
            path: relativePath,
            size: stats.size,
            status: 'placeholder',
        });
        return false;
    }

    const stats = fs.statSync(assetPath);
    validAssets.push({
        category,
        key,
        filename,
        path: relativePath,
        size: stats.size,
        status: 'valid',
    });
    return true;
}

/**
 * Create a placeholder PNG file with _PH_ prefix
 * The prefix makes it easy to detect placeholders in production
 */
function createPlaceholderPng(filePath) {
    const minimalPng = Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
        0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
        0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
        0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89,
        0x00, 0x00, 0x00, 0x0d, 0x49, 0x44, 0x41, 0x54,
        0x08, 0xd7, 0x63, 0x60, 0x60, 0x60, 0x60, 0x00,
        0x00, 0x00, 0x05, 0x00, 0x01, 0x87, 0xa0, 0x3c,
        0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44,
        0xae, 0x42, 0x60, 0x82,
    ]);

    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    // Add _PH_ prefix to filename for easy detection
    const filename = path.basename(filePath);
    const placeholderFilename = filename.startsWith(PLACEHOLDER_PREFIX)
        ? filename
        : PLACEHOLDER_PREFIX + filename;
    const placeholderPath = path.join(dir, placeholderFilename);

    fs.writeFileSync(placeholderPath, minimalPng);
    return placeholderPath;
}

// =============================================================================
// MAIN VALIDATION
// =============================================================================

function validate(options = {}) {
    const shouldFix = options.fix || false;
    const isProduction = options.production || process.env.NODE_ENV === 'production';

    // CRITICAL: In production mode, --fix is DISABLED
    if (isProduction && shouldFix) {
        console.log('');
        log(COLORS.bold + COLORS.red, '╔════════════════════════════════════════════════════════════════╗');
        log(COLORS.bold + COLORS.red, '║  ❌ ERROR: --fix is DISABLED in PRODUCTION mode!               ║');
        log(COLORS.bold + COLORS.red, '║                                                                ║');
        log(COLORS.bold + COLORS.red, '║  Placeholder assets are NOT allowed for release.              ║');
        log(COLORS.bold + COLORS.red, '║  Please add real PNG assets manually.                         ║');
        log(COLORS.bold + COLORS.red, '╚════════════════════════════════════════════════════════════════╝');
        console.log('');
        process.exit(1);
    }

    console.log('');
    log(COLORS.bold + COLORS.cyan, '╔══════════════════════════════════════════════════════════════╗');
    log(COLORS.bold + COLORS.cyan, '║          KADIM SAVAŞLAR - ASSET BUILD VALIDATION             ║');
    log(COLORS.bold + COLORS.cyan, '╚══════════════════════════════════════════════════════════════╝');
    console.log('');

    logInfo(`Mode: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);
    logInfo(`Fix Mode: ${shouldFix ? 'ENABLED (DEV ONLY)' : 'DISABLED'}`);
    logInfo(`Assets Directory: ${ASSETS_DIR}`);
    console.log('');

    // Check folders
    log(COLORS.magenta, '📁 Checking folder structure...');
    for (const folder of REQUIRED_FOLDERS) {
        checkFolder(folder, shouldFix);
    }

    if (missingFolders.length > 0 && !shouldFix) {
        logWarning(`Missing folders: ${missingFolders.length}`);
        missingFolders.forEach((f) => logError(`  - ${f}`));
        console.log('');
    }

    // Check assets from manifest
    for (const [category, assets] of Object.entries(ASSET_MANIFESTS)) {
        log(COLORS.magenta, `📦 Checking ${category} assets...`);
        for (const [key, filename] of Object.entries(assets)) {
            checkAsset(category, key, filename, isProduction);
        }
    }

    // PRODUCTION ONLY: Scan for _PH_ prefixed files in assets directory
    if (isProduction) {
        log(COLORS.magenta, '🔍 Scanning for _PH_ placeholder files...');
        const scanForPlaceholders = (dir) => {
            if (!fs.existsSync(dir)) return;
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                    scanForPlaceholders(fullPath);
                } else if (entry.name.startsWith(PLACEHOLDER_PREFIX)) {
                    const relativePath = path.relative(PUBLIC_DIR, fullPath);
                    placeholderAssets.push({
                        category: 'scan',
                        key: entry.name,
                        filename: entry.name,
                        path: relativePath,
                        size: fs.statSync(fullPath).size,
                        status: 'placeholder',
                        detectedBy: '_PH_ prefix',
                    });
                }
            }
        };
        scanForPlaceholders(ASSETS_DIR);
    }

    // Summary
    console.log('');
    log(COLORS.bold, '═══════════════════════════════════════════════════════════════');
    log(COLORS.bold, '                      VALIDATION SUMMARY                        ');
    log(COLORS.bold, '═══════════════════════════════════════════════════════════════');
    console.log('');

    logInfo(`Total assets checked: ${totalAssets}`);
    logSuccess(`Valid assets: ${validAssets.length}`);

    if (placeholderAssets.length > 0) {
        logWarning(`Placeholder assets: ${placeholderAssets.length}`);
    }

    if (missingAssets.length > 0) {
        logError(`Missing assets: ${missingAssets.length}`);
    }

    // Detail: Placeholders
    if (placeholderAssets.length > 0) {
        console.log('');
        log(COLORS.yellow, '⚠️  Placeholder Assets Detected:');
        const groupedPlaceholders = {};
        for (const asset of placeholderAssets) {
            if (!groupedPlaceholders[asset.category]) {
                groupedPlaceholders[asset.category] = [];
            }
            groupedPlaceholders[asset.category].push(asset);
        }
        for (const [category, assets] of Object.entries(groupedPlaceholders)) {
            console.log('');
            log(COLORS.yellow, `  [${category.toUpperCase()}]`);
            assets.forEach((a) => {
                console.log(`    - ${a.key}: ${a.path} (${a.size} bytes)`);
            });
        }
    }

    // Detail: Missing
    if (missingAssets.length > 0) {
        console.log('');
        log(COLORS.red, '❌ Missing Assets:');
        const groupedMissing = {};
        for (const asset of missingAssets) {
            if (!groupedMissing[asset.category]) {
                groupedMissing[asset.category] = [];
            }
            groupedMissing[asset.category].push(asset);
        }
        for (const [category, assets] of Object.entries(groupedMissing)) {
            console.log('');
            log(COLORS.red, `  [${category.toUpperCase()}]`);
            assets.forEach((a) => {
                console.log(`    - ${a.key}: ${a.path}`);
            });
        }

        // Create placeholders in DEV mode
        if (shouldFix && !isProduction) {
            console.log('');
            log(COLORS.cyan, '🔧 Creating placeholder assets (DEV ONLY)...');
            for (const asset of missingAssets) {
                const assetPath = path.join(ASSETS_DIR, asset.category, asset.filename);
                createPlaceholderPng(assetPath);
                logSuccess(`Created placeholder: ${asset.path}`);
            }
        }
    }

    console.log('');

    // Final verdict
    const hasMissing = missingAssets.length > 0;
    const hasPlaceholders = placeholderAssets.length > 0;
    const hasIssues = hasMissing || hasPlaceholders;

    if (isProduction) {
        if (hasIssues) {
            log(COLORS.bold + COLORS.red, '╔════════════════════════════════════════════════════════════════╗');
            log(COLORS.bold + COLORS.red, '║  ❌ PRODUCTION BUILD FAILED!                                   ║');
            log(COLORS.bold + COLORS.red, '║                                                                ║');
            if (hasMissing) {
                log(COLORS.bold + COLORS.red, '║  • Missing assets must be added before release.               ║');
            }
            if (hasPlaceholders) {
                log(COLORS.bold + COLORS.red, '║  • Placeholder assets detected! Replace with real PNGs.       ║');
            }
            log(COLORS.bold + COLORS.red, '║                                                                ║');
            log(COLORS.bold + COLORS.red, '║  All icons must be real PNG files (>100 bytes) with alpha.    ║');
            log(COLORS.bold + COLORS.red, '╚════════════════════════════════════════════════════════════════╝');
            console.log('');
            process.exit(1);
        } else {
            log(COLORS.bold + COLORS.green, '╔════════════════════════════════════════════════════════════════╗');
            log(COLORS.bold + COLORS.green, '║  ✅ PRODUCTION BUILD READY!                                    ║');
            log(COLORS.bold + COLORS.green, '║                                                                ║');
            log(COLORS.bold + COLORS.green, '║  All assets are valid PNG files. No placeholders detected.    ║');
            log(COLORS.bold + COLORS.green, '╚════════════════════════════════════════════════════════════════╝');
            console.log('');
        }
    } else {
        if (hasIssues) {
            log(COLORS.yellow, '⚠️  Development mode: Issues detected but build will proceed.');
            log(COLORS.yellow, '   Emoji fallbacks will be used for missing/placeholder assets.');
            if (!shouldFix && hasMissing) {
                log(COLORS.yellow, '   Run with --fix to create placeholder PNG files.');
            }
        } else {
            log(COLORS.bold + COLORS.green, '╔════════════════════════════════════════════════════════════════╗');
            log(COLORS.bold + COLORS.green, '║  ✅ ALL ASSETS VALIDATED SUCCESSFULLY!                         ║');
            log(COLORS.bold + COLORS.green, '╚════════════════════════════════════════════════════════════════╝');
        }
        console.log('');
    }

    return {
        total: totalAssets,
        valid: validAssets.length,
        placeholders: placeholderAssets.length,
        missing: missingAssets.length,
        success: !hasIssues,
        isProduction,
    };
}

// =============================================================================
// CLI
// =============================================================================

const args = process.argv.slice(2);
const options = {
    fix: args.includes('--fix'),
    production: args.includes('--production') || args.includes('--prod'),
    help: args.includes('--help') || args.includes('-h'),
};

if (options.help) {
    console.log('');
    console.log('Asset Build Validation Script - Kadim Savaşlar');
    console.log('');
    console.log('Usage: node scripts/validate-assets.js [options]');
    console.log('');
    console.log('Options:');
    console.log('  --fix         Create placeholder PNG files for missing assets (DEV ONLY)');
    console.log('  --production  Run in production mode (fails on missing OR placeholder assets)');
    console.log('  --help, -h    Show this help message');
    console.log('');
    console.log('Production Requirements:');
    console.log('  • All assets must exist as real PNG files');
    console.log('  • No placeholder files allowed (min 100 bytes per file)');
    console.log('  • --fix flag is DISABLED in production mode');
    console.log('');
    process.exit(0);
}

validate(options);
