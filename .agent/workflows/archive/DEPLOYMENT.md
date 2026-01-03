# ============================================
# 🚀 KADIM SAVAŞLAR - DEPLOYMENT KILAVUZU
# ============================================

## 📋 Genel Bakış

Bu kılavuz, Kadim Savaşlar oyununu internete açmak için gereken adımları içerir.

### Gerekli Servisler (Hepsi Ücretsiz):
- **Frontend**: Vercel (vercel.com)
- **Backend**: Railway (railway.app)
- **Database**: MongoDB Atlas (mongodb.com)

---

## 🔧 ADIM 1: Railway.app'te Backend Kurulumu

### 1.1 Railway Hesabı Oluştur
1. https://railway.app adresine git
2. GitHub hesabınla giriş yap
3. "New Project" tıkla

### 1.2 GitHub Repo Oluştur
Önce projeyi GitHub'a yüklemen gerekiyor:

```bash
# Git repo başlat
git init

# .gitignore'a ekle
echo "node_modules" >> .gitignore
echo "dist" >> .gitignore
echo ".env.local" >> .gitignore

# Commit
git add .
git commit -m "Initial commit"

# GitHub'a push (repo oluşturduktan sonra)
git remote add origin https://github.com/KULLANICI_ADI/kadim-savaslar.git
git push -u origin main
```

### 1.3 Railway'de Proje Oluştur
1. "Deploy from GitHub repo" seç
2. Repo'nu seç
3. "Deploy" tıkla

### 1.4 Railway Ayarları
Railway otomatik algılayacak ama şunları kontrol et:

**Build Command:**
```
npm install
```

**Start Command:**
```
npm run server
```

**Port:**
Railway otomatik `PORT` environment variable verir. Server'ı güncelleyeceğiz.

---

## 🔧 ADIM 2: Vercel'de Frontend Kurulumu

### 2.1 Vercel Hesabı
1. https://vercel.com adresine git
2. GitHub ile giriş yap

### 2.2 Proje Import Et
1. "Import Project" tıkla
2. GitHub repo'NU seç
3. Framework: Vite seç
4. Deploy tıkla

### 2.3 Environment Variables
Vercel dashboard'da şu değişkenleri ekle:

```
VITE_SOCKET_URL=https://kadim-savaslar-production.up.railway.app
```

---

## 🔧 ADIM 3: Server Güncellemesi

Server'ın Railway'de çalışması için PORT değişkenini kullanması gerekiyor.
Bu değişiklik otomatik yapıldı.

---

## 📱 Mobil Erişim

### Android APK Oluşturma
```bash
# Build
npm run build

# Capacitor sync
npx cap sync android

# Android Studio'da aç
npx cap open android
```

Android Studio'da:
1. Build > Build Bundle(s) / APK(s) > Build APK(s)
2. APK'yı arkadaşlarına gönder

### Web Üzerinden Mobil
Vercel URL'i telefon tarayıcısından açılabilir!

---

## 🔗 Bağlantı Testi

1. Backend URL: `https://[railway-app-name].up.railway.app`
2. Frontend URL: `https://[vercel-app-name].vercel.app`

Test için:
1. İki farklı tarayıcıda aç
2. Aynı bölgeye gir
3. Birbirini görmeli

---

## ⚠️ Ücretsiz Tier Limitleri

### Railway (Backend):
- 500 saat/ay (≈20 saat/gün)
- 512 MB RAM
- Uyku modu: 15 dakika inaktivitede

### Vercel (Frontend):
- 100 GB bandwidth/ay
- Sınırsız deployment
- Otomatik uyku yok

### MongoDB Atlas (Database - opsiyonel):
- 512 MB storage
- 500 connection
- Yeterli başlangıç için

---

## 🚨 Önemli Notlar

1. **Railway uyku modu**: 15 dakika kimse bağlanmazsa sunucu uyur.
   İlk bağlantı 5-10 saniye sürebilir (cold start).

2. **CORS ayarları**: Frontend URL'ini server'a eklemen gerekebilir.

3. **WebSocket bağlantısı**: wss:// (secure) kullanılmalı.

---

## 📞 Yardım

Sorun yaşarsan:
1. Railway logs kontrol et
2. Vercel logs kontrol et
3. Browser console hataları

