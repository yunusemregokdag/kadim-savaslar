// ═══════════════════════════════════════════════════════════════════════════
// BOSS PHASE CONTROLLER - Kadim Savaşlar
// Boss faz geçişleri ve görsel geri bildirim sistemi
// ═══════════════════════════════════════════════════════════════════════════

import { BossPhaseNumber, BossPhaseConfig, EntityId } from './types';

// ═══════════════════════════════════════════════════════════════════════════
// BOSS PHASE EVENT
// ═══════════════════════════════════════════════════════════════════════════
export interface BossPhaseEvent {
    bossId: EntityId;
    phase: BossPhaseNumber;
    hpPercent: number;
    config: BossPhaseConfig;
}

// Custom event type
declare global {
    interface DocumentEventMap {
        'bossPhase': CustomEvent<BossPhaseEvent>;
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// DEFAULT PHASE CONFIGS
// ═══════════════════════════════════════════════════════════════════════════
export const DEFAULT_BOSS_PHASES: BossPhaseConfig[] = [
    {
        phase: 1,
        hpThreshold: 100,
        auraColor: '#4488ff',
        screenShake: false
    },
    {
        phase: 2,
        hpThreshold: 60,
        auraColor: '#ff8800',
        screenShake: true,
        soundEffect: 'boss_phase_2'
    },
    {
        phase: 3,
        hpThreshold: 30,
        auraColor: '#ff0000',
        screenShake: true,
        soundEffect: 'boss_enrage'
    }
];

// ═══════════════════════════════════════════════════════════════════════════
// BOSS PHASE CONTROLLER CLASS
// ═══════════════════════════════════════════════════════════════════════════
export class BossPhaseController {
    private bossId: EntityId;
    private currentPhase: BossPhaseNumber = 1;
    private phases: BossPhaseConfig[];
    private phaseTriggered: Set<BossPhaseNumber> = new Set([1]);

    constructor(bossId: EntityId, customPhases?: BossPhaseConfig[]) {
        this.bossId = bossId;
        this.phases = customPhases || DEFAULT_BOSS_PHASES;
    }

    /**
     * HP yüzdesine göre faz güncelle
     */
    update(currentHp: number, maxHp: number): void {
        const hpPercent = (currentHp / maxHp) * 100;

        // Fazları kontrol et (yüksekten düşüğe)
        for (let i = this.phases.length - 1; i >= 0; i--) {
            const phase = this.phases[i];

            if (hpPercent <= phase.hpThreshold && !this.phaseTriggered.has(phase.phase)) {
                this.setPhase(phase.phase, hpPercent);
                break;
            }
        }
    }

    /**
     * Faz değiştir ve event gönder
     */
    private setPhase(newPhase: BossPhaseNumber, hpPercent: number): void {
        if (this.currentPhase === newPhase) return;

        const oldPhase = this.currentPhase;
        this.currentPhase = newPhase;
        this.phaseTriggered.add(newPhase);

        const config = this.phases.find(p => p.phase === newPhase);
        if (!config) return;

        console.log(`[BossPhase] ${this.bossId}: Phase ${oldPhase} → ${newPhase} (HP: ${hpPercent.toFixed(1)}%)`);

        // Custom Event dispatch
        const event = new CustomEvent<BossPhaseEvent>('bossPhase', {
            detail: {
                bossId: this.bossId,
                phase: newPhase,
                hpPercent,
                config
            }
        });

        document.dispatchEvent(event);
    }

    /**
     * Mevcut fazı al
     */
    getPhase(): BossPhaseNumber {
        return this.currentPhase;
    }

    /**
     * Mevcut faz config'ini al
     */
    getPhaseConfig(): BossPhaseConfig | undefined {
        return this.phases.find(p => p.phase === this.currentPhase);
    }

    /**
     * Faz çarpanını al (hasar/hız için)
     */
    getPhaseMultiplier(): number {
        switch (this.currentPhase) {
            case 3: return 1.5;  // Enrage
            case 2: return 1.25;
            default: return 1;
        }
    }

    /**
     * Reset (boss respawn için)
     */
    reset(): void {
        this.currentPhase = 1;
        this.phaseTriggered = new Set([1]);
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// BOSS PHASE MANAGER (Birden fazla boss için)
// ═══════════════════════════════════════════════════════════════════════════
class BossPhaseManagerClass {
    private controllers = new Map<EntityId, BossPhaseController>();

    /**
     * Boss için controller oluştur
     */
    create(bossId: EntityId, customPhases?: BossPhaseConfig[]): BossPhaseController {
        const controller = new BossPhaseController(bossId, customPhases);
        this.controllers.set(bossId, controller);
        return controller;
    }

    /**
     * Controller'ı al
     */
    get(bossId: EntityId): BossPhaseController | undefined {
        return this.controllers.get(bossId);
    }

    /**
     * Controller'ı sil
     */
    remove(bossId: EntityId): void {
        this.controllers.delete(bossId);
    }

    /**
     * Tüm controller'ları temizle
     */
    clear(): void {
        this.controllers.clear();
    }
}

// Singleton export
export const BossPhaseManager = new BossPhaseManagerClass();

export default BossPhaseController;
