import mongoose, { Document, Schema } from 'mongoose';

export type FriendStatus = 'pending' | 'accepted' | 'blocked';

export interface IFriend extends Document {
    userId: mongoose.Types.ObjectId;
    friendId: mongoose.Types.ObjectId;
    friendName: string;
    status: FriendStatus;
    createdAt: Date;
    updatedAt: Date;
}

const FriendSchema = new Schema<IFriend>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    friendId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    friendName: { type: String, required: true },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'blocked'],
        default: 'pending'
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Compound index for uniqueness
FriendSchema.index({ userId: 1, friendId: 1 }, { unique: true });
FriendSchema.index({ userId: 1, status: 1 });

export const Friend = mongoose.model<IFriend>('Friend', FriendSchema);
