import React, { useMemo, useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useFrame, useLoader } from '@react-three/fiber';

interface BlockbenchElement {
    from: [number, number, number];
    to: [number, number, number];
    rotation?: {
        angle: number;
        axis: 'x' | 'y' | 'z';
        origin: [number, number, number];
    };
    faces: {
        [key: string]: {
            uv: [number, number, number, number];
            texture: string;
            rotation?: number;
        };
    };
}

interface BlockbenchModel {
    texture_size: [number, number];
    textures: { [key: string]: string };
    elements: BlockbenchElement[];
}

// Blockbench JSON'ı Three.js mesh'lerine çevirir
export const BlockbenchPortal: React.FC<{
    jsonPath: string;
    texturePath: string;
    animationTexturePath?: string;
    scale?: number;
    position?: [number, number, number];
}> = ({ jsonPath, texturePath, animationTexturePath, scale = 1, position = [0, 0, 0] }) => {
    const groupRef = useRef<THREE.Group>(null);
    const [model, setModel] = useState<BlockbenchModel | null>(null);
    const [texture, setTexture] = useState<THREE.Texture | null>(null);
    const [animTexture, setAnimTexture] = useState<THREE.Texture | null>(null);

    // JSON ve texture'ları yükle
    useEffect(() => {
        // JSON yükle
        fetch(jsonPath)
            .then(res => res.json())
            .then(data => setModel(data))
            .catch(err => console.error('Portal JSON yüklenemedi:', err));

        // Ana texture
        const loader = new THREE.TextureLoader();
        loader.load(texturePath, (tex) => {
            tex.magFilter = THREE.NearestFilter;
            tex.minFilter = THREE.NearestFilter;
            tex.colorSpace = THREE.SRGBColorSpace;
            setTexture(tex);
        });

        // Animasyon texture (varsa)
        if (animationTexturePath) {
            loader.load(animationTexturePath, (tex) => {
                tex.magFilter = THREE.NearestFilter;
                tex.minFilter = THREE.NearestFilter;
                tex.colorSpace = THREE.SRGBColorSpace;
                setAnimTexture(tex);
            });
        }
    }, [jsonPath, texturePath, animationTexturePath]);

    // Animasyon frame'i (sprite sheet animation)
    const animFrameRef = useRef(0);
    const lastFrameTime = useRef(0);

    useFrame((state) => {
        // Yüzen hareket
        if (groupRef.current) {
            groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.5) * 0.15;
        }

        // Sprite sheet animasyonu (animTexture varsa)
        if (animTexture) {
            const now = state.clock.elapsedTime;
            if (now - lastFrameTime.current > 0.1) { // 10 FPS
                lastFrameTime.current = now;
                animFrameRef.current = (animFrameRef.current + 1) % 10; // 10 frame varsayalım
                // UV offset güncelle
                animTexture.offset.y = animFrameRef.current * 0.1;
            }
        }
    });

    // Mesh'leri oluştur
    const meshes = useMemo(() => {
        if (!model || !texture) return null;

        const textureSize = model.texture_size || [64, 64];
        const meshList: JSX.Element[] = [];

        model.elements.forEach((el, index) => {
            // Boyutları hesapla (Blockbench 16 birim = 1 minecraft block)
            const sizeX = (el.to[0] - el.from[0]) / 16;
            const sizeY = (el.to[1] - el.from[1]) / 16;
            const sizeZ = (el.to[2] - el.from[2]) / 16;

            // Merkez pozisyonu
            const centerX = (el.from[0] + el.to[0]) / 2 / 16 - 0.5;
            const centerY = (el.from[1] + el.to[1]) / 2 / 16;
            const centerZ = (el.from[2] + el.to[2]) / 2 / 16 - 0.5;

            // Rotation
            let rotationEuler = new THREE.Euler(0, 0, 0);
            let pivotOffset = new THREE.Vector3(0, 0, 0);

            if (el.rotation) {
                const angle = THREE.MathUtils.degToRad(el.rotation.angle);
                const pivot = new THREE.Vector3(
                    el.rotation.origin[0] / 16 - 0.5,
                    el.rotation.origin[1] / 16,
                    el.rotation.origin[2] / 16 - 0.5
                );

                switch (el.rotation.axis) {
                    case 'x': rotationEuler.x = angle; break;
                    case 'y': rotationEuler.y = angle; break;
                    case 'z': rotationEuler.z = angle; break;
                }

                // Pivot offset hesapla
                const pos = new THREE.Vector3(centerX, centerY, centerZ);
                pos.sub(pivot);
                pos.applyEuler(rotationEuler);
                pos.add(pivot);
                pivotOffset = pos.sub(new THREE.Vector3(centerX, centerY, centerZ));
            }

            // Hangi texture kullanılacak?
            const faceData = el.faces.north || Object.values(el.faces)[0];
            const useAnimTexture = faceData?.texture === '#2' && animTexture;
            const materialTexture = useAnimTexture ? animTexture : texture;

            // 6 yüz için UV koordinatları
            const geometry = new THREE.BoxGeometry(sizeX, sizeY, sizeZ);

            // Basit material (texture ile)
            const material = new THREE.MeshStandardMaterial({
                map: materialTexture,
                transparent: true,
                alphaTest: 0.1,
                side: THREE.DoubleSide,
            });

            // Emissive ekle (portal efekti için)
            if (useAnimTexture) {
                material.emissive = new THREE.Color('#a855f7');
                material.emissiveIntensity = 0.5;
            }

            meshList.push(
                <mesh
                    key={index}
                    geometry={geometry}
                    material={material}
                    position={[
                        centerX + pivotOffset.x,
                        centerY + pivotOffset.y,
                        centerZ + pivotOffset.z
                    ]}
                    rotation={rotationEuler}
                    castShadow
                    receiveShadow
                />
            );
        });

        return meshList;
    }, [model, texture, animTexture]);

    if (!model || !texture) {
        // Yüklenirken placeholder
        return (
            <group position={position}>
                <mesh>
                    <torusGeometry args={[1, 0.1, 8, 32]} />
                    <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={1} />
                </mesh>
            </group>
        );
    }

    return (
        <group ref={groupRef} position={position} scale={[scale, scale, scale]}>
            {meshes}
            <pointLight position={[0, 1, 0]} color="#a855f7" intensity={3} distance={5} />
        </group>
    );
};

export default BlockbenchPortal;
