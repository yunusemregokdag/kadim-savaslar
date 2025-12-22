import React, { useRef, useMemo } from 'react';
import { useGLTF, Sparkles, Trail } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CharacterClass, Item, WingItem, PetItem } from '../types';
import { DynamicPet } from './DynamicPet';
import { getGlowEffect, getClassParticleType, CLASS_COLORS, GlowEffect } from '../systems/GlowEffects';

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
    gale_glaive: {
        body: '#27ae60',       // Emerald green
        bodyAccent: '#1e8449', // Dark emerald
        legs: '#145a32',       // Forest green
        hair: '#4a4a4a',       // Grey hair
        skin: '#deb887',       // Tan skin
        eyes: '#27ae60',       // Green eyes
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
    monk: {
        body: '#e67e22',       // Orange monk robes
        bodyAccent: '#d35400', // Burnt orange
        legs: '#a04000',       // Brown-orange
        hair: '#bdc3c7',       // Shaved/grey
        skin: '#d2a679',       // Tan skin
        eyes: '#5d4037',       // Brown eyes
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
    gale_glaive: { position: [0.00, 0.00, 0.00], rotation: [1.26, 0.00, 0.06], scale: 0.75 }, // Mızrak - doğru pozisyon
    archer: { position: [0.00, 0.20, 0.05], rotation: [-2.34, 0.00, 0.00], scale: 0.40 },  // Yay - doğru pozisyon
    archmage: { position: [0.00, 0.05, 0.15], rotation: [1.16, -0.04, -0.04], scale: 0.45 }, // Asa - doğru pozisyon
    bard: { position: [0.05, 0.10, 0.25], rotation: [1.16, 3.06, 0.16], scale: 0.55 },      // Harp - doğru pozisyon
    cleric: { position: [0.05, 0.10, 0.25], rotation: [1.16, 3.06, 0.26], scale: 0.50 },    // Topuz - doğru pozisyon
    martial_artist: { position: [0.00, 0.00, 0.00], rotation: [0.06, -3.14, -0.04], scale: 0.70 }, // Eldiven - doğru pozisyon
    monk: { position: [0.05, 0.00, 0.00], rotation: [0.16, -3.14, -0.14], scale: 0.60 },    // Eldiven - doğru pozisyon
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
    petType?: PetItem | null;
    weaponItem?: Item | null;
    armorItem?: Item | null;
    helmetItem?: Item | null;
    pantsItem?: Item | null;
    necklaceItem?: Item | null;
    earringItem?: Item | null;
    castEffect?: string | null;
    skinId?: string | null;
    showDebug?: boolean; // Debug modunu aç/kapat
    debugOffsets?: {
        headY: number;
        bodyY: number;
        armY: number;
        legY: number;
        scale: number;
    };
}

// --- ADVANCED WINGS COMPONENT ---
const AdvancedWings: React.FC<{ type: WingItem['type']; color: string; isMoving: boolean; modelPath?: string }> = ({ type, color, isMoving, modelPath }) => {
    const rightWingRef = useRef<THREE.Group>(null);
    const leftWingRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        const t = state.clock.elapsedTime;
        const flapSpeed = isMoving ? 8 : 3;
        const flapAmp = isMoving ? 0.25 : 0.08;

        if (rightWingRef.current) {
            rightWingRef.current.rotation.z = 0.2 + Math.sin(t * flapSpeed) * flapAmp;
        }
        if (leftWingRef.current) {
            leftWingRef.current.rotation.z = -0.2 - Math.sin(t * flapSpeed) * flapAmp;
        }
    });

    const WingBone = ({ pos, rot, size, glow }: { pos: [number, number, number]; rot: [number, number, number]; size: [number, number, number]; glow?: boolean }) => (
        <mesh position={pos} rotation={rot} castShadow>
            <boxGeometry args={size} />
            <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={glow ? 1.2 : 0.4}
                toneMapped={false}
            />
        </mesh>
    );

    // If modelPath exists, use GLTF model (for butterfly wings etc.)
    if (modelPath) {
        return <GltfWings modelPath={modelPath} color={color} isMoving={isMoving} />;
    }

    return (
        <group position={[0, 0.5, -0.15]} scale={[1.4, 1.4, 1.4]}>
            <Sparkles count={12} scale={1.2} size={3} speed={0.5} opacity={0.6} color={color} />

            {/* Angel/Fairy/Seraph Wings */}
            {(type === 'angel' || type === 'fairy' || type === 'seraph') && (
                <>
                    <group ref={rightWingRef} position={[0.15, 0, 0]} rotation={[0, 0.5, 0.15]}>
                        <WingBone pos={[0.3, 0.1, 0]} rot={[0, 0, 0.2]} size={[0.6, 0.1, 0.03]} glow={type === 'seraph'} />
                        <WingBone pos={[0.5, 0.25, 0]} rot={[0, 0, 0.4]} size={[0.4, 0.08, 0.025]} glow={type === 'seraph'} />
                        <WingBone pos={[0.4, -0.05, 0]} rot={[0, 0, -0.1]} size={[0.5, 0.1, 0.03]} glow={type === 'seraph'} />
                    </group>
                    <group ref={leftWingRef} position={[-0.15, 0, 0]} rotation={[0, -0.5, -0.15]}>
                        <WingBone pos={[-0.3, 0.1, 0]} rot={[0, 0, -0.2]} size={[0.6, 0.1, 0.03]} glow={type === 'seraph'} />
                        <WingBone pos={[-0.5, 0.25, 0]} rot={[0, 0, -0.4]} size={[0.4, 0.08, 0.025]} glow={type === 'seraph'} />
                        <WingBone pos={[-0.4, -0.05, 0]} rot={[0, 0, 0.1]} size={[0.5, 0.1, 0.03]} glow={type === 'seraph'} />
                    </group>
                </>
            )}

            {/* Demon/Dragon/Void Wings */}
            {(type === 'demon' || type === 'dragon' || type === 'void') && (
                <>
                    <group ref={rightWingRef} position={[0.1, 0, 0]} rotation={[0, 0.4, 0.1]}>
                        <WingBone pos={[0.2, 0, 0]} rot={[0, 0, 0.25]} size={[0.4, 0.05, 0.025]} />
                        <WingBone pos={[0.45, 0.15, 0]} rot={[0, 0, 0.45]} size={[0.3, 0.04, 0.02]} />
                        <mesh position={[0.35, 0.05, 0.005]} rotation={[0, 0, 0.1]}>
                            <planeGeometry args={[0.5, 0.35]} />
                            <meshStandardMaterial
                                color={color}
                                emissive={color}
                                emissiveIntensity={0.3}
                                side={THREE.DoubleSide}
                                transparent
                                opacity={0.6}
                            />
                        </mesh>
                    </group>
                    <group ref={leftWingRef} position={[-0.1, 0, 0]} rotation={[0, -0.4, -0.1]}>
                        <WingBone pos={[-0.2, 0, 0]} rot={[0, 0, -0.25]} size={[0.4, 0.05, 0.025]} />
                        <WingBone pos={[-0.45, 0.15, 0]} rot={[0, 0, -0.45]} size={[0.3, 0.04, 0.02]} />
                        <mesh position={[-0.35, 0.05, 0.005]} rotation={[0, 0, -0.1]}>
                            <planeGeometry args={[0.5, 0.35]} />
                            <meshStandardMaterial
                                color={color}
                                emissive={color}
                                emissiveIntensity={0.3}
                                side={THREE.DoubleSide}
                                transparent
                                opacity={0.6}
                            />
                        </mesh>
                    </group>
                </>
            )}
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
            const flapSpeed = isMoving ? 5 : 2;
            const flapAmp = isMoving ? 0.1 : 0.05;
            // Gentle hovering motion
            groupRef.current.position.y = 0.5 + Math.sin(t * flapSpeed) * flapAmp;
        }
    });

    return (
        <group ref={groupRef} position={[0, 0.5, -0.2]} scale={[0.8, 0.8, 0.8]} rotation={[0, Math.PI, 0]}>
            <primitive object={clonedScene} />
            <Sparkles count={8} scale={0.8} size={2} speed={0.4} opacity={0.5} color={color} />
        </group>
    );
};

// ============================================
// MAIN VOXEL SPARTAN COMPONENT
// Minecraft-style blocky character with weapon attached to hand
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

    // Load weapon model - SAFETY: Always fallback to warrior weapon
    const weaponPath = WEAPON_MAP[charClass] || WEAPON_MAP['warrior'];
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
                        mat.needsUpdate = true;
                    });
                }
            }
        });
        return w;
    }, [weaponScene]);

    // Debug offsets (use props if provided, otherwise defaults)
    // MUST be defined before useFrame so it can be used in animations
    // Kullanıcının ayarladığı kalıcı karakter pozisyon değerleri
    const offsets = props.debugOffsets || {
        headY: 1.45,   // Kafa yüksekliği
        bodyY: 0.83,   // Gövde yüksekliği
        armY: 1.12,    // Kol (omuz) yüksekliği
        legY: 0.10,    // Bacak yüksekliği
        scale: 1.30,   // Karakter ölçeği
    };

    // Animation loop
    useFrame((state) => {
        const t = state.clock.elapsedTime;

        // === SKILL CASTING ANIMATION (Priority) ===
        if (props.isCastingSkill) {
            const skillNum = props.isCastingSkill;
            const castSpeed = 12;

            // Sınıfa göre farklı skill animasyonları
            if (charClass === 'warrior' || charClass === 'arctic_knight' || charClass === 'gale_glaive') {
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
            } else if (charClass === 'martial_artist' || charClass === 'monk') {
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

    // Enhancement glow - GlowEffects sisteminden al
    const weaponPlus = props.weaponItem?.plus || 0;
    const glowEffect = useMemo(() => getGlowEffect(weaponPlus, charClass), [weaponPlus, charClass]);
    const particleType = useMemo(() => getClassParticleType(charClass), [charClass]);
    const classColor = CLASS_COLORS[charClass] || '#ffffff';

    // Trail için ref
    const trailTargetRef = useRef<THREE.Mesh>(null);

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
            {/* =========== HEAD =========== */}
            <group position={[0, offsets.headY, 0]}>
                {/* Main head block */}
                <mesh castShadow receiveShadow>
                    <boxGeometry args={[headSize, headSize, headSize]} />
                    <meshStandardMaterial color={appearance.skin} />
                </mesh>

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
                <mesh castShadow receiveShadow>
                    <boxGeometry args={[bodyWidth, bodyHeight, bodyDepth]} />
                    <meshStandardMaterial color={appearance.body} />
                </mesh>
                {/* Body accent (belt/trim) */}
                <mesh position={[0, -0.32, 0.01]} castShadow>
                    <boxGeometry args={[bodyWidth + 0.02, 0.1, bodyDepth]} />
                    <meshStandardMaterial color={appearance.bodyAccent} />
                </mesh>
                {/* Collar */}
                <mesh position={[0, 0.35, 0.05]} castShadow>
                    <boxGeometry args={[0.35, 0.08, 0.15]} />
                    <meshStandardMaterial color={appearance.bodyAccent} />
                </mesh>
            </group>

            {/* =========== RIGHT ARM (with weapon) =========== */}
            <group
                ref={rightArmRef}
                position={[bodyWidth / 2 + armWidth / 2, offsets.armY, 0]}
            >
                {/* Upper arm (shoulder pivot) */}
                <mesh position={[0, -armHeight / 2 + 0.1, 0]} castShadow receiveShadow>
                    <boxGeometry args={[armWidth, armHeight, armWidth]} />
                    <meshStandardMaterial color={appearance.body} />
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
                    <meshStandardMaterial color={appearance.body} />
                </mesh>
                {/* Hand */}
                <mesh position={[0, -armHeight + 0.05, 0]} castShadow>
                    <boxGeometry args={[armWidth - 0.02, 0.15, armWidth - 0.02]} />
                    <meshStandardMaterial color={appearance.skin} />
                </mesh>

                {/* ======= LEFT HAND WEAPON (for martial_artist and monk) ======= */}
                {(charClass === 'martial_artist' || charClass === 'monk') && (
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
                    <meshStandardMaterial color={appearance.legs} />
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
                    <meshStandardMaterial color={appearance.legs} />
                </mesh>
                {/* Foot highlight */}
                <mesh position={[0, -legHeight / 2 + 0.05, 0.02]} castShadow>
                    <boxGeometry args={[legWidth, 0.1, legWidth + 0.05]} />
                    <meshStandardMaterial color={appearance.bodyAccent} />
                </mesh>
            </group>

            {/* =========== ENHANCEMENT GLOW SYSTEM =========== */}
            {glowEffect && (
                <group position={[0, 1.0, 0]}>
                    {/* Ana Parçacık Efekti */}
                    <Sparkles
                        count={glowEffect.particleCount}
                        scale={glowEffect.level >= 10 ? 2.5 : 2}
                        size={glowEffect.level >= 10 ? 12 : glowEffect.level >= 9 ? 8 : 5}
                        speed={glowEffect.intensity}
                        opacity={0.85}
                        color={glowEffect.color}
                    />

                    {/* Sınıfa Özel İkincil Parçacıklar (+10 ve üzeri) */}
                    {glowEffect.level >= 10 && (
                        <Sparkles
                            count={20}
                            scale={1.5}
                            size={4}
                            speed={2}
                            opacity={0.6}
                            color={classColor}
                        />
                    )}

                    {/* Point Light - Aura Işığı */}
                    <pointLight
                        position={[0.4, 0.3, 0.3]}
                        distance={glowEffect.level >= 12 ? 6 : 4}
                        intensity={glowEffect.intensity * 4}
                        color={glowEffect.color}
                    />

                    {/* +9 ve üzeri için altın halkası */}
                    {glowEffect.level >= 9 && (
                        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
                            <ringGeometry args={[0.6, 0.7, 32]} />
                            <meshBasicMaterial
                                color={glowEffect.color}
                                transparent
                                opacity={0.4}
                                side={THREE.DoubleSide}
                            />
                        </mesh>
                    )}

                    {/* +11 ve üzeri için ikinci halka */}
                    {glowEffect.level >= 11 && (
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

                    {/* +12 için zemin efekti */}
                    {glowEffect.level >= 12 && (
                        <group position={[0, -1.2, 0]}>
                            <mesh rotation={[Math.PI / 2, 0, 0]}>
                                <circleGeometry args={[1.2, 32]} />
                                <meshBasicMaterial
                                    color={glowEffect.color}
                                    transparent
                                    opacity={0.2}
                                />
                            </mesh>
                            {/* Zemin parçacıkları */}
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

            {/* Trail Efekti (+11 ve üzeri, hareket halindeyken) */}
            {glowEffect?.trailEnabled && props.isMoving && (
                <Trail
                    width={0.8}
                    length={6}
                    color={glowEffect.color}
                    attenuation={(t) => t * t}
                >
                    <mesh ref={trailTargetRef} visible={false}>
                        <sphereGeometry args={[0.1]} />
                    </mesh>
                </Trail>
            )}

            {/* =========== WINGS =========== */}
            {props.wingType && (
                <group position={[0, 1.0, -0.15]}>
                    <AdvancedWings
                        type={props.wingType.type}
                        color={props.wingType.color}
                        isMoving={props.isMoving || false}
                        modelPath={(props.wingType as any).modelPath}
                    />
                </group>
            )}

            {/* =========== PET =========== */}
            {props.petType && (
                <group position={[1.0, 0.3, -0.8]}>
                    <DynamicPet
                        modelPath={(props.petType as any).modelPath || '/models/pets/cubee-jungle.gltf'}
                        color={props.petType.color}
                    />
                </group>
            )}
        </group>
    );
};

export default VoxelSpartan;
