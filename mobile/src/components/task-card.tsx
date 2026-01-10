import type { ComponentProps } from 'react';
import { Pressable, PressableProps } from 'react-native';
import { Delete, Edit } from 'lucide-react-native';
import { useState } from 'react';

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

interface TaskCardProps extends ComponentProps<typeof Card> {
  data: Task;
  onPress: PressableProps['onPress'];
}

export function TaskCard({ className, data, onPress, ...props }: TaskCardProps) {
  const { name, isCompleted, id } = data;
  const [editOpen, setEditOpen] = useState(false);

  const { execute } = useOptimisticUpdate(database, syncEngine);

  const handleDelete = async () => {
    execute('tasks', SyncOperation.DELETE, async (collection) => {
      const task = await collection.find(id);
      await task.markAsDeleted();
      return task; 
    });
  };

  return (
    <>
      <Pressable onPress={onPress}>
        <Card className={cn(className)} {...props}>
          <CardHeader className="relative">
            <Text>{name}</Text>

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
