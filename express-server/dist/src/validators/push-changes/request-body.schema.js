import { z } from "zod";
import { taskRequestSchema } from "../task-response.schema.js";
export const pushChangesRequestBodySchema = z.object({
    changes: z.array(z.object({
        tableName: z.string(),
        operation: z.enum(["CREATE", "UPDATE", "DELETE"]),
        recordId: z.string(),
        data: taskRequestSchema,
    })),
});
