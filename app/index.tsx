import { Redirect } from 'expo-router';
import { ActivityIndicator } from 'react-native';

import { View } from '@/components/Themed';
import { useSession } from '@/lib/useSession';

export default function Index() {
  const { session, loading } = useSession();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return <Redirect href={session ? '/(tabs)/home' : '/(auth)/welcome'} />;
}
