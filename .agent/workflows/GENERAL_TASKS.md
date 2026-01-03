# 📋 KADIM SAVAŞLAR - GENEL GÖREV TAKİBİ

Bu dosya projenin genel yol haritasını, anlık durumunu ve tüm task'leri tek bir çatı altında toplar.

---

## 🚀 1. AKTİF GELİŞTİRME (FRONTEND & UI)
**Durum:** Çalışılıyor 🔨

### 1.1 🖥️ UI & MENÜ REFACTORING
- [x] **Sol Menü Düzenlemesi:**
    - [x] Kontroller butonu kaldırıldı (Rehbere taşındı).
    - [x] Görevler sekmesi doğrulandı.
- [x] **Boss Timer Sistemi:**
    - [x] Eski menü butonu ve modal kaldırıldı.
    - [x] **YENİ:** Boss doğduğunda ekran bildirimi (Notification) eklendi.
    - [x] **YENİ:** Haritaya ışınlanma ("Git") butonu eklendi.
    - [ ] Chat mesajı entegrasyonu (Beklemede).
- [x] **Açık Arttırma:**
    - [x] Eski buton ve modal kaldırıldı (Pazar'a entegre edilecek).
- [ ] **Yoldaşlar Sistemi (Pet + Binek):**
    - [x] Menü adı "Binekler" -> "Yoldaşlar" yapıldı.
    - [ ] Arayüz iki sekmeye ayrılacak: "Normal Petler" ve "Hız Yoldaşları".
    - [ ] Karakterin aynı anda hem Pet hem Binek takabilmesi sağlanacak.

### 1.2 👾 MOB & BOSS MODELLERİ (VOXEL)
- [x] **Özel Boss Modelleri:**
    - [x] 🔥 Ateş Ejderhası (Fire Dragon) - Animasyonlu
    - [x] ❄️ Buz Devi (Ice Giant) - Animasyonlu
    - [x] 👻 Gölge Lordu (Shadow Lord) - Animasyonlu
    - [x] 🗿 Taş Golem (Stone Golem) - Animasyonlu
- [x] **Normal Mob Modelleri:**
    - [x] 🐺 Kurt (Wolf)
    - [x] 👹 Goblin
    - [x] 🦇 Yarasa (Bat)
    - [x] 💀 İskelet Büyücü (Skeleton)
    - [x] 🗿 Antik Golem (Normal)

### 1.3 🎨 EKSİK ASSETLER & GÖRSELLER (Sırada)
- [x] **Materials:** `upgrade_stone.png`
- [x] **Consumables:** HP, MP, Buff iksir ikonları.
- [x] **Accessories:** Küpe, Kolye, Yüzük ikonları.
- [ ] **Armor Icons:** Kask, Zırh, Eldiven, Ayakkabı, Kalkan.
- [ ] **VFX:** 8 adet yetenek efekti sprite'ı.

---

## ⚙️ 2. BACKEND & ALTYAPI (PHASE 1)
**Durum:** Temel Atıldı ✅

### 2.1 Backend Foundation
- [x] **Klasör Yapısı:** `server/` dizini, `src/` alt yapısı, `models`, `routes`, `controllers`.
- [x] **Paketler:** `mongoose`, `bcryptjs`, `jsonwebtoken`, `dotenv`, `helmet`.
- [x] **Temel Şemalar:** User, Character, Guild (Taslak).
- [x] **Authentication:** Register, Login, Me endpointleri.
- [x] **Güvenlik:** Rate limiting, Helmet, CORS.

### 2.2 Database & Kurulum (Sırada) ⏳
- [ ] MongoDB Atlas hesabı veya Local kurulum.
- [ ] `.env` connection string ayarı.
- [ ] API Testleri (Postman ile Register/Login testi).

### 2.3 Oyun Sistemleri Backend (Sırada) ⏳
- [ ] **Character API:** Create, List, Delete.
- [ ] **Guild API:** Create, Join, Leave, Kick.
- [ ] **Party API:** Create, Invite, Kick.
- [ ] **Trade API:** Request, Accept, Exchange.

---

## 🗺️ 3. PRODUCTION ROADMAP (UZUN VADELİ)

### Phase 2: Monetization & Social 💎
- [ ] **Premium/VIP Sistemi:** VIP paketleri, bonuslar (+EXP, +Gold).
- [ ] **Mail Sistemi:** Gelen kutusu, item gönderme, sistem mesajları.
- [ ] **Gelişmiş Chat:** Global, Guild, Party kanalları, PM.

### Phase 3: Endgame Content ⚔️
- [ ] **PVP Arena:** 1v1, 2v2 Eşleşme, Sıralama (ELO).
- [ ] **Etkinlik Sistemi:** Haftasonu etkinlikleri, Boss istilası.
- [ ] **Player Housing:** Kişisel ev ve dekorasyon.

### Phase 4: Polish & Optimize 📱
- [ ] **Mobil Optimizasyonu:** Dokunmatik kontroller, UI ölçekleme.
- [ ] **Anti-Cheat:** Sunucu tarafı doğrulama.
- [ ] **Tutorial:** Yeni oyuncu rehberi.

---

## 🧹 TEMİZLİK & DÜZEN
- [x] `documentation` klasörü oluşturuldu.
- [x] `GAME_ARCHITECTURE.md` (Kod Rehberi) yazıldı.
- [x] Kök dizindeki gereksiz `.md` dosyaları arşive taşındı.
