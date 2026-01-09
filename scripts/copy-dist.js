const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../dist');
const destDir = path.join(__dirname, '../server/public');

console.log(`📂 Kopyalanıyor: ${srcDir} -> ${destDir}`);

// Hedef klasörü temizle ve oluştur
if (fs.existsSync(destDir)) {
    fs.rmSync(destDir, { recursive: true, force: true });
}
fs.mkdirSync(destDir, { recursive: true });

// Dosyaları kopyala (Recursive)
function copyDir(src, dest) {
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (let entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            fs.mkdirSync(destPath);
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

try {
    if (fs.existsSync(srcDir)) {
        copyDir(srcDir, destDir);
        console.log('✅ Frontend dosyaları başarıyla server/public klasörüne taşındı!');
    } else {
        console.error('❌ dist klasörü bulunamadı! Önce build alınmalı.');
        process.exit(1);
    }
} catch (err) {
    console.error('❌ Kopyalama hatası:', err);
    process.exit(1);
}
