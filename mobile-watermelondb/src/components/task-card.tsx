import type { ComponentProps } from 'react';
import { Pressable, PressableProps } from 'react-native';
import { Delete, Edit } from 'lucide-react-native';
import { useState } from 'react';
import { Collection } from '@nozbe/watermelondb';
import { withDatabase, withObservables } from '@nozbe/watermelondb/react';

import { SyncOperation } from '@/db/types';
import { useOptimisticUpdate } from '@/db/hooks/use-optimistic-update';

import { database } from '@/db';
import syncEngine from '@/db/sync';

import { Card, CardHeader, CardContent } from './ui/card';
import { Badge } from '@/components/ui/badge';
import { Text } from './ui/text';
import { Icon } from './ui/icon';
import { EditTaskForm } from './edit-task-form';

import { cn } from '@/lib/utils';

import { TaskModel } from '@/db/models/task.model';
import { TASK_TABLE_NAME } from '@/db/schemas/task.schema';

interface TaskCardProps extends ComponentProps<typeof Card> {
  data: TaskModel;
  onPress: PressableProps['onPress'];
}

function RawTaskCard({ className, data, onPress, ...props }: TaskCardProps) {
  const { name, isCompleted, id, offlineSyncStatus } = data;
  const [editOpen, setEditOpen] = useState(false);

  const { execute } = useOptimisticUpdate(database, syncEngine);

  const handleDelete = async () => {
    execute(TASK_TABLE_NAME, SyncOperation.UPDATE, async (collection: Collection<TaskModel>) => {
      const task = await collection.find(id);
      return task;
    });
  };

  // Map syncStatus to badge props
  const syncStatusBadge = (() => {
    switch (offlineSyncStatus) {
      case 'synced':
        return { text: 'Synced', variant: 'default' as const };
      case 'pending':
        return { text: 'Pending Sync', variant: 'secondary' as const };
      case 'failed':
        return { text: 'Sync Failed', variant: 'destructive' as const };
      default:
        return { text: 'unknown', variant: 'outline' as const };
    }
  })();

  return (
    <>
      <Pressable onPress={onPress}>
        <Card className={cn(className)} {...props}>
          <CardHeader className="relative">
            <Text>{name}</Text>

            <Badge className="absolute right-22" variant={syncStatusBadge.variant}>
              <Text>{syncStatusBadge.text}</Text>
            </Badge>

            <Icon
              style={{
                position: 'absolute',
                right: 12,
              }}
              color={'red'}
              size={30}
              as={Delete}
              onPress={handleDelete}
            />

            <Icon
              style={{
                position: 'absolute',
                right: 50,
              }}
              size={30}
              as={Edit}
              onPress={() => setEditOpen(true)}
            />
          </CardHeader>
          <CardContent>
            <Badge variant={isCompleted === true ? 'default' : 'destructive'}>
              <Text>{isCompleted === true ? 'Completed' : 'Not Completed'}</Text>
            </Badge>
          </CardContent>
        </Card>
      </Pressable>
      <EditTaskForm open={editOpen} onOpenChange={setEditOpen} data={data} />
    </>
  );
}

// Enhance the component to observe the TaskModel
export const TaskCard = withDatabase(
  withObservables(['data'], ({ data }: { data: TaskModel }) => ({
    data: data.observe(), // Important: Observe the model to trigger re-renders on change
  }))(RawTaskCard)
);
