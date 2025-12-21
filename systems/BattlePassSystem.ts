// ============================================
// BATTLE PASS SİSTEMİ
// Sezonluk görevler ve ödüller (P2W olmayan)
// ============================================

import { Item, WingItem, PetItem } from '../types';

// Battle Pass Seviyesi
export interface BattlePassLevel {
    level: number;
    requiredXp: number;
    freeReward: BattlePassReward;
    premiumReward: BattlePassReward;
}

// Ödül Tipi
export interface BattlePassReward {
    type: 'gold' | 'gems' | 'item' | 'cosmetic' | 'title' | 'emote' | 'wing' | 'pet' | 'material';
    amount?: number;
    itemId?: string;
    cosmeticId?: string;
    title?: string;
    emote?: string;
    icon: string;
    name: string;
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

// Sezonluk Görev
export interface BattlePassMission {
    id: string;
    name: string;
    description: string;
    type: 'daily' | 'weekly' | 'seasonal';
    category: 'combat' | 'collect' | 'craft' | 'social' | 'explore';
    target: number;
    current: number;
    xpReward: number;
    isCompleted: boolean;
    icon: string;
}

// Oyuncu Battle Pass Durumu
export interface PlayerBattlePass {
    seasonId: string;
    currentLevel: number;
    currentXp: number;
    isPremium: boolean;
    claimedFreeRewards: number[];
    claimedPremiumRewards: number[];
    missions: BattlePassMission[];
    lastMissionRefresh: number;
}

// Sezon Tanımı
export interface BattlePassSeason {
    id: string;
    name: string;
    theme: string;
    startDate: number;
    endDate: number;
    maxLevel: number;
    levels: BattlePassLevel[];
    premiumPrice: number; // Gems
}

// ============================================
// SEZON 1: KADIM KAHRAMANLAR
// ============================================
export const SEASON_1_LEVELS: BattlePassLevel[] = Array.from({ length: 50 }, (_, i) => {
    const level = i + 1;
    const baseXp = 1000;
    const xpMultiplier = 1.1;

    return {
        level,
        requiredXp: Math.floor(baseXp * Math.pow(xpMultiplier, level - 1)),
        freeReward: generateFreeReward(level),
        premiumReward: generatePremiumReward(level)
    };
});

function generateFreeReward(level: number): BattlePassReward {
    // Her 5 seviyede özel ödül
    if (level % 10 === 0) {
        return {
            type: 'material',
            itemId: `bp_material_t${Math.ceil(level / 10)}`,
            icon: '💎',
            name: `Kadim Parça x${level}`,
            rarity: level >= 40 ? 'epic' : level >= 20 ? 'rare' : 'uncommon'
        };
    }

    if (level % 5 === 0) {
        return {
            type: 'gems',
            amount: level * 2,
            icon: '💠',
            name: `${level * 2} Gem`,
            rarity: 'uncommon'
        };
    }

    // Normal seviyeler
    return {
        type: 'gold',
        amount: level * 500,
        icon: '🪙',
        name: `${level * 500} Altın`,
        rarity: 'common'
    };
}

function generatePremiumReward(level: number): BattlePassReward {
    // Seviye 50: Efsanevi Kanat
    if (level === 50) {
        return {
            type: 'wing',
            cosmeticId: 'bp_s1_legendary_wings',
            icon: '🦋',
            name: 'Kadim Kanatlar',
            rarity: 'legendary'
        };
    }

    // Seviye 40: Efsanevi Pet
    if (level === 40) {
        return {
            type: 'pet',
            cosmeticId: 'bp_s1_phoenix',
            icon: '🐦‍🔥',
            name: 'Anka Yavrusu',
            rarity: 'legendary'
        };
    }

    // Seviye 30: Epic Kostüm
    if (level === 30) {
        return {
            type: 'cosmetic',
            cosmeticId: 'bp_s1_armor_set',
            icon: '⚔️',
            name: 'Kadim Savaşçı Seti',
            rarity: 'epic'
        };
    }

    // Seviye 20: Unvan
    if (level === 20) {
        return {
            type: 'title',
            title: 'Sezon Şampiyonu',
            icon: '👑',
            name: 'Sezon Şampiyonu Unvanı',
            rarity: 'rare'
        };
    }

    // Her 5 seviyede ekstra gem
    if (level % 5 === 0) {
        return {
            type: 'gems',
            amount: level * 5,
            icon: '💠',
            name: `${level * 5} Gem`,
            rarity: 'rare'
        };
    }

    // Her 3 seviyede emote
    if (level % 3 === 0) {
        const emotes = ['dance', 'wave', 'victory', 'sit', 'laugh', 'cry'];
        return {
            type: 'emote',
            emote: emotes[Math.floor(level / 3) % emotes.length],
            icon: '💃',
            name: `Özel Emote`,
            rarity: 'uncommon'
        };
    }

    // Normal seviyeler: Altın + Material
    return {
        type: 'gold',
        amount: level * 1000,
        icon: '🪙',
        name: `${level * 1000} Altın`,
        rarity: 'common'
    };
}

// ============================================
// GÖREV ŞABLONLARI
// ============================================
export const DAILY_MISSION_TEMPLATES: Omit<BattlePassMission, 'id' | 'current' | 'isCompleted'>[] = [
    {
        name: 'Günlük Avlanma',
        description: '25 düşman öldür',
        type: 'daily',
        category: 'combat',
        target: 25,
        xpReward: 100,
        icon: '⚔️'
    },
    {
        name: 'Kaynak Toplayıcı',
        description: '10 kaynak topla (ağaç, taş, kristal)',
        type: 'daily',
        category: 'collect',
        target: 10,
        xpReward: 80,
        icon: '🪵'
    },
    {
        name: 'Zanaatkar',
        description: '3 item craft et',
        type: 'daily',
        category: 'craft',
        target: 3,
        xpReward: 120,
        icon: '🔨'
    },
    {
        name: 'Kaşif',
        description: '2 farklı bölge ziyaret et',
        type: 'daily',
        category: 'explore',
        target: 2,
        xpReward: 60,
        icon: '🗺️'
    },
    {
        name: 'Sosyal Kelebek',
        description: '5 mesaj gönder',
        type: 'daily',
        category: 'social',
        target: 5,
        xpReward: 50,
        icon: '💬'
    }
];

export const WEEKLY_MISSION_TEMPLATES: Omit<BattlePassMission, 'id' | 'current' | 'isCompleted'>[] = [
    {
        name: 'Haftalık Katliam',
        description: '200 düşman öldür',
        type: 'weekly',
        category: 'combat',
        target: 200,
        xpReward: 500,
        icon: '💀'
    },
    {
        name: 'Boss Avcısı',
        description: '5 boss öldür',
        type: 'weekly',
        category: 'combat',
        target: 5,
        xpReward: 750,
        icon: '👹'
    },
    {
        name: 'Usta Zanaatkar',
        description: '15 item craft et',
        type: 'weekly',
        category: 'craft',
        target: 15,
        xpReward: 600,
        icon: '⚒️'
    },
    {
        name: 'Gezgin',
        description: 'Tüm bölgeleri ziyaret et (8 bölge)',
        type: 'weekly',
        category: 'explore',
        target: 8,
        xpReward: 400,
        icon: '🧭'
    },
    {
        name: 'Takım Oyuncusu',
        description: 'Parti halinde 50 düşman öldür',
        type: 'weekly',
        category: 'social',
        target: 50,
        xpReward: 550,
        icon: '👥'
    }
];

// ============================================
// BATTLE PASS YÖNETİCİSİ
// ============================================
export class BattlePassManager {
    private playerData: PlayerBattlePass;
    private currentSeason: BattlePassSeason;

    constructor(seasonId: string = 'season_1') {
        this.currentSeason = this.loadSeason(seasonId);
        this.playerData = this.loadPlayerData();
    }

    private loadSeason(seasonId: string): BattlePassSeason {
        return {
            id: 'season_1',
            name: 'Kadim Kahramanlar',
            theme: 'ancient_heroes',
            startDate: Date.now(),
            endDate: Date.now() + (90 * 24 * 60 * 60 * 1000), // 90 gün
            maxLevel: 50,
            levels: SEASON_1_LEVELS,
            premiumPrice: 1000 // 1000 Gem
        };
    }

    private loadPlayerData(): PlayerBattlePass {
        const saved = localStorage.getItem('kadim_battlepass');
        if (saved) {
            return JSON.parse(saved);
        }

        return {
            seasonId: this.currentSeason.id,
            currentLevel: 1,
            currentXp: 0,
            isPremium: false,
            claimedFreeRewards: [],
            claimedPremiumRewards: [],
            missions: this.generateDailyMissions(),
            lastMissionRefresh: Date.now()
        };
    }

    private savePlayerData(): void {
        localStorage.setItem('kadim_battlepass', JSON.stringify(this.playerData));
    }

    // Günlük görevleri yenile
    private generateDailyMissions(): BattlePassMission[] {
        const dailies = DAILY_MISSION_TEMPLATES
            .sort(() => Math.random() - 0.5)
            .slice(0, 3)
            .map((template, i) => ({
                ...template,
                id: `daily_${Date.now()}_${i}`,
                current: 0,
                isCompleted: false
            }));

        const weeklies = WEEKLY_MISSION_TEMPLATES
            .sort(() => Math.random() - 0.5)
            .slice(0, 2)
            .map((template, i) => ({
                ...template,
                id: `weekly_${Date.now()}_${i}`,
                current: 0,
                isCompleted: false
            }));

        return [...dailies, ...weeklies];
    }

    // Görev güncellemelerini kontrol et
    checkMissionRefresh(): void {
        const now = Date.now();
        const lastRefresh = new Date(this.playerData.lastMissionRefresh);
        const today = new Date();

        // Günlük sıfırlama (geceyarısı)
        if (lastRefresh.getDate() !== today.getDate()) {
            // Günlük görevleri sıfırla
            this.playerData.missions = this.playerData.missions.filter(m => m.type !== 'daily');

            // Yeni günlük görevler ekle
            const newDailies = DAILY_MISSION_TEMPLATES
                .sort(() => Math.random() - 0.5)
                .slice(0, 3)
                .map((template, i) => ({
                    ...template,
                    id: `daily_${Date.now()}_${i}`,
                    current: 0,
                    isCompleted: false
                }));

            this.playerData.missions.push(...newDailies);
            this.playerData.lastMissionRefresh = now;
            this.savePlayerData();
        }
    }

    // XP kazanma
    addXp(amount: number): { leveledUp: boolean; newLevel: number } {
        this.playerData.currentXp += amount;
        let leveledUp = false;

        // Level atlama kontrolü
        while (this.playerData.currentLevel < this.currentSeason.maxLevel) {
            const currentLevelData = this.currentSeason.levels[this.playerData.currentLevel - 1];

            if (this.playerData.currentXp >= currentLevelData.requiredXp) {
                this.playerData.currentXp -= currentLevelData.requiredXp;
                this.playerData.currentLevel++;
                leveledUp = true;
            } else {
                break;
            }
        }

        this.savePlayerData();

        return {
            leveledUp,
            newLevel: this.playerData.currentLevel
        };
    }

    // Görev ilerlemesi güncelle
    updateMission(category: BattlePassMission['category'], amount: number = 1): BattlePassMission[] {
        const updatedMissions: BattlePassMission[] = [];

        this.playerData.missions.forEach(mission => {
            if (mission.category === category && !mission.isCompleted) {
                mission.current = Math.min(mission.current + amount, mission.target);

                if (mission.current >= mission.target) {
                    mission.isCompleted = true;
                    this.addXp(mission.xpReward);
                    updatedMissions.push(mission);
                }
            }
        });

        this.savePlayerData();
        return updatedMissions;
    }

    // Ödül talep et
    claimReward(level: number, isPremiumReward: boolean): BattlePassReward | null {
        // Seviye kontrolü
        if (level > this.playerData.currentLevel) {
            return null;
        }

        // Premium kontrolü
        if (isPremiumReward && !this.playerData.isPremium) {
            return null;
        }

        // Zaten alınmış mı?
        const claimedList = isPremiumReward
            ? this.playerData.claimedPremiumRewards
            : this.playerData.claimedFreeRewards;

        if (claimedList.includes(level)) {
            return null;
        }

        // Ödülü işaretle
        claimedList.push(level);
        this.savePlayerData();

        // Ödülü döndür
        const levelData = this.currentSeason.levels[level - 1];
        return isPremiumReward ? levelData.premiumReward : levelData.freeReward;
    }

    // Premium satın al
    purchasePremium(): boolean {
        this.playerData.isPremium = true;
        this.savePlayerData();
        return true;
    }

    // Getters
    getPlayerData(): PlayerBattlePass {
        return this.playerData;
    }

    getCurrentSeason(): BattlePassSeason {
        return this.currentSeason;
    }

    getSeasonTimeRemaining(): number {
        return Math.max(0, this.currentSeason.endDate - Date.now());
    }

    getNextLevelXp(): number {
        if (this.playerData.currentLevel >= this.currentSeason.maxLevel) {
            return 0;
        }
        return this.currentSeason.levels[this.playerData.currentLevel - 1].requiredXp;
    }

    getLevelProgress(): number {
        const required = this.getNextLevelXp();
        if (required === 0) return 100;
        return Math.floor((this.playerData.currentXp / required) * 100);
    }
}

// Singleton instance
export const battlePassManager = new BattlePassManager();
