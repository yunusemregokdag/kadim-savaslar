import React from 'react';

export const PixelVip: React.FC<{ size?: number, className?: string }> = ({ size = 24, className = "" }) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            style={{ imageRendering: 'pixelated' }}
        >
            {/* CROWN BASE */}
            <path d="M2 18H22V21H2V18Z" fill="#B8860B" /> {/* Bottom bar dark */}
            <path d="M2 15H22V18H2V15Z" fill="#FFD700" /> {/* Bottom bar light */}

            {/* SPIKES */}
            <path d="M2 6V15H6V12H9V9H15V12H18V15H22V6L18 10L12 4L6 10L2 6Z" fill="#FFD700" />

            {/* GEMS */}
            <rect x="11" y="15" width="2" height="2" fill="#00FFFF" /> {/* Center Gem */}
            <rect x="5" y="15" width="2" height="2" fill="#FF4500" /> {/* Left Gem */}
            <rect x="17" y="15" width="2" height="2" fill="#FF4500" /> {/* Right Gem */}

            {/* TOP JEWEL */}
            <rect x="11" y="2" width="2" height="2" fill="#00FFFF" />

            {/* SHADING/DEPTH (Pixel Art Feel) */}
            <path d="M2 6H4V15H2V6Z" fill="#DAA520" />
            <path d="M20 6H22V15H20V6Z" fill="#DAA520" />

        </svg>
    );
};

export const PixelGoldUser: React.FC<{ name: string, isVip: boolean, className?: string }> = ({ name, isVip, className = "" }) => {
    if (!isVip) {
        return <span className={`text-white font-bold ${className}`}>{name}</span>;
    }

    return (
        <div className={`flex items-center gap-1.5 ${className}`}>
            {/* GLOWING EFFECT CONTAINER */}
            <div className="relative">
                <div className="absolute inset-0 bg-yellow-500 blur-sm opacity-50 animate-pulse"></div>
                <PixelVip size={16} className="relative z-10 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]" />
            </div>

            {/* GOLD NAME WITH SHINING EFFECT */}
            <span className="font-bold relative" style={{
                color: '#FFD700',
                textShadow: '0 2px 4px rgba(0,0,0,0.5), 0 0 10px rgba(255,215,0,0.3)',
                background: 'linear-gradient(to bottom, #FFF 0%, #FFD700 40%, #B8860B 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block'
            }}>
                {name}
            </span>
        </div>
    );
};
