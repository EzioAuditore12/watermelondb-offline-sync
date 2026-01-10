import { Task } from "@/db/models/task.model";
import { mongooseTaskMapper } from "@/validators/mongoose-task-mapper";
import { PullChangesRequestParams } from "@/validators/pull-changes/request-body.schema";
import { PullChangesResponse } from "@/validators/pull-changes/response-body.schema";
import { PushChangesRequestBody } from "@/validators/push-changes/request-body.schema";
import { PushChangesResponseBody } from "@/validators/push-changes/response-body.schema";
import { TaskRequest } from "@/validators/task-response.schema";
import z from "zod";
import mongoose from "mongoose";

export class TaskSevice {
  async pullChanges({
    lastSyncAt,
    tables,
  }: PullChangesRequestParams): Promise<PullChangesResponse> {
    const tasks = await Task.find({
      updated_at: { $gt: new Date(lastSyncAt) },
    }).lean();

    const mappedTasks = z.array(mongooseTaskMapper).parse(tasks);

    console.log(`Found ${tasks.length} tasks to sync.`);

    if (tasks.length > 0) {
      console.log("First task payload:", JSON.stringify(tasks[0], null, 2));
    }

    const created = mappedTasks.filter((t) => t.created_at > lastSyncAt);
    const updated = mappedTasks.filter((t) => t.created_at <= lastSyncAt);

    return {
      changes: {
        tasks: {
          created,
          updated,
          deleted: [],
        },
      },
      timestamp: Date.now(),
    };
  }

  async pushChanges({
    changes,
  }: PushChangesRequestBody): Promise<PushChangesResponseBody> {
    console.log("--- Push Request ---");
    console.log(`Received ${changes.length} changes to process.`);

    const created: TaskRequest[] = [];
    const updated: TaskRequest[] = [];
    const deleted: string[] = [];

    // Group the flat list of operations by type
    for (const change of changes) {
      if (change.tableName === "tasks") {
        const taskData = { ...change.data, id: change.recordId };

        switch (change.operation) {
          case "CREATE":
            created.push(taskData);
            break;
          case "UPDATE":
            // FALLLBACK LOGIC:
            // If the client sends an UPDATE but lacks the 'server_id', we cannot identify
            // the record in MongoDB (since we use _id).
            // In this case, we treat it as a CREATE to ensure the data is saved
            // and the client gets a fresh server_id.
            if ((change.data as any).server_id) {
              updated.push(taskData);
            } else {
              console.warn(
                `Task ${change.recordId} requested UPDATE but is missing server_id. Switching to CREATE.`
              );
              created.push(taskData);
            }
            break;
          case "DELETE":
            deleted.push(change.recordId);
            break;
        }
      }
    }

    const results: PushChangesResponseBody["results"] = [];

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
  private async createTasks(
    tasks: TaskRequest[]
  ): Promise<PushChangesResponseBody["results"]> {
    console.log(`Creating ${tasks.length} new tasks...`);
    const results: PushChangesResponseBody["results"] = [];

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
      } catch (error: any) {
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
  private async updateTasks(
    tasks: TaskRequest[]
  ): Promise<PushChangesResponseBody["results"]> {
    console.log(`Updating ${tasks.length} existing tasks...`);
    const results: PushChangesResponseBody["results"] = [];

    for (const task of tasks) {
      console.log(`Updating task (Client ID: ${task.id})`);
      try {
        const serverId = (task as any).server_id;

        // Double check, though logic in pushChanges should prevent this
        if (!serverId) {
          throw new Error(
            `Task ${task.id} has no server_id. Cannot update on server.`
          );
        }

        await Task.updateOne(
          { _id: serverId },
          {
            $set: {
              name: task.name,
              is_completed: task.is_completed,
              created_at: new Date(task.created_at),
              updated_at: new Date(),
            },
          }
        );

        results.push({
          recordId: task.id,
          serverId: serverId,
          serverUpdatedAt: Date.now(),
          error: undefined,
        });
      } catch (error: any) {
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

  private async deleteTask(
    ids: string[]
  ): Promise<PushChangesResponseBody["results"]> {
    console.log(`Processing ${ids.length} deleted tasks...`);
    const results: PushChangesResponseBody["results"] = [];

    for (const id of ids) {
      console.log(`Deleting task: ${id}`);
      try {
        // Prevent CastError if the ID is a UUID (local ID) instead of ObjectId
        if (!mongoose.isValidObjectId(id)) {
          console.warn(
            `ID ${id} is not a valid ObjectId. Skipping server delete.`
          );
          // Return success so client removes it from its sync queue
          results.push({
            recordId: id,
            serverId: id,
            serverUpdatedAt: Date.now(),
            error: undefined,
          });
          continue;
        }

        await Task.deleteOne({ _id: id });

        results.push({
          recordId: id,
          serverId: id,
          serverUpdatedAt: Date.now(),
          error: undefined,
        });
      } catch (error: any) {
        console.error(`Error deleting task ${id}:`, error);
        results.push({
          recordId: id,
          serverId: id,
          serverUpdatedAt: Date.now(),
          error: error.message || "Unknown error",
        });
      }
    }
    return results;
  }
}
