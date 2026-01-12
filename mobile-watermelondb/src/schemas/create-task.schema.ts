import { z } from 'zod';

export const createTaskSchema = z.object({
  name: z.string().min(1).max(50),
  isCompleted: z.boolean(),
});

export type CreateTask = z.infer<typeof createTaskSchema>;
