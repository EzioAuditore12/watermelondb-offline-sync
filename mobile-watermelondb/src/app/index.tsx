import { View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

import { EnhancedTaskList } from '@/components/task-list';
import { TaskForm } from '@/components/task-form';
import { Stack } from 'expo-router';

import { useSyncEngine } from '@/db/hooks/use-sync-engine';

import syncEngine from '@/db/sync';

export default function HomeScreen() {
  const { sync, syncStatus, pendingChanges, isSyncing } = useSyncEngine(syncEngine);

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: 'Tasks',
          headerRight: () => (
            <Button onPress={sync} disabled={isSyncing}>
              <Text> {isSyncing ? 'Syncing...' : `Sync (${pendingChanges} pending)`}</Text>
            </Button>
          ),
        }}
      />
      <View className="flex-1 p-2">
        <TaskForm className="w-full max-w-3xl self-center" />

        <Button variant={'destructive'}>
          <Text>Clear All Tasks</Text>
        </Button>

        <EnhancedTaskList />
      </View>
    </>
  );
}
