import { sql } from 'drizzle-orm';
import { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';

import type { SyncQueue as SyncQueueItem } from '../schemas/sync_queue.schema';

import { SyncQueueManager, SyncOperation } from './sync-queue-manager'; // Import from operations to get correct types
import { ApiClient, PushPayload } from '../types';
import { createLogger } from '@/utils/logger';

/**
 * Push synchronizer
 * Handles pushing local changes to the server
 */
export class PushSynchronizer {
  private database: ExpoSQLiteDatabase | null;
  private queueManager: SyncQueueManager;
  private apiClient: ApiClient;
  private maxRetries: number;
  private batchSize: number;
  private logger = createLogger('[PushSynchronizer]', false);

  constructor(
    database: ExpoSQLiteDatabase | null,
    queueManager: SyncQueueManager,
    apiClient: ApiClient,
    maxRetries: number = 3,
    batchSize: number = 50,
    debug: boolean = false
  ) {
    this.database = database;
    this.queueManager = queueManager;
    this.apiClient = apiClient;
    this.maxRetries = maxRetries;
    this.batchSize = batchSize;
    this.logger.setDebug(debug);
  }

  /**
   * Push all pending changes to server
   */
  async push(): Promise<{ pushedCount: number; failedCount: number }> {
    try {
      this.logger.log('Starting push synchronization...');

      // Get pending items from queue
      const pendingItems = await this.queueManager.getPendingItems(this.maxRetries);

      if (pendingItems.length === 0) {
        this.logger.log('No pending items to push');
        return { pushedCount: 0, failedCount: 0 };
      }

      this.logger.log(`Found ${pendingItems.length} items to push`);

      // Process in batches
      let pushedCount = 0;
      let failedCount = 0;

      for (let i = 0; i < pendingItems.length; i += this.batchSize) {
        const batch = pendingItems.slice(i, i + this.batchSize);
        const result = await this.pushBatch(batch);
        pushedCount += result.pushedCount;
        failedCount += result.failedCount;
      }

      this.logger.log(`Push completed: ${pushedCount} pushed, ${failedCount} failed`);

      return { pushedCount, failedCount };
    } catch (error) {
      this.logger.error('Push synchronization failed:', error);
      throw error;
    }
  }

  /**
   * Push a batch of items
   */
  private async pushBatch(
    items: SyncQueueItem[]
  ): Promise<{ pushedCount: number; failedCount: number }> {
    try {
      // Prepare payload
      const payload: PushPayload = {
        changes: items.map((item) => ({
          tableName: item.tableName,
          operation: item.operation as SyncOperation,
          recordId: item.recordId,
          // Cast payload to Record<string, any> as Drizzle infers text({mode:'json'}) as unknown
          data: item.payload as Record<string, any>,
        })),
      };

      // Send to server
      this.logger.log(`Pushing batch of ${items.length} items...`);
      const response = await this.apiClient.push(payload);

      if (!response.success) {
        throw new Error('Push request failed');
      }

      // Process results
      let pushedCount = 0;
      let failedCount = 0;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const result = response.results[i];

        if (result.error) {
          // Item failed - increment retry count
          await this.queueManager.incrementRetry(item.id, result.error);
          failedCount++;
          this.logger.warn(`Item ${item.id} failed: ${result.error}`);
        } else {
          // Item succeeded - update local record and remove from queue
          await this.updateLocalRecord(
            item.tableName,
            item.recordId,
            result.serverId,
            result.serverUpdatedAt
          );
          await this.queueManager.markAsProcessed(item.id);
          pushedCount++;
          this.logger.log(`Item ${item.id} pushed successfully`);
        }
      }

      return { pushedCount, failedCount };
    } catch (error) {
      this.logger.error('Batch push failed:', error);

      // Increment retry count for all items in batch
      let failedCount = 0;
      for (const item of items) {
        try {
          await this.queueManager.incrementRetry(
            item.id,
            error instanceof Error ? error.message : 'Unknown error'
          );
          failedCount++;
        } catch (retryError) {
          this.logger.error(`Failed to increment retry for item ${item.id}:`, retryError);
        }
      }

      return { pushedCount: 0, failedCount };
    }
  }

  /**
   * Update local record with server response
   * NOTE: This uses raw SQL because we don't know the Drizzle Table object
   * derived solely from the 'tableName' string without a lookup map.
   */
  private async updateLocalRecord(
    tableName: string,
    recordId: string,
    serverId?: string,
    serverUpdatedAt?: number
  ): Promise<void> {
    if (!this.database) return;

    try {
      // We construct a raw SQL query to update the record dynamically.
      // Drizzle column names usually match property names unless aliased.
      // We assume columns: serverId, serverUpdatedAt, syncStatus, lastSyncError

      const setParts: any[] = [];

      setParts.push(sql`syncStatus = 'synced'`);
      setParts.push(sql`lastSyncError = NULL`);

      if (serverId) {
        setParts.push(sql`serverId = ${serverId}`);
      }

      if (serverUpdatedAt) {
        // Ensure timestamp is stored correctly (number vs string)
        setParts.push(sql`serverUpdatedAt = ${serverUpdatedAt}`);
      }

      // Construct the final query
      // Note: We use sql.identifier(tableName) for safety if supported,
      // or raw string matching if the driver restricts identifier usage.
      // For Expo SQLite/Drizzle, sql`` template usage is safest.

      await this.database.run(
        sql
          .raw(`UPDATE "${tableName}" SET `)
          .append(sql.join(setParts, sql`, `))
          .append(sql` WHERE id = ${recordId}`)
      );

      this.logger.log(`Updated local record ${tableName}:${recordId}`);
    } catch (error) {
      this.logger.error(`Failed to update local record ${tableName}:${recordId}:`, error);
      // Don't throw - we already removed from queue so we don't want to loop
    }
  }
}
