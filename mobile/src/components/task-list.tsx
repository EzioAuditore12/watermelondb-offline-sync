import { FlashList, type FlashListProps } from '@shopify/flash-list';
import { Q } from '@nozbe/watermelondb';
import { withObservables } from '@nozbe/watermelondb/react';

import { database } from '@/db';
import { Task } from '@/db/models/task';
import { TASK_TABLE_NAME } from '@/db/tables/task.table';

import { TaskCard } from './task-card';
import { Text } from './ui/text';

interface TaskListProps extends Omit<
  FlashListProps<Task>,
  'data' | 'children' | 'keyExtractor' | 'renderItem'
> {
  data: Task[];
  isFetchingNextPage?: boolean;
}

const enhance = withObservables([], () => ({
  data: database.get<Task>(TASK_TABLE_NAME).query(Q.sortBy('created_at', Q.desc)).observe(),
}));

function TaskList({ className, isFetchingNextPage, data, ...props }: TaskListProps) {
  if (!data || data.length === 0) {
    return (
      <Text variant={'h1'} className="text-center text-red-400">
        No tasks found.
      </Text>
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
