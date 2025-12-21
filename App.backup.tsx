
import React, { useState } from 'react';
import AuthScreen from './components/AuthScreen';
import CharacterSelect from './components/CharacterSelect';
import GameDashboard from './components/GameDashboard';
import { CharacterClass, Faction } from './types';

type GameState = 'auth' | 'char_select' | 'playing';

function App() {
  const [gameState, setGameState] = useState<GameState>('auth');
  const [userData, setUserData] = useState<{ nickname: string; charClass: CharacterClass; faction: Faction } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const handleLogin = () => {
    setIsAdmin(false);
    setGameState('char_select');
  };

  const handleAdminLogin = () => {
    setIsAdmin(true);
    setGameState('char_select');
  };

  const handleCharacterCreated = (nickname: string, charClass: CharacterClass, faction: Faction) => {
    setUserData({ nickname, charClass, faction });
    setGameState('playing');
  };

  const handleLogout = () => {
    setUserData(null);
    setGameState('auth');
    setIsAdmin(false);
  };

  return (
    <div className={`antialiased text-slate-200 bg-slate-950 font-sans selection:bg-yellow-500/30 ${gameState === 'playing' ? 'h-screen w-screen overflow-hidden' : 'min-h-screen overflow-auto'}`}>
      {gameState === 'auth' && (
        <AuthScreen onLogin={handleLogin} onAdminLogin={handleAdminLogin} />
      )}

      {gameState === 'char_select' && (
        <CharacterSelect onComplete={handleCharacterCreated} isAdmin={isAdmin} />
      )}

      {gameState === 'playing' && userData && (
        <GameDashboard
          nickname={userData.nickname}
          charClass={userData.charClass}
          faction={userData.faction}
          isAdmin={isAdmin}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}

export default App;