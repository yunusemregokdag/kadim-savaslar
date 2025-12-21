// Vercel Serverless Function - ES Module Syntax
export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const url = req.url;

    // Health check
    if (url.includes('/api/health')) {
        return res.status(200).json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            message: 'Vercel API is working!'
        });
    }

    // Auth me - return mock user for now
    if (url.includes('/api/auth/me')) {
        return res.status(200).json({
            user: {
                id: 'test-user-id',
                email: 'test@example.com',
                username: 'TestUser'
            }
        });
    }

    // Google auth - mock response
    if (url.includes('/api/auth/google')) {
        return res.status(200).json({
            token: 'mock-jwt-token',
            user: {
                id: 'google-user-id',
                email: 'google@example.com',
                username: 'GoogleUser'
            }
        });
    }

    return res.status(404).json({ error: 'Not found', url });
}
