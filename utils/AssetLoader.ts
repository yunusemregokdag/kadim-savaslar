import yaml from 'js-yaml';
import { ClassData, Skill } from '../types';
import { CLASSES } from '../constants';

// Registry of File Paths
const ASSET_PATHS: Record<string, { classFile: string, skillFolder: string, mmPath?: string, mobsPath?: string, modelFolder?: string }> = {
    // ... existing content ... same ...
    // --- SERIES PACKS ---
    warrior: {
        classFile: '/models/Character/warrior/MMOCore/classes/warrior.yml',
        skillFolder: '/models/Character/warrior/MMOCore/skills/',
        mmPath: '/models/Character/warrior/MythicMobs/Skills/warrior_skills_mmocore.yml',
        mobsPath: '/models/Character/warrior/MythicMobs/Mobs/warrior_mobs.yml'
    },
    reaper: {
        classFile: '/models/Character/reaper/MMOCore/classes/reaper.yml',
        skillFolder: '/models/Character/reaper/MMOCore/skills/',
        mmPath: '/models/Character/reaper/MythicMobs/Skills/reaper_skills_mmocore.yml',
        mobsPath: '/models/Character/reaper/MythicMobs/Mobs/reaper_mobs.yml'
    },
    ranger: {
        classFile: '/models/Character/archer/MMOCore/classes/archer.yml',
        skillFolder: '/models/Character/archer/MMOCore/skills/',
        mmPath: '/models/Character/archer/MythicMobs/Skills/archer_skills_mmocore.yml',
        mobsPath: '/models/Character/archer/MythicMobs/Mobs/archer_mobs.yml'
    },
    mage: {
        classFile: '/models/Character/archmage/MMOCore/classes/archmage.yml',
        skillFolder: '/models/Character/archmage/MMOCore/skills/',
        mmPath: '/models/Character/archmage/MythicMobs/Skills/archmage_skills_mmocore.yml',
        mobsPath: '/models/Character/archmage/MythicMobs/Mobs/archmage_mobs.yml'
    },
    bard: {
        classFile: '/models/Character/bard/MMOCore/classes/bard.yml',
        skillFolder: '/models/Character/bard/MMOCore/skills/',
        mmPath: '/models/Character/bard/MythicMobs/Skills/bard_skills_mmocore.yml',
        mobsPath: '/models/Character/bard/MythicMobs/Mobs/bard_mobs.yml'
    },
    cleric: {
        classFile: '/models/Character/cleric/MMOCore/classes/cleric.yml',
        skillFolder: '/models/Character/cleric/MMOCore/skills/',
        mmPath: '/models/Character/cleric/MythicMobs/Skills/cleric_skills_mmocore.yml',
        mobsPath: '/models/Character/cleric/MythicMobs/Mobs/cleric_mobs.yml'
    },
    martial_artist: {
        classFile: '/models/Character/martial_artist/MMOCore/classes/martial_artist.yml',
        skillFolder: '/models/Character/martial_artist/MMOCore/skills/',
        mmPath: '/models/Character/martial_artist/MythicMobs/Skills/martial_artist_skills_mmocore.yml',
        mobsPath: '/models/Character/martial_artist/MythicMobs/Mobs/martial_artist_mobs.yml'
    },
    monk: {
        classFile: '/models/Character/monk/MMOCore/classes/monk.yml',
        skillFolder: '/models/Character/monk/MMOCore/skills/',
        mmPath: '/models/Character/monk/MythicMobs/Skills/monk_skills_mmocore.yml',
        mobsPath: '/models/Character/monk/MythicMobs/Mobs/monk_mobs.yml'
    },

    // --- LEGENDS PACKS ---
    arctic_knight: {
        classFile: '/models/Character/arctic_knight/MMOCore/classes/arctic_knight.yml',
        skillFolder: '/models/Character/arctic_knight/MMOCore/skills/',
        mmPath: '/models/Character/arctic_knight/MythicMobs/Skills/arctic_knight_skills_mmocore.yml', // Assumed name - verify?
        mobsPath: '/models/Character/arctic_knight/MythicMobs/Mobs/arctic_knight_mobs.yml' // Assumed name
    },
    gale_glaive: {
        classFile: '/models/Character/gale_glaive/MMOCore/classes/gale_glaive.yml',
        skillFolder: '/models/Character/gale_glaive/MMOCore/skills/',
        mmPath: '/models/Character/gale_glaive/MythicMobs/Skills/gale_glaive_skills_mmocore.yml',
        mobsPath: '/models/Character/gale_glaive/MythicMobs/Mobs/gale_glaive_mobs.yml'
    }
};

// ... mapNameToVisual ...
const mapNameToVisual = (name: string): string => {
    const n = name.toLowerCase();
    if (n.includes('meteor') || n.includes('storm')) return 'meteor';
    if (n.includes('slash')) return 'slash';
    return 'slash';
};

// CACHES
const MODEL_REGISTRY: Record<string, Record<number, string>> = {}; // ID -> Path
const ITEM_REGISTRY: Record<string, Record<string, string>> = {};  // ItemName -> Path
const MYTHIC_SKILL_MAP: Record<string, Record<string, string>> = {}; // Class -> { SkillName -> MobName }
const MYTHIC_MOB_MAP: Record<string, Record<string, string>> = {};   // Class -> { MobName -> ItemName }

// --- HELPER: RESOLVE ABSOLUTE PATH FROM LOGICAL MODEL PATH ---
const resolveModelPath = (logicalPath: string, classId: string): string => {
    const config = ASSET_PATHS[classId];
    if (!config) return '';
    const baseFolder = config.skillFolder.split('/MMOCore')[0];
    const className = config.modelFolder || classId.toLowerCase(); // Use override if available
    return `${baseFolder}/ItemsAdder/contents/${className}/resourcepack/assets/${className}/models/${logicalPath}.json`;
};

export const AssetLoader = {
    async loadClass(classId: string): Promise<Partial<ClassData> | null> {
        const config = ASSET_PATHS[classId];
        if (!config) return null;

        // 1. BUILD REGISTRIES (If not cached)
        if (!ITEM_REGISTRY[classId]) {
            ITEM_REGISTRY[classId] = {};
            MODEL_REGISTRY[classId] = {};

            try {
                // ITEMSADDER
                const baseFolder = config.skillFolder.split('/MMOCore')[0];
                const iaPath = `${baseFolder}/ItemsAdder/contents/${classId}/configs/${classId}/${classId}.yml`;
                const res = await fetch(iaPath);
                if (res.ok) {
                    const txt = await res.text();
                    const iaData: any = yaml.load(txt);
                    if (iaData && iaData.items) {
                        for (const [itemName, itemData] of Object.entries(iaData.items)) {
                            const item = itemData as any;
                            const nItemName = itemName.toLowerCase();
                            if (item.resource && item.resource.model_path) {
                                ITEM_REGISTRY[classId][nItemName] = item.resource.model_path;
                                if (item.resource.model_id) {
                                    MODEL_REGISTRY[classId][item.resource.model_id] = item.resource.model_path;
                                }
                            }
                        }
                    }
                }

                // MYTHIC MOBS SKILLS (Find Mob Name)
                if (config.mmPath) {
                    MYTHIC_SKILL_MAP[classId] = {};
                    const mmRes = await fetch(config.mmPath);
                    if (mmRes.ok) {
                        const mmTxt = await mmRes.text();
                        const lines = mmTxt.split('\n');
                        let currentSkill = '';
                        // Temproary map to resolve sub-skills within the same file
                        const skillToMobOrSubSkill: Record<string, string> = {};

                        for (const line of lines) {
                            // 1. Detect Skill Header
                            const skillMatch = line.match(/^([a-zA-Z0-9_]+):/);
                            if (skillMatch) {
                                currentSkill = skillMatch[1].toLowerCase();
                            }

                            if (currentSkill) {
                                // 2. Direct Summon/Projectile
                                const summonMatch = line.match(/summon\{type=([a-zA-Z0-9_]+)/i);
                                const projectileMatch = line.match(/projectile\{.*?mob=([a-zA-Z0-9_]+)/i);

                                if (summonMatch) skillToMobOrSubSkill[currentSkill] = summonMatch[1].toLowerCase();
                                else if (projectileMatch) skillToMobOrSubSkill[currentSkill] = projectileMatch[1].toLowerCase();

                                // 3. RandomSkill or Skill references (Follow the chain)
                                // matches: randomskill{skills=SkillName1,...} or skill{s=SkillName1}
                                const randomMatch = line.match(/randomskill\{skills=([a-zA-Z0-9_]+)/i);
                                const subSkillMatch = line.match(/skill\{s=([a-zA-Z0-9_]+)/i);

                                if (randomMatch && !skillToMobOrSubSkill[currentSkill]) {
                                    skillToMobOrSubSkill[currentSkill] = "LINK:" + randomMatch[1].toLowerCase();
                                } else if (subSkillMatch && !skillToMobOrSubSkill[currentSkill]) {
                                    skillToMobOrSubSkill[currentSkill] = "LINK:" + subSkillMatch[1].toLowerCase();
                                }
                            }
                        }

                        // Resolve Links (One-pass resolution for simplicity, can be improved to recursive)
                        Object.keys(skillToMobOrSubSkill).forEach(key => {
                            let val = skillToMobOrSubSkill[key];
                            // If it points to another skill, resolve it (up to 2 levels deep for now)
                            if (val.startsWith("LINK:")) {
                                const targetSkill = val.split(':')[1];
                                if (skillToMobOrSubSkill[targetSkill] && !skillToMobOrSubSkill[targetSkill].startsWith("LINK:")) {
                                    MYTHIC_SKILL_MAP[classId][key] = skillToMobOrSubSkill[targetSkill];
                                } else {
                                    // Fallback: If we can't fully resolve, just assume the link name might be a mob? No, safer to ignore.
                                }
                            } else {
                                MYTHIC_SKILL_MAP[classId][key] = val;
                            }
                        });
                    }
                }

                // MYTHIC MOBS MOBS (Find Item Name)
                if (config.mobsPath) {
                    MYTHIC_MOB_MAP[classId] = {};
                    const mobRes = await fetch(config.mobsPath);
                    if (mobRes.ok) {
                        const mobTxt = await mobRes.text();
                        const lines = mobTxt.split('\n');
                        let currentMob = '';
                        for (const line of lines) {
                            const mobMatch = line.match(/^(\w+):/);
                            if (mobMatch) currentMob = mobMatch[1].toLowerCase();

                            const itemMatch = line.match(/ItemHand:\s*(\w+)/) || line.match(/equip\{item=(\w+)/);
                            if (currentMob && itemMatch) {
                                // Strip options if present (e.g. item=slash:0)
                                let itemName = itemMatch[1].split(':')[0].trim().toLowerCase();
                                MYTHIC_MOB_MAP[classId][currentMob] = itemName;
                            }
                        }
                    }
                }
            } catch (e) {
                console.warn(`[AssetLoader] Registry init failed for ${classId}`, e);
            }
        }

        try {
            const response = await fetch(config.classFile);
            if (!response.ok) throw new Error(`Failed to fetch ${config.classFile}`);
            const text = await response.text();
            const rawClass: any = yaml.load(text);

            const skillKeys = Object.keys(rawClass.skills || {});
            const loadedSkills: Skill[] = [];

            for (const skillId of skillKeys) {
                // MMOCore sometimes has keys like 'BLIZZARD_', strip trailing underscore
                const normalizedId = skillId.toLowerCase().replace(/_$/, '');
                const rawSkill = rawClass.skills[skillId];

                const skillName = typeof rawSkill === 'string' ? rawSkill : (rawSkill.name || skillId);
                const skillFileName = normalizedId.replace(/_/g, '-') + '.yml';
                const skillUrl = `${config.skillFolder}${skillFileName}`;

                try {
                    const skillRes = await fetch(skillUrl);
                    if (skillRes.ok) {
                        const skillTxt = await skillRes.text();
                        const skillName = rawSkill.name || skillId;
                        let resolvedModelPath = '';

                        // 1. RESOLVE VISUAL (MythicMobs Chain)
                        // Normalize keys for lookup
                        let mobName = MYTHIC_SKILL_MAP[classId]?.[normalizedId];

                        // Fallback: MMOCore uses snake_case, MM might use Brutal_Strike (Camel_Snake)
                        // We lowercased everything in the map build, so normalizedId (lower) should match.

                        // Fallback 2: "Brutal_Strike_1" simple append
                        if (!mobName && MYTHIC_MOB_MAP[classId]?.[`${normalizedId}_1`]) {
                            mobName = `${normalizedId}_1`;
                        }

                        if (mobName) {
                            const itemName = MYTHIC_MOB_MAP[classId]?.[mobName];
                            if (itemName && ITEM_REGISTRY[classId]?.[itemName]) {
                                const logicalPath = ITEM_REGISTRY[classId][itemName];
                                resolvedModelPath = resolveModelPath(logicalPath, classId);
                                console.log(`[AssetLoader] LINKED: ${skillName} -> Path:${resolvedModelPath}`);
                            } else {
                                console.warn(`[AssetLoader] Mob ${mobName} has item ${itemName} but not in registry.`);
                            }
                        } else {
                            console.warn(`[AssetLoader] No Mob found for Skill ${normalizedId}`);
                        }

                        // Match with CONSTANTS for Icon and Visual fallback
                        let iconPath = 'Amblem';
                        let visualId = resolvedModelPath ? 'custom_model' : mapNameToVisual(skillName);

                        const staticClass = CLASSES[classId];
                        if (staticClass) {
                            const cleanName = skillName.replace(/&[0-9a-fklmnor]/gi, '').trim();
                            const match = staticClass.skills.find(s =>
                                s.id === normalizedId ||
                                s.name_en === cleanName ||
                                s.name === cleanName
                            );
                            if (match) {
                                if (match.icon) iconPath = match.icon;
                                if (match.visual && !resolvedModelPath) visualId = match.visual;
                            }
                        }

                        // Fallback Icon Heuristic
                        if (iconPath === 'Amblem') {
                            iconPath = `/models/icons/${classId}/icon_${normalizedId}.png`;
                        }

                        loadedSkills.push({
                            id: normalizedId,
                            name: skillName,
                            description: (rawSkill.lore || []).join('\n'),
                            cd: rawSkill.cooldown?.base || 5,
                            manaCost: rawSkill.mana?.base || 10,
                            type: 'damage',
                            icon: iconPath,
                            visual: visualId,
                            modelPath: resolvedModelPath
                        } as any);
                    }
                } catch (e) {
                    console.error(`Error loading skill ${skillId}:`, e);
                }
            }

            return {
                id: classId as any,
                name: rawClass.display?.name || classId,
                skills: loadedSkills.length > 0 ? loadedSkills : undefined
            };

        } catch (error) {
            console.error(`AssetLoader Error for ${classId}:`, error);
            return null;
        }
    }
};
