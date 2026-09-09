import { useRouter } from 'expo-router';

import PlaceholderScreen from '@/components/PlaceholderScreen';
import PrimaryButton from '@/components/PrimaryButton';

export default function GoalsScreen() {
  const router = useRouter();

  return (
    <PlaceholderScreen
      title="What's your goal?"
      description="Goal-selection options (why the user is learning) will go here.">
      <PrimaryButton
        label="Next"
        onPress={() => router.push('/(onboarding)/notifications')}
      />
    </PlaceholderScreen>
  );
}
