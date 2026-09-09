import { useRouter } from 'expo-router';

import PlaceholderScreen from '@/components/PlaceholderScreen';
import PrimaryButton from '@/components/PrimaryButton';

export default function NotificationsPermissionScreen() {
  const router = useRouter();

  return (
    <PlaceholderScreen
      title="Stay on track"
      description="The reminder-notification permission ask will go here.">
      <PrimaryButton
        label="Get Started"
        onPress={() => router.replace('/(tabs)/home')}
      />
    </PlaceholderScreen>
  );
}
