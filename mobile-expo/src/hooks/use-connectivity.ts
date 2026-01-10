import { useContext } from 'react';

import { ConnectivityContext } from '@/contexts/connectivity-context';

export function useConnectivity() {
  const context = useContext(ConnectivityContext);
  if (!context) throw new Error('useConnectivity must be used within ConnectivityProvider');
  return context;
}
