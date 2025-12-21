import React, { useState } from 'react';
import { PlayerState } from '../types';
import {
    Map, X, MapPin, Skull, Crown, Users, Zap, Lock,
    ChevronRight, Star, Shield, Flame, Snowflake, Wind
} from 'lucide-react';

interface ZoneInfo {
    id: number;
    name: string;
    level: string;
    description: string;
    type: 'safe' | 'pve' | 'pvp' | 'boss' | 'dungeon';
    position: { x: number; y: number }; // Percentage
    connections: number[];
    mobTypes: string[];
    bosses?: string[];
    features: string[];
    faction?: 'marsu' | 'terya' | 'venu' | 'neutral';
}

const WORLD_ZONES: ZoneInfo[] = [
    {
        id: 1,
        name: 'Başlangıç Köyü',
        level: '1-5',
        description: 'Yeni maceraperestlerin ilk durağı. Güvenli alan.',
        type: 'safe',
        position: { x: 50, y: 85 },
        connections: [2, 3],
        mobTypes: [],
        features: ['🏪 Mağaza', '🔨 Demirci', '💊 Şifacı'],
        faction: 'neutral',
    },
    {
        id: 2,
        name: 'Yeşil Orman',
        level: '1-10',
        description: 'Yeni başlayanlar için ideal av alanı.',
        type: 'pve',
        position: { x: 35, y: 70 },
        connections: [1, 4, 5],
        mobTypes: ['🐺 Kurt', '🐗 Domuz', '🦊 Tilki'],
        features: ['🌲 Odun Toplama', '🍄 Ot Toplama'],
    },
    {
        id: 3,
        name: 'Kum Çölü',
        level: '5-15',
        description: 'Sıcak ve tehlikeli çöl bölgesi.',
        type: 'pve',
        position: { x: 65, y: 70 },
        connections: [1, 5, 6],
        mobTypes: ['🦂 Akrep', '🐍 Yılan', '🏜️ Çöl Golemi'],
        features: ['💎 Kristal Madeni'],
    },
    {
        id: 4,
        name: 'Marsu Kalesi',
        level: '10-20',
        description: 'Marsu faksiyonunun ana üssü.',
        type: 'safe',
        position: { x: 20, y: 55 },
        connections: [2, 7],
        mobTypes: [],
        features: ['🏰 Kale', '⚔️ Arena', '🏪 Premium Mağaza'],
        faction: 'marsu',
    },
    {
        id: 5,
        name: 'Orta Düzlükler',
        level: '10-18',
        description: 'Üç faksiyonun sınırlarının kesiştiği alan. PvP aktif!',
        type: 'pvp',
        position: { x: 50, y: 55 },
        connections: [2, 3, 4, 6, 8],
        mobTypes: ['⚔️ Haydut', '🏴‍☠️ Korsan', '🗡️ Paralı Asker'],
        features: ['⚔️ PvP Aktif', '🏆 Onur Puanı x2'],
    },
    {
        id: 6,
        name: 'Terya Tapınağı',
        level: '10-20',
        description: 'Terya faksiyonunun kutsal merkezi.',
        type: 'safe',
        position: { x: 80, y: 55 },
        connections: [3, 5, 9],
        mobTypes: [],
        features: ['🏛️ Tapınak', '📚 Kütüphane', '✨ Buff Alanı'],
        faction: 'terya',
    },
    {
        id: 7,
        name: 'Yanardağ Vadisi',
        level: '15-22',
        description: 'Ateş elementli mobların yuvası.',
        type: 'pve',
        position: { x: 15, y: 35 },
        connections: [4, 10],
        mobTypes: ['🔥 Ateş Elementi', '🦎 Lav Kertenkelesi'],
        bosses: ['🐉 Ateş Ejderhası'],
        features: ['🌋 Boss Arena', '🔥 Ateş Direnci Gerekli'],
    },
    {
        id: 8,
        name: 'Venu Ormanları',
        level: '10-20',
        description: 'Venu faksiyonunun gizemli ormanı.',
        type: 'safe',
        position: { x: 50, y: 35 },
        connections: [5, 10, 11],
        mobTypes: [],
        features: ['🌳 Dünya Ağacı', '🧚 Peri Mağazası'],
        faction: 'venu',
    },
    {
        id: 9,
        name: 'Donmuş Göller',
        level: '18-25',
        description: 'Buz kaplı tehlikeli bölge.',
        type: 'pve',
        position: { x: 85, y: 35 },
        connections: [6, 11],
        mobTypes: ['❄️ Buz Golemi', '🐻‍❄️ Kutup Ayısı'],
        bosses: ['🧊 Buz Titanı'],
        features: ['❄️ Soğuk Hasarı', '💎 Nadir Kristaller'],
    },
    {
        id: 10,
        name: 'Gök Kulesi',
        level: '22-28',
        description: 'Göklere uzanan antik kule.',
        type: 'dungeon',
        position: { x: 30, y: 15 },
        connections: [7, 8, 12],
        mobTypes: ['⚡ Şimşek Elementi', '🦅 Dev Kartal'],
        bosses: ['⛈️ Fırtına Lordu'],
        features: ['🏰 5 Katlı Zindan', '⚡ Şimşek Direnci'],
    },
    {
        id: 11,
        name: 'Uçurum Mağarası',
        level: '25-30',
        description: 'Karanlık güçlerin yuvası.',
        type: 'boss',
        position: { x: 70, y: 15 },
        connections: [8, 9, 12],
        mobTypes: ['👻 Hayalet', '💀 İskelet', '🧟 Zombi'],
        bosses: ['👑 Karanlık Kral'],
        features: ['☠️ Ölüm Hasarı', '🌑 Karanlık Bölge'],
    },
    {
        id: 12,
        name: 'Antik Tapınak',
        level: '28-30',
        description: 'Oyunun en zor bölgesi. Kadim Koruyucu burada!',
        type: 'boss',
        position: { x: 50, y: 5 },
        connections: [10, 11],
        mobTypes: ['⚔️ Kadim Muhafız', '🛡️ Tapınak Bekçisi'],
        bosses: ['✨ Kadim Koruyucu'],
        features: ['🏆 En İyi Loot', '👑 Raid Boss'],
    },
];

interface WorldMapViewProps {
    playerState: PlayerState;
    currentZoneId: number;
    onClose: () => void;
    onNavigate: (zoneId: number) => void;
}

export const WorldMapView: React.FC<WorldMapViewProps> = ({
    playerState,
    currentZoneId,
    onClose,
    onNavigate,
}) => {
    const [selectedZone, setSelectedZone] = useState<ZoneInfo | null>(null);
    const [hoveredZone, setHoveredZone] = useState<number | null>(null);

    const getZoneColor = (zone: ZoneInfo): string => {
        if (zone.id === currentZoneId) return 'bg-green-500 border-green-300 shadow-green-500/50';

        switch (zone.type) {
            case 'safe': return 'bg-blue-600 border-blue-400 hover:bg-blue-500';
            case 'pve': return 'bg-emerald-600 border-emerald-400 hover:bg-emerald-500';
            case 'pvp': return 'bg-red-600 border-red-400 hover:bg-red-500';
            case 'boss': return 'bg-purple-600 border-purple-400 hover:bg-purple-500';
            case 'dungeon': return 'bg-orange-600 border-orange-400 hover:bg-orange-500';
            default: return 'bg-slate-600 border-slate-400';
        }
    };

    const getZoneIcon = (zone: ZoneInfo): React.ReactNode => {
        if (zone.id === currentZoneId) return <MapPin size={14} className="text-white" />;
        if (zone.faction) return <Shield size={12} />;
        if (zone.bosses) return <Skull size={12} />;
        if (zone.type === 'pvp') return <Zap size={12} />;
        return <Star size={12} />;
    };

    const canAccess = (zone: ZoneInfo): boolean => {
        const minLevel = parseInt(zone.level.split('-')[0]);
        return playerState.level >= minLevel - 3; // 3 level tolerance
    };

    const getFactionColor = (faction?: string): string => {
        switch (faction) {
            case 'marsu': return 'text-red-400';
            case 'terya': return 'text-blue-400';
            case 'venu': return 'text-green-400';
            default: return 'text-slate-400';
        }
    };

    return (
        <div className="fixed inset-0 z-[90] bg-black/90 flex items-center justify-center p-2 md:p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-900 to-teal-900 p-4 md:p-6 border-b border-emerald-700 flex justify-between items-center">
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Map size={24} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl md:text-2xl font-bold text-white">Dünya Haritası</h2>
                            <p className="text-emerald-200 text-xs md:text-sm">Kadim Savaşlar Dünyası</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
                        <X size={24} className="text-white" />
                    </button>
                </div>

                {/* Legend */}
                <div className="px-4 py-2 bg-slate-800/50 border-b border-slate-700 flex flex-wrap gap-3 text-xs">
                    <div className="flex items-center gap-1"><div className="w-3 h-3 bg-green-500 rounded-full" /> Sen</div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-600 rounded-full" /> Güvenli</div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 bg-emerald-600 rounded-full" /> PvE</div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-600 rounded-full" /> PvP</div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 bg-purple-600 rounded-full" /> Boss</div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 bg-orange-600 rounded-full" /> Zindan</div>
                </div>

                {/* Map Area */}
                <div className="flex-1 relative overflow-hidden" style={{ minHeight: '400px' }}>
                    {/* Background */}
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-800 to-slate-900">
                        {/* Grid lines */}
                        <div className="absolute inset-0 opacity-10">
                            {[...Array(10)].map((_, i) => (
                                <div key={`h-${i}`} className="absolute w-full h-px bg-slate-500" style={{ top: `${i * 10}%` }} />
                            ))}
                            {[...Array(10)].map((_, i) => (
                                <div key={`v-${i}`} className="absolute h-full w-px bg-slate-500" style={{ left: `${i * 10}%` }} />
                            ))}
                        </div>
                    </div>

                    {/* Connection Lines */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        {WORLD_ZONES.map(zone =>
                            zone.connections.map(connId => {
                                const target = WORLD_ZONES.find(z => z.id === connId);
                                if (!target || zone.id > connId) return null;
                                return (
                                    <line
                                        key={`${zone.id}-${connId}`}
                                        x1={`${zone.position.x}%`}
                                        y1={`${zone.position.y}%`}
                                        x2={`${target.position.x}%`}
                                        y2={`${target.position.y}%`}
                                        stroke={hoveredZone === zone.id || hoveredZone === connId ? '#fbbf24' : '#475569'}
                                        strokeWidth={hoveredZone === zone.id || hoveredZone === connId ? 3 : 2}
                                        strokeDasharray={canAccess(zone) && canAccess(target) ? '0' : '5,5'}
                                    />
                                );
                            })
                        )}
                    </svg>

                    {/* Zone Nodes */}
                    {WORLD_ZONES.map(zone => {
                        const accessible = canAccess(zone);
                        const isSelected = selectedZone?.id === zone.id;
                        const isHovered = hoveredZone === zone.id;
                        const isCurrent = zone.id === currentZoneId;

                        return (
                            <div
                                key={zone.id}
                                className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 ${isSelected || isHovered ? 'z-20 scale-125' : 'z-10'
                                    }`}
                                style={{ left: `${zone.position.x}%`, top: `${zone.position.y}%` }}
                                onClick={() => setSelectedZone(zone)}
                                onMouseEnter={() => setHoveredZone(zone.id)}
                                onMouseLeave={() => setHoveredZone(null)}
                            >
                                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full border-2 flex items-center justify-center shadow-lg transition-all ${getZoneColor(zone)
                                    } ${!accessible ? 'opacity-50' : ''} ${isCurrent ? 'animate-pulse shadow-lg' : ''}`}>
                                    {!accessible && <Lock size={12} className="text-white/50" />}
                                    {accessible && getZoneIcon(zone)}
                                </div>

                                {/* Zone Label */}
                                {(isHovered || isSelected || isCurrent) && (
                                    <div className="absolute left-1/2 -translate-x-1/2 -bottom-6 whitespace-nowrap bg-black/80 px-2 py-0.5 rounded text-[10px] text-white">
                                        {zone.name}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Zone Details Panel */}
                {selectedZone && (
                    <div className="p-4 bg-slate-800 border-t border-slate-700">
                        <div className="flex items-start gap-4">
                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${getZoneColor(selectedZone)}`}>
                                {selectedZone.bosses ? '👑' : selectedZone.type === 'safe' ? '🏠' : selectedZone.type === 'pvp' ? '⚔️' : '🗺️'}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-white text-lg">{selectedZone.name}</h3>
                                    <span className={`text-xs px-2 py-0.5 rounded ${selectedZone.type === 'safe' ? 'bg-blue-900/50 text-blue-300' :
                                            selectedZone.type === 'pvp' ? 'bg-red-900/50 text-red-300' :
                                                selectedZone.type === 'boss' ? 'bg-purple-900/50 text-purple-300' :
                                                    'bg-emerald-900/50 text-emerald-300'
                                        }`}>
                                        {selectedZone.type.toUpperCase()}
                                    </span>
                                    {selectedZone.faction && (
                                        <span className={`text-xs ${getFactionColor(selectedZone.faction)}`}>
                                            [{selectedZone.faction.toUpperCase()}]
                                        </span>
                                    )}
                                </div>
                                <p className="text-slate-400 text-sm">{selectedZone.description}</p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    <span className="text-xs bg-yellow-900/30 text-yellow-400 px-2 py-1 rounded">
                                        Lv. {selectedZone.level}
                                    </span>
                                    {selectedZone.mobTypes.map((mob, i) => (
                                        <span key={i} className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">{mob}</span>
                                    ))}
                                    {selectedZone.bosses?.map((boss, i) => (
                                        <span key={i} className="text-xs bg-purple-900/30 text-purple-300 px-2 py-1 rounded">{boss}</span>
                                    ))}
                                </div>
                                {selectedZone.features.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {selectedZone.features.map((feature, i) => (
                                            <span key={i} className="text-xs text-slate-500">{feature}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={() => { onNavigate(selectedZone.id); onClose(); }}
                                    disabled={!canAccess(selectedZone)}
                                    className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 ${canAccess(selectedZone)
                                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                            : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                        }`}
                                >
                                    {selectedZone.id === currentZoneId ? (
                                        <>Buradasın</>
                                    ) : canAccess(selectedZone) ? (
                                        <>Git <ChevronRight size={16} /></>
                                    ) : (
                                        <>Lv.{selectedZone.level.split('-')[0]} Gerekli</>
                                    )}
                                </button>
                                <button
                                    onClick={() => setSelectedZone(null)}
                                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm text-slate-300"
                                >
                                    Kapat
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WorldMapView;
