import { z } from "zod";

export const pullChangesRequestBodySchema = z.object({
  lastSyncAt: z.coerce.number().default(0),
  tables: z.array(z.enum(['tasks'])),
});

export type PullChangesRequestParams = z.infer<
  typeof pullChangesRequestBodySchema
>;
