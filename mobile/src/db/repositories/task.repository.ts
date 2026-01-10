import { database } from '@/db';

import { Task } from '../models/task';
import { TASK_TABLE_NAME } from '../tables/task.table';

import type { TaskRepositoryInterface } from './types';
import { CreateTaskDto } from './types/dto/create-task.dto';
import { UpdateTaskDto } from './types/dto/update-task.dto';

export class TaskRepository implements TaskRepositoryInterface {
  async create(createTaskDto: CreateTaskDto) {
    return await database.write(async () => {
      return await database.get<Task>(TASK_TABLE_NAME).create((task) => {
        if (createTaskDto.id) task._raw.id = createTaskDto.id;

        task.name = createTaskDto.name;
        task.isCompleted = createTaskDto.isCompleted;
        task.createdAt = createTaskDto.createdAt;
      });
    });
  }

  async delete(id: string) {
    await database.write(async () => {
      const record = await database.get<Task>(TASK_TABLE_NAME).find(id);
      await record.markAsDeleted();
    });
  }

  async update(updateTaskDto: UpdateTaskDto): Promise<void> {
    await database.write(async () => {
      const record = await database.get<Task>(TASK_TABLE_NAME).find(updateTaskDto.id);

      await record.update(() => {
        if (updateTaskDto.name) record.name = updateTaskDto.name;

        if (updateTaskDto.isCompleted !== undefined) record.isCompleted = updateTaskDto.isCompleted;
      });
    });
  }

  async clear() {
    await database.write(async () => {
      await database.unsafeResetDatabase();
    });
  }
}
