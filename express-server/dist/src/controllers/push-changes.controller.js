import { TaskSevice } from "../services/task.service.js";
const taskService = new TaskSevice();
export const pushChangesController = async (req, res) => {
    const changes = req.body;
    const pushedChanges = await taskService.pushChanges(changes);
    res.status(200).send(pushedChanges);
};
