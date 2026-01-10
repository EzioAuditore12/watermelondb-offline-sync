import { z } from "zod";
export const taskRequestSchema = z.object({
    id: z.string(),
    name: z.string(),
    is_completed: z.boolean(),
    created_at: z.number(),
    // ADD THIS: Used for Soft Deletes
    deleted_at: z.number().nullable().optional(),
    // FIX: Allow null, as WatermelonDB sends null for missing fields
    server_id: z.string().nullable().optional(),
});
