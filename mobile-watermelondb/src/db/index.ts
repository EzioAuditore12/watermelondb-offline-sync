import { Database, type TableSchema } from '@nozbe/watermelondb';

import { createAdapter } from './adapter';
import { migrations } from './migrations';
import { createSchema } from './schema';

import { TaskTableSchema } from './schemas/task.schema';
import { TaskModel } from './models/task.model';
import { syncQueueTableSchema } from './schemas/sync-queue.schema';
import { SyncQueueItemModel } from './models/sync-queue-item.model';

const tablesSchemas: TableSchema[] = [syncQueueTableSchema, TaskTableSchema];

const models = [SyncQueueItemModel, TaskModel];

const schema = createSchema(tablesSchemas);

export const database = new Database({
  adapter: createAdapter(schema, migrations),
  modelClasses: models,
});
