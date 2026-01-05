import React, { useState, useEffect, Suspense } from 'react';
import { ALL_MOUNTS, Mount } from './MountSystemView';
import { GameGuideModal } from './GameGuideModal';
import { AssetLoader } from '../utils/AssetLoader';
import { PlayerState, CharacterClass, Item, Equipment, Faction, Quest, Rank, WingItem, PetItem, HUDLayout, CraftingRecipe, DailyLoginState, Achievement, DailyLoginReward, Party, PartyMember, Guild, Trade } from '../types';
import { CLASSES, LEVEL_XP_REQUIREMENTS, FACTIONS, QUEST_DATA, ZONE_CONFIG, RANKS, MOCK_LEADERBOARD, WINGS_DATA, PETS_DATA, CLASS_BASE_STATS, DEFAULT_HUD_LAYOUT, CLASS_STARTER_ITEMS } from '../constants';
import { addExp, getExpForNextLevel } from '../utils/levelSystem';
import SkillTree from './SkillTree';
const ActiveZoneView = React.lazy(() => import('./ActiveZoneView')); // Lazy load to prevent immediate preload of assets
import { MarketView } from './MarketView';
import NpcShopView from './NpcShopView';
import { BlacksmithView } from './BlacksmithView';
import CraftingView from './CraftingView';
import RecipeCraftingView from './RecipeCraftingView';
import InventoryModal from './InventoryModal';
import { PixelWing, PixelUser, PixelBackpack, PixelShield, PixelQuest, PixelUsers, PixelHammer, PixelMap, PixelTrophy, PixelCart, PixelSwords, PixelBoots } from './ui/ItemIcons';
import { ItemTooltip } from './ui/ItemTooltip';
import { getItemDisplayData } from '../utils/ItemDisplayAdapter';
import { loadListings, getListings } from '../utils/marketSystem';
import { loadDailyStats, getAllDailyStats } from '../utils/dailyLeaderboard';
import { RankIcon } from './ui/RankIcon';
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
import { Environment, useGLTF, useProgress } from '@react-three/drei';

// --- ASSET PRELOAD LIST ---
// These are loaded AFTER character selection, during the loading screen
const PRELOAD_MODELS = [
    '/models/enemies/bosses/parrot%20bosses%20premium.gltf',
    '/models/enemies/bosses/armadillo%20bosses%20premium.gltf',
    '/models/enemies/bosses/axolotl%20bosses%20premium.gltf',
    '/models/enemies/bosses/cat%20bosses%20premium.gltf',
    '/models/enemies/bosses/crab%20bosses%20premium.gltf',
    '/models/enemies/bosses/penguin%20bosses%20premium.gltf',
    '/models/enemies/mobs/parrot%20normal.gltf',
    '/models/enemies/mobs/cat%20normal.gltf',
    '/models/enemies/mobs/cat%20medium.gltf',
    '/models/enemies/mobs/axolotl%20normal.gltf',
    '/models/enemies/mobs/axolotl%20medium.gltf',
];
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
import { PixelGoldUser } from './ui/PixelVip';
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

const TabButton = ({ id, icon: Icon, pixelIcon, label, activeTab, onClick }: any) => (
    <button onClick={() => onClick(id)} className={`w-full p-3 rounded-lg flex flex-col md:flex-row items-center gap-3 transition-all ${activeTab === id ? 'bg-yellow-900/40 border border-yellow-700 text-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.2)]' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'}`}>
        {pixelIcon ? (
            <div className={`w-5 h-5 ${activeTab === id ? 'animate-pulse' : ''}`}>{pixelIcon}</div>
        ) : (
            <Icon size={20} className={activeTab === id ? 'animate-pulse' : ''} />
        )}
        <span className={`text-xs md:text-sm font-bold hidden md:block ${activeTab === id ? 'text-yellow-100' : ''}`}>{label}</span>
    </button>
);

import { monitor } from '../utils/diagnostics/PerformanceMonitor';

// ... (existing imports)

const GameDashboard: React.FC<GameDashboardProps> = ({ nickname, charClass, faction, isAdmin = false, onLogout, characterId }) => {
    // START PERFORMANCE MONITOR ON MOUNT
    useEffect(() => {
        monitor.start();
        monitor.setStage("GameDashboard");

        // Expose global command for manual check
        (window as any).perfReport = () => monitor.stopAndGenerateReport();

        return () => {
            monitor.stopAndGenerateReport(); // Auto-report on exit
        };
    }, []);

    // ... (rest of component)
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
    const [showReferral, setShowReferral] = useState(false);
    const [showWorldMap, setShowWorldMap] = useState(false);
    // Mount & Companion System
    const [companionTab, setCompanionTab] = useState<'pets' | 'mounts'>('pets');
    const [ownedMounts, setOwnedMounts] = useState<string[]>(() => {
        const saved = localStorage.getItem('ownedMounts');
        return saved ? JSON.parse(saved) : ['horse_brown'];
    });
    const [equippedMount, setEquippedMount] = useState<string | null>(() => {
        return localStorage.getItem('equippedMount') || null;
    });

    useEffect(() => {
        localStorage.setItem('ownedMounts', JSON.stringify(ownedMounts));
        if (equippedMount) localStorage.setItem('equippedMount', equippedMount);
        else localStorage.removeItem('equippedMount');
    }, [ownedMounts, equippedMount]);

    // Boss Spawn Notification
    const [bossNotification, setBossNotification] = useState<{ bossName: string; zoneName: string; zoneId: number } | null>(null);

    const { shouldShow: showTutorial } = useTutorial();
    const { progress } = useProgress();
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

    // Boss Spawn Simulation (Special Bosses - every 3 hours)
    useEffect(() => {
        const bosses = [
            { bossName: 'Ateş Ejderhası', zoneName: 'Volkan Dağı', zoneId: 15 },
            { bossName: 'Buz Devi', zoneName: 'Donmuş Ovalar', zoneId: 16 },
            { bossName: 'Gölge Lordu', zoneName: 'Karanlık Orman', zoneId: 14 },
            { bossName: 'Taş Golem', zoneName: 'Kayalık Geçit', zoneId: 13 },
        ];

        const spawnBoss = () => {
            const randomBoss = bosses[Math.floor(Math.random() * bosses.length)];
            setBossNotification(randomBoss);

            // Auto-hide after 5 seconds
            setTimeout(() => setBossNotification(null), 5000);
        };

        // Spawn first boss after 30 seconds (for testing), then every 3 hours
        const initialTimer = setTimeout(spawnBoss, 30000);
        const interval = setInterval(spawnBoss, 10800000); // 3 hours = 3 * 60 * 60 * 1000

        return () => {
            clearTimeout(initialTimer);
            clearInterval(interval);
        };
    }, []);

    /* INITIAL STATE & HELPERS PLACEHOLDER */
    // --- ITEM GENERATOR SYSTEM ---
    const generateRandomStats = (type: Item['type'], tier: number, rarity: Item['rarity'], charClass: CharacterClass): any => {
        const isWeapon = type === 'weapon';
        const isArmor = ['armor', 'helmet', 'pants', 'boots'].includes(type);
        const isAccessory = ['necklace', 'earring'].includes(type);

        const stats: any = {};
        const multiplier = tier * (rarity === 'legendary' ? 1.5 : rarity === 'epic' ? 1.3 : 1.0);

        // Base Stats
        if (isWeapon) stats.damage = Math.floor(50 * multiplier) + Math.floor(Math.random() * 20);
        if (isArmor) {
            stats.defense = Math.floor(20 * multiplier) + Math.floor(Math.random() * 10);
            stats.hp = Math.floor(100 * multiplier);
        }
        if (isAccessory) {
            stats.hp = Math.floor(50 * multiplier);
            stats.mana = Math.floor(30 * multiplier);
        }

        // Random Attribute Bonuses (STR, DEX, INT, VIT)
        const bonusCount = rarity === 'legendary' ? 4 : rarity === 'epic' ? 3 : rarity === 'rare' ? 2 : 1;
        const attributes = ['strength', 'dexterity', 'intelligence', 'vitality'];

        // Class Bias (Warrior gets STR, Mage gets INT etc.)
        let primaryAttr = 'strength';
        if (['archmage', 'bard', 'cleric'].includes(charClass)) primaryAttr = 'intelligence';
        if (['archer', 'gale_glaive', 'reaper'].includes(charClass)) primaryAttr = 'dexterity';

        // Ensure primary stat is present for high tier items
        if (Math.random() > 0.3) {
            stats[primaryAttr] = Math.floor(10 * multiplier) + Math.floor(Math.random() * 10);
        }

        for (let i = 0; i < bonusCount; i++) {
            const attr = attributes[Math.floor(Math.random() * attributes.length)];
            const currentVal = stats[attr] || 0;
            stats[attr] = currentVal + Math.floor(5 * multiplier) + Math.floor(Math.random() * 5);
        }

        // Crit / Speed for high tiers
        if (tier >= 3 && Math.random() < 0.3) stats.critChance = Math.floor(Math.random() * 5) + 1;
        if (tier >= 4 && Math.random() < 0.2) stats.attackSpeed = Math.floor(Math.random() * 5) + 1;

        return stats;
    };

    const getClassStarterItems = (cClass: CharacterClass): Item[] => {
        const common: Item[] = [
            { id: uuidv4(), name: 'Ekmek', tier: 1, type: 'consumable', rarity: 'common', value: 50, plus: 0 },
            { id: uuidv4(), name: 'Can İksiri (Küçük)', tier: 1, type: 'consumable', rarity: 'common', value: 50, plus: 0 },
            { id: uuidv4(), name: 'Mana İksiri (Küçük)', tier: 1, type: 'consumable', rarity: 'common', value: 50, plus: 0 },
            { id: uuidv4(), name: 'Kutsal Parşömen', tier: 1, type: 'upgrade_scroll' as any, rarity: 'rare', value: 1000, plus: 0 }
        ];
        const starters = CLASS_STARTER_ITEMS[cClass] || [];
        // Add minimal stats to starters
        const startersWithIds = starters.map(item => ({
            ...item,
            id: uuidv4(),
            plus: 0,
            stats: generateRandomStats(item.type, 1, 'common', cClass)
        }));
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
            // ADMIN / TEST BUILDER
            const adminInventory: Item[] = [];

            // 1. All Upgrade Scrolls (x10 each)
            for (let i = 0; i < 10; i++) {
                adminInventory.push({ id: uuidv4(), name: 'Kutsal Parşömen', tier: 1, type: 'upgrade_scroll' as any, rarity: 'rare', value: 1000, plus: 0 });
                adminInventory.push({ id: uuidv4(), name: 'Kadim Parşömen', tier: 2, type: 'upgrade_scroll' as any, rarity: 'epic', value: 5000, plus: 0 });
                adminInventory.push({ id: uuidv4(), name: 'Efsanevi Parşömen', tier: 3, type: 'upgrade_scroll' as any, rarity: 'legendary', value: 20000, plus: 0 });
            }

            // 2. Test Weapons (Different Types, +0 and +7)
            const weaponTypes = [
                { name: 'Acemi Kılıcı', tier: 1 },
                { name: 'Savaşçı Baltası', tier: 2 },
                { name: 'Kraliyet Kılıcı', tier: 3 },
                { name: 'Ejderha Mızrağı', tier: 4 }
            ];
            weaponTypes.forEach(w => {
                // +0 Version
                adminInventory.push({
                    id: uuidv4(), name: w.name, tier: w.tier,
                    type: 'weapon', rarity: 'rare',
                    value: 1000 * w.tier, plus: 0,
                    stats: generateRandomStats('weapon', w.tier, 'rare', charClass)
                });
            });

            // 3. FULL SET OF +12 ITEMS For Testing
            const setTypes: Item['type'][] = ['helmet', 'armor', 'pants', 'boots', 'necklace', 'earring'];
            setTypes.forEach(t => {
                adminInventory.push({
                    id: uuidv4(), name: `GOD ${t.toUpperCase()}`, tier: 5,
                    type: t, rarity: 'ancient',
                    value: 999999, plus: 12, // +12 Requested!
                    stats: generateRandomStats(t, 5, 'ancient', charClass)
                });
            });

            // 4. Starter +12 Item (The God Slayer)
            const godWeapon: Item = {
                id: uuidv4(), name: 'GOD SLAYER TESTER', tier: 5,
                type: 'weapon', rarity: 'ancient',
                value: 999999, plus: 12,
                stats: {
                    damage: 9999,
                    strength: 999,
                    dexterity: 999,
                    intelligence: 999,
                    vitality: 999,
                    critChance: 100,
                    attackSpeed: 50
                }
            };
            adminInventory.push(godWeapon); // Add to inventory too

            return {
                nickname: `[GM] ${nickname}`, class: charClass, faction: faction, guildName: 'YÖNETİM',
                level: 30, exp: LEVEL_XP_REQUIREMENTS[29], maxExp: LEVEL_XP_REQUIREMENTS[29],
                credits: 99000000, gems: 99000000, diamonds: 999999, donateCoins: 999999, honor: 500000000, dailyHonor: 0, dailyAdsWatched: 0, rankPoints: 500000000, rank: 19,
                vipUntil: Date.now() + (365 * 24 * 60 * 60 * 1000), // 1 Year VIP
                questStage: 10, hp: 99999, maxHp: 99999, mana: 99999, maxMana: 99999, damage: 9999, defense: 9999,
                strength: baseStats.str + 500, dexterity: baseStats.dex + 500, intelligence: baseStats.int + 500, vitality: baseStats.vit + 500, statPoints: 100,
                inventory: adminInventory,
                equipment: { weapon: godWeapon, armor: null, helmet: null, pants: null, boots: null, necklace: null, earring: null },
                ownedWings: WINGS_DATA, equippedWing: WINGS_DATA[4], ownedPets: PETS_DATA, equippedPet: PETS_DATA[4], ownedSpeedPets: [], equippedSpeedPet: null,
                ownedSkins: [], equippedSkin: null, ownedCostumes: ['costume_carnivoret'], equippedCostume: 'costume_carnivoret', activeQuest: null, settings: defaultSettings,
                dailyLogin: { lastLoginDate: '', consecutiveDays: 0, claimedToday: false, totalLogins: 0 },
                achievements: DEFAULT_ACHIEVEMENTS
            };
        }

        // Create initial quest from QUEST_DATA
        const initialQuest: Quest = {
            id: 1,
            title: QUEST_DATA[1]?.title || 'Acemi Eğitimi',
            description: QUEST_DATA[1]?.description || '2 Düşman yok et.',
            requiredCount: QUEST_DATA[1]?.requiredCount || 2,
            currentCount: 0,
            rewardGold: QUEST_DATA[1]?.rewardGold || 100,
            rewardXp: QUEST_DATA[1]?.rewardXp || 500,
            rewardHonor: QUEST_DATA[1]?.rewardHonor || 50,
            rewardGems: (QUEST_DATA[1] as any)?.rewardGems || 0,
            isCompleted: false
        };

        return {
            nickname, class: charClass, faction: faction, guildName: null,
            level: 1, exp: 0, maxExp: LEVEL_XP_REQUIREMENTS[2], credits: 500, gems: 10, diamonds: 0, donateCoins: 0, honor: 0, dailyHonor: 0, dailyAdsWatched: 0, rankPoints: 0, rank: 0,
            questStage: 1, hp: baseStats.vit * 10, maxHp: baseStats.vit * 10, mana: baseStats.int * 20, maxMana: baseStats.int * 20,
            damage: baseStats.str * 2, defense: baseStats.vit,
            strength: baseStats.str, dexterity: baseStats.dex, intelligence: baseStats.int, vitality: baseStats.vit, statPoints: 0,
            inventory: getClassStarterItems(charClass), equipment: { weapon: null, armor: null, helmet: null, pants: null, boots: null, necklace: null, earring: null },
            ownedWings: [], equippedWing: null, ownedPets: [], equippedPet: null, ownedSpeedPets: [], equippedSpeedPet: null,
            ownedSkins: [], equippedSkin: null, ownedCostumes: [], equippedCostume: null,
            activeQuest: initialQuest, // Start with first quest
            settings: defaultSettings,
            dailyLogin: { lastLoginDate: '', consecutiveDays: 0, claimedToday: false, totalLogins: 0 },
            achievements: DEFAULT_ACHIEVEMENTS.map(a => ({ ...a }))
        };
    };

    const [playerStats, setPlayerStats] = useState<PlayerState>(getInitialState());
    const [activeTab, setActiveTab] = useState<string>('character');
    const [marketSubTab, setMarketSubTab] = useState<'npc' | 'player' | 'premium'>('npc');
    const [showMarket, setShowMarket] = useState(false);

    // --- PERSISTENCE LOGIC ---
    useEffect(() => {
        // Load persist data on mount
        const savedListings = localStorage.getItem('market_listings');
        if (savedListings) {
            try { loadListings(JSON.parse(savedListings)); } catch (e) { console.error('Load listings fail', e); }
        }

        const savedDailyStats = localStorage.getItem('daily_rank_stats');
        if (savedDailyStats) {
            try { loadDailyStats(JSON.parse(savedDailyStats)); } catch (e) { console.error('Load stats fail', e); }
        }

        // Save on basic interactions (using unload event primarily)
        const handleBeforeUnload = () => {
            localStorage.setItem('market_listings', JSON.stringify(getListings()));
            localStorage.setItem('daily_rank_stats', JSON.stringify(getAllDailyStats()));
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, []);

    // Periodic Save (Safety)
    useEffect(() => {
        const timer = setInterval(() => {
            localStorage.setItem('market_listings', JSON.stringify(getListings()));
            localStorage.setItem('daily_rank_stats', JSON.stringify(getAllDailyStats()));
        }, 10000); // 10 sec autosave
        return () => clearInterval(timer);
    }, []);

    // --- LOAD DATA ---
    useEffect(() => {
        const loadCharacterData = async () => {
            // FIRE ASSET PRELOADS IMMEDIATELY
            console.log("🚀 Starting Asset Preload (Background)...");
            PRELOAD_MODELS.forEach(path => useGLTF.preload(path));

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

                        // Eğer activeQuest null ise, questStage'e göre görev ata
                        if (!loadedState.activeQuest && QUEST_DATA[loadedState.questStage || 1]) {
                            const questData = QUEST_DATA[loadedState.questStage || 1];
                            loadedState.activeQuest = {
                                id: `quest_${loadedState.questStage || 1}`,
                                title: questData.title || 'Görev',
                                description: questData.description || '',
                                target: 'mob',
                                requiredCount: questData.requiredCount || 5,
                                currentCount: 0,
                                rewardGold: questData.rewardGold || 100,
                                rewardXp: questData.rewardXp || 1000,
                                rewardHonor: questData.rewardHonor || 50,
                                rewardGems: (questData as any).rewardGems || 0,
                                isCompleted: false
                            };
                        }

                        setPlayerStats(recalculateStats(loadedState));
                    }
                } catch (err) { console.error("Load failed:", err); } finally { setLoading(false); }
            } else {
                // Creating new character, just fake a small wait for assets
                setTimeout(() => setLoading(false), 800);
            }
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

            // Use levelSystem for EXP/Level calculation
            const expResult = addExp(prev.exp, prev.level, xp);

            // Play level up sound for each level gained
            if (expResult.didLevelUp) {
                for (let i = 0; i < expResult.levelsGained; i++) {
                    soundManager.playSFX('level_up');
                }
            }

            // Calculate new honor
            const newHonor = prev.honor + honor;
            const newDailyHonor = (prev.dailyHonor || 0) + honor;

            // RANK RECALCULATION based on honor
            let newRank = prev.rank;
            for (let i = RANKS.length - 1; i >= 0; i--) {
                if (newHonor >= RANKS[i].minRP) {
                    newRank = RANKS[i].id;
                    break;
                }
            }

            return {
                ...prev,
                credits: prev.credits + gold,
                exp: expResult.newExp,
                level: expResult.newLevel,
                statPoints: prev.statPoints + expResult.statPointsGained,
                maxExp: getExpForNextLevel(expResult.newLevel),
                honor: newHonor,
                dailyHonor: newDailyHonor,
                rank: newRank,
                inventory: newInv
            };
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

    // Quest Progress Handler - tracks kills and checks completion
    const handleQuestProgress = (enemyName?: string) => {
        setPlayerStats(prev => {
            const currentStage = prev.questStage || 1;
            const questData = QUEST_DATA[currentStage];
            if (!questData) return prev; // No more quests

            // Get current progress (use activeQuest or create from QUEST_DATA)
            const currentQuest: Quest = prev.activeQuest || {
                id: `quest_${currentStage}`,
                title: questData.title || '',
                description: questData.description || '',
                targetEnemyName: '',  // Any enemy counts
                requiredCount: questData.requiredCount || 10,
                currentCount: 0,
                rewardGold: questData.rewardGold || 0,
                rewardXp: questData.rewardXp || 0,
                rewardHonor: questData.rewardHonor || 0,
                isCompleted: false
            };

            // Increment progress
            const newCount = currentQuest.currentCount + 1;
            const isComplete = newCount >= currentQuest.requiredCount;

            return {
                ...prev,
                activeQuest: {
                    ...currentQuest,
                    currentCount: newCount,
                    isCompleted: isComplete
                }
            };
        });
    };

    // Claim Quest Reward Handler
    const handleClaimQuest = () => {
        setPlayerStats(prev => {
            if (!prev.activeQuest?.isCompleted) return prev;

            const reward = prev.activeQuest;
            const nextStage = (prev.questStage || 1) + 1;
            const nextQuestData = QUEST_DATA[nextStage];

            // Grant rewards
            let newExp = prev.exp + (reward.rewardXp || 0);
            let newCredits = prev.credits + (reward.rewardGold || 0);
            let newHonor = prev.honor + (reward.rewardHonor || 0);
            let newLevel = prev.level;
            let newStatPoints = prev.statPoints;
            let newMaxExp = prev.maxExp;

            // Check level up from quest XP
            while (newLevel < 30 && newExp >= LEVEL_XP_REQUIREMENTS[newLevel + 1]) {
                newLevel++;
                newStatPoints += 5;
                newMaxExp = LEVEL_XP_REQUIREMENTS[newLevel + 1] || LEVEL_XP_REQUIREMENTS[30];
                soundManager.playSFX('level_up');
            }

            // Recalculate rank with new honor
            let newRank = prev.rank;
            for (let i = RANKS.length - 1; i >= 0; i--) {
                if (newHonor >= RANKS[i].minRP) {
                    newRank = RANKS[i].id;
                    break;
                }
            }

            // Setup next quest or null if done
            const nextQuest: Quest | null = nextQuestData ? {
                id: `quest_${nextStage}`,
                title: nextQuestData.title || '',
                description: nextQuestData.description || '',
                targetEnemyName: '',
                requiredCount: nextQuestData.requiredCount || 10,
                currentCount: 0,
                rewardGold: nextQuestData.rewardGold || 0,
                rewardXp: nextQuestData.rewardXp || 0,
                rewardHonor: nextQuestData.rewardHonor || 0,
                isCompleted: false
            } : null;

            soundManager.playSFX('quest_complete');

            return {
                ...prev,
                exp: newExp,
                level: newLevel,
                statPoints: newStatPoints,
                maxExp: newMaxExp,
                credits: newCredits,
                honor: newHonor,
                rank: newRank,
                questStage: nextStage,
                activeQuest: nextQuest
            };
        });
    };

    // NOT: Early return kullanmıyoruz çünkü React Hook kurallarını ihlal eder (Error #310)
    // Bunun yerine aşağıda conditional rendering kullanıyoruz

    // --- PREMIUM LOADING SCREEN ---
    const GAME_TIPS = [
        "💡 İPUCU: Demirci'de eşyalarını güçlendirebilirsin, ancak +7'den sonra eşyan yanabilir!",
        "💡 İPUCU: Boss savaşlarında kırmızı alanlardan kaçmayı unutma!",
        "💡 İPUCU: Arkadaşlarını partiye davet ederek daha fazla deneyim puanı kazanabilirsin.",
        "💡 İPUCU: Nadir eşyalar sadece Boss sandıklarından düşer.",
        "💡 İPUCU: Pazar alanında diğer oyuncularla ticaret yapabilirsin.",
        "💡 İPUCU: 'Test Modu' ile girdiysen sunucu özellikleri sınırlı olabilir.",
    ];
    const [currentTip, setCurrentTip] = useState(0);

    // Rotate tips
    useEffect(() => {
        if (!loading && !activeZone) return; // Only run if needed
        const interval = setInterval(() => {
            setCurrentTip(prev => (prev + 1) % GAME_TIPS.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [loading, activeZone]);

    const loadingScreen = (
        <div className="h-full w-full flex flex-col items-center justify-center relative overflow-hidden">
            {/* Full-screen fixed background image */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: "url('/images/loading_bg.jpg')" }}
            />
            {/* Dark overlay for readability */}
            <div className="absolute inset-0 bg-black/60" />

            {/* Central Content */}
            <div className="relative z-10 flex flex-col items-center text-center max-w-lg px-4">
                {/* Logo / Icon Area */}
                <div className="mb-8 relative">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-yellow-600 to-amber-800 animate-spin-slow flex items-center justify-center shadow-[0_0_50px_rgba(234,179,8,0.3)]">
                        <div className="w-28 h-28 rounded-full bg-slate-950 flex items-center justify-center">
                            <span className="text-4xl">⚔️</span>
                        </div>
                    </div>
                    {/* Pulsing Ring */}
                    <div className="absolute inset-0 rounded-full border-2 border-yellow-500/30 animate-ping"></div>
                </div>

                <h2 className="text-3xl rpg-font text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-500 to-yellow-200 mb-2 tracking-wider">
                    KADİM EVREN
                </h2>
                <div className="text-yellow-500/60 text-xs uppercase tracking-[0.3em] mb-12">
                    {progress === 100 ? "Dünya Hazırlanıyor..." : "Varlıklar Yükleniyor..."}
                </div>

                {/* Progress Bar Container */}
                <div className="w-full relative group">
                    <div className="flex justify-between text-xs text-yellow-500/80 mb-2 font-mono">
                        <span>Veri Senkronizasyonu</span>
                        <span>%{Math.round(progress)}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-900 rounded-full border border-slate-700/50 overflow-hidden relative shadow-inner">
                        <div
                            className="h-full bg-gradient-to-r from-yellow-900 via-yellow-600 to-yellow-400 transition-all duration-300 ease-out relative"
                            style={{ width: `${Math.max(5, progress)}%` }}
                        >
                            {/* Shine Effect */}
                            <div className="absolute top-0 right-0 bottom-0 w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent transform translate-x-full animate-shimmer"></div>
                        </div>
                    </div>
                </div>

                {/* Tip Box */}
                <div className="mt-12 min-h-[60px] flex items-center justify-center">
                    <p className="text-slate-400 text-sm italic transition-opacity duration-500 animate-fade-in-up">
                        {GAME_TIPS[currentTip]}
                    </p>
                </div>
            </div>

            {/* Version / Info Footer */}
            <div className="absolute bottom-4 text-[10px] text-slate-600 font-mono">
                v1.2.0-beta • Assets by Kenney & Google Poly
            </div>
        </div>
    );

    // ActiveZone görünümü - Ana return içinde koşullu olarak gösterilecek
    // SAFETY: Ensure playerStats has all required fields before rendering 3D
    const safePlayerStats = {
        ...playerStats,
        inventory: playerStats.inventory || [],
        equipment: playerStats.equipment || { weapon: null, armor: null, helmet: null, pants: null, boots: null, necklace: null, earring: null },
        ownedWings: playerStats.ownedWings || [],
        ownedPets: playerStats.ownedPets || [],
        achievements: playerStats.achievements || [],
        settings: playerStats.settings || { pvpPriority: false, showNames: true, deviceMode: 'auto', skillBarMode: 'linear', hudScale: 1.0, buttonOpacity: 1.0, transparentMap: false, smallMap: false, minimizeQuest: false, hudLayout: null, nameColor: undefined, autoLoot: true }
    };

    const activeZoneScreen = activeZone ? (
        <div className="relative w-full h-full">
            <ErrorBoundary>
                <Suspense fallback={loadingScreen}>
                    <ActiveZoneView
                        zoneId={activeZone}
                        playerState={safePlayerStats}
                        chatHistory={messages || []}
                        onSendChat={(msg) => handleSendMessage(msg, 'global')}
                        onReceiveChat={(msg) => setMessages(prev => [...prev, msg])}
                        onExit={() => { onLogout(); }}
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
                        onOpenMarket={() => setShowMarket(true)}
                        isAdmin={isAdmin}
                    />
                </Suspense>
            </ErrorBoundary>

            {/* Market View Overlay */}
            {showMarket && (
                <MarketView
                    playerState={playerStats}
                    onClose={() => setShowMarket(false)}
                    onUpdatePlayer={(updates) => setPlayerStats(prev => ({ ...prev, ...updates }))}
                />
            )}

            {/* Trade Modal Overlay */}
            {activeTrade && (
                <TradeView
                    trade={activeTrade}
                    playerState={safePlayerStats}
                    onAddItem={handleAddTradeItem}
                    onSetGold={handleSetTradeGold}
                    onConfirm={handleConfirmTrade}
                    onCancel={handleCancelTrade}
                    onClose={() => handleCancelTrade()}
                />
            )}

            {showCrafting && <RecipeCraftingView playerState={safePlayerStats} onCraft={() => { }} onClose={() => setShowCrafting(false)} />}
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
                <header className="h-20 border-b border-slate-800 bg-slate-900/90 backdrop-blur flex items-center justify-between px-2 md:px-4 sticky top-0 z-50">
                    {/* Sol: Karakter Bilgisi + Para + Rütbe */}
                    {/* Sol: Premium Profile HUD Style */}
                    <div className="flex items-center gap-2 md:gap-4">
                        {/* Level Badge - Gold Frame */}
                        <div className="relative w-12 h-12 md:w-14 md:h-14 flex-shrink-0">
                            <div className="absolute inset-0 bg-slate-900 rounded-full border-[3px] border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.4)] flex items-center justify-center overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-b from-slate-800 to-black" />
                                <div className="absolute top-0 w-full h-1/2 bg-white/5 rounded-t-full" />
                                <span className="relative z-10 text-lg md:text-xl font-black text-white font-serif drop-shadow-md">{playerStats.level}</span>
                            </div>
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-yellow-600 border border-yellow-400 text-white text-[8px] font-bold px-1.5 rounded shadow-sm">LVL</div>
                        </div>

                        {/* Profile Info & Bars */}
                        <div className="flex flex-col gap-0.5 w-28 md:w-72 transition-all">
                            {/* Name & Rank */}
                            <div className="flex items-center justify-between gap-1">
                                <div className="flex items-center gap-1 min-w-0 flex-1 overflow-hidden">
                                    {isAdmin && <span className="text-white font-bold text-[8px] shrink-0">[GM]</span>}
                                    <span className={`text-[10px] md:text-xs font-bold tracking-wide truncate ${(playerStats.vipUntil || 0) > Date.now() ? 'text-yellow-400 font-extrabold drop-shadow-[0_0_5px_rgba(234,179,8,0.5)]' : 'text-slate-200'}`}>
                                        {playerStats.nickname}
                                    </span>
                                    {(playerStats.vipUntil || 0) > Date.now() && <div className="text-red-500 drop-shadow-md shrink-0"><Crown size={10} fill="currentColor" /></div>}
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                    <RankIcon rank={playerStats.rank || 1} size="sm" />
                                    <span className="text-[8px] md:text-[9px] text-amber-400 font-bold uppercase tracking-wide truncate max-w-[60px] md:max-w-none">{RANKS.find(r => r.id === (playerStats.rank || 1))?.title || 'Acemi'}</span>
                                </div>
                            </div>

                            {/* HP BAR */}
                            <div className="relative h-2.5 md:h-3 w-full bg-black/60 rounded-sm border border-slate-600/50 overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-red-800 via-red-600 to-red-500 relative" style={{ width: `${(playerStats.hp / playerStats.maxHp) * 100}%` }}>
                                    <div className="absolute top-0 left-0 w-full h-[1px] bg-red-400/50" />
                                    <div className="absolute bottom-0 left-0 w-full h-[1px] bg-red-900/50" />
                                </div>
                                <span className="absolute inset-0 flex items-center justify-center text-[7px] md:text-[8px] font-bold text-white drop-shadow-[0_1px_1px_rgba(0,0,0,1)] tracking-wider z-10">
                                    {playerStats.hp} / {playerStats.maxHp}
                                </span>
                            </div>

                            {/* MP BAR */}
                            <div className="relative h-2 w-full bg-black/60 rounded-sm border border-slate-600/50 overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-blue-800 via-blue-600 to-blue-500 relative" style={{ width: `${(playerStats.mana / playerStats.maxMana) * 100}%` }}>
                                    <div className="absolute top-0 left-0 w-full h-[1px] bg-blue-400/50" />
                                </div>
                                <span className="absolute inset-0 flex items-center justify-center text-[7px] font-bold text-white drop-shadow-[0_1px_1px_rgba(0,0,0,1)] tracking-wider z-10">
                                    {playerStats.mana}
                                </span>
                            </div>
                        </div>

                        {/* Currencies */}
                        <div className="hidden md:flex items-center gap-2 ml-4 border-l border-slate-700 pl-4 h-8">
                            <div className="flex items-center gap-2 text-yellow-400 bg-yellow-900/20 px-2 py-1 rounded-full border border-yellow-800/50 hover:bg-yellow-900/30 transition-colors cursor-help" title="Altın"><DollarSign size={12} /><span className="font-bold text-xs">{playerStats.credits.toLocaleString()}</span></div>
                            <div className="flex items-center gap-2 text-purple-400 bg-purple-900/20 px-2 py-1 rounded-full border border-purple-800/50 hover:bg-purple-900/30 transition-colors cursor-help" title="Kristal"><Gem size={12} /><span className="font-bold text-xs">{playerStats.gems.toLocaleString()}</span></div>
                            <div className="flex items-center gap-2 text-orange-400 bg-orange-900/20 px-2 py-1 rounded-full border border-orange-800/50 hover:bg-orange-900/30 transition-colors cursor-help" title="Onur Puanı"><Medal size={12} /><span className="font-bold text-xs">{playerStats.honor.toLocaleString()}</span></div>
                        </div>
                    </div>

                    {/* Orta bölüm temizlendi */}

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
                    <aside className="hidden md:flex w-20 md:w-64 bg-slate-900 border-r border-slate-800 flex-col py-6 gap-2 px-2 md:px-4 overflow-hidden">
                        <nav className="flex flex-col gap-2 h-full overflow-y-auto pr-1 custom-scrollbar">
                            <button onClick={() => setActiveZone(startingMap || 11)} className="w-full p-3 rounded-lg flex flex-col md:flex-row items-center gap-3 transition-all text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent">
                                <Swords size={20} className="text-red-500" /><span className="text-xs md:text-sm font-bold hidden md:block">OYUNA GİR</span>
                            </button>
                            <TabButton id="character" icon={User} label="Karakter" activeTab={activeTab} onClick={setActiveTab} />
                            <TabButton id="inventory" icon={Backpack} label="Envanter" activeTab={activeTab} onClick={setActiveTab} />
                            <TabButton id="skills" icon={Zap} label="Yetenekler" activeTab={activeTab} onClick={setActiveTab} />
                            <TabButton id="quests" icon={Scroll} label="Görevler" activeTab={activeTab} onClick={setActiveTab} />
                            <TabButton id="party" icon={Users} label="Parti" activeTab={activeTab} onClick={setActiveTab} />
                            <TabButton id="guild" icon={Shield} label="Lonca" activeTab={activeTab} onClick={setActiveTab} />
                            <TabButton id="market" icon={ShoppingBag} label="Pazar" activeTab={activeTab} onClick={setActiveTab} />
                            <TabButton id="blacksmith" icon={Hammer} label="Demirci" activeTab={activeTab} onClick={setActiveTab} />
                            <TabButton id="map" icon={MapIcon} label="Harita" activeTab={activeTab} onClick={setActiveTab} />
                            <TabButton id="leaderboard" icon={Trophy} label="Sıralama" activeTab={activeTab} onClick={setActiveTab} />
                        </nav>
                    </aside>

                    <main className="flex-1 bg-slate-950 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
                        {activeTab === 'character' && (
                            <div className="max-w-7xl mx-auto animate-fadeIn">
                                {/* TWO-COLUMN LAYOUT: Fixed Left + Flex Right */}
                                {/* TWO-COLUMN LAYOUT: Mobile Stack / PC Row */}
                                <div className="flex flex-col lg:flex-row gap-4 h-full">

                                    {/* ═══════════════════════════════════════════════════════════════ */}
                                    {/* ═══════════════════════════════════════════════════════════════ */}
                                    {/* LEFT COLUMN - IDENTITY PANEL (Responsive Width) */}
                                    {/* ═══════════════════════════════════════════════════════════════ */}
                                    <div className="w-full lg:w-[340px] flex-shrink-0 bg-gradient-to-b from-slate-900/95 to-slate-950 rounded-xl border border-purple-900/30 shadow-2xl overflow-hidden relative group">
                                        {/* Noise Texture Overlay */}
                                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
                                        {/* Top Accent Bar */}
                                        <div className="h-1 bg-gradient-to-r from-purple-600 via-yellow-500 to-purple-600"></div>

                                        {/* Header: Name + Rank */}
                                        <div className="p-3 text-center border-b border-purple-900/30 bg-gradient-to-b from-purple-950/50 to-transparent">
                                            <h2 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200 tracking-wide uppercase">{playerStats.nickname}</h2>
                                            <div className="text-[10px] text-purple-400 font-bold tracking-wider mt-0.5">{RANKS[playerStats.rank]?.title || 'Maceracı'}</div>
                                        </div>

                                        {/* 3D Character Preview */}
                                        <div className="w-full h-[260px] relative bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-950/30 to-slate-950">
                                            <Canvas shadows camera={{ position: [0, 2, 5], fov: 45 }} dpr={Math.min(window.devicePixelRatio, 1.5)} gl={{ antialias: false, powerPreference: 'high-performance' }}>
                                                <ambientLight intensity={0.6} />
                                                <spotLight position={[5, 10, 5]} angle={0.5} penumbra={1} intensity={2} castShadow color="#ffedd5" />
                                                <pointLight position={[-5, 5, -5]} intensity={0.5} color="#3b82f6" />
                                                <Suspense fallback={null}>
                                                    <VoxelSpartan
                                                        charClass={playerStats.class}
                                                        rotation={[0, 0, 0]}
                                                        isMoving={false}
                                                        isAttacking={false}
                                                        weaponItem={playerStats.equipment.weapon}
                                                        helmetItem={playerStats.equipment.helmet}
                                                        armorItem={playerStats.equipment.armor}
                                                        pantsItem={playerStats.equipment.pants}
                                                        wingType={playerStats.equippedWing}
                                                        petType={playerStats.equippedPet}
                                                        skinId={playerStats.equippedSkin}
                                                        costumeId={playerStats.equippedCostume}
                                                    />
                                                </Suspense>
                                                <Environment preset="city" />
                                            </Canvas>

                                            {/* Level Badge */}
                                            <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur px-3 py-1 rounded-full border border-yellow-500/30 text-xs text-white">
                                                Lv <span className="text-yellow-400 font-bold text-sm">{playerStats.level}</span>
                                            </div>
                                            <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
                                                <RankIcon rank={playerStats.rank} size="sm" />
                                            </div>
                                        </div>

                                        {/* HP/MP Bars */}
                                        <div className="p-3 bg-slate-950/80 border-t border-purple-900/30 space-y-2">
                                            {/* HP */}
                                            <div className="bg-slate-900/50 p-2 rounded border border-red-900/30">
                                                <div className="flex items-center justify-between text-[10px] mb-1">
                                                    <span className="text-red-400 font-bold flex items-center gap-1"><Heart size={10} /> HP</span>
                                                    <span className="text-slate-400">{playerStats.hp}/{playerStats.maxHp}</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-red-950 rounded-full overflow-hidden">
                                                    <div className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full" style={{ width: `${(playerStats.hp / playerStats.maxHp) * 100}%` }}></div>
                                                </div>
                                            </div>
                                            {/* MP */}
                                            <div className="bg-slate-900/50 p-2 rounded border border-blue-900/30">
                                                <div className="flex items-center justify-between text-[10px] mb-1">
                                                    <span className="text-blue-400 font-bold flex items-center gap-1"><Zap size={10} /> MP</span>
                                                    <span className="text-slate-400">{playerStats.mana}/{playerStats.maxMana}</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-blue-950 rounded-full overflow-hidden">
                                                    <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full" style={{ width: `${(playerStats.mana / playerStats.maxMana) * 100}%` }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ═══════════════════════════════════════════════════════════════ */}
                                    {/* RIGHT COLUMN - FLEX (Stats Compact + Companions Large) */}
                                    {/* ═══════════════════════════════════════════════════════════════ */}
                                    <div className="flex-1 flex flex-col gap-3 min-h-0">

                                        {/* ─────────────────────────────────────────────────────────── */}
                                        {/* TOP: COMPACT STATS PANEL */}
                                        {/* ─────────────────────────────────────────────────────────── */}
                                        <div className="bg-gradient-to-b from-slate-900/90 to-slate-950 rounded-xl border border-amber-900/30 shadow-lg flex-shrink-0">
                                            <StatPointsPanel playerState={playerStats} onAddStat={handleStatIncrease} />
                                        </div>

                                        {/* 2. CALCULATED STATS (Secondary) - Visual Only */}
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-3 flex-shrink-0">
                                            {/* Attack */}
                                            <div className="bg-slate-900/60 p-2 lg:p-3 rounded-lg border border-white/5 flex items-center justify-between relative overflow-hidden">
                                                <div className="absolute inset-0 bg-red-900/5"></div>
                                                <div className="flex items-center gap-2 relative z-10">
                                                    <div className="p-1.5 bg-red-900/20 rounded text-red-400 border border-red-900/30"><PixelSwords color="#f87171" size={20} /></div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Saldırı</span>
                                                        <span className="text-sm font-bold text-slate-200">{Math.floor(playerStats.strength * 2 + 10)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Defense */}
                                            <div className="bg-slate-900/60 p-2 lg:p-3 rounded-lg border border-white/5 flex items-center justify-between relative overflow-hidden">
                                                <div className="absolute inset-0 bg-blue-900/5"></div>
                                                <div className="flex items-center gap-2 relative z-10">
                                                    <div className="p-1.5 bg-blue-900/20 rounded text-blue-400 border border-blue-900/30"><PixelShield color="#60a5fa" size={20} /></div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Defans</span>
                                                        <span className="text-sm font-bold text-slate-200">{Math.floor(playerStats.vitality * 1.5 + 5)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Speed */}
                                            <div className="bg-slate-900/60 p-2 lg:p-3 rounded-lg border border-white/5 flex items-center justify-between relative overflow-hidden">
                                                <div className="absolute inset-0 bg-yellow-900/5"></div>
                                                <div className="flex items-center gap-2 relative z-10">
                                                    <div className="p-1.5 bg-yellow-900/20 rounded text-yellow-400 border border-yellow-900/30"><PixelBoots color="#fbbf24" size={20} /></div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Hız</span>
                                                        <span className="text-sm font-bold text-slate-200">{(100 + playerStats.dexterity * 0.5).toFixed(0)}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Crit */}
                                            <div className="bg-slate-900/60 p-2 lg:p-3 rounded-lg border border-white/5 flex items-center justify-between relative overflow-hidden">
                                                <div className="absolute inset-0 bg-emerald-900/5"></div>
                                                <div className="flex items-center gap-2 relative z-10">
                                                    <div className="p-1.5 bg-emerald-900/20 rounded text-emerald-400 border border-emerald-900/30"><PixelTrophy color="#34d399" size={20} /></div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Kritik</span>
                                                        <span className="text-sm font-bold text-slate-200">{(playerStats.dexterity * 0.2).toFixed(1)}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* ─────────────────────────────────────────────────────────── */}
                                        {/* BOTTOM: EXPANDED COMPANIONS (Pets & Wings) */}
                                        {/* ─────────────────────────────────────────────────────────── */}
                                        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-3 min-h-0">

                                            {/* COMPANION PANEL (Pets & Mounts) */}
                                            <div className="bg-gradient-to-b from-slate-900/80 to-slate-950 rounded-xl border border-emerald-900/30 shadow-lg overflow-hidden flex flex-col">
                                                {/* Tabs Header */}
                                                <div className="px-2 py-2 border-b border-emerald-900/20 bg-emerald-950/20 flex gap-2">
                                                    <button
                                                        onClick={() => setCompanionTab('pets')}
                                                        className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${companionTab === 'pets' ? 'bg-emerald-600 text-white shadow-lg ring-1 ring-emerald-400' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-emerald-400'}`}
                                                    >
                                                        <span>🐾</span> NORMAL PETLER
                                                    </button>
                                                    <button
                                                        onClick={() => setCompanionTab('mounts')}
                                                        className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${companionTab === 'mounts' ? 'bg-amber-600 text-white shadow-lg ring-1 ring-amber-400' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-amber-400'}`}
                                                    >
                                                        <span>🐎</span> HIZ YOLDAŞLARI
                                                    </button>
                                                </div>

                                                <div className="p-4 flex-1 flex flex-col gap-4 overflow-hidden">
                                                    {companionTab === 'pets' ? (
                                                        /* ────────── PETS CONTENT ────────── */
                                                        <>
                                                            {/* Large Preview */}
                                                            <div className="w-full h-24 flex-shrink-0 bg-[#0a2f1c]/30 rounded-lg border border-dashed border-emerald-800/50 flex items-center justify-center relative overflow-hidden group">
                                                                {playerStats.equippedPet ? (
                                                                    <>
                                                                        <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/40 to-transparent"></div>
                                                                        <div className="z-10 text-4xl drop-shadow-[0_0_15px_rgba(34,197,94,0.6)] animate-bounce-slow">🐉</div>
                                                                        <div className="absolute bottom-1 left-0 right-0 text-center text-[10px] font-bold text-emerald-300 uppercase tracking-widest">
                                                                            {playerStats.equippedPet.name}
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <span className="text-emerald-800/50 text-xs font-bold uppercase tracking-widest">Yoldaş Seçilmedi</span>
                                                                )}
                                                            </div>

                                                            {/* Scrollable Grid */}
                                                            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                                                                <div className="grid grid-cols-4 gap-2 content-start">
                                                                    {playerStats.ownedPets?.map(pet => {
                                                                        const displayData = getItemDisplayData(pet);
                                                                        const isEquipped = playerStats.equippedPet?.id === pet.id;
                                                                        return (
                                                                            <ItemTooltip key={pet.id} item={pet}>
                                                                                <button
                                                                                    onClick={() => setPlayerStats(prev => ({ ...prev, equippedPet: isEquipped ? null : pet }))}
                                                                                    className={`aspect-square rounded-lg border-2 flex flex-col items-center justify-center transition-all relative group
                                                                                        ${isEquipped
                                                                                            ? 'bg-emerald-900/40 border-emerald-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]'
                                                                                            : 'bg-slate-900/50 border-slate-700/50 hover:border-emerald-500/50 hover:bg-slate-800'
                                                                                        }`}
                                                                                >
                                                                                    <span className="text-xl group-hover:scale-110 transition-transform">🐉</span>
                                                                                    <div className={`absolute top-0 right-0 px-1 rounded-bl-md text-[8px] font-bold
                                                                                        ${displayData.tierLabel.includes('T5') ? 'bg-red-900 text-red-100' : 'bg-black/60 text-emerald-400'}
                                                                                    `}>
                                                                                        {displayData.tierLabel}
                                                                                    </div>
                                                                                </button>
                                                                            </ItemTooltip>
                                                                        );
                                                                    })}
                                                                    {/* Empty slots placeholders */}
                                                                    {Array.from({ length: Math.max(0, 16 - (playerStats.ownedPets?.length || 0)) }).map((_, i) => (
                                                                        <div key={`empty-${i}`} className="aspect-square rounded-lg border border-slate-800/50 bg-slate-900/20"></div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        /* ────────── MOUNTS CONTENT ────────── */
                                                        <>
                                                            {/* Large Preview */}
                                                            <div className="w-full h-24 flex-shrink-0 bg-[#2a1b0a]/30 rounded-lg border border-dashed border-amber-800/50 flex items-center justify-center relative overflow-hidden group">
                                                                {equippedMount ? (
                                                                    <>
                                                                        <div className="absolute inset-0 bg-gradient-to-t from-amber-900/40 to-transparent"></div>
                                                                        <div className="z-10 text-4xl drop-shadow-[0_0_15px_rgba(245,158,11,0.6)] animate-bounce-slow">
                                                                            {ALL_MOUNTS.find(m => m.id === equippedMount)?.emoji || '🐎'}
                                                                        </div>
                                                                        <div className="absolute bottom-1 left-0 right-0 text-center text-[10px] font-bold text-amber-300 uppercase tracking-widest">
                                                                            {ALL_MOUNTS.find(m => m.id === equippedMount)?.name}
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <span className="text-amber-800/50 text-xs font-bold uppercase tracking-widest">Binek Seçilmedi</span>
                                                                )}
                                                            </div>

                                                            {/* Scrollable Grid */}
                                                            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                                                                <div className="grid grid-cols-4 gap-2 content-start">
                                                                    {ALL_MOUNTS.filter(m => ownedMounts.includes(m.id)).map(mount => {
                                                                        const isEquipped = equippedMount === mount.id;
                                                                        let borderColor = 'border-slate-700/50';
                                                                        if (mount.rarity === 'legendary') borderColor = 'border-orange-500/50';
                                                                        else if (mount.rarity === 'epic') borderColor = 'border-purple-500/50';

                                                                        return (
                                                                            <button
                                                                                key={mount.id}
                                                                                title={`${mount.name}\n${mount.speedBonus}% Hız Bonusu\n${mount.specialAbility || ''}`}
                                                                                onClick={() => setEquippedMount(isEquipped ? null : mount.id)}
                                                                                className={`aspect-square rounded-lg border-2 flex flex-col items-center justify-center transition-all relative group
                                                                                    ${isEquipped
                                                                                        ? 'bg-amber-900/40 border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                                                                                        : `bg-slate-900/50 hover:bg-slate-800 ${borderColor}`
                                                                                    }`}
                                                                            >
                                                                                <span className="text-xl group-hover:scale-110 transition-transform">{mount.emoji}</span>
                                                                                <div className="absolute top-0 right-0 px-1 rounded-bl-md text-[8px] font-bold bg-black/60 text-amber-400">
                                                                                    T{mount.tier}
                                                                                </div>
                                                                            </button>
                                                                        );
                                                                    })}
                                                                    {/* Empty slots placeholders */}
                                                                    {Array.from({ length: Math.max(0, 16 - ownedMounts.length) }).map((_, i) => (
                                                                        <div key={`empty-mount-${i}`} className="aspect-square rounded-lg border border-slate-800/50 bg-slate-900/20"></div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {/* WING CARD (Large) */}
                                            <div className="bg-gradient-to-b from-slate-900/80 to-slate-950 rounded-xl border border-violet-900/30 shadow-lg overflow-hidden flex flex-col">
                                                <div className="px-4 py-2 border-b border-violet-900/20 bg-violet-950/20 flex justify-between items-center flex-shrink-0">
                                                    <h3 className="font-bold text-violet-400 flex items-center gap-2">
                                                        <div className="w-5 h-5"><PixelWing color="#a78bfa" /></div>
                                                        <span className="tracking-wide">KANATLAR</span>
                                                    </h3>
                                                    <span className="text-xs text-violet-600 font-bold bg-violet-950/40 px-2 py-0.5 rounded-full border border-violet-900/30">
                                                        {playerStats.ownedWings?.length || 0} / 20
                                                    </span>
                                                </div>

                                                <div className="p-4 flex-1 flex flex-col gap-4 overflow-hidden">
                                                    {/* Large Preview */}
                                                    <div className="w-full h-24 flex-shrink-0 bg-[#1e1b4b]/30 rounded-lg border border-dashed border-violet-800/50 flex items-center justify-center relative overflow-hidden group">
                                                        {playerStats.equippedWing ? (
                                                            <>
                                                                <div className="absolute inset-0 bg-gradient-to-t from-violet-900/40 to-transparent"></div>
                                                                <div className="z-10 w-16 h-16 drop-shadow-[0_0_15px_rgba(139,92,246,0.6)] animate-pulse-slow">
                                                                    <PixelWing color={playerStats.equippedWing.color || '#a78bfa'} />
                                                                </div>
                                                                <div className="absolute bottom-1 left-0 right-0 text-center text-[10px] font-bold text-violet-300 uppercase tracking-widest">
                                                                    {playerStats.equippedWing.name}
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <span className="text-violet-800/50 text-xs font-bold uppercase tracking-widest">Kanat Seçilmedi</span>
                                                        )}
                                                    </div>

                                                    {/* Scrollable Grid */}
                                                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                                                        <div className="grid grid-cols-4 gap-2 content-start">
                                                            {playerStats.ownedWings?.map(wing => {
                                                                const displayData = getItemDisplayData(wing);
                                                                const isEquipped = playerStats.equippedWing?.id === wing.id;
                                                                return (
                                                                    <ItemTooltip key={wing.id} item={wing}>
                                                                        <button
                                                                            onClick={() => setPlayerStats(prev => ({ ...prev, equippedWing: isEquipped ? null : wing }))}
                                                                            className={`aspect-square rounded-lg border-2 flex flex-col items-center justify-center transition-all relative group
                                                                                    ${isEquipped
                                                                                    ? 'bg-violet-900/40 border-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.3)]'
                                                                                    : 'bg-slate-900/50 border-slate-700/50 hover:border-violet-500/50 hover:bg-slate-800'
                                                                                }`}
                                                                        >
                                                                            <div className="w-6 h-6 group-hover:scale-110 transition-transform"><PixelWing color={wing.color || '#a78bfa'} /></div>
                                                                            <div className={`absolute top-0 right-0 px-1 rounded-bl-md text-[8px] font-bold
                                                                                    ${displayData.tierLabel.includes('T5') ? 'bg-red-900 text-red-100' : 'bg-black/60 text-violet-400'}
                                                                                `}>
                                                                                {displayData.tierLabel}
                                                                            </div>
                                                                        </button>
                                                                    </ItemTooltip>
                                                                );
                                                            })}
                                                            {/* Empty slots placeholders */}
                                                            {Array.from({ length: Math.max(0, 16 - (playerStats.ownedWings?.length || 0)) }).map((_, i) => (
                                                                <div key={`empty-${i}`} className="aspect-square rounded-lg border border-slate-800/50 bg-slate-900/20"></div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    </div>

                                </div>
                            </div>
                        )}

                        {activeTab === 'inventory' && <InventoryModal playerState={playerStats} onEquip={handleEquipItem} onUnequip={handleUnequipItem} onUse={handleUseItem} onClose={() => setActiveTab('skills')} />}
                        {activeTab === 'skills' && <SkillTree playerClass={CLASSES[playerStats.class || 'warrior']} playerLevel={playerStats.level} />}
                        {activeTab === 'quests' && <div className="bg-slate-900 p-8 rounded-xl border border-slate-700"><h1 className="text-2xl text-yellow-500 font-bold mb-4">GÖREVLER</h1><p className="text-slate-400">Aktif: {playerStats.activeQuest ? playerStats.activeQuest.title : 'Yok'}</p></div>}
                        {
                            activeTab === 'party' && (
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
                            )
                        }

                        {
                            activeTab === 'guild' && (
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
                            )
                        }

                        {
                            activeTab === 'market' && (
                                <div className="flex flex-col h-full bg-slate-900/50 rounded-xl overflow-hidden md:p-4">
                                    {/* SUB TABS */}
                                    <div className="flex gap-2 md:gap-4 mb-4 border-b border-white/10 pb-2 px-2 overflow-x-auto">
                                        <button onClick={() => setMarketSubTab('npc')} className={`px-4 py-2 font-bold rounded transition-colors whitespace-nowrap ${marketSubTab === 'npc' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>Köy Pazarı</button>
                                        <button onClick={() => setMarketSubTab('player')} className={`px-4 py-2 font-bold rounded transition-colors whitespace-nowrap ${marketSubTab === 'player' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>Oyuncu Pazarı</button>
                                        <button onClick={() => setMarketSubTab('premium')} className={`px-4 py-2 font-bold rounded transition-colors whitespace-nowrap ${marketSubTab === 'premium' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>Mağaza</button>
                                    </div>

                                    <div className="flex-1 relative overflow-hidden rounded-lg bg-slate-900 border border-slate-700">
                                        {marketSubTab === 'npc' && (
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
                                        {marketSubTab === 'player' && (
                                            <MarketView
                                                playerState={playerStats}
                                                onClose={() => { }}
                                                onUpdatePlayer={(updates) => setPlayerStats(prev => ({ ...prev, ...updates }))}
                                                isEmbedded={true}
                                            />
                                        )}
                                        {marketSubTab === 'premium' && (
                                            <PremiumMarketView
                                                playerState={playerStats}
                                                onBuyData={(category, id, cost, currency, amount) => {
                                                    setPlayerStats(prev => {
                                                        const updates: any = {};
                                                        let currentCredits = prev.credits;
                                                        let currentGems = prev.gems;

                                                        let success = false;
                                                        if (currency === 'gold' && currentCredits >= cost) { updates.credits = currentCredits - cost; success = true; }
                                                        else if (currency === 'gems' && currentGems >= cost) { updates.gems = currentGems - cost; success = true; }
                                                        else if (currency === 'real') { success = true; }

                                                        if (!success) return prev;

                                                        if (category === 'currency') {
                                                            if (id.includes('gold')) updates.credits = (updates.credits ?? currentCredits) + (amount || 0);
                                                            else updates.gems = (updates.gems ?? currentGems) + (amount || 0);
                                                        } else if (category === 'item') {
                                                            // Check if it's a costume set
                                                            if (id.startsWith('costume_')) {
                                                                const costumes = prev.ownedCostumes || [];
                                                                if (!costumes.includes(id)) {
                                                                    updates.ownedCostumes = [...costumes, id];
                                                                    updates.equippedCostume = id; // Auto-equip on purchase
                                                                }
                                                            } else {
                                                                const skins = prev.ownedSkins || [];
                                                                if (!skins.includes(id)) updates.ownedSkins = [...skins, id];
                                                            }
                                                        } else if (category === 'subscription') {
                                                            updates.vipStatus = { tier: 1, expiresAt: Date.now() + 2592000000 };
                                                            updates.gems = (updates.gems ?? currentGems) + 50;
                                                        }
                                                        return { ...prev, ...updates };
                                                    });
                                                    soundManager.playSFX('coin');
                                                }}
                                                onEquipCostume={(costumeId) => {
                                                    setPlayerStats(prev => ({ ...prev, equippedCostume: costumeId }));
                                                    soundManager.playSFX('equip');
                                                }}
                                                onClose={() => { }}
                                                isEmbedded={true}
                                            />
                                        )}
                                    </div>
                                </div>
                            )
                        }
                        {
                            activeTab === 'blacksmith' && (
                                <BlacksmithView
                                    isOpen={true}
                                    playerState={playerStats}
                                    onUpdatePlayer={(updates) => setPlayerStats(prev => ({ ...prev, ...updates }))}
                                    onClose={() => setActiveTab('character')}
                                    isEmbedded={true}
                                />
                            )
                        }
                        {activeTab === 'map' && <div className="w-full h-full flex flex-col items-center"><h2 className="text-3xl rpg-font text-yellow-500 mb-6 flex items-center gap-3"><MapIcon size={32} /> HARİTA</h2><div className="w-full max-w-5xl"><SchematicMap activeZone={startingMap} onZoneSelect={(id) => setActiveZone(id)} /></div></div>}
                        {activeTab === 'leaderboard' && <LeaderboardView onJoinGuild={handleJoinGuild} />}
                    </main >

                    {/* MOBILE BOTTOM NAVIGATION */}
                    <nav className="md:hidden fixed bottom-0 left-0 w-full bg-[#0f172a] border-t border-slate-800 z-50 flex justify-around items-center px-2 py-2 pb-safe shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
                        <button onClick={() => setActiveTab('character')} className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${activeTab === 'character' ? 'text-blue-400 bg-blue-900/20' : 'text-slate-400'}`}>
                            <div className="w-6 h-6"><PixelUser color={activeTab === 'character' ? '#60a5fa' : '#94a3b8'} /></div>
                            <span className="text-[10px] font-bold">Karakter</span>
                        </button>
                        <button onClick={() => setActiveTab('inventory')} className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${activeTab === 'inventory' ? 'text-amber-400 bg-amber-900/20' : 'text-slate-400'}`}>
                            <div className="w-6 h-6"><PixelBackpack color={activeTab === 'inventory' ? '#fbbf24' : '#94a3b8'} /></div>
                            <span className="text-[10px] font-bold">Çanta</span>
                        </button>

                        {/* PLAY BUTTON (CENTER, LARGE) */}
                        <button onClick={() => setActiveZone(startingMap || 11)} className="relative -top-5 bg-gradient-to-t from-red-600 to-red-500 w-16 h-16 rounded-full border-4 border-[#0f172a] shadow-lg flex items-center justify-center transform active:scale-95 transition-transform">
                            <div className="w-8 h-8 text-white"><PixelSwords color="#ffffff" /></div>
                        </button>

                        <button onClick={() => setActiveTab('skills')} className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${activeTab === 'skills' ? 'text-blue-400 bg-blue-900/20' : 'text-slate-400'}`}>
                            <div className="w-6 h-6"><PixelShield color={activeTab === 'skills' ? '#3b82f6' : '#94a3b8'} /></div>
                            <span className="text-[10px] font-bold">Yetenek</span>
                        </button>

                        {/* MORE MENU TRIGGER (Since we have too many tabs) */}
                        <button onClick={() => setActiveTab('map')} className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${activeTab === 'map' ? 'text-emerald-400 bg-emerald-900/20' : 'text-slate-400'}`}>
                            <div className="w-6 h-6"><PixelMap color={activeTab === 'map' ? '#34d399' : '#94a3b8'} /></div>
                            <span className="text-[10px] font-bold">Harita</span>
                        </button>
                    </nav>
                </div >
            </div >

            {/* Mail Modal */}
            {
                showMailbox && (
                    <MailView
                        playerState={playerStats}
                        onClose={() => setShowMailbox(false)}
                        onRefreshPlayer={() => loadPartyData()}
                    />
                )
            }

            {/* Daily Quests Modal */}
            {
                showDailyQuests && (
                    <DailyQuestView
                        playerState={playerStats}
                        onClose={() => setShowDailyQuests(false)}
                    />
                )
            }

            {/* Tutorial System */}
            {
                showTutorial && (
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
                )
            }

            {/* Settings Modal */}
            {
                showSettings && (
                    <SettingsView onClose={() => setShowSettings(false)} />
                )
            }

            {/* Premium Modal */}
            {
                showPremium && (
                    <PremiumView
                        playerState={playerStats}
                        onClose={() => setShowPremium(false)}
                        onRefreshPlayer={() => loadPartyData()}
                    />
                )
            }

            {/* Battle Pass Modal */}
            {
                showBattlePass && (
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
                )
            }

            {/* Player Stats Modal */}
            {
                showPlayerStats && (
                    <PlayerStatsView
                        playerState={playerStats}
                        onClose={() => setShowPlayerStats(false)}
                    />
                )
            }


            {/* Referral Modal */}
            {
                showReferral && (
                    <ReferralView
                        playerState={playerStats}
                        onClose={() => setShowReferral(false)}
                        onClaimReward={(rewards) => {
                            if (rewards.gold) setPlayerStats(prev => ({ ...prev, credits: prev.credits + rewards.gold }));
                            if (rewards.gems) setPlayerStats(prev => ({ ...prev, gems: prev.gems + rewards.gems }));
                        }}
                    />
                )
            }


            {/* World Map Modal */}
            {
                showWorldMap && (
                    <WorldMapView
                        playerState={playerStats}
                        currentZoneId={activeZone || 1}
                        onClose={() => setShowWorldMap(false)}
                        onNavigate={(zoneId) => { setActiveZone(zoneId); setShowWorldMap(false); }}
                    />
                )
            }


            {/* Mount System moved to Character Panel */}

            {/* Boss Spawn Notification */}
            {bossNotification && (
                <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[100] animate-bounce">
                    <div className="bg-gradient-to-r from-red-900 to-orange-900 border-2 border-red-500 rounded-xl p-4 shadow-2xl min-w-[300px]">
                        <div className="flex items-center gap-3">
                            <div className="text-4xl">💀</div>
                            <div className="flex-1">
                                <div className="text-red-300 text-xs uppercase font-bold">Boss Doğdu!</div>
                                <div className="text-white text-lg font-bold">{bossNotification.bossName}</div>
                                <div className="text-orange-300 text-sm">{bossNotification.zoneName}</div>
                            </div>
                            <button
                                onClick={() => {
                                    setActiveZone(bossNotification.zoneId);
                                    setBossNotification(null);
                                }}
                                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-colors"
                            >
                                Git
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ErrorBoundary >
    );
};

export default GameDashboard;
