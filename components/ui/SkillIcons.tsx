/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SKILL ICONS - Tamamiyle Kod ile Yapılmış Skill İconları
 * 
 * Bu dosya PNG yerine SVG/CSS ile oluşturulmuş skill iconlarını içerir.
 * Avantajları:
 * - Dosya boyutu çok küçük
 * - Her boyutta net görünüm (vektörel)
 * - Renk değiştirilebilir
 * - Animasyon eklenebilir
 * 
 * ⚠️ BU DOSYA SİLİNMEMELİ - Skill sisteminin temel parçasıdır!
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React from 'react';

// ═══════════════════════════════════════════════════════════════════════════
// WARRIOR SKİLLERİ
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Charge/Öfke Patlaması Skill İconu
 * Turuncu-sarı ateş şimşeği efekti
 */
export const ChargeIcon: React.FC<{ size?: number; className?: string }> = ({
    size = 48,
    className = ''
}) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        className={className}
        style={{ filter: 'drop-shadow(0 0 4px rgba(255, 150, 0, 0.8))' }}
    >
        <defs>
            {/* Ana ateş gradyan */}
            <linearGradient id="fireGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fff7c0" />
                <stop offset="30%" stopColor="#ffcc00" />
                <stop offset="60%" stopColor="#ff8c00" />
                <stop offset="100%" stopColor="#ff4500" />
            </linearGradient>

            {/* İç ateş gradyan - daha açık */}
            <linearGradient id="fireGradient2" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#fffbe8" />
                <stop offset="50%" stopColor="#ffd700" />
                <stop offset="100%" stopColor="#ff6600" />
            </linearGradient>

            {/* Glow efekti */}
            <filter id="fireGlow">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
        </defs>

        {/* Arka plan glow */}
        <ellipse cx="32" cy="40" rx="16" ry="6" fill="rgba(255, 100, 0, 0.3)" />

        {/* Ana ateş şekli - 3 alev dili */}
        <g filter="url(#fireGlow)">
            {/* Sol alev */}
            <path
                d="M20 50 Q18 35 25 20 Q28 25 26 32 Q30 15 32 8 Q28 20 30 28 Q25 22 22 35 Q24 42 20 50Z"
                fill="url(#fireGradient1)"
            />

            {/* Orta alev (en büyük) */}
            <path
                d="M28 52 Q26 40 30 25 Q32 32 33 28 Q35 12 38 4 Q36 18 38 24 Q42 10 44 6 Q40 22 42 30 Q45 20 46 28 Q44 40 40 52Z"
                fill="url(#fireGradient1)"
            />

            {/* Sağ alev */}
            <path
                d="M44 50 Q46 35 40 22 Q38 28 40 32 Q36 18 34 12 Q38 22 36 28 Q42 24 44 36 Q42 42 44 50Z"
                fill="url(#fireGradient1)"
            />
        </g>

        {/* İç alevler - daha parlak */}
        <g>
            {/* Sol iç */}
            <path
                d="M24 48 Q23 38 27 26 Q29 30 28 34 Q30 24 32 18 Q30 28 31 32 Q27 28 25 38 Q26 42 24 48Z"
                fill="url(#fireGradient2)"
                opacity="0.9"
            />

            {/* Orta iç */}
            <path
                d="M32 50 Q31 42 33 30 Q34 35 35 32 Q36 20 38 14 Q37 26 38 30 Q40 22 41 28 Q40 38 38 50Z"
                fill="url(#fireGradient2)"
                opacity="0.95"
            />

            {/* Sağ iç */}
            <path
                d="M40 48 Q41 38 38 28 Q37 32 38 35 Q36 26 35 22 Q37 28 36 32 Q40 30 41 40 Q40 44 40 48Z"
                fill="url(#fireGradient2)"
                opacity="0.9"
            />
        </g>

        {/* En iç çekirdek - beyaza yakın */}
        <path
            d="M34 48 Q33 42 35 34 Q36 38 36 36 Q37 28 38 24 Q37 32 37 35 Q38 30 38 36 Q38 42 36 48Z"
            fill="#fffef0"
            opacity="0.8"
        />
    </svg>
);

/**
 * Kılıç Darbesi Skill İconu
 * Keskin kılıç vuruşu efekti
 */
export const SwordStrikeIcon: React.FC<{ size?: number; className?: string }> = ({
    size = 48,
    className = ''
}) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        className={className}
        style={{ filter: 'drop-shadow(0 0 3px rgba(200, 200, 200, 0.6))' }}
    >
        <defs>
            <linearGradient id="swordGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="50%" stopColor="#c0c0c0" />
                <stop offset="100%" stopColor="#808080" />
            </linearGradient>
            <linearGradient id="slashGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="50%" stopColor="#a0d8ff" />
                <stop offset="100%" stopColor="#4080ff" />
            </linearGradient>
        </defs>

        {/* Kılıç gövdesi */}
        <path
            d="M12 52 L16 48 L48 16 L52 12 L54 14 L22 46 L18 50 Z"
            fill="url(#swordGradient)"
            stroke="#404040"
            strokeWidth="1"
        />

        {/* Kılıç kabzası */}
        <rect x="8" y="48" width="10" height="4" rx="1" fill="#8B4513" transform="rotate(-45, 12, 50)" />

        {/* Slash efekti */}
        <path
            d="M50 10 Q55 15 58 8 Q52 12 50 10"
            fill="url(#slashGradient)"
            opacity="0.8"
        />
        <path
            d="M54 14 Q58 18 62 12 Q56 16 54 14"
            fill="url(#slashGradient)"
            opacity="0.6"
        />
    </svg>
);

/**
 * Kalkan Duvarı Skill İconu
 * Koruyucu kalkan efekti
 */
export const ShieldWallIcon: React.FC<{ size?: number; className?: string }> = ({
    size = 48,
    className = ''
}) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        className={className}
        style={{ filter: 'drop-shadow(0 0 4px rgba(100, 150, 255, 0.6))' }}
    >
        <defs>
            <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#6495ED" />
                <stop offset="50%" stopColor="#4169E1" />
                <stop offset="100%" stopColor="#1E3A8A" />
            </linearGradient>
            <linearGradient id="shieldRim" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFD700" />
                <stop offset="50%" stopColor="#DAA520" />
                <stop offset="100%" stopColor="#B8860B" />
            </linearGradient>
        </defs>

        {/* Kalkan ana gövde */}
        <path
            d="M32 6 L56 16 L56 32 Q56 50 32 60 Q8 50 8 32 L8 16 Z"
            fill="url(#shieldGradient)"
            stroke="url(#shieldRim)"
            strokeWidth="3"
        />

        {/* İç dekorasyon */}
        <path
            d="M32 14 L46 20 L46 30 Q46 42 32 50 Q18 42 18 30 L18 20 Z"
            fill="none"
            stroke="#a0c0ff"
            strokeWidth="2"
            opacity="0.6"
        />

        {/* Merkez sembol */}
        <circle cx="32" cy="32" r="6" fill="#FFD700" opacity="0.8" />
        <circle cx="32" cy="32" r="3" fill="#ffffff" opacity="0.6" />
    </svg>
);

/**
 * Yere Vurma / Ground Slam Skill İconu
 * Sismik dalga efekti
 */
export const GroundSlamIcon: React.FC<{ size?: number; className?: string }> = ({
    size = 48,
    className = ''
}) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        className={className}
        style={{ filter: 'drop-shadow(0 0 3px rgba(139, 69, 19, 0.8))' }}
    >
        <defs>
            <linearGradient id="groundGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#8B4513" />
                <stop offset="100%" stopColor="#5D3A1A" />
            </linearGradient>
            <linearGradient id="impactGradient" x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stopColor="#FFD700" />
                <stop offset="100%" stopColor="#FF8C00" />
            </linearGradient>
        </defs>

        {/* Zemin */}
        <ellipse cx="32" cy="52" rx="28" ry="8" fill="url(#groundGradient)" />

        {/* Çatlak çizgileri */}
        <path d="M32 44 L32 52" stroke="#FFD700" strokeWidth="2" />
        <path d="M32 44 L20 54" stroke="#FFA500" strokeWidth="1.5" />
        <path d="M32 44 L44 54" stroke="#FFA500" strokeWidth="1.5" />
        <path d="M32 44 L12 50" stroke="#FF8C00" strokeWidth="1" />
        <path d="M32 44 L52 50" stroke="#FF8C00" strokeWidth="1" />

        {/* Impact dalgaları */}
        <ellipse cx="32" cy="44" rx="20" ry="6" fill="none" stroke="url(#impactGradient)" strokeWidth="2" opacity="0.8" />
        <ellipse cx="32" cy="40" rx="14" ry="4" fill="none" stroke="url(#impactGradient)" strokeWidth="1.5" opacity="0.6" />
        <ellipse cx="32" cy="36" rx="8" ry="2" fill="none" stroke="url(#impactGradient)" strokeWidth="1" opacity="0.4" />

        {/* Yumruk/vuruş */}
        <path
            d="M28 8 L28 30 L24 32 L24 36 L40 36 L40 32 L36 30 L36 8 Z"
            fill="#c0c0c0"
            stroke="#808080"
            strokeWidth="1"
        />
    </svg>
);

/**
 * Kıyam/Whirlwind Ultimate Skill İconu
 * Dönen kılıç kasırgası
 */
export const WhirlwindIcon: React.FC<{ size?: number; className?: string }> = ({
    size = 48,
    className = ''
}) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        className={`${className} animate-spin`}
        style={{
            filter: 'drop-shadow(0 0 5px rgba(255, 0, 0, 0.7))',
            animationDuration: '2s'
        }}
    >
        <defs>
            <linearGradient id="whirlGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff4444" />
                <stop offset="50%" stopColor="#cc0000" />
                <stop offset="100%" stopColor="#880000" />
            </linearGradient>
        </defs>

        {/* Dönen kılıçlar */}
        <g>
            {/* Kılıç 1 */}
            <path d="M32 32 L32 8 L36 12 L34 32 Z" fill="url(#whirlGradient)" />
            {/* Kılıç 2 */}
            <path d="M32 32 L56 32 L52 36 L32 34 Z" fill="url(#whirlGradient)" />
            {/* Kılıç 3 */}
            <path d="M32 32 L32 56 L28 52 L30 32 Z" fill="url(#whirlGradient)" />
            {/* Kılıç 4 */}
            <path d="M32 32 L8 32 L12 28 L32 30 Z" fill="url(#whirlGradient)" />
        </g>

        {/* Merkez */}
        <circle cx="32" cy="32" r="8" fill="#ff0000" />
        <circle cx="32" cy="32" r="4" fill="#ffcccc" />
    </svg>
);

// ═══════════════════════════════════════════════════════════════════════════
// GENEL SKİLL İCONLARI
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Varsayılan Skill İconu
 * Bilinmeyen skillerde kullanılır
 */
export const DefaultSkillIcon: React.FC<{
    size?: number;
    className?: string;
    color?: string;
    number?: number;
}> = ({
    size = 48,
    className = '',
    color = '#666666',
    number
}) => (
        <svg
            width={size}
            height={size}
            viewBox="0 0 64 64"
            className={className}
        >
            <defs>
                <linearGradient id={`defaultGradient-${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={color} stopOpacity="0.8" />
                    <stop offset="100%" stopColor={color} stopOpacity="0.4" />
                </linearGradient>
            </defs>

            <circle cx="32" cy="32" r="28" fill={`url(#defaultGradient-${color})`} stroke={color} strokeWidth="2" />

            {number !== undefined && (
                <text x="32" y="40" textAnchor="middle" fill="white" fontSize="24" fontWeight="bold">
                    {number}
                </text>
            )}
        </svg>
    );

// ═══════════════════════════════════════════════════════════════════════════
// SKILL ICON HELPER
// ═══════════════════════════════════════════════════════════════════════════

export const getSkillIcon = (skillId: string, size: number = 48): React.ReactNode => {
    const iconMap: Record<string, React.ReactNode> = {
        'w1': <SwordStrikeIcon size={size} />,
        'w2': <ShieldWallIcon size={size} />,
        'w3': <ChargeIcon size={size} />,
        'w4': <GroundSlamIcon size={size} />,
        'w7': <WhirlwindIcon size={size} />,
    };

    return iconMap[skillId] || <DefaultSkillIcon size={size} />;
};

export default {
    ChargeIcon,
    SwordStrikeIcon,
    ShieldWallIcon,
    GroundSlamIcon,
    WhirlwindIcon,
    DefaultSkillIcon,
    getSkillIcon
};
