import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';

// Import config (this loads .env)
import { config } from './config/index.js';

// Import routes
import authRoutes from './routes/auth.js';
import characterRoutes from './routes/character.js';
import guildRoutes from './routes/guild.js';
import partyRoutes from './routes/party.js';
import tradeRoutes from './routes/trade.js';
import leaderboardRoutes from './routes/leaderboard.js';
import mailRoutes from './routes/mail.js';
import eventRoutes from './routes/event.js';
import houseRoutes from './routes/house.js';
import friendRoutes from './routes/friend.js';
import dailyQuestRoutes from './routes/dailyQuest.js';
import premiumRoutes from './routes/premium.js';

// Initialize Express
const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
    origin: config.server.corsOrigin,
    credentials: true,
}));

// Rate limiting - only in production
if (config.server.env === 'production') {
    const limiter = rateLimit({
        windowMs: config.rateLimit.windowMs,
        max: config.rateLimit.maxRequests,
        message: 'Too many requests from this IP, please try again later.',
    });
    app.use('/api/', limiter);
}

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/characters', characterRoutes);
app.use('/api/guilds', guildRoutes);
app.use('/api/party', partyRoutes);
app.use('/api/trade', tradeRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/mail', mailRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/house', houseRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/daily-quests', dailyQuestRoutes);
app.use('/api/premium', premiumRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Server error:', err);
    res.status(500).json({
        error: 'Internal server error',
        ...(config.server.env === 'development' && { details: err.message }),
    });
});

// Create HTTP server
const server = http.createServer(app);

// Socket.IO setup (we'll keep the existing game socket logic)
const io = new SocketIOServer(server, {
    cors: {
        origin: config.server.corsOrigin,
        methods: ['GET', 'POST'],
    },
});

// Game State (temporary - will move to Redis later)
// Game State (temporary - will move to Redis later)
let players: Record<string, any> = {};
let duels: Record<string, { challenger: string, target: string, startTime: number }> = {}; // duelId -> duel data
let activeDuels: Record<string, string> = {}; // playerId -> duelId

// Anti-Cheat System
import { antiCheat, createAntiCheatMiddleware } from './utils/antiCheat.js';
const antiCheatMiddleware = createAntiCheatMiddleware(io);

io.on('connection', (socket) => {
    console.log('🔗 Player connected:', socket.id);

    // Initialize anti-cheat tracking
    if (!antiCheatMiddleware.onConnect(socket)) {
        return; // Player is banned
    }

    socket.on('join_game', (userData) => {
        players[socket.id] = {
            socketId: socket.id,
            id: socket.id,
            ...userData,
            x: 0,
            y: 0,
            zoneId: 1,
        };
        socket.emit('my_id', socket.id);
        console.log(`👤 ${userData.nickname} joined the game`);
    });

    socket.on('join_zone', (zoneId) => {
        if (!players[socket.id]) return;

        const oldZone = players[socket.id].zoneId;
        socket.leave(`zone_${oldZone}`);

        players[socket.id].zoneId = zoneId;
        socket.join(`zone_${zoneId}`);

        const zonePlayers = Object.values(players).filter(
            p => p.zoneId === zoneId && p.socketId !== socket.id
        );
        socket.emit('zone_players', zonePlayers);
        socket.to(`zone_${zoneId}`).emit('player_joined', players[socket.id]);

        console.log(`🗺️ ${players[socket.id].nickname} moved to zone ${zoneId}`);
    });

    socket.on('player_move', (data) => {
        if (!players[socket.id]) return;

        // Anti-cheat: Validate movement
        const moveCheck = antiCheatMiddleware.validateMove(socket.id, data.x, data.y);
        if (!moveCheck.valid) {
            socket.emit('anticheat_warning', { message: moveCheck.reason });
            return;
        }

        players[socket.id].x = data.x;
        players[socket.id].y = data.y;
        players[socket.id].rotation = data.rotation;
        players[socket.id].isMoving = data.isMoving;
        players[socket.id].isAttacking = data.isAttacking;

        const zoneId = players[socket.id].zoneId;
        socket.to(`zone_${zoneId}`).emit('player_moved', {
            id: socket.id,
            ...data,
        });
    });

    socket.on('chat_message', (data) => {
        if (!players[socket.id]) return;

        const messageText = typeof data === 'object' ? data.text : data;
        const channel = typeof data === 'object' ? (data.channel || 'global') : 'global';

        // TODO: Implement Party/Guild rooms for secure broadcasting
        // For now, we broadcast to everyone and let client filter
        io.emit('chat_broadcast', {
            id: Date.now().toString(), // Add ID for key prop
            senderId: socket.id,
            sender: players[socket.id].nickname,
            senderName: players[socket.id].nickname, // Legacy support
            text: messageText,
            type: channel
        });
    });

    // --- PVP DUEL SYSTEM ---
    socket.on('duel_request', (targetId: string) => {
        const sender = players[socket.id];
        if (!sender) return;

        // Check if target exists
        const targetSocket = io.sockets.sockets.get(targetId);
        if (!targetSocket) {
            socket.emit('duel_error', 'Oyuncu bulunamadı veya çevrimdışı.');
            return;
        }

        // Check if either is already in a duel
        if (activeDuels[socket.id] || activeDuels[targetId]) {
            socket.emit('duel_error', 'Oyuncular zaten bir düelloda.');
            return;
        }

        // Send request to target
        io.to(targetId).emit('duel_challenge', {
            challengerId: socket.id,
            challengerName: sender.nickname,
            challengerLevel: sender.level
        });
    });

    socket.on('duel_response', (data: { challengerId: string, accepted: boolean }) => {
        const responder = players[socket.id];
        if (!responder) return;

        const { challengerId, accepted } = data;

        if (!accepted) {
            io.to(challengerId).emit('duel_rejected', { targetName: responder.nickname });
            return;
        }

        // Start Duel
        const duelId = `duel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        duels[duelId] = {
            challenger: challengerId,
            target: socket.id,
            startTime: Date.now()
        };

        activeDuels[challengerId] = duelId;
        activeDuels[socket.id] = duelId;

        // Notify both players
        io.to(challengerId).emit('duel_started', { opponentId: socket.id, opponentName: responder.nickname, duelId });
        io.to(socket.id).emit('duel_started', { opponentId: challengerId, opponentName: players[challengerId]?.nickname || 'Rakip', duelId });

        // Announce nearby (Optional)
        const zoneId = responder.zoneId;
        socket.to(`zone_${zoneId}`).emit('chat_broadcast', {
            id: Date.now().toString(),
            sender: 'Sistem',
            senderName: 'DUYURU',
            text: `⚔️ ${players[challengerId]?.nickname} ile ${responder.nickname} arasında bir düello başladı!`,
            type: 'global'
        });
    });

    socket.on('duel_end', (data: { winnerId: string, duelId: string }) => {
        // Just clear state
        const duel = duels[data.duelId];
        if (duel) {
            delete activeDuels[duel.challenger];
            delete activeDuels[duel.target];
            delete duels[data.duelId];
        }
    });

    socket.on('attack_player', (data: { targetId: string, damage: number, skillName: string }) => {
        const attacker = players[socket.id];
        if (!attacker) return;

        const target = players[data.targetId];
        if (!target) return;

        // Verify Duel
        const duelId = activeDuels[socket.id];
        if (!duelId || activeDuels[data.targetId] !== duelId) {
            return; // Not in a valid duel with this target
        }

        // Anti-cheat: Validate action rate
        const actionCheck = antiCheatMiddleware.validateAction(socket.id, 'attack');
        if (!actionCheck.valid) {
            socket.emit('anticheat_warning', { message: actionCheck.reason });
            return;
        }

        // Anti-cheat: Validate damage
        const damageCheck = antiCheatMiddleware.validateDamage(socket.id, data.damage, data.targetId);
        if (!damageCheck.valid) {
            socket.emit('anticheat_warning', { message: damageCheck.reason });
            return;
        }

        // Use adjusted (possibly capped) damage
        const damage = damageCheck.adjustedDamage;

        // RELAY STRATEGY: Send 'damage_received' to target, let target client authoritative handle HP reduction
        // This is less secure but easier given current architecture.
        io.to(data.targetId).emit('damage_received', {
            attackerId: socket.id,
            damage: damage,
            skillName: data.skillName
        });
    });

    socket.on('player_died', (data: { killerId: string }) => {
        // Handle duel end
        if (activeDuels[socket.id]) {
            const duelId = activeDuels[socket.id];
            const duel = duels[duelId];
            if (duel) {
                const winnerId = duel.challenger === socket.id ? duel.target : duel.challenger;
                const winner = players[winnerId];

                io.to(winnerId).emit('duel_ended', { result: 'win', winner: winner?.nickname });
                socket.emit('duel_ended', { result: 'loss', winner: winner?.nickname });

                // Announce
                const zoneId = winner?.zoneId;
                if (zoneId) {
                    io.to(`zone_${zoneId}`).emit('chat_broadcast', {
                        id: Date.now().toString(),
                        sender: 'Sistem',
                        senderName: 'DUYURU',
                        text: `🏆 ${winner?.nickname}, ${players[socket.id]?.nickname} karşısında zafer kazandı!`,
                        type: 'global'
                    });
                }

                delete activeDuels[duel.challenger];
                delete activeDuels[duel.target];
                delete duels[duelId];
            }
        }
    });

    socket.on('disconnect', () => {
        if (players[socket.id]) {
            const { zoneId, nickname } = players[socket.id];

            // Clean up ongoing duel if any
            if (activeDuels[socket.id]) {
                const duelId = activeDuels[socket.id];
                const duel = duels[duelId];
                if (duel) {
                    const opponentId = duel.challenger === socket.id ? duel.target : duel.challenger;
                    io.to(opponentId).emit('duel_ended', { result: 'opponent_disconnected', winner: players[opponentId]?.nickname });
                    delete activeDuels[opponentId];
                    delete activeDuels[socket.id];
                    delete duels[duelId];
                }
            }

            console.log(`❌ ${nickname} disconnected`);
            io.to(`zone_${zoneId}`).emit('player_left', socket.id);
            delete players[socket.id];
        }
    });
});

// MongoDB connection
mongoose
    .connect(config.mongodb.uri)
    .then(() => {
        console.log('✅ MongoDB connected successfully');

        // Start server
        server.listen(config.server.port, () => {
            console.log(`🚀 Server running on port ${config.server.port}`);
            console.log(`📡 Socket.IO ready for connections`);
            console.log(`🌍 Environment: ${config.server.env}`);
        });
    })
    .catch((error) => {
        console.error('❌ MongoDB connection failed:', error);
        process.exit(1);
    });

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, closing server...');
    server.close(() => {
        mongoose.connection.close();
        console.log('Server closed');
        process.exit(0);
    });
});
