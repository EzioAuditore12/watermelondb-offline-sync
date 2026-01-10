import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

interface TaskRepositoryInterface {
  create(createTaskDto: CreateTaskDto);

  delete(id: string): Promise<void>;

  update(updateTaskDto: UpdateTaskDto): Promise<void>;

  clear(): void;
}
