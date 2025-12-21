import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.js';

export interface AuthRequest extends Request {
    user?: {
        userId: string;
        username: string;
    };
    // Convenience getter
    userId?: string;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            res.status(401).json({ error: 'No token provided' });
            return;
        }

        const token = authHeader.startsWith('Bearer ')
            ? authHeader.substring(7)
            : authHeader;

        const decoded = verifyToken(token);

        if (!decoded) {
            res.status(401).json({ error: 'Invalid or expired token' });
            return;
        }

        req.user = decoded;
        req.userId = decoded.userId; // Convenience property
        next();
    } catch (error) {
        res.status(500).json({ error: 'Authentication error' });
    }
};

// Alias for compatibility
export const authMiddleware = authenticate;
