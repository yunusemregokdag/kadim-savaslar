/**
 * dailyLeaderboard.ts
 * Günlük Sıralama Sistemi
 * - Her gün 00:00'da reset
 * - Günlük honor/kill/death takibi
 * - Top 10 sıralaması
 * - Ödül dağıtımı
 */

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface DailyPlayerStats {
    playerId: string;
    playerName: string;
    dailyHonor: number;
    dailyKills: number;
    dailyDeaths: number;
    lastUpdated: number;
}

export interface DailyReward {
    rank: number;
    diamonds: number;
    title?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// ÖDÜL TABLOSU
// ═══════════════════════════════════════════════════════════════════════════

export const DAILY_REWARDS: DailyReward[] = [
    { rank: 1, diamonds: 200, title: 'Günün Şampiyonu' },
    { rank: 2, diamonds: 100 },
    { rank: 3, diamonds: 50 },
    { rank: 4, diamonds: 10 },
    { rank: 5, diamonds: 10 },
    { rank: 6, diamonds: 10 },
    { rank: 7, diamonds: 10 },
    { rank: 8, diamonds: 10 },
    { rank: 9, diamonds: 10 },
    { rank: 10, diamonds: 10 },
];

// ═══════════════════════════════════════════════════════════════════════════
// STATE (Client-side mock - gerçekte server'da olmalı)
// ═══════════════════════════════════════════════════════════════════════════

let dailyStats: Map<string, DailyPlayerStats> = new Map();
let lastResetDate: string = getToday();

/**
 * Bugünün tarihini YYYY-MM-DD formatında al
 */
function getToday(): string {
    const now = new Date();
    return now.toISOString().split('T')[0];
}

/**
 * Gün değişti mi kontrol et
 */
function checkAndResetDaily(): void {
    const today = getToday();
    if (today !== lastResetDate) {
        // Yeni gün - reset yap
        resetDailyStats();
        lastResetDate = today;
    }
}

/**
 * Persist: Get all stats object
 */
export function getAllDailyStats(): Record<string, DailyPlayerStats> {
    return Object.fromEntries(dailyStats);
}

/**
 * Persist: Load stats
 */
export function loadDailyStats(data: Record<string, DailyPlayerStats>) {
    dailyStats = new Map(Object.entries(data));
}

// ═══════════════════════════════════════════════════════════════════════════
// FONKSİYONLAR
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Oyuncu stats'ını al veya oluştur
 */
export function getOrCreateDailyStats(playerId: string, playerName: string): DailyPlayerStats {
    checkAndResetDaily();

    let stats = dailyStats.get(playerId);
    if (!stats) {
        stats = {
            playerId,
            playerName,
            dailyHonor: 0,
            dailyKills: 0,
            dailyDeaths: 0,
            lastUpdated: Date.now()
        };
        dailyStats.set(playerId, stats);
    }
    return stats;
}

/**
 * Günlük honor ekle
 */
export function addDailyHonor(playerId: string, playerName: string, amount: number): DailyPlayerStats {
    checkAndResetDaily();

    const stats = getOrCreateDailyStats(playerId, playerName);
    stats.dailyHonor += amount;
    stats.lastUpdated = Date.now();
    dailyStats.set(playerId, stats);

    return stats;
}

/**
 * Günlük kill ekle
 */
export function addDailyKill(playerId: string, playerName: string): DailyPlayerStats {
    checkAndResetDaily();

    const stats = getOrCreateDailyStats(playerId, playerName);
    stats.dailyKills += 1;
    stats.lastUpdated = Date.now();
    dailyStats.set(playerId, stats);

    return stats;
}

/**
 * Günlük death ekle
 */
export function addDailyDeath(playerId: string, playerName: string): DailyPlayerStats {
    checkAndResetDaily();

    const stats = getOrCreateDailyStats(playerId, playerName);
    stats.dailyDeaths += 1;
    stats.lastUpdated = Date.now();
    dailyStats.set(playerId, stats);

    return stats;
}

/**
 * Günlük istatistikleri sıfırla
 */
export function resetDailyStats(): void {
    // Ödülleri dağıtmadan önce top 10'u kaydet
    const topPlayers = getDailyTopPlayers(10);

    // Ödülleri hesapla (server-side'da bu mailbox'a eklenir)
    const rewards = topPlayers.map((player, index) => ({
        ...player,
        reward: DAILY_REWARDS[index] || null
    }));

    console.log('[DailyLeaderboard] Gün sonu ödülleri:', rewards);

    // Stats'ı temizle
    dailyStats.clear();
}

/**
 * Top oyuncuları al (sıralı)
 */
export function getDailyTopPlayers(limit: number = 10): DailyPlayerStats[] {
    checkAndResetDaily();

    const allStats = Array.from(dailyStats.values());

    // Sıralama: 1. dailyHonor, 2. dailyKills (tie-breaker)
    allStats.sort((a, b) => {
        if (b.dailyHonor !== a.dailyHonor) {
            return b.dailyHonor - a.dailyHonor;
        }
        return b.dailyKills - a.dailyKills;
    });

    return allStats.slice(0, limit);
}

/**
 * Oyuncunun günlük sıralamasını bul
 */
export function getPlayerDailyRank(playerId: string): number {
    checkAndResetDaily();

    const allStats = Array.from(dailyStats.values());
    allStats.sort((a, b) => {
        if (b.dailyHonor !== a.dailyHonor) {
            return b.dailyHonor - a.dailyHonor;
        }
        return b.dailyKills - a.dailyKills;
    });

    const index = allStats.findIndex(s => s.playerId === playerId);
    return index === -1 ? -1 : index + 1;
}

/**
 * Oyuncunun günlük stats'ını al
 */
export function getPlayerDailyStats(playerId: string): DailyPlayerStats | null {
    checkAndResetDaily();
    return dailyStats.get(playerId) || null;
}

/**
 * Sıralamadaki ödülü hesapla
 */
export function getRewardForRank(rank: number): DailyReward | null {
    if (rank < 1 || rank > 10) return null;
    return DAILY_REWARDS[rank - 1] || null;
}
