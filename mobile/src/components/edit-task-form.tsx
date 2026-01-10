import type { ComponentProps } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { arktypeResolver } from '@hookform/resolvers/arktype';
import { View } from 'react-native';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { Checkbox } from './ui/checkbox';

import { Task } from '@/db/models/task';

import { CreateTask, createTaskSchema } from '@/schemas/create-task.schema';
import { SyncOperation, useOptimisticUpdate } from '@loonylabs/react-native-offline-sync';

import { database } from '@/db';
import syncEngine from '@/db/sync';

interface EditTaskFormProps extends ComponentProps<typeof Dialog> {
  data: Task;
}

export function EditTaskForm({ className, data, ...props }: EditTaskFormProps) {
  const { id, name, isCompleted } = data;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTask>({
    defaultValues: {
      name,
      isCompleted,
    },
    resolver: arktypeResolver(createTaskSchema),
  });

  const { execute, isOptimistic } = useOptimisticUpdate(database, syncEngine);

  // Renamed argument to 'formData' to avoid confusion with the 'data' prop
  const onSubmit = async (formData: CreateTask) => {

    execute('tasks', SyncOperation.UPDATE, async (collection) => {
      // 1. Find the record by ID
      const task = await collection.find(id);

      // 2. Perform the update
      return await task.update((t: Task) => {
        t.name = formData.name;
        t.isCompleted = formData.isCompleted;
      });
    });
  };

  return (
    <Dialog {...props}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>
            Make changes to your task here. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <View className="grid gap-4">
          <Controller
            control={control}
            name="name"
            render={({ field: { name, onBlur, onChange, value } }) => (
              <View className="grid gap-3">
                <Label htmlFor={name} nativeID={name}>
                  Name
                </Label>
                <Input value={value} onChangeText={onChange} onBlur={onBlur} />
              </View>
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
                {errors.isCompleted && (
                  <Text className="text-red-500" variant={'small'}>
                    {errors.isCompleted.message}
                  </Text>
                )}
              </View>
            )}
          />
        </View>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">
              <Text>Cancel</Text>
            </Button>
          </DialogClose>
          <Button onPress={handleSubmit(onSubmit)}>
            <Text>Save changes</Text>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
