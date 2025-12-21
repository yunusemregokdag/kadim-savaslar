
import React, { useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { MinecraftModelLoader } from '../utils/MinecraftModelLoader';

interface MinecraftModelRendererProps {
    modelPath: string;
    modelName: string;
}

export const MinecraftModelRenderer: React.FC<MinecraftModelRendererProps> = ({ modelPath, modelName }) => {
    const [group, setGroup] = useState<THREE.Group | null>(null);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            const url = `${modelPath}${modelName}.json`; // Assuming path ends in / and loader expects full URL or path
            // Actually My loader expects full URL?
            // "url" arg in loader. 
            // In Registry I put: path: getPath(..., 'warrior_model') -> .../warrior_model/
            // and model: 'warrior_sword'
            // So URL = path + model + '.json'

            try {
                const loadedGroup = await MinecraftModelLoader.load(url);
                if (mounted) {
                    setGroup(loadedGroup);
                }
            } catch (err) {
                console.error("Failed to render model:", url, err);
            }
        };
        load();
        return () => { mounted = false; };
    }, [modelPath, modelName]);

    if (!group) return null;

    return <primitive object={group} />;
};
