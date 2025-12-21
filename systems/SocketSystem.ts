// ============================================
// SOKET (GEM) SİSTEMİ
// ============================================

import { Equipment } from '../types';

export type GemType = 'fire' | 'ice' | 'lightning' | 'earth' | 'holy' | 'dark' | 'crit' | 'life' | 'mana' | 'speed';

export interface Gem {
    id: string;
    type: GemType;
    name: string;
    tier: number; // 1-5
    icon: string;
    color: string;
    stats: GemStats;
    description: string;
}

export interface GemStats {
    attack?: number;
    defense?: number;
    hp?: number;
    mana?: number;
    critChance?: number;
    critDamage?: number;
    attackSpeed?: number;
    moveSpeed?: number;
    elementalDamage?: { type: string; value: number };
    elementalResist?: { type: string; value: number };
}

export interface SocketedItem extends Equipment {
    sockets: (Gem | null)[];
    maxSockets: number;
}

// Gem tanımları
export const GEMS: { [key: string]: Gem } = {
    // Ateş Taşları
    fire_t1: { id: 'fire_t1', type: 'fire', name: 'Kıvılcım Taşı', tier: 1, icon: '🔥', color: '#ef4444', stats: { elementalDamage: { type: 'fire', value: 5 } }, description: '+5 Ateş Hasarı' },
    fire_t2: { id: 'fire_t2', type: 'fire', name: 'Alev Taşı', tier: 2, icon: '🔥', color: '#dc2626', stats: { elementalDamage: { type: 'fire', value: 12 } }, description: '+12 Ateş Hasarı' },
    fire_t3: { id: 'fire_t3', type: 'fire', name: 'İnferno Taşı', tier: 3, icon: '🔥', color: '#b91c1c', stats: { elementalDamage: { type: 'fire', value: 25 }, attack: 5 }, description: '+25 Ateş Hasarı, +5 Saldırı' },
    fire_t4: { id: 'fire_t4', type: 'fire', name: 'Cehennem Taşı', tier: 4, icon: '🔥', color: '#991b1b', stats: { elementalDamage: { type: 'fire', value: 45 }, attack: 10, critDamage: 5 }, description: '+45 Ateş Hasarı, +10 Saldırı, +%5 Kritik Hasar' },
    fire_t5: { id: 'fire_t5', type: 'fire', name: 'Ateş Lordu Taşı', tier: 5, icon: '🔥', color: '#7f1d1d', stats: { elementalDamage: { type: 'fire', value: 75 }, attack: 20, critDamage: 10, attackSpeed: 5 }, description: '+75 Ateş Hasarı, +20 Saldırı, +%10 Kritik Hasar, +%5 Saldırı Hızı' },

    // Buz Taşları
    ice_t1: { id: 'ice_t1', type: 'ice', name: 'Kar Taşı', tier: 1, icon: '❄️', color: '#38bdf8', stats: { elementalDamage: { type: 'ice', value: 5 } }, description: '+5 Buz Hasarı' },
    ice_t2: { id: 'ice_t2', type: 'ice', name: 'Buz Taşı', tier: 2, icon: '❄️', color: '#0ea5e9', stats: { elementalDamage: { type: 'ice', value: 12 } }, description: '+12 Buz Hasarı' },
    ice_t3: { id: 'ice_t3', type: 'ice', name: 'Buzul Taşı', tier: 3, icon: '❄️', color: '#0284c7', stats: { elementalDamage: { type: 'ice', value: 25 }, defense: 5 }, description: '+25 Buz Hasarı, +5 Savunma' },
    ice_t4: { id: 'ice_t4', type: 'ice', name: 'Dondurucu Taş', tier: 4, icon: '❄️', color: '#0369a1', stats: { elementalDamage: { type: 'ice', value: 45 }, defense: 10, hp: 50 }, description: '+45 Buz Hasarı, +10 Savunma, +50 HP' },
    ice_t5: { id: 'ice_t5', type: 'ice', name: 'Sonsuz Kış Taşı', tier: 5, icon: '❄️', color: '#075985', stats: { elementalDamage: { type: 'ice', value: 75 }, defense: 20, hp: 100, elementalResist: { type: 'fire', value: 15 } }, description: '+75 Buz Hasarı, +20 Savunma, +100 HP, +%15 Ateş Direnci' },

    // Kritik Taşları
    crit_t1: { id: 'crit_t1', type: 'crit', name: 'Keskin Taş', tier: 1, icon: '💎', color: '#f97316', stats: { critChance: 2 }, description: '+%2 Kritik Şansı' },
    crit_t2: { id: 'crit_t2', type: 'crit', name: 'Hassas Taş', tier: 2, icon: '💎', color: '#ea580c', stats: { critChance: 4 }, description: '+%4 Kritik Şansı' },
    crit_t3: { id: 'crit_t3', type: 'crit', name: 'Ölümcül Taş', tier: 3, icon: '💎', color: '#c2410c', stats: { critChance: 6, critDamage: 10 }, description: '+%6 Kritik Şansı, +%10 Kritik Hasar' },
    crit_t4: { id: 'crit_t4', type: 'crit', name: 'İnfaz Taşı', tier: 4, icon: '💎', color: '#9a3412', stats: { critChance: 8, critDamage: 20 }, description: '+%8 Kritik Şansı, +%20 Kritik Hasar' },
    crit_t5: { id: 'crit_t5', type: 'crit', name: 'Yıkıcı Taş', tier: 5, icon: '💎', color: '#7c2d12', stats: { critChance: 12, critDamage: 35, attack: 15 }, description: '+%12 Kritik Şansı, +%35 Kritik Hasar, +15 Saldırı' },

    // Yaşam Taşları
    life_t1: { id: 'life_t1', type: 'life', name: 'Canlılık Taşı', tier: 1, icon: '❤️', color: '#22c55e', stats: { hp: 25 }, description: '+25 HP' },
    life_t2: { id: 'life_t2', type: 'life', name: 'Sağlık Taşı', tier: 2, icon: '❤️', color: '#16a34a', stats: { hp: 50 }, description: '+50 HP' },
    life_t3: { id: 'life_t3', type: 'life', name: 'Güç Taşı', tier: 3, icon: '❤️', color: '#15803d', stats: { hp: 100, defense: 5 }, description: '+100 HP, +5 Savunma' },
    life_t4: { id: 'life_t4', type: 'life', name: 'Dayanıklılık Taşı', tier: 4, icon: '❤️', color: '#166534', stats: { hp: 175, defense: 10 }, description: '+175 HP, +10 Savunma' },
    life_t5: { id: 'life_t5', type: 'life', name: 'Ölümsüzlük Taşı', tier: 5, icon: '❤️', color: '#14532d', stats: { hp: 300, defense: 20, mana: 50 }, description: '+300 HP, +20 Savunma, +50 Mana' },
};

// Item tier'ına göre soket sayısı
export function getMaxSockets(itemTier: number): number {
    if (itemTier < 3) return 0; // T1-T2 soket yok
    if (itemTier === 3) return 1;
    if (itemTier === 4) return 2;
    if (itemTier >= 5) return 3;
    return 0;
}

// Soket açma maliyeti
export function getSocketOpenCost(socketIndex: number): { gold: number; scrolls: number } {
    return {
        gold: (socketIndex + 1) * 5000,
        scrolls: socketIndex + 1, // Rün Yuvası Açma Parşömeni
    };
}

// Gem takma
export function socketGem(item: SocketedItem, socketIndex: number, gem: Gem): SocketedItem {
    if (socketIndex >= item.maxSockets || socketIndex >= item.sockets.length) {
        throw new Error('Geçersiz soket indeksi');
    }

    const newSockets = [...item.sockets];
    newSockets[socketIndex] = gem;

    return {
        ...item,
        sockets: newSockets,
    };
}

// Gem çıkarma (gem kaybolur veya özel item gerekir)
export function removeGem(item: SocketedItem, socketIndex: number): { item: SocketedItem; gem: Gem | null } {
    if (socketIndex >= item.sockets.length) {
        throw new Error('Geçersiz soket indeksi');
    }

    const removedGem = item.sockets[socketIndex];
    const newSockets = [...item.sockets];
    newSockets[socketIndex] = null;

    return {
        item: { ...item, sockets: newSockets },
        gem: removedGem,
    };
}

// Toplam gem statlarını hesapla
export function calculateGemStats(item: SocketedItem): GemStats {
    const totalStats: GemStats = {};

    item.sockets.forEach(gem => {
        if (!gem) return;

        Object.entries(gem.stats).forEach(([key, value]) => {
            if (key === 'elementalDamage' || key === 'elementalResist') {
                // Elemental statlar ayrı tutulur
                return;
            }
            (totalStats as any)[key] = ((totalStats as any)[key] || 0) + (value as number);
        });
    });

    return totalStats;
}

// Item'ı socketed item'a dönüştür
export function createSocketedItem(item: Equipment): SocketedItem {
    const maxSockets = getMaxSockets(item.tier || 1);
    return {
        ...item,
        sockets: new Array(maxSockets).fill(null),
        maxSockets,
    };
}
