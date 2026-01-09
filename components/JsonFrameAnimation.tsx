import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';

interface JsonFrameAnimationProps {
    basePath: string; // Örn: /models/Character/reaper_model/models/reaper_model/
    framePrefix: string; // Örn: death_slice_
    frameCount: number; // Örn: 8
    extension?: string; // Örn: .json
    speed?: number; // FPS (Saniyedeki kare sayısı), default: 15
    loop?: boolean;
    scale?: number;
    position?: [number, number, number];
    rotation?: [number, number, number];
    onComplete?: () => void;
}

export const JsonFrameAnimation: React.FC<JsonFrameAnimationProps> = ({
    basePath,
    framePrefix,
    frameCount,
    extension = '.json',
    speed = 15,
    loop = false,
    scale = 1,
    position = [0, 0, 0],
    rotation = [0, 0, 0],
    onComplete
}) => {
    const groupRef = useRef<THREE.Group>(null);
    const [currentFrame, setCurrentFrame] = useState(0);
    const [models, setModels] = useState<THREE.Object3D[]>([]);
    const [loaded, setLoaded] = useState(false);

    // Zaman takibi
    const timerRef = useRef(0);
    const frameDuration = 1 / speed;

    // Dosya yollarını oluştur
    const fileUrls = useMemo(() => {
        const urls = [];
        for (let i = 1; i <= frameCount; i++) {
            urls.push(`${basePath}${framePrefix}${i}${extension}`);
        }
        return urls;
    }, [basePath, framePrefix, frameCount, extension]);

    // Modelleri Yükle
    useEffect(() => {
        const loader = new THREE.ObjectLoader();
        const loadedModels: THREE.Object3D[] = [];
        let loadCount = 0;

        fileUrls.forEach((url, index) => {
            loader.load(
                url,
                (obj) => {
                    // Texture yollarını düzelt veya materyalleri ayarla
                    obj.traverse((child) => {
                        if ((child as THREE.Mesh).isMesh) {
                            const mesh = child as THREE.Mesh;
                            // Emissive efekt ekleyerek parlak görünmesini sağlayalım
                            if (mesh.material) {
                                (mesh.material as THREE.MeshStandardMaterial).emissive = new THREE.Color(0x8a2be2);
                                (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.5;
                                (mesh.material as THREE.MeshStandardMaterial).transparent = true;
                            }
                        }
                    });

                    // Modeli sakla (sırasını korumak için array indexi kullanmak önemli ama asenkron yüklemede garanti değil)
                    // O yüzden basitçe indexe göre atıyoruz.
                    loadedModels[index] = obj;
                    loadCount++;

                    if (loadCount === frameCount) {
                        // Hepsi yüklendiğinde, boşlukları temizle (eğer yükleme hatası olursa diye) ve state'e at
                        setModels(loadedModels.filter(m => m !== undefined));
                        setLoaded(true);
                    }
                },
                undefined,
                (err) => {
                    console.warn(`Failed to load JSON model frame: ${url}`, err);
                    loadCount++; // Hatada da sayacı artır ki diğerleri takılmasın
                    if (loadCount === frameCount) setLoaded(true);
                }
            );
        });
    }, [fileUrls, frameCount]);

    // Animasyon Döngüsü
    useFrame((state, delta) => {
        if (!loaded || models.length === 0) return;

        timerRef.current += delta;

        if (timerRef.current >= frameDuration) {
            timerRef.current = 0; // Reset timer

            if (currentFrame < models.length - 1) {
                setCurrentFrame(prev => prev + 1);
            } else {
                if (loop) {
                    setCurrentFrame(0);
                } else {
                    // Animasyon bitti
                    if (onComplete) onComplete();
                }
            }
        }
    });

    if (!loaded) return null;

    return (
        <group ref={groupRef} position={position} rotation={rotation} scale={[scale, scale, scale]}>
            {models.map((model, index) => (
                <primitive
                    key={index}
                    object={model}
                    visible={index === currentFrame}
                />
            ))}
        </group>
    );
};
