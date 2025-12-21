import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    username: string;
    email: string;
    passwordHash: string;
    createdAt: Date;
    lastLogin: Date;
    premiumUntil: Date | null;
    vipLevel: number;
    gems: number;
    banned: boolean;
    banReason: string | null;
    verified: boolean;
}

const UserSchema: Schema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 20,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    passwordHash: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    lastLogin: {
        type: Date,
        default: Date.now,
    },
    premiumUntil: {
        type: Date,
        default: null,
    },
    vipLevel: {
        type: Number,
        default: 0,
        min: 0,
        max: 10,
    },
    gems: {
        type: Number,
        default: 0,
    },
    banned: {
        type: Boolean,
        default: false,
    },
    banReason: {
        type: String,
        default: null,
    },
    verified: {
        type: Boolean,
        default: false,
    },
});

// Indexes for performance
UserSchema.index({ username: 1 });
UserSchema.index({ email: 1 });

export const User = mongoose.model<IUser>('User', UserSchema);
