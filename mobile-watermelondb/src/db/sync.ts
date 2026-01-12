import { ConflictStrategy } from './types';
import { SyncEngine } from './core/sync-engine';

import { database } from '@/db';
import { apiClient } from './api.client';

import { TASK_TABLE_NAME } from './schemas/task.schema';

const syncEngine = new SyncEngine({
  database,
  tables: [TASK_TABLE_NAME],
  apiClient,
  syncInterval: 5 * 60 * 1000, // 5 minutes
  conflictStrategy: ConflictStrategy.SERVER_WINS,
});

export async function initializeSyncEngine() {
  try {
    await syncEngine.initialize();
  } catch (error) {
    console.error('Failed to initialize sync engine:', error);
  }
}

export default syncEngine;
