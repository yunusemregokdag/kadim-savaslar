# 📋 KADIM SAVAŞLAR - GÖREV LİSTESİ (SINGLE SOURCE OF TRUTH)

> **Durum:** ✅ Mob entegrasyonu tamamlandı. Şimdi görsel eksikleri (ikonlar ve efektler) tamamlayacağız.

---

## 🚀 1. SIRADAKİ ÖNCELİK: BACKEND & DATABASE MIGRATION
**Hedef:** LocalStorage tabanlı (istemci tarafı) veri tutma sisteminden, güvenli ve kalıcı MongoDB tabanlı backend mimarisine geçiş. Bu, oyunun çok oyunculu, hilesiz ve kalıcı olmasını sağlayacak.

### 1.1 Database & Kurulum
- [ ] MongoDB Atlas hesabı aç veya Local MongoDB kur.
- [ ] Backend Server (Node.js/Express) projesini oluştur (veya mevcut yapıyı güncelle).
- [ ] `.env` connection string ayarla.
- [ ] API Testleri (Postman ile Register/Login testi).

### 1.2 Oyun Sistemleri Backend API
- [ ] **Auth API:** Register, Login, Token yönetimi.
- [ ] **Character API:** Create, List, Delete, Update Stats.
- [ ] **Inventory API:** Eşya ekleme, çıkarma, kaydetme.
- [ ] **Market API:** Pazar yeri listeleme ve satın alma işlemleri.
- [ ] **Multiplayer Sync:** Oyuncu pozisyon ve hareketlerini veritabanına periyodik kaydetme.

---

## 🎨 2. DÜŞÜK ÖNCELİK: ASSET CİLASI (Kullanıcı Teyidi: Mevcutlar İyi)
**Hedef:** İleride ihtiyaç duyulursa placeholder görselleri pixel-art ile güncellemek.
- [ ] Armor Icons (Zırh İkonları)
- [ ] Skill VFX (Yetenek Efektleri)

## 🗺️ 3. GELECEK PLANLARI (ROADMAP)
### Phase 2: Monetization & Social
- [ ] **Guild Sistemi API:** Create, Join, Leave, Kick.
- [ ] **Party Sistemi API:** Create, Invite, Kick.
- [ ] **Premium/VIP Sistemi:** VIP paketleri, bonuslar.
- [ ] **Mail Sistemi:** Gelen kutusu, item gönderme.
- [ ] **Gelişmiş Chat:** Global, Guild, Party kanalları.

### Phase 3: Endgame Content
- [ ] **PVP Arena:** 1v1, 2v2 Eşleşme, Sıralama, Ödül sistemi.
- [ ] **Etkinlik Sistemi:** Belirli saatlerde Boss istilası.
- [ ] **Player Housing:** Kişisel ev ve dekorasyon.

---

## 🗺️ 3. GELECEK PLANLARI (ROADMAP)

### Phase 2: Monetization & Social
- [ ] **Premium/VIP Sistemi:** VIP paketleri, bonuslar.
- [ ] **Mail Sistemi:** Gelen kutusu, item gönderme.
- [ ] **Gelişmiş Chat:** Global, Guild, Party kanalları.

### Phase 3: Endgame Content
- [ ] **PVP Arena:** 1v1, 2v2 Eşleşme, Sıralama.
- [ ] **Etkinlik Sistemi:** Boss istilası.
- [ ] **Player Housing:** Kişisel ev.

---

## ✅ SON YAPILANLAR (Bu Oturum)
- [x] **Harita & Mob Entegrasyonu:**
    - [x] Yeni Bosslar (Ateş Ejderi, Buz Devi, Gölge Lordu, Taş Golem) tanımlandı ve haritaya eklendi.
    - [x] Yeni Moblar (Kurt, Goblin, Yarasa, İskelet, Normal Golem) tanımlandı ve haritaya eklendi.
    - [x] `ActiveZoneView.tsx` güncellendi, yeni Voxel modelleri bağlandı.
- [x] **UI/UX Modernizasyon:**
    - [x] **Karakter Paneli:** Responsive, 2 kolonlu yapı, yeni hesaplanan statlar bölümü.
    - [x] **Envanter Paneli:** Mobil uyumlu (Stack layout), PC uyumlu (3 kolon), görsel cila.
    - [x] **HUD (Savaş Arayüzü):** Saldırı butonu (Premium), yetenek barı (Modern), joystick (Runik).
    - [x] **Companions:** Binek ve Pet tek panelde birleştirildi.
- [x] **Task Temizliği:** Eski task dosyaları birleştirildi, bitenler silindi.
