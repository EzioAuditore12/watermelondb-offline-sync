import '../../global.css';

import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useUniwind } from 'uniwind';

import { NAV_THEME } from '@/lib/theme';
import { useEffect } from 'react';
import { initializeSyncEngine } from '@/db/sync';

export default function RootLayout() {
  const { theme } = useUniwind();

  useEffect(() => {
    initializeSyncEngine();
  }, []);

  return (
    <ThemeProvider value={NAV_THEME[theme ?? 'light']}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Stack />
      <PortalHost />
    </ThemeProvider>
  );
}
