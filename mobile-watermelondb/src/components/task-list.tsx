import { FlashList, type FlashListProps } from '@shopify/flash-list';
import { Q } from '@nozbe/watermelondb';
import { withObservables, withDatabase } from '@nozbe/watermelondb/react';

import { database } from '@/db';
import { TaskModel } from '@/db/models/task.model';
import { TASK_TABLE_NAME } from '@/db/schemas/task.schema';

import { TaskCard } from './task-card'; // This now imports the Enhanced version
import { Text } from './ui/text';
import { View } from 'react-native';

interface TaskListProps extends Omit<
  FlashListProps<TaskModel>,
  'data' | 'children' | 'keyExtractor' | 'renderItem'
> {
  data: TaskModel[];
  isFetchingNextPage?: boolean;
}

const enhance = withObservables([], () => ({
  data: database.get<TaskModel>(TASK_TABLE_NAME).query(Q.sortBy('created_at', Q.desc)).observe(),
}));

function TaskList({ className, isFetchingNextPage, data, ...props }: TaskListProps) {
  if (!data || data.length === 0) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text variant={'h1'} className="text-center text-red-400">
          No tasks found.
        </Text>
      </View>
    );
  }

  return (
    <FlashList
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TaskCard data={item} className="mb-3" onPress={() => console.log(item.id)} />
      )}
      {...props}
    />
  );
}

export const EnhancedTaskList = enhance(TaskList);
