import { z } from "zod";

export const taskRequestSchema = z.object({
  id: z.string(),
  name: z.string(),
  is_completed: z.boolean(),
  created_at: z.number(),
  // FIX: Allow null, as WatermelonDB sends null for missing fields
  server_id: z.string().nullable().optional(),
});

export type TaskRequest = z.infer<typeof taskRequestSchema>;
