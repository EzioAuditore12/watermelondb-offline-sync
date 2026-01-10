import { Model } from '@nozbe/watermelondb';
import { field, date } from '@nozbe/watermelondb/decorators';

import { TASK_TABLE_NAME } from '../tables/task.table';

export class Task extends Model {
  static table = TASK_TABLE_NAME;

  @field('name')
  name!: string;

  @field('is_completed')
  isCompleted!: boolean;

  @date('created_at')
  createdAt!: Date;
}
