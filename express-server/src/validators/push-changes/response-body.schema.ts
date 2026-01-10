import { z } from "zod";

export const pushChangesResponseBodySchema = z.object({
  success: z.boolean(),
  results: z.array(
    z.object({
      recordId: z.string(),
      serverId: z.string(),
      serverUpdatedAt: z.number(),
      error: z.string().nullable(),
    })
  ),
});

export type PushChangesResponseBody = z.infer<
  typeof pushChangesResponseBodySchema
>;
