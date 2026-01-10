import type { Response } from "express";
import type { ValidatedRequest } from "express-zod-safe";

import { pullChangesRequestBodySchema } from "@/validators/pull-changes/request-body.schema";

import { TaskSevice } from "@/services/task.service";

const taskService = new TaskSevice();

type pullChangesRequest = ValidatedRequest<{
  body: typeof pullChangesRequestBodySchema;
}>;

export const pullChangesController = async (
  req: pullChangesRequest,
  res: Response
) => {
  const { lastSyncAt, tables } = req.body;

  const changes = await taskService.pullChanges({
    lastSyncAt,
    tables,
  });

  res.status(200).send(changes);
};
