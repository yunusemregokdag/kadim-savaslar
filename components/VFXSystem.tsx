import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ════════════════════════════════════════════════════════════════════════════════
// 1. ARCHITECTURE & TYPES
// ════════════════════════════════════════════════════════════════════════════════

export type VFXPresetName = 'FIRE' | 'ICE' | 'POISON' | 'LIGHTNING' | 'HOLY' | 'PHYSICAL' | 'SHIELD_BUFF';

export type VFXType = 'IMPACT' | 'PROJECTILE' | 'STATUS';

// Input for spawning a VFX
export interface VFXRequest {
    id: string;
    preset: VFXPresetName;
    position: [number, number, number];
    targetPosition?: [number, number, number];
    targetType?: string;
    type?: VFXType; // New: Impact, Projectile, Status
    duration?: number; // New: For status effects
    attachToEntityId?: string; // New: To follow an entity
}

// Particle definition for our pool (PHYSICS BASED)
interface Particle {
    active: boolean;
    x: number; y: number; z: number;
    vx: number; vy: number; vz: number;
    r: number; g: number; b: number;
    scale: number;
    maxLife: number;
    life: number;
    type: 'cube' | 'flat' | 'thin';
}

// Effect Instance (SCRIPTED MOTION)
interface EffectInstance {
    id: string;
    preset: VFXPresetName;
    type: 'STATUS' | 'PROJECTILE'; // Effect type
    active: boolean;
    startTime: number;
    duration: number;
    attachToEntityId?: string;
    // Current state
    x: number; y: number; z: number;
    // For projectiles
    startX?: number; startY?: number; startZ?: number;
    targetX?: number; targetY?: number; targetZ?: number;
    travelDuration?: number;
    impactTriggered?: boolean;
    data: any; // e.g. orbital rotation angle
}

// Global Manager
class VFXManager {
    private listeners: ((req: VFXRequest) => void)[] = [];
    private locationProviders: Map<string, () => [number, number, number]> = new Map();

    // Trigger an effect
    public spawn(skillName: string, start: [number, number, number], target?: [number, number, number], targetType = 'mob', attachToEntityId?: string) {
        let preset = this.resolvePreset(skillName);
        let type: VFXType = 'IMPACT';
        let duration = 1.0;

        // Custom Logic per Skill
        if (skillName === 'Kalkan Duravı') {
            preset = 'SHIELD_BUFF';
            type = 'STATUS';
            duration = 3.0;
        }

        this.emit({
            id: Math.random().toString(36).slice(2),
            preset,
            position: start,
            targetPosition: target,
            targetType,
            type,
            duration,
            attachToEntityId
        });
    }

    public resolvePreset(skillName: string): VFXPresetName {
        const s = (skillName || '').toLowerCase();

        // Shield/Buff effects
        if (s.includes('kalkan') || s.includes('shield') || s.includes('zırh') || s.includes('buff') || s.includes('guardian')) return 'SHIELD_BUFF';

        // Fire effects
        if (s.includes('fire') || s.includes('burn') || s.includes('flame') || s.includes('inferno') || s.includes('ateş') || s.includes('yanık') || s.includes('mage_2') || s.includes('mage_6')) return 'FIRE';

        // Ice effects
        if (s.includes('ice') || s.includes('frost') || s.includes('freeze') || s.includes('cold') || s.includes('buz') || s.includes('don') || s.includes('arctic')) return 'ICE';

        // Poison effects
        if (s.includes('poison') || s.includes('toxin') || s.includes('venom') || s.includes('decay') || s.includes('zehir') || s.includes('archer_5')) return 'POISON';

        // Lightning effects
        if (s.includes('bolt') || s.includes('shock') || s.includes('thunder') || s.includes('lightning') || s.includes('yıldırım') || s.includes('şimşek') || s.includes('mage_1')) return 'LIGHTNING';

        // Holy/Heal effects
        if (s.includes('holy') || s.includes('heal') || s.includes('light') || s.includes('divine') || s.includes('kutsal') || s.includes('şifa') || s.includes('cleric')) return 'HOLY';

        // Physical/Melee (warrior, dövüşçü, etc.)
        if (s.includes('slash') || s.includes('spin') || s.includes('bash') || s.includes('rage') || s.includes('warrior') || s.includes('kılıç') || s.includes('saldırı')) return 'PHYSICAL';

        // Default fallback
        return 'PHYSICAL';
    }

    // Register a way to get entity position dynamically
    public registerEntityLocationProvider(id: string, provider: () => [number, number, number]) {
        this.locationProviders.set(id, provider);
    }

    public getEntityPosition(id: string): [number, number, number] | null {
        const p = this.locationProviders.get(id);
        return p ? p() : null;
    }

    public remapEntityLocationProvider(oldId: string, newId: string) {
        const provider = this.locationProviders.get(oldId);
        if (provider) {
            this.locationProviders.set(newId, provider);
            this.locationProviders.delete(oldId);
            this.emitRemap(oldId, newId);
        }
    }

    public unregisterEntityLocationProvider(id: string) {
        this.locationProviders.delete(id);
    }

    private emitRemap(oldId: string, newId: string) {
        // We need a specific event to notify runtime overlay
        // Reuse emit with a special type or add new listener type
        // For simplicity, we'll patch the activeEffects in Overlay directly via a custom event or subscription
        // but current emit is only for SPAWN.
        // Let's add a secondary listener for system events
        this.systemListeners.forEach(cb => cb({ type: 'REMAP', oldId, newId }));
    }

    private systemListeners: ((event: any) => void)[] = [];

    public subscribeSystem(cb: (event: any) => void) {
        this.systemListeners.push(cb);
        return () => { this.systemListeners = this.systemListeners.filter(l => l !== cb); };
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
// 2. RUNTIME SYSTEM
// ════════════════════════════════════════════════════════════════════════════════

const MAX_PARTICLES = 1500;
const DUMMY_OBJ = new THREE.Object3D();
const DUMMY_COLOR = new THREE.Color();

// Helper
function stableHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
    }
    return Math.abs(hash);
}

export const GameVFXOverlay: React.FC<{
    // Optional: Pass function to get player pos directly if needed, 
    // but vfxManager pattern prefers decoupling.
}> = () => {

    const meshRef = useRef<THREE.InstancedMesh>(null);

    // 1. Particle Pool (Physics) - Start ALL particles far offscreen
    const particles = useMemo<Particle[]>(() => {
        return new Array(MAX_PARTICLES).fill(0).map(() => ({
            active: false,
            x: -9999, y: -9999, z: -9999, // Start offscreen to prevent black artifacts
            vx: 0, vy: 0, vz: 0,
            r: 1, g: 1, b: 1,
            scale: 0, // Start with 0 scale
            maxLife: 1,
            life: 0,
            type: 'cube'
        }));
    }, []);

    // 2. Active Effects List (Scripted Instances)
    const activeEffects = useRef<EffectInstance[]>([]);

    const nextParticleIdx = useRef(0);
    const queueRef = useRef<VFXRequest[]>([]);

    useEffect(() => {
        const unsub1 = vfxManager.subscribe((req) => {
            queueRef.current.push(req);
        });
        const unsub2 = vfxManager.subscribeSystem((ev) => {
            if (ev.type === 'REMAP') {
                activeEffects.current.forEach(eff => {
                    if (eff.attachToEntityId === ev.oldId) {
                        eff.attachToEntityId = ev.newId;
                    }
                });
            }
        });
        return () => { unsub1(); unsub2(); };
    }, []);

    // 🔧 FIX: Initialize all particles FAR offscreen to prevent black pixel artifacts
    useEffect(() => {
        if (!meshRef.current) return;

        const matrix = new THREE.Matrix4();
        matrix.makeTranslation(-9999, -9999, -9999);
        matrix.scale(new THREE.Vector3(0, 0, 0));

        for (let i = 0; i < MAX_PARTICLES; i++) {
            meshRef.current.setMatrixAt(i, matrix);
        }
        meshRef.current.instanceMatrix.needsUpdate = true;
    }, []);

    // --- LOGIC: SPAWN IMPACT ---
    const spawnImpact = (req: VFXRequest) => {
        const { preset, position, targetPosition, targetType } = req;
        const [tx, ty, tz] = targetPosition || position;
        const seed = stableHash(preset + (targetType || ''));

        // Default Params
        let count = 8;
        let colorPalette: [number, number, number][] = [[1, 1, 1]];
        let speed = 0.2;
        let spread = 1.0;
        let lift = 0.2;
        let gravity = -0.02;
        let lifeBase = 1.0;
        let sizeBase = 0.4;
        let shape: 'cube' | 'flat' | 'thin' = 'cube';

        // Configure based on Preset
        switch (preset) {
            case 'FIRE':
                count = 16;
                colorPalette = [[1, 0.4, 0], [1, 0.8, 0], [0.8, 0.2, 0]];
                speed = 0.15; spread = 0.6; lift = 0.15; lifeBase = 0.8;
                break;
            case 'ICE':
                count = 20;
                colorPalette = [[0.4, 0.9, 1], [0.8, 1, 1], [0, 1, 1]];
                speed = 0.3; spread = 1.2; lift = 0.1; gravity = 0; lifeBase = 1.0; shape = 'flat';
                break;
            case 'POISON':
                count = 12;
                colorPalette = [[0.2, 1, 0.2], [0.6, 0, 0.8], [0.8, 1, 0.4]];
                speed = 0.05; spread = 0.8; lift = 0.1; gravity = 0.01; lifeBase = 2.0;
                break;
            case 'LIGHTNING':
                count = 10;
                colorPalette = [[1, 1, 0.4], [0.8, 0.8, 1], [1, 1, 1]];
                speed = 0.05; spread = 1.5; lifeBase = 0.4; shape = 'thin';
                break;
            case 'HOLY':
                count = 16;
                colorPalette = [[1, 0.9, 0.2], [1, 1, 0.7], [1, 0.7, 0]];
                speed = 0.08; spread = 0.7; lift = 0.25; lifeBase = 1.5;
                break;
            case 'PHYSICAL':
            default:
                count = 8;
                colorPalette = [[0.9, 0.9, 0.9], [0.6, 0.6, 0.6], [1, 0.2, 0.2]];
                speed = 0.2; spread = 0.5; gravity = -0.06;
                break;
        }

        // Spawn
        for (let i = 0; i < count; i++) {
            const idx = nextParticleIdx.current;
            nextParticleIdx.current = (nextParticleIdx.current + 1) % MAX_PARTICLES;
            const p = particles[idx];

            p.active = true;
            p.maxLife = lifeBase + Math.random() * 0.5;
            p.life = p.maxLife;
            p.type = shape;

            // Sphere random
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = Math.random() * spread;

            p.x = tx + r * Math.sin(phi) * Math.cos(theta);
            p.y = ty + r * Math.sin(phi) * Math.sin(theta) + 1.0;
            p.z = tz + r * Math.cos(phi);

            // Velocity
            p.vx = (Math.random() - 0.5) * speed;
            p.vy = (Math.random() * lift) + (Math.random() - 0.5) * speed * 0.5;
            p.vz = (Math.random() - 0.5) * speed;

            if (preset === 'LIGHTNING') {
                p.x = tx + (Math.random() - 0.5) * 2;
                p.z = tz + (Math.random() - 0.5) * 2;
                p.y = ty + Math.random() * 3;
                p.vx = 0; p.vy = 0; p.vz = 0;
            } else if (preset === 'ICE') {
                const dir = new THREE.Vector3(p.x - tx, p.y - ty, p.z - tz).normalize();
                p.vx = dir.x * speed;
                p.vy = dir.y * speed;
                p.vz = dir.z * speed;
            }
            if (gravity !== -0.01) p.vy += gravity * 2;

            const col = colorPalette[Math.floor(Math.random() * colorPalette.length)];
            p.r = col[0]; p.g = col[1]; p.b = col[2];
            p.scale = sizeBase * (0.8 + Math.random() * 0.4);
        }
    };

    useFrame((state, delta) => {
        if (!meshRef.current) return;
        const now = state.clock.elapsedTime;

        // 1. Process Queue
        while (queueRef.current.length > 0) {
            const req = queueRef.current.shift()!;

            if (req.type === 'STATUS') {
                // Register new persistent effect
                activeEffects.current.push({
                    id: req.id,
                    preset: req.preset,
                    active: true,
                    startTime: now,
                    duration: req.duration || 3.0,
                    attachToEntityId: req.attachToEntityId,
                    x: req.position[0],
                    y: req.position[1],
                    z: req.position[2],
                    data: { angle: 0 }
                });
            } else {
                // Instant Impact
                spawnImpact(req);
            }
        }

        let particleRenderIdx = 0;

        // 2. Render PHYSICS Particles
        for (let i = 0; i < MAX_PARTICLES; i++) {
            const p = particles[i];

            if (!p.active) {
                // We SKIP rendering inactive ones (effectively) by not incrementing particleRenderIdx?
                // No, InstancedMesh needs linear indices. We must set scale 0 for holes.
                // But wait, we share the SAME mesh for physics particles AND scripted particles to save draw calls.
                // So let's fill physics particles first.
                // NOTE: Strategy -> We just loop everything. Inactive ones get scale 0.
            }

            if (p.active) {
                p.life -= delta;
                if (p.life <= 0) p.active = false;
                else {
                    p.x += p.vx; p.y += p.vy; p.z += p.vz;
                    p.vy -= 0.05 * delta; p.vx *= 0.95; p.vz *= 0.95;
                }
            }

            if (p.active) {
                const lifeRatio = p.life / p.maxLife;
                const scale = p.scale * lifeRatio;
                let sx = scale, sy = scale, sz = scale;
                if (p.type === 'flat') { sx *= 0.1; sy *= 1.5; sz *= 1.5; }
                if (p.type === 'thin') { sx *= 0.2; sy *= 4.0; sz *= 0.2; }

                DUMMY_OBJ.position.set(p.x, p.y, p.z);
                DUMMY_OBJ.scale.set(sx, sy, sz);
                DUMMY_OBJ.rotation.x += p.vx * 5;
                DUMMY_OBJ.rotation.y += p.vy * 5;
                if (p.type === 'thin') DUMMY_OBJ.rotation.set(0, 0, 0);
                DUMMY_OBJ.updateMatrix();

                meshRef.current.setMatrixAt(particleRenderIdx, DUMMY_OBJ.matrix);
                DUMMY_COLOR.setRGB(p.r, p.g, p.b);
                meshRef.current.setColorAt(particleRenderIdx, DUMMY_COLOR);
            } else {
                // Move inactive particles FAR offscreen (scale 0 alone can still render as black dots)
                DUMMY_OBJ.position.set(-9999, -9999, -9999);
                DUMMY_OBJ.scale.set(0, 0, 0);
                DUMMY_OBJ.updateMatrix();
                meshRef.current.setMatrixAt(particleRenderIdx, DUMMY_OBJ.matrix);
            }
            particleRenderIdx++;
        }

        // 3. Render SCRIPTED Effects (Status/Buffs)
        // We use the remaining slots in the pool (MAX_PARTICLES.. limit?)
        // Or we just continue incrementing particleRenderIdx if < MAX.

        activeEffects.current = activeEffects.current.filter(eff => {
            const age = now - eff.startTime;
            if (age > eff.duration) return false;

            // Update Position (Support attachment)
            if (eff.attachToEntityId) {
                const pos = vfxManager.getEntityPosition(eff.attachToEntityId);
                if (pos) {
                    eff.x = pos[0];
                    eff.y = pos[1];
                    eff.z = pos[2];
                }
            }

            // Render Logic per Preset
            if (eff.preset === 'SHIELD_BUFF') {
                // 3 Orbiting Shields
                const orbitSpeed = 3.5;
                const radius = 0.9;
                const count = 3;

                // Fade out at end
                let alpha = 1.0;
                if (age > eff.duration - 0.25) {
                    alpha = (eff.duration - age) / 0.25;
                }

                for (let j = 0; j < count; j++) {
                    if (particleRenderIdx >= MAX_PARTICLES) break;

                    const angle = (age * orbitSpeed) + (j * (Math.PI * 2 / count));
                    const px = eff.x + Math.cos(angle) * radius;
                    const py = eff.y + 1.0; // yOffset
                    const pz = eff.z + Math.sin(angle) * radius;

                    DUMMY_OBJ.position.set(px, py, pz);
                    DUMMY_OBJ.scale.set(0.1, 0.35, 0.35); // Shield shape (Flat box)

                    // Look away from center
                    DUMMY_OBJ.lookAt(eff.x, py, eff.z);
                    DUMMY_OBJ.rotateY(Math.PI / 2); // Face outward

                    DUMMY_OBJ.updateMatrix();

                    meshRef.current.setMatrixAt(particleRenderIdx, DUMMY_OBJ.matrix);

                    // Cyan/Blue shield color
                    DUMMY_COLOR.setRGB(0.2 * alpha, 0.8 * alpha, 1.0 * alpha);
                    meshRef.current.setColorAt(particleRenderIdx, DUMMY_COLOR);

                    particleRenderIdx++;
                }
            }
            return true;
        });

        // Clear remaining slots (if any active last frame but not now)
        // Move them far offscreen to prevent black pixel artifacts
        for (let k = 0; k < 100; k++) {
            if (particleRenderIdx + k < MAX_PARTICLES) {
                DUMMY_OBJ.position.set(-9999, -9999, -9999);
                DUMMY_OBJ.scale.set(0, 0, 0);
                DUMMY_OBJ.updateMatrix();
                meshRef.current.setMatrixAt(particleRenderIdx + k, DUMMY_OBJ.matrix);
            }
        }

        meshRef.current.count = MAX_PARTICLES;
        meshRef.current.instanceMatrix.needsUpdate = true;
        if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    });

    return (
        <instancedMesh
            ref={meshRef}
            args={[undefined, undefined, MAX_PARTICLES]}
            frustumCulled={false}
        >
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial
                roughness={0.4}
                metalness={0.2}
                emissiveIntensity={2.0}
                toneMapped={false}
                vertexColors
                transparent
                opacity={0.9}
            />
        </instancedMesh>
    );
};
