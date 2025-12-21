# 🗄️ MongoDB Kurulum Rehberi

## Seçenek 1: MongoDB Atlas (Cloud - ÖNERİLEN) ☁️

1. **MongoDB Atlas Hesabı Aç:**
   - https://www.mongodb.com/cloud/atlas/register adresine git
   - Ücretsiz hesap oluştur (Google/GitHub ile hızlıca giriş yapabilirsin)

2. **Free Cluster Oluştur:**
   - "Build a Database" → "Shared" (FREE tier) seç
   - Provider: AWS/Google/Azure (fark etmez)
   - Region: Europe (Frankfurt, Ireland, Paris - yakın olanı seç)
   - Cluster name: `kadim-savaslar` (istersen değiştirebilirsin)
   - "Create" butonuna tıkla (2-3 dakika sürer)

3. **Database User Oluştur:**
   - "Security" → "Database Access"
   - "Add New Database User"
   - Username: `kadim_user`
   - Password: Güçlü bir şifre oluştur (not et!)
   - Role: "Atlas Admin" seç
   - "Add User"

4. **IP Whitelist Ayarla:**
   - "Security" → "Network Access"
   - "Add IP Address"
   - **Geliştirme için:** "Allow Access from Anywhere" (0.0.0.0/0) seç
   - **Production için:** Sadece server IP'ni ekle
   - "Confirm"

5. **Connection String Al:**
   - "Data Services" → "Clusters" → "Connect"
   - "Connect your application"
   - Driver: Node.js, Version: 5.5 or later
   - Connection string'i kopyala:
     ```
     mongodb+srv://kadim_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - `<password>` kısmını kendi şifrenle değiştir!

6. **`.env` Dosyasını Güncelle:**
   ```env
   MONGODB_URI=mongodb+srv://kadim_user:ŞİFREN_BURAYA@cluster0.xxxxx.mongodb.net/kadim_savaslar?retryWrites=true&w=majority
   ```

---

## Seçenek 2: Local MongoDB (Windows)

1. **MongoDB Community Edition İndir:**
   - https://www.mongodb.com/try/download/community
   - Version: 7.0 (latest)
   - Platform: Windows
   - Package: MSI
   - İndir ve kur

2. **MongoDB Compass İndir (GUI Tool):**
   - https://www.mongodb.com/try/download/compass
   - Kurulumda otomatik olarak yükleniyor olabilir

3. **MongoDB Servisini Başlat:**
   PowerShell'de şu komutu çalıştır:
   ```powershell
   net start MongoDB
   ```

4. **`.env` Dosyası Ayarı:**
   Local MongoDB için zaten doğru:
   ```env
   MONGODB_URI=mongodb://localhost:27017/kadim_savaslar
   ```

5. **MongoDB Compass ile Bağlan:**
   - MongoDB Compass'ı aç
   - Connection string: `mongodb://localhost:27017`
   - "Connect" butonuna tıkla
   - Database: `kadim_savaslar` oluştur

---

## ✅ Test Etme

Server'ı çalıştır:
```bash
npm run server:dev
```

Çıktıda şunu görmelisin:
```
✅ MongoDB connected successfully
🚀 Server running on port 3001
```

Eğer hata alırsan:
- `.env` dosyasındaki connection string'i kontrol et
- MongoDB Atlas'taysa IP whitelist'i kontrol et
- Local MongoDB'yse servisin çalıştığından emin ol

---

## 🔒 GÜVENLİK UYARILARI

1. **`.env` dosyasını asla GitHub'a pushla!**
   - `.gitignore` dosyasına `.env` eklendi mi kontrol et

2. **Production'da güçlü JWT_SECRET kullan:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```
   Bu komutu çalıştırıp çıkan değeri `JWT_SECRET` olarak kullan

3. **MongoDB şifresini karmaşık tut:**
   - En az 16 karakter
   - Büyük/küçük harf, sayı, özel karakter

---

## 📚 Sırada Ne Var?

Backend başarıyla çalıştıysa:
✅ MongoDB bağlantısı çalışıyor
✅ Authentication endpoints hazır
✅ TypeScript compilation çalışıyor

**Sıradaki adımlar:**
1. Postman/Insomnia ile API testleri
2. Frontend'den register/login entegrasyonu
3. Character API endpoint'leri
4. Guild API endpoint'leri
