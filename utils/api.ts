// API Service for Backend Communication

const API_BASE_URL = '/api';

// Token management
let authToken: string | null = localStorage.getItem('authToken');

export const setAuthToken = (token: string | null) => {
    authToken = token;
    if (token) {
        localStorage.setItem('authToken', token);
    } else {
        localStorage.removeItem('authToken');
    }
};

export const getAuthToken = () => authToken;

// Generic fetch wrapper
const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {}),
    };

    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        // Check for 429 specifically immediately
        if (response.status === 429) {
            throw new Error('Çok fazla istek gönderildi. Lütfen biraz bekleyin.');
        }

        let data;
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        } else {
            // Check if we can read text
            const text = await response.text();
            try {
                // Try parsing anyway just in case header is wrong, but unlikely
                data = JSON.parse(text);
            } catch {
                // Not JSON, throw error with the text content (masked if too long)
                throw new Error(`Server Error (${response.status}): ${text.substring(0, 100)}`);
            }
        }

        if (!response.ok) {
            throw new Error(data.error || data.message || `API Error: ${response.status}`);
        }

        return data;
    } catch (error: any) {
        console.error('API Call Failed:', endpoint, error);
        throw error;
    }
};

// =====================
// AUTH API
// =====================
export const authAPI = {
    register: async (username: string, email: string, password: string) => {
        const data = await apiFetch('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, email, password }),
        });
        setAuthToken(data.token);
        return data;
    },

    login: async (email: string, password: string) => {
        const data = await apiFetch('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        setAuthToken(data.token);
        return data;
    },

    logout: () => {
        setAuthToken(null);
    },

    me: async () => {
        return apiFetch('/auth/me');
    },

    googleLogin: async (token: string) => {
        const data = await apiFetch('/auth/google', {
            method: 'POST',
            body: JSON.stringify({ token }),
        });
        setAuthToken(data.token);
        return data;
    },
};

// =====================
// CHARACTER API
// =====================
export const characterAPI = {
    create: async (name: string, charClass: string) => {
        return apiFetch('/characters', {
            method: 'POST',
            body: JSON.stringify({ name, class: charClass }),
        });
    },

    list: async () => {
        return apiFetch('/characters');
    },

    get: async (id: string) => {
        return apiFetch(`/characters/${id}`);
    },

    update: async (id: string, updates: any) => {
        return apiFetch(`/characters/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
        });
    },

    delete: async (id: string) => {
        return apiFetch(`/characters/${id}`, {
            method: 'DELETE',
        });
    },

    saveProgress: async (id: string, progress: any) => {
        return apiFetch(`/characters/${id}/save`, {
            method: 'POST',
            body: JSON.stringify(progress),
        });
    },
};

// =====================
// GUILD API
// =====================
export const guildAPI = {
    create: async (name: string, tag: string) => {
        return apiFetch('/guilds', {
            method: 'POST',
            body: JSON.stringify({ name, tag }),
        });
    },

    myGuild: async () => {
        return apiFetch('/guilds/my');
    },

    get: async (id: string) => {
        return apiFetch(`/guilds/${id}`);
    },

    join: async (id: string) => {
        return apiFetch(`/guilds/${id}/join`, {
            method: 'POST',
        });
    },

    leave: async () => {
        return apiFetch('/guilds/leave', {
            method: 'POST',
        });
    },

    kick: async (guildId: string, memberId: string) => {
        return apiFetch(`/guilds/${guildId}/kick/${memberId}`, {
            method: 'DELETE',
        });
    },

    promote: async (guildId: string, memberId: string) => {
        return apiFetch(`/guilds/${guildId}/promote/${memberId}`, {
            method: 'POST',
        });
    },

    demote: async (guildId: string, memberId: string) => {
        return apiFetch(`/guilds/${guildId}/demote/${memberId}`, {
            method: 'POST',
        });
    },

    donate: async (guildId: string, amount: number) => {
        return apiFetch(`/guilds/${guildId}/donate`, {
            method: 'POST',
            body: JSON.stringify({ amount }),
        });
    },

    leaderboard: async () => {
        return apiFetch('/guilds/leaderboard');
    },
};

// =====================
// PARTY API
// =====================
export const partyAPI = {
    create: async () => {
        return apiFetch('/party', {
            method: 'POST',
        });
    },

    myParty: async () => {
        return apiFetch('/party/my');
    },

    invite: async (playerId: string) => {
        return apiFetch(`/party/invite/${playerId}`, {
            method: 'POST',
        });
    },

    leave: async () => {
        return apiFetch('/party/leave', {
            method: 'POST',
        });
    },

    kick: async (memberId: string) => {
        return apiFetch(`/party/kick/${memberId}`, {
            method: 'DELETE',
        });
    },

    updateSettings: async (settings: { lootMode?: string; expShareEnabled?: boolean }) => {
        return apiFetch('/party/settings', {
            method: 'PUT',
            body: JSON.stringify(settings),
        });
    },

    disband: async () => {
        return apiFetch('/party/disband', {
            method: 'DELETE',
        });
    },
};

// =====================
// TRADE API
// =====================
export const tradeAPI = {
    request: async (targetPlayerId: string) => {
        return apiFetch(`/trade/request/${targetPlayerId}`, {
            method: 'POST',
        });
    },

    myTrades: async () => {
        return apiFetch('/trade/my');
    },

    get: async (id: string) => {
        return apiFetch(`/trade/${id}`);
    },

    addItem: async (tradeId: string, item: any) => {
        return apiFetch(`/trade/${tradeId}/item`, {
            method: 'POST',
            body: JSON.stringify({ item }),
        });
    },

    setGold: async (tradeId: string, amount: number) => {
        return apiFetch(`/trade/${tradeId}/gold`, {
            method: 'PUT',
            body: JSON.stringify({ amount }),
        });
    },

    confirm: async (tradeId: string) => {
        return apiFetch(`/trade/${tradeId}/confirm`, {
            method: 'POST',
        });
    },

    cancel: async (tradeId: string) => {
        return apiFetch(`/trade/${tradeId}/cancel`, {
            method: 'POST',
        });
    },
};

// =====================
// LEADERBOARD API
// =====================
export const leaderboardAPI = {
    level: async () => {
        return apiFetch('/leaderboard/level');
    },

    pvp: async () => {
        return apiFetch('/leaderboard/pvp');
    },

    wealth: async () => {
        return apiFetch('/leaderboard/wealth');
    },

    guilds: async () => {
        return apiFetch('/leaderboard/guilds');
    },
};

// =====================
// MAIL API
// =====================
export const mailAPI = {
    inbox: async (page: number = 1, limit: number = 20) => {
        return apiFetch(`/mail/inbox?page=${page}&limit=${limit}`);
    },

    send: async (recipientName: string, subject: string, message: string, attachedGold: number = 0, attachedItems: any[] = []) => {
        return apiFetch('/mail/send', {
            method: 'POST',
            body: JSON.stringify({ recipientName, subject, message, attachedGold, attachedItems }),
        });
    },

    read: async (mailId: string) => {
        return apiFetch(`/mail/${mailId}`);
    },

    collect: async (mailId: string) => {
        return apiFetch(`/mail/${mailId}/collect`, {
            method: 'POST',
        });
    },

    delete: async (mailId: string) => {
        return apiFetch(`/mail/${mailId}`, {
            method: 'DELETE',
        });
    },

    deleteAllRead: async () => {
        return apiFetch('/mail/batch/read', {
            method: 'DELETE',
        });
    },
};

// =====================
// EVENT API
// =====================
export const eventAPI = {
    getActive: async () => {
        return apiFetch('/events/active');
    },

    getUpcoming: async () => {
        return apiFetch('/events/upcoming');
    },

    getBonuses: async (zoneId?: number, level?: number) => {
        const params = new URLSearchParams();
        if (zoneId) params.append('zoneId', zoneId.toString());
        if (level) params.append('level', level.toString());
        return apiFetch(`/events/bonuses?${params.toString()}`);
    },

    getEvent: async (eventId: string) => {
        return apiFetch(`/events/${eventId}`);
    },
};

// =====================
// HOUSE API
// =====================
export const houseAPI = {
    getHouse: async () => {
        return apiFetch('/house');
    },

    upgradeHouse: async (targetType: string) => {
        return apiFetch('/house/upgrade', {
            method: 'POST',
            body: JSON.stringify({ targetType }),
        });
    },

    buyFurniture: async (furnitureId: string, position?: { x: number, y: number, z: number }) => {
        return apiFetch('/house/furniture/buy', {
            method: 'POST',
            body: JSON.stringify({ furnitureId, position }),
        });
    },

    moveFurniture: async (furnitureInstanceId: string, position: { x: number, y: number, z: number }, rotation?: number) => {
        return apiFetch('/house/furniture/move', {
            method: 'PUT',
            body: JSON.stringify({ furnitureInstanceId, position, rotation }),
        });
    },

    removeFurniture: async (furnitureInstanceId: string) => {
        return apiFetch(`/house/furniture/${furnitureInstanceId}`, {
            method: 'DELETE',
        });
    },

    addToStorage: async (item: any) => {
        return apiFetch('/house/storage/add', {
            method: 'POST',
            body: JSON.stringify({ item }),
        });
    },

    removeFromStorage: async (itemId: string, quantity?: number) => {
        return apiFetch('/house/storage/remove', {
            method: 'POST',
            body: JSON.stringify({ itemId, quantity }),
        });
    },

    getBuffs: async () => {
        return apiFetch('/house/buffs');
    },

    visitHouse: async (ownerName: string) => {
        return apiFetch(`/house/visit/${encodeURIComponent(ownerName)}`);
    },

    updateSettings: async (name?: string, permissions?: any) => {
        return apiFetch('/house/settings', {
            method: 'PUT',
            body: JSON.stringify({ name, permissions }),
        });
    },
};

// =====================
// FRIEND API
// =====================
export const friendAPI = {
    getFriends: async () => {
        return apiFetch('/friends');
    },

    getPendingRequests: async () => {
        return apiFetch('/friends/pending');
    },

    sendRequest: async (targetName: string) => {
        return apiFetch('/friends/request', {
            method: 'POST',
            body: JSON.stringify({ targetName }),
        });
    },

    acceptRequest: async (requestId: string) => {
        return apiFetch(`/friends/accept/${requestId}`, {
            method: 'POST',
        });
    },

    rejectRequest: async (requestId: string) => {
        return apiFetch(`/friends/reject/${requestId}`, {
            method: 'POST',
        });
    },

    removeFriend: async (friendId: string) => {
        return apiFetch(`/friends/${friendId}`, {
            method: 'DELETE',
        });
    },

    blockUser: async (targetId: string) => {
        return apiFetch('/friends/block', {
            method: 'POST',
            body: JSON.stringify({ targetId }),
        });
    },

    unblockUser: async (targetId: string) => {
        return apiFetch(`/friends/block/${targetId}`, {
            method: 'DELETE',
        });
    },

    getBlocked: async () => {
        return apiFetch('/friends/blocked');
    },
};

// =====================
// DAILY QUEST API
// =====================
export const dailyQuestAPI = {
    getQuests: async () => {
        return apiFetch('/daily-quests');
    },

    updateProgress: async (questType: string, amount: number = 1) => {
        return apiFetch('/daily-quests/progress', {
            method: 'POST',
            body: JSON.stringify({ questType, amount }),
        });
    },

    claimReward: async (questId: string) => {
        return apiFetch(`/daily-quests/claim/${questId}`, {
            method: 'POST',
        });
    },

    claimBonusReward: async () => {
        return apiFetch('/daily-quests/claim-bonus', {
            method: 'POST',
        });
    },
};

// =====================
// PREMIUM API
// =====================
export const premiumAPI = {
    getStatus: async () => {
        return apiFetch('/premium/status');
    },

    purchase: async (tier: string, duration: number) => {
        return apiFetch('/premium/purchase', {
            method: 'POST',
            body: JSON.stringify({ tier, duration }),
        });
    },

    claimDailyGems: async () => {
        return apiFetch('/premium/claim-daily', {
            method: 'POST',
        });
    },
};

// Default export
export default {
    auth: authAPI,
    character: characterAPI,
    guild: guildAPI,
    party: partyAPI,
    trade: tradeAPI,
    leaderboard: leaderboardAPI,
    mail: mailAPI,
    event: eventAPI,
    house: houseAPI,
    friend: friendAPI,
    dailyQuest: dailyQuestAPI,
    premium: premiumAPI,
};
