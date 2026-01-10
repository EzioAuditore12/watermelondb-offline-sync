import type { Response } from "express";
import type { ValidatedRequest } from "express-zod-safe";

import { TaskSevice } from "@/services/task.service";
import { pushChangesRequestBodySchema } from "@/validators/push-changes/request-body.schema";

type PushChangesRequest = ValidatedRequest<{
  body: typeof pushChangesRequestBodySchema;
}>;

const taskService = new TaskSevice();

export const pushChangesController = async (
  req: PushChangesRequest,
  res: Response
) => {
  const changes = req.body;

  const pushedChanges = await taskService.pushChanges(changes);

  res.status(200).send(pushedChanges);
};
