import { Database, type TableSchema } from '@nozbe/watermelondb';
import { syncQueueTableSchema, SyncQueueItemModel, createTableSchemaWithSync } from '@loonylabs/react-native-offline-sync';

import { createAdapter } from './adapter';
import { migrations } from './migrations';
import { createSchema } from './schema';

import { TaskTable } from './tables/task.table';
import { Task } from './models/task';

const tables: TableSchema[] = [syncQueueTableSchema, TaskTable];

const models = [Task, SyncQueueItemModel];

const schema = createSchema(tables);

console.log('TaskTable:', TaskTable);
console.log('Sync QueueTable', syncQueueTableSchema);

export const database = new Database({
  adapter: createAdapter(schema, migrations),
  modelClasses: models,
});
