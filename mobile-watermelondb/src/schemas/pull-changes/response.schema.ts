import { z } from 'zod';

import { taskSchema } from '../task.schema';

export const pullChangesResponseSchema = z.object({
  timestamp: z.number(),
  changes: z.object({
    tasks: z.object({
      created: z.array(taskSchema),
      updated: z.array(taskSchema),
      deleted: z.array(z.string()),
    }),
  }),
});

export type PullChangesResponse = z.infer<typeof pullChangesResponseSchema>;
