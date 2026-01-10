import { TaskSevice } from "../services/task.service.js";
const taskService = new TaskSevice();
export const pullChangesController = async (req, res) => {
    const { lastSyncAt, tables } = req.body;
    const changes = await taskService.pullChanges({
        lastSyncAt,
        tables,
    });
    res.status(200).send(changes);
};
