import { sql, eq } from 'drizzle-orm';

import { items } from '@/db/schema';

import { useDrizzle } from '@/hooks/use-drizzle';

export function hasPendingItems(db: ReturnType<typeof useDrizzle>): boolean {
  const result = db
    .select({ count: sql<number>`count(*)` })
    .from(items)
    .where(eq(items.status, 'pending'))
    .get();

  return !!result && result.count > 0;
}
