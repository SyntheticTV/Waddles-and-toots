import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useAudioService } from './src/audio/audio';
import { LEVELS } from './src/levels';
import { LevelSelect } from './src/ui/LevelSelect';
import { loadProgress, nextUnfinished, unlockedCount, useProgress } from './src/progress';
import { loadSettings } from './src/settings';
import { GameScreen } from './src/ui/GameScreen';
import { HomeScreen } from './src/ui/HomeScreen';
import { SettingsPanel } from './src/ui/SettingsPanel';

/**
 * Three screens and no navigation library: this is a game you open, play for
 * three minutes and put down (GAME_DESIGN.md §2), and a stack is more machinery
 * than that needs.
 */
type Screen = 'home' | 'settings' | 'rooms' | 'playing';

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  /** Which room is being played. Rooms unlock in order (GAME_DESIGN.md §13). */
  const [levelIndex, setLevelIndex] = useState(0);
  // Subscribed here so beating a room makes the picker appear without a reload.
  useProgress();
  const ids = LEVELS.map((l) => l.id);
  const open = unlockedCount(ids);

  // The audio service outlives every screen, so the jingle carries across them.
  useAudioService();

  useEffect(() => {
    loadSettings();
    loadProgress();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        {screen === 'playing' ? (
          <GameScreen
            level={LEVELS[levelIndex]}
            onExit={() => setScreen('home')}
            onNext={
              levelIndex + 1 < LEVELS.length
                ? () => setLevelIndex((n) => n + 1)
                : undefined
            }
          />
        ) : screen === 'settings' ? (
          <SettingsPanel onClose={() => setScreen('home')} />
        ) : screen === 'rooms' ? (
          <LevelSelect
            onPlay={(i) => {
              setLevelIndex(i);
              setScreen('playing');
            }}
            onClose={() => setScreen('home')}
          />
        ) : (
          <HomeScreen
            onStart={() => {
              // Carry on where they left off rather than starting the game over.
              setLevelIndex(nextUnfinished(ids));
              setScreen('playing');
            }}
            onRooms={open > 1 ? () => setScreen('rooms') : undefined}
            onSettings={() => setScreen('settings')}
          />
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
