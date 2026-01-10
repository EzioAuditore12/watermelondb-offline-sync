import { useAppState } from '@/hooks/use-app-state';
import { useOnlineManager } from '@/hooks/use-online-manager';
import { QueryClient, QueryClientProvider, focusManager } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';
import { type AppStateStatus, Platform } from 'react-native';

function onAppStateChange(status: AppStateStatus) {
  // React Query already supports in web browser refetch on window focus by default
  if (Platform.OS !== 'web') {
    focusManager.setFocused(status === 'active');
  }
}

export const queryClient = new QueryClient();

export function TanstackReactQueryClientProvider({ children }: PropsWithChildren) {
  useAppState(onAppStateChange);
  useOnlineManager();

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
