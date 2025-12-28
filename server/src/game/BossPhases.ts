
export type BossPhaseMechanic = 'spawn_adds' | 'lava_floor' | 'enrage' | 'shield' | 'storm';

export interface BossPhase {
    thresholdPct: number; // 0.0 to 1.0 (e.g. 0.75 for 75%)
    mechanic: BossPhaseMechanic;
    announcement: string;
    damageMultiplier?: number;
    attackSpeedMultiplier?: number;
}

export const BOSS_PHASE_CONFIGS: Record<string, BossPhase[]> = {
    'dragon_lord': [
        {
            thresholdPct: 0.75,
            mechanic: 'lava_floor',
            announcement: 'The Dragon Lord engulfs the floor in lava!',
            damageMultiplier: 1.1
        },
        {
            thresholdPct: 0.50,
            mechanic: 'spawn_adds',
            announcement: 'Minions rise from the ashes!',
            attackSpeedMultiplier: 1.2
        },
        {
            thresholdPct: 0.25,
            mechanic: 'shield',
            announcement: 'The Dragon Lord shields himself!',
        },
        {
            thresholdPct: 0.10,
            mechanic: 'enrage',
            announcement: 'The Dragon Lord goes BERSERK!',
            damageMultiplier: 2.5,
            attackSpeedMultiplier: 2.0
        }
    ]
};
