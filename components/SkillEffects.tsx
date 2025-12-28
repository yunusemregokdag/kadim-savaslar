import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { SKILL_ASSETS, SkillAssetConfig } from './SkillAssetRegistry';
import { soundManager } from './SoundManager';

// --- FALLBACK ASSET (Prevents Crash) ---
const SAFE_MODEL_PATH = '/models/items/weapons/warrior/warrior_sword_shiny.gltf';

// --- VISUAL ENHANCEMENT LOGIC (Reused) ---
const applyVisualEnhancements = (scene: THREE.Object3D, visualType: string, colorOverride?: string) => {
    scene.traverse((child) => {
        if ((child as unknown as THREE.Mesh).isMesh) {
            const m = (child as unknown as THREE.Mesh).material as THREE.MeshStandardMaterial;
            if (m) {
                m.transparent = true;
                m.alphaTest = 0.5;
                m.side = THREE.DoubleSide;

                // Optimized Material Settings for Mobile
                m.precision = 'lowp';
                m.flatShading = false;

                // Color Logic
                let targetColor = new THREE.Color(0xffffff);

                if (visualType.includes('arctic') || visualType.includes('frost')) targetColor.set('#00ffff');
                else if (visualType.includes('warrior')) targetColor.set('#ff4500');
                else if (visualType.includes('gale')) targetColor.set('#14b8a6');
                else if (visualType.includes('archer')) targetColor.set('#22c55e');
                else if (visualType.includes('mage')) targetColor.set('#8b5cf6');
                else if (visualType.includes('cleric')) targetColor.set('#fef3c7');

                if (colorOverride) targetColor.set(colorOverride);

                m.emissive = targetColor;
                m.emissiveIntensity = 2.0;
                m.color.lerp(targetColor, 0.5);
            }
        }
    });
};

interface SkillEffectsProps {
    activeSkills: { id: string, visual: string, modelPath?: string, position: [number, number, number], targetPosition?: [number, number, number] }[];
    onEffectComplete: (id: string) => void;
}

// --- SINGLE POOL COMPONENT ---
// Manages N instances of a specific skill type
const SkillTypePool: React.FC<{
    type: string;
    config: SkillAssetConfig;
    activeRequests: any[];
    onComplete: (id: string) => void;
}> = ({ type, config, activeRequests, onComplete }) => {

    // 1. LOAD ASSET (ONCE)
    // Detect if we need fallback
    const isMissing = config.path.includes('/models/skills');
    const loadPath = isMissing
        ? SAFE_MODEL_PATH
        : (config.extension === 'gltf' && (!config.count || config.count <= 1))
            ? `${config.path}${config.modelBase}.gltf`
            : SAFE_MODEL_PATH; // Fallback for complex sequences for now to ensure stability

    const { scene } = useGLTF(loadPath);
    const POOL_SIZE = 6; // Max concurrent effects of this type

    // 2. CREATE TEMPLATE (ONCE)
    const template = useMemo(() => {
        const t = scene.clone();
        applyVisualEnhancements(t, type, config.color);

        // Add default sparkles to template to avoid re-creating them
        // Note: Sparkles defined in JSX are expensive to pool manually in pure Three.js
        // We will stick to Mesh pooling here.
        return t;
    }, [scene, type, config.color]);

    // 3. POOL STATE
    // We use a Ref to store the actual Three.js objects (Pool)
    const poolRef = useRef<{
        group: THREE.Group;
        active: boolean;
        id: string | null;
        startTime: number;
        targetPos?: THREE.Vector3;
    }[]>([]);

    const groupRef = useRef<THREE.Group>(null);
    const initialized = useRef(false);

    // Initialize Pool
    useEffect(() => {
        if (initialized.current || !groupRef.current) return;

        for (let i = 0; i < POOL_SIZE; i++) {
            const instance = template.clone();
            instance.visible = false;
            groupRef.current.add(instance);

            poolRef.current.push({
                group: instance,
                active: false,
                id: null,
                startTime: 0
            });
        }
        initialized.current = true;
    }, [template]);

    // 4. HANDLE REQUESTS (Effect Trigger)
    useEffect(() => {
        activeRequests.forEach(req => {
            // Check if already handling this ID
            const existing = poolRef.current.find(p => p.id === req.id);
            if (existing) return;

            // Find free slot
            const slot = poolRef.current.find(p => !p.active);
            if (slot) {
                // ACTIVATE
                slot.active = true;
                slot.id = req.id;
                slot.startTime = Date.now();
                slot.group.visible = true;
                slot.group.position.set(req.position[0], req.position[1], req.position[2]);
                slot.group.scale.setScalar(config.scale || 1);

                if (type.includes('projectile') && req.targetPosition) {
                    slot.targetPos = new THREE.Vector3(...req.targetPosition);
                    slot.group.lookAt(slot.targetPos);
                }

                // Play Sound
                if (config.sound) soundManager.playUrl(config.sound);
            }
        });
    }, [activeRequests, config.sound, config.scale, type]);

    // 5. ANIMATION LOOP (Single useFrame for all instances)
    useFrame((state, delta) => {
        const now = Date.now();
        poolRef.current.forEach(slot => {
            if (!slot.active) return;

            const elapsed = now - slot.startTime;
            const duration = (config.duration || 1) * 1000;

            // Movement Logic
            if (slot.targetPos) {
                const t = Math.min(1, elapsed / 500);
                slot.group.position.lerp(slot.targetPos, 0.1);
            } else {
                // Simple Idle Anim
                slot.group.rotation.y += delta * 5;

                // Pop-in/out scale
                let s = config.scale || 1;
                if (elapsed < 100) s *= elapsed / 100;
                if (elapsed > duration - 200) s *= (duration - elapsed) / 200;
                slot.group.scale.setScalar(Math.max(0.01, s));
            }

            // Finish
            if (elapsed > duration) {
                slot.active = false;
                slot.group.visible = false;
                if (slot.id) onComplete(slot.id);
                slot.id = null;
            }
        });
    });

    return <group ref={groupRef} />;
};

export const SkillEffects: React.FC<SkillEffectsProps> = ({ activeSkills, onEffectComplete }) => {
    // Determine which pools we need (based on SKILL_ASSETS keys)
    // To be safe and simple, we iterate all defined skills in registry.
    // In a huge MMO, we would dynamic load, but for specific class skills this is fine.

    // Optimization: Only render pools for skills that have been requested at least once
    // OR: Just render known skill types.

    // We will render pools for keys present in SKILL_ASSETS.
    // Since useGLTF is inside, it will trigger suspense/load.

    return (
        <group>
            {Object.keys(SKILL_ASSETS).map(key => (
                <SkillTypePool
                    key={key}
                    type={key}
                    config={SKILL_ASSETS[key]}
                    activeRequests={activeSkills.filter(s => s.visual === key)}
                    onComplete={onEffectComplete}
                />
            ))}
        </group>
    );
};
