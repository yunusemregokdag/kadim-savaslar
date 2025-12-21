import { Response } from 'express';
import { DailyQuestProgress, DAILY_QUEST_POOL, DAILY_BONUS_REWARD, IDailyQuestTemplate } from '../models/DailyQuest.js';
import { Character } from '../models/Character.js';
import { AuthRequest } from '../middleware/auth.js';

// Get today's date string
const getTodayDate = (): string => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

// Generate random daily quests for a player
const generateDailyQuests = (playerLevel: number, count: number = 5): IDailyQuestTemplate[] => {
    // Filter quests by level
    const availableQuests = DAILY_QUEST_POOL.filter(q =>
        !q.minLevel || q.minLevel <= playerLevel
    );

    // Shuffle and pick random quests
    const shuffled = [...availableQuests].sort(() => Math.random() - 0.5);

    // Try to get variety (different types)
    const selected: IDailyQuestTemplate[] = [];
    const usedTypes = new Set<string>();

    for (const quest of shuffled) {
        if (selected.length >= count) break;

        // Prefer variety, but allow duplicates if needed
        if (!usedTypes.has(quest.type) || selected.length >= availableQuests.length * 0.5) {
            selected.push(quest);
            usedTypes.add(quest.type);
        }
    }

    // Fill remaining slots if needed
    while (selected.length < count && shuffled.length > 0) {
        const remaining = shuffled.filter(q => !selected.includes(q));
        if (remaining.length > 0) {
            selected.push(remaining[0]);
        } else {
            break;
        }
    }

    return selected;
};

export const dailyQuestController = {
    // Get today's daily quests
    async getDailyQuests(req: AuthRequest, res: Response) {
        try {
            const userId = req.userId;
            const today = getTodayDate();

            let progress = await DailyQuestProgress.findOne({ oderId: userId, date: today });

            // Generate new quests if none exist for today
            if (!progress) {
                const character = await Character.findOne({ userId });
                const playerLevel = character?.level || 1;

                const quests = generateDailyQuests(playerLevel);

                progress = new DailyQuestProgress({
                    oderId: userId,
                    date: today,
                    quests: quests.map(q => ({
                        questId: q.id,
                        type: q.type,
                        name: q.name,
                        description: q.description,
                        targetAmount: q.targetAmount,
                        currentAmount: 0,
                        completed: false,
                        claimed: false,
                        rewards: q.rewards
                    })),
                    allCompleted: false,
                    bonusClaimed: false
                });

                await progress.save();
            }

            res.json({
                date: today,
                quests: progress.quests,
                allCompleted: progress.allCompleted,
                bonusClaimed: progress.bonusClaimed,
                bonusReward: DAILY_BONUS_REWARD
            });
        } catch (error) {
            console.error('Get daily quests error:', error);
            res.status(500).json({ error: 'Failed to get daily quests' });
        }
    },

    // Update quest progress
    async updateProgress(req: AuthRequest, res: Response) {
        try {
            const userId = req.userId;
            const { questType, amount } = req.body;
            const today = getTodayDate();

            const progress = await DailyQuestProgress.findOne({ oderId: userId, date: today });
            if (!progress) {
                return res.status(404).json({ error: 'No daily quests found for today' });
            }

            let updated = false;

            // Update all quests of matching type
            for (const quest of progress.quests) {
                if (quest.type === questType && !quest.completed) {
                    quest.currentAmount += amount;

                    if (quest.currentAmount >= quest.targetAmount) {
                        quest.currentAmount = quest.targetAmount;
                        quest.completed = true;
                    }
                    updated = true;
                }
            }

            // Check if all completed
            progress.allCompleted = progress.quests.every(q => q.completed);

            if (updated) {
                progress.save();
            }

            res.json({
                success: true,
                quests: progress.quests,
                allCompleted: progress.allCompleted
            });
        } catch (error) {
            console.error('Update progress error:', error);
            res.status(500).json({ error: 'Failed to update progress' });
        }
    },

    // Claim quest reward
    async claimReward(req: AuthRequest, res: Response) {
        try {
            const userId = req.userId;
            const { questId } = req.params;
            const today = getTodayDate();

            const progress = await DailyQuestProgress.findOne({ oderId: userId, date: today });
            if (!progress) {
                return res.status(404).json({ error: 'No daily quests found' });
            }

            const quest = progress.quests.find(q => q.questId === questId);
            if (!quest) {
                return res.status(404).json({ error: 'Quest not found' });
            }

            if (!quest.completed) {
                return res.status(400).json({ error: 'Quest not completed' });
            }

            if (quest.claimed) {
                return res.status(400).json({ error: 'Reward already claimed' });
            }

            // Give rewards
            const character = await Character.findOne({ userId });
            if (character) {
                if (quest.rewards.gold) character.gold = (character.gold || 0) + quest.rewards.gold;
                if (quest.rewards.exp) character.exp = (character.exp || 0) + quest.rewards.exp;
                // Note: gems would need to be tracked on User model
                await character.save();
            }

            quest.claimed = true;
            await progress.save();

            res.json({
                success: true,
                rewards: quest.rewards,
                quests: progress.quests
            });
        } catch (error) {
            console.error('Claim reward error:', error);
            res.status(500).json({ error: 'Failed to claim reward' });
        }
    },

    // Claim bonus reward for completing all quests
    async claimBonusReward(req: AuthRequest, res: Response) {
        try {
            const userId = req.userId;
            const today = getTodayDate();

            const progress = await DailyQuestProgress.findOne({ oderId: userId, date: today });
            if (!progress) {
                return res.status(404).json({ error: 'No daily quests found' });
            }

            if (!progress.allCompleted) {
                return res.status(400).json({ error: 'Not all quests completed' });
            }

            if (progress.bonusClaimed) {
                return res.status(400).json({ error: 'Bonus already claimed' });
            }

            // Give bonus rewards
            const character = await Character.findOne({ userId });
            if (character) {
                character.gold = (character.gold || 0) + DAILY_BONUS_REWARD.gold;
                character.exp = (character.exp || 0) + DAILY_BONUS_REWARD.exp;
                await character.save();
            }

            progress.bonusClaimed = true;
            await progress.save();

            res.json({
                success: true,
                rewards: DAILY_BONUS_REWARD
            });
        } catch (error) {
            console.error('Claim bonus reward error:', error);
            res.status(500).json({ error: 'Failed to claim bonus' });
        }
    },

    // Internal: Update quest progress (called from other parts of the system)
    async trackAction(userId: string, questType: string, amount: number = 1) {
        try {
            const today = getTodayDate();
            const progress = await DailyQuestProgress.findOne({ oderId: userId, date: today });

            if (!progress) return;

            for (const quest of progress.quests) {
                if (quest.type === questType && !quest.completed) {
                    quest.currentAmount += amount;

                    if (quest.currentAmount >= quest.targetAmount) {
                        quest.currentAmount = quest.targetAmount;
                        quest.completed = true;
                    }
                }
            }

            progress.allCompleted = progress.quests.every(q => q.completed);
            await progress.save();
        } catch (error) {
            console.error('Track action error:', error);
        }
    }
};
