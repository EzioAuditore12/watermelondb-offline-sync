import { useEffect, useState, type PropsWithChildren } from 'react';
import NetInfo from '@react-native-community/netinfo';

import { ConnectivityContext } from '@/contexts/connectivity-context';

export function ConnectivityProvider({ children }: PropsWithChildren) {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(!!state.isConnected);
    });
    return unsubscribe;
  }, []);

  return (
    <ConnectivityContext.Provider value={{ isOnline }}>{children}</ConnectivityContext.Provider>
  );
}
