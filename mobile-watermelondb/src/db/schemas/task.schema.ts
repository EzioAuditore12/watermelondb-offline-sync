import { createTableSchemaWithSync } from './sync-metadata.schema';

export const TASK_TABLE_NAME = 'tasks';

export const TaskTableSchema = createTableSchemaWithSync(TASK_TABLE_NAME, [
  { name: 'name', type: 'string' },
  { name: 'is_completed', type: 'boolean' },
  { name: 'created_at', type: 'number' },
]);
