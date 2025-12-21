
import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { CLASSES, FACTIONS } from '../constants';
import { CharacterClass, Faction } from '../types';
// import { VoxelSpartan } from './VoxelSpartan';
import { Shield, Zap, Heart, Crosshair, ChevronRight, Hash, Trophy, Sword, Info, Globe } from 'lucide-react';

const TRANSLATIONS = {
    tr: {
        CHOOSE_SIDE: "TARAFINI SEÇ",
        SIDE_DESC: "Savaşın kaderini hangi bayrak altında belirleyeceksin?",
        START_ADVENTURE: "MACERAYA BAŞLA",
        CLASS_DETAILS: "Sınıf Detayları",
        DAMAGE: "HASAR POTANSİYELİ",
        SURVIVAL: "HAYATTA KALMA",
        DIFFICULTY: "KULLANIM ZORLUĞU",
        HERO_NAME: "Kahramanının Adı",
        ENTER_NAME: "İsim Girin..."
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
        ENTER_NAME: "Enter Name..."
    }
};

interface CharacterSelectProps {
    onComplete: (nickname: string, charClass: CharacterClass, faction: Faction) => void;
    isAdmin?: boolean;
}

// Helper Component for Sidebar 3D Head
const HeadAvatar: React.FC<{ charClass: CharacterClass, isSelected: boolean }> = ({ charClass, isSelected }) => {
    return (
        <Canvas camera={{ position: [0, 0.8, 1.5], fov: 40 }} gl={{ alpha: true }}>
            <ambientLight intensity={0.8} />
            <pointLight position={[2, 2, 2]} intensity={1} />
            <Suspense fallback={null}>
                <group position={[0, -1.0, 0]} rotation={[0, Math.PI, 0]}>
                    {/* <VoxelSpartan
            charClass={charClass}
            isMoving={false}
            // Minimal props just to render visual
            // Mock items depending on class for visual flair
            weaponItem={null}
            armorItem={{ id: 'avatar_armor', type: 'armor', visuals: { primaryColor: isSelected ? '#fbbf24' : '#64748b' } } as any}
            helmetItem={{ id: 'avatar_helm', type: 'helmet', visuals: { primaryColor: isSelected ? '#fbbf24' : '#64748b' } } as any}
          /> */}
                </group>
            </Suspense>
        </Canvas>
    );
};


const CharacterSelect: React.FC<CharacterSelectProps> = ({ onComplete }) => {
    const [step, setStep] = useState<'faction' | 'class'>('faction');
    const [selectedFaction, setSelectedFaction] = useState<Faction | null>(null);
    const [selectedClass, setSelectedClass] = useState<CharacterClass>('warrior');
    const [nickname, setNickname] = useState('');
    const [rotation, setRotation] = useState(0);
    const [language, setLanguage] = useState<'tr' | 'en'>('tr'); // Default Language

    const t = TRANSLATIONS[language]; // Current translation helper

    const handleConfirm = () => {
        if (selectedFaction && selectedClass && nickname.length >= 3) {
            // Pass extra flag if admin model selected? 
            // Currently passing just standard args. 
            // If showAdminModel is true, we might want to inform the system or just assume isAdmin prop in App handles it.
            // The user said "Select Admin Character". 
            // Ideally we should probably select a specific class 'admin' but the system relies on enum.
            // We'll rely on global isAdmin state for game logic, this is just for preview.
            onComplete(nickname, selectedClass, selectedFaction);
        }
    };

    const getIcon = (type: CharacterClass) => {
        // Fallback if 3D fails or for loading state, though we use HeadAvatar now
        switch (type) {
            case 'warrior': return <Shield size={24} />;
            case 'arctic_knight': return <Shield size={24} />;
            case 'gale_glaive': return <Zap size={24} />;
            case 'archer': return <Crosshair size={24} />;
            case 'archmage': return <Zap size={24} />;
            case 'bard': return <Heart size={24} />;
            case 'cleric': return <Heart size={24} />;
            case 'martial_artist': return <Sword size={24} />;
            case 'monk': return <Shield size={24} />;
            case 'reaper': return <Sword size={24} />;
            default: return <Info size={24} />;
        }
    };

    // --- STEP 1: FACTION SELECTION ---
    if (step === 'faction') {
        return (
            <div className="fixed inset-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?q=80&w=2574&auto=format&fit=crop')] bg-cover bg-center flex items-center justify-center z-50 overflow-hidden">
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

                <div className="relative z-10 max-w-6xl w-full px-6 flex flex-col items-center">
                    <div className="absolute top-6 right-6 z-50">
                        <button
                            onClick={() => setLanguage(prev => prev === 'tr' ? 'en' : 'tr')}
                            className="flex items-center gap-2 bg-black/40 hover:bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 transition-all text-white font-bold"
                        >
                            <Globe size={18} />
                            <span>{language.toUpperCase()}</span>
                        </button>
                    </div>

                    <h2 className="text-4xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-amber-600 mb-6 drop-shadow-sm" style={{ fontFamily: 'Cinzel, serif' }}>
                        {t.CHOOSE_SIDE}
                    </h2>
                    <p className="text-slate-300 text-xl mb-12 font-medium tracking-wide">{t.SIDE_DESC}</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 w-full max-w-5xl">
                        {(Object.keys(FACTIONS) as Faction[]).map((key) => {
                            const fac = FACTIONS[key];
                            const isSelected = selectedFaction === key;
                            return (
                                <div
                                    key={key}
                                    onClick={() => setSelectedFaction(key)}
                                    className={`
                    cursor-pointer relative overflow-hidden rounded-3xl border-2 transition-all duration-500
                    flex flex-col items-center justify-center p-10 h-96 group
                    ${isSelected ? 'border-amber-400 scale-105 shadow-[0_0_60px_rgba(251,191,36,0.2)] bg-black/80' : 'border-white/10 bg-black/40 hover:bg-black/60 hover:border-white/30'}
                  `}
                                >
                                    <div className="absolute inset-0 opacity-20 transition-transform duration-700 group-hover:scale-110" style={{ backgroundColor: fac.color }} />

                                    <div
                                        className={`w-28 h-28 rounded-full flex items-center justify-center mb-8 transition-all duration-500 ${isSelected ? 'scale-110 rotate-6 shadow-lg' : 'grayscale group-hover:grayscale-0'}`}
                                        style={{ backgroundColor: isSelected ? fac.color : 'rgba(255,255,255,0.05)', color: isSelected ? 'white' : fac.color }}
                                    >
                                        <Trophy size={48} strokeWidth={1.5} />
                                    </div>

                                    <h3 className="text-4xl font-bold mb-3 uppercase tracking-widest text-white" style={{ fontFamily: 'Cinzel, serif' }}>{fac.name}</h3>
                                    <p className="text-slate-400 text-center text-sm leading-relaxed max-w-[85%] font-medium">{fac.description}</p>
                                </div>
                            );
                        })}
                    </div>

                    <button
                        onClick={() => { if (selectedFaction) setStep('class'); }}
                        disabled={!selectedFaction}
                        className={`
              px-16 py-5 rounded-full font-bold text-xl tracking-[0.2em] transition-all duration-300
              flex items-center gap-4 uppercase
              ${selectedFaction
                                ? 'bg-gradient-to-r from-yellow-600 to-amber-700 text-white hover:scale-105 shadow-2xl shadow-amber-900/50 ring-2 ring-yellow-400/50'
                                : 'bg-slate-800/50 text-slate-600 cursor-not-allowed ring-1 ring-slate-700'}
            `}
                    >
                        {t.START_ADVENTURE}
                        <ChevronRight size={24} />
                    </button>
                </div>
            </div>
        );
    }

    // --- STEP 2: CLASS SELECTION ---
    const activeClassData = CLASSES[selectedClass];

    return (
        <div className="fixed inset-0 w-full h-full bg-slate-950 overflow-hidden flex">
            {/* BACKGROUND SCENE - Dynamic per Class */}
            <div className="absolute inset-0 z-0 select-none pointer-events-none transition-all duration-700">
                <img
                    key={selectedClass}
                    src={
                        selectedClass === 'warrior' || selectedClass === 'arctic_knight' ? "https://images.unsplash.com/photo-1599589311822-6b95c378e9b6?q=80&w=2670&auto=format&fit=crop" : // Castle
                            selectedClass === 'archmage' ? "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2694&auto=format&fit=crop" : // Magical
                                selectedClass === 'monk' || selectedClass === 'cleric' || selectedClass === 'bard' ? "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?q=80&w=2574&auto=format&fit=crop" : // Forest
                                    selectedClass === 'archer' || selectedClass === 'gale_glaive' ? "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2670&auto=format&fit=crop" : // Mountain
                                        "https://images.unsplash.com/photo-1507646227500-4d389b0012be?q=80&w=2680&auto=format&fit=crop" // Assassin/Reaper/Martial Artist/Generic
                    }
                    alt="Background"
                    className="w-full h-full object-cover brightness-[0.35]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-slate-950/60" />
            </div>

            {/* --- LANGUAGE TOGGLE (Absolute Top Left) --- */}
            <div className="absolute top-6 left-6 z-50">
                <button
                    onClick={() => setLanguage(prev => prev === 'tr' ? 'en' : 'tr')}
                    className="flex items-center gap-2 bg-black/40 hover:bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 transition-all text-white font-bold"
                >
                    <Globe size={18} />
                    <span>{language.toUpperCase()}</span>
                </button>
            </div>

            {/* --- LEFT SIDEBAR (Class List - WITH 3D AVATARS) --- */}
            <div className="relative z-20 w-28 md:w-36 h-full flex flex-col pt-8 gap-6 pl-6 overflow-y-auto no-scrollbar items-start">
                {(Object.keys(CLASSES) as CharacterClass[]).map(cls => {
                    const clsData = CLASSES[cls];
                    const isSelected = selectedClass === cls;
                    const displayName = language === 'en' ? (clsData.name_en || clsData.name) : clsData.name;

                    return (
                        <button
                            key={cls}
                            onClick={() => { setSelectedClass(cls); }}
                            className={`
                        w-20 h-20 md:w-24 md:h-24 flex flex-col items-center justify-center rounded-2xl transition-all duration-300
                        border-2 backdrop-blur-md relative group overflow-hidden
                        ${isSelected
                                    ? 'bg-gradient-to-br from-yellow-500/20 to-amber-700/20 border-yellow-400 scale-110 shadow-[0_0_20px_rgba(234,179,8,0.3)] translate-x-3 z-20'
                                    : 'bg-black/40 border-white/10 hover:bg-white/5 hover:border-white/30 z-10 grayscale hover:grayscale-0'}
                    `}
                        >
                            <div className={`transition-all duration-300 ${isSelected ? 'scale-125' : 'opacity-70 group-hover:opacity-100 group-hover:scale-110'}`}>
                                {React.cloneElement(getIcon(cls) as React.ReactElement, {
                                    size: isSelected ? 40 : 32,
                                    color: isSelected ? '#fbbf24' : 'currentColor',
                                    strokeWidth: isSelected ? 2.5 : 1.5
                                })}
                            </div>

                            {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-400 shadow-[0_0_10px_orange]" />}

                            <span className={`absolute bottom-1 w-full text-center text-[8px] md:text-[9px] font-black uppercase tracking-wider z-10 leading-tight px-1 ${isSelected ? 'text-yellow-400 shadow-black drop-shadow-md' : 'text-slate-400'}`}>
                                {displayName}
                            </span>
                        </button>
                    )
                })}
            </div>

            {/* --- CENTER (3D CHARACTER) --- */}
            <div className="flex-1 relative z-10 h-full cursor-grab active:cursor-grabbing flex flex-col items-center justify-center">

                {/* Class Name Floating Label */}
                <div className="absolute top-8 left-1/2 transform -translate-x-1/2 text-center pointer-events-none w-full px-4 z-50">
                    <div className="inline-block relative">
                        <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-300 uppercase tracking-widest drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]" style={{ fontFamily: 'Cinzel, serif' }}>
                            {language === 'en' ? (activeClassData.name_en || activeClassData.name) : activeClassData.name}
                        </h1>
                        <div className="flex items-center justify-center gap-2 mt-2">
                            <div className="h-px w-12 bg-yellow-500/50" />
                            <div className="text-sm md:text-lg text-yellow-500 font-bold tracking-[0.3em] uppercase text-shadow-sm">
                                {language === 'en' ? (activeClassData.role_en || activeClassData.role) : activeClassData.role}
                            </div>
                            <div className="h-px w-12 bg-yellow-500/50" />
                        </div>
                    </div>
                </div>

                {/* 3D CANVAS */}
                <Canvas shadows camera={{ position: [0, 1.2, 5], fov: 38 }} gl={{ alpha: true, preserveDrawingBuffer: true }} className="w-full h-full">
                    <ambientLight intensity={0.5} />
                    <spotLight position={[5, 10, 5]} angle={0.4} penumbra={1} intensity={1.5} castShadow shadow-mapSize={[2048, 2048]} />
                    <pointLight position={[-3, 2, 4]} intensity={0.5} color="#fbbf24" />
                    <pointLight position={[3, 2, -4]} intensity={0.5} color="#3b82f6" />

                    <Suspense fallback={null}>
                        <group position={[0, 0, 0]}>
                            {/* <VoxelSpartan
                charClass={selectedClass}
                isMoving={false}
                isAttacking={false}
                position={[0, 0, 0]}
                rotation={[0, rotation + Math.PI, 0]}
                weaponItem={{ id: 'showcase_w', type: 'weapon' } as any}
                armorItem={{ id: 'showcase_a', type: 'armor', visuals: { primaryColor: selectedClass === 'reaper' ? '#000' : selectedClass === 'archmage' ? '#4c1d95' : '#94a3b8' } } as any}
                helmetItem={{ id: 'showcase_h', type: 'helmet', visuals: { primaryColor: selectedClass === 'reaper' ? '#000' : selectedClass === 'archmage' ? '#4c1d95' : '#94a3b8' } } as any}
              /> */}

                            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
                                <circleGeometry args={[1.4, 64]} />
                                <meshStandardMaterial color="#000000" transparent opacity={0.6} roughness={1} />
                            </mesh>

                            <ContactShadows opacity={0.5} scale={10} blur={2} far={4} color="black" />
                        </group>
                        <Environment preset="city" />
                        <OrbitControls
                            enableZoom={false}
                            enablePan={false}
                            minPolarAngle={Math.PI / 2.4}
                            maxPolarAngle={Math.PI / 2}
                            autoRotate={false}
                            target={[0, 0.5, 0]}
                        />
                    </Suspense>
                </Canvas>
            </div>

            {/* --- RIGHT SIDEBAR (Stats & Info) --- */}
            <div className="relative z-20 w-80 md:w-[400px] h-full bg-gradient-to-l from-black/90 via-black/80 to-transparent p-8 flex flex-col justify-center border-l border-white/5">

                <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-3xl p-8 mb-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />

                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-1 h-6 bg-yellow-500 rounded-full" />
                        <h3 className="text-yellow-500 font-bold uppercase tracking-widest text-xs">{t.CLASS_DETAILS}</h3>
                    </div>

                    <h2 className="text-3xl font-black text-white mb-4 uppercase italic tracking-wide">
                        {language === 'en' ? (activeClassData.role_en || activeClassData.role) : activeClassData.role}
                    </h2>
                    <p className="text-slate-300 text-sm leading-7 mb-8 font-medium">
                        {language === 'en' ? (activeClassData.description_en || activeClassData.description) : activeClassData.description}
                    </p>

                    <div className="space-y-6">
                        {/* Mock Stats */}
                        <div>
                            <div className="flex justify-between text-xs font-black text-slate-400 mb-2 tracking-wider">
                                <span>{t.DAMAGE}</span>
                                <span className="text-yellow-400 drop-shadow-md">{'★'.repeat(selectedClass === 'reaper' || selectedClass === 'archmage' ? 5 : 3)}</span>
                            </div>
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                                <div className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400" style={{ width: selectedClass === 'reaper' ? '90%' : selectedClass === 'archmage' ? '85%' : '60%' }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs font-black text-slate-400 mb-2 tracking-wider">
                                <span>{t.SURVIVAL}</span>
                                <span className="text-blue-400 drop-shadow-md">{'★'.repeat(selectedClass === 'warrior' ? 5 : 2)}</span>
                            </div>
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                                <div className="h-full bg-gradient-to-r from-blue-700 to-blue-400" style={{ width: selectedClass === 'warrior' ? '90%' : '40%' }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs font-black text-slate-400 mb-2 tracking-wider">
                                <span>{t.DIFFICULTY}</span>
                                <span className="text-red-400 drop-shadow-md">{'★'.repeat(selectedClass === 'cleric' ? 4 : 2)}</span>
                            </div>
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                                <div className="h-full bg-gradient-to-r from-red-700 to-red-500" style={{ width: selectedClass === 'cleric' ? '70%' : '30%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* User Name Input Block */}
                <div className="bg-black/60 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                    <label className="text-xs text-slate-400 font-bold uppercase mb-3 block tracking-wider">{t.HERO_NAME}</label>
                    <div className="flex items-center gap-3 bg-slate-900 border border-slate-700 rounded-xl p-3 focus-within:border-yellow-500 focus-within:ring-1 focus-within:ring-yellow-500/50 transition-all shadow-inner">
                        <Hash size={18} className="text-slate-500 ml-1" />
                        <input
                            type="text"
                            value={nickname}
                            onChange={(e: any) => setNickname(e.target.value)}
                            placeholder={t.ENTER_NAME}
                            className="bg-transparent w-full text-white text-base p-1 outline-none font-bold placeholder:text-slate-600 uppercase"
                            maxLength={12}
                        />
                    </div>
                </div>

                <button
                    onClick={handleConfirm}
                    disabled={nickname.length < 3}
                    className={`
                mt-8 w-full py-5 rounded-xl font-black text-xl uppercase tracking-[0.2em] transition-all
                flex items-center justify-center gap-3 shadow-lg
                ${nickname.length >= 3
                            ? 'bg-gradient-to-r from-yellow-600 to-amber-600 text-white hover:scale-105 hover:shadow-amber-600/40 shadow-amber-900/20'
                            : 'bg-slate-800 text-slate-600 cursor-not-allowed'}
             `}
                >
                    {t.START_ADVENTURE}
                    <ChevronRight size={24} strokeWidth={3} />
                </button>

            </div>
        </div>
    );
};

export default CharacterSelect;
