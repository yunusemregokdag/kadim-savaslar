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
    // Find rank data
    const rankData = RANKS.find(r => r.id === rank);

    if (!rankData) return null;

    return (
        <div
            className={`relative inline-block ${SIZES[size]} ${className} shrink-0`}
            title={rankData.title}
        >
            <img
                src={rankData.image}
                alt={rankData.title}
                className="w-full h-full object-contain drop-shadow-md"
                loading="lazy"
            />
        </div>
    );
};
