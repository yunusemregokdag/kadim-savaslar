import React, { useState, useEffect } from 'react';
import { PlayerState } from '../types';
import {
    ChevronRight, ChevronLeft, X, Sword, Shield, Map, Package,
    Users, MessageSquare, Star, Zap, Target, Heart, Coins,
    ArrowRight, Check, Sparkles, HelpCircle
} from 'lucide-react';

interface TutorialStep {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    highlight?: string; // CSS selector or area to highlight
    action?: string; // What user should do
    reward?: { gold?: number, exp?: number, gems?: number };
}

const TUTORIAL_STEPS: TutorialStep[] = [
    {
        id: 'welcome',
        title: 'Kadim Savaşlar\'a Hoş Geldin!',
        description: 'Bu eğitim sana oyunun temellerini öğretecek. Her adımı tamamladığında ödüller kazanacaksın!',
        icon: <Sparkles className="text-yellow-400" size={32} />,
        reward: { gold: 100 }
    },
    {
        id: 'movement',
        title: 'Hareket Etme',
        description: 'Ekranın sol alt köşesindeki joystick ile karakterini hareket ettirebilirsin. Mobil cihazlarda parmağınla sürükle, bilgisayarda ise tıkla ve sürükle.',
        icon: <Target className="text-blue-400" size={32} />,
        highlight: '#joystick',
        action: 'Joystick ile hareket et',
        reward: { exp: 50 }
    },
    {
        id: 'camera',
        title: 'Kamera Kontrolü',
        description: 'Ekranı sağa sola kaydırarak kamerayı döndürebilirsin. "Göz" ikonuna basarak serbest bakış moduna geçebilirsin.',
        icon: <HelpCircle className="text-purple-400" size={32} />,
        action: 'Kamerayı döndür',
        reward: { gold: 50 }
    },
    {
        id: 'attack',
        title: 'Saldırı',
        description: 'Sağ alttaki kırmızı kılıç butonuna basarak saldırabilirsin. Düşmanlara yaklaşıp saldır!',
        icon: <Sword className="text-red-400" size={32} />,
        highlight: '#attack-button',
        action: 'Bir düşmana saldır',
        reward: { exp: 100 }
    },
    {
        id: 'skills',
        title: 'Yetenekler',
        description: 'Her sınıfın kendine özel yetenekleri var. Sağ taraftaki küçük butonlar ile yeteneklerini kullanabilirsin. Bazı yetenekler mana harcar.',
        icon: <Zap className="text-cyan-400" size={32} />,
        action: 'Bir yetenek kullan',
        reward: { exp: 100 }
    },
    {
        id: 'hp_mp',
        title: 'Can ve Mana',
        description: 'Kırmızı çubuk canını (HP), mavi çubuk manını (MP) gösterir. Can sıfıra düşerse ölürsün! İksirler ile can ve mana doldurabilirsin.',
        icon: <Heart className="text-red-500" size={32} />,
        reward: { gold: 100 }
    },
    {
        id: 'inventory',
        title: 'Envanter',
        description: 'Sol menüden "Envanter" sekmesine tıklayarak eşyalarını görebilirsin. Eşyaları giyebilir, kullanabilir veya satabilirsin.',
        icon: <Package className="text-amber-400" size={32} />,
        action: 'Envanteri aç',
        reward: { gold: 100 }
    },
    {
        id: 'quests',
        title: 'Görevler',
        description: 'Görevler sekmesinden aktif görevlerini takip edebilirsin. Görevleri tamamlayarak EXP, altın ve eşya kazanabilirsin.',
        icon: <Star className="text-yellow-400" size={32} />,
        action: 'Görevler sekmesini aç',
        reward: { exp: 150 }
    },
    {
        id: 'map',
        title: 'Harita ve Bölgeler',
        description: 'Harita sekmesinden dünyayı keşfedebilirsin. Her bölgenin farklı zorluk seviyesi ve düşmanları var. Portaller ile bölgeler arası geçiş yapabilirsin.',
        icon: <Map className="text-green-400" size={32} />,
        reward: { gold: 150 }
    },
    {
        id: 'party',
        title: 'Parti Sistemi',
        description: 'Diğer oyuncularla parti kurarak birlikte savaşabilirsin. Parti üyeleri EXP ve ganimetleri paylaşır.',
        icon: <Users className="text-blue-400" size={32} />,
        reward: { exp: 100 }
    },
    {
        id: 'guild',
        title: 'Klan Sistemi',
        description: 'Bir klana katılarak veya kendi klanını kurarak diğer oyuncularla birlik olabilirsin. Klanlar özel bonuslar ve etkinlikler sunar.',
        icon: <Shield className="text-purple-400" size={32} />,
        reward: { gold: 200 }
    },
    {
        id: 'chat',
        title: 'Sohbet',
        description: 'Sağ alt köşedeki sohbet butonu ile diğer oyuncularla konuşabilirsin. Global, parti ve klan kanalları mevcut.',
        icon: <MessageSquare className="text-green-400" size={32} />,
        reward: { gold: 50 }
    },
    {
        id: 'complete',
        title: 'Eğitim Tamamlandı!',
        description: 'Tebrikler! Artık Kadim Savaşlar dünyasını keşfetmeye hazırsın. İyi savaşlar, kahraman!',
        icon: <Sparkles className="text-yellow-400" size={32} />,
        reward: { gold: 500, gems: 50, exp: 500 }
    }
];

interface TutorialSystemProps {
    playerState: PlayerState;
    onComplete: () => void;
    onReward: (rewards: { gold?: number, exp?: number, gems?: number }) => void;
    isFirstTime?: boolean;
}

export const TutorialSystem: React.FC<TutorialSystemProps> = ({
    playerState,
    onComplete,
    onReward,
    isFirstTime = true
}) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [completedSteps, setCompletedSteps] = useState<string[]>([]);
    const [isMinimized, setIsMinimized] = useState(false);
    const [showTutorial, setShowTutorial] = useState(isFirstTime);

    const step = TUTORIAL_STEPS[currentStep];
    const progress = ((currentStep + 1) / TUTORIAL_STEPS.length) * 100;

    const handleNext = () => {
        // Give reward for current step
        if (step.reward) {
            onReward(step.reward);
        }

        setCompletedSteps(prev => [...prev, step.id]);

        if (currentStep < TUTORIAL_STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            // Tutorial complete
            localStorage.setItem('tutorialCompleted', 'true');
            onComplete();
            setShowTutorial(false);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleSkip = () => {
        if (confirm('Eğitimi atlamak istediğine emin misin? Ödülleri alamazsın.')) {
            localStorage.setItem('tutorialCompleted', 'true');
            onComplete();
            setShowTutorial(false);
        }
    };

    if (!showTutorial) {
        return (
            <button
                onClick={() => setShowTutorial(true)}
                className="fixed bottom-24 right-4 z-40 p-3 bg-yellow-600 hover:bg-yellow-500 rounded-full shadow-lg shadow-yellow-900/30 text-white transition-all hover:scale-110"
                title="Eğitimi Aç"
            >
                <HelpCircle size={24} />
            </button>
        );
    }

    if (isMinimized) {
        return (
            <button
                onClick={() => setIsMinimized(false)}
                className="fixed bottom-24 right-4 z-40 px-4 py-2 bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 rounded-lg shadow-lg text-white font-bold flex items-center gap-2 transition-all hover:scale-105"
            >
                <HelpCircle size={18} />
                <span>Eğitim ({currentStep + 1}/{TUTORIAL_STEPS.length})</span>
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] pointer-events-none">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 pointer-events-auto" onClick={() => setIsMinimized(true)} />

            {/* Tutorial Panel */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-lg pointer-events-auto">
                <div className="bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-600 rounded-2xl shadow-2xl overflow-hidden">
                    {/* Progress Bar */}
                    <div className="h-1 bg-slate-700">
                        <div
                            className="h-full bg-gradient-to-r from-yellow-500 to-amber-500 transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    {/* Header */}
                    <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border border-yellow-600/30 flex items-center justify-center">
                                {step.icon}
                            </div>
                            <div>
                                <div className="text-xs text-slate-400">Adım {currentStep + 1} / {TUTORIAL_STEPS.length}</div>
                                <h3 className="font-bold text-white text-lg">{step.title}</h3>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsMinimized(true)}
                                className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
                                title="Küçült"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <button
                                onClick={handleSkip}
                                className="p-2 hover:bg-red-900/30 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                                title="Atla"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <p className="text-slate-300 leading-relaxed mb-4">{step.description}</p>

                        {step.action && (
                            <div className="flex items-center gap-2 text-yellow-400 text-sm mb-4 bg-yellow-900/20 px-4 py-2 rounded-lg border border-yellow-700/30">
                                <ArrowRight size={16} />
                                <span>{step.action}</span>
                            </div>
                        )}

                        {/* Reward Preview */}
                        {step.reward && (
                            <div className="flex items-center gap-4 bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                                <span className="text-xs text-slate-400">Ödül:</span>
                                {step.reward.gold && (
                                    <div className="flex items-center gap-1 text-yellow-400">
                                        <Coins size={14} />
                                        <span className="font-bold">{step.reward.gold}</span>
                                    </div>
                                )}
                                {step.reward.exp && (
                                    <div className="flex items-center gap-1 text-green-400">
                                        <Star size={14} />
                                        <span className="font-bold">{step.reward.exp} EXP</span>
                                    </div>
                                )}
                                {step.reward.gems && (
                                    <div className="flex items-center gap-1 text-purple-400">
                                        <Sparkles size={14} />
                                        <span className="font-bold">{step.reward.gems}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-slate-700 flex items-center justify-between">
                        <button
                            onClick={handlePrevious}
                            disabled={currentStep === 0}
                            className="px-4 py-2 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                        >
                            <ChevronLeft size={18} />
                            Önceki
                        </button>

                        <button
                            onClick={handleNext}
                            className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-white font-bold rounded-lg flex items-center gap-2 shadow-lg shadow-amber-900/30 transition-all hover:scale-105"
                        >
                            {currentStep === TUTORIAL_STEPS.length - 1 ? (
                                <>
                                    <Check size={18} />
                                    Tamamla
                                </>
                            ) : (
                                <>
                                    Sonraki
                                    <ChevronRight size={18} />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper hook to check if tutorial should show
export const useTutorial = () => {
    const [shouldShow, setShouldShow] = useState(false);

    useEffect(() => {
        const completed = localStorage.getItem('tutorialCompleted');
        setShouldShow(!completed);
    }, []);

    const resetTutorial = () => {
        localStorage.removeItem('tutorialCompleted');
        setShouldShow(true);
    };

    return { shouldShow, resetTutorial };
};

export default TutorialSystem;
