// ============================================
// HAVA DURUMU GÖRSEL EFEKTLERİ
// Kar, yağmur, sis, güneş efektleri
// ============================================

import React, { useEffect, useState, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { weatherManager, WeatherEffect, WeatherType } from '../systems/WeatherSystem';

interface WeatherParticle {
    id: number;
    x: number;
    y: number;
    z: number;
    speed: number;
    size: number;
}

// Hava durumu parçacık sistemi
export function WeatherParticles(): JSX.Element | null {
    const [weather, setWeather] = useState<WeatherEffect>(weatherManager.getCurrentWeather());
    const [particles, setParticles] = useState<WeatherParticle[]>([]);
    const meshRef = React.useRef<THREE.InstancedMesh>(null);

    useEffect(() => {
        const unsubscribe = weatherManager.subscribe((newWeather) => {
            setWeather(newWeather);
        });
        return unsubscribe;
    }, []);

    // Parçacıkları oluştur
    useEffect(() => {
        if (weather.particleCount === 0) {
            setParticles([]);
            return;
        }

        const newParticles: WeatherParticle[] = [];
        const count = weather.type === 'foggy' ? Math.min(weather.particleCount, 80) : weather.particleCount;

        for (let i = 0; i < count; i++) {
            // Sis için daha geniş alan, diğerleri için dar
            const spread = weather.type === 'foggy' ? 80 : 60;
            newParticles.push({
                id: i,
                x: (Math.random() - 0.5) * spread,
                y: weather.type === 'foggy'
                    ? Math.random() * 8 + 1 // Sis için yerden - 1-9 metre yükseklikte
                    : Math.random() * 40 + 15, // Yağmur/kar için yüksekten
                z: (Math.random() - 0.5) * spread,
                speed: weather.type === 'rainy' || weather.type === 'stormy'
                    ? 0.5 + Math.random() * 0.5 // Yağmur hızlı düşer
                    : weather.type === 'snowy'
                        ? 0.08 + Math.random() * 0.08 // Kar yavaş düşer
                        : 0.01 + Math.random() * 0.02, // Sis çok yavaş hareket eder
                size: weather.type === 'snowy'
                    ? 0.08 + Math.random() * 0.08 // Kar tanesi
                    : weather.type === 'foggy'
                        ? 1.5 + Math.random() * 2 // Büyük sis bulutu
                        : 0.03 + Math.random() * 0.02 // İnce yağmur damlası
            });
        }
        setParticles(newParticles);
    }, [weather.particleCount, weather.particleType, weather.type]);

    // Parçacık animasyonu
    useFrame(() => {
        if (!meshRef.current || particles.length === 0) return;

        const dummy = new THREE.Object3D();

        particles.forEach((particle, i) => {
            // Sis için özel hareket - düşmez, yatay sürüklenir
            if (weather.type === 'foggy') {
                particle.x += Math.sin(Date.now() * 0.0002 + particle.id * 0.5) * 0.03;
                particle.z += Math.cos(Date.now() * 0.00015 + particle.id * 0.3) * 0.025;
                particle.y += Math.sin(Date.now() * 0.0001 + particle.id) * 0.008;

                // Sınır kontrolü - yatay wrap
                if (particle.x > 40) particle.x = -40;
                if (particle.x < -40) particle.x = 40;
                if (particle.z > 40) particle.z = -40;
                if (particle.z < -40) particle.z = 40;
            } else {
                // Normal düşme hareketi (kar, yağmur)
                particle.y -= particle.speed;

                // Rüzgar etkisi - fırtınada daha güçlü
                if (weather.type === 'stormy') {
                    particle.x += 0.15; // Güçlü yatay rüzgar
                    particle.z += 0.05;
                } else if (weather.type === 'rainy') {
                    particle.x += 0.03; // Hafif rüzgar
                }

                // Kar için hafif sallanma
                if (weather.type === 'snowy') {
                    particle.x += Math.sin(Date.now() * 0.001 + particle.id) * 0.015;
                    particle.z += Math.cos(Date.now() * 0.0008 + particle.id * 0.7) * 0.01;
                }

                // Yeniden spawn
                if (particle.y < 0) {
                    particle.y = 40 + Math.random() * 10;
                    particle.x = (Math.random() - 0.5) * 60;
                    particle.z = (Math.random() - 0.5) * 60;
                }
            }

            dummy.position.set(particle.x, particle.y, particle.z);

            // Yağmur için dikey uzatma
            if (weather.type === 'rainy' || weather.type === 'stormy') {
                dummy.scale.set(particle.size, particle.size * 8, particle.size); // Uzun ince damla
                dummy.rotation.set(0, 0, weather.type === 'stormy' ? 0.3 : 0.1); // Hafif eğik
            } else {
                dummy.scale.setScalar(particle.size);
            }

            dummy.updateMatrix();
            meshRef.current!.setMatrixAt(i, dummy.matrix);
        });

        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    if (weather.particleCount === 0 || weather.particleType === 'none') {
        return null;
    }

    const particleColor = weather.type === 'snowy' ? '#ffffff'
        : weather.type === 'rainy' ? '#a0c4e8'
            : weather.type === 'stormy' ? '#7fa8cc'
                : weather.type === 'foggy' ? '#b8c5d6'
                    : '#cccccc';

    // Kar için küre, yağmur için silindir, sis için büyük yarı saydam küre
    const geometry = weather.type === 'snowy'
        ? new THREE.SphereGeometry(1, 6, 6) // Kar tanesi
        : weather.type === 'foggy'
            ? new THREE.SphereGeometry(1, 4, 4) // Sis bulutu
            : new THREE.CylinderGeometry(0.3, 0.1, 1, 4); // Yağmur damlası (konik silindir)

    // Sis için çok saydam, diğerleri için daha belirgin
    const opacity = weather.type === 'foggy' ? 0.15 : weather.type === 'snowy' ? 0.9 : 0.6;

    return (
        <instancedMesh ref={meshRef} args={[geometry, undefined, particles.length]}>
            <meshBasicMaterial color={particleColor} transparent opacity={opacity} depthWrite={false} />
        </instancedMesh>
    );
}

// Sis efekti - Scene'e three.js Fog ekler
export function FogEffect(): JSX.Element | null {
    const [weather, setWeather] = useState<WeatherEffect>(weatherManager.getCurrentWeather());
    const { scene } = useThree();

    useEffect(() => {
        const unsubscribe = weatherManager.subscribe((newWeather) => {
            setWeather(newWeather);
        });
        return unsubscribe;
    }, []);

    useEffect(() => {
        if (weather.fogDensity > 0) {
            // Exponential fog for realistic effect
            const fogColor = weather.type === 'foggy' ? 0x94a3b8
                : weather.type === 'snowy' ? 0xe0f2fe
                    : weather.type === 'stormy' ? 0x4a5568
                        : weather.type === 'rainy' ? 0x64748b
                            : 0xffffff;

            const near = weather.type === 'foggy' ? 5 : 30;
            const far = weather.type === 'foggy' ? 40 : 150;

            scene.fog = new THREE.Fog(fogColor, near, far);
        } else {
            scene.fog = null;
        }

        return () => {
            scene.fog = null;
        };
    }, [weather.fogDensity, weather.type, scene]);

    return null;
}

// Hava durumu UI göstergesi
export function WeatherIndicator(): JSX.Element {
    const [weather, setWeather] = useState<WeatherEffect>(weatherManager.getCurrentWeather());
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        const unsubscribe = weatherManager.subscribe((newWeather) => {
            setWeather(newWeather);
        });

        const timer = setInterval(() => {
            setTimeRemaining(weatherManager.getTimeRemaining());
        }, 1000);

        return () => {
            unsubscribe();
            clearInterval(timer);
        };
    }, []);

    const formatTime = (ms: number): string => {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const getWeatherBackground = (type: WeatherType): string => {
        switch (type) {
            case 'sunny': return 'linear-gradient(135deg, #ff9500, #ffcc00)';
            case 'stormy': return 'linear-gradient(135deg, #2c3e50, #4a5568)';
            case 'snowy': return 'linear-gradient(135deg, #a8d8ea, #ffffff)';
            case 'foggy': return 'linear-gradient(135deg, #636e72, #b2bec3)';
            case 'rainy': return 'linear-gradient(135deg, #3498db, #2980b9)';
            default: return '#333';
        }
    };

    const buffList = Object.entries(weather.classBuffs).map(([cls, buff]) => ({
        class: cls,
        buff
    }));

    return (
        <div
            style={{
                position: 'absolute',
                top: 10,
                right: 10,
                background: getWeatherBackground(weather.type),
                borderRadius: 12,
                padding: '8px 12px',
                color: weather.type === 'snowy' ? '#333' : '#fff',
                fontFamily: 'Arial, sans-serif',
                fontSize: 14,
                boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                zIndex: 1000,
                minWidth: 150
            }}
            onClick={() => setShowDetails(!showDetails)}
        >
            {/* Temel Bilgi */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 24 }}>{weather.icon}</span>
                <div>
                    <div style={{ fontWeight: 'bold' }}>{weather.name}</div>
                    <div style={{ fontSize: 11, opacity: 0.9 }}>
                        Kalan: {formatTime(timeRemaining)}
                    </div>
                </div>
            </div>

            {/* Detaylar */}
            {showDetails && (
                <div style={{
                    marginTop: 10,
                    paddingTop: 10,
                    borderTop: '1px solid rgba(255,255,255,0.3)'
                }}>
                    <div style={{ fontSize: 12, marginBottom: 8 }}>
                        {weather.description}
                    </div>

                    {buffList.length > 0 && (
                        <>
                            <div style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 4 }}>
                                🎯 Sınıf Bonusları:
                            </div>
                            {buffList.map(({ class: cls, buff }) => (
                                <div key={cls} style={{ fontSize: 11, marginLeft: 8, marginBottom: 2 }}>
                                    • {getClassName(cls)}: {buff.specialEffect || `+${Math.round((buff.damageMultiplier - 1) * 100)}% Hasar`}
                                </div>
                            ))}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

// Sınıf ismi çevirisi
function getClassName(classId: string): string {
    const names: Record<string, string> = {
        warrior: 'Savaşçı',
        arctic_knight: 'Buz Şövalyesi',
        gale_glaive: 'Fırtına Süvarisi',
        archer: 'Usta Okçu',
        archmage: 'Ulu Büyücü',
        bard: 'Ozan',
        cleric: 'Işık Rahibi',
        martial_artist: 'Dövüş Ustası',
        monk: 'Ruhban',
        reaper: 'Ölüm Meleği'
    };
    return names[classId] || classId;
}

// Hava durumu değişim bildirimi
export function WeatherChangeNotification(): JSX.Element | null {
    const [notification, setNotification] = useState<WeatherEffect | null>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const unsubscribe = weatherManager.subscribe((newWeather) => {
            setNotification(newWeather);
            setVisible(true);

            setTimeout(() => setVisible(false), 5000);
        });
        return unsubscribe;
    }, []);

    if (!visible || !notification) return null;

    return (
        <div style={{
            position: 'fixed',
            top: '20%',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.8)',
            borderRadius: 16,
            padding: '20px 40px',
            color: '#fff',
            fontFamily: 'Arial, sans-serif',
            textAlign: 'center',
            zIndex: 2000,
            animation: 'fadeInOut 5s ease-in-out'
        }}>
            <div style={{ fontSize: 48, marginBottom: 10 }}>
                {notification.icon}
            </div>
            <div style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 5 }}>
                Hava Değişti!
            </div>
            <div style={{ fontSize: 18, color: '#aaa' }}>
                {notification.name}
            </div>
            <div style={{ fontSize: 14, color: '#888', marginTop: 5 }}>
                {notification.description}
            </div>
        </div>
    );
}

export default { WeatherParticles, WeatherIndicator, WeatherChangeNotification, FogEffect };
