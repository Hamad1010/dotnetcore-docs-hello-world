import { useRouter } from 'expo-router';

import PlaceholderScreen from '@/components/PlaceholderScreen';
import PrimaryButton from '@/components/PrimaryButton';

export default function SignUpScreen() {
  const router = useRouter();

  return (
    <PlaceholderScreen
      title="Sign Up"
      description="The account creation form will go here.">
      <PrimaryButton
        label="Continue"
        onPress={() => router.push('/(onboarding)/goals')}
      />
    </PlaceholderScreen>
  );
}
