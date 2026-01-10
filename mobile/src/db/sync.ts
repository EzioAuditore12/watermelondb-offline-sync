import { ConflictStrategy, SyncEngine } from '@loonylabs/react-native-offline-sync';

import { database } from '@/db';
import { apiClient } from './api.client';

import { TASK_TABLE_NAME } from './tables/task.table';

const syncEngine = new SyncEngine({
  database,
  tables: [TASK_TABLE_NAME],
  apiClient,
  syncInterval: 5 * 60 * 1000, // 5 minutes
  conflictStrategy: ConflictStrategy.LAST_WRITE_WINS,
});

await syncEngine.initialize();

export default syncEngine;
