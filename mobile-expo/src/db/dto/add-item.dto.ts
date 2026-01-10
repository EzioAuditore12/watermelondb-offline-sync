import { useDrizzle } from '@/hooks/use-drizzle';

import { items } from '@/db/schema';

import { guardAsync } from '@/lib/utils';

export async function addItemDto(
  db: ReturnType<typeof useDrizzle>,
  payload: { id: string; title: string }
) {
  const now = Date.now();

  const [_, error] = await guardAsync(
    db.insert(items).values({
      ...payload,
      status: 'pending',
      updatedAt: now,
    })
  );

  return error;
}
