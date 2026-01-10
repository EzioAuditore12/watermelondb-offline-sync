import { ItemEntity, items } from '@/db/schema';
import { guardAsync } from '@/lib/utils';

import { queryClient } from '@/providers/tanstak-query-client.provider';

import { eq } from 'drizzle-orm';

import { useDrizzle } from '@/hooks/use-drizzle';

export async function syncPendingItems(
  db: ReturnType<typeof useDrizzle>,
  sendToServer: (item: ItemEntity) => Promise<void>
) {
  const pendingItems = db.select().from(items).where(eq(items.status, 'pending')).all();

  for (const item of pendingItems) {
    const [_, error] = await guardAsync(sendToServer(item));

    await db
      .update(items)
      .set({ status: error ? 'failed' : 'synced' })
      .where(eq(items.id, item.id));
  }

  await queryClient.invalidateQueries({ queryKey: ['items'] });
}
