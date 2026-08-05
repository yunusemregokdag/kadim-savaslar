import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ═══════════════════════════════════════════════════════════════════════════
// 🏹 OKÇU (ARCHER) - BÜYÜK VE PARLAK VERSİYON
// Visibility sorunu çözüldü - efektler artık görünür
// ═══════════════════════════════════════════════════════════════════════════

// SKILL 1: HIZLI OK (Yeşil ok uçuyor) - arrow
const QuickShotFX = ({ position, targetPosition, onComplete }: any) => {
    const ref = useRef<THREE.Group>(null);
    useEffect(() => { const t = setTimeout(() => onComplete?.(), 800); return () => clearTimeout(t); }, []);

    useFrame(() => {
        if (!ref.current) return;
        if (targetPosition) {
            const dir = new THREE.Vector3(targetPosition[0] - position[0], 0, targetPosition[2] - position[2]).normalize();
            ref.current.position.add(dir.multiplyScalar(0.5));
        } else {
            ref.current.position.z += 0.5;
        }
        ref.current.rotation.z += 0.02;
    });

    return (
        <group ref={ref} position={[position[0], position[1] + 1.5, position[2]]}>
            {/* Ana ok gövdesi - BÜYÜK */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.08, 0.08, 2.5, 12]} />
                <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={2} />
            </mesh>
            {/* Ok ucu - PARLAK */}
            <mesh position={[0, 0, 1.3]} rotation={[Math.PI / 2, 0, 0]}>
                <coneGeometry args={[0.2, 0.5, 12]} />
                <meshStandardMaterial color="#4ade80" emissive="#4ade80" emissiveIntensity={3} />
            </mesh>
            {/* Trail - GLOW */}
            <mesh position={[0, 0, -0.8]}>
                <sphereGeometry args={[0.3, 16, 16]} />
                <meshStandardMaterial color="#86efac" emissive="#86efac" emissiveIntensity={2} transparent opacity={0.7} />
            </mesh>
        </group>
    );
};

// SKILL 2: ÇOKLU ATIŞ (5 ok) - multishot
const MultishotFX = ({ position, targetPosition, onComplete }: any) => {
    const ref = useRef<THREE.Group>(null);
    useEffect(() => { const t = setTimeout(() => onComplete?.(), 1000); return () => clearTimeout(t); }, []);

    useFrame(() => {
        if (!ref.current) return;
        ref.current.position.z += 0.4;
        ref.current.children.forEach((child, i) => {
            child.position.x = Math.sin(i * 1.2) * (ref.current!.position.z * 0.1);
        });
    });

    return (
        <group ref={ref} position={[position[0], position[1] + 1.5, position[2]]}>
            {[0, 1, 2, 3, 4].map((i) => (
                <mesh key={i} position={[(i - 2) * 0.3, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
                    <coneGeometry args={[0.12, 0.8, 8]} />
                    <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={2.5} />
                </mesh>
            ))}
        </group>
    );
};

// SKILL 3: GÖRÜNMEZLİK (Mavi duman) - stealth
const StealthFX = ({ position, onComplete, playerGroupRef }: any) => {
    const ref = useRef<THREE.Group>(null);
    useEffect(() => { const t = setTimeout(() => onComplete?.(), 2000); return () => clearTimeout(t); }, []);

    useFrame(({ clock }) => {
        if (ref.current && playerGroupRef?.current) {
            const p = playerGroupRef.current.position;
            ref.current.position.set(p.x, p.y + 1, p.z);
            ref.current.rotation.y = clock.elapsedTime * 2;
        }
    });

    return (
        <group ref={ref} position={[position[0], position[1] + 1, position[2]]}>
            <mesh>
                <sphereGeometry args={[1.5, 16, 16]} />
                <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={1} transparent opacity={0.4} />
            </mesh>
            <mesh>
                <torusGeometry args={[1.2, 0.15, 8, 24]} />
                <meshStandardMaterial color="#60a5fa" emissive="#60a5fa" emissiveIntensity={2} transparent opacity={0.6} />
            </mesh>
        </group>
    );
};

// SKILL 4: KAPAN (Sarı tuzak) - trap
const TrapFX = ({ position, onComplete }: any) => {
    const ref = useRef<THREE.Mesh>(null);
    useEffect(() => { const t = setTimeout(() => onComplete?.(), 3000); return () => clearTimeout(t); }, []);

    useFrame(({ clock }) => {
        if (ref.current) {
            ref.current.rotation.y = clock.elapsedTime * 3;
            const scale = 1 + Math.sin(clock.elapsedTime * 5) * 0.2;
            ref.current.scale.set(scale, 1, scale);
        }
    });

    return (
        <mesh ref={ref} position={[position[0], position[1] + 0.1, position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.5, 0.2, 8, 24]} />
            <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={2} />
        </mesh>
    );
};

// SKILL 5: GERİ ADIM (Mavi duman izi) - dash_back
const DashBackFX = ({ position, onComplete }: any) => {
    const ref = useRef<THREE.Group>(null);
    useEffect(() => { const t = setTimeout(() => onComplete?.(), 800); return () => clearTimeout(t); }, []);

    useFrame(({ clock }) => {
        if (ref.current) {
            ref.current.children.forEach((child, i) => {
                const mesh = child as THREE.Mesh;
                mesh.scale.setScalar(1 + clock.elapsedTime * 0.8);
                (mesh.material as THREE.MeshStandardMaterial).opacity = Math.max(0, 0.8 - clock.elapsedTime * 0.4);
            });
        }
    });

    return (
        <group ref={ref} position={[position[0], position[1] + 1, position[2]]}>
            {[0, 1, 2, 3].map((i) => (
                <mesh key={i} position={[0, 0, i * 0.5]}>
                    <sphereGeometry args={[0.6, 12, 12]} />
                    <meshStandardMaterial color="#93c5fd" emissive="#93c5fd" emissiveIntensity={2} transparent opacity={0.6} />
                </mesh>
            ))}
        </group>
    );
};

// SKILL 6: ZEHİRLİ OK (Mor ok) - poison_arrow
const PoisonArrowFX = ({ position, targetPosition, onComplete }: any) => {
    const ref = useRef<THREE.Group>(null);
    useEffect(() => { const t = setTimeout(() => onComplete?.(), 1000); return () => clearTimeout(t); }, []);

    useFrame(() => {
        if (!ref.current) return;
        if (targetPosition) {
            const dir = new THREE.Vector3(targetPosition[0] - position[0], 0, targetPosition[2] - position[2]).normalize();
            ref.current.position.add(dir.multiplyScalar(0.35));
        } else {
            ref.current.position.z += 0.35;
        }
    });

    return (
        <group ref={ref} position={[position[0], position[1] + 1.5, position[2]]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.1, 0.1, 2, 12]} />
                <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={2} />
            </mesh>
            <mesh position={[0, 0, 1.1]} rotation={[Math.PI / 2, 0, 0]}>
                <coneGeometry args={[0.2, 0.5, 12]} />
                <meshStandardMaterial color="#c084fc" emissive="#c084fc" emissiveIntensity={3} />
            </mesh>
            {/* Zehir damlası */}
            <mesh position={[0, -0.3, 0]}>
                <sphereGeometry args={[0.2, 12, 12]} />
                <meshStandardMaterial color="#7c3aed" emissive="#7c3aed" emissiveIntensity={2} transparent opacity={0.8} />
            </mesh>
        </group>
    );
};

// SKILL 7: OK YAĞMURU (ULTI) - arrow_rain
const ArrowRainFX = ({ position, onComplete }: any) => {
    const ref = useRef<THREE.Group>(null);
    useEffect(() => { const t = setTimeout(() => onComplete?.(), 2500); return () => clearTimeout(t); }, []);

    useFrame(({ clock }) => {
        if (ref.current) {
            ref.current.children.forEach((child, i) => {
                child.position.y = 5 - (clock.elapsedTime * 3 + i * 0.3) % 6;
                child.rotation.z = Math.sin(clock.elapsedTime * 2 + i) * 0.2;
            });
        }
    });

    return (
        <group ref={ref} position={[position[0], position[1], position[2]]}>
            {[...Array(12)].map((_, i) => (
                <mesh
                    key={i}
                    position={[
                        (Math.random() - 0.5) * 4,
                        5 - (i * 0.5),
                        (Math.random() - 0.5) * 4
                    ]}
                    rotation={[Math.PI, 0, 0]}
                >
                    <coneGeometry args={[0.1, 1, 8]} />
                    <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={3} />
                </mesh>
            ))}
            {/* Alan göstergesi */}
            <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[1.5, 2.5, 24]} />
                <meshStandardMaterial color="#fca5a5" emissive="#fca5a5" emissiveIntensity={2} transparent opacity={0.5} side={THREE.DoubleSide} />
            </mesh>
        </group>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT - constants.ts visual değerleriyle eşleşiyor
// ═══════════════════════════════════════════════════════════════════════════
export const ARCHER_EFFECTS: { [key: string]: React.FC<any> } = {
    // constants.ts skill IDs
    'r1': QuickShotFX,
    'r2': MultishotFX,
    'r3': StealthFX,
    'r4': TrapFX,
    'r5': DashBackFX,
    'r6': PoisonArrowFX,
    'r7': ArrowRainFX,

    // constants.ts visual keys (DOĞRU EŞLEŞME)
    'arrow': QuickShotFX,
    'multishot': MultishotFX,
    'stealth': StealthFX,
    'trap': TrapFX,
    'dash_back': DashBackFX,
    'poison_arrow': PoisonArrowFX,
    'arrow_rain': ArrowRainFX,

    // Eski fallback'ler
    'ar1': QuickShotFX, 'ar2': MultishotFX, 'ar3': StealthFX,
    'ar4': TrapFX, 'ar5': DashBackFX, 'ar6': PoisonArrowFX,
    'archer_shot': QuickShotFX, 'quick_shot': QuickShotFX,
    'hunters_focus': TrapFX, 'focus': TrapFX,
    'backstep': DashBackFX, 'javelin': PoisonArrowFX,
    'dragon_arrow': ArrowRainFX, 'dragon': ArrowRainFX
};
