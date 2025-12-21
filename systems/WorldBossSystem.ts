// ============================================
// DÜNYA BOSSU (WORLD BOSS) SİSTEMİ
// Sunucu genelinde dev boss savaşları
// ============================================

import { CharacterClass, ItemStats } from '../types';
import { T5Essence, T5_ESSENCES } from './EssenceSystem';

// Boss Durumu
export type BossPhase = 1 | 2 | 3;
export type BossState = 'dormant' | 'spawning' | 'active' | 'enraged' | 'defeated';

// Dünya Bossu Tanımı
export interface WorldBoss {
    id: string;
    name: string;
    title: string;
    description: string;
    level: number;
    maxHp: number;
    damage: number;
    defense: number;
    spawnLocation: { zoneId: number; x: number; z: number };
    spawnSchedule: { hours: number[]; daysOfWeek?: number[] }; // 0=Pazar
    minPlayers: number;
    maxPlayers: number;
    phases: BossPhase[];
    skills: WorldBossSkill[];
    drops: WorldBossDrop[];
    icon: string;
    modelPath: string;
    scale: number;
    color: string;
}

// Boss Yeteneği
export interface WorldBossSkill {
    id: string;
    name: string;
    description: string;
    phase: BossPhase;
    damage: number;
    radius: number;
    cooldown: number;
    warningTime: number; // Saniye - oyunculara kaçma süresi
    type: 'aoe' | 'targeted' | 'cone' | 'line' | 'summon';
    icon: string;
    color: string;
}

// Boss Drop
export interface WorldBossDrop {
    itemId?: string;
    essenceId?: string;
    dropChance: number;
    minCount?: number;
    maxCount?: number;
    requiresContribution?: number; // Minimum katkı yüzdesi
}

// Oyuncu Katkısı
export interface PlayerContribution {
    odederId: string;
    odederName: string;
    class: CharacterClass;
    damageDealt: number;
    damageTaken: number;
    healingDone: number;
    buffsDuration: number; // Ozan/destek için
    contributionScore: number; // Toplam puan
}

// ============================================
// DÜNYA BOSSLARI
// ============================================
export const WORLD_BOSSES: WorldBoss[] = [
    {
        id: 'boss_ancient_dragon',
        name: 'Kadim Ejderha',
        title: 'Tiamat, Yıkımın Efendisi',
        description: 'Bin yıllık uykusundan uyanan kadim ejderha. Tüm sınıfların birlikte savaşması gerekir.',
        level: 50,
        maxHp: 50000000,
        damage: 5000,
        defense: 2000,
        spawnLocation: { zoneId: 5, x: 500, z: 500 },
        spawnSchedule: { hours: [14, 20], daysOfWeek: [0, 3, 6] }, // Paz, Çar, Cmt
        minPlayers: 20,
        maxPlayers: 100,
        phases: [1, 2, 3],
        skills: [
            { id: 'dragon_breath', name: 'Ejderha Nefesi', description: 'Önündeki bölgeye ateş saçar', phase: 1, damage: 8000, radius: 30, cooldown: 15, warningTime: 3, type: 'cone', icon: '🔥', color: '#ff4400' },
            { id: 'tail_sweep', name: 'Kuyruk Darbesi', description: 'Etrafındaki herkesi savurur', phase: 1, damage: 4000, radius: 15, cooldown: 10, warningTime: 2, type: 'aoe', icon: '💨', color: '#888888' },
            { id: 'summon_drakes', name: 'Yavru Çağırma', description: 'Küçük ejderhalar çağırır', phase: 2, damage: 0, radius: 50, cooldown: 45, warningTime: 5, type: 'summon', icon: '🐉', color: '#ff6600' },
            { id: 'meteor_rain', name: 'Meteor Yağmuru', description: 'Gökten ateş topları yağdırır', phase: 2, damage: 10000, radius: 8, cooldown: 20, warningTime: 4, type: 'targeted', icon: '☄️', color: '#ff0000' },
            { id: 'apocalypse', name: 'Kıyamet', description: 'Tüm alana yıkıcı saldırı', phase: 3, damage: 15000, radius: 100, cooldown: 60, warningTime: 8, type: 'aoe', icon: '💥', color: '#ff0000' }
        ],
        drops: [
            { essenceId: 'essence_dragons_breath', dropChance: 1, requiresContribution: 5 },
            { itemId: 'dragon_scale', dropChance: 50, minCount: 1, maxCount: 3 },
            { itemId: 'ancient_gold', dropChance: 100, minCount: 5000, maxCount: 20000 },
            { itemId: 'legendary_ore', dropChance: 30, minCount: 1, maxCount: 5 }
        ],
        icon: '🐉',
        modelPath: '/models/bosses/ancient_dragon.gltf',
        scale: 5,
        color: '#ff3300'
    },
    {
        id: 'boss_storm_titan',
        name: 'Fırtına Devası',
        title: 'Thorak, Göklerin Gazabı',
        description: 'Bulutların arasından inen devasa titan. Şimşeklerle savaşır.',
        level: 45,
        maxHp: 30000000,
        damage: 4000,
        defense: 1500,
        spawnLocation: { zoneId: 6, x: 300, z: 700 },
        spawnSchedule: { hours: [12, 18] },
        minPlayers: 15,
        maxPlayers: 80,
        phases: [1, 2, 3],
        skills: [
            { id: 'thunder_strike', name: 'Yıldırım Darbesi', description: 'Hedefe yıldırım düşürür', phase: 1, damage: 6000, radius: 5, cooldown: 8, warningTime: 2, type: 'targeted', icon: '⚡', color: '#ffff00' },
            { id: 'storm_surge', name: 'Fırtına Dalgası', description: 'Etrafına elektrik dalgası yayar', phase: 2, damage: 5000, radius: 25, cooldown: 15, warningTime: 3, type: 'aoe', icon: '🌊', color: '#00ccff' },
            { id: 'chain_lightning', name: 'Zincir Şimşek', description: 'Oyuncular arasında zıplayan şimşek', phase: 2, damage: 3000, radius: 10, cooldown: 12, warningTime: 2, type: 'line', icon: '⚡', color: '#ffff00' },
            { id: 'divine_wrath', name: 'İlahi Gazap', description: 'Tüm alana yıldırım yağmuru', phase: 3, damage: 12000, radius: 80, cooldown: 45, warningTime: 6, type: 'aoe', icon: '🌩️', color: '#ffff00' }
        ],
        drops: [
            { essenceId: 'essence_storm_core', dropChance: 3 },
            { itemId: 'storm_crystal', dropChance: 40, minCount: 1, maxCount: 2 },
            { itemId: 'ancient_gold', dropChance: 100, minCount: 3000, maxCount: 15000 }
        ],
        icon: '⛈️',
        modelPath: '/models/bosses/storm_titan.gltf',
        scale: 4,
        color: '#4488ff'
    },
    {
        id: 'boss_frost_colossus',
        name: 'Buzul Kolosu',
        title: 'Jotun, Ebedi Kış',
        description: 'Kuzey buzullarından gelen devasa buz devi.',
        level: 40,
        maxHp: 25000000,
        damage: 3500,
        defense: 2500,
        spawnLocation: { zoneId: 4, x: 200, z: 800 },
        spawnSchedule: { hours: [10, 16, 22] },
        minPlayers: 10,
        maxPlayers: 60,
        phases: [1, 2, 3],
        skills: [
            { id: 'frost_slam', name: 'Buz Darbesi', description: 'Yere vurarak buz dalgası oluşturur', phase: 1, damage: 5000, radius: 20, cooldown: 10, warningTime: 2, type: 'aoe', icon: '❄️', color: '#00ccff' },
            { id: 'ice_spike', name: 'Buz Dikeni', description: 'Yerden buz dikenleri fırlatır', phase: 2, damage: 4000, radius: 3, cooldown: 6, warningTime: 1.5, type: 'targeted', icon: '🧊', color: '#aaeeff' },
            { id: 'blizzard', name: 'Kar Fırtınası', description: 'Tüm bölgeyi karlı fırtınaya boğar', phase: 3, damage: 8000, radius: 60, cooldown: 30, warningTime: 5, type: 'aoe', icon: '🌨️', color: '#ffffff' }
        ],
        drops: [
            { essenceId: 'essence_frost_giant_heart', dropChance: 1, requiresContribution: 10 },
            { itemId: 'eternal_ice', dropChance: 45, minCount: 1, maxCount: 3 },
            { itemId: 'ancient_gold', dropChance: 100, minCount: 2000, maxCount: 10000 }
        ],
        icon: '🧊',
        modelPath: '/models/bosses/frost_colossus.gltf',
        scale: 4.5,
        color: '#00ccff'
    }
];

// ============================================
// KATKI PUANI HESAPLAMA
// ============================================
export function calculateContributionScore(contribution: Omit<PlayerContribution, 'contributionScore'>): number {
    // Hasar: 1 puan / 100 hasar
    const damagePoints = contribution.damageDealt / 100;

    // Tank bonus: Alınan hasar için ekstra puan
    const tankPoints = contribution.damageTaken / 200;

    // Şifa: 1.5 puan / 100 şifa (şifacılar önemli)
    const healPoints = contribution.healingDone / 100 * 1.5;

    // Buff süresi: Ozan/destek için (saniye başına 10 puan)
    const buffPoints = contribution.buffsDuration * 10;

    return Math.floor(damagePoints + tankPoints + healPoints + buffPoints);
}

// ============================================
// ÖDÜL DAĞITIMI
// ============================================
export interface BossReward {
    playerId: string;
    playerName: string;
    contributionPercent: number;
    rank: number;
    items: { itemId: string; count: number }[];
    gold: number;
    essence?: T5Essence;
    bonusTitle?: string;
}

export function distributeBossRewards(
    boss: WorldBoss,
    contributions: PlayerContribution[]
): BossReward[] {
    // Toplam katkıyı hesapla
    const totalContribution = contributions.reduce((sum, c) => sum + c.contributionScore, 0);

    // Sırala
    const sorted = [...contributions].sort((a, b) => b.contributionScore - a.contributionScore);

    const rewards: BossReward[] = [];

    sorted.forEach((contribution, index) => {
        const contributionPercent = (contribution.contributionScore / totalContribution) * 100;
        const rank = index + 1;

        const reward: BossReward = {
            playerId: contribution.odederId,
            playerName: contribution.odederName,
            contributionPercent,
            rank,
            items: [],
            gold: 0
        };

        // Drop kontrolü
        boss.drops.forEach(drop => {
            // Katkı gereksinimi kontrolü
            if (drop.requiresContribution && contributionPercent < drop.requiresContribution) {
                return;
            }

            // Şans kontrolü (üst sıralara bonus)
            let adjustedChance = drop.dropChance;
            if (rank <= 3) adjustedChance *= 1.5;
            else if (rank <= 10) adjustedChance *= 1.2;

            if (Math.random() * 100 <= adjustedChance) {
                if (drop.essenceId) {
                    const essence = T5_ESSENCES.find(e => e.id === drop.essenceId);
                    if (essence) reward.essence = essence;
                } else if (drop.itemId) {
                    const count = drop.minCount && drop.maxCount
                        ? Math.floor(Math.random() * (drop.maxCount - drop.minCount + 1)) + drop.minCount
                        : 1;
                    reward.items.push({ itemId: drop.itemId, count });
                }
            }
        });

        // Altın (katkıya göre)
        const baseGold = boss.drops.find(d => d.itemId === 'ancient_gold');
        if (baseGold && baseGold.minCount && baseGold.maxCount) {
            const goldRange = baseGold.maxCount - baseGold.minCount;
            reward.gold = Math.floor(baseGold.minCount + (goldRange * contributionPercent / 100));
        }

        // Özel unvanlar
        if (rank === 1) reward.bonusTitle = 'Boss Katili';
        else if (rank <= 3) reward.bonusTitle = 'Efsane Savaşçı';
        else if (rank <= 10) reward.bonusTitle = 'Kahraman';

        rewards.push(reward);
    });

    return rewards;
}

// ============================================
// BOSS YÖNETİCİSİ
// ============================================
export interface ActiveBossState {
    bossId: string;
    currentHp: number;
    phase: BossPhase;
    state: BossState;
    spawnTime: number;
    contributions: PlayerContribution[];
    currentSkill: WorldBossSkill | null;
    skillCooldowns: Record<string, number>;
}

export class WorldBossManager {
    private activeBoss: ActiveBossState | null = null;
    private listeners: ((state: ActiveBossState | null) => void)[] = [];

    constructor() {
        this.checkSpawnSchedule();
        setInterval(() => this.checkSpawnSchedule(), 60000); // Her dakika kontrol
    }

    private checkSpawnSchedule(): void {
        if (this.activeBoss) return;

        const now = new Date();
        const currentHour = now.getHours();
        const currentDay = now.getDay();

        for (const boss of WORLD_BOSSES) {
            const { hours, daysOfWeek } = boss.spawnSchedule;

            if (daysOfWeek && !daysOfWeek.includes(currentDay)) continue;
            if (!hours.includes(currentHour)) continue;

            // Boss spawn et
            this.spawnBoss(boss.id);
            break;
        }
    }

    spawnBoss(bossId: string): boolean {
        const boss = WORLD_BOSSES.find(b => b.id === bossId);
        if (!boss || this.activeBoss) return false;

        this.activeBoss = {
            bossId,
            currentHp: boss.maxHp,
            phase: 1,
            state: 'spawning',
            spawnTime: Date.now(),
            contributions: [],
            currentSkill: null,
            skillCooldowns: {}
        };

        // 30 saniye sonra aktif ol
        setTimeout(() => {
            if (this.activeBoss?.bossId === bossId) {
                this.activeBoss.state = 'active';
                this.notifyListeners();
            }
        }, 30000);

        this.notifyListeners();
        return true;
    }

    dealDamage(playerId: string, playerName: string, playerClass: CharacterClass, damage: number): void {
        if (!this.activeBoss || this.activeBoss.state !== 'active') return;

        // Katkıyı kaydet
        let contribution = this.activeBoss.contributions.find(c => c.odederId === playerId);
        if (!contribution) {
            contribution = {
                odederId: playerId,
                odederName: playerName,
                class: playerClass,
                damageDealt: 0,
                damageTaken: 0,
                healingDone: 0,
                buffsDuration: 0,
                contributionScore: 0
            };
            this.activeBoss.contributions.push(contribution);
        }
        contribution.damageDealt += damage;
        contribution.contributionScore = calculateContributionScore(contribution);

        // Boss HP azalt
        this.activeBoss.currentHp = Math.max(0, this.activeBoss.currentHp - damage);

        // Faz kontrolü
        const boss = WORLD_BOSSES.find(b => b.id === this.activeBoss!.bossId)!;
        const hpPercent = this.activeBoss.currentHp / boss.maxHp * 100;

        if (hpPercent <= 30 && this.activeBoss.phase < 3) {
            this.activeBoss.phase = 3;
            this.activeBoss.state = 'enraged';
        } else if (hpPercent <= 60 && this.activeBoss.phase < 2) {
            this.activeBoss.phase = 2;
        }

        // Ölüm kontrolü
        if (this.activeBoss.currentHp <= 0) {
            this.activeBoss.state = 'defeated';
            this.notifyListeners();
        }

        this.notifyListeners();
    }

    recordHealing(playerId: string, amount: number): void {
        const contribution = this.activeBoss?.contributions.find(c => c.odederId === playerId);
        if (contribution) {
            contribution.healingDone += amount;
            contribution.contributionScore = calculateContributionScore(contribution);
        }
    }

    recordBuffTime(playerId: string, seconds: number): void {
        const contribution = this.activeBoss?.contributions.find(c => c.odederId === playerId);
        if (contribution) {
            contribution.buffsDuration += seconds;
            contribution.contributionScore = calculateContributionScore(contribution);
        }
    }

    getRewards(): BossReward[] {
        if (!this.activeBoss || this.activeBoss.state !== 'defeated') return [];

        const boss = WORLD_BOSSES.find(b => b.id === this.activeBoss!.bossId)!;
        return distributeBossRewards(boss, this.activeBoss.contributions);
    }

    getActiveBoss(): ActiveBossState | null {
        return this.activeBoss;
    }

    getBossInfo(bossId: string): WorldBoss | undefined {
        return WORLD_BOSSES.find(b => b.id === bossId);
    }

    subscribe(callback: (state: ActiveBossState | null) => void): () => void {
        this.listeners.push(callback);
        return () => { this.listeners = this.listeners.filter(l => l !== callback); };
    }

    private notifyListeners(): void {
        this.listeners.forEach(l => l(this.activeBoss));
    }

    // Debug
    forceSpawn(bossId: string): void {
        this.activeBoss = null;
        this.spawnBoss(bossId);
    }
}

export const worldBossManager = new WorldBossManager();
