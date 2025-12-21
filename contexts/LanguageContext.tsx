import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'tr' | 'en';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// All translations
export const TRANSLATIONS: Record<Language, Record<string, string>> = {
    tr: {
        // Common
        'close': 'Kapat',
        'confirm': 'Onayla',
        'cancel': 'İptal',
        'save': 'Kaydet',
        'loading': 'Yükleniyor...',
        'error': 'Hata',
        'success': 'Başarılı',
        'yes': 'Evet',
        'no': 'Hayır',
        'back': 'Geri',
        'next': 'İleri',
        'buy': 'Satın Al',
        'sell': 'Sat',
        'equip': 'Kuşan',
        'unequip': 'Çıkar',
        'use': 'Kullan',
        'delete': 'Sil',

        // Auth
        'login': 'Giriş Yap',
        'logout': 'Çıkış Yap',
        'register': 'Kayıt Ol',
        'email': 'E-posta',
        'password': 'Şifre',
        'guest_login': 'Misafir Olarak Devam Et',
        'developer_login': 'Geliştirici Girişi',

        // Character
        'character_select': 'Karakter Seç',
        'create_character': 'Karakter Oluştur',
        'start_adventure': 'MACERAYA BAŞLA',
        'character_name': 'Karakter Adı',
        'level': 'Seviye',
        'class': 'Sınıf',
        'faction': 'Hizip',

        // Stats
        'hp': 'Can',
        'mana': 'Mana',
        'damage': 'Hasar',
        'defense': 'Savunma',
        'strength': 'Güç',
        'dexterity': 'Çeviklik',
        'intelligence': 'Zeka',
        'vitality': 'Dayanıklılık',
        'exp': 'Tecrübe',
        'gold': 'Altın',
        'honor': 'Onur',

        // Classes
        'warrior': 'Savaşçı',
        'arctic_knight': 'Buz Şövalyesi',
        'gale_glaive': 'Fırtına Süvarisi',
        'archer': 'Usta Okçu',
        'archmage': 'Başbüyücü',
        'bard': 'Ozan',
        'cleric': 'Rahip',
        'martial_artist': 'Dövüş Ustası',
        'monk': 'Keşiş',
        'reaper': 'Azrail',

        // Factions
        'marsu': 'Ateş Lejyonu',
        'terya': 'Su Muhafızları',
        'venu': 'Doğa Bekçileri',

        // UI Elements
        'inventory': 'Envanter',
        'character': 'Karakter',
        'skills': 'Yetenekler',
        'quests': 'Görevler',
        'map': 'Harita',
        'settings': 'Ayarlar',
        'shop': 'Mağaza',
        'chat': 'Sohbet',
        'party': 'Parti',
        'guild': 'Lonca',
        'achievements': 'Başarımlar',
        'daily_rewards': 'Günlük Ödüller',

        // Shop
        'all': 'Tümü',
        'consumables': 'Tüketimler',
        'gear': 'Teçhizat',
        'pets': 'Yoldaşlar',
        'wings': 'Kanatlar',
        'price': 'Fiyat',
        'owned': 'Sahip',
        'free': 'Ücretsiz',

        // Combat
        'attack': 'Saldır',
        'defend': 'Savun',
        'flee': 'Kaç',
        'critical': 'Kritik!',
        'miss': 'Iskaladı!',
        'dead': 'Öldün!',
        'revive': 'Dirilt',
        'respawn': 'Yeniden Doğ',

        // Settings
        'language': 'Dil',
        'sound': 'Ses',
        'music': 'Müzik',
        'effects': 'Efektler',
        'pvp_priority': 'PvP Önceliği',
        'show_names': 'İsimleri Göster',
        'device_mode': 'Cihaz Modu',
        'hud_scale': 'HUD Boyutu',
        'auto_loot': 'Otomatik Loot',

        // Messages
        'not_enough_gold': 'Yeterli altın yok!',
        'not_enough_mana': 'Yeterli mana yok!',
        'level_required': 'Seviye yetersiz!',
        'inventory_full': 'Envanter dolu!',
        'item_equipped': 'Kuşanıldı!',
        'item_unequipped': 'Çıkartıldı!',
        'purchase_success': 'Satın alındı!',
        'are_you_sure': 'Emin misin?',

        // Misc
        'online_players': 'Çevrimiçi Oyuncular',
        'zone': 'Bölge',
        'portal': 'Portal',
        'npc': 'NPC',
        'enemy': 'Düşman',
        'boss': 'Patron',
        'crafting': 'Üretim',
        'blacksmith': 'Demirci',
        'market': 'Pazar',
    },
    en: {
        // Common
        'close': 'Close',
        'confirm': 'Confirm',
        'cancel': 'Cancel',
        'save': 'Save',
        'loading': 'Loading...',
        'error': 'Error',
        'success': 'Success',
        'yes': 'Yes',
        'no': 'No',
        'back': 'Back',
        'next': 'Next',
        'buy': 'Buy',
        'sell': 'Sell',
        'equip': 'Equip',
        'unequip': 'Unequip',
        'use': 'Use',
        'delete': 'Delete',

        // Auth
        'login': 'Login',
        'logout': 'Logout',
        'register': 'Register',
        'email': 'Email',
        'password': 'Password',
        'guest_login': 'Continue as Guest',
        'developer_login': 'Developer Login',

        // Character
        'character_select': 'Select Character',
        'create_character': 'Create Character',
        'start_adventure': 'START ADVENTURE',
        'character_name': 'Character Name',
        'level': 'Level',
        'class': 'Class',
        'faction': 'Faction',

        // Stats
        'hp': 'HP',
        'mana': 'Mana',
        'damage': 'Damage',
        'defense': 'Defense',
        'strength': 'Strength',
        'dexterity': 'Dexterity',
        'intelligence': 'Intelligence',
        'vitality': 'Vitality',
        'exp': 'Experience',
        'gold': 'Gold',
        'honor': 'Honor',

        // Classes
        'warrior': 'Warrior',
        'arctic_knight': 'Arctic Knight',
        'gale_glaive': 'Gale Glaive',
        'archer': 'Master Archer',
        'archmage': 'Archmage',
        'bard': 'Bard',
        'cleric': 'Cleric',
        'martial_artist': 'Martial Artist',
        'monk': 'Monk',
        'reaper': 'Reaper',

        // Factions
        'marsu': 'Fire Legion',
        'terya': 'Water Guardians',
        'venu': 'Nature Keepers',

        // UI Elements
        'inventory': 'Inventory',
        'character': 'Character',
        'skills': 'Skills',
        'quests': 'Quests',
        'map': 'Map',
        'settings': 'Settings',
        'shop': 'Shop',
        'chat': 'Chat',
        'party': 'Party',
        'guild': 'Guild',
        'achievements': 'Achievements',
        'daily_rewards': 'Daily Rewards',

        // Shop
        'all': 'All',
        'consumables': 'Consumables',
        'gear': 'Gear',
        'pets': 'Companions',
        'wings': 'Wings',
        'price': 'Price',
        'owned': 'Owned',
        'free': 'Free',

        // Combat
        'attack': 'Attack',
        'defend': 'Defend',
        'flee': 'Flee',
        'critical': 'Critical!',
        'miss': 'Miss!',
        'dead': 'You Died!',
        'revive': 'Revive',
        'respawn': 'Respawn',

        // Settings
        'language': 'Language',
        'sound': 'Sound',
        'music': 'Music',
        'effects': 'Effects',
        'pvp_priority': 'PvP Priority',
        'show_names': 'Show Names',
        'device_mode': 'Device Mode',
        'hud_scale': 'HUD Scale',
        'auto_loot': 'Auto Loot',

        // Messages
        'not_enough_gold': 'Not enough gold!',
        'not_enough_mana': 'Not enough mana!',
        'level_required': 'Level required!',
        'inventory_full': 'Inventory full!',
        'item_equipped': 'Equipped!',
        'item_unequipped': 'Unequipped!',
        'purchase_success': 'Purchased!',
        'are_you_sure': 'Are you sure?',

        // Misc
        'online_players': 'Online Players',
        'zone': 'Zone',
        'portal': 'Portal',
        'npc': 'NPC',
        'enemy': 'Enemy',
        'boss': 'Boss',
        'crafting': 'Crafting',
        'blacksmith': 'Blacksmith',
        'market': 'Market',
    }
};

interface LanguageProviderProps {
    children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>(() => {
        // Load from localStorage or default to 'tr'
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('kadim_language');
            return (saved as Language) || 'tr';
        }
        return 'tr';
    });

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        if (typeof window !== 'undefined') {
            localStorage.setItem('kadim_language', lang);
        }
    };

    // Translation function
    const t = (key: string): string => {
        return TRANSLATIONS[language][key] || key;
    };

    useEffect(() => {
        // Sync on mount
        const saved = localStorage.getItem('kadim_language');
        if (saved && (saved === 'tr' || saved === 'en')) {
            setLanguageState(saved);
        }

        // Listen for language change events from SettingsView
        const handleLanguageChange = (event: CustomEvent) => {
            const newLang = event.detail as Language;
            if (newLang === 'tr' || newLang === 'en') {
                setLanguageState(newLang);
            }
        };

        window.addEventListener('kadim-language-change', handleLanguageChange as EventListener);

        return () => {
            window.removeEventListener('kadim-language-change', handleLanguageChange as EventListener);
        };
    }, []);

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = (): LanguageContextType => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within LanguageProvider');
    }
    return context;
};

export default LanguageContext;
