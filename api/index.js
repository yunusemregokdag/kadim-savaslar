// Vercel Serverless Function for Auth
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const app = express();
app.use(express.json());

// CORS headers
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

const JWT_SECRET = process.env.JWT_SECRET || 'kadim-savaslar-super-secret-jwt-key-2024';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://yunusemregokdag_db_user:cmhmshp2gyegg@cluster0.lpw3x3g.mongodb.net/kadim-savaslar?retryWrites=true&w=majority';
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || '519507497096-ka6f141tsfrrehnnalcnlvbiggji458n.apps.googleusercontent.com');

// MongoDB connection (cached for serverless)
let cachedDb = null;
async function connectToDatabase() {
    if (cachedDb) return cachedDb;
    const conn = await mongoose.connect(MONGODB_URI);
    cachedDb = conn;
    return cachedDb;
}

// User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, sparse: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    googleId: { type: String },
    avatar: { type: String },
    createdAt: { type: Date, default: Date.now }
});

let User;
try {
    User = mongoose.model('User');
} catch {
    User = mongoose.model('User', userSchema);
}

// Auth Middleware
const authMiddleware = async (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Token gerekli' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Geçersiz token' });
    }
};

// Routes
app.get('/api/auth/me', authMiddleware, async (req, res) => {
    try {
        await connectToDatabase();
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
        res.json({ user });
    } catch (err) {
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

app.post('/api/auth/google', async (req, res) => {
    try {
        await connectToDatabase();
        const { token } = req.body;

        // Verify Google token
        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID || '519507497096-ka6f141tsfrrehnnalcnlvbiggji458n.apps.googleusercontent.com'
        });

        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture } = payload;

        // Find or create user
        let user = await User.findOne({ email });
        if (!user) {
            user = new User({
                email,
                username: name || email.split('@')[0],
                googleId,
                avatar: picture
            });
            await user.save();
        } else if (!user.googleId) {
            user.googleId = googleId;
            user.avatar = picture;
            await user.save();
        }

        const jwtToken = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token: jwtToken, user: { id: user._id, email: user.email, username: user.username, avatar: user.avatar } });
    } catch (err) {
        console.error('Google auth error:', err);
        res.status(500).json({ error: 'Google ile giriş başarısız: ' + err.message });
    }
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Catch-all for other /api routes
app.all('/api/*', (req, res) => {
    res.status(404).json({ error: 'API endpoint bulunamadı' });
});

module.exports = app;
