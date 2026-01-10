import { items } from '@/db/schema';
import type { NewItemEntity } from '@/db/schema';

import { useDrizzle } from '@/hooks/use-drizzle';

export const selectItems = (db: ReturnType<typeof useDrizzle>) => {
  return db.select().from(items).all();
};

export const replaceItems = (db: ReturnType<typeof useDrizzle>, rows: NewItemEntity[]) => {
  return db.transaction((tx) => {
    tx.delete(items).run();
    rows.forEach((row) => tx.insert(items).values(row).run());
  });
};
