import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../../../.env');
console.log('📂 Loading .env from:', envPath);
const result = dotenv.config({ path: envPath, override: true });
console.log('📝 MONGODB_URI loaded:', process.env.MONGODB_URI?.substring(0, 50) + '...');

export const config = {
    mongodb: {
        uri: 'mongodb+srv://yunusemregokdag_db_user:OjRJkEiL56zU2CpH@cluster0.lpw3x3g.mongodb.net/kadim_savaslar?retryWrites=true&w=majority',
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'fallback_secret_key',
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    },
    server: {
        port: parseInt(process.env.PORT || '3001', 10),
        env: process.env.NODE_ENV || 'development',
        corsOrigin: ['http://localhost:3000', 'http://localhost:5173', 'http://192.168.0.16:3000'],
    },
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '2000', 10), // Increased from 100 to 2000
    },
};
