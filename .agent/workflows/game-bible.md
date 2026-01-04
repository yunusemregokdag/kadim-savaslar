---
description: Kadim Savaşlar Oyun Kuralları - Değişmez Oyun Mekaniği Referansı
---

# 📜 KADİM SAVAŞLAR - OYUN KURALLARI KİTABI

Bu dosya oyunun temel mekaniklerini ve **değişmez kurallarını** içerir.  
**Herhangi bir değişiklik yapmadan önce bu belgeye başvurunuz.**

---

## 🎮 KARAKTER SİSTEMİ

### Maksimum Level
- **MAX LEVEL: 30**
- Level 30'a ulaşan oyuncular **"Kadim Savaşçı"** unvanını alır

### Birlikler (Factions / Irklar)
Bu oyunda **3 birlik** var - bunlar sınıf değil, **ırk/krallık/şirket** olarak geçiyor:

| Birlik | Türkçe Ad | Element | Başlangıç Bölgesi |
|--------|-----------|---------|-------------------|
| **marsu** | Ateş Lejyonu 🔥 | Ateş | Kül Vadisi (1-1) - Zone 11 |
| **terya** | Su Muhafızları 💧 | Su | Kristal Nehir (2-1) - Zone 21 |
| **venu** | Doğa Bekçileri 🌿 | Doğa | Kadim Orman (3-1) - Zone 31 |

> ⚠️ **NOT:** Bunlar sınıf değil! Birlik değiştirmek Şeref Puanınızı %50 düşürür.

### Sınıflar (Classes)
| Sınıf | Türkçe Ad | Rol | Özellik |
|-------|-----------|-----|---------|
| warrior | Savaşçı | Tank/DPS | Yüksek HP, orta hasar |
| arctic_knight | Buz Şövalyesi | Tank/CC | Yavaşlatma, savunma |
| archer | Okçu | Ranged DPS | Uzak menzil, hızlı hasar |
| archmage | Büyücü | Magic DPS | Büyü hasarı, düşük HP |
| bard | Ozan | Support | Buff, şifa |
| cleric | Rahip | Healer | Şifa, destek |
| martial_artist | Dövüş Ustası | Melee DPS | Kombo, yüksek kritik |
| reaper | Ölüm Meleği | DPS/Drain | Can çalma, DOT |

---

## 📊 SEVİYE VE HARİTA ERİŞİM SİSTEMİ (RESMİ KURAL)

### Seviye Başına Gereken EXP ve Erişim Hakları

| Seviye | Gereken TP (EXP) | HARİTA ERİŞİMİ |
|--------|------------------|----------------|
| **01** | 0 | X-1 ve X-2 (Kendi Birliğin) |
| **02** | 10.000 | X-3 ve X-4 (Kendi Birliğin) |
| **03** | 20.000 | X-3'ten X-4'e Direkt Geçiş Portalı |
| **04** | 40.000 | - |
| **05** | 80.000 | X-3 veya X-4 (Yabancı Birliğe!) |
| **06** | 160.000 | Yabancı X-3'ten X-4'e Geçiş |
| **07** | 320.000 | - |
| **08** | 640.000 | 🔴 **PvP BÖLGESİ GİRİŞİ:** 4-1, 4-2, 4-3 |
| **09** | 1.280.000 | 🔴 **ARENA 4-4 (Merkez Savaş) ERİŞİMİ** |
| **10** | 2.560.000 | X-5 Elit Harita (Kendi Birliğin) |
| **11** | 5.120.000 | X-6 ve X-7 (Kendi Birliğin) |
| **12** | 10.240.000 | X-8 Boss Haritası (Kendi Birliğin) |
| **13** | 20.480.000 | Yabancı X-2 Haritasına Erişim |
| **14** | 40.960.000 | Yabancı X-5 Haritasına Erişim |
| **15** | 81.920.000 | Yabancı X-6 ve X-7 Haritalarına Erişim |
| **16** | 163.840.000 | 🟣 **Yabancı Ana Üslerine (X-1) Giriş!** |
| **17** | 327.680.000 | 🟡 **TÜM HARİTALARA SINIRSIZ ERİŞİM** |
| 18 | 655.360.000 | - |
| 19 | 1.310.720.000 | - |
| 20 | 2.621.440.000 | - |
| 21 | 5.242.880.000 | - |
| 22 | 10.485.760.000 | - |
| 23 | 20.971.520.000 | - |
| 24 | 41.943.040.000 | - |
| 25 | 83.886.080.000 | - |
| 26 | 167.772.160.000 | - |
| 27 | 335.544.320.000 | 🔵 Elit Haritalar (1-BL, 2-BL, 3-BL) Erişimi |
| 28 | 671.088.640.000 | Elite Savaşçı Rütbesi |
| 29 | 1.342.177.280.000 | Efsanevi Komutan Rütbesi |
| **30** | **2.684.354.560.000** | 👑 **KADİM SAVAŞÇI - MAKSİMUM GÜÇ** |

> ⚠️ **EXP Formülü:** Her level, önceki levelin **2 katı** EXP gerektirir.

---

## 🗺️ HARİTA SİSTEMİ DETAYI

### Birlik Haritaları (X = 1, 2 veya 3)

| Harita | Açıklama | NPC'ler |
|--------|----------|---------|
| **X-1** | Ana Üs / Başlangıç | ✅ Demirci, Market AKTİF |
| X-2 | İlk farm bölgesi | ❌ NPC'ler İNAKTİF |
| X-3 | Orta seviye | ❌ NPC'ler İNAKTİF |
| X-4 | Orta-ileri seviye | ❌ NPC'ler İNAKTİF |
| X-5 | Elit Bölge | ❌ NPC'ler İNAKTİF |
| X-6 | İleri seviye | ❌ NPC'ler İNAKTİF |
| X-7 | Yüksek seviye | ❌ NPC'ler İNAKTİF |
| **X-8** | Boss Haritası | ✅ Demirci, Market AKTİF |

### Arena ve Geçiş Bölgeleri (Zone 4x)

| Zone ID | Bölge Adı | Min Level | Notlar |
|---------|-----------|-----------|--------|
| 41 | Marsu Arena Girişi (4-1) | 8 | Irk geçiş noktası |
| 42 | Terya Arena Girişi (4-2) | 8 | Irk geçiş noktası |
| 43 | Venu Arena Girişi (4-3) | 8 | Irk geçiş noktası |
| **44** | **Savaş Meydanı (4-4)** | **9** | PvP Arena Merkezi |
| **45** | **Solucan Deliği (4-5)** | **30** | GİZLİ BOSS |

---

## 👹 BOSS SİSTEMİ

### Boss Level Kuralı
> ⚠️ **Boss'lar maksimum Level 35 olabilir!** Daha yüksek level boss yok.

### 3 Saatlik World Boss'lar (180 dakika respawn)
| Boss Adı | Level | HP | Zone | Element | Ödüller |
|----------|-------|-----|------|---------|---------|
| **Kadim Ejderha** | 35 | 150,000 | 18 | Ateş 🔥 | T5 Efsanevi Silah, 100K Altın, 500 Gem |
| **Buzul Kolosu** | 35 | 150,000 | 28 | Buz 🧊 | T5 Efsanevi Zırh, 80K Altın, 400 Gem |
| **Taş Golem** | 35 | 150,000 | 38 | Doğa 🌿 | T5 Efsanevi Set, 80K Altın, 400 Gem |

### Normal Boss'lar
| Boss Adı | Level | HP | Zone | Respawn |
|----------|-------|-----|------|---------|
| Yengeç Lordu | 25 | 80,000 | 44 (Arena) | Anında |
| Gölge İmparatoru | 35 | 200,000 | 45 (Gizli) | Anında |

---

## 🎖️ RÜTBE SİSTEMİ

### Rütbe Hesaplama Mantığı

> **Formül:** Birlikteki Üye Sayısı × Rütbe Yüzdesi (%) / 100 = O Rütbeye Sahip Kişi Sayısı
>
> **Örnek:** 10.000 Üye × %1.5 (Bölük Komutanı) / 100 = **150 Adet Bölük Komutanı**

### Rütbe Puanını Etkileyen Faktörler
- ✅ Tecrübe Puanı (TP)
- ✅ Şeref Puanı (ŞP)
- ✅ NPC Kesme (Canavar)
- ✅ Düşman Oyuncu Kesme
- ✅ Zindan Kapısı Tamamlama

### Önemli Rütbe Kuralları
- Rütbeler **her sabah** güncellenir
- Başlangıç seviye yaratıklar **+1 Rütbe Puanı** kazandırır
- Eksi (-) Şeref Puanı rütbenizi düşürür
- **Birlik değiştirmek Şeref Puanınızı %50 düşürür!**

### Rütbe Dağılım Kuralları

| Rütbe | Dağılım Kuralı |
|-------|----------------|
| Yüce Hükümdar | Birlik başına **1 Adet** |
| Kral/Kraliçe | Birlik başına **2 Adet** |
| General | Birlik başına **3 Adet** |
| Mareşal | Birlik başına **5 Adet** |
| Albay | Birliğin **%0.5'i** |
| Yarbay | Birliğin **%1'i** |
| Binbaşı | Birliğin **%1.5'i** |
| Bölük Komutanı | Birliğin **%1.5'i** |
| ... | (Devamı RANKS dizisinde) |

---

## ⚔️ PvP KURALLARI

- **PvP Bölgeleri Açılma:** Level 8 (4-1, 4-2, 4-3)
- **Arena Merkez (4-4):** Level 9
- **Düello Sistemi:** Her zaman açık (kabul gerektirir)
- **Yabancı Birlik Sızma:** Level 5+ (X-3, X-4)

---

## 💎 VIP SİSTEMİ

| VIP Seviyesi | Süre | Bonus EXP | Bonus Gold | Bonus Drop |
|--------------|------|-----------|------------|------------|
| Bronze | 7 gün | +10% | +10% | +5% |
| Silver | 30 gün | +25% | +25% | +15% |
| Gold | 30 gün | +50% | +50% | +30% |
| Platinum | 30 gün | +100% | +100% | +50% |

---

## 📦 ITEM TIER SİSTEMİ

| Tier | Rarity | Level Aralığı | Örnek |
|------|--------|---------------|-------|
| T1 | Common (Beyaz) | 1-5 | Deri Zırh |
| T2 | Uncommon (Yeşil) | 6-10 | Demir Zırh |
| T3 | Rare (Mavi) | 11-18 | Çelik Zırh |
| T4 | Epic (Mor) | 19-25 | Mithril Zırh |
| T5 | Legendary (Turuncu) | 26-30 | Ejderha Zırhı |

---

## 🏛️ EKONOMİ VE SAVAŞ DENGESİ (KRİTİK)

Bu bölüm oyunun **gelir modeli** ve **zorluk eğrisi** için hayati önem taşır. **ASLA DEĞİŞTİRMEYİN!**

### 💰 Altın ve Market Enflasyonu
Oyunun "Grind" yapısını korumak için ekonomi **Kıtlık** üzerine kuruludur.
- **İksirler Pahalıdır:** HP/Mana iksirleri normal değerlerinin **15 KATINA** satılır (Örn: 50 -> 750 Altın).
  - *Amaç:* Oyuncuları "Altın kasmaya" zorlamak ve boss kesmeye teşvik etmek.
  - *Sonuç:* Yerdeki 100 altın bile değerli hale gelir.
- **Düşük Drop Oranları:** T3 ve üzeri eşyaların düşme oranı bilerek düşük tutulur.

### ✨ Mana Bedeli Artışı (Level Scaling)
Yüksek level oyuncuların "Sınırsız Skill Spamlamasını" engellemek ve mana potuna muhtaç etmek için:
- **KURAL:** Skill Mana Bedeli = `BaseCost * (1 + (PlayerLevel * 0.1))`
- **Örnek:** Level 30 bir oyuncu, Level 1 bir oyuncuya göre **4 kat daha fazla mana** harcar.
- Bu, marketteki Mana Potlarının sürekli satılmasını sağlar.

### 🛒 Monetization (Para Kazanma) Stratejisi
Oyun F2P (Free to Play) ancak P2W (Pay to Win) öğeleri barındırır.
1.  **Acemi Paketleri:** Çok uygun fiyata (25 Elmas) oyun başı overpowered (OP) eşyalar verilir. Amaç oyuncuya ilk satın alımı yaptırmaktır.
2.  **Zorluk Duvarı:** Level 15-20 arası EXP kasma zorlaşır, oyuncu VIP alarak (+%50 EXP) hızlanmaya teşvik edilir.

---

## 🔧 DEĞİŞMEZ KURALLAR ÖZETİ

1. ✅ **Max Level: 30** - Değiştirilmez
2. ✅ **Boss Max Level: 35** - Değiştirilmez
3. ✅ **3 Birlik sistemi** - Marsu, Terya, Venu (Ateş Lejyonu, Su Muhafızları, Doğa Bekçileri)
4. ✅ **8 Sınıf** - Yeni sınıf eklenmez
5. ✅ **Her birlik 8 zone** - X-1'den X-8'e
6. ✅ **Boss bölgeleri X-8** - Her birliğin son bölgesi boss içerir
7. ✅ **Arena merkezi 4-4** - Tüm birlikler burada buluşur (Lv.9+)
8. ✅ **EXP 2x katlanır** - Her level öncekinin 2 katı
9. ✅ **Safe zone X-1** - Başlangıç bölgeleri güvenli
10. ✅ **NPC'ler sadece X-1 ve X-8'de aktif** - Diğer haritalarda inaktif
11. ✅ **Birlik değiştirme cezası** - Şeref Puanı %50 düşer
12. ✅ **Level 17+ tüm haritalara erişim** - Sınırsız
13. ✅ **Pahalı Market Kuralı** - İksirler 15x fiyatına satılır
14. ✅ **Mana Level Scaling** - Level başına +%10 mana bedeli
15. ✅ **Acemi Paketi** - Premium markette ucuz T2 set satılır (Newbie Trap)

---

## 📁 REFERANS DOSYALAR

- **Ana Kurallar:** `constants.ts`
- **Oyun Rehberi UI:** `components/GameGuideModal.tsx`
- **Boss Timer:** `components/BossTimerView.tsx`
- **World Boss Sistemi:** `systems/WorldBossSystem.ts`
- **Rütbe Tanımları:** `constants.ts` → `RANKS` dizisi
- **Zone Erişim Kontrolü:** `components/ActiveZoneView.tsx` → `checkZoneAccess()`

---

**Son Güncelleme:** 2026-01-04  
**Versiyon:** 2.1

---

## 🎨 UI/HUD KURALLARI (KRİTİK)

Bu bölüm oyunun **kullanıcı arayüzü** için değişmez kuralları içerir.

### Alt Navigasyon Bar (Bottom Navigation)
- **TAM 11 BUTON** olmalı, ne eksik ne fazla
- Buton sırası: **Karakter, Envanter, Yetenek, Görev, Parti, Lonca, Pazar, Demirci, Harita, Sıralama, Çıkış**
- `hidden` class KULLANILMAMALI - tüm butonlar her zaman görünür
- `overflow-x-auto` ile mobilde yatay kaydırma sağlanmalı

### Üst Menü Butonları
- **ÜST MENÜDE BUTON YOK!** Hepsi alt bar'a taşındı.
- Chat, Inventory, Settings, Achievements, Exit butonları ÜSTTE OLMAMALI

### HUD Elemanları (DraggableHUDElement)
- Joystick, Attack butonu, Skill bar'lar sürüklenebilir kalmalı
- HUD pozisyonları `DEFAULT_HUD_LAYOUT` içinde tanımlı

### Referans Dosya
- `components/ActiveZoneView.tsx` satır ~5330 civarı (Bottom Nav Bar)
- `components/ActiveZoneView.tsx` satır ~4466 civarı (Top Menu - REMOVED)

