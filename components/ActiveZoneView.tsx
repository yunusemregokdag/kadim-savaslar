/// <reference lib="dom" />

import React, { useEffect, useRef, useState, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, OrbitControls, useGLTF, useAnimations } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { io, Socket } from 'socket.io-client';
import { PlayerState, GameEntity, LootLog, FloatingText, LootBox, Item, Equipment, Portal, ChatMessage, HUDElement, HUDLayout, EntityType, Skill, NPCData } from '../types';
import { soundManager } from './SoundManager';
import { ZONE_CONFIG, RANKS, CLASSES, LEVEL_XP_REQUIREMENTS, DEFAULT_HUD_LAYOUT, ZONE_REWARDS, ALL_CLASS_ITEMS, DEFAULT_ZONE_REWARD, ACHIEVEMENTS_LIST } from '../constants';
import { Swords, Shield, Zap, ShoppingBag, Backpack, X, Wind, Skull, Target, Droplet, Flame, Send, Clock, Hammer, MessageSquare, Minus, Crosshair, Map as MapIcon, Settings as SettingsIcon, Crown, Star, ArrowRight, ZoomIn, Globe, AlertTriangle, Navigation, Info, Compass, Plus, Smartphone, Monitor, ChevronDown, ChevronUp, Move, RotateCw, Eye, Book, Users, Trophy, Scroll } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { VoxelSpartan } from './VoxelSpartan';
import InventoryModal from './InventoryModal';
import MarketModal from './MarketModal';
import { PlayerStall } from './PlayerStall';
import { PlayerStallData } from './MarketTypes';
import { VoxelSlime } from './VoxelMobs/VoxelSlime';
import { VoxelAxolotl } from './VoxelMobs/VoxelAxolotl';
import { VoxelPenguin } from './VoxelMobs/VoxelPenguin';
import { VoxelCrab } from './VoxelMobs/VoxelCrab';
import { SkillEffects } from './SkillEffects';
import { SKILL_ASSETS } from './SkillAssetRegistry';
import { CharacterClass } from '../types';
import ChatSystem from './ChatSystem';
import { Ground } from './ZoneEnvironment';
import SchematicMap from './SchematicMap';
import { GameGuideModal } from './GameGuideModal';
import { NPCInteractionModal, NPC_REGISTRY } from './NPCInteractionModal';
import AchievementsModal from './AchievementsModal';
import DailyLoginModal from './DailyLoginModal';
import { useBossAI } from './useBossAI';
import EventBanner from './EventBanner';
import { SettingsView, useSettings } from './SettingsView';
import { CLASS_COMBAT_CONFIG, performAttack, isMeleeClass, logCombat } from '../utils/combatSystem';
import { WeatherParticles, WeatherIndicator, WeatherChangeNotification, FogEffect } from './WeatherEffects';
import { weatherManager } from '../systems/WeatherSystem';
import { monitor } from '../utils/diagnostics/PerformanceMonitor';

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


// --- MATERIALS ---
const MATERIALS: Item[] = [
    { id: 'iron_ore', name: 'Demir Cevheri', type: 'material', tier: 1, rarity: 'common', value: 10, image: 'https://placehold.co/64/grey/white?text=Fe', stats: {} },
    { id: 'wood_log', name: 'Odun', type: 'material', tier: 1, rarity: 'common', value: 5, image: 'https://placehold.co/64/brown/white?text=Wood', stats: {} },
    { id: 'leather_scrap', name: 'Deri Parçası', type: 'material', tier: 1, rarity: 'common', value: 8, image: 'https://placehold.co/64/orange/white?text=Hide', stats: {} },
    { id: 'herb_green', name: 'Şifalı Ot', type: 'material', tier: 1, rarity: 'common', value: 15, image: 'https://placehold.co/64/green/white?text=Herb', stats: {} },
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
    isAdmin?: boolean;
    onReceiveChat?: (msg: ChatMessage) => void;
    socketRef: React.MutableRefObject<Socket | null>; // ADDED
}

// --- DRAGGABLE HUD COMPONENT ---
interface DraggableHUDElementProps {
    id: string;
    element: HUDElement;
    isEditing: boolean;
    onDragStart: (e: React.MouseEvent | React.TouchEvent, id: string) => void;
    children: React.ReactNode;
}

const DraggableHUDElement: React.FC<DraggableHUDElementProps> = ({ id, element, isEditing, onDragStart, children }) => {
    // If not enabled and not editing, hide it. If editing, show it even if disabled (to allow enabling/moving) - or keep logic simple:
    if (!element.enabled && !isEditing) return null;

    return (
        <div
            className={`absolute transition-transform origin-center select-none ${isEditing ? 'z-[100] cursor-move' : 'z-50'}`}
            style={{
                left: `${element.x}%`,
                top: `${element.y}%`,
                transform: `scale(${element.scale}) translate(-50%, -50%)`,
                touchAction: 'none'
            }}
            onMouseDown={(e) => isEditing && onDragStart(e, id)}
            onTouchStart={(e) => isEditing && onDragStart(e, id)}
        >
            {isEditing && (
                <div className="absolute inset-0 border-2 border-yellow-500 bg-yellow-500/20 rounded-lg flex items-center justify-center pointer-events-none">
                    <Move size={24} className="text-white drop-shadow-md opacity-80 animate-pulse" />
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-yellow-600 text-[10px] text-white px-1.5 py-0.5 rounded font-bold uppercase shadow whitespace-nowrap">
                        {id}
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

const VoxelLootBox: React.FC<{ box: LootBox, onClick: (box: LootBox) => void, playerNickname: string }> = ({ box, onClick, playerNickname }) => {
    const [timeLeft, setTimeLeft] = useState(120);
    const isProtected = (Date.now() - box.createdAt) < 60000;
    const isOwner = box.ownerId === playerNickname;

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

    useEffect(() => {
        const interval = setInterval(() => setTimeLeft(prev => Math.max(0, prev - 1)), 1000);
        return () => clearInterval(interval);
    }, []);

    const colors = { white: '#e2e8f0', blue: '#3b82f6', yellow: '#eab308', orange: '#f97316', red: '#ef4444', purple: '#a855f7' };
    const tierColor = colors[box.color as keyof typeof colors] || colors.white;

    return (
        <group position={[box.x, 0, box.z]}>
            {/* 3D CHEST MODEL */}
            <primitive object={clonedScene} scale={1.2} />

            {/* RARITY GLOW */}
            <pointLight position={[0, 0.5, 0]} color={tierColor} intensity={2} distance={3} />

            <Html position={[0, 1.5, 0]} center style={{ pointerEvents: 'none' }}>
                <div className="pointer-events-auto">
                    <button
                        onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); onClick(box); }}
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClick(box); }}
                        onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); onClick(box); }}
                        className={`px-4 py-2 rounded font-bold text-xs border shadow-xl z-50 pointer-events-auto touch-manipulation ${isProtected && !isOwner ? 'bg-gray-700 text-gray-400' : 'bg-green-600 text-white'}`}
                    >
                        {isProtected && !isOwner ? "KORUMALI" : "AL"}
                    </button>
                    {/* <div className="text-[8px] text-white bg-black/50 px-1 rounded mt-1 text-center">{timeLeft}s</div> */}
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

const VoxelMob: React.FC<{ position: [number, number, number], color: string, level: number, name: string, isHostile: boolean, isSelected: boolean, type: string, hitFlash?: number, hp: number, maxHp: number, modelPath?: string, playerRef?: any, entity?: any }> = ({ position, color, level, name, isHostile, isSelected, type, hitFlash, hp, maxHp, modelPath, playerRef, entity }) => {
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

            groupRef.current.position.x = newX;
            groupRef.current.position.z = newZ;
            groupRef.current.rotation.y = -angle + Math.PI / 2;

            // Ref Update (No React State Trigger)
            entity.x = newX * 15;
            entity.y = newZ * 15;
            entity.targetX = newX * 15; // Sync target for AI
            entity.targetY = newZ * 15;
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
            {/* Health Bar / Name Label */}
            <Html position={[0, isNPC ? 2.0 : 2.0, 0]} center style={{ pointerEvents: 'none' }}>
                <div className="flex flex-col items-center">
                    <div className={`text-[8px] font-bold ${isNPC ? 'text-yellow-400 text-xs' : isBoss ? 'text-red-500 text-sm mb-1 uppercase tracking-widest' : isElite ? 'text-purple-400 text-xs' : 'text-white'} drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] whitespace-nowrap`}>
                        {isHostile ? `[Lv.${level}]` : ''} {name}
                    </div>
                    {isHostile && (isSelected || visualHp < maxHp) && (
                        <div className={`bg-gray-900 rounded-full overflow-hidden border border-gray-600 ${isBoss ? 'w-32 h-4' : 'w-12 h-1.5'}`}>
                            <div className={`h-full transition-all duration-200 ${isBoss ? 'bg-gradient-to-r from-red-600 to-orange-600' : 'bg-red-500'}`} style={{ width: `${hpPct}%` }} />
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
}



const GameScene: React.FC<GameSceneProps> = ({
    joystick, playerGroupRef, playerPosRef, setPlayerPosUI, playerStats, projectiles, setProjectiles,
    zoneId, entities, setEntities, onKill, onUpdatePlayer, addFloatingText, hasBase, borderLimit,
    lootBoxes, onCollectLootBox, portals, onPortalJump, isAttacking, skillEffects, isDead, setNearbyNPC, onLoot, zoneColor,
    target, lastDamageTimeRef, setTeleporting, spawnParticles, isFreeLook, teleporting, onSpawnParticle,
    socketRef, lastSocketUpdate, remotePlayers, targetedPlayer, setTargetedPlayer, castingSkill, setIsLoading, entitiesRef, setLootBoxes
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
            itemDrop = { id: `wood_log_${uuidv4()}`, name: 'Kütük', type: 'material', tier: 1, rarity: 'common', value: 10, icon: '🪵' };
            soundKey = 'gather_wood';
            particleColor = '#5D4037';
        }
        if (type === 'rock') {
            itemDrop = { id: `iron_ore_${uuidv4()}`, name: 'Demir Cevheri', type: 'material', tier: 1, rarity: 'uncommon', value: 20, icon: '🪨' };
            soundKey = 'gather_rock';
            particleColor = '#757575';
        }
        if (type === 'crystal') {
            itemDrop = { id: `crystal_${uuidv4()}`, name: 'Kristal Parçası', type: 'material', tier: 2, rarity: 'rare', value: 50, icon: '💎' };
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

                playerGroupRef.current.position.x = newX;
                playerGroupRef.current.position.z = newZ;
                playerPosRef.current.x = newX;
                playerPosRef.current.y = newZ;
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
                    />
                </React.Suspense>

                {playerStats?.settings?.showNames && (
                    <Html position={[0, 2.8, 0]} center zIndexRange={[50, 0]}>
                        <div className="flex flex-col items-center pointer-events-none whitespace-nowrap">
                            <div className="text-[10px] font-bold text-white bg-black/50 px-2 rounded backdrop-blur-sm border border-slate-600 mb-1">
                                {playerStats.guildName ? <span className="text-yellow-400">[{playerStats.guildName}] </span> : ''}
                                <span style={{
                                    color: playerStats.settings.nameColor || 'white',
                                    textShadow: playerStats.settings.nameColor ? `0 0 8px ${playerStats.settings.nameColor}` : 'none'
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
            {remotePlayers.map(p => (
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
                            <div className={`text-[10px] font-bold text-white bg-black/50 px-2 rounded backdrop-blur-sm border mb-1 ${targetedPlayer?.id === p.id ? 'border-yellow-400 ring-2 ring-yellow-400' : 'border-slate-600'}`}>
                                {p.nickname} (Lv.{p.level})
                            </div>
                        </div>
                    </Html>
                </group>
            ))}

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
                />
            ))}
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
                            <div key={portal.id} className="absolute w-8 h-8 -ml-4 -mt-4 flex flex-col items-center justify-center cursor-pointer hover:scale-110 transition-transform z-10 pointer-events-auto" style={{ left: `${getPos(portal.x)}%`, top: `${getPos(portal.z)}%` }} onClick={() => onZoneSwitch(portal.targetZone)}>
                                <div className="w-4 h-4 rounded-full bg-purple-500 animate-pulse shadow-[0_0_10px_purple]" />
                                <div className="bg-black/80 text-purple-200 text-[9px] px-2 py-1 rounded whitespace-nowrap border border-purple-800 mt-1 max-w-[120px] text-center">{portal.name}</div>
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

const ActiveZoneView: React.FC<ActiveZoneViewProps> = (props) => {
    const { playerState, zoneId, onLoot, onQuestProgress, onUpdatePlayer, onExit, onOpenCrafting, socketRef, onReceiveChat } = props;

    // Get settings from context
    const { settings } = useSettings();

    // HUD Layout State - Sadece DEFAULT_HUD_LAYOUT kullan
    const [hudLayout, setHudLayout] = useState<HUDLayout>(() => {
        // Doğrudan yeni default layout kullan - basit ve temiz
        return JSON.parse(JSON.stringify(DEFAULT_HUD_LAYOUT));
    });

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
    const [showMarket, setShowMarket] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const [showChat, setShowChat] = useState(true);
    const [showGlobalMap, setShowGlobalMap] = useState(false);
    const [showGameGuide, setShowGameGuide] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showFullSettings, setShowFullSettings] = useState(false);
    const [showAchievements, setShowAchievements] = useState(false);
    const [showDailyReward, setShowDailyReward] = useState(false);
    const [nearbyNPC, setNearbyNPC] = useState<GameEntity | null>(null);
    const [interactingNPC, setInteractingNPC] = useState<NPCData | null>(null);
    const [playerPosUI, setPlayerPosUI] = useState({ x: 0, y: 0, rotation: 0 });
    const [teleporting, setTeleporting] = useState<{ target: number, start: number } | null>(null);
    const [target, setTarget] = useState<GameEntity | null>(null);
    const [playerAction, setPlayerAction] = useState<'idle' | 'attack' | 'shoot' | null>(null);

    // Visual Effects
    const [particles, setParticles] = useState<any[]>([]);

    const [castingSkill, setCastingSkill] = useState<number | null>(null);
    const [active3DEffects, setActive3DEffects] = useState<Active3DEffect[]>([]);

    // HUD Editor
    const [isHudEditing, setIsHudEditing] = useState(false);
    const [dragTarget, setDragTarget] = useState<string | null>(null);
    const [isFreeLook, setIsFreeLook] = useState(false); // Free Look State

    // HUD Customization - Local state for immediate visual feedback
    const [localHudScale, setLocalHudScale] = useState(() => {
        try {
            const localData = localStorage.getItem(`hud_settings_${playerState.nickname}`);
            if (localData) {
                const parsed = JSON.parse(localData);
                if (parsed.hudScale) return parsed.hudScale;
            }
        } catch (e) { }
        return playerState.settings.hudScale || 1;
    });

    const [localButtonOpacity, setLocalButtonOpacity] = useState(() => {
        try {
            const localData = localStorage.getItem(`hud_settings_${playerState.nickname}`);
            if (localData) {
                const parsed = JSON.parse(localData);
                if (parsed.buttonOpacity) return parsed.buttonOpacity;
            }
        } catch (e) { }
        return (playerState.settings as any).buttonOpacity || 1;
    });

    const playerPosRef = useRef({ x: 0, y: 0 });
    const playerGroupRef = useRef<THREE.Group>(null);
    const lastDamageTimeRef = useRef(0);
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
            console.log("🔌 ActiveZoneView Detaching Listeners");
            socket.off('connect', handleConnect);
            socket.off('game_update', handleGameUpdate);
            socket.off('player_moved', handlePlayerMoved);
            socket.off('player_left', handlePlayerLeft);
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
        setDragTarget(id);
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
            setLocalHudScale(1);
            setLocalButtonOpacity(1);
        } else {
            // LINEAR/DESKTOP PRESET - Skills in a row at bottom center
            setHudLayout({
                elements: {
                    // Profile - Top Left
                    profile: { x: 5, y: 5, scale: 1, enabled: true },
                    // Map - Top Right
                    map: { x: 85, y: 5, scale: 1, enabled: true },
                    // Quest - Below Profile
                    quest: { x: 5, y: 18, scale: 1, enabled: true },
                    // Chat - Left side middle
                    chat: { x: 5, y: 40, scale: 1, enabled: true },
                    // Joystick - Bottom Left
                    joystick: { x: 12, y: 82, scale: 1, enabled: true },
                    // Eye - Right side middle
                    eye: { x: 80, y: 45, scale: 1, enabled: true },
                    // Skills in a row at bottom center
                    skill1: { x: 30, y: 92, scale: 1, enabled: true },
                    skill2: { x: 38, y: 92, scale: 1, enabled: true },
                    skill3: { x: 46, y: 92, scale: 1, enabled: true },
                    skill4: { x: 54, y: 92, scale: 1, enabled: true },
                    skill5: { x: 62, y: 92, scale: 1, enabled: true },
                    skill6: { x: 70, y: 92, scale: 1, enabled: true },
                    skill7: { x: 78, y: 92, scale: 1, enabled: true },
                    // Attack - Bottom Right
                    attack: { x: 90, y: 82, scale: 1.2, enabled: true },
                    // Potions - Right side
                    hp_pot: { x: 92, y: 35, scale: 0.9, enabled: true },
                    mp_pot: { x: 92, y: 42, scale: 0.9, enabled: true },
                }
            });
        }
    };

    const saveHudSettings = () => {
        // Save to Local Storage for immediate persistence and as a backup
        try {
            const settingsToSave = {
                hudLayout,
                hudScale: localHudScale,
                buttonOpacity: localButtonOpacity
            };
            localStorage.setItem(`hud_settings_${playerState.nickname}`, JSON.stringify(settingsToSave));
        } catch (e) {
            console.error("Failed to save HUD settings locally:", e);
        }

        onUpdatePlayer({
            settings: {
                ...playerState.settings,
                hudLayout,
                hudScale: localHudScale,
                buttonOpacity: localButtonOpacity
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
            playerPosRef.current = { x: 0, y: 0 };
            setTeleporting(null);
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
        setIsAttacking(true);
        setIsAttacking(true);
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

        // 2. CALCULATE GOLD & XP & HONOR
        let xp = ent.level * 50;
        let gold = Math.floor(Math.random() * (rewardConfig.maxGold - rewardConfig.minGold + 1)) + rewardConfig.minGold;
        let honor = ent.type === 'player' ? 150 : rewardConfig.honor;

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

        // ====== PREMIUM BONUSES ======
        if (playerState.premiumBenefits) {
            // EXP Multiplier (1.1x - 2.0x)
            xp = Math.floor(xp * playerState.premiumBenefits.expMultiplier);
            // Gold Multiplier (1.1x - 2.0x)
            gold = Math.floor(gold * playerState.premiumBenefits.goldMultiplier);
        }

        // 3. ITEM DROP LOGIC
        let droppedItem: Item | undefined = undefined;
        let boxColor = 'green';
        let lootTier = 1;

        // Box Tier Roll - Apply premium drop rate bonus
        let boxRoll = Math.random();
        // Premium drop rate bonus: Improves tier rolls
        if (playerState.premiumBenefits?.dropRateBonus) {
            // Shift the roll down to increase chances of higher tiers
            boxRoll = Math.max(0, boxRoll - (playerState.premiumBenefits.dropRateBonus / 200));
        }

        if (boxRoll < 0.60) { lootTier = 1; boxColor = 'green'; } // T1
        else if (boxRoll < 0.85) { lootTier = 2; boxColor = 'blue'; } // T2
        else if (boxRoll < 0.95) { lootTier = 3; boxColor = 'purple'; } // T3
        else { lootTier = 4; boxColor = 'orange'; } // T4

        const itemRoll = Math.random();
        const hasItem = lootTier >= 4 ? itemRoll < 0.8 : lootTier === 3 ? itemRoll < 0.5 : itemRoll < 0.15;

        if (hasItem) {
            let maxPossibleTier = 3; // Cap regular drops at T3
            let isHighTierDrop = false;

            // UNLOCK T4/T5 only in High Tier Boxes with VERY LOW CHANCE (0.9%)
            if (lootTier >= 3) {
                if (Math.random() < 0.009) {
                    maxPossibleTier = 5;
                    isHighTierDrop = true;
                }
            }

            // Select potential items
            let potentialItems = ALL_CLASS_ITEMS.filter(i => i.tier <= maxPossibleTier);

            // If we hit the jackpot (T4/T5), prioritize giving those
            if (isHighTierDrop) {
                const highTierItems = ALL_CLASS_ITEMS.filter(i => i.tier >= 4);
                if (highTierItems.length > 0) potentialItems = highTierItems;
            }

            if (potentialItems.length > 0) {
                const baseItem = potentialItems[Math.floor(Math.random() * potentialItems.length)];

                // STAT SCALING LOGIC
                let finalStats = { ...baseItem.stats };
                let finalLevelReq = baseItem.levelReq;
                let namePrefix = "";
                const scaleRefLevel = 60; // Max level assumption

                // Only scale if the item is high tier but player is low level
                if (baseItem.tier >= 4 && playerState.level < scaleRefLevel) {
                    const scaleFactor = Math.max(0.2, playerState.level / scaleRefLevel);

                    namePrefix = "(Eski) "; // Lore friendly: "Ancient/Old" implies it lost power
                    finalLevelReq = 1; // Make it usable immediately

                    // Scale stats
                    if (finalStats.damage) finalStats.damage = Math.floor(finalStats.damage * scaleFactor);
                    if (finalStats.defense) finalStats.defense = Math.floor(finalStats.defense * scaleFactor);
                    if (finalStats.hp) finalStats.hp = Math.floor(finalStats.hp * scaleFactor);
                    if (finalStats.strength) finalStats.strength = Math.floor(finalStats.strength * scaleFactor);
                    if (finalStats.dexterity) finalStats.dexterity = Math.floor(finalStats.dexterity * scaleFactor);
                    if (finalStats.intelligence) finalStats.intelligence = Math.floor(finalStats.intelligence * scaleFactor);
                }

                droppedItem = {
                    ...baseItem,
                    id: uuidv4(),
                    name: namePrefix + baseItem.name,
                    levelReq: finalLevelReq,
                    stats: finalStats,
                    plus: isHighTierDrop ? 0 : (lootTier >= 3 ? Math.floor(Math.random() * 3) : 0)
                };
            }
        } else {
            // Fallback to Materials
            if (Math.random() < 0.5) { // Increased chance for mats
                const roll = Math.random();
                if (roll < 0.5) {
                    droppedItem = { id: `leather_scrap_${uuidv4()}`, name: 'Deri Parçası', type: 'material', tier: 1, rarity: 'common', value: 10, icon: '🛡️', description: 'Zırh yapımında kullanılır.' };
                } else if (roll < 0.8) {
                    droppedItem = { id: `herb_green_${uuidv4()}`, name: 'Şifalı Ot', type: 'material', tier: 1, rarity: 'common', value: 5, icon: '🌿', description: 'İksir yapımında kullanılır.' };
                } else {
                    droppedItem = { id: `iron_ore_${uuidv4()}`, name: 'Demir Cevheri', type: 'material', tier: 1, rarity: 'uncommon', value: 15, icon: '🪨' };
                }
            }
        }

        // Override box color if we got a super legendary item? No, stick to the visual roll for consistency.

        onLoot(gold, xp, honor, droppedItem);
        setTimeout(() => {
            checkAchievements('kill', 1);
            checkAchievements('gold', playerState.credits + gold);
        }, 50);

        addFloatingText(`+${xp} XP`, x, 3, z, 'text-green-400');
        addFloatingText(`+${honor} Şeref`, x, 4, z, 'text-purple-400 font-bold');
        if (droppedItem) addFloatingText(`${droppedItem.name}`, x, 3.5, z, 'text-orange-400 font-bold shadow-black drop-shadow-md');

        onQuestProgress(ent.name);

        // Always spawn box with the determined color
        const box: LootBox = {
            id: uuidv4(),
            x, y: 0.5, z,
            color: boxColor,
            tier: lootTier,
            ownerId: playerState.nickname,
            createdAt: Date.now()
        };
        setLootBoxes(prev => [...prev, box]);
    };



    // ... existing code ...

    const handleSkill = (skillId: string, skill: any) => {
        if (isHudEditing) return; // Disable while editing
        if (cooldowns[skillId]) return;
        if (playerState.mana < skill.manaCost) {
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
        handleUpdatePlayerSafe({ mana: playerState.mana - skill.manaCost });

        // === SKILL ANIMASYONU TETİKLE ===
        // skillId'den skill numarasını çıkar (skill_1 -> 1, skill_2 -> 2, vs.)
        const skillNumMatch = skillId.match(/(\d+)/);
        const skillNum = skillNumMatch ? parseInt(skillNumMatch[1]) : 1;
        setCastingSkill(skillNum);

        // 500ms sonra animasyonu durdur
        setTimeout(() => {
            setCastingSkill(null);
        }, 500);

        // Legacy setSkillEffects removed

        // 3D EFFECT LOGIC
        console.log("DEBUG SKILL EXEC:", skill.id, skill.visual, "Model:", skill.modelPath);
        if (skill.modelPath || SKILL_ASSETS[skill.visual]) {
            const effectId = uuidv4();
            const px = playerPosRef.current.x;
            const pz = playerPosRef.current.y;

            let effectPos: [number, number, number] = [px, 0.5, pz]; // Default at player
            let targetPos: [number, number, number] | undefined = undefined;

            if (effectiveTarget) {
                targetPos = [effectiveTarget.x / 15, 0.5, effectiveTarget.y / 15];
            } else {
                console.log("DEBUG: No Effective Target found");
                // Forward vector for no target
                const rot = playerGroupRef.current?.rotation.y || 0;
                targetPos = [px + Math.sin(rot) * 5, 0.5, pz + Math.cos(rot) * 5];
            }

            // FIX: Damage/Utility skills should spawn at target, not at player!
            // Only buff/heal/shield skills should spawn on player
            const isPlayerCenteredSkill = skill.type === 'buff' || skill.type === 'heal' ||
                skill.visual.includes('shield') || skill.visual.includes('barrier') ||
                skill.visual.includes('meditation') || skill.visual.includes('focus') ||
                skill.visual.includes('storm'); // arctic_storm is a shield around player

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

    const currentLevelStartXP = LEVEL_XP_REQUIREMENTS[playerState.level] || 0;
    const nextLevelReqXP = LEVEL_XP_REQUIREMENTS[playerState.level + 1] || playerState.maxExp;
    const xpInLevel = playerState.exp - currentLevelStartXP;
    const xpNeeded = nextLevelReqXP - currentLevelStartXP;
    const xpPercent = Math.min(100, Math.max(0, (xpInLevel / xpNeeded) * 100));

    const hpPotCount = playerState.inventory.filter(i => i.name.includes('Can')).length;
    const mpPotCount = playerState.inventory.filter(i => i.name.includes('Mana')).length;

    // --- SKILL BUTTON RENDERER ---
    const renderSkillButton = (skill: any, i: number, sizeClass: string = "w-12 h-12") => {
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
                className={`${sizeClass} rounded-full border-2 flex items-center justify-center relative overflow-hidden transition-all active:scale-95 shadow-lg select-none touch-none
                    ${isLocked ? 'bg-slate-900 border-slate-700 opacity-40 grayscale' :
                        isOnCd ? 'bg-slate-800 border-slate-600 opacity-50' :
                            hasMana ? 'bg-slate-900/90 border-slate-500 hover:border-yellow-400' : 'bg-slate-900/50 border-blue-900 opacity-80'}
                `}
            >
                {/* ICON / EMOJI DISPLAY INSTEAD OF NUMBER */}
                {skill.icon?.startsWith('/') ? (
                    <img src={skill.icon} alt="skill" className="w-full h-full object-cover" />
                ) : (
                    <div className={`text-xl font-bold relative z-10 ${hasMana ? 'text-white' : 'text-blue-400'} drop-shadow-md`}>{skill.icon || (i + 1)}</div>
                )}

                {/* NUMBER BADGE (Small overlay) */}
                <div className="absolute bottom-1 right-2 text-[8px] font-mono text-slate-300 opacity-70 border border-white/10 bg-black/50 px-1 rounded-full">{i + 1}</div>

                {/* LEVEL LOCK OVERLAY */}
                {isLocked && (
                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center">
                        <span className="text-xl">🔒</span>
                        <span className="text-[8px] text-yellow-400 font-bold">Lv.{skillLevelReq}</span>
                    </div>
                )}

                {!hasMana && !isOnCd && !isLocked && <div className="absolute inset-0 flex items-center justify-center bg-black/30"><Droplet size={12} className="text-blue-500 animate-bounce" /></div>}
                {isOnCd && !isLocked && <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-xs text-white font-mono font-bold">{Math.ceil(cooldowns[skill.id] / 1000)}</div>}
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

            {/* Hava Durumu Göstergesi */}
            <WeatherIndicator />
            <WeatherChangeNotification />

            {/* JOYSTICK */}
            <DraggableHUDElement id="joystick" element={hudLayout.elements.joystick} isEditing={isHudEditing} onDragStart={handleDragStart}>
                <div style={{ transform: `scale(${localHudScale})`, opacity: localButtonOpacity }}>
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
                        <div className="w-full h-full bg-white/10 rounded-full relative backdrop-blur-sm border border-white/20">
                            <div className="absolute w-12 h-12 bg-white/80 rounded-full shadow-lg transition-transform duration-75" style={{ left: `calc(50% + ${joystick ? joystick.x * 50 : 0}px)`, top: `calc(50% - ${joystick ? joystick.y * 50 : 0}px)`, transform: 'translate(-50%, -50%)' }} />
                        </div>
                    </div>
                </div>
            </DraggableHUDElement>

            {/* FREE LOOK / EYE BUTTON */}
            <DraggableHUDElement id="eye" element={hudLayout.elements.eye || { x: 80, y: 40, scale: 1, enabled: true }} isEditing={isHudEditing} onDragStart={handleDragStart}>
                <div style={{ transform: `scale(${localHudScale})`, opacity: localButtonOpacity }}>
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
            <DraggableHUDElement id="attack" element={hudLayout.elements.attack} isEditing={isHudEditing} onDragStart={handleDragStart}>
                <div style={{ transform: `scale(${localHudScale})`, opacity: localButtonOpacity }}>
                    <button
                        onMouseDown={handleAttack}
                        onTouchStart={handleAttack}
                        className="w-24 h-24 bg-red-600 rounded-full border-4 border-red-800 shadow-xl active:scale-95 flex items-center justify-center hover:bg-red-500 transition-colors pointer-events-auto"
                    >
                        <Swords size={40} className="text-white" />
                    </button>
                </div>
            </DraggableHUDElement>

            {/* SKILLS 1-6 (INDIVIDUAL DRAGGABLES) - REDUCED TO 6 */}
            {['skill1', 'skill2', 'skill3', 'skill4', 'skill5', 'skill6'].map((key, i) => (
                <DraggableHUDElement key={key} id={key} element={hudLayout.elements[key]} isEditing={isHudEditing} onDragStart={handleDragStart}>
                    <div style={{ opacity: localButtonOpacity, transform: `scale(${localHudScale})` }}>
                        {playerState.class && CLASSES[playerState.class].skills[i]
                            ? renderSkillButton(CLASSES[playerState.class].skills[i], i)
                            : <div className="w-12 h-12 bg-slate-800 rounded-full border border-slate-600 opacity-30" />
                        }
                    </div>
                </DraggableHUDElement>
            ))}


            {/* HP POT - Separately Draggable */}
            <DraggableHUDElement id="hp_pot" element={hudLayout.elements.hp_pot} isEditing={isHudEditing} onDragStart={handleDragStart}>
                <div style={{ transform: `scale(${localHudScale})`, opacity: localButtonOpacity }}>
                    <button onClick={() => props.onQuickPotion('hp')} className="w-10 h-10 bg-red-900/90 border-2 border-red-500 rounded-full flex flex-col items-center justify-center hover:bg-red-800 transition-colors relative shadow-lg active:scale-95 pointer-events-auto">
                        <Droplet size={14} className="text-red-300" />
                        <span className="text-[9px] text-white font-bold absolute bottom-0.5">{hpPotCount}</span>
                    </button>
                </div>
            </DraggableHUDElement>

            {/* MP POT - Separately Draggable */}
            <DraggableHUDElement id="mp_pot" element={hudLayout.elements.mp_pot} isEditing={isHudEditing} onDragStart={handleDragStart}>
                <div style={{ transform: `scale(${localHudScale})`, opacity: localButtonOpacity }}>
                    <button onClick={() => props.onQuickPotion('mp')} className="w-10 h-10 bg-blue-900/90 border-2 border-blue-500 rounded-full flex flex-col items-center justify-center hover:bg-blue-800 transition-colors relative shadow-lg active:scale-95 pointer-events-auto">
                        <Zap size={14} className="text-blue-300" />
                        <span className="text-[9px] text-white font-bold absolute bottom-0.5">{mpPotCount}</span>
                    </button>
                </div>
            </DraggableHUDElement>


            {/* PROFILE UI */}
            <DraggableHUDElement id="profile" element={hudLayout.elements.profile} isEditing={isHudEditing} onDragStart={handleDragStart}>
                <div style={{ transform: `scale(${localHudScale})`, opacity: localButtonOpacity, transformOrigin: 'top left' }}>
                    <div className="flex gap-3 pointer-events-auto select-none items-center">
                        <div className="relative w-16 h-16 rounded-full border-4 border-slate-700 bg-slate-900 flex items-center justify-center shadow-2xl z-20">
                            <div className="text-2xl font-black text-white rpg-font">{playerState.level}</div>
                            <div className="absolute -bottom-2 bg-yellow-600 text-[9px] px-2 py-0.5 rounded border border-yellow-400 text-white font-bold">LVL</div>
                        </div>
                        <div className="flex flex-col gap-1 w-56 bg-black/60 p-2 rounded-r-xl border-y border-r border-slate-700 backdrop-blur-sm -ml-4 pl-6 z-10">
                            <div className="flex justify-between items-center text-xs font-bold text-white mb-1">
                                <span style={playerState.premiumBenefits?.nameColor ? { color: playerState.premiumBenefits.nameColor } : {}}>
                                    {playerState.premiumBenefits?.badge && <span className="mr-1">{playerState.premiumBenefits.badge}</span>}
                                    {playerState.nickname}
                                </span>
                                <span className="text-[10px] text-yellow-500 flex items-center gap-1"><Crown size={10} /> {RANKS[playerState.rank].title}</span>
                            </div>
                            <div className="relative h-4 w-full bg-slate-900 rounded-sm border border-slate-800">
                                <div className="h-full bg-gradient-to-r from-red-700 to-red-500 transition-all duration-300" style={{ width: `${(playerState.hp / playerState.maxHp) * 100}%` }} />
                                <div className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white shadow-black drop-shadow-md">{playerState.hp} / {playerState.maxHp} HP</div>
                            </div>
                            <div className="relative h-3 w-full bg-slate-900 rounded-sm border border-slate-800">
                                <div className="h-full bg-gradient-to-r from-blue-700 to-blue-500 transition-all duration-300" style={{ width: `${(playerState.mana / playerState.maxMana) * 100}%` }} />
                                <div className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-white shadow-black drop-shadow-md">{playerState.mana} / {playerState.maxMana} MP</div>
                            </div>
                        </div>
                    </div>
                </div>
            </DraggableHUDElement>

            {/* MAP & MENU BUTTONS */}
            <DraggableHUDElement id="map" element={hudLayout.elements.map} isEditing={isHudEditing} onDragStart={handleDragStart}>
                <div style={{ transform: `scale(${localHudScale})`, opacity: settings.hudOpacity / 100, transformOrigin: 'top right' }}>
                    <div className="flex flex-col items-end gap-2 pointer-events-auto">
                        {settings.showMinimap && (
                            <div className="flex gap-4 items-end" style={{ opacity: settings.minimapOpacity / 100 }}>
                                <MiniMap playerPos={playerPosUI} entities={entities} portals={zoneData?.portals || []} zoneLimit={100} onClick={() => setShowMap(true)} smallMap={playerState.settings.smallMap} />
                            </div>
                        )}
                        <div className="flex gap-2" style={{ opacity: localButtonOpacity }}>
                            <div className="bg-black/50 px-3 py-2 rounded text-white font-bold backdrop-blur-sm border border-slate-700 text-xs hidden md:block">{zoneData?.name}</div>
                            <button title="Sohbet" onClick={() => setShowChat(!showChat)} className={`p-2 rounded border border-slate-700 hover:text-white ${showChat ? 'bg-yellow-900/80 text-yellow-500' : 'bg-slate-900/80 text-slate-400'}`}><MessageSquare size={20} /></button>
                            <button title="Envanter" onClick={() => setShowInventory(true)} className="bg-slate-900/80 p-2 rounded border border-slate-700 text-yellow-500 hover:text-white"><Backpack size={20} /></button>
                            <button title="Ayarlar" onClick={() => setShowSettings(true)} className="bg-slate-900/80 p-2 rounded border border-slate-700 text-slate-400 hover:text-white"><SettingsIcon size={20} /></button>
                            <button title="Başarımlar" onClick={() => setShowAchievements(true)} className="bg-slate-900/80 p-2 rounded border border-slate-700 text-yellow-500 hover:text-white"><Trophy size={20} /></button>
                            <button title="Çıkış" onClick={onExit} className="bg-slate-900/80 text-red-400 p-2 rounded border border-slate-700 hover:bg-slate-800 hover:text-red-200"><X size={20} /></button>
                        </div>
                    </div>
                </div>
            </DraggableHUDElement>

            {/* CHAT SYSTEM */}
            {showChat && (
                <DraggableHUDElement id="chat" element={hudLayout.elements.chat} isEditing={isHudEditing} onDragStart={handleDragStart}>
                    <div className="w-80 h-64 pointer-events-auto" style={{ opacity: settings.chatOpacity / 100 }}>
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
            <DraggableHUDElement id="quest" element={hudLayout.elements.quest} isEditing={isHudEditing} onDragStart={handleDragStart}>
                <div style={{ transform: `scale(${localHudScale})`, opacity: localButtonOpacity, transformOrigin: 'top left' }} className="pointer-events-auto">
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
                            <div className="p-2">
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
                                    <div className="text-slate-400 text-xs text-center py-2">
                                        Aktif görev yok. NPC ile konuş!
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
                <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-black/95 border border-yellow-500 p-5 rounded-xl flex flex-col gap-4 z-[60] pointer-events-auto shadow-2xl w-80 max-h-[80vh] overflow-y-auto custom-scrollbar">
                    <h3 className="text-yellow-500 font-bold text-center flex items-center justify-center gap-2 text-lg"><Move /> ARAYÜZ DÜZENLEYİCİ</h3>

                    {/* Hazır Şablonlar */}
                    <div className="flex flex-col gap-2">
                        <div className="text-xs text-slate-300 font-bold">Hazır Şablonlar</div>
                        <div className="flex gap-2">
                            <button onClick={() => resetLayout('desktop')} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-xs text-white">Düz (PC)</button>
                            <button onClick={() => resetLayout('mobile')} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-xs text-white">Yay (Mobil)</button>
                        </div>
                    </div>

                    {/* Buton Boyutu */}
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-300 font-bold">Buton Boyutu</span>
                            <span className="text-xs text-yellow-400">{Math.round(localHudScale * 100)}%</span>
                        </div>
                        <input
                            type="range"
                            min="50"
                            max="150"
                            value={localHudScale * 100}
                            onChange={(e) => setLocalHudScale(parseInt(e.target.value) / 100)}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                        />
                        <div className="flex justify-between text-[10px] text-slate-500">
                            <span>50%</span>
                            <span>100%</span>
                            <span>150%</span>
                        </div>
                    </div>

                    {/* Buton Şeffaflığı */}
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-300 font-bold">Buton Şeffaflığı</span>
                            <span className="text-xs text-cyan-400">{Math.round(localButtonOpacity * 100)}%</span>
                        </div>
                        <input
                            type="range"
                            min="30"
                            max="100"
                            value={localButtonOpacity * 100}
                            onChange={(e) => setLocalButtonOpacity(parseInt(e.target.value) / 100)}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                        />
                        <div className="flex justify-between text-[10px] text-slate-500">
                            <span>30%</span>
                            <span>65%</span>
                            <span>100%</span>
                        </div>
                    </div>


                    {/* Bilgi */}
                    <div className="text-xs text-slate-400 text-center leading-relaxed bg-slate-800/50 p-3 rounded border border-slate-700">
                        💡 Öğeleri parmağınızla sürükleyerek istediğiniz yere taşıyabilirsiniz. HP/Mana potları da ayrı ayrı taşınabilir!
                    </div>

                    <button onClick={saveHudSettings} className="w-full py-3 bg-green-600 text-white font-bold rounded hover:bg-green-500 shadow-lg">KAYDET & ÇIK</button>
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
            {showMarket && <MarketModal
                playerCredits={playerState.credits}
                inventory={playerState.inventory}
                onClose={() => setShowMarket(false)}
                onBuy={(cost, item) => {
                    if (playerState.credits >= cost) {
                        onUpdatePlayer({ credits: playerState.credits - cost });
                        onLoot(0, 0, 0, item);
                        addFloatingText(`Satın alındı: ${item.name}`, 0, 0, 0, 'text-green-400');
                    }
                }}
                onSell={(value, itemId) => {
                    const newInventory = playerState.inventory.filter(i => i.id !== itemId);
                    onUpdatePlayer({
                        credits: playerState.credits + value,
                        inventory: newInventory
                    });
                    addFloatingText(`Satıldı: +${value} G`, 0, 0, 0, 'text-yellow-400 font-bold');
                }}
            />}
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
            {showGameGuide && <GameGuideModal onClose={() => setShowGameGuide(false)} />}

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
                    onOpenShop={() => setShowMarket(true)}
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
                />
            )}

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

