import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { PlayerStallData } from './MarketTypes';
import { Users, ShoppingBag } from 'lucide-react';

interface PlayerStallProps {
    data: PlayerStallData;
    onClick: () => void;
}

export const PlayerStall: React.FC<PlayerStallProps> = ({ data, onClick }) => {
    const groupRef = useRef<THREE.Group>(null);
    const [hovered, setHovered] = useState(false);

    useFrame((state) => {
        if (groupRef.current) {
            // Gentle floating animation
            groupRef.current.position.y = 0.5 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
            groupRef.current.rotation.y += 0.01;
        }
    });

    const stallColors = {
        wood: '#855E42',
        stone: '#78716c',
        luxury: '#fbbf24'
    };

    return (
        <group
            ref={groupRef}
            position={[data.position[0], data.position[1], data.position[2]]}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
            onClick={(e) => { e.stopPropagation(); onClick(); }}
        >
            {/* Stall Base */}
            <mesh position={[0, 0, 0]} castShadow>
                <boxGeometry args={[1, 0.2, 1]} />
                <meshStandardMaterial color={stallColors[data.theme] || stallColors.wood} />
            </mesh>

            {/* Table */}
            <mesh position={[0, 0.5, 0]} castShadow>
                <boxGeometry args={[1.2, 0.1, 0.8]} />
                <meshStandardMaterial color="#3f2e18" />
            </mesh>

            {/* Canopy Pillars */}
            <mesh position={[-0.4, 1, 0.3]}>
                <cylinderGeometry args={[0.05, 0.05, 1]} />
                <meshStandardMaterial color="#5c4033" />
            </mesh>
            <mesh position={[0.4, 1, 0.3]}>
                <cylinderGeometry args={[0.05, 0.05, 1]} />
                <meshStandardMaterial color="#5c4033" />
            </mesh>

            {/* Canopy Top */}
            <mesh position={[0, 1.5, 0.3]} rotation={[0.4, 0, 0]}>
                <boxGeometry args={[1.3, 0.1, 1]} />
                <meshStandardMaterial color={data.theme === 'luxury' ? '#ef4444' : '#22c55e'} />
            </mesh>

            {/* Floating Label */}
            <Html position={[0, 2.2, 0]} center style={{ pointerEvents: 'none' }}>
                <div className={`bg-black/60 backdrop-blur-sm border ${hovered ? 'border-yellow-500 scale-110' : 'border-slate-600'} rounded px-2 py-1 text-center transition-all duration-300 min-w-[100px]`}>
                    <div className="flex items-center justify-center gap-1 text-[10px] text-white font-bold whitespace-nowrap">
                        <ShoppingBag size={10} className="text-yellow-400" />
                        {data.ownerName}
                    </div>
                </div>
            </Html>
        </group>
    );
};
