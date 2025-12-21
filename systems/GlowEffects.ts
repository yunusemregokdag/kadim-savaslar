// ============================================
// PARLAMA EFEKT SİSTEMİ (+7 - +12)
// ============================================

import * as THREE from 'three';

export interface GlowEffect {
    level: number;
    color: string;
    intensity: number;
    particleCount: number;
    particleType: 'aura' | 'floating' | 'trail' | 'explosion';
    trailEnabled: boolean;
}

// Sınıf renkleri
export const CLASS_COLORS: { [key: string]: string } = {
    warrior: '#dc2626',        // Kırmızı
    arctic_knight: '#38bdf8',  // Buz mavisi
    gale_glaive: '#a3e635',    // Yeşil-sarı (rüzgar)
    martial_artist: '#f97316', // Turuncu
    monk: '#fbbf24',           // Altın
    archer: '#22c55e',         // Yeşil
    archmage: '#8b5cf6',       // Mor
    cleric: '#fde047',         // Altın sarısı
    bard: '#ec4899',           // Pembe
    reaper: '#6b21a8',         // Koyu mor
};

// Upgrade seviyesine göre efekt özellikleri
export function getGlowEffect(upgradeLevel: number, charClass: string): GlowEffect | null {
    const baseColor = CLASS_COLORS[charClass] || '#ffffff';

    if (upgradeLevel < 7) {
        return null; // +7 altı efekt yok
    }

    if (upgradeLevel === 7) {
        // +7: Hafif aura
        return {
            level: 7,
            color: baseColor,
            intensity: 0.3,
            particleCount: 10,
            particleType: 'aura',
            trailEnabled: false,
        };
    }

    if (upgradeLevel === 8) {
        // +8: Daha yoğun aura
        return {
            level: 8,
            color: baseColor,
            intensity: 0.5,
            particleCount: 15,
            particleType: 'aura',
            trailEnabled: false,
        };
    }

    if (upgradeLevel === 9) {
        // +9: Renk değişimi (maviden altına)
        const goldColor = '#ffd700';
        return {
            level: 9,
            color: goldColor,
            intensity: 0.7,
            particleCount: 20,
            particleType: 'aura',
            trailEnabled: false,
        };
    }

    if (upgradeLevel === 10) {
        // +10: Uçuşan parçacıklar
        return {
            level: 10,
            color: baseColor,
            intensity: 1.0,
            particleCount: 30,
            particleType: 'floating',
            trailEnabled: false,
        };
    }

    if (upgradeLevel === 11) {
        // +11: Yoğun parçacıklar + hafif trail
        return {
            level: 11,
            color: baseColor,
            intensity: 1.3,
            particleCount: 40,
            particleType: 'floating',
            trailEnabled: true,
        };
    }

    if (upgradeLevel >= 12) {
        // +12: Maksimum efekt + zemin izi
        return {
            level: 12,
            color: baseColor,
            intensity: 1.5,
            particleCount: 50,
            particleType: 'explosion',
            trailEnabled: true,
        };
    }

    return null;
}

// Sınıfa özel parçacık tipi
export function getClassParticleType(charClass: string): string {
    switch (charClass) {
        case 'arctic_knight':
            return 'snowflake'; // Kar tanesi
        case 'gale_glaive':
            return 'wind'; // Rüzgar çizgileri
        case 'archmage':
            return 'magic'; // Büyü sembolleri
        case 'cleric':
        case 'monk':
            return 'light'; // Işık parçacıkları
        case 'bard':
            return 'notes'; // Müzik notaları
        case 'reaper':
            return 'shadow'; // Karanlık duman
        case 'martial_artist':
            return 'fire'; // Ateş kıvılcımları
        case 'archer':
            return 'leaves'; // Yapraklar
        case 'warrior':
            return 'sparks'; // Kıvılcımlar
        default:
            return 'default';
    }
}

// Parçacık pozisyonları oluştur
export function generateParticlePositions(count: number, radius: number = 1): Float32Array {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = radius * Math.cbrt(Math.random());

        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);
    }
    return positions;
}

// Aura material oluştur
export function createAuraMaterial(color: string, intensity: number): THREE.ShaderMaterial {
    return new THREE.ShaderMaterial({
        uniforms: {
            color: { value: new THREE.Color(color) },
            intensity: { value: intensity },
            time: { value: 0 },
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform vec3 color;
            uniform float intensity;
            uniform float time;
            varying vec2 vUv;
            
            void main() {
                float dist = length(vUv - 0.5) * 2.0;
                float alpha = (1.0 - dist) * intensity * (0.5 + 0.5 * sin(time * 3.0));
                gl_FragColor = vec4(color, alpha * 0.5);
            }
        `,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
    });
}
