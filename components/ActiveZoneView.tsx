/// <reference lib="dom" />

import React, { useEffect, useRef, useState, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, OrbitControls, useGLTF, useAnimations, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { io, Socket } from 'socket.io-client';
import { PlayerState, GameEntity, LootLog, FloatingText, LootBox, Item, Equipment, Portal, ChatMessage, HUDElement, HUDLayout, EntityType, Skill, NPCData } from '../types';
import { soundManager } from './SoundManager';
import { ZONE_CONFIG, RANKS, CLASSES, LEVEL_XP_REQUIREMENTS, DEFAULT_HUD_LAYOUT, ZONE_REWARDS, ALL_CLASS_ITEMS, DEFAULT_ZONE_REWARD, ACHIEVEMENTS_LIST } from '../constants';
import { Swords, Shield, Zap, ShoppingBag, Backpack, X, Wind, Skull, Target, Droplet, Flame, Send, Clock, Hammer, MessageSquare, Minus, Crosshair, Map as MapIcon, Settings as SettingsIcon, Crown, Star, ArrowRight, ZoomIn, Globe, AlertTriangle, Navigation, Info, Compass, Plus, Smartphone, Monitor, ChevronDown, ChevronUp, Move, RotateCw, Eye, Book, Users, Trophy, Scroll, Lock, Unlock, Heart, Sword, Settings, Settings2, Coins, Gem } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { GameVFXOverlay, vfxManager } from './VFXSystem';
import { VoxelSpartan } from './VoxelSpartan';
import InventoryModal from './InventoryModal';
import { PlayerStall } from './PlayerStall';
import { BlacksmithView } from './BlacksmithView';
import { PlayerStallData } from './MarketTypes';
import { VoxelSlime } from './VoxelMobs/VoxelSlime';
import { VoxelAxolotl } from './VoxelMobs/VoxelAxolotl';
import { VoxelPenguin } from './VoxelMobs/VoxelPenguin';
import { VoxelCrab } from './VoxelMobs/VoxelCrab';
import { VoxelFireDragon } from './VoxelMobs/VoxelFireDragon';
import { VoxelIceGiant } from './VoxelMobs/VoxelIceGiant';
import { VoxelShadowLord } from './VoxelMobs/VoxelShadowLord';
import { VoxelStoneGolem } from './VoxelMobs/VoxelStoneGolem';
import { VoxelWolf } from './VoxelMobs/VoxelWolf';
import { VoxelGoblin } from './VoxelMobs/VoxelGoblin';
import { VoxelBat } from './VoxelMobs/VoxelBat';
import { VoxelSkeleton } from './VoxelMobs/VoxelSkeleton';
import { VoxelGolem } from './VoxelMobs/VoxelGolem';
import { SkillEffects } from './SkillEffects';
import { SKILL_ASSETS } from './SkillAssetRegistry';
import { CharacterClass } from '../types';
import ChatSystem from './ChatSystem';
import { Ground } from './ZoneEnvironment';
import { VoxelTerrain } from './VoxelTerrain';
import SchematicMap from './SchematicMap';
import { GameGuideModal } from './GameGuideModal';
import { NPCInteractionModal, NPC_REGISTRY } from './NPCInteractionModal';
import AchievementsModal from './AchievementsModal';
import PartyView from './PartyView';
import GuildView from './GuildView';
import LeaderboardView from './LeaderboardView';
import PlayerStatsView from './PlayerStatsView';
import SkillTree from './SkillTree';
import NpcShopView from './NpcShopView';
import { MarketView } from './MarketView';
import { PremiumMarketView } from './PremiumMarketView';
import DailyLoginModal from './DailyLoginModal';
import { useBossAI } from './useBossAI';
import EventBanner from './EventBanner';
import { SettingsView, useSettings } from './SettingsView';
import { CLASS_COMBAT_CONFIG, performAttack, isMeleeClass, logCombat } from '../utils/combatSystem';
import { WeatherParticles, WeatherIndicator, WeatherChangeNotification, FogEffect } from './WeatherEffects';
import { weatherManager } from '../systems/WeatherSystem';
import { monitor } from '../utils/diagnostics/PerformanceMonitor';
import { generateDrop, generateBossMaterialDrop } from '../utils/generateDrop';
import { createAntiBotState, updateAntiBotOnKill, getRewardMultipliers, AntiBotState } from '../utils/antiBotSystem';
import { ExpBarCompact } from './ui/ExpBar';
import { RankIcon } from './ui/RankIcon';
import { HonorDisplayCompact } from './ui/HonorDisplay';
import { canGainHonor, getHonorValue, recordKill } from '../utils/rankSystem';
import { getVipBonus } from '../utils/vipSystem';
import { addDailyHonor, addDailyKill } from '../utils/dailyLeaderboard';
import { getMaterialIcon, isDevelopmentMode } from '../utils/AssetManager';

import { PixelGoldUser } from './ui/PixelVip';

// Core Game Systems
import { CombatLog, BossPhaseManager, GameMode } from '../core';
import { useBossPhaseFX } from '../hooks/useBossPhaseFX';

// --- PRELOAD ASSETS (NO FREEZE ON SPAWN) ---
const PRELOAD_MODELS = [
    '/models/enemies/bosses/parrot%20bosses%20premium.gltf',
    '/models/enemies/bosses/armadillo%20bosses%20premium.gltf',
    '/models/enemies/bosses/axolotl%20bosses%20premium.gltf',
    '/models/enemies/bosses/cat%20bosses%20premium.gltf',
    '/models/enemies/bosses/crab%20bosses%20premium.gltf',
    '/models/enemies/bosses/penguin%20bosses%20premium.gltf',
    '/models/enemies/mobs/parrot%20normal.gltf',
    '/models/enemies/mobs/parrot%20medium.gltf',
    '/models/enemies/mobs/cat%20normal.gltf',
    '/models/enemies/mobs/cat%20medium.gltf',
    '/models/enemies/mobs/axolotl%20normal.gltf',
    '/models/enemies/mobs/axolotl%20medium.gltf',
];

try {
    // Only preload explicitly defined/confirmed models to avoid 404 crashes
    // PRELOAD_MODELS.forEach(path => useGLTF.preload(path));
    console.log("✅ Models Preloading SKIPPED for performance");
} catch (e) {
    console.warn("⚠️ Model Preload Warning:", e);
}

const MOCK_STALLS: PlayerStallData[] = [];

interface Active3DEffect {
    id: string;
    visual: string;
    modelPath: string;
    position: [number, number, number];
    targetPosition?: [number, number, number];
}


// --- MATERIALS (Using AssetManager for icons) ---
const MATERIALS: Item[] = [
    { id: 'iron_ore', name: 'Demir Cevheri', type: 'material', tier: 1, rarity: 'common', value: 10, icon: getMaterialIcon('iron_ore').emoji, stats: {} },
    { id: 'wood_log', name: 'Odun', type: 'material', tier: 1, rarity: 'common', value: 5, icon: getMaterialIcon('wood_log').emoji, stats: {} },
    { id: 'leather_scrap', name: 'Deri Parçası', type: 'material', tier: 1, rarity: 'common', value: 8, icon: getMaterialIcon('leather_scrap').emoji, stats: {} },
    { id: 'herb_green', name: 'Şifalı Ot', type: 'material', tier: 1, rarity: 'common', value: 15, icon: getMaterialIcon('herb_green').emoji, stats: {} },
];

interface ActiveZoneViewProps {

    zoneId: number;
    playerState: PlayerState;
    chatHistory: ChatMessage[];
    onSendChat: (msg: string, channel: 'global' | 'party' | 'guild') => void;
    onExit: () => void;
    onSwitchZone: (newZoneId: number) => void;
    onLoot: (gold: number, xp: number, honor: number, item?: Item) => void;
    onUpdatePlayer: (updates: Partial<PlayerState>) => void;
    onEquip: (item: Item) => void;
    onUnequip: (slot: keyof Equipment) => void;
    onUseItem: (item: Item) => void;
    onQuestProgress: (enemyName: string) => void;
    onClaimQuest: () => void;
    onOpenCrafting: () => void;
    onQuickPotion: (type: 'hp' | 'mp') => void;
    onInteraction: (type: 'npc' | 'portal', id: string) => void;
    onOpenMarket?: () => void;
    isAdmin?: boolean;
    onReceiveChat?: (msg: ChatMessage) => void;
    socketRef: React.MutableRefObject<Socket | null>; // ADDED
}

// --- DRAGGABLE HUD COMPONENT ---
interface DraggableHUDElementProps {
    id: string;
    element: HUDElement;
    isEditing: boolean;
    isSelected: boolean;
    onSelect: (id: string) => void;
    onDragStart: (e: React.MouseEvent | React.TouchEvent, id: string) => void;
    children: React.ReactNode;
}

const DraggableHUDElement: React.FC<DraggableHUDElementProps> = ({ id, element, isEditing, isSelected, onSelect, onDragStart, children }) => {
    // If not enabled and not editing, hide it. If editing, show it even if disabled (to allow enabling/moving) - or keep logic simple:
    if (!element.enabled && !isEditing) return null;

    // Clamp positions - TAM KENARA YANAŞABİLİR (0-100)
    const clampedX = Math.min(Math.max(element.x, 0), 100);
    const clampedY = Math.min(Math.max(element.y, 0), 100);

    // For right-side elements (x > 50%), anchor from right instead of left
    // For bottom elements (y > 50%), anchor from bottom instead of top  
    const isRightSide = clampedX > 50;
    const isBottomSide = clampedY > 50;

    const positionStyle: React.CSSProperties = {
        touchAction: 'none'
    };

    if (isRightSide) {
        positionStyle.right = `${100 - clampedX}%`;
    } else {
        positionStyle.left = `${clampedX}%`;
    }

    if (isBottomSide) {
        positionStyle.bottom = `${100 - clampedY}%`;
    } else {
        positionStyle.top = `${clampedY}%`;
    }

    // Apply scale and opacity from element config
    const transformStyle = {
        transform: `scale(${element.scale})`,
        opacity: isEditing ? 1 : (element.opacity ?? 1), // Always full opacity while editing to see it
    };

    return (
        <div
            className={`absolute transition-transform origin-center select-none ${isEditing ? 'z-[100] cursor-pointer' : 'z-50'}`}
            style={{
                ...positionStyle,
                ...transformStyle
            }}
            onMouseDown={(e) => {
                if (isEditing) {
                    e.stopPropagation(); // Prevent map click etc
                    onSelect(id);
                    if (!element.locked) onDragStart(e, id);
                }
            }}
            onTouchStart={(e) => {
                if (isEditing) {
                    e.stopPropagation();
                    onSelect(id);
                    if (!element.locked) onDragStart(e, id);
                }
            }}
        >
            {isEditing && (
                <div className={`absolute inset-0 border-2 rounded-lg flex items-center justify-center pointer-events-none ${isSelected ? 'border-green-500 bg-green-500/30 shadow-[0_0_15px_green]' : 'border-yellow-500 bg-yellow-500/20'} ${element.locked ? 'border-red-500' : ''}`}>
                    {element.locked ? <div className="text-red-500"><Lock size={24} /></div> : <Move size={24} className={`text-white drop-shadow-md opacity-80 ${isSelected ? 'animate-bounce' : 'animate-pulse'}`} />}
                    {/* Element Name */}
                    <div className={`absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-white px-1.5 py-0.5 rounded font-bold uppercase shadow whitespace-nowrap ${isSelected ? 'bg-green-600' : 'bg-yellow-600'}`}>
                        {id}
                    </div>
                    {/* X Y Coordinates - DEBUG */}
                    <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] bg-black/80 text-cyan-400 px-1.5 py-0.5 rounded font-mono whitespace-nowrap border border-cyan-500/50">
                        X:{Math.round(element.x)} Y:{Math.round(element.y)}
                    </div>
                </div>
            )}
            <div className={isEditing ? 'pointer-events-none' : 'pointer-events-auto'}>
                {children}
            </div>
        </div>
    );
};

// --- ENVIRONMENTAL DECORATIONS ---
const DecorationMesh: React.FC<{ id: any, type: 'tree' | 'rock' | 'crystal' | 'lava_pool' | 'mushroom' | 'small_rock' | 'ice_spike' | 'bush', pos: [number, number, number], scale: number, color: string, rotation: [number, number, number], onClick: (id: any, type: string, pos: any) => void }> = ({ id, type, pos, scale, color, rotation, onClick }) => {
    const [hovered, setHover] = useState(false);
    const activeScale = hovered ? scale * 1.1 : scale;

    return (
        <group
            position={pos}
            scale={[activeScale, activeScale, activeScale]}
            onClick={(e) => { e.stopPropagation(); onClick(id, type, pos); }}
            onPointerOver={() => setHover(true)}
            onPointerOut={() => setHover(false)}
        >
            {type === 'tree' && (
                <group>
                    <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
                        <cylinderGeometry args={[0.2, 0.3, 1, 6]} />
                        <meshStandardMaterial color="#451a03" />
                    </mesh>
                    <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
                        <coneGeometry args={[1, 2, 8]} />
                        <meshStandardMaterial color={color} />
                    </mesh>
                    {hovered && <mesh position={[0, 1.5, 0]}><coneGeometry args={[1.05, 2.05, 8]} /><meshBasicMaterial color="#fbbf24" wireframe /></mesh>}
                </group>
            )}
            {type === 'rock' && (
                <group>
                    <mesh position={[0, 0.5, 0]} rotation={rotation} castShadow receiveShadow>
                        <dodecahedronGeometry args={[0.8]} />
                        <meshStandardMaterial color={color} />
                    </mesh>
                    {hovered && <mesh position={[0, 0.5, 0]} rotation={rotation}><dodecahedronGeometry args={[0.85]} /><meshBasicMaterial color="#fbbf24" wireframe /></mesh>}
                </group>
            )}
            {type === 'crystal' && (
                <group>
                    <mesh position={[0, 1, 0]} castShadow>
                        <octahedronGeometry args={[1]} />
                        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={hovered ? 2 : 1} transparent opacity={0.8} />
                    </mesh>
                    {hovered && <mesh position={[0, 1, 0]}><octahedronGeometry args={[1.05]} /><meshBasicMaterial color="white" wireframe /></mesh>}
                </group>
            )}
            {type === 'lava_pool' && (
                <group>
                    <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                        <circleGeometry args={[1.5, 16]} />
                        <meshStandardMaterial color="#ff4500" emissive="#ff6600" emissiveIntensity={2} />
                    </mesh>
                    <pointLight position={[0, 0.5, 0]} color="#ff4500" intensity={3} distance={5} />
                </group>
            )}
            {type === 'mushroom' && (
                <group>
                    <mesh position={[0, 0.3, 0]} castShadow>
                        <cylinderGeometry args={[0.1, 0.15, 0.6, 8]} />
                        <meshStandardMaterial color="#f5deb3" />
                    </mesh>
                    <mesh position={[0, 0.7, 0]} castShadow>
                        <coneGeometry args={[0.5, 0.4, 8]} />
                        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
                    </mesh>
                </group>
            )}
            {type === 'small_rock' && (
                <mesh position={[0, 0.2, 0]} rotation={rotation} castShadow>
                    <icosahedronGeometry args={[0.3]} />
                    <meshStandardMaterial color={color} roughness={0.9} />
                </mesh>
            )}
            {type === 'ice_spike' && (
                <group>
                    <mesh position={[0, 0.8, 0]} castShadow>
                        <coneGeometry args={[0.3, 1.6, 4]} />
                        <meshStandardMaterial color="#a5f3fc" emissive="#00bcd4" emissiveIntensity={0.5} transparent opacity={0.85} />
                    </mesh>
                    <mesh position={[0.3, 0.5, 0.2]} castShadow>
                        <coneGeometry args={[0.15, 0.8, 4]} />
                        <meshStandardMaterial color="#a5f3fc" emissive="#00bcd4" emissiveIntensity={0.5} transparent opacity={0.85} />
                    </mesh>
                </group>
            )}
            {type === 'bush' && (
                <group>
                    <mesh position={[0, 0.4, 0]} castShadow>
                        <sphereGeometry args={[0.5, 8, 6]} />
                        <meshStandardMaterial color={color} />
                    </mesh>
                    <mesh position={[0.3, 0.3, 0.2]} castShadow>
                        <sphereGeometry args={[0.3, 6, 5]} />
                        <meshStandardMaterial color={color} />
                    </mesh>
                    <mesh position={[-0.2, 0.25, -0.2]} castShadow>
                        <sphereGeometry args={[0.35, 6, 5]} />
                        <meshStandardMaterial color={color} />
                    </mesh>
                </group>
            )}
        </group>
    );
};

const BaseCastle: React.FC<{ isSafe: boolean }> = ({ isSafe }) => {
    const wallHeight = 6;
    const wallThick = 1;
    const wallLen = 24;
    const towerH = 10;
    const towerW = 3;

    return (
        <group position={[0, 0, 0]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
                <planeGeometry args={[22, 22]} />
                <meshStandardMaterial color="#334155" roughness={0.8} />
            </mesh>
            {[[-12, -12], [12, -12], [-12, 12], [12, 12]].map(([x, z], i) => (
                <group key={i} position={[x, 0, z]}>
                    <mesh position={[0, towerH / 2, 0]} castShadow><boxGeometry args={[towerW, towerH, towerW]} /><meshStandardMaterial color="#1e293b" /></mesh>
                    <mesh position={[0, towerH + 1, 0]}><coneGeometry args={[2.5, 3, 4]} /><meshStandardMaterial color="#0f172a" /></mesh>
                </group>
            ))}
            <mesh position={[0, wallHeight / 2, -12]} castShadow><boxGeometry args={[wallLen, wallHeight, wallThick]} /><meshStandardMaterial color="#475569" /></mesh>
            <mesh position={[-8, wallHeight / 2, 12]} castShadow><boxGeometry args={[8, wallHeight, wallThick]} /><meshStandardMaterial color="#475569" /></mesh>
            <mesh position={[8, wallHeight / 2, 12]} castShadow><boxGeometry args={[8, wallHeight, wallThick]} /><meshStandardMaterial color="#475569" /></mesh>
            <mesh position={[0, wallHeight - 1, 12]} castShadow><boxGeometry args={[8, 2, wallThick]} /><meshStandardMaterial color="#334155" /></mesh>
            <mesh position={[12, wallHeight / 2, 0]} rotation={[0, Math.PI / 2, 0]} castShadow><boxGeometry args={[wallLen, wallHeight, wallThick]} /><meshStandardMaterial color="#475569" /></mesh>
            <mesh position={[-12, wallHeight / 2, 0]} rotation={[0, Math.PI / 2, 0]} castShadow><boxGeometry args={[wallLen, wallHeight, wallThick]} /><meshStandardMaterial color="#475569" /></mesh>

            {isSafe && (
                <Html position={[0, 9, 0]} center>
                    <div className="bg-green-900/80 text-green-200 px-3 py-1 rounded-full border border-green-500 font-bold text-xs shadow-[0_0_15px_green]">
                        GÜVENLİ BÖLGE (ANA ÜS)
                    </div>
                </Html>
            )}
        </group>
    );
};

const BorderWalls: React.FC<{ limit: number }> = ({ limit }) => (
    <group>
        <mesh position={[0, 5, -limit]}><boxGeometry args={[limit * 2, 10, 0.2]} /><meshBasicMaterial color="red" transparent opacity={0} /></mesh>
        <mesh position={[0, 5, limit]}><boxGeometry args={[limit * 2, 10, 0.2]} /><meshBasicMaterial color="red" transparent opacity={0} /></mesh>
        <mesh position={[limit, 5, 0]} rotation={[0, Math.PI / 2, 0]}><boxGeometry args={[limit * 2, 10, 0.2]} /><meshBasicMaterial color="red" transparent opacity={0} /></mesh>
        <mesh position={[-limit, 5, 0]} rotation={[0, Math.PI / 2, 0]}><boxGeometry args={[limit * 2, 10, 0.2]} /><meshBasicMaterial color="red" transparent opacity={0} /></mesh>
    </group>
);

// Minecraft Tarzı Özgün Portal
const PortalFrame: React.FC<{ portal: Portal }> = ({ portal }) => {
    const groupRef = useRef<THREE.Group>(null);
    const portalCoreRef = useRef<THREE.Mesh>(null);
    const particlesRef = useRef<THREE.Points>(null);
    const runeRingRef = useRef<THREE.Group>(null);

    // Portal rengi - hedef bölgeye göre
    const portalColor = useMemo(() => {
        const targetZone = portal.target;
        if (targetZone >= 11 && targetZone <= 19) return '#ef4444'; // Marsu - Kırmızı
        if (targetZone >= 21 && targetZone <= 29) return '#3b82f6'; // Terya - Mavi
        if (targetZone >= 31 && targetZone <= 39) return '#22c55e'; // Venu - Yeşil
        if (targetZone === 44) return '#a855f7'; // CZ - Mor
        return '#a855f7';
    }, [portal.target]);

    // Obsidyen rengi
    const obsidianColor = '#1a1a2e';

    // Animasyon
    useFrame((state) => {
        const t = state.clock.elapsedTime;

        // Yüzen hareket
        if (groupRef.current) {
            groupRef.current.position.y = Math.sin(t * 1.2) * 0.1;
        }

        // Portal merkezi dalgalanma
        if (portalCoreRef.current) {
            const scale = 1 + Math.sin(t * 3) * 0.05;
            portalCoreRef.current.scale.set(scale, scale, 1);
        }

        // Parçacıklar yukarı hareket
        if (particlesRef.current) {
            particlesRef.current.rotation.y = t * 0.3;
            const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
            for (let i = 0; i < positions.length; i += 3) {
                positions[i + 1] += 0.02;
                if (positions[i + 1] > 3) positions[i + 1] = 0;
            }
            particlesRef.current.geometry.attributes.position.needsUpdate = true;
        }

        // Rune halkası dönüşü
        if (runeRingRef.current) {
            runeRingRef.current.rotation.z = t * 0.5;
        }
    });

    // Parçacık pozisyonları
    const particlePositions = useMemo(() => {
        const positions = [];
        for (let i = 0; i < 80; i++) {
            const x = (Math.random() - 0.5) * 2;
            const y = Math.random() * 3;
            const z = (Math.random() - 0.5) * 0.5;
            positions.push(x, y, z);
        }
        return new Float32Array(positions);
    }, []);

    // Obsidyen blok pozisyonları (Minecraft portal çerçevesi)
    const frameBlocks = useMemo(() => {
        const blocks: [number, number, number][] = [];
        for (let x = -1; x <= 1; x++) blocks.push([x * 0.5, 0, 0]);
        for (let y = 1; y <= 4; y++) blocks.push([-1, y * 0.5, 0]);
        for (let y = 1; y <= 4; y++) blocks.push([1, y * 0.5, 0]);
        for (let x = -1; x <= 1; x++) blocks.push([x * 0.5, 2.5, 0]);
        return blocks;
    }, []);

    // Rune sembolleri
    const runePositions = useMemo(() => {
        const runes: [number, number, number][] = [];
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            runes.push([Math.cos(angle) * 1.3, Math.sin(angle) * 1.3 + 1.25, 0.1]);
        }
        return runes;
    }, []);

    return (
        <group position={[portal.x, 0.5, portal.z]}>
            <group ref={groupRef}>
                {/* Obsidyen Çerçeve */}
                {frameBlocks.map((pos, i) => (
                    <mesh key={i} position={pos} castShadow receiveShadow>
                        <boxGeometry args={[0.5, 0.5, 0.4]} />
                        <meshStandardMaterial color={obsidianColor} roughness={0.3} metalness={0.8} />
                    </mesh>
                ))}

                {/* Portal Merkezi */}
                <mesh ref={portalCoreRef} position={[0, 1.25, 0]}>
                    <planeGeometry args={[1.8, 2]} />
                    <meshStandardMaterial
                        color={portalColor}
                        emissive={portalColor}
                        emissiveIntensity={2}
                        transparent
                        opacity={0.7}
                        side={THREE.DoubleSide}
                    />
                </mesh>

                {/* İç katman */}
                <mesh position={[0, 1.25, -0.05]}>
                    <planeGeometry args={[1.6, 1.8]} />
                    <meshStandardMaterial color="#0a0a0a" transparent opacity={0.5} side={THREE.DoubleSide} />
                </mesh>

                {/* Dönen Rune Halkası */}
                <group ref={runeRingRef} position={[0, 1.25, 0.15]}>
                    {runePositions.map((pos, i) => (
                        <mesh key={i} position={pos}>
                            <boxGeometry args={[0.15, 0.15, 0.05]} />
                            <meshStandardMaterial color={portalColor} emissive={portalColor} emissiveIntensity={3} />
                        </mesh>
                    ))}
                </group>

                {/* Köşe Süslemeleri */}
                {[[-1, 0, 0], [1, 0, 0], [-1, 2.5, 0], [1, 2.5, 0]].map((pos, i) => (
                    <mesh key={`corner-${i}`} position={pos as [number, number, number]}>
                        <boxGeometry args={[0.6, 0.6, 0.5]} />
                        <meshStandardMaterial color="#2d1f4e" roughness={0.2} metalness={0.9} />
                    </mesh>
                ))}

                {/* Parçacıklar */}
                <points ref={particlesRef}>
                    <bufferGeometry>
                        <bufferAttribute attach="attributes-position" count={80} array={particlePositions} itemSize={3} />
                    </bufferGeometry>
                    <pointsMaterial color={portalColor} size={0.06} transparent opacity={0.8} sizeAttenuation />
                </points>

                {/* Işık */}
                <pointLight position={[0, 1.25, 0.5]} color={portalColor} intensity={4} distance={6} />
            </group>

            <Html position={[0, 3.2, 0]} center>
                <div className="flex flex-col items-center">
                    <div
                        className="text-white text-sm px-4 py-2 rounded-lg font-bold whitespace-nowrap backdrop-blur-md border-2 shadow-xl"
                        style={{
                            backgroundColor: `${portalColor}cc`,
                            borderColor: portalColor,
                            boxShadow: `0 0 20px ${portalColor}`
                        }}
                    >
                        🌀 {portal.name}
                    </div>
                </div>
            </Html>
        </group>
    );
}

const ProjectileMesh: React.FC<{ p: any }> = ({ p }) => {
    const ref = useRef<THREE.Group>(null);
    useFrame(() => {
        if (ref.current) {
            ref.current.position.set(p.x, p.y, p.z);
            ref.current.lookAt(p.x + p.vx, p.y, p.z + p.vz);
        }
    });
    return (
        <group ref={ref}>
            {p.type === 'arrow' && (
                <group rotation={[0, -Math.PI / 2, 0]}>
                    <mesh rotation={[0, 0, Math.PI / 2]}>
                        <cylinderGeometry args={[0.02, 0.02, 0.8]} />
                        <meshStandardMaterial color="white" />
                    </mesh>
                    <mesh position={[0.4, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
                        <coneGeometry args={[0.05, 0.1, 4]} />
                        <meshStandardMaterial color="gray" />
                    </mesh>
                </group>
            )}
            {p.type === 'fireball' && <mesh><sphereGeometry args={[0.3]} /><meshStandardMaterial color="orange" emissive="red" emissiveIntensity={2} /></mesh>}
            {p.type === 'spirit' && <mesh><sphereGeometry args={[0.2]} /><meshStandardMaterial color="#22c55e" emissive="#4ade80" emissiveIntensity={1} /></mesh>}
        </group>
    )
};

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * LOOT BOX COMPONENT - Gelişmiş Loot Kutusu Sistemi
 * 
 * KURALLAR:
 * - İlk 60 saniye: Sadece kutuyu düşüren oyuncu alabilir (KORUMALI)
 * - 60-120 saniye arası: Herkes alabilir (AÇIK)
 * - 120 saniye sonra: Kutu kaybolur (TIMEOUT)
 * - Otomatik toplama YOK - "AL" butonuna basılmalı
 * 
 * ⚠️ BU SİSTEM DEĞİŞTİRİLMEMELİ - Oyun ekonomisi için kritik!
 * ═══════════════════════════════════════════════════════════════════════════
 */
const VoxelLootBox: React.FC<{ box: LootBox, onClick: (box: LootBox) => void, playerNickname: string }> = ({ box, onClick, playerNickname }) => {
    const OWNER_LOCK_TIME = 60000; // 60 saniye sadece owner alabilir
    const TOTAL_LIFETIME = 120000; // 120 saniye sonra kaybolur

    const [currentTime, setCurrentTime] = useState(Date.now());

    // Timer for real-time updates
    useEffect(() => {
        const interval = setInterval(() => setCurrentTime(Date.now()), 1000);
        return () => clearInterval(interval);
    }, []);

    const timeSinceCreation = currentTime - box.createdAt;
    const timeUntilPublic = Math.max(0, OWNER_LOCK_TIME - timeSinceCreation);
    const timeUntilDespawn = Math.max(0, TOTAL_LIFETIME - timeSinceCreation);

    const isProtected = timeSinceCreation < OWNER_LOCK_TIME;
    const isOwner = box.ownerId === playerNickname;
    const canCollect = isOwner || !isProtected;

    // Determine Chest Model based on Tier
    const chestPath = useMemo(() => {
        if (box.tier >= 4) return '/models/props/chests/premium_chest.gltf';
        if (box.tier >= 2) return '/models/props/chests/medium_chest.gltf';
        return '/models/props/chests/normal_chest.gltf';
    }, [box.tier]);

    const { scene } = useGLTF(chestPath);
    const clonedScene = useMemo(() => {
        const s = scene.clone();
        s.traverse((child) => {
            if ((child as any).isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        return s;
    }, [scene]);

    const colors = { white: '#e2e8f0', blue: '#3b82f6', yellow: '#eab308', orange: '#f97316', red: '#ef4444', purple: '#a855f7' };
    const tierColor = colors[box.color as keyof typeof colors] || colors.white;

    // Format time display
    const formatTime = (ms: number) => Math.ceil(ms / 1000);

    return (
        <group position={[box.x, 0, box.z]}>
            {/* 3D CHEST MODEL */}
            <primitive object={clonedScene} scale={1.2} />

            {/* RARITY GLOW */}
            <pointLight position={[0, 0.5, 0]} color={tierColor} intensity={2} distance={3} />

            {/* UI OVERLAY */}
            <Html position={[0, 1.8, 0]} center style={{ pointerEvents: 'none' }}>
                <div className="pointer-events-auto flex flex-col items-center gap-1">
                    {/* Item Name (if exists) */}
                    {box.item && (
                        <div className="text-[10px] text-white bg-black/70 px-2 py-0.5 rounded border border-slate-600 whitespace-nowrap">
                            {box.item.name}
                        </div>
                    )}

                    {/* Main Button */}
                    <button
                        onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); if (canCollect) onClick(box); }}
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (canCollect) onClick(box); }}
                        onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); if (canCollect) onClick(box); }}
                        disabled={!canCollect}
                        className={`px-4 py-2 rounded-lg font-bold text-sm border-2 shadow-xl z-50 pointer-events-auto touch-manipulation transition-all
                            ${!canCollect
                                ? 'bg-slate-800 text-slate-400 border-slate-600 cursor-not-allowed opacity-80'
                                : 'bg-gradient-to-b from-green-500 to-green-700 text-white border-green-400 hover:from-green-400 hover:to-green-600 active:scale-95'
                            }`}
                    >
                        {canCollect ? '📦 AL' : `🔒 ${formatTime(timeUntilPublic)}sn`}
                    </button>

                    {/* Time Remaining Bar */}
                    <div className="w-16 h-1.5 bg-black/60 rounded-full overflow-hidden border border-slate-600">
                        <div
                            className={`h-full transition-all ${isProtected ? 'bg-yellow-500' : 'bg-green-500'}`}
                            style={{ width: `${(timeUntilDespawn / TOTAL_LIFETIME) * 100}%` }}
                        />
                    </div>

                    {/* Time Label */}
                    <div className="text-[9px] text-slate-300 bg-black/50 px-1.5 py-0.5 rounded">
                        {isProtected ? (
                            isOwner ? `Senin: ${formatTime(timeUntilDespawn)}sn` : `Kilitli: ${formatTime(timeUntilPublic)}sn`
                        ) : (
                            `Açık: ${formatTime(timeUntilDespawn)}sn`
                        )}
                    </div>
                </div>
            </Html>
        </group>
    );
};


const FloatingTextComponent: React.FC<{ data: FloatingText }> = ({ data }) => (
    <Html position={[data.x, data.y, data.z]} center><div className={`text-xl font-bold animate-bounce select-none ${data.color}`}>{data.text}</div></Html>
);

const ParticleEffect: React.FC<{ position: [number, number, number], color: string }> = ({ position, color }) => {
    const particles = useMemo(() => {
        return new Array(8).fill(0).map(() => ({
            velocity: [Math.random() - 0.5, Math.random() * 0.5 + 0.2, Math.random() - 0.5],
            offset: [0, 0, 0]
        }));
    }, []);
    const ref = useRef<THREE.Group>(null);
    useFrame((state, delta) => {
        if (ref.current) {
            ref.current.children.forEach((child, i) => {
                const p = particles[i];
                child.position.x += p.velocity[0] * delta * 5;
                child.position.y += p.velocity[1] * delta * 5;
                child.position.z += p.velocity[2] * delta * 5;
                const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
                mat.opacity -= delta * 2;
            });
        }
    });

    return (
        <group ref={ref} position={position}>
            {particles.map((_, i) => (
                <mesh key={i} position={[0, 1, 0]}>
                    <boxGeometry args={[0.2, 0.2, 0.2]} />
                    <meshStandardMaterial color={color} transparent opacity={1} emissive={color} />
                </mesh>
            ))}
        </group>
    )
}



const GLTFMob: React.FC<{ modelPath: string, scale?: number, isBoss?: boolean }> = ({ modelPath, scale = 1, isBoss }) => {
    const { scene } = useGLTF(modelPath);
    const groupRef = useRef<THREE.Group>(null);

    const clonedScene = useMemo(() => {
        const s = scene.clone();
        s.traverse((child) => {
            if ((child as any).isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        return s;
    }, [scene]);

    // Enhanced idle/walk animation
    useFrame((state) => {
        if (groupRef.current) {
            const t = state.clock.elapsedTime;
            // Face the camera/player (Fixed 180 degree rotation + small wobble)
            // Assuming default model faces +Z, we rotate Y by 180 (PI) to face -Z (towards camera usually)

            // Floating/Bouncing Effect (Breathing)
            groupRef.current.position.y = Math.sin(t * 2) * 0.05;

            // Walking/Wobble Effect (Rotation)
            if (isBoss) {
                groupRef.current.rotation.y = Math.PI + Math.sin(t * 0.5) * 0.1; // Slow boss sway
            } else {
                groupRef.current.rotation.y = Math.PI + Math.sin(t * 3) * 0.1; // Faster mob wobble
                groupRef.current.rotation.z = Math.sin(t * 3) * 0.05; // Slight side-to-side
            }
        }
    });

    return (
        <group ref={groupRef}>
            <primitive object={clonedScene} scale={scale} />
        </group>
    );
};

const VoxelMob: React.FC<{ position: [number, number, number], color: string, level: number, name: string, isHostile: boolean, isSelected: boolean, type: string, hitFlash?: number, hp: number, maxHp: number, modelPath?: string, playerRef?: any, entity?: any, hasBase?: boolean, playerLastAttackTime?: number }> = ({ position, color, level, name, isHostile, isSelected, type, hitFlash, hp, maxHp, modelPath, playerRef, entity, hasBase, playerLastAttackTime }) => {
    // 1. CONSTANTS & DEFINITIONS (Moved to top to fix scope issues)
    const isBoss = type === 'boss' || type.includes('boss') || (entity && entity.bossData);
    const isElite = type === 'elite';
    const isNPC = type === 'npc';
    const nameLower = name.toLowerCase();

    // 2. STATE & REFS
    const groupRef = useRef<any>(null);
    const [visualHp, setVisualHp] = useState(hp);
    const [botState, setBotState] = useState({ isMoving: false, isAttacking: false });

    // 3. INITIAL SETUP
    useEffect(() => {
        if (groupRef.current) {
            groupRef.current.position.set(position[0], 0, position[2]);
        }
    }, []);

    // 4. FRAME LOOP (Movement & HP Sync)
    useFrame((state, delta) => {
        // Sync Visual HP with Entity Ref HP (Polling)
        if (entity && entity.hp !== visualHp) {
            setVisualHp(entity.hp);
        }

        if (!isHostile || !playerRef?.current || !groupRef.current || !entity) return;
        if (isNPC) return; // NPCs don't move

        const px = playerRef.current.position.x;
        const pz = playerRef.current.position.z;
        const mx = groupRef.current.position.x;
        const mz = groupRef.current.position.z;
        let moving = false;
        let attacking = false;

        const dist = Math.sqrt(Math.pow(mx - px, 2) + Math.pow(mz - pz, 2));

        if (dist < 15 && dist > 2) {
            moving = true;
            const angle = Math.atan2(pz - mz, px - mx);
            const speed = 2.5 * delta;
            const newX = mx + Math.cos(angle) * speed;
            const newZ = mz + Math.sin(angle) * speed;

            // SAFE ZONE LOGIC (Mob Block)
            const isSafeZone = hasBase && Math.abs(newX) < 12 && Math.abs(newZ) < 12;
            const playerIsAggressive = playerLastAttackTime ? (Date.now() - playerLastAttackTime < 10000) : false;

            if (isSafeZone && !playerIsAggressive) {
                // Block Movement
                moving = false;
            } else {
                groupRef.current.position.x = newX;
                groupRef.current.position.z = newZ;
                groupRef.current.rotation.y = -angle + Math.PI / 2;

                // Ref Update (No React State Trigger)
                entity.x = newX * 15;
                entity.y = newZ * 15;
                entity.targetX = newX * 15;
                entity.targetY = newZ * 15;
            }
        } else if (dist <= 2.5) {
            // Attack range
            attacking = true;
            // Face player
            const angle = Math.atan2(pz - mz, px - mx);
            groupRef.current.rotation.y = -angle + Math.PI / 2;
        }

        // Throttle state updates to avoid React render spam (every 200ms approx via frame count or time)
        // Optimization: Only update if changed
        if (type === 'player') {
            if (botState.isMoving !== moving || botState.isAttacking !== attacking) {
                setBotState({ isMoving: moving, isAttacking: attacking });
            }
        }
    });

    // 5. VISUAL CALCULATIONS
    const isFlashing = hitFlash && (Date.now() - hitFlash < 100);
    const hpPct = Math.max(0, (visualHp / maxHp) * 100);

    const isAxolotl = nameLower.includes('aksolotl') || nameLower.includes('axolotl');
    const isPenguin = nameLower.includes('penguen') || nameLower.includes('penguin') || nameLower.includes('papağan') || nameLower.includes('parrot');
    const isCrab = nameLower.includes('yengeç') || nameLower.includes('crab');
    const isSlime = type === 'slime' || nameLower.includes('slime');
    const isFireDragon = nameLower.includes('ateş ejder') || nameLower.includes('fire dragon') || entity?.visual?.modelBase === 'fire_dragon';
    const isIceGiant = nameLower.includes('buz devi') || nameLower.includes('ice giant') || entity?.visual?.modelBase === 'ice_giant';
    const isShadowLord = nameLower.includes('gölge lord') || nameLower.includes('shadow lord') || entity?.visual?.modelBase === 'shadow_lord';
    const isStoneGolem = nameLower.includes('taş golem') || nameLower.includes('stone golem') || entity?.visual?.modelBase === 'stone_golem';
    const isWolf = nameLower.includes('wolf') || nameLower.includes('kurt') || entity?.visual?.modelBase === 'wolf';
    const isGoblin = nameLower.includes('goblin') || entity?.visual?.modelBase === 'goblin';
    const isBat = nameLower.includes('bat') || nameLower.includes('yarasa') || entity?.visual?.modelBase === 'bat';
    const isSkeleton = nameLower.includes('iskelet') || nameLower.includes('skeleton') || entity?.visual?.modelBase === 'skeleton';
    const isGolem = (nameLower.includes('golem') && !nameLower.includes('taş')) || entity?.visual?.modelBase === 'golem';

    // Dynamic Model Mapping
    const getMobModel = () => {
        const n = name.toLowerCase();
        // ... BOSSES ...
        if (isBoss) {
            if (n.includes('ateş ejderi') || n.includes('parrot boss')) return '/models/enemies/bosses/parrot%20bosses%20premium.gltf';
            if (n.includes('armadillo') || n.includes('armadil')) return '/models/enemies/bosses/armadillo%20bosses%20premium.gltf';
            if (n.includes('axolotl') || n.includes('aksolotl') || n.includes('dev aksolotl')) return '/models/enemies/bosses/axolotl%20bosses%20premium.gltf';
            if (n.includes('cat') || n.includes('kedi') || n.includes('dev kedi')) return '/models/enemies/bosses/cat%20bosses%20premium.gltf';
            if (n.includes('crab') || n.includes('yengeç') || n.includes('dev yengeç')) return '/models/enemies/bosses/crab%20bosses%20premium.gltf';
            if (n.includes('parrot') || n.includes('papağan') || n.includes('gardiyan')) return '/models/enemies/bosses/parrot%20bosses%20premium.gltf';
            if (n.includes('penguin') || n.includes('penguen')) return '/models/enemies/bosses/penguin%20bosses%20premium.gltf';
            return '/models/enemies/bosses/armadillo%20bosses%20premium.gltf';
        }

        // ... MOBS ...
        const useMedium = level >= 10;
        const variant = useMedium ? 'medium' : 'normal';

        if (n.includes('papağan') || n.includes('parrot') || n.includes('ateş papağanı')) return `/models/enemies/mobs/parrot%20${variant}.gltf`;
        if (n.includes('kedi') || n.includes('cat') || n.includes('kızıl kedi') || n.includes('buz kedisi') || n.includes('abyss kedisi')) return `/models/enemies/mobs/cat%20${variant}.gltf`;
        if (n.includes('aksolotl') || n.includes('axolotl') || n.includes('su aksolotlu') || n.includes('derin aksolotl')) return `/models/enemies/mobs/axolotl%20${variant}.gltf`;

        const mobTypes = ['axolotl', 'cat', 'parrot'];
        const randomType = mobTypes[Math.floor(Math.random() * mobTypes.length)];
        return `/models/enemies/mobs/${randomType}%20${variant}.gltf`;
    };

    const autoModelPath = getMobModel();
    const activeModelPath = modelPath || autoModelPath;

    let bodyScale = 1;
    if (type === 'player') bodyScale = 1.0; // SCALE FIX: Players always 1.0
    else if (isNPC) bodyScale = 0.8;
    else if (activeModelPath) bodyScale = isBoss ? 2.5 : 1.5;
    else {
        if (isBoss) bodyScale = 3;
        else if (isElite) bodyScale = 1.6;
        else if (isSlime) bodyScale = color === 'rainbow' ? 3 : 1.2;
    }

    const useVoxel = isAxolotl || isPenguin || isCrab || isSlime;

    // NPC Humanoid Fallback
    const NPCHumanoid = () => (
        <group position={[0, 0.7, 0]} scale={[0.8, 0.8, 0.8]}>
            <mesh position={[0, 0.6, 0]} castShadow><boxGeometry args={[0.35, 0.35, 0.35]} /><meshStandardMaterial color={color || '#fbbf24'} /></mesh>
            <mesh position={[0.08, 0.65, 0.18]}><boxGeometry args={[0.06, 0.06, 0.02]} /><meshStandardMaterial color="white" /></mesh>
            <mesh position={[-0.08, 0.65, 0.18]}><boxGeometry args={[0.06, 0.06, 0.02]} /><meshStandardMaterial color="white" /></mesh>
            <mesh position={[0, 0.15, 0]} castShadow><boxGeometry args={[0.4, 0.5, 0.25]} /><meshStandardMaterial color={color || '#3b82f6'} /></mesh>
        </group>
    );

    return (
        <group ref={groupRef} position={[position[0], 0, position[2]]} scale={[bodyScale, bodyScale, bodyScale]}>
            {/* Health Bar / Name Label - MINIMAL for mobs, HUD indicator for bosses */}
            <Html position={[0, isNPC ? 2.0 : 1.8, 0]} center style={{ pointerEvents: 'none' }}>
                <div className="flex flex-col items-center">
                    {/* Mob/NPC Name - small and minimal */}
                    {!isBoss && (
                        <div className={`text-[8px] font-bold ${isNPC ? 'text-yellow-400 text-xs' : isElite ? 'text-purple-400 text-[10px]' : 'text-white'} drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] whitespace-nowrap`}>
                            {isHostile ? `[${level}]` : ''} {name}
                        </div>
                    )}
                    {/* Boss Name - compact badge style */}
                    {isBoss && (
                        <div className="flex items-center gap-1 px-1.5 py-0.5 bg-black/60 rounded border border-red-500/50 backdrop-blur-sm" style={{ transform: `scale(${1 / bodyScale})` }}>
                            <span className="text-[8px]">💀</span>
                            <span className="text-[8px] font-bold text-white whitespace-nowrap">Lv.{level}</span>
                        </div>
                    )}
                    {/* HP Bar - Scaled inversely to bodyScale to look consistent */}
                    {isHostile && (isSelected || visualHp < maxHp) && (
                        <div
                            className={`bg-gray-900/90 rounded border border-gray-600 mt-1 overflow-hidden ${isBoss ? 'w-24 h-2' : 'w-8 h-1'}`}
                            style={{ transform: `scale(${1 / bodyScale})`, transformOrigin: 'top center' }}
                        >
                            <div className={`h-full transition-all duration-200 ${isBoss ? 'bg-red-600' : 'bg-red-500'}`} style={{ width: `${Math.min(100, (visualHp / (maxHp || 1)) * 100)}%` }} />
                        </div>
                    )}
                </div>
            </Html>

            <Suspense fallback={null}>
                {isNPC ? (
                    <NPCHumanoid />
                ) : isAxolotl ? (
                    <VoxelAxolotl color={color} isHostile={isHostile} />
                ) : isPenguin ? (
                    <VoxelPenguin isHostile={isHostile} variety={nameLower.includes('ateş') || nameLower.includes('fire') ? 'emperor' : 'normal'} />
                ) : isCrab ? (
                    <VoxelCrab color={color} isHostile={isHostile} />
                ) : isSlime ? (
                    <VoxelSlime color={color} isHostile={isHostile} />
                ) : isFireDragon ? (
                    <VoxelFireDragon />
                ) : isIceGiant ? (
                    <VoxelIceGiant />
                ) : isShadowLord ? (
                    <VoxelShadowLord />
                ) : isStoneGolem ? (
                    <VoxelStoneGolem />
                ) : isWolf ? (
                    <VoxelWolf />
                ) : isGoblin ? (
                    <VoxelGoblin />
                ) : isBat ? (
                    <VoxelBat />
                ) : isSkeleton ? (
                    <VoxelSkeleton />
                ) : isGolem ? (
                    <VoxelGolem />
                ) : modelPath ? (
                    <GLTFMob modelPath={modelPath} isBoss={isBoss} />
                ) : type === 'player' ? (
                    <VoxelSpartan
                        charClass={name.includes('Büyücü') ? 'archmage' : name.includes('Okçu') ? 'archer' : 'warrior'}
                        isMoving={botState.isMoving}
                        isAttacking={botState.isAttacking}
                        weaponItem={{ id: 'bot_sword', name: 'Bot Kılıcı', type: 'weapon', tier: level > 10 ? 2 : 1, rarity: 'common', value: 0, icon: '⚔️' }}
                    />
                ) : (
                    // Default generic cube mob
                    <group position={[0, 0.5, 0]}>
                        <mesh castShadow><boxGeometry args={[0.5, 0.5, 0.5]} /><meshStandardMaterial color={color} /></mesh>
                        <mesh position={[0.15, 0.1, 0.26]}><boxGeometry args={[0.1, 0.1, 0.05]} /><meshStandardMaterial color="white" /></mesh>
                        <mesh position={[-0.1, 0.1, 0.26]}><boxGeometry args={[0.1, 0.1, 0.05]} /><meshStandardMaterial color="white" /></mesh>
                    </group>
                )}
            </Suspense>
        </group>
    );
};

interface GameSceneProps {
    joystick: { x: number, y: number } | null;
    playerPosRef: React.MutableRefObject<{ x: number, y: number }>;
    setPlayerPosUI: (p: { x: number, y: number, rotation: number }) => void;
    entities: GameEntity[];
    setEntities: any;
    isAttacking: boolean;
    zoneColor: string;
    addFloatingText: any;
    playerStats: PlayerState;
    onUpdatePlayer: any;
    lootBoxes: LootBox[];
    onCollectLootBox: any;
    borderLimit: number;
    skillEffects: any;
    zoneId: number;
    isDead: boolean;
    setNearbyNPC: any;
    onLoot: any;
    onKill: any;
    portals: Portal[];
    onPortalJump: any;
    hasBase: boolean;
    playerGroupRef: React.MutableRefObject<THREE.Group | null>;
    projectiles: any[];
    setProjectiles: any;
    target: GameEntity | null;
    lastDamageTimeRef: React.MutableRefObject<number>;
    teleporting: { target: number, start: number } | null;
    setTeleporting: (val: { target: number, start: number } | null) => void;
    spawnParticles: any;
    isFreeLook: boolean;
    isAdmin?: boolean;
    onSpawnParticle: (pos: [number, number, number], color: string) => void;
    // SOCKET PROPS
    socketRef: React.MutableRefObject<Socket | null>;
    lastSocketUpdate: React.MutableRefObject<number>;
    remotePlayers: any[]; // ADDED
    targetedPlayer: any | null; // ADDED
    setTargetedPlayer: (player: any | null) => void; // ADDED
    // SKILL ANIMATION
    castingSkill?: number | null;
    setIsLoading: (loading: boolean) => void;
    entitiesRef: React.MutableRefObject<GameEntity[]>;
    setLootBoxes: any;
    lastAttackTimeRef: React.MutableRefObject<number>;
}



const GameScene: React.FC<GameSceneProps> = ({
    joystick, playerGroupRef, playerPosRef, setPlayerPosUI, playerStats, projectiles, setProjectiles,
    zoneId, entities, setEntities, onKill, onUpdatePlayer, addFloatingText, hasBase, borderLimit,
    lootBoxes, onCollectLootBox, portals, onPortalJump, isAttacking, skillEffects, isDead, setNearbyNPC, onLoot, zoneColor,
    target, lastDamageTimeRef, setTeleporting, spawnParticles, isFreeLook, teleporting, onSpawnParticle,
    socketRef, lastSocketUpdate, remotePlayers, targetedPlayer, setTargetedPlayer, castingSkill, setIsLoading, entitiesRef, setLootBoxes, lastAttackTimeRef
}) => {



    const { camera } = useThree();
    const controlsRef = useRef<any>(null);
    const lastMobAttackTime = useRef(0);

    const lastPortalCheck = useRef(0);
    const lastAIUpdate = useRef(0);

    // PERFORMANCE MONITOR START
    useEffect(() => {
        monitor.start();
        // Also attach to window here as a backup
        if (typeof window !== 'undefined') (window as any).monitor = monitor;
    }, []);
    const lastUIUpdate = useRef(0); // THROTTLE UI UPDATES

    const [decorations, setDecorations] = useState<any[]>([]);

    // 1️⃣ ZONE SYSTEM: Reset & Preload
    useEffect(() => {
        // Trigger Loading Screen
        setIsLoading(true);

        // CLEANUP: Remove old zone entities completely
        setEntities([]);
        // Force ref reset to prevent ghost updates in useFrame
        entitiesRef.current = [];
        setProjectiles([]);
        setLootBoxes([]); // Clear stale loot

        // ASSET PRELOAD MOCK: In a real scenario, useGLTF.preload(zoneAssets[zoneId]) would go here.
        // For now, we rely on global preloads and the generic loading screen.

        const t = setTimeout(() => setIsLoading(false), 1000); // 1s Loading Time
        return () => clearTimeout(t);
    }, [zoneId]);

    useEffect(() => {
        const items: any[] = [];
        const count = 200; // INCREASED for richer, fuller environment

        // Define zone-specific decoration sets
        type DecorationType = 'tree' | 'rock' | 'crystal' | 'lava_pool' | 'mushroom' | 'small_rock' | 'ice_spike' | 'bush';

        let decorationTypes: { type: DecorationType, color: string, weight: number }[] = [];

        // FIRE ZONES (Red colors) - Marsu
        if (zoneColor === '#450a0a' || zoneColor === '#7f1d1d' || zoneColor === '#991b1b') {
            decorationTypes = [
                { type: 'rock', color: '#78350f', weight: 30 },
                { type: 'lava_pool', color: '#ff4500', weight: 15 },
                { type: 'small_rock', color: '#451a03', weight: 40 },
                { type: 'mushroom', color: '#ef4444', weight: 15 }
            ];
        }
        // ICE/WATER ZONES (Blue colors) - Terya
        else if (zoneColor === '#172554' || zoneColor === '#1e3a8a' || zoneColor === '#1e40af') {
            decorationTypes = [
                { type: 'crystal', color: '#3b82f6', weight: 25 },
                { type: 'ice_spike', color: '#a5f3fc', weight: 30 },
                { type: 'small_rock', color: '#475569', weight: 25 },
                { type: 'rock', color: '#334155', weight: 20 }
            ];
        }
        // NATURE ZONES (Green colors) - Venu
        else if (zoneColor === '#14532d' || zoneColor === '#166534' || zoneColor === '#15803d') {
            decorationTypes = [
                { type: 'tree', color: '#15803d', weight: 30 },
                { type: 'bush', color: '#22c55e', weight: 25 },
                { type: 'mushroom', color: '#84cc16', weight: 20 },
                { type: 'small_rock', color: '#57534e', weight: 15 },
                { type: 'rock', color: '#44403c', weight: 10 }
            ];
        }
        // NEUTRAL/MIXED ZONES
        else {
            decorationTypes = [
                { type: 'rock', color: '#57534e', weight: 25 },
                { type: 'tree', color: '#3f2e18', weight: 20 },
                { type: 'small_rock', color: '#44403c', weight: 25 },
                { type: 'bush', color: '#65a30d', weight: 15 },
                { type: 'mushroom', color: '#a16207', weight: 15 }
            ];
        }

        // CZ Zone (44) - War zone with rocks and fire
        if (zoneId === 44) {
            decorationTypes = [
                { type: 'rock', color: '#78350f', weight: 35 },
                { type: 'small_rock', color: '#451a03', weight: 30 },
                { type: 'lava_pool', color: '#ff4500', weight: 10 },
                { type: 'crystal', color: '#a855f7', weight: 25 } // Mystic crystals
            ];
        }

        // Calculate total weight for random selection
        const totalWeight = decorationTypes.reduce((sum, d) => sum + d.weight, 0);

        // Helper function to pick random decoration type
        const pickDecorationType = () => {
            let random = Math.random() * totalWeight;
            for (const deco of decorationTypes) {
                random -= deco.weight;
                if (random <= 0) return deco;
            }
            return decorationTypes[0];
        };

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 15 + Math.random() * (borderLimit - 20);
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            const scale = 0.6 + Math.random() * 1.0;
            const rotation: [number, number, number] = [Math.random() * 0.2, Math.random() * Math.PI * 2, 0];

            const deco = pickDecorationType();
            items.push({
                id: `deco_${i}`,
                type: deco.type,
                pos: [x, 0, z] as [number, number, number],
                scale,
                color: deco.color,
                rotation
            });
        }
        setDecorations(items);
    }, [zoneId, zoneColor, borderLimit]);

    const handleGather = (id: any, type: string, pos: any) => {
        if (!playerGroupRef.current) return;
        const dx = pos[0] - playerGroupRef.current.position.x;
        const dz = pos[2] - playerGroupRef.current.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);

        if (dist > 5) {
            addFloatingText("Çok Uzak!", pos[0], 2, pos[2], 'text-red-500');
            soundManager.playSFX('error');
            return;
        }

        let itemDrop = null;
        let soundKey = 'click';
        let particleColor = '#8b4513';

        if (type === 'tree') {
            itemDrop = { id: `wood_log_${uuidv4()}`, name: 'Kütük', type: 'material', tier: 1, rarity: 'common', value: 10, icon: getMaterialIcon('wood_log').emoji };
            soundKey = 'gather_wood';
            particleColor = '#5D4037';
        }
        if (type === 'rock') {
            itemDrop = { id: `iron_ore_${uuidv4()}`, name: 'Demir Cevheri', type: 'material', tier: 1, rarity: 'uncommon', value: 20, icon: getMaterialIcon('iron_ore').emoji };
            soundKey = 'gather_rock';
            particleColor = '#757575';
        }
        if (type === 'crystal') {
            itemDrop = { id: `crystal_${uuidv4()}`, name: 'Kristal Parçası', type: 'material', tier: 2, rarity: 'rare', value: 50, icon: getMaterialIcon('diamond_ore').emoji };
            soundKey = 'gather_magic';
            particleColor = '#00B0FF';
        }

        if (itemDrop) {
            const updates: any = {
                inventory: [...playerStats.inventory, itemDrop]
            };
            updates.exp = playerStats.exp + 10;

            onUpdatePlayer(updates);
            addFloatingText(`+1 ${itemDrop.name}`, pos[0], 2, pos[2], 'text-green-400 font-bold');
            soundManager.playSFX(soundKey);

            // Visual Feedback
            onSpawnParticle(pos, particleColor);

            setDecorations(prev => prev.filter(d => d.id !== id));
        }
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setEntities((prev: GameEntity[]) => {
                const hostiles = prev.filter(e => e.isHostile);



                // DESPAWN LOGIC: Remove far away mobs to cycle new ones
                const playerX = playerGroupRef.current ? playerGroupRef.current.position.x : 0;
                const playerZ = playerGroupRef.current ? playerGroupRef.current.position.z : 0;

                // Filter out mobs that are too far (> 60 units) or out of bounds
                const activeMobs = prev.filter(e => {
                    const ex = e.x / 15;
                    const ez = e.y / 15;
                    const dist = Math.sqrt(Math.pow(ex - playerX, 2) + Math.pow(ez - playerZ, 2));

                    // Always keep bosses
                    if (e.type === 'boss' || e.name.includes('BOSS')) return true;

                    // Despawn if > 60 units away or out of border
                    if (dist > 60) return false;
                    if (Math.abs(ex) > borderLimit || Math.abs(ez) > borderLimit) return false;

                    return true;
                });

                // If we removed some mobs, update immediately before adding new ones
                if (activeMobs.length < prev.length) {
                    // Update state in next cycle to avoid conflicts, or just use filtered list for count
                }

                if (hostiles.length < 5) {
                    // DUNGEON LOGIC (Zone 99)
                    if (zoneId === 99) {
                        const hasBoss = activeMobs.some(e => e.type === 'slime' && e.color === 'rainbow');
                        const newDungeonMobs: GameEntity[] = [];

                        // 1. Spawn Boss if missing
                        if (!hasBoss && hostiles.length < 1) {
                            newDungeonMobs.push({
                                id: uuidv4(), type: 'slime', name: 'Gökkuşağı Slime Kralı (BOSS)',
                                x: 0, y: 0, hp: 100000, maxHp: 100000, level: 55,
                                isHostile: true, color: 'rainbow' // Rainbow Boss
                            });
                        }
                        // 2. Spawn Elite & Common Slimes if population low
                        else if (hostiles.length < 6) {
                            const angle = Math.random() * Math.PI * 2;
                            const dist = 8 + Math.random() * 12;
                            const isElite = Math.random() < 0.3; // 30% chance for Elite

                            if (isElite) {
                                newDungeonMobs.push({
                                    id: uuidv4(), type: 'slime', name: 'Zehirli Slime (Elit)',
                                    x: Math.cos(angle) * dist * 15, y: Math.sin(angle) * dist * 15,
                                    hp: 8000, maxHp: 8000, level: 40,
                                    isHostile: true, color: Math.random() > 0.5 ? '#a855f7' : '#ef4444' // Purple or Red
                                });
                            } else {
                                newDungeonMobs.push({
                                    id: uuidv4(), type: 'slime', name: 'Vıcık Slime',
                                    x: Math.cos(angle) * dist * 15, y: Math.sin(angle) * dist * 15,
                                    hp: 2500, maxHp: 2500, level: 35,
                                    isHostile: true, color: Math.random() > 0.5 ? '#22c55e' : '#3b82f6' // Green or Blue
                                });
                            }
                        }
                        return [...activeMobs, ...newDungeonMobs];
                    }

                    const zoneData = ZONE_CONFIG[zoneId];
                    if (!zoneData || !zoneData.enemies.length) return activeMobs;

                    const newMobs: GameEntity[] = [];
                    // CZ (44) Modu: %80 Bot ihtimali, Diğer yerler %20
                    const isCZ = zoneId === 44;
                    const spawnEnemyPlayer = Math.random() < (isCZ ? 0.8 : 0.2);

                    if (spawnEnemyPlayer) {
                        // Spawn closer to player but not on top (between 15 and 40 units)
                        const angle = Math.random() * Math.PI * 2;
                        const dist = 15 + Math.random() * 25;
                        const spawnX = (playerX + Math.cos(angle) * dist) * 15;
                        const spawnZ = (playerZ + Math.sin(angle) * dist) * 15;

                        // Ensure inside border
                        const zoneBaseLevel = zoneData.minLevel || 1;
                        // CZ'de botlar oyuncudan +5 level yüksek ve en az 30 level olsun
                        // FIX: Level cap to 30 (Max Level)
                        const levelBoost = isCZ ? 2 : 0;
                        const minBotLvl = isCZ ? 20 : zoneBaseLevel;
                        const maxBotLevel = 30; // Game Max Level

                        let botLevel = Math.max(minBotLvl, Math.min(maxBotLevel, playerStats.level + levelBoost));
                        if (botLevel > 30) botLevel = 30;

                        const botNames = ['Ares', 'Hades', 'Thor', 'Loki', 'Achilles', 'Leonidas', 'Spartacus', 'Maximus'];
                        const botName = isCZ
                            ? `[Gladyatör] ${botNames[Math.floor(Math.random() * botNames.length)]}`
                            : '[Rakip] Savaşçı';

                        // Bot has VoxelSpartan defined appearance implicitly via 'player' type handling in render
                        newMobs.push({
                            id: uuidv4(), type: 'player', name: botName,
                            x: spawnX, y: spawnZ,
                            hp: 800 * botLevel, maxHp: 800 * botLevel, level: botLevel,
                            isHostile: true, color: '#fb923c',
                            defense: botLevel * 5,
                            damage: botLevel * 10
                        });
                    } else {
                        // FIX: SAFE ZONE SPAWN LOGIC
                        // If safe zone, force spawn AWAY from center (Base)
                        const isSafeZone = !!zoneData.isSafeZone;
                        const safeRadius = 40; // Safe area radius

                        for (let i = 0; i < 2; i++) {
                            const template = zoneData.enemies[Math.floor(Math.random() * zoneData.enemies.length)];
                            let x = 0, y = 0;

                            if (hasBase || isSafeZone) {
                                // Spawn FAR from center
                                const angle = Math.random() * Math.PI * 2;
                                const minSpawnDist = isSafeZone ? safeRadius + 5 : 15;
                                const dist = minSpawnDist + Math.random() * 20;

                                x = (playerX + Math.cos(angle) * dist) * 15;
                                y = (playerZ + Math.sin(angle) * dist) * 15;

                                // Double check if inside safe circle
                                if (isSafeZone && Math.sqrt(x * x + y * y) < safeRadius * 15) {
                                    // Push out
                                    x = (x > 0 ? 1 : -1) * (safeRadius + 5) * 15;
                                }

                            } else {
                                const angle = Math.random() * Math.PI * 2;
                                const dist = 10 + Math.random() * 30;
                                x = (playerX + Math.cos(angle) * dist) * 15;
                                y = (playerZ + Math.sin(angle) * dist) * 15;
                            }

                            let type: EntityType = 'mob';
                            if (template.name && (template.name.includes('[BOSS]') || template.name.includes('Boss'))) {
                                type = 'boss';
                            }

                            newMobs.push({
                                id: uuidv4(), type: type, name: template.name || 'Düşman',
                                x, y, hp: template.hp || 100, maxHp: template.maxHp || 100,
                                level: template.level || 1, isHostile: true, color: template.color || 'red',
                                defense: template.defense ?? Math.floor((template.level || 1) * 5),
                                damage: template.damage ?? Math.floor((template.level || 1) * 10)
                            });
                        }
                    }
                    return [...activeMobs, ...newMobs];
                }
                return activeMobs;
            });
        }, 3000);
        return () => clearInterval(interval);
    }, [zoneId, hasBase, borderLimit, playerStats.level]);

    const checkZoneAccess = (targetZoneId: number) => {
        const targetZone = ZONE_CONFIG[targetZoneId];
        if (!targetZone) return false;

        const isOwnFaction = targetZone.factionOwner === playerStats.faction;
        const level = playerStats.level;

        if (!isOwnFaction && targetZone.factionOwner) {
            const z = targetZoneId;
            const isX1 = z === 11 || z === 21 || z === 31;
            const isX2 = z === 12 || z === 22 || z === 32;
            const isX3 = z === 13 || z === 23 || z === 33;
            const isX4 = z === 14 || z === 24 || z === 34;
            const isX5 = z === 15 || z === 25 || z === 35;
            const isX6 = z === 16 || z === 26 || z === 36;
            const isX7 = z === 17 || z === 27 || z === 37;
            const isX8 = z === 18 || z === 28 || z === 38;

            if (isX1 && level < 16) return false;
            if (isX2 && level < 13) return false;
            if ((isX3 || isX4) && level < 5) return false;
            if (isX5 && level < 14) return false;
            if ((isX6 || isX7) && level < 15) return false;
            if (isX8 && level < 17) return false;
        }

        if (targetZoneId === 41 || targetZoneId === 42 || targetZoneId === 43) {
            if (level < 8) return false;
        }

        if (targetZoneId === 44) {
            if (level < 9) return false;
        }

        return true;
    };



    // ... inside ActiveZoneView ...

    useFrame((state, delta) => {
        // PERF MONITOR TICK
        monitor.tickFrame(performance.now());
        monitor.updateRenderStats(entities.length, projectiles.length + spawnParticles.length);
        monitor.beginLoop(); // Start profiling CPU logic

        if (isDead) { monitor.endLoop(); return; }
        const speed = 8 * delta; // Reduced from 10 to 8 for smoother movement

        if (playerGroupRef.current) {
            const px = playerGroupRef.current.position.x;
            const pz = playerGroupRef.current.position.z;

            // FIXED: Removed force camera rotation override. Character should ONLY rotate based on movement input.
            // if (controlsRef.current && !isFreeLook) {
            //    const angle = controlsRef.current.getAzimuthalAngle();
            //    playerGroupRef.current.rotation.y = angle + Math.PI;
            // }

            if (Math.abs(px) >= borderLimit - 0.5 || Math.abs(pz) >= borderLimit - 0.5) {
                const now = Date.now();
                if (now - lastDamageTimeRef.current > 500) {
                    lastDamageTimeRef.current = now;
                    addFloatingText("ALAN DIŞI!", px, 2, pz, 'text-red-600 text-2xl font-black');
                    onUpdatePlayer({ hp: Math.max(0, playerStats.hp - 50) });
                }
            }

            if (Date.now() - lastPortalCheck.current > 500) {
                lastPortalCheck.current = Date.now();
                if (teleporting) {

                } else {
                    portals.forEach(p => {
                        const dist = Math.sqrt(Math.pow(p.x - px, 2) + Math.pow(p.z - pz, 2));
                        if (dist < 3) {
                            const timeSinceDamage = Date.now() - lastDamageTimeRef.current;
                            if (timeSinceDamage < 5000) {
                                addFloatingText("SAVAŞTASIN! (5s)", px, 4, pz, 'text-red-500 font-bold');
                            } else {
                                if (playerStats.level < p.levelReq || !checkZoneAccess(p.targetZone)) {
                                    addFloatingText("SEVİYE YETERSİZ!", px, 4, pz, 'text-red-500 font-bold');
                                } else {
                                    setTeleporting({ target: p.targetZone, start: Date.now() });
                                }
                            }
                        }
                    });
                }
            }

            // MOB ATTACK LOGIC WITH DEFENSE MECHANISM
            if (Date.now() - lastMobAttackTime.current > 1000) {
                lastMobAttackTime.current = Date.now();
                let damageTaken = 0;

                entities.forEach(ent => {
                    if (ent.isHostile) {
                        // SAFE ZONE PROTECTION: Check if player is in Safe Zone Radius (40 units)
                        const zoneData = ZONE_CONFIG[zoneId];
                        const isSafeZone = !!zoneData?.isSafeZone;
                        const distToCenter = Math.sqrt(px * px + pz * pz);

                        if (isSafeZone && distToCenter < 40) return; // NO DAMAGE IN SAFE ZONE

                        const dist = Math.sqrt(Math.pow(ent.x / 15 - px, 2) + Math.pow(ent.y / 15 - pz, 2));
                        if (dist < 2.5) {
                            const rawDmg = 20 + (ent.level * 5) + (ent.level > 20 ? 50 : 0);
                            const defenseMitigation = playerStats.defense * 0.5; // 1 Def = 0.5 DMG blocked
                            const actualDmg = Math.max(1, Math.floor(rawDmg - defenseMitigation));

                            damageTaken += actualDmg;
                            addFloatingText(`-${actualDmg}`, px, 2 + Math.random(), pz, 'text-red-600 font-bold text-2xl');
                            soundManager.playSFX('hit');
                        }
                    }
                });

                if (damageTaken > 0) {
                    onUpdatePlayer({ hp: Math.max(0, playerStats.hp - damageTaken) });
                    lastDamageTimeRef.current = Date.now();
                }
            }
        }

        /* 
         * PERFORMANCE FIX: DISABLED GLOBAL SETENTITIES LOOP
         * Mob movement is now handled locally in VoxelMob component via useFrame.
         * This prevents 'Black Screen' freeze caused by massive re-renders.
         */
        /*
        if (Date.now() - lastAIUpdate.current > 100) {
            lastAIUpdate.current = Date.now();
            setEntities((prev: GameEntity[]) => {
                if (!playerGroupRef.current) return prev;
                const px = playerGroupRef.current.position.x;
                const pz = playerGroupRef.current.position.z;

                return prev.map(ent => {
                    if (!ent.isHostile) return ent;
                    const ex = ent.x / 15;
                    const ez = ent.y / 15;
                    const dist = Math.sqrt(Math.pow(ex - px, 2) + Math.pow(ez - pz, 2));
                    if (dist < 15 && dist > 2) {
                        const angle = Math.atan2(pz - ez, px - ex);
                        const moveSpeed = 0.5 * 15;
                        return { ...ent, x: ent.x + Math.cos(angle) * moveSpeed, y: ent.y + Math.sin(angle) * moveSpeed };
                    }
                    return ent;
                });
            });
        }
        */

        if (joystick && playerGroupRef.current) {
            if (teleporting && (Math.abs(joystick.x) > 0.1 || Math.abs(joystick.y) > 0.1)) {
                setTeleporting(null);
                addFloatingText("İPTAL EDİLDİ", playerGroupRef.current.position.x, 3, playerGroupRef.current.position.z, 'text-yellow-500');
            }

            // ═══════════════════════════════════════════════════════════════
            // 8-YÖNLÜ HAREKET SİSTEMİ (Input Agnostic - Keyboard + Joystick)
            // ═══════════════════════════════════════════════════════════════

            // 1. Input değerlerini al (Horizontal: A/D veya Joystick X, Vertical: W/S veya Joystick Y)
            const inputX = joystick.x; // Sağ: +1, Sol: -1
            const inputZ = joystick.y; // İleri: +1, Geri: -1

            // 2. Deadzone kontrolü (yanlış dokunmaları engelle)
            const DEADZONE = 0.1;
            const isMoving = Math.abs(inputX) > DEADZONE || Math.abs(inputZ) > DEADZONE;

            if (isMoving) {
                // 3. Yön vektörünü oluştur
                let dirX = inputX;
                let dirZ = inputZ;

                // 4. NORMALIZE ET (Çapraz hız patlamasını önle!)
                // Eğer magnitude > 1 ise (çapraz hareket), normalize et
                const magnitude = Math.sqrt(dirX * dirX + dirZ * dirZ);
                if (magnitude > 1) {
                    dirX /= magnitude;
                    dirZ /= magnitude;
                }

                // 5. Karakter rotasyonunu hareket yönüne göre ayarla
                // HAREKET: position.z = position.z - moveZ (Z ters!)
                // Bu yüzden rotasyonda da Z'yi ters çevirmeliyiz: atan2(dirX, -dirZ)
                // W (ileri, dirZ=1): atan2(0, -1) = PI → sırt kameraya ✓
                // S (geri, dirZ=-1): atan2(0, 1) = 0 → yüz kameraya ✓
                // D (sağ, dirX=1): atan2(1, 0) = PI/2 → sağa ✓
                // A (sol, dirX=-1): atan2(-1, 0) = -PI/2 → sola ✓
                // !! BU FORMÜL DEĞİŞMEMELİ - ÇALIŞIYOR !!

                const targetAngle = Math.atan2(dirX, -dirZ);

                // Yumuşak dönüş (LERP) - akıcı geçiş
                const currentAngle = playerGroupRef.current.rotation.y;
                let angleDiff = targetAngle - currentAngle;

                // En kısa yolu bul (360 derece wrap)
                while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
                while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

                // Yumuşak dönüş - 0.25 hız
                playerGroupRef.current.rotation.y += angleDiff * 0.25;

                // 6. Hareket vektörünü uygula
                const moveX = dirX * speed; // D=sağa (+X), A=sola (-X)
                const moveZ = dirZ * speed; // W=ileri (dünya -Z), S=geri (dünya +Z)

                const newX = playerGroupRef.current.position.x + moveX;
                const newZ = playerGroupRef.current.position.z - moveZ; // Z ekseni ters

                // SAFE ZONE LOGIC (Player Block - Invader)
                let allowed = true;
                if (hasBase && Math.abs(newX) < 12 && Math.abs(newZ) < 12) {
                    // Inside Safe Zone
                    // Check if map belongs to my faction
                    const currentZone = ZONE_CONFIG[zoneId];
                    const isMyBase = currentZone && currentZone.factionOwner === playerStats.faction;

                    // If NOT my base (I am invading), block entry UNLESS in combat
                    if (!isMyBase) {
                        const inCombat = (Date.now() - lastDamageTimeRef.current < 10000) || (Date.now() - lastAttackTimeRef.current < 10000);
                        if (!inCombat) {
                            allowed = false;
                            addFloatingText("GÜVENLİ BÖLGE!", newX, 2, newZ, 'text-red-500 font-bold');
                        }
                    }
                }

                if (allowed) {
                    playerGroupRef.current.position.x = newX;
                    playerGroupRef.current.position.z = newZ;
                    playerPosRef.current.x = newX;
                    playerPosRef.current.y = newZ;
                }
            }

            // SOCKET EMIT
            if (socketRef.current && Date.now() - lastSocketUpdate.current > 50) {
                lastSocketUpdate.current = Date.now();
                socketRef.current.emit('player_move', {
                    x: playerGroupRef.current.position.x,
                    y: playerGroupRef.current.position.z,
                    rotation: playerGroupRef.current.rotation.y,
                    isMoving: isMoving,
                    isAttacking: isAttacking
                });
            }
        } else if (socketRef.current && Date.now() - lastSocketUpdate.current > 200) {
            // FIX: Send STOP signal if not moving (idle)
            lastSocketUpdate.current = Date.now();
            socketRef.current.emit('player_move', {
                x: playerGroupRef.current?.position.x || 0,
                y: playerGroupRef.current?.position.z || 0,
                rotation: playerGroupRef.current?.rotation.y || 0,
                isMoving: false,
                isAttacking: isAttacking
            });
        }

        if (target && isAttacking && playerGroupRef.current) {
            const dx = target.x / 15 - playerPosRef.current.x;
            const dz = target.y / 15 - playerPosRef.current.y;
            playerGroupRef.current.rotation.y = Math.atan2(dx, dz);
        }

        if (playerGroupRef.current && !isFreeLook) {
            const px = playerGroupRef.current.position.x;
            const pz = playerGroupRef.current.position.z;

            // MOBILE STYLE CAMERA: Fixed Offset, Smooth Follow
            // Camera position is always OFFSET from player, does NOT rotate with player
            const targetCamPos = new THREE.Vector3(px, 18, pz + 18); // High angle, 3rd person

            // LERP for smooth follow
            camera.position.lerp(targetCamPos, 0.1);

            // Always look at player's feet/center
            // We use a slight offset in lookAt to keep character lower on screen
            controlsRef.current.target.lerp(new THREE.Vector3(px, 0, pz), 0.1);
            controlsRef.current.update();

            // FORCE CAMERA UP-VECTOR to prevent flipping
            camera.up.set(0, 1, 0);
        }

        if (projectiles.length > 0) {
            setProjectiles((prev: any[]) => prev.map(p => ({
                ...p,
                x: p.x + p.vx * 20 * delta,
                z: p.z + p.vz * 20 * delta
            })).filter(p => Date.now() - p.createdAt < 1000));
        }

        if (playerGroupRef.current) {
            // THROTTLE UI (Minimap) UPDATE - 10 FPS
            if (Date.now() - lastUIUpdate.current > 100) {
                lastUIUpdate.current = Date.now();
                setPlayerPosUI({
                    x: playerGroupRef.current.position.x,
                    y: playerGroupRef.current.position.z,
                    rotation: playerGroupRef.current.rotation.y
                });
            }
            if (state.clock.getElapsedTime() % 0.5 < 0.1) {
                let foundNPC: GameEntity | null = null;
                entities.forEach(ent => {
                    if (ent.type === 'npc') {
                        const dist = Math.sqrt(Math.pow(ent.x / 15 - playerGroupRef.current!.position.x, 2) + Math.pow(ent.y / 15 - playerGroupRef.current!.position.z, 2));
                        if (dist < 3) foundNPC = ent;
                    }
                });
                setNearbyNPC(foundNPC);

                // AUTO-LOOT: Yakındaki loot kutularını otomatik topla
                if (playerStats.settings?.autoLoot && lootBoxes.length > 0) {
                    const px = playerGroupRef.current!.position.x;
                    const pz = playerGroupRef.current!.position.z;
                    lootBoxes.forEach(box => {
                        const dist = Math.sqrt(Math.pow(box.x - px, 2) + Math.pow(box.z - pz, 2));
                        if (dist < 3) { // 3 birim yakınlık
                            const isProtected = (Date.now() - box.createdAt) < 60000;
                            const isOwner = box.ownerId === playerStats.nickname;
                            if (!isProtected || isOwner) {
                                onCollectLootBox(box);
                            }
                        }
                    });
                }
            }
        }
        monitor.endLoop();
    });

    return (
        <>
            <OrbitControls ref={controlsRef} enabled={isFreeLook} makeDefault target={playerGroupRef.current ? playerGroupRef.current.position : undefined} maxPolarAngle={Math.PI / 2.1} minPolarAngle={0} />
            <ambientLight intensity={1.0} />
            <directionalLight position={[10, 20, 10]} intensity={1.5} />
            <pointLight position={[10, 10, 10]} intensity={0.8} />
            <color attach="background" args={['#1a1033']} />

            {/* Render Player Stalls in Safe Zones (11, 21, 31, 44) */}
            {[11, 21, 31, 44].includes(zoneId) && MOCK_STALLS.map((stall, i) => (
                <PlayerStall
                    key={i}
                    data={stall}
                    onClick={() => {
                        // In a real implementation, this would open the specific seller's listings
                        // For now, we alert (or could trigger onOpenMarket callback if we added it)
                        window.alert(`Bu tezgah ${stall.ownerName}'a ait. Tüm ürünleri görmek için Pazar sekmesini kullanın!`);
                    }}
                />
            ))}

            <Ground color={zoneColor} zoneId={zoneId} showGrid={false} />

            {/* 🌲 VOXEL TERRAIN - Minecraft Legends Style (TEMPORARILY DISABLED - will optimize) */}
            {/* 
            <VoxelTerrain
                zoneType={
                    // Fire zones (Marsu)
                    (zoneColor === '#450a0a' || zoneColor === '#7f1d1d' || zoneColor === '#991b1b') ? 'lava' :
                        // Ice zones (Terya)
                        (zoneColor === '#172554' || zoneColor === '#1e3a8a' || zoneColor === '#1e40af') ? 'snow' :
                            // Nature zones (Venu)
                            (zoneColor === '#14532d' || zoneColor === '#166534' || zoneColor === '#15803d') ? 'forest' :
                                // Void zones
                                (zoneColor === '#3b0764' || zoneColor === '#581c87') ? 'void' :
                                    // Default
                                    'forest'
                }
                radius={borderLimit - 10}
                density="medium"
                includeWater={zoneColor !== '#450a0a' && zoneColor !== '#7f1d1d'}
                includeLava={zoneColor === '#450a0a' || zoneColor === '#7f1d1d' || zoneColor === '#991b1b'}
            />
            */}


            <GameVFXOverlay />
            <BorderWalls limit={borderLimit} />
            {decorations.map(d => (<DecorationMesh key={d.id} id={d.id} type={d.type} pos={d.pos} scale={d.scale} color={d.color} rotation={d.rotation} onClick={handleGather} />))}

            {/* Castle only on x-1 and x-8 maps */}
            {hasBase && ([11, 21, 31, 18, 28, 38].includes(zoneId)) && <BaseCastle isSafe={[11, 21, 31].includes(zoneId)} />}

            {lootBoxes.map(box => <VoxelLootBox key={box.id} box={box} onClick={onCollectLootBox} playerNickname={playerStats.nickname} />)}
            {portals.map(p => <PortalFrame key={p.id} portal={p} />)}
            {projectiles.map(p => <ProjectileMesh key={p.id} p={p} />)}
            {spawnParticles.map((sp: any) => <ParticleEffect key={sp.id} position={sp.pos} color={sp.color} />)}

            <group ref={playerGroupRef}>
                <React.Suspense fallback={
                    <mesh position={[0, 1, 0]}>
                        <boxGeometry args={[0.5, 1.5, 0.5]} />
                        <meshStandardMaterial color="gray" wireframe />
                    </mesh>
                }>
                    <VoxelSpartan
                        charClass={playerStats.class || 'warrior'}
                        isAttacking={isAttacking}
                        isMoving={!!joystick && (Math.abs(joystick.x) > 0.1 || Math.abs(joystick.y) > 0.1)}
                        isSpinning={skillEffects?.whirlwind}
                        isCastingSkill={castingSkill}
                        wingType={playerStats?.equippedWing || null}
                        petType={playerStats?.equippedPet || null}
                        weaponItem={playerStats?.equipment?.weapon || null}
                        armorItem={playerStats?.equipment?.armor || null}
                        helmetItem={playerStats?.equipment?.helmet || null}
                        pantsItem={playerStats?.equipment?.pants || null}
                        necklaceItem={playerStats?.equipment?.necklace || null}
                        earringItem={playerStats?.equipment?.earring || null}
                        costumeId={playerStats?.equippedCostume || null}
                    />
                </React.Suspense>

                {playerStats?.settings?.showNames && (
                    <Html position={[0, 2.8, 0]} center zIndexRange={[50, 0]}>
                        {(() => {
                            const isVip = (playerStats.premiumUntil && playerStats.premiumUntil > Date.now()) ||
                                playerStats.nickname.includes('[GM]') ||
                                playerStats.nickname.includes('[YÖNETİM]');

                            return (
                                <div className="flex flex-col items-center pointer-events-none whitespace-nowrap">
                                    <div className={`text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-sm border mb-1 flex items-center gap-1 ${isVip
                                        ? 'bg-gradient-to-r from-amber-900/90 to-yellow-900/90 border-yellow-500 text-yellow-200 shadow-[0_0_10px_rgba(234,179,8,0.5)]'
                                        : 'bg-black/50 border-slate-600 text-white'
                                        }`}>
                                        {isVip && <Crown size={12} className="text-yellow-400 fill-yellow-400 animate-pulse" />}
                                        {playerStats.guildName ? <span className={isVip ? "text-yellow-100" : "text-yellow-400"}>[{playerStats.guildName}] </span> : ''}
                                        <span style={{
                                            color: isVip ? '#fef08a' : (playerStats.settings.nameColor || 'white'),
                                            textShadow: isVip ? '0 0 10px #eab308' : (playerStats.settings.nameColor ? `0 0 8px ${playerStats.settings.nameColor}` : 'none')
                                        }}>
                                            {playerStats.nickname}
                                        </span>
                                    </div>
                                    <div className="w-12 h-1 bg-black border border-slate-700 rounded-full overflow-hidden mb-0.5">
                                        <div className="h-full bg-red-600" style={{ width: `${(playerStats.hp / playerStats.maxHp) * 100}%` }} />
                                    </div>
                                    <div className="w-12 h-1 bg-black border border-slate-700 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-600" style={{ width: `${(playerStats.mana / playerStats.maxMana) * 100}%` }} />
                                    </div>
                                </div>
                            );
                        })()}
                    </Html>
                )}

                {/* Skill Effects Integration */}
                {/* Skill Effects Integration - REMOVED LEGACY */}
                {/* Logic handled by global SkillEffects overlay */}
                {teleporting && (
                    <mesh position={[0, 2.5, 0]}>
                        <ringGeometry args={[0.5, 0.6, 32, 1, 0, (Date.now() - teleporting.start) / 5000 * Math.PI * 2]} />
                        <meshBasicMaterial color="#a855f7" side={THREE.DoubleSide} />
                    </mesh>
                )}
            </group>

            {/* REMOTE PLAYERS (Socket IO) */}
            {remotePlayers.map(p => {
                const isVip = (p as any).isVip ||
                    p.nickname.includes('[GM]') ||
                    p.nickname.includes('[YÖNETİM]') ||
                    ((p as any).premiumUntil && (p as any).premiumUntil > Date.now());

                return (
                    <group key={p.id} position={[p.x, 0, p.y]} rotation={[0, p.rotation || 0, 0]}>
                        <React.Suspense fallback={null}>
                            <VoxelSpartan
                                charClass={p.class || 'warrior'}
                                isAttacking={p.isAttacking || false}
                                isMoving={p.isMoving || false}
                                weaponItem={p.equipment?.weapon}
                                armorItem={p.equipment?.armor}
                                helmetItem={p.equipment?.helmet}
                                pantsItem={p.equipment?.pants}
                                necklaceItem={p.equipment?.necklace}
                                earringItem={p.equipment?.earring}
                            />
                        </React.Suspense>
                        <Html position={[0, 2.5, 0]} center zIndexRange={[40, 0]}>
                            <div
                                className="flex flex-col items-center whitespace-nowrap cursor-pointer hover:scale-110 transition-transform pointer-events-auto"
                                onClick={() => setTargetedPlayer(p)}
                            >
                                <div className={`text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-sm border mb-1 flex items-center gap-1 ${targetedPlayer?.id === p.id ? 'ring-2 ring-yellow-400' : ''} ${isVip
                                    ? 'bg-gradient-to-r from-amber-900/90 to-yellow-900/90 border-yellow-500 text-yellow-200 shadow-[0_0_10px_rgba(234,179,8,0.5)]'
                                    : 'bg-black/50 border-slate-600 text-white'
                                    }`}>
                                    {isVip && <Crown size={12} className="text-yellow-400 fill-yellow-400 animate-pulse" />}
                                    <span className={isVip ? "text-yellow-100 drop-shadow-[0_0_5px_rgba(234,179,8,0.8)]" : ""}>
                                        {p.nickname} (Lv.{p.level})
                                    </span>
                                </div>
                            </div>
                        </Html>
                    </group>
                )
            })}

            {entities.map(ent => (
                <VoxelMob
                    key={ent.id}
                    position={[ent.x / 15, 0, ent.y / 15]}
                    color={ent.color || 'red'}
                    level={ent.level}
                    name={ent.name}
                    isHostile={ent.isHostile}
                    isSelected={target?.id === ent.id}
                    type={ent.type}
                    hitFlash={ent.hitFlash}
                    hp={ent.hp}
                    maxHp={ent.maxHp}
                    modelPath={ent.modelPath}
                    playerRef={playerGroupRef}
                    entity={ent}
                    hasBase={hasBase}
                    playerLastAttackTime={lastAttackTimeRef.current}
                />
            ))}
            {/* GameScene was using lastAttackTimeRef.current for logic too, it is passed down now */}
        </>
    );
};

const MiniMap: React.FC<{
    playerPos: { x: number, y: number, rotation: number },
    entities: GameEntity[],
    portals: Portal[],
    zoneLimit: number,
    onClick: () => void,
    smallMap: boolean
}> = ({ playerPos, entities, portals, zoneLimit, onClick, smallMap }) => {
    const mapSize = zoneLimit * 2;
    const getPct = (val: number) => ((val + zoneLimit) / mapSize) * 100;

    // Size logic based on smallMap prop
    const sizeClass = smallMap ? "w-20 h-20 md:w-24 md:h-24" : "w-32 h-32 md:w-40 md:h-40";

    return (
        <div onClick={onClick} className={`${sizeClass} bg-black/80 rounded-lg border-2 border-slate-600 relative overflow-hidden cursor-pointer hover:border-yellow-500 transition-all shadow-2xl pointer-events-auto`}>
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')]"></div>
            {portals.map(p => (<div key={p.id} className="absolute w-2 h-2 bg-purple-500 rounded-full -ml-1 -mt-1 shadow-[0_0_5px_purple]" style={{ left: `${getPct(p.x)}%`, top: `${getPct(p.z)}%` }} />))}
            {entities.map(e => {
                let color = 'bg-red-500';
                if (!e.isHostile) color = 'bg-green-500';
                if (e.type === 'player' && e.isHostile) color = 'bg-orange-500';
                return (<div key={e.id} className={`absolute w-1.5 h-1.5 rounded-full -ml-0.5 -mt-0.5 ${color}`} style={{ left: `${getPct(e.x / 15)}%`, top: `${getPct(e.y / 15)}%` }} />);
            })}
            <div className="absolute w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[8px] border-b-yellow-400 -ml-1 -mt-1 z-10" style={{ left: `${getPct(playerPos.x)}%`, top: `${getPct(playerPos.y)}%`, transform: `rotate(${-playerPos.rotation * (180 / Math.PI)}deg)` }} />

            <div className="absolute bottom-0 w-full flex justify-between px-1 bg-black/60 text-[8px] border-t border-slate-700/50 items-center">
                {!smallMap && <span className="text-slate-300">Radar</span>}
                <span className="text-yellow-400 font-mono">{Math.round(playerPos.x)},{Math.round(playerPos.y)}</span>
            </div>
        </div>
    );
};

// ... SchematicMap and LocalZoneMap ...


const LocalZoneMap: React.FC<{ zoneId: number, playerPos: { x: number, y: number }, entities: GameEntity[], onClose: () => void, onZoneSwitch: (id: number) => void, transparent?: boolean }> = ({ zoneId, playerPos, entities, onClose, onZoneSwitch, transparent }) => {
    const config = ZONE_CONFIG[zoneId];
    if (!config) return null;
    const zoneLimit = 100; // Same as MiniMap zoneLimit
    const mapSize = zoneLimit * 2; // 200x200 total area
    const getPos = (val: number) => ((val + zoneLimit) / mapSize) * 100;

    return (
        <div className={`fixed inset-0 z-[80] flex items-center justify-center p-4 ${transparent ? 'pointer-events-none bg-transparent' : 'bg-black/90 pointer-events-auto'}`}>
            <div className={`relative w-full max-w-4xl aspect-square md:aspect-video border-4 border-[#5e4b35] rounded-xl flex flex-col overflow-hidden shadow-2xl transition-opacity ${transparent ? 'opacity-50 bg-black/40' : 'bg-[#0f0a06]'}`}>
                <div className="flex justify-between items-center p-4 bg-[#1a120b] border-b border-[#3f2e18] pointer-events-auto">
                    <div><h2 className="text-2xl rpg-font text-white">{config.name}</h2><div className="text-xs text-slate-400">YEREL HARİTA (KROKİ) - Canlı Takip</div></div>
                    <button onClick={onClose} className="p-2 bg-red-900/50 text-white rounded hover:bg-red-700"><X /></button>
                </div>
                <div className="flex-1 relative bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] bg-[#222]">
                    <div className="absolute inset-4 border-2 border-dashed border-slate-600/50 rounded-lg overflow-hidden">
                        <div className="absolute top-1/2 left-0 w-full h-px bg-slate-700/30" />
                        <div className="absolute left-1/2 top-0 h-full w-px bg-slate-700/30" />

                        {/* PORTALS */}
                        {config.portals.map(portal => (
                            <div key={portal.id} className="absolute w-8 h-8 -ml-4 -mt-4 flex flex-col items-center justify-center cursor-help z-10 pointer-events-auto group" style={{ left: `${getPos(portal.x)}%`, top: `${getPos(portal.z)}%` }} title={`Oraya yürüyerek gidin: ${portal.name}`}>
                                <div className="w-4 h-4 rounded-full bg-purple-500 animate-pulse shadow-[0_0_10px_purple]" />
                                <div className="bg-black/80 text-purple-200 text-[9px] px-2 py-1 rounded whitespace-nowrap border border-purple-800 mt-1 max-w-[120px] text-center">{portal.name}</div>
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-red-900/90 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity border border-red-500 pointer-events-none z-50">
                                    Işınlanmak için oraya git!
                                </div>
                            </div>
                        ))}

                        {/* ENTITIES (Mobs, NPCs, Players) */}
                        {entities.map(e => {
                            let colorClass = 'bg-red-500';
                            let sizeClass = 'w-3 h-3';
                            let label = '';

                            if (e.type === 'npc') {
                                colorClass = 'bg-blue-400 border border-white';
                                sizeClass = 'w-4 h-4';
                                label = e.name;
                            } else if (e.type === 'player' && e.isHostile) {
                                colorClass = 'bg-orange-600 animate-pulse';
                                sizeClass = 'w-4 h-4';
                                label = e.name;
                            } else if (e.type === 'boss') {
                                colorClass = 'bg-red-600 border border-red-300 animate-pulse';
                                sizeClass = 'w-5 h-5';
                                label = e.name;
                            } else if (!e.isHostile) {
                                colorClass = 'bg-green-500';
                            }

                            // Convert world coordinates (e.x, e.y are in world units * 15)
                            const mapX = e.x / 15;
                            const mapY = e.y / 15;

                            return (
                                <div
                                    key={e.id}
                                    className={`absolute ${sizeClass} rounded-full ${colorClass} shadow-md z-10 flex items-center justify-center group`}
                                    style={{
                                        left: `${getPos(mapX)}%`,
                                        top: `${getPos(mapY)}%`,
                                        marginLeft: '-0.5rem',
                                        marginTop: '-0.5rem'
                                    }}
                                >
                                    {/* Tooltip on Hover */}
                                    {label && (
                                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black/90 text-white text-[9px] px-2 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 border border-slate-600">
                                            {label}
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* PLAYER (SELF) */}
                        <div className="absolute w-4 h-4 bg-yellow-400 border-2 border-white rounded-full -ml-2 -mt-2 shadow-[0_0_10px_yellow] z-20" style={{ left: `${getPos(playerPos.x)}%`, top: `${getPos(playerPos.y)}%` }}>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ... GlobalMapModal ...

// ... ActiveZoneView ...
// (Need to update usage below)


const GlobalMapModal: React.FC<{ onClose: () => void, currentZone: number, onSwitchZone: (id: number) => void }> = ({ onClose, currentZone, onSwitchZone }) => {
    return (
        <div className="fixed inset-0 z-[90] bg-black/90 flex items-center justify-center p-4">
            <div className="relative w-full max-w-6xl h-[85vh] bg-[#0f0a06] border-4 border-[#5e4b35] rounded-xl shadow-2xl flex flex-col overflow-hidden">
                <div className="flex justify-between items-center p-4 bg-[#1a120b] border-b border-[#3f2e18]">
                    <h2 className="text-2xl rpg-font text-yellow-500 flex items-center gap-2"><Globe size={24} /> DÜNYA HARİTASI</h2>
                    <button onClick={onClose} className="p-2 bg-red-900/50 text-white rounded hover:bg-red-700"><X /></button>
                </div>
                <div className="flex-1 relative bg-[#0f0a06] overflow-auto flex items-center justify-center p-8">
                    <div className="relative w-full max-w-5xl aspect-[16/9] flex items-center justify-center border-2 border-slate-800 rounded-lg">
                        <SchematicMap activeZone={currentZone} onZoneSelect={(id) => {
                            // Only allow switching to connected nodes if implemented, for now just view
                            // If admin/debug allow switch? No, keep it view only for immersion unless portal
                        }} />
                    </div>
                </div>
            </div>
        </div>
    );
}

// EXIT CONFIRMATION MODAL WITH 10 SECOND COUNTDOWN
const ExitConfirmModal: React.FC<{ onConfirm: () => void, onCancel: () => void }> = ({ onConfirm, onCancel }) => {
    const [countdown, setCountdown] = useState(10);
    const [autoExit, setAutoExit] = useState(true);

    useEffect(() => {
        if (countdown <= 0 && autoExit) {
            onConfirm();
            return;
        }

        const timer = setTimeout(() => {
            setCountdown(prev => prev - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [countdown, autoExit, onConfirm]);

    return (
        <div className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-4 animate-[fadeIn_0.2s]">
            <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-red-800/50 rounded-2xl p-8 w-96 shadow-[0_0_50px_rgba(220,38,38,0.3)] animate-[bounceIn_0.3s]">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-gradient-to-b from-red-900 to-red-950 rounded-full border-4 border-red-600/50 flex items-center justify-center shadow-lg">
                        <span className="text-4xl">🚪</span>
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-center text-red-400 mb-2">Oyundan Çıkmak İstiyor musun?</h2>
                <p className="text-center text-slate-400 text-sm mb-6">Emin misin? İlerleme kaydedilecek.</p>

                {/* Countdown Circle */}
                <div className="flex justify-center mb-6">
                    <div className="relative w-24 h-24">
                        <svg className="w-24 h-24 transform -rotate-90">
                            <circle
                                cx="48"
                                cy="48"
                                r="40"
                                stroke="rgba(220, 38, 38, 0.2)"
                                strokeWidth="8"
                                fill="none"
                            />
                            <circle
                                cx="48"
                                cy="48"
                                r="40"
                                stroke="#dc2626"
                                strokeWidth="8"
                                fill="none"
                                strokeLinecap="round"
                                strokeDasharray={251.2}
                                strokeDashoffset={251.2 - (countdown / 10) * 251.2}
                                className="transition-all duration-1000"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-3xl font-bold text-red-400">{countdown}</span>
                        </div>
                    </div>
                </div>

                <p className="text-center text-xs text-slate-500 mb-6">
                    {autoExit ? `${countdown} saniye içinde otomatik çıkış...` : 'Geri sayım durduruldu'}
                </p>

                {/* Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={() => {
                            setAutoExit(false);
                            onCancel();
                        }}
                        className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg border border-slate-600 transition-all"
                    >
                        İptal
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg border border-red-500 transition-all shadow-lg shadow-red-900/50"
                    >
                        Çıkış Yap
                    </button>
                </div>
            </div>
        </div>
    );
};

const ActiveZoneView: React.FC<ActiveZoneViewProps> = (props) => {
    const { playerState, zoneId, onLoot, onQuestProgress, onUpdatePlayer, onExit, onOpenCrafting, onOpenMarket, socketRef, onReceiveChat } = props;

    // Is Mounted Ref to track zone changes vs initial mount
    const isMountedRef = useRef(false);

    // Get settings from context
    const { settings } = useSettings();

    // HUD Layout State - Sadece DEFAULT_HUD_LAYOUT kullan
    const [hudLayout, setHudLayout] = useState<HUDLayout>(() => {
        // Doğrudan yeni default layout kullan - basit ve temiz
        return JSON.parse(JSON.stringify(DEFAULT_HUD_LAYOUT));
    });

    // Register Player Location for VFX
    // Register Player Location for VFX
    useEffect(() => {
        if (!playerState.nickname) return;

        // Self Key Logic - Must match handleSkill
        const selfKey = playerState.userId
            ? `user:${playerState.userId}`
            : (socketRef.current?.id ? `socket:${socketRef.current.id}` : `player:${playerState.nickname}`);

        vfxManager.registerEntityLocationProvider(selfKey, () => {
            if (playerGroupRef.current) {
                return [playerGroupRef.current.position.x, playerGroupRef.current.position.y, playerGroupRef.current.position.z];
            }
            return [0, 0, 0];
        });

        return () => {
            vfxManager.unregisterEntityLocationProvider(selfKey);
        };
    }, [playerState.nickname, playerState.userId, socketRef.current?.id]);

    // --- POSITION PERSISTENCE ---
    useEffect(() => {
        // MOUNT: Load saved position
        try {
            const saved = localStorage.getItem(`lastPos_${playerState.nickname}`);
            if (saved) {
                const parsed = JSON.parse(saved);
                // Only override if current prop is zero/default (to prevent overwriting server data if valid)
                // But user complained about 0,0 reset, so likely prop is failing.
                if (!playerState.lastPosition || (playerState.lastPosition.x === 0 && playerState.lastPosition.z === 0)) {
                    console.log("📍 Restoring Position:", parsed);
                    // We need to update the REF directly because the game loop uses it
                    // Assuming playerPosRef is defined later, BUT we are inside the component closure.
                    // WAIT: playerPosRef is defined later in the code (line 1954). 
                    // Accessing it here might be tricky if it's not hoisted or if this effect runs before ref assignment (it won't, effects run after render).
                    // However, we can't reference a variable declared with `const` later in the same scope legally in JS/TS inside the effect function 
                    // if the effect function closure captures it? Actually `const` is block scoped.
                    // The ref is declared in the component body. Effect callback runs after mount.
                    // So IT IS SAFE if the variable is declared in the component scope.
                    // BUT TypeScript might complain "Block-scoped variable 'playerPosRef' used before its declaration".

                    // WORKAROUND: We will trigger a state update that forces the game loop to respect this,
                    // OR we just use localStorage in the `playerPosRef` initialization (which I should have done but couldn't find the line).

                    // Let's use `onUpdatePlayer` to sync back to parent at least.
                    if (onUpdatePlayer) {
                        onUpdatePlayer({ lastPosition: { x: parsed.x, y: 0, z: parsed.z } });
                    }
                }
            }
        } catch (e) { }

        return () => {
            // UNMOUNT: Save position
            // We can't access playerPosRef here if it is declared later.
            // We need to rely on `onExit` wrapper or `playerPosRef` being moved up.
        };
    }, []);

    const [entities, setEntities] = useState<GameEntity[]>([]);

    // --- PERFORMANCE OPTIMİZASYONU: Ref Based Entity Tracking ---
    const entitiesRef = useRef<GameEntity[]>([]);
    // Sadece spawn/kill durumunda state değişir, bu da ref'i günceller
    useEffect(() => {
        entitiesRef.current = entities;
    }, [entities]);

    // --- LOADING SCREEN ---
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        // Asset loading süresi + kullanıcı algısı için
        // Gerçekte useGLTF.preload yukarıda yapıldı, burada sadece bekliyoruz.
        const t = setTimeout(() => setIsLoading(false), 2000);
        return () => clearTimeout(t);
    }, []);

    const [lootBoxes, setLootBoxes] = useState<LootBox[]>([]);
    const [projectiles, setProjectiles] = useState<any[]>([]);
    const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);

    // ═══════════════════════════════════════════════════════════════════════════
    // LOOT BOX TIMEOUT CLEANUP - 120 saniye sonra kutular kaybolur
    // Bu sistem oyun ekonomisi için kritik! DEĞİŞTİRMEYİN!
    // ═══════════════════════════════════════════════════════════════════════════
    useEffect(() => {
        const LOOT_BOX_LIFETIME = 120000; // 120 saniye
        const cleanupInterval = setInterval(() => {
            const now = Date.now();
            setLootBoxes(prev => prev.filter(box => (now - box.createdAt) < LOOT_BOX_LIFETIME));
        }, 5000); // Her 5 saniyede kontrol et

        return () => clearInterval(cleanupInterval);
    }, []);

    // ANTI-BOT SYSTEM
    const antiBotRef = useRef<AntiBotState>(createAntiBotState());

    // Reset anti-bot on zone change
    useEffect(() => {
        antiBotRef.current = createAntiBotState();
    }, [zoneId]);

    // MULTIPLAYER STATE
    const [remotePlayers, setRemotePlayers] = useState<any[]>([]);
    // socketRef comes from props now
    const lastSocketUpdate = useRef(0);
    const [duelChallenge, setDuelChallenge] = useState<{ challengerId: string, challengerName: string, challengerLevel: number } | null>(null);
    const [activeDuel, setActiveDuel] = useState<{ opponentId: string, opponentName: string, duelId: string } | null>(null);
    const [targetedPlayer, setTargetedPlayer] = useState<any | null>(null); // Remote player we clicked on

    // Removed redundant chat state (handled by ChatSystem)

    const [joystick, setJoystick] = useState<{ x: number, y: number } | null>(null);
    const [isAttacking, setIsAttacking] = useState(false);
    const [skillEffects, setSkillEffects] = useState<any>({});
    const [cooldowns, setCooldowns] = useState<Record<string, number>>({});
    const [showInventory, setShowInventory] = useState(false);
    const [blacksmithState, setBlacksmithState] = useState<{ isOpen: boolean, tab: 'repair' | 'enhance' | 'craft' | 'market' }>({ isOpen: false, tab: 'market' });
    const [showMap, setShowMap] = useState(false);
    const [showChat, setShowChat] = useState(true);
    const [showGlobalMap, setShowGlobalMap] = useState(false);
    const [showGameGuide, setShowGameGuide] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showFullSettings, setShowFullSettings] = useState(false);
    const [showAchievements, setShowAchievements] = useState(false);
    const [showDailyReward, setShowDailyReward] = useState(false);
    const [showExitConfirm, setShowExitConfirm] = useState(false);
    const [exitCountdown, setExitCountdown] = useState<number | null>(null);
    const [showParty, setShowParty] = useState(false);
    const [showGuild, setShowGuild] = useState(false);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [showPlayerStats, setShowPlayerStats] = useState(false);
    const [showSkills, setShowSkills] = useState(false);
    const [showQuests, setShowQuests] = useState(false);
    const [showMarketOverlay, setShowMarketOverlay] = useState(false);
    const [debugPanelLeft, setDebugPanelLeft] = useState(true); // Debug panel sol mu sağ mı
    const [marketTab, setMarketTab] = useState<'koy_pazari' | 'oyuncu_pazari' | 'magaza'>('koy_pazari');

    // --- RESPONSIVE MOBILE CHECK ---
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const [nearbyNPC, setNearbyNPC] = useState<GameEntity | null>(null);
    const [interactingNPC, setInteractingNPC] = useState<NPCData | null>(null);
    const [playerPosUI, setPlayerPosUI] = useState({ x: 0, y: 0, rotation: 0 });
    const [teleporting, setTeleporting] = useState<{ target: number, start: number } | null>(null);
    const [target, setTarget] = useState<GameEntity | null>(null);
    const [playerAction, setPlayerAction] = useState<'idle' | 'attack' | 'shoot' | null>(null);

    // Visual Effects
    const [particles, setParticles] = useState<any[]>([]);

    // 🎮 BOSS PHASE VISUAL FEEDBACK HOOK
    const { currentPhase: bossPhase, auraColor: bossAuraColor, isShaking } = useBossPhaseFX({
        onPhaseChange: (phase, config) => {
            // Log phase change
            console.log(`[BossPhase] Boss entered phase ${phase}`, config);
            // Show visual feedback
            if (phase === 2) {
                addFloatingText('⚠️ BOSS PHASE 2!', playerPosRef.current?.x || 0, 5, playerPosRef.current?.y || 0, 'text-orange-500 font-bold text-xl animate-pulse');
            } else if (phase === 3) {
                addFloatingText('🔥 BOSS ENRAGED!', playerPosRef.current?.x || 0, 5, playerPosRef.current?.y || 0, 'text-red-600 font-extrabold text-2xl animate-bounce');
            }
        },
        enableScreenShake: true,
        enableAura: true
    });

    // --- VFX IDENTITY SYSTEM (FUTURE-PROOF) ---
    const trackedKeysRef = useRef<Set<string>>(new Set());
    const socketToKeyRef = useRef<Map<string, string>>(new Map());

    // Helper Refs for stable callbacks
    const latestRemotePlayersRef = useRef(remotePlayers);
    const latestEntitiesRef = useRef(entities);

    // Sync Refs
    useEffect(() => { latestRemotePlayersRef.current = remotePlayers; }, [remotePlayers]);
    useEffect(() => { latestEntitiesRef.current = entities; }, [entities]);

    const getEntityKey = (p: any): string => {
        return p.userId ? `user:${p.userId}` : `socket:${p.id || p.socketId}`;
    };

    // 1. MANAGE REMOTE PLAYER IDENTITIES & VFX REGISTRY
    useEffect(() => {
        const currentSockets = new Set<string>();

        remotePlayers.forEach(p => {
            const socketId = p.id;
            currentSockets.add(socketId);

            const newKey = getEntityKey(p);
            const oldKey = socketToKeyRef.current.get(socketId);

            if (oldKey && oldKey !== newKey) {
                console.log(`[VFX] Remapping Identity: ${oldKey} -> ${newKey}`);
                vfxManager.remapEntityLocationProvider(oldKey, newKey);
                socketToKeyRef.current.set(socketId, newKey);
                trackedKeysRef.current.delete(oldKey);
                trackedKeysRef.current.add(newKey);
            } else if (!trackedKeysRef.current.has(newKey)) {
                vfxManager.registerEntityLocationProvider(newKey, () => {
                    const list = latestRemotePlayersRef.current;
                    const target = list.find(rp => getEntityKey(rp) === newKey);
                    if (target) return [target.x, 0, target.y];
                    return null;
                });
                socketToKeyRef.current.set(socketId, newKey);
                trackedKeysRef.current.add(newKey);
            }
        });

        for (const [sId, key] of socketToKeyRef.current.entries()) {
            if (!currentSockets.has(sId)) {
                vfxManager.unregisterEntityLocationProvider(key);
                socketToKeyRef.current.delete(sId);
                trackedKeysRef.current.delete(key);
            }
        }
    }, [remotePlayers]);

    // 2. REGISTER MOBS (Entities)
    useEffect(() => {
        entities.forEach(e => {
            const key = `mob:${e.id}`;
            if (!trackedKeysRef.current.has(key)) {
                vfxManager.registerEntityLocationProvider(key, () => {
                    const ent = latestEntitiesRef.current.find(en => en.id === e.id);
                    if (ent) return [ent.x / 15, 0, ent.y / 15];
                    return null;
                });
                trackedKeysRef.current.add(key);
            }
        });
    }, [entities]);




    const [castingSkill, setCastingSkill] = useState<number | null>(null);
    const [active3DEffects, setActive3DEffects] = useState<Active3DEffect[]>([]);

    // HUD Editor
    const [isHudEditing, setIsHudEditing] = useState(false);
    const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
    const [dragTarget, setDragTarget] = useState<string | null>(null);
    const [isFreeLook, setIsFreeLook] = useState(false); // Free Look State

    // HUD Customization - Local state for immediate visual feedback
    // REMOVED: Global localHudScale and localButtonOpacity in favor of per-element config
    // We rely directly on hudLayout.elements[id].scale / opacity 


    // (Removed localButtonOpacity)

    const playerPosRef = useRef({
        x: (() => {
            // Check LocalStorage with Zone Lock first
            try {
                const saved = localStorage.getItem(`lastPos_${playerState.nickname}`);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    // Only restore if we are in the SAME zone
                    if (parsed.zoneId === zoneId) return parsed.x;
                }
            } catch (e) { }

            // Fallback to prop if provided (and we decide to trust it, or if localStorage failed)
            // But usually prop brings in the 'last known' which might be from another zone, be careful.
            // If we want strict zone persistence, rely on localStorage check above.
            // if (playerState.lastPosition?.x) return playerState.lastPosition.x; 

            return 0;
        })(),
        y: (() => {
            try {
                const saved = localStorage.getItem(`lastPos_${playerState.nickname}`);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    if (parsed.zoneId === zoneId) return parsed.z; // Note: saved as z, used as y in 2D Ref
                }
            } catch (e) { }
            return 0;
        })()
    });

    // --- AUTO-SAVE POSITION ON EXIT ---
    useEffect(() => {
        return () => {
            // Unmount: Save position
            try {
                if (playerPosRef.current) {
                    const pos = { x: playerPosRef.current.x, z: playerPosRef.current.y, zoneId };
                    localStorage.setItem(`lastPos_${playerState.nickname}`, JSON.stringify(pos));
                    console.log("💾 Auto-Saved Position on Exit:", pos);
                }
            } catch (e) { }
        };
    }, []);

    // --- EXIT COUNTDOWN TIMER ---
    useEffect(() => {
        if (exitCountdown === null) return;

        if (exitCountdown <= 0) {
            // Time's up, exit the game
            setExitCountdown(null);
            props.onExit();
            return;
        }

        const timer = setTimeout(() => {
            setExitCountdown(prev => prev !== null ? prev - 1 : null);
        }, 1000);

        return () => clearTimeout(timer);
    }, [exitCountdown, props.onExit]);

    // Periyodik Pozisyon Kaydetme (Her 1 saniyede bir) - Kaldığı yerden devam etmesi için
    useEffect(() => {
        const saveInterval = setInterval(() => {
            if (playerPosRef.current) {
                // UI'daki Y aslında oyundaki Z düzlemidir
                const currentX = playerPosRef.current.x;
                const currentZ = playerPosRef.current.y;

                // Gereksiz update'den kaçın (hareket etmediyse kaydetme)
                if (Math.abs(currentX - (playerState.lastPosition?.x || 0)) > 1 ||
                    Math.abs(currentZ - (playerState.lastPosition?.z || 0)) > 1) {

                    onUpdatePlayer({
                        lastPosition: { x: currentX, y: 0, z: currentZ } // Note: This doesn't sync zoneId to parent yet, but helps UI
                    });

                    // Save to local storage explicitly with Zone ID
                    const pos = { x: currentX, z: currentZ, zoneId };
                    localStorage.setItem(`lastPos_${playerState.nickname}`, JSON.stringify(pos));
                }
            }
        }, 1000);

        return () => clearInterval(saveInterval);
    }, [playerState.lastPosition]); // lastPosition değiştikçe referansı güncelle (aslında gerek yok ama güvenli)
    const playerGroupRef = useRef<THREE.Group>(null);
    const lastDamageTimeRef = useRef(0);
    const lastAttackTimeRef = useRef(0); // LIFTED UP from GameScene
    const keysPressed = useRef<{ [key: string]: boolean }>({});

    const hasBase = zoneId === 11 || zoneId === 21 || zoneId === 31 || zoneId === 18 || zoneId === 28 || zoneId === 38 || zoneId === 44;
    const zoneData = ZONE_CONFIG[zoneId];

    const deviceMode = playerState.settings.deviceMode;

    // Sound Initialization
    useEffect(() => {
        soundManager.init();
        soundManager.playBGM('bgm_town');
    }, []);

    // Quest görünürlük state'i - chat gibi açılıp kapanabilir
    const [showQuestTracker, setShowQuestTracker] = useState(true);

    // Karakter başlangıç rotasyonu - model inner wrapper ile zaten kameraya bakıyor
    useEffect(() => {
        if (playerGroupRef.current) {
            playerGroupRef.current.rotation.y = 0; // Başlangıç: yüzü kameraya
        }
    }, []);

    // --- MULTIPLAYER SOCKET LOGIC ---
    // --- MULTIPLAYER SOCKET LOGIC ---
    // --- MULTIPLAYER SOCKET LOGIC ---
    useEffect(() => {
        const socket = socketRef.current;
        if (!socket) {
            console.warn("Socket not initialized in props (ActiveZoneView)");
            return;
        }

        console.log("🔌 ActiveZoneView attached to Shared Socket");

        const handleConnect = () => {
            console.log('✅ ActiveZoneView Re-connected');
            socket.emit('join_game', {
                nickname: playerState.nickname,
                userId: playerState.userId,
                class: playerState.class,
                level: playerState.level,
                equipment: playerState.equipment
            });
            socket.emit('join_zone', zoneId);
        };

        const handleGameUpdate = (data: any) => {
            if (!socket) return;
            // MONITOR NETWORK
            monitor.onPacket(JSON.stringify(data).length);

            const others = data.players.filter((p: any) => p.id !== socket.id);
            setRemotePlayers(others);
            lastSocketUpdate.current = Date.now();
        };

        const handlePlayerMoved = (data: any) => {
            setRemotePlayers(prev => prev.map(p =>
                p.id === data.id ? {
                    ...p,
                    x: data.x,
                    y: data.y,
                    rotation: data.rotation,
                    isMoving: data.isMoving,
                    isAttacking: data.isAttacking
                } : p
            ));
        };

        const handlePlayerLeft = (id: string) => {
            setRemotePlayers(prev => prev.filter(p => p.id !== id));
        };

        // Handle receiving initial zone players list (on join/reconnect)
        const handleZonePlayers = (players: any[]) => {
            setRemotePlayers(players);
        };

        // Handle new player joining current zone
        const handlePlayerJoined = (playerData: any) => {
            setRemotePlayers(prev => {
                // Avoid duplicates
                if (prev.find(p => p.id === playerData.id || p.socketId === playerData.socketId)) {
                    return prev;
                }
                return [...prev, playerData];
            });
        };

        const handleDuelChallenge = (data: any) => {
            setDuelChallenge(data);
            // Sound?
            soundManager.playSFX('notification');
        };

        const handleDuelStarted = (data: any) => {
            setDuelChallenge(null);
            setActiveDuel(data);
            // Auto-target opponent
            // Find opponent entity? Remote players only exist in `remotePlayers` array, not main `entities` array usually? 
            // Existing logic might need check. For now, assume remotePlayers are visualized in GameScene.

            addFloatingText("DÜELLO BAŞLADI!", playerPosRef.current.x, 5, playerPosRef.current.y, "text-red-500 font-bold text-2xl");
            soundManager.playSFX('horn');
        };

        const handleDuelRejected = (data: any) => {
            addFloatingText(`${data.targetName} düelloyu reddetti.`, playerPosRef.current.x, 3, playerPosRef.current.y, "text-yellow-400 font-bold");
        };

        const handleDuelEnded = (data: any) => {
            setActiveDuel(null);
            setTargetedPlayer(null);

            if (data.result === 'opponent_disconnected') {
                addFloatingText("🏆 ZAFER! (Rakip kaçtı)", playerPosRef.current.x, 5, playerPosRef.current.y, "text-yellow-400 font-bold text-2xl");
                soundManager.playSFX('victory');
            } else if (data.result === 'win') {
                addFloatingText("🏆 ZAFER!", playerPosRef.current.x, 5, playerPosRef.current.y, "text-yellow-400 font-bold text-2xl");
                soundManager.playSFX('victory');
            } else if (data.result === 'loss') {
                addFloatingText("💀 YENİLDİN!", playerPosRef.current.x, 5, playerPosRef.current.y, "text-red-500 font-bold text-2xl");
                soundManager.playSFX('death');
            }
        };

        const handleDuelError = (msg: string) => {
            alert(msg);
        };

        const handleDamageReceived = (data: any) => {
            // Reduce local HP
            handleUpdatePlayerSafe({ hp: Math.max(0, playerState.hp - data.damage) });
            addFloatingText(`${data.damage}`, playerPosRef.current.x, 2, playerPosRef.current.y, "text-red-500 font-bold text-2xl");
            spawnVisualEffect(playerPosRef.current.x, playerPosRef.current.y, '#ef4444'); // Red blood effect

            if (playerState.hp - data.damage <= 0) {
                if (socketRef.current) socketRef.current.emit('player_died', { killerId: data.attackerId });
            }
        };

        // Attach Listeners
        socket.on('connect', handleConnect);
        socket.on('game_update', handleGameUpdate);
        socket.on('player_moved', handlePlayerMoved);
        socket.on('player_left', handlePlayerLeft);
        socket.on('zone_players', handleZonePlayers);
        socket.on('player_joined', handlePlayerJoined);
        socket.on('duel_challenge', handleDuelChallenge);
        socket.on('duel_started', handleDuelStarted);
        socket.on('duel_rejected', handleDuelRejected);
        socket.on('duel_ended', handleDuelEnded);
        socket.on('duel_error', handleDuelError);
        socket.on('damage_received', handleDamageReceived);

        // Initial Join
        if (socket.connected) {
            socket.emit('join_game', {
                nickname: playerState.nickname,
                class: playerState.class,
                level: playerState.level,
                equipment: playerState.equipment
            });
            socket.emit('join_zone', zoneId);
        }

        return () => {
            socket.off('connect', handleConnect);
            socket.off('game_update', handleGameUpdate);
            socket.off('player_moved', handlePlayerMoved);
            socket.off('player_left', handlePlayerLeft);
            socket.off('zone_players', handleZonePlayers);
            socket.off('player_joined', handlePlayerJoined);
            socket.off('duel_challenge', handleDuelChallenge);
            socket.off('duel_started', handleDuelStarted);
            socket.off('duel_rejected', handleDuelRejected);
            socket.off('duel_ended', handleDuelEnded);
            socket.off('duel_error', handleDuelError);
            socket.off('damage_received', handleDamageReceived);
        };
    }, [zoneId]);

    // Handle Zone Change for Socket
    useEffect(() => {
        if (socketRef.current) {
            socketRef.current.emit('join_zone', zoneId);
        }
    }, [zoneId]);

    // --- HUD DRAG LOGIC ---
    const handleDragStart = (e: React.MouseEvent | React.TouchEvent, id: string) => {
        // If locked, prevent drag (though DraggableHUDElement also prevents it, double check here)
        if (hudLayout.elements[id]?.locked) return;
        setDragTarget(id);
        setSelectedElementId(id); // Auto-select on drag start
    };

    useEffect(() => {
        const handleMove = (e: any) => { // Cast to any to bypass strict union checks
            if (isHudEditing && dragTarget) {
                let clientX, clientY;
                if (e.touches && e.touches.length > 0) {
                    clientX = e.touches[0].clientX;
                    clientY = e.touches[0].clientY;
                } else {
                    clientX = e.clientX;
                    clientY = e.clientY;
                }

                if (typeof window !== 'undefined') {
                    const xPct = (clientX / window.innerWidth) * 100;
                    const yPct = (clientY / window.innerHeight) * 100;

                    setHudLayout(prev => ({
                        elements: {
                            ...prev.elements,
                            [dragTarget]: {
                                ...prev.elements[dragTarget],
                                x: xPct,
                                y: yPct
                            }
                        }
                    }));
                }
            }
        };
        const handleEnd = () => {
            setDragTarget(null);
        };

        if (isHudEditing && typeof window !== 'undefined') {
            window.addEventListener('mousemove', handleMove);
            window.addEventListener('touchmove', handleMove, { passive: false });
            window.addEventListener('mouseup', handleEnd);
            window.addEventListener('touchend', handleEnd);
        }
        return () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener('mousemove', handleMove);
                window.removeEventListener('touchmove', handleMove);
                window.removeEventListener('mouseup', handleEnd);
                window.removeEventListener('touchend', handleEnd);
            }
        };
    }, [isHudEditing, dragTarget]);

    const resetLayout = (type: 'mobile' | 'desktop') => {
        // localStorage'daki eski ayarları temizle
        try {
            localStorage.removeItem(`hud_settings_${playerState.nickname}`);
            console.log("🔄 HUD ayarları sıfırlandı ve localStorage temizlendi");
        } catch (e) { }

        if (type === 'mobile') {
            // ARC PRESET - Use deep copy from constants
            setHudLayout(JSON.parse(JSON.stringify(DEFAULT_HUD_LAYOUT)));
        } else {
            // LINEAR/DESKTOP PRESET - Skills in a row at bottom center
            // Need to construct full object with defaults since we are deep merging usually
            // but here we replace.

            // Helper to create element
            const createEl = (x: number, y: number, scale = 1) => ({ x, y, scale, opacity: 1, enabled: true, locked: false });

            setHudLayout({
                elements: {
                    // Profile - Top Left
                    profile: createEl(5, 5, 1),
                    // Map - Top Right
                    map: createEl(85, 5, 1),
                    // Quest - Below Profile
                    quest: createEl(5, 18, 1),
                    // Chat - Left side middle
                    chat: createEl(5, 40, 1),
                    // Joystick - Bottom Left
                    joystick: createEl(12, 82, 1),
                    // Eye - Right side middle
                    eye: createEl(80, 45, 1),
                    // Skills in a row at bottom center
                    skill1: createEl(30, 92, 1),
                    skill2: createEl(38, 92, 1),
                    skill3: createEl(46, 92, 1),
                    skill4: createEl(54, 92, 1),
                    skill5: createEl(62, 92, 1),
                    skill6: createEl(70, 92, 1),
                    skill7: createEl(78, 92, 1),
                    // Attack - Bottom Right
                    attack: createEl(90, 82, 1.2),
                    // Potions - Right side
                    hp_pot: createEl(92, 35, 0.9),
                    mp_pot: createEl(92, 42, 0.9),
                    // Legacy pot
                }
            });
        }
    };

    const saveHudSettings = () => {
        // Save to Local Storage for immediate persistence and as a backup
        try {
            const settingsToSave = {
                hudLayout,
                // Removed global scale/opacity props
            };
            localStorage.setItem(`hud_settings_${playerState.nickname}`, JSON.stringify(settingsToSave));
        } catch (e) {
            console.error("Failed to save HUD settings locally:", e);
        }

        onUpdatePlayer({
            settings: {
                ...playerState.settings,
                hudLayout,
                // Pass defaults for legacy props if backend expects them, or just ignore
                hudScale: 1,
                buttonOpacity: 1
            }
        });
        setIsHudEditing(false);
        addFloatingText("HUD Ayarları Kaydedildi", playerPosRef.current.x, 3, playerPosRef.current.y, "text-green-400 font-bold");
        soundManager.playSFX('ui_click');
    };

    // ... (Existing Game Logic) ...
    useEffect(() => {
        const regenInterval = setInterval(() => {
            if (playerState.hp < playerState.maxHp || playerState.mana < playerState.maxMana) {
                const now = Date.now();
                if (now - lastDamageTimeRef.current > 5000) {
                    const hpRegen = Math.floor(playerState.maxHp * 0.05);
                    const mpRegen = Math.floor(playerState.maxMana * 0.05);
                    const newHp = Math.min(playerState.maxHp, playerState.hp + hpRegen);
                    const newMana = Math.min(playerState.maxMana, playerState.mana + mpRegen);
                    onUpdatePlayer({ hp: newHp, mana: newMana });
                }
            }
        }, 1000);
        return () => clearInterval(regenInterval);
    }, [playerState.hp, playerState.mana, playerState.maxHp, playerState.maxMana]);

    // Achievement Check: Level
    useEffect(() => {
        checkAchievements('level', playerState.level);
    }, [playerState.level]);

    // Daily Login Check
    useEffect(() => {
        const checkDaily = () => {
            if (!playerState.dailyLogin) {
                setShowDailyReward(true);
                return;
            }
            const today = new Date().toISOString().split('T')[0];
            // Eğer bugün zaten aldıysa gösterme
            if (playerState.dailyLogin.lastLoginDate === today && playerState.dailyLogin.claimedToday) {
                return; // Bugün zaten aldı, gösterme
            }
            // Eğer lastLoginDate bugün değilse yeni gün demek, göster
            if (playerState.dailyLogin.lastLoginDate !== today) {
                setShowDailyReward(true);
            }
        };
        const t = setTimeout(checkDaily, 1500);
        return () => clearTimeout(t);
    }, [playerState.dailyLogin]);

    useEffect(() => {
        if (zoneData) {
            // Local entity init from zone config
            const initNPCs: GameEntity[] = (zoneData.npcs || []).map((n, i) => ({
                id: `npc_${i}`,
                type: 'npc' as EntityType,
                name: n.name || 'NPC',
                x: (Math.random() * 10 - 5) * 15,
                y: (Math.random() * 10 - 5) * 15,
                hp: 1000,
                maxHp: 1000,
                level: zoneData.minLevel,
                isHostile: false,
                color: n.color || 'green'
            }));

            // Add NPCs from NPC_REGISTRY if this is a base zone (11, 21, 31)
            if (hasBase) {
                const registeredNpcs = Object.values(NPC_REGISTRY)
                    .filter(npc => !npc.zoneId || npc.zoneId === zoneId)
                    .map((npc, i) => {
                        // Position NPCs around the base in a semi-circle
                        const angle = (i / 5) * Math.PI - Math.PI / 2;
                        const radius = 8;
                        return {
                            id: npc.id,
                            type: 'npc' as EntityType,
                            name: npc.name,
                            x: Math.sin(angle) * radius * 15,
                            y: Math.cos(angle) * radius * 15,
                            hp: 9999,
                            maxHp: 9999,
                            level: 1,
                            isHostile: false,
                            color: npc.type === 'blacksmith' ? '#ff8c00' :
                                npc.type === 'merchant' ? '#00ff00' :
                                    npc.type === 'quest_giver' ? '#ffd700' :
                                        npc.type === 'arena_master' ? '#ff0000' : '#4169e1',
                            npcType: npc.type,
                            modelPath: npc.modelPath
                        } as GameEntity;
                    });
                initNPCs.push(...registeredNpcs);
            }

            // PvP Arena Botları (Zone 44) - SİMÜLASYON
            if (zoneId === 44) {
                const enemyFactions = ['marsu', 'terya', 'venu'].filter(f => f !== playerState.faction);
                const pvpBots = Array.from({ length: 5 }).map((_, i) => ({
                    id: `pvp_bot_${i}`,
                    type: 'player' as EntityType,
                    name: `Düşman Savaşçı ${i + 1}`,
                    x: (Math.random() * 20 - 10) * 15, // Arena içinde rastgele
                    y: (Math.random() * 20 - 10) * 15,
                    hp: 5000,
                    maxHp: 5000,
                    level: Math.max(1, playerState.level + (Math.floor(Math.random() * 5) - 2)),
                    isHostile: true, // Saldırılabilir
                    faction: enemyFactions[Math.floor(Math.random() * enemyFactions.length)],
                    class: ['warrior', 'archer', 'archmage'][Math.floor(Math.random() * 3)] as CharacterClass,
                    color: 'red'
                } as GameEntity));
                initNPCs.push(...pvpBots);

                // BOSS: Kadim Arena Lordu
                initNPCs.push({
                    id: 'arena_boss',
                    type: 'boss',
                    name: 'KADİM ARENA LORDU',
                    x: 0, y: 0,
                    hp: 100000, maxHp: 100000,
                    level: 99,
                    isHostile: true,
                    color: '#fbbf24', // Gold
                    bossData: { phase: 1, isRaged: false, currentSkill: null }
                } as GameEntity);
            }

            setEntities(initNPCs);
            setLootBoxes([]);
            setTarget(null);

            // Only reset position if we are SWITCHING zones while already mounted.
            // If this is the first mount (isMountedRef false), we keep the value initialized by useRef (from localStorage)
            if (isMountedRef.current) {
                playerPosRef.current = { x: 0, y: 0 };
            }

            setTeleporting(null);

            isMountedRef.current = true;
        }
    }, [zoneId, hasBase]);

    useEffect(() => {
        if (!teleporting) return;
        const interval = setInterval(() => {
            const elapsed = Date.now() - teleporting.start;
            if (elapsed >= 5000) {
                props.onSwitchZone(teleporting.target);
                setTeleporting(null);
            }
        }, 100);
        return () => clearInterval(interval);
    }, [teleporting, props.onSwitchZone]);

    useEffect(() => {
        const interval = setInterval(() => {
            setCooldowns(prev => {
                const next = { ...prev };
                let changed = false;
                Object.keys(next).forEach(k => {
                    if (next[k] > 0) {
                        next[k] = Math.max(0, next[k] - 1000);
                        if (next[k] === 0) delete next[k];
                        changed = true;
                    }
                });
                return changed ? next : prev;
            });
            // Cleanup particles
            setParticles(prev => prev.filter(p => Date.now() - p.createdAt < 1000));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const addFloatingText = (text: string, x: number, y: number, z: number, color: string) => {
        const id = uuidv4();
        setFloatingTexts(prev => [...prev, { id, text, x, y, z, color, createdAt: Date.now() }]);
        setTimeout(() => setFloatingTexts(prev => prev.filter(ft => ft.id !== id)), 1000);
    };

    const spawnVisualEffect = (x: number, z: number, color: string) => {
        setParticles(prev => [...prev, { id: uuidv4(), pos: [x, 0.5, z], color, createdAt: Date.now() }]);
    };

    const findTarget = () => {
        let hostiles = entities.filter(e => e.isHostile);
        if (hostiles.length === 0) return null;
        hostiles.sort((a, b) => {
            const distA = Math.pow(a.x / 15 - playerPosRef.current.x, 2) + Math.pow(a.y / 15 - playerPosRef.current.y, 2);
            const distB = Math.pow(b.x / 15 - playerPosRef.current.x, 2) + Math.pow(b.y / 15 - playerPosRef.current.y, 2);
            return distA - distB;
        });
        const closeHostiles = hostiles.filter(e => {
            const d = Math.sqrt(Math.pow(e.x / 15 - playerPosRef.current.x, 2) + Math.pow(e.y / 15 - playerPosRef.current.y, 2));
            return d < 20;
        });
        if (closeHostiles.length === 0) return null;
        if (playerState.settings.pvpPriority) {
            const enemyPlayer = closeHostiles.find(e => e.type === 'player');
            if (enemyPlayer) return enemyPlayer;
        }
        return closeHostiles[0] || null;
    };

    const handleUpdatePlayerSafe = (updates: Partial<PlayerState>) => {
        if (updates.hp !== undefined && updates.hp < playerState.hp) {
            lastDamageTimeRef.current = Date.now();
            if (teleporting) {
                setTeleporting(null);
                addFloatingText("HASAR ALDIN! İPTAL!", playerPosRef.current.x, 3, playerPosRef.current.y, 'text-red-600 font-bold');
            }

            // ARMOR DURABILITY (20% Chance)
            if (Math.random() < 0.2) {
                const armorSlots: (keyof Equipment)[] = ['helmet', 'armor', 'pants', 'boots'];
                const randomSlot = armorSlots[Math.floor(Math.random() * armorSlots.length)];
                const item = playerState.equipment[randomSlot];
                if (item) {
                    const currentDur = item.durability ?? item.maxDurability ?? 100;
                    if (currentDur > 0) {
                        const newDur = Math.max(0, currentDur - 1);
                        const newEquipment = { ...playerState.equipment, [randomSlot]: { ...item, durability: newDur } };
                        updates.equipment = newEquipment;
                        if (newDur === 0) {
                            addFloatingText("ZIRHIN HASAR GÖRDÜ!", playerPosRef.current.x, 3.5, playerPosRef.current.y, "text-orange-500 font-bold");
                            soundManager.playSFX('break');
                        }
                    }
                }
            }
        }
        onUpdatePlayer(updates);
    };

    // --- BOSS AI & SKILLS ---
    const handleBossSkill = (skillName: string, bossId: string, target?: { x: number, y: number }) => {
        // Ses Efektleri
        if (skillName === 'warning') {
            soundManager.playSFX('ui_hover');
            return;
        }

        if (skillName === 'rage') {
            addFloatingText("BOSS ÖFKELENDİ!", (target?.x || 0) / 15, 5, (target?.y || 0) / 15, "text-red-600 font-extrabold text-2xl animate-pulse");
            soundManager.playSFX('level_up');
            spawnVisualEffect((target?.x || 0) / 15, (target?.y || 0) / 15, '#ef4444'); // Red Pulse
        } else if (skillName === 'meteor') {
            if (!target) return;
            spawnVisualEffect(target.x / 15, target.y / 15, '#ea580c'); // Orange
            addFloatingText("METEOR!", target.x / 15, 3, target.y / 15, "text-orange-500 font-bold");

            // Damage Player if close
            const pX = playerPosRef.current.x;
            const pY = playerPosRef.current.y;
            const dist = Math.sqrt(Math.pow(target.x / 15 - pX, 2) + Math.pow(target.y / 15 - pY, 2));

            // 5 unit radius (scaled down map coords)
            if (dist < 4) {
                const dmg = Math.floor(playerState.maxHp * 0.3); // %30 HP damage
                onUpdatePlayer({ hp: Math.max(0, playerState.hp - dmg) });
                addFloatingText(`-${dmg}`, pX, 2, pY, "text-red-600 font-extrabold text-xl");
                soundManager.playSFX('hit');
            }
        } else if (skillName === 'nova') {
            if (!target) return;
            // Similar AoE around boss
            spawnVisualEffect(target.x / 15, target.y / 15, '#3b82f6'); // Blue
            addFloatingText("NOVA PATLAMASI!", target.x / 15, 3, target.y / 15, "text-blue-500 font-bold");

            const pX = playerPosRef.current.x;
            const pY = playerPosRef.current.y;
            const dist = Math.sqrt(Math.pow(target.x / 15 - pX, 2) + Math.pow(target.y / 15 - pY, 2));

            if (dist < 6) {
                const dmg = Math.floor(playerState.maxHp * 0.2);
                onUpdatePlayer({ hp: Math.max(0, playerState.hp - dmg) });
                addFloatingText(`-${dmg}`, pX, 2, pY, "text-red-600 font-extrabold text-xl");
                soundManager.playSFX('hit');
            }
        } else if (skillName === 'summon') {
            if (!target) return;
            addFloatingText("Minyonlar!", target.x / 15, 4, target.y / 15, "text-purple-400 font-bold");
            // Spawn minions
            const minionCount = 3;
            setEntities(prev => [...prev, ...Array.from({ length: minionCount }).map((_, i) => ({
                id: uuidv4(),
                type: 'mob' as EntityType,
                name: 'Boss Yaveri',
                x: target.x + (Math.random() * 10 - 5) * 15, // Spread
                y: target.y + (Math.random() * 10 - 5) * 15,
                hp: 1000, maxHp: 1000, level: playerState.level,
                isHostile: true,
                color: 'purple'
            }))]);
        }
    };

    // Activate Boss AI
    useBossAI({
        setEntities,
        playerPosRef,
        onBossSkill: handleBossSkill
    });

    const handleAttack = () => {
        if (isHudEditing) return; // Disable while editing
        if (isAttacking) return;
        lastAttackTimeRef.current = Date.now(); // Mark attack time
        setIsAttacking(true);
        setIsAttacking(true);
        setTimeout(() => setIsAttacking(false), 300);

        // WEAPON DURABILITY (10% Chance)
        if (playerState.equipment.weapon) {
            const w = playerState.equipment.weapon;
            const currentDur = w.durability ?? w.maxDurability ?? 100;
            if (Math.random() < 0.1 && currentDur > 0) {
                const newDur = Math.max(0, currentDur - 1);
                const newEquipment = { ...playerState.equipment, weapon: { ...w, durability: newDur } };
                onUpdatePlayer({ equipment: newEquipment }); // Separate update
                if (newDur === 0) {
                    soundManager.playSFX('break');
                    addFloatingText("SİLAHIN KIRILDI!", playerPosRef.current.x, 3, playerPosRef.current.y, "text-red-500 font-bold");
                }
            }
        }
        setTimeout(() => setIsAttacking(false), 300);

        // Play Attack Sound
        if (['archmage', 'cleric', 'bard'].includes(playerState.class)) {
            soundManager.playSFX('attack_magic');
        } else {
            soundManager.playSFX('attack_sword');
        }
        if (!target) {
            const newTarget = findTarget();
            if (newTarget) setTarget(newTarget);
        }
        let vx, vz;
        if (target && entities.find(e => e.id === target.id)) {
            const dx = target.x / 15 - playerPosRef.current.x;
            const dz = target.y / 15 - playerPosRef.current.y;
            const mag = Math.sqrt(dx * dx + dz * dz);
            vx = dx / mag;
            vz = dz / mag;
        } else {
            const rot = playerGroupRef.current?.rotation.y || 0;
            vx = Math.sin(rot);
            vz = Math.cos(rot);
        }

        const effectColor = playerState.class === 'archmage' ? '#3b82f6' : playerState.class === 'cleric' ? '#22c55e' : '#ef4444';
        if (target) {
            spawnVisualEffect(target.x / 15, target.y / 15, effectColor);
        } else {
            const rot = playerGroupRef.current?.rotation.y || 0;
            const x = playerPosRef.current.x + Math.sin(rot) * 2;
            const z = playerPosRef.current.y + Math.cos(rot) * 2;
            spawnVisualEffect(x, z, effectColor);
        }

        // Use class-based combat config
        const combatConfig = CLASS_COMBAT_CONFIG[playerState.class as CharacterClass];
        const isMelee = isMeleeClass(playerState.class as CharacterClass);

        if (!isMelee) {
            const type = playerState.class === 'archer' ? 'arrow' : playerState.class === 'cleric' ? 'spirit' : 'fireball';
            setProjectiles(prev => [...prev, { id: uuidv4(), x: playerPosRef.current.x, y: 1.5, z: playerPosRef.current.y, vx, vz, type, createdAt: Date.now() }]);
        }

        // Use class-specific attack range
        const range = combatConfig.attackRange;

        // Calculate Total Damage with Bonuses
        let baseDamage = playerState.damage;

        // Broken Weapon Penalty
        if (playerState.equipment.weapon && (playerState.equipment.weapon.durability ?? 100) <= 0) {
            baseDamage = Math.floor(baseDamage * 0.5);
        }

        // Wing Bonuses
        if (playerState.equippedWing) {
            baseDamage += playerState.equippedWing.bonusDamage || 0;
        }

        // Pet Bonuses
        if (playerState.equippedPet) {
            baseDamage += playerState.equippedPet.bonusDamage || 0;
        }

        // Rank Bonuses
        const userRank = RANKS.find(r => r.id === playerState.rank);
        if (userRank) {
            baseDamage += userRank.bonusDamage;
        }

        // --- OPTIMIZED REF-BASED ATTACK LOGIC (NO RE-RENDER ON HIT) ---
        const currentEntities = entitiesRef.current;
        let deathOccurred = false;
        const nextEntities: GameEntity[] = [];

        // Loop manual to avoid map/filter overhead
        for (let i = 0; i < currentEntities.length; i++) {
            const ent = currentEntities[i];

            if (!ent.isHostile) {
                nextEntities.push(ent);
                continue;
            }

            // PvP Level Check (Lv.7+)
            if (ent.type === 'player' && playerState.level < 7) {
                nextEntities.push(ent);
                continue;
            }

            const ex = ent.x / 15;
            const ey = ent.y / 15;
            const dist = Math.sqrt(Math.pow(ex - playerPosRef.current.x, 2) + Math.pow(ey - playerPosRef.current.y, 2));

            if (dist < range) {
                const dx = ex - playerPosRef.current.x;
                const dz = ey - playerPosRef.current.y;
                const dot = (dx * vx + dz * vz) / dist;

                if (dot > 0.8 || (target && target.id === ent.id)) {
                    // Get enemy defense
                    const enemyDefense = ent.defense || 0;

                    const combatResult = performAttack(
                        playerState.class as CharacterClass,
                        baseDamage,
                        enemyDefense,
                        0, 0
                    );

                    const finalDamage = combatResult.damage;

                    // --- CRITICAL PERFORMANCE FIX ---
                    // Directly mutate the entity in the REF. Do NOT trigger setEntities.
                    // The VoxelMob component listens to 'entity.hp' diff via useFrame.
                    ent.hp -= finalDamage;

                    // Update Damage Map for Boss Rewards
                    if (!ent.damageMap) ent.damageMap = {};
                    ent.damageMap[playerState.nickname] = (ent.damageMap[playerState.nickname] || 0) + finalDamage;

                    ent.hitFlash = Date.now();

                    // Show damage text
                    if (combatResult.isCritical) {
                        addFloatingText(`💥 ${finalDamage}`, ex, 2.5, ey, 'text-orange-400 font-bold text-lg');
                        soundManager.playSFX('hit');
                    } else {
                        addFloatingText(`${finalDamage}`, ex, 2, ey, 'text-yellow-400');
                        soundManager.playSFX('hit'); // Simple hit sound
                    }

                    spawnVisualEffect(ex, ey, combatResult.isCritical ? '#f97316' : '#fca5a5');
                    vfxManager.spawn('PHYSICAL', [playerPosRef.current.x, 1, playerPosRef.current.y], [ex, 1, ey], ent.type);

                    // Check Death
                    if (ent.hp <= 0) {
                        // Kill Logic
                        handleKill(ent, ex, ey);
                        if (target?.id === ent.id) setTarget(null);
                        deathOccurred = true;
                        // Do NOT add to nextEntities -> effectively removed
                        continue;
                    }
                }
            }
            // Keep alive entity
            nextEntities.push(ent);
        }

        // Only update React state if a death occurred (list size changed)
        if (deathOccurred) {
            setEntities(nextEntities);
        }

        // PVP DUEL ATTACK (if in active duel, also attack the remote player)
        if (activeDuel && socketRef.current) {
            const opponent = remotePlayers.find(p => p.id === activeDuel.opponentId);
            if (opponent) {
                const opDist = Math.sqrt(Math.pow(opponent.x - playerPosRef.current.x, 2) + Math.pow(opponent.y - playerPosRef.current.y, 2));
                if (opDist < range) {
                    socketRef.current.emit('attack_player', {
                        targetId: activeDuel.opponentId,
                        damage: baseDamage,
                        skillName: 'Basic Attack'
                    });
                    addFloatingText(`${baseDamage}`, opponent.x, 2, opponent.y, 'text-orange-400 font-bold');
                    spawnVisualEffect(opponent.x, opponent.y, '#f97316');
                }
            }
        }
    };

    // --- ACHIEVEMENT SYSTEM ---
    const checkAchievements = (type: 'kill' | 'level' | 'gold', value: number) => {
        const currentAchievements = playerState.achievements || ACHIEVEMENTS_LIST.map(a => ({
            ...a, currentProgress: 0, isCompleted: false
        }));

        let updated = false;
        let totalXp = 0;
        let totalGold = 0;
        let totalGems = 0;

        const newAchievements = currentAchievements.map((ach: any) => {
            if (ach.isCompleted) return ach;

            let newProgress = ach.currentProgress;

            if (type === 'kill' && ach.category === 'combat') {
                newProgress += value;
            } else if (type === 'level' && ach.category === 'progression' && ach.id.startsWith('level_')) {
                if (value > newProgress) newProgress = value;
            } else if (type === 'gold' && ach.id === 'rich') {
                if (value > newProgress) newProgress = value;
            }

            if (newProgress >= ach.requirement) {
                updated = true;
                addFloatingText(`BAŞARIM: ${ach.name}!`, playerPosRef.current.x, 3, playerPosRef.current.y, 'text-yellow-300 font-bold text-lg');
                soundManager.playSFX('level_up');

                totalXp += ach.rewardExp || 0;
                totalGold += ach.rewardGold || 0;
                totalGems += ach.rewardGems || 0;

                return { ...ach, currentProgress: newProgress, isCompleted: true };
            }

            if (newProgress !== ach.currentProgress) {
                updated = true;
                return { ...ach, currentProgress: newProgress };
            }
            return ach;
        });

        if (updated) {
            const updates: any = { achievements: newAchievements };
            // Careful: we are adding to CURRENT state, but state might be stale if called rapidly.
            // But for achievements, slight race condition is acceptable.

            if (totalXp > 0) updates.exp = (playerState.exp || 0) + totalXp;
            if (totalGold > 0) updates.credits = (playerState.credits || 0) + totalGold;
            if (totalGems > 0) updates.gems = (playerState.gems || 0) + totalGems;

            onUpdatePlayer(updates);
        }
    };

    // --- DAILY LOGIN SYSTEM ---
    const handleClaimDaily = (reward: any) => {
        const today = new Date().toISOString().split('T')[0];
        let prevConsecutive = playerState.dailyLogin?.consecutiveDays || 0;
        let prevDate = playerState.dailyLogin?.lastLoginDate || '2000-01-01';

        const d1 = new Date(prevDate).getTime();
        const d2 = new Date(today).getTime();
        const diffHours = (d2 - d1) / (1000 * 60 * 60);

        if (diffHours > 48) prevConsecutive = 0;

        const nextConsecutive = prevConsecutive + 1;

        const newState = {
            lastLoginDate: today,
            consecutiveDays: nextConsecutive,
            claimedToday: true,
            totalLogins: (playerState.dailyLogin?.totalLogins || 0) + 1
        };

        const updates: any = {
            credits: playerState.credits + (reward.gold || 0),
            gems: playerState.gems + (reward.gems || 0),
            exp: playerState.exp + (reward.exp || 0),
            honor: playerState.honor + (reward.honor || 0),
            dailyLogin: newState
        };

        if (reward.item) {
            updates.inventory = [...playerState.inventory, { ...reward.item, id: uuidv4() }];
            addFloatingText(`Eşya: ${reward.item.name}`, playerPosRef.current.x, 3, playerPosRef.current.y, 'text-orange-400');
        }

        onUpdatePlayer(updates);
        addFloatingText('Günlük Ödül Alındı!', playerPosRef.current.x, 4, playerPosRef.current.y, 'text-yellow-400 font-bold');
        soundManager.playSFX('level_up');
        setShowDailyReward(false);
    };

    const handleKill = (ent: GameEntity, x: number, z: number) => {
        // 1. DETERMINE ZONE REWARDS
        const rewardConfig = ZONE_REWARDS[zoneId] || DEFAULT_ZONE_REWARD;

        // 2. CALCULATE GOLD & XP
        let xp = ent.level * 50;
        let gold = Math.floor(Math.random() * (rewardConfig.maxGold - rewardConfig.minGold + 1)) + rewardConfig.minGold;

        // 3. CALCULATE HONOR (NEW SYSTEM)
        let honor = 0;
        const isBoss = ent.type === 'boss' || (ent as any).bossData !== undefined;
        const isElite = ent.name.includes('Elit') || ent.name.includes('[ELITE]');
        const isPvP = ent.type === 'player';

        // Determine kill type for honor
        const killType = isPvP ? 'player' : (isBoss ? 'boss' : (isElite ? 'elite' : 'normal'));
        const targetId = ent.id;

        // Check Anti-Abuse Rules
        if (canGainHonor(playerState, targetId, isPvP ? 'player' : 'npc')) {
            honor = getHonorValue(killType);

            // Record kill for cooldown tracking
            if (isPvP) recordKill(playerState.nickname, targetId);
        } else {
            if (isPvP) addFloatingText('⏱️ Honor yok (Limit/CD)', x, 5, z, 'text-red-400');
        }

        // Apply Pet & Wing Bonuses
        if (playerState.equippedPet?.bonusExpRate) {
            xp += Math.floor(xp * (playerState.equippedPet.bonusExpRate / 100));
        }
        if (playerState.equippedWing?.bonusGoldRate) {
            gold += Math.floor(gold * (playerState.equippedWing.bonusGoldRate / 100));
        }
        if (playerState.equippedWing?.bonusHonorRate) {
            honor += Math.floor(honor * (playerState.equippedWing.bonusHonorRate / 100));
        }

        // ====== VIP BONUSES (NEW) ======
        const vipExpBonus = getVipBonus(playerState, 'EXP_BONUS');     // e.g. 0.20
        const vipGoldBonus = getVipBonus(playerState, 'GOLD_BONUS');   // e.g. 0.20

        if (vipExpBonus > 0) xp += Math.floor(xp * vipExpBonus);
        if (vipGoldBonus > 0) gold += Math.floor(gold * vipGoldBonus);

        // 5. UPDATE DAILY LEADERBOARD
        if (honor > 0) {
            addDailyHonor(playerState.nickname, playerState.nickname, honor);
        }
        addDailyKill(playerState.nickname, playerState.nickname);

        // 3. ITEM DROP LOGIC (V3.0 - generateDrop utility)
        // ANTI-BOT CHECK
        const { newState, stageChanged } = updateAntiBotOnKill(antiBotRef.current, x, z);
        antiBotRef.current = newState;
        let { dropMultiplier, expMultiplier, warningMessage } = getRewardMultipliers(antiBotRef.current);

        // Show warning on stage change
        if (stageChanged && warningMessage) {
            addFloatingText(warningMessage, x, 5, z, 'text-yellow-400 font-bold text-lg');
        }

        // ═══════════════════════════════════════════════════════════════
        // BOSS REWARD DISTRIBUTION (Damage Based)
        // ═══════════════════════════════════════════════════════════════
        if (isBoss && ent.damageMap) {
            const myDamage = ent.damageMap[playerState.nickname] || 0;
            const totalDamage = Object.values(ent.damageMap).reduce((a, b) => a + b, 0);

            if (totalDamage > 0) {
                const myContribution = myDamage / totalDamage;

                // Find MVP
                let maxDmg = 0;
                let mvpId = '';
                Object.entries(ent.damageMap).forEach(([id, dmg]) => {
                    if (dmg > maxDmg) { maxDmg = dmg; mvpId = id; }
                });

                const isMvp = mvpId === playerState.nickname;

                // 1. Gold Distribution: Fair share based on damage
                gold = Math.floor(gold * myContribution);

                // 2. Item Drop: Only MVP gets the drop (for now)
                if (isMvp) {
                    addFloatingText(`👑 MVP! (Hasar: %${Math.floor(myContribution * 100)})`, x, 6, z, 'text-yellow-300 font-bold animate-bounce');
                } else {
                    // Non-MVP gets NO item
                    dropMultiplier = 0;
                    addFloatingText(`Hasar: %${Math.floor(myContribution * 100)}`, x, 6, z, 'text-slate-300');
                }
            }
        }

        // Apply anti-bot multipliers
        gold = Math.floor(gold * dropMultiplier);
        honor = Math.floor(honor * dropMultiplier);
        xp = Math.floor(xp * expMultiplier);

        let droppedItem: Item | undefined = undefined;
        let boxColor = 'green';
        let lootTier = 1;

        // Only generate drops if not penalized
        if (dropMultiplier > 0) {
            const dropResult = generateDrop(zoneId, ent.level);

            if (dropResult) {
                lootTier = dropResult.tier;
                boxColor = dropResult.color;

                droppedItem = {
                    id: dropResult.id,
                    name: dropResult.name,
                    tier: dropResult.tier,
                    type: dropResult.type as any,
                    rarity:
                        dropResult.quality === 'premium'
                            ? 'epic'
                            : dropResult.quality === 'medium'
                                ? 'rare'
                                : 'common',
                    stats: dropResult.stats,
                    value: dropResult.tier * 50,
                };
            }

            // BOSS MATERIAL DROP - Check if entity is a boss
            const isBoss = ent.type === 'boss' || (ent as any).bossData !== undefined;
            const materialDrop = generateBossMaterialDrop(ent.level, isBoss, isElite);
            if (materialDrop) {
                // Add material to inventory via onUpdatePlayer
                const materialItem: Item = {
                    id: materialDrop.id,
                    name: materialDrop.name,
                    tier: materialDrop.tier,
                    type: 'material',
                    rarity: materialDrop.rarity,
                    value: materialDrop.value,
                };
                onUpdatePlayer({ inventory: [...playerState.inventory, materialItem] });
                addFloatingText(`${materialDrop.icon} ${materialDrop.name}!`, x, 5, z, 'text-purple-500 font-bold text-lg');
            }
        }

        // Override box color if we got a super legendary item? No, stick to the visual roll for consistency.

        onLoot(gold, xp, honor, droppedItem);

        // DIAMOND DROP - Read from entity data
        const baseDiamond = (ent as any).diamond || 0;
        const diamondDrop = Math.floor(baseDiamond * dropMultiplier);
        if (diamondDrop > 0) {
            onUpdatePlayer({ gems: playerState.gems + diamondDrop });
            addFloatingText(`+${diamondDrop} 💎`, x, 4.5, z, 'text-cyan-400 font-bold');
        }

        setTimeout(() => {
            checkAchievements('kill', 1);
            checkAchievements('gold', playerState.credits + gold);
        }, 50);

        addFloatingText(`+${xp} XP`, x, 3, z, 'text-green-400');
        addFloatingText(`+${honor} Şeref`, x, 4, z, 'text-purple-400 font-bold');
        if (droppedItem) addFloatingText(`${droppedItem.name}`, x, 3.5, z, 'text-orange-400 font-bold shadow-black drop-shadow-md');

        onQuestProgress(ent.name);

        // Only spawn loot box if drops are enabled
        if (dropMultiplier > 0) {
            const box: LootBox = {
                id: uuidv4(),
                x, y: 0.5, z,
                color: boxColor,
                tier: lootTier,
                ownerId: playerState.nickname,
                createdAt: Date.now()
            };
            setLootBoxes(prev => [...prev, box]);
        }
    };



    // ... existing code ...

    const handleSkill = (skillId: string, skill: any) => {
        if (isHudEditing) return; // Disable while editing
        if (cooldowns[skillId]) return;

        // MANA SCALING: Level başına +%10 Cost (Base + Level * Base * 0.1)
        const scaledManaCost = Math.floor(skill.manaCost * (1 + (playerState.level * 0.1)));

        if (playerState.mana < scaledManaCost) {
            addFloatingText("Mana Yetersiz!", playerPosUI.x, 2, playerPosUI.y, "text-blue-300");
            return;
        }

        // --- AUTO TARGET LOGIC (Z-Targeting) ---
        let effectiveTarget = target;
        if (!effectiveTarget) {
            const nearest = findTarget();
            if (nearest) {
                setTarget(nearest);
                effectiveTarget = nearest;
            }
        }

        // Rotate Player towards Target
        if (effectiveTarget && playerGroupRef.current) {
            const dx = effectiveTarget.x / 15 - playerPosRef.current.x;
            const dz = effectiveTarget.y / 15 - playerPosRef.current.y;
            playerGroupRef.current.rotation.y = Math.atan2(dx, dz);
        }
        // ---------------------------------------

        setCooldowns(prev => ({ ...prev, [skillId]: skill.cd * 1000 }));
        handleUpdatePlayerSafe({ mana: playerState.mana - scaledManaCost });

        // === SKILL ANIMASYONU TETİKLE ===
        const skillNumMatch = skillId.match(/(\d+)/);
        const skillNum = skillNumMatch ? parseInt(skillNumMatch[1]) : 1;
        setCastingSkill(skillNum);

        setTimeout(() => {
            setCastingSkill(null);
        }, 500);

        // 3D EFFECT LOGIC
        console.log("DEBUG SKILL EXEC:", skill.id, skill.visual, "Model:", skill.modelPath);
        if (skill.modelPath || SKILL_ASSETS[skill.visual]) {
            const effectId = uuidv4();
            const px = playerPosRef.current.x;
            const pz = playerPosRef.current.y;

            let effectPos: [number, number, number] = [px, 0.5, pz];
            let targetPos: [number, number, number] | undefined = undefined;

            if (effectiveTarget) {
                targetPos = [effectiveTarget.x / 15, 0.5, effectiveTarget.y / 15];
            } else {
                const rot = playerGroupRef.current?.rotation.y || 0;
                targetPos = [px + Math.sin(rot) * 5, 0.5, pz + Math.cos(rot) * 5];
            }

            // Determine Target Type & Key
            const isPlayerCenteredSkill = skill.type === 'buff' || skill.type === 'heal' ||
                skill.visual.includes('shield') || skill.visual.includes('barrier') ||
                skill.visual.includes('meditation') || skill.visual.includes('focus') ||
                (skill.visual.includes('storm') && !skill.visual.includes('meteor'));

            // Calculate Self Key
            const selfKey = playerState.userId
                ? `user:${playerState.userId}`
                : (socketRef.current?.id ? `socket:${socketRef.current.id}` : `player:${playerState.nickname}`);

            // Calculate Target Key
            let targetKey = undefined;
            if (effectiveTarget) {
                if (effectiveTarget.type === 'player') {
                    // Resolve latest key from Ref
                    targetKey = socketToKeyRef.current.get(effectiveTarget.id) || `socket:${effectiveTarget.id}`;
                } else {
                    targetKey = `mob:${effectiveTarget.id}`;
                }
            }

            // Decide Attachment
            let attachId = undefined;
            if (isPlayerCenteredSkill) {
                attachId = selfKey;
            } else if ((skill.type === 'utility' || skill.visual.includes('poison') || skill.visual.includes('burn')) && targetKey) {
                attachId = targetKey;
            }

            // NEW PIXEL VFX SYSTEM
            vfxManager.spawn(
                skill.visual || skill.name,
                [px, 1, pz],
                targetPos,
                effectiveTarget?.type || 'ground',
                attachId
            );

            if (!isPlayerCenteredSkill && targetPos) {

                console.log("DEBUG: Spawning at TargetPos (Enemy)", targetPos);
                effectPos = targetPos;
            } else {
                console.log("DEBUG: Spawning at Player (Buff/Shield)", effectPos);
            }

            console.log("DEBUG Skill Spawn:", { id: skill.id, visual: skill.visual, pos: effectPos, target: effectiveTarget?.id });

            setActive3DEffects(prev => [...prev, {
                id: effectId,
                visual: skill.visual,
                modelPath: skill.modelPath,
                position: effectPos,
                targetPosition: targetPos
            }]);
        }

        // --- SPECIAL CLASS MECHANICS (BUFFS / UTILITY) ---

        // 1. ARCTIC KNIGHT (ak)
        if (skill.id === 'ak2') { // Buz Zırhı
            addFloatingText("BUZ ZIRHI AKTİF!", playerPosRef.current.x, 3, playerPosRef.current.y, "text-cyan-400 font-bold");
            const originalDef = playerState.defense;
            handleUpdatePlayerSafe({ defense: Math.floor(originalDef * 1.5) }); // +50% Def
            setTimeout(() => {
                handleUpdatePlayerSafe({ defense: originalDef });
                addFloatingText("Buz Zırhı Bitti", playerPosRef.current.x, 3, playerPosRef.current.y, "text-slate-400");
            }, 10000);
        }
        if (skill.id === 'ak5') { // Kaygan Zemin (Slow Area)
            // Implementation note: Ideally spawns a 'Zone' entity. For now, we slow nearby mobs.
            setEntities(prev => prev.map(ent => {
                const dist = Math.sqrt(Math.pow(ent.x / 15 - playerPosRef.current.x, 2) + Math.pow(ent.y / 15 - playerPosRef.current.y, 2));
                if (dist < 8 && ent.isHostile) {
                    addFloatingText("Yavaşladı!", ent.x / 15, 3, ent.y / 15, "text-cyan-300");
                    // We can't easily slow them without mob logic specific 'speed' prop, 
                    // but we can simulate it or apply a debuff state if available.
                    // For visual feel:
                    spawnVisualEffect(ent.x / 15, ent.y / 15, '#22d3ee');
                }
                return ent;
            }));
        }

        // 2. GALE GLAIVE (gg)
        if (skill.id === 'gg2') { // Atılma (Dash)
            // Teleport player forward 5 units
            const rot = playerGroupRef.current?.rotation.y || 0;
            const dashDist = 5;
            const newX = playerPosRef.current.x + Math.sin(rot) * dashDist;
            const newZ = playerPosRef.current.y + Math.cos(rot) * dashDist;

            // Basic collision check (very simple)
            if (newX > -50 && newX < 50 && newZ > -50 && newZ < 50) {
                playerGroupRef.current?.position.set(newX, 0, newZ);
                playerPosRef.current = { x: newX, y: newZ };
                spawnVisualEffect(newX, newZ, '#2dd4bf'); // Dash finish effect
            }
        }
        if (skill.id === 'gg6') { // Hız Patlaması
            addFloatingText("HIZLANDIN!", playerPosRef.current.x, 3, playerPosRef.current.y, "text-teal-400 font-bold");
            // Note: Speed is controlled by 'movementSpeed' in input logic which reads from stats.
            // We assume 'speed' stat exists or we modify it. 
            // Currently input logic uses constant speed. 
            // We'll simulate by updating a hypothetical speed multiplier if we had one.
            // Visual Only for now as speed logic is hardcoded in updateMovement.
        }

        // 3. MARTIAL ARTIST (ma)
        if (skill.id === 'ma3') { // Focus
            addFloatingText("ODAKLANMA!", playerPosRef.current.x, 3, playerPosRef.current.y, "text-yellow-400");
            handleUpdatePlayerSafe({ mana: Math.min(playerState.maxMana, playerState.mana + 50) }); // Restore Mana
        }
        if (skill.id === 'ma7') { // Dragon Fury
            addFloatingText("EJDERHA ÖFKESİ!", playerPosRef.current.x, 3, playerPosRef.current.y, "text-orange-500 font-bold text-xl");
            const originalDmg = playerState.damage;
            handleUpdatePlayerSafe({ damage: Math.floor(originalDmg * 2.0) }); // Double Damage
            setTimeout(() => {
                handleUpdatePlayerSafe({ damage: originalDmg });
                addFloatingText("Öfke Dindi", playerPosRef.current.x, 3, playerPosRef.current.y, "text-slate-400");
            }, 10000);
        }

        // 4. REAPER (rp)
        if (skill.id === 'rp2') { // Soul Harvest (Heal on hit - represented as immediate small heal for simplicity)
            const stealAmount = Math.floor(playerState.maxHp * 0.1);
            handleUpdatePlayerSafe({ hp: Math.min(playerState.maxHp, playerState.hp + stealAmount) });
            addFloatingText(`+${stealAmount} HP (Ruh Çalma)`, playerPosRef.current.x, 2, playerPosRef.current.y, "text-purple-400");
        }
        if (skill.id === 'rp6') { // Ghost Form
            addFloatingText("HAYALET FORMU", playerPosRef.current.x, 3, playerPosRef.current.y, "text-purple-300");
            // Add evasion/stealth logic in combat calc if possible
            // For now just visual message
        }

        // 5. ARCHER (r)
        if (skill.id === 'r3') { // Görünmezlik
            addFloatingText("Görünmezlik Aktif", playerPosRef.current.x, 3, playerPosRef.current.y, "text-green-300");
            // Logic would go here
        }

        // 6. MONK (mn)
        if (skill.id === 'mn2') { // Mantra (Heal)
            handleUpdatePlayerSafe({ hp: Math.min(playerState.maxHp, playerState.hp + Math.floor(playerState.maxHp * 0.2)) });
            addFloatingText("Mantra: İyileşme", playerPosRef.current.x, 3, playerPosRef.current.y, "text-yellow-300");
        }
        if (skill.id === 'mn6') { // Ruh Kalkanı (Defense Buff)
            addFloatingText("Ruh Kalkanı", playerPosRef.current.x, 3, playerPosRef.current.y, "text-amber-400");
            const originalDef = playerState.defense;
            handleUpdatePlayerSafe({ defense: Math.floor(originalDef * 1.3) });
            setTimeout(() => {
                handleUpdatePlayerSafe({ defense: originalDef });
            }, 8000);
        }
        if (skill.id === 'mn7') { // Nirvana (Invincible)
            addFloatingText("NIRVANA!", playerPosRef.current.x, 3, playerPosRef.current.y, "text-yellow-500 font-bold text-xl");
            // Logic: Set a flag 'isInvincible' in state or just huge defense
            const originalDef = playerState.defense;
            handleUpdatePlayerSafe({ defense: 999999 });
            spawnVisualEffect(playerPosRef.current.x, playerPosRef.current.y, '#fcd34d');
            setTimeout(() => {
                handleUpdatePlayerSafe({ defense: originalDef });
                addFloatingText("Nirvana Bitti", playerPosRef.current.x, 3, playerPosRef.current.y, "text-slate-400");
            }, 5000); // 5 sec invincibility
        }

        // --- BARD SPECIAL MECHANICS ---
        if (skill.id === 'b3') {
            // Defense Break (Yıkım Notası)
            const range = 10;
            setEntities(prev => prev.map(ent => {
                const dist = Math.sqrt(Math.pow(ent.x / 15 - playerPosRef.current.x, 2) + Math.pow(ent.y / 15 - playerPosRef.current.y, 2));
                const isTarget = effectiveTarget && effectiveTarget.id === ent.id;

                if (isTarget && dist < range) {
                    // Visual
                    spawnVisualEffect(ent.x / 15, ent.y / 15, '#1e293b'); // Dark Blue/Black
                    addFloatingText("SAVUNMA KIRILDI!", ent.x / 15, 3, ent.y / 15, "text-red-500 font-bold");

                    // Apply Break (30% Def Reduction)
                    const originalDef = ent.defense || 0;
                    const newDef = Math.floor(originalDef * 0.7);

                    // Revert after 5s
                    setTimeout(() => {
                        setEntities(curr => curr.map(e => e.id === ent.id ? { ...e, defense: originalDef } : e));
                    }, 5000);

                    return { ...ent, defense: newDef };
                }
                return ent;
            }));
            // Continue to damage logic? No, type is utility.
            if (skill.type === 'utility') return;
        }

        if (skill.id === 'b7') {
            // Bard Ultimate Buff Logic (Destansı Final)
            // Effect: +50% All Stats for 20s
            addFloatingText("TAKIM GÜÇLENDİ!", playerPosRef.current.x, 3, playerPosRef.current.y, "text-purple-400 font-bold text-xl");
            spawnVisualEffect(playerPosRef.current.x, playerPosRef.current.y, '#a855f7');

            // Apply Buff to Player
            const duration = skill.duration || 20;
            const originalStats = { ...playerState }; // Snapshot

            // Update Player Data (Optimistic)
            handleUpdatePlayerSafe({
                damage: Math.floor(playerState.damage * 1.5),
                defense: Math.floor(playerState.defense * 1.5),
                // Add explicit visible feedback
            });

            // Revert after Duration
            setTimeout(() => {
                handleUpdatePlayerSafe({
                    damage: originalStats.damage,
                    defense: originalStats.defense
                });
                addFloatingText("BUFF BİTTİ", playerPosRef.current.x, 3, playerPosRef.current.y, "text-slate-400 font-bold");
            }, duration * 1000);

            // TODO: In a real multiplayer scenario, emit socket event to buff party members
            // if (socketRef.current) socketRef.current.emit('cast_buff', { skillId: 'b7', duration });
        }

        if (skill.type === 'damage' || skill.type === 'ultimate') {
            const range = 10;
            const factor = skill.type === 'ultimate' ? 3 : 1.5;

            // Sound Effect
            soundManager.playSFX('attack_magic');

            setEntities((prev: GameEntity[]) => {
                // Check Mobs/NPCs
                const newEntities = prev.map(ent => {
                    const isDuelOpponent = activeDuel && activeDuel.opponentId === ent.id;
                    if (!ent.isHostile && !isDuelOpponent) return ent;

                    const ex = ent.x / 15;
                    const ey = ent.y / 15;
                    const dist = Math.sqrt(Math.pow(ex - playerPosRef.current.x, 2) + Math.pow(ey - playerPosRef.current.y, 2));

                    // LOGIC:
                    // 1. If AoE: Hit anything in range.
                    // 2. If Single Target: Hit ONLY the effectiveTarget.

                    const isTarget = effectiveTarget && effectiveTarget.id === ent.id;
                    const inRange = dist < range;

                    let shouldHit = false;

                    if (skill.isAoE) {
                        shouldHit = inRange;
                    } else {
                        shouldHit = isTarget && inRange;
                    }

                    if (isDuelOpponent && shouldHit) {
                        // PVP Logic
                        console.log("Attacking Duel Opponent:", activeDuel?.opponentId);
                        if (socketRef.current) {
                            socketRef.current.emit('attack_player', {
                                targetId: ent.id,
                                damage: Math.floor(playerState.damage * factor),
                                skillName: skill.name
                            });
                        }
                        return ent;
                    }

                    if (shouldHit) {
                        const dmg = Math.floor(playerState.damage * factor);
                        addFloatingText(`${dmg}`, ex, 2, ey, 'text-yellow-400 font-bold text-2xl');
                        spawnVisualEffect(ex, ey, '#3b82f6'); // Blue hit effect

                        if (ent.hp - dmg <= 0) {
                            setTimeout(() => handleKill(ent, ex, ey), 0);
                            if (effectiveTarget?.id === ent.id) setTarget(null);
                            return { ...ent, hp: 0 };
                        }
                        return { ...ent, hp: ent.hp - dmg, hitFlash: Date.now() };
                    }
                    return ent;
                }).filter(e => e.hp > 0);
                return newEntities;
            });
        }

        else if (skill.type === 'heal') {
            handleUpdatePlayerSafe({ hp: Math.min(playerState.maxHp, playerState.hp + playerState.maxHp * 0.3) });
            addFloatingText("İyileşildi", playerPosRef.current.x, 2, playerPosRef.current.y, "text-green-500");
            spawnVisualEffect(playerPosRef.current.x, playerPosRef.current.y, '#4ade80');
        }
    };

    const updateMovement = () => {
        const { w, a, s, d } = keysPressed.current;
        let x = 0;
        let y = 0;
        if (w) y += 1;
        if (s) y -= 1;
        if (d) x += 1;
        if (a) x -= 1;
        if (x === 0 && y === 0) setJoystick(null);
        else {
            const mag = Math.sqrt(x * x + y * y);
            setJoystick({ x: x / mag, y: y / mag });
        }
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Simplistic check: if active element is input, ignore movement
            if ((document.activeElement as HTMLElement)?.tagName === 'INPUT') return;

            if (e.repeat) return; // Anti-spam logic for all keys

            if (['w', 'a', 's', 'd', 'W', 'A', 'S', 'D'].includes(e.key)) { keysPressed.current[e.key.toLowerCase()] = true; updateMovement(); }
            if (e.key === ' ') handleAttack();

            // --- CLASS SPECIFIC CONTROLS (User Requested) ---
            // Archmage: 'Q' to Cast Spell
            if ((e.key === 'q' || e.key === 'Q') && playerState.class === 'archmage') {
                const skill = CLASSES['archmage'].skills[0];
                if (skill) handleSkill(skill.id, skill);
            }
            // Warrior: 'Z' to Melee Attack
            if ((e.key === 'z' || e.key === 'Z') && playerState.class === 'warrior') {
                handleAttack();
            }

            // Archer: 'E' to Shoot Arrow
            if ((e.key === 'e' || e.key === 'E') && playerState.class === 'archer') {
                setPlayerAction('shoot');
                setTimeout(() => setPlayerAction(null), 500);
            }

            // Reaper: 'Space' to Stab (Fast Attack)
            if (e.key === ' ' && playerState.class === 'reaper') {
                handleAttack();
            }

            // Cleric: 'Q' to Heal (Skill 1)
            if ((e.key === 'q' || e.key === 'Q') && playerState.class === 'cleric') {
                // Trigger first skill as "Heal"
                const skill = CLASSES['cleric'].skills[0];
                if (skill) handleSkill(skill.id, skill);
            }

            if (e.key === 'm' || e.key === 'M') { setShowMap(prev => !prev); }

            // TAB: Envanter aç/kapat
            if (e.key === 'Tab') {
                e.preventDefault(); // Tarayıcı varsayılan davranışını engelle
                setShowInventory(prev => !prev);
            }

            if (e.key === 't' || e.key === 'T') {
                const hostileTarget = findTarget();
                if (hostileTarget) setTarget(hostileTarget);
            }

            if (e.key === 'Escape') { setTarget(null); setShowMap(false); setShowSettings(false); setShowGlobalMap(false); }
            if (['1', '2', '3', '4', '5', '6'].includes(e.key) && playerState?.class) {
                const idx = parseInt(e.key) - 1;
                const skill = CLASSES[playerState.class].skills[idx];
                if (skill) handleSkill(skill.id, skill);
            }
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            if (['w', 'a', 's', 'd', 'W', 'A', 'S', 'D'].includes(e.key)) { keysPressed.current[e.key.toLowerCase()] = false; updateMovement(); }
        };
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); };
    }, [playerState.class, playerState.mana, entities, playerState.settings.pvpPriority]);



    const handleCollectLootBox = (box: LootBox) => {
        const timeDiff = Date.now() - box.createdAt;
        const isLocked = timeDiff < 60000; // 60 Seconds Lock

        // Check Ownership
        if (isLocked && box.ownerId !== playerState.nickname) {
            const remaining = Math.ceil((60000 - timeDiff) / 1000);
            addFloatingText(`Bu Kutu Kilitli! (${remaining}sn)`, box.x, 2, box.z, 'text-red-500 font-bold');
            return;
        }

        setLootBoxes(prev => prev.filter(b => b.id !== box.id));
        const gold = box.tier * 50;
        onLoot(gold, 0, 0, box.item);
        addFloatingText(box.item ? box.item.name : `+${gold} G`, box.x, 2, box.z, 'text-yellow-300');
    };

    // ═══════════════════════════════════════════════════════════════
    // RESPAWN SYSTEM - Yerinde veya Güvenli Bölgede Doğma
    // ═══════════════════════════════════════════════════════════════

    // Güvenli bölge hesapla (faction'a göre x-1 veya x-8)
    const getSafeZone = (): number => {
        // Faction bazlı: Marsu=1x, Terya=2x, Venu=3x
        const factionBase = playerState.faction === 'marsu' ? 10 : playerState.faction === 'terya' ? 20 : 30;

        // x-5 ile x-8 arası veya boss haritaları → x-8'e git
        if ((zoneId % 10 >= 5 && zoneId % 10 <= 8) || zoneId === 44 || zoneId === 45) {
            return factionBase + 8; // x-8 (18, 28, 38)
        }

        // x-1 ile x-4 veya PvP girişleri → x-1'e git
        return factionBase + 1; // x-1 (11, 21, 31)
    };

    // Yerinde Doğma (100 Elmas)
    const handleRespawnHere = () => {
        const RESPAWN_COST = 100;
        if (playerState.gems >= RESPAWN_COST) {
            onUpdatePlayer({
                gems: playerState.gems - RESPAWN_COST,
                hp: playerState.maxHp,
                mana: playerState.maxMana
            });
            addFloatingText('💎 Yerinde Dirildin!', playerPosRef.current.x, 3, playerPosRef.current.y, 'text-purple-400 font-bold');
            soundManager.playSFX('level_up');
        } else {
            addFloatingText('Yetersiz Elmas!', playerPosRef.current.x, 3, playerPosRef.current.y, 'text-red-500 font-bold');
        }
    };

    // Güvenli Bölgede Doğma (Ücretsiz)
    const handleRespawnSafe = () => {
        const safeZone = getSafeZone();

        // Reset player position to center of the safe zone (Ana Üs merkezi)
        if (playerGroupRef.current) {
            playerGroupRef.current.position.set(0, 0, 5); // Spawn just in front of the castle
        }
        playerPosRef.current = { x: 0, y: 5 };

        onUpdatePlayer({
            hp: playerState.maxHp,
            mana: playerState.maxMana
        });

        // Switch to safe zone
        props.onSwitchZone(safeZone);

        addFloatingText('🏰 Güvenli Bölgede Dirildin!', 0, 3, 5, 'text-green-400 font-bold');
        soundManager.playSFX('portal');
    };

    // EXP progress now handled by ExpBarCompact component

    const hpPotCount = playerState.inventory.filter(i => i.name.includes('Can')).length;
    const mpPotCount = playerState.inventory.filter(i => i.name.includes('Mana')).length;

    // --- SKILL BUTTON RENDERER (MMO STYLE) ---
    const renderSkillButton = (skill: any, i: number, sizeClass: string = "w-14 h-14") => {
        const isOnCd = !!cooldowns[skill.id];
        const hasMana = playerState.mana >= skill.manaCost;
        const skillLevelReq = skill.levelReq || 1;
        const isLocked = playerState.level < skillLevelReq;

        return (
            <button
                key={skill.id}
                onMouseDown={() => !isLocked && handleSkill(skill.id, skill)}
                onTouchStart={() => !isLocked && handleSkill(skill.id, skill)}
                disabled={isOnCd || isLocked}
                className={`${sizeClass} relative group transition-all select-none touch-none
                    ${isLocked ? 'grayscale opacity-50 cursor-not-allowed' : 'active:scale-95 cursor-pointer'}
                `}
            >
                {/* Main Container - Hex/Square Hybrid */}
                <div className={`w-full h-full rounded-xl border-2 overflow-hidden relative shadow-lg transition-colors
                    ${isLocked ? 'bg-slate-900 border-slate-800' :
                        isOnCd ? 'bg-slate-800 border-slate-600' :
                            hasMana ? 'bg-slate-900 border-slate-500 hover:border-yellow-400 group-hover:shadow-[0_0_10px_rgba(250,204,21,0.5)]' : 'bg-slate-900 border-red-900 opacity-80'}
                `}>
                    {/* Background Gradient/Image */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-black/60 pointer-events-none z-10" />

                    {/* Skill Icon */}
                    {skill.icon?.startsWith('/') ? (
                        <img src={skill.icon} alt="skill" className="w-full h-full object-cover relative z-0" />
                    ) : (
                        <div className={`w-full h-full flex items-center justify-center text-2xl relative z-0 ${!hasMana ? 'text-blue-900' : 'text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]'}`}>
                            {skill.icon || (i + 1)}
                        </div>
                    )}

                    {/* Cooldown Overlay (Radial Wipe) */}
                    {isOnCd && !isLocked && (
                        <div className="absolute inset-0 bg-black/80 z-20 flex items-center justify-center backdrop-blur-[1px]">
                            <span className="text-white font-black font-mono text-sm drop-shadow-md">{Math.ceil(cooldowns[skill.id] / 1000)}</span>
                        </div>
                    )}

                    {/* Mana Check Overlay (Blue Tint) */}
                    {!hasMana && !isOnCd && !isLocked && (
                        <div className="absolute inset-0 bg-blue-900/40 z-20 flex items-center justify-center">
                            <Droplet size={16} className="text-blue-400 animate-pulse drop-shadow-md" />
                        </div>
                    )}

                    {/* Level Lock Overlay */}
                    {isLocked && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-black/60">
                            <Lock size={14} className="text-slate-500" />
                            <span className="text-[9px] text-red-400 font-bold mt-0.5">Lv.{skillLevelReq}</span>
                        </div>
                    )}

                    {/* Hotkey Badge (Keycap Style) */}
                    <div className="absolute bottom-0 right-0 z-20 bg-[#1a1c23] border-t border-l border-slate-600 rounded-tl px-1.5 py-0.5 text-[10px] font-bold text-slate-300 shadow-sm">
                        {i + 1}
                    </div>
                </div>
            </button>
        );
    };

    // Zoom Controller Helper
    const ZoomController = () => {
        const { camera, gl } = useThree();
        useEffect(() => {
            const handleWheel = (e: any) => { // Cast to any to avoid strict WheelEvent issues if lib missing
                e.preventDefault();
                if (camera instanceof THREE.PerspectiveCamera) {
                    let newZoom = camera.zoom - (e.deltaY || 0) * 0.001;
                    newZoom = Math.max(0.5, Math.min(2.0, newZoom)); // Clamp zoom
                    camera.zoom = newZoom;
                    camera.updateProjectionMatrix();
                }
            };
            const canvas = gl.domElement as unknown as HTMLElement; // Safe cast
            canvas.addEventListener('wheel', handleWheel as any, { passive: false });
            return () => canvas.removeEventListener('wheel', handleWheel as any);
        }, [camera, gl]);
        return null;
    };

    return (
        <div className="relative w-full h-full bg-black select-none overflow-hidden touch-none">
            {/* Event Banner Overlay */}
            <EventBanner zoneId={zoneId} level={playerState.level} />



            <Canvas
                camera={{ position: [0, 15, 15], fov: 50 }}
                shadows={settings.showShadows}
                dpr={Math.min(window.devicePixelRatio, 1.5)} // Limit pixel ratio for mobile performance
                gl={{
                    antialias: false, // Disable antialiasing for mobile performance
                    powerPreference: 'high-performance', // Use dedicated GPU if available
                    preserveDrawingBuffer: true, // Help prevent context loss
                    failIfMajorPerformanceCaveat: false // Don't fail on low-end devices
                }}
                onCreated={({ gl }) => {
                    // Handle WebGL context loss/restore
                    const canvas = gl.domElement;
                    canvas.addEventListener('webglcontextlost', (e) => {
                        e.preventDefault();
                        console.warn('WebGL context lost, will try to restore...');
                    });
                    canvas.addEventListener('webglcontextrestored', () => {
                        console.log('WebGL context restored!');
                    });
                }}
            >
                <ZoomController />
                <GameScene
                    joystick={joystick}
                    playerGroupRef={playerGroupRef}
                    playerPosRef={playerPosRef}
                    setPlayerPosUI={setPlayerPosUI}
                    entities={entities} setEntities={setEntities}
                    lootBoxes={lootBoxes} onCollectLootBox={handleCollectLootBox} setLootBoxes={setLootBoxes}
                    projectiles={projectiles} setProjectiles={setProjectiles}
                    isAttacking={isAttacking}
                    zoneColor={zoneData?.bg || '#000'}
                    addFloatingText={addFloatingText}
                    playerStats={playerState}
                    onUpdatePlayer={handleUpdatePlayerSafe}
                    borderLimit={100} skillEffects={skillEffects} isDead={playerState.hp <= 0}
                    setNearbyNPC={setNearbyNPC} onLoot={onLoot} onKill={handleKill}
                    portals={zoneData?.portals || []} onPortalJump={props.onSwitchZone}
                    hasBase={hasBase}
                    zoneId={zoneId}
                    target={target}
                    isAdmin={props.isAdmin}
                    lastDamageTimeRef={lastDamageTimeRef}
                    teleporting={teleporting}
                    setTeleporting={setTeleporting}
                    spawnParticles={particles}
                    isFreeLook={isFreeLook}
                    onSpawnParticle={(pos, color) => setParticles(prev => [...prev, { id: uuidv4(), pos, color }])}
                    socketRef={socketRef}
                    lastSocketUpdate={lastSocketUpdate}
                    remotePlayers={remotePlayers}
                    targetedPlayer={targetedPlayer}
                    setTargetedPlayer={setTargetedPlayer}
                    castingSkill={castingSkill}
                    setIsLoading={setIsLoading}
                    entitiesRef={entitiesRef}
                    lastAttackTimeRef={lastAttackTimeRef}
                />


                {settings.showDamageNumbers && floatingTexts.map(ft => <FloatingTextComponent key={ft.id} data={ft} />)}
                {settings.showPostProcessing && (
                    <EffectComposer>
                        <Bloom luminanceThreshold={1} mipmapBlur intensity={1.5} radius={0.4} />
                    </EffectComposer>
                )}
                <Suspense fallback={null}>
                    <SkillEffects
                        activeSkills={active3DEffects}
                        onEffectComplete={(id) => setActive3DEffects(prev => prev.filter(e => e.id !== id))}
                        playerGroupRef={playerGroupRef}
                    />
                </Suspense>
                {/* Hava Durumu Parçacıkları ve Sis */}
                <Suspense fallback={null}>
                    <WeatherParticles />
                    <FogEffect />
                </Suspense>
            </Canvas>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* ÖLÜM EKRANI OVERLAY */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            {playerState.hp <= 0 && (
                <div className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center animate-[fadeIn_0.5s]">
                    {/* Kırmızı titreme efekti */}
                    <div className="absolute inset-0 bg-red-900/30 animate-pulse pointer-events-none" />

                    <div className="relative bg-gradient-to-b from-slate-900 to-black border-2 border-red-800 rounded-2xl p-8 w-96 shadow-[0_0_50px_rgba(220,38,38,0.5)] animate-[bounceIn_0.5s]">
                        {/* Kafatası İkonu */}
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-gradient-to-b from-red-900 to-red-950 rounded-full border-4 border-red-600 flex items-center justify-center shadow-lg">
                            <span className="text-5xl animate-pulse">💀</span>
                        </div>

                        <div className="mt-8 text-center">
                            <h1 className="text-4xl font-black text-red-500 mb-2 tracking-wider animate-pulse">ÖLDÜN!</h1>
                            <p className="text-slate-400 text-sm mb-6">Karakter seviyesi: {playerState.level}</p>

                            {/* Seçenekler */}
                            <div className="space-y-4">
                                {/* Yerinde Doğma - 100 Elmas */}
                                <button
                                    onClick={handleRespawnHere}
                                    disabled={playerState.gems < 100}
                                    className={`w-full py-4 rounded-xl border-2 flex items-center justify-center gap-3 font-bold text-lg transition-all ${playerState.gems >= 100
                                        ? 'bg-gradient-to-r from-purple-700 to-purple-600 border-purple-400 text-white hover:from-purple-600 hover:to-purple-500 hover:scale-105 shadow-lg shadow-purple-900/50'
                                        : 'bg-slate-800 border-slate-600 text-slate-500 cursor-not-allowed'
                                        }`}
                                >
                                    <span className="text-2xl">💎</span>
                                    YERİNDE DİRİL
                                    <span className="bg-black/50 px-3 py-1 rounded-lg text-sm">100 Elmas</span>
                                </button>
                                <p className="text-xs text-slate-500 -mt-2">
                                    Elmasın: <span className={playerState.gems >= 100 ? 'text-purple-400' : 'text-red-400'}>{playerState.gems}</span>
                                </p>

                                {/* Güvenli Bölgede Doğma - Ücretsiz */}
                                <button
                                    onClick={handleRespawnSafe}
                                    className="w-full py-4 bg-gradient-to-r from-emerald-700 to-emerald-600 rounded-xl border-2 border-emerald-400 text-white font-bold text-lg flex items-center justify-center gap-3 hover:from-emerald-600 hover:to-emerald-500 hover:scale-105 transition-all shadow-lg shadow-emerald-900/50"
                                >
                                    <span className="text-2xl">🏠</span>
                                    GÜVENLİ BÖLGEDE DİRİL
                                    <span className="bg-black/50 px-3 py-1 rounded-lg text-sm text-emerald-300">ÜCRETSİZ</span>
                                </button>
                                <p className="text-xs text-slate-500 -mt-2">
                                    {getSafeZone() % 10 >= 5 ? `${playerState.faction?.toUpperCase()} x-8 haritasında doğarsın` : `${playerState.faction?.toUpperCase()} x-1 haritasında doğarsın`}
                                </p>
                            </div>

                            {/* Alt Bilgi */}
                            <div className="mt-6 pt-4 border-t border-slate-700/50">
                                <p className="text-xs text-slate-600">
                                    ⚠️ Ölüm korkulu değildir, korkulan ölümsüzlükteki yalnızlıktır.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- HUD RENDER LAYER --- */}

            {/* BOSS ZONE INDICATOR - Küçük modal, ekranı kaplamaz */}
            {zoneData?.enemies?.some(e => e.name?.includes('[BOSS]')) && (
                <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[80] pointer-events-none animate-pulse">
                    <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-900/90 to-orange-900/90 rounded-lg border border-red-500/60 shadow-lg shadow-red-900/50 backdrop-blur-sm">
                        <span className="text-lg">💀</span>
                        <span className="text-sm font-bold text-white uppercase tracking-wider">Boss Bölgesi</span>
                        <span className="text-lg">💀</span>
                    </div>
                </div>
            )}

            {/* Hava Durumu Göstergesi */}
            <WeatherIndicator />
            <WeatherChangeNotification />

            {/* JOYSTICK */}
            <DraggableHUDElement id="joystick" element={hudLayout.elements.joystick} isEditing={isHudEditing} isSelected={selectedElementId === 'joystick'} onSelect={setSelectedElementId} onDragStart={handleDragStart}>
                <div>
                    <div className="w-32 h-32 relative pointer-events-auto"
                        onMouseDown={(e) => { !isHudEditing && setJoystick({ x: 0, y: 0 }); }}
                        onTouchStart={(e) => { !isHudEditing && setJoystick({ x: 0, y: 0 }); }}
                        onTouchMove={(e) => {
                            if (isHudEditing) return;
                            const touch = e.touches[0];
                            const rect = e.currentTarget.getBoundingClientRect();
                            const centerX = rect.left + rect.width / 2;
                            const centerY = rect.top + rect.height / 2;
                            const dx = (touch.clientX - centerX) / (rect.width / 2);
                            const dy = (touch.clientY - centerY) / (rect.height / 2);
                            setJoystick({ x: Math.max(-1, Math.min(1, dx)), y: Math.max(-1, Math.min(1, -dy)) });
                        }}
                        onTouchEnd={() => !isHudEditing && setJoystick(null)}
                    >
                        {/* MMO STYLE JOYSTICK BASE */}
                        <div className="w-full h-full rounded-full relative backdrop-blur-[2px] border-2 border-white/10 bg-gradient-to-br from-white/5 to-black/40 shadow-[ inset_0_0_20px_rgba(0,0,0,0.5) ]">
                            {/* Inner Ring Decoration */}
                            <div className="absolute inset-2 rounded-full border border-white/5 border-dashed opacity-50" />
                            <div className="absolute inset-6 rounded-full border border-white/5 opacity-30" />

                            {/* Center Crosshair */}
                            <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-white/20 -translate-x-1/2 -translate-y-1/2 rounded-full" />

                            {/* JOYSTICK THUMB */}
                            <div
                                className="absolute w-14 h-14 rounded-full shadow-2xl transition-transform duration-75 group"
                                style={{
                                    left: `calc(50% + ${joystick ? joystick.x * 50 : 0}px)`,
                                    top: `calc(50% - ${joystick ? joystick.y * 50 : 0}px)`,
                                    transform: 'translate(-50%, -50%)',
                                    background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), rgba(200,200,200,1))',
                                    boxShadow: '0 4px 10px rgba(0,0,0,0.5), inset 0 -4px 4px rgba(0,0,0,0.2)'
                                }}
                            >
                                {/* Metallic/Crystal Effect on Knob */}
                                <div className="absolute inset-1 rounded-full bg-gradient-to-br from-transparent to-black/20" />
                                <div className="absolute top-2 left-3 w-4 h-2 bg-white/60 blur-[2px] rounded-full rotate-45" />
                            </div>
                        </div>
                    </div>
                </div>
            </DraggableHUDElement>

            {/* FREE LOOK / EYE BUTTON */}
            <DraggableHUDElement id="eye" element={hudLayout.elements.eye || { x: 80, y: 40, scale: 1, enabled: true, opacity: 1, locked: false }} isEditing={isHudEditing} isSelected={selectedElementId === 'eye'} onSelect={setSelectedElementId} onDragStart={handleDragStart}>
                <div>
                    <button
                        onMouseDown={() => setIsFreeLook(true)}
                        onMouseUp={() => setIsFreeLook(false)}
                        onMouseLeave={() => setIsFreeLook(false)}
                        onTouchStart={() => setIsFreeLook(true)}
                        onTouchEnd={() => setIsFreeLook(false)}
                        className={`w-14 h-14 rounded-full border-2 flex items-center justify-center shadow-lg transition-all active:scale-95 pointer-events-auto
                            ${isFreeLook ? 'bg-yellow-600 border-yellow-400 opacity-100' : 'bg-slate-900/50 border-slate-600 opacity-60 hover:opacity-100'}
                        `}
                    >
                        <Eye size={24} className="text-white" />
                    </button>
                </div>
            </DraggableHUDElement>

            {/* ATTACK BUTTON */}
            <DraggableHUDElement id="attack" element={hudLayout.elements.attack} isEditing={isHudEditing} isSelected={selectedElementId === 'attack'} onSelect={setSelectedElementId} onDragStart={handleDragStart}>
                <div>
                    <button
                        onMouseDown={handleAttack}
                        onTouchStart={handleAttack}
                        className="w-24 h-24 relative rounded-full shadow-[0_0_20px_rgba(220,38,38,0.6)] active:scale-95 group transition-all pointer-events-auto flex items-center justify-center"
                    >
                        {/* Outer Glow Ring */}
                        <div className="absolute -inset-2 rounded-full border-2 border-red-500/30 animate-pulse" />

                        {/* Main Button Body - Gradient Red */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-500 to-red-900 border-4 border-red-950 shadow-inner flex items-center justify-center overflow-hidden">
                            {/* Shine Effect */}
                            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/20 to-transparent" />

                            {/* Icon */}
                            <Swords size={48} className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] z-10 group-active:rotate-12 transition-transform" />
                        </div>
                    </button>
                </div>
            </DraggableHUDElement>

            {/* SKILLS 1-6 (INDIVIDUAL DRAGGABLES) - REDUCED TO 6 */}
            {['skill1', 'skill2', 'skill3', 'skill4', 'skill5', 'skill6'].map((key, i) => (
                <DraggableHUDElement key={key} id={key} element={hudLayout.elements[key]} isEditing={isHudEditing} isSelected={selectedElementId === key} onSelect={setSelectedElementId} onDragStart={handleDragStart}>
                    <div>
                        {playerState.class && CLASSES[playerState.class]?.skills?.[i]
                            ? renderSkillButton(CLASSES[playerState.class].skills[i], i)
                            : <div className="w-12 h-12 bg-slate-800 rounded-full border border-slate-600 opacity-30" />
                        }
                    </div>
                </DraggableHUDElement>
            ))}


            {/* HP POT - Separately Draggable */}
            <DraggableHUDElement id="hp_pot" element={hudLayout.elements.hp_pot} isEditing={isHudEditing} isSelected={selectedElementId === 'hp_pot'} onSelect={setSelectedElementId} onDragStart={handleDragStart}>
                <div>
                    <button onClick={() => props.onQuickPotion('hp')} className="w-12 h-12 bg-gradient-to-br from-red-800 to-red-950 border-2 border-red-700/50 hover:border-red-500 rounded-xl flex flex-col items-center justify-center relative shadow-lg active:scale-95 pointer-events-auto group">
                        <div className="absolute inset-0 bg-black/20 rounded-xl pointer-events-none" />
                        <Droplet size={20} className="text-red-400 drop-shadow-md z-10 group-hover:scale-110 transition-transform" />
                        <div className="absolute bottom-0 right-0 bg-[#1a1c23] border-t border-l border-red-900/50 rounded-tl px-1 text-[9px] text-red-200 font-bold z-20">
                            {hpPotCount}
                        </div>
                    </button>
                </div>
            </DraggableHUDElement>

            {/* MP POT - Separately Draggable */}
            <DraggableHUDElement id="mp_pot" element={hudLayout.elements.mp_pot} isEditing={isHudEditing} isSelected={selectedElementId === 'mp_pot'} onSelect={setSelectedElementId} onDragStart={handleDragStart}>
                <div>
                    <button onClick={() => props.onQuickPotion('mp')} className="w-12 h-12 bg-gradient-to-br from-blue-800 to-blue-950 border-2 border-blue-700/50 hover:border-blue-500 rounded-xl flex flex-col items-center justify-center relative shadow-lg active:scale-95 pointer-events-auto group">
                        <div className="absolute inset-0 bg-black/20 rounded-xl pointer-events-none" />
                        <Zap size={20} className="text-blue-400 drop-shadow-md z-10 group-hover:scale-110 transition-transform" />
                        <div className="absolute bottom-0 right-0 bg-[#1a1c23] border-t border-l border-blue-900/50 rounded-tl px-1 text-[9px] text-blue-200 font-bold z-20">
                            {mpPotCount}
                        </div>
                    </button>
                </div>
            </DraggableHUDElement>


            {/* PROFILE UI - PRO MMO STYLE */}
            <DraggableHUDElement id="profile" element={hudLayout.elements.profile} isEditing={isHudEditing} isSelected={selectedElementId === 'profile'} onSelect={setSelectedElementId} onDragStart={handleDragStart}>
                <div style={{ transformOrigin: 'top left' }} className="pointer-events-auto select-none flex items-start -ml-2 -mt-2">
                    {/* Level Badge - Gold Frame */}
                    <div className="relative z-20 w-16 h-16 flex-shrink-0">
                        <div className="absolute inset-0 bg-slate-900 rounded-full border-[3px] border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.4)] flex items-center justify-center overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-b from-slate-800 to-black" />
                            <div className="absolute top-0 w-full h-1/2 bg-white/5 rounded-t-full" />
                            <span className="relative z-10 text-2xl font-black text-white font-serif drop-shadow-md">{playerState.level}</span>
                        </div>
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-yellow-600 border border-yellow-400 text-white text-[9px] font-bold px-1.5 rounded shadow-sm">LVL</div>
                    </div>

                    {/* Profile Info & Bars */}
                    <div className="flex flex-col pl-6 -ml-5 pt-1 w-64 bg-gradient-to-r from-black/80 to-transparent pr-4 pb-2 rounded-r-xl backdrop-blur-sm border-t border-b border-black/20">
                        {/* Name Layer */}
                        <div className="flex justify-between items-center mb-0.5 pl-2">
                            <PixelGoldUser
                                name={playerState.nickname}
                                isVip={(playerState.vipUntil || 0) > Date.now()}
                                className="text-sm tracking-wide"
                            />
                            <div className="flex items-center gap-1">
                                <RankIcon rank={playerState.rank} size="sm" />
                                {/* RANKS dizisinden rütbe başlığını bul - rank 1'den başlıyor */}
                                <span className="text-[10px] text-yellow-400 font-bold uppercase">{RANKS.find(r => r.id === playerState.rank)?.title || RANKS[0]?.title || 'Acemi'}</span>
                            </div>
                        </div>

                        {/* HP BAR - Crystal Style */}
                        <div className="relative h-3.5 w-full bg-black/60 rounded-sm border border-slate-600/50 mb-0.5 overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-red-800 via-red-600 to-red-500 transition-all duration-300 relative"
                                style={{ width: `${(playerState.hp / playerState.maxHp) * 100}%` }}
                            >
                                <div className="absolute top-0 left-0 w-full h-[1px] bg-red-400/50" />
                                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-red-900/50" />
                            </div>
                            <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,1)] tracking-wider z-10">
                                {playerState.hp} / {playerState.maxHp}
                            </span>
                        </div>

                        {/* MP BAR - Crystal Style */}
                        <div className="relative h-2.5 w-full bg-black/60 rounded-sm border border-slate-600/50 overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-800 via-blue-600 to-blue-500 transition-all duration-300 relative"
                                style={{ width: `${(playerState.mana / playerState.maxMana) * 100}%` }}
                            >
                                <div className="absolute top-0 left-0 w-full h-[1px] bg-blue-400/50" />
                            </div>
                            <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,1)] tracking-wider z-10">
                                {playerState.mana}
                            </span>
                        </div>

                        {/* EXP Bar (Thin line at bottom) */}
                        <div className="mt-1 h-1 w-full bg-black/50 rounded-full overflow-hidden">
                            <div className="h-full bg-yellow-500" style={{ width: `${(playerState.exp / (playerState.level * 1000)) * 100}%` }} />
                        </div>
                    </div>
                </div>
            </DraggableHUDElement>

            {/* MAP ONLY (Buttons moved out) */}
            <DraggableHUDElement id="map" element={hudLayout.elements.map} isEditing={isHudEditing} isSelected={selectedElementId === 'map'} onSelect={setSelectedElementId} onDragStart={handleDragStart}>
                <div style={{ opacity: settings.hudOpacity / 100, transformOrigin: 'top right', transform: isMobile ? 'scale(0.75)' : 'none' }}>
                    <div className="flex flex-col items-end gap-2 pointer-events-auto">
                        {settings.showMinimap && (
                            <div className="flex gap-4 items-end" style={{ opacity: settings.minimapOpacity / 100 }}>
                                <MiniMap playerPos={playerPosUI} entities={entities} portals={zoneData?.portals || []} zoneLimit={100} onClick={() => setShowMap(true)} smallMap={playerState.settings.smallMap} />
                            </div>
                        )}
                        <div className="bg-black/50 px-3 py-2 rounded text-white font-bold backdrop-blur-sm border border-slate-700 text-xs hidden md:block">{zoneData?.name}</div>
                    </div>
                </div>
            </DraggableHUDElement>

            {/* 
                ⚠️⚠️⚠️ CRITICAL - ÜST MENÜ BUTONLARI SİLİNDİ ⚠️⚠️⚠️
                
                TOP MENU BUTTONS REMOVED - All moved to bottom navigation bar!
                
                BURAYA ASLA BUTON EKLEMEYİN!
                Şu butonlar ÜST MENÜDE OLMAMALI:
                - Chat/Sohbet butonu ❌
                - Inventory/Envanter butonu ❌  
                - Settings/Ayarlar butonu ❌
                - Achievements/Başarımlar butonu ❌
                - Exit/Çıkış (X) butonu ❌
                
                Tüm bu butonlar ALT NAVİGASYON BAR'a taşındı!
                Bkz. satır ~5310 civarı "NOWA STYLE BOTTOM NAVIGATION BAR"
                
                Bu yorum 2026-01-04 tarihinde Claude tarafından eklendi.
                Gemini veya başka AI bu kuralları ihlal etmemelidir!
            */}

            {/* CHAT SYSTEM */}
            {showChat && (
                <DraggableHUDElement id="chat" element={hudLayout.elements.chat} isEditing={isHudEditing} isSelected={selectedElementId === 'chat'} onSelect={setSelectedElementId} onDragStart={handleDragStart}>
                    <div className={`pointer-events-auto transition-all ${isMobile ? 'w-60 h-32 text-[10px]' : 'w-80 h-64'}`} style={{ opacity: settings.chatOpacity / 100 }}>
                        <ChatSystem
                            playerState={playerState}
                            messages={props.chatHistory}
                            onSendMessage={(text, channel) => {
                                // Emit to server
                                if (socketRef.current) {
                                    socketRef.current.emit('chat_message', { text, channel });
                                }
                                // We rely on server echo (chat_broadcast) to update the UI via onReceiveChat
                                // props.onSendChat(text, channel); // Disabled to prevent duplicates
                            }}
                            className="w-full h-full text-xs"
                        />
                    </div>
                </DraggableHUDElement>
            )}

            {/* QUEST TRACKER - Her zaman görünür, küçültülebilir */}
            <DraggableHUDElement id="quest" element={hudLayout.elements.quest} isEditing={isHudEditing} isSelected={selectedElementId === 'quest'} onSelect={setSelectedElementId} onDragStart={handleDragStart}>
                <div style={{ transformOrigin: 'top left' }} className="pointer-events-auto">
                    <div className={`bg-slate-900/90 rounded-lg border border-slate-700 w-52 transition-all shadow-lg ${isHudEditing ? 'border-dashed border-yellow-500' : ''}`}>
                        {/* Header - Her zaman görünür */}
                        <div className="p-2 flex justify-between items-center border-b border-slate-700/50">
                            <span className="text-yellow-500 font-bold text-xs flex items-center gap-1">
                                <Scroll size={12} /> GÖREV TAKİP
                            </span>
                            <button
                                onClick={() => setShowQuestTracker(!showQuestTracker)}
                                className="text-slate-400 hover:text-white p-1"
                            >
                                {showQuestTracker ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                        </div>

                        {/* İçerik - showQuestTracker true ise */}
                        {showQuestTracker && (
                            <div className="p-2 space-y-2">
                                {playerState.activeQuest ? (
                                    <div>
                                        <div className="text-white font-bold text-xs mb-1">{playerState.activeQuest.title}</div>
                                        <div className="h-2 bg-black rounded-full overflow-hidden mb-1">
                                            <div className="h-full bg-gradient-to-r from-yellow-600 to-orange-500" style={{ width: `${(playerState.activeQuest.currentCount / playerState.activeQuest.requiredCount) * 100}%` }}></div>
                                        </div>
                                        <div className="flex justify-between text-[10px] text-slate-400">
                                            <span>{playerState.activeQuest.currentCount} / {playerState.activeQuest.requiredCount}</span>
                                            <span className="text-yellow-500">{Math.round((playerState.activeQuest.currentCount / playerState.activeQuest.requiredCount) * 100)}%</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-slate-500 text-[10px] text-center italic">
                                        Aktif ana görev yok.
                                    </div>
                                )}

                                {/* DAILY QUESTS SECTION */}
                                {playerState.dailyQuests && playerState.dailyQuests.length > 0 && (
                                    <div className="pt-2 border-t border-slate-700/50">
                                        <div className="text-yellow-500 font-bold text-[10px] mb-1 flex items-center gap-1">
                                            <Zap size={10} /> GÜNLÜK GÖREVLER
                                        </div>
                                        {playerState.dailyQuests.map((dq) => (
                                            <div key={dq.id} className="mb-1.5 last:mb-0">
                                                <div className="flex justify-between text-[10px] text-slate-300 mb-0.5">
                                                    <span>{dq.description}</span>
                                                    <span className={dq.current >= dq.target ? 'text-green-400' : 'text-slate-400'}>
                                                        {dq.current}/{dq.target}
                                                    </span>
                                                </div>
                                                <div className="h-1.5 bg-black rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${dq.current >= dq.target ? 'bg-green-500' : 'bg-blue-500'}`}
                                                        style={{ width: `${Math.min(100, (dq.current / dq.target) * 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </DraggableHUDElement>



            {/* --- OVERLAYS --- */}

            {/* PLAYER TARGET FRAME */}
            {targetedPlayer && !activeDuel && (
                <div className="absolute top-28 left-4 z-50 pointer-events-auto">
                    <div className="bg-slate-900/95 border-2 border-slate-600 rounded-xl p-4 w-64 shadow-2xl backdrop-blur-sm">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h3 className="text-white font-bold text-lg">{targetedPlayer.nickname}</h3>
                                <p className="text-slate-400 text-xs">Seviye {targetedPlayer.level} • {targetedPlayer.class || 'Savaşçı'}</p>
                            </div>
                            <button
                                onClick={() => setTargetedPlayer(null)}
                                className="text-slate-500 hover:text-white"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    if (socketRef.current && targetedPlayer) {
                                        socketRef.current.emit('duel_request', targetedPlayer.id);
                                        addFloatingText("Düello isteği gönderildi!", playerPosRef.current.x, 3, playerPosRef.current.y, "text-yellow-400 font-bold");
                                    }
                                }}
                                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-3 rounded border border-red-400 flex items-center justify-center gap-2 transition-colors"
                            >
                                <Swords size={16} /> Düello
                            </button>
                            <button
                                onClick={() => {
                                    // TODO: Add to party invite logic
                                    alert(`${targetedPlayer.nickname} gruba davet edildi (yakında)`);
                                }}
                                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-3 rounded border border-blue-400 flex items-center justify-center gap-2 transition-colors"
                            >
                                <Users size={16} /> Davet
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ACTIVE DUEL INDICATOR */}
            {activeDuel && (
                <div className="absolute top-28 left-4 z-50 pointer-events-none">
                    <div className="bg-red-950/95 border-2 border-red-600 rounded-xl p-4 w-64 shadow-2xl backdrop-blur-sm animate-pulse">
                        <div className="flex items-center gap-3 mb-2">
                            <Swords className="text-red-500" size={24} />
                            <div>
                                <h3 className="text-red-400 font-bold text-lg">DÜELLO!</h3>
                                <p className="text-white text-sm">vs. {activeDuel.opponentName}</p>
                            </div>
                        </div>
                        <p className="text-red-300 text-xs text-center">Rakibini yenmek için savaş!</p>
                    </div>
                </div>
            )}

            {/* BOSS HP BAR */}
            {entities.find(e => e.type === 'boss' && e.hp > 0) && (
                <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4 pointer-events-none">
                    {entities.filter(e => e.type === 'boss' && e.hp > 0).map(boss => (
                        <div key={boss.id} className="relative mb-2">
                            <div className="flex justify-between items-end mb-1 px-1">
                                <span className="text-red-500 font-black text-xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] flex items-center gap-2">
                                    <Skull className="animate-pulse" /> {boss.name}
                                </span>
                                <span className="text-white font-bold text-lg drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                                    {((boss.hp / boss.maxHp) * 100).toFixed(1)}%
                                </span>
                            </div>
                            <div className="h-6 w-full bg-slate-900/80 rounded-sm border-2 border-red-900 relative shadow-2xl overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-300 ${boss.bossData?.isRaged ? 'bg-gradient-to-r from-red-600 via-orange-500 to-red-600 animate-pulse' : 'bg-gradient-to-r from-red-800 to-red-600'}`}
                                    style={{ width: `${(boss.hp / boss.maxHp) * 100}%` }}
                                />
                                {/* Phase Markers */}
                                <div className="absolute top-0 bottom-0 w-0.5 bg-black/50 left-[50%]" />
                            </div>
                            {boss.bossData?.currentSkill && (
                                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-orange-400 font-bold animate-bounce whitespace-nowrap text-lg drop-shadow-md">
                                    ⚠️ {boss.bossData.currentSkill.toUpperCase()} HAZIRLANIYOR! ⚠️
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {teleporting && (
                <div className="absolute top-32 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
                    <div className="bg-[#1a120b]/90 border border-purple-500 p-3 rounded-xl shadow-[0_0_20px_purple] flex flex-col items-center gap-2 w-72 animate-pulse backdrop-blur-sm">
                        <div className="text-purple-300 font-bold text-sm flex items-center gap-2 uppercase tracking-wider">
                            <div className="w-5 h-5 rounded-full border-2 border-purple-400 border-t-transparent animate-spin shadow-lg" />
                            Portal Aktifleşiyor
                        </div>
                        <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
                            <div className="h-full bg-gradient-to-r from-purple-800 via-purple-500 to-white transition-all duration-100 ease-linear shadow-[0_0_10px_white]" style={{ width: `${((Date.now() - teleporting.start) / 5000) * 100}%` }} />
                        </div>
                    </div>
                </div>
            )}

            {isHudEditing && (
                <div className={`absolute top-16 ${debugPanelLeft ? 'right-4' : 'left-4'} w-72 bg-black/95 border-2 border-yellow-600/50 p-4 rounded-xl flex flex-col gap-4 z-[61] pointer-events-auto backdrop-blur-md shadow-2xl animate-[fadeIn_0.2s] transition-all duration-300`}>
                    <h3 className="text-yellow-500 font-bold text-center flex items-center justify-center gap-2 border-b border-yellow-600/30 pb-2">
                        <Move size={18} /> ARAYÜZ DÜZENLEYİCİ
                    </h3>

                    {/* Selected Element Controls */}
                    {selectedElementId ? (
                        <div className="flex flex-col gap-3 animate-[fadeIn_0.3s]">
                            <div className="text-xs font-bold text-white bg-yellow-900/40 p-2 rounded border border-yellow-600/30 flex justify-between items-center">
                                <span>SEÇİLİ: <span className="text-yellow-400 uppercase">{selectedElementId}</span></span>
                                <button onClick={() => setSelectedElementId(null)} className="text-slate-400 hover:text-white"><X size={14} /></button>
                            </div>

                            {/* Scale Slider */}
                            <div className="flex flex-col gap-1">
                                <div className="flex justify-between text-xs text-slate-300">
                                    <span>Boyut</span>
                                    <span>{Math.round((hudLayout.elements[selectedElementId]?.scale || 1) * 100)}%</span>
                                </div>
                                <input
                                    type="range" min="50" max="200" step="5"
                                    value={(hudLayout.elements[selectedElementId]?.scale || 1) * 100}
                                    onChange={(e) => {
                                        const newScale = parseInt(e.target.value) / 100;
                                        setHudLayout(prev => ({
                                            ...prev,
                                            elements: {
                                                ...prev.elements,
                                                [selectedElementId]: {
                                                    ...prev.elements[selectedElementId],
                                                    scale: newScale
                                                }
                                            }
                                        }));
                                    }}
                                    className="w-full h-2 bg-slate-700 rounded-lg accent-yellow-500 cursor-pointer"
                                />
                            </div>

                            {/* Opacity Slider */}
                            <div className="flex flex-col gap-1">
                                <div className="flex justify-between text-xs text-slate-300">
                                    <span>Görünürlük</span>
                                    <span>{Math.round((hudLayout.elements[selectedElementId]?.opacity ?? 1) * 100)}%</span>
                                </div>
                                <input
                                    type="range" min="10" max="100" step="5"
                                    value={(hudLayout.elements[selectedElementId]?.opacity ?? 1) * 100}
                                    onChange={(e) => {
                                        const newOp = parseInt(e.target.value) / 100;
                                        setHudLayout(prev => ({
                                            ...prev,
                                            elements: {
                                                ...prev.elements,
                                                [selectedElementId]: {
                                                    ...prev.elements[selectedElementId],
                                                    opacity: newOp
                                                }
                                            }
                                        }));
                                    }}
                                    className="w-full h-2 bg-slate-700 rounded-lg accent-cyan-500 cursor-pointer"
                                />
                            </div>

                            {/* Toggles */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        const isLocked = hudLayout.elements[selectedElementId]?.locked;
                                        setHudLayout(prev => ({
                                            ...prev,
                                            elements: {
                                                ...prev.elements,
                                                [selectedElementId]: {
                                                    ...prev.elements[selectedElementId],
                                                    locked: !isLocked
                                                }
                                            }
                                        }));
                                    }}
                                    className={`flex-1 py-2 rounded border text-xs font-bold flex items-center justify-center gap-1 transition-colors ${hudLayout.elements[selectedElementId]?.locked ? 'bg-red-900/50 border-red-500 text-red-200' : 'bg-slate-800 border-slate-600 text-slate-400 hover:text-white'}`}
                                >
                                    {hudLayout.elements[selectedElementId]?.locked ? <Lock size={14} /> : <Unlock size={14} />}
                                    {hudLayout.elements[selectedElementId]?.locked ? 'KİLİTLİ' : 'KİLİTLE'}
                                </button>

                                <button
                                    onClick={() => {
                                        const def = DEFAULT_HUD_LAYOUT.elements[selectedElementId as keyof typeof DEFAULT_HUD_LAYOUT.elements];
                                        if (def) {
                                            setHudLayout(prev => ({
                                                ...prev,
                                                elements: {
                                                    ...prev.elements,
                                                    [selectedElementId]: { ...def } // Reset single element
                                                }
                                            }));
                                        }
                                    }}
                                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-xs text-slate-300"
                                >
                                    SIFIRLA
                                </button>
                            </div>

                        </div>
                    ) : (
                        <div className="text-slate-400 text-xs text-center py-6 bg-slate-800/30 rounded border border-dashed border-slate-700 flex flex-col items-center gap-2">
                            <Move className="opacity-50" />
                            <span>Düzenlemek için ekrandaki herhangi bir öğeye dokunun</span>
                        </div>
                    )}

                    {/* Global Actions */}
                    <div className="mt-2 pt-2 border-t border-slate-700/50 flex flex-col gap-2">
                        <div className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Genel Ayarlar</div>
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => { if (confirm('Mobil (Yay) dizilimine geçilecek?')) resetLayout('mobile') }} className="py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-xs text-white">Yay (Mobil)</button>
                            <button onClick={() => { if (confirm('PC (Düz) dizilimine geçilecek?')) resetLayout('desktop') }} className="py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-xs text-white">Düz (PC)</button>
                        </div>
                        <button onClick={() => {
                            if (confirm('Tüm ayarları varsayılana döndürmek istediğine emin misin?')) resetLayout('mobile');
                        }} className="w-full py-2 bg-red-900/20 hover:bg-red-900/40 text-red-300 text-xs rounded border border-red-900/50 transition-colors">
                            FABRİKA AYARLARI
                        </button>
                        <button onClick={saveHudSettings} className="w-full py-3 bg-green-600 text-white font-bold rounded hover:bg-green-500 shadow-lg mt-2 flex items-center justify-center gap-2">
                            <SettingsIcon size={16} /> KAYDET & ÇIK
                        </button>
                    </div>
                </div>
            )}

            {/* DEBUG PANEL - TÜM KOORDİNATLAR - TIKLA YER DEĞİŞTİR */}
            {isHudEditing && (
                <div
                    className={`fixed top-4 ${debugPanelLeft ? 'left-4' : 'right-4'} z-[150] bg-black/95 border-2 border-cyan-500 rounded-xl p-3 w-72 max-h-[60vh] overflow-y-auto shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all duration-300`}
                >
                    <h2
                        className="text-center text-sm font-bold text-cyan-400 mb-2 border-b border-cyan-700 pb-2 cursor-pointer hover:bg-cyan-900/30 rounded"
                        onClick={() => setDebugPanelLeft(!debugPanelLeft)}
                        title="Tıkla - Panel tarafını değiştir"
                    >
                        🔧 DEBUG - KOORDİNATLAR
                        <span className="text-[10px] block text-cyan-600">(tıkla → taraf değiştir)</span>
                    </h2>
                    <div className="space-y-0.5 text-[10px] font-mono">
                        {/* Header */}
                        <div className="flex justify-between text-slate-400 border-b border-slate-700 pb-1 mb-1">
                            <span className="w-20">ELEMENT</span>
                            <span className="w-12 text-center">X</span>
                            <span className="w-12 text-center">Y</span>
                        </div>
                        {/* Elements */}
                        {Object.entries(hudLayout.elements)
                            .filter(([key]) => !key.startsWith('top_'))
                            .map(([key, el]) => (
                                <div
                                    key={key}
                                    className={`flex justify-between py-0.5 px-1 rounded cursor-pointer ${selectedElementId === key ? 'bg-green-900/50 text-green-300' : 'text-slate-300 hover:bg-slate-800'}`}
                                    onClick={() => setSelectedElementId(key)}
                                >
                                    <span className="w-20 truncate font-bold">{key}</span>
                                    <span className="w-12 text-center text-cyan-400">{Math.round(el.x)}</span>
                                    <span className="w-12 text-center text-yellow-400">{Math.round(el.y)}</span>
                                </div>
                            ))}
                    </div>
                </div>
            )}

            {/* INTERACTION BUTTON */}
            {nearbyNPC && !isHudEditing && !interactingNPC && (
                <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-50 animate-bounce">
                    <button
                        onClick={() => {
                            if (NPC_REGISTRY[nearbyNPC.npcType || '']) {
                                setInteractingNPC(NPC_REGISTRY[nearbyNPC.npcType!]);
                            } else {
                                // Fallback or generic NPC dialog
                                alert(nearbyNPC.name + " sana gülümsüyor.");
                            }
                        }}
                        className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-full border-2 border-white/50 shadow-lg shadow-yellow-900/50 hover:scale-110 transition-transform active:scale-95 group"
                    >
                        <MessageSquare className="text-white group-hover:rotate-12 transition-transform" />
                        <span className="font-bold text-white text-lg">Konuş: {nearbyNPC.name}</span>
                        <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-white text-black text-[10px] font-bold rounded-full shadow-sm animate-pulse">E</span>
                    </button>
                </div>
            )}

            {showSettings && !isHudEditing && (
                <div className="fixed inset-0 z-[70] bg-black/70 flex items-center justify-center p-4">
                    <div className="bg-[#1a120b] border-2 border-[#5e4b35] rounded-xl w-full max-w-sm shadow-2xl animate-[fadeIn_0.2s] p-6">
                        <div className="flex justify-between items-center mb-6"><h2 className="text-xl font-bold text-[#e6cba5] flex items-center gap-2"><SettingsIcon /> Oyun Ayarları</h2><button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-white"><X /></button></div>
                        <div className="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                            <button onClick={() => { setShowSettings(false); setIsHudEditing(true); }} className="w-full py-3 bg-yellow-700 hover:bg-yellow-600 text-white font-bold rounded border border-yellow-500 shadow flex items-center justify-center gap-2"><Move size={18} /> ARAYÜZÜ ÖZELLEŞTİR</button>

                            <button onClick={() => { setShowSettings(false); setShowFullSettings(true); }} className="w-full py-3 bg-cyan-700 hover:bg-cyan-600 text-white font-bold rounded border border-cyan-500 shadow flex items-center justify-center gap-2"><SettingsIcon size={18} /> TÜM AYARLAR</button>

                            <div className="flex items-center justify-between p-3 bg-slate-900 rounded border border-slate-700">
                                <div><div className="text-white font-bold text-sm">PvP Aktif Öncelik</div><div className="text-xs text-slate-400">Otomatik hedeflemede oyunculara öncelik ver.</div></div>
                                <button onClick={() => onUpdatePlayer({ settings: { ...playerState.settings, pvpPriority: !playerState.settings.pvpPriority } })} className={`w-12 h-6 rounded-full relative transition-colors ${playerState.settings.pvpPriority ? 'bg-green-600' : 'bg-slate-600'}`}><div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${playerState.settings.pvpPriority ? 'left-7' : 'left-1'}`} /></button>
                            </div>

                            <button onClick={() => { setShowSettings(false); setShowGameGuide(true); }} className="w-full py-3 bg-[#3f2e18] hover:bg-[#5e4b35] text-[#e6cba5] font-bold rounded border border-[#e6cba5] shadow flex items-center justify-center gap-2"><Book size={18} /> OYUN REHBERİ</button>
                        </div>
                    </div>
                </div>
            )}

            {/* FULL SETTINGS VIEW */}
            {showFullSettings && <SettingsView onClose={() => setShowFullSettings(false)} />}

            {/* GAME GUIDE MODAL */}
            {showGameGuide && <GameGuideModal onClose={() => setShowGameGuide(false)} />}

            {/* TARGET UI */}
            {(() => {
                if (!target) return null;
                const liveTarget = entities.find(e => e.id === target.id);
                if (!liveTarget) return null;
                return (
                    <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-slate-900/90 border border-red-500 p-2 rounded-lg w-64 shadow-xl pointer-events-auto flex items-center gap-3 animate-[fadeIn_0.2s]">
                        <div className={`w-10 h-10 rounded flex items-center justify-center border ${liveTarget.type === 'player' ? 'bg-orange-900/50 border-orange-700' : 'bg-red-900/50 border-red-700'}`}>
                            <Crosshair size={24} className={liveTarget.type === 'player' ? 'text-orange-500' : 'text-red-500'} />
                        </div>
                        <div className="flex-1">
                            <div className="text-white font-bold text-xs flex justify-between">
                                <span>{liveTarget.name} (Lvl {liveTarget.level})</span>
                                <span className="text-red-400">{liveTarget.hp} HP</span>
                            </div>
                            <div className="w-full h-2 bg-black rounded-full overflow-hidden mt-1 border border-slate-700">
                                <div className="h-full bg-red-600 transition-all duration-200" style={{ width: `${Math.max(0, (liveTarget.hp / liveTarget.maxHp) * 100)}%` }}></div>
                            </div>
                        </div>
                        <button onClick={() => setTarget(null)} className="text-slate-500 hover:text-white"><X size={16} /></button>
                    </div>
                );
            })()}

            {/* INTERACTION MODALS */}
            {showInventory && <InventoryModal playerState={playerState} isOverlay={true} onClose={() => setShowInventory(false)} onEquip={props.onEquip} onUnequip={props.onUnequip} onUse={props.onUseItem} />}

            {/* SKILLS OVERLAY - GameGuideModal Style */}
            {showSkills && (
                <div className="fixed inset-0 z-[80] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-[fadeIn_0.2s]">
                    <div className="bg-[#1a120b] border-2 border-[#5e4b35] rounded-xl w-full max-w-5xl max-h-[90vh] shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden">

                        {/* Header */}
                        <div className="p-4 border-b border-[#5e4b35] bg-[#2a1d12] flex justify-between items-center shadow-md z-10">
                            <div className="flex items-center gap-4">
                                <h2 className="text-2xl font-bold text-[#e6cba5] flex items-center gap-3">
                                    <Zap className="text-purple-400" /> YETENEKLER
                                </h2>
                                <span className="px-3 py-1 bg-purple-900/40 text-purple-300 rounded-lg text-sm border border-purple-700/50">
                                    {CLASSES[playerState.class || 'warrior']?.name || 'Savaşçı'}
                                </span>
                            </div>
                            <button onClick={() => setShowSkills(false)} className="bg-red-900/50 hover:bg-red-700 text-red-200 p-2 rounded-lg transition-colors border border-red-800">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-6 text-slate-300 custom-scrollbar bg-[#1a120b]/90">
                            <SkillTree playerClass={CLASSES[playerState.class || 'warrior']} playerLevel={playerState.level} />
                        </div>
                    </div>
                </div>
            )}

            {/* QUESTS OVERLAY - GameGuideModal Style */}
            {showQuests && (
                <div className="fixed inset-0 z-[80] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-[fadeIn_0.2s]">
                    <div className="bg-[#1a120b] border-2 border-[#5e4b35] rounded-xl w-full max-w-3xl max-h-[90vh] shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden">

                        {/* Header */}
                        <div className="p-4 border-b border-[#5e4b35] bg-[#2a1d12] flex justify-between items-center shadow-md z-10">
                            <div className="flex items-center gap-4">
                                <h2 className="text-2xl font-bold text-[#e6cba5] flex items-center gap-3">
                                    <Scroll className="text-yellow-500" /> GÖREVLER
                                </h2>
                                {playerState.activeQuest && (
                                    <span className="px-3 py-1 bg-yellow-900/40 text-yellow-300 rounded-lg text-sm border border-yellow-700/50">
                                        Aktif Görev
                                    </span>
                                )}
                            </div>
                            <button onClick={() => setShowQuests(false)} className="bg-red-900/50 hover:bg-red-700 text-red-200 p-2 rounded-lg transition-colors border border-red-800">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-6 text-slate-300 custom-scrollbar bg-[#1a120b]/90">
                            {playerState.activeQuest ? (
                                <div className="space-y-4">
                                    {/* Active Quest Card */}
                                    <div className="bg-gradient-to-br from-[#291d18] to-[#1a120b] p-6 rounded-xl border-2 border-yellow-700/50 shadow-lg">
                                        <div className="flex items-start gap-4">
                                            <div className="w-16 h-16 rounded-lg bg-yellow-900/40 border border-yellow-600 flex items-center justify-center shrink-0">
                                                <Scroll size={32} className="text-yellow-400" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-xl font-bold text-amber-400 mb-2">{playerState.activeQuest.title}</h3>
                                                <p className="text-slate-400 text-sm mb-4">{playerState.activeQuest.description}</p>

                                                {/* Progress Bar */}
                                                <div className="mb-2">
                                                    <div className="flex justify-between text-xs mb-1">
                                                        <span className="text-slate-500">İlerleme</span>
                                                        <span className="text-yellow-400 font-bold">{playerState.activeQuest.currentCount} / {playerState.activeQuest.requiredCount}</span>
                                                    </div>
                                                    <div className="w-full h-3 bg-black/60 rounded-full overflow-hidden border border-slate-700">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-yellow-600 to-amber-500 transition-all duration-500"
                                                            style={{ width: `${Math.min(100, (playerState.activeQuest.currentCount / playerState.activeQuest.requiredCount) * 100)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quest Tips */}
                                    <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                                        <h4 className="text-sm font-bold text-slate-400 mb-2">💡 İpucu</h4>
                                        <p className="text-xs text-slate-500">Görevleri tamamlayarak XP, Altın ve özel ödüller kazanabilirsin!</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="w-20 h-20 rounded-full bg-slate-800/50 border border-slate-700 flex items-center justify-center mx-auto mb-4">
                                        <Scroll size={40} className="text-slate-600" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-400 mb-2">Aktif Görev Yok</h3>
                                    <p className="text-sm text-slate-500">Köydeki NPC'lerden görev alabilirsin.</p>
                                    <p className="text-xs text-slate-600 mt-4">Ana merkezde (X-1) bulunan NPC'ler ile konuşmayı dene!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* MARKET OVERLAY - GameGuideModal Style with 3 Tabs */}
            {showMarketOverlay && (
                <div className="fixed inset-0 z-[80] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-[fadeIn_0.2s]">
                    <div className="bg-[#1a120b] border-2 border-[#5e4b35] rounded-xl w-full max-w-6xl h-[90vh] shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden">

                        {/* Header */}
                        <div className="p-4 border-b border-[#5e4b35] bg-[#2a1d12] flex justify-between items-center shadow-md z-10 shrink-0">
                            <div className="flex items-center gap-4">
                                <h2 className="text-2xl font-bold text-[#e6cba5] flex items-center gap-3">
                                    <ShoppingBag className="text-emerald-400" /> PAZAR
                                </h2>
                                <span className="px-3 py-1 bg-emerald-900/40 text-emerald-300 rounded-lg text-sm border border-emerald-700/50 flex items-center gap-2">
                                    <Coins size={14} /> {playerState.credits?.toLocaleString() || 0} Altın
                                </span>
                                <span className="px-3 py-1 bg-purple-900/40 text-purple-300 rounded-lg text-sm border border-purple-700/50 flex items-center gap-2">
                                    <Gem size={14} /> {playerState.diamonds?.toLocaleString() || 0} Elmas
                                </span>
                            </div>
                            <button onClick={() => setShowMarketOverlay(false)} className="bg-red-900/50 hover:bg-red-700 text-red-200 p-2 rounded-lg transition-colors border border-red-800">
                                <X size={24} />
                            </button>
                        </div>

                        {/* TAB NAVIGATION */}
                        <div className="flex bg-[#0f0a06] border-b border-[#3f2e18] shrink-0">
                            <button
                                onClick={() => setMarketTab('koy_pazari')}
                                className={`flex-1 py-3 text-sm font-bold transition-all flex items-center justify-center gap-2 ${marketTab === 'koy_pazari' ? 'bg-[#3f2e18] text-amber-400 border-b-2 border-amber-500' : 'text-slate-400 hover:bg-[#2a1f15] hover:text-slate-200'}`}
                            >
                                <ShoppingBag size={18} /> Köy Pazarı
                            </button>
                            <button
                                onClick={() => setMarketTab('oyuncu_pazari')}
                                className={`flex-1 py-3 text-sm font-bold transition-all flex items-center justify-center gap-2 ${marketTab === 'oyuncu_pazari' ? 'bg-[#3f2e18] text-blue-400 border-b-2 border-blue-500' : 'text-slate-400 hover:bg-[#2a1f15] hover:text-slate-200'}`}
                            >
                                <Users size={18} /> Oyuncu Pazarı
                            </button>
                            <button
                                onClick={() => setMarketTab('magaza')}
                                className={`flex-1 py-3 text-sm font-bold transition-all flex items-center justify-center gap-2 ${marketTab === 'magaza' ? 'bg-[#3f2e18] text-purple-400 border-b-2 border-purple-500' : 'text-slate-400 hover:bg-[#2a1f15] hover:text-slate-200'}`}
                            >
                                <Crown size={18} /> Mağaza
                            </button>
                        </div>

                        {/* TAB CONTENT */}
                        <div className="flex-1 overflow-hidden">
                            {/* KÖY PAZARI - NpcShopView */}
                            {marketTab === 'koy_pazari' && (
                                <NpcShopView
                                    playerState={playerState}
                                    onClose={() => setShowMarketOverlay(false)}
                                    onBuy={(item, cost) => {
                                        if (playerState.credits >= cost) {
                                            onUpdatePlayer({
                                                credits: playerState.credits - cost,
                                                inventory: [...playerState.inventory, item]
                                            });
                                            addFloatingText(`-${cost} G`, playerPosRef.current.x, 3, playerPosRef.current.y, "text-red-400");
                                            soundManager.playSFX('buy');
                                        } else {
                                            addFloatingText("Yetersiz Altın!", playerPosRef.current.x, 3, playerPosRef.current.y, "text-red-500");
                                            soundManager.playSFX('error');
                                        }
                                    }}
                                    onBuyPet={(pet, cost) => {
                                        if (playerState.credits >= cost) {
                                            const newPets = playerState.ownedPets ? [...playerState.ownedPets, pet] : [pet];
                                            onUpdatePlayer({ credits: playerState.credits - cost, ownedPets: newPets });
                                            addFloatingText(`Yoldaş Alındı: ${pet.name}`, playerPosRef.current.x, 3, playerPosRef.current.y, "text-green-400");
                                            soundManager.playSFX('level_up');
                                        }
                                    }}
                                    onBuyWing={(wing, cost) => {
                                        if (playerState.credits >= cost) {
                                            const newWings = playerState.ownedWings ? [...playerState.ownedWings, wing] : [wing];
                                            onUpdatePlayer({ credits: playerState.credits - cost, ownedWings: newWings });
                                            addFloatingText(`Kanat Alındı: ${wing.name}`, playerPosRef.current.x, 3, playerPosRef.current.y, "text-purple-400");
                                            soundManager.playSFX('level_up');
                                        }
                                    }}
                                />
                            )}

                            {/* OYUNCU PAZARI - MarketView (P2P Trading) */}
                            {marketTab === 'oyuncu_pazari' && (
                                <MarketView
                                    playerState={playerState}
                                    onClose={() => setShowMarketOverlay(false)}
                                    onUpdatePlayer={onUpdatePlayer}
                                    isEmbedded={true}
                                />
                            )}

                            {/* MAĞAZA - PremiumMarketView */}
                            {marketTab === 'magaza' && (
                                <PremiumMarketView
                                    playerState={playerState}
                                    onBuyData={(category, id, cost, currency, amount) => {
                                        // Handle premium purchases
                                        if (currency === 'gems') {
                                            if (playerState.gems >= cost) {
                                                // Deduct gems and add item/costume
                                                const newGems = playerState.gems - cost;
                                                const updates: Partial<PlayerState> = { gems: newGems };

                                                // If it's a costume set OR Starter Pack
                                                if (category === 'item') {
                                                    if (id === 'starter_pack') {
                                                        // --- STARTER PACK LOGIC ---
                                                        const newInventory = [...(playerState.inventory || [])];

                                                        // 1. Give T2 Weapon (+5 Grade?) - Let's just give standard T2 for now
                                                        // Need to safely access ALL_CLASS_ITEMS
                                                        const classItems = ((ALL_CLASS_ITEMS as any)[playerState.class] || []) as Item[];
                                                        const t2Weapon = classItems.find(i => i.tier === 2 && i.type === 'weapon');

                                                        if (t2Weapon) {
                                                            newInventory.push({ ...t2Weapon, id: uuidv4(), name: `+5 ${t2Weapon.name}`, stats: { ...t2Weapon.stats, damage: (t2Weapon.stats?.damage || 10) + 5 } }); // Custom +5 effect simulation
                                                        } else {
                                                            // Fallback if no T2 found
                                                            addFloatingText("Silah Hediyesi Hata!", playerPosRef.current.x, 3, playerPosRef.current.y, "text-red-500");
                                                        }

                                                        // 2. Give Potions (50x HP, 50x MP) - Assuming stackable logic handles 'quantity' or we add separate if needed.
                                                        // Simplification: Add single item with quantity 50.
                                                        newInventory.push({
                                                            id: uuidv4(), name: 'Can İksiri', type: 'consumable', tier: 1, rarity: 'common',
                                                            value: 50, effect: { type: 'heal', amount: 50 }, quantity: 50, stackable: true
                                                        });

                                                        newInventory.push({
                                                            id: uuidv4(), name: 'Mana İksiri', type: 'consumable', tier: 1, rarity: 'common',
                                                            value: 50, effect: { type: 'mana', amount: 50 }, quantity: 50, stackable: true
                                                        });

                                                        updates.inventory = newInventory;
                                                        addFloatingText("Acemi Paketi Alındı! 🎁", playerPosRef.current.x, 3.5, playerPosRef.current.y, "text-yellow-300 font-bold text-lg");

                                                    } else {
                                                        // --- STANDARD COSTUME BUNDLE ---
                                                        const currentCostumes = playerState.ownedCostumes || [];
                                                        if (!currentCostumes.includes(id)) {
                                                            updates.ownedCostumes = [...currentCostumes, id];
                                                        }
                                                    }
                                                }

                                                onUpdatePlayer(updates);
                                                addFloatingText(`-${cost} 💎`, playerPosRef.current.x, 3, playerPosRef.current.y, "text-cyan-400");
                                                soundManager.playSFX('level_up');
                                            } else {
                                                addFloatingText("Yetersiz Elmas!", playerPosRef.current.x, 3, playerPosRef.current.y, "text-red-500");
                                                soundManager.playSFX('error');
                                            }
                                        } else if (currency === 'gold') {
                                            if (playerState.credits >= cost) {
                                                onUpdatePlayer({ credits: playerState.credits - cost });
                                                addFloatingText(`-${cost} G`, playerPosRef.current.x, 3, playerPosRef.current.y, "text-yellow-400");
                                                soundManager.playSFX('buy');
                                            }
                                        }
                                    }}
                                    onEquipCostume={(costumeId) => {
                                        onUpdatePlayer({ equippedCostume: costumeId });
                                        if (costumeId) {
                                            addFloatingText("Kostüm Kuşanıldı!", playerPosRef.current.x, 3, playerPosRef.current.y, "text-emerald-400");
                                        } else {
                                            addFloatingText("Kostüm Çıkarıldı", playerPosRef.current.x, 3, playerPosRef.current.y, "text-slate-400");
                                        }
                                        soundManager.playSFX('equip');
                                    }}
                                    onClose={() => setShowMarketOverlay(false)}
                                    isEmbedded={true}
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}

            {showAchievements && (
                <AchievementsModal
                    playerAchievements={playerState.achievements || []}
                    onClose={() => setShowAchievements(false)}
                />
            )}
            {showDailyReward && (
                <DailyLoginModal
                    dailyLogin={playerState.dailyLogin || { lastLoginDate: '', consecutiveDays: 0, claimedToday: false, totalLogins: 0 }}
                    onClose={() => setShowDailyReward(false)}
                    onClaim={handleClaimDaily}
                />
            )}
            {showMap && <LocalZoneMap zoneId={zoneId} playerPos={playerPosUI} entities={entities} onClose={() => setShowMap(false)} onZoneSwitch={(id) => { props.onSwitchZone(id); setShowMap(false); }} transparent={playerState.settings.transparentMap} />}
            {/* RETURN TO GAME BUTTON */}
            {(showSettings || showGlobalMap || isHudEditing) && (
                <button
                    onClick={() => { setShowSettings(false); setShowGlobalMap(false); setIsHudEditing(false); }}
                    className="absolute top-4 right-4 z-[60] bg-red-600 hover:bg-red-500 text-white rounded-full p-2 shadow-lg border-2 border-red-400"
                >
                    <X size={24} />
                </button>
            )}

            {showGlobalMap && <GlobalMapModal onClose={() => setShowGlobalMap(false)} currentZone={zoneId} onSwitchZone={props.onSwitchZone} />}
            {/* {showGameGuide && <GameGuideModal onClose={() => setShowGameGuide(false)} />} */}

            {/* DUEL CONFIRMATION MODAL */}
            {duelChallenge && (
                <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border-2 border-red-600 rounded-xl p-6 w-96 shadow-[0_0_20px_rgba(220,38,38,0.5)] animate-bounce-in">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-red-500 mb-2">⚔️ DÜELLO İSTEĞİ! ⚔️</h2>
                            <p className="text-white text-lg">
                                <span className="text-yellow-400 font-bold">{duelChallenge.challengerName}</span> (Lvl {duelChallenge.challengerLevel})
                                <br />seninle dövüşmek istiyor!
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={() => {
                                    if (socketRef.current) socketRef.current.emit('duel_response', { challengerId: duelChallenge.challengerId, accepted: true });
                                    setDuelChallenge(null);
                                }}
                                className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded border border-green-400 shadow-lg"
                            >
                                KABUL ET
                            </button>
                            <button
                                onClick={() => {
                                    if (socketRef.current) socketRef.current.emit('duel_response', { challengerId: duelChallenge.challengerId, accepted: false });
                                    setDuelChallenge(null);
                                }}
                                className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 font-bold py-3 rounded border border-gray-500"
                            >
                                REDDET
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* NPC Interaction Modal */}
            {interactingNPC && (
                <NPCInteractionModal
                    npc={interactingNPC}
                    playerState={playerState}
                    onClose={() => setInteractingNPC(null)}
                    onOpenBlacksmith={() => props.onOpenCrafting()}
                    onOpenShop={() => setBlacksmithState({ isOpen: true, tab: 'market' })}
                    onAcceptQuest={(quest) => {
                        props.onUpdatePlayer({ activeQuest: quest });
                        setInteractingNPC(null);
                    }}
                    onOpenGuild={() => {
                        // Could navigate to guild tab
                        setInteractingNPC(null);
                    }}
                    onOpenArena={() => {
                        // Spawn Arena Opponent
                        const opponentClass = Math.random() > 0.5 ? 'warrior' : 'archer';
                        const arenaBot: GameEntity = {
                            id: uuidv4(),
                            type: 'player',
                            name: `[Gladyatör] ${opponentClass === 'warrior' ? 'Spartacus' : 'Legolas'}`,
                            x: playerPosRef.current.x * 15 + (Math.random() > 0.5 ? 5 : -5) * 15,
                            y: playerPosRef.current.y * 15 + (Math.random() > 0.5 ? 5 : -5) * 15,
                            hp: 5000 * playerState.level,
                            maxHp: 5000 * playerState.level,
                            level: playerState.level,
                            isHostile: true,
                            color: '#ef4444',
                            npcType: undefined
                        };

                        setEntities(prev => [...prev, arenaBot]);
                        addFloatingText("DÜELLO BAŞLADI!", playerPosRef.current.x, 5, playerPosRef.current.y, "text-red-500 font-bold text-2xl");
                        soundManager.playSFX('horn');

                        setInteractingNPC(null);
                    }}
                    onOpenCraftmaster={() => {
                        setBlacksmithState({ isOpen: true, tab: 'craft' });
                        setInteractingNPC(null);
                    }}
                />
            )}

            {/* T4/T5 Legendary Crafting Modal */}
            {/* BLACKSMITH & MARKET SYSTEM */}
            <BlacksmithView
                isOpen={blacksmithState.isOpen}
                onClose={() => setBlacksmithState(prev => ({ ...prev, isOpen: false }))}
                playerState={playerState}
                onUpdatePlayer={onUpdatePlayer}
            />

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* NOWA STYLE BOTTOM NAVIGATION BAR - FULL MENU */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* 
                ⚠️ CRITICAL - DO NOT MODIFY THIS SECTION ⚠️
                
                Bu alt navigasyon bar'ı TAM 11 BUTON içermeli ve ASLA değiştirilmemeli!
                Butonlar sırasıyla: Karakter, Envanter, Yetenek, Görev, Parti, Lonca, Pazar, Demirci, Harita, Sıralama, Çıkış
                
                ÜST MENÜ BUTONLARI KALDIRILDI - Alt bar'a taşındı!
                Üstte Chat, Inventory, Settings, Achievements, X butonları OLMAMALI!
                
                KURALLAR:
                1. hidden class KULLANMA - Tüm butonlar görünür olmalı
                2. overflow-x-auto ile yatay kaydırma sağlanmalı
                3. Buton sırası DEĞİŞTİRİLMEMELİ
                4. Yeni buton EKLENMEMELİ (max 11)
                5. Buton SİLİNMEMELİ
                
                Son güncelleme: 2026-01-04 by Claude
            */}
            {/* NAV WRAPPER - Centered on screen */}
            <nav className="fixed bottom-0 left-0 right-0 z-[60] pointer-events-auto flex justify-center">
                {/* Background with glass effect - FULL WIDTH, NO SCROLL */}
                <div className="
                    bg-gradient-to-t from-black/95 via-slate-900/90 to-transparent 
                    border-t border-yellow-900/30 shadow-[0_-5px_30px_rgba(0,0,0,0.6)]
                    h-14 md:h-16
                    flex items-end justify-center 
                    pb-1 md:pb-2 px-1 md:px-2
                    w-full
                ">

                    {/* All Navigation Buttons - NO SCROLL, SHRINK TO FIT */}
                    <div className="flex flex-nowrap items-center justify-center gap-0.5 md:gap-1">
                        {/* 1. Karakter */}
                        <button
                            onClick={() => setShowPlayerStats(true)}
                            className="flex flex-col items-center gap-0.5 px-1.5 py-1 md:px-2.5 md:py-1.5 rounded-lg bg-slate-800/60 border border-slate-600/50 hover:bg-slate-700/80 hover:border-blue-500/50 transition-all group min-w-[38px] md:min-w-[60px] shrink-0"
                            title="Karakter İstatistikleri"
                        >
                            <Users size={16} className="text-blue-400 group-hover:text-blue-300 transition-colors md:w-[18px] md:h-[18px]" />
                            <span className="text-[7px] md:text-[9px] text-slate-400 group-hover:text-white font-bold uppercase">Karakter</span>
                        </button>

                        {/* 2. Envanter */}
                        <button
                            onClick={() => setShowInventory(true)}
                            className="flex flex-col items-center gap-0.5 px-1.5 py-1 md:px-2.5 md:py-1.5 rounded-lg bg-amber-900/40 border border-amber-600/50 hover:bg-amber-800/60 hover:border-amber-400 transition-all group min-w-[38px] md:min-w-[60px] shrink-0"
                            title="Envanter ve Eşyalar"
                        >
                            <Backpack size={16} className="text-amber-400 group-hover:text-amber-300 transition-colors md:w-[18px] md:h-[18px]" />
                            <span className="text-[7px] md:text-[9px] text-amber-300 group-hover:text-white font-bold uppercase">Envanter</span>
                        </button>

                        {/* 3. Yetenek */}
                        <button
                            onClick={() => setShowSkills(true)}
                            className="flex flex-col items-center gap-0.5 px-1.5 py-1 md:px-2.5 md:py-1.5 rounded-lg bg-slate-800/60 border border-slate-600/50 hover:bg-slate-700/80 hover:border-purple-500/50 transition-all group min-w-[38px] md:min-w-[60px] shrink-0"
                            title="Yetenek Ağacı"
                        >
                            <Zap size={16} className="text-purple-400 group-hover:text-purple-300 transition-colors md:w-[18px] md:h-[18px]" />
                            <span className="text-[7px] md:text-[9px] text-slate-400 group-hover:text-white font-bold uppercase">Yetenek</span>
                        </button>

                        {/* 4. Görev */}
                        <button
                            onClick={() => setShowQuests(true)}
                            className="flex flex-col items-center gap-0.5 px-1.5 py-1 md:px-2.5 md:py-1.5 rounded-lg bg-slate-800/60 border border-slate-600/50 hover:bg-slate-700/80 hover:border-yellow-500/50 transition-all group min-w-[38px] md:min-w-[60px] shrink-0"
                            title="Aktif Görevler"
                        >
                            <Scroll size={16} className="text-yellow-400 group-hover:text-yellow-300 transition-colors md:w-[18px] md:h-[18px]" />
                            <span className="text-[7px] md:text-[9px] text-slate-400 group-hover:text-white font-bold uppercase">Görev</span>
                        </button>

                        {/* 5. Parti */}
                        <button
                            onClick={() => setShowParty(true)}
                            className="flex flex-col items-center gap-0.5 px-1.5 py-1 md:px-2.5 md:py-1.5 rounded-lg bg-slate-800/60 border border-slate-600/50 hover:bg-slate-700/80 hover:border-cyan-500/50 transition-all group min-w-[38px] md:min-w-[60px] shrink-0"
                            title="Parti Sistemi"
                        >
                            <Users size={16} className="text-cyan-400 group-hover:text-cyan-300 transition-colors md:w-[18px] md:h-[18px]" />
                            <span className="text-[7px] md:text-[9px] text-slate-400 group-hover:text-white font-bold uppercase">Parti</span>
                        </button>

                        {/* 6. Lonca */}
                        <button
                            onClick={() => setShowGuild(true)}
                            className="flex flex-col items-center gap-0.5 px-1.5 py-1 md:px-2.5 md:py-1.5 rounded-lg bg-slate-800/60 border border-slate-600/50 hover:bg-slate-700/80 hover:border-violet-500/50 transition-all group min-w-[38px] md:min-w-[60px] shrink-0"
                            title="Lonca Sistemi"
                        >
                            <Shield size={16} className="text-violet-400 group-hover:text-violet-300 transition-colors md:w-[18px] md:h-[18px]" />
                            <span className="text-[7px] md:text-[9px] text-slate-400 group-hover:text-white font-bold uppercase">Lonca</span>
                        </button>

                        {/* 7. Pazar */}
                        <button
                            onClick={() => setShowMarketOverlay(true)}
                            className="flex flex-col items-center gap-0.5 px-1.5 py-1 md:px-2.5 md:py-1.5 rounded-lg bg-slate-800/60 border border-slate-600/50 hover:bg-slate-700/80 hover:border-emerald-500/50 transition-all group min-w-[38px] md:min-w-[60px] shrink-0"
                            title="Pazar - Satış ve Alış"
                        >
                            <ShoppingBag size={16} className="text-emerald-400 group-hover:text-emerald-300 transition-colors md:w-[18px] md:h-[18px]" />
                            <span className="text-[7px] md:text-[9px] text-slate-400 group-hover:text-white font-bold uppercase">Pazar</span>
                        </button>

                        {/* 8. Demirci */}
                        <button
                            onClick={() => setBlacksmithState({ isOpen: true, tab: 'craft' })}
                            className="flex flex-col items-center gap-0.5 px-1.5 py-1 md:px-2.5 md:py-1.5 rounded-lg bg-slate-800/60 border border-slate-600/50 hover:bg-slate-700/80 hover:border-orange-500/50 transition-all group min-w-[38px] md:min-w-[60px] shrink-0"
                            title="Demirci - Geliştirme ve Üretim"
                        >
                            <Hammer size={16} className="text-orange-400 group-hover:text-orange-300 transition-colors md:w-[18px] md:h-[18px]" />
                            <span className="text-[7px] md:text-[9px] text-slate-400 group-hover:text-white font-bold uppercase">Demirci</span>
                        </button>

                        {/* 9. Harita */}
                        <button
                            onClick={() => setShowGlobalMap(true)}
                            className="flex flex-col items-center gap-0.5 px-1.5 py-1 md:px-2.5 md:py-1.5 rounded-lg bg-slate-800/60 border border-slate-600/50 hover:bg-slate-700/80 hover:border-green-500/50 transition-all group min-w-[38px] md:min-w-[60px] shrink-0"
                            title="Dünya Haritası"
                        >
                            <Compass size={16} className="text-green-400 group-hover:text-green-300 transition-colors md:w-[18px] md:h-[18px]" />
                            <span className="text-[7px] md:text-[9px] text-slate-400 group-hover:text-white font-bold uppercase">Harita</span>
                        </button>

                        {/* 10. Sıralama */}
                        <button
                            onClick={() => setShowLeaderboard(true)}
                            className="flex flex-col items-center gap-0.5 px-1.5 py-1 md:px-2.5 md:py-1.5 rounded-lg bg-slate-800/60 border border-slate-600/50 hover:bg-slate-700/80 hover:border-yellow-500/50 transition-all group min-w-[38px] md:min-w-[60px] shrink-0"
                            title="Sıralama Tablosu"
                        >
                            <Trophy size={16} className="text-yellow-500 group-hover:text-yellow-400 transition-colors md:w-[18px] md:h-[18px]" />
                            <span className="text-[7px] md:text-[9px] text-slate-400 group-hover:text-white font-bold uppercase">Sıralama</span>
                        </button>

                        {/* 11. Ayarlar */}
                        <button
                            onClick={() => setShowSettings(true)}
                            className="flex flex-col items-center gap-0.5 px-1.5 py-1 md:px-2.5 md:py-1.5 rounded-lg bg-slate-800/60 border border-slate-600/50 hover:bg-slate-700/80 hover:border-slate-400/50 transition-all group min-w-[38px] md:min-w-[60px] shrink-0"
                            title="Oyun Ayarları"
                        >
                            <Settings2 size={16} className="text-slate-400 group-hover:text-slate-300 transition-colors md:w-[18px] md:h-[18px]" />
                            <span className="text-[7px] md:text-[9px] text-slate-400 group-hover:text-white font-bold uppercase">Ayarlar</span>
                        </button>

                        {/* 12. Çıkış */}
                        <button
                            onClick={() => setExitCountdown(10)}
                            className="flex flex-col items-center gap-0.5 px-1.5 py-1 md:px-2.5 md:py-1.5 rounded-lg bg-red-900/30 border border-red-700/50 hover:bg-red-800/60 hover:border-red-400 transition-all group min-w-[38px] md:min-w-[60px] shrink-0"
                            title="Oyundan Çık"
                        >
                            <X size={16} className="text-red-400 group-hover:text-red-300 transition-colors md:w-[18px] md:h-[18px]" />
                            <span className="text-[7px] md:text-[9px] text-red-400 group-hover:text-white font-bold uppercase">Çıkış</span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* EXIT COUNTDOWN OVERLAY */}
            {exitCountdown !== null && (
                <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center animate-[fadeIn_0.2s]">
                    <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-red-700 rounded-2xl p-8 w-80 shadow-[0_0_50px_rgba(220,38,38,0.4)] animate-[bounceIn_0.3s] text-center">
                        {/* Timer Circle */}
                        <div className="relative w-32 h-32 mx-auto mb-6">
                            {/* Background Circle */}
                            <svg className="w-full h-full -rotate-90">
                                <circle
                                    cx="64"
                                    cy="64"
                                    r="56"
                                    fill="none"
                                    stroke="#1e293b"
                                    strokeWidth="8"
                                />
                                <circle
                                    cx="64"
                                    cy="64"
                                    r="56"
                                    fill="none"
                                    stroke="#ef4444"
                                    strokeWidth="8"
                                    strokeLinecap="round"
                                    strokeDasharray={`${(exitCountdown / 10) * 352} 352`}
                                    className="transition-all duration-1000"
                                />
                            </svg>
                            {/* Number in center */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-5xl font-black text-red-500 animate-pulse">{exitCountdown}</span>
                            </div>
                        </div>

                        <h2 className="text-xl font-bold text-white mb-2">Oyundan Çıkılıyor...</h2>
                        <p className="text-slate-400 text-sm mb-6">
                            {exitCountdown} saniye içinde çıkış yapılacak
                        </p>

                        {/* Cancel Button */}
                        <button
                            onClick={() => setExitCountdown(null)}
                            className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl border border-slate-500 transition-all hover:scale-105"
                        >
                            İPTAL ET
                        </button>
                    </div>
                </div>
            )}

            {/* PARTY VIEW MODAL */}
            {showParty && (
                <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="w-full max-w-2xl">
                        <PartyView
                            playerState={playerState}
                            party={null}
                            onCreateParty={(name, isPublic) => console.log('Create party:', name, isPublic)}
                            onLeaveParty={() => console.log('Leave party')}
                            onKickMember={(id) => console.log('Kick:', id)}
                            onInvitePlayer={(name) => console.log('Invite:', name)}
                            onChangeLootRule={(rule) => console.log('Loot rule:', rule)}
                            onClose={() => setShowParty(false)}
                        />
                    </div>
                </div>
            )}

            {/* GUILD VIEW MODAL */}
            {showGuild && (
                <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="w-full max-w-4xl max-h-[90vh] overflow-auto">
                        <GuildView
                            playerState={playerState}
                            guild={null}
                            onCreateGuild={(name, tag) => console.log('Create guild:', name, tag)}
                            onLeaveGuild={() => console.log('Leave guild')}
                            onKickMember={(id) => console.log('Kick member:', id)}
                            onPromoteMember={(id) => console.log('Promote:', id)}
                            onDemoteMember={(id) => console.log('Demote:', id)}
                            onDonate={(amount) => console.log('Donate:', amount)}
                            onJoinGuild={(id) => console.log('Join guild:', id)}
                            onClose={() => setShowGuild(false)}
                        />
                    </div>
                </div>
            )}

            {/* LEADERBOARD VIEW MODAL */}
            {showLeaderboard && (
                <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
                    <div className="relative w-full max-w-4xl max-h-[90vh] overflow-auto bg-slate-900 rounded-2xl border border-slate-700">
                        <button
                            onClick={() => setShowLeaderboard(false)}
                            className="absolute top-4 right-4 z-10 p-2 bg-red-900/50 hover:bg-red-800 rounded-full text-white"
                        >
                            <X size={20} />
                        </button>
                        <LeaderboardView
                            onJoinGuild={(id) => console.log('Join guild from leaderboard:', id)}
                            onClose={() => setShowLeaderboard(false)}
                        />
                    </div>
                </div>
            )}

            {/* CHARACTER STATS OVERLAY - Like reference image */}
            {showPlayerStats && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none">
                    {/* Semi-transparent backdrop - game visible behind */}
                    <div
                        className="absolute inset-0 bg-black/60 pointer-events-auto"
                        onClick={() => setShowPlayerStats(false)}
                    />

                    {/* Main Modal Container */}
                    <div className="relative w-full max-w-4xl bg-[#0a0d14]/95 backdrop-blur-sm border border-slate-700/50 rounded-xl shadow-2xl pointer-events-auto overflow-hidden">
                        {/* Close Button */}
                        <button
                            onClick={() => setShowPlayerStats(false)}
                            className="absolute top-3 right-3 z-20 p-2 bg-red-900/50 hover:bg-red-700 rounded-full text-white transition-colors"
                        >
                            <X size={18} />
                        </button>

                        <div className="flex flex-col md:flex-row">
                            {/* LEFT SIDE - Character Preview */}
                            <div className="w-full md:w-[320px] bg-gradient-to-b from-[#1a1520] to-[#0a0d14] p-4 border-b md:border-b-0 md:border-r border-slate-700/30">
                                {/* Player Name & Title */}
                                <div className="text-center mb-2">
                                    <h2 className="text-lg font-bold text-white">{playerState.nickname}</h2>
                                    <p className="text-xs text-purple-400">Kadim General</p>
                                </div>

                                {/* 3D Character Preview */}
                                <div className="h-[200px] relative bg-gradient-to-b from-[#1a1520] to-transparent rounded-lg mb-3">
                                    <Suspense fallback={<div className="text-white/20 flex items-center justify-center h-full">...</div>}>
                                        <Canvas shadows dpr={[1, 1.5]} gl={{ preserveDrawingBuffer: true }}>
                                            <PerspectiveCamera makeDefault position={[0, 1.2, 4]} fov={40} />
                                            <ambientLight intensity={0.5} />
                                            <pointLight position={[5, 5, 5]} intensity={1} />
                                            <VoxelSpartan
                                                position={[0, -1, 0]}
                                                rotation={[0, 0.3, 0]}
                                                charClass={playerState.class || 'warrior'}
                                                weaponItem={playerState.equipment.weapon}
                                                armorItem={playerState.equipment.armor}
                                                helmetItem={playerState.equipment.helmet}
                                                pantsItem={playerState.equipment.pants}
                                                wingType={playerState.equippedWing}
                                                petType={playerState.equippedPet}
                                                skinId={playerState.equippedSkin}
                                            />
                                        </Canvas>
                                    </Suspense>
                                    {/* Level Badge */}
                                    <div className="absolute bottom-2 left-2 flex items-center gap-2 bg-black/60 px-2 py-1 rounded">
                                        <span className="text-yellow-400 text-xs">Lv</span>
                                        <span className="text-white font-bold">{playerState.level}</span>
                                    </div>
                                </div>

                                {/* HP Bar */}
                                <div className="mb-2">
                                    <div className="flex items-center gap-2 text-xs mb-1">
                                        <Heart size={12} className="text-red-500" />
                                        <span className="text-slate-400">HP</span>
                                        <span className="ml-auto text-white">{playerState.hp?.toLocaleString()}/{playerState.maxHp?.toLocaleString()}</span>
                                    </div>
                                    <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-red-700 to-red-500 rounded-full"
                                            style={{ width: `${(playerState.hp / playerState.maxHp) * 100}%` }}
                                        />
                                    </div>
                                </div>

                                {/* MP Bar */}
                                <div>
                                    <div className="flex items-center gap-2 text-xs mb-1">
                                        <Zap size={12} className="text-blue-500" />
                                        <span className="text-slate-400">MP</span>
                                        <span className="ml-auto text-white">{playerState.mana?.toLocaleString()}/{playerState.maxMana?.toLocaleString()}</span>
                                    </div>
                                    <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-700 to-blue-500 rounded-full"
                                            style={{ width: `${(playerState.mana / playerState.maxMana) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT SIDE - Stats */}
                            <div className="flex-1 p-4 overflow-y-auto max-h-[70vh]">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold text-yellow-400 flex items-center gap-2">
                                        <Settings size={18} />
                                        KARAKTER STATLARI
                                    </h3>
                                    <div className="bg-green-900/30 border border-green-600/50 px-3 py-1 rounded-full">
                                        <span className="text-green-400 text-sm font-bold">{(playerState.statPoints || 0)} Puan</span>
                                    </div>
                                </div>

                                {/* Stat Allocation */}
                                <div className="space-y-2 mb-6">
                                    {/* STR */}
                                    <div className="flex items-center bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
                                        <div className="w-8 h-8 bg-red-900/50 rounded flex items-center justify-center mr-3">
                                            <Sword size={16} className="text-red-400" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-red-400 font-bold text-sm">Güç (STR)</div>
                                            <div className="text-[10px] text-slate-500">+1 Fiziksel Hasar</div>
                                        </div>
                                        <span className="text-white font-bold text-lg mr-3">{playerState.strength || 100}</span>
                                        <button className="w-7 h-7 bg-green-600 hover:bg-green-500 rounded flex items-center justify-center text-white font-bold disabled:opacity-30 disabled:cursor-not-allowed" disabled={!playerState.statPoints}>
                                            <Plus size={14} />
                                        </button>
                                    </div>

                                    {/* DEX */}
                                    <div className="flex items-center bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
                                        <div className="w-8 h-8 bg-yellow-900/50 rounded flex items-center justify-center mr-3">
                                            <Zap size={16} className="text-yellow-400" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-yellow-400 font-bold text-sm">Çeviklik (DEX)</div>
                                            <div className="text-[10px] text-slate-500">+1% Kritik, +0.5% Hız</div>
                                        </div>
                                        <span className="text-white font-bold text-lg mr-3">{playerState.dexterity || 100}</span>
                                        <button className="w-7 h-7 bg-green-600 hover:bg-green-500 rounded flex items-center justify-center text-white font-bold disabled:opacity-30 disabled:cursor-not-allowed" disabled={!playerState.statPoints}>
                                            <Plus size={14} />
                                        </button>
                                    </div>

                                    {/* INT */}
                                    <div className="flex items-center bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
                                        <div className="w-8 h-8 bg-blue-900/50 rounded flex items-center justify-center mr-3">
                                            <Star size={16} className="text-blue-400" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-blue-400 font-bold text-sm">Zeka (INT)</div>
                                            <div className="text-[10px] text-slate-500">+5 Mana, +1 Büyü Hasarı</div>
                                        </div>
                                        <span className="text-white font-bold text-lg mr-3">{playerState.intelligence || 100}</span>
                                        <button className="w-7 h-7 bg-green-600 hover:bg-green-500 rounded flex items-center justify-center text-white font-bold disabled:opacity-30 disabled:cursor-not-allowed" disabled={!playerState.statPoints}>
                                            <Plus size={14} />
                                        </button>
                                    </div>

                                    {/* VIT */}
                                    <div className="flex items-center bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
                                        <div className="w-8 h-8 bg-pink-900/50 rounded flex items-center justify-center mr-3">
                                            <Heart size={16} className="text-pink-400" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-pink-400 font-bold text-sm">Dayanıklılık (VIT)</div>
                                            <div className="text-[10px] text-slate-500">+10 Can, +0.2% Blok</div>
                                        </div>
                                        <span className="text-white font-bold text-lg mr-3">{playerState.vitality || 100}</span>
                                        <button className="w-7 h-7 bg-green-600 hover:bg-green-500 rounded flex items-center justify-center text-white font-bold disabled:opacity-30 disabled:cursor-not-allowed" disabled={!playerState.statPoints}>
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="text-center text-xs text-slate-500 mb-4">
                                    Her levelda <span className="text-yellow-400 font-bold">5 stat puanı</span> kazanırsın!
                                </div>

                                {/* Calculated Stats */}
                                <div className="border-t border-slate-700/50 pt-4">
                                    <h4 className="text-sm font-bold text-red-400 mb-3">HESAPLANAN STATLAR</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        {/* Combat Power */}
                                        <div className="bg-slate-800/30 rounded-lg p-3">
                                            <div className="text-[10px] text-slate-500 mb-1">SAVAŞ GÜCÜ (SG)</div>
                                            <div className="text-xl font-bold text-yellow-400">
                                                {(() => {
                                                    // Base stats contribution
                                                    const statPower = (playerState.strength || 0) * 50 +
                                                        (playerState.dexterity || 0) * 30 +
                                                        (playerState.intelligence || 0) * 20 +
                                                        (playerState.vitality || 0) * 40;

                                                    // Combat stats contribution
                                                    const combatPower = (playerState.damage || 0) * 10 +
                                                        (playerState.defense || 0) * 8 +
                                                        (playerState.maxHp || 0) * 0.5 +
                                                        (playerState.maxMana || 0) * 0.3;

                                                    // Level contribution
                                                    const levelPower = (playerState.level || 1) * 500;

                                                    // Equipment contribution
                                                    let equipPower = 0;
                                                    if (playerState.equipment) {
                                                        Object.values(playerState.equipment).forEach(item => {
                                                            if (item && item.stats) {
                                                                equipPower += (item.stats.damage || 0) * 15;
                                                                equipPower += (item.stats.defense || 0) * 12;
                                                                equipPower += (item.stats.str || 0) * 50;
                                                                equipPower += (item.stats.dex || 0) * 30;
                                                                equipPower += (item.stats.int || 0) * 20;
                                                                equipPower += (item.stats.vit || 0) * 40;
                                                                equipPower += (item.stats.hp || 0) * 0.5;
                                                            }
                                                            if (item && item.plus) {
                                                                equipPower += item.plus * 200;
                                                            }
                                                        });
                                                    }

                                                    // Wing/Pet contribution
                                                    if (playerState.equippedWing) equipPower += 500;
                                                    if (playerState.equippedPet) equipPower += 300;

                                                    return Math.floor(statPower + combatPower + levelPower + equipPower).toLocaleString();
                                                })()}
                                            </div>
                                        </div>
                                        {/* Damage - Silah hasarı dahil */}
                                        <div className="bg-slate-800/30 rounded-lg p-3">
                                            <div className="text-[10px] text-slate-500 mb-1">Hasar</div>
                                            <div className="text-lg font-bold text-red-400">
                                                {(() => {
                                                    let totalDmg = (playerState.strength || 0) * 2 + (playerState.damage || 0);
                                                    // Silah hasarı ekle
                                                    if (playerState.equipment?.weapon?.stats?.damage) {
                                                        totalDmg += playerState.equipment.weapon.stats.damage;
                                                    }
                                                    return totalDmg;
                                                })()}
                                            </div>
                                        </div>
                                        {/* Defense */}
                                        <div className="bg-slate-800/30 rounded-lg p-3">
                                            <div className="text-[10px] text-slate-500 mb-1">Defans</div>
                                            <div className="text-lg font-bold text-blue-400">{(playerState.vitality || 100) * 5 + playerState.defense}</div>
                                        </div>
                                        {/* Crit Chance */}
                                        <div className="bg-slate-800/30 rounded-lg p-3">
                                            <div className="text-[10px] text-slate-500 mb-1">Kritik Şans</div>
                                            <div className="text-lg font-bold text-orange-400">{Math.min(75, 5 + (playerState.dexterity || 100) * 0.1).toFixed(1)}%</div>
                                        </div>
                                        {/* Attack Speed */}
                                        <div className="bg-slate-800/30 rounded-lg p-3">
                                            <div className="text-[10px] text-slate-500 mb-1">Saldırı Hızı</div>
                                            <div className="text-lg font-bold text-cyan-400">{(1 + (playerState.dexterity || 0) * 0.005).toFixed(2)}x</div>
                                        </div>
                                        {/* Block Chance */}
                                        <div className="bg-slate-800/30 rounded-lg p-3">
                                            <div className="text-[10px] text-slate-500 mb-1">Blok Şansı</div>
                                            <div className="text-lg font-bold text-emerald-400">
                                                {Math.min(50, Math.floor((playerState.dexterity || 0) * 0.3) + Math.floor((playerState.vitality || 0) * 0.2)).toFixed(1)}%
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* EXIT CONFIRMATION MODAL REMOVED - Direct exit now via props.onExit() */}

            {/* LOADING OVERLAY - OYUN AÇILIŞINDA */}
            {isLoading && (
                <div className="fixed inset-0 z-[99999] bg-[#0f0a06] flex flex-col items-center justify-center pointer-events-auto">
                    <h1 className="text-5xl rpg-font text-yellow-500 mb-8 animate-pulse drop-shadow-[0_0_30px_rgba(234,179,8,0.3)] tracking-widest">KADİM SAVAŞLAR</h1>
                    <div className="w-96 h-1 bg-slate-800 rounded-full overflow-hidden relative">
                        <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-600 to-red-600 w-1/3 animate-[spin_1s_linear_infinite]" style={{ width: '40%', animationName: 'slide' }} />
                    </div>
                    <div className="mt-6 text-slate-500 font-mono text-[10px] tracking-[0.3em] uppercase">Varlıklar Yükleniyor</div>
                    <style>{`
                        @keyframes slide {
                            0% { left: -40%; }
                            100% { left: 140%; }
                        }
                    `}</style>
                </div>
            )}
        </div>
    );
};

export default ActiveZoneView;

