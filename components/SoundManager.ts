
// import { Howl } from 'howler'; // Removed unused import
// I must use native Audio for now to avoid dependency issues unless I can ask user to install.
// I'll stick to native Audio to be safe.

class SoundManager {
    private static instance: SoundManager;
    private sounds: Map<string, HTMLAudioElement> = new Map();
    private bgm: HTMLAudioElement | null = null;
    private volume: { sfx: number, bgm: number } = { sfx: 0.5, bgm: 0.3 };
    private initialized: boolean = false;

    // AUDIO ASSETS (Public Domain / Placeholder URLs)
    // Using short data URIs or reliable placeholders would be best.
    // For now, I'll use placeholders. In a real app, these would be local files.
    private assets = {
        // UI
        'click': 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
        'hover': 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
        'open': 'https://assets.mixkit.co/active_storage/sfx/2048/2048-preview.mp3',
        'close': 'https://assets.mixkit.co/active_storage/sfx/2049/2049-preview.mp3',
        'error': 'https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3',
        'success': 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',

        // COMBAT
        'attack_sword': 'https://assets.mixkit.co/active_storage/sfx/3005/3005-preview.mp3', // Swoosh
        'attack_magic': 'https://assets.mixkit.co/active_storage/sfx/3004/3004-preview.mp3', // Zap
        'hit': 'https://assets.mixkit.co/active_storage/sfx/1498/1498-preview.mp3',
        'level_up': 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3',
        'gather_wood': 'https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3', // Placeholder (Thud)
        'gather_rock': 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3', // Placeholder (Clink)
        'gather_magic': 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3', // Placeholder (Chime)

        // AMBIENT (Loops)
        // These might fail if CORS or connection is an issue, but worth a try (or use empty if fail)
        // 'bgm_town': 'https://pixabay.com/music/fantasy-dreamy-childrens-intro-1-9543/' // Example
    };

    private constructor() { }

    public static getInstance(): SoundManager {
        if (!SoundManager.instance) {
            SoundManager.instance = new SoundManager();
        }
        return SoundManager.instance;
    }

    public init() {
        if (this.initialized) return;
        // Preload critical SFX
        Object.entries(this.assets).forEach(([key, url]) => {
            const audio = new Audio(url);
            audio.volume = this.volume.sfx;
            this.sounds.set(key, audio);
        });

        // Listen for sound settings changes from SettingsView
        window.addEventListener('kadim-sound-change', ((event: CustomEvent) => {
            const { type, value } = event.detail;
            if (type === 'sfx' || type === 'bgm') {
                this.setVolume(type, value);
            }
        }) as EventListener);

        // Load saved volume settings
        try {
            const savedSettings = localStorage.getItem('gameSettings');
            if (savedSettings) {
                const settings = JSON.parse(savedSettings);
                if (settings.masterVolume !== undefined) {
                    const masterMultiplier = settings.masterVolume / 100;
                    this.volume.sfx = (settings.sfxVolume || 70) / 100 * masterMultiplier;
                    this.volume.bgm = (settings.musicVolume || 50) / 100 * masterMultiplier;
                }
            }
        } catch (e) {
            console.warn('Failed to load sound settings', e);
        }

        this.initialized = true;
        console.log('🔊 SoundManager Initialized with Volume:', this.volume);
    }

    public playSFX(key: string) {
        if (!this.initialized) this.init();
        const audio = this.sounds.get(key);
        if (audio) {
            // Clone to allow overlapping sounds
            const clone = audio.cloneNode() as HTMLAudioElement;
            clone.volume = this.volume.sfx;
            clone.play().catch(e => console.warn('Audio play failed', e));
        } else {
            // console.warn(`Sound not found: ${key}`);
        }
    }

    public playUrl(url: string, volumeScale: number = 1.0) {
        try {
            const audio = new Audio(url);
            audio.volume = Math.min(1, Math.max(0, this.volume.sfx * volumeScale));
            audio.play().catch(e => console.warn(`Failed to play sound: ${url}`, e));
        } catch (err) {
            console.warn(`Error creating audio for: ${url}`, err);
        }
    }

    public playBGM(key: string) {
        // Placeholder for BGM logic
    }

    public setVolume(type: 'sfx' | 'bgm', vol: number) {
        this.volume[type] = Math.max(0, Math.min(1, vol));
        if (type === 'sfx') {
            this.sounds.forEach(s => s.volume = this.volume.sfx);
        }
    }
}

export const soundManager = SoundManager.getInstance();
