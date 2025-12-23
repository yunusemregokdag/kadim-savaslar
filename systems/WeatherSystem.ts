// ============================================
// DİNAMİK HAVA DURUMU SİSTEMİ
// ============================================

export type WeatherType = 'sunny' | 'stormy' | 'snowy' | 'foggy' | 'rainy';

export interface WeatherEffect {
    type: WeatherType;
    name: string;
    icon: string;
    description: string;
    duration: number; // Dakika cinsinden
    classBuffs: { [charClass: string]: ClassBuff };
    ambientColor: string;
    fogDensity: number;
    particleType: string;
    particleCount: number;
}

export interface ClassBuff {
    damageMultiplier: number;
    defenseMultiplier: number;
    speedMultiplier: number;
    specialEffect?: string;
}

// Hava durumu efektleri
export const WEATHER_EFFECTS: { [key in WeatherType]: WeatherEffect } = {
    sunny: {
        type: 'sunny',
        name: 'Güneşli',
        icon: '☀️',
        description: 'Açık ve güneşli hava',
        duration: 45,
        classBuffs: {
            cleric: { damageMultiplier: 1.10, defenseMultiplier: 1.05, speedMultiplier: 1.0, specialEffect: 'Şifa gücü +%10' },
            monk: { damageMultiplier: 1.05, defenseMultiplier: 1.05, speedMultiplier: 1.05, specialEffect: 'Mana yenileme +%5' },
            warrior: { damageMultiplier: 1.05, defenseMultiplier: 1.0, speedMultiplier: 1.0 },
        },
        ambientColor: '#fffbe6',
        fogDensity: 0,
        particleType: 'none',
        particleCount: 0,
    },
    stormy: {
        type: 'stormy',
        name: 'Fırtınalı',
        icon: '⛈️',
        description: 'Şimşekler çakıyor, rüzgar uğulduyor',
        duration: 30,
        classBuffs: {
            gale_glaive: { damageMultiplier: 1.15, defenseMultiplier: 1.0, speedMultiplier: 1.15, specialEffect: 'Rüzgar hasarı +%15' },
            archer: { damageMultiplier: 1.10, defenseMultiplier: 1.0, speedMultiplier: 1.10, specialEffect: 'Menzil +%10' },
            archmage: { damageMultiplier: 1.10, defenseMultiplier: 1.0, speedMultiplier: 1.0, specialEffect: 'Şimşek büyüleri +%15' },
        },
        ambientColor: '#4a5568',
        fogDensity: 0.02,
        particleType: 'rain',
        particleCount: 500,
    },
    snowy: {
        type: 'snowy',
        name: 'Karlı',
        icon: '❄️',
        description: 'Kar yağıyor, her yer beyaz',
        duration: 40,
        classBuffs: {
            arctic_knight: { damageMultiplier: 1.15, defenseMultiplier: 1.10, speedMultiplier: 1.0, specialEffect: 'Dondurma şansı +%15' },
            archmage: { damageMultiplier: 1.10, defenseMultiplier: 1.0, speedMultiplier: 1.0, specialEffect: 'Buz büyüleri +%10' },
        },
        ambientColor: '#e0f2fe',
        fogDensity: 0.03,
        particleType: 'snow',
        particleCount: 300,
    },
    foggy: {
        type: 'foggy',
        name: 'Sisli',
        icon: '🌫️',
        description: 'Yoğun sis, görüş mesafesi düşük',
        duration: 25,
        classBuffs: {
            reaper: { damageMultiplier: 1.20, defenseMultiplier: 1.0, speedMultiplier: 1.10, specialEffect: 'Kritik hasar +%20, Gölge Hasarı +%25' },
            martial_artist: { damageMultiplier: 1.10, defenseMultiplier: 1.0, speedMultiplier: 1.15, specialEffect: 'Kaçınma +%10' },
        },
        ambientColor: '#94a3b8',
        fogDensity: 0.08,
        particleType: 'mist',
        particleCount: 100,
    },
    rainy: {
        type: 'rainy',
        name: 'Yağmurlu',
        icon: '🌧️',
        description: 'Hafif yağmur yağıyor',
        duration: 35,
        classBuffs: {
            bard: { damageMultiplier: 1.0, defenseMultiplier: 1.05, speedMultiplier: 1.0, specialEffect: 'Şarkı etki alanı +%20' },
        },
        ambientColor: '#64748b',
        fogDensity: 0.01,
        particleType: 'rain',
        particleCount: 200,
    },
};

// Hava durumu yöneticisi
export class WeatherManager {
    private currentWeather: WeatherType = 'sunny';
    private weatherStartTime: number = Date.now();
    private listeners: ((weather: WeatherEffect) => void)[] = [];

    constructor() {
        this.randomizeWeather();
        // Her 30-60 dakikada bir hava değişimi
        setInterval(() => this.randomizeWeather(), this.getNextChangeTime());
    }

    private getNextChangeTime(): number {
        return (30 + Math.random() * 30) * 60 * 1000; // 30-60 dakika
    }

    private randomizeWeather(): void {
        const weathers: WeatherType[] = ['sunny', 'stormy', 'snowy', 'foggy', 'rainy'];
        const weights = [35, 20, 15, 15, 15]; // Güneşli daha sık

        const totalWeight = weights.reduce((a, b) => a + b, 0);
        let random = Math.random() * totalWeight;

        for (let i = 0; i < weathers.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                this.currentWeather = weathers[i];
                break;
            }
        }

        this.weatherStartTime = Date.now();
        this.notifyListeners();
    }

    public getCurrentWeather(): WeatherEffect {
        return WEATHER_EFFECTS[this.currentWeather];
    }

    public getTimeRemaining(): number {
        const elapsed = Date.now() - this.weatherStartTime;
        const duration = WEATHER_EFFECTS[this.currentWeather].duration * 60 * 1000;
        return Math.max(0, duration - elapsed);
    }

    public getClassBuff(charClass: string): ClassBuff | null {
        const weather = WEATHER_EFFECTS[this.currentWeather];
        return weather.classBuffs[charClass] || null;
    }

    public getDamageMultiplier(charClass: string): number {
        const buff = this.getClassBuff(charClass);
        return buff?.damageMultiplier || 1.0;
    }

    public getDefenseMultiplier(charClass: string): number {
        const buff = this.getClassBuff(charClass);
        return buff?.defenseMultiplier || 1.0;
    }

    public getSpeedMultiplier(charClass: string): number {
        const buff = this.getClassBuff(charClass);
        return buff?.speedMultiplier || 1.0;
    }

    public subscribe(callback: (weather: WeatherEffect) => void): () => void {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }

    private notifyListeners(): void {
        const weather = this.getCurrentWeather();
        this.listeners.forEach(l => l(weather));
    }

    // Debug: Manuel hava değiştirme
    public setWeather(type: WeatherType): void {
        this.currentWeather = type;
        this.weatherStartTime = Date.now();
        this.notifyListeners();
    }
}

// Singleton instance
export const weatherManager = new WeatherManager();
