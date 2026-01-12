import { View } from 'react-native';

import { Text } from '@/components/ui/text';

export default function HomeScreen() {
  return (
    <>
      <View className="flex-1 items-center justify-center p-2">
        <Text variant={'h2'}>Hello</Text>
      </View>
    </>
  );
}
