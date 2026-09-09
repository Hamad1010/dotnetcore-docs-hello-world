import { useRouter } from 'expo-router';

import PlaceholderScreen from '@/components/PlaceholderScreen';
import PrimaryButton from '@/components/PrimaryButton';
import { supabase } from '@/lib/supabase';

export default function SettingsScreen() {
  const router = useRouter();

  async function handleLogOut() {
    await supabase.auth.signOut();
    router.replace('/(auth)/welcome');
  }

  return (
    <PlaceholderScreen
      title="Settings"
      description="Notification times, account management, subscription, and legal links will go here.">
      <PrimaryButton label="Log Out" onPress={handleLogOut} />
    </PlaceholderScreen>
  );
}
