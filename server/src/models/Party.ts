import mongoose, { Schema, Document } from 'mongoose';

export interface IParty extends Document {
    leader: mongoose.Types.ObjectId;
    members: mongoose.Types.ObjectId[];
    lootMode: 'FREE_FOR_ALL' | 'ROUND_ROBIN' | 'LEADER_ONLY';
    expShareEnabled: boolean;
    maxMembers: number;
    createdAt: Date;
    disbanded: boolean;
}

const PartySchema: Schema = new Schema({
    leader: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    members: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
    lootMode: {
        type: String,
        enum: ['FREE_FOR_ALL', 'ROUND_ROBIN', 'LEADER_ONLY'],
        default: 'FREE_FOR_ALL',
    },
    expShareEnabled: {
        type: Boolean,
        default: true,
    },
    maxMembers: {
        type: Number,
        default: 5,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    disbanded: {
        type: Boolean,
        default: false,
    },
});

// Indexes
PartySchema.index({ leader: 1 });
PartySchema.index({ members: 1 });

export const Party = mongoose.model<IParty>('Party', PartySchema);
