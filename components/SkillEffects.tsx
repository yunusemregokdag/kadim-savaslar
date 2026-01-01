import React, { useEffect, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
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
                m.precision = 'lowp';
                m.flatShading = false;

                let targetColor = new THREE.Color(0xffffff);

                if (visualType.includes('arctic') || visualType.includes('frost')) targetColor.set('#00ffff');
                else if (visualType.includes('warrior')) targetColor.set('#ff4500');
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
const SkillTypePool: React.FC<{
    type: string;
    config: SkillAssetConfig;
    activeRequests: any[];
    onComplete: (id: string) => void;
}> = ({ type, config, activeRequests, onComplete }) => {

    const isMissing = config.path.includes('/models/skills');
    const loadPath = isMissing
        ? SAFE_MODEL_PATH
        : (config.extension === 'gltf' && (!config.count || config.count <= 1))
            ? `${config.path}${config.modelBase}.gltf`
            : SAFE_MODEL_PATH;

    const { scene } = useGLTF(loadPath);
    const POOL_SIZE = 6;

    const template = useMemo(() => {
        const t = scene.clone();
        applyVisualEnhancements(t, type, config.color);
        return t;
    }, [scene, type, config.color]);

    const poolRef = useRef<{
        group: THREE.Group;
        active: boolean;
        id: string | null;
        startTime: number;
    }[]>([]);

    const groupRef = useRef<THREE.Group>(null);
    const initialized = useRef(false);

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

    useEffect(() => {
        activeRequests.forEach(req => {
            const existing = poolRef.current.find(p => p.id === req.id);
            if (existing) return;

            const slot = poolRef.current.find(p => !p.active);
            if (slot) {
                slot.active = true;
                slot.id = req.id;
                slot.startTime = Date.now();
                slot.group.visible = true;
                slot.group.position.set(req.position[0], req.position[1], req.position[2]);
                slot.group.scale.setScalar(config.scale || 1);

                if (config.sound) soundManager.playUrl(config.sound);
            }
        });
    }, [activeRequests, config.sound, config.scale]);

    useFrame((state, delta) => {
        const now = Date.now();
        poolRef.current.forEach(slot => {
            if (!slot.active) return;

            const elapsed = now - slot.startTime;
            const duration = (config.duration || 1) * 1000;

            slot.group.rotation.y += delta * 5;
            let s = config.scale || 1;
            if (elapsed < 100) s *= elapsed / 100;
            if (elapsed > duration - 200) s *= (duration - elapsed) / 200;
            slot.group.scale.setScalar(Math.max(0.01, s));

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
