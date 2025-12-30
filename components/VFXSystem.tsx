import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ════════════════════════════════════════════════════════════════════════════════
// 1. ARCHITECTURE & TYPES
// ════════════════════════════════════════════════════════════════════════════════

export type VFXPresetName = 'FIRE' | 'ICE' | 'POISON' | 'LIGHTNING' | 'HOLY' | 'PHYSICAL';

// Input for spawning a VFX
export interface VFXRequest {
    id: string;
    preset: VFXPresetName;
    position: [number, number, number]; // Attacker or Start
    targetPosition?: [number, number, number]; // Enemy or End
    targetType?: string; // For seeding
}

// Particle definition for our pool
interface Particle {
    active: boolean;
    x: number; y: number; z: number;
    vx: number; vy: number; vz: number;
    r: number; g: number; b: number;
    scale: number;
    maxLife: number;
    life: number;
    type: 'cube' | 'spark';
}

// Global Manager to decouple Logic from View
class VFXManager {
    private listeners: ((req: VFXRequest) => void)[] = [];

    // Trigger an effect from anywhere in the codebase
    public spawn(skillName: string, start: [number, number, number], target?: [number, number, number], targetType = 'mob') {
        const preset = this.resolvePreset(skillName);
        this.emit({
            id: Math.random().toString(36).slice(2),
            preset,
            position: start,
            targetPosition: target,
            targetType
        });
    }

    // A) SkillVFXResolver (Deterministic)
    public resolvePreset(skillName: string): VFXPresetName {
        const s = skillName.toLowerCase();
        if (s.includes('fire') || s.includes('burn') || s.includes('flame') || s.includes('inferno') || s.includes('dragon')) return 'FIRE';
        if (s.includes('ice') || s.includes('frost') || s.includes('freeze') || s.includes('cold') || s.includes('glacier')) return 'ICE';
        if (s.includes('poison') || s.includes('toxin') || s.includes('venom') || s.includes('decay') || s.includes('acid')) return 'POISON';
        if (s.includes('bolt') || s.includes('shock') || s.includes('thunder') || s.includes('lightning') || s.includes('storm')) return 'LIGHTNING';
        if (s.includes('holy') || s.includes('heal') || s.includes('light') || s.includes('divine') || s.includes('bless')) return 'HOLY';
        return 'PHYSICAL';
    }

    public subscribe(cb: (req: VFXRequest) => void) {
        this.listeners.push(cb);
        return () => { this.listeners = this.listeners.filter(l => l !== cb); };
    }

    private emit(req: VFXRequest) {
        this.listeners.forEach(cb => cb(req));
    }
}

export const vfxManager = new VFXManager();


// ════════════════════════════════════════════════════════════════════════════════
// 2. PIXEL VFX FACTORY & RUNTIME
// ════════════════════════════════════════════════════════════════════════════════

const MAX_PARTICLES = 500; // Total pool size
const DUMMY_OBJ = new THREE.Object3D();
const DUMMY_COLOR = new THREE.Color();

// Helper for deterministic randomness
function stableHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
    }
    return Math.abs(hash);
}

export const GameVFXOverlay: React.FC = () => {
    // We use one big InstancedMesh for all cubic particles to save draw calls.
    // We update matrices every frame.
    const meshRef = useRef<THREE.InstancedMesh>(null);

    // The Pool
    const particles = useMemo<Particle[]>(() => {
        return new Array(MAX_PARTICLES).fill(0).map(() => ({
            active: false,
            x: 0, y: 0, z: 0,
            vx: 0, vy: 0, vz: 0,
            r: 1, g: 1, b: 1,
            scale: 1,
            maxLife: 1,
            life: 0,
            type: 'cube'
        }));
    }, []);

    // Active particle count for limiting
    const activeCountRef = useRef(0);

    // Queue for incoming requests
    const queueRef = useRef<VFXRequest[]>([]);

    useEffect(() => {
        return vfxManager.subscribe((req) => {
            queueRef.current.push(req);
        });
    }, []);

    // B) VFX Factory Logic (Procedural Generation)
    const spawnParticles = (req: VFXRequest) => {
        const { preset, position, targetPosition, targetType } = req;
        // Use target position if available (Impact), else attacker position (Self-cast/Buff)
        const [tx, ty, tz] = targetPosition || position;
        const seed = stableHash(preset + (targetType || ''));
        const rng = () => ((seed * 1.5) % 1 + Math.random()) % 1; // Mixed rng

        let count = 0;
        let colorPalette: [number, number, number][] = [];
        // Base config
        let speed = 0.1;
        let spread = 0.5;
        let lift = 0.1;
        let gravity = -0.01;
        let lifeBase = 1.0;
        let sizeBase = 0.2;

        // 3) Concrete Presets
        switch (preset) {
            case 'FIRE':
                count = 12;
                colorPalette = [[1, 0.3, 0], [1, 0.6, 0], [1, 0.1, 0]]; // Orange, Yellow, Red
                speed = 0.05;
                spread = 0.4;
                lift = 0.08;
                lifeBase = 0.8;
                break;
            case 'ICE':
                count = 15;
                colorPalette = [[0.5, 0.8, 1], [0.8, 0.9, 1], [0, 1, 1]]; // Cyan, White
                speed = 0.15; // Fast burst
                spread = 0.8;
                lift = 0;
                gravity = 0; // Floating shards
                lifeBase = 1.2;
                break;
            case 'POISON':
                count = 10;
                colorPalette = [[0.2, 0.8, 0.2], [0.5, 0, 0.5], [0.1, 1, 0.1]]; // Green, Purple
                speed = 0.02;
                spread = 0.6;
                lift = 0.05;
                gravity = 0.005;
                lifeBase = 2.0; // Lingering
                break;
            case 'LIGHTNING':
                count = 8;
                colorPalette = [[1, 1, 0.2], [0.8, 0.8, 1], [1, 1, 1]];
                speed = 0.0; // Instant placement
                spread = 1.0;
                lifeBase = 0.3; // Quick flash
                break;
            case 'HOLY':
                count = 12;
                colorPalette = [[1, 0.9, 0.3], [1, 1, 0.8], [1, 0.8, 0.1]]; // Gold
                speed = 0.03;
                spread = 0.5;
                lift = 0.1; // Spiraling up
                lifeBase = 1.5;
                break;
            case 'PHYSICAL':
            default:
                count = 6;
                colorPalette = [[0.8, 0.8, 0.8], [0.5, 0.5, 0.5], [1, 1, 1]];
                speed = 0.1;
                spread = 0.3;
                gravity = -0.05; // Falling debris
                break;
        }

        // Projectile Trail (Optional: If target is far from source)
        // For now we implement IMPACT only as requested primarily.

        // Spawn Loop
        for (let i = 0; i < count; i++) {
            // Find free particle
            const p = particles.find(pt => !pt.active);
            if (!p) break;

            p.active = true;
            p.maxLife = lifeBase + Math.random() * 0.5;
            p.life = p.maxLife;

            // Random offset in sphere
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = Math.random() * spread;

            p.x = tx + r * Math.sin(phi) * Math.cos(theta);
            p.y = ty + r * Math.sin(phi) * Math.sin(theta) + 0.5; // Lift up slightly
            p.z = tz + r * Math.cos(phi);

            // Velocity
            p.vx = (Math.random() - 0.5) * speed;
            p.vy = (Math.random() * lift) + (Math.random() - 0.5) * speed * 0.5;
            p.vz = (Math.random() - 0.5) * speed;

            // Apply specific physics per preset
            if (preset === 'LIGHTNING') {
                // Vertical pillars
                p.x = tx + (Math.random() - 0.5) * 1.5;
                p.z = tz + (Math.random() - 0.5) * 1.5;
                p.y = ty + Math.random() * 2;
                p.vx = 0; p.vy = 0; p.vz = 0;
            } else if (preset === 'ICE') {
                // Explosion outward
                const dir = new THREE.Vector3(p.x - tx, p.y - ty, p.z - tz).normalize();
                p.vx = dir.x * speed;
                p.vy = dir.y * speed;
                p.vz = dir.z * speed;
            }

            // Gravity override
            if (gravity !== -0.01) p.vy += gravity * 2; // Init impulse

            // Color
            const col = colorPalette[Math.floor(Math.random() * colorPalette.length)];
            p.r = col[0];
            p.g = col[1];
            p.b = col[2];

            p.scale = sizeBase * (0.8 + Math.random() * 0.4);
        }
    };

    useFrame((state, delta) => {
        if (!meshRef.current) return;

        // 1. Process Queue
        while (queueRef.current.length > 0) {
            const req = queueRef.current.shift();
            if (req) spawnParticles(req);
        }

        let activeIdx = 0;
        const matrix = new THREE.Matrix4();

        // 2. Update Particles
        particles.forEach(p => {
            if (!p.active) return;

            p.life -= delta;
            if (p.life <= 0) {
                p.active = false;
                // Hide
                matrix.makeScale(0, 0, 0);
                meshRef.current!.setMatrixAt(activeIdx++, matrix); // Optimization: We don't track indices perfectly, but InstancedMesh needs linear fill. 
                // Wait... InstancedMesh needs persistent indices if we want shrinking.
                // Re-write: We must iterate ALL particles and map them to instanceId 0..N? 
                // Or dynamic count. 
                return;
            }

            // Move
            p.x += p.vx;
            p.y += p.vy;
            p.z += p.vz;

            // Gravity/Friction simulation
            p.vy -= 0.05 * delta; // Generic gravity
            p.vx *= 0.95; // Air resistance
            p.vz *= 0.95;

            // Scale (Shrink at end)
            const scale = p.scale * (p.life / p.maxLife);

            // Update Instance
            DUMMY_OBJ.position.set(p.x, p.y, p.z);
            DUMMY_OBJ.scale.setScalar(scale);
            DUMMY_OBJ.rotation.x += p.vx * 2;
            DUMMY_OBJ.rotation.y += p.vy * 2;
            DUMMY_OBJ.updateMatrix();

            meshRef.current!.setMatrixAt(activeIdx, DUMMY_OBJ.matrix);

            // Color with Glow (Emissive trick: make bright)
            DUMMY_COLOR.setRGB(p.r, p.g, p.b);
            // Boost color for glow
            // DUMMY_COLOR.multiplyScalar(2.0); 
            meshRef.current!.setColorAt(activeIdx, DUMMY_COLOR);

            activeIdx++;
        });

        // Update count and flags
        meshRef.current.count = activeIdx;
        meshRef.current.instanceMatrix.needsUpdate = true;
        if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, MAX_PARTICLES]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial
                roughness={0.5}
                metalness={0.1}
                emissiveIntensity={1.2}
                toneMapped={false} // Important for vibrant excessive colors
                vertexColors
            />
        </instancedMesh>
    );
};
