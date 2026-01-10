import { useEffect } from 'react';

import { useConnectivity } from '@/hooks/use-connectivity';

import { syncPendingItems } from './sync-pending-items';

import { sendItemToServer } from '../api/send-item.api';

import { useDrizzle } from '@/hooks/use-drizzle';

export function SyncManager() {
  const { isOnline } = useConnectivity();
  const db = useDrizzle();

  useEffect(() => {
    if (isOnline) {
      syncPendingItems(db, sendItemToServer).catch(console.error);
    }
  }, [isOnline, db]);

  return null;
}
