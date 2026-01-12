import { z } from 'zod';

const changeResponse = z.object({
  recordId: z.string(),
  serverId: z.string(),
  serverUpdatedAt: z.number(),
  error: z.string().optional(),
});

export const pushChangeResponse = z.object({
  success: z.boolean(),
  results: changeResponse.array(),
});
