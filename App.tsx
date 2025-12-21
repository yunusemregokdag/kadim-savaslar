import React, { useState, useEffect } from 'react';
import AuthScreen from './components/AuthScreen';
import CharacterSelect from './components/CharacterSelect';
import GameDashboard from './components/GameDashboard';
import { CharacterClass, Faction } from './types';
import { useAuth, AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { NotificationProvider } from './components/NotificationSystem';
import { SettingsProvider } from './components/SettingsView';


// Simple Error Boundary
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error: any) {
        return { hasError: true, error };
    }
    componentDidCatch(error: any, errorInfo: any) {
        console.error("Caught error:", error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return (
                <div className="p-10 text-red-500 bg-white z-50 absolute top-0 left-0 w-full h-full">
                    <h1>Something went wrong.</h1>
                    <pre>{this.state.error?.toString()}</pre>
                    <pre>{this.state.error?.stack}</pre>
                </div>
            );
        }
        return this.props.children;
    }
}

type GameState = 'auth' | 'char_select' | 'playing';

function AppContent() {
    const { user, loading, isAuthenticated, login, logout } = useAuth();
    const [gameState, setGameState] = useState<GameState>('auth');
    const [activeCharacter, setActiveCharacter] = useState<{ nickname: string; charClass: CharacterClass; faction: Faction; id: string } | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);

    // Sync auth state with game state
    useEffect(() => {
        if (!loading) {
            if (isAuthenticated) {
                if (gameState === 'auth') {
                    setGameState('char_select');
                }
            } else {
                setGameState('auth');
                setActiveCharacter(null);
            }
        }
    }, [isAuthenticated, loading]);

    // Apply settings as CSS variables
    useEffect(() => {
        const applySettings = () => {
            const savedSettings = localStorage.getItem('gameSettings');
            if (savedSettings) {
                try {
                    const settings = JSON.parse(savedSettings);
                    // Apply UI scale
                    if (settings.uiScale) {
                        document.documentElement.style.setProperty('--ui-scale', `${settings.uiScale / 100}`);
                    }
                    // Apply HUD opacity
                    if (settings.hudOpacity) {
                        document.documentElement.style.setProperty('--hud-opacity', `${settings.hudOpacity / 100}`);
                    }
                    // Apply button size
                    if (settings.buttonSize) {
                        document.documentElement.style.setProperty('--button-scale', `${settings.buttonSize / 100}`);
                    }
                } catch (e) {
                    console.error('Error parsing settings:', e);
                }
            }
        };

        // Apply on mount
        applySettings();

        // Listen for settings changes
        const handleSettingsChange = (e: CustomEvent) => {
            const { key, value } = e.detail;
            if (key === 'uiScale') {
                document.documentElement.style.setProperty('--ui-scale', `${value / 100}`);
            }
            if (key === 'hudOpacity') {
                document.documentElement.style.setProperty('--hud-opacity', `${value / 100}`);
            }
            if (key === 'buttonSize') {
                document.documentElement.style.setProperty('--button-scale', `${value / 100}`);
            }
        };

        window.addEventListener('kadim-settings-change', handleSettingsChange as EventListener);
        return () => {
            window.removeEventListener('kadim-settings-change', handleSettingsChange as EventListener);
        };
    }, []);

    const handleLogin = (userData: any) => {
        // Auth state is handled by AuthContext, this just triggers UI update if needed
        // Usually, the useEffect above will handle the transition
        if (userData.id === 'guest') {
            // Mock guest Login (bypassing backend for testing if needed)
            setGameState('char_select');
        }
    };

    const handleAdminLogin = () => {
        setIsAdmin(true);
        // Developer login - bypass backend completely for testing
        setGameState('char_select');
    };

    const handleCharacterSelected = (nickname: string, charClass: CharacterClass, faction: Faction, characterId?: string) => {
        setActiveCharacter({
            nickname,
            charClass,
            faction,
            id: characterId || 'temp_id'
        });
        setGameState('playing');
    };

    const handleLogout = () => {
        logout();
        setGameState('auth');
        setActiveCharacter(null);
        setIsAdmin(false);
    };

    if (loading) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0f172a] text-white">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-500 mb-4"></div>
                <h2 className="text-xl font-bold animate-pulse text-yellow-500">KADİM SAVAŞLAR</h2>
                <p className="text-slate-400 mt-2">Yükleniyor...</p>
            </div>
        );
    }

    return (
        <div className={`antialiased text-slate-200 bg-slate-950 font-sans selection:bg-yellow-500/30 ${gameState === 'playing' ? 'h-screen w-screen overflow-hidden' : 'min-h-screen overflow-auto'}`}>
            {!isAuthenticated && !isAdmin && gameState === 'auth' && (
                <AuthScreen onLogin={handleLogin} onAdminLogin={handleAdminLogin} />
            )}

            {(isAuthenticated || isAdmin) && gameState === 'char_select' && (
                <ErrorBoundary>
                    <CharacterSelect onComplete={handleCharacterSelected} isAdmin={isAdmin} />
                </ErrorBoundary>
            )}

            {gameState === 'playing' && activeCharacter && (
                <GameDashboard
                    nickname={activeCharacter.nickname}
                    charClass={activeCharacter.charClass}
                    faction={activeCharacter.faction}
                    isAdmin={isAdmin}
                    onLogout={handleLogout}
                    characterId={activeCharacter.id}
                />
            )}
        </div>
    );
}

function App() {
    return (
        <LanguageProvider>
            <AuthProvider>
                <SettingsProvider>
                    <NotificationProvider>
                        <AppContent />
                    </NotificationProvider>
                </SettingsProvider>
            </AuthProvider>
        </LanguageProvider>
    );
}

export default App;