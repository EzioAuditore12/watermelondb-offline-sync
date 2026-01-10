import { Model } from '@nozbe/watermelondb';
import { field, text, date } from '@nozbe/watermelondb/decorators';

// @ts-ignore
export class Task extends Model {
  static table = 'tasks';

  @text('name') name!: string;
  @field('is_completed') isCompleted!: boolean;
  @date('created_at') createdAt!: Date;

  // ⬇️ SYNC FIELDS (Required by @loonylabs/react-native-offline-sync)

  @text('server_id') serverId?: string;
  @field('server_updated_at') serverUpdatedAt?: number;
  @text('last_sync_error') lastSyncError?: string;

  // This field definition shadows the read-only 'syncStatus' getter from the base Model class,
  // allowing the sync engine to write to it.
  // @ts-ignore
  @text('sync_status') syncStatus!: SyncStatus;
}
