// Vercel Serverless Function - Full API with ES Modules
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

const JWT_SECRET = process.env.JWT_SECRET || 'kadim-savaslar-super-secret-jwt-key-2024';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://yunusemregokdag_db_user:cmhmshp2gyegg@cluster0.lpw3x3g.mongodb.net/kadim-savaslar?retryWrites=true&w=majority';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '519507497096-ka6f141tsfrrehnnalcnlvbiggji458n.apps.googleusercontent.com';
const BETA_MODE = true;

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// MongoDB connection cache
let cachedDb = null;

async function connectToDatabase() {
    if (cachedDb && mongoose.connection.readyState === 1) {
        return cachedDb;
    }
    await mongoose.connect(MONGODB_URI);
    cachedDb = mongoose.connection;
    return cachedDb;
}

// Schemas
const userSchema = new mongoose.Schema({
    username: { type: String },
    email: { type: String, required: true },
    password: { type: String },
    googleId: { type: String },
    avatar: { type: String },
    createdAt: { type: Date, default: Date.now }
});

const characterSchema = new mongoose.Schema({
    odaId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    class: { type: String, required: true },
    faction: { type: String, default: 'marsu' },
    level: { type: Number, default: BETA_MODE ? 30 : 1 },
    gameData: { type: Object, default: {} },
    createdAt: { type: Date, default: Date.now }
});

function getUserModel() {
    try { return mongoose.model('User'); }
    catch { return mongoose.model('User', userSchema); }
}

function getCharacterModel() {
    try { return mongoose.model('Character'); }
    catch { return mongoose.model('Character', characterSchema); }
}

// Auth middleware helper
function verifyToken(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    try {
        return jwt.verify(authHeader.replace('Bearer ', ''), JWT_SECRET);
    } catch { return null; }
}

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const url = req.url;

    // Health check
    if (url.includes('/api/health')) {
        return res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
    }

    try {
        await connectToDatabase();
        const User = getUserModel();
        const Character = getCharacterModel();

        // ===== AUTH ROUTES =====
        if (url.includes('/api/auth/google') && req.method === 'POST') {
            const { token } = req.body || {};
            if (!token) return res.status(400).json({ error: 'Token gerekli' });

            const ticket = await googleClient.verifyIdToken({ idToken: token, audience: GOOGLE_CLIENT_ID });
            const { sub: googleId, email, name, picture } = ticket.getPayload();

            let user = await User.findOne({ email });
            if (!user) {
                user = new User({ email, username: name || email.split('@')[0], googleId, avatar: picture });
                await user.save();
            }

            const jwtToken = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
            return res.status(200).json({ token: jwtToken, user: { id: user._id, email: user.email, username: user.username, avatar: user.avatar } });
        }

        if (url.includes('/api/auth/me')) {
            const decoded = verifyToken(req);
            if (!decoded) return res.status(401).json({ error: 'Token gerekli' });
            const user = await User.findById(decoded.userId).select('-password');
            if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
            return res.status(200).json({ user });
        }

        // ===== CHARACTER ROUTES =====
        // List characters
        if (url.match(/\/api\/characters\/?$/) && req.method === 'GET') {
            const decoded = verifyToken(req);
            if (!decoded) return res.status(401).json({ error: 'Yetkilendirme gerekli' });
            const characters = await Character.find({ odaId: decoded.userId });
            return res.status(200).json({ characters });
        }

        // Create character
        if (url.match(/\/api\/characters\/?$/) && req.method === 'POST') {
            const decoded = verifyToken(req);
            if (!decoded) return res.status(401).json({ error: 'Yetkilendirme gerekli' });
            const { name } = req.body || {};
            const charClass = req.body?.class || req.body?.charClass;
            if (!name || !charClass) return res.status(400).json({ error: 'İsim ve sınıf gerekli', received: req.body });

            const character = new Character({ odaId: decoded.userId, name, class: charClass });
            await character.save();
            return res.status(201).json({ character: { id: character._id, name: character.name, class: character.class, level: character.level } });
        }

        // Get single character
        const charGetMatch = url.match(/\/api\/characters\/([a-f0-9]+)\/?$/);
        if (charGetMatch && req.method === 'GET') {
            const character = await Character.findById(charGetMatch[1]);
            if (!character) return res.status(404).json({ error: 'Karakter bulunamadı' });
            return res.status(200).json({ character });
        }

        // Save character
        const charSaveMatch = url.match(/\/api\/characters\/([a-f0-9]+)\/save\/?$/);
        if (charSaveMatch && req.method === 'POST') {
            const decoded = verifyToken(req);
            if (!decoded) return res.status(401).json({ error: 'Yetkilendirme gerekli' });

            const character = await Character.findById(charSaveMatch[1]);
            if (!character) return res.status(404).json({ error: 'Karakter bulunamadı' });

            character.gameData = req.body?.gameData || character.gameData;
            await character.save();
            return res.status(200).json({ success: true });
        }

        // Delete character
        const charDeleteMatch = url.match(/\/api\/characters\/([a-f0-9]+)\/?$/);
        if (charDeleteMatch && req.method === 'DELETE') {
            const decoded = verifyToken(req);
            if (!decoded) return res.status(401).json({ error: 'Yetkilendirme gerekli' });
            await Character.findByIdAndDelete(charDeleteMatch[1]);
            return res.status(200).json({ success: true });
        }

        return res.status(404).json({ error: 'Not found', url });

    } catch (err) {
        console.error('API Error:', err);
        return res.status(500).json({ error: 'Server error: ' + err.message });
    }
}
