/**
 * craftingSystem.ts
 * T4/T5 Crafting Logic (Craft Only - No Drops)
 */

import { v4 as uuidv4 } from 'uuid';
import { CRAFTING_RECIPES, CRAFTING_MATERIALS, CraftingRecipe } from '../constants';
import { Item, PlayerState } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface CraftValidation {
    valid: boolean;
    error?: string;
    missingItems?: string[];
    missingMaterials?: { id: string; have: number; need: number }[];
    missingGold?: number;
    missingDiamond?: number;
}

export interface CraftResult {
    success: boolean;
    error?: string;
    craftedItem?: Item;
    consumedItemIds: string[];
    consumedMaterials: { id: string; count: number }[];
    goldCost: number;
    diamondCost: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function countMaterial(inventory: Item[], materialId: string): number {
    return inventory.filter(i => i.id.startsWith(materialId) || i.id === materialId).length;
}

function findItemsOfTierAndSlot(inventory: Item[], tier: number, slot: string): Item[] {
    return inventory.filter(i => i.tier === tier && i.type === slot);
}

// ─────────────────────────────────────────────────────────────────────────────
// VALIDATE CRAFT
// ─────────────────────────────────────────────────────────────────────────────

export function validateCraft(
    recipeId: string,
    inventory: Item[],
    gold: number,
    diamonds: number
): CraftValidation {
    const recipe = CRAFTING_RECIPES.find(r => r.id === recipeId);
    if (!recipe) {
        return { valid: false, error: 'Tarif bulunamadı.' };
    }

    const errors: string[] = [];
    const missingMaterials: { id: string; have: number; need: number }[] = [];

    // Check slot items (T3 for T4 craft, T4 for T5 craft)
    const slotItems = findItemsOfTierAndSlot(
        inventory,
        recipe.requirements.itemTier,
        recipe.requirements.itemSlot
    );
    if (slotItems.length < recipe.requirements.itemCount) {
        errors.push(`${recipe.requirements.itemCount}x T${recipe.requirements.itemTier} ${recipe.requirements.itemSlot} gerekli (${slotItems.length} mevcut)`);
    }

    // Check Boss Essence
    const bossEssenceCount = countMaterial(inventory, CRAFTING_MATERIALS.BOSS_ESSENCE);
    if (bossEssenceCount < recipe.requirements.bossEssence) {
        missingMaterials.push({
            id: CRAFTING_MATERIALS.BOSS_ESSENCE,
            have: bossEssenceCount,
            need: recipe.requirements.bossEssence,
        });
    }

    // Check Void Shard (T5 only)
    if (recipe.requirements.voidShard > 0) {
        const voidShardCount = countMaterial(inventory, CRAFTING_MATERIALS.VOID_SHARD);
        if (voidShardCount < recipe.requirements.voidShard) {
            missingMaterials.push({
                id: CRAFTING_MATERIALS.VOID_SHARD,
                have: voidShardCount,
                need: recipe.requirements.voidShard,
            });
        }
    }

    // Check Gold
    let missingGold: number | undefined;
    if (gold < recipe.cost.gold) {
        missingGold = recipe.cost.gold - gold;
    }

    // Check Diamonds
    let missingDiamond: number | undefined;
    if (diamonds < recipe.cost.diamond) {
        missingDiamond = recipe.cost.diamond - diamonds;
    }

    const valid = errors.length === 0 && missingMaterials.length === 0 && !missingGold && !missingDiamond;

    return {
        valid,
        error: valid ? undefined : 'Yeterli malzeme yok.',
        missingItems: errors.length > 0 ? errors : undefined,
        missingMaterials: missingMaterials.length > 0 ? missingMaterials : undefined,
        missingGold,
        missingDiamond,
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// PERFORM CRAFT
// ─────────────────────────────────────────────────────────────────────────────

export function craftItem(
    recipeId: string,
    inventory: Item[],
    gold: number,
    diamonds: number
): CraftResult {
    // Validate first
    const validation = validateCraft(recipeId, inventory, gold, diamonds);
    if (!validation.valid) {
        return {
            success: false,
            error: validation.error,
            consumedItemIds: [],
            consumedMaterials: [],
            goldCost: 0,
            diamondCost: 0,
        };
    }

    const recipe = CRAFTING_RECIPES.find(r => r.id === recipeId)!;
    const consumedItemIds: string[] = [];
    const consumedMaterials: { id: string; count: number }[] = [];

    // Select items to consume
    const slotItems = findItemsOfTierAndSlot(
        inventory,
        recipe.requirements.itemTier,
        recipe.requirements.itemSlot
    );
    for (let i = 0; i < recipe.requirements.itemCount; i++) {
        consumedItemIds.push(slotItems[i].id);
    }

    // Select Boss Essence to consume
    if (recipe.requirements.bossEssence > 0) {
        const essences = inventory.filter(i =>
            i.id.startsWith(CRAFTING_MATERIALS.BOSS_ESSENCE) || i.id === CRAFTING_MATERIALS.BOSS_ESSENCE
        );
        for (let i = 0; i < recipe.requirements.bossEssence; i++) {
            consumedItemIds.push(essences[i].id);
        }
        consumedMaterials.push({ id: CRAFTING_MATERIALS.BOSS_ESSENCE, count: recipe.requirements.bossEssence });
    }

    // Select Void Shard to consume (T5 only)
    if (recipe.requirements.voidShard > 0) {
        const shards = inventory.filter(i =>
            i.id.startsWith(CRAFTING_MATERIALS.VOID_SHARD) || i.id === CRAFTING_MATERIALS.VOID_SHARD
        );
        for (let i = 0; i < recipe.requirements.voidShard; i++) {
            consumedItemIds.push(shards[i].id);
        }
        consumedMaterials.push({ id: CRAFTING_MATERIALS.VOID_SHARD, count: recipe.requirements.voidShard });
    }

    // Create crafted item
    const craftedItem: Item = {
        id: uuidv4(),
        name: recipe.name,
        type: recipe.resultSlot,
        tier: recipe.resultTier,
        rarity: recipe.resultTier === 5 ? 'legendary' : 'epic',
        stats: { ...recipe.resultBaseStats },
        value: recipe.resultTier * 1000,
        plus: 0,
    };

    return {
        success: true,
        craftedItem,
        consumedItemIds,
        consumedMaterials,
        goldCost: recipe.cost.gold,
        diamondCost: recipe.cost.diamond,
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// GET RECIPE INFO (for UI)
// ─────────────────────────────────────────────────────────────────────────────

export function getRecipeById(recipeId: string): CraftingRecipe | undefined {
    return CRAFTING_RECIPES.find(r => r.id === recipeId);
}

export function getAllRecipes(): CraftingRecipe[] {
    return CRAFTING_RECIPES;
}

export function getRecipesByTier(tier: 4 | 5): CraftingRecipe[] {
    return CRAFTING_RECIPES.filter(r => r.resultTier === tier);
}
