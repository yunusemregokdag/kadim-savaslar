import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

export const validateRequest = (schema: Joi.ObjectSchema) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const { error } = schema.validate(req.body);

        if (error) {
            res.status(400).json({
                error: 'Validation error',
                details: error.details.map(d => d.message),
            });
            return;
        }

        next();
    };
};

// Common validation schemas
export const authSchemas = {
    register: Joi.object({
        username: Joi.string().min(3).max(20).alphanum().required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).max(50).required(),
    }),
    login: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
    }),
};

export const characterSchemas = {
    create: Joi.object({
        name: Joi.string().min(3).max(16).required(),
        class: Joi.string().valid(
            'warrior', 'arctic_knight', 'gale_glaive', 'archer',
            'archmage', 'bard', 'cleric', 'martial_artist', 'monk', 'reaper'
        ).required(),
    }),
};

export const guildSchemas = {
    create: Joi.object({
        name: Joi.string().min(3).max(20).required(),
        tag: Joi.string().min(2).max(5).uppercase().required(),
    }),
};
