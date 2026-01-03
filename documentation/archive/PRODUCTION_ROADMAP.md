# 🚀 KADİM SAVAŞLAR - PRODUCTION ROADMAP

**Oluşturulma Tarihi:** 17 Aralık 2025  
**Hedef:** Oyunu production-ready hale getirmek  
**Toplam Süre Tahmini:** 6-8 Hafta

---

## 📊 MEVCUT DURUM SKORU: 5.4/10

| Kategori | Durum | Skor |
|----------|-------|------|
| Core Gameplay | ✅ Çok İyi | 9/10 |
| Social Features | ⚠️ Eksik | 3/10 |
| Economy | ✅ İyi | 7/10 |
| Security | ❌ Zayıf | 2/10 |
| Database | ❌ Yok | 0/10 |
| UI/UX | ✅ Harika | 9/10 |
| Content | ✅ Zengin | 8/10 |

---

## 🎯 PHASE 1 - CRITICAL FOUNDATION (Hafta 1-2)

### 1.1 DATABASE & BACKEND KURULUMU ⚡ [ÖNCELIK: CRITICAL]

**Amaç:** localStorage'dan kurtulup gerçek bir backend'e geçiş

#### Task 1.1.1: Backend Proje Yapısı Oluşturma
- [ ] Node.js + Express.js backend klasörü oluştur
- [ ] TypeScript konfigürasyonu (tsconfig.json)
- [ ] Folder structure:
  ```
  /server
    /src
      /controllers  (user, guild, party, trade)
      /models       (MongoDB schemas)
      /routes       (API endpoints)
      /middleware   (auth, validation, error handling)
      /services     (business logic)
      /utils        (helpers)
    server.ts       (entry point)
  ```

#### Task 1.1.2: MongoDB Kurulumu
- [ ] MongoDB Atlas hesabı aç (FREE tier)
- [ ] Database connection string al
- [ ] Mongoose ORM entegre et
- [ ] Connection pooling ve error handling

#### Task 1.1.3: Database Schema Tasarımı
- [ ] **User Schema:**
  - username, email, passwordHash
  - characters[] (referanslar)
  - createdAt, lastLogin
  - premiumUntil, vipLevel
  - banned, banReason
- [ ] **Character Schema:**
  - userId (ref), name, class, level, exp
  - stats (hp, mana, strength, etc.)
  - position, currentZone
  - inventory[], equipment{}
  - questProgress[], achievements[]
- [ ] **Guild Schema:**
  - name, tag, level, exp
  - members[] (userId, role, joinedAt)
  - leader, officers[]
  - gold, storage[]
  - settings, announcements
- [ ] **Party Schema:**
  - leader, members[]
  - lootMode, expShareEnabled
  - createdAt, disbanded
- [ ] **Trade Schema:**
  - trader1, trader2
  - trader1Items[], trader2Items[]
  - trader1Gold, trader2Gold
  - confirmed1, confirmed2, completed
  - createdAt

#### Task 1.1.4: Authentication System
- [ ] User registration endpoint (POST /api/auth/register)
- [ ] Login endpoint (POST /api/auth/login)
- [ ] JWT token generation
- [ ] Password hashing (bcrypt)
- [ ] Token refresh mechanism
- [ ] Logout (token invalidation)

#### Task 1.1.5: Security Middleware
- [ ] Rate limiting (express-rate-limit)
- [ ] Input validation (joi or zod)
- [ ] XSS protection (helmet)
- [ ] CORS konfigürasyonu
- [ ] SQL Injection önleme (mongoose built-in)

---

### 1.2 GUILD SİSTEMİ BACKEND ⚔️ [ÖNCELIK: HIGH]

#### Task 1.2.1: Guild API Endpoints
- [ ] `POST /api/guilds/create` - Klan oluşturma
  - Min level requirement (örn: Level 20)
  - Gold cost (örn: 100,000 gold)
  - Unique name validation
- [ ] `POST /api/guilds/:id/invite` - Member davet etme
- [ ] `POST /api/guilds/:id/join` - Klana katılma
- [ ] `POST /api/guilds/:id/leave` - Klandan ayrılma
- [ ] `DELETE /api/guilds/:id/kick/:memberId` - Üye atma
- [ ] `PUT /api/guilds/:id/promote/:memberId` - Rütbe yükseltme
- [ ] `GET /api/guilds/:id` - Klan detayları
- [ ] `GET /api/guilds/leaderboard` - Top guilds

#### Task 1.2.2: Guild Roles & Permissions
- [ ] Role enum: MEMBER, OFFICER, VICE_LEADER, LEADER
- [ ] Permission sistemi:
  - LEADER: Her şey
  - VICE_LEADER: Invite, promote (to officer), kick members
  - OFFICER: Invite only
  - MEMBER: Sadece görüntüleme

#### Task 1.2.3: Guild Level & EXP System
- [ ] Guild exp kazanma mekanizması:
  - Member quest tamamlama → guild exp
  - Member boss kill → guild exp
  - Donation (gold → guild exp)
- [ ] Level bazlı bonuslar:
  - Lvl 5: +5% member EXP
  - Lvl 10: +10% member Gold
  - Lvl 15: +5% member Damage
  - Lvl 20: Guild storage unlock

#### Task 1.2.4: Guild Storage (Depo)
- [ ] Shared inventory system
  - Officer+ donate item yapabilir
  - Leader withdrawal yapabilir
  - Log sistemi (kim ne koydu/aldı)

#### Task 1.2.5: Guild Chat
- [ ] Real-time guild chat (Socket.io)
- [ ] Chat mesajlarını DB'ye kaydetme (son 100 mesaj)
- [ ] Sadece guild member'lar görebilir

---

### 1.3 PARTY SİSTEMİ BACKEND 👥 [ÖNCELIK: HIGH]

#### Task 1.3.1: Party API Endpoints
- [ ] `POST /api/party/create` - Party oluşturma
- [ ] `POST /api/party/invite/:playerId` - Davet gönderme
- [ ] `POST /api/party/accept/:partyId` - Daveti kabul etme
- [ ] `POST /api/party/leave` - Party'den ayrılma
- [ ] `DELETE /api/party/kick/:memberId` - Üye atma
- [ ] `GET /api/party` - Current party info

#### Task 1.3.2: Party Settings
- [ ] Loot distribution modes:
  - FREE_FOR_ALL (herkes alabileceğini alır)
  - ROUND_ROBIN (sırayla dağıtım)
  - LEADER_ONLY (sadece leader loot alır)
- [ ] EXP sharing toggle (açık/kapalı)
- [ ] Party level range restriction (örn: ±10 level)

#### Task 1.3.3: Shared EXP & Loot
- [ ] Party member'lar yakınsa EXP paylaşımı
- [ ] Distance check (max 50 birim mesafe)
- [ ] EXP bonus (2 kişi +10%, 3 kişi +15%, vb.)
- [ ] Loot distribution algoritması

#### Task 1.3.4: Party HUD Real-time Updates
- [ ] Socket.io ile party member HP/Mana güncellemeleri
- [ ] Position tracking (minimap'te gösterme)

---

### 1.4 TRADE SİSTEMİ 💰 [ÖNCELIK: MEDIUM]

#### Task 1.4.1: Trade API Endpoints
- [ ] `POST /api/trade/request/:playerId` - Trade teklifi gönder
- [ ] `POST /api/trade/accept/:tradeId` - Teklifi kabul et
- [ ] `POST /api/trade/decline/:tradeId` - Teklifi reddet
- [ ] `PUT /api/trade/:id/add-item` - Item ekleme
- [ ] `PUT /api/trade/:id/remove-item` - Item çıkarma
- [ ] `PUT /api/trade/:id/set-gold` - Gold miktarı belirleme
- [ ] `POST /api/trade/:id/confirm` - Trade'i onayla
- [ ] `DELETE /api/trade/:id/cancel` - Trade'i iptal et

#### Task 1.4.2: Trade Security
- [ ] Scam prevention:
  - Her iki oyuncu "CONFIRM" basmalı
  - Confirm sonrası değişiklik yapılamaz
  - 5 saniyelik cooldown (son değişiklikten sonra)
- [ ] Distance check (max 10 birim mesafe)
- [ ] Anti-spam (max 1 trade request / 30 saniye)

#### Task 1.4.3: Trade UI Component
- [ ] Trade window modal (iki taraf item/gold)
- [ ] Real-time updates (Socket.io)
- [ ] Confirmation checkbox ("I agree to this trade")

---

### 1.5 LEADERBOARD SİSTEMİ 🏆 [ÖNCELIK: MEDIUM]

#### Task 1.5.1: Leaderboard API
- [ ] `GET /api/leaderboard/level` - Top 100 by level
- [ ] `GET /api/leaderboard/pvp` - Top 100 by PVP score
- [ ] `GET /api/leaderboard/wealth` - Top 100 by gold
- [ ] `GET /api/leaderboard/guilds` - Top 50 guilds
- [ ] `GET /api/leaderboard/achievements` - Top 100 by achievement points

#### Task 1.5.2: Ranking Calculation
- [ ] PVP Score hesaplama:
  - Win: +25 points
  - Loss: -15 points
  - Draw: 0 points
  - Streak bonus (3+ win = +10 extra)
- [ ] Weekly reset (her Pazartesi sıfırlanır)

#### Task 1.5.3: Leaderboard UI
- [ ] `LeaderboardView.tsx` component
- [ ] Tab switcher (Level, PVP, Wealth, Guilds)
- [ ] Player row: Rank, Name, Level/Score, Class icon
- [ ] Highlight current player

---

## 🎯 PHASE 2 - MONETIZATION & SOCIAL (Hafta 3-4)

### 2.1 PREMIUM/VIP SİSTEMİ 💎

#### Task 2.1.1: Premium Store UI
- [ ] `PremiumStoreView.tsx` component
- [ ] VIP paketleri:
  - VIP 1 (30 gün) - $4.99
  - VIP 3 (90 gün) - $12.99
  - VIP 12 (1 yıl) - $39.99
- [ ] Premium benefits listesi göster

#### Task 2.1.2: Payment Integration (Mock for now)
- [ ] Mock payment gateway
  - Gerçek ödeme için Stripe/PayPal entegrasyonu lazım
  - Şimdilik admin panel'den manuel verebiliriz

#### Task 2.1.3: Premium Benefits Implementation
- [ ] Backend'de premium durumu check et
- [ ] Bonusları uygula:
  - +50% EXP
  - +30% Gold
  - +20% Drop Rate
  - Exclusive costumes
  - Guild storage access
  - Fast travel cooldown removal

---

### 2.2 MAIL/MESAJ SİSTEMİ 📧

#### Task 2.2.1: Mail API
- [ ] `POST /api/mail/send` - Mesaj gönder
- [ ] `GET /api/mail/inbox` - Gelen kutusu
- [ ] `GET /api/mail/:id` - Mesaj oku
- [ ] `DELETE /api/mail/:id` - Mesaj sil
- [ ] `POST /api/mail/:id/claim-attachment` - Ek item/gold al

#### Task 2.2.2: System Mail
- [ ] Admin panel'den toplu mesaj gönderme
- [ ] Otomatik mesajlar:
  - "Welcome to the game!"
  - "Daily login reward"
  - "Guild invitation"

---

### 2.3 ADVANCED CHAT SİSTEMİ 💬

#### Task 2.3.1: Chat Channels
- [ ] Global chat (herkes görür)
- [ ] Guild chat (sadece guild member)
- [ ] Party chat (sadece party member)
- [ ] Whisper (private mesaj)
- [ ] Trade chat (sadece ticaret)

#### Task 2.3.2: Chat Features
- [ ] Emoji desteği (😊, 🔥, ⚔️, vb.)
- [ ] Link detection ve tıklanabilir yapma
- [ ] Player mention (@PlayerName)
- [ ] Chat history (son 100 mesaj)

#### Task 2.3.3: Chat Moderation
- [ ] Küfür filtresi (blacklist kelimeler)
- [ ] Spam prevention (5 mesaj/10 saniye limit)
- [ ] Mute/Ban sistemi (admin panel)

---

## 🎯 PHASE 3 - ENDGAME CONTENT (Hafta 5-6)

### 3.1 PVP ARENA QUEUE 🏟️

#### Task 3.1.1: Arena Matchmaking
- [ ] 1v1, 2v2, 3v3 queue sistemleri
- [ ] ELO rating system
- [ ] Matchmaking algorithm (similar rating)
- [ ] Queue timeout (5 dakika)

#### Task 3.1.2: Arena Rewards
- [ ] Win: Arena Points
- [ ] Seasonal rewards (top 100)
- [ ] Exclusive arena items

---

### 3.2 EVENT SİSTEMİ 🎉

#### Task 3.2.1: Timed Events
- [ ] 2x EXP Weekend (Cumartesi-Pazar)
- [ ] Boss invasion events (her 2 saatte bir)
- [ ] Holiday events (Noel, Ramazan, Bayram)

#### Task 3.2.2: Event Calendar UI
- [ ] Ongoing events göster
- [ ] Upcoming events
- [ ] Countdown timer

---

### 3.3 PLAYER HOUSING 🏠

#### Task 3.3.1: House System
- [ ] Personal house instance
- [ ] Furniture placement
- [ ] NPC yerleştirme (shop, storage)

---

## 🎯 PHASE 4 - POLISH & OPTIMIZE (Hafta 7-8)

### 4.1 MOBILE OPTIMIZATION 📱
- [ ] Touch gesture improvements
- [ ] UI scaling for small screens
- [ ] Battery optimization

### 4.2 ANTI-CHEAT 🛡️
- [ ] Server-side validation (damage, gold, exp)
- [ ] Speed hack detection
- [ ] Auto-ban için threshold

### 4.3 TUTORIAL SYSTEM 📚
- [ ] Yeni oyuncu için step-by-step guide
- [ ] Interactive tooltips

---

## 📝 İLK ADIM - HANGİ TASK'İ BAŞLATALIM?

1️⃣ **Backend Proje Yapısı + MongoDB** (Task 1.1.1 - 1.1.3)  
2️⃣ **Authentication System** (Task 1.1.4)  
3️⃣ **Guild Backend** (Task 1.2.1)  

Hangisinden başlayalım kanka? 🚀
