import { z } from 'zod';

import { taskSchema } from '../task.schema';

export const pullChangesResponseSchema = z.object({
  timestamp: z.number(),
  changes: {
    tasks: {
      created: taskSchema.array(),
      updated: taskSchema.array(),
      deleted: z.array(z.string()),
    },
  },
});

export type PullChangesResponse = z.infer<typeof pullChangesResponseSchema>;
