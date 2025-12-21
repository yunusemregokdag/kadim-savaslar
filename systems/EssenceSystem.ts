// ============================================
// T5 ITEM ÖZ (ESSENCE) SİSTEMİ
// Efsanevi itemlar için nadir malzemeler
// ============================================

import { CharacterClass } from '../types';

export type EssenceCategory = 'weapon' | 'armor' | 'accessory';

export interface T5Essence {
    id: string;
    name: string;
    description: string;
    category: EssenceCategory;
    classReq?: CharacterClass[];
    rarity: 'epic' | 'legendary' | 'mythic';
    dropSource: { type: string; sourceName: string; dropChance: number; minPartySize?: number };
    icon: string;
    color: string;
}

// T5 ÖZLER
export const T5_ESSENCES: T5Essence[] = [
    { id: 'essence_warriors_fury', name: 'Savaşçının Öfkesi', description: 'Kadim savaşçıların öfkesi', category: 'weapon', classReq: ['warrior'], rarity: 'legendary', dropSource: { type: 'world_boss', sourceName: 'Kadim Savaş Lordu', dropChance: 5 }, icon: '⚔️', color: '#cc0000' },
    { id: 'essence_frost_giant_heart', name: 'Buz Devinin Kalbi', description: 'Donmuş kalp', category: 'weapon', classReq: ['arctic_knight'], rarity: 'legendary', dropSource: { type: 'dungeon', sourceName: 'Buzul Mağarası', dropChance: 1, minPartySize: 10 }, icon: '💙', color: '#00ccff' },
    { id: 'essence_storm_core', name: 'Fırtına Özü', description: 'Kristalleşmiş fırtına', category: 'weapon', classReq: ['gale_glaive'], rarity: 'legendary', dropSource: { type: 'world_boss', sourceName: 'Fırtına Devası', dropChance: 3 }, icon: '🌪️', color: '#66ccff' },
    { id: 'essence_phoenix_feather', name: 'Anka Tüyü', description: 'Ölümsüz kuşun tüyü', category: 'weapon', classReq: ['archer'], rarity: 'mythic', dropSource: { type: 'event', sourceName: 'Anka Festivali', dropChance: 2 }, icon: '🔥', color: '#ff6600' },
    { id: 'essence_arcane_crystal', name: 'Arkan Kristal', description: 'Saf büyü kristali', category: 'weapon', classReq: ['archmage'], rarity: 'legendary', dropSource: { type: 'dungeon', sourceName: 'Büyücüler Kulesi', dropChance: 2, minPartySize: 8 }, icon: '💎', color: '#9900ff' },
    { id: 'essence_legendary_note', name: 'Efsanevi Nota', description: 'Mükemmel armoni', category: 'weapon', classReq: ['bard'], rarity: 'legendary', dropSource: { type: 'event', sourceName: 'Ritim Turnuvası', dropChance: 100 }, icon: '🎵', color: '#ff66cc' },
    { id: 'essence_divine_light', name: 'İlahi Işık', description: 'Tanrıların kutsaması', category: 'weapon', classReq: ['cleric'], rarity: 'legendary', dropSource: { type: 'quest', sourceName: 'Hacılık', dropChance: 100 }, icon: '✨', color: '#ffffcc' },
    { id: 'essence_dragons_breath', name: 'Ejderha Nefesi', description: 'Kadim ejderha nefesi', category: 'weapon', classReq: ['martial_artist'], rarity: 'mythic', dropSource: { type: 'world_boss', sourceName: 'Tiamat', dropChance: 1 }, icon: '🐉', color: '#ff3300' },
    { id: 'essence_celestial_tear', name: 'Göksel Gözyaşı', description: 'Kutsal damla', category: 'weapon', classReq: ['monk'], rarity: 'legendary', dropSource: { type: 'dungeon', sourceName: 'Göksel Manastır', dropChance: 3, minPartySize: 5 }, icon: '💧', color: '#aaddff' },
    { id: 'essence_void_fragment', name: 'Boşluk Parçası', description: 'Karanlık boyut parçası', category: 'weapon', classReq: ['reaper'], rarity: 'mythic', dropSource: { type: 'dungeon', sourceName: 'Boşluk Kapısı', dropChance: 0.5, minPartySize: 20 }, icon: '🌑', color: '#1a0033' },
    { id: 'essence_titans_scale', name: 'Titan Pulu', description: 'Devasa zırh parçası', category: 'armor', rarity: 'legendary', dropSource: { type: 'world_boss', sourceName: 'Dünya Titanı', dropChance: 3 }, icon: '🛡️', color: '#8b4513' },
    { id: 'essence_phoenix_ash', name: 'Anka Külü', description: 'Yeniden doğuş külü', category: 'armor', rarity: 'mythic', dropSource: { type: 'world_boss', sourceName: 'Anka Kuşu', dropChance: 2 }, icon: '🔥', color: '#ff9900' },
];

// T5 CRAFT TARİFLERİ
export interface T5CraftRecipe {
    id: string;
    resultItemId: string;
    resultItemName: string;
    requiredEssences: { essenceId: string; count: number }[];
    goldCost: number;
    craftingTime: number;
    classReq?: CharacterClass[];
}

export const T5_CRAFT_RECIPES: T5CraftRecipe[] = [
    { id: 't5_warrior', resultItemId: 'weapon_warrior_t5', resultItemName: 'Kadim Savaş Kılıcı', requiredEssences: [{ essenceId: 'essence_warriors_fury', count: 1 }], goldCost: 500000, craftingTime: 60, classReq: ['warrior'] },
    { id: 't5_arctic', resultItemId: 'weapon_arctic_t5', resultItemName: 'Buzul Lordu Kılıcı', requiredEssences: [{ essenceId: 'essence_frost_giant_heart', count: 1 }], goldCost: 500000, craftingTime: 60, classReq: ['arctic_knight'] },
    { id: 't5_bard', resultItemId: 'weapon_bard_t5', resultItemName: 'Efsanevi Arp', requiredEssences: [{ essenceId: 'essence_legendary_note', count: 3 }], goldCost: 400000, craftingTime: 45, classReq: ['bard'] },
    { id: 't5_reaper', resultItemId: 'weapon_reaper_t5', resultItemName: 'Boşluk Tırpanı', requiredEssences: [{ essenceId: 'essence_void_fragment', count: 1 }], goldCost: 750000, craftingTime: 120, classReq: ['reaper'] },
];

// ÖZ YÖNETİCİSİ
export interface PlayerEssenceData {
    ownedEssences: { essenceId: string; count: number }[];
    craftingT5: { recipeId: string; startTime: number; endTime: number } | null;
}

export class EssenceManager {
    private playerData: PlayerEssenceData;

    constructor() {
        const saved = localStorage.getItem('kadim_essence_system');
        this.playerData = saved ? JSON.parse(saved) : { ownedEssences: [], craftingT5: null };
    }

    private save(): void {
        localStorage.setItem('kadim_essence_system', JSON.stringify(this.playerData));
    }

    addEssence(essenceId: string, count: number = 1): void {
        const existing = this.playerData.ownedEssences.find(e => e.essenceId === essenceId);
        if (existing) existing.count += count;
        else this.playerData.ownedEssences.push({ essenceId, count });
        this.save();
    }

    rollForEssence(sourceType: string, sourceName: string): T5Essence | null {
        for (const essence of T5_ESSENCES.filter(e => e.dropSource.type === sourceType && e.dropSource.sourceName === sourceName)) {
            if (Math.random() * 100 <= essence.dropSource.dropChance) {
                this.addEssence(essence.id);
                return essence;
            }
        }
        return null;
    }

    startT5Craft(recipeId: string): { success: boolean; message: string } {
        if (this.playerData.craftingT5) return { success: false, message: 'Zaten craft yapılıyor' };
        const recipe = T5_CRAFT_RECIPES.find(r => r.id === recipeId);
        if (!recipe) return { success: false, message: 'Geçersiz tarif' };

        for (const req of recipe.requiredEssences) {
            const owned = this.playerData.ownedEssences.find(e => e.essenceId === req.essenceId);
            if (!owned || owned.count < req.count) return { success: false, message: 'Yetersiz öz' };
        }

        for (const req of recipe.requiredEssences) {
            this.playerData.ownedEssences.find(e => e.essenceId === req.essenceId)!.count -= req.count;
        }

        this.playerData.craftingT5 = { recipeId, startTime: Date.now(), endTime: Date.now() + recipe.craftingTime * 60000 };
        this.save();
        return { success: true, message: `T5 craft başladı! ${recipe.craftingTime} dk` };
    }

    checkT5CraftComplete(): { completed: boolean; itemId?: string; itemName?: string } {
        if (!this.playerData.craftingT5 || Date.now() < this.playerData.craftingT5.endTime) return { completed: false };
        const recipe = T5_CRAFT_RECIPES.find(r => r.id === this.playerData.craftingT5!.recipeId);
        this.playerData.craftingT5 = null;
        this.save();
        return { completed: true, itemId: recipe?.resultItemId, itemName: recipe?.resultItemName };
    }

    getOwnedEssences(): { essence: T5Essence; count: number }[] {
        return this.playerData.ownedEssences.map(o => ({ essence: T5_ESSENCES.find(e => e.id === o.essenceId)!, count: o.count })).filter(e => e.essence && e.count > 0);
    }

    getAvailableRecipes(playerClass: CharacterClass): T5CraftRecipe[] {
        return T5_CRAFT_RECIPES.filter(r => !r.classReq || r.classReq.includes(playerClass));
    }
}

export const essenceManager = new EssenceManager();
