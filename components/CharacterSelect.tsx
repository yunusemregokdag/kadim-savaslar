import React, { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Html, useGLTF } from '@react-three/drei';
import { CLASSES, FACTIONS } from '../constants';
import { CharacterClass, Faction } from '../types';
import { VoxelSpartan, WEAPON_MAP } from './VoxelSpartan';

// --- PRELOAD MODELS ---
// Preloading weapons here ensures character models appear instantly during selection
Object.values(WEAPON_MAP).forEach(path => {
    useGLTF.preload(path);
});
import { CharacterDebugPanel, DEFAULT_OFFSETS, CharacterOffsets } from './CharacterDebugPanel';
import { Shield, Zap, Heart, Crosshair, ChevronRight, Hash, Trophy, Sword, Info, Globe, Users, ChevronLeft, Plus, Play, Trash2, Skull, Music, Snowflake, Wind, Target, Wand2, HandMetal } from 'lucide-react';
import { cleanText } from '../utils/TextUtils';
import { characterAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';


const TRANSLATIONS = {
    tr: {
        CHOOSE_SIDE: "KİMİN TARAFINDASIN?",
        SIDE_DESC: "Savaşın kaderini hangi bayrak altında belirleyeceksin?",
        START_ADVENTURE: "MACERAYA BAŞLA",
        CLASS_DETAILS: "Sınıf Detayları",
        DAMAGE: "HASAR POTANSİYELİ",
        SURVIVAL: "HAYATTA KALMA",
        DIFFICULTY: "KULLANIM ZORLUĞU",
        HERO_NAME: "Kahramanının Adı",
        ENTER_NAME: "İsim Girin...",
        MY_CHARACTERS: "KARAKTERLERİM",
        CREATE_NEW: "YENİ KARAKTER",
        ENTER_GAME: "OYUNA GİR",
        DELETE_CONFIRM: "Bu karakteri silmek istediğine emin misin?",
        LEVEL: "Seviye",
        ZONE: "Bölge"
    },
    en: {
        CHOOSE_SIDE: "CHOOSE YOUR FACTION",
        SIDE_DESC: "Under which banner will you determine the fate of the war?",
        START_ADVENTURE: "START ADVENTURE",
        CLASS_DETAILS: "Class Details",
        DAMAGE: "DAMAGE POTENTIAL",
        SURVIVAL: "SURVIVABILITY",
        DIFFICULTY: "DIFFICULTY",
        HERO_NAME: "Hero Name",
        ENTER_NAME: "Enter Name...",
        MY_CHARACTERS: "MY CHARACTERS",
        CREATE_NEW: "CREATE NEW",
        ENTER_GAME: "ENTER GAME",
        DELETE_CONFIRM: "Are you sure you want to delete this character?",
        LEVEL: "Level",
        ZONE: "Zone"
    }
};

interface CharacterSelectProps {
    onComplete: (nickname: string, charClass: CharacterClass, faction: Faction, characterId?: string) => void;
    isAdmin?: boolean;
}

interface Character {
    _id: string;
    name: string;
    class: CharacterClass;
    level: number;
    currentZone: number;
    faction?: Faction; // Backend might need to return this
}

const CharacterSelect: React.FC<CharacterSelectProps> = ({ onComplete, isAdmin = false }) => {
    const { user, logout } = useAuth();
    const [mode, setMode] = useState<'list' | 'create'>('list');
    const [step, setStep] = useState<'faction' | 'class'>('faction');
    const [selectedFaction, setSelectedFaction] = useState<Faction>('marsu');
    const [selectedClass, setSelectedClass] = useState<CharacterClass>('warrior');
    const [nickname, setNickname] = useState('');
    const [language, setLanguage] = useState<'tr' | 'en'>('tr');

    // Character List State
    const [characters, setCharacters] = useState<Character[]>([]);
    const [selectedCharId, setSelectedCharId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [characterToDelete, setCharacterToDelete] = useState<string | null>(null);
    const [showMobileClassList, setShowMobileClassList] = useState(false);

    // Mobile detection using JavaScript
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Initial check
        setIsMobile(window.innerWidth < 768);

        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Debug Mode for character positioning - Karakter pozisyonu ayarlamak için aç
    const [debugMode, setDebugMode] = useState(false); // Debug kapalı - ayarlar kaydedildi
    const [debugOffsets, setDebugOffsets] = useState<CharacterOffsets>(DEFAULT_OFFSETS);

    const t = TRANSLATIONS[language];

    // Load characters on mount (skip for admin mode)
    useEffect(() => {
        if (isAdmin) {
            // Admin mode - bypass API, go directly to create mode
            setLoading(false);
            setMode('create');
        } else {
            loadCharacters();
        }
    }, [isAdmin]);

    const loadCharacters = async () => {
        if (isAdmin) {
            setLoading(false);
            setMode('create');
            return;
        }

        setLoading(true);
        setError(''); // Clear any previous error
        try {
            const data = await characterAPI.list();
            setCharacters(data.characters);
            setError(''); // Ensure error is cleared on success
            if (data.characters.length === 0) {
                setMode('create');
            } else {
                setMode('list');
                setSelectedCharId(data.characters[0]._id);
            }
        } catch (err: any) {
            console.error('Failed to load characters:', err);
            setError('Karakterler yüklenemedi. Lütfen tekrar deneyin.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateWrapper = async () => {
        if (nickname.length < 3) return;

        // Admin mode - bypass API, directly enter game
        if (isAdmin) {
            onComplete(nickname, selectedClass, selectedFaction, 'admin_test_' + Date.now());
            return;
        }

        setLoading(true);
        try {
            const data = await characterAPI.create(nickname, selectedClass);
            // After creation, select this character and enter game
            onComplete(data.character.name, data.character.class, selectedFaction, data.character.id);
        } catch (err: any) {
            setError(err.message || 'Karakter oluşturulamadı');
            setLoading(false);
        }
    };



    const handlePlay = () => {
        const char = characters.find(c => c._id === selectedCharId);
        if (char) {
            onComplete(char.name, char.class, char.faction || 'marsu', char._id);
        } else {
            alert('Karakter bulunamadı veya seçilemedi.'); // Added alert
            console.error('Play failed: No character found for ID', selectedCharId);
        }
    };

    const handleFactionSelect = (faction: Faction) => {
        setSelectedFaction(faction);
        setStep('class');
    };

    // --- MODE: CHARACTER LIST ---

    const checkDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setCharacterToDelete(id);
        setShowDeleteConfirm(true);
    }

    const confirmDelete = async () => {
        if (!characterToDelete) return;

        try {
            const id = characterToDelete;
            setCharacters(prev => prev.filter(c => c._id !== id));
            if (selectedCharId === id) {
                setSelectedCharId(null);
            }

            await characterAPI.delete(id);
            console.log('Character deleted successfully');

            await loadCharacters();
        } catch (err: any) {
            console.error('Delete failed:', err);
            await loadCharacters();
            setError(`Karakter silinemedi: ${err.message}`);
        } finally {
            setShowDeleteConfirm(false);
            setCharacterToDelete(null);
        }
    }

    // ============================================
    // RENDER LOGIC - TEK BİR RETURN KULLANARAK
    // (React Hook #310 hatasını önlemek için)
    // ============================================

    // Loading durumu
    const loadingScreen = (
        <div className="fixed inset-0 bg-slate-900 flex items-center justify-center text-white">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-500"></div>
        </div>
    );

    // Hangi ekranı göstereceğimizi belirle
    if (loading && characters.length === 0 && mode === 'list') {
        return loadingScreen;
    }

    // Karakter listesi varsa - bu ayrı bir component olarak çıkarılmalı
    // Şimdilik aynı yapıyı koruyoruz
    if (mode === 'list' && characters.length > 0) {
        const selectedChar = characters.find(c => c._id === selectedCharId) || characters[0];
        const activeClassData = CLASSES[selectedChar.class] || CLASSES.warrior;

        return (
            <div className="fixed inset-0 w-full h-full bg-slate-950 overflow-hidden flex">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/80"></div>

                {/* Custom Delete Confirmation Modal */}
                {showDeleteConfirm && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-slate-900 border border-slate-700 p-8 rounded-2xl max-w-md w-full shadow-2xl transform scale-100 animate-in zoom-in-95 duration-200">
                            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                                <Trash2 className="text-red-500" />
                                Karakteri Sil
                            </h3>
                            <p className="text-slate-300 mb-8 leading-relaxed">
                                Bu karakteri silmek istediğinize emin misiniz? <br />
                                <span className="text-red-400 font-bold block mt-2">Bu işlem geri alınamaz!</span>
                            </p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="flex-1 py-3 px-4 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition-colors"
                                >
                                    Vazgeç
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 py-3 px-4 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 shadow-lg shadow-red-900/20 transition-colors"
                                >
                                    Evet, Sil
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* LEFT: Character List */}
                <div className="relative z-20 w-96 h-full bg-black/60 backdrop-blur-md border-r border-slate-800 p-6 flex flex-col">
                    <h2 className="text-3xl font-bold text-white mb-8 border-b border-slate-700 pb-4" style={{ fontFamily: 'Cinzel, serif' }}>
                        {t.MY_CHARACTERS}
                    </h2>

                    <div className="flex-1 overflow-y-auto space-y-4">
                        {characters.map(char => (
                            <div
                                key={char._id}
                                onClick={() => setSelectedCharId(char._id)}
                                className={`
                                    relative p-4 rounded-xl border transition-all cursor-pointer group
                                    ${selectedCharId === char._id
                                        ? 'bg-slate-800 border-yellow-500 shadow-lg shadow-yellow-900/20'
                                        : 'bg-slate-900/50 border-slate-700 hover:bg-slate-800'}
                                `}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className={`text-xl font-bold ${selectedCharId === char._id ? 'text-yellow-400' : 'text-slate-200'}`}>
                                            {char.name}
                                        </h3>
                                        <p className="text-sm text-slate-400">
                                            {t.LEVEL} {char.level} • {cleanText(CLASSES[char.class]?.name || char.class)}
                                        </p>
                                    </div>
                                    {/* Trash icon removed */}
                                </div>
                            </div>
                        ))}

                        {characters.length < 3 && (
                            <button
                                onClick={() => { setMode('create'); setStep('faction'); }}
                                className="w-full py-4 border-2 border-dashed border-slate-700 rounded-xl text-slate-500 hover:text-yellow-500 hover:border-yellow-500 hover:bg-slate-900/50 transition-all flex items-center justify-center gap-2"
                            >
                                <Plus size={20} />
                                <span className="font-bold">{t.CREATE_NEW}</span>
                            </button>
                        )}
                    </div>

                    <button
                        onClick={handlePlay}
                        className="w-full mt-6 py-4 bg-gradient-to-r from-yellow-600 to-amber-700 text-white rounded-xl font-bold text-xl uppercase tracking-wider hover:from-yellow-500 hover:to-amber-600 transition-all shadow-lg flex items-center justify-center gap-3"
                    >
                        <Play fill="currentColor" />
                        {t.ENTER_GAME}
                    </button>

                    {selectedCharId && (
                        <button
                            onClick={(e) => checkDelete(selectedCharId, e)}
                            className="w-full mt-3 py-3 border border-red-900/50 text-red-500 hover:bg-red-900/20 hover:border-red-500 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                        >
                            <Trash2 size={18} />
                            KARAKTERİ SİL
                        </button>
                    )}

                    <button
                        onClick={() => logout()}
                        className="w-full mt-3 py-3 text-slate-500 hover:text-white transition-colors text-sm"
                    >
                        Çıkış Yap
                    </button>
                </div>

                {/* CENTER: 3D Preview */}
                <div className="flex-1 relative">
                    <div className="absolute top-10 w-full text-center z-10 pointer-events-none">
                        <h1 className="text-6xl font-black text-white drop-shadow-2xl opacity-90" style={{ fontFamily: 'Cinzel, serif' }}>
                            {selectedChar.name}
                        </h1>
                        <p className="text-yellow-400 text-xl font-bold tracking-[0.5em] uppercase mt-2">
                            Lvl {selectedChar.level} {cleanText(activeClassData.name)}
                        </p>
                    </div>

                    {/* Debug Panel */}
                    {debugMode && (
                        <CharacterDebugPanel
                            offsets={debugOffsets}
                            onChange={setDebugOffsets}
                            onApply={() => { }}
                        />
                    )}

                    <Canvas shadows camera={{ position: [0, 2, 5], fov: 45 }} dpr={Math.min(window.devicePixelRatio, 1.5)} gl={{ antialias: false, powerPreference: 'high-performance', failIfMajorPerformanceCaveat: false }}>
                        <ambientLight intensity={0.5} />
                        <spotLight position={[5, 10, 5]} angle={0.5} penumbra={1} intensity={2} castShadow />
                        <pointLight position={[-5, 5, -5]} intensity={1} color="#6366f1" />

                        <Suspense fallback={null}>
                            <group position={[0, -1, 0]}>
                                <VoxelSpartan
                                    charClass={selectedChar.class}
                                    rotation={[0, Math.PI, 0]}
                                    isMoving={false}
                                    isAttacking={false}
                                    weaponItem={null}
                                    debugOffsets={debugMode ? debugOffsets : undefined}
                                />
                                <ContactShadows opacity={0.5} scale={10} blur={2} far={4} />
                            </group>
                        </Suspense>
                        <OrbitControls enablePan={false} enableZoom={false} minPolarAngle={Math.PI / 2.5} maxPolarAngle={Math.PI / 2} autoRotate autoRotateSpeed={0.5} />
                        <Environment preset="city" />
                    </Canvas>
                </div>
            </div>
        );
    }

    // --- MODE: CREATE NEW REUSED CODE ---
    // STEP 1: FACTION SELECTION
    if (mode === 'create' && step === 'faction') {
        return (
            <div className="fixed inset-0 w-full h-full bg-slate-950 flex flex-col items-center justify-center p-6 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1615799998603-7c6270a45196?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/10 to-slate-950/90"></div>

                {characters.length > 0 && (
                    <button
                        onClick={() => setMode('list')}
                        className="absolute top-8 left-8 z-50 text-white flex items-center gap-2 hover:text-yellow-400 transition-colors"
                    >
                        <ChevronLeft /> {t.MY_CHARACTERS}
                    </button>
                )}

                <div className="relative z-10 flex flex-col items-center max-w-6xl w-full pt-8 md:pt-0">
                    <h2 className="text-3xl sm:text-5xl md:text-7xl font-black text-white mb-4 md:mb-6 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] text-center px-4" style={{ fontFamily: 'Cinzel, serif' }}>
                        {t.CHOOSE_SIDE}
                    </h2>
                    <p className="text-slate-300 text-base md:text-xl mb-8 md:mb-12 font-medium tracking-wide text-center px-4">{t.SIDE_DESC}</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 mb-8 md:mb-12 w-full px-4">
                        {(Object.keys(FACTIONS) as Faction[]).map((key) => {
                            const fac = FACTIONS[key];
                            const isSelected = selectedFaction === key;
                            return (
                                <div
                                    key={key}
                                    onClick={() => handleFactionSelect(key)}
                                    className={`
                                        group relative p-6 md:p-8 rounded-2xl border-2 transition-all duration-300 cursor-pointer overflow-hidden
                                        flex flex-col items-center text-center hover:-translate-y-2
                                        ${isSelected
                                            ? `border-${fac.color} bg-${fac.color}/10 shadow-[0_0_30px_rgba(var(--color-${fac.color}),0.3)]`
                                            : 'border-slate-800 bg-slate-900/40 hover:border-slate-600'}
                                    `}
                                    style={{ borderColor: isSelected ? fac.color : undefined }}
                                >
                                    <div className={`w-16 h-16 md:w-24 md:h-24 rounded-full mb-4 md:mb-6 flex items-center justify-center transition-transform group-hover:scale-110`} style={{ backgroundColor: fac.color }}>
                                        <Users size={36} className="text-white md:hidden" />
                                        <Users size={48} className="text-white hidden md:block" />
                                    </div>

                                    <h3 className="text-xl md:text-3xl font-bold mb-2 md:mb-3 uppercase tracking-widest text-white" style={{ fontFamily: 'Cinzel, serif' }}>
                                        {cleanText(fac.name)}
                                    </h3>
                                    <p className="text-slate-400 text-xs md:text-sm leading-relaxed font-medium">
                                        {cleanText(fac.description)}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    // STEP 2: CLASS SELECTION
    // STEP 2: CLASS SELECTION (ICON LAYOUT REDESIGN)
    const activeClassData = CLASSES[selectedClass];

    // Helper to get class icon
    const getClassIcon = (cls: CharacterClass) => {
        switch (cls) {
            case 'warrior': return <Sword size={24} />;
            case 'arctic_knight': return <Snowflake size={24} />;
            case 'gale_glaive': return <Wind size={24} />;
            case 'archer': return <Target size={24} />;
            case 'archmage': return <Wand2 size={24} />;
            case 'bard': return <Music size={24} />;
            case 'cleric': return <Heart size={24} />;
            case 'reaper': return <Skull size={24} />;
            case 'martial_artist': return <HandMetal size={24} />;
            case 'monk': return <Zap size={24} />;
            default: return <Sword size={24} />;
        }
    };

    return (
        <div className="fixed inset-0 w-full h-full bg-slate-950 overflow-hidden flex flex-col">
            {/* Background - Dark Red/Black Gradient as in screenshot */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#2a0e0e] via-[#0f0505] to-[#000000] z-0"></div>

            {/* Back Button (Top Left) */}
            <button
                onClick={() => setStep('faction')}
                className="absolute top-6 left-6 z-50 p-3 rounded-full bg-black/40 text-white/50 hover:bg-black/60 hover:text-white transition-all border border-white/10"
            >
                <ChevronLeft size={24} />
            </button>

            {/* MAIN CONTENT CONTAINER */}
            <div className="relative z-10 w-full h-full flex">

                {/* LEFT SIDEBAR: Circular Class Icons */}
                <div className={`${isMobile ? 'w-16 pl-2 pt-4 justify-start overflow-y-auto no-scrollbar pb-20' : 'w-32 pl-10 justify-center'} h-full flex flex-col items-center gap-4 z-20`}>
                    {(Object.keys(CLASSES) as CharacterClass[]).map(cls => {
                        const isSelected = selectedClass === cls;
                        return (
                            <button
                                key={cls}
                                onClick={() => setSelectedClass(cls)}
                                className={`
                                    ${isMobile ? 'w-10 h-10 min-h-[2.5rem]' : 'w-14 h-14'}
                                    rounded-full flex items-center justify-center transition-all duration-300 relative group shrink-0
                                    ${isSelected
                                        ? 'bg-gradient-to-br from-yellow-500 to-amber-700 text-white scale-110 shadow-[0_0_20px_rgba(234,179,8,0.5)] ring-2 ring-yellow-400/50'
                                        : 'bg-slate-900/80 text-slate-500 hover:text-slate-200 hover:bg-slate-800 border border-slate-700'}
                                `}
                            >
                                {getClassIcon(cls)}

                                {/* Hover Tooltip */}
                                <div className="absolute left-20 bg-black/90 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-slate-700">
                                    {cleanText(language === 'en' ? (CLASSES[cls].name_en || CLASSES[cls].name) : CLASSES[cls].name)}
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* CENTER: Character & Header & Bottom Inputs */}
                <div className="flex-1 flex flex-col items-center relative">

                    {/* TOP HEADER: Class Name & Role */}
                    <div className="mt-8 text-center z-10">
                        <h1 className="text-4xl md:text-5xl font-black text-white mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" style={{ fontFamily: 'Cinzel, serif' }}>
                            {cleanText(language === 'en' ? (activeClassData.name_en || activeClassData.name) : activeClassData.name)}
                        </h1>
                        <div className="text-yellow-500 font-bold uppercase tracking-widest text-sm md:text-base drop-shadow-md">
                            {cleanText(language === 'en' ? (activeClassData.role_en || activeClassData.role) : activeClassData.role)}
                        </div>
                    </div>

                    {/* MIDDLE: 3D Character Canvas */}
                    <div className="flex-1 w-full relative -mt-10 md:-mt-0">
                        {/* Background Logo/Effect behind character */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                            <Sword size={400} className="text-white" />
                        </div>

                        {/* Debug Panel */}
                        {debugMode && (
                            <CharacterDebugPanel
                                offsets={debugOffsets}
                                onChange={setDebugOffsets}
                                onApply={() => { }}
                            />
                        )}

                        <Canvas shadows camera={{ position: [0, 1.5, 4.5], fov: 40 }} dpr={Math.min(window.devicePixelRatio, 1.5)} gl={{ antialias: false, powerPreference: 'high-performance' }}>
                            <ambientLight intensity={0.6} />
                            <spotLight position={[5, 10, 5]} angle={0.5} penumbra={1} intensity={2} castShadow />
                            <pointLight position={[-5, 5, -5]} intensity={1} color="#ef4444" /> {/* Reddish rim light */}

                            <Suspense fallback={null}>
                                <group position={[0, -1.2, 0]}>
                                    <VoxelSpartan
                                        charClass={selectedClass}
                                        rotation={[0, 0, 0]} // Face forward
                                        isMoving={false}
                                        isAttacking={false}
                                        weaponItem={null}
                                        debugOffsets={debugMode ? debugOffsets : undefined}
                                    />
                                    <ContactShadows opacity={0.6} scale={10} blur={2.5} far={4} color="#000000" />
                                </group>
                            </Suspense>
                            <OrbitControls
                                enablePan={false}
                                enableZoom={false}
                                minPolarAngle={Math.PI / 2.2}
                                maxPolarAngle={Math.PI / 1.9}
                                // Allow slight rotation but keep focused
                                minAzimuthAngle={-Math.PI / 4}
                                maxAzimuthAngle={Math.PI / 4}
                                autoRotate={false}
                            />
                            <Environment preset="city" />
                        </Canvas>
                    </div>

                    {/* BOTTOM: Input & Play Button */}
                    <div className="w-full max-w-md px-4 pb-12 z-20 flex flex-col gap-3">
                        <div className="relative">
                            <input
                                type="text"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                placeholder={t.ENTER_NAME}
                                className="w-full bg-slate-900/80 border border-slate-700 text-white text-center py-4 rounded-xl focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 transition-all font-bold placeholder:text-slate-600"
                                maxLength={12}
                            />
                        </div>

                        {error && (
                            <div className="text-red-400 text-xs text-center font-bold">
                                {error}
                            </div>
                        )}

                        <button
                            onClick={handleCreateWrapper}
                            disabled={nickname.length < 3 || loading}
                            className={`
                                w-full py-4 rounded-xl font-bold uppercase tracking-[0.2em] transition-all
                                ${nickname.length >= 3
                                    ? 'bg-slate-700 hover:bg-slate-600 text-white border border-slate-500 shadow-lg'
                                    : 'bg-slate-800/50 text-slate-600 border border-slate-800 cursor-not-allowed'}
                            `}
                        >
                            {loading ? '...' : t.START_ADVENTURE}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CharacterSelect;
