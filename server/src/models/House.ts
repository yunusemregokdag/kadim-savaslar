import mongoose, { Document, Schema } from 'mongoose';

export type HouseType = 'cottage' | 'villa' | 'mansion' | 'castle';
export type FurnitureType = 'storage' | 'decoration' | 'crafting' | 'buff';

export interface IFurniture {
    id: string;
    furnitureId: string;
    name: string;
    type: FurnitureType;
    position: { x: number, y: number, z: number };
    rotation: number;
    level: number;
    data?: Record<string, any>; // Storage contents, buff type, etc.
}

export interface IHouse extends Document {
    ownerId: mongoose.Types.ObjectId;
    ownerName: string;
    houseType: HouseType;
    level: number;
    name: string;
    furniture: IFurniture[];
    storage: Array<{
        itemId: string;
        name: string;
        type: string;
        rarity: string;
        quantity: number;
        stats?: Record<string, number>;
    }>;
    storageCapacity: number;
    visitors: Array<{
        oderId: mongoose.Types.ObjectId;
        name: string;
        lastVisit: Date;
    }>;
    permissions: {
        friendsCanVisit: boolean;
        guildCanVisit: boolean;
        publicVisit: boolean;
    };
    decorationPoints: number;
    lastUpgrade: Date;
    createdAt: Date;
    updatedAt: Date;
}

const HouseSchema = new Schema<IHouse>({
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    ownerName: { type: String, required: true },
    houseType: {
        type: String,
        enum: ['cottage', 'villa', 'mansion', 'castle'],
        default: 'cottage'
    },
    level: { type: Number, default: 1, min: 1, max: 10 },
    name: { type: String, default: 'Evim' },
    furniture: [{
        id: String,
        furnitureId: String,
        name: String,
        type: { type: String, enum: ['storage', 'decoration', 'crafting', 'buff'] },
        position: {
            x: { type: Number, default: 0 },
            y: { type: Number, default: 0 },
            z: { type: Number, default: 0 }
        },
        rotation: { type: Number, default: 0 },
        level: { type: Number, default: 1 },
        data: Schema.Types.Mixed
    }],
    storage: [{
        itemId: String,
        name: String,
        type: String,
        rarity: String,
        quantity: { type: Number, default: 1 },
        stats: Schema.Types.Mixed
    }],
    storageCapacity: { type: Number, default: 50 },
    visitors: [{
        oderId: { type: Schema.Types.ObjectId, ref: 'User' },
        name: String,
        lastVisit: Date
    }],
    permissions: {
        friendsCanVisit: { type: Boolean, default: true },
        guildCanVisit: { type: Boolean, default: true },
        publicVisit: { type: Boolean, default: false }
    },
    decorationPoints: { type: Number, default: 0 },
    lastUpgrade: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Indexes
HouseSchema.index({ ownerId: 1 });
HouseSchema.index({ ownerName: 1 });

// House type configurations
export const HOUSE_CONFIGS = {
    cottage: {
        name: 'Kulübe',
        maxFurniture: 10,
        baseStorage: 50,
        upgradeCost: 0,
        description: 'Basit ama sıcak bir yuva'
    },
    villa: {
        name: 'Villa',
        maxFurniture: 25,
        baseStorage: 100,
        upgradeCost: 50000,
        description: 'Geniş ve konforlu yaşam alanı'
    },
    mansion: {
        name: 'Konak',
        maxFurniture: 50,
        baseStorage: 200,
        upgradeCost: 200000,
        description: 'Gösterişli ve lüks bir malikane'
    },
    castle: {
        name: 'Kale',
        maxFurniture: 100,
        baseStorage: 500,
        upgradeCost: 1000000,
        description: 'Bir kral/kraliçeye yaraşır muhteşem kale'
    }
};

// Furniture catalog
export const FURNITURE_CATALOG = [
    // Storage
    { id: 'chest_basic', name: 'Ahşap Sandık', type: 'storage', cost: 1000, storageBonus: 10, level: 1 },
    { id: 'chest_iron', name: 'Demir Sandık', type: 'storage', cost: 5000, storageBonus: 25, level: 3 },
    { id: 'chest_gold', name: 'Altın Sandık', type: 'storage', cost: 20000, storageBonus: 50, level: 5 },
    { id: 'vault', name: 'Hazine Kasası', type: 'storage', cost: 100000, storageBonus: 100, level: 7 },

    // Decorations
    { id: 'painting_small', name: 'Küçük Tablo', type: 'decoration', cost: 500, decorPoints: 5, level: 1 },
    { id: 'painting_large', name: 'Büyük Tablo', type: 'decoration', cost: 2000, decorPoints: 15, level: 2 },
    { id: 'statue_bronze', name: 'Bronz Heykel', type: 'decoration', cost: 10000, decorPoints: 30, level: 4 },
    { id: 'statue_gold', name: 'Altın Heykel', type: 'decoration', cost: 50000, decorPoints: 75, level: 6 },
    { id: 'fountain', name: 'Süs Havuzu', type: 'decoration', cost: 25000, decorPoints: 50, level: 5 },
    { id: 'chandelier', name: 'Kristal Avize', type: 'decoration', cost: 30000, decorPoints: 60, level: 5 },
    { id: 'carpet_royal', name: 'Kraliyet Halısı', type: 'decoration', cost: 15000, decorPoints: 40, level: 4 },

    // Crafting
    { id: 'workbench', name: 'Çalışma Tezgahı', type: 'crafting', cost: 5000, craftingBonus: 5, level: 2 },
    { id: 'forge', name: 'Demirci Ocağı', type: 'crafting', cost: 20000, craftingBonus: 10, level: 4 },
    { id: 'alchemy_table', name: 'Simya Masası', type: 'crafting', cost: 15000, craftingBonus: 8, level: 3 },

    // Buff
    { id: 'bed_simple', name: 'Basit Yatak', type: 'buff', cost: 2000, buffType: 'regen', buffValue: 5, level: 1 },
    { id: 'bed_luxury', name: 'Lüks Yatak', type: 'buff', cost: 15000, buffType: 'regen', buffValue: 15, level: 4 },
    { id: 'training_dummy', name: 'Antrenman Mankeni', type: 'buff', cost: 10000, buffType: 'damage', buffValue: 3, level: 3 },
    { id: 'meditation_spot', name: 'Meditasyon Köşesi', type: 'buff', cost: 12000, buffType: 'mana', buffValue: 10, level: 3 },
    { id: 'trophy_case', name: 'Kupa Dolabı', type: 'buff', cost: 8000, buffType: 'exp', buffValue: 5, level: 2 }
];

export const House = mongoose.model<IHouse>('House', HouseSchema);
