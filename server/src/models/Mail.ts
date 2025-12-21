import mongoose, { Document, Schema } from 'mongoose';

export interface IMail extends Document {
    senderId: mongoose.Types.ObjectId | null; // null = system mail
    senderName: string;
    recipientId: mongoose.Types.ObjectId;
    recipientName: string;
    subject: string;
    message: string;
    attachedItems: Array<{
        itemId: string;
        name: string;
        type: string;
        rarity: string;
        stats: Record<string, number>;
    }>;
    attachedGold: number;
    attachedGems: number;
    isRead: boolean;
    isCollected: boolean; // Items/gold collected
    createdAt: Date;
    expiresAt: Date;
    mailType: 'player' | 'system' | 'guild' | 'reward';
}

const MailSchema = new Schema<IMail>({
    senderId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    senderName: { type: String, default: 'Sistem' },
    recipientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recipientName: { type: String, required: true },
    subject: { type: String, required: true, maxlength: 100 },
    message: { type: String, required: true, maxlength: 1000 },
    attachedItems: [{
        itemId: String,
        name: String,
        type: String,
        rarity: String,
        stats: Schema.Types.Mixed
    }],
    attachedGold: { type: Number, default: 0 },
    attachedGems: { type: Number, default: 0 },
    isRead: { type: Boolean, default: false },
    isCollected: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }, // 30 days
    mailType: { type: String, enum: ['player', 'system', 'guild', 'reward'], default: 'player' }
});

// Indexes
MailSchema.index({ recipientId: 1, createdAt: -1 });
MailSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

export const Mail = mongoose.model<IMail>('Mail', MailSchema);
