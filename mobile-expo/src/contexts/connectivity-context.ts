import { createContext } from 'react';

export const ConnectivityContext = createContext<{ isOnline: boolean } | null>(null);
