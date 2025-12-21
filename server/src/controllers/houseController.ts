import { Response } from 'express';
import { House, HOUSE_CONFIGS, FURNITURE_CATALOG, IFurniture } from '../models/House.js';
import { Character } from '../models/Character.js';
import { AuthRequest } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';

export const houseController = {
    // Get player's house
    async getHouse(req: AuthRequest, res: Response) {
        try {
            const userId = req.userId;

            let house = await House.findOne({ ownerId: userId });

            if (!house) {
                // Auto-create a starter house
                const character = await Character.findOne({ userId });
                if (!character) {
                    return res.status(404).json({ error: 'Character not found' });
                }

                house = new House({
                    ownerId: userId,
                    ownerName: character.name,
                    houseType: 'cottage',
                    level: 1,
                    name: `${character.name}'ın Evi`,
                    furniture: [],
                    storage: [],
                    storageCapacity: HOUSE_CONFIGS.cottage.baseStorage
                });
                await house.save();
            }

            res.json({
                house,
                config: HOUSE_CONFIGS[house.houseType],
                catalog: FURNITURE_CATALOG
            });
        } catch (error) {
            console.error('Get house error:', error);
            res.status(500).json({ error: 'Failed to get house' });
        }
    },

    // Upgrade house type
    async upgradeHouse(req: AuthRequest, res: Response) {
        try {
            const userId = req.userId;
            const { targetType } = req.body;

            if (!['villa', 'mansion', 'castle'].includes(targetType)) {
                return res.status(400).json({ error: 'Invalid house type' });
            }

            const house = await House.findOne({ ownerId: userId });
            if (!house) {
                return res.status(404).json({ error: 'House not found' });
            }

            const character = await Character.findOne({ userId });
            if (!character) {
                return res.status(404).json({ error: 'Character not found' });
            }

            const targetConfig = HOUSE_CONFIGS[targetType as keyof typeof HOUSE_CONFIGS];
            const currentConfig = HOUSE_CONFIGS[house.houseType];

            // Check upgrade path
            const upgradeOrder = ['cottage', 'villa', 'mansion', 'castle'];
            const currentIndex = upgradeOrder.indexOf(house.houseType);
            const targetIndex = upgradeOrder.indexOf(targetType);

            if (targetIndex <= currentIndex) {
                return res.status(400).json({ error: 'Already have this or better house type' });
            }

            // Calculate total cost (cumulative)
            let totalCost = 0;
            for (let i = currentIndex + 1; i <= targetIndex; i++) {
                totalCost += HOUSE_CONFIGS[upgradeOrder[i] as keyof typeof HOUSE_CONFIGS].upgradeCost;
            }

            if (character.gold < totalCost) {
                return res.status(400).json({ error: `Not enough gold. Need ${totalCost} gold` });
            }

            // Deduct gold
            character.gold -= totalCost;
            await character.save();

            // Upgrade house
            house.houseType = targetType as any;
            house.storageCapacity = targetConfig.baseStorage;
            house.lastUpgrade = new Date();
            house.updatedAt = new Date();
            await house.save();

            res.json({
                success: true,
                message: `${targetConfig.name}'ya yükseltildi!`,
                house,
                goldSpent: totalCost
            });
        } catch (error) {
            console.error('Upgrade house error:', error);
            res.status(500).json({ error: 'Failed to upgrade house' });
        }
    },

    // Buy and place furniture
    async buyFurniture(req: AuthRequest, res: Response) {
        try {
            const userId = req.userId;
            const { furnitureId, position } = req.body;

            const house = await House.findOne({ ownerId: userId });
            if (!house) {
                return res.status(404).json({ error: 'House not found' });
            }

            const character = await Character.findOne({ userId });
            if (!character) {
                return res.status(404).json({ error: 'Character not found' });
            }

            const furnitureItem = FURNITURE_CATALOG.find(f => f.id === furnitureId);
            if (!furnitureItem) {
                return res.status(404).json({ error: 'Furniture not found in catalog' });
            }

            // Check level requirement
            if (house.level < furnitureItem.level) {
                return res.status(400).json({ error: `House level ${furnitureItem.level} required` });
            }

            // Check furniture limit
            const houseConfig = HOUSE_CONFIGS[house.houseType];
            if (house.furniture.length >= houseConfig.maxFurniture) {
                return res.status(400).json({ error: 'Maximum furniture limit reached' });
            }

            // Check gold
            if (character.gold < furnitureItem.cost) {
                return res.status(400).json({ error: 'Not enough gold' });
            }

            // Deduct gold
            character.gold -= furnitureItem.cost;
            await character.save();

            // Add furniture
            const newFurniture: IFurniture = {
                id: uuidv4(),
                furnitureId: furnitureItem.id,
                name: furnitureItem.name,
                type: furnitureItem.type as any,
                position: position || { x: 0, y: 0, z: 0 },
                rotation: 0,
                level: 1,
                data: {}
            };

            house.furniture.push(newFurniture);

            // Apply bonuses
            if (furnitureItem.type === 'storage' && 'storageBonus' in furnitureItem) {
                house.storageCapacity += furnitureItem.storageBonus;
            }
            if (furnitureItem.type === 'decoration' && 'decorPoints' in furnitureItem) {
                house.decorationPoints += furnitureItem.decorPoints;
            }

            house.updatedAt = new Date();
            await house.save();

            res.json({
                success: true,
                message: `${furnitureItem.name} satın alındı!`,
                furniture: newFurniture,
                goldSpent: furnitureItem.cost
            });
        } catch (error) {
            console.error('Buy furniture error:', error);
            res.status(500).json({ error: 'Failed to buy furniture' });
        }
    },

    // Move furniture
    async moveFurniture(req: AuthRequest, res: Response) {
        try {
            const userId = req.userId;
            const { furnitureInstanceId, position, rotation } = req.body;

            const house = await House.findOne({ ownerId: userId });
            if (!house) {
                return res.status(404).json({ error: 'House not found' });
            }

            const furnitureIndex = house.furniture.findIndex(f => f.id === furnitureInstanceId);
            if (furnitureIndex === -1) {
                return res.status(404).json({ error: 'Furniture not found' });
            }

            house.furniture[furnitureIndex].position = position;
            if (rotation !== undefined) {
                house.furniture[furnitureIndex].rotation = rotation;
            }

            house.updatedAt = new Date();
            await house.save();

            res.json({ success: true, furniture: house.furniture[furnitureIndex] });
        } catch (error) {
            console.error('Move furniture error:', error);
            res.status(500).json({ error: 'Failed to move furniture' });
        }
    },

    // Remove furniture
    async removeFurniture(req: AuthRequest, res: Response) {
        try {
            const userId = req.userId;
            const { furnitureInstanceId } = req.params;

            const house = await House.findOne({ ownerId: userId });
            if (!house) {
                return res.status(404).json({ error: 'House not found' });
            }

            const furniture = house.furniture.find(f => f.id === furnitureInstanceId);
            if (!furniture) {
                return res.status(404).json({ error: 'Furniture not found' });
            }

            // Remove bonuses
            const catalogItem = FURNITURE_CATALOG.find(f => f.id === furniture.furnitureId);
            if (catalogItem) {
                if (catalogItem.type === 'storage' && 'storageBonus' in catalogItem) {
                    house.storageCapacity = Math.max(HOUSE_CONFIGS[house.houseType].baseStorage, house.storageCapacity - catalogItem.storageBonus);
                }
                if (catalogItem.type === 'decoration' && 'decorPoints' in catalogItem) {
                    house.decorationPoints = Math.max(0, house.decorationPoints - catalogItem.decorPoints);
                }
            }

            house.furniture = house.furniture.filter(f => f.id !== furnitureInstanceId);
            house.updatedAt = new Date();
            await house.save();

            // Refund 50% of cost
            if (catalogItem) {
                const refund = Math.floor(catalogItem.cost * 0.5);
                const character = await Character.findOne({ userId });
                if (character) {
                    character.gold += refund;
                    await character.save();
                }
                return res.json({ success: true, message: 'Furniture removed', refund });
            }

            res.json({ success: true, message: 'Furniture removed' });
        } catch (error) {
            console.error('Remove furniture error:', error);
            res.status(500).json({ error: 'Failed to remove furniture' });
        }
    },

    // Add item to storage
    async addToStorage(req: AuthRequest, res: Response) {
        try {
            const userId = req.userId;
            const { item } = req.body;

            const house = await House.findOne({ ownerId: userId });
            if (!house) {
                return res.status(404).json({ error: 'House not found' });
            }

            // Check capacity
            const currentItems = house.storage.reduce((sum, s) => sum + s.quantity, 0);
            if (currentItems >= house.storageCapacity) {
                return res.status(400).json({ error: 'Storage full' });
            }

            // Check if item exists in storage (stack)
            const existingIndex = house.storage.findIndex(s => s.itemId === item.itemId);
            if (existingIndex !== -1) {
                house.storage[existingIndex].quantity += item.quantity || 1;
            } else {
                house.storage.push({
                    itemId: item.itemId,
                    name: item.name,
                    type: item.type,
                    rarity: item.rarity,
                    quantity: item.quantity || 1,
                    stats: item.stats
                });
            }

            // Remove from character inventory
            const character = await Character.findOne({ userId });
            if (character && character.inventory) {
                character.inventory = character.inventory.filter((i: any) => i.id !== item.itemId);
                await character.save();
            }

            house.updatedAt = new Date();
            await house.save();

            res.json({ success: true, storage: house.storage });
        } catch (error) {
            console.error('Add to storage error:', error);
            res.status(500).json({ error: 'Failed to add to storage' });
        }
    },

    // Remove item from storage
    async removeFromStorage(req: AuthRequest, res: Response) {
        try {
            const userId = req.userId;
            const { itemId, quantity } = req.body;

            const house = await House.findOne({ ownerId: userId });
            if (!house) {
                return res.status(404).json({ error: 'House not found' });
            }

            const itemIndex = house.storage.findIndex(s => s.itemId === itemId);
            if (itemIndex === -1) {
                return res.status(404).json({ error: 'Item not found in storage' });
            }

            const item = house.storage[itemIndex];
            const removeQty = quantity || 1;

            if (item.quantity <= removeQty) {
                house.storage.splice(itemIndex, 1);
            } else {
                house.storage[itemIndex].quantity -= removeQty;
            }

            // Add to character inventory
            const character = await Character.findOne({ userId });
            if (character) {
                const inventory = character.inventory || [];
                inventory.push({
                    id: item.itemId,
                    name: item.name,
                    type: item.type,
                    rarity: item.rarity,
                    quantity: removeQty,
                    stats: item.stats
                });
                character.inventory = inventory;
                await character.save();
            }

            house.updatedAt = new Date();
            await house.save();

            res.json({ success: true, storage: house.storage });
        } catch (error) {
            console.error('Remove from storage error:', error);
            res.status(500).json({ error: 'Failed to remove from storage' });
        }
    },

    // Get active house buffs
    async getBuffs(req: AuthRequest, res: Response) {
        try {
            const userId = req.userId;

            const house = await House.findOne({ ownerId: userId });
            if (!house) {
                return res.json({ buffs: {} });
            }

            const buffs: Record<string, number> = {};

            for (const furniture of house.furniture) {
                const catalogItem = FURNITURE_CATALOG.find(f => f.id === furniture.furnitureId);
                if (catalogItem && catalogItem.type === 'buff' && 'buffType' in catalogItem && 'buffValue' in catalogItem) {
                    const buffType = catalogItem.buffType;
                    const buffValue = catalogItem.buffValue;
                    buffs[buffType] = (buffs[buffType] || 0) + buffValue;
                }
            }

            res.json({ buffs });
        } catch (error) {
            console.error('Get buffs error:', error);
            res.status(500).json({ error: 'Failed to get buffs' });
        }
    },

    // Visit another player's house
    async visitHouse(req: AuthRequest, res: Response) {
        try {
            const userId = req.userId;
            const { ownerName } = req.params;

            const house = await House.findOne({ ownerName });
            if (!house) {
                return res.status(404).json({ error: 'House not found' });
            }

            // Check permissions
            // TODO: Check if visitor is friend or guild member
            if (!house.permissions.publicVisit) {
                return res.status(403).json({ error: 'This house is private' });
            }

            // Log visit
            const character = await Character.findOne({ userId });
            if (character) {
                const existingVisitor = house.visitors.find(v => v.oderId?.toString() === userId);
                if (existingVisitor) {
                    existingVisitor.lastVisit = new Date();
                } else {
                    house.visitors.push({
                        oderId: userId as any,
                        name: character.name,
                        lastVisit: new Date()
                    });
                }
                await house.save();
            }

            res.json({
                house: {
                    ownerName: house.ownerName,
                    houseType: house.houseType,
                    level: house.level,
                    name: house.name,
                    furniture: house.furniture,
                    decorationPoints: house.decorationPoints
                    // Don't expose storage to visitors
                }
            });
        } catch (error) {
            console.error('Visit house error:', error);
            res.status(500).json({ error: 'Failed to visit house' });
        }
    },

    // Update house settings
    async updateSettings(req: AuthRequest, res: Response) {
        try {
            const userId = req.userId;
            const { name, permissions } = req.body;

            const house = await House.findOne({ ownerId: userId });
            if (!house) {
                return res.status(404).json({ error: 'House not found' });
            }

            if (name) house.name = name;
            if (permissions) house.permissions = { ...house.permissions, ...permissions };

            house.updatedAt = new Date();
            await house.save();

            res.json({ success: true, house });
        } catch (error) {
            console.error('Update settings error:', error);
            res.status(500).json({ error: 'Failed to update settings' });
        }
    }
};
