// ═══════════════════════════════════════════════════════════════════════════
// GAME SYSTEMS - Kadim Savaşlar
// PVP/PVE, Cooldown, Status Effects, Combat Log, Damage Calculation
// ═══════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════
// 1️⃣ GLOBAL GAME MODE
// ═══════════════════════════════════════════════════════════════════════════
export type GameModeType = 'PVE' | 'PVP';

export const GameMode = {
    current: 'PVE' as GameModeType,

    setPVP() {
        this.current = 'PVP';
    },

    setPVE() {
        this.current = 'PVE';
    },

    isPVP(): boolean {
        return this.current === 'PVP';
    },

    isPVE(): boolean {
        return this.current === 'PVE';
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// 2️⃣ COOLDOWN MANAGER (Class-based)
// ═══════════════════════════════════════════════════════════════════════════
export class CooldownManager {
    private cooldowns: Record<string, number> = {};

    /**
     * Skill kullanılabilir mi kontrol et
     */
    canUse(skillId: string): boolean {
        const cdEnd = this.cooldowns[skillId];
        if (!cdEnd) return true;
        return performance.now() > cdEnd;
    }

    /**
     * Skill'i kullan ve cooldown başlat
     * @param skillId - Skill ID
     * @param cooldownMs - Cooldown süresi (ms)
     */
    use(skillId: string, cooldownMs: number): void {
        this.cooldowns[skillId] = performance.now() + cooldownMs;
    }

    /**
     * Kalan cooldown süresini al (ms)
     */
    getRemaining(skillId: string): number {
        const cdEnd = this.cooldowns[skillId];
        if (!cdEnd) return 0;
        return Math.max(0, cdEnd - performance.now());
    }

    /**
     * Cooldown yüzdesini al (0-1 arası, UI için)
     */
    getRatio(skillId: string, totalCooldownMs: number): number {
        const remaining = this.getRemaining(skillId);
        return remaining / totalCooldownMs;
    }

    /**
     * Tüm cooldown'ları sıfırla
     */
    resetAll(): void {
        this.cooldowns = {};
    }

    /**
     * Belirli bir skill'in cooldown'ını sıfırla
     */
    reset(skillId: string): void {
        delete this.cooldowns[skillId];
    }

    /**
     * Cooldown süresini azalt (buff efekti için)
     */
    reduceCooldown(skillId: string, reductionMs: number): void {
        if (this.cooldowns[skillId]) {
            this.cooldowns[skillId] -= reductionMs;
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// 3️⃣ STATUS EFFECT MANAGER (Buff/Debuff)
// ═══════════════════════════════════════════════════════════════════════════
export type StatusType =
    | 'burn'       // Yanma (DoT)
    | 'poison'     // Zehir (DoT)
    | 'freeze'     // Donma (Slow + Hasar)
    | 'stun'       // Sersemletme (Hareket yok)
    | 'silence'    // Susturma (Skill yok)
    | 'slow'       // Yavaşlatma
    | 'bleed'      // Kanama (DoT)
    | 'shield'     // Kalkan (Buff)
    | 'haste'      // Hız artışı (Buff)
    | 'strength'   // Güç artışı (Buff)
    | 'regen'      // Can yenileme (Buff)
    | 'invulnerable'; // Dokunulmazlık

export interface StatusEffect {
    type: StatusType;
    duration: number;      // Toplam süre (ms)
    startTime: number;     // Başlama zamanı
    tickDamage?: number;   // Her tick'te verilen hasar (DoT için)
    tickInterval?: number; // Tick aralığı (ms)
    lastTick?: number;     // Son tick zamanı
    value?: number;        // Efekt değeri (slow %, strength bonus vb.)
    source?: string;       // Efekti veren (player id)
}

export class StatusManager {
    private effects: StatusEffect[] = [];

    /**
     * Yeni status effect ekle
     */
    add(type: StatusType, duration: number, options?: {
        tickDamage?: number;
        tickInterval?: number;
        value?: number;
        source?: string;
    }): void {
        // Aynı tip varsa süreyi yenile
        const existing = this.effects.find(e => e.type === type);
        if (existing) {
            existing.startTime = performance.now();
            existing.duration = duration;
            return;
        }

        this.effects.push({
            type,
            duration,
            startTime: performance.now(),
            tickDamage: options?.tickDamage || 0,
            tickInterval: options?.tickInterval || 1000,
            lastTick: performance.now(),
            value: options?.value || 0,
            source: options?.source
        });
    }

    /**
     * Status effect kaldır
     */
    remove(type: StatusType): void {
        this.effects = this.effects.filter(e => e.type !== type);
    }

    /**
     * Belirli bir effect var mı?
     */
    has(type: StatusType): boolean {
        return this.effects.some(e => e.type === type);
    }

    /**
     * Effect değerini al
     */
    getValue(type: StatusType): number {
        const effect = this.effects.find(e => e.type === type);
        return effect?.value || 0;
    }

    /**
     * Hareket edebilir mi?
     */
    canMove(): boolean {
        return !this.has('stun') && !this.has('freeze');
    }

    /**
     * Skill kullanabilir mi?
     */
    canCast(): boolean {
        return !this.has('stun') && !this.has('silence');
    }

    /**
     * Toplam slow yüzdesini hesapla
     */
    getSlowPercent(): number {
        let totalSlow = 0;
        if (this.has('slow')) totalSlow += this.getValue('slow');
        if (this.has('freeze')) totalSlow += 50; // Freeze %50 slow
        return Math.min(90, totalSlow); // Max %90 slow
    }

    /**
     * Her frame'de çağrılacak update
     * @returns Tick damage (varsa)
     */
    update(dt: number): number {
        const now = performance.now();
        let tickDamage = 0;

        this.effects = this.effects.filter(effect => {
            // Süre doldu mu?
            if (now - effect.startTime > effect.duration) {
                return false;
            }

            // DoT tick
            if (effect.tickDamage && effect.tickDamage > 0) {
                if (now - (effect.lastTick || 0) >= (effect.tickInterval || 1000)) {
                    tickDamage += effect.tickDamage;
                    effect.lastTick = now;
                }
            }

            return true;
        });

        return tickDamage;
    }

    /**
     * Tüm effect'leri temizle
     */
    clear(): void {
        this.effects = [];
    }

    /**
     * Aktif effect listesi
     */
    getActiveEffects(): StatusEffect[] {
        return [...this.effects];
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// 4️⃣ COMBAT LOG (Replay & Analytics)
// ═══════════════════════════════════════════════════════════════════════════
export interface CombatLogEntry {
    timestamp: number;
    attackerId: string;
    attackerName: string;
    targetId: string;
    targetName: string;
    skillId?: string;
    skillName?: string;
    damage: number;
    isCritical: boolean;
    damageType: 'physical' | 'magical' | 'true';
}

class CombatLogSystem {
    private logs: CombatLogEntry[] = [];
    private maxLogs: number = 1000;

    /**
     * Hasar kaydı ekle
     */
    log(entry: Omit<CombatLogEntry, 'timestamp'>): void {
        this.logs.push({
            ...entry,
            timestamp: performance.now()
        });

        // Max log sayısını aşarsa eski kayıtları sil
        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(-this.maxLogs);
        }
    }

    /**
     * Son N kaydı al
     */
    getLast(count: number = 10): CombatLogEntry[] {
        return this.logs.slice(-count);
    }

    /**
     * Belirli bir oyuncunun verdiği toplam hasarı hesapla
     */
    getTotalDamageBy(playerId: string): number {
        return this.logs
            .filter(l => l.attackerId === playerId)
            .reduce((sum, l) => sum + l.damage, 0);
    }

    /**
     * Belirli bir oyuncunun aldığı toplam hasarı hesapla
     */
    getTotalDamageTaken(playerId: string): number {
        return this.logs
            .filter(l => l.targetId === playerId)
            .reduce((sum, l) => sum + l.damage, 0);
    }

    /**
     * DPS hesapla (son X saniye)
     */
    getDPS(playerId: string, lastSeconds: number = 10): number {
        const now = performance.now();
        const threshold = now - (lastSeconds * 1000);

        const recentDamage = this.logs
            .filter(l => l.attackerId === playerId && l.timestamp > threshold)
            .reduce((sum, l) => sum + l.damage, 0);

        return recentDamage / lastSeconds;
    }

    /**
     * Logu temizle
     */
    clear(): void {
        this.logs = [];
    }

    /**
     * Replay için tüm logu al
     */
    getFullLog(): CombatLogEntry[] {
        return [...this.logs];
    }

    /**
     * Console'a yazdır (debug)
     */
    printReplay(): void {
        console.log('=== COMBAT REPLAY ===');
        this.logs.forEach(entry => {
            const time = (entry.timestamp / 1000).toFixed(1);
            const crit = entry.isCritical ? ' 💥CRIT' : '';
            console.log(`[${time}s] ${entry.attackerName} → ${entry.targetName}: ${entry.damage} dmg (${entry.skillName || 'auto'})${crit}`);
        });
        console.log('=====================');
    }
}

// Singleton export
export const CombatLog = new CombatLogSystem();

// ═══════════════════════════════════════════════════════════════════════════
// 5️⃣ DAMAGE CALCULATOR (PVP/PVE Modifier)
// ═══════════════════════════════════════════════════════════════════════════
export interface DamageContext {
    baseDamage: number;
    attackerPower: number;
    attackerLevel: number;
    targetDefense?: number;
    targetLevel?: number;
    isBoss?: boolean;
    isPvP?: boolean;
    skillMultiplier?: number;
    critChance?: number;
    critMultiplier?: number;
}

export interface DamageResult {
    finalDamage: number;
    isCritical: boolean;
    breakdown: {
        base: number;
        scaled: number;
        afterDefense: number;
        afterModifiers: number;
    };
}

export function calculateDamage(ctx: DamageContext): DamageResult {
    // 1. Base scaling (power stat)
    const scaled = ctx.baseDamage * (1 + ctx.attackerPower * 0.1);

    // 2. Defense reduction (eğer varsa)
    const defenseReduction = ctx.targetDefense
        ? Math.max(0.2, 1 - (ctx.targetDefense / (ctx.targetDefense + 100)))
        : 1;
    const afterDefense = scaled * defenseReduction;

    // 3. Level difference modifier
    const levelDiff = (ctx.attackerLevel || 1) - (ctx.targetLevel || 1);
    const levelMod = 1 + (levelDiff * 0.02); // Her level farkı için %2

    // 4. Skill multiplier
    const skillMod = ctx.skillMultiplier || 1;

    // 5. Game mode modifier
    const pvpMod = (ctx.isPvP ?? GameMode.isPVP()) ? 0.6 : 1; // PVP'de %40 hasar azaltma

    // 6. Boss modifier
    const bossMod = ctx.isBoss ? 0.75 : 1; // Boss'a %25 daha az hasar

    // 7. Critical hit check
    const critChance = ctx.critChance || 0.1; // Default %10
    const isCritical = Math.random() < critChance;
    const critMod = isCritical ? (ctx.critMultiplier || 2) : 1;

    // Final calculation
    const afterModifiers = afterDefense * levelMod * skillMod * pvpMod * bossMod * critMod;
    const finalDamage = Math.max(1, Math.floor(afterModifiers)); // Minimum 1 hasar

    return {
        finalDamage,
        isCritical,
        breakdown: {
            base: ctx.baseDamage,
            scaled,
            afterDefense,
            afterModifiers
        }
    };
}

// ═══════════════════════════════════════════════════════════════════════════
// 6️⃣ SKILL TREE MULTIPLIER
// ═══════════════════════════════════════════════════════════════════════════
export function getSkillMultiplier(
    skillTree: Record<string, number> | undefined,
    skillId: string
): number {
    if (!skillTree) return 1;
    const level = skillTree[skillId] || 0;
    return 1 + (level * 0.1); // Her seviye %10 bonus
}

// ═══════════════════════════════════════════════════════════════════════════
// 7️⃣ BOSS PHASE MULTIPLIER
// ═══════════════════════════════════════════════════════════════════════════
export function getBossPhaseMultiplier(currentHp: number, maxHp: number): number {
    const ratio = currentHp / maxHp;
    if (ratio < 0.2) return 1.5;  // %20'nin altında - Enrage
    if (ratio < 0.4) return 1.3;  // %40'ın altında
    if (ratio < 0.6) return 1.15; // %60'ın altında
    return 1;
}

// ═══════════════════════════════════════════════════════════════════════════
// 8️⃣ PVP RANK SYSTEM
// ═══════════════════════════════════════════════════════════════════════════
export type RankTier =
    | 'Bronze'
    | 'Silver'
    | 'Gold'
    | 'Platinum'
    | 'Diamond'
    | 'Master'
    | 'Grandmaster'
    | 'Legend';

export function calculateRankTier(rankPoints: number): RankTier {
    if (rankPoints >= 5000) return 'Legend';
    if (rankPoints >= 4000) return 'Grandmaster';
    if (rankPoints >= 3000) return 'Master';
    if (rankPoints >= 2000) return 'Diamond';
    if (rankPoints >= 1500) return 'Platinum';
    if (rankPoints >= 1000) return 'Gold';
    if (rankPoints >= 500) return 'Silver';
    return 'Bronze';
}

export function updateRankPoints(
    currentPoints: number,
    won: boolean,
    enemyRankPoints?: number
): number {
    // Elo-like sistem
    const baseChange = won ? 25 : -15;

    // Rakip puan farkına göre ayarlama
    if (enemyRankPoints) {
        const diff = enemyRankPoints - currentPoints;
        const modifier = Math.floor(diff / 100) * 5;
        return currentPoints + baseChange + modifier;
    }

    return Math.max(0, currentPoints + baseChange);
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT ALL
// ═══════════════════════════════════════════════════════════════════════════
export default {
    GameMode,
    CooldownManager,
    StatusManager,
    CombatLog,
    calculateDamage,
    getSkillMultiplier,
    getBossPhaseMultiplier,
    calculateRankTier,
    updateRankPoints
};
