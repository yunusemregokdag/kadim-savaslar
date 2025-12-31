---
description: Kadim Savaşlar - Yapılacaklar Listesi
---

# 🎮 KADIM SAVAŞLAR - TASK LİSTESİ

## ⚔️ SİLAH & ZIRH SİSTEMİ ✅ TAMAMLANDI
Her sınıf için 5 tier item yapıldı. **250 item oluşturuldu!**

### Eklenen Item Tipleri:
- 🗡️ **Silahlar**: 10 sınıf x 5 tier = 50 silah
- 🛡️ **Zırhlar**: 10 sınıf x 5 tier = 50 zırh
- ⛑️ **Miğferler**: 10 sınıf x 5 tier = 50 miğfer
- 👖 **Pantolonlar**: 10 sınıf x 5 tier = 50 pantolon
- 👢 **Çizmeler**: 5 tier x 2 tip = 10 çizme (universal)
- 📿 **Kolyeler**: 5 tier x 4 tip = 20 kolye (STR/DEX/INT/VIT)
- 💎 **Küpeler**: 5 tier x 4 tip = 20 küpe (ATK/DEF/MAG/BAL)

### Tier Tablosu:
| Tier | Level Req | Rarity |
|------|-----------|--------|
| T1   | 1         | Common |
| T2   | 5         | Uncommon |
| T3   | 10        | Rare |
| T4   | 18        | Epic |
| T5   | 25        | Legendary |

**Toplam: 250 item ✅**

---

## 🐾 PET SİSTEMİ ✅ TAMAMLANDI
- [x] Pet modelleri ekleme (GLTF) - 20 pet (16 Cubee + 4 Black Magic)
- [x] Pet spawn/follow sistemi - VoxelSpartan'da entegre
- [x] Pet stat bonusları - EXP, Damage, Defense, HP
- [x] Pet satın alma - NpcShopView'da YOLDAŞLAR tab'ı
- [x] Pet equip sistemi - Karakter panelinde seçim
- [x] Pet leveling - ❌ İPTAL EDİLDİ (yapılmayacak)

---

## 🦋 KANAT SİSTEMİ ✅ TAMAMLANDI
- [x] Kanat modelleri - 6 kanat (Angel, Fairy, Demon, Dragon, Void, Seraph)
- [x] Kanat animasyonları - AdvancedWings component
- [x] Kanat stat bonusları - Damage, HP, Defense
- [x] Kanat satın alma - NpcShopView'da KANATLAR tab'ı
- [x] Kanat equip sistemi - Karakter panelinde seçim

---

## 🎨 UI/UX SORUNLARI
- [x] Karakter rotasyonu düzeltme (kameraya baksın) ✅
- [x] HUD boyut/şeffaflık ayarları ✅ SettingsView'a eklendi
- [x] Kontroller → Oyun Rehberi'ne taşındı
- [x] Envanter + Karakter stat points sistemi ✅
- [x] Karakter panelinde Pet/Kanat gösterimi ✅
- [x] HP/Mana pot butonları ayrı sürüklenebilir ✅
- [x] Arayüz özelleştirme ✅ HUD Özelleştirme sekmesi eklendi:
  - Genel HUD Şeffaflığı (50-100%)
  - Buton Boyutu (80-120%)
  - Yetenek Çubuğu Şeffaflığı (50-100%)
  - Mini Harita Şeffaflığı (50-100%)
  - Sohbet Şeffaflığı (50-100%)
- [x] Global dil ayarı (TR/EN) ✅ LanguageContext eklendi


---

## 🗺️ HARİTA & BÖLGELER
- [x] Harita legend (açıklama) kontrol et ✅ İşaretler eklendi (Portal, Oyuncu, Düşman, NPC)
- [x] Grid görünürlüğü (PvP mod için) ✅ showMapGrid ayarı eklendi
- [x] Portal bağlantıları kontrol ✅ 10 GLTF portal modeli + tüm zone bağlantıları mevcut

---

## ⚙️ AYARLAR
- [x] Oyun içi ayarlar entegrasyonu
- [x] Tam ayarlar (SettingsView) entegrasyonu
- [x] Ses ayarları çalışıyor mu kontrol ✅ SoundManager entegrasyonu yapıldı

---

## 🛡️ ZIRH SİSTEMİ
- [x] Her sınıf için T1-T5 zırh setleri ✅ ARMOR_SETS eklendi (30 item)
- [x] Kask, Göğüs, Pantolon, Çizme, Kolye, Küpe ✅ NPC Shop'a entegre edildi

---

## 💰 EKONOMİ SİSTEMİ (YENİ)
- [x] HP/Mana pot satışı (NPC shop'ta) ✅ POTIONS eklendi
- [x] Altın harcama mekanikleri ✅ Item repair, shop purchases
- [x] Item repair sistemi ✅ BlacksmithView'a Tamir sekmesi eklendi
- [x] Ticaret vergisi ✅ MarketModal'da mevcut

---

## 🎁 DİĞER
- [x] Auto-loot özelliği ✅ (Ayarlardan açık/kapalı)
- [x] Ev ziyaretleri - ❌ İPTAL EDİLDİ (yapılmayacak)
- [x] Crafting sistemi kontrolü ✅ Gold/Credits fix + T2-T5 silahlar/zırhlar
- [x] Daily Quest ödülleri ✅ Offline mock sistem + localStorage persistence

---

## 👥 PARTİ SİSTEMİ
- [x] Partiden ayrılma onay modalı ("Emin misin?") ✅
- [x] Parti daveti gönderme ✅ handleInviteToParty + partyAPI.invite
- [x] Parti lideri değiştirme ✅ PartyView'da mevcut
- [x] Parti üyesi atma ✅ handleKickPartyMember + partyAPI.kick

---

## 🏰 LONCA SİSTEMİ
- [x] Loncadan ayrılma sistemi (onay modalı) ✅
- [x] Lonca lideri rolü (zaten var)
- [x] Lonca yardımcısı rolü (zaten var)
- [x] Üye atma/davet yetkileri (zaten var)
- [x] Lonca sohbeti ✅ Chat sekmesi eklendi (mesajlaşma sistemi)
- [x] Lonca kasası ✅ Treasury sekmesi eklendi (yatırma/geçmiş)

---

## 🏠 EV SİSTEMİ
- [x] Ev sistemi KALDIRILDI ✅ (GameDashboard'dan HouseView kaldırıldı)

---

## 🐛 BUGLAR
- [x] Rate limit sorunu (development'ta devre dışı)
- [x] Karakter hareket/rotasyon sistemi (8-yönlü) ✅
- [x] Demirci %100 başarısızlık
- [x] UI öğeleri kayık/hizasız - Karakter seçim hatası düzeltildi ✅
- [x] Rütbe sistemi gözükmüyor (Header'a eklendi) ✅
- [x] Karakter modeli: Saç + Kafa pozisyonu düzeltildi (1.38, 1.15) ✅

---

*Son Güncelleme: 2025-12-31 14:20*

---

## ⏳ BEKLEMEDEKİ GÖREVLER

### 🧾 ICON GENERATION BACKLOG (QUOTA RESET BEKLİYOR)

**Durum**: Image generation quota exhausted (reset: ~01:28 TR)
**Validation**: `npm run validate:assets:prod` → ❌ (139 asset, 108 placeholder)

---

#### 🐎 Mount Icons (4 / 15 KALDI)

| Icon | Path | Size | Style | Status |
|------|------|------|-------|--------|
| `griffin.png` | `public/assets/mounts/` | 96x96 | Eagle-head + lion body, golden-brown | ❌ Pending |
| `dragon_ancient.png` | `public/assets/mounts/` | 96x96 | Ancient legendary dragon, dark scales | ❌ Pending |
| `unicorn_divine.png` | `public/assets/mounts/` | 96x96 | Divine holy unicorn, subtle glow pixels | ❌ Pending |
| `nightmare.png` | `public/assets/mounts/` | 96x96 | Dark cursed mount, red/purple accents | ❌ Pending |

**Tamamlanan (11/15)**:
- ✅ horse_brown, horse_white, donkey, camel, elephant
- ✅ wolf, tiger, lion, bear, dragon_small, phoenix

---

#### 🧩 UI Icons (27 ADET KALDI)

**Tier Badges** (6 adet):
| Icon | Path | Size | Status |
|------|------|------|--------|
| `tier_bronze.png` | `public/assets/ui/` | 48x48 | ❌ |
| `tier_silver.png` | `public/assets/ui/` | 48x48 | ❌ |
| `tier_gold.png` | `public/assets/ui/` | 48x48 | ❌ |
| `tier_diamond.png` | `public/assets/ui/` | 48x48 | ❌ |
| `tier_t4.png` | `public/assets/ui/` | 48x48 | ❌ |
| `tier_t5.png` | `public/assets/ui/` | 48x48 | ❌ |

**Crafting / Status Icons** (12 adet):
| Icon | Path | Size | Status |
|------|------|------|--------|
| `boss_essence.png` | `public/assets/ui/` | 48x48 | ❌ |
| `void_shard.png` | `public/assets/ui/` | 48x48 | ❌ |
| `gold_coin.png` | `public/assets/ui/` | 48x48 | ❌ |
| `diamond_gem.png` | `public/assets/ui/` | 48x48 | ❌ |
| `puzzle_piece.png` | `public/assets/ui/` | 48x48 | ❌ |
| `blocked.png` | `public/assets/ui/` | 48x48 | ❌ |
| `crafting.png` | `public/assets/ui/` | 48x48 | ❌ |
| `hammer.png` | `public/assets/ui/` | 48x48 | ❌ |
| `locked.png` | `public/assets/ui/` | 48x48 | ❌ |
| `success.png` | `public/assets/ui/` | 48x48 | ❌ |
| `failed.png` | `public/assets/ui/` | 48x48 | ❌ |
| `fire.png` | `public/assets/ui/` | 48x48 | ❌ |

**Zone Icons** (9 adet):
| Icon | Path | Size | Status |
|------|------|------|--------|
| `shop.png` | `public/assets/ui/` | 48x48 | ❌ |
| `blacksmith.png` | `public/assets/ui/` | 48x48 | ❌ |
| `healer.png` | `public/assets/ui/` | 48x48 | ❌ |
| `arena.png` | `public/assets/ui/` | 48x48 | ❌ |
| `castle.png` | `public/assets/ui/` | 48x48 | ❌ |
| `safe_zone.png` | `public/assets/ui/` | 48x48 | ❌ |
| `danger_zone.png` | `public/assets/ui/` | 48x48 | ❌ |
| `boss_zone.png` | `public/assets/ui/` | 48x48 | ❌ |
| `map_marker.png` | `public/assets/ui/` | 48x48 | ❌ |

---

#### 🔒 VALIDATION KURALLAR

```bash
# Her ikon eklendikten sonra:
npm run validate:assets:prod

# TÜM ikonlar bittikten sonra:
npm run build

# ✔️ Build PASS = RELEASE GO!
```

**STYLE LOCK (Tüm ikonlar için)**:
- Pixel art, game UI style (Minecraft-like but original)
- Transparent background (PNG alpha)
- NO background, NO square fill
- Centered icon, 70–80% canvas usage
- Clean silhouette, readable at small size
- 1–2px dark outline
- Subtle highlight pixels (no blur, no glow)
- Flat pixel shading (no gradients)

---

### Kadim General Rütbe İkonu
- [ ] **Kadim General** için özel pixel art icon üret
- Dosya: `/public/ranks/rank_20.png`

---

## 📋 GELİŞTİRME NOTLARI - ✅ IMPLEMENT EDİLDİ!

### 1. ITEM VE BUFF GELİŞTİRME MANTIĞI ✅

#### Soket (Gem) Sistemi ✅ TAMAMLANDI
- [x] T3 ve üzeri itemlara 1-3 soket açılabilir
- [x] 5 tier gem (Ateş, Buz, Kritik, Yaşam vb.)
- [x] Elemental hasar ve direnç bonusları
- 📁 `systems/SocketSystem.ts`

#### Set Bonusları ✅ TAMAMLANDI
- [x] T3-T5 zırh setleri
- [x] 2/3/4/5 parça bonusları
- [x] Özel efektler (dondurma, vampirizm, kalkan vb.)
- 📁 `systems/SetBonusSystem.ts`

#### Random Stats (Değişken Özellikler) ✅ TAMAMLANDI
- [x] Item düştüğünde belli aralıkta stat gelir
- [x] Kalite dereceleri: SSS, SS, S, A, B, C, D, F
- [x] Perfect item kontrolü
- 📁 `systems/RandomStats.ts`

---

### 2. PARA KAZANMA (P2W OLMAYAN) - ✅ TAMAMLANDI
| Harcama Türü | P2W mi? | Mantık | Dosya |
|--------------|---------|--------|-------|
| Battle Pass | Hayır | Sezonluk görevlerle kozmetik, binek, küçük farm materyali | `systems/BattlePassSystem.ts` |
| Kozmetikler | Hayır | Silah kaplamaları, efektler, pelerinler - oynanışa etkisi yok | `systems/CosmeticSystem.ts` |
| VIP/Premium | Kısmen | %10 XP veya %5 gold artışı - rekabeti bozmaz | `systems/VIPSystem.ts` |
| Envanter Genişletme | Hayır | Farm yapan için hayat kalitesi | `systems/InventoryExpansionSystem.ts` |

---

### 3. EMEK DÖNGÜSÜ (P2W KARŞITI) ✅ TAMAMLANDI

- [x] **Upgrade Sistemi**: +7'den sonra risk başlar
- [x] **%90 Yanma**: Item yok olur
- [x] **%10 Eskime**: Item hasar alır, tamir gerekir
- [x] Koruma parşömeni desteği
- 📁 `systems/UpgradeSystem.ts`

---

### 4. UPGRADE VE PARLAMA (+7'den +12'ye) ✅ TAMAMLANDI

- [x] **+7**: Sınıfın renginde hafif aura
- [x] **+8**: Daha yoğun aura
- [x] **+9**: Renk değişimi (altın)
- [x] **+10**: Uçuşan parçacıklar
- [x] **+11**: Trail efekti
- [x] **+12**: Maksimum efekt + zemin izi
- [x] Sınıfa özel parçacık tipleri (kar, nota, gölge vb.)
- 📁 `systems/GlowEffects.ts`

---

### 5. SINIF GRUPLARI VE ITEM BUFF MANTIĞI - ✅ TAMAMLANDI

| Sınıf Grubu | Sınıflar | Buff Türleri |
|-------------|----------|--------------|
| Öncü (Tank/DPS) | Savaşçı, Buz Şövalyesi | Defans, HP, Hasar Azaltma, Donma Direnci |
| Mobil/Çevik | Fırtına Süvarisi, Dövüş Ustası | Saldırı Hızı, Hareket Hızı, Kombo Hasarı |
| Menzilli Hasar | Usta Okçu, Ulu Büyücü | Kritik Şans, Menzil Artışı, Büyü Gücü (AP) |
| Destek/Şifacı | Ozan, Işık Rahibi, Ruhban | CDR, Mana Yenileme, Takım Buff Gücü |
| Özel/Yıkıcı | Ölüm Meleği | Lifesteal, Kanama Hasarı, İnfaz Bonusu |

📁 `systems/ClassBuffSystem.ts`

---

### 6. OZAN (BARD) SINIFI DERİNLEMESİNE - ✅ TAMAMLANDI

#### Aura ve Ritim Mekaniği ✅
- [x] Item tier'ına göre yakındaki takım arkadaşlarına pasif buff
- [x] 6 farklı aura tipi (Saldırı, Savunma, Hız, Regen, Kritik, Mana)
- [x] Mini-ritim oyunu ile buff etkisi %20-50 artabilir
- 📁 `systems/BardAuraSystem.ts`

#### Crowd Control ve Debuff
- "Hüzünlü Melodi": Düşman hareket hızı düşürme
- "Savaş Marşı": Düşman defansını %10 kırma
- Düşük savunma - takım arkadaşlarına muhtaç

#### Enstrüman Gelişimi
- **+7**: Enstrümandan nota sembolleri çıkması
- **+12**: Hareket ettikçe zemine müzik çizgileri (porteler) oluşması
- Marketten satılabilir: Ses paketleri, efekt renkleri

**Ozan'ın Rolü**: "Kuvvet Çarpanı" - Tek başına zayıf ama takımın gücünü 2 katına çıkarır

---

### 7. RÜN VE TAŞ CRAFT SİSTEMİ (P2W OLMAYAN KAZANÇ) - ✅ TAMAMLANDI

- [x] 7 element tipi (Ateş, Buz, Şimşek, Toprak, Boşluk, Kutsal, Doğa)
- [x] Her element için 5 tier rün (35 rün)
- [x] Rün craft tarifleri ve başarı oranları
- [x] Rün yuvaları ve market parşömenleri
- 📁 `systems/RuneSystem.ts`

**Market (Gelir)**: Sadece "Rün Yuvası Açma Parşömeni" sat
**Emek (Oyuncu)**: Yuvaya takılacak taşları oyuncu zorla craft etsin

---

### 8. EK TAVSİYELER

- **Görünüm Craftı**: Parlama efektini değiştiren materyaller (örn. +7'de mavi değil alevli) - craft sisteminde, markette satılabilir
- **Haftalık Liderlik Tablosu**: En çok craft yapan veya en yüksek upgrade'e ulaşanlara özel unvan/pelerin (güç vermeyen)

---

### 9. T5 ITEM ÖZ (ESSENCE) MANTIĞI - ✅ TAMAMLANDI

- [x] Her sınıf için özel T5 özü (10 silah özü + 2 zırh özü)
- [x] Düşme kaynakları (Dungeon, World Boss, Event, Quest)
- [x] T5 craft tarifleri ve süreler
- 📁 `systems/EssenceSystem.ts`

**Örnek Özler**:
- **Buz Şövalyesi**: "Buz Devinin Kalbi" - 10 kişilik dungeon'dan %1 şans
- **Ozan**: "Efsanevi Nota" - Ritim turnuvasında kazanılır
- **Ölüm Meleği**: "Boşluk Parçası" - 20 kişilik dungeon'dan %0.5 şans

---

### 10. DÜNYA BOSSU (WORLD BOSS) VE SOSYAL DAYANIŞMA - ✅ TAMAMLANDI

- [x] 3 dev boss (Kadim Ejderha, Fırtına Devası, Buzul Kolosu)
- [x] Zamanlanmış spawn sistemi (günde 1-2 kez)
- [x] 3 fazlı boss mekaniği
- [x] Katkı puanı hesaplama (hasar, tank, şifa, buff süresi)
- [x] Adil ödül dağıtımı - en iyi desteğe de ödül
- 📁 `systems/WorldBossSystem.ts`

**Boslar**:
- 🐉 **Kadim Ejderha Tiamat** (Lv50, 50M HP)
- ⛈️ **Fırtına Devası Thorak** (Lv45, 30M HP)  
- 🧊 **Buzul Kolosu Jotun** (Lv40, 25M HP)

---

### 11. MASTERPIECE (USTA İŞİ) CRAFT SİSTEMİ ✅ TAMAMLANDI

- [x] Craft sırasında %2 şansla "Usta İşi" çıkma
- [x] Oyuncu ismi item'a yazılır
- [x] Statlar %5 daha güçlü
- [x] Dünya duyurusu sistemi
- 📁 `systems/MasterpieceCraft.ts`

#### Kod Mantığı:
```javascript
function craftItem(player, recipe) {
    if (hasMaterials(player, recipe)) {
        const roll = Math.random() * 100;
        if (roll <= 2.0) { // %2 Şans
            const masterpieceItem = createItem(recipe.result, { isMasterpiece: true });
            masterpieceItem.creatorName = player.name;
            masterpieceItem.attackPower *= 1.05; // %5 Bonus
            notifyWorld(`${player.name} efsanevi bir eser üretti!`);
            return masterpieceItem;
        }
        return createItem(recipe.result);
    }
}
```

---

### 12. DİNAMİK HAVA DURUMU VE SINIF ETKİLEŞİMİ ✅ TAMAMLANDI

- [x] 5 hava durumu: Güneşli, Fırtınalı, Karlı, Sisli, Yağmurlu
- [x] 30-60 dakikada otomatik değişim
- [x] Sınıfa özel hasar/savunma/hız bonusları
- [x] Görsel efektler (yağmur, kar parçacıkları) - WeatherParticles component
- [x] UI göstergesi ve bildirim - WeatherIndicator, WeatherChangeNotification
- [x] ActiveZoneView'a entegre edildi ✅
- 📁 `systems/WeatherSystem.ts` + `components/WeatherEffects.tsx`

#### Hava Durumu Bonusları:
| Hava | Bonus Alan Sınıflar | Etki |
|------|---------------------|------|
| Güneşli | Işık Rahibi, Savaşçı | +%5-10 Güç, Şifa bonusu |
| Fırtınalı | Fırtına Süvarisi, Usta Okçu | +%15 Hız ve Menzil |
| Karlı/Buzlu | Buz Şövalyesi, Ulu Büyücü | +%15 Buz Hasarı, Dondurma |
| Sisli | Ölüm Meleği, Dövüş Ustası | +%20 Kritik, Görünmezlik |
| Yağmurlu | Ozan | +%20 Aura menzili |

#### Kod Mantığı:
```javascript
class WeatherManager {
    currentWeather = 'sunny'; // sunny, stormy, snowy, foggy
    
    getDamageMultiplier(playerClass) {
        if (this.currentWeather === 'snowy' && playerClass === 'arctic_knight') 
            return 1.10; // %10 Hasar artışı
        
        if (this.currentWeather === 'foggy' && playerClass === 'reaper')
            return 1.15; // Sisli havada Ölüm Meleği daha tehlikeli!
            
        return 1.0;
    }
}
```

---

### 13. GÖRSEL EFEKT HİYERARŞİSİ (Visual Effects Integration) - ✅ TAMAMLANDI

- [x] VoxelSpartan.tsx içine GlowEffects sistemi entegre edildi
- [x] **+7**: Hafif aura (sınıf renginde parçacıklar)
- [x] **+8**: Daha yoğun aura
- [x] **+9**: Altın halka + renk değişimi
- [x] **+10**: Sınıfa özel ikincil parçacıklar
- [x] **+11**: Trail efekti (hareket izi) + ikinci halka
- [x] **+12**: Zemin efekti + tüm efektler maksimum
- 📁 `systems/GlowEffects.ts` → `components/VoxelSpartan.tsx`

---

### 14. P2W OLMAYAN EKONOMİ KURALLARI

- **Item Silme Mekaniği**: +7'den sonraki upgrade'lerde item yanma riski
- **Unbind Mekaniği**: Üst seviye craft materyallerini ticarete kapatma (Soulbound)
- **Market Satışları**: Sadece kozmetik efektler ve "Inventory Expansion" paketleri

---

### 15. ITEM SINIF SİSTEMİ (Knight Online Tarzı) - ✅ TAMAMLANDI

- [x] 4 item sınıfı: Normal, High Class, Unique, Legendary
- [x] Her sınıf için farklı basma kağıtları
- [x] Sınıfa göre stat çarpanı (1x, 1.25x, 1.5x, 2x)
- [x] Trade kısıtlamaları (bound_on_equip, bound_on_pickup)
- [x] Koruma kağıtları (yanmayı engeller)
- [x] Yatırım itemleri (Elmas, Yakut, Anka Tüyü vb.)
- 📁 `systems/ItemClassSystem.ts`

---

### 16. KOSTÜM SİSTEMİ - ✅ TAMAMLANDI

- [x] Kostümler karakter üstünde gözükür (item değil)
- [x] Kostümler stat bonusu verir
- [x] Görsel efektler (aura, particle, trail)
- [x] Kategoriler: Normal, Premium, Event, Achievement, Limited
- [x] Süreli ve kalıcı kostümler
- [x] Full Set override sistemi
- 📁 `systems/CostumeSystem.ts`

---

### 🚀 DEPLOYMENT HAZIRLIĞI - ✅ TAMAMLANDI

- [x] Railway.app uyumlu server (PORT env variable)
- [x] Vercel.json konfigürasyonu
- [x] Procfile ve railway.json
- [x] Health check endpoint (/health)
- [x] Socket URL environment variable (VITE_SOCKET_URL)
- [x] .env.example dosyası
- [x] DEPLOYMENT.md kılavuzu
- 📁 `DEPLOYMENT.md`, `Procfile`, `railway.json`, `vercel.json`

#### Sonraki Adımlar:
1. GitHub repo oluştur ve push et
2. Railway.app'te backend deploy et
3. Vercel'de frontend deploy et
4. Arkadaşlarla test et!
