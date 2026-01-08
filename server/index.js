
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken'); // Kullanıcı yetkilendirme için
const { OAuth2Client } = require('google-auth-library'); // Google Auth
const path = require('path'); // Path modülü eklendi

const app = express();
const server = http.createServer(app); // http server'ı express uygulamasıyla oluştur
app.use(cors());
app.use(express.json());

// Railway Healthcheck için root endpoint (API)
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// STATİK DOSYA SUNUMU (FRONTEND İÇİN)
// Production ortamında frontend build dosyalarını sun
if (process.env.NODE_ENV === 'production') {
    // Dist klasörünü statik olarak sun
    app.use(express.static(path.join(__dirname, '../dist')));

    // Diğer tüm istekleri index.html'e yönlendir (SPA support)
    app.get('*', (req, res) => {
        // API isteklerini engelleme
        if (req.path.startsWith('/api')) {
            return res.status(404).json({ error: 'Endpoint not found' });
        }
        res.sendFile(path.join(__dirname, '../dist', 'index.html'));
    });
} else {
    // Dev modunda basit mesaj
    app.get('/', (req, res) => {
        res.send('Kadim Savaslar Backend is Running! 🚀 (Dev Mode - Use Vite for Frontend)');
    });
}

// Railway/Heroku uyumlu PORT
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key'; // Bunu .env'e taşımak en iyisi

// Google Client ID (Frontend'den gelecek token'ı doğrulamak için)
// Güvenlik için bunu .env dosyasında saklamalısın ama şimdilik kodda dursun veya boş geçelim
// Client ID'yi henüz oluşturmadığın için şimdilik boş bırakıyorum veya sonra parametre olarak alacağız.
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ============================================
// MONGODB BAĞLANTISI
// ============================================
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://yunusemregokdag_db_user:cmhmshp2gyegg@cluster0.lpw3x3g.mongodb.net/kadim-savaslar?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ MongoDB bağlantısı başarılı!'))
    .catch(err => console.error('❌ MongoDB bağlantı hatası:', err));

// ============================================
// MONGOOSE ŞEMALARI
// ============================================

// Kullanıcı Şeması
// Kullanıcı Şeması
const userSchema = new mongoose.Schema({
    username: { type: String, unique: true }, // Google Login için gerekli
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Google Login'de şifre olmayabilir
    googleId: { type: String }, // Google ID
    avatar: { type: String }, // Google Profil Resmi
    createdAt: { type: Date, default: Date.now }
});

// ============================================
// BETA MODE - Tüm yeni karakterler max stats ile başlar
// Production'da bu değerleri düşür!
// ============================================
const BETA_MODE = true;

// Karakter Şeması
const characterSchema = new mongoose.Schema({
    odaId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    class: { type: String, required: true },
    faction: { type: String, default: 'marsu' },
    // BETA: Max level ve kaynaklar
    level: { type: Number, default: BETA_MODE ? 30 : 1 },
    exp: { type: Number, default: BETA_MODE ? 999999 : 0 },
    credits: { type: Number, default: BETA_MODE ? 1000000 : 500 },
    gems: { type: Number, default: BETA_MODE ? 10000 : 10 },
    honor: { type: Number, default: BETA_MODE ? 50000 : 0 },
    rankPoints: { type: Number, default: BETA_MODE ? 10000 : 0 },
    rank: { type: Number, default: BETA_MODE ? 10 : 0 },
    // BETA: Max HP/Mana
    hp: { type: Number, default: BETA_MODE ? 5000 : 500 },
    maxHp: { type: Number, default: BETA_MODE ? 5000 : 500 },
    mana: { type: Number, default: BETA_MODE ? 2000 : 100 },
    maxMana: { type: Number, default: BETA_MODE ? 2000 : 100 },
    // BETA: Yüksek damage/defense
    damage: { type: Number, default: BETA_MODE ? 500 : 20 },
    defense: { type: Number, default: BETA_MODE ? 200 : 5 },
    // BETA: Max base stats
    strength: { type: Number, default: BETA_MODE ? 100 : 10 },
    dexterity: { type: Number, default: BETA_MODE ? 100 : 10 },
    intelligence: { type: Number, default: BETA_MODE ? 100 : 10 },
    vitality: { type: Number, default: BETA_MODE ? 100 : 10 },
    statPoints: { type: Number, default: BETA_MODE ? 50 : 0 },
    inventory: { type: Array, default: [] },
    equipment: { type: Object, default: {} },
    ownedWings: { type: Array, default: [] },
    equippedWing: { type: Object, default: null },
    ownedPets: { type: Array, default: [] },
    equippedPet: { type: Object, default: null },
    guildId: { type: mongoose.Schema.Types.ObjectId, ref: 'Guild', default: null },
    lastLogin: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now }
});

// Guild Şeması
const guildSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    tag: { type: String, required: true, maxlength: 4 },
    leaderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Character', required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Character' }],
    level: { type: Number, default: 1 },
    exp: { type: Number, default: 0 },
    gold: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

// Leaderboard Cache Şeması
const leaderboardSchema = new mongoose.Schema({
    type: { type: String, required: true }, // 'level', 'honor', 'gold'
    entries: { type: Array, default: [] },
    updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Character = mongoose.model('Character', characterSchema);
const Guild = mongoose.model('Guild', guildSchema);
const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);

// ============================================
// REST API ENDPOINTS
// ============================================

// Health check
app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Kadim Savaşlar Game Server',
        players: Object.keys(players).length,
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        uptime: process.uptime(),
        mongodb: mongoose.connection.readyState === 1
    });
});

// Kayıt
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Bu email zaten kayıtlı' });
        }
        const user = new User({ email, password });
        await user.save();
        res.json({ success: true, userId: user._id });
    } catch (err) {
        res.status(500).json({ error: 'Kayıt hatası' });
    }
});


// ============================================
// GOOGLE AUTH ROUTE
// ============================================
app.post('/api/auth/google', async (req, res) => {
    try {
        const { token } = req.body; // Frontend'den gelen credential

        // 1. Google Token Doğrulama
        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: "519507497096-ka6f141tsfrrehnnalcnlvbiggji458n.apps.googleusercontent.com"
        });
        const payload = ticket.getPayload();

        const email = payload.email;
        const googleId = payload.sub;
        const name = payload.name;
        const picture = payload.picture;

        // 2. Kullanıcıyı Bul veya Oluştur
        let user = await User.findOne({ email });

        if (!user) {
            // Yeni Kullanıcı Oluştur
            user = new User({
                username: name.replace(/\s+/g, '_') + Math.floor(Math.random() * 1000), // Benzersiz username
                email: email,
                password: uuidv4(), // Rastgele şifre
                googleId: googleId,
                avatar: picture
            });
            await user.save();
        }

        // 3. JWT Token Oluştur
        const jwtToken = jwt.sign(
            { userId: user._id, email: user.email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // 4. Kullanıcı bilgilerini dön (şifre hariç)
        res.json({
            token: jwtToken,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Google Auth Error:', error);
        res.status(401).json({ error: 'Google authentication failed' });
    }
});

// Giriş
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email, password });
        if (!user) {
            return res.status(401).json({ error: 'Email veya şifre hatalı' });
        }
        const characters = await Character.find({ odaId: user._id });
        res.json({ success: true, userId: user._id, characters });
    } catch (err) {
        res.status(500).json({ error: 'Giriş hatası' });
    }
});

// Karakter oluştur
app.post('/api/characters/create', async (req, res) => {
    try {
        const { userId, name, charClass, faction } = req.body;
        const character = new Character({
            odaId: userId,
            name,
            class: charClass,
            faction: faction || 'marsu'
        });
        await character.save();
        res.json({ success: true, character });
    } catch (err) {
        res.status(500).json({ error: 'Karakter oluşturma hatası' });
    }
});

// Karakter yükle
app.get('/api/characters/:id', async (req, res) => {
    try {
        const character = await Character.findById(req.params.id);
        if (!character) {
            return res.status(404).json({ error: 'Karakter bulunamadı' });
        }
        res.json({ success: true, character });
    } catch (err) {
        res.status(500).json({ error: 'Karakter yükleme hatası' });
    }
});

// Karakter kaydet
app.post('/api/characters/:id/save', async (req, res) => {
    try {
        const updateData = req.body;
        const character = await Character.findByIdAndUpdate(
            req.params.id,
            { ...updateData, lastLogin: new Date() },
            { new: true }
        );
        if (!character) {
            return res.status(404).json({ error: 'Karakter bulunamadı' });
        }
        res.json({ success: true, character });
    } catch (err) {
        res.status(500).json({ error: 'Kaydetme hatası' });
    }
});

// Leaderboard - Level
app.get('/api/leaderboard/level', async (req, res) => {
    try {
        const characters = await Character.find()
            .sort({ level: -1, exp: -1 })
            .limit(100)
            .select('name class level faction');
        res.json({ success: true, leaderboard: characters });
    } catch (err) {
        res.status(500).json({ error: 'Leaderboard hatası' });
    }
});

// Leaderboard - Honor
app.get('/api/leaderboard/honor', async (req, res) => {
    try {
        const characters = await Character.find()
            .sort({ honor: -1 })
            .limit(100)
            .select('name class honor faction');
        res.json({ success: true, leaderboard: characters });
    } catch (err) {
        res.status(500).json({ error: 'Leaderboard hatası' });
    }
});

// Leaderboard - Gold
app.get('/api/leaderboard/gold', async (req, res) => {
    try {
        const characters = await Character.find()
            .sort({ credits: -1 })
            .limit(100)
            .select('name class credits faction');
        res.json({ success: true, leaderboard: characters });
    } catch (err) {
        res.status(500).json({ error: 'Leaderboard hatası' });
    }
});

// Guild listesi
app.get('/api/guilds', async (req, res) => {
    try {
        const guilds = await Guild.find()
            .populate('leaderId', 'name')
            .sort({ level: -1 });
        res.json({ success: true, guilds });
    } catch (err) {
        res.status(500).json({ error: 'Guild listesi hatası' });
    }
});

// Guild oluştur
app.post('/api/guilds/create', async (req, res) => {
    try {
        const { name, tag, leaderId } = req.body;
        const guild = new Guild({
            name,
            tag,
            leaderId,
            members: [leaderId]
        });
        await guild.save();
        await Character.findByIdAndUpdate(leaderId, { guildId: guild._id });
        res.json({ success: true, guild });
    } catch (err) {
        res.status(500).json({ error: 'Guild oluşturma hatası' });
    }
});

// Guild'e katıl
app.post('/api/guilds/:id/join', async (req, res) => {
    try {
        const { characterId } = req.body;
        const guild = await Guild.findById(req.params.id);
        if (!guild) {
            return res.status(404).json({ error: 'Guild bulunamadı' });
        }
        if (guild.members.length >= 50) {
            return res.status(400).json({ error: 'Guild dolu' });
        }
        guild.members.push(characterId);
        await guild.save();
        await Character.findByIdAndUpdate(characterId, { guildId: guild._id });
        res.json({ success: true, guild });
    } catch (err) {
        res.status(500).json({ error: 'Guild katılma hatası' });
    }
});

// ============================================
// SOCKET.IO SERVER
// ============================================

// NOT: server değişkeni dosyanın başında (satır 12) tanımlanmıştır.
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },
    transports: ['websocket', 'polling']
});

// In-memory player states (for real-time sync)
let players = {};

io.on('connection', (socket) => {
    console.log('🔗 Bir oyuncu bağlandı:', socket.id);

    // Join Game
    socket.on('join_game', async (userData) => {
        players[socket.id] = {
            socketId: socket.id,
            id: socket.id,
            odaId: userData.odaId,
            ...userData,
            x: 0,
            y: 0,
            zoneId: 1
        };
        socket.emit('my_id', socket.id);
        console.log(`👤 ${userData.nickname} oyuna katıldı.`);
    });

    // Join Zone
    socket.on('join_zone', (zoneId) => {
        if (!players[socket.id]) return;
        const oldZone = players[socket.id].zoneId;
        socket.leave(`zone_${oldZone}`);
        players[socket.id].zoneId = zoneId;
        socket.join(`zone_${zoneId}`);
        const zonePlayers = Object.values(players).filter(p => p.zoneId === zoneId && p.socketId !== socket.id);
        socket.emit('zone_players', zonePlayers);
        socket.to(`zone_${zoneId}`).emit('player_joined', players[socket.id]);
        console.log(`🗺️ ${players[socket.id].nickname} harita ${zoneId} bölgesine geçti.`);
    });

    // Movement
    socket.on('player_move', (data) => {
        if (!players[socket.id]) return;
        players[socket.id] = { ...players[socket.id], ...data };
        const zoneId = players[socket.id].zoneId;
        socket.to(`zone_${zoneId}`).emit('player_moved', { id: socket.id, ...data });
    });

    // Chat
    socket.on('chat_message', (msg) => {
        if (!players[socket.id]) return;
        io.emit('chat_broadcast', {
            senderId: socket.id,
            senderName: players[socket.id].nickname,
            text: msg.text || msg,
            channel: msg.channel || 'global'
        });
    });

    // Disconnect
    socket.on('disconnect', () => {
        if (players[socket.id]) {
            const { zoneId, nickname } = players[socket.id];
            console.log(`❌ ${nickname} ayrıldı.`);
            io.to(`zone_${zoneId}`).emit('player_left', socket.id);
            delete players[socket.id];
        }
    });
});

// ============================================
// SERVER START
// ============================================

// Vercel ortamında değilsek veya PORT tanımlıysa (Railway gibi) dinle
if (process.env.PORT || !process.env.VERCEL) {
    server.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Oyun Sunucusu Çalışıyor: http://0.0.0.0:${PORT}`);
        console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
}

// Vercel için Express uygulamasını dışa aktar
module.exports = app;
