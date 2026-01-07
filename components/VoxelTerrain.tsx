// ═══════════════════════════════════════════════════════════════════════════
// VOXEL TERRAIN - Kadim Savaşlar
// Minecraft Legends tarzı voxel/pixel harita elemanları
// 🔧 OPTIMIZED VERSION - Daha az nesne, statik render
// ═══════════════════════════════════════════════════════════════════════════

import React, { useMemo } from 'react';
import * as THREE from 'three';

// ═══════════════════════════════════════════════════════════════════════════
// 🌿 PIXEL GRASS - Rastgele çim parçacıkları (OPTIMIZED - no animation)
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
    count = 150, // REDUCED from 500
    radius = 50,
    centerPosition = [0, 0, 0],
    minHeight = 0.1,
    maxHeight = 0.3,
    colors = ['#22c55e', '#16a34a', '#15803d']
}) => {
    const grassData = useMemo(() => {
        return Array.from({ length: count }).map(() => ({
            x: centerPosition[0] + (Math.random() - 0.5) * radius * 2,
            z: centerPosition[2] + (Math.random() - 0.5) * radius * 2,
            height: minHeight + Math.random() * (maxHeight - minHeight),
            width: 0.05 + Math.random() * 0.03,
            color: colors[Math.floor(Math.random() * colors.length)],
            rotation: Math.random() * Math.PI,
        }));
    }, [count, radius, centerPosition, minHeight, maxHeight, colors]);

    // No useFrame - static grass for performance
    return (
        <group>
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
// 🧱 TERRAIN BLOCKS - Toprak/kaya blokları (OPTIMIZED)
// ═══════════════════════════════════════════════════════════════════════════
export interface TerrainBlocksProps {
    count?: number;
    radius?: number;
    centerPosition?: [number, number, number];
    blockSize?: number;
    maxHeight?: number;
    type?: 'grass' | 'dirt' | 'stone' | 'sand' | 'snow' | 'lava';
}

const BLOCK_COLORS: Record<string, { top: string; side: string }> = {
    grass: { top: '#4ade80', side: '#854d0e' },
    dirt: { top: '#854d0e', side: '#78350f' },
    stone: { top: '#6b7280', side: '#4b5563' },
    sand: { top: '#fcd34d', side: '#fbbf24' },
    snow: { top: '#f0f9ff', side: '#e0f2fe' },
    lava: { top: '#f97316', side: '#ea580c' },
};

export const TerrainBlocks: React.FC<TerrainBlocksProps> = ({
    count = 15, // REDUCED from 30
    radius = 40,
    centerPosition = [0, 0, 0],
    blockSize = 1.2,
    maxHeight = 2, // REDUCED from 3
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
                size: blockSize,
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
                            <meshBasicMaterial
                                color={layer === block.layers - 1 ? colors.top : colors.side}
                            />
                        </mesh>
                    ))}
                </group>
            ))}
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 🌲 VOXEL TREES - Basit voxel ağaçlar (OPTIMIZED - simpler)
// ═══════════════════════════════════════════════════════════════════════════
export interface VoxelTreesProps {
    count?: number;
    radius?: number;
    centerPosition?: [number, number, number];
    treeType?: 'oak' | 'pine' | 'birch' | 'cherry' | 'dead';
}

const TREE_COLORS: Record<string, { trunk: string; leaves: string }> = {
    oak: { trunk: '#78350f', leaves: '#22c55e' },
    pine: { trunk: '#713f12', leaves: '#14532d' },
    birch: { trunk: '#fafafa', leaves: '#4ade80' },
    cherry: { trunk: '#854d0e', leaves: '#f472b6' },
    dead: { trunk: '#57534e', leaves: '' },
};

export const VoxelTrees: React.FC<VoxelTreesProps> = ({
    count = 8, // REDUCED from 15
    radius = 50,
    centerPosition = [0, 0, 0],
    treeType = 'oak'
}) => {
    const colors = TREE_COLORS[treeType] || TREE_COLORS.oak;

    const trees = useMemo(() => {
        return Array.from({ length: count }).map(() => ({
            x: centerPosition[0] + (Math.random() - 0.5) * radius * 2,
            z: centerPosition[2] + (Math.random() - 0.5) * radius * 2,
            trunkHeight: 3,
            leavesSize: 2,
        }));
    }, [count, radius, centerPosition]);

    return (
        <group>
            {trees.map((tree, i) => (
                <group key={i} position={[tree.x, 0, tree.z]}>
                    {/* Trunk - single block */}
                    <mesh position={[0, tree.trunkHeight / 2, 0]}>
                        <boxGeometry args={[0.5, tree.trunkHeight, 0.5]} />
                        <meshBasicMaterial color={colors.trunk} />
                    </mesh>

                    {/* Leaves (if not dead tree) - single block */}
                    {colors.leaves && (
                        <mesh position={[0, tree.trunkHeight + tree.leavesSize / 2, 0]}>
                            <boxGeometry args={[tree.leavesSize, tree.leavesSize, tree.leavesSize]} />
                            <meshBasicMaterial color={colors.leaves} />
                        </mesh>
                    )}
                </group>
            ))}
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 🌸 TERRAIN FLOWERS - Renkli çiçekler (OPTIMIZED - static)
// ═══════════════════════════════════════════════════════════════════════════
export interface TerrainFlowersProps {
    count?: number;
    radius?: number;
    centerPosition?: [number, number, number];
    flowerTypes?: ('red' | 'yellow' | 'blue' | 'pink' | 'white' | 'purple')[];
}

const FLOWER_COLORS: Record<string, string> = {
    red: '#ef4444',
    yellow: '#facc15',
    blue: '#3b82f6',
    pink: '#ec4899',
    white: '#f8fafc',
    purple: '#a855f7',
};

export const TerrainFlowers: React.FC<TerrainFlowersProps> = ({
    count = 30, // REDUCED from 100
    radius = 40,
    centerPosition = [0, 0, 0],
    flowerTypes = ['red', 'yellow', 'blue', 'pink']
}) => {
    const flowers = useMemo(() => {
        return Array.from({ length: count }).map(() => {
            const type = flowerTypes[Math.floor(Math.random() * flowerTypes.length)];
            return {
                x: centerPosition[0] + (Math.random() - 0.5) * radius * 2,
                z: centerPosition[2] + (Math.random() - 0.5) * radius * 2,
                color: FLOWER_COLORS[type] || '#ef4444',
            };
        });
    }, [count, radius, centerPosition, flowerTypes]);

    // No animation - static flowers
    return (
        <group>
            {flowers.map((flower, i) => (
                <mesh key={i} position={[flower.x, 0.15, flower.z]}>
                    <boxGeometry args={[0.1, 0.3, 0.1]} />
                    <meshBasicMaterial color={flower.color} />
                </mesh>
            ))}
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 🌊 WATER POOL - Su gölcüğü (OPTIMIZED - no animation)
// ═══════════════════════════════════════════════════════════════════════════
export interface WaterPoolProps {
    position?: [number, number, number];
    size?: [number, number];
}

export const WaterPool: React.FC<WaterPoolProps> = ({
    position = [0, 0, 0],
    size = [5, 5]
}) => {
    return (
        <group position={position}>
            {/* Water surface */}
            <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={size} />
                <meshBasicMaterial
                    color="#38bdf8"
                    transparent
                    opacity={0.6}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 🔥 LAVA POOL - Lav gölcüğü (OPTIMIZED - no animation)
// ═══════════════════════════════════════════════════════════════════════════
export interface LavaPoolProps {
    position?: [number, number, number];
    size?: [number, number];
}

export const LavaPool: React.FC<LavaPoolProps> = ({
    position = [0, 0, 0],
    size = [4, 4]
}) => {
    return (
        <group position={position}>
            {/* Lava surface */}
            <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={size} />
                <meshBasicMaterial color="#f97316" />
            </mesh>
            {/* Glow light */}
            <pointLight position={[0, 0.5, 0]} color="#ff6600" intensity={1} distance={5} />
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 🏔️ COMPLETE VOXEL TERRAIN - Tüm elemanları birleştiren ana component
// OPTIMIZED: Daha az nesne, statik render, performans odaklı
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
    density = 'low', // DEFAULT TO LOW for performance
    includeWater = false, // DEFAULT TO FALSE
    includeLava = false
}) => {
    // Much lower multipliers
    const densityMultiplier = density === 'low' ? 0.3 : density === 'high' ? 0.8 : 0.5;

    const config = useMemo(() => {
        switch (zoneType) {
            case 'forest':
                return {
                    grassCount: Math.floor(100 * densityMultiplier),
                    treeCount: Math.floor(6 * densityMultiplier),
                    flowerCount: Math.floor(20 * densityMultiplier),
                    blockCount: Math.floor(10 * densityMultiplier),
                    treeType: 'oak' as const,
                    blockType: 'grass' as const,
                    grassColors: ['#22c55e', '#16a34a', '#15803d'],
                    flowerTypes: ['red', 'yellow', 'blue'] as const,
                };
            case 'desert':
                return {
                    grassCount: Math.floor(20 * densityMultiplier),
                    treeCount: Math.floor(2 * densityMultiplier),
                    flowerCount: Math.floor(10 * densityMultiplier),
                    blockCount: Math.floor(15 * densityMultiplier),
                    treeType: 'dead' as const,
                    blockType: 'sand' as const,
                    grassColors: ['#fcd34d', '#fbbf24'],
                    flowerTypes: ['yellow'] as const,
                };
            case 'snow':
                return {
                    grassCount: Math.floor(80 * densityMultiplier),
                    treeCount: Math.floor(5 * densityMultiplier),
                    flowerCount: Math.floor(15 * densityMultiplier),
                    blockCount: Math.floor(12 * densityMultiplier),
                    treeType: 'pine' as const,
                    blockType: 'snow' as const,
                    grassColors: ['#e0f2fe', '#bae6fd'],
                    flowerTypes: ['white', 'blue'] as const,
                };
            case 'lava':
                return {
                    grassCount: 0,
                    treeCount: Math.floor(2 * densityMultiplier),
                    flowerCount: 0,
                    blockCount: Math.floor(20 * densityMultiplier),
                    treeType: 'dead' as const,
                    blockType: 'lava' as const,
                    grassColors: [],
                    flowerTypes: [] as const,
                };
            case 'void':
                return {
                    grassCount: Math.floor(50 * densityMultiplier),
                    treeCount: Math.floor(4 * densityMultiplier),
                    flowerCount: Math.floor(25 * densityMultiplier),
                    blockCount: Math.floor(8 * densityMultiplier),
                    treeType: 'cherry' as const,
                    blockType: 'stone' as const,
                    grassColors: ['#a855f7', '#9333ea'],
                    flowerTypes: ['purple', 'pink'] as const,
                };
            default:
                return {
                    grassCount: 50,
                    treeCount: 5,
                    flowerCount: 20,
                    blockCount: 10,
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
            {config.blockCount > 0 && (
                <TerrainBlocks
                    count={config.blockCount}
                    radius={radius}
                    type={config.blockType}
                />
            )}

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

            {/* Water pools - only if explicitly enabled */}
            {includeWater && zoneType !== 'lava' && (
                <>
                    <WaterPool position={[15, 0, 10]} size={[5, 4]} />
                </>
            )}

            {/* Lava pools - only if explicitly enabled or lava zone */}
            {(includeLava || zoneType === 'lava') && (
                <>
                    <LavaPool position={[10, 0, -10]} size={[4, 4]} />
                    {zoneType === 'lava' && (
                        <LavaPool position={[-15, 0, 15]} size={[5, 5]} />
                    )}
                </>
            )}
        </group>
    );
};

export default VoxelTerrain;
