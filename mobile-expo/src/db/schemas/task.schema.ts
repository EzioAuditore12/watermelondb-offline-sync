import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { createSelectSchema } from 'drizzle-arktype';
import * as Crypto from 'expo-crypto';

import { syncMetadataColumns } from '../utils/sync-metadata';

export const taskTable = sqliteTable('tasks', {
  id: text()
    .primaryKey()
    .$defaultFn(() => Crypto.randomUUID()),
  name: text().notNull(),
  isCompleted: integer({ mode: 'boolean' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`)
    .$onUpdate(() => sql`(unixepoch() * 1000)`),
  ...syncMetadataColumns,
});

export const taskSchema = createSelectSchema(taskTable);
