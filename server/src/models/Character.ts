import mongoose, { Schema, Document } from 'mongoose';

export interface ICharacter extends Document {
    userId: mongoose.Types.ObjectId;
    name: string;
    class: string;
    level: number;
    exp: number;
    hp: number;
    maxHp: number;
    mana: number;
    maxMana: number;
    strength: number;
    defense: number;
    intelligence: number;
    dexterity: number;
    gold: number;
    position: {
        x: number;
        y: number;
        z: number;
    };
    currentZone: number;
    inventory: any[];
    equipment: {
        weapon?: any;
        armor?: any;
        helmet?: any;
        pants?: any;
        boots?: any;
        gloves?: any;
        necklace?: any;
        earring?: any;
        ring?: any;
        wings?: any;
        pet?: any;
    };
    skills: any[];
    questProgress: any[];
    achievements: any[];
    pvpStats: {
        kills: number;
        deaths: number;
        rating: number;
    };
    createdAt: Date;
    lastPlayed: Date;
}

const CharacterSchema: Schema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 16,
    },
    class: {
        type: String,
        required: true,
        enum: ['warrior', 'arctic_knight', 'gale_glaive', 'archer', 'archmage', 'bard', 'cleric', 'martial_artist', 'monk', 'reaper'],
    },
    level: {
        type: Number,
        default: 1,
        min: 1,
        max: 30,
    },
    exp: {
        type: Number,
        default: 0,
    },
    hp: {
        type: Number,
        default: 100,
    },
    maxHp: {
        type: Number,
        default: 100,
    },
    mana: {
        type: Number,
        default: 100,
    },
    maxMana: {
        type: Number,
        default: 100,
    },
    strength: {
        type: Number,
        default: 10,
    },
    defense: {
        type: Number,
        default: 10,
    },
    intelligence: {
        type: Number,
        default: 10,
    },
    dexterity: {
        type: Number,
        default: 10,
    },
    gold: {
        type: Number,
        default: 1000,
    },
    position: {
        x: { type: Number, default: 0 },
        y: { type: Number, default: 0 },
        z: { type: Number, default: 0 },
    },
    currentZone: {
        type: Number,
        default: 1,
    },
    inventory: {
        type: [Schema.Types.Mixed],
        default: [],
    },
    equipment: {
        type: Schema.Types.Mixed,
        default: {},
    },
    skills: {
        type: [Schema.Types.Mixed],
        default: [],
    },
    questProgress: {
        type: [Schema.Types.Mixed],
        default: [],
    },
    achievements: {
        type: [Schema.Types.Mixed],
        default: [],
    },
    pvpStats: {
        kills: { type: Number, default: 0 },
        deaths: { type: Number, default: 0 },
        rating: { type: Number, default: 1000 },
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    lastPlayed: {
        type: Date,
        default: Date.now,
    },
});

// Indexes
CharacterSchema.index({ userId: 1 });
CharacterSchema.index({ name: 1 });
CharacterSchema.index({ level: -1 });

export const Character = mongoose.model<ICharacter>('Character', CharacterSchema);
