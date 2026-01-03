# 🎯 ZIRH (ARMOR) GLTF MODELLERİNİ EKLE

Sen şu klasörlere **GLTF armor modelleri** ekleyeceksin:

## 📁 Klasör Yapısı

```
public/models/items/armor/
├── warrior/
│   ├── armor_t1.gltf      (Tier 1 - Bronz)
│   ├── armor_t2.gltf      (Tier 2 - Demir)
│   ├── armor_t3.gltf      (Tier 3 - Çelik)
│   ├── armor_t4.gltf      (Tier 4 - Mithril)
│   └── armor_t5.gltf      (Tier 5 - Ejder)
├── arctic_knight/
│   ├── armor_t1.gltf
│   ├── armor_t2.gltf
│   ├── armor_t3.gltf
│   ├── armor_t4.gltf
│   └── armor_t5.gltf
├── archer/
│   └── ... (aynı yapı)
├── archmage/
│   └── ... (aynı yapı)
├── bard/
│   └── ... (aynı yapı)
├── cleric/
│   └── ... (aynı yapı)
├── gale_glaive/
│   └── ... (aynı yapı)
├── martial_artist/
│   └── ... (aynı yapı)
├── monk/
│   └── ... (aynı yapı)
└── reaper/
    └── ... (aynı yapı)
```

## 🎨 MODELLEMEKöşe Notları

1. **Dosya Adı Formatı**: `armor_t{tier}.gltf` (küçük harf, tier 1-5)
2. **Scale**: Model boyutu karakterin göğüs bölgesine uygun olmalı
3. **Pivot Point**: Karakterin merkez noktasında olmalı (0,0,0)
4. **Texture**: GLTF dosyasına embed edilmeli veya yanında `.png` olmalı

## ✅ Kod Hazır!

GLTF modelleri eklediğinde **otomatik olarak** karakterlere giyecek.
Kod şu anda zaten:
- ✅ `armorItem` prop'u alıyor
- ✅ Tier'a göre doğru modeli yükleyecek
- ✅ Karakter üzerinde render edecek

---

## 🚀 ŞİMDİLİK ALTERNATİF: RENK SİSTEMİ

GLTF modelleri yoksa/henüz hazır değilse, **Material Color** ile zırh gösterebiliriz:
- Tier 1 = Kahverengi
- Tier 2 = Gri
- Tier 3 = Mavi
- Tier 4 = Mor
- Tier 5 = Altın

Hangisini istersin?
A) GLTF modelleri ekleyeceğim (ben kodu hallettim, sen modelleri ekle)
B) Şimdilik renk sistemi kullan (5 dakikada implement edilir)
