# 📘 KADIM SAVAŞLAR - GELİŞTİRİCİ REHBERİ

Bu döküman, projenin teknik yapısını, dosya organizasyonunu ve geliştirme süreçlerini içerir. Oyunda bir değişiklik yapmak istediğinizde ilk bakacağınız yer burasıdır.

---

## 🛠️ TEKNOLOJİ YIĞINI (TECH STACK)

Bu proje modern web teknolojileri ile geliştirilmiş, tarayıcı tabanlı bir 3D MMORPG oyunudur.

| Kategori | Teknoloji | Açıklama |
|----------|-----------|----------|
| **Core** | React 18 | UI ve Component yapısı için |
| **Dil** | TypeScript | Tip güvenliği ve kod kalitesi için |
| **3D Motoru** | Three.js (@react-three/fiber) | 3D render işlemleri için |
| **Fizik** | Rapier (@react-three/rapier) | Çarpışma ve fizik hesaplamaları |
| **State** | Zustand | Global state yönetimi (Oyuncu, Envanter vb.) |
| **Styling** | TailwindCSS | Hızlı ve responsive UI tasarımı |
| **Build** | Vite | Hızlı geliştirme ve build aracı |
| **Multiplayer** | Socket.io | Gerçek zamanlı sunucu iletişimi |

---

## 📂 DOSYA YAPISI VE ÖNEMLİ KONUMLAR

Proje `c:\Users\yunus\OneDrive\Masaüstü\Kadim savaşlar` dizinindedir.

### 1. 🏗️ Ana Yapı (`/components`)
Oyunun kalbi buradadır. Tüm 3D sahneler, UI ve oyun mantığı burada bulunur.

| Dosya / Klasör | Açıklama | Ne Zaman Buraya Bakmalısın? |
|----------------|----------|-----------------------------|
| **`GameScene.tsx`** | 🌍 **ANA SAHNE** | Oyun dünyası, harita yükleme, karakterlerin doğuşu. |
| **`GameDashboard.tsx`** | 🖥️ **ANA UI** | HUD, butonlar, pencereler, inventory, yetenek barı. |
| **`VoxelSpartan.tsx`** | 👤 **KARAKTER** | Karakter modeli, animasyonlar, silah/zırh görünümleri. |
| **`ActiveZoneView.tsx`** | 🗺️ **HARİTA** | Mob'ların spawn olması, NPC'ler, çevre objeleri. |
| **`InventoryModal.tsx`** | 🎒 **ENVANTER** | Eşya detayları, stat hesaplamaları, item tooltip. |
| **`SkillEffects.tsx`** | ✨ **EFEKTLER** | Yetenek görsel efektleri, parçacıklar. |
| **`StatPointsPanel.tsx`** | 📊 **STATLAR** | STR/DEX/INT dağılımı, karakter güç hesaplaması. |

### 2. 🧠 Oyun Mantığı (`/store`, `/utils`)
Verilerin yönetildiği ve yardımcı fonksiyonların olduğu yer.

| Dosya | Açıklama |
|-------|----------|
| **`store/gameStore.ts`** | Global oyun durumu (HP, Mana, Pozisyon, Level). |
| **`utils/combatSystem.ts`** | Hasar hesaplama, saldırı menzili, skill mantığı. |
| **`types.ts`** | TypeScript tip tanımları (Item, Skill, MobConfig). |
| **`components/constants.ts`** | Sabit veriler (Item listesi, Skill verileri, NPC'ler). |

### 3. 🤖 Mob ve NPC'ler (`/components/VoxelMobs`)
Tüm düşman ve yaratık modelleri burada, Voxel formatında (React component olarak) bulunur.
- **Normal:** Kurt, Goblin, İskelet vb.
- **Boss:** Ejderha, Golem, Buz Devi vb.

---

## 🔍 "BUNU NEREDE DEĞİŞTİRECEĞİM?" REHBERİ

Bir özelliği değiştirmek istiyorsan, aşağıdaki tabloyu kullan:

### 🗡️ Savaş ve Yetenekler
- **Hasar Formülü Değişimi:** `utils/combatSystem.ts` -> `calculateDamage` fonksiyonu.
- **Skill Cooldown/Mana:** `types.ts` (arayüz) ve `components/constants.ts` (değerler).
- **Skill Görseli:** `SkillEffects.tsx`.

### 👗 Görünüm ve Eşyalar
- **Yeni Item Ekleme:** `components/constants.ts` -> `ALL_ITEMS` listesi.
- **Zırh/Silah Modeli:** `VoxelSpartan.tsx` -> `renderArmor`/`renderWeapon`.
- **Item İkonları:** `public/assets/items/` klasörüne PNG atılacak.

### 🗺️ Harita ve Yaratıklar
- **Mob Spawn Noktaları:** `ActiveZoneView.tsx` -> `zones` objesi.
- **Mob Güçleri/HP:** `MobDefinitions.ts`.
- **Yeni Harita Ekleme:** `components/constants.ts` -> `ZONES` listesi.

### 🖥️ Arayüz (UI)
- **Sol/Sağ Menüler:** `GameDashboard.tsx`.
- **Eşya Detay Penceresi:** `InventoryModal.tsx`.
- **Character Select Ekranı:** `CharacterSelect.tsx`.

---

## 🚀 NASIL ÇALIŞTIRILIR?

1. **Terminali Aç:** `Ctrl + Ş` (VS Code)
2. **Komut:** `npm run dev`
3. **Tarayıcı:** `http://localhost:5173` adresine git.

## 📦 BUILD (PROD) ALMA

Oyun canlıya (Vercel vb.) çıkmadan önce build alınır:
`npm run build:skip-validation`

---

*Bu dosya Antigravity tarafından 03.01.2026 tarihinde oluşturulmuştur.*
