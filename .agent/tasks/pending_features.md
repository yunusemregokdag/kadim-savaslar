# 📋 BEKLEYEN ÖZELLİKLER - Kadim Savaşlar

**Oluşturulma:** 2026-01-05  
**Durum:** Aktif

---

## 1. ⚡ SKILL İCONLARI - KODLA YAPILACAK
- [ ] Warrior charge skill (ateş efekti) - SVG/CSS ile
- [ ] Diğer sınıf skilleri sırayla
- **Referans:** charge1.png - Turuncu/sarı ateş şimşeği
- **Yöntem:** CSS gradients + clip-path veya inline SVG

---

## 2. 🔮 MANA LEVEL SCALING (x10)
- [x] ~~Her levelde mana bedeli %10 artsın~~ ✅ TAMAMLANDI
- **Formül:** `actualManaCost = baseCost * (1 + (playerLevel * 0.1))`
- **Örnek:** Level 30'da skill 4x mana harcamalı
- **Dosya:** `components/ActiveZoneView.tsx` - handleSkill fonksiyonu

---

## 3. 💰 PAZAR FİYATLARI (x15)
- [ ] İksirler normal değerin 15 katına satılmalı
- **Amaç:** Ekonomiyi kıtlık üzerine kurmak, grind teşvik etmek
- **Dosya:** `constants.ts` - POTIONS dizisi veya NPC Shop

---

## 4. 🗡️ BAŞLANGIÇ SİLAHI (+7 PARLAYAN)
- [ ] T1 başlangıç silahı +7 geliştirme ile başlasın
- [ ] Parlama efekti olsun (glow)
- [ ] T1'ler arasında en iyi statlar ama OP değil
- [ ] Satılabilir olmalı
- **Dosya:** `constants.ts` - CLASS_STARTER_ITEMS

---

## 5. 📦 LOOT KUTUSU SİSTEMİ
- [x] ~~Otomatik toplanmayacak~~ ✅ TAMAMLANDI
- [x] ~~"AL" butonu ile alınacak~~ ✅ TAMAMLANDI
- [x] ~~60 saniye owner lock~~ ✅ TAMAMLANDI
- [x] ~~60-120 arası herkese açık~~ ✅ TAMAMLANDI
- [x] ~~120 saniye sonra despawn~~ ✅ TAMAMLANDI
- [x] ~~Kalan süre gösterimi~~ ✅ TAMAMLANDI
- **Dosya:** `components/ActiveZoneView.tsx` - VoxelLootBox component

---

## 6. 🐉 BOSS ÖDÜL DAĞILIMI
- [x] ~~En çok hasar veren → En iyi ödül (item düşer)~~ ✅ TAMAMLANDI
- [x] ~~Diğerleri → Gold alır (hasara göre azalan)~~ ✅ TAMAMLANDI
- [x] ~~Hasar takip sistemi (damageMap)~~ ✅ TAMAMLANDI
- **Dosya:** `components/ActiveZoneView.tsx` - handleKill

---

## 7. 🎖️ RÜTBE GÖSTERGE DÜZELTMESİ
- [x] ~~"Warrior" yerine gerçek rütbe gösterilecek~~ ✅ TAMAMLANDI

---

## 8. 📱 ALT BAR MOBİL SCROLL
- [x] ~~11 buton yatay scroll ile~~ ✅ TAMAMLANDI

---

## 🔄 ÖNCELİK SIRASI:
1. Skill iconları (görsel önemli)
2. Loot kutusu sistemi (oynanış kritik)
3. Boss ödül dağılımı (oynanış kritik)
4. Mana scaling
5. Pazar fiyatları
6. Başlangıç silahı

---

**Son Güncelleme:** 2026-01-05 00:10
