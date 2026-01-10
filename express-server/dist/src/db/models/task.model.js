import mongoose from "mongoose";
const TaskSchema = new mongoose.Schema({
    name: String,
    is_completed: Boolean,
    created_at: Date,
    updated_at: Date,
    deleted_at: Date,
});
export const Task = mongoose.model("Task", TaskSchema);
