@echo off
title Kadim Savaslar - Baslatiliyor
color 0A
echo ==========================================
echo       KADIM SAVASLAR BASLATILIYOR...
echo ==========================================
echo.
echo 1. Sunucu (Backend) baslatiliyor...
start "Kadim Savaslar Server" cmd /k "npm start"
echo.
echo 2. Oyun (Frontend) baslatiliyor...
echo Oyuna girmek icin tarayicinizda http://localhost:3000 adresine gidin.
start "Kadim Savaslar Client" cmd /k "npm run dev"
echo.
echo ==========================================
echo  OYUN ARKA PLANDA ACILDI!
echo  Server ve Client pencerelerini KAPATMAYIN.
echo ==========================================
echo.
pause
