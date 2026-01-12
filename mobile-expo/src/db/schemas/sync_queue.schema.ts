import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-arktype';
import * as Crypto from 'expo-crypto';

export const syncQueueTable = sqliteTable('sync_queue', {
  id: text()
    .primaryKey()
    .$defaultFn(() => Crypto.randomUUID()),
  operation: text({ enum: ['CREATE', 'UPDATE', 'DELETE'] }).notNull(),
  tableName: text().notNull(),
  recordId: text().notNull(),
  payload: text({ mode: 'json' }).notNull(),
  retryCount: integer().notNull().default(0),
  errorMessage: text(),
  createdAt: integer({ mode: 'timestamp' }).notNull(),
  updatedAt: integer({ mode: 'timestamp' }).notNull(),
});

export const syncQueueSchema = createSelectSchema(syncQueueTable);
export const insertSyncQueueSchema = createInsertSchema(syncQueueTable);

export type SyncQueue = typeof syncQueueSchema.infer;
export type InsertSyncQueue = typeof insertSyncQueueSchema.infer;
