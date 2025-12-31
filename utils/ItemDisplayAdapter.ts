
import { Item, WingItem, PetItem, ItemStats } from '../types';

export interface DisplayItemData {
    name: string;
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'ancient';
    tier: number;
    tierLabel: string;
    type: string;
    plus: number;
    description: string;
    statsLines: { label: string; value: string; isBonus?: boolean }[];
    buffsLines: string[];
    durabilityLine?: string;
    visuals?: any;
    image?: string;
    icon?: string;
    value?: number;
    isCosmetic: boolean;
}

export const getItemDisplayData = (item: Item | WingItem | PetItem): DisplayItemData => {
    const isItem = (i: any): i is Item => 'rarity' in i; // Basic guard

    // Defaults - Strip any existing +X suffix to prevent duplication
    let rawName = item.name || 'Unknown';
    // Remove existing enhancement suffix like " +12", "+5" etc. at the end
    let name = rawName.replace(/\s*\+\d+\s*$/g, '').trim();
    let rarity: any = 'common';
    let tier = item.tier || 1;
    let type = 'unknown';
    let plus = 0;
    let description = '';
    let stats: ItemStats = {};
    let buffs: string[] = [];
    let isCosmetic = false;

    if (isItem(item)) {
        // Standard Item
        rarity = item.rarity;
        type = item.type;
        plus = item.plus || 0;
        description = item.description || item.desc || '';
        stats = item.stats || {};

        // Map Stats
        // Durability
        if (item.durability !== undefined && item.maxDurability) {
            // Handled in return
        }

        // Effects
        if (item.effect) {
            if (item.effect.type === 'heal') buffs.push(`Can Yenileme: ${item.effect.amount || item.effect.hpAmount}`);
            if (item.effect.type === 'mana') buffs.push(`Mana Yenileme: ${item.effect.amount || item.effect.manaAmount}`);
            if (item.effect.type === 'combo') buffs.push(`HP: ${item.effect.hpAmount} | MP: ${item.effect.manaAmount}`);
            if (item.effect.type === 'buff') buffs.push(`${item.effect.buffType?.toUpperCase()} Artışı`);
        }
    } else {
        // Wing or Pet (Partial duck typing or known structure)
        if ('bonusDamage' in item) { // Wing
            type = 'wing';
            rarity = 'epic'; // Default or calculate
            isCosmetic = true;
            // Wing stats
            stats = {
                damage: (item as WingItem).bonusDamage,
                hp: (item as WingItem).bonusHp,
                defense: (item as WingItem).bonusDefense
            };
        } else if ('bonusExpRate' in item) { // Pet
            type = 'pet';
            rarity = 'rare';
            isCosmetic = true;
            // Pet stats
            stats = {
                defense: (item as PetItem).bonusDefense,
                damage: (item as PetItem).bonusDamage,
                hp: (item as PetItem).bonusHp
            };
            buffs.push(`Exp Oranı: +%${(item as PetItem).bonusExpRate}`);
        }
    }

    // Format Stats Lines
    const statsLines: { label: string; value: string; isBonus?: boolean }[] = [];

    if (stats.damage) statsLines.push({ label: 'Hasar', value: stats.damage.toString() });
    if (stats.defense) statsLines.push({ label: 'Zırh', value: stats.defense.toString() });
    if (stats.hp) statsLines.push({ label: 'Can', value: `+${stats.hp}` });
    if (stats.mana) statsLines.push({ label: 'Mana', value: `+${stats.mana}` });
    if (stats.strength) statsLines.push({ label: 'Güç', value: `+${stats.strength}` });
    if (stats.dexterity) statsLines.push({ label: 'Çeviklik', value: `+${stats.dexterity}` });
    if (stats.intelligence) statsLines.push({ label: 'Zeka', value: `+${stats.intelligence}` });
    if (stats.vitality) statsLines.push({ label: 'Dayanıklılık', value: `+${stats.vitality}` });
    if (stats.critChance) statsLines.push({ label: 'Kritik Şansı', value: `%${stats.critChance}` });
    if (stats.critDamage) statsLines.push({ label: 'Kritik Hasar', value: `%${stats.critDamage}` });
    if (stats.attackSpeed) statsLines.push({ label: 'Saldırı Hızı', value: `%${stats.attackSpeed}` });

    // Elemental & Special
    if (stats.fireDamage) statsLines.push({ label: 'Ateş Hasarı', value: `+${stats.fireDamage}`, isBonus: true });
    if (stats.iceDamage) statsLines.push({ label: 'Buz Hasarı', value: `+${stats.iceDamage}`, isBonus: true });
    if (stats.lifesteal) statsLines.push({ label: 'Can Çalma', value: `%${stats.lifesteal}`, isBonus: true });

    // Determine Tier Label
    const tierLabel = `T${tier}`;

    return {
        name,
        rarity,
        tier,
        tierLabel,
        type,
        plus,
        description,
        statsLines,
        buffsLines: buffs,
        durabilityLine: (isItem(item) && item.durability !== undefined && item.maxDurability) ? `${item.durability}/${item.maxDurability}` : undefined,
        visuals: (item as any).visuals,
        image: (item as any).image,
        icon: (item as any).icon,
        value: (item as any).value,
        isCosmetic
    };
};
