import { z } from "zod";

export const taskRequestSchema = z.object({
  id: z.string(),
  name: z.string(),
  is_completed: z.boolean(),
  created_at: z.number(),
});

export type TaskRequest = z.infer<typeof taskRequestSchema>;
