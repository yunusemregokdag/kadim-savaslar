import mongoose, { Document, Schema } from 'mongoose';

export type EventType = 'exp_boost' | 'gold_boost' | 'drop_boost' | 'boss_spawn' | 'pvp_arena' | 'treasure_hunt' | 'invasion';

export interface IEvent extends Document {
    name: string;
    description: string;
    eventType: EventType;
    startTime: Date;
    endTime: Date;
    isActive: boolean;
    bonusMultiplier: number; // e.g., 2.0 for 2x EXP
    targetZones: number[]; // Empty = all zones
    rewards: {
        gold?: number;
        exp?: number;
        gems?: number;
        items?: Array<{
            itemId: string;
            name: string;
            chance: number; // 0-100
        }>;
    };
    requirements: {
        minLevel?: number;
        maxLevel?: number;
        factions?: string[]; // Empty = all factions
    };
    participation: {
        totalParticipants: number;
        topPlayers: Array<{
            oderId: mongoose.Types.ObjectId;
            name: string;
            score: number;
        }>;
    };
    createdAt: Date;
    updatedAt: Date;
}

const EventSchema = new Schema<IEvent>({
    name: { type: String, required: true },
    description: { type: String, required: true },
    eventType: {
        type: String,
        enum: ['exp_boost', 'gold_boost', 'drop_boost', 'boss_spawn', 'pvp_arena', 'treasure_hunt', 'invasion'],
        required: true
    },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    bonusMultiplier: { type: Number, default: 1.0 },
    targetZones: [{ type: Number }],
    rewards: {
        gold: { type: Number, default: 0 },
        exp: { type: Number, default: 0 },
        gems: { type: Number, default: 0 },
        items: [{
            itemId: String,
            name: String,
            chance: Number
        }]
    },
    requirements: {
        minLevel: { type: Number, default: 1 },
        maxLevel: { type: Number, default: 100 },
        factions: [String]
    },
    participation: {
        totalParticipants: { type: Number, default: 0 },
        topPlayers: [{
            oderId: { type: Schema.Types.ObjectId, ref: 'User' },
            name: String,
            score: Number
        }]
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Indexes
EventSchema.index({ startTime: 1, endTime: 1, isActive: 1 });
EventSchema.index({ eventType: 1 });

export const GameEvent = mongoose.model<IEvent>('GameEvent', EventSchema);
