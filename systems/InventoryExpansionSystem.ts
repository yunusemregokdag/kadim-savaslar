// ============================================
// ENVANTER GENİŞLETME SİSTEMİ
// Ekstra slot satın alma (P2W değil, hayat kalitesi)
// ============================================

// Envanter Genişletme Paketi
export interface InventoryExpansion {
    id: string;
    name: string;
    description: string;
    type: 'inventory' | 'storage' | 'bank';
    slots: number;
    price: {
        gold?: number;
        gems?: number;
    };
    maxPurchases: number; // Kaç kez alınabilir
    icon: string;
}

// Oyuncu Envanter Durumu
export interface PlayerInventoryStatus {
    baseInventorySlots: number;
    bonusInventorySlots: number;
    baseStorageSlots: number;
    bonusStorageSlots: number;
    baseBankSlots: number;
    bonusBankSlots: number;
    purchasedExpansions: Record<string, number>; // expansion_id -> purchase count
}

// ============================================
// GENİŞLETME PAKETLERİ
// ============================================
export const INVENTORY_EXPANSIONS: InventoryExpansion[] = [
    // Envanter Genişletmeleri
    {
        id: 'inv_small',
        name: 'Küçük Çanta',
        description: 'Envantere +5 slot ekler',
        type: 'inventory',
        slots: 5,
        price: { gold: 5000 },
        maxPurchases: 5,
        icon: '🎒'
    },
    {
        id: 'inv_medium',
        name: 'Orta Çanta',
        description: 'Envantere +10 slot ekler',
        type: 'inventory',
        slots: 10,
        price: { gold: 15000 },
        maxPurchases: 3,
        icon: '👜'
    },
    {
        id: 'inv_large',
        name: 'Büyük Çanta',
        description: 'Envantere +20 slot ekler',
        type: 'inventory',
        slots: 20,
        price: { gems: 200 },
        maxPurchases: 2,
        icon: '🧳'
    },
    {
        id: 'inv_legendary',
        name: 'Efsanevi Çanta',
        description: 'Envantere +50 slot ekler',
        type: 'inventory',
        slots: 50,
        price: { gems: 500 },
        maxPurchases: 1,
        icon: '💎'
    },

    // Depo Genişletmeleri
    {
        id: 'storage_small',
        name: 'Küçük Sandık',
        description: 'Depoya +10 slot ekler',
        type: 'storage',
        slots: 10,
        price: { gold: 10000 },
        maxPurchases: 5,
        icon: '📦'
    },
    {
        id: 'storage_medium',
        name: 'Orta Sandık',
        description: 'Depoya +25 slot ekler',
        type: 'storage',
        slots: 25,
        price: { gold: 30000 },
        maxPurchases: 3,
        icon: '🗃️'
    },
    {
        id: 'storage_large',
        name: 'Büyük Sandık',
        description: 'Depoya +50 slot ekler',
        type: 'storage',
        slots: 50,
        price: { gems: 300 },
        maxPurchases: 2,
        icon: '🏛️'
    },

    // Banka Genişletmeleri
    {
        id: 'bank_small',
        name: 'Banka Kasası',
        description: 'Bankaya +20 slot ekler',
        type: 'bank',
        slots: 20,
        price: { gold: 25000 },
        maxPurchases: 3,
        icon: '🏦'
    },
    {
        id: 'bank_large',
        name: 'Özel Kasa',
        description: 'Bankaya +50 slot ekler',
        type: 'bank',
        slots: 50,
        price: { gems: 400 },
        maxPurchases: 2,
        icon: '🔐'
    }
];

// ============================================
// ENVANTER GENİŞLETME YÖNETİCİSİ
// ============================================
export class InventoryExpansionManager {
    private playerStatus: PlayerInventoryStatus;

    // Varsayılan değerler
    static readonly DEFAULT_INVENTORY_SLOTS = 30;
    static readonly DEFAULT_STORAGE_SLOTS = 50;
    static readonly DEFAULT_BANK_SLOTS = 20;
    static readonly MAX_INVENTORY_SLOTS = 200;
    static readonly MAX_STORAGE_SLOTS = 300;
    static readonly MAX_BANK_SLOTS = 150;

    constructor() {
        this.playerStatus = this.loadPlayerStatus();
    }

    private loadPlayerStatus(): PlayerInventoryStatus {
        const saved = localStorage.getItem('kadim_inventory_expansion');
        if (saved) {
            return JSON.parse(saved);
        }
        return {
            baseInventorySlots: InventoryExpansionManager.DEFAULT_INVENTORY_SLOTS,
            bonusInventorySlots: 0,
            baseStorageSlots: InventoryExpansionManager.DEFAULT_STORAGE_SLOTS,
            bonusStorageSlots: 0,
            baseBankSlots: InventoryExpansionManager.DEFAULT_BANK_SLOTS,
            bonusBankSlots: 0,
            purchasedExpansions: {}
        };
    }

    private savePlayerStatus(): void {
        localStorage.setItem('kadim_inventory_expansion', JSON.stringify(this.playerStatus));
    }

    // Genişletme satın al
    purchaseExpansion(expansionId: string): { success: boolean; message: string } {
        const expansion = INVENTORY_EXPANSIONS.find(e => e.id === expansionId);
        if (!expansion) {
            return { success: false, message: 'Geçersiz genişletme paketi' };
        }

        // Max satın alma kontrolü
        const currentPurchases = this.playerStatus.purchasedExpansions[expansionId] || 0;
        if (currentPurchases >= expansion.maxPurchases) {
            return { success: false, message: 'Bu paketten daha fazla alamazsınız' };
        }

        // Max slot kontrolü
        const totalSlots = this.getTotalSlots(expansion.type);
        const maxSlots = this.getMaxSlots(expansion.type);
        if (totalSlots + expansion.slots > maxSlots) {
            return { success: false, message: 'Maksimum slot sınırına ulaştınız' };
        }

        // Slotları ekle
        switch (expansion.type) {
            case 'inventory':
                this.playerStatus.bonusInventorySlots += expansion.slots;
                break;
            case 'storage':
                this.playerStatus.bonusStorageSlots += expansion.slots;
                break;
            case 'bank':
                this.playerStatus.bonusBankSlots += expansion.slots;
                break;
        }

        // Satın alma sayısını güncelle
        this.playerStatus.purchasedExpansions[expansionId] = currentPurchases + 1;
        this.savePlayerStatus();

        return {
            success: true,
            message: `+${expansion.slots} slot eklendi! Toplam: ${this.getTotalSlots(expansion.type)}`
        };
    }

    // Toplam slotları getir
    getTotalSlots(type: InventoryExpansion['type']): number {
        switch (type) {
            case 'inventory':
                return this.playerStatus.baseInventorySlots + this.playerStatus.bonusInventorySlots;
            case 'storage':
                return this.playerStatus.baseStorageSlots + this.playerStatus.bonusStorageSlots;
            case 'bank':
                return this.playerStatus.baseBankSlots + this.playerStatus.bonusBankSlots;
        }
    }

    // Maksimum slot sınırını getir
    getMaxSlots(type: InventoryExpansion['type']): number {
        switch (type) {
            case 'inventory':
                return InventoryExpansionManager.MAX_INVENTORY_SLOTS;
            case 'storage':
                return InventoryExpansionManager.MAX_STORAGE_SLOTS;
            case 'bank':
                return InventoryExpansionManager.MAX_BANK_SLOTS;
        }
    }

    // Belirli bir genişletmenin kaç kez alındığını getir
    getPurchaseCount(expansionId: string): number {
        return this.playerStatus.purchasedExpansions[expansionId] || 0;
    }

    // Belirli bir genişletmenin daha alınabilir olup olmadığını kontrol et
    canPurchase(expansionId: string): boolean {
        const expansion = INVENTORY_EXPANSIONS.find(e => e.id === expansionId);
        if (!expansion) return false;

        const currentPurchases = this.getPurchaseCount(expansionId);
        if (currentPurchases >= expansion.maxPurchases) return false;

        const totalSlots = this.getTotalSlots(expansion.type);
        const maxSlots = this.getMaxSlots(expansion.type);
        return totalSlots + expansion.slots <= maxSlots;
    }

    // Satın alınabilir genişletmeleri getir
    getAvailableExpansions(): InventoryExpansion[] {
        return INVENTORY_EXPANSIONS.filter(e => this.canPurchase(e.id));
    }

    // Tüm slot bilgilerini getir
    getAllSlotInfo(): {
        inventory: { current: number; max: number; bonus: number };
        storage: { current: number; max: number; bonus: number };
        bank: { current: number; max: number; bonus: number };
    } {
        return {
            inventory: {
                current: this.getTotalSlots('inventory'),
                max: InventoryExpansionManager.MAX_INVENTORY_SLOTS,
                bonus: this.playerStatus.bonusInventorySlots
            },
            storage: {
                current: this.getTotalSlots('storage'),
                max: InventoryExpansionManager.MAX_STORAGE_SLOTS,
                bonus: this.playerStatus.bonusStorageSlots
            },
            bank: {
                current: this.getTotalSlots('bank'),
                max: InventoryExpansionManager.MAX_BANK_SLOTS,
                bonus: this.playerStatus.bonusBankSlots
            }
        };
    }

    // VIP bonus slotlarını ekle (VIPSystem ile entegrasyon)
    addVIPBonus(inventorySlots: number, storageSlots: number): void {
        // Bu method VIP sisteminden çağrılır
        // Bonus olarak eklenir, kalıcı değildir
    }

    // Durumu getir
    getStatus(): PlayerInventoryStatus {
        return this.playerStatus;
    }
}

// Singleton instance
export const inventoryExpansionManager = new InventoryExpansionManager();
