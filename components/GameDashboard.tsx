import React, { useState, useEffect, Suspense } from 'react';
import { GameGuideModal } from './GameGuideModal';
import { AssetLoader } from '../utils/AssetLoader';
import { PlayerState, CharacterClass, Item, Equipment, Faction, Quest, Rank, WingItem, PetItem, HUDLayout, CraftingRecipe, DailyLoginState, Achievement, DailyLoginReward, Party, PartyMember, Guild, Trade } from '../types';
import { CLASSES, LEVEL_XP_REQUIREMENTS, FACTIONS, QUEST_DATA, ZONE_CONFIG, RANKS, MOCK_LEADERBOARD, WINGS_DATA, PETS_DATA, CLASS_BASE_STATS, DEFAULT_HUD_LAYOUT, CLASS_STARTER_ITEMS } from '../constants';
import SkillTree from './SkillTree';
import ActiveZoneView from './ActiveZoneView';
import MarketView from './MarketView';
import NpcShopView from './NpcShopView';
import BlacksmithView from './BlacksmithView';
import CraftingView from './CraftingView';
import RecipeCraftingView from './RecipeCraftingView';
import InventoryModal from './InventoryModal';
import StatPointsPanel from './StatPointsPanel';
import { DailyLoginModal } from './DailyLoginModal';
import { AchievementModal, DEFAULT_ACHIEVEMENTS } from './AchievementModal';
import SchematicMap from './SchematicMap';
import PartyHUD from './PartyHUD';
import {
    Sword, Shield, Heart, Zap, Map as MapIcon, ChevronRight, User, Settings as SettingsIcon,
    LogOut, Backpack, Scroll, Users, MessageSquare, Crown, Star, X, Hammer, Plus, ShoppingCart, ShoppingBag,
    Swords, Trophy, Bird, Feather, Clock, Gem, Package, DollarSign, Skull, Book, Calendar, Gift, UserPlus, Medal
} from 'lucide-react';
import { soundManager } from './SoundManager';
import { PremiumMarketView } from './PremiumMarketView';
import GuildModal from './GuildModal';
import TradeView from './TradeView';
import LeaderboardView from './LeaderboardView';
import { v4 as uuidv4 } from 'uuid';
import ChatSystem from './ChatSystem';
import { ChatMessage } from '../types';
import { VoxelSpartan } from './VoxelSpartan';
import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { io, Socket } from 'socket.io-client';
import { characterAPI, guildAPI, partyAPI, tradeAPI } from '../utils/api';
import PartyView from './PartyView';
import GuildView from './GuildView';
import MailView from './MailView';
import DailyQuestView from './DailyQuestView';
import TutorialSystem, { useTutorial } from './TutorialSystem';
import SettingsView, { SettingsProvider, useSettings } from './SettingsView';
import PremiumView from './PremiumView';
import { NotificationProvider, useNotifications } from './NotificationSystem';
import BattlePassView from './BattlePassView';
import PlayerStatsView from './PlayerStatsView';
import BossTimerView from './BossTimerView';
import ReferralView from './ReferralView';
import AuctionHouseView from './AuctionHouseView';
import WorldMapView from './WorldMapView';
import ControlsGuideView from './ControlsGuideView';
import MountSystemView from './MountSystemView';


interface GameDashboardProps {
    nickname: string;
    charClass: CharacterClass;
    faction: Faction;
    isAdmin?: boolean;
    onLogout: () => void;
    characterId?: string;
}

// ERROR BOUNDARY COMPONENT
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error: any) { return { hasError: true, error }; }
    componentDidCatch(error: any, errorInfo: any) { console.error("Dashboard Crash:", error, errorInfo); }
    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-white p-8">
                    <h1 className="text-3xl font-bold text-red-500 mb-4">Bir Hata Oluştu! (Game Crash)</h1>
                    <p className="text-slate-300 mb-4 bg-black/50 p-4 rounded border border-slate-700 font-mono text-xs">{this.state.error?.toString()}</p>
                    <button onClick={() => { this.setState({ hasError: false }); window.location.reload(); }} className="px-6 py-3 bg-red-600 hover:bg-red-500 rounded font-bold">Sayfayı Yenile</button>
                    <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="mt-4 text-xs text-slate-500 underline hover:text-white">Kayıtları Temizle ve Sıfırla (Reset Save)</button>
                </div>
            );
        }
        return this.props.children;
    }
}

// Helper Components
const RankBadge: React.FC<{ rankIndex: number, title: string, showTitle?: boolean }> = ({ rankIndex, title, showTitle }) => {
    let badgeColor = 'from-slate-700 to-slate-900';
    let borderColor = 'border-slate-600';
    let iconColor = 'text-slate-400';
    let textGradient = 'from-slate-300 via-slate-100 to-slate-400';

    if (rankIndex >= 3) { badgeColor = 'from-green-900 to-green-950'; borderColor = 'border-green-600'; iconColor = 'text-green-400'; textGradient = 'from-green-300 via-emerald-100 to-green-400'; }
    if (rankIndex >= 6) { badgeColor = 'from-blue-900 to-blue-950'; borderColor = 'border-blue-500'; iconColor = 'text-blue-400'; textGradient = 'from-blue-300 via-cyan-100 to-blue-400'; }
    if (rankIndex >= 10) { badgeColor = 'from-purple-900 to-purple-950'; borderColor = 'border-purple-500'; iconColor = 'text-purple-300'; textGradient = 'from-purple-300 via-pink-100 to-purple-400'; }
    if (rankIndex >= 14) { badgeColor = 'from-orange-800 to-red-950'; borderColor = 'border-orange-500 animate-pulse'; iconColor = 'text-orange-400'; textGradient = 'from-orange-300 via-yellow-100 to-red-400'; }
    if (rankIndex >= 18) { badgeColor = 'from-yellow-700 via-amber-600 to-yellow-900'; borderColor = 'border-yellow-400 animate-pulse shadow-[0_0_10px_gold]'; iconColor = 'text-yellow-100'; textGradient = 'from-yellow-200 via-amber-100 to-yellow-400'; }

    return (
        <div className="flex items-center gap-2">
            <div className={`relative w-8 h-8 rounded rotate-45 border-2 ${borderColor} bg-gradient-to-br ${badgeColor} flex items-center justify-center shadow-lg`}>
                <div className="-rotate-45 font-bold text-sm tracking-tighter drop-shadow-md flex items-center justify-center">
                    <span className={iconColor}>
                        {rankIndex < 3 && <User size={16} />}
                        {rankIndex >= 3 && rankIndex < 6 && <Shield size={16} />}
                        {rankIndex >= 6 && rankIndex < 10 && <Swords size={16} />}
                        {rankIndex >= 10 && rankIndex < 14 && <Gem size={16} />}
                        {rankIndex >= 14 && rankIndex < 18 && <Skull size={16} />}
                        {rankIndex >= 18 && <Crown size={18} fill="currentColor" />}
                    </span>
                </div>
            </div>
            {showTitle && (
                <div className="flex flex-col min-w-0">
                    <span className={`text-[10px] uppercase font-bold tracking-wider ${iconColor} leading-none`}>Rütbe</span>
                    <span className={`text-xs font-black uppercase bg-gradient-to-r ${textGradient} bg-clip-text text-transparent drop-shadow-md whitespace-nowrap`}>{title}</span>
                </div>
            )}
        </div>
    );
};

const TabButton = ({ id, icon: Icon, label, activeTab, onClick }: any) => (
    <button onClick={() => onClick(id)} className={`w-full p-3 rounded-lg flex flex-col md:flex-row items-center gap-3 transition-all ${activeTab === id ? 'bg-yellow-900/40 border border-yellow-700 text-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.2)]' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'}`}>
        <Icon size={20} className={activeTab === id ? 'animate-pulse' : ''} />
        <span className={`text-xs md:text-sm font-bold hidden md:block ${activeTab === id ? 'text-yellow-100' : ''}`}>{label}</span>
    </button>
);

const GameDashboard: React.FC<GameDashboardProps> = ({ nickname, charClass, faction, isAdmin = false, onLogout, characterId }) => {
    // STATES
    const [activeTab, setActiveTab] = useState<'active_zone' | 'npc_shop' | 'character' | 'skills' | 'map' | 'inventory' | 'guild' | 'quests' | 'leaderboard' | 'companions' | 'market' | 'blacksmith' | 'premium_shop' | 'party'>('skills');
    const startingMap = faction === 'marsu' ? 11 : faction === 'terya' ? 21 : 31;
    const [activeZone, setActiveZone] = useState<number | null>(startingMap);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [showDailyLogin, setShowDailyLogin] = useState(false);
    const [showCrafting, setShowCrafting] = useState(false);
    const [showAchievements, setShowAchievements] = useState(false);
    const [showGameGuide, setShowGameGuide] = useState(false);
    const [party, setParty] = useState<Party | null>(null);
    const [showPartyModal, setShowPartyModal] = useState(false);
    const [guild, setGuild] = useState<Guild | null>(null);
    const [activeTrade, setActiveTrade] = useState<Trade | null>(null);
    const [loading, setLoading] = useState(true);
    const [showMailbox, setShowMailbox] = useState(false);
    const [showDailyQuests, setShowDailyQuests] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showPremium, setShowPremium] = useState(false);
    const [showBattlePass, setShowBattlePass] = useState(false);
    const [showPlayerStats, setShowPlayerStats] = useState(false);
    const [showBossTimer, setShowBossTimer] = useState(false);
    const [showReferral, setShowReferral] = useState(false);
    const [showAuction, setShowAuction] = useState(false);
    const [showWorldMap, setShowWorldMap] = useState(false);
    const [showControls, setShowControls] = useState(false);
    const [showMounts, setShowMounts] = useState(false);
    const { shouldShow: showTutorial } = useTutorial();
    const socketRef = React.useRef<Socket | null>(null);

    // Initialize Socket
    useEffect(() => {
        if (!socketRef.current) {
            console.log("Initializing Global Socket...");
            // Production'da VITE_SOCKET_URL veya VITE_API_URL kullan, yoksa proxy üzerinden bağlan
            // @ts-ignore - Vite environment variable
            const socketUrl = (typeof import.meta !== 'undefined' && (import.meta.env?.VITE_SOCKET_URL || import.meta.env?.VITE_API_URL)) || undefined;
            socketRef.current = io(socketUrl, {
                transports: ['websocket', 'polling']
            });

            socketRef.current.on('connect', () => {
                console.log("✅ Socket Connected (Dashboard)");
            });

            socketRef.current.on('chat_broadcast', (msg: ChatMessage) => {
                setMessages(p => [...p, msg]);
            });
        }

        return () => {
            // We don't disconnect here to prevent reconnection loops if component re-renders
            // socketRef.current?.disconnect();
        };
    }, []);

    /* INITIAL STATE & HELPERS PLACEHOLDER */
    const getClassStarterItems = (cClass: CharacterClass): Item[] => {
        const common: Item[] = [
            { id: uuidv4(), name: 'Ekmek', tier: 1, type: 'consumable', rarity: 'common', value: 50, plus: 0 },
            { id: uuidv4(), name: 'Can İksiri (Küçük)', tier: 1, type: 'consumable', rarity: 'common', value: 50, plus: 0 },
            { id: uuidv4(), name: 'Mana İksiri (Küçük)', tier: 1, type: 'consumable', rarity: 'common', value: 50, plus: 0 },
            { id: uuidv4(), name: 'Kutsal Parşömen', tier: 1, type: 'upgrade_scroll' as any, rarity: 'rare', value: 1000, plus: 0 }
        ];
        const starters = CLASS_STARTER_ITEMS[cClass] || [];
        const startersWithIds = starters.map(item => ({ ...item, id: uuidv4(), plus: 0 }));
        return [...startersWithIds, ...common];
    };

    const getInitialState = (): PlayerState => {
        const baseStats = CLASS_BASE_STATS[charClass];
        const defaultSettings = {
            pvpPriority: false, showNames: true, deviceMode: 'auto' as const, skillBarMode: 'linear' as const,
            hudScale: 1.0, buttonOpacity: 1.0, transparentMap: false, smallMap: false, minimizeQuest: false,
            hudLayout: JSON.parse(JSON.stringify(DEFAULT_HUD_LAYOUT)), nameColor: undefined, autoLoot: true
        };

        if (isAdmin) {
            return {
                nickname: `[GM] ${nickname}`, class: charClass, faction: faction, guildName: 'YÖNETİM',
                level: 30, exp: LEVEL_XP_REQUIREMENTS[30], maxExp: LEVEL_XP_REQUIREMENTS[30],
                credits: 99000000, gems: 99000000, honor: 500000000, rankPoints: 500000000, rank: 19,
                questStage: 10, hp: 99999, maxHp: 99999, mana: 99999, maxMana: 99999, damage: 9999, defense: 9999,
                strength: baseStats.str + 500, dexterity: baseStats.dex + 500, intelligence: baseStats.int + 500, vitality: baseStats.vit + 500, statPoints: 100,
                inventory: [], equipment: { weapon: null, armor: null, helmet: null, pants: null, boots: null, necklace: null, earring: null },
                ownedWings: WINGS_DATA, equippedWing: WINGS_DATA[4], ownedPets: PETS_DATA, equippedPet: PETS_DATA[4],
                ownedSkins: [], equippedSkin: null, activeQuest: null, settings: defaultSettings
            };
        }

        return {
            nickname, class: charClass, faction: faction, guildName: null,
            level: 1, exp: 0, maxExp: LEVEL_XP_REQUIREMENTS[2], credits: 500, gems: 10, honor: 0, rankPoints: 0, rank: 0,
            questStage: 1, hp: baseStats.vit * 10, maxHp: baseStats.vit * 10, mana: baseStats.int * 20, maxMana: baseStats.int * 20,
            damage: baseStats.str * 2, defense: baseStats.vit,
            strength: baseStats.str, dexterity: baseStats.dex, intelligence: baseStats.int, vitality: baseStats.vit, statPoints: 0,
            inventory: getClassStarterItems(charClass), equipment: { weapon: null, armor: null, helmet: null, pants: null, boots: null, necklace: null, earring: null },
            ownedWings: [], equippedWing: null, ownedPets: PETS_DATA, equippedPet: null,
            ownedSkins: [], equippedSkin: null, activeQuest: null, settings: defaultSettings,
            dailyLogin: { lastLoginDate: '', consecutiveDays: 0, claimedToday: false, totalLogins: 0 },
            achievements: DEFAULT_ACHIEVEMENTS.map(a => ({ ...a }))
        };
    };

    const [playerStats, setPlayerStats] = useState<PlayerState>(getInitialState());

    // --- LOAD DATA ---
    useEffect(() => {
        const loadCharacterData = async () => {
            if (characterId && characterId !== 'temp_id') {
                try {
                    setLoading(true);
                    const data = await characterAPI.get(characterId);
                    if (data.character && data.character.gameData) {
                        const loadedState = {
                            ...getInitialState(),
                            ...data.character.gameData,
                            nickname: data.character.name,
                            class: data.character.class,
                            faction: data.character.faction || faction
                        };
                        setPlayerStats(recalculateStats(loadedState));
                    }
                } catch (err) { console.error("Load failed:", err); } finally { setLoading(false); }
            } else { setLoading(false); }
        };
        if (!isAdmin) loadCharacterData(); else setLoading(false);
    }, [characterId, isAdmin]);

    // --- RECALCULATE STATS ---
    const recalculateStats = (currentStats: PlayerState): PlayerState => {
        let bonusHp = 0, bonusDef = 0, bonusDmg = 0, bonusMana = 0;
        const attrHp = currentStats.vitality * 10;
        const attrDef = currentStats.vitality + (currentStats.dexterity * 0.5);
        const attrMana = currentStats.intelligence * 5;
        let attrDmg = 0;
        if (currentStats.class === 'warrior') attrDmg = currentStats.strength * 2;
        else if (currentStats.class === 'archmage') attrDmg = currentStats.intelligence * 2;
        else if (currentStats.class === 'archer') attrDmg = currentStats.dexterity * 2;
        else attrDmg = (currentStats.intelligence * 1.5) + (currentStats.vitality * 0.5);

        const baseHp = 500 + (currentStats.level * 100) + attrHp;
        const baseDmg = 20 + (currentStats.level * 2) + attrDmg;
        const baseDef = 5 + (currentStats.level * 1) + attrDef;
        const baseMana = 100 + (currentStats.level * 10) + attrMana;

        Object.values(currentStats.equipment).forEach(item => {
            if (item) {
                const tierMult = item.tier * 10;
                const plusMult = 1 + ((item.plus || 0) * 0.10);
                if (item.type === 'weapon') bonusDmg += (20 + tierMult) * plusMult;
                if (item.type === 'armor') { bonusHp += (100 + (tierMult * 5)) * plusMult; bonusDef += (10 + item.tier) * plusMult; }
                if (item.type === 'helmet') { bonusDef += (5 + item.tier) * plusMult; bonusHp += 50 * plusMult; }
                if (item.type === 'pants') { bonusDef += (8 + item.tier) * plusMult; bonusHp += 30 * plusMult; }
            }
        });

        const rankData = RANKS[currentStats.rank] || RANKS[0];
        const rankDmgBonus = Math.floor((baseDmg + bonusDmg) * (rankData.bonusDamage / 100));

        return {
            ...currentStats,
            maxHp: Math.floor(baseHp + bonusHp),
            maxMana: Math.floor(baseMana + bonusMana),
            damage: Math.floor(baseDmg + bonusDmg + rankDmgBonus),
            defense: Math.floor(baseDef + bonusDef),
            hp: Math.min(currentStats.hp, Math.floor(baseHp + bonusHp)),
            mana: Math.min(currentStats.mana, Math.floor(baseMana + bonusMana))
        };
    };

    // --- SAVE SYSTEM ---
    useEffect(() => {
        if (loading) return;
        const timer = setInterval(async () => {
            localStorage.setItem(`kadim_save_${nickname}`, JSON.stringify(playerStats));
            if (characterId && characterId !== 'temp_id') {
                try { await characterAPI.saveProgress(characterId, playerStats); } catch (err) { }
            }
        }, 5000);
        return () => clearInterval(timer);
    }, [playerStats, nickname, characterId, loading]);

    const handleStatIncrease = (stat: any) => {
        setPlayerStats(prev => {
            if (prev.statPoints <= 0) return prev;
            return recalculateStats({ ...prev, [stat]: prev[stat] + 1, statPoints: prev.statPoints - 1 });
        });
    };

    const handleLoot = (gold: number, xp: number, honor: number, item?: Item) => {
        setPlayerStats(prev => {
            let newInv = [...prev.inventory];
            if (item) newInv.push(item);
            return { ...prev, credits: prev.credits + gold, exp: prev.exp + xp, honor: prev.honor + honor, inventory: newInv };
        });
    };

    const handleEquipItem = (item: Item, slot?: keyof Equipment) => {
        setPlayerStats(prev => {
            const targetSlot = (slot || item.type) as keyof Equipment;
            if (!['weapon', 'armor', 'helmet', 'pants', 'boots', 'necklace', 'earring'].includes(targetSlot)) return prev;

            const current = prev.equipment[targetSlot];
            const newInv = prev.inventory.filter(i => i.id !== item.id);
            if (current) newInv.push(current);
            return recalculateStats({ ...prev, inventory: newInv, equipment: { ...prev.equipment, [targetSlot]: item } });
        });
    };

    const handleUnequipItem = (slot: keyof Equipment) => {
        setPlayerStats(prev => {
            const item = prev.equipment[slot];
            if (!item) return prev;
            return recalculateStats({ ...prev, inventory: [...prev.inventory, item], equipment: { ...prev.equipment, [slot]: null } });
        });
    };

    const handleUseItem = (item: Item) => {
        if (item.type === 'consumable') {
            setPlayerStats(prev => {
                let newHp = prev.hp;
                if (item.name.includes('Can')) newHp = Math.min(prev.maxHp, prev.hp + 500);
                return { ...prev, hp: newHp, inventory: prev.inventory.filter(i => i.id !== item.id) };
            });
            soundManager.playSFX('potion');
        }
    };

    // --- PET & WING SHOP HANDLERS ---
    const handleBuyPet = (pet: PetItem, cost: number) => {
        if (playerStats.credits < cost && cost > 0) return;
        if (playerStats.ownedPets?.some(p => p.id === pet.id)) return; // Already owned

        setPlayerStats(prev => ({
            ...prev,
            credits: prev.credits - cost,
            ownedPets: [...(prev.ownedPets || []), pet]
        }));
        soundManager.playSFX('coin');
    };

    const handleBuyWing = (wing: WingItem, cost: number) => {
        if (playerStats.credits < cost) return;
        if (playerStats.ownedWings?.some(w => w.id === wing.id)) return; // Already owned

        setPlayerStats(prev => ({
            ...prev,
            credits: prev.credits - cost,
            ownedWings: [...(prev.ownedWings || []), wing]
        }));
        soundManager.playSFX('coin');
    };

    // --- GUILD HANDLERS ---
    const loadGuildData = async () => {
        try {
            setLoading(true);
            const data = await guildAPI.myGuild();
            setGuild(data.guild);
        } catch (err: any) {
            // It's normal to fail if user has no guild
            if (err.message && (err.message.includes('not in a guild') || err.message.includes('404'))) {
                setGuild(null);
            } else {
                console.error("Failed to load guild:", err);
            }
        } finally {
            setLoading(false);
        }
    };

    // Load guild data when tab changes to guild
    useEffect(() => {
        if (activeTab === 'guild') {
            loadGuildData();
        }
    }, [activeTab]);

    const handleCreateGuild = async (name: string, tag: string) => {
        try {
            await guildAPI.create(name, tag);
            // Reload guild data to update UI
            await loadGuildData();
            alert("Klan başarıyla kuruldu!");
        } catch (err: any) {
            console.error("Guild create failed:", err);
            alert(`Hata: ${err.message}`);
        }
    };

    const handleJoinGuild = async (guildId: string) => {
        try {
            await guildAPI.join(guildId);
            await loadGuildData();
            alert("Klana katılım başarılı!");
        } catch (err: any) {
            console.error("Guild join failed:", err);
            alert(`Hata: ${err.message}`);
        }
    };

    const handleLeaveGuild = async () => {
        if (confirm("Klandan ayrılmak istediğine emin misin?")) {
            try {
                await guildAPI.leave();
                setGuild(null);
                setPlayerStats(prev => ({ ...prev, guildName: undefined }));
                alert("Klandan ayrıldın.");
            } catch (err: any) {
                console.error("Guild leave failed:", err);
                alert(`Hata: ${err.message}`);
            }
        }
    };

    const handleKickGuildMember = async (memberId: string) => {
        if (!guild) return;
        if (confirm("Bu üyeyi klandan atmak istediğine emin misin?")) {
            try {
                await guildAPI.kick(guild.id, memberId);
                await loadGuildData();
            } catch (err: any) {
                alert(`Hata: ${err.message}`);
            }
        }
    };

    const handlePromoteGuildMember = async (memberId: string) => {
        if (!guild) return;
        try {
            await guildAPI.promote(guild.id, memberId);
            await loadGuildData();
        } catch (err: any) {
            alert(`Hata: ${err.message}`);
        }
    };

    const handleDemoteGuildMember = async (memberId: string) => {
        if (!guild) return;
        try {
            await guildAPI.demote(guild.id, memberId);
            await loadGuildData();
        } catch (err: any) {
            alert(`Hata: ${err.message}`);
        }
    };

    const handleDonate = async (amount: number) => {
        if (!guild) return;
        try {
            await guildAPI.donate(guild.id, amount);
            await loadGuildData();
            // Also deduct local gold (optional, as fetching profile would be better but expensive)
            setPlayerStats(prev => ({ ...prev, credits: prev.credits - amount }));
            alert(`${amount} Altın bağışlandı!`);
        } catch (err: any) {
            alert(`Bağış başarısız: ${err.message}`);
        }
    };

    // --- PARTY HANDLERS ---
    const loadPartyData = async () => {
        try {
            setLoading(true);
            const data = await partyAPI.myParty();
            setParty(data.party);
        } catch (err: any) {
            if (err.message && (err.message.includes('not in a party') || err.message.includes('404'))) {
                setParty(null);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'party') {
            loadPartyData();
        }
    }, [activeTab]);

    const handleCreateParty = async (name: string, isPublic: boolean) => {
        try {
            await partyAPI.create();
            await loadPartyData();
            alert("Parti oluşturuldu!");
        } catch (err: any) {
            alert(`Hata: ${err.message}`);
        }
    };

    const handleLeaveParty = async () => {
        if (confirm("Partiden ayrılmak istediğine emin misin?")) {
            try {
                await partyAPI.leave();
                setParty(null);
                alert("Partiden ayrıldın.");
            } catch (err: any) {
                alert(`Hata: ${err.message}`);
            }
        }
    };

    const handleKickPartyMember = async (memberId: string) => {
        if (!party) return;
        if (confirm("Bu üyeyi atmak istediğine emin misin?")) {
            try {
                await partyAPI.kick(memberId);
                await loadPartyData();
            } catch (err: any) {
                alert(`Hata: ${err.message}`);
            }
        }
    };

    const handleInviteToParty = async (playerName: string) => {
        try {
            await partyAPI.invite(playerName);
            alert(`${playerName} davet edildi!`);
        } catch (err: any) {
            alert(`Davet hatası: ${err.message}`);
        }
    };

    // --- TRADE SYSTEM ---
    useEffect(() => {
        const checkTrade = async () => {
            // Only if not already in a trade view
            if (!activeTrade) {
                try {
                    const data = await tradeAPI.myTrades();
                    if (data.trades && data.trades.length > 0) {
                        const current = data.trades.find((t: any) => t.status === 'active' || t.status === 'pending');
                        if (current) setActiveTrade(current);
                    }
                } catch (e) { }
            } else {
                // Poll active trade
                try {
                    const data = await tradeAPI.get(activeTrade.id);
                    if (data.trade) {
                        setActiveTrade(data.trade);
                        if (data.trade.status === 'completed') {
                            alert("Ticaret başarıyla tamamlandı!");
                            setActiveTrade(null);
                        } else if (data.trade.status === 'cancelled') {
                            alert("Ticaret iptal edildi.");
                            setActiveTrade(null);
                        }
                    }
                } catch (e) { setActiveTrade(null); }
            }
        };
        const interval = setInterval(checkTrade, 3000); // Check every 3 seconds
        return () => clearInterval(interval);
    }, [activeTrade]);

    const handleAddTradeItem = async (item: Item) => {
        if (!activeTrade) return;
        try { await tradeAPI.addItem(activeTrade.id, item); } catch (err: any) { alert(err.message); }
    };

    const handleSetTradeGold = async (amount: number) => {
        if (!activeTrade) return;
        try { await tradeAPI.setGold(activeTrade.id, amount); } catch (err: any) { alert(err.message); }
    };

    const handleConfirmTrade = async () => {
        if (!activeTrade) return;
        try { await tradeAPI.confirm(activeTrade.id); } catch (err: any) { alert(err.message); }
    };

    const handleCancelTrade = async () => {
        if (!activeTrade) return;
        if (confirm("Ticareti iptal etmek istiyor musun?")) {
            try { await tradeAPI.cancel(activeTrade.id); setActiveTrade(null); } catch (err: any) { alert(err.message); }
        }
    };

    const handleTradeRequest = async (targetId: string) => {
        try {
            await tradeAPI.request(targetId);
            alert("Ticaret isteği gönderildi!");
        } catch (err: any) {
            alert(`Ticaret hatası: ${err.message}`);
        }
    };
    // const handleInviteToGuild removed as it's not in the view yet
    const handleBuyPremium = () => { };

    const handleSendMessage = (text: string, channel: 'global' | 'party' | 'guild') => {
        if (!socketRef.current) return;

        // Optimistic UI update (optional, but waiting for server is safer for consistency)
        // setMessages(p => [...p, { id: uuidv4(), sender: nickname, text, type: channel }]);

        socketRef.current.emit('chat_message', { text, channel, sender: nickname });
    };
    const handleQuestProgress = () => { };
    const handleClaimQuest = () => { };

    // NOT: Early return kullanmıyoruz çünkü React Hook kurallarını ihlal eder (Error #310)
    // Bunun yerine aşağıda conditional rendering kullanıyoruz

    // Loading durumu - Ana return içinde koşullu olarak gösterilecek
    const loadingScreen = (
        <div className="h-full w-full flex flex-col items-center justify-center bg-slate-950 text-white">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-500 mb-4"></div>
            <h2 className="text-xl font-bold animate-pulse">Kadim Evren Yükleniyor...</h2>
            <div className="text-slate-500 text-sm mt-2">Karakter verileri senkronize ediliyor</div>
        </div>
    );

    // ActiveZone görünümü - Ana return içinde koşullu olarak gösterilecek
    const activeZoneScreen = activeZone ? (
        <div className="relative w-full h-full">
            <ActiveZoneView
                zoneId={activeZone}
                playerState={playerStats}
                chatHistory={messages}
                onSendChat={(msg) => handleSendMessage(msg, 'global')}
                onReceiveChat={(msg) => setMessages(prev => [...prev, msg])}
                onExit={() => { setActiveZone(null); setActiveTab('skills'); }}
                onSwitchZone={(newZoneId) => setActiveZone(newZoneId)}
                onLoot={handleLoot}
                onUpdatePlayer={(updates) => setPlayerStats(prev => ({ ...prev, ...updates }))}
                onEquip={handleEquipItem}
                onUnequip={handleUnequipItem}
                onUseItem={handleUseItem}
                socketRef={socketRef}
                onQuestProgress={handleQuestProgress}
                onClaimQuest={handleClaimQuest}
                onOpenCrafting={() => setShowCrafting(true)}
                onQuickPotion={() => { }}
                onInteraction={(type, id) => { if (type === 'portal') setActiveZone(Number(id) || null); }}
                isAdmin={isAdmin}
            />

            {/* Trade Modal Overlay */}
            {activeTrade && (
                <TradeView
                    trade={activeTrade}
                    playerState={playerStats}
                    onAddItem={handleAddTradeItem}
                    onSetGold={handleSetTradeGold}
                    onConfirm={handleConfirmTrade}
                    onCancel={handleCancelTrade}
                    onClose={() => handleCancelTrade()}
                />
            )}

            {showCrafting && <RecipeCraftingView playerState={playerStats} onCraft={() => { }} onClose={() => setShowCrafting(false)} />}
        </div>
    ) : null;

    // Loading durumunda loading ekranını göster
    if (loading) {
        return loadingScreen;
    }

    // ActiveZone varsa o ekranı göster
    if (activeZone) {
        return activeZoneScreen;
    }


    return (
        <ErrorBoundary>
            <div className="h-full flex flex-col bg-[#0b0f19] overflow-hidden">
                <header className="h-20 border-b border-slate-800 bg-slate-900/90 backdrop-blur flex items-center justify-between px-4 sticky top-0 z-50">
                    {/* Sol: Karakter Bilgisi + Para + Rütbe */}
                    <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded bg-slate-800 flex items-center justify-center border border-slate-600 text-yellow-500 font-bold text-lg rpg-font">{playerStats.level}</div>
                        <div>
                            <h1 className="font-bold text-white text-sm leading-tight flex items-center gap-2">
                                {playerStats.nickname} <span className="text-[9px] px-1 py-0.5 rounded border border-slate-700 bg-slate-800 text-slate-400">{faction.toUpperCase()}</span>
                            </h1>
                            <div className="flex items-center gap-2 mt-0.5">
                                <RankBadge rankIndex={playerStats.rank} title={RANKS[playerStats.rank]?.title || 'Acemi'} showTitle={true} />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-yellow-400 bg-yellow-900/20 px-2 py-1 rounded-full border border-yellow-800/50"><DollarSign size={12} /><span className="font-bold text-xs">{playerStats.credits.toLocaleString()}</span></div>
                        <div className="flex items-center gap-2 text-purple-400 bg-purple-900/20 px-2 py-1 rounded-full border border-purple-800/50"><Gem size={12} /><span className="font-bold text-xs">{playerStats.gems.toLocaleString()}</span></div>
                        <div className="flex items-center gap-2 text-orange-400 bg-orange-900/20 px-2 py-1 rounded-full border border-orange-800/50"><Medal size={12} /><span className="font-bold text-xs">{playerStats.honor.toLocaleString()}</span></div>
                    </div>

                    {/* Orta: Hızlı Erişim Butonları */}
                    <div className="flex items-center gap-1 overflow-x-auto max-w-[60%] scrollbar-none">
                        <button onClick={() => setShowDailyQuests(true)} className="p-1.5 bg-orange-900/30 hover:bg-orange-900/50 rounded border border-orange-700/50 text-orange-400 hover:text-orange-300 transition-colors text-sm" title="Günlük Görevler">📋</button>
                        <button onClick={() => setShowPremium(true)} className="p-1.5 bg-yellow-900/30 hover:bg-yellow-900/50 rounded border border-yellow-700/50 text-yellow-400 hover:text-yellow-300 transition-colors text-sm" title="Premium">👑</button>
                        <button onClick={() => setShowBattlePass(true)} className="p-1.5 bg-gradient-to-r from-orange-900/30 to-red-900/30 hover:from-orange-800/50 hover:to-red-800/50 rounded border border-orange-600/50 text-orange-400 hover:text-orange-300 transition-colors text-sm" title="Battle Pass">🎖️</button>
                        <button onClick={() => setShowPlayerStats(true)} className="p-1.5 bg-cyan-900/30 hover:bg-cyan-800/50 rounded border border-cyan-700/50 text-cyan-400 hover:text-cyan-300 transition-colors text-sm" title="İstatistikler">📊</button>
                        <button onClick={() => setShowBossTimer(true)} className="p-1.5 bg-red-900/30 hover:bg-red-800/50 rounded border border-red-700/50 text-red-400 hover:text-red-300 transition-colors text-sm" title="Boss Timer">💀</button>
                        <button onClick={() => setShowReferral(true)} className="p-1.5 bg-blue-900/30 hover:bg-blue-800/50 rounded border border-blue-700/50 text-blue-400 hover:text-blue-300 transition-colors text-sm" title="Arkadaş Davet">👥</button>
                        <button onClick={() => setShowAuction(true)} className="p-1.5 bg-amber-900/30 hover:bg-amber-800/50 rounded border border-amber-700/50 text-amber-400 hover:text-amber-300 transition-colors text-sm" title="Açık Artırma">🏛️</button>
                        <button onClick={() => setShowMounts(true)} className="p-1.5 bg-orange-900/30 hover:bg-orange-800/50 rounded border border-orange-700/50 text-orange-400 hover:text-orange-300 transition-colors text-sm" title="Binekler">🐴</button>
                        <button onClick={() => setShowControls(true)} className="p-1.5 bg-indigo-900/30 hover:bg-indigo-800/50 rounded border border-indigo-700/50 text-indigo-400 hover:text-indigo-300 transition-colors text-sm" title="Kontroller">⌨️</button>
                    </div>

                    {/* Sağ: Mesaj, Ayarlar, Çıkış */}
                    <div className="flex items-center gap-2">
                        <button onClick={() => setShowMailbox(true)} className="p-2 bg-amber-900/30 hover:bg-amber-900/50 rounded-lg border border-amber-700/50 text-amber-400 hover:text-amber-300 transition-colors" title="Posta Kutusu">
                            <MessageSquare size={18} />
                        </button>
                        <button onClick={() => setShowSettings(true)} className="p-2 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg border border-slate-600/50 text-slate-400 hover:text-slate-300 transition-colors" title="Ayarlar">
                            ⚙️
                        </button>
                        <button onClick={onLogout} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"><LogOut size={16} /> Çıkış</button>
                    </div>
                </header>

                <div className="flex flex-1 overflow-hidden">
                    <aside className="w-20 md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col py-6 gap-2 px-2 md:px-4 overflow-hidden">
                        <nav className="flex flex-col gap-2 h-full overflow-y-auto pr-1 custom-scrollbar">
                            <button onClick={() => setActiveZone(startingMap || 11)} className="w-full p-3 rounded-lg flex flex-col md:flex-row items-center gap-3 transition-all text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent">
                                <Swords size={20} /><span className="text-xs md:text-sm font-bold hidden md:block">OYUNA GİR</span>
                            </button>
                            <TabButton id="character" icon={User} label="Karakter" activeTab={activeTab} onClick={setActiveTab} />
                            <TabButton id="inventory" icon={Package} label="Envanter" activeTab={activeTab} onClick={setActiveTab} />
                            <TabButton id="skills" icon={Shield} label="Yetenekler" activeTab={activeTab} onClick={setActiveTab} />
                            <TabButton id="quests" icon={Scroll} label="Görevler" activeTab={activeTab} onClick={setActiveTab} />
                            <TabButton id="party" icon={UserPlus} label="Parti" activeTab={activeTab} onClick={setActiveTab} />
                            <TabButton id="guild" icon={Users} label="Lonca" activeTab={activeTab} onClick={setActiveTab} />
                            <TabButton id="market" icon={ShoppingBag} label="Pazar" activeTab={activeTab} onClick={setActiveTab} />
                            <TabButton id="blacksmith" icon={Hammer} label="Demirci" activeTab={activeTab} onClick={setActiveTab} />
                            <TabButton id="map" icon={MapIcon} label="Harita" activeTab={activeTab} onClick={setActiveTab} />
                            <TabButton id="leaderboard" icon={Trophy} label="Sıralama" activeTab={activeTab} onClick={setActiveTab} />
                        </nav>
                    </aside>

                    <main className="flex-1 bg-slate-950 overflow-y-auto p-4 md:p-8">
                        {activeTab === 'character' && (
                            <div className="max-w-4xl mx-auto">
                                <div className="flex flex-col lg:flex-row gap-6">
                                    {/* Sol Panel - 3D Model */}
                                    <div className="flex-1 flex flex-col items-center">
                                        <h2 className="text-2xl font-bold mb-4 text-white">{playerStats.nickname}</h2>
                                        <div className="w-full max-w-xs h-96 relative bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
                                            <Canvas shadows camera={{ position: [0, 2, 5], fov: 45 }}>
                                                <ambientLight intensity={0.5} />
                                                <spotLight position={[5, 10, 5]} angle={0.5} penumbra={1} intensity={2} castShadow />
                                                <Suspense fallback={null}>
                                                    <VoxelSpartan charClass={playerStats.class} rotation={[0, 0, 0]} isMoving={false} isAttacking={false} weaponItem={playerStats.equipment.weapon} />
                                                </Suspense>
                                                <Environment preset="city" />
                                            </Canvas>
                                        </div>

                                        {/* Temel Bilgiler */}
                                        <div className="w-full max-w-xs mt-4 bg-slate-900/80 rounded-xl p-4 border border-slate-700">
                                            <h3 className="text-sm font-bold text-slate-400 uppercase mb-3">📊 Temel Bilgiler</h3>
                                            <div className="grid grid-cols-2 gap-3 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-slate-400">Seviye:</span>
                                                    <span className="text-yellow-400 font-bold">{playerStats.level}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-400">Sınıf:</span>
                                                    <span className="text-purple-400 font-bold capitalize">{playerStats.class || 'Bilinmiyor'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-400">Can:</span>
                                                    <span className="text-red-400 font-bold">{playerStats.hp}/{playerStats.maxHp}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-400">Mana:</span>
                                                    <span className="text-blue-400 font-bold">{playerStats.mana}/{playerStats.maxMana}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-400">Hasar:</span>
                                                    <span className="text-orange-400 font-bold">{playerStats.damage}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-400">Zırh:</span>
                                                    <span className="text-cyan-400 font-bold">{playerStats.defense}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Sağ Panel - Stat Points + Pet + Kanat */}
                                    <div className="flex-1 space-y-4">
                                        <StatPointsPanel playerState={playerStats} onAddStat={handleStatIncrease} />

                                        {/* Yoldaş (Pet) Bölümü */}
                                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-4 border border-slate-700">
                                            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-3">
                                                🐾 Yoldaş (Pet)
                                            </h3>
                                            {playerStats.equippedPet ? (
                                                <div className="flex items-center gap-4 p-3 bg-green-600/20 rounded-lg border border-green-600/30">
                                                    <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center text-2xl">
                                                        🐉
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-green-400">{playerStats.equippedPet.name}</div>
                                                        <div className="text-xs text-slate-400">
                                                            +{playerStats.equippedPet.bonusExpRate}% EXP • +{playerStats.equippedPet.bonusDefense} Zırh
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center py-4 text-slate-500">
                                                    <div className="text-2xl mb-2">🎁</div>
                                                    <p className="text-sm">Henüz yoldaşın yok</p>
                                                    <p className="text-xs text-slate-600">Market'ten satın alabilirsin</p>
                                                </div>
                                            )}
                                            {/* Sahip Olunan Petler */}
                                            {playerStats.ownedPets && playerStats.ownedPets.length > 0 && (
                                                <div className="mt-3 border-t border-slate-700 pt-3">
                                                    <div className="text-xs text-slate-400 mb-2">Sahip Olduğun Yoldaşlar:</div>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        {playerStats.ownedPets.map(pet => (
                                                            <button
                                                                key={pet.id}
                                                                onClick={() => setPlayerStats(prev => ({ ...prev, equippedPet: prev.equippedPet?.id === pet.id ? null : pet }))}
                                                                className={`p-2 rounded-lg border text-center transition-all ${playerStats.equippedPet?.id === pet.id
                                                                    ? 'bg-green-600/30 border-green-500'
                                                                    : 'bg-slate-800 border-slate-600 hover:border-green-500'
                                                                    }`}
                                                            >
                                                                <div className="text-lg">🐾</div>
                                                                <div className="text-[10px] text-slate-300 truncate">{pet.name}</div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Kanat Bölümü */}
                                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-4 border border-slate-700">
                                            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-3">
                                                🪽 Kanat
                                            </h3>
                                            {playerStats.equippedWing ? (
                                                <div className="flex items-center gap-4 p-3 bg-purple-600/20 rounded-lg border border-purple-600/30">
                                                    <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center text-2xl">
                                                        🪽
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="font-bold text-purple-400">{playerStats.equippedWing.name}</div>
                                                        <div className="text-xs text-slate-400">
                                                            +{playerStats.equippedWing.bonusDamage} Hasar • +{playerStats.equippedWing.bonusHp} Can
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => setPlayerStats(prev => ({ ...prev, equippedWing: null }))}
                                                        className="px-2 py-1 bg-red-600/30 hover:bg-red-600/50 text-red-300 text-xs rounded border border-red-600/50"
                                                    >
                                                        Çıkar
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="text-center py-4 text-slate-500">
                                                    <div className="text-2xl mb-2">✨</div>
                                                    <p className="text-sm">Henüz kanatın yok</p>
                                                    <p className="text-xs text-slate-600">Market'ten satın alabilirsin</p>
                                                </div>
                                            )}
                                            {/* Sahip Olunan Kanatlar */}
                                            {playerStats.ownedWings && playerStats.ownedWings.length > 0 && (
                                                <div className="mt-3 border-t border-slate-700 pt-3">
                                                    <div className="text-xs text-slate-400 mb-2">Sahip Olduğun Kanatlar:</div>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        {playerStats.ownedWings.map(wing => (
                                                            <button
                                                                key={wing.id}
                                                                onClick={() => setPlayerStats(prev => ({ ...prev, equippedWing: prev.equippedWing?.id === wing.id ? null : wing }))}
                                                                className={`p-2 rounded-lg border text-center transition-all ${playerStats.equippedWing?.id === wing.id
                                                                    ? 'bg-purple-600/30 border-purple-500'
                                                                    : 'bg-slate-800 border-slate-600 hover:border-purple-500'
                                                                    }`}
                                                            >
                                                                <div className="text-lg">🪽</div>
                                                                <div className="text-[10px] text-slate-300 truncate">{wing.name}</div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'inventory' && <InventoryModal playerState={playerStats} onEquip={handleEquipItem} onUnequip={handleUnequipItem} onUse={handleUseItem} onClose={() => setActiveTab('skills')} />}
                        {activeTab === 'skills' && <SkillTree playerClass={CLASSES[playerStats.class || 'warrior']} playerLevel={playerStats.level} />}
                        {activeTab === 'quests' && <div className="bg-slate-900 p-8 rounded-xl border border-slate-700"><h1 className="text-2xl text-yellow-500 font-bold mb-4">GÖREVLER</h1><p className="text-slate-400">Aktif: {playerStats.activeQuest ? playerStats.activeQuest.title : 'Yok'}</p></div>}
                        {activeTab === 'party' && (
                            <PartyView
                                party={party}
                                playerState={playerStats}
                                onCreateParty={handleCreateParty}
                                onLeaveParty={handleLeaveParty}
                                onKickMember={handleKickPartyMember}
                                onInvitePlayer={handleInviteToParty}
                                onTradeRequest={handleTradeRequest}
                                onChangeLootRule={() => { }}
                                onClose={() => setActiveTab('skills')}
                            />
                        )}

                        {activeTab === 'guild' && (
                            <GuildView
                                guild={guild}
                                playerState={playerStats}
                                onCreateGuild={handleCreateGuild}
                                onJoinGuild={handleJoinGuild}
                                onLeaveGuild={handleLeaveGuild}
                                onKickMember={handleKickGuildMember}
                                onPromoteMember={handlePromoteGuildMember}
                                onDemoteMember={handleDemoteGuildMember}
                                onDonate={handleDonate}
                                onClose={() => setActiveTab('skills')}
                            />
                        )}

                        {activeTab === 'market' && (
                            <NpcShopView
                                playerState={playerStats}
                                onBuy={(item, cost) => {
                                    if (playerStats.credits >= cost) {
                                        setPlayerStats(prev => ({
                                            ...prev,
                                            credits: prev.credits - cost,
                                            inventory: [...prev.inventory, item]
                                        }));
                                        soundManager.playSFX('coin');
                                    }
                                }}
                                onBuyPet={handleBuyPet}
                                onBuyWing={handleBuyWing}
                                onClose={() => setActiveTab('skills')}
                            />
                        )}
                        {activeTab === 'blacksmith' && <BlacksmithView playerState={playerStats} onUpgrade={(item, scroll) => {
                            // KNIGHT ONLINE TARZI ZOR GÜÇLENDİRME SİSTEMİ
                            // +7'den sonra çok zor - item pazarı değerli olsun!
                            const currentPlus = item.plus || 0;

                            // Başarı Oranları (ULTRA ZOR - Knight Online hardcore!)
                            const SUCCESS_RATES: Record<number, number> = {
                                0: 100, 1: 100, 2: 100, 3: 100, // +0 → +3: Garanti
                                4: 60,   // +4: %60
                                5: 35,   // +5: %35
                                6: 15,   // +6: %15
                                7: 5,    // +7: %5 (ÇOK ZOR!)
                                8: 2,    // +8: %2
                                9: 1,    // +9: %1
                                10: 0.5, // +10: %0.5
                                11: 0.2, // +11: %0.2
                                12: 0.1, // +12: %0.1 (EFSANE!)
                            };

                            // Yanma Oranları (+5'ten itibaren yanma riski!)
                            const BURN_RATES: Record<number, number> = {
                                5: 10,   // +5: %10 yanma
                                6: 20,   // +6: %20 yanma
                                7: 35,   // +7: %35 yanma
                                8: 50,   // +8: %50 yanma
                                9: 60,   // +9: %60 yanma
                                10: 70,  // +10: %70 yanma
                                11: 80,  // +11: %80 yanma
                                12: 90,  // +12: %90 yanma
                            };

                            const successRate = SUCCESS_RATES[currentPlus] ?? 0.1;
                            const burnRate = BURN_RATES[currentPlus] ?? 0;

                            const roll = Math.random() * 100;
                            const isSuccess = roll < successRate;
                            const isBurned = !isSuccess && burnRate > 0 && (Math.random() * 100) < burnRate;

                            if (isSuccess) {
                                // BAŞARILI! Item seviye atladı
                                const newPlus = currentPlus + 1;
                                const updatedInventory = playerStats.inventory.map((i: any) =>
                                    i.id === item.id ? { ...i, plus: newPlus } : i
                                );
                                const finalInventory = updatedInventory.filter((i: any) => i.id !== scroll.id);
                                setPlayerStats({ ...playerStats, inventory: finalInventory });
                                return { success: true, burned: false, newPlus };
                            } else if (isBurned) {
                                // YANDI! Item yok oldu
                                const finalInventory = playerStats.inventory.filter((i: any) => i.id !== item.id && i.id !== scroll.id);
                                setPlayerStats({ ...playerStats, inventory: finalInventory });
                                return { success: false, burned: true, newPlus: 0 };
                            } else {
                                // BAŞARISIZ! Sadece scroll harcandı
                                const finalInventory = playerStats.inventory.filter((i: any) => i.id !== scroll.id);
                                setPlayerStats({ ...playerStats, inventory: finalInventory });
                                return { success: false, burned: false, newPlus: currentPlus };
                            }
                        }} onClose={() => setActiveTab('skills')} />}
                        {activeTab === 'map' && <div className="w-full h-full flex flex-col items-center"><h2 className="text-3xl rpg-font text-yellow-500 mb-6 flex items-center gap-3"><MapIcon size={32} /> HARİTA</h2><div className="w-full max-w-5xl"><SchematicMap activeZone={startingMap} onZoneSelect={(id) => setActiveZone(id)} /></div></div>}
                        {activeTab === 'leaderboard' && <LeaderboardView onJoinGuild={handleJoinGuild} />}
                    </main>
                </div>
            </div>

            {/* Mail Modal */}
            {showMailbox && (
                <MailView
                    playerState={playerStats}
                    onClose={() => setShowMailbox(false)}
                    onRefreshPlayer={() => loadPartyData()}
                />
            )}

            {/* Daily Quests Modal */}
            {showDailyQuests && (
                <DailyQuestView
                    playerState={playerStats}
                    onClose={() => setShowDailyQuests(false)}
                />
            )}

            {/* Tutorial System */}
            {showTutorial && (
                <TutorialSystem
                    playerState={playerStats}
                    onComplete={() => { }}
                    onReward={(rewards) => {
                        // Apply rewards
                        setPlayerStats(prev => ({
                            ...prev,
                            credits: prev.credits + (rewards.gold || 0),
                            exp: prev.exp + (rewards.exp || 0),
                            gems: prev.gems + (rewards.gems || 0)
                        }));
                    }}
                    isFirstTime={true}
                />
            )}

            {/* Settings Modal */}
            {showSettings && (
                <SettingsView onClose={() => setShowSettings(false)} />
            )}

            {/* Premium Modal */}
            {showPremium && (
                <PremiumView
                    playerState={playerStats}
                    onClose={() => setShowPremium(false)}
                    onRefreshPlayer={() => loadPartyData()}
                />
            )}

            {/* Battle Pass Modal */}
            {showBattlePass && (
                <BattlePassView
                    playerState={playerStats}
                    onClose={() => setShowBattlePass(false)}
                    onClaimReward={(tier, isPremium, reward) => {
                        if (reward.gold) setPlayerStats(prev => ({ ...prev, credits: prev.credits + reward.gold }));
                        if (reward.gems) setPlayerStats(prev => ({ ...prev, gems: prev.gems + reward.gems }));
                    }}
                    onPurchasePremium={() => {
                        setPlayerStats(prev => ({ ...prev, gems: prev.gems - 500 }));
                    }}
                />
            )}

            {/* Player Stats Modal */}
            {showPlayerStats && (
                <PlayerStatsView
                    playerState={playerStats}
                    onClose={() => setShowPlayerStats(false)}
                />
            )}

            {/* Boss Timer Modal */}
            {showBossTimer && (
                <BossTimerView
                    onClose={() => setShowBossTimer(false)}
                    playerLevel={playerStats.level}
                    onNavigate={(zoneId) => setActiveZone(zoneId)}
                />
            )}

            {/* Referral Modal */}
            {showReferral && (
                <ReferralView
                    playerState={playerStats}
                    onClose={() => setShowReferral(false)}
                    onClaimReward={(rewards) => {
                        if (rewards.gold) setPlayerStats(prev => ({ ...prev, credits: prev.credits + rewards.gold }));
                        if (rewards.gems) setPlayerStats(prev => ({ ...prev, gems: prev.gems + rewards.gems }));
                    }}
                />
            )}

            {/* Auction House Modal */}
            {showAuction && (
                <AuctionHouseView
                    playerState={playerStats}
                    onClose={() => setShowAuction(false)}
                    onBid={(listingId, amount) => {
                        // Deduct gold for bid (in real app, only when won)
                    }}
                    onBuyout={(listingId) => {
                        // Handle buyout purchase
                    }}
                    onCreateListing={(item, startPrice, buyoutPrice, duration) => {
                        // Remove item from inventory
                    }}
                />
            )}

            {/* World Map Modal */}
            {showWorldMap && (
                <WorldMapView
                    playerState={playerStats}
                    currentZoneId={activeZone || 1}
                    onClose={() => setShowWorldMap(false)}
                    onNavigate={(zoneId) => { setActiveZone(zoneId); setShowWorldMap(false); }}
                />
            )}

            {/* Controls Guide Modal */}
            {showControls && (
                <ControlsGuideView
                    onClose={() => setShowControls(false)}
                />
            )}

            {/* Mount System Modal */}
            {showMounts && (
                <MountSystemView
                    playerState={playerStats}
                    onClose={() => setShowMounts(false)}
                    onEquipMount={(mount) => {
                        // Apply speed bonus to player
                    }}
                    onPurchaseMount={(mount) => {
                        if (mount.gemPrice) {
                            setPlayerStats(prev => ({ ...prev, gems: prev.gems - (mount.gemPrice || 0) }));
                        } else if (mount.price) {
                            setPlayerStats(prev => ({ ...prev, credits: prev.credits - (mount.price || 0) }));
                        }
                    }}
                />
            )}
        </ErrorBoundary>
    );
};

export default GameDashboard;
