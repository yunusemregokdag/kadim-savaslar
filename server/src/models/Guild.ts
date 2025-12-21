import mongoose, { Schema, Document } from 'mongoose';

export interface IGuild extends Document {
    name: string;
    tag: string;
    level: number;
    exp: number;
    gold: number;
    leader: mongoose.Types.ObjectId;
    officers: mongoose.Types.ObjectId[];
    members: {
        userId: mongoose.Types.ObjectId;
        role: 'MEMBER' | 'OFFICER' | 'VICE_LEADER' | 'LEADER';
        joinedAt: Date;
        contribution: number;
    }[];
    storage: any[];
    announcement: string;
    maxMembers: number;
    createdAt: Date;
}

const GuildSchema: Schema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 20,
    },
    tag: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 2,
        maxlength: 5,
        uppercase: true,
    },
    level: {
        type: Number,
        default: 1,
        min: 1,
        max: 20,
    },
    exp: {
        type: Number,
        default: 0,
    },
    gold: {
        type: Number,
        default: 0,
    },
    leader: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    officers: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
    members: [{
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        role: {
            type: String,
            enum: ['MEMBER', 'OFFICER', 'VICE_LEADER', 'LEADER'],
            default: 'MEMBER',
        },
        joinedAt: {
            type: Date,
            default: Date.now,
        },
        contribution: {
            type: Number,
            default: 0,
        },
    }],
    storage: {
        type: [Schema.Types.Mixed],
        default: [],
    },
    announcement: {
        type: String,
        default: '',
        maxlength: 500,
    },
    maxMembers: {
        type: Number,
        default: 30,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Indexes
GuildSchema.index({ name: 1 });
GuildSchema.index({ tag: 1 });
GuildSchema.index({ level: -1 });

export const Guild = mongoose.model<IGuild>('Guild', GuildSchema);
