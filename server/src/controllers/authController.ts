import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { generateToken } from '../utils/jwt.js';

export const authController = {
    // Register new user
    async register(req: Request, res: Response): Promise<void> {
        try {
            const { username, email, password } = req.body;

            // Check if user already exists
            const existingUser = await User.findOne({
                $or: [{ email }, { username }]
            });

            if (existingUser) {
                res.status(400).json({
                    error: existingUser.email === email
                        ? 'Email already registered'
                        : 'Username already taken'
                });
                return;
            }

            // Hash password
            const passwordHash = await bcrypt.hash(password, 10);

            // Create user
            const user = new User({
                username,
                email,
                passwordHash,
            });

            await user.save();

            // Generate token
            const token = generateToken(user._id.toString(), user.username);

            res.status(201).json({
                message: 'User registered successfully',
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    premiumUntil: user.premiumUntil,
                    vipLevel: user.vipLevel,
                },
            });
        } catch (error) {
            console.error('Register error:', error);
            res.status(500).json({ error: 'Registration failed' });
        }
    },

    // Login
    async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;

            // Find user
            const user = await User.findOne({ email });

            if (!user) {
                res.status(401).json({ error: 'Invalid email or password' });
                return;
            }

            // Check if banned
            if (user.banned) {
                res.status(403).json({
                    error: 'Account banned',
                    reason: user.banReason || 'No reason provided'
                });
                return;
            }

            // Verify password
            const isValid = await bcrypt.compare(password, user.passwordHash);

            if (!isValid) {
                res.status(401).json({ error: 'Invalid email or password' });
                return;
            }

            // Update last login
            user.lastLogin = new Date();
            await user.save();

            // Generate token
            const token = generateToken(user._id.toString(), user.username);

            res.json({
                message: 'Login successful',
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    premiumUntil: user.premiumUntil,
                    vipLevel: user.vipLevel,
                    lastLogin: user.lastLogin,
                },
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'Login failed' });
        }
    },

    // Get current user info (protected route)
    async me(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.userId;

            const user = await User.findById(userId).select('-passwordHash');

            if (!user) {
                res.status(404).json({ error: 'User not found' });
                return;
            }

            res.json({ user });
        } catch (error) {
            console.error('Get user error:', error);
            res.status(500).json({ error: 'Failed to get user info' });
        }
    },
};
