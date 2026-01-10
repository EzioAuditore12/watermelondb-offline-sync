import { FlashList } from '@shopify/flash-list';
import { RefreshControl, View } from 'react-native';

import { useConnectivity } from '@/hooks/use-connectivity';

import { useItems } from '@/db/sync/use-items';

import { Text } from '@/components/ui/text';

export default function App() {
  const { isOnline } = useConnectivity();

  const { items, isRefreshing, refresh } = useItems({
    shouldFetchRemote: isOnline,
  });

  return (
    <View className="flex-1 p-2">
      <FlashList
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refresh} />}
        data={items}
        renderItem={({ item }) => <Text>{item.title}</Text>}
      />
    </View>
  );
}
