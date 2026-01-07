// ═══════════════════════════════════════════════════════════════════════════
// VOXEL TERRAIN - Kadim Savaşlar
// Minecraft Legends tarzı voxel/pixel harita elemanları
// 🔧 STABLE VERSION - Seeded random, performans odaklı
// ═══════════════════════════════════════════════════════════════════════════

import React, { useMemo } from 'react';
import * as THREE from 'three';

// Seeded random function for stable positions
const seededRandom = (seed: number): number => {
    const x = Math.sin(seed * 9999) * 10000;
    return x - Math.floor(x);
};

// ═══════════════════════════════════════════════════════════════════════════
// 🌿 VOXEL GRASS - Çim parçacıkları (Statik - animasyonsuz)
// ═══════════════════════════════════════════════════════════════════════════
interface VoxelGrassProps {
    count: number;
    radius: number;
    seed: number;
    colors: string[];
}

const VoxelGrass: React.FC<VoxelGrassProps> = React.memo(({ count, radius, seed, colors }) => {
    const grassData = useMemo(() => {
        return Array.from({ length: count }).map((_, i) => {
            const s = seed + i * 7;
            return {
                x: (seededRandom(s) - 0.5) * radius * 2,
                z: (seededRandom(s + 1) - 0.5) * radius * 2,
                height: 0.1 + seededRandom(s + 2) * 0.2,
                color: colors[Math.floor(seededRandom(s + 3) * colors.length)],
            };
        });
    }, [count, radius, seed, colors]);

    return (
        <group>
            {grassData.map((g, i) => (
                <mesh key={`grass-${i}`} position={[g.x, g.height / 2, g.z]}>
                    <boxGeometry args={[0.06, g.height, 0.06]} />
                    <meshBasicMaterial color={g.color} />
                </mesh>
            ))}
        </group>
    );
});

// ═══════════════════════════════════════════════════════════════════════════
// 🧱 TERRAIN BLOCKS - Toprak blokları (Minecraft tarzı)
// ═══════════════════════════════════════════════════════════════════════════
interface TerrainBlockProps {
    count: number;
    radius: number;
    seed: number;
    topColor: string;
    sideColor: string;
    maxLayers: number;
}

const TerrainBlocks: React.FC<TerrainBlockProps> = React.memo(({ count, radius, seed, topColor, sideColor, maxLayers }) => {
    const blocks = useMemo(() => {
        return Array.from({ length: count }).map((_, i) => {
            const s = seed + i * 11;
            const layers = Math.floor(seededRandom(s) * maxLayers) + 1;
            return {
                x: (seededRandom(s + 1) - 0.5) * radius * 2,
                z: (seededRandom(s + 2) - 0.5) * radius * 2,
                layers,
                size: 1 + seededRandom(s + 3) * 0.5,
            };
        });
    }, [count, radius, seed, maxLayers]);

    return (
        <group>
            {blocks.map((block, i) => (
                <group key={`block-${i}`} position={[block.x, 0, block.z]}>
                    {Array.from({ length: block.layers }).map((_, layer) => (
                        <mesh key={`layer-${layer}`} position={[0, layer * block.size + block.size / 2, 0]}>
                            <boxGeometry args={[block.size, block.size, block.size]} />
                            <meshBasicMaterial color={layer === block.layers - 1 ? topColor : sideColor} />
                        </mesh>
                    ))}
                </group>
            ))}
        </group>
    );
});

// ═══════════════════════════════════════════════════════════════════════════
// 🌲 VOXEL TREES - Basit ağaçlar
// ═══════════════════════════════════════════════════════════════════════════
interface VoxelTreesProps {
    count: number;
    radius: number;
    seed: number;
    trunkColor: string;
    leafColor: string;
}

const VoxelTrees: React.FC<VoxelTreesProps> = React.memo(({ count, radius, seed, trunkColor, leafColor }) => {
    const trees = useMemo(() => {
        return Array.from({ length: count }).map((_, i) => {
            const s = seed + i * 13;
            return {
                x: (seededRandom(s) - 0.5) * radius * 2,
                z: (seededRandom(s + 1) - 0.5) * radius * 2,
                trunkHeight: 2 + seededRandom(s + 2) * 2,
                leafSize: 1.5 + seededRandom(s + 3) * 1,
            };
        });
    }, [count, radius, seed]);

    return (
        <group>
            {trees.map((tree, i) => (
                <group key={`tree-${i}`} position={[tree.x, 0, tree.z]}>
                    {/* Trunk */}
                    <mesh position={[0, tree.trunkHeight / 2, 0]}>
                        <boxGeometry args={[0.4, tree.trunkHeight, 0.4]} />
                        <meshBasicMaterial color={trunkColor} />
                    </mesh>
                    {/* Leaves */}
                    <mesh position={[0, tree.trunkHeight + tree.leafSize / 2, 0]}>
                        <boxGeometry args={[tree.leafSize, tree.leafSize, tree.leafSize]} />
                        <meshBasicMaterial color={leafColor} />
                    </mesh>
                </group>
            ))}
        </group>
    );
});

// ═══════════════════════════════════════════════════════════════════════════
// 🌸 FLOWERS - Çiçekler
// ═══════════════════════════════════════════════════════════════════════════
interface FlowersProps {
    count: number;
    radius: number;
    seed: number;
    colors: string[];
}

const Flowers: React.FC<FlowersProps> = React.memo(({ count, radius, seed, colors }) => {
    const flowers = useMemo(() => {
        return Array.from({ length: count }).map((_, i) => {
            const s = seed + i * 17;
            return {
                x: (seededRandom(s) - 0.5) * radius * 2,
                z: (seededRandom(s + 1) - 0.5) * radius * 2,
                color: colors[Math.floor(seededRandom(s + 2) * colors.length)],
                height: 0.2 + seededRandom(s + 3) * 0.15,
            };
        });
    }, [count, radius, seed, colors]);

    return (
        <group>
            {flowers.map((f, i) => (
                <mesh key={`flower-${i}`} position={[f.x, f.height, f.z]}>
                    <boxGeometry args={[0.1, f.height * 2, 0.1]} />
                    <meshBasicMaterial color={f.color} />
                </mesh>
            ))}
        </group>
    );
});

// ═══════════════════════════════════════════════════════════════════════════
// 🔥 LAVA CHANNELS - Lav kanalları (Ateş Lejyonları için)
// ═══════════════════════════════════════════════════════════════════════════
interface LavaChannelProps {
    position: [number, number, number];
    length: number;
    width: number;
}

const LavaChannel: React.FC<LavaChannelProps> = React.memo(({ position, length, width }) => {
    return (
        <group position={position}>
            {/* Lava */}
            <mesh position={[0, -0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[length, width]} />
                <meshBasicMaterial color="#ff4500" />
            </mesh>
            {/* Glow */}
            <pointLight position={[0, 0.3, 0]} color="#ff6600" intensity={1} distance={5} />
        </group>
    );
});

// ═══════════════════════════════════════════════════════════════════════════
// 💧 WATER STREAM - Su akışı (Su Muhafızları için)
// ═══════════════════════════════════════════════════════════════════════════
interface WaterStreamProps {
    position: [number, number, number];
    length: number;
    width: number;
}

const WaterStream: React.FC<WaterStreamProps> = React.memo(({ position, length, width }) => {
    return (
        <group position={position}>
            <mesh position={[0, -0.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[length, width]} />
                <meshBasicMaterial color="#38bdf8" transparent opacity={0.7} />
            </mesh>
        </group>
    );
});

// ═══════════════════════════════════════════════════════════════════════════
// 🏔️ COMPLETE TERRAIN - Zone bazlı tam terrain sistemi
// ═══════════════════════════════════════════════════════════════════════════
export interface VoxelTerrainProps {
    zoneType: 'marsu' | 'terya' | 'venu' | 'neutral';
    zoneId: number;
    radius?: number;
}

export const VoxelTerrain: React.FC<VoxelTerrainProps> = React.memo(({ zoneType, zoneId, radius = 40 }) => {
    const seed = zoneId * 1000; // Unique seed per zone

    // Zone-specific configurations
    const config = useMemo(() => {
        switch (zoneType) {
            case 'marsu': // Ateş Lejyonları 🔥
                return {
                    grassCount: 0,
                    grassColors: [],
                    blockCount: 12,
                    blockTopColor: '#dc2626',
                    blockSideColor: '#7f1d1d',
                    blockLayers: 2,
                    treeCount: 3,
                    treeTrunk: '#451a03',
                    treeLeaf: '#1c1917', // Dead/burned
                    flowerCount: 0,
                    flowerColors: [],
                    hasLava: true,
                    hasWater: false,
                };
            case 'terya': // Su Muhafızları 💧
                return {
                    grassCount: 60,
                    grassColors: ['#67e8f9', '#a5f3fc', '#cffafe'],
                    blockCount: 8,
                    blockTopColor: '#e0f2fe',
                    blockSideColor: '#7dd3fc',
                    blockLayers: 2,
                    treeCount: 5,
                    treeTrunk: '#94a3b8',
                    treeLeaf: '#38bdf8',
                    flowerCount: 25,
                    flowerColors: ['#a855f7', '#c084fc', '#8b5cf6', '#60a5fa'],
                    hasLava: false,
                    hasWater: true,
                };
            case 'venu': // Doğa Bekçileri 🌲
                return {
                    grassCount: 100,
                    grassColors: ['#22c55e', '#16a34a', '#15803d', '#4ade80'],
                    blockCount: 15,
                    blockTopColor: '#4ade80',
                    blockSideColor: '#854d0e',
                    blockLayers: 3,
                    treeCount: 12,
                    treeTrunk: '#78350f',
                    treeLeaf: '#15803d',
                    flowerCount: 40,
                    flowerColors: ['#ef4444', '#fbbf24', '#3b82f6', '#ec4899'],
                    hasLava: false,
                    hasWater: true,
                };
            default: // Neutral
                return {
                    grassCount: 50,
                    grassColors: ['#65a30d', '#84cc16'],
                    blockCount: 8,
                    blockTopColor: '#78716c',
                    blockSideColor: '#57534e',
                    blockLayers: 2,
                    treeCount: 5,
                    treeTrunk: '#57534e',
                    treeLeaf: '#65a30d',
                    flowerCount: 15,
                    flowerColors: ['#fbbf24', '#f472b6'],
                    hasLava: false,
                    hasWater: false,
                };
        }
    }, [zoneType]);

    // Generate lava/water positions with seeded random
    const lavaPositions = useMemo(() => {
        if (!config.hasLava) return [];
        return [
            { pos: [(seededRandom(seed + 100) - 0.5) * 30, 0, (seededRandom(seed + 101) - 0.5) * 30] as [number, number, number], length: 8, width: 2 },
            { pos: [(seededRandom(seed + 102) - 0.5) * 30, 0, (seededRandom(seed + 103) - 0.5) * 30] as [number, number, number], length: 6, width: 1.5 },
        ];
    }, [seed, config.hasLava]);

    const waterPositions = useMemo(() => {
        if (!config.hasWater) return [];
        return [
            { pos: [(seededRandom(seed + 200) - 0.5) * 25, 0, (seededRandom(seed + 201) - 0.5) * 25] as [number, number, number], length: 10, width: 3 },
        ];
    }, [seed, config.hasWater]);

    return (
        <group>
            {/* Grass */}
            {config.grassCount > 0 && (
                <VoxelGrass
                    count={config.grassCount}
                    radius={radius}
                    seed={seed + 1000}
                    colors={config.grassColors}
                />
            )}

            {/* Terrain Blocks */}
            {config.blockCount > 0 && (
                <TerrainBlocks
                    count={config.blockCount}
                    radius={radius}
                    seed={seed + 2000}
                    topColor={config.blockTopColor}
                    sideColor={config.blockSideColor}
                    maxLayers={config.blockLayers}
                />
            )}

            {/* Trees */}
            {config.treeCount > 0 && (
                <VoxelTrees
                    count={config.treeCount}
                    radius={radius}
                    seed={seed + 3000}
                    trunkColor={config.treeTrunk}
                    leafColor={config.treeLeaf}
                />
            )}

            {/* Flowers */}
            {config.flowerCount > 0 && (
                <Flowers
                    count={config.flowerCount}
                    radius={radius}
                    seed={seed + 4000}
                    colors={config.flowerColors}
                />
            )}

            {/* Lava Channels (Marsu) */}
            {lavaPositions.map((lava, i) => (
                <LavaChannel key={`lava-${i}`} position={lava.pos} length={lava.length} width={lava.width} />
            ))}

            {/* Water Streams (Terya/Venu) */}
            {waterPositions.map((water, i) => (
                <WaterStream key={`water-${i}`} position={water.pos} length={water.length} width={water.width} />
            ))}
        </group>
    );
});

export default VoxelTerrain;
