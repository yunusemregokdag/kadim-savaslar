// ═══════════════════════════════════════════════════════════════════════════
// VOXEL TERRAIN - Kadim Savaşlar
// Minecraft Legends tarzı voxel/pixel harita elemanları
// ═══════════════════════════════════════════════════════════════════════════

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ═══════════════════════════════════════════════════════════════════════════
// 🌿 PIXEL GRASS - Rastgele çim parçacıkları
// ═══════════════════════════════════════════════════════════════════════════
export interface PixelGrassProps {
    count?: number;
    radius?: number;
    centerPosition?: [number, number, number];
    minHeight?: number;
    maxHeight?: number;
    colors?: string[];
}

export const PixelGrass: React.FC<PixelGrassProps> = ({
    count = 500,
    radius = 50,
    centerPosition = [0, 0, 0],
    minHeight = 0.1,
    maxHeight = 0.4,
    colors = ['#22c55e', '#16a34a', '#15803d', '#166534', '#4ade80', '#86efac']
}) => {
    const grassData = useMemo(() => {
        return Array.from({ length: count }).map(() => ({
            x: centerPosition[0] + (Math.random() - 0.5) * radius * 2,
            z: centerPosition[2] + (Math.random() - 0.5) * radius * 2,
            height: minHeight + Math.random() * (maxHeight - minHeight),
            width: 0.03 + Math.random() * 0.04,
            color: colors[Math.floor(Math.random() * colors.length)],
            rotation: Math.random() * Math.PI,
            swayOffset: Math.random() * Math.PI * 2,
        }));
    }, [count, radius, centerPosition, minHeight, maxHeight, colors]);

    const groupRef = useRef<THREE.Group>(null);

    // Çim sallanma animasyonu
    useFrame(({ clock }) => {
        if (!groupRef.current) return;
        const time = clock.getElapsedTime();

        groupRef.current.children.forEach((child, i) => {
            if (child instanceof THREE.Mesh) {
                const data = grassData[i];
                if (data) {
                    child.rotation.x = Math.sin(time * 2 + data.swayOffset) * 0.1;
                }
            }
        });
    });

    return (
        <group ref={groupRef}>
            {grassData.map((grass, i) => (
                <mesh
                    key={i}
                    position={[grass.x, grass.height / 2, grass.z]}
                    rotation={[0, grass.rotation, 0]}
                >
                    <boxGeometry args={[grass.width, grass.height, grass.width]} />
                    <meshBasicMaterial color={grass.color} />
                </mesh>
            ))}
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 🧱 TERRAIN BLOCKS - Toprak/kaya blokları
// ═══════════════════════════════════════════════════════════════════════════
export interface TerrainBlocksProps {
    count?: number;
    radius?: number;
    centerPosition?: [number, number, number];
    blockSize?: number;
    maxHeight?: number;
    type?: 'grass' | 'dirt' | 'stone' | 'sand' | 'snow' | 'lava';
}

const BLOCK_COLORS: Record<string, { top: string; side: string; bottom: string }> = {
    grass: { top: '#4ade80', side: '#854d0e', bottom: '#713f12' },
    dirt: { top: '#854d0e', side: '#78350f', bottom: '#713f12' },
    stone: { top: '#6b7280', side: '#4b5563', bottom: '#374151' },
    sand: { top: '#fcd34d', side: '#fbbf24', bottom: '#f59e0b' },
    snow: { top: '#f0f9ff', side: '#e0f2fe', bottom: '#bae6fd' },
    lava: { top: '#f97316', side: '#ea580c', bottom: '#c2410c' },
};

export const TerrainBlocks: React.FC<TerrainBlocksProps> = ({
    count = 30,
    radius = 40,
    centerPosition = [0, 0, 0],
    blockSize = 1,
    maxHeight = 3,
    type = 'grass'
}) => {
    const colors = BLOCK_COLORS[type] || BLOCK_COLORS.grass;

    const blocks = useMemo(() => {
        return Array.from({ length: count }).map(() => {
            const layers = Math.floor(Math.random() * maxHeight) + 1;
            return {
                x: centerPosition[0] + (Math.random() - 0.5) * radius * 2,
                z: centerPosition[2] + (Math.random() - 0.5) * radius * 2,
                layers,
                size: blockSize * (0.8 + Math.random() * 0.4),
            };
        });
    }, [count, radius, centerPosition, blockSize, maxHeight]);

    return (
        <group>
            {blocks.map((block, i) => (
                <group key={i} position={[block.x, 0, block.z]}>
                    {Array.from({ length: block.layers }).map((_, layer) => (
                        <mesh
                            key={layer}
                            position={[0, layer * block.size + block.size / 2, 0]}
                        >
                            <boxGeometry args={[block.size, block.size, block.size]} />
                            <meshStandardMaterial
                                color={layer === block.layers - 1 ? colors.top : colors.side}
                                roughness={0.9}
                            />
                        </mesh>
                    ))}
                </group>
            ))}
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 🌲 VOXEL TREES - Basit voxel ağaçlar
// ═══════════════════════════════════════════════════════════════════════════
export interface VoxelTreesProps {
    count?: number;
    radius?: number;
    centerPosition?: [number, number, number];
    treeType?: 'oak' | 'pine' | 'birch' | 'cherry' | 'dead';
}

const TREE_COLORS: Record<string, { trunk: string; leaves: string[] }> = {
    oak: { trunk: '#78350f', leaves: ['#22c55e', '#16a34a', '#15803d'] },
    pine: { trunk: '#713f12', leaves: ['#14532d', '#166534', '#15803d'] },
    birch: { trunk: '#fafafa', leaves: ['#4ade80', '#86efac', '#bbf7d0'] },
    cherry: { trunk: '#854d0e', leaves: ['#f472b6', '#ec4899', '#db2777'] },
    dead: { trunk: '#57534e', leaves: [] },
};

export const VoxelTrees: React.FC<VoxelTreesProps> = ({
    count = 15,
    radius = 50,
    centerPosition = [0, 0, 0],
    treeType = 'oak'
}) => {
    const colors = TREE_COLORS[treeType] || TREE_COLORS.oak;

    const trees = useMemo(() => {
        return Array.from({ length: count }).map(() => ({
            x: centerPosition[0] + (Math.random() - 0.5) * radius * 2,
            z: centerPosition[2] + (Math.random() - 0.5) * radius * 2,
            trunkHeight: 2 + Math.floor(Math.random() * 3),
            leavesSize: 2 + Math.floor(Math.random() * 2),
            rotation: Math.random() * Math.PI * 2,
        }));
    }, [count, radius, centerPosition]);

    return (
        <group>
            {trees.map((tree, i) => (
                <group key={i} position={[tree.x, 0, tree.z]} rotation={[0, tree.rotation, 0]}>
                    {/* Trunk */}
                    {Array.from({ length: tree.trunkHeight }).map((_, h) => (
                        <mesh key={`trunk-${h}`} position={[0, h * 0.5 + 0.25, 0]}>
                            <boxGeometry args={[0.4, 0.5, 0.4]} />
                            <meshStandardMaterial color={colors.trunk} roughness={0.9} />
                        </mesh>
                    ))}

                    {/* Leaves (if not dead tree) */}
                    {colors.leaves.length > 0 && (
                        <group position={[0, tree.trunkHeight * 0.5, 0]}>
                            {/* Center leaves */}
                            <mesh position={[0, 0.5, 0]}>
                                <boxGeometry args={[tree.leavesSize, tree.leavesSize, tree.leavesSize]} />
                                <meshStandardMaterial
                                    color={colors.leaves[0]}
                                    roughness={0.8}
                                />
                            </mesh>
                            {/* Top leaves */}
                            <mesh position={[0, tree.leavesSize * 0.5 + 0.5, 0]}>
                                <boxGeometry args={[tree.leavesSize * 0.6, tree.leavesSize * 0.6, tree.leavesSize * 0.6]} />
                                <meshStandardMaterial
                                    color={colors.leaves[1] || colors.leaves[0]}
                                    roughness={0.8}
                                />
                            </mesh>
                            {/* Random leaf blocks */}
                            {[...Array(6)].map((_, j) => (
                                <mesh
                                    key={`leaf-${j}`}
                                    position={[
                                        (Math.random() - 0.5) * tree.leavesSize * 1.2,
                                        Math.random() * tree.leavesSize * 0.5,
                                        (Math.random() - 0.5) * tree.leavesSize * 1.2
                                    ]}
                                >
                                    <boxGeometry args={[0.5, 0.5, 0.5]} />
                                    <meshStandardMaterial
                                        color={colors.leaves[Math.floor(Math.random() * colors.leaves.length)]}
                                        roughness={0.8}
                                    />
                                </mesh>
                            ))}
                        </group>
                    )}
                </group>
            ))}
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 🌸 TERRAIN FLOWERS - Renkli çiçekler
// ═══════════════════════════════════════════════════════════════════════════
export interface TerrainFlowersProps {
    count?: number;
    radius?: number;
    centerPosition?: [number, number, number];
    flowerTypes?: ('red' | 'yellow' | 'blue' | 'pink' | 'white' | 'purple')[];
}

const FLOWER_COLORS: Record<string, { petal: string; center: string; stem: string }> = {
    red: { petal: '#ef4444', center: '#fbbf24', stem: '#22c55e' },
    yellow: { petal: '#facc15', center: '#f97316', stem: '#16a34a' },
    blue: { petal: '#3b82f6', center: '#fbbf24', stem: '#15803d' },
    pink: { petal: '#ec4899', center: '#fbbf24', stem: '#22c55e' },
    white: { petal: '#f8fafc', center: '#fbbf24', stem: '#16a34a' },
    purple: { petal: '#a855f7', center: '#fbbf24', stem: '#15803d' },
};

export const TerrainFlowers: React.FC<TerrainFlowersProps> = ({
    count = 100,
    radius = 40,
    centerPosition = [0, 0, 0],
    flowerTypes = ['red', 'yellow', 'blue', 'pink', 'white', 'purple']
}) => {
    const flowers = useMemo(() => {
        return Array.from({ length: count }).map(() => {
            const type = flowerTypes[Math.floor(Math.random() * flowerTypes.length)];
            const colors = FLOWER_COLORS[type];
            return {
                x: centerPosition[0] + (Math.random() - 0.5) * radius * 2,
                z: centerPosition[2] + (Math.random() - 0.5) * radius * 2,
                stemHeight: 0.15 + Math.random() * 0.2,
                ...colors,
            };
        });
    }, [count, radius, centerPosition, flowerTypes]);

    const groupRef = useRef<THREE.Group>(null);

    // Çiçek sallanma
    useFrame(({ clock }) => {
        if (!groupRef.current) return;
        const time = clock.getElapsedTime();

        groupRef.current.children.forEach((child, i) => {
            if (child instanceof THREE.Group) {
                child.rotation.x = Math.sin(time * 1.5 + i * 0.1) * 0.05;
                child.rotation.z = Math.cos(time * 1.5 + i * 0.1) * 0.05;
            }
        });
    });

    return (
        <group ref={groupRef}>
            {flowers.map((flower, i) => (
                <group key={i} position={[flower.x, 0, flower.z]}>
                    {/* Stem */}
                    <mesh position={[0, flower.stemHeight / 2, 0]}>
                        <boxGeometry args={[0.03, flower.stemHeight, 0.03]} />
                        <meshBasicMaterial color={flower.stem} />
                    </mesh>
                    {/* Flower head */}
                    <mesh position={[0, flower.stemHeight + 0.04, 0]}>
                        <boxGeometry args={[0.08, 0.08, 0.08]} />
                        <meshBasicMaterial color={flower.petal} />
                    </mesh>
                    {/* Center */}
                    <mesh position={[0, flower.stemHeight + 0.06, 0]}>
                        <boxGeometry args={[0.04, 0.04, 0.04]} />
                        <meshBasicMaterial color={flower.center} />
                    </mesh>
                </group>
            ))}
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 🌊 WATER POOL - Su gölcüğü
// ═══════════════════════════════════════════════════════════════════════════
export interface WaterPoolProps {
    position?: [number, number, number];
    size?: [number, number];
    depth?: number;
}

export const WaterPool: React.FC<WaterPoolProps> = ({
    position = [0, 0, 0],
    size = [5, 5],
    depth = 0.3
}) => {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame(({ clock }) => {
        if (!meshRef.current) return;
        const material = meshRef.current.material as THREE.MeshBasicMaterial;
        material.opacity = 0.6 + Math.sin(clock.getElapsedTime() * 2) * 0.1;
    });

    return (
        <group position={position}>
            {/* Water surface */}
            <mesh ref={meshRef} position={[0, -depth / 2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={size} />
                <meshBasicMaterial
                    color="#38bdf8"
                    transparent
                    opacity={0.7}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
            {/* Pool edges */}
            {[
                [0, 0, size[1] / 2],
                [0, 0, -size[1] / 2],
                [size[0] / 2, 0, 0],
                [-size[0] / 2, 0, 0],
            ].map((pos, i) => (
                <mesh
                    key={i}
                    position={[pos[0] as number, -0.1, pos[2] as number]}
                >
                    <boxGeometry args={[
                        i < 2 ? size[0] + 0.4 : 0.4,
                        0.3,
                        i < 2 ? 0.4 : size[1] + 0.4
                    ]} />
                    <meshStandardMaterial color="#0284c7" roughness={0.7} />
                </mesh>
            ))}
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 🔥 LAVA POOL - Lav gölcüğü
// ═══════════════════════════════════════════════════════════════════════════
export interface LavaPoolProps {
    position?: [number, number, number];
    size?: [number, number];
    depth?: number;
}

export const LavaPool: React.FC<LavaPoolProps> = ({
    position = [0, 0, 0],
    size = [4, 4],
    depth = 0.4
}) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const bubblesRef = useRef<THREE.Group>(null);

    useFrame(({ clock }) => {
        if (!meshRef.current) return;
        const material = meshRef.current.material as THREE.MeshBasicMaterial;
        material.color.setHSL(
            0.05 + Math.sin(clock.getElapsedTime()) * 0.02,
            1,
            0.5
        );

        // Bubble animation
        if (bubblesRef.current) {
            bubblesRef.current.children.forEach((bubble, i) => {
                if (bubble instanceof THREE.Mesh) {
                    bubble.position.y = Math.sin(clock.getElapsedTime() * 2 + i) * 0.1;
                    bubble.scale.setScalar(0.8 + Math.sin(clock.getElapsedTime() * 3 + i * 0.5) * 0.2);
                }
            });
        }
    });

    const bubblePositions = useMemo(() => {
        return Array.from({ length: 8 }).map(() => ({
            x: (Math.random() - 0.5) * (size[0] - 0.5),
            z: (Math.random() - 0.5) * (size[1] - 0.5),
        }));
    }, [size]);

    return (
        <group position={position}>
            {/* Lava surface */}
            <mesh ref={meshRef} position={[0, -depth / 2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={size} />
                <meshBasicMaterial
                    color="#f97316"
                    blending={THREE.AdditiveBlending}
                />
            </mesh>

            {/* Lava bubbles */}
            <group ref={bubblesRef}>
                {bubblePositions.map((pos, i) => (
                    <mesh key={i} position={[pos.x, -depth / 4, pos.z]}>
                        <sphereGeometry args={[0.15, 8, 8]} />
                        <meshBasicMaterial
                            color="#fbbf24"
                            transparent
                            opacity={0.8}
                        />
                    </mesh>
                ))}
            </group>

            {/* Pool edges (obsidian-like) */}
            {[
                [0, 0, size[1] / 2],
                [0, 0, -size[1] / 2],
                [size[0] / 2, 0, 0],
                [-size[0] / 2, 0, 0],
            ].map((pos, i) => (
                <mesh
                    key={i}
                    position={[pos[0] as number, -0.1, pos[2] as number]}
                >
                    <boxGeometry args={[
                        i < 2 ? size[0] + 0.6 : 0.6,
                        0.4,
                        i < 2 ? 0.6 : size[1] + 0.6
                    ]} />
                    <meshStandardMaterial
                        color="#1c1917"
                        roughness={0.3}
                        metalness={0.5}
                    />
                </mesh>
            ))}

            {/* Glow light */}
            <pointLight position={[0, 0.5, 0]} color="#ff6600" intensity={2} distance={8} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 🏔️ COMPLETE VOXEL TERRAIN - Tüm elemanları birleştiren ana component
// ═══════════════════════════════════════════════════════════════════════════
export interface VoxelTerrainProps {
    zoneType?: 'forest' | 'desert' | 'snow' | 'lava' | 'void';
    radius?: number;
    density?: 'low' | 'medium' | 'high';
    includeWater?: boolean;
    includeLava?: boolean;
}

export const VoxelTerrain: React.FC<VoxelTerrainProps> = ({
    zoneType = 'forest',
    radius = 50,
    density = 'medium',
    includeWater = true,
    includeLava = false
}) => {
    const densityMultiplier = density === 'low' ? 0.5 : density === 'high' ? 1.5 : 1;

    const config = useMemo(() => {
        switch (zoneType) {
            case 'forest':
                return {
                    grassCount: Math.floor(500 * densityMultiplier),
                    treeCount: Math.floor(20 * densityMultiplier),
                    flowerCount: Math.floor(100 * densityMultiplier),
                    blockCount: Math.floor(25 * densityMultiplier),
                    treeType: 'oak' as const,
                    blockType: 'grass' as const,
                    grassColors: ['#22c55e', '#16a34a', '#15803d', '#166534'],
                    flowerTypes: ['red', 'yellow', 'blue', 'pink'] as const,
                };
            case 'desert':
                return {
                    grassCount: Math.floor(50 * densityMultiplier),
                    treeCount: Math.floor(5 * densityMultiplier),
                    flowerCount: Math.floor(20 * densityMultiplier),
                    blockCount: Math.floor(40 * densityMultiplier),
                    treeType: 'dead' as const,
                    blockType: 'sand' as const,
                    grassColors: ['#fcd34d', '#fbbf24', '#f59e0b'],
                    flowerTypes: ['yellow', 'red'] as const,
                };
            case 'snow':
                return {
                    grassCount: Math.floor(200 * densityMultiplier),
                    treeCount: Math.floor(15 * densityMultiplier),
                    flowerCount: Math.floor(30 * densityMultiplier),
                    blockCount: Math.floor(30 * densityMultiplier),
                    treeType: 'pine' as const,
                    blockType: 'snow' as const,
                    grassColors: ['#e0f2fe', '#bae6fd', '#7dd3fc'],
                    flowerTypes: ['white', 'blue'] as const,
                };
            case 'lava':
                return {
                    grassCount: 0,
                    treeCount: Math.floor(5 * densityMultiplier),
                    flowerCount: 0,
                    blockCount: Math.floor(50 * densityMultiplier),
                    treeType: 'dead' as const,
                    blockType: 'lava' as const,
                    grassColors: [],
                    flowerTypes: [] as const,
                };
            case 'void':
                return {
                    grassCount: Math.floor(100 * densityMultiplier),
                    treeCount: Math.floor(8 * densityMultiplier),
                    flowerCount: Math.floor(50 * densityMultiplier),
                    blockCount: Math.floor(20 * densityMultiplier),
                    treeType: 'cherry' as const,
                    blockType: 'stone' as const,
                    grassColors: ['#a855f7', '#9333ea', '#7c3aed'],
                    flowerTypes: ['purple', 'pink'] as const,
                };
            default:
                return {
                    grassCount: 500,
                    treeCount: 15,
                    flowerCount: 100,
                    blockCount: 25,
                    treeType: 'oak' as const,
                    blockType: 'grass' as const,
                    grassColors: ['#22c55e', '#16a34a'],
                    flowerTypes: ['red', 'yellow'] as const,
                };
        }
    }, [zoneType, densityMultiplier]);

    return (
        <group>
            {/* Grass */}
            {config.grassCount > 0 && (
                <PixelGrass
                    count={config.grassCount}
                    radius={radius}
                    colors={config.grassColors}
                />
            )}

            {/* Terrain Blocks */}
            <TerrainBlocks
                count={config.blockCount}
                radius={radius}
                type={config.blockType}
            />

            {/* Trees */}
            {config.treeCount > 0 && (
                <VoxelTrees
                    count={config.treeCount}
                    radius={radius}
                    treeType={config.treeType}
                />
            )}

            {/* Flowers */}
            {config.flowerCount > 0 && config.flowerTypes.length > 0 && (
                <TerrainFlowers
                    count={config.flowerCount}
                    radius={radius}
                    flowerTypes={config.flowerTypes as any}
                />
            )}

            {/* Water pools */}
            {includeWater && zoneType !== 'lava' && (
                <>
                    <WaterPool position={[15, 0, 10]} size={[6, 4]} />
                    <WaterPool position={[-20, 0, -15]} size={[4, 6]} />
                </>
            )}

            {/* Lava pools */}
            {(includeLava || zoneType === 'lava') && (
                <>
                    <LavaPool position={[10, 0, -10]} size={[5, 5]} />
                    <LavaPool position={[-15, 0, 20]} size={[4, 3]} />
                    {zoneType === 'lava' && (
                        <>
                            <LavaPool position={[0, 0, 0]} size={[8, 8]} />
                            <LavaPool position={[25, 0, 5]} size={[6, 4]} />
                            <LavaPool position={[-25, 0, -5]} size={[5, 6]} />
                        </>
                    )}
                </>
            )}
        </group>
    );
};

export default VoxelTerrain;
