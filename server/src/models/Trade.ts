import mongoose, { Schema, Document } from 'mongoose';

export interface ITrade extends Document {
    trader1: mongoose.Types.ObjectId;
    trader2: mongoose.Types.ObjectId;
    trader1Items: any[];
    trader2Items: any[];
    trader1Gold: number;
    trader2Gold: number;
    trader1Confirmed: boolean;
    trader2Confirmed: boolean;
    status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
    createdAt: Date;
    completedAt: Date | null;
}

const TradeSchema: Schema = new Schema({
    trader1: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    trader2: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    trader1Items: {
        type: [Schema.Types.Mixed],
        default: [],
    },
    trader2Items: {
        type: [Schema.Types.Mixed],
        default: [],
    },
    trader1Gold: {
        type: Number,
        default: 0,
    },
    trader2Gold: {
        type: Number,
        default: 0,
    },
    trader1Confirmed: {
        type: Boolean,
        default: false,
    },
    trader2Confirmed: {
        type: Boolean,
        default: false,
    },
    status: {
        type: String,
        enum: ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'],
        default: 'PENDING',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    completedAt: {
        type: Date,
        default: null,
    },
});

// Indexes
TradeSchema.index({ trader1: 1, status: 1 });
TradeSchema.index({ trader2: 1, status: 1 });

export const Trade = mongoose.model<ITrade>('Trade', TradeSchema);
