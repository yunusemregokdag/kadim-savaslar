import React, { useMemo } from 'react';
import * as THREE from 'three';

// --- ENHANCED GROUND COMPONENT WITH ZONE-SPECIFIC TEXTURES ---
export const Ground: React.FC<{ color: string; zoneId?: number; showGrid?: boolean }> = ({ color, zoneId, showGrid = false }) => {
    // Determine zone theme based on color
    const zoneTheme = useMemo(() => {
        // Fire/Marsu zones (red)
        if (color === '#450a0a' || color === '#7f1d1d' || color === '#991b1b') {
            return {
                baseColor: '#1a0a00',
                accentColor: '#4a0000',
                gridColor: '#ff4500',
                fogColor: '#1a0505',
                emissive: '#2a0000',
                roughness: 0.95,
                type: 'lava'
            };
        }
        // Ice/Terya zones (blue)
        else if (color === '#172554' || color === '#1e3a8a' || color === '#1e40af') {
            return {
                baseColor: '#0a1628',
                accentColor: '#1e3a5f',
                gridColor: '#3b82f6',
                fogColor: '#0f1729',
                emissive: '#0a2540',
                roughness: 0.3, // Icy = more reflective
                type: 'ice'
            };
        }
        // Nature/Venu zones (green)
        else if (color === '#14532d' || color === '#166534' || color === '#15803d') {
            return {
                baseColor: '#0a1f0a',
                accentColor: '#1a3a1a',
                gridColor: '#22c55e',
                fogColor: '#0a150a',
                emissive: '#0f2f0f',
                roughness: 0.85,
                type: 'grass'
            };
        }
        // Void/Dungeon zones (purple/dark)
        else if (color === '#3b0764' || color === '#581c87') {
            return {
                baseColor: '#0f0520',
                accentColor: '#1f0a40',
                gridColor: '#a855f7',
                fogColor: '#0a0315',
                emissive: '#1a0a30',
                roughness: 0.9,
                type: 'void'
            };
        }
        // Default (neutral stone)
        else {
            return {
                baseColor: '#1a1a1a',
                accentColor: '#2a2a2a',
                gridColor: '#64748b',
                fogColor: '#0f0f0f',
                emissive: '#0a0a0a',
                roughness: 0.92,
                type: 'stone'
            };
        }
    }, [color]);

    // Create procedural texture for ground variation
    const groundTexture = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d')!;

        // Base color
        ctx.fillStyle = zoneTheme.baseColor;
        ctx.fillRect(0, 0, 512, 512);

        // Add noise/variation
        for (let i = 0; i < 3000; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const size = Math.random() * 3 + 1;
            ctx.fillStyle = zoneTheme.accentColor;
            ctx.globalAlpha = Math.random() * 0.3;
            ctx.fillRect(x, y, size, size);
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(50, 50);
        return texture;
    }, [zoneTheme]);

    return (
        <group>
            {/* Main Ground Plane */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]} receiveShadow>
                <planeGeometry args={[1000, 1000, 128, 128]} />
                <meshStandardMaterial
                    map={groundTexture}
                    color={zoneTheme.baseColor}
                    roughness={zoneTheme.roughness}
                    metalness={zoneTheme.type === 'ice' ? 0.3 : 0.05}
                    emissive={zoneTheme.emissive}
                    emissiveIntensity={0.2}
                />
            </mesh>

            {/* Grid/Cracks Effect - Only visible in map view */}
            {showGrid && (
                <>
                    <gridHelper
                        args={[1000, 150, zoneTheme.gridColor, zoneTheme.accentColor]}
                        position={[0, -0.15, 0]}
                    />

                    {/* Subtle Secondary Grid (adds depth) */}
                    <gridHelper
                        args={[1000, 50, zoneTheme.gridColor, 'transparent']}
                        position={[0, -0.12, 0]}
                    />
                </>
            )}

            {/* Atmosphere Fog */}
            <fog attach="fog" args={[zoneTheme.fogColor, 10, 120]} />

            {/* Zone-Specific Effects */}
            {zoneTheme.type === 'lava' && (
                <>
                    {/* Lava Glow Spots */}
                    {[...Array(20)].map((_, i) => (
                        <pointLight
                            key={i}
                            position={[
                                (Math.random() - 0.5) * 500,
                                0.5,
                                (Math.random() - 0.5) * 500
                            ]}
                            color="#ff4500"
                            intensity={0.5}
                            distance={10}
                        />
                    ))}
                </>
            )}

            {zoneTheme.type === 'ice' && (
                <>
                    {/* Ice Crystals Glow */}
                    <pointLight position={[0, 2, 0]} color="#3b82f6" intensity={0.3} distance={50} />
                </>
            )}

            {zoneTheme.type === 'void' && (
                <>
                    {/* Purple void energy */}
                    <pointLight position={[0, 1, 0]} color="#a855f7" intensity={0.4} distance={40} />
                </>
            )}
        </group>
    );
};
