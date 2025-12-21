import { useEffect, useRef } from 'react';
import { GameEntity } from '../types';

interface UseBossAIProps {
    setEntities: React.Dispatch<React.SetStateAction<GameEntity[]>>;
    playerPosRef: React.MutableRefObject<{ x: number, y: number }>;
    onBossSkill: (skillName: string, bossId: string, target?: { x: number, y: number }) => void;
}

export const useBossAI = ({ setEntities, playerPosRef, onBossSkill }: UseBossAIProps) => {
    const lastSkillTime = useRef<Record<string, number>>({});

    useEffect(() => {
        const interval = setInterval(() => {
            setEntities(prev => {
                const bosses = prev.filter(e => e.type === 'boss' && e.hp > 0);
                if (bosses.length === 0) return prev;

                let hasChanges = false;
                const nextEntities = prev.map(boss => {
                    if (boss.type !== 'boss' || boss.hp <= 0) return boss;

                    // Ensure bossData exists with explicit type casting for 'phase'
                    let currentBossData = boss.bossData || { phase: 1 as 1, isRaged: false, currentSkill: null };
                    let newData = { ...currentBossData };
                    let changed = false;

                    // 1. Phase Control (Rage Mode)
                    if (boss.hp < boss.maxHp * 0.5 && !newData.isRaged) {
                        newData.isRaged = true;
                        newData.phase = 2;
                        changed = true;
                        // Trigger Rage Effect
                        setTimeout(() => onBossSkill('rage', boss.id), 0);
                    }

                    // 2. Skill Logic
                    const now = Date.now();
                    const lastTime = lastSkillTime.current[boss.id] || 0;
                    const cooldown = newData.isRaged ? 4000 : 8000;

                    if (now - lastTime > cooldown && !newData.currentSkill) {
                        // Random Skill Selection
                        const skills = ['meteor', 'nova', 'summon'];
                        const selectedSkill = skills[Math.floor(Math.random() * skills.length)];

                        // Setup Skill Warning
                        newData.currentSkill = selectedSkill;

                        if (selectedSkill === 'meteor') {
                            // Meteor: Target player position
                            const pPos = playerPosRef.current;
                            newData.skillTarget = {
                                x: pPos.x * 15, // Use current player pos
                                y: pPos.y * 15,
                                radius: 5,
                                warnTime: now + 2000 // 2 sec warning
                            };
                        } else if (selectedSkill === 'nova') {
                            // Nova: Around Boss
                            newData.skillTarget = {
                                x: boss.x,
                                y: boss.y,
                                radius: 8,
                                warnTime: now + 1500
                            };
                        } else if (selectedSkill === 'summon') {
                            newData.skillTarget = { x: boss.x, y: boss.y, radius: 0, warnTime: now + 1000 };
                        }

                        lastSkillTime.current[boss.id] = now;
                        changed = true;
                    }

                    // 3. Skill Execution (After warning)
                    if (newData.currentSkill && newData.skillTarget && now > newData.skillTarget.warnTime) {
                        // Execute Skill Side Effect
                        const skillName = newData.currentSkill;
                        const target = { x: newData.skillTarget.x, y: newData.skillTarget.y };
                        setTimeout(() => onBossSkill(skillName, boss.id, target), 0);

                        // Reset Skill State
                        newData.currentSkill = null;
                        newData.skillTarget = undefined;
                        changed = true;
                    }

                    if (changed) {
                        hasChanges = true;
                        return { ...boss, bossData: newData };
                    }
                    return boss;
                });

                return hasChanges ? nextEntities : prev;
            });

        }, 500); // Check every 500ms

        return () => clearInterval(interval);
    }, [onBossSkill, setEntities, playerPosRef]);
};
