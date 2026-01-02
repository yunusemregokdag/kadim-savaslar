import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useGLTF, Sparkles, Trail, useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CharacterClass, Item, WingItem, PetItem } from '../types';
import { DynamicPet } from './DynamicPet';
import { getGlowEffect, getClassParticleType, CLASS_COLORS, GlowEffect } from '../systems/GlowEffects';
import { COSTUME_SETS } from '../constants';

// --- WEAPON REGISTRY ---
export const WEAPON_MAP: Record<CharacterClass, string> = {
    warrior: '/models/items/weapons/warrior/warrior_sword_shiny.gltf',
    arctic_knight: '/models/items/weapons/arctic_knight/frigid_lance_arctic_knight.gltf',
    archer: '/models/items/weapons/archer/archer_bow_shiny.gltf',
    archmage: '/models/items/weapons/archmage/archmage_staff_shiny.gltf',
    bard: '/models/items/weapons/bard/bard_harp_shiny.gltf',
    cleric: '/models/items/weapons/cleric/cleric_mace_shiny.gltf',
    martial_artist: '/models/items/weapons/martial_artist/martial_artist_gauntlet.gltf',
    reaper: '/models/items/weapons/reaper/scythe_reaper_shiny.gltf',
};

// --- CLASS-SPECIFIC APPEARANCE ---
const CLASS_APPEARANCE: Record<CharacterClass, {
    body: string;
    bodyAccent: string;
    legs: string;
    hair: string;
    skin: string;
    eyes: string;
}> = {
    warrior: {
        body: '#4a6fa5',       // Steel blue armor
        bodyAccent: '#2c3e50', // Dark steel trim
        legs: '#34495e',       // Dark grey pants
        hair: '#2c2c2c',       // Dark hair
        skin: '#e8c4a0',       // Warm skin
        eyes: '#4a3728',       // Brown eyes
    },
    arctic_knight: {
        body: '#a8d8ea',       // Ice blue armor
        bodyAccent: '#5dade2', // Bright ice blue
        legs: '#3498db',       // Blue ice
        hair: '#ecf0f1',       // White/silver hair
        skin: '#f5e6d3',       // Pale skin
        eyes: '#00ced1',       // Cyan eyes
    },

    archer: {
        body: '#2d5a27',       // Forest green tunic
        bodyAccent: '#1e3d14', // Dark forest trim
        legs: '#5d4037',       // Brown leather pants
        hair: '#6d4c41',       // Brown hair
        skin: '#e8c4a0',       // Warm skin
        eyes: '#4e342e',       // Dark brown eyes
    },
    archmage: {
        body: '#6c3483',       // Deep purple robe
        bodyAccent: '#9b59b6', // Light purple trim
        legs: '#4a235a',       // Dark purple
        hair: '#5d6d7e',       // Grey wizard hair
        skin: '#f5deb3',       // Pale skin
        eyes: '#8e44ad',       // Purple eyes
    },
    bard: {
        body: '#c0392b',       // Red performer outfit
        bodyAccent: '#e74c3c', // Bright red trim
        legs: '#922b21',       // Dark red
        hair: '#f4d03f',       // Golden blonde hair
        skin: '#ffe4c4',       // Fair skin
        eyes: '#2980b9',       // Blue eyes
    },
    cleric: {
        body: '#f1c40f',       // Golden holy robes
        bodyAccent: '#f39c12', // Orange gold trim
        legs: '#ecf0f1',       // White pants
        hair: '#7f8c8d',       // Grey hair
        skin: '#faebd7',       // Light skin
        eyes: '#d4ac0d',       // Golden eyes
    },
    martial_artist: {
        body: '#e74c3c',       // Red gi
        bodyAccent: '#c0392b', // Dark red belt
        legs: '#1c1c1c',       // Black pants
        hair: '#1a1a1a',       // Black hair
        skin: '#d2a679',       // Tan skin
        eyes: '#2c3e50',       // Dark eyes
    },

    reaper: {
        body: '#1a1a2e',       // Dark purple-black cloak
        bodyAccent: '#16213e', // Darker trim
        legs: '#0f0f1a',       // Near black
        hair: '#0a0a0a',       // Black hood
        skin: '#bdc3c7',       // Pale grey skin
        eyes: '#e74c3c',       // Glowing red eyes
    },
};

// --- WEAPON HOLD ADJUSTMENTS (attached to hand) ---
// Shaft extends UP from hand, blade hangs DOWN/FORWARD - hand grips middle/lower part of shaft
const WEAPON_HOLD: Record<CharacterClass, {
    position: [number, number, number];
    rotation: [number, number, number];
    scale: number;
}> = {
    warrior: { position: [0.00, 0.10, 0.60], rotation: [1.36, -0.04, 0.00], scale: 0.85 }, // Kılıç - doğru pozisyon
    arctic_knight: { position: [0.00, 0.00, 0.20], rotation: [1.36, -0.04, -0.04], scale: 0.80 }, // Mızrak - doğru pozisyon

    archer: { position: [0.00, 0.20, 0.05], rotation: [-2.34, 0.00, 0.00], scale: 0.40 },  // Yay - doğru pozisyon
    archmage: { position: [0.00, 0.05, 0.15], rotation: [1.16, -0.04, -0.04], scale: 0.45 }, // Asa - doğru pozisyon
    bard: { position: [0.05, 0.10, 0.25], rotation: [1.16, 3.06, 0.16], scale: 0.55 },      // Harp - doğru pozisyon
    cleric: { position: [0.05, 0.10, 0.25], rotation: [1.16, 3.06, 0.26], scale: 0.50 },    // Topuz - doğru pozisyon
    martial_artist: { position: [0.00, 0.00, 0.00], rotation: [0.06, -3.14, -0.04], scale: 0.70 }, // Eldiven - doğru pozisyon

    reaper: { position: [0, -0.10, 0.30], rotation: [1.06, 3.06, 0.06], scale: 0.55 }, // Tırpan - doğru pozisyon
};

interface VoxelSpartanProps {
    position?: [number, number, number];
    rotation?: [number, number, number];
    isAttacking?: boolean;
    isMoving?: boolean;
    isSpinning?: boolean;
    isCastingSkill?: number | null; // 1-6 arası skill numarası, null = skill kullanılmıyor
    charClass?: CharacterClass;
    wingType?: WingItem | null;
    petType?: PetItem | null;        // Normal pet
    mountType?: PetItem | null;      // Mount (speed) pet - ikinci slot
    weaponItem?: Item | null;
    armorItem?: Item | null;
    helmetItem?: Item | null;
    pantsItem?: Item | null;
    bootsItem?: Item | null;         // Çizme
    necklaceItem?: Item | null;
    earringItem?: Item | null;
    castEffect?: string | null;
    skinId?: string | null;
    costumeId?: string | null; // Equipped costume set ID
    showDebug?: boolean;
    debugOffsets?: {
        headY: number;
        bodyY: number;
        armY: number;
        legY: number;
        scale: number;
    };
}

// --- VOXEL WINGS COMPONENT (PIXEL ART STYLE) ---
// F = Feather (main color), T = Tip (darker), B = Bone/Edge (outline)
// L = Light highlight, S = Shadow, G = Gold/Glow
// Larger patterns for detailed pixel-art look (20-25 rows)

const WING_PATTERNS: Record<string, string[]> = {
    // ═══════════════════════════════════════════════════════════════
    // ANGEL WINGS - Pure white with golden tips
    // ═══════════════════════════════════════════════════════════════
    angel: [
        "...............BB...............",
        ".............BBLLB..............",
        "............BLFFFB..............",
        "...........BLFFFFB..............",
        "..........BLFFFFFB..............",
        ".........BLFFFFFFB..............",
        "........BLFFFFFFFLB.............",
        ".......BLFFFFFFFFFLB............",
        "......BLFFFFFFFFFFFLB...........",
        ".....BLFFFFFFFFFFFFLB..........",
        "....BLFFFFFFFFFFFFFLB..........",
        "...BLFFFFFFFFFFFFFFFLB.........",
        "..BLFFFFFFFFFFFFFFFFFLB........",
        ".BLFFFFFFFFFFFFFFFFFFFB........",
        "BLFFFFFFFFFFFFFFFFFFFFTB.......",
        "BLFFFFFFFFFFFFFFFFFFTTTB.......",
        ".BFFFFFFFFFFFFFFFFFFFFTTB......",
        "..BFFFFFFFFFFFFFFFFFFFFTB......",
        "...BFFFFFFFFFFFFFFFFFFTB.......",
        "....BFFFFFFFFFFFFFFFFTB........",
        ".....BFFFFFFFFFFFFFFTB.........",
        "......BFFFFFFFFFFFFTTB.........",
        ".......BFFFFFFFFFFTTB..........",
        "........BFFFFFFFFTTTB..........",
        ".........BFFFFFFTTTB...........",
        "..........BFFFFTTTB............",
        "...........BFFTTTTB............",
        "............BTTTTTB............",
        ".............BTTTTB............",
        "..............BTTB.............",
    ],

    // ═══════════════════════════════════════════════════════════════
    // DEMON WINGS - Dark bat-like with red membrane
    // ═══════════════════════════════════════════════════════════════
    demon: [
        "B.........................B.....",
        "BB.......................BB.....",
        "BBB.....................BBB.....",
        "BMMB...................BMMB.....",
        "BMMMB.................BMMMB.....",
        "BMMMMB...............BMMMMB.....",
        "BMMMMMB.............BMMMMMB.....",
        "BMMMMMMB...........BMMMMMMB.....",
        "BMMMMMMMB.........BMMMMMMMB.....",
        "BMMMMMMMMB.......BMMMMMMMMB.....",
        "BMMMMMMMMMB.....BMMMMMMMMMB.....",
        "BMMMMMMMMMMB...BMMMMMMMMMMB.....",
        "BMMMMMMMMMMMB.BMMMMMMMMMMMB.....",
        "BMMMMMMMMMMMMBBMMMMMMMMMMMMB....",
        "BMMMMMMMMMMMMMMMMMMMMMMMMMMMB...",
        ".BMMMMMMMMMMMMMMMMMMMMMMMMMMB...",
        "..BMMMMMMMMMMMMMMMMMMMMMMMMB....",
        "...BMMMMMMMMMMMMMMMMMMMMMMB.....",
        "....BMMMMMMMMMMMMMMMMMMMMB......",
        ".....BMMMMMMMMMMMMMMMMMMB.......",
        "......BMMMMMMMMMMMMMMMMB........",
        ".......BMMMMMMMMMMMMMB.........",
        "........BMMMMMMMMMMB...........",
        ".........BMMMMMMMB.............",
        "..........BMMMMB...............",
        "...........BMMB................",
        "............BB.................",
    ],

    // ═══════════════════════════════════════════════════════════════
    // DRAGON WINGS - Leathery with spikes and fire colors
    // ═══════════════════════════════════════════════════════════════
    dragon: [
        "B...............................B",
        "SB.............................BS",
        "SSB...........................BSS",
        "SSSB.........................BSSS",
        "BSSSB.......................BSSSB",
        "BBSSSB.....................BSSSBB",
        "BMBSSSB...................BSSSBMB",
        "BMMBSSSB.................BSSSBMMB",
        "BMMMBSSSB...............BSSSBMMMB",
        "BMMMMMSSSB.............BSSSMMMMMMB",
        "BMMMMMMSSSB...........BSSSMMMMMMMB",
        "BMMMMMMMSSSB.........BSSSMMMMMMMMMB",
        "BMMMMMMMMSSSB.......BSSSMMMMMMMMMMMB",
        "BMMMMMMMMMSSSB.....BSSSMMMMMMMMMMMMMB",
        "BMMMMMMMMMMMSSSB..BSSSMMMMMMMMMMMMMMB",
        ".BMMMMMMMMMMMMSSBSSSMMMMMMMMMMMMMMB.",
        "..BMMMMMMMMMMMMMSSSMMMMMMMMMMMMMMB..",
        "...BMMMMMMMMMMMMMMMMMMMMMMMMMMMB....",
        "....BMMMMMMMMMMMMMMMMMMMMMMMMB......",
        ".....BMMMMMMMMMMMMMMMMMMMMB.........",
        "......BMMMMMMMMMMMMMMMMB............",
        ".......BMMMMMMMMMMMMMB..............",
        "........BMMMMMMMMMMB................",
        ".........BMMMMMMMB..................",
        "..........BMMMMB....................",
        "...........BMMB.....................",
        "............BB......................",
    ],

    // ═══════════════════════════════════════════════════════════════
    // FAIRY WINGS - Butterfly-style, colorful with sparkle
    // ═══════════════════════════════════════════════════════════════
    fairy: [
        "............GGGG.................",
        "..........GGLLLLGG...............",
        ".........GLLFFFFFLG..............",
        "........GLFFFFFFFLG..............",
        ".......GLFFFFFFFFFG..............",
        "......GLFFFFFFFFFFFLG............",
        ".....GLFFFFFFFFFFFFLG............",
        "....GLFFFFFFFFFFFFFFFFG..........",
        "...GLFFFFFFFFFFFFFFFFFFLG........",
        "..GLFFFFFFFFFFFFFFFFFFFFLG.......",
        ".GLFFFFFFFFFFFFFFFFFFFFFLLG......",
        "GLFFFFFFFFFFFFFFFFFFFFFFFLLLG....",
        "GLFFFFFFFFFFFFFFFFFFFFFFFFFLG....",
        ".GLFFFFFFFFFFFFFFFFFFFFFFFLG.....",
        "..GFFFFFFFFFFFFFFFFFFFFFLG.......",
        "...GLFFFFFFFFFFFFFFFFFLG.........",
        ".....GLFFFFFFFFFFFFFFFG..........",
        ".......GLFFFFFFFFFFFG............",
        ".........GLFFFFFFFFG.............",
        "...........GFFFFFFG..............",
        ".............GFFFG...............",
        "...............GG................",
    ],

    // ═══════════════════════════════════════════════════════════════
    // VOID WINGS - Dark purple with energy particles
    // ═══════════════════════════════════════════════════════════════
    void: [
        "S.......S.......S.......S........",
        ".S.....S.S.....S.S.....S.........",
        "..S...S...S...S...S...S..........",
        "...S.S.....S.S.....S.S...........",
        "....S.......S.......S............",
        "...SBBBBBBBBBBBBBBBBBS...........",
        "..SBIIIIIIIIIIIIIIIIIBS..........",
        ".SBIIIIIIIIIIIIIIIIIIIIBS........",
        "SBIIIIIIIIIIIIIIIIIIIIIIIBS......",
        "SBIIIIIIIIIIIIIIIIIIIIIIIIIBS....",
        "SBIIIIIIIIIIIIIIIIIIIIIIIIIIBS...",
        "SBIIIIIIIIIIIIIIIIIIIIIIIIIIIBS..",
        ".SBIIIIIIIIIIIIIIIIIIIIIIIIIIBS..",
        "..SBIIIIIIIIIIIIIIIIIIIIIIIBS....",
        "...SBIIIIIIIIIIIIIIIIIIIIBS......",
        "....SBIIIIIIIIIIIIIIIIIBS........",
        ".....SBIIIIIIIIIIIIIIBS..........",
        "......SBIIIIIIIIIIIBS............",
        ".......SBIIIIIIIIBS..............",
        "........SBIIIIIBS................",
        ".........SBIIBS..................",
        "..........SBS....................",
        "...........S.....................",
    ],

    // ═══════════════════════════════════════════════════════════════
    // SERAPH WINGS - Divine golden with white feathers
    // ═══════════════════════════════════════════════════════════════
    seraph: [
        "...............GG...............",
        ".............GGLLGG.............",
        "............GLWWWWLG............",
        "...........GLWWWWWWLG...........",
        "..........GLWWWWWWWWLG..........",
        ".........GLWWWWWWWWWWLG.........",
        "........GLWWWWWWWWWWWWLG........",
        ".......GLWWWWWWWWWWWWWWLG.......",
        "......GLWWWWWWWWWWWWWWWWLG......",
        ".....GLWWWWWWWWWWWWWWWWWWLG.....",
        "....GLWWWWWWWWWWWWWWWWWWWWLG....",
        "...GLWWWWWWWWWWWWWWWWWWWWWWLG...",
        "..GLWWWWWWWWWWWWWWWWWWWWWWWWLG..",
        ".GLWWWWWWWWWWWWWWWWWWWWWWWWWWLG.",
        "GLWWWWWWWWWWWWWWWWWWWWWWWWWWWWLG",
        "GLWWWWWWWWWWWWWWWWWWWWWWWWWWWGLG",
        ".GLWWWWWWWWWWWWWWWWWWWWWWWWWGLG.",
        "..GLWWWWWWWWWWWWWWWWWWWWWWGLG...",
        "...GLWWWWWWWWWWWWWWWWWWWGLG.....",
        "....GLWWWWWWWWWWWWWWWWGLG.......",
        ".....GLWWWWWWWWWWWWWGLG.........",
        "......GLWWWWWWWWWWGLG...........",
        ".......GLWWWWWWWGLG.............",
        "........GLWWWWGLG...............",
        ".........GLWGLG.................",
        "..........GGLG..................",
        "...........GG...................",
    ]
};

const AdvancedWings: React.FC<{ type: WingItem['type']; color: string; isMoving: boolean; modelPath?: string; offsetY?: number }> = ({ type, color, isMoving, modelPath, offsetY }) => {
    // If GLTF model exists (e.g. for butterfly custom models), use it
    if (modelPath) {
        return <GltfWings modelPath={modelPath} color={color} isMoving={isMoving} />;
    }

    const rightWingRef = useRef<THREE.Group>(null);
    const leftWingRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        const t = state.clock.elapsedTime;
        const flapSpeed = isMoving ? 6 : 1.5;
        const flapAmp = isMoving ? 0.5 : 0.15;

        if (rightWingRef.current) {
            rightWingRef.current.rotation.y = -0.3 + Math.sin(t * flapSpeed) * flapAmp;
            rightWingRef.current.rotation.z = Math.cos(t * flapSpeed) * 0.08;
        }
        if (leftWingRef.current) {
            leftWingRef.current.rotation.y = 0.3 - Math.sin(t * flapSpeed) * flapAmp;
            leftWingRef.current.rotation.z = -Math.cos(t * flapSpeed) * 0.08;
        }
    });

    // Wing colors
    const mainColor = color;
    const darkColor = new THREE.Color(color).multiplyScalar(0.6).getHexString();
    const lightColor = new THREE.Color(color).multiplyScalar(1.4).getHexString();

    // Get secondary color for hybrid wings
    const getSecondaryColor = () => {
        if (type === 'angel_demon') return '#991b1b';
        if (type === 'demon') return '#7f1d1d';
        if (type === 'dragon') return '#ea580c';
        if (type === 'void') return '#4c1d95';
        return `#${darkColor}`;
    };
    const secondaryColor = getSecondaryColor();

    // NEW BEAUTIFUL WING DESIGN - Layered feathers
    const WingShape = ({ side }: { side: 'left' | 'right' }) => {
        const isRight = side === 'right';
        const xDir = isRight ? 1 : -1;

        return (
            <group rotation={[0, isRight ? -0.4 : 0.4, 0]}>
                {/* PRIMARY FEATHERS - Large outer feathers */}
                {[0, 1, 2, 3, 4].map((i) => {
                    const angle = (i * 0.25) - 0.5;
                    const length = 0.7 - (i * 0.08);
                    const width = 0.15 - (i * 0.02);
                    const xPos = (0.2 + i * 0.12) * xDir;
                    const yPos = 0.3 - (i * 0.12);

                    return (
                        <group key={`primary-${i}`} position={[xPos, yPos, 0]} rotation={[0, 0, isRight ? angle : -angle]}>
                            {/* Main feather blade */}
                            <mesh>
                                <boxGeometry args={[width, length, 0.02]} />
                                <meshStandardMaterial
                                    color={mainColor}
                                    emissive={mainColor}
                                    emissiveIntensity={0.4 - (i * 0.05)}
                                    roughness={0.3}
                                    metalness={0.1}
                                />
                            </mesh>
                            {/* Feather highlight */}
                            <mesh position={[0, length * 0.3, 0.01]}>
                                <boxGeometry args={[width * 0.6, length * 0.4, 0.01]} />
                                <meshStandardMaterial
                                    color={`#${lightColor}`}
                                    emissive={`#${lightColor}`}
                                    emissiveIntensity={0.6}
                                    transparent
                                    opacity={0.7}
                                />
                            </mesh>
                        </group>
                    );
                })}

                {/* SECONDARY FEATHERS - Inner layer */}
                {[0, 1, 2, 3].map((i) => {
                    const angle = (i * 0.2) - 0.3;
                    const length = 0.5 - (i * 0.06);
                    const width = 0.12 - (i * 0.015);
                    const xPos = (0.1 + i * 0.08) * xDir;
                    const yPos = 0.1 - (i * 0.08);

                    return (
                        <mesh
                            key={`secondary-${i}`}
                            position={[xPos, yPos, -0.05]}
                            rotation={[0, 0, isRight ? angle : -angle]}
                        >
                            <boxGeometry args={[width, length, 0.02]} />
                            <meshStandardMaterial
                                color={secondaryColor}
                                emissive={secondaryColor}
                                emissiveIntensity={0.2}
                                roughness={0.5}
                            />
                        </mesh>
                    );
                })}

                {/* TERTIARY FEATHERS - Smallest inner feathers */}
                {[0, 1, 2].map((i) => {
                    const angle = (i * 0.15) - 0.15;
                    const length = 0.35 - (i * 0.05);
                    const width = 0.08;
                    const xPos = (0.05 + i * 0.05) * xDir;
                    const yPos = -0.05 - (i * 0.06);

                    return (
                        <mesh
                            key={`tertiary-${i}`}
                            position={[xPos, yPos, -0.08]}
                            rotation={[0, 0, isRight ? angle : -angle]}
                        >
                            <boxGeometry args={[width, length, 0.015]} />
                            <meshStandardMaterial
                                color={`#${darkColor}`}
                                roughness={0.6}
                            />
                        </mesh>
                    );
                })}

                {/* WING BASE - Connection point */}
                <mesh position={[0, 0, -0.02]}>
                    <boxGeometry args={[0.15, 0.25, 0.08]} />
                    <meshStandardMaterial
                        color={secondaryColor}
                        roughness={0.4}
                        metalness={0.3}
                    />
                </mesh>
            </group>
        );
    };

    // Wing position: On the BACK, larger scale
    const wingY = offsetY !== undefined ? offsetY : 0.5;

    return (
        <group position={[0, wingY, -0.3]} scale={[1.6, 1.6, 1.6]}>
            {/* Right Wing */}
            <group ref={rightWingRef}>
                <WingShape side="right" />
            </group>

            {/* Left Wing */}
            <group ref={leftWingRef}>
                <WingShape side="left" />
            </group>

            {/* Center connection glow */}
            <pointLight position={[0, 0, 0.1]} color={mainColor} intensity={1.5} distance={1.2} />

            {/* Sparkle effect when moving */}
            {isMoving && <Sparkles count={15} scale={1.5} size={5} speed={1} opacity={0.6} color={mainColor} />}
        </group>
    );
};

// --- GLTF WINGS FOR BUTTERFLY ETC ---
const GltfWings: React.FC<{ modelPath: string; color: string; isMoving: boolean }> = ({ modelPath, color, isMoving }) => {
    const { scene } = useGLTF(modelPath);
    const groupRef = useRef<THREE.Group>(null);

    const clonedScene = useMemo(() => {
        const s = scene.clone();
        s.traverse((child: any) => {
            if (child.isMesh) {
                child.castShadow = true;
                if (child.material) {
                    const mat = child.material.clone();
                    mat.emissive = new THREE.Color(color);
                    mat.emissiveIntensity = 0.3;
                    child.material = mat;
                }
            }
        });
        return s;
    }, [scene, color]);

    useFrame((state) => {
        if (groupRef.current) {
            const t = state.clock.elapsedTime;
            const flapSpeed = isMoving ? 8 : 3;
            const flapAmp = isMoving ? 0.15 : 0.05;

            // Sırtına takılı olduğu için hafif bir süzülme/çırpma efekti (Rotasyonel)
            // Z ekseninde hafifçe öne arkaya gidip gelme (çırpma benzeri)
            // Kanatların uçlarını (primitive scale ile) simüle edebiliriz ama basit rotasyon yeterli.

            // Hafif yukarı aşağı (Hover)
            groupRef.current.position.y = 0.1 + Math.sin(t * flapSpeed) * 0.02;

            // Hafif rotasyon (Çırpma hissi) - X ekseninde hafif eğilip kalkma
            groupRef.current.rotation.x = Math.PI + Math.sin(t * flapSpeed) * flapAmp;
        }
    });

    return (
        // Sırtın tam ortasına denk gelecek pozisyon
        <group ref={groupRef} position={[0, 0.1, -0.15]} scale={[0.8, 0.8, 0.8]} rotation={[0, Math.PI, 0]}>
            <primitive object={clonedScene} />
            <Sparkles count={8} scale={0.8} size={2} speed={0.4} opacity={0.5} color={color} />
        </group>
    );
};

// ============================================
// MAIN VOXEL SPARTAN COMPONENT
// Minecraft-style blocky character with weapon attached to hand
// --- HELPER COMPONENT FOR HAT ---
const CostumeHat = ({ modelPath }: { modelPath: string }) => {
    const { scene } = useGLTF(modelPath);
    const cloned = useMemo(() => scene.clone(), [scene]);
    return <primitive object={cloned} />;
};

// --- HELPER COMPONENT FOR BODY MATERIAL ---
const CostumeBodyMaterial = ({ texturePath, baseColor }: { texturePath: string, baseColor: string }) => {
    // Falls back to baseColor if texture fails loads (or blank)
    // Note: useTexture should ideally be handled with Suspense or preload.
    // For safety, we use a simple texture load.
    const texture = useTexture(texturePath);

    // Texture ayarları
    texture.flipY = false;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.magFilter = THREE.NearestFilter; // Pixel art look

    return <meshStandardMaterial map={texture} color="#ffffff" />;
};

// ============================================
export const VoxelSpartan: React.FC<VoxelSpartanProps> = (props) => {
    const groupRef = useRef<THREE.Group>(null);
    const rightArmRef = useRef<THREE.Group>(null);
    const leftArmRef = useRef<THREE.Group>(null);
    const rightLegRef = useRef<THREE.Group>(null);
    const leftLegRef = useRef<THREE.Group>(null);
    const bodyRef = useRef<THREE.Group>(null);

    // SAFETY: Ensure charClass is always valid
    const charClass = props.charClass && CLASS_APPEARANCE[props.charClass] ? props.charClass : 'warrior';
    const appearance = CLASS_APPEARANCE[charClass] || CLASS_APPEARANCE['warrior'];
    const weaponHold = WEAPON_HOLD[charClass] || WEAPON_HOLD['warrior'];

    // Voxel Character Part Offsets (Minecraft-like proportions)
    const offsets = props.debugOffsets || {
        headY: 1.45,
        bodyY: 0.83,
        armY: 1.12,
        legY: 0.10,
        scale: 1.30
    };

    // COSTUME SYSTEM: Check if a costume set is equipped and get its assets
    const equippedCostume = useMemo(() => {
        if (!props.costumeId) return null;
        return COSTUME_SETS.find(c => c.id === props.costumeId) || null;
    }, [props.costumeId]);

    // Get costume-specific weapon for this class, or fall back to default
    const costumeWeaponPath = equippedCostume?.weapons?.[charClass] || null;

    // Class color for effects (MUST be defined before weapon clone)
    const classColor = CLASS_COLORS[charClass] || '#ffffff';

    // Load weapon model - COSTUME OVERRIDE or DEFAULT: Always fallback to warrior weapon
    const weaponPath = costumeWeaponPath || WEAPON_MAP[charClass] || WEAPON_MAP['warrior'];
    const { scene: weaponScene } = useGLTF(weaponPath);

    // Clone and prepare weapon
    const clonedWeapon = useMemo(() => {
        const w = weaponScene.clone();

        // Center the model so pivot is in the middle
        const box = new THREE.Box3().setFromObject(w);
        const center = box.getCenter(new THREE.Vector3());
        w.position.sub(center);

        w.traverse((child) => {
            if ((child as any).isMesh) {
                const mesh = child as THREE.Mesh;
                mesh.castShadow = true;
                mesh.receiveShadow = true;

                if (mesh.material) {
                    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
                    mats.forEach((mat: any) => {
                        if (mat.map) {
                            mat.map.flipY = false;
                            mat.map.colorSpace = THREE.SRGBColorSpace;
                        }
                        mat.transparent = true;
                        mat.alphaTest = 0.1;
                        mat.side = THREE.DoubleSide;

                        // +7 ve üzeri silahlar için AMPUL GİBİ PARLAMA (Warrior hariç)
                        const weaponPlus = props.weaponItem?.plus || 0;
                        if (weaponPlus >= 7 && charClass !== 'warrior') {
                            mat.emissive = new THREE.Color(classColor);
                            mat.emissiveIntensity = weaponPlus >= 10 ? 2.5 : weaponPlus >= 9 ? 2.0 : 1.5;
                        }

                        mat.needsUpdate = true;
                    });
                }
            }
        });
        return w;
    }, [weaponScene, props.weaponItem?.plus, charClass, classColor]);

    // Debug offsets (use props if provided, otherwise defaults)
    // MUST be defined before useFrame so it can be used in animations
    // Kullanıcının ayarladığı kalıcı karakter pozisyon değerleri


    // Animation loop
    useFrame((state) => {
        const t = state.clock.elapsedTime;

        // === SKILL CASTING ANIMATION (Priority) ===
        if (props.isCastingSkill) {
            const skillNum = props.isCastingSkill;
            const castSpeed = 12;

            // Sınıfa göre farklı skill animasyonları
            if (charClass === 'warrior' || charClass === 'arctic_knight') {
                // Savaşçı tipi: Güçlü kılıç/mızrak sallama
                if (skillNum === 1 || skillNum === 2) {
                    // Overhead slam - yukarıdan aşağı güçlü vuruş
                    if (rightArmRef.current) {
                        rightArmRef.current.rotation.x = -Math.PI / 2 + Math.sin(t * castSpeed) * 0.8;
                        rightArmRef.current.rotation.z = Math.sin(t * castSpeed * 0.5) * 0.3;
                    }
                } else if (skillNum === 3 || skillNum === 4) {
                    // Wide slash - geniş yatay kesme (YÖN DEĞİŞTİRMEZ)
                    if (rightArmRef.current) {
                        rightArmRef.current.rotation.x = -0.3;
                        rightArmRef.current.rotation.z = Math.sin(t * castSpeed * 1.5) * 0.8; // Geniş yatay hareket
                    }
                    if (leftArmRef.current) {
                        leftArmRef.current.rotation.x = -0.2;
                        leftArmRef.current.rotation.z = -Math.sin(t * castSpeed * 1.5) * 0.4; // Denge için karşı hareket
                    }
                } else {
                    // Thrust - ileri doğru bıçaklama
                    if (rightArmRef.current) {
                        rightArmRef.current.rotation.x = -Math.PI / 3 - Math.abs(Math.sin(t * castSpeed)) * 0.5;
                        rightArmRef.current.rotation.z = 0.1;
                    }
                }
            } else if (charClass === 'archmage' || charClass === 'cleric' || charClass === 'bard') {
                // Büyücü tipi: Asa kaldırma ve enerji yayma
                if (rightArmRef.current) {
                    rightArmRef.current.rotation.x = -Math.PI / 3 - Math.abs(Math.sin(t * castSpeed * 0.5)) * 0.4;
                    rightArmRef.current.rotation.z = Math.sin(t * castSpeed * 2) * 0.1;
                }
                if (leftArmRef.current) {
                    leftArmRef.current.rotation.x = -Math.PI / 4;
                    leftArmRef.current.rotation.z = -0.3 + Math.sin(t * castSpeed) * 0.2;
                }
                // Body sway
                if (bodyRef.current) {
                    bodyRef.current.position.y = offsets.bodyY + Math.sin(t * castSpeed * 0.5) * 0.03;
                }
            } else if (charClass === 'archer') {
                // Okçu: Yay çekme ve bırakma
                if (rightArmRef.current) {
                    rightArmRef.current.rotation.x = -0.2 + Math.sin(t * castSpeed) * 0.3;
                    rightArmRef.current.rotation.z = 0.5;
                }
                if (leftArmRef.current) {
                    leftArmRef.current.rotation.x = -0.3 - Math.abs(Math.sin(t * castSpeed)) * 0.4;
                    leftArmRef.current.rotation.z = -0.3;
                }
            } else if (charClass === 'martial_artist') {
                // Dövüşçü: Hızlı yumruk/tekme kombinasyonu (YÖN DEĞİŞTİRMEZ)
                const combo = skillNum % 3;
                if (combo === 1) {
                    // Punch combo - iki kolla yumruk
                    if (rightArmRef.current) {
                        rightArmRef.current.rotation.x = -Math.PI / 2 + Math.sin(t * castSpeed * 1.5) * 0.5;
                    }
                    if (leftArmRef.current) {
                        leftArmRef.current.rotation.x = -Math.PI / 2 + Math.sin(t * castSpeed * 1.5 + Math.PI) * 0.5;
                    }
                } else if (combo === 2) {
                    // High kick - yüksek tekme
                    if (rightLegRef.current) {
                        rightLegRef.current.rotation.x = -Math.PI / 3 + Math.sin(t * castSpeed) * 0.4;
                    }
                } else {
                    // Double punch - çift yumruk ileri (YÖN DEĞİŞTİRMEZ)
                    if (rightArmRef.current) {
                        rightArmRef.current.rotation.x = -Math.PI / 2 - Math.abs(Math.sin(t * castSpeed)) * 0.3;
                    }
                    if (leftArmRef.current) {
                        leftArmRef.current.rotation.x = -Math.PI / 2 - Math.abs(Math.sin(t * castSpeed + 0.5)) * 0.3;
                    }
                    if (rightLegRef.current) {
                        rightLegRef.current.rotation.x = -0.3; // Hafif stance
                    }
                }
            } else if (charClass === 'reaper') {
                // Reaper: Tırpan sallama ve gölge hareketi
                if (rightArmRef.current) {
                    rightArmRef.current.rotation.x = -Math.PI / 2 + Math.sin(t * castSpeed * 0.8) * 0.7;
                    rightArmRef.current.rotation.z = Math.sin(t * castSpeed * 0.4) * 0.4;
                }
                // Eerie body tilt (küçük, yön bozmaz)
                if (bodyRef.current) {
                    bodyRef.current.rotation.z = Math.sin(t * 2) * 0.05;
                }
            }
        } else if (props.isMoving) {
            // Walking animation - natural arm and leg swing
            const walkSpeed = 6;
            const armSwing = 0.6;
            const legSwing = 0.5;

            if (rightArmRef.current) {
                rightArmRef.current.rotation.x = Math.sin(t * walkSpeed) * armSwing;
            }
            if (leftArmRef.current) {
                leftArmRef.current.rotation.x = -Math.sin(t * walkSpeed) * armSwing;
            }
            if (rightLegRef.current) {
                rightLegRef.current.rotation.x = -Math.sin(t * walkSpeed) * legSwing;
            }
            if (leftLegRef.current) {
                leftLegRef.current.rotation.x = Math.sin(t * walkSpeed) * legSwing;
            }
            // Slight body bob
            if (bodyRef.current) {
                bodyRef.current.position.y = offsets.bodyY + Math.abs(Math.sin(t * walkSpeed * 2)) * 0.02;
            }
        } else if (props.isAttacking) {
            // Attack animation - swing weapon arm
            const attackSpeed = 10;
            if (rightArmRef.current) {
                rightArmRef.current.rotation.x = -Math.PI / 3 + Math.sin(t * attackSpeed) * 0.6;
                rightArmRef.current.rotation.z = 0.2;
            }
        } else if (props.isSpinning) {
            // Spinning/casting animation
            if (groupRef.current) {
                groupRef.current.rotation.y += 0.15;
            }
        } else {
            // Idle animation - gentle breathing/sway
            const idleSpeed = 1.5;
            const idleAmp = 0.03;

            if (rightArmRef.current) {
                rightArmRef.current.rotation.x = Math.sin(t * idleSpeed) * idleAmp;
                rightArmRef.current.rotation.z = 0.08;
            }
            if (leftArmRef.current) {
                leftArmRef.current.rotation.x = Math.sin(t * idleSpeed + Math.PI) * idleAmp;
                leftArmRef.current.rotation.z = -0.08;
            }
            if (rightLegRef.current) {
                rightLegRef.current.rotation.x = 0;
            }
            if (leftLegRef.current) {
                leftLegRef.current.rotation.x = 0;
            }
            if (bodyRef.current) {
                bodyRef.current.position.y = offsets.bodyY + Math.sin(t * idleSpeed) * 0.01;
                bodyRef.current.rotation.z = 0; // Reset rotation
            }
        }
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // GLOW SİSTEMİ - AYRILMIŞ
    // 1. Silah Glow: +7 ve üstü silahta sadece silahın etrafında parlaklık
    // 2. Karakter Aura: TÜM itemler +7 ve üstü olunca karakter etrafında aura
    // ═══════════════════════════════════════════════════════════════════════════

    const weaponPlus = props.weaponItem?.plus || 0;
    const armorPlus = props.armorItem?.plus || 0;
    const helmetPlus = props.helmetItem?.plus || 0;
    const pantsPlus = props.pantsItem?.plus || 0;
    const bootsPlus = props.bootsItem?.plus || 0;
    const necklacePlus = props.necklaceItem?.plus || 0;

    // Silah +7 ve üstü mü? Silahın etrafında glow
    const hasWeaponGlow = weaponPlus >= 7;
    const weaponGlowLevel = weaponPlus;

    // Full Set +7+ kontrolü: Tüm itemler takılı VE hepsi +7 veya üstü
    const hasFullSet = Boolean(
        props.weaponItem &&
        props.armorItem &&
        props.helmetItem &&
        props.pantsItem &&
        props.bootsItem
    );
    const isFullSetPlus7 = hasFullSet &&
        weaponPlus >= 7 &&
        armorPlus >= 7 &&
        helmetPlus >= 7 &&
        pantsPlus >= 7 &&
        bootsPlus >= 7;

    // ARMOR-ONLY glow check (for body/arms/legs emissive - weapon not required)
    const hasArmorSet = (
        props.armorItem &&
        props.helmetItem &&
        props.pantsItem &&
        props.bootsItem
    );
    const isArmorSetPlus7 = hasArmorSet &&
        armorPlus >= 7 &&
        helmetPlus >= 7 &&
        pantsPlus >= 7 &&
        bootsPlus >= 7;

    // Minimum set level for aura intensity
    const minSetLevel = isFullSetPlus7 ? Math.min(weaponPlus, armorPlus, helmetPlus, pantsPlus, bootsPlus) : 0;
    const minArmorLevel = isArmorSetPlus7 ? Math.min(armorPlus, helmetPlus, pantsPlus, bootsPlus) : 0;

    // Character aura only with full set +7+
    const characterGlowEffect = useMemo(() => isFullSetPlus7 ? getGlowEffect(minSetLevel, charClass) : null, [isFullSetPlus7, minSetLevel, charClass]);

    // Trail için ref
    const trailTargetRef = useRef<THREE.Mesh>(null);

    // MOUNT SYSTEM - I tuşu ile bineğe binme
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() === 'i' && props.mountType) {
                setIsMounted(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [props.mountType]);

    // Mounted olunca karakter pozisyonu offset
    const characterYOffset = isMounted ? 0.8 : 0; // Binek üstünde 0.8 birim yukarı

    // Block dimensions (Minecraft Steve proportions)
    const headSize = 0.5;
    const bodyWidth = 0.5;
    const bodyHeight = 0.75;
    const bodyDepth = 0.25;
    const armWidth = 0.25;
    const armHeight = 0.7;
    const legWidth = 0.25;
    const legHeight = 0.75;

    return (
        <group
            ref={groupRef}
            position={props.position}
            rotation={props.rotation}
            dispose={null}
            scale={[offsets.scale, offsets.scale, offsets.scale]}
        >
            {/* Character wrapper - Y offset when mounted */}
            <group position={[0, characterYOffset, 0]}>
                {/* =========== HEAD =========== */}
                <group position={[0, offsets.headY, 0]}>
                    {/* Main head block */}
                    <mesh castShadow receiveShadow>
                        <boxGeometry args={[headSize, headSize, headSize]} />
                        <meshStandardMaterial color={appearance.skin} />
                    </mesh>

                    {/* Hat (Costume) Or Hair (Default) */}
                    {equippedCostume?.hat ? (
                        // Load Hat Model
                        <group position={[0, 0.35, 0]} scale={[0.6, 0.6, 0.6]}>
                            <CostumeHat modelPath={equippedCostume.hat} />
                        </group>
                    ) : (
                        <>
                            {/* Hair (top and back) */}
                            <mesh position={[0, 0.15, -0.05]} castShadow>
                                <boxGeometry args={[headSize + 0.02, 0.22, headSize - 0.05]} />
                                <meshStandardMaterial color={appearance.hair} />
                            </mesh>
                            {/* Hair bangs (front) */}
                            <mesh position={[0, 0.22, 0.2]} castShadow>
                                <boxGeometry args={[headSize - 0.05, 0.1, 0.1]} />
                                <meshStandardMaterial color={appearance.hair} />
                            </mesh>
                            {/* Side hair */}
                            <mesh position={[0.22, 0.05, 0]} castShadow>
                                <boxGeometry args={[0.08, 0.35, 0.4]} />
                                <meshStandardMaterial color={appearance.hair} />
                            </mesh>
                            <mesh position={[-0.22, 0.05, 0]} castShadow>
                                <boxGeometry args={[0.08, 0.35, 0.4]} />
                                <meshStandardMaterial color={appearance.hair} />
                            </mesh>
                        </>
                    )}

                    {/* Face features */}
                    {/* Eyes */}
                    <mesh position={[-0.1, 0.02, 0.251]}>
                        <boxGeometry args={[0.1, 0.08, 0.01]} />
                        <meshStandardMaterial color="#ffffff" />
                    </mesh>
                    <mesh position={[0.1, 0.02, 0.251]}>
                        <boxGeometry args={[0.1, 0.08, 0.01]} />
                        <meshStandardMaterial color="#ffffff" />
                    </mesh>
                    {/* Pupils */}
                    <mesh position={[-0.1, 0.02, 0.26]}>
                        <boxGeometry args={[0.05, 0.05, 0.01]} />
                        <meshStandardMaterial color={appearance.eyes} />
                    </mesh>
                    <mesh position={[0.1, 0.02, 0.26]}>
                        <boxGeometry args={[0.05, 0.05, 0.01]} />
                        <meshStandardMaterial color={appearance.eyes} />
                    </mesh>
                    {/* Mouth */}
                    <mesh position={[0, -0.12, 0.251]}>
                        <boxGeometry args={[0.15, 0.04, 0.01]} />
                        <meshStandardMaterial color="#8b4513" />
                    </mesh>
                </group>

                {/* =========== BODY =========== */}
                <group ref={bodyRef} position={[0, offsets.bodyY, 0]}>
                    {/* Main torso */}
                    {/* Gövde Mesh'i - Zırh Texture Desteği */}
                    <mesh castShadow receiveShadow>
                        <boxGeometry args={[bodyWidth, bodyHeight, bodyDepth]} />
                        {equippedCostume?.armorTexture1 ? (
                            // Zırh Texture'ı varsa kullan
                            <CostumeBodyMaterial texturePath={equippedCostume.armorTexture1} baseColor={equippedCostume.color || appearance.body} />
                        ) : (
                            // Yoksa kostüm rengini veya normal rengi kullan - +7 ARMOR set varsa AMPUL GİBİ PARLA
                            <meshStandardMaterial
                                color={equippedCostume?.color || appearance.body}
                                emissive={isArmorSetPlus7 ? classColor : '#000000'}
                                emissiveIntensity={isArmorSetPlus7 ? (minArmorLevel >= 10 ? 1.5 : minArmorLevel >= 9 ? 1.2 : 0.8) : 0}
                            />
                        )}
                    </mesh>
                    {/* Body accent (belt/trim) */}
                    <mesh position={[0, -0.32, 0.01]} castShadow>
                        <boxGeometry args={[bodyWidth + 0.02, 0.1, bodyDepth]} />
                        <meshStandardMaterial color={appearance.bodyAccent} />
                    </mesh>
                    {/* Collar */}
                    <mesh position={[0, 0.35, 0.05]} castShadow>
                        <boxGeometry args={[0.35, 0.08, 0.15]} />
                        <meshStandardMaterial color={equippedCostume?.color || appearance.bodyAccent} />
                    </mesh>

                    {/* ═══════════ ARMOR GLOW (+7+ set) ═══════════ */}
                    {/* Zırh/elbise +7 ve üstü olduğunda gövde etrafında parlaklık */}
                    {isArmorSetPlus7 && (
                        <group position={[0, 0, 0]}>
                            {/* Gövde etrafında parlayan partiküller */}
                            <Sparkles
                                count={Math.min(minArmorLevel * 3, 30)}
                                scale={[0.8, 1.2, 0.5]}
                                size={minArmorLevel >= 10 ? 6 : minArmorLevel >= 9 ? 4 : 3}
                                speed={1.5}
                                opacity={0.7}
                                color={classColor}
                            />
                            {/* Işık efekti */}
                            <pointLight
                                position={[0, 0, 0.3]}
                                distance={1.5}
                                intensity={minArmorLevel >= 10 ? 2 : 1}
                                color={classColor}
                            />
                        </group>
                    )}
                </group>

                {/* =========== RIGHT ARM (with weapon) =========== */}
                <group
                    ref={rightArmRef}
                    position={[bodyWidth / 2 + armWidth / 2, offsets.armY, 0]}
                >
                    {/* Upper arm (shoulder pivot) */}
                    <mesh position={[0, -armHeight / 2 + 0.1, 0]} castShadow receiveShadow>
                        <boxGeometry args={[armWidth, armHeight, armWidth]} />
                        <meshStandardMaterial
                            color={equippedCostume?.color || appearance.body}
                            emissive={isArmorSetPlus7 ? classColor : '#000000'}
                            emissiveIntensity={isArmorSetPlus7 ? (minArmorLevel >= 10 ? 1.5 : minArmorLevel >= 9 ? 1.2 : 0.8) : 0}
                        />
                    </mesh>
                    {/* Hand */}
                    <mesh position={[0, -armHeight + 0.05, 0]} castShadow>
                        <boxGeometry args={[armWidth - 0.02, 0.15, armWidth - 0.02]} />
                        <meshStandardMaterial color={appearance.skin} />
                    </mesh>

                    {/* ======= WEAPON ATTACHED TO HAND ======= */}
                    <group position={[0, -armHeight + 0.05, 0]}>
                        <group
                            position={weaponHold.position}
                            rotation={weaponHold.rotation}
                            scale={[weaponHold.scale, weaponHold.scale, weaponHold.scale]}
                        >
                            <primitive object={clonedWeapon} />

                            {/* ═══════════ WEAPON GLOW (+7 ve üstü) ═══════════ */}
                            {/* +7 ve üstü silahta: Sınıf renginde parlaklık + aşağı partiküller */}
                            {/* SABİT KONUM - DEĞİŞTİRME! */}
                            {hasWeaponGlow && (
                                <group position={[0, 0, 0]}>
                                    {/* Silah etrafında saran parlaklık (Resim 2'deki gibi) */}
                                    <Sparkles
                                        count={Math.min(weaponGlowLevel * 4, 40)}
                                        scale={1.2}
                                        size={weaponGlowLevel >= 10 ? 8 : weaponGlowLevel >= 9 ? 6 : 4}
                                        speed={2}
                                        opacity={0.9}
                                        color={classColor} // SINIF RENGİ (Warrior = Kırmızı)
                                    />

                                    {/* Silah üzerinde parlayan ışık */}
                                    <pointLight
                                        position={[0, 0.5, 0]}
                                        distance={2}
                                        intensity={weaponGlowLevel >= 10 ? 3 : weaponGlowLevel >= 9 ? 2 : 1.5}
                                        color={classColor}
                                    />

                                    {/* +7 ve üstü: AŞAĞI DÖKÜLEN PARTİKÜLLER (Her zaman) */}
                                    <Sparkles
                                        count={weaponGlowLevel >= 10 ? 25 : weaponGlowLevel >= 9 ? 18 : 12}
                                        scale={[0.4, 2.5, 0.4]} // Aşağı uzanan şekil
                                        size={3}
                                        speed={0.5}
                                        opacity={0.7}
                                        color={classColor} // Sınıf rengi (Kırmızı, Mavi, Mor vb.)
                                    />

                                    {/* +10 ve üstü: Ekstra yoğun efekt */}
                                    {weaponGlowLevel >= 10 && (
                                        <Sparkles
                                            count={20}
                                            scale={[0.3, 3, 0.3]}
                                            size={4}
                                            speed={0.3}
                                            opacity={0.5}
                                            color={classColor}
                                        />
                                    )}
                                </group>
                            )}
                        </group>
                    </group>
                </group>

                {/* =========== LEFT ARM =========== */}
                <group
                    ref={leftArmRef}
                    position={[-(bodyWidth / 2 + armWidth / 2), offsets.armY, 0]}
                >
                    <mesh position={[0, -armHeight / 2 + 0.1, 0]} castShadow receiveShadow>
                        <boxGeometry args={[armWidth, armHeight, armWidth]} />
                        <meshStandardMaterial
                            color={equippedCostume?.color || appearance.body}
                            emissive={isFullSetPlus7 ? classColor : '#000000'}
                            emissiveIntensity={isFullSetPlus7 ? (minSetLevel >= 10 ? 1.5 : minSetLevel >= 9 ? 1.2 : 0.8) : 0}
                        />
                    </mesh>
                    {/* Hand */}
                    <mesh position={[0, -armHeight + 0.05, 0]} castShadow>
                        <boxGeometry args={[armWidth - 0.02, 0.15, armWidth - 0.02]} />
                        <meshStandardMaterial color={appearance.skin} />
                    </mesh>

                    {/* ======= LEFT HAND WEAPON (for martial_artist) ======= */}
                    {charClass === 'martial_artist' && (
                        <group position={[0, -armHeight + 0.05, 0]}>
                            <group
                                position={[-weaponHold.position[0], weaponHold.position[1], weaponHold.position[2]]}
                                rotation={[weaponHold.rotation[0], -weaponHold.rotation[1], -weaponHold.rotation[2]]}
                                scale={[weaponHold.scale, weaponHold.scale, weaponHold.scale]}
                            >
                                <primitive object={clonedWeapon.clone()} />
                            </group>
                        </group>
                    )}
                </group>

                {/* =========== RIGHT LEG =========== */}
                <group
                    ref={rightLegRef}
                    position={[legWidth / 2 + 0.01, offsets.legY, 0]}
                >
                    <mesh position={[0, 0, 0]} castShadow receiveShadow>
                        <boxGeometry args={[legWidth, legHeight, legWidth]} />
                        <meshStandardMaterial
                            color={equippedCostume?.color || appearance.legs}
                            emissive={isFullSetPlus7 ? classColor : '#000000'}
                            emissiveIntensity={isFullSetPlus7 ? (minSetLevel >= 10 ? 1.5 : minSetLevel >= 9 ? 1.2 : 0.8) : 0}
                        />
                    </mesh>
                    {/* Foot highlight */}
                    <mesh position={[0, -legHeight / 2 + 0.05, 0.02]} castShadow>
                        <boxGeometry args={[legWidth, 0.1, legWidth + 0.05]} />
                        <meshStandardMaterial color={appearance.bodyAccent} />
                    </mesh>
                </group>

                {/* =========== LEFT LEG =========== */}
                <group
                    ref={leftLegRef}
                    position={[-(legWidth / 2 + 0.01), offsets.legY, 0]}
                >
                    <mesh position={[0, 0, 0]} castShadow receiveShadow>
                        <boxGeometry args={[legWidth, legHeight, legWidth]} />
                        <meshStandardMaterial
                            color={equippedCostume?.color || appearance.legs}
                            emissive={isFullSetPlus7 ? classColor : '#000000'}
                            emissiveIntensity={isFullSetPlus7 ? (minSetLevel >= 10 ? 1.5 : minSetLevel >= 9 ? 1.2 : 0.8) : 0}
                        />
                    </mesh>
                    {/* Foot highlight */}
                    <mesh position={[0, -legHeight / 2 + 0.05, 0.02]} castShadow>
                        <boxGeometry args={[legWidth, 0.1, legWidth + 0.05]} />
                        <meshStandardMaterial color={appearance.bodyAccent} />
                    </mesh>
                </group>

                {/* =========== FULL SET +7+ CHARACTER AURA =========== */}
                {/* Only shows when ALL equipped items are +7 or higher */}
                {characterGlowEffect && (
                    <group position={[0, 1.0, 0]}>
                        {/* Character Aura Particles */}
                        <Sparkles
                            count={characterGlowEffect.particleCount}
                            scale={characterGlowEffect.level >= 10 ? 2.5 : 2}
                            size={characterGlowEffect.level >= 10 ? 12 : characterGlowEffect.level >= 9 ? 8 : 5}
                            speed={characterGlowEffect.intensity}
                            opacity={0.85}
                            color={characterGlowEffect.color}
                        />

                        {/* Secondary Class Particles (+10+) */}
                        {characterGlowEffect.level >= 10 && (
                            <Sparkles
                                count={20}
                                scale={1.5}
                                size={4}
                                speed={2}
                                opacity={0.6}
                                color={classColor}
                            />
                        )}

                        {/* Point Light - Aura Glow */}
                        <pointLight
                            position={[0.4, 0.3, 0.3]}
                            distance={characterGlowEffect.level >= 12 ? 6 : 4}
                            intensity={characterGlowEffect.intensity * 4}
                            color={characterGlowEffect.color}
                        />

                        {/* +9+ Golden Ring */}
                        {characterGlowEffect.level >= 9 && (
                            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
                                <ringGeometry args={[0.6, 0.7, 32]} />
                                <meshBasicMaterial
                                    color={characterGlowEffect.color}
                                    transparent
                                    opacity={0.4}
                                    side={THREE.DoubleSide}
                                />
                            </mesh>
                        )}

                        {/* +11+ Second Ring */}
                        {characterGlowEffect.level >= 11 && (
                            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.6, 0]}>
                                <ringGeometry args={[0.8, 0.9, 32]} />
                                <meshBasicMaterial
                                    color={classColor}
                                    transparent
                                    opacity={0.3}
                                    side={THREE.DoubleSide}
                                />
                            </mesh>
                        )}

                        {/* +12 Ground Effect */}
                        {characterGlowEffect.level >= 12 && (
                            <group position={[0, -1.2, 0]}>
                                <mesh rotation={[Math.PI / 2, 0, 0]}>
                                    <circleGeometry args={[1.2, 32]} />
                                    <meshBasicMaterial
                                        color={characterGlowEffect.color}
                                        transparent
                                        opacity={0.2}
                                    />
                                </mesh>
                                <Sparkles
                                    count={30}
                                    scale={2}
                                    size={3}
                                    speed={0.5}
                                    opacity={0.4}
                                    color={classColor}
                                />
                            </group>
                        )}
                    </group>
                )}

                {/* Trail Effect REMOVED as per user request */}

                {/* =========== WINGS =========== */}
                {/* Costume wing takes priority, then regular wingType */}
                {(equippedCostume?.wing || props.wingType) && (
                    <group position={[0, 0.75, -0.15]}> {/* Düzeltilmiş Sırt Pozisyonu */}
                        {equippedCostume?.wing ? (
                            <GltfWings
                                modelPath={equippedCostume.wing}
                                color={equippedCostume.color || '#10b981'}
                                isMoving={props.isMoving || false}
                            />
                        ) : props.wingType ? (
                            <AdvancedWings
                                type={props.wingType.type}
                                color={props.wingType.color}
                                isMoving={props.isMoving || false}
                                modelPath={(props.wingType as any).modelPath}
                                offsetY={offsets.bodyY}
                            />
                        ) : null}
                    </group>
                )}

                {/* =========== NORMAL PET (SOL TARAF - SİLAHIN KARŞISI) =========== */}
                {props.petType && (
                    <group position={[-0.9, 0, 0.4]} rotation={[0, 0, 0]}> {/* Sol taraf, düz karşıya bakıyor */}
                        <DynamicPet
                            modelPath={(props.petType as any).modelPath || '/models/pets/cubee-jungle.gltf'}
                            color={props.petType.color}
                            scale={0.7}
                        />
                    </group>
                )}

                {/* =========== MOUNT PET (SAĞ TARAF) =========== */}
                {props.mountType && (
                    <group position={[0.9, 0, 0.4]} rotation={[0, 0, 0]}> {/* Sağ taraf, düz karşıya bakıyor */}
                        <DynamicPet
                            modelPath={(props.mountType as any).modelPath || '/models/pets/cubee-plains.gltf'}
                            color={props.mountType.color}
                            scale={0.75}
                        />
                        {/* Mount için hız göstergesi */}
                        {props.mountType.bonusSpeed && (
                            <Sparkles
                                count={5}
                                scale={0.5}
                                size={2}
                                speed={2}
                                opacity={0.4}
                                color="#22c55e"
                            />
                        )}
                    </group>
                )}
            </group> {/* Close character wrapper */}
        </group>
    );
};

export default VoxelSpartan;
