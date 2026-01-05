import React, { useState, useEffect, createContext, useContext } from 'react';
import {
    Settings, Volume2, VolumeX, Monitor, Globe, Bell, Eye,
    Palette, Sun, Moon, Save, RotateCcw, X, ChevronRight,
    Music, Gamepad, Shield, Zap
} from 'lucide-react';

// Settings interface
export interface GameSettings {
    // Audio
    masterVolume: number; // 0-100
    musicVolume: number;
    sfxVolume: number;
    uiSounds: boolean;

    // Graphics
    graphicsQuality: 'low' | 'medium' | 'high' | 'ultra';
    showParticles: boolean;
    showShadows: boolean;
    showPostProcessing: boolean;
    targetFPS: 30 | 60 | 120;

    // Interface
    language: 'tr' | 'en';
    showDamageNumbers: boolean;
    showPlayerNames: boolean;
    showHealthBars: boolean;
    showMinimap: boolean;
    showMapGrid: boolean; // Grid görünürlüğü (PvP için)
    chatFontSize: 'small' | 'medium' | 'large';
    uiScale: number; // 80-120

    // HUD Customization (NEW)
    hudOpacity: number; // 50-100
    buttonSize: number; // 80-120
    skillBarOpacity: number; // 50-100
    minimapOpacity: number; // 50-100
    chatOpacity: number; // 50-100

    // Gameplay
    autoLoot: boolean;
    showTutorialHints: boolean;
    confirmBeforeSelling: boolean;

    // Notifications
    showNotifications: boolean;
    notificationDuration: number; // ms
    showCombatNotifications: boolean;
    showSocialNotifications: boolean;

    // Privacy
    allowFriendRequests: boolean;
    allowPartyInvites: boolean;
    allowTradeRequests: boolean;
    showOnlineStatus: boolean;
}

// Default settings
export const DEFAULT_SETTINGS: GameSettings = {
    masterVolume: 80,
    musicVolume: 50,
    sfxVolume: 70,
    uiSounds: true,

    graphicsQuality: 'high',
    showParticles: true,
    showShadows: true,
    showPostProcessing: true,
    targetFPS: 60,

    language: 'tr',
    showDamageNumbers: true,
    showPlayerNames: true,
    showHealthBars: true,
    showMinimap: true,
    showMapGrid: true,
    chatFontSize: 'medium',
    uiScale: 100,

    // HUD Customization defaults
    hudOpacity: 100,
    buttonSize: 100,
    skillBarOpacity: 100,
    minimapOpacity: 85,
    chatOpacity: 80,

    autoLoot: true,
    showTutorialHints: true,
    confirmBeforeSelling: true,

    showNotifications: true,
    notificationDuration: 4000,
    showCombatNotifications: true,
    showSocialNotifications: true,

    allowFriendRequests: true,
    allowPartyInvites: true,
    allowTradeRequests: true,
    showOnlineStatus: true
};

// Settings Context
interface SettingsContextType {
    settings: GameSettings;
    updateSetting: <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => void;
    resetSettings: () => void;
    saveSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within SettingsProvider');
    }
    return context;
};

// Settings Provider
export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<GameSettings>(() => {
        const saved = localStorage.getItem('gameSettings');
        if (saved) {
            try {
                return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
            } catch {
                return DEFAULT_SETTINGS;
            }
        }
        return DEFAULT_SETTINGS;
    });

    const updateSetting = <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
        setSettings(prev => ({ ...prev, [key]: value }));

        // Sync language setting with localStorage for LanguageContext
        if (key === 'language') {
            localStorage.setItem('kadim_language', value as string);
            // Dispatch a custom event that LanguageContext listens to
            window.dispatchEvent(new CustomEvent('kadim-language-change', { detail: value }));
        }

        // Sync sound settings with SoundManager
        if (key === 'masterVolume' || key === 'sfxVolume') {
            window.dispatchEvent(new CustomEvent('kadim-sound-change', {
                detail: { type: 'sfx', value: (value as number) / 100 }
            }));
        }
        if (key === 'masterVolume' || key === 'musicVolume') {
            window.dispatchEvent(new CustomEvent('kadim-sound-change', {
                detail: { type: 'bgm', value: (value as number) / 100 }
            }));
        }

        // Dispatch all settings changes for components to listen
        window.dispatchEvent(new CustomEvent('kadim-settings-change', {
            detail: { key, value }
        }));
    };

    const resetSettings = () => {
        setSettings(DEFAULT_SETTINGS);
        localStorage.removeItem('gameSettings');
        localStorage.setItem('kadim_language', 'tr');
        window.dispatchEvent(new CustomEvent('kadim-language-change', { detail: 'tr' }));
        window.dispatchEvent(new CustomEvent('kadim-sound-change', { detail: { type: 'sfx', value: 0.7 } }));
        window.dispatchEvent(new CustomEvent('kadim-sound-change', { detail: { type: 'bgm', value: 0.5 } }));
    };

    const saveSettings = () => {
        localStorage.setItem('gameSettings', JSON.stringify(settings));
    };

    // Auto-save on change
    useEffect(() => {
        localStorage.setItem('gameSettings', JSON.stringify(settings));
    }, [settings]);

    return (
        <SettingsContext.Provider value={{ settings, updateSetting, resetSettings, saveSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};

// Settings categories
type SettingsCategory = 'audio' | 'graphics' | 'interface' | 'gameplay' | 'notifications' | 'privacy' | 'guide' | 'rank';

interface SettingsViewProps {
    onClose: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onClose }) => {
    const { settings, updateSetting, resetSettings } = useSettings();
    const [activeCategory, setActiveCategory] = useState<SettingsCategory>('audio');
    const [showResetModal, setShowResetModal] = useState(false);

    const categories: { id: SettingsCategory; label: string; icon: React.ReactNode }[] = [
        { id: 'audio', label: 'Ses', icon: <Volume2 size={18} /> },
        { id: 'graphics', label: 'Grafik', icon: <Monitor size={18} /> },
        { id: 'interface', label: 'Arayüz', icon: <Palette size={18} /> },
        { id: 'gameplay', label: 'Oynanış', icon: <Gamepad size={18} /> },
        { id: 'notifications', label: 'Bildirimler', icon: <Bell size={18} /> },
        { id: 'privacy', label: 'Gizlilik', icon: <Shield size={18} /> },
        { id: 'guide', label: 'Oyun Rehberi', icon: <Zap size={18} /> },
        { id: 'rank', label: 'Rütbe', icon: <Shield size={18} /> }
    ];

    // Slider component
    const Slider: React.FC<{
        value: number;
        min: number;
        max: number;
        onChange: (value: number) => void;
        label: string;
        showValue?: boolean;
        suffix?: string;
    }> = ({ value, min, max, onChange, label, showValue = true, suffix = '' }) => {
        const percentage = ((value - min) / (max - min)) * 100;

        return (
            <div className="mb-4">
                <div className="flex justify-between mb-2">
                    <span className="text-sm text-slate-300">{label}</span>
                    {showValue && <span className="text-sm text-cyan-400 font-bold">{value}{suffix}</span>}
                </div>
                <div className="relative h-3 bg-slate-700 rounded-full overflow-hidden">
                    {/* Filled portion */}
                    <div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full transition-all duration-100"
                        style={{ width: `${percentage}%` }}
                    />
                    {/* Actual input */}
                    <input
                        type="range"
                        min={min}
                        max={max}
                        value={value}
                        onChange={(e) => onChange(parseInt(e.target.value))}
                        className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-10"
                        style={{ WebkitAppearance: 'none', appearance: 'none' }}
                    />
                    {/* Thumb indicator */}
                    <div
                        className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-cyan-400 rounded-full border-2 border-white shadow-lg pointer-events-none transition-all duration-100"
                        style={{ left: `calc(${percentage}% - 8px)` }}
                    />
                </div>
            </div>
        );
    };

    // Toggle component
    const Toggle: React.FC<{
        value: boolean;
        onChange: (value: boolean) => void;
        label: string;
        description?: string;
    }> = ({ value, onChange, label, description }) => (
        <label className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700 cursor-pointer hover:bg-slate-800 transition-colors mb-2">
            <div>
                <span className="text-sm font-medium text-white">{label}</span>
                {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
            </div>
            <div className={`w-12 h-6 rounded-full transition-colors ${value ? 'bg-cyan-600' : 'bg-slate-600'}`}>
                <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform mt-0.5 ${value ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </div>
            <input
                type="checkbox"
                checked={value}
                onChange={(e) => onChange(e.target.checked)}
                className="sr-only"
            />
        </label>
    );

    // Select component
    const Select: React.FC<{
        value: string;
        options: { value: string; label: string }[];
        onChange: (value: string) => void;
        label: string;
    }> = ({ value, options, onChange, label }) => (
        <div className="mb-4">
            <label className="block text-sm text-slate-300 mb-2">{label}</label>
            <div className="relative">
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2.5 text-white focus:border-cyan-500 focus:outline-none appearance-none cursor-pointer hover:border-slate-500 transition-colors"
                    style={{
                        WebkitAppearance: 'none',
                        MozAppearance: 'none',
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 12px center',
                        paddingRight: '36px'
                    }}
                >
                    {options.map(opt => (
                        <option
                            key={opt.value}
                            value={opt.value}
                            className="bg-slate-800 text-white py-2"
                        >
                            {opt.label}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );

    // Render category content
    const renderContent = () => {
        switch (activeCategory) {
            case 'audio':
                return (
                    <div>
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Volume2 size={20} className="text-cyan-400" />
                            Ses Ayarları
                        </h3>
                        <Slider
                            label="Ana Ses"
                            value={settings.masterVolume}
                            min={0}
                            max={100}
                            onChange={(v) => updateSetting('masterVolume', v)}
                            suffix="%"
                        />
                        <Slider
                            label="Müzik"
                            value={settings.musicVolume}
                            min={0}
                            max={100}
                            onChange={(v) => updateSetting('musicVolume', v)}
                            suffix="%"
                        />
                        <Slider
                            label="Efektler"
                            value={settings.sfxVolume}
                            min={0}
                            max={100}
                            onChange={(v) => updateSetting('sfxVolume', v)}
                            suffix="%"
                        />
                        <Toggle
                            label="Arayüz Sesleri"
                            description="Buton tıklama ve menü sesleri"
                            value={settings.uiSounds}
                            onChange={(v) => updateSetting('uiSounds', v)}
                        />
                    </div>
                );

            case 'graphics':
                return (
                    <div>
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Monitor size={20} className="text-cyan-400" />
                            Grafik Ayarları
                        </h3>
                        <Select
                            label="Grafik Kalitesi"
                            value={settings.graphicsQuality}
                            options={[
                                { value: 'low', label: 'Düşük' },
                                { value: 'medium', label: 'Orta' },
                                { value: 'high', label: 'Yüksek' },
                                { value: 'ultra', label: 'Ultra' }
                            ]}
                            onChange={(v) => updateSetting('graphicsQuality', v as any)}
                        />
                        <Select
                            label="Hedef FPS"
                            value={settings.targetFPS.toString()}
                            options={[
                                { value: '30', label: '30 FPS' },
                                { value: '60', label: '60 FPS' },
                                { value: '120', label: '120 FPS' }
                            ]}
                            onChange={(v) => updateSetting('targetFPS', parseInt(v) as any)}
                        />
                        <Toggle
                            label="Parçacık Efektleri"
                            description="Savaş ve büyü parçacıkları"
                            value={settings.showParticles}
                            onChange={(v) => updateSetting('showParticles', v)}
                        />
                        <Toggle
                            label="Gölgeler"
                            value={settings.showShadows}
                            onChange={(v) => updateSetting('showShadows', v)}
                        />
                        <Toggle
                            label="İşlem Sonrası Efektler"
                            description="Bloom, glow efektleri"
                            value={settings.showPostProcessing}
                            onChange={(v) => updateSetting('showPostProcessing', v)}
                        />
                    </div>
                );

            case 'interface':
                return (
                    <div>
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Palette size={20} className="text-cyan-400" />
                            Arayüz Ayarları
                        </h3>
                        <Select
                            label="Dil"
                            value={settings.language}
                            options={[
                                { value: 'tr', label: 'Türkçe' },
                                { value: 'en', label: 'English' }
                            ]}
                            onChange={(v) => updateSetting('language', v as any)}
                        />
                        <Slider
                            label="Arayüz Boyutu"
                            value={settings.uiScale}
                            min={80}
                            max={120}
                            onChange={(v) => updateSetting('uiScale', v)}
                            suffix="%"
                        />
                        <Select
                            label="Sohbet Yazı Boyutu"
                            value={settings.chatFontSize}
                            options={[
                                { value: 'small', label: 'Küçük' },
                                { value: 'medium', label: 'Orta' },
                                { value: 'large', label: 'Büyük' }
                            ]}
                            onChange={(v) => updateSetting('chatFontSize', v as any)}
                        />
                        <Toggle
                            label="Hasar Sayıları"
                            value={settings.showDamageNumbers}
                            onChange={(v) => updateSetting('showDamageNumbers', v)}
                        />
                        <Toggle
                            label="Oyuncu İsimleri"
                            value={settings.showPlayerNames}
                            onChange={(v) => updateSetting('showPlayerNames', v)}
                        />
                        <Toggle
                            label="Can Çubukları"
                            value={settings.showHealthBars}
                            onChange={(v) => updateSetting('showHealthBars', v)}
                        />
                        <Toggle
                            label="Mini Harita"
                            value={settings.showMinimap}
                            onChange={(v) => updateSetting('showMinimap', v)}
                        />
                        <Toggle
                            label="Harita Grid"
                            description="PvP bölgelerinde koordinat grid'i"
                            value={settings.showMapGrid}
                            onChange={(v) => updateSetting('showMapGrid', v)}
                        />

                        {/* HUD Özelleştirme - Açıklama */}
                        <div className="mt-6 pt-6 border-t border-slate-700">
                            <h4 className="text-sm font-bold text-amber-400 mb-4 flex items-center gap-2">
                                🎨 HUD Özelleştirme
                            </h4>
                            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                                <p className="text-sm text-slate-300 mb-3">
                                    Buton boyutu, şeffaflık ve konumlandırma ayarları için oyun ekranındaki
                                    <strong className="text-yellow-400"> Arayüz Düzenleyici</strong>'yi kullanın.
                                </p>
                                <p className="text-xs text-slate-400">
                                    💡 Oyundayken sağ üstteki ⚙️ butonuna basın ve "Arayüz Düzenleyici"yi açın.
                                    Böylece değişiklikleri gerçek zamanlı görebilirsiniz.
                                </p>
                            </div>
                        </div>
                    </div>
                );

            case 'gameplay':
                return (
                    <div>
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Gamepad size={20} className="text-cyan-400" />
                            Oynanış Ayarları
                        </h3>
                        <Toggle
                            label="Otomatik Loot"
                            description="Düşen eşyaları otomatik topla"
                            value={settings.autoLoot}
                            onChange={(v) => updateSetting('autoLoot', v)}
                        />
                        <Toggle
                            label="Eğitim İpuçları"
                            description="Yardımcı ipuçlarını göster"
                            value={settings.showTutorialHints}
                            onChange={(v) => updateSetting('showTutorialHints', v)}
                        />
                        <Toggle
                            label="Satış Onayı"
                            description="Eşya satarken onay iste"
                            value={settings.confirmBeforeSelling}
                            onChange={(v) => updateSetting('confirmBeforeSelling', v)}
                        />
                    </div>
                );

            case 'notifications':
                return (
                    <div>
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Bell size={20} className="text-cyan-400" />
                            Bildirim Ayarları
                        </h3>
                        <Toggle
                            label="Bildirimleri Göster"
                            value={settings.showNotifications}
                            onChange={(v) => updateSetting('showNotifications', v)}
                        />
                        <Slider
                            label="Bildirim Süresi"
                            value={settings.notificationDuration / 1000}
                            min={2}
                            max={10}
                            onChange={(v) => updateSetting('notificationDuration', v * 1000)}
                            suffix="s"
                        />
                        <Toggle
                            label="Savaş Bildirimleri"
                            description="Kill, ölüm, düello sonuçları"
                            value={settings.showCombatNotifications}
                            onChange={(v) => updateSetting('showCombatNotifications', v)}
                        />
                        <Toggle
                            label="Sosyal Bildirimler"
                            description="Arkadaş, parti, mesaj"
                            value={settings.showSocialNotifications}
                            onChange={(v) => updateSetting('showSocialNotifications', v)}
                        />
                    </div>
                );

            case 'privacy':
                return (
                    <div>
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Shield size={20} className="text-cyan-400" />
                            Gizlilik Ayarları
                        </h3>
                        <Toggle
                            label="Arkadaşlık İstekleri"
                            description="Diğer oyunculardan istek al"
                            value={settings.allowFriendRequests}
                            onChange={(v) => updateSetting('allowFriendRequests', v)}
                        />
                        <Toggle
                            label="Parti Davetleri"
                            description="Parti davetlerini kabul et"
                            value={settings.allowPartyInvites}
                            onChange={(v) => updateSetting('allowPartyInvites', v)}
                        />
                        <Toggle
                            label="Takas İstekleri"
                            description="Takas isteklerini kabul et"
                            value={settings.allowTradeRequests}
                            onChange={(v) => updateSetting('allowTradeRequests', v)}
                        />
                        <Toggle
                            label="Çevrimiçi Durumu"
                            description="Durumunu diğer oyunculara göster"
                            value={settings.showOnlineStatus}
                            onChange={(v) => updateSetting('showOnlineStatus', v)}
                        />
                    </div>
                );

            case 'guide':
                return (
                    <div>
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Zap size={20} className="text-cyan-400" />
                            Oyun Rehberi
                        </h3>
                        <div className="space-y-4">
                            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                                <h4 className="text-sm font-bold text-yellow-400 mb-2">🎮 Temel Kontroller</h4>
                                <ul className="text-sm text-slate-300 space-y-1">
                                    <li>• <strong>Tıklama:</strong> Saldırı / Etkileşim</li>
                                    <li>• <strong>Joystick/WASD:</strong> Hareket</li>
                                    <li>• <strong>Z tuşu:</strong> Hızlı Saldırı</li>
                                    <li>• <strong>1-4 tuşları:</strong> Yetenekler</li>
                                </ul>
                            </div>
                            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                                <h4 className="text-sm font-bold text-green-400 mb-2">⚔️ Savaş Sistemi</h4>
                                <ul className="text-sm text-slate-300 space-y-1">
                                    <li>• Düşmana tıklayarak hedef al</li>
                                    <li>• Yetenekleri kullanarak hasar ver</li>
                                    <li>• Kritik vuruşlar ekstra hasar verir</li>
                                    <li>• Boss öldürme grup olarak daha kolay</li>
                                </ul>
                            </div>
                            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                                <h4 className="text-sm font-bold text-purple-400 mb-2">📦 Eşya Sistemi</h4>
                                <ul className="text-sm text-slate-300 space-y-1">
                                    <li>• Tier 1-5 eşyalar (5 en güçlü)</li>
                                    <li>• +0 ile +12 arası geliştirme</li>
                                    <li>• Nadir eşyalar daha güçlü statlar verir</li>
                                    <li>• Set eşyaları bonus stat sağlar</li>
                                </ul>
                            </div>
                            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                                <h4 className="text-sm font-bold text-blue-400 mb-2">💎 Para Birimleri</h4>
                                <ul className="text-sm text-slate-300 space-y-1">
                                    <li>• <span className="text-yellow-400">Altın:</span> Temel para birimi</li>
                                    <li>• <span className="text-cyan-400">Elmas:</span> Premium para birimi</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                );

            case 'rank':
                return (
                    <div>
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Shield size={20} className="text-cyan-400" />
                            Rütbe Sistemi
                        </h3>
                        <div className="space-y-3">
                            <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-4 rounded-lg border border-slate-600">
                                <p className="text-sm text-slate-300 mb-3">
                                    Düşman öldürerek <strong className="text-yellow-400">Şeref Puanı (Honor)</strong> kazan ve rütbeni yükselt!
                                </p>
                                <p className="text-xs text-slate-400">
                                    Yüksek rütbeler ekstra hasar ve savunma bonusu verir.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2">
                                {[
                                    { name: 'Acemi Savaşçı', honor: 0, icon: '🌱', bonus: '+0%' },
                                    { name: 'Gezgin', honor: 500, icon: '👟', bonus: '+0%' },
                                    { name: 'Kadim Gezgin', honor: 1000, icon: '🌿', bonus: '+1%' },
                                    { name: 'Kıdemli Gezgin', honor: 2500, icon: '✈️', bonus: '+2%' },
                                    { name: 'Acemi Milis', honor: 5000, icon: '⚔️', bonus: '+3%' },
                                    { name: 'Kıdemli Nefer', honor: 7500, icon: '🛡️', bonus: '+4%' },
                                    { name: 'Uzman Milis', honor: 10000, icon: '🎖️', bonus: '+5%' },
                                    { name: 'Aday Muhafız', honor: 25000, icon: '🥉', bonus: '+6%' },
                                    { name: 'Gezgin Savaşçı', honor: 50000, icon: '🥈', bonus: '+7%' },
                                    { name: 'Karakol Teğmeni', honor: 100000, icon: '🥇', bonus: '+8%' },
                                    { name: 'Savaş Lordu', honor: 10000000, icon: '👹', bonus: '+30%' },
                                    { name: 'Yüce Hükümdar', honor: 100000000, icon: '👑🔥', bonus: '+50%' },
                                ].map((rank, i) => (
                                    <div key={i} className="flex items-center justify-between p-2 bg-slate-800/50 rounded border border-slate-700">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">{rank.icon}</span>
                                            <span className="text-sm text-white font-medium">{rank.name}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-slate-400">{rank.honor.toLocaleString()} Honor</span>
                                            <span className="text-xs text-green-400 font-bold">{rank.bonus}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl h-[80vh] flex overflow-hidden shadow-2xl relative z-[9999]">
                {/* Sidebar */}
                <div className="w-48 bg-slate-800/50 border-r border-slate-700 p-4">
                    <div className="flex items-center gap-2 mb-6">
                        <Settings className="text-cyan-400" size={24} />
                        <h2 className="text-lg font-bold text-white">Ayarlar</h2>
                    </div>
                    <nav className="space-y-1">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeCategory === cat.id
                                    ? 'bg-cyan-600 text-white'
                                    : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                                    }`}
                            >
                                {cat.icon}
                                <span className="text-sm font-medium">{cat.label}</span>
                            </button>
                        ))}
                    </nav>

                    {/* Reset Button */}
                    <button
                        onClick={() => setShowResetModal(true)}
                        className="w-full mt-6 flex items-center justify-center gap-2 px-3 py-2 text-red-400 hover:bg-red-900/30 rounded-lg transition-colors text-sm"
                    >
                        <RotateCcw size={14} />
                        Sıfırla
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-slate-700">
                        <h3 className="text-white font-bold">
                            {categories.find(c => c.id === activeCategory)?.label}
                        </h3>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <X size={20} className="text-slate-400" />
                        </button>
                    </div>

                    {/* Settings Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {renderContent()}
                    </div>
                </div>
            </div>

            {/* Reset Confirm Modal */}
            {showResetModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10000] flex items-center justify-center p-4">
                    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl border border-red-600/50 p-6 max-w-md w-full shadow-2xl">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <RotateCcw size={32} className="text-red-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Ayarları Sıfırla</h3>
                            <p className="text-slate-400 text-sm">
                                Tüm ayarlar varsayılan değerlerine döndürülecek. Bu işlem geri alınamaz.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowResetModal(false)}
                                className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                            >
                                İptal
                            </button>
                            <button
                                onClick={() => {
                                    resetSettings();
                                    setShowResetModal(false);
                                }}
                                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium transition-colors"
                            >
                                Sıfırla
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsView;
