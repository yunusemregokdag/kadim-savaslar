import React, { useRef, useMemo } from 'react';
import { useGLTF, Sparkles } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CharacterClass, Item, WingItem, PetItem } from '../types';
import { DynamicPet } from './DynamicPet';

// --- WEAPON REGISTRY ---
const WEAPON_MAP: Record<CharacterClass, string> = {
    warrior: '/models/items/weapons/warrior/warrior_sword_shiny.gltf',
    arctic_knight: '/models/items/weapons/arctic_knight/frigid_lance_arctic_knight.gltf',
    gale_glaive: '/models/items/weapons/gale_glaive/gale_glaive_windreaver_ancient.gltf',
    archer: '/models/items/weapons/archer/archer_bow_shiny.gltf',
    archmage: '/models/items/weapons/archmage/archmage_staff_shiny.gltf',
    bard: '/models/items/weapons/bard/bard_harp_shiny.gltf',
    cleric: '/models/items/weapons/cleric/cleric_mace_shiny.gltf',
    martial_artist: '/models/items/weapons/martial_artist/martial_artist_gauntlet.gltf',
    monk: '/models/items/weapons/monk/monk_gauntlet_shiny.gltf',
    reaper: '/models/items/weapons/reaper/scythe_reaper_shiny.gltf',
};

// --- CLASS COLORS (Minecraft-style) ---
const CLASS_COLORS: Record<CharacterClass, { body: string; legs: string; head: string }> = {
    warrior: { body: '#00b7eb', legs: '#8b2252', head: '#2d2d2d' },       // Cyan body, maroon legs
    arctic_knight: { body: '#87ceeb', legs: '#4169e1', head: '#e0ffff' }, // Ice blue
    gale_glaive: { body: '#98fb98', legs: '#228b22', head: '#2d2d2d' },   // Green wind
    archer: { body: '#daa520', legs: '#8b4513', head: '#2d2d2d' },        // Brown/gold
    archmage: { body: '#9932cc', legs: '#4b0082', head: '#2d2d2d' },      // Purple magic
    bard: { body: '#ff69b4', legs: '#c71585', head: '#2d2d2d' },          // Pink
    cleric: { body: '#ffd700', legs: '#f0f0f0', head: '#2d2d2d' },        // Gold/white
    martial_artist: { body: '#ff4500', legs: '#8b0000', head: '#2d2d2d' },// Red
    monk: { body: '#ffa500', legs: '#8b4513', head: '#2d2d2d' },          // Orange
    reaper: { body: '#1a1a1a', legs: '#0d0d0d', head: '#1a1a1a' },        // Dark
};

// --- WEAPON ADJUSTMENTS ---
const WEAPON_ADJUSTMENTS: Record<CharacterClass, { rotation: [number, number, number], position: [number, number, number], scale: number }> = {
    warrior: { rotation: [0, 0, Math.PI], position: [0, -0.4, 0], scale: 0.4 },
    arctic_knight: { rotation: [0, 0, Math.PI], position: [0, -0.5, 0], scale: 0.5 },
    gale_glaive: { rotation: [0, 0, Math.PI], position: [0, -0.5, 0], scale: 0.45 },
    archer: { rotation: [Math.PI / 2, 0, 0], position: [0, -0.3, 0.1], scale: 0.5 },
    archmage: { rotation: [0, 0, Math.PI], position: [0, -0.5, 0], scale: 0.45 },
    bard: { rotation: [0, Math.PI / 4, 0], position: [0, -0.2, 0.1], scale: 0.35 },
    cleric: { rotation: [0, 0, Math.PI], position: [0, -0.4, 0], scale: 0.4 },
    martial_artist: { rotation: [0, 0, 0], position: [0, -0.15, 0], scale: 0.3 },
    monk: { rotation: [0, 0, 0], position: [0, -0.15, 0], scale: 0.3 },
    reaper: { rotation: [0, 0, Math.PI * 0.8], position: [0, -0.6, 0], scale: 0.5 },
};

interface CodedVoxelCharacterProps {
    position?: [number, number, number];
    rotation?: [number, number, number];
    isAttacking?: boolean;
    isMoving?: boolean;
    isSpinning?: boolean;
    charClass?: CharacterClass;
    wingType?: WingItem | null;
    petType?: PetItem | null;
    weaponItem?: Item | null;
    skinId?: string | null;
}

// --- ADVANCED WINGS COMPONENT (BEAUTIFUL FEATHER DESIGN) ---
const AdvancedWings: React.FC<{ type: WingItem['type']; color: string; isMoving: boolean }> = ({ type, color, isMoving }) => {
    const rightWingRef = useRef<THREE.Group>(null);
    const leftWingRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        const t = state.clock.elapsedTime;
        const flapSpeed = isMoving ? 6 : 2;
        const flapAmp = isMoving ? 0.3 : 0.1;

        if (rightWingRef.current) {
            rightWingRef.current.rotation.z = 0.15 + Math.sin(t * flapSpeed) * flapAmp;
            rightWingRef.current.rotation.y = 0.3 + Math.sin(t * flapSpeed * 0.5) * 0.05;
        }
        if (leftWingRef.current) {
            leftWingRef.current.rotation.z = -0.15 - Math.sin(t * flapSpeed) * flapAmp;
            leftWingRef.current.rotation.y = -0.3 - Math.sin(t * flapSpeed * 0.5) * 0.05;
        }
    });

    // Feather component
    const Feather = ({ pos, rot, length, width, baseColor, tipColor, glowIntensity = 0.5 }: any) => (
        <group position={pos} rotation={rot}>
            <mesh castShadow>
                <cylinderGeometry args={[0.01, 0.005, length, 6]} />
                <meshStandardMaterial color={baseColor} emissive={tipColor} emissiveIntensity={glowIntensity * 0.3} />
            </mesh>
            <mesh position={[0, 0, 0.01]} castShadow>
                <planeGeometry args={[width, length * 0.9]} />
                <meshStandardMaterial color={baseColor} emissive={tipColor} emissiveIntensity={glowIntensity} side={THREE.DoubleSide} transparent opacity={0.85} />
            </mesh>
        </group>
    );

    // Get wing colors
    const getWingColors = () => {
        switch (type) {
            case 'angel': return { base: '#ffffff', tip: '#fef3c7', glow: '#ffd700', intensity: 0.6 };
            case 'fairy': return { base: '#e9d5ff', tip: '#c084fc', glow: '#a855f7', intensity: 0.7 };
            case 'seraph': return { base: '#fef3c7', tip: '#fbbf24', glow: '#f59e0b', intensity: 1.2 };
            case 'demon': return { base: '#1a1a1a', tip: '#7f1d1d', glow: '#dc2626', intensity: 0.5 };
            case 'dragon': return { base: '#0f172a', tip: '#1e3a5f', glow: '#3b82f6', intensity: 0.6 };
            case 'void': return { base: '#0a0a0a', tip: '#3b0764', glow: '#9333ea', intensity: 0.8 };
            default: return { base: color, tip: color, glow: color, intensity: 0.5 };
        }
    };

    const wingColors = getWingColors();
    const isFeatheredWing = type === 'angel' || type === 'fairy' || type === 'seraph';
    const isDemonWing = type === 'demon' || type === 'dragon' || type === 'void';

    return (
        <group position={[0, 1.8, 0.15]} scale={[1.4, 1.4, 1.4]}>
            <Sparkles count={16} scale={1.5} size={isMoving ? 5 : 3} speed={0.4} opacity={0.5} color={wingColors.glow} />
            <pointLight position={[0, 0.3, -0.2]} intensity={1} distance={2} color={wingColors.glow} />

            {/* FEATHERED WINGS */}
            {isFeatheredWing && (
                <>
                    <group ref={rightWingRef} position={[0.15, 0, 0]}>
                        {[0, 1, 2, 3, 4].map((i) => (
                            <Feather key={`r-p-${i}`} pos={[0.3 + i * 0.1, 0.2 - i * 0.08, 0]} rot={[0, 0, 0.5 + i * 0.15]} length={0.6 - i * 0.06} width={0.12} baseColor={wingColors.base} tipColor={wingColors.tip} glowIntensity={wingColors.intensity} />
                        ))}
                        {[0, 1, 2, 3].map((i) => (
                            <Feather key={`r-s-${i}`} pos={[0.22 + i * 0.08, -0.06 - i * 0.05, 0.01]} rot={[0, 0, 0.15 + i * 0.1]} length={0.45 - i * 0.05} width={0.1} baseColor={wingColors.base} tipColor={wingColors.tip} glowIntensity={wingColors.intensity * 0.8} />
                        ))}
                    </group>
                    <group ref={leftWingRef} position={[-0.15, 0, 0]}>
                        {[0, 1, 2, 3, 4].map((i) => (
                            <Feather key={`l-p-${i}`} pos={[-0.3 - i * 0.1, 0.2 - i * 0.08, 0]} rot={[0, 0, -0.5 - i * 0.15]} length={0.6 - i * 0.06} width={0.12} baseColor={wingColors.base} tipColor={wingColors.tip} glowIntensity={wingColors.intensity} />
                        ))}
                        {[0, 1, 2, 3].map((i) => (
                            <Feather key={`l-s-${i}`} pos={[-0.22 - i * 0.08, -0.06 - i * 0.05, 0.01]} rot={[0, 0, -0.15 - i * 0.1]} length={0.45 - i * 0.05} width={0.1} baseColor={wingColors.base} tipColor={wingColors.tip} glowIntensity={wingColors.intensity * 0.8} />
                        ))}
                    </group>
                </>
            )}

            {/* DEMON/DRAGON/VOID WINGS */}
            {isDemonWing && (
                <>
                    <group ref={rightWingRef} position={[0.12, 0, 0]}>
                        {[0, 1, 2].map((i) => (
                            <mesh key={`r-b-${i}`} position={[0.18 + i * 0.14, 0.12 - i * 0.1, 0]} rotation={[0, 0, 0.35 + i * 0.18]} castShadow>
                                <cylinderGeometry args={[0.018, 0.01, 0.5 - i * 0.1, 8]} />
                                <meshStandardMaterial color={wingColors.base} emissive={wingColors.glow} emissiveIntensity={wingColors.intensity} />
                            </mesh>
                        ))}
                        <mesh position={[0.35, 0, 0.01]} rotation={[0, 0, 0.25]} castShadow>
                            <planeGeometry args={[0.6, 0.5]} />
                            <meshStandardMaterial color={wingColors.tip} emissive={wingColors.glow} emissiveIntensity={wingColors.intensity * 0.6} side={THREE.DoubleSide} transparent opacity={0.65} />
                        </mesh>
                        <mesh position={[0.6, 0.25, 0]} rotation={[0, 0, 0.9]} castShadow>
                            <coneGeometry args={[0.025, 0.1, 6]} />
                            <meshStandardMaterial color={wingColors.base} emissive={wingColors.glow} emissiveIntensity={wingColors.intensity * 0.8} />
                        </mesh>
                    </group>
                    <group ref={leftWingRef} position={[-0.12, 0, 0]}>
                        {[0, 1, 2].map((i) => (
                            <mesh key={`l-b-${i}`} position={[-0.18 - i * 0.14, 0.12 - i * 0.1, 0]} rotation={[0, 0, -0.35 - i * 0.18]} castShadow>
                                <cylinderGeometry args={[0.018, 0.01, 0.5 - i * 0.1, 8]} />
                                <meshStandardMaterial color={wingColors.base} emissive={wingColors.glow} emissiveIntensity={wingColors.intensity} />
                            </mesh>
                        ))}
                        <mesh position={[-0.35, 0, 0.01]} rotation={[0, 0, -0.25]} castShadow>
                            <planeGeometry args={[0.6, 0.5]} />
                            <meshStandardMaterial color={wingColors.tip} emissive={wingColors.glow} emissiveIntensity={wingColors.intensity * 0.6} side={THREE.DoubleSide} transparent opacity={0.65} />
                        </mesh>
                        <mesh position={[-0.6, 0.25, 0]} rotation={[0, 0, -0.9]} castShadow>
                            <coneGeometry args={[0.025, 0.1, 6]} />
                            <meshStandardMaterial color={wingColors.base} emissive={wingColors.glow} emissiveIntensity={wingColors.intensity * 0.8} />
                        </mesh>
                    </group>
                </>
            )}

            {/* ANGEL/DEMON HYBRID */}
            {type === 'angel_demon' && (
                <>
                    <group ref={leftWingRef} position={[-0.15, 0, 0]}>
                        {[0, 1, 2, 3, 4].map((i) => (
                            <Feather key={`l-a-${i}`} pos={[-0.3 - i * 0.1, 0.2 - i * 0.08, 0]} rot={[0, 0, -0.5 - i * 0.15]} length={0.6 - i * 0.06} width={0.12} baseColor="#ffffff" tipColor="#fef3c7" glowIntensity={0.8} />
                        ))}
                        <Sparkles count={10} scale={0.9} size={4} speed={0.5} opacity={0.8} color="#ffd700" />
                    </group>
                    <group ref={rightWingRef} position={[0.12, 0, 0]}>
                        {[0, 1, 2].map((i) => (
                            <mesh key={`r-d-${i}`} position={[0.18 + i * 0.14, 0.12 - i * 0.1, 0]} rotation={[0, 0, 0.35 + i * 0.18]} castShadow>
                                <cylinderGeometry args={[0.018, 0.01, 0.5 - i * 0.1, 8]} />
                                <meshStandardMaterial color="#1a1a1a" emissive="#dc2626" emissiveIntensity={0.6} />
                            </mesh>
                        ))}
                        <mesh position={[0.35, 0, 0.01]} rotation={[0, 0, 0.25]} castShadow>
                            <planeGeometry args={[0.6, 0.5]} />
                            <meshStandardMaterial color="#2a0a0a" emissive="#991b1b" emissiveIntensity={0.5} side={THREE.DoubleSide} transparent opacity={0.7} />
                        </mesh>
                        <Sparkles count={10} scale={0.9} size={4} speed={0.5} opacity={0.8} color="#dc2626" />
                    </group>
                </>
            )}
        </group>
    );
};

export const CodedVoxelCharacter: React.FC<CodedVoxelCharacterProps> = (props) => {
    const groupRef = useRef<THREE.Group>(null);
    const rightArmRef = useRef<THREE.Group>(null);
    const leftArmRef = useRef<THREE.Group>(null);
    const rightLegRef = useRef<THREE.Group>(null);
    const leftLegRef = useRef<THREE.Group>(null);

    const charClass = props.charClass || 'warrior';
    const colors = CLASS_COLORS[charClass];

    // Load weapon model
    const weaponPath = WEAPON_MAP[charClass];
    const { scene: weaponScene } = useGLTF(weaponPath);

    // Clone and prepare weapon
    const clonedWeapon = useMemo(() => {
        const w = weaponScene.clone();
        w.traverse((child) => {
            if ((child as any).isMesh) {
                const mesh = child as THREE.Mesh;
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                if (mesh.material) {
                    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
                    materials.forEach((mat: any) => {
                        if (mat.map) {
                            mat.map.flipY = false;
                            mat.map.colorSpace = THREE.SRGBColorSpace;
                        }
                        mat.transparent = true;
                        mat.alphaTest = 0.1;
                        mat.side = THREE.DoubleSide;
                        mat.needsUpdate = true;
                    });
                }
            }
        });
        return w;
    }, [weaponScene]);

    // Animation loop
    useFrame((state) => {
        const t = state.clock.elapsedTime;

        if (props.isMoving) {
            // Walking animation
            const walkSpeed = 8;
            const walkAmp = 0.5;

            if (rightArmRef.current) {
                rightArmRef.current.rotation.x = Math.sin(t * walkSpeed) * walkAmp;
            }
            if (leftArmRef.current) {
                leftArmRef.current.rotation.x = -Math.sin(t * walkSpeed) * walkAmp;
            }
            if (rightLegRef.current) {
                rightLegRef.current.rotation.x = -Math.sin(t * walkSpeed) * walkAmp;
            }
            if (leftLegRef.current) {
                leftLegRef.current.rotation.x = Math.sin(t * walkSpeed) * walkAmp;
            }
        } else if (props.isAttacking) {
            // Attack animation - swing right arm
            const attackSpeed = 12;
            if (rightArmRef.current) {
                rightArmRef.current.rotation.x = -Math.PI / 2 + Math.sin(t * attackSpeed) * 0.8;
            }
        } else {
            // Idle animation - gentle sway
            const idleSpeed = 2;
            const idleAmp = 0.05;

            if (rightArmRef.current) {
                rightArmRef.current.rotation.x = Math.sin(t * idleSpeed) * idleAmp;
                rightArmRef.current.rotation.z = 0.1;
            }
            if (leftArmRef.current) {
                leftArmRef.current.rotation.x = Math.sin(t * idleSpeed + Math.PI) * idleAmp;
                leftArmRef.current.rotation.z = -0.1;
            }
            if (rightLegRef.current) {
                rightLegRef.current.rotation.x = 0;
            }
            if (leftLegRef.current) {
                leftLegRef.current.rotation.x = 0;
            }
        }
    });

    const weaponAdj = WEAPON_ADJUSTMENTS[charClass];
    const weaponPlus = props.weaponItem?.plus || 0;
    const hasHighEnhancement = weaponPlus >= 7;

    const getGlowColor = () => {
        if (weaponPlus >= 10) return '#ff00ff';
        if (weaponPlus >= 9) return '#ff4500';
        if (weaponPlus >= 8) return '#ffd700';
        if (weaponPlus >= 7) return '#00ffff';
        return '#ffffff';
    };

    // Skin color
    const skinColor = '#e0b090';

    return (
        <group
            ref={groupRef}
            position={props.position}
            rotation={props.rotation}
            dispose={null}
        >
            {/* === HEAD === */}
            <group position={[0, 2.1, 0]}>
                {/* Head cube */}
                <mesh castShadow>
                    <boxGeometry args={[0.5, 0.5, 0.5]} />
                    <meshStandardMaterial color={colors.head} />
                </mesh>
                {/* Face (front) */}
                <mesh position={[0, 0, 0.251]}>
                    <planeGeometry args={[0.5, 0.5]} />
                    <meshStandardMaterial color={skinColor} />
                </mesh>
                {/* Eyes */}
                <mesh position={[-0.1, 0.05, 0.26]}>
                    <boxGeometry args={[0.08, 0.08, 0.02]} />
                    <meshStandardMaterial color="#ffffff" />
                </mesh>
                <mesh position={[0.1, 0.05, 0.26]}>
                    <boxGeometry args={[0.08, 0.08, 0.02]} />
                    <meshStandardMaterial color="#ffffff" />
                </mesh>
                {/* Pupils */}
                <mesh position={[-0.1, 0.05, 0.27]}>
                    <boxGeometry args={[0.04, 0.04, 0.02]} />
                    <meshStandardMaterial color="#4a2c00" />
                </mesh>
                <mesh position={[0.1, 0.05, 0.27]}>
                    <boxGeometry args={[0.04, 0.04, 0.02]} />
                    <meshStandardMaterial color="#4a2c00" />
                </mesh>
            </group>

            {/* === BODY === */}
            <mesh position={[0, 1.4, 0]} castShadow>
                <boxGeometry args={[0.5, 0.75, 0.25]} />
                <meshStandardMaterial color={colors.body} />
            </mesh>

            {/* === RIGHT ARM (with weapon) === */}
            <group ref={rightArmRef} position={[0.375, 1.65, 0]}>
                {/* Upper arm pivot point at shoulder */}
                <mesh position={[0, -0.3, 0]} castShadow>
                    <boxGeometry args={[0.25, 0.6, 0.25]} />
                    <meshStandardMaterial color={colors.body} />
                </mesh>
                {/* Hand (skin colored) */}
                <mesh position={[0, -0.55, 0]} castShadow>
                    <boxGeometry args={[0.2, 0.15, 0.2]} />
                    <meshStandardMaterial color={skinColor} />
                </mesh>

                {/* === WEAPON attached to hand === */}
                <group position={[0, -0.6, 0]}>
                    <group
                        position={weaponAdj.position}
                        rotation={weaponAdj.rotation}
                        scale={[weaponAdj.scale, weaponAdj.scale, weaponAdj.scale]}
                    >
                        <primitive object={clonedWeapon} />
                    </group>
                </group>
            </group>

            {/* === LEFT ARM === */}
            <group ref={leftArmRef} position={[-0.375, 1.65, 0]}>
                <mesh position={[0, -0.3, 0]} castShadow>
                    <boxGeometry args={[0.25, 0.6, 0.25]} />
                    <meshStandardMaterial color={colors.body} />
                </mesh>
                {/* Hand */}
                <mesh position={[0, -0.55, 0]} castShadow>
                    <boxGeometry args={[0.2, 0.15, 0.2]} />
                    <meshStandardMaterial color={skinColor} />
                </mesh>
            </group>

            {/* === RIGHT LEG === */}
            <group ref={rightLegRef} position={[0.125, 0.75, 0]}>
                <mesh position={[0, -0.375, 0]} castShadow>
                    <boxGeometry args={[0.25, 0.75, 0.25]} />
                    <meshStandardMaterial color={colors.legs} />
                </mesh>
            </group>

            {/* === LEFT LEG === */}
            <group ref={leftLegRef} position={[-0.125, 0.75, 0]}>
                <mesh position={[0, -0.375, 0]} castShadow>
                    <boxGeometry args={[0.25, 0.75, 0.25]} />
                    <meshStandardMaterial color={colors.legs} />
                </mesh>
            </group>

            {/* Enhancement Glow Effect */}
            {hasHighEnhancement && (
                <group position={[0, 1.2, 0]}>
                    <Sparkles
                        count={weaponPlus >= 9 ? 50 : 30}
                        scale={1.5}
                        size={weaponPlus >= 9 ? 8 : 5}
                        speed={0.8}
                        opacity={0.9}
                        color={getGlowColor()}
                    />
                    <pointLight
                        position={[0.5, 0.5, 0]}
                        distance={3}
                        intensity={weaponPlus >= 9 ? 5 : 3}
                        color={getGlowColor()}
                    />
                </group>
            )}

            {/* Wings */}
            {props.wingType && (
                <AdvancedWings type={props.wingType.type} color={props.wingType.color} isMoving={props.isMoving || false} />
            )}

            {/* Pet */}
            {props.petType && (
                <group position={[0.8, 0.3, -0.8]}>
                    <DynamicPet modelPath={(props.petType as any).modelPath || '/models/pets/cubee-jungle.gltf'} color={props.petType.color} />
                </group>
            )}
        </group>
    );
};

export default CodedVoxelCharacter;
