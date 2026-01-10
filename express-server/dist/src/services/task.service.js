import { Task } from "../db/models/task.model.js";
import { mongooseTaskMapper } from "../validators/mongoose-task-mapper.js";
import z from "zod";
import mongoose from "mongoose";
export class TaskSevice {
    async pullChanges({ lastSyncAt, tables, }) {
        // 1. Find ALL changed records (including soft-deleted ones)
        const tasks = await Task.find({
            updated_at: { $gt: new Date(lastSyncAt) },
        }).lean();
        const mappedTasks = z.array(mongooseTaskMapper).parse(tasks);
        console.log(`Found ${tasks.length} tasks to sync.`);
        // 2. Separate Active vs Deleted records
        // If deleted_at exists, it goes into the 'deleted' list for WatermelonDB
        const deletedTasks = mappedTasks.filter((t) => t.deleted_at != null);
        const activeTasks = mappedTasks.filter((t) => t.deleted_at == null);
        const created = activeTasks.filter((t) => t.created_at > lastSyncAt);
        const updated = activeTasks.filter((t) => t.created_at <= lastSyncAt);
        // Map objects to just IDs for the 'deleted' array
        const deletedIds = deletedTasks.map((t) => t.id);
        return {
            changes: {
                tasks: {
                    created,
                    updated,
                    deleted: deletedIds,
                },
            },
            timestamp: Date.now(),
        };
    }
    async pushChanges({ changes, }) {
        console.log("--- Push Request ---");
        console.log(`Received ${changes.length} changes to process.`);
        const created = [];
        const updated = [];
        // FIX: Changed type to store identifiers object instead of just string
        const deleted = [];
        // Group the flat list of operations by type
        for (const change of changes) {
            if (change.tableName === "tasks") {
                // Assert that the combination of change.data and recordId matches our TaskRequest shape
                const taskData = { ...change.data, id: change.recordId };
                switch (change.operation) {
                    case "CREATE":
                        created.push(taskData);
                        break;
                    case "UPDATE":
                        if (taskData.server_id) {
                            updated.push(taskData);
                        }
                        else {
                            console.warn(`Task ${change.recordId} requested UPDATE but is missing server_id. Switching to CREATE.`);
                            created.push(taskData);
                        }
                        break;
                    case "DELETE":
                        // FIX: Extract server_id from data so we can delete the correct document in MongoDB
                        deleted.push({
                            recordId: change.recordId,
                            serverId: taskData.server_id,
                        });
                        break;
                }
            }
        }
        const results = [];
        // Execute database operations
        if (created.length > 0) {
            results.push(...(await this.createTasks(created)));
        }
        if (updated.length > 0) {
            results.push(...(await this.updateTasks(updated)));
        }
        if (deleted.length > 0) {
            results.push(...(await this.deleteTask(deleted)));
        }
        return {
            success: true,
            results,
        };
    }
    /**
     * Handles creation of NEW records.
     */
    async createTasks(tasks) {
        console.log(`Creating ${tasks.length} new tasks...`);
        const results = [];
        for (const task of tasks) {
            console.log(`Creating task (Temp ID: ${task.id}) - ${task.name}`);
            try {
                const newDoc = await Task.create({
                    name: task.name,
                    is_completed: task.is_completed,
                    created_at: new Date(task.created_at),
                    updated_at: new Date(),
                });
                results.push({
                    recordId: task.id,
                    serverId: newDoc._id.toString(),
                    serverUpdatedAt: Date.now(),
                    error: undefined,
                });
            }
            catch (error) {
                console.error(`Error creating task ${task.id}:`, error);
                results.push({
                    recordId: task.id,
                    serverId: task.id,
                    serverUpdatedAt: Date.now(),
                    error: error.message || "Unknown error",
                });
            }
        }
        return results;
    }
    /**
     * Handles updates to EXISTING records.
     */
    async updateTasks(tasks) {
        console.log(`Updating ${tasks.length} existing tasks...`);
        const results = [];
        for (const task of tasks) {
            console.log(`Updating task (Client ID: ${task.id})`);
            try {
                // FIX: No need for (task as any) anymore
                const serverId = task.server_id;
                // Double check, though logic in pushChanges should prevent this
                if (!serverId) {
                    throw new Error(`Task ${task.id} has no server_id. Cannot update on server.`);
                }
                await Task.updateOne({ _id: serverId }, {
                    $set: {
                        name: task.name,
                        is_completed: task.is_completed,
                        created_at: new Date(task.created_at),
                        updated_at: new Date(),
                    },
                });
                results.push({
                    recordId: task.id,
                    serverId: serverId,
                    serverUpdatedAt: Date.now(),
                    error: undefined,
                });
            }
            catch (error) {
                console.error(`Error updating task ${task.id}:`, error);
                results.push({
                    recordId: task.id,
                    serverId: task.id,
                    serverUpdatedAt: Date.now(),
                    error: error.message || "Unknown error",
                });
            }
        }
        return results;
    }
    // FIX: Perform Soft Delete (Tombstone) on Server
    async deleteTask(items) {
        console.log(`Processing ${items.length} deleted tasks (Soft Delete)...`);
        const results = [];
        for (const item of items) {
            const idToDelete = item.serverId || item.recordId;
            console.log(`Soft cancelling task: ${idToDelete}`);
            try {
                if (!idToDelete || !mongoose.isValidObjectId(idToDelete)) {
                    console.warn(`ID ${idToDelete} is not valid. Skipping.`);
                    results.push({
                        recordId: item.recordId,
                        serverId: item.serverId || item.recordId,
                        serverUpdatedAt: Date.now(),
                        error: undefined, // Treat as success to clear queue
                    });
                    continue;
                }
                // KEY CHANGE: Don't deleteOne(). Update deleted_at instead.
                // This preserves the record so other clients can fetch it during sync.
                await Task.updateOne({ _id: idToDelete }, {
                    $set: {
                        deleted_at: new Date(),
                        updated_at: new Date(), // Important: update timestamp so sync queries find it
                    },
                });
                results.push({
                    recordId: item.recordId,
                    serverId: item.serverId || item.recordId,
                    serverUpdatedAt: Date.now(),
                });
            }
            catch (error) {
                console.error(`Error deleting task ${item.recordId}:`, error);
                results.push({
                    recordId: item.recordId,
                    serverId: item.serverId || item.recordId,
                    serverUpdatedAt: Date.now(),
                    error: error.message,
                });
            }
        }
        return results;
    }
}
