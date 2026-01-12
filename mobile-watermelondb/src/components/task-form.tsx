import { View, type ViewProps } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { SyncOperation } from '@/db/types';
import { useOptimisticUpdate } from '@/db/hooks/use-optimistic-update';

import { cn } from '@/lib/utils';

import { Text } from './ui/text';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { Label } from './ui/label';

import { createTaskSchema, type CreateTask } from '@/schemas/create-task.schema';

import { database } from '@/db';
import syncEngine from '@/db/sync';
import { TASK_TABLE_NAME } from '@/db/schemas/task.schema';
import { Collection } from '@nozbe/watermelondb';
import { TaskModel } from '@/db/models/task.model';

export function TaskForm({ className, ...props }: ViewProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateTask>({
    defaultValues: {
      name: '',
      isCompleted: false,
    },
    resolver: zodResolver(createTaskSchema),
  });

  const { execute } = useOptimisticUpdate(database, syncEngine);

  const onSubmit = async (data: CreateTask) => {
    execute(TASK_TABLE_NAME, SyncOperation.CREATE, async (collection: Collection<TaskModel>) => {
      // @ts-ignore
      return await collection.create((task) => {
        task.name = data.name;
        task.isCompleted = data.isCompleted;
        task.createdAt = new Date();
      });
    });

    reset();
  };

  return (
    <View className={cn('gap-y-2 p-1', className)} {...props}>
      <Controller
        control={control}
        name="name"
        render={({ field: { onBlur, onChange, value } }) => (
          <Input
            placeholder="Enter the task name ..."
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
          />
        )}
      />
      {errors.name && (
        <Text className="text-red-500" variant={'small'}>
          {errors.name.message}
        </Text>
      )}

      <Controller
        control={control}
        name="isCompleted"
        render={({ field: { onBlur, onChange, value } }) => (
          <View className="flex-row items-center gap-x-2">
            <Checkbox
              aria-labelledby="is-completed-checkbox"
              id="is-completed-checkbox"
              checked={value}
              onCheckedChange={onChange}
              onBlur={onBlur}
            />
            <Label nativeID="is-completed-checkbox" htmlFor="is-completed-checkbox">
              Is the given task completed
            </Label>
          </View>
        )}
      />
      {errors.isCompleted && (
        <Text className="text-red-500" variant={'small'}>
          {errors.isCompleted.message}
        </Text>
      )}

      <Button className="self-end" onPress={handleSubmit(onSubmit)}>
        <Text>Submit</Text>
      </Button>
    </View>
  );
}
