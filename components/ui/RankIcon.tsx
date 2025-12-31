import React from 'react';
import { RANKS } from '../../constants';

interface RankIconProps {
    rank: number;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

const SIZES = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
};

export const RankIcon: React.FC<RankIconProps> = ({ rank, size = 'md', className = '' }) => {
    // Ensure rank is within valid range (1-21)
    const validRank = Math.max(1, Math.min(rank, 21));
    const rankIndex = validRank - 1;

    // Sprite Sheet Configuration
    const COLS = 7;
    const ROWS = 3; // Though generated image might be padded, we assume a focused grid

    const col = rankIndex % COLS;
    const row = Math.floor(rankIndex / COLS);

    // Calculate position percentages
    // For background-position: (index / (total - 1)) * 100%
    const posX = (col / (COLS - 1)) * 100;
    const posY = (row / (ROWS - 1)) * 100;

    return (
        <div
            className={`relative inline-block ${SIZES[size]} ${className} shrink-0`}
            title={RANKS[validRank]?.title || `Rank ${validRank}`}
        >
            <div
                className="w-full h-full bg-no-repeat"
                style={{
                    backgroundImage: 'url("/ranks/all_ranks.png")',
                    backgroundSize: `${COLS * 100}% ${ROWS * 100}%`,
                    backgroundPosition: `${posX}% ${posY}%`,
                    imageRendering: 'pixelated', // Keep pixels crisp
                }}
            />
        </div>
    );
};
