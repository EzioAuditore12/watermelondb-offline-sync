import { useLiveQuery } from 'drizzle-orm/expo-sqlite';

import { items } from '@/db/schema';
import { useDrizzle } from '@/hooks/use-drizzle';

export function useItemsLocal(db: ReturnType<typeof useDrizzle>) {
  return useLiveQuery(db.select().from(items));
}
