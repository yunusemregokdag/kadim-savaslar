// ============================================
// OZAN (BARD) AURA SİSTEMİ
// Takım arkadaşlarına pasif buff aurası
// ============================================

import { CharacterClass, ItemStats } from '../types';

// Aura Tipi
export type AuraType = 'attack' | 'defense' | 'speed' | 'regen' | 'crit' | 'mana';

// Aura Tanımı
export interface BardAura {
    id: string;
    name: string;
    description: string;
    type: AuraType;
    radius: number; // Metre cinsinden etki alanı
    statModifiers: Partial<ItemStats>;
    scalingPerTier: number; // Enstrüman tier'ına göre artış %
    icon: string;
    color: string;
    particleEffect: string;
}

// Enstrüman Tier Bonusları
export interface InstrumentTierBonus {
    tier: number;
    auraRadiusBonus: number;
    auraEffectBonus: number; // % olarak
    specialEffect?: string;
}

// Ritim Oyunu Sonucu
export interface RhythmGameResult {
    score: number;        // 0-100 arası
    perfectHits: number;
    goodHits: number;
    missedHits: number;
    combo: number;
    bonusMultiplier: number; // 1.0 - 1.5 arası
}

// ============================================
// OZAN AURALARI
// ============================================
export const BARD_AURAS: BardAura[] = [
    {
        id: 'aura_war_march',
        name: 'Savaş Marşı',
        description: 'Yakındaki dostların saldırı gücü artar',
        type: 'attack',
        radius: 10,
        statModifiers: { damage: 10 },
        scalingPerTier: 2, // Her tier +%2 daha fazla
        icon: '⚔️',
        color: '#ff4444',
        particleEffect: 'red_notes'
    },
    {
        id: 'aura_iron_hymn',
        name: 'Demir İlahisi',
        description: 'Yakındaki dostların savunması artar',
        type: 'defense',
        radius: 10,
        statModifiers: { defense: 15 },
        scalingPerTier: 3,
        icon: '🛡️',
        color: '#4444ff',
        particleEffect: 'blue_notes'
    },
    {
        id: 'aura_swift_tempo',
        name: 'Hızlı Tempo',
        description: 'Yakındaki dostların saldırı hızı artar',
        type: 'speed',
        radius: 8,
        statModifiers: { attackSpeed: 10 },
        scalingPerTier: 2,
        icon: '⚡',
        color: '#ffff00',
        particleEffect: 'yellow_notes'
    },
    {
        id: 'aura_healing_melody',
        name: 'Şifalı Melodi',
        description: 'Yakındaki dostlar yavaşça HP yeniler',
        type: 'regen',
        radius: 12,
        statModifiers: { hp: 5 }, // Saniyede
        scalingPerTier: 1,
        icon: '💚',
        color: '#00ff00',
        particleEffect: 'green_notes'
    },
    {
        id: 'aura_fortune_song',
        name: 'Şans Şarkısı',
        description: 'Yakındaki dostların kritik şansı artar',
        type: 'crit',
        radius: 10,
        statModifiers: { critChance: 5 },
        scalingPerTier: 1,
        icon: '🎲',
        color: '#ff00ff',
        particleEffect: 'purple_notes'
    },
    {
        id: 'aura_mana_flow',
        name: 'Mana Akışı',
        description: 'Yakındaki dostlar mana yeniler',
        type: 'mana',
        radius: 10,
        statModifiers: { mana: 3 }, // Saniyede
        scalingPerTier: 1,
        icon: '💧',
        color: '#00aaff',
        particleEffect: 'cyan_notes'
    }
];

// ============================================
// ENSTRÜMAN TİER BONUSLARI
// ============================================
export const INSTRUMENT_TIER_BONUSES: InstrumentTierBonus[] = [
    {
        tier: 1,
        auraRadiusBonus: 0,
        auraEffectBonus: 0,
        specialEffect: undefined
    },
    {
        tier: 2,
        auraRadiusBonus: 1, // +1 metre
        auraEffectBonus: 5, // %5 daha güçlü
        specialEffect: undefined
    },
    {
        tier: 3,
        auraRadiusBonus: 2,
        auraEffectBonus: 12,
        specialEffect: 'Aura rengi hafifçe parlar'
    },
    {
        tier: 4,
        auraRadiusBonus: 4,
        auraEffectBonus: 20,
        specialEffect: 'Notalar görünür şekilde uçuşur'
    },
    {
        tier: 5,
        auraRadiusBonus: 6,
        auraEffectBonus: 30,
        specialEffect: 'Hareket ederken zemine müzik çizgileri (porteler) oluşur'
    }
];

// ============================================
// RİTİM OYUNU
// ============================================
export interface RhythmNote {
    id: string;
    timing: number; // ms cinsinden
    lane: 0 | 1 | 2 | 3; // 4 şeritli
    type: 'tap' | 'hold' | 'slide';
    duration?: number; // hold için
}

export interface RhythmSong {
    id: string;
    name: string;
    difficulty: 'easy' | 'medium' | 'hard' | 'expert';
    bpm: number;
    duration: number; // saniye
    notes: RhythmNote[];
    auraBonus: AuraType;
    bonusAmount: number; // Başarılı tamamlamada ekstra bonus
}

export const RHYTHM_SONGS: RhythmSong[] = [
    {
        id: 'song_battle_hymn',
        name: 'Savaş İlahisi',
        difficulty: 'easy',
        bpm: 100,
        duration: 30,
        notes: generateRhythmNotes(100, 30, 'easy'),
        auraBonus: 'attack',
        bonusAmount: 20
    },
    {
        id: 'song_iron_march',
        name: 'Demir Marşı',
        difficulty: 'medium',
        bpm: 120,
        duration: 45,
        notes: generateRhythmNotes(120, 45, 'medium'),
        auraBonus: 'defense',
        bonusAmount: 25
    },
    {
        id: 'song_wind_dance',
        name: 'Rüzgar Dansı',
        difficulty: 'hard',
        bpm: 140,
        duration: 60,
        notes: generateRhythmNotes(140, 60, 'hard'),
        auraBonus: 'speed',
        bonusAmount: 30
    },
    {
        id: 'song_ancient_melody',
        name: 'Kadim Melodi',
        difficulty: 'expert',
        bpm: 160,
        duration: 90,
        notes: generateRhythmNotes(160, 90, 'expert'),
        auraBonus: 'crit',
        bonusAmount: 40
    }
];

// Ritim notaları oluşturma
function generateRhythmNotes(bpm: number, duration: number, difficulty: string): RhythmNote[] {
    const notes: RhythmNote[] = [];
    const beatInterval = 60000 / bpm; // ms
    const totalBeats = Math.floor((duration * 1000) / beatInterval);

    // Zorluk bazlı nota yoğunluğu
    const noteDensity = {
        easy: 0.3,
        medium: 0.5,
        hard: 0.7,
        expert: 0.9
    }[difficulty] || 0.5;

    for (let i = 0; i < totalBeats; i++) {
        if (Math.random() < noteDensity) {
            notes.push({
                id: `note_${i}`,
                timing: i * beatInterval,
                lane: Math.floor(Math.random() * 4) as 0 | 1 | 2 | 3,
                type: Math.random() < 0.8 ? 'tap' : 'hold',
                duration: Math.random() < 0.2 ? beatInterval * 2 : undefined
            });
        }
    }

    return notes;
}

// ============================================
// AURA YÖNETİCİSİ
// ============================================
export interface AuraState {
    activeAura: BardAura | null;
    instrumentTier: number;
    rhythmBonusMultiplier: number;
    rhythmBonusExpiry: number;
    affectedAllies: string[]; // Player IDs
}

export class BardAuraManager {
    private state: AuraState;

    constructor() {
        this.state = this.loadState();
    }

    private loadState(): AuraState {
        const saved = localStorage.getItem('kadim_bard_aura');
        if (saved) {
            return JSON.parse(saved);
        }
        return {
            activeAura: null,
            instrumentTier: 1,
            rhythmBonusMultiplier: 1.0,
            rhythmBonusExpiry: 0,
            affectedAllies: []
        };
    }

    private saveState(): void {
        localStorage.setItem('kadim_bard_aura', JSON.stringify(this.state));
    }

    // Aura aktifleştir
    activateAura(auraId: string): boolean {
        const aura = BARD_AURAS.find(a => a.id === auraId);
        if (!aura) return false;

        this.state.activeAura = aura;
        this.saveState();
        return true;
    }

    // Aura deaktifleştir
    deactivateAura(): void {
        this.state.activeAura = null;
        this.saveState();
    }

    // Enstrüman tier'ını güncelle
    setInstrumentTier(tier: number): void {
        this.state.instrumentTier = Math.max(1, Math.min(5, tier));
        this.saveState();
    }

    // Efektif aura yarıçapını hesapla
    getEffectiveRadius(): number {
        if (!this.state.activeAura) return 0;

        const baseRadius = this.state.activeAura.radius;
        const tierBonus = INSTRUMENT_TIER_BONUSES[this.state.instrumentTier - 1]?.auraRadiusBonus || 0;

        return baseRadius + tierBonus;
    }

    // Efektif stat bonuslarını hesapla
    getEffectiveStats(): Partial<ItemStats> {
        if (!this.state.activeAura) return {};

        const aura = this.state.activeAura;
        const tierBonus = INSTRUMENT_TIER_BONUSES[this.state.instrumentTier - 1];
        const effectMultiplier = 1 + (tierBonus?.auraEffectBonus || 0) / 100;

        // Ritim bonus çarpanı
        const rhythmMultiplier = Date.now() < this.state.rhythmBonusExpiry
            ? this.state.rhythmBonusMultiplier
            : 1.0;

        const result: Partial<ItemStats> = {};

        Object.entries(aura.statModifiers).forEach(([stat, value]) => {
            const key = stat as keyof ItemStats;
            result[key] = Math.floor((value || 0) * effectMultiplier * rhythmMultiplier);
        });

        return result;
    }

    // Ritim oyunu sonucunu uygula
    applyRhythmBonus(result: RhythmGameResult, song: RhythmSong): void {
        // Skor bazlı bonus hesaplama
        let multiplier = 1.0;

        if (result.score >= 95) {
            multiplier = 1.5; // S Rank
        } else if (result.score >= 85) {
            multiplier = 1.35; // A Rank
        } else if (result.score >= 70) {
            multiplier = 1.2; // B Rank
        } else if (result.score >= 50) {
            multiplier = 1.1; // C Rank
        }

        this.state.rhythmBonusMultiplier = multiplier;
        this.state.rhythmBonusExpiry = Date.now() + (5 * 60 * 1000); // 5 dakika
        this.saveState();
    }

    // Hasar alındığında aura geçici olarak kesilir
    onDamageTaken(): void {
        // Aura 3 saniyeliğine devre dışı (oyun mantığında işlenmeli)
        // Bu method sadece event trigger için
    }

    // Aktif aura'yı getir
    getActiveAura(): BardAura | null {
        return this.state.activeAura;
    }

    // Mevcut durumu getir
    getState(): AuraState {
        return this.state;
    }

    // Tüm auraları getir
    getAllAuras(): BardAura[] {
        return BARD_AURAS;
    }

    // Tier bonusunu getir
    getTierBonus(): InstrumentTierBonus {
        return INSTRUMENT_TIER_BONUSES[this.state.instrumentTier - 1] || INSTRUMENT_TIER_BONUSES[0];
    }
}

// Singleton instance
export const bardAuraManager = new BardAuraManager();

// ============================================
// RİTİM OYUNU SKORLAMA
// ============================================
export function calculateRhythmScore(
    hitTimings: { noteId: string; timing: number; actualTiming: number }[],
    song: RhythmSong
): RhythmGameResult {
    let perfectHits = 0;
    let goodHits = 0;
    let missedHits = 0;
    let currentCombo = 0;
    let maxCombo = 0;

    const perfectWindow = 50; // ms
    const goodWindow = 100; // ms

    hitTimings.forEach(hit => {
        const difference = Math.abs(hit.timing - hit.actualTiming);

        if (difference <= perfectWindow) {
            perfectHits++;
            currentCombo++;
        } else if (difference <= goodWindow) {
            goodHits++;
            currentCombo++;
        } else {
            missedHits++;
            maxCombo = Math.max(maxCombo, currentCombo);
            currentCombo = 0;
        }
    });

    maxCombo = Math.max(maxCombo, currentCombo);

    const totalNotes = song.notes.length;
    const hitNotes = perfectHits + goodHits;
    const accuracy = totalNotes > 0 ? (hitNotes / totalNotes) * 100 : 0;

    // Skor hesaplama
    const perfectScore = perfectHits * 100;
    const goodScore = goodHits * 50;
    const comboBonus = maxCombo * 10;
    const score = Math.min(100, Math.floor((perfectScore + goodScore + comboBonus) / totalNotes));

    // Bonus çarpan
    let bonusMultiplier = 1.0;
    if (score >= 95) bonusMultiplier = 1.5;
    else if (score >= 85) bonusMultiplier = 1.35;
    else if (score >= 70) bonusMultiplier = 1.2;
    else if (score >= 50) bonusMultiplier = 1.1;

    return {
        score,
        perfectHits,
        goodHits,
        missedHits,
        combo: maxCombo,
        bonusMultiplier
    };
}
