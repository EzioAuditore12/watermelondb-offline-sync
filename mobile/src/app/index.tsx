import { View } from 'react-native';
import {
  useSyncEngine,
  OfflineBanner,
  useOptimisticUpdate,
  SyncOperation,
} from '@loonylabs/react-native-offline-sync';

import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';

import syncEngine from '@/db/sync';
import { database } from '@/db';
import { Task } from '@/db/models/task';

export default function HomeScreen() {
  const { sync, syncStatus, pendingChanges, isSyncing } = useSyncEngine(syncEngine);

  const { execute, isOptimistic } = useOptimisticUpdate(database, syncEngine);

  const createTask = async () => {
    return execute('tasks', SyncOperation.CREATE, async (collection) => {
      // @ts-ignore
      return await collection.create((task: Task) => {
        task.name = 'Hello';
        task.is_completed = true;
        task.created_at = Date.now();
      });
    });
  };

  const fetchAndLogTasks = async () => {
    const tasksCollection = database.collections.get<Task>('tasks');
    const tasks = await tasksCollection.query().fetch();

    console.log('--- Fetched Tasks ---');
    tasks.forEach((task) => {
      console.log({
        id: task.id,
        name: task.name,
        syncStatus: task.syncStatus,
        _raw: task._raw,
      });
    });
    console.log('Total tasks:', tasks.length);
    console.log('---------------------');
  };

  return (
    <View className="flex-1 items-center justify-center gap-y-2">
      <OfflineBanner networkDetector={syncEngine.getNetworkDetector()} />

      <Button onPress={createTask}>
        <Text>Create task</Text>
      </Button>

      <Button onPress={fetchAndLogTasks}>
        <Text>Log Tasks to Console</Text>
      </Button>

      <Button onPress={sync} disabled={isSyncing}>
        <Text>{isSyncing ? 'Syncing...' : `Sync (${pendingChanges} pending)`}</Text>
      </Button>
    </View>
  );
}
