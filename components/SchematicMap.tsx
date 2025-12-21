import React from 'react';

// HEXAGON GALACTIC MAP
// Based on user provided reference image "Galaxy Map"

interface MapNode {
    id: number;
    x: number;
    y: number;
    label: string;
    type: 'red' | 'blue' | 'green' | 'center' | 'boss_layer';
    size: 'small' | 'medium' | 'large';
}

interface SchematicMapProps {
    activeZone?: number;
    onZoneSelect: (id: number) => void;
    remotePlayers?: any[];
}

const SchematicMap: React.FC<SchematicMapProps> = ({ activeZone, onZoneSelect, remotePlayers = [] }) => {

    // --- NODE DEFINITIONS ---
    // Coordinates approximated to match the Widescreen Hex Layout
    // ViewBox assumed 160 x 90 for better wide aspect handling

    const nodes: MapNode[] = [
        // --- CENTER ARENA (CZ) ---
        { id: 44, x: 80, y: 50, label: '4-4 (CZ)', type: 'center', size: 'large' },

        // --- LEFT SECTOR (Green/Forest?) - Top Left (Moved Up) ---
        { id: 31, x: 20, y: 0, label: '3-1', type: 'green', size: 'medium' },
        { id: 32, x: 30, y: 5, label: '3-2', type: 'green', size: 'medium' },
        { id: 33, x: 30, y: 20, label: '3-3', type: 'green', size: 'medium' },
        { id: 34, x: 40, y: 12, label: '3-4', type: 'green', size: 'medium' },

        // --- LEFT SECTOR (Blue/Ice?) - Mid Left (Unchanged) ---
        { id: 21, x: 10, y: 50, label: '2-1', type: 'blue', size: 'medium' },
        { id: 22, x: 20, y: 50, label: '2-2', type: 'blue', size: 'medium' },
        { id: 23, x: 30, y: 60, label: '2-3', type: 'blue', size: 'medium' }, // Lower
        { id: 24, x: 30, y: 40, label: '2-4', type: 'blue', size: 'medium' }, // Upper

        // --- LEFT SECTOR (Red/Fire?) - Bottom Left (Moved Down) ---
        { id: 11, x: 20, y: 100, label: '1-1', type: 'red', size: 'medium' },
        { id: 12, x: 30, y: 95, label: '1-2', type: 'red', size: 'medium' },
        { id: 13, x: 30, y: 80, label: '1-3', type: 'red', size: 'medium' },
        { id: 14, x: 40, y: 88, label: '1-4', type: 'red', size: 'medium' },

        // --- CONNECTORS LEFT to CENTER (GATEWAYS) ---
        // 4-1, 4-2, 4-3 Bridge Nodes
        { id: 41, x: 60, y: 85, label: '4-1', type: 'center', size: 'medium' }, // Lower Bridge 
        { id: 42, x: 55, y: 50, label: '4-2', type: 'center', size: 'medium' },
        { id: 43, x: 60, y: 15, label: '4-3', type: 'center', size: 'medium' }, // Upper Bridge

        // --- RIGHT SECTOR (Green) - Top Right (Moved Up) ---
        { id: 35, x: 110, y: 20, label: '3-5', type: 'green', size: 'medium' }, // Closer to center
        { id: 36, x: 125, y: 10, label: '3-6', type: 'green', size: 'medium' },
        { id: 37, x: 125, y: 25, label: '3-7', type: 'green', size: 'medium' },
        { id: 38, x: 140, y: 15, label: '3-8', type: 'green', size: 'medium' },

        // --- RIGHT SECTOR (Blue) - Mid Right ---
        { id: 25, x: 105, y: 50, label: '2-5', type: 'blue', size: 'medium' }, // Closer to center
        { id: 26, x: 120, y: 42, label: '2-6', type: 'blue', size: 'medium' },
        { id: 27, x: 120, y: 58, label: '2-7', type: 'blue', size: 'medium' },
        { id: 28, x: 135, y: 50, label: '2-8', type: 'blue', size: 'medium' },

        // --- RIGHT SECTOR (Red) - Bottom Right (Moved Down) ---
        { id: 15, x: 110, y: 80, label: '1-5', type: 'red', size: 'medium' }, // Closer to center
        { id: 16, x: 125, y: 75, label: '1-6', type: 'red', size: 'medium' },
        { id: 17, x: 125, y: 90, label: '1-7', type: 'red', size: 'medium' },
        { id: 18, x: 140, y: 85, label: '1-8', type: 'red', size: 'medium' },

        // --- BOSS LAYERS (Far Right) ---
        { id: 81, x: 155, y: 15, label: '3-BL', type: 'boss_layer', size: 'medium' }, // Boss Layer Top
        { id: 82, x: 155, y: 50, label: '2-BL', type: 'boss_layer', size: 'medium' }, // Boss Layer Mid
        { id: 83, x: 155, y: 85, label: '1-BL', type: 'boss_layer', size: 'medium' }, // Boss Layer Bottom
    ];

    const links = [
        // --- PROGRESION LOGIC ---
        // Green Sector (Zone 3)
        { from: 31, to: 32 },
        { from: 32, to: 33 }, { from: 32, to: 34 },
        { from: 33, to: 24 },

        // Blue Sector (Zone 2)
        { from: 21, to: 22 },
        { from: 22, to: 23 }, { from: 22, to: 24 },
        { from: 23, to: 14 },

        // Red Sector (Zone 1)
        { from: 11, to: 12 },
        { from: 12, to: 13 }, { from: 12, to: 14 },
        { from: 13, to: 14 },

        // --- GATEWAYS ---
        { from: 34, to: 43 }, // 3-4 -> 4-3
        { from: 24, to: 42 }, // 2-4 -> 4-2
        { from: 14, to: 41 }, // 1-4 -> 4-1

        // --- TRANSIT (GATEWAY TO GATEWAY) ---
        { from: 41, to: 42 }, { from: 42, to: 43 }, { from: 43, to: 41 }, // Triangle Link

        // --- THE COLONY ZONE HUB (4-4) ---
        // All Gateways lead to 4-4
        { from: 43, to: 44 }, // Venu Gateway -> Arena
        { from: 42, to: 44 }, // Terya Gateway -> Arena
        { from: 41, to: 44 }, // Marsu Gateway -> Arena

        // --- ELITE ZONES ACCESS (FROM 4-4) ---
        { from: 44, to: 35 }, // Arena -> Venu Elite (3-5)
        { from: 44, to: 25 }, // Arena -> Terya Elite (2-5)
        { from: 44, to: 15 }, // Arena -> Marsu Elite (1-5)

        // --- RIGHT SECTOR WEB ---
        { from: 35, to: 36 }, { from: 35, to: 37 }, { from: 36, to: 38 }, { from: 37, to: 38 },
        { from: 25, to: 26 }, { from: 25, to: 27 }, { from: 26, to: 28 }, { from: 27, to: 28 },
        { from: 15, to: 16 }, { from: 15, to: 17 }, { from: 16, to: 18 }, { from: 17, to: 18 },

        // Boss Layers
        { from: 38, to: 81 }, { from: 28, to: 82 }, { from: 18, to: 83 },
        { from: 81, to: 82 }, { from: 83, to: 82 },
    ];

    const getHexPoints = (x: number, y: number, r: number) => {
        // Hexagon points logic
        const points = [];
        for (let i = 0; i < 6; i++) {
            const angle_deg = 60 * i + 30; // 30 degree offset for "Pointy Top"
            const angle_rad = Math.PI / 180 * angle_deg;
            const px = x + r * Math.cos(angle_rad);
            const py = y + r * Math.sin(angle_rad);
            points.push(`${px},${py}`);
        }
        return points.join(' ');
    };

    const getColor = (type: string) => {
        switch (type) {
            case 'red': return '#dc2626'; // Red-600
            case 'blue': return '#2563eb'; // Blue-600
            case 'green': return '#16a34a'; // Green-600
            case 'center': return '#4b5563'; // Gray-600
            case 'boss_layer': return '#7c3aed'; // Violet-600
            default: return '#9ca3af';
        }
    };

    const getRadius = (size: string) => {
        switch (size) {
            case 'large': return 6;
            case 'medium': return 4;
            case 'small': return 2.5;
            default: return 3;
        }
    };

    return (
        <div className="relative w-full aspect-video bg-[#050608] rounded-xl border border-slate-800 overflow-hidden select-none shadow-2xl">
            {/* Legend - Renk Açıklaması */}
            <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-sm rounded-lg p-2 border border-slate-700 z-10">
                <div className="text-[10px] font-bold text-white mb-1.5">BÖLGELER</div>
                <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#dc2626' }}></div>
                        <span className="text-[9px] text-slate-300">Marsu (Ateş)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#2563eb' }}></div>
                        <span className="text-[9px] text-slate-300">Terya (Buz)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#16a34a' }}></div>
                        <span className="text-[9px] text-slate-300">Venu (Orman)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#4b5563' }}></div>
                        <span className="text-[9px] text-slate-300">Merkez (PvP)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#7c3aed' }}></div>
                        <span className="text-[9px] text-slate-300">Boss Alanı</span>
                    </div>
                </div>

                {/* İşaretler */}
                <div className="border-t border-slate-700 mt-2 pt-2">
                    <div className="text-[10px] font-bold text-white mb-1.5">İŞARETLER</div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_4px_purple]"></div>
                            <span className="text-[9px] text-slate-300">Portal</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <span className="text-[9px] text-slate-300">Oyuncu</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <span className="text-[9px] text-slate-300">Düşman</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <span className="text-[9px] text-slate-300">NPC</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-cyan-400 border border-white"></div>
                            <span className="text-[9px] text-slate-300">Sen</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Background Grid - Hex Style */}
            <div className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle, #334155 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                    backgroundColor: '#020202'
                }}
            />



            <svg className="w-full h-full" viewBox="-25 -20 220 150" preserveAspectRatio="xMidYMid meet">
                <defs>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="2" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>

                {/* Links */}
                {links.map((link, i) => {
                    const fromNode = nodes.find(n => n.id === link.from);
                    const toNode = nodes.find(n => n.id === link.to);
                    if (!fromNode || !toNode) return null;
                    return (
                        <line
                            key={i}
                            x1={fromNode.x} y1={fromNode.y}
                            x2={toNode.x} y2={toNode.y}
                            stroke="#1e293b" strokeWidth="1"
                        />
                    );
                })}

                {/* Nodes */}
                {nodes.map(n => {
                    const isActive = activeZone === n.id;
                    const color = getColor(n.type);
                    const r = getRadius(n.size);
                    const hexPoints = getHexPoints(n.x, n.y, r);
                    const borderR = r + 0.8;
                    const borderPoints = getHexPoints(n.x, n.y, borderR);

                    // Check if any remote players are in this zone (assuming remotePlayers have 'zone' property)
                    // Note: Currently backend doesn't broadcast 'zone' property on 'zone_players', only position.
                    // We might need to update backend to send zone info if we want to show global map players.
                    // For now, let's assume if they are in remotePlayers list, they are in the *current* zone,
                    // so we only show them if n.id === activeZone (which is redundant since we see them in game).
                    // BUT, if the user means the 'Radar' (mini-map), that's handled in ActiveZoneView.
                    // If user means this Schematic Map, we can't show players in *other* zones unless server sends global data.
                    // Let's assume user wants to see their friend on this map if they are in the same zone.

                    const playersInThisZone = remotePlayers.filter(p => activeZone === n.id); // Valid for now as client only knows local players

                    return (
                        <g
                            key={n.id}
                            onClick={() => onZoneSelect(n.id)}
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                        >
                            {/* Glow if Active */}
                            {isActive && (
                                <polygon points={getHexPoints(n.x, n.y, r + 2)} fill={color} opacity="0.4" filter="url(#glow)" />
                            )}

                            {/* Border Hex */}
                            <polygon
                                points={borderPoints}
                                fill="#0f172a"
                                stroke={isActive ? '#ffffff' : color}
                                strokeWidth={isActive ? "1" : "0.5"}
                            />

                            {/* Inner Hex */}
                            <polygon
                                points={hexPoints}
                                fill={isActive ? '#ffffff' : '#0f172a'} // Active = White center, Inactive = Dark center
                                stroke={color}
                                strokeWidth="0.2"
                            />

                            {/* Inner Color Fill (if not active, small dot logic) */}
                            {!isActive && <polygon points={getHexPoints(n.x, n.y, r * 0.6)} fill={color} opacity="0.5" />}


                            {/* Label */}
                            <text x={n.x} y={n.y + (r + 4)} fontSize="3" textAnchor="middle" fill={isActive ? "#ffffff" : "#64748b"} fontWeight={isActive ? "bold" : "normal"}>
                                {n.label}
                            </text>

                            {/* YOU ARE HERE INDICATOR */}
                            {isActive && (
                                <g transform={`translate(${n.x}, ${n.y - (r + 3)})`}>
                                    {/* Downward Arrow / Pin */}
                                    <path d="M0 0 L-2 -3 L2 -3 Z" fill="white" />
                                    <circle cx="0" cy="-4.5" r="2.5" fill="#ef4444" stroke="white" strokeWidth="0.5" />
                                    <text x="0" y="-3.5" fontSize="2" textAnchor="middle" fill="white" fontWeight="bold">YOU</text>
                                </g>
                            )}

                            {/* OTHER PLAYERS INDICATOR */}
                            {isActive && playersInThisZone.map((p, idx) => (
                                <g key={p.id} transform={`translate(${n.x + (idx * 2) - (playersInThisZone.length)}, ${n.y + (r + 1)})`}>
                                    <circle cx="0" cy="0" r="1.5" fill="#facc15" stroke="black" strokeWidth="0.2" /> {/* Yellow dot */}
                                </g>
                            ))}
                        </g>
                    );
                })}
            </svg>
        </div>
    );
};

export default SchematicMap;
