import { useEffect, useMemo, useState } from 'react';

import { useGetItems } from '../remote/use-get-items';

import { selectItems, replaceItems } from '../queries';
import { ItemEntity } from '../schema';
import { useDrizzle } from '@/hooks/use-drizzle';

type Props = {
  shouldFetchRemote: boolean; // false when offline
};

export function useItems({ shouldFetchRemote }: Props) {
  const [items, setItems] = useState<ItemEntity[]>([]);

  const db = useDrizzle();

  // 1. Hydrate from local cache immediately (works offline)
  useEffect(() => {
    try {
      const rows = selectItems(db);
      setItems(rows);
    } catch (error) {
      console.error(error);
    }
  }, [db]); // <-- add db as dependency

  // 2. Fetch from server (gated by shouldFetchRemote)
  const itemsQuery = useGetItems({ enabled: shouldFetchRemote });

  useEffect(() => {
    if (!itemsQuery.data || !itemsQuery.data.items) return;

    const freshItems = itemsQuery.data.items ?? [];

    // Cache to SQLite for offline reuse
    try {
      replaceItems(db, freshItems);
    } catch (error) {
      console.error(error);
    }

    // Update UI state
    setItems(freshItems);
  }, [itemsQuery.data, db]); // <-- add db as dependency

  return useMemo(
    () => ({
      items,
      isLoading: itemsQuery.isLoading,
      isRefreshing: itemsQuery.isFetching,
      error: itemsQuery.error,
      refresh: itemsQuery.refetch,
    }),
    [
      items,
      itemsQuery.isLoading,
      itemsQuery.isFetching,
      itemsQuery.error,
      itemsQuery.refetch,
    ]
  );
}
