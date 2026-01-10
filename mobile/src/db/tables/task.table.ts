import { createTableSchemaWithSync } from '@loonylabs/react-native-offline-sync';

export const TASK_TABLE_NAME = 'tasks';

export const TaskTable = createTableSchemaWithSync(TASK_TABLE_NAME, [
  { name: 'name', type: 'string' },
  { name: 'is_completed', type: 'boolean' },
  { name: 'created_at', type: 'number' },
]);
