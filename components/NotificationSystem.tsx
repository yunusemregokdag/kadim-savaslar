import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
    Check, X, AlertTriangle, Info, Gift, Star, Sword,
    Users, MessageSquare, Coins, Sparkles, Trophy, Heart,
    Shield, Zap, Package
} from 'lucide-react';

// Notification types
export type NotificationType =
    | 'success'
    | 'error'
    | 'warning'
    | 'info'
    | 'levelup'
    | 'reward'
    | 'achievement'
    | 'friend'
    | 'mail'
    | 'combat'
    | 'quest'
    | 'trade';

export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message?: string;
    duration?: number; // ms, default 4000
    icon?: React.ReactNode;
    action?: {
        label: string;
        onClick: () => void;
    };
}

interface NotificationContextType {
    notifications: Notification[];
    addNotification: (notification: Omit<Notification, 'id'>) => string;
    removeNotification: (id: string) => void;
    clearAll: () => void;
    // Convenience methods
    success: (title: string, message?: string) => void;
    error: (title: string, message?: string) => void;
    warning: (title: string, message?: string) => void;
    info: (title: string, message?: string) => void;
    levelUp: (level: number) => void;
    reward: (rewards: { gold?: number; exp?: number; gems?: number; item?: string }) => void;
    achievement: (name: string, description?: string) => void;
    friendRequest: (name: string) => void;
    newMail: (from: string) => void;
    questComplete: (questName: string) => void;
    combatResult: (type: 'kill' | 'death' | 'duel_win' | 'duel_lose', target?: string) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within NotificationProvider');
    }
    return context;
};

// Generate unique ID
const generateId = () => `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Get icon for notification type
const getTypeIcon = (type: NotificationType) => {
    switch (type) {
        case 'success': return <Check className="text-green-400" size={20} />;
        case 'error': return <X className="text-red-400" size={20} />;
        case 'warning': return <AlertTriangle className="text-yellow-400" size={20} />;
        case 'info': return <Info className="text-blue-400" size={20} />;
        case 'levelup': return <Star className="text-yellow-400" size={20} />;
        case 'reward': return <Gift className="text-purple-400" size={20} />;
        case 'achievement': return <Trophy className="text-amber-400" size={20} />;
        case 'friend': return <Users className="text-blue-400" size={20} />;
        case 'mail': return <MessageSquare className="text-amber-400" size={20} />;
        case 'combat': return <Sword className="text-red-400" size={20} />;
        case 'quest': return <Shield className="text-green-400" size={20} />;
        case 'trade': return <Package className="text-cyan-400" size={20} />;
        default: return <Info className="text-slate-400" size={20} />;
    }
};

// Get color classes for notification type
const getTypeColors = (type: NotificationType) => {
    switch (type) {
        case 'success': return 'border-green-500/50 bg-gradient-to-r from-green-900/80 to-emerald-900/80';
        case 'error': return 'border-red-500/50 bg-gradient-to-r from-red-900/80 to-rose-900/80';
        case 'warning': return 'border-yellow-500/50 bg-gradient-to-r from-yellow-900/80 to-amber-900/80';
        case 'info': return 'border-blue-500/50 bg-gradient-to-r from-blue-900/80 to-cyan-900/80';
        case 'levelup': return 'border-yellow-400/50 bg-gradient-to-r from-yellow-900/90 to-orange-900/90';
        case 'reward': return 'border-purple-500/50 bg-gradient-to-r from-purple-900/80 to-violet-900/80';
        case 'achievement': return 'border-amber-500/50 bg-gradient-to-r from-amber-900/80 to-yellow-900/80';
        case 'friend': return 'border-blue-400/50 bg-gradient-to-r from-blue-900/80 to-indigo-900/80';
        case 'mail': return 'border-amber-400/50 bg-gradient-to-r from-amber-900/80 to-orange-900/80';
        case 'combat': return 'border-red-400/50 bg-gradient-to-r from-red-900/80 to-rose-900/80';
        case 'quest': return 'border-green-400/50 bg-gradient-to-r from-green-900/80 to-teal-900/80';
        case 'trade': return 'border-cyan-400/50 bg-gradient-to-r from-cyan-900/80 to-blue-900/80';
        default: return 'border-slate-500/50 bg-gradient-to-r from-slate-800/80 to-slate-900/80';
    }
};

// Single notification toast component
const NotificationToast: React.FC<{
    notification: Notification;
    onRemove: () => void;
}> = ({ notification, onRemove }) => {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const duration = notification.duration ?? 4000;
        const exitTimeout = setTimeout(() => setIsExiting(true), duration - 300);
        const removeTimeout = setTimeout(onRemove, duration);

        return () => {
            clearTimeout(exitTimeout);
            clearTimeout(removeTimeout);
        };
    }, [notification.duration, onRemove]);

    const handleRemove = () => {
        setIsExiting(true);
        setTimeout(onRemove, 300);
    };

    return (
        <div
            className={`
                ${getTypeColors(notification.type)}
                border rounded-xl p-4 shadow-2xl backdrop-blur-sm
                transition-all duration-300 ease-out
                ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}
                animate-slide-in-right
            `}
        >
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                    {notification.icon || getTypeIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-white text-sm">{notification.title}</h4>
                    {notification.message && (
                        <p className="text-xs text-white/70 mt-1">{notification.message}</p>
                    )}
                    {notification.action && (
                        <button
                            onClick={notification.action.onClick}
                            className="mt-2 text-xs text-white/90 hover:text-white underline"
                        >
                            {notification.action.label}
                        </button>
                    )}
                </div>
                <button
                    onClick={handleRemove}
                    className="flex-shrink-0 p-1 hover:bg-white/10 rounded transition-colors"
                >
                    <X size={14} className="text-white/50" />
                </button>
            </div>
        </div>
    );
};

// Notification container component
export const NotificationContainer: React.FC = () => {
    const { notifications } = useNotifications();

    return (
        <div className="fixed top-24 right-4 z-[200] flex flex-col gap-2 w-80 pointer-events-auto">
            {notifications.slice(0, 5).map(notification => (
                <NotificationToast
                    key={notification.id}
                    notification={notification}
                    onRemove={() => { }}
                />
            ))}
        </div>
    );
};

// Provider component
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const addNotification = useCallback((notification: Omit<Notification, 'id'>): string => {
        const id = generateId();
        setNotifications(prev => [...prev, { ...notification, id }]);
        return id;
    }, []);

    const removeNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const clearAll = useCallback(() => {
        setNotifications([]);
    }, []);

    // Convenience methods
    const success = useCallback((title: string, message?: string) => {
        addNotification({ type: 'success', title, message });
    }, [addNotification]);

    const error = useCallback((title: string, message?: string) => {
        addNotification({ type: 'error', title, message, duration: 6000 });
    }, [addNotification]);

    const warning = useCallback((title: string, message?: string) => {
        addNotification({ type: 'warning', title, message });
    }, [addNotification]);

    const info = useCallback((title: string, message?: string) => {
        addNotification({ type: 'info', title, message });
    }, [addNotification]);

    const levelUp = useCallback((level: number) => {
        addNotification({
            type: 'levelup',
            title: `🎉 Level ${level}!`,
            message: 'Tebrikler! Yeni bir seviyeye ulaştın!',
            duration: 6000,
            icon: <Zap className="text-yellow-400 animate-pulse" size={24} />
        });
    }, [addNotification]);

    const reward = useCallback((rewards: { gold?: number; exp?: number; gems?: number; item?: string }) => {
        const parts: string[] = [];
        if (rewards.gold) parts.push(`${rewards.gold} Altın`);
        if (rewards.exp) parts.push(`${rewards.exp} EXP`);
        if (rewards.gems) parts.push(`${rewards.gems} Gem`);
        if (rewards.item) parts.push(rewards.item);

        addNotification({
            type: 'reward',
            title: 'Ödül Kazandın!',
            message: parts.join(' • '),
            icon: <Gift className="text-purple-400" size={20} />
        });
    }, [addNotification]);

    const achievement = useCallback((name: string, description?: string) => {
        addNotification({
            type: 'achievement',
            title: `🏆 Başarım: ${name}`,
            message: description,
            duration: 6000,
            icon: <Trophy className="text-amber-400 animate-bounce" size={20} />
        });
    }, [addNotification]);

    const friendRequest = useCallback((name: string) => {
        addNotification({
            type: 'friend',
            title: 'Arkadaşlık İsteği',
            message: `${name} sana arkadaşlık isteği gönderdi`,
            icon: <Users className="text-blue-400" size={20} />
        });
    }, [addNotification]);

    const newMail = useCallback((from: string) => {
        addNotification({
            type: 'mail',
            title: 'Yeni Mesaj',
            message: `${from} bir mesaj gönderdi`,
            icon: <MessageSquare className="text-amber-400" size={20} />
        });
    }, [addNotification]);

    const questComplete = useCallback((questName: string) => {
        addNotification({
            type: 'quest',
            title: 'Görev Tamamlandı!',
            message: questName,
            icon: <Check className="text-green-400" size={20} />
        });
    }, [addNotification]);

    const combatResult = useCallback((type: 'kill' | 'death' | 'duel_win' | 'duel_lose', target?: string) => {
        const configs = {
            kill: { title: 'Düşman Öldürüldü!', message: target, icon: <Sword className="text-red-400" size={20} /> },
            death: { title: 'Öldün!', message: 'Güvenli bölgede yeniden doğdun', icon: <Heart className="text-red-400" size={20} /> },
            duel_win: { title: 'Düello Kazandın!', message: `${target} yenildi`, icon: <Trophy className="text-yellow-400" size={20} /> },
            duel_lose: { title: 'Düello Kaybettin', message: `${target} kazandı`, icon: <X className="text-red-400" size={20} /> }
        };

        const config = configs[type];
        addNotification({
            type: 'combat',
            title: config.title,
            message: config.message,
            icon: config.icon
        });
    }, [addNotification]);

    // Auto-remove old notifications
    useEffect(() => {
        if (notifications.length > 10) {
            const toRemove = notifications.slice(0, notifications.length - 10);
            toRemove.forEach(n => removeNotification(n.id));
        }
    }, [notifications, removeNotification]);

    const value: NotificationContextType = {
        notifications,
        addNotification,
        removeNotification,
        clearAll,
        success,
        error,
        warning,
        info,
        levelUp,
        reward,
        achievement,
        friendRequest,
        newMail,
        questComplete,
        combatResult
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
            <NotificationContainerInternal />
        </NotificationContext.Provider>
    );
};

// Internal container that has access to context
const NotificationContainerInternal: React.FC = () => {
    const { notifications, removeNotification } = useNotifications();

    return (
        <div className="fixed top-24 right-4 z-[200] flex flex-col gap-2 w-80">
            <style>{`
                @keyframes slideInRight {
                    from {
                        opacity: 0;
                        transform: translateX(100%);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                .animate-slide-in-right {
                    animation: slideInRight 0.3s ease-out forwards;
                }
            `}</style>
            {notifications.slice(-5).map(notification => (
                <NotificationToast
                    key={notification.id}
                    notification={notification}
                    onRemove={() => removeNotification(notification.id)}
                />
            ))}
        </div>
    );
};

export default NotificationProvider;
