import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { LEVELS } from './src/levels';
import { GameScreen } from './src/ui/GameScreen';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <GameScreen level={LEVELS[0]} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
