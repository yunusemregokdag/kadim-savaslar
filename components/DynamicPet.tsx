import React, { useMemo, useEffect, useRef } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import { useLoader, useFrame } from '@react-three/fiber';
import { OBJLoader } from 'three-stdlib';
import * as THREE from 'three';

interface DynamicPetProps {
    modelPath: string;
    color?: string;
    scale?: number;
}

// Helper to apply color smart
const applySmartMaterial = (child: any, color: string) => {
    if (!child.isMesh) return;

    // Clone or create material
    let mat = child.material;
    if (!mat) {
        mat = new THREE.MeshStandardMaterial();
    } else if (Array.isArray(mat)) {
        mat = mat.map((m: any) => m.clone());
    } else {
        mat = mat.clone();
    }

    const applyToMat = (m: THREE.MeshStandardMaterial) => {
        // IF TEXTURE EXISTS, DO NOT OVERRIDE COLOR
        // The user likely has custom textures now.
        if (m.map) {
            // Optional: You could add a slight emissive if you really want them to glow, 
            // but 'breaking appearances' usually means losing texture.
            // We will leave it alone or just ensure standard settings.
            m.roughness = 0.5;
            m.metalness = 0.5;
            return;
        }

        // DETECT EYES: Heuristics based on Color or Name
        // 1. Color Check: Is it very dark?
        const isDarkColor = m.color.r < 0.1 && m.color.g < 0.1 && m.color.b < 0.1;

        // 2. Name Check: Does mesh name imply eye? (Common in voxel exports)
        const name = child.name ? child.name.toLowerCase() : '';
        const isEyeName = name.includes('eye') || name.includes('göz') || name.includes('pupil');

        if (isDarkColor || isEyeName) {
            m.color.set('black');
            m.roughness = 0.2; // Shiny eyes
            m.emissive.setHex(0x000000);
            m.emissiveIntensity = 0;
        } else {
            // Body color
            // Only override if no texture
            m.color.set(color);
            m.emissive.set(color);

            // GLOW LOGIC (+7 Style)
            // Reduced intensity to avoid "nuclear" look if not needed
            m.emissiveIntensity = 0.5;
            m.toneMapped = true; // Use tone mapping for better color accuracy
            m.roughness = 0.4;
            m.transparent = true;
            m.opacity = 0.95;
        }
    };

    if (Array.isArray(mat)) {
        mat.forEach(applyToMat);
    } else {
        applyToMat(mat);
    }

    child.material = mat;
};

// Inner component for GLTF models
function GltfPet({ modelPath, color, scale = 1 }: DynamicPetProps) {
    const { scene, animations } = useGLTF(modelPath);
    const { actions } = useAnimations(animations, scene);
    const clonedScene = useMemo(() => scene.clone(), [scene]);
    const groupRef = useRef<THREE.Group>(null);

    useEffect(() => {
        // Apply Color / Materials
        if (color) {
            clonedScene.traverse((child: any) => applySmartMaterial(child, color));
        }
    }, [clonedScene, color]);

    useEffect(() => {
        // Play first animation by default (Idle/Walk)
        if (actions && animations.length > 0) {
            const actionName = Object.keys(actions)[0];
            const action = actions[actionName];
            if (action) {
                action.reset().fadeIn(0.5).play();
                return () => {
                    action.fadeOut(0.5);
                };
            }
        }
    }, [actions, animations]);

    // Make pet look at camera
    useFrame((state) => {
        if (groupRef.current) {
            // Get camera position
            const cam = state.camera.position;
            // Only rotate on Y axis (horizontal)
            const petPos = groupRef.current.getWorldPosition(new THREE.Vector3());
            const angle = Math.atan2(cam.x - petPos.x, cam.z - petPos.z);
            groupRef.current.rotation.y = angle;
        }
    });

    return (
        <group ref={groupRef}>
            <primitive object={scene} scale={[scale, scale, scale]} />
        </group>
    );
}

// Inner component for OBJ models
function ObjPet({ modelPath, color, scale = 1 }: DynamicPetProps) {
    const obj = useLoader(OBJLoader, modelPath);
    const clonedObj = useMemo(() => obj.clone(), [obj]);

    useEffect(() => {
        if (color) {
            clonedObj.traverse((child: any) => applySmartMaterial(child, color));
        }
    }, [clonedObj, color]);

    return <primitive object={clonedObj} scale={[scale, scale, scale]} />;
}

export function DynamicPet(props: DynamicPetProps) {
    const { modelPath } = props;

    // Safety check
    if (!modelPath) return null;

    const isObj = modelPath.toLowerCase().endsWith('.obj');

    try {
        if (isObj) {
            return <ObjPet {...props} />;
        }
        return <GltfPet {...props} />;
    } catch (e) {
        console.error("Error loading pet:", modelPath, e);
        return null;
    }
}
