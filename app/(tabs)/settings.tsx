import { useRouter } from 'expo-router';

import PlaceholderScreen from '@/components/PlaceholderScreen';
import PrimaryButton from '@/components/PrimaryButton';

export default function SettingsScreen() {
  const router = useRouter();

  return (
    <PlaceholderScreen
      title="Settings"
      description="Notification times, account management, subscription, and legal links will go here.">
      <PrimaryButton label="Log Out" onPress={() => router.replace('/(auth)/welcome')} />
    </PlaceholderScreen>
  );
}
