const http = require('http');

function post(path, body) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(body);
        const options = {
            hostname: 'localhost',
            port: 3001,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = http.request(options, (res) => {
            let responseBody = '';
            res.on('data', chunk => responseBody += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body: responseBody }));
        });

        req.on('error', error => reject(error));
        req.write(data);
        req.end();
    });
}

async function run() {
    console.log("Testing Login with test@example.com / test123456 on port 3001...");
    try {
        const loginRes = await post('/api/auth/login', { email: 'test@example.com', password: 'test123456' });
        console.log(`Login Status: ${loginRes.status}`);
        console.log(`Login Body: ${loginRes.body}`);

        if (loginRes.status !== 200) {
            // Try creating the test user again if it doesn't exist
            if (loginRes.body.includes('Invalid') || loginRes.body.includes('found')) {
                console.log("\nUser might not exist or wrong password. Trying to REGISTER 'test@example.com' with 'test123456'...");
                const regRes = await post('/api/auth/register', { username: 'TestPlayer', email: 'test@example.com', password: 'test123456' });
                console.log(`Register Status: ${regRes.status}`);
                console.log(`Register Body: ${regRes.body}`);
            }
        }
    } catch (err) {
        console.error("Request failed (Is server running?):", err.message);
    }
}

run();
