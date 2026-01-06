// ═══════════════════════════════════════════════════════════════════════════
// SKILL REGISTRY - Kadim Savaşlar
// Tüm skill'lerin merkezi kayıt sistemi
// Var olan effect'lere dokunmaz, sadece bağlar
// ═══════════════════════════════════════════════════════════════════════════

import { SkillId, SkillHandler, SkillCastContext } from './types';

class SkillRegistryClass {
    private skills = new Map<SkillId, SkillHandler>();
    private skillMeta = new Map<SkillId, {
        name: string;
        cooldown: number;
        manaCost: number;
        description?: string;
    }>();

    /**
     * Skill handler'ı kaydet
     * Mevcut effect fonksiyonlarını buraya register ediyoruz
     */
    register(
        id: SkillId,
        handler: SkillHandler,
        meta?: {
            name?: string;
            cooldown?: number;
            manaCost?: number;
            description?: string;
        }
    ): void {
        this.skills.set(id, handler);

        if (meta) {
            this.skillMeta.set(id, {
                name: meta.name || id,
                cooldown: meta.cooldown || 1000,
                manaCost: meta.manaCost || 0,
                description: meta.description
            });
        }
    }

    /**
     * Skill'i çalıştır
     */
    cast(id: SkillId, ctx: SkillCastContext): boolean {
        const skill = this.skills.get(id);
        if (!skill) {
            console.warn(`[SkillRegistry] Skill not found: ${id}`);
            return false;
        }

        try {
            skill(ctx);
            return true;
        } catch (error) {
            console.error(`[SkillRegistry] Error casting skill: ${id}`, error);
            return false;
        }
    }

    /**
     * Skill var mı kontrol et
     */
    has(id: SkillId): boolean {
        return this.skills.has(id);
    }

    /**
     * Skill meta bilgisini al
     */
    getMeta(id: SkillId) {
        return this.skillMeta.get(id);
    }

    /**
     * Tüm kayıtlı skill ID'lerini al
     */
    getAllSkillIds(): SkillId[] {
        return Array.from(this.skills.keys());
    }

    /**
     * Skill sayısını al
     */
    get count(): number {
        return this.skills.size;
    }
}

// Singleton export
export const SkillRegistry = new SkillRegistryClass();

// ═══════════════════════════════════════════════════════════════════════════
// SKILL REGISTRATION HELPER
// Mevcut effect dosyalarından skill kaydetmek için
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Toplu skill kaydı için helper
 * Örnek kullanım:
 * registerSkills({
 *   'fireball': { handler: fireballHandler, cooldown: 3000, manaCost: 20 },
 *   'iceblock': { handler: iceblockHandler, cooldown: 8000, manaCost: 40 }
 * });
 */
export function registerSkills(skills: Record<SkillId, {
    handler: SkillHandler;
    name?: string;
    cooldown?: number;
    manaCost?: number;
    description?: string;
}>): void {
    Object.entries(skills).forEach(([id, config]) => {
        SkillRegistry.register(id, config.handler, {
            name: config.name,
            cooldown: config.cooldown,
            manaCost: config.manaCost,
            description: config.description
        });
    });
}

export default SkillRegistry;
