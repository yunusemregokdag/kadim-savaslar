import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

export interface TokenPayload {
    userId: string;
    username: string;
}

export const generateToken = (userId: string, username: string): string => {
    return jwt.sign(
        { userId, username } as TokenPayload,
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn } as jwt.SignOptions
    );
};

export const verifyToken = (token: string): TokenPayload | null => {
    try {
        const decoded = jwt.verify(token, config.jwt.secret) as TokenPayload;
        return decoded;
    } catch (error) {
        return null;
    }
};
