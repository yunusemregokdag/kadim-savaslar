import mongoose, { Document, Schema } from 'mongoose';

export type DailyQuestType = 'kill_mobs' | 'collect_gold' | 'use_skills' | 'complete_dungeon' | 'win_duel' | 'craft_item' | 'send_mail' | 'join_party';

export interface IDailyQuestTemplate {
    id: string;
    type: DailyQuestType;
    name: string;
    description: string;
    targetAmount: number;
    rewards: {
        gold?: number;
        exp?: number;
        gems?: number;
    };
    minLevel?: number;
}

export interface IDailyQuestProgress extends Document {
    oderId: mongoose.Types.ObjectId;
    date: string; // YYYY-MM-DD format
    quests: Array<{
        questId: string;
        type: DailyQuestType;
        name: string;
        description: string;
        targetAmount: number;
        currentAmount: number;
        completed: boolean;
        claimed: boolean;
        rewards: {
            gold?: number;
            exp?: number;
            gems?: number;
        };
    }>;
    allCompleted: boolean;
    bonusClaimed: boolean;
    createdAt: Date;
}

const DailyQuestProgressSchema = new Schema<IDailyQuestProgress>({
    oderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true },
    quests: [{
        questId: String,
        type: String,
        name: String,
        description: String,
        targetAmount: Number,
        currentAmount: { type: Number, default: 0 },
        completed: { type: Boolean, default: false },
        claimed: { type: Boolean, default: false },
        rewards: {
            gold: Number,
            exp: Number,
            gems: Number
        }
    }],
    allCompleted: { type: Boolean, default: false },
    bonusClaimed: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

// Compound index
DailyQuestProgressSchema.index({ oderId: 1, date: 1 }, { unique: true });

// Daily quest templates pool
export const DAILY_QUEST_POOL: IDailyQuestTemplate[] = [
    // Combat quests
    { id: 'kill_10_mobs', type: 'kill_mobs', name: '10 Düşman Öldür', description: '10 düşman öldür', targetAmount: 10, rewards: { gold: 500, exp: 200 } },
    { id: 'kill_25_mobs', type: 'kill_mobs', name: '25 Düşman Öldür', description: '25 düşman öldür', targetAmount: 25, rewards: { gold: 1000, exp: 400 } },
    { id: 'kill_50_mobs', type: 'kill_mobs', name: '50 Düşman Öldür', description: '50 düşman öldür', targetAmount: 50, rewards: { gold: 2000, exp: 800 }, minLevel: 5 },

    // Skill quests
    { id: 'use_10_skills', type: 'use_skills', name: '10 Yetenek Kullan', description: '10 kez yetenek kullan', targetAmount: 10, rewards: { gold: 300, exp: 150 } },
    { id: 'use_25_skills', type: 'use_skills', name: '25 Yetenek Kullan', description: '25 kez yetenek kullan', targetAmount: 25, rewards: { gold: 600, exp: 300 } },

    // Gold quests
    { id: 'collect_1000_gold', type: 'collect_gold', name: '1000 Altın Topla', description: '1000 altın kazan', targetAmount: 1000, rewards: { exp: 300, gems: 5 } },
    { id: 'collect_5000_gold', type: 'collect_gold', name: '5000 Altın Topla', description: '5000 altın kazan', targetAmount: 5000, rewards: { exp: 600, gems: 10 }, minLevel: 5 },

    // Dungeon quests
    { id: 'complete_dungeon', type: 'complete_dungeon', name: 'Zindan Tamamla', description: 'Bir zindanı tamamla', targetAmount: 1, rewards: { gold: 1500, exp: 500, gems: 5 }, minLevel: 10 },

    // PvP quests
    { id: 'win_1_duel', type: 'win_duel', name: 'Düello Kazan', description: 'Bir düello kazan', targetAmount: 1, rewards: { gold: 1000, exp: 300 }, minLevel: 7 },
    { id: 'win_3_duels', type: 'win_duel', name: '3 Düello Kazan', description: '3 düello kazan', targetAmount: 3, rewards: { gold: 3000, exp: 800, gems: 10 }, minLevel: 10 },

    // Social quests
    { id: 'join_party', type: 'join_party', name: 'Partiye Katıl', description: 'Bir partiye katıl', targetAmount: 1, rewards: { gold: 500, exp: 200 } },
    { id: 'send_mail', type: 'send_mail', name: 'Mesaj Gönder', description: 'Bir oyuncuya mesaj gönder', targetAmount: 1, rewards: { gold: 200, exp: 100 } },

    // Crafting quests
    { id: 'craft_1_item', type: 'craft_item', name: 'Eşya Üret', description: 'Bir eşya üret', targetAmount: 1, rewards: { gold: 500, exp: 250 } },
    { id: 'craft_3_items', type: 'craft_item', name: '3 Eşya Üret', description: '3 eşya üret', targetAmount: 3, rewards: { gold: 1500, exp: 600 }, minLevel: 5 }
];

// Bonus for completing all daily quests
export const DAILY_BONUS_REWARD = {
    gold: 5000,
    exp: 2000,
    gems: 25
};

export const DailyQuestProgress = mongoose.model<IDailyQuestProgress>('DailyQuestProgress', DailyQuestProgressSchema);
