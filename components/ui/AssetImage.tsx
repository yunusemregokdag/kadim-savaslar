/**
 * AssetImage - React Component for displaying icons with automatic fallback
 * 
 * In DEVELOPMENT: Shows emoji fallback if PNG missing
 * In PRODUCTION: Attempts to load PNG, shows emoji only if critical failure
 */

import React, { useState, useCallback } from 'react';
import { getAssetInfo, isDevelopmentMode } from '../../utils/AssetManager';

export interface AssetImageProps {
    /** Asset type */
    type: 'material' | 'skill' | 'item' | 'vfx';
    /** Asset key (e.g., 'iron_ore', 'w1', 'sword') */
    assetKey: string;
    /** Size in pixels (default: 32) */
    size?: number;
    /** Additional CSS classes */
    className?: string;
    /** Alt text for accessibility */
    alt?: string;
    /** Fallback emoji override */
    fallbackEmoji?: string;
    /** Show only emoji (force emoji mode) */
    forceEmoji?: boolean;
    /** onClick handler */
    onClick?: () => void;
    /** Style override */
    style?: React.CSSProperties;
}

/**
 * AssetImage Component
 * 
 * Renders either a PNG icon or emoji fallback based on asset availability
 */
export const AssetImage: React.FC<AssetImageProps> = ({
    type,
    assetKey,
    size = 32,
    className = '',
    alt,
    fallbackEmoji,
    forceEmoji = false,
    onClick,
    style,
}) => {
    const [useFallback, setUseFallback] = useState(forceEmoji);
    const [hasError, setHasError] = useState(false);

    const assetInfo = getAssetInfo(type, assetKey);
    const emoji = fallbackEmoji || assetInfo.emoji;

    const handleError = useCallback(() => {
        // In development, silently fall back to emoji
        // In production, log error and fall back
        if (!isDevelopmentMode()) {
            console.error(`[AssetImage] Failed to load: ${assetInfo.url}`);
        }
        setUseFallback(true);
        setHasError(true);
    }, [assetInfo.url]);

    const handleLoad = useCallback(() => {
        // Successfully loaded the image
        setHasError(false);
    }, []);

    // Common styles
    const baseStyle: React.CSSProperties = {
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        ...style,
    };

    // If using fallback emoji
    if (useFallback || forceEmoji) {
        return (
            <span
                className={`asset-icon asset-icon-emoji ${className}`}
                style={{
                    ...baseStyle,
                    fontSize: size * 0.75,
                    lineHeight: 1,
                    userSelect: 'none',
                }}
                role="img"
                aria-label={alt || assetKey}
                onClick={onClick}
                title={alt || assetKey}
            >
                {emoji}
            </span>
        );
    }

    // Render image with fallback
    return (
        <img
            src={assetInfo.url}
            alt={alt || assetKey}
            className={`asset-icon asset-icon-img ${className}`}
            style={{
                ...baseStyle,
                objectFit: 'contain',
            }}
            onError={handleError}
            onLoad={handleLoad}
            onClick={onClick}
            loading="lazy"
            decoding="async"
        />
    );
};

/**
 * MaterialIcon - Shorthand for material assets
 */
export const MaterialIcon: React.FC<Omit<AssetImageProps, 'type'>> = (props) => (
    <AssetImage type="material" {...props} />
);

/**
 * SkillIcon - Shorthand for skill assets
 */
export const SkillIcon: React.FC<Omit<AssetImageProps, 'type'>> = (props) => (
    <AssetImage type="skill" {...props} />
);

/**
 * ItemIcon - Shorthand for item assets
 */
export const ItemIcon: React.FC<Omit<AssetImageProps, 'type'>> = (props) => (
    <AssetImage type="item" {...props} />
);

/**
 * VfxIcon - Shorthand for VFX sprite assets
 */
export const VfxIcon: React.FC<Omit<AssetImageProps, 'type'>> = (props) => (
    <AssetImage type="vfx" {...props} />
);

/**
 * DynamicIcon - Automatically detects type from key pattern
 */
export const DynamicIcon: React.FC<Omit<AssetImageProps, 'type'> & { assetKey: string }> = ({ assetKey, ...props }) => {
    // Detect type from key pattern
    let type: AssetImageProps['type'] = 'item';

    const key = assetKey.toLowerCase();

    // Skill patterns
    if (/^[wmsao]\d+$/.test(key) || key.includes('skill')) {
        type = 'skill';
    }
    // Material patterns
    else if (key.includes('ore') || key.includes('log') || key.includes('herb') ||
        key.includes('leather') || key.includes('scale') || key.includes('essence') ||
        key.includes('dust') || key.includes('scroll') || key.includes('stone') ||
        key.includes('material')) {
        type = 'material';
    }
    // VFX patterns
    else if (key.includes('particle') || key.includes('vfx') || key.includes('effect')) {
        type = 'vfx';
    }
    // Default to item

    return <AssetImage type={type} assetKey={assetKey} {...props} />;
};

// CSS styles for asset icons (can be added to global CSS)
export const AssetImageStyles = `
.asset-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
}

.asset-icon-img {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}

.asset-icon-emoji {
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

/* Hover effects */
.asset-icon:hover {
  transform: scale(1.1);
  transition: transform 0.15s ease;
}

/* Loading placeholder */
.asset-icon-loading {
  background: linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
`;

export default AssetImage;
