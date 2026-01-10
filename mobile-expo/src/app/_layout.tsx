import '../../global.css';

import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useUniwind } from 'uniwind';

import { NAV_THEME } from '@/lib/theme';
import { DatabaseProvider } from '@/providers/database-provider';
import { TanstackReactQueryClientProvider } from '@/providers/tanstak-query-client.provider';
import { ConnectivityProvider } from '@/providers/connectivity.provider';

export default function RootLayout() {
  const { theme } = useUniwind();

  return (
    <ThemeProvider value={NAV_THEME[theme ?? 'light']}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <DatabaseProvider>
        <ConnectivityProvider>
          <TanstackReactQueryClientProvider>
            <Stack initialRouteName="index">
              <Stack.Screen name="index" />
            </Stack>
          </TanstackReactQueryClientProvider>
        </ConnectivityProvider>
      </DatabaseProvider>
      <PortalHost />
    </ThemeProvider>
  );
}
