import { z } from 'zod';

export const taskSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(50),
  is_completed: z.boolean(),
  created_at: z.number(),
});

export type Task = z.infer<typeof taskSchema>;
