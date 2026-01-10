import { Router } from "express";
import validate from "express-zod-safe";

import { pullChangesController } from "@/controllers/pull-changes.controller";
import { pushChangesController } from "@/controllers/push-changes.controller";

import { pullChangesRequestBodySchema } from "@/validators/pull-changes/request-body.schema";
import { pushChangesRequestBodySchema } from "@/validators/push-changes/request-body.schema";

const router = Router();

router
  .route("/task/sync/pull")
  .get(validate({ body: pullChangesRequestBodySchema }), pullChangesController);

router
  .route("/task/sync/push")
  .post(
    validate({ body: pushChangesRequestBodySchema }),
    pushChangesController
  );

export default router;
