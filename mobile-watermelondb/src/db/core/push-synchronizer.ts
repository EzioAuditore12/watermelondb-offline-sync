import { Database, Model, Q } from '@nozbe/watermelondb';
import { SyncQueueManager } from './sync-queue-manager';
import { ApiClient, PushPayload, SyncQueueItem } from '../types';
import { createLogger } from '../utils/logger';

/**
 * Push synchronizer
 * Handles pushing local changes to the server
 */
export class PushSynchronizer {
  private database: Database;
  private queueManager: SyncQueueManager;
  private apiClient: ApiClient;
  private maxRetries: number;
  private batchSize: number;
  private logger = createLogger('[PushSynchronizer]', false);

  constructor(
    database: Database,
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
          operation: item.operation,
          recordId: item.recordId,
          data: item.payload,
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
            result.serverUpdatedAt,
            item.operation // <--- PASS OPERATION HERE
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
   */
  private async updateLocalRecord(
    tableName: string,
    recordId: string,
    serverId?: string,
    serverUpdatedAt?: number,
    operation?: string // <--- ADD PARAMETER
  ): Promise<void> {
    try {
      await this.database.write(async () => {
        const collection = this.database.get<Model>(tableName);

        // 1. CHECK IF WE NEED TO SWAP IDS (only for CREATE operations)
        if (operation === 'CREATE' && serverId && serverId !== recordId) {
          try {
            const tempRecord = await collection.find(recordId);

            // Create a COPY with the Server ID
            await collection.create((newRecord) => {
              // FORCE THE ID
              newRecord._raw.id = serverId;

              // Copy all fields from the temporary record
              const rawData = tempRecord._raw;
              Object.keys(rawData).forEach((key) => {
                if (key !== 'id' && key !== '_status' && key !== '_changed') {
                  // @ts-ignore
                  newRecord._raw[key] = rawData[key];
                }
              });

              // Apply sync metadata
              // @ts-ignore
              newRecord.serverId = serverId;
              // @ts-ignore
              newRecord.serverUpdatedAt = serverUpdatedAt;
              // @ts-ignore
              newRecord.offlineSyncStatus = 'synced';
            });

            // IMPORTANT: If there are other pending operations in queue for this record (e.g. UPDATE),
            // update them to point to the new ID, otherwise they will fail.
            try {
              // Attempt to get queue collection - requires 'sync_queue' to be a registered Model
              const queueCollection = this.database.get('sync_queue');
              const pendingOps = await queueCollection
                .query(Q.where('record_id', recordId))
                .fetch();
              for (const op of pendingOps) {
                await op.update((r: any) => {
                  r.recordId = serverId;
                });
              }
            } catch (e) {
              // Ignore if sync_queue model is not available
            }

            // Destroy the old temporary record
            await tempRecord.destroyPermanently();

            this.logger.log(`Swapped temp ID ${recordId} with server ID ${serverId}`);
            return; // EXIT FUNCTION
          } catch (swapError) {
            this.logger.warn('ID Swap failed, falling back to simple update', swapError);
          }
        }

        // 2. STANDARD UPDATE (If no swap needed)
        const record = await collection.find(recordId);

        await record.update((rec: any) => {
          if (serverId) {
            rec.serverId = serverId;
          }
          if (serverUpdatedAt) {
            rec.serverUpdatedAt = serverUpdatedAt;
          }
          rec.offlineSyncStatus = 'synced';
          rec.lastSyncError = null;
        });
      });

      this.logger.log(`Updated local record ${tableName}:${recordId}`);
    } catch (error) {
      this.logger.error(`Failed to update local record ${tableName}:${recordId}:`, error);
    }
  }
}
