import { Request, Response } from 'express';
import { Character } from '../models/Character.js';
import { AuthRequest } from '../middleware/auth.js';

export const characterController = {
    // Create new character
    async create(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;
            const { name, class: charClass } = req.body;

            // Check if user already has max characters (3)
            const existingCount = await Character.countDocuments({ userId });
            if (existingCount >= 3) {
                res.status(400).json({ error: 'Maximum 3 characters allowed per account' });
                return;
            }

            // Check if character name is taken
            const existingName = await Character.findOne({ name });
            if (existingName) {
                res.status(400).json({ error: 'Character name already taken' });
                return;
            }

            // Class-based starting stats
            const classStats: Record<string, { hp: number; mana: number; strength: number; defense: number; intelligence: number; dexterity: number }> = {
                warrior: { hp: 150, mana: 50, strength: 15, defense: 12, intelligence: 5, dexterity: 8 },
                arctic_knight: { hp: 140, mana: 70, strength: 12, defense: 14, intelligence: 8, dexterity: 6 },
                gale_glaive: { hp: 120, mana: 60, strength: 14, defense: 8, intelligence: 6, dexterity: 12 },
                archer: { hp: 100, mana: 60, strength: 8, defense: 6, intelligence: 8, dexterity: 18 },
                archmage: { hp: 80, mana: 150, strength: 5, defense: 5, intelligence: 20, dexterity: 5 },
                bard: { hp: 90, mana: 120, strength: 6, defense: 6, intelligence: 15, dexterity: 8 },
                cleric: { hp: 110, mana: 130, strength: 8, defense: 10, intelligence: 16, dexterity: 6 },
                martial_artist: { hp: 130, mana: 40, strength: 16, defense: 8, intelligence: 5, dexterity: 11 },
                monk: { hp: 120, mana: 80, strength: 10, defense: 10, intelligence: 10, dexterity: 10 },
                reaper: { hp: 110, mana: 70, strength: 14, defense: 6, intelligence: 10, dexterity: 10 },
            };

            const stats = classStats[charClass] || classStats.warrior;

            // Create character
            const character = new Character({
                userId,
                name,
                class: charClass,
                level: 1,
                exp: 0,
                hp: stats.hp,
                maxHp: stats.hp,
                mana: stats.mana,
                maxMana: stats.mana,
                strength: stats.strength,
                defense: stats.defense,
                intelligence: stats.intelligence,
                dexterity: stats.dexterity,
                gold: 1000,
                position: { x: 0, y: 0, z: 0 },
                currentZone: 1,
                inventory: [],
                equipment: {},
                skills: [],
                questProgress: [],
                achievements: [],
                pvpStats: { kills: 0, deaths: 0, rating: 1000 },
            });

            await character.save();

            res.status(201).json({
                message: 'Character created successfully',
                character: {
                    id: character._id,
                    name: character.name,
                    class: character.class,
                    level: character.level,
                    stats: {
                        hp: character.hp,
                        mana: character.mana,
                        strength: character.strength,
                        defense: character.defense,
                        intelligence: character.intelligence,
                        dexterity: character.dexterity,
                    },
                },
            });
        } catch (error) {
            console.error('Create character error:', error);
            res.status(500).json({ error: 'Failed to create character' });
        }
    },

    // Get all characters for user
    async list(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;

            const characters = await Character.find({ userId }).select('-inventory -equipment -questProgress -achievements');

            res.json({ characters });
        } catch (error) {
            console.error('List characters error:', error);
            res.status(500).json({ error: 'Failed to get characters' });
        }
    },

    // Get single character details
    async get(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;
            const { id } = req.params;

            const character = await Character.findOne({ _id: id, userId });

            if (!character) {
                res.status(404).json({ error: 'Character not found' });
                return;
            }

            res.json({ character });
        } catch (error) {
            console.error('Get character error:', error);
            res.status(500).json({ error: 'Failed to get character' });
        }
    },

    // Update character (position, stats, etc.)
    async update(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;
            const { id } = req.params;
            const updates = req.body;

            // Fields that cannot be updated directly
            const protectedFields = ['_id', 'userId', 'name', 'class', 'createdAt'];
            protectedFields.forEach(field => delete updates[field]);

            const character = await Character.findOneAndUpdate(
                { _id: id, userId },
                { $set: updates, lastPlayed: new Date() },
                { new: true }
            );

            if (!character) {
                res.status(404).json({ error: 'Character not found' });
                return;
            }

            res.json({ message: 'Character updated', character });
        } catch (error) {
            console.error('Update character error:', error);
            res.status(500).json({ error: 'Failed to update character' });
        }
    },

    // Delete character
    async delete(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;
            const { id } = req.params;

            console.log(`[DELETE DEBUG] Attempting to delete character. ID: ${id}, UserID: ${userId}`);

            const character = await Character.findOneAndDelete({ _id: id, userId });

            if (!character) {
                console.log(`[DELETE DEBUG] Character not found or not owned by user. ID: ${id}`);
                res.status(404).json({ error: 'Character not found' });
                return;
            }

            console.log(`[DELETE DEBUG] Character deleted successfully: ${character.name}`);
            res.json({ message: 'Character deleted successfully' });
        } catch (error) {
            console.error('[DELETE DEBUG] Delete character error:', error);
            res.status(500).json({ error: 'Failed to delete character' });
        }
    },

    // Save character progress (called periodically from game)
    async saveProgress(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;
            const { id } = req.params;
            const { position, currentZone, hp, mana, exp, level, gold, inventory, equipment } = req.body;

            const character = await Character.findOneAndUpdate(
                { _id: id, userId },
                {
                    $set: {
                        position,
                        currentZone,
                        hp,
                        mana,
                        exp,
                        level,
                        gold,
                        inventory,
                        equipment,
                        lastPlayed: new Date(),
                    },
                },
                { new: true }
            );

            if (!character) {
                res.status(404).json({ error: 'Character not found' });
                return;
            }

            res.json({ message: 'Progress saved', lastPlayed: character.lastPlayed });
        } catch (error) {
            console.error('Save progress error:', error);
            res.status(500).json({ error: 'Failed to save progress' });
        }
    },
};
