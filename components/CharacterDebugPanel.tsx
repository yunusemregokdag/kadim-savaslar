import React, { useState, useEffect } from 'react';

interface CharacterOffsets {
    headY: number;
    bodyY: number;
    armY: number;
    legY: number;
    scale: number;
}

interface CharacterDebugPanelProps {
    offsets: CharacterOffsets;
    onChange: (offsets: CharacterOffsets) => void;
    onApply: () => void;
}

export const DEFAULT_OFFSETS: CharacterOffsets = {
    headY: 1.45,   // Kafa yüksekliği
    bodyY: 0.83,   // Gövde yüksekliği
    armY: 1.12,    // Kol (omuz) yüksekliği
    legY: 0.10,    // Bacak yüksekliği
    scale: 1.30,   // Karakter ölçeği
};

export const CharacterDebugPanel: React.FC<CharacterDebugPanelProps> = ({ offsets, onChange, onApply }) => {
    const [isOpen, setIsOpen] = useState(true);

    const handleChange = (key: keyof CharacterOffsets, value: number) => {
        onChange({ ...offsets, [key]: value });
    };

    const copyToClipboard = () => {
        const code = `
// Karakter Pozisyon Değerleri
headY: ${offsets.headY.toFixed(2)}
bodyY: ${offsets.bodyY.toFixed(2)}
armY: ${offsets.armY.toFixed(2)}
legY: ${offsets.legY.toFixed(2)}
scale: ${offsets.scale.toFixed(2)}
        `.trim();
        navigator.clipboard.writeText(code);
        alert('Değerler kopyalandı!');
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                style={{
                    position: 'fixed',
                    top: '10px',
                    right: '10px',
                    zIndex: 9999,
                    padding: '10px 20px',
                    background: '#4a5568',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                }}
            >
                🎮 Debug Panel
            </button>
        );
    }

    return (
        <div
            style={{
                position: 'fixed',
                top: '10px',
                right: '10px',
                zIndex: 9999,
                background: 'rgba(26, 32, 44, 0.95)',
                padding: '20px',
                borderRadius: '12px',
                color: 'white',
                fontFamily: 'monospace',
                minWidth: '320px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                border: '1px solid #4a5568',
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#fbd38d' }}>🎮 Karakter Debug Panel</h3>
                <button
                    onClick={() => setIsOpen(false)}
                    style={{
                        background: '#e53e3e',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '5px 10px',
                        cursor: 'pointer',
                    }}
                >
                    ✕
                </button>
            </div>

            {/* Head Y */}
            <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#90cdf4' }}>
                    Kafa Y: <span style={{ color: '#fbd38d' }}>{offsets.headY.toFixed(2)}</span>
                </label>
                <input
                    type="range"
                    min="1.0"
                    max="2.0"
                    step="0.01"
                    value={offsets.headY}
                    onChange={(e) => handleChange('headY', parseFloat(e.target.value))}
                    style={{ width: '100%' }}
                />
            </div>

            {/* Body Y */}
            <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#90cdf4' }}>
                    Gövde Y: <span style={{ color: '#fbd38d' }}>{offsets.bodyY.toFixed(2)}</span>
                </label>
                <input
                    type="range"
                    min="0.5"
                    max="1.5"
                    step="0.01"
                    value={offsets.bodyY}
                    onChange={(e) => handleChange('bodyY', parseFloat(e.target.value))}
                    style={{ width: '100%' }}
                />
            </div>

            {/* Arm Y */}
            <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#90cdf4' }}>
                    Kol Y (Omuz): <span style={{ color: '#fbd38d' }}>{offsets.armY.toFixed(2)}</span>
                </label>
                <input
                    type="range"
                    min="0.5"
                    max="1.5"
                    step="0.01"
                    value={offsets.armY}
                    onChange={(e) => handleChange('armY', parseFloat(e.target.value))}
                    style={{ width: '100%' }}
                />
            </div>

            {/* Leg Y */}
            <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#90cdf4' }}>
                    Bacak Y: <span style={{ color: '#fbd38d' }}>{offsets.legY.toFixed(2)}</span>
                </label>
                <input
                    type="range"
                    min="0.1"
                    max="0.8"
                    step="0.01"
                    value={offsets.legY}
                    onChange={(e) => handleChange('legY', parseFloat(e.target.value))}
                    style={{ width: '100%' }}
                />
            </div>

            {/* Scale */}
            <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#90cdf4' }}>
                    Ölçek: <span style={{ color: '#fbd38d' }}>{offsets.scale.toFixed(2)}</span>
                </label>
                <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.05"
                    value={offsets.scale}
                    onChange={(e) => handleChange('scale', parseFloat(e.target.value))}
                    style={{ width: '100%' }}
                />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
                <button
                    onClick={copyToClipboard}
                    style={{
                        flex: 1,
                        padding: '10px',
                        background: '#48bb78',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                    }}
                >
                    📋 Kopyala
                </button>
                <button
                    onClick={() => onChange(DEFAULT_OFFSETS)}
                    style={{
                        flex: 1,
                        padding: '10px',
                        background: '#ed8936',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                    }}
                >
                    🔄 Sıfırla
                </button>
            </div>

            <div style={{ marginTop: '15px', padding: '10px', background: '#2d3748', borderRadius: '6px', fontSize: '11px' }}>
                <strong style={{ color: '#fbd38d' }}>İpucu:</strong>
                <ul style={{ margin: '5px 0 0 15px', padding: 0, color: '#a0aec0' }}>
                    <li>Kafa gövdeye yapışık olsun: headY ≈ bodyY + 0.4</li>
                    <li>Kollar omuz hizasında: armY ≈ bodyY + 0.15</li>
                    <li>Beğendiğinde "Kopyala" ile değerleri al</li>
                </ul>
            </div>
        </div>
    );
};

export type { CharacterOffsets };
