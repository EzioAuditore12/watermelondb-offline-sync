import { z } from 'zod';

export const pullChangesParamSchema = z.object({
  lastSyncAt: z.number().nullable().optional(),
  tables: z.array(z.string()),
});

export type PullChangesParam = z.infer<typeof pullChangesParamSchema>;
