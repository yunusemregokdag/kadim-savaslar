# 📋 KADIM SAVAŞLAR - GÖREV LİSTESİ (SINGLE SOURCE OF TRUTH)

> **Durum:** ✅ Mob entegrasyonu tamamlandı. Şimdi görsel eksikleri (ikonlar ve efektler) tamamlayacağız.

---

## 🚀 1. SIRADAKİ GÖREV: EKSİK ASSETLER
**Hedef:** Oyun içindeki placeholder (geçici) görselleri gerçek pixel-art assetlerle değiştirmek.

- [ ] **Armor Icons (Zırh İkonları):**
    - [ ] Kask (Helmet)
    - [ ] Zırh (Chestplate)
    - [ ] Eldiven (Gloves)
    - [ ] Ayakkabı (Boots)
    - [ ] Kalkan (Shield)
- [ ] **VFX (Görsel Efektler):**
    - [ ] 8 adet yetenek efekti sprite'ı (Pixel Art).

---

## ⚙️ 2. BACKEND & ALTYAPI (PHASE 1 - BEKLEMEDE)
**Hedef:** LocalStorage'dan gerçek bir veritabanına geçiş (MongoDB).

### 2.1 Database & Kurulum
- [ ] MongoDB Atlas hesabı aç veya Local MongoDB kur.
- [ ] `.env` connection string ayarla.
- [ ] API Testleri (Postman ile Register/Login testi).

### 2.2 Oyun Sistemleri Backend
- [ ] **Character API:** Create, List, Delete.
- [ ] **Guild API:** Create, Join, Leave, Kick.
- [ ] **Party API:** Create, Invite, Kick.
- [ ] **Trade API:** Request, Accept, Exchange.

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
    - [x] `constants.ts` güncellendi, her mob kendi seviyesine uygun haritaya (Zone 1-4, 1-5, vb.) yerleştirildi.
- [x] **Task Temizliği:** Eski task dosyaları birleştirildi, bitenler silindi.
