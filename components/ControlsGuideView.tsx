import React, { useState } from 'react';
import {
    Keyboard, Smartphone, X, Mouse, Hand, Zap, Move,
    Target, Backpack, MessageSquare, Map, Settings, ChevronRight
} from 'lucide-react';

interface ControlItem {
    action: string;
    pcKey?: string;
    mobileGesture?: string;
    icon: React.ReactNode;
    category: 'movement' | 'combat' | 'ui' | 'social' | 'other';
}

const CONTROLS: ControlItem[] = [
    // Movement
    { action: 'Hareket Et', pcKey: 'W A S D / Ok Tuşları', mobileGesture: 'Joystick', icon: <Move size={16} />, category: 'movement' },
    { action: 'Koş', pcKey: 'Shift + Hareket', mobileGesture: 'Joystick İleri İt', icon: <Zap size={16} />, category: 'movement' },
    { action: 'Kamerayı Döndür', pcKey: 'Sağ Tık + Sürükle', mobileGesture: 'İki Parmak Döndür', icon: <Mouse size={16} />, category: 'movement' },
    { action: 'Yakınlaştır/Uzaklaştır', pcKey: 'Mouse Tekerlek', mobileGesture: 'Pinch (Yaklaştır/Uzaklaştır)', icon: <Target size={16} />, category: 'movement' },

    // Combat
    { action: 'Normal Saldırı', pcKey: 'Sol Tık / Space', mobileGesture: 'Saldırı Butonu', icon: <Target size={16} />, category: 'combat' },
    { action: 'Yetenek 1', pcKey: '1', mobileGesture: 'Skill Butonu 1', icon: <Zap size={16} />, category: 'combat' },
    { action: 'Yetenek 2', pcKey: '2', mobileGesture: 'Skill Butonu 2', icon: <Zap size={16} />, category: 'combat' },
    { action: 'Yetenek 3', pcKey: '3', mobileGesture: 'Skill Butonu 3', icon: <Zap size={16} />, category: 'combat' },
    { action: 'Yetenek 4 (Ultimate)', pcKey: '4', mobileGesture: 'Skill Butonu 4', icon: <Zap size={16} />, category: 'combat' },
    { action: 'HP İksiri Kullan', pcKey: 'Q', mobileGesture: 'HP Butonu', icon: <Zap size={16} />, category: 'combat' },
    { action: 'MP İksiri Kullan', pcKey: 'E', mobileGesture: 'MP Butonu', icon: <Zap size={16} />, category: 'combat' },
    { action: 'Hedef Seç', pcKey: 'Tab / Sol Tık', mobileGesture: 'Düşmana Dokun', icon: <Target size={16} />, category: 'combat' },

    // UI
    { action: 'Envanter Aç', pcKey: 'I / B', mobileGesture: 'Çanta İkonu', icon: <Backpack size={16} />, category: 'ui' },
    { action: 'Karakter Bilgisi', pcKey: 'C', mobileGesture: 'Karakter İkonu', icon: <Settings size={16} />, category: 'ui' },
    { action: 'Harita Aç', pcKey: 'M', mobileGesture: 'Harita İkonu', icon: <Map size={16} />, category: 'ui' },
    { action: 'Ayarlar', pcKey: 'ESC', mobileGesture: 'Ayar İkonu', icon: <Settings size={16} />, category: 'ui' },
    { action: 'Menüyü Kapat', pcKey: 'ESC', mobileGesture: 'X Butonu / Geri', icon: <X size={16} />, category: 'ui' },

    // Social
    { action: 'Sohbet Aç', pcKey: 'Enter', mobileGesture: 'Chat İkonu', icon: <MessageSquare size={16} />, category: 'social' },
    { action: 'Hızlı Mesaj', pcKey: '/ + Mesaj', mobileGesture: 'Mesaj Yaz', icon: <MessageSquare size={16} />, category: 'social' },
    { action: 'Parti Menüsü', pcKey: 'P', mobileGesture: 'Parti İkonu', icon: <Settings size={16} />, category: 'social' },
    { action: 'Lonca Menüsü', pcKey: 'G', mobileGesture: 'Lonca İkonu', icon: <Settings size={16} />, category: 'social' },

    // Other
    { action: 'Screenshot Al', pcKey: 'F12', mobileGesture: 'Telefon SS', icon: <Settings size={16} />, category: 'other' },
    { action: 'FPS Göster', pcKey: 'F3', mobileGesture: '-', icon: <Settings size={16} />, category: 'other' },
];

interface ControlsGuideViewProps {
    onClose: () => void;
}

export const ControlsGuideView: React.FC<ControlsGuideViewProps> = ({ onClose }) => {
    const [mode, setMode] = useState<'pc' | 'mobile'>('pc');
    const [activeCategory, setActiveCategory] = useState<string>('movement');

    const categories = [
        { id: 'movement', label: 'Hareket', icon: <Move size={14} /> },
        { id: 'combat', label: 'Savaş', icon: <Target size={14} /> },
        { id: 'ui', label: 'Arayüz', icon: <Settings size={14} /> },
        { id: 'social', label: 'Sosyal', icon: <MessageSquare size={14} /> },
        { id: 'other', label: 'Diğer', icon: <ChevronRight size={14} /> },
    ];

    const filteredControls = CONTROLS.filter(c => c.category === activeCategory);

    return (
        <div className="fixed inset-0 z-[90] bg-black/80 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-900 to-purple-900 p-6 border-b border-indigo-700">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                {mode === 'pc' ? <Keyboard size={28} className="text-white" /> : <Smartphone size={28} className="text-white" />}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">Kontroller</h2>
                                <p className="text-indigo-200 text-sm">Oyun Kısayolları ve Kontroller</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
                            <X size={24} className="text-white" />
                        </button>
                    </div>

                    {/* Mode Toggle */}
                    <div className="mt-4 flex bg-black/30 rounded-lg p-1">
                        <button
                            onClick={() => setMode('pc')}
                            className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors ${mode === 'pc'
                                    ? 'bg-indigo-600 text-white'
                                    : 'text-indigo-300 hover:text-white'
                                }`}
                        >
                            <Keyboard size={16} /> PC / Klavye
                        </button>
                        <button
                            onClick={() => setMode('mobile')}
                            className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors ${mode === 'mobile'
                                    ? 'bg-indigo-600 text-white'
                                    : 'text-indigo-300 hover:text-white'
                                }`}
                        >
                            <Smartphone size={16} /> Mobil / Dokunmatik
                        </button>
                    </div>
                </div>

                {/* Category Tabs */}
                <div className="flex border-b border-slate-700 overflow-x-auto">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`flex-1 min-w-[80px] py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors whitespace-nowrap ${activeCategory === cat.id
                                    ? 'bg-slate-800 text-indigo-400 border-b-2 border-indigo-400'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                }`}
                        >
                            {cat.icon}
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Controls List */}
                <div className="p-4 overflow-y-auto max-h-[45vh]">
                    <div className="space-y-2">
                        {filteredControls.map((control, idx) => (
                            <div
                                key={idx}
                                className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-indigo-600 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-indigo-900/50 rounded-lg flex items-center justify-center text-indigo-400">
                                        {control.icon}
                                    </div>
                                    <span className="text-white font-medium">{control.action}</span>
                                </div>
                                <div className={`px-3 py-1.5 rounded-lg font-mono text-sm ${mode === 'pc'
                                        ? 'bg-slate-700 text-yellow-400'
                                        : 'bg-indigo-900/50 text-indigo-300'
                                    }`}>
                                    {mode === 'pc' ? control.pcKey : control.mobileGesture}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Mobile Gesture Guide */}
                {mode === 'mobile' && (
                    <div className="p-4 bg-slate-800/50 border-t border-slate-700">
                        <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                            <Hand size={16} className="text-indigo-400" />
                            Dokunmatik İpuçları
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                            <div className="bg-slate-900 p-3 rounded-lg text-center">
                                <div className="text-2xl mb-1">👆</div>
                                <div className="text-white font-bold">Tek Dokun</div>
                                <div className="text-slate-500">Seç / Etkileşim</div>
                            </div>
                            <div className="bg-slate-900 p-3 rounded-lg text-center">
                                <div className="text-2xl mb-1">👆👆</div>
                                <div className="text-white font-bold">Çift Dokun</div>
                                <div className="text-slate-500">Hızlı Saldırı</div>
                            </div>
                            <div className="bg-slate-900 p-3 rounded-lg text-center">
                                <div className="text-2xl mb-1">✌️</div>
                                <div className="text-white font-bold">İki Parmak</div>
                                <div className="text-slate-500">Kamera Döndür</div>
                            </div>
                            <div className="bg-slate-900 p-3 rounded-lg text-center">
                                <div className="text-2xl mb-1">🤏</div>
                                <div className="text-white font-bold">Pinch</div>
                                <div className="text-slate-500">Zoom In/Out</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="p-4 bg-slate-800/30 border-t border-slate-700 text-center text-xs text-slate-500">
                    Kontrolleri Ayarlar menüsünden özelleştirebilirsiniz
                </div>
            </div>
        </div>
    );
};

export default ControlsGuideView;
