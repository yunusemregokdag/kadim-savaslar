// ============================================
// VIP / PREMIUM SİSTEMİ
// Rekabeti bozmayan hafif avantajlar
// ============================================

// VIP Tier Tanımları
export type VIPTier = 'none' | 'bronze' | 'silver' | 'gold' | 'diamond';

export interface VIPBenefits {
    // XP ve Altın Bonusları (Hafif - %5-15 arası)
    expMultiplier: number;      // 1.0 - 1.15
    goldMultiplier: number;     // 1.0 - 1.10

    // Kalite Hayatı İyileştirmeleri
    inventorySlots: number;     // Ekstra slot sayısı
    storageSlots: number;       // Depo slot sayısı
    teleportCooldown: number;   // Işınlanma bekleme süresi (saniye)
    repairDiscount: number;     // Tamir indirimi %
    marketTaxReduction: number; // Market vergi indirimi %

    // Görsel Ayrıcalıklar
    nameColor: string;          // İsim rengi
    badge: string;              // İsim yanı rozet
    profileFrame: string;       // Profil çerçevesi
    chatHighlight: boolean;     // Sohbet mesajı vurgulama

    // Özel Erişimler
    priorityQueue: boolean;     // Arena öncelikli giriş
    offlineExpGain: boolean;    // Çevrimdışı XP kazanma
    dailyGems: number;          // Günlük gem ödülü
    weeklyChest: boolean;       // Haftalık premium sandık

    // Shop İndirimleri
    shopDiscount: number;       // Genel shop indirimi %
}

// ============================================
// VIP TİER TANIMLARI
// ============================================
export const VIP_TIERS: Record<VIPTier, VIPBenefits> = {
    none: {
        expMultiplier: 1.0,
        goldMultiplier: 1.0,
        inventorySlots: 0,
        storageSlots: 0,
        teleportCooldown: 300, // 5 dakika
        repairDiscount: 0,
        marketTaxReduction: 0,
        nameColor: '#ffffff',
        badge: '',
        profileFrame: 'default',
        chatHighlight: false,
        priorityQueue: false,
        offlineExpGain: false,
        dailyGems: 0,
        weeklyChest: false,
        shopDiscount: 0
    },

    bronze: {
        expMultiplier: 1.05, // %5 XP
        goldMultiplier: 1.03, // %3 Altın
        inventorySlots: 10,
        storageSlots: 20,
        teleportCooldown: 240, // 4 dakika
        repairDiscount: 5,
        marketTaxReduction: 5,
        nameColor: '#cd7f32', // Bronz
        badge: '🥉',
        profileFrame: 'bronze',
        chatHighlight: false,
        priorityQueue: false,
        offlineExpGain: false,
        dailyGems: 5,
        weeklyChest: false,
        shopDiscount: 5
    },

    silver: {
        expMultiplier: 1.08, // %8 XP
        goldMultiplier: 1.05, // %5 Altın
        inventorySlots: 20,
        storageSlots: 40,
        teleportCooldown: 180, // 3 dakika
        repairDiscount: 10,
        marketTaxReduction: 10,
        nameColor: '#c0c0c0', // Gümüş
        badge: '🥈',
        profileFrame: 'silver',
        chatHighlight: true,
        priorityQueue: false,
        offlineExpGain: false,
        dailyGems: 15,
        weeklyChest: true,
        shopDiscount: 10
    },

    gold: {
        expMultiplier: 1.12, // %12 XP
        goldMultiplier: 1.08, // %8 Altın
        inventorySlots: 30,
        storageSlots: 60,
        teleportCooldown: 120, // 2 dakika
        repairDiscount: 15,
        marketTaxReduction: 15,
        nameColor: '#ffd700', // Altın
        badge: '👑',
        profileFrame: 'gold',
        chatHighlight: true,
        priorityQueue: true,
        offlineExpGain: true,
        dailyGems: 30,
        weeklyChest: true,
        shopDiscount: 15
    },

    diamond: {
        expMultiplier: 1.15, // %15 XP (Maksimum)
        goldMultiplier: 1.10, // %10 Altın (Maksimum)
        inventorySlots: 50,
        storageSlots: 100,
        teleportCooldown: 60, // 1 dakika
        repairDiscount: 25,
        marketTaxReduction: 25,
        nameColor: '#b9f2ff', // Elmas mavisi
        badge: '💎',
        profileFrame: 'diamond',
        chatHighlight: true,
        priorityQueue: true,
        offlineExpGain: true,
        dailyGems: 50,
        weeklyChest: true,
        shopDiscount: 20
    }
};

// ============================================
// VIP PAKET FİYATLARI
// ============================================
export interface VIPPackage {
    tier: VIPTier;
    duration: number; // Gün
    price: {
        gems?: number;
        realMoney?: number; // TL veya USD
    };
    bonusGems?: number;
    popular?: boolean;
}

export const VIP_PACKAGES: VIPPackage[] = [
    // Bronze Paketleri
    { tier: 'bronze', duration: 7, price: { gems: 100 } },
    { tier: 'bronze', duration: 30, price: { gems: 350 }, bonusGems: 50 },

    // Silver Paketleri
    { tier: 'silver', duration: 7, price: { gems: 250 } },
    { tier: 'silver', duration: 30, price: { gems: 900 }, bonusGems: 150, popular: true },

    // Gold Paketleri
    { tier: 'gold', duration: 7, price: { gems: 500 } },
    { tier: 'gold', duration: 30, price: { gems: 1800 }, bonusGems: 300 },
    { tier: 'gold', duration: 90, price: { gems: 4500 }, bonusGems: 1000, popular: true },

    // Diamond Paketleri
    { tier: 'diamond', duration: 30, price: { gems: 3000 }, bonusGems: 500 },
    { tier: 'diamond', duration: 90, price: { gems: 7500 }, bonusGems: 2000, popular: true },
    { tier: 'diamond', duration: 365, price: { gems: 25000 }, bonusGems: 10000 }
];

// ============================================
// VIP OYUNCU DURUMU
// ============================================
export interface PlayerVIPStatus {
    tier: VIPTier;
    expiresAt: number; // Timestamp
    totalDaysPurchased: number;
    lastDailyReward: string; // YYYY-MM-DD
    weeklyChestClaimed: boolean;
    lastWeeklyReset: string;
}

// ============================================
// VIP YÖNETİCİSİ
// ============================================
export class VIPManager {
    private playerStatus: PlayerVIPStatus;

    constructor() {
        this.playerStatus = this.loadPlayerStatus();
        this.checkExpiration();
    }

    private loadPlayerStatus(): PlayerVIPStatus {
        const saved = localStorage.getItem('kadim_vip');
        if (saved) {
            return JSON.parse(saved);
        }
        return {
            tier: 'none',
            expiresAt: 0,
            totalDaysPurchased: 0,
            lastDailyReward: '',
            weeklyChestClaimed: false,
            lastWeeklyReset: ''
        };
    }

    private savePlayerStatus(): void {
        localStorage.setItem('kadim_vip', JSON.stringify(this.playerStatus));
    }

    // Süre dolmuş mu kontrol et
    private checkExpiration(): void {
        if (this.playerStatus.tier !== 'none' && Date.now() > this.playerStatus.expiresAt) {
            this.playerStatus.tier = 'none';
            this.playerStatus.expiresAt = 0;
            this.savePlayerStatus();
        }
    }

    // VIP satın al
    purchaseVIP(tier: VIPTier, durationDays: number): boolean {
        const now = Date.now();
        const durationMs = durationDays * 24 * 60 * 60 * 1000;

        // Mevcut VIP varsa süre ekle
        if (this.playerStatus.tier === tier && this.playerStatus.expiresAt > now) {
            this.playerStatus.expiresAt += durationMs;
        } else {
            // Yeni VIP veya upgrade
            this.playerStatus.tier = tier;
            this.playerStatus.expiresAt = now + durationMs;
        }

        this.playerStatus.totalDaysPurchased += durationDays;
        this.savePlayerStatus();
        return true;
    }

    // Günlük gem ödülünü al
    claimDailyGems(): number {
        const today = new Date().toISOString().split('T')[0];

        if (this.playerStatus.lastDailyReward === today) {
            return 0; // Bugün zaten alınmış
        }

        const benefits = this.getBenefits();
        if (benefits.dailyGems === 0) {
            return 0; // VIP değil
        }

        this.playerStatus.lastDailyReward = today;
        this.savePlayerStatus();
        return benefits.dailyGems;
    }

    // Haftalık sandık al
    claimWeeklyChest(): boolean {
        const benefits = this.getBenefits();
        if (!benefits.weeklyChest) {
            return false;
        }

        // Haftalık reset kontrolü
        const now = new Date();
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay())).toISOString().split('T')[0];

        if (this.playerStatus.lastWeeklyReset !== weekStart) {
            this.playerStatus.weeklyChestClaimed = false;
            this.playerStatus.lastWeeklyReset = weekStart;
        }

        if (this.playerStatus.weeklyChestClaimed) {
            return false;
        }

        this.playerStatus.weeklyChestClaimed = true;
        this.savePlayerStatus();
        return true;
    }

    // Mevcut VIP avantajlarını getir
    getBenefits(): VIPBenefits {
        this.checkExpiration();
        return VIP_TIERS[this.playerStatus.tier];
    }

    // VIP durumunu getir
    getStatus(): PlayerVIPStatus {
        this.checkExpiration();
        return this.playerStatus;
    }

    // VIP tier'ı getir
    getTier(): VIPTier {
        this.checkExpiration();
        return this.playerStatus.tier;
    }

    // Kalan süreyi getir (gün)
    getRemainingDays(): number {
        const remaining = this.playerStatus.expiresAt - Date.now();
        return Math.max(0, Math.floor(remaining / (24 * 60 * 60 * 1000)));
    }

    // XP çarpanını getir
    getExpMultiplier(): number {
        return this.getBenefits().expMultiplier;
    }

    // Altın çarpanını getir
    getGoldMultiplier(): number {
        return this.getBenefits().goldMultiplier;
    }

    // Ekstra envanter slotunu getir
    getExtraInventorySlots(): number {
        return this.getBenefits().inventorySlots;
    }

    // Tamir indirimini getir
    getRepairDiscount(): number {
        return this.getBenefits().repairDiscount;
    }

    // Market vergi indirimini getir
    getMarketTaxReduction(): number {
        return this.getBenefits().marketTaxReduction;
    }

    // Shop indirimini getir
    getShopDiscount(): number {
        return this.getBenefits().shopDiscount;
    }

    // İsim rengini getir
    getNameColor(): string {
        return this.getBenefits().nameColor;
    }

    // Rozeti getir
    getBadge(): string {
        return this.getBenefits().badge;
    }

    // VIP mi?
    isVIP(): boolean {
        this.checkExpiration();
        return this.playerStatus.tier !== 'none';
    }
}

// Singleton instance
export const vipManager = new VIPManager();

// ============================================
// YARDIMCI FONKSİYONLAR
// ============================================
export function getVIPTierName(tier: VIPTier): string {
    const names: Record<VIPTier, string> = {
        none: 'Standart',
        bronze: 'Bronz VIP',
        silver: 'Gümüş VIP',
        gold: 'Altın VIP',
        diamond: 'Elmas VIP'
    };
    return names[tier];
}

export function getVIPTierColor(tier: VIPTier): string {
    return VIP_TIERS[tier].nameColor;
}

export function formatVIPDuration(days: number): string {
    if (days >= 365) {
        return `${Math.floor(days / 365)} Yıl`;
    }
    if (days >= 30) {
        return `${Math.floor(days / 30)} Ay`;
    }
    if (days >= 7) {
        return `${Math.floor(days / 7)} Hafta`;
    }
    return `${days} Gün`;
}
