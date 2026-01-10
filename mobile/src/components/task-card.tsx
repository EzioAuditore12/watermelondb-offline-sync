import type { ComponentProps } from 'react';
import { Pressable, PressableProps } from 'react-native';
import { Delete, Edit } from 'lucide-react-native';
import { useState } from 'react';
import { Collection } from '@nozbe/watermelondb';

import { SyncOperation, useOptimisticUpdate } from '@loonylabs/react-native-offline-sync';
import { database } from '@/db';
import syncEngine from '@/db/sync';

import { Card, CardHeader, CardContent } from './ui/card';
import { Badge } from '@/components/ui/badge';
import { Text } from './ui/text';
import { Icon } from './ui/icon';
import { EditTaskForm } from './edit-task-form';

import { cn } from '@/lib/utils';

import { Task } from '@/db/models/task';
import { TASK_TABLE_NAME } from '@/db/tables/task.table';

interface TaskCardProps extends ComponentProps<typeof Card> {
  data: Task;
  onPress: PressableProps['onPress'];
}

export function TaskCard({ className, data, onPress, ...props }: TaskCardProps) {
  const { name, isCompleted, id, syncStatus } = data;
  const [editOpen, setEditOpen] = useState(false);

  const { execute } = useOptimisticUpdate(database, syncEngine);

  const handleDelete = async () => {
    execute(TASK_TABLE_NAME, SyncOperation.DELETE, async (collection: Collection<Task>) => {
      const task = await collection.find(id);
      await task.markAsDeleted();
      return task;
    });
  };

  // Map syncStatus to badge props
  const syncStatusBadge = (() => {
    switch (syncStatus) {
      case 'synced':
        return { text: 'Synced', variant: 'default' as const };
      case 'created':
      case 'updated':
      case 'deleted':
        return { text: 'Pending Sync', variant: 'secondary' as const };
      default:
        return { text: syncStatus, variant: 'outline' as const };
    }
  })();

  return (
    <>
      <Pressable onPress={onPress}>
        <Card className={cn(className)} {...props}>
          <CardHeader className="relative">
            <Text>{name}</Text>

            <Badge className='absolute right-22' variant={syncStatusBadge.variant}>
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
