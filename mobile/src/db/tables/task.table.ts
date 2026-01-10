import { tableSchema } from '@nozbe/watermelondb';

export const TASK_TABLE_NAME = 'tasks';

export const TaskTable = tableSchema({
  name: TASK_TABLE_NAME,
  columns: [
    { name: 'name', type: 'string' },
    { name: 'is_completed', type: 'boolean' },
    { name: 'created_at', type: 'number' },
    { name: 'server_id', type: 'string', isOptional: true },
    { name: 'server_updated_at', type: 'number', isOptional: true },
    { name: 'sync_status', type: 'string', isOptional: true },
    { name: 'last_sync_error', type: 'string', isOptional: true },
  ],
});