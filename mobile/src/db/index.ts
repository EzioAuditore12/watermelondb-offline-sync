import { Database, type TableSchema } from '@nozbe/watermelondb';
import {
  syncQueueTableSchema,
} from '@loonylabs/react-native-offline-sync';

import { createAdapter } from './adapter';
import { migrations } from './migrations';
import { createSchema } from './schema';

import { TaskTable } from './tables/task.table';
import { Task } from './models/task';

const tables: TableSchema[] = [syncQueueTableSchema, TaskTable];

const models = [Task];

const schema = createSchema(tables);

export const database = new Database({
  adapter: createAdapter(schema, migrations),
  modelClasses: models,
});
