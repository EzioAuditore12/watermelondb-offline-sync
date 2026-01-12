import type { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { gte, lt, eq, sql } from 'drizzle-orm';

import { syncQueueTable, type SyncQueue as SyncQueueItem } from '../schemas/sync_queue.schema';

import { createLogger } from '@/utils/logger';

export type SyncOperation = 'CREATE' | 'UPDATE' | 'DELETE';

export class SyncQueueManager {
  private db: ExpoSQLiteDatabase | null;
  private logger = createLogger('[SyncQueueManager]', false);

  constructor(db: ExpoSQLiteDatabase | null, debug = false) {
    this.db = db;
    this.logger.setDebug(debug);
  }

  /* ------------------------------------------------------------------ */
  /* Add to queue */
  /* ------------------------------------------------------------------ */

  async addToQueue(
    operation: SyncOperation,
    tableName: string,
    recordId: string,
    payload: Record<string, any>
  ): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const now = new Date();

    await this.db.insert(syncQueueTable).values({
      operation,
      tableName,
      recordId,
      payload,
      retryCount: 0,
      errorMessage: null,
      createdAt: now,
      updatedAt: now,
    });

    this.logger.log(`Added ${operation} for ${tableName}:${recordId}`);
  }

  /* ------------------------------------------------------------------ */
  /* Reads */
  /* ------------------------------------------------------------------ */

  async getQueuedItems(): Promise<SyncQueueItem[]> {
    if (!this.db) return [];

    return this.db.select().from(syncQueueTable);
  }

  async getPendingItems(maxRetries: number): Promise<SyncQueueItem[]> {
    if (!this.db) return [];

    const items = await this.db
      .select()
      .from(syncQueueTable)
      .where(lt(syncQueueTable.retryCount, maxRetries));

    this.logger.log(`Found ${items.length} pending items`);
    return items;
  }

  async getFailedItems(maxRetries: number): Promise<SyncQueueItem[]> {
    if (!this.db) return [];

    const items = await this.db
      .select()
      .from(syncQueueTable)
      .where(gte(syncQueueTable.retryCount, maxRetries));

    this.logger.log(`Found ${items.length} failed items`);
    return items;
  }

  async getPendingCount(): Promise<number> {
    if (!this.db) return 0;

    try {
      const rows = await this.db.select().from(syncQueueTable);
      return rows.length;
    } catch {
      return 0;
    }
  }

  /* ------------------------------------------------------------------ */
  /* Mutations */
  /* ------------------------------------------------------------------ */

  async markAsProcessed(itemId: string): Promise<void> {
    if (!this.db) return;

    await this.db.delete(syncQueueTable).where(eq(syncQueueTable.id, itemId));

    this.logger.log(`Marked ${itemId} as processed`);
  }

  async incrementRetry(itemId: string, errorMessage: string): Promise<void> {
    if (!this.db) return;

    await this.db
      .update(syncQueueTable)
      .set({
        retryCount: sql`${syncQueueTable.retryCount} + 1`,
        errorMessage,
        updatedAt: new Date(),
      })
      .where(eq(syncQueueTable.id, itemId));

    this.logger.log(`Incremented retry for ${itemId}`);
  }

  async clearFailedItems(maxRetries: number): Promise<number> {
    if (!this.db) return 0;

    const failed = await this.getFailedItems(maxRetries);

    await this.db.delete(syncQueueTable).where(gte(syncQueueTable.retryCount, maxRetries));

    this.logger.log(`Cleared ${failed.length} failed items`);
    return failed.length;
  }

  async clearAllItems(): Promise<number> {
    if (!this.db) return 0;

    const all = await this.getQueuedItems();

    await this.db.delete(syncQueueTable);

    this.logger.log(`Cleared ${all.length} items`);
    return all.length;
  }
}
