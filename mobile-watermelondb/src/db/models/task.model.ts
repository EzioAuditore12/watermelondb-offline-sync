import { field, text, date } from '@nozbe/watermelondb/decorators';
import { BaseModel } from './base.model';

export class TaskModel extends BaseModel {
  static table = 'tasks';

  @text('name') name!: string;
  @field('is_completed') isCompleted!: boolean;
  @date('created_at') createdAt!: Date;
}
