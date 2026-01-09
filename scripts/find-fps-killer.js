const fs = require('fs');
const path = require('path');

function searchInDir(startPath, filter) {
    if (!fs.existsSync(startPath)) return;

    const files = fs.readdirSync(startPath);
    for (let i = 0; i < files.length; i++) {
        const filename = path.join(startPath, files[i]);
        const stat = fs.lstatSync(filename);
        if (stat.isDirectory()) {
            searchInDir(filename, filter);
        } else if (filename.endsWith('.tsx') || filename.endsWith('.ts')) {
            const content = fs.readFileSync(filename, 'utf8');
            if (content.includes('/api/trade') || content.includes('/api/events')) {
                console.log('-- FOUND IN FILE:', filename);
                const lines = content.split('\n');
                lines.forEach((line, index) => {
                    if (line.includes('/api/trade') || line.includes('/api/events')) {
                        console.log(`Line ${index + 1}: ${line.trim().substring(0, 100)}...`);
                    }
                });
            }
        }
    }
}

console.log('Searching for API calls...');
searchInDir('./components', '.tsx');
searchInDir('./core', '.ts');
searchInDir('./utils', '.ts');
console.log('Done.');
