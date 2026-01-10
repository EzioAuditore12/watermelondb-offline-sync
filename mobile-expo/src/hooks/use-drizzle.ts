import { useContext } from 'react';

import { DrizzleContext } from '@/contexts/drizzle-context';

export function useDrizzle() {
  const context = useContext(DrizzleContext);
  if (!context) {
    throw new Error('useDrizzle must be used within a DrizzleProvider');
  }
  return context;
}
