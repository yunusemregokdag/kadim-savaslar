import { PlayerState } from '../types';

const AD_CONFIG = {
    MAX_DAILY_ADS: 3,
    REWARD_GEMS: 5,
    REWARD_GOLD: 1000
};

/**
 * Check if player can watch ad
 */
export function canWatchAd(player: PlayerState): boolean {
    return (player.dailyAdsWatched || 0) < AD_CONFIG.MAX_DAILY_ADS;
}

/**
 * Watch Ad and Get Reward
 */
export function watchAd(player: PlayerState): { success: boolean, updates?: Partial<PlayerState>, message?: string } {
    if (!canWatchAd(player)) {
        return { success: false, message: 'Günlük reklam izleme limitine ulaşıldı.' };
    }

    const currentAds = player.dailyAdsWatched || 0;

    return {
        success: true,
        updates: {
            dailyAdsWatched: currentAds + 1,
            gems: (player.gems || 0) + AD_CONFIG.REWARD_GEMS,
            credits: player.credits + AD_CONFIG.REWARD_GOLD
        },
        message: `${AD_CONFIG.REWARD_GEMS} Elmas ve ${AD_CONFIG.REWARD_GOLD} Altın kazanıldı!`
    };
}
