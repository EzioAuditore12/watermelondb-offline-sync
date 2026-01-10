import { z } from "zod";
import { taskRequestSchema } from "./task-response.schema.js";
export const mongooseTaskMapper = z
    .object({
    _id: z.any(),
    name: z.string(),
    is_completed: z.boolean(),
    created_at: z.date(),
})
    .transform((doc) => ({
    id: doc._id.toString(),
    name: doc.name,
    is_completed: doc.is_completed,
    created_at: doc.created_at.getTime(),
}))
    .pipe(taskRequestSchema);
