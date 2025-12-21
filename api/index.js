// Vercel Serverless Function for Auth - Simplified
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const JWT_SECRET = process.env.JWT_SECRET || 'kadim-savaslar-super-secret-jwt-key-2024';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://yunusemregokdag_db_user:cmhmshp2gyegg@cluster0.lpw3x3g.mongodb.net/kadim-savaslar?retryWrites=true&w=majority';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '519507497096-ka6f141tsfrrehnnalcnlvbiggji458n.apps.googleusercontent.com';

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// MongoDB connection (cached for serverless)
let cachedDb = null;

async function connectToDatabase() {
    if (cachedDb && mongoose.connection.readyState === 1) {
        return cachedDb;
    }
    try {
        await mongoose.connect(MONGODB_URI);
        cachedDb = mongoose.connection;
        return cachedDb;
    } catch (err) {
        console.error('MongoDB connection error:', err);
        throw err;
    }
}

// User Schema
const userSchema = new mongoose.Schema({
    username: { type: String },
    email: { type: String, required: true },
    password: { type: String },
    googleId: { type: String },
    avatar: { type: String },
    createdAt: { type: Date, default: Date.now }
});

// Get or create User model
function getUserModel() {
    try {
        return mongoose.model('User');
    } catch {
        return mongoose.model('User', userSchema);
    }
}

// Main handler
module.exports = async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const url = req.url;

    // Health check - no DB needed
    if (url === '/api/health' || url === '/api/health/') {
        return res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
    }

    try {
        // Connect to DB for other routes
        await connectToDatabase();
        const User = getUserModel();

        // Google Auth
        if (url === '/api/auth/google' || url === '/api/auth/google/') {
            if (req.method !== 'POST') {
                return res.status(405).json({ error: 'Method not allowed' });
            }

            const { token } = req.body;
            if (!token) {
                return res.status(400).json({ error: 'Token gerekli' });
            }

            // Verify Google token
            const ticket = await googleClient.verifyIdToken({
                idToken: token,
                audience: GOOGLE_CLIENT_ID
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

            const jwtToken = jwt.sign(
                { userId: user._id, email: user.email },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            return res.status(200).json({
                token: jwtToken,
                user: {
                    id: user._id,
                    email: user.email,
                    username: user.username,
                    avatar: user.avatar
                }
            });
        }

        // Auth Me
        if (url === '/api/auth/me' || url === '/api/auth/me/') {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({ error: 'Token gerekli' });
            }

            const token = authHeader.replace('Bearer ', '');
            try {
                const decoded = jwt.verify(token, JWT_SECRET);
                const user = await User.findById(decoded.userId).select('-password');
                if (!user) {
                    return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
                }
                return res.status(200).json({ user });
            } catch (err) {
                return res.status(401).json({ error: 'Geçersiz token' });
            }
        }

        // Not found
        return res.status(404).json({ error: 'API endpoint bulunamadı', url });

    } catch (err) {
        console.error('API error:', err);
        return res.status(500).json({ error: 'Sunucu hatası: ' + err.message });
    }
};
