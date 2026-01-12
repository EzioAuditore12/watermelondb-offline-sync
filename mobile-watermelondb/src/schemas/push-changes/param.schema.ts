import { z } from 'zod';

import { taskSchema } from '../task.schema';

const changeSchema = z.object({
  tableName: z.string(),
  operation: z.enum(['CREATE', 'UPDATE', 'DELETE']),
  recordId: z.string(),
  data: taskSchema,
});

export const pushChangesParamSchema = z.object({
  changes: changeSchema.array(),
});

export type PushChangeParam = z.infer<typeof pushChangesParamSchema>;
