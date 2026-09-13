import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useAudioService } from './src/audio/audio';
import { LEVELS } from './src/levels';
import { loadSettings } from './src/settings';
import { GameScreen } from './src/ui/GameScreen';
import { HomeScreen } from './src/ui/HomeScreen';
import { SettingsPanel } from './src/ui/SettingsPanel';

/**
 * Three screens and no navigation library: this is a game you open, play for
 * three minutes and put down (GAME_DESIGN.md §2), and a stack is more machinery
 * than that needs.
 */
type Screen = 'home' | 'settings' | 'playing';

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  /** Which room is open. Rooms unlock in order (GAME_DESIGN.md §13). */
  const [levelIndex, setLevelIndex] = useState(0);

  // The audio service outlives every screen, so the jingle carries across them.
  useAudioService();

  useEffect(() => {
    loadSettings();
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
        ) : (
          <HomeScreen
            onStart={() => {
              setLevelIndex(0);
              setScreen('playing');
            }}
            onSettings={() => setScreen('settings')}
          />
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
