import { z } from "zod";
import { taskRequestSchema } from "../task-response.schema";

export const pullChangesResponseSchema = z.object({
  timestamp: z.number(),
  changes: z.object({
    tasks: z.object({
      created: z.array(taskRequestSchema),
      updated: z.array(taskRequestSchema),
      deleted: z.array(z.string()),
    }),
  }),
});

export type PullChangesResponse = z.infer<typeof pullChangesResponseSchema>;
