import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

// Health check endpoint (Railway/Render için)
app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'Kadim Savaşlar Game Server', players: Object.keys(players).length });
});

app.get('/health', (req, res) => {
    res.json({ status: 'healthy', uptime: process.uptime() });
});

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Production'da Vercel URL'ini ekle
        methods: ["GET", "POST"]
    },
    // WebSocket transport öncelikli
    transports: ['websocket', 'polling']
});

// Game State
let players = {}; // { socketId: { id, x, y, z, zoneId, ... } }
// We can also store simple mob states here if we want synchronized mobs later

io.on('connection', (socket) => {
    console.log('🔗 Bir oyuncu bağlandı:', socket.id);

    // 1. Login / Join Game
    socket.on('join_game', (userData) => {
        // userData: { nickname, class, level, ... }
        players[socket.id] = {
            socketId: socket.id,
            id: socket.id, // Use socket ID as entity ID for now
            ...userData,
            x: 0,
            y: 0,
            zoneId: 1 // Default zone
        };

        // Send back their ID
        socket.emit('my_id', socket.id);

        console.log(`👤 ${userData.nickname} oyuna katıldı.`);
    });

    // 2. Join Zone (Map Change)
    socket.on('join_zone', (zoneId) => {
        if (!players[socket.id]) return;

        const oldZone = players[socket.id].zoneId;
        socket.leave(`zone_${oldZone}`);

        players[socket.id].zoneId = zoneId;
        socket.join(`zone_${zoneId}`);

        // Notify others in the new zone
        // Send ALL current players in this zone to the new joiner
        const zonePlayers = Object.values(players).filter(p => p.zoneId === zoneId && p.socketId !== socket.id);
        socket.emit('zone_players', zonePlayers);

        // Notify others that someone joined
        socket.to(`zone_${zoneId}`).emit('player_joined', players[socket.id]);

        console.log(`🗺️ ${players[socket.id].nickname} harita ${zoneId} bölgesine geçti.`);
    });

    // 3. Movement
    socket.on('player_move', (data) => {
        // data: { x, y, z, rotation }
        if (!players[socket.id]) return;

        players[socket.id].x = data.x;
        players[socket.id].y = data.y; // actually Z in 3D usually, but we use x,y in 2D map logic or x,y,z in 3D
        // Let's assume the client sends detailed pos

        if (players[socket.id]) {
            players[socket.id].x = data.x;
            players[socket.id].y = data.y;
            players[socket.id].rotation = data.rotation;
            players[socket.id].isMoving = data.isMoving;
            players[socket.id].isAttacking = data.isAttacking;
        }

        const zoneId = players[socket.id].zoneId;

        // Broadcast to everyone else in the room
        socket.to(`zone_${zoneId}`).emit('player_moved', {
            id: socket.id,
            ...data
        });
    });

    // 4. Chat
    socket.on('chat_message', (msg) => {
        if (!players[socket.id]) return;
        const zoneId = players[socket.id].zoneId;
        // Broadcast to EVERYONE (Global Chat for now to fix visibility issues)
        io.emit('chat_broadcast', {
            senderId: socket.id,
            senderName: players[socket.id].nickname,
            text: msg
        });
    });

    // 5. Disconnect
    socket.on('disconnect', () => {
        if (players[socket.id]) {
            const { zoneId, nickname } = players[socket.id];
            console.log(`❌ ${nickname} ayrıldı.`);

            // Notify zone
            io.to(`zone_${zoneId}`).emit('player_left', socket.id);

            delete players[socket.id];
        } else {
            console.log('❌ Bilinmeyen bir bağlantı koptu:', socket.id);
        }
    });
});

// Railway/Render için PORT environment variable kullan
const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Oyun Sunucusu Çalışıyor: http://0.0.0.0:${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});
