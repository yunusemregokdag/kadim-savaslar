import React, { useState, useEffect } from 'react';
import { eventAPI } from '../utils/api';
import { Zap, Star, Coins, Package, Clock, ChevronRight, X, Sparkles } from 'lucide-react';

interface GameEventInfo {
    _id: string;
    name: string;
    description: string;
    eventType: string;
    startTime: string;
    endTime: string;
    bonusMultiplier: number;
}

interface EventBannerProps {
    zoneId?: number;
    level?: number;
    onEventClick?: (eventId: string) => void;
}

export const EventBanner: React.FC<EventBannerProps> = ({ zoneId, level, onEventClick }) => {
    const [events, setEvents] = useState<GameEventInfo[]>([]);
    const [bonuses, setBonuses] = useState<{ expBonus: number; goldBonus: number; dropBonus: number }>({
        expBonus: 1.0,
        goldBonus: 1.0,
        dropBonus: 1.0
    });
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        loadEvents();
        const interval = setInterval(loadEvents, 60000); // Refresh every minute
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (events.length > 1) {
            const interval = setInterval(() => {
                setCurrentIndex(prev => (prev + 1) % events.length);
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [events.length]);

    const loadEvents = async () => {
        try {
            const [activeData, bonusData] = await Promise.all([
                eventAPI.getActive(),
                eventAPI.getBonuses(zoneId, level)
            ]);
            setEvents(activeData.events || []);
            setBonuses({
                expBonus: bonusData.expBonus || 1.0,
                goldBonus: bonusData.goldBonus || 1.0,
                dropBonus: bonusData.dropBonus || 1.0
            });
        } catch (error) {
            console.error('Failed to load events:', error);
        }
    };

    const getEventIcon = (type: string) => {
        switch (type) {
            case 'exp_boost': return <Zap className="text-yellow-400" size={18} />;
            case 'gold_boost': return <Coins className="text-yellow-400" size={18} />;
            case 'drop_boost': return <Package className="text-green-400" size={18} />;
            case 'boss_spawn': return <Star className="text-red-400" size={18} />;
            default: return <Sparkles className="text-purple-400" size={18} />;
        }
    };

    const getEventColor = (type: string) => {
        switch (type) {
            case 'exp_boost': return 'from-yellow-900/80 to-orange-900/80 border-yellow-600/50';
            case 'gold_boost': return 'from-yellow-800/80 to-amber-900/80 border-yellow-500/50';
            case 'drop_boost': return 'from-green-900/80 to-emerald-900/80 border-green-600/50';
            case 'boss_spawn': return 'from-red-900/80 to-rose-900/80 border-red-600/50';
            default: return 'from-purple-900/80 to-indigo-900/80 border-purple-600/50';
        }
    };

    const formatTimeRemaining = (endTime: string) => {
        const end = new Date(endTime).getTime();
        const now = Date.now();
        const diff = end - now;

        if (diff <= 0) return 'Bitti';

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 24) {
            const days = Math.floor(hours / 24);
            return `${days} gün`;
        }

        return `${hours}sa ${minutes}dk`;
    };

    // No active events
    if (events.length === 0) {
        // Still show bonus indicators if there are any
        const hasBonus = bonuses.expBonus > 1 || bonuses.goldBonus > 1 || bonuses.dropBonus > 1;
        if (!hasBonus) return null;
    }

    if (isCollapsed) {
        return (
            <button
                onClick={() => setIsCollapsed(false)}
                className="fixed top-24 left-4 z-30 bg-gradient-to-r from-purple-900/90 to-indigo-900/90 border border-purple-500/50 rounded-lg px-3 py-2 flex items-center gap-2 hover:border-purple-400 transition-all shadow-lg backdrop-blur-sm"
            >
                <Sparkles size={16} className="text-purple-400 animate-pulse" />
                <span className="text-xs font-bold text-purple-200">{events.length} Etkinlik</span>
                <ChevronRight size={14} className="text-purple-400" />
            </button>
        );
    }

    const currentEvent = events[currentIndex];

    return (
        <div className="fixed top-24 left-4 z-30 w-72 pointer-events-auto">
            {/* Active Bonuses Bar */}
            {(bonuses.expBonus > 1 || bonuses.goldBonus > 1 || bonuses.dropBonus > 1) && (
                <div className="flex gap-2 mb-2">
                    {bonuses.expBonus > 1 && (
                        <div className="flex items-center gap-1 bg-yellow-900/80 border border-yellow-600/50 rounded-lg px-3 py-1.5 backdrop-blur-sm">
                            <Zap size={14} className="text-yellow-400" />
                            <span className="text-xs font-bold text-yellow-300">{bonuses.expBonus}x EXP</span>
                        </div>
                    )}
                    {bonuses.goldBonus > 1 && (
                        <div className="flex items-center gap-1 bg-amber-900/80 border border-amber-600/50 rounded-lg px-3 py-1.5 backdrop-blur-sm">
                            <Coins size={14} className="text-amber-400" />
                            <span className="text-xs font-bold text-amber-300">{bonuses.goldBonus}x</span>
                        </div>
                    )}
                    {bonuses.dropBonus > 1 && (
                        <div className="flex items-center gap-1 bg-green-900/80 border border-green-600/50 rounded-lg px-3 py-1.5 backdrop-blur-sm">
                            <Package size={14} className="text-green-400" />
                            <span className="text-xs font-bold text-green-300">{bonuses.dropBonus}x</span>
                        </div>
                    )}
                </div>
            )}

            {/* Event Card */}
            {currentEvent && (
                <div
                    className={`bg-gradient-to-r ${getEventColor(currentEvent.eventType)} border rounded-xl p-4 backdrop-blur-sm shadow-xl cursor-pointer hover:scale-[1.02] transition-transform`}
                    onClick={() => onEventClick?.(currentEvent._id)}
                >
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                            {getEventIcon(currentEvent.eventType)}
                            <h3 className="font-bold text-white text-sm">{currentEvent.name}</h3>
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); setIsCollapsed(true); }}
                            className="text-white/50 hover:text-white"
                        >
                            <X size={14} />
                        </button>
                    </div>

                    <p className="text-xs text-white/70 mb-3 line-clamp-2">{currentEvent.description}</p>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-white/60">
                            <Clock size={12} />
                            <span className="text-xs">{formatTimeRemaining(currentEvent.endTime)} kaldı</span>
                        </div>
                        {currentEvent.bonusMultiplier > 1 && (
                            <span className="text-xs font-bold text-yellow-300 bg-yellow-900/50 px-2 py-0.5 rounded">
                                {currentEvent.bonusMultiplier}x
                            </span>
                        )}
                    </div>

                    {/* Event Pagination Dots */}
                    {events.length > 1 && (
                        <div className="flex justify-center gap-1 mt-3">
                            {events.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
                                    className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? 'bg-white' : 'bg-white/30'}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default EventBanner;
