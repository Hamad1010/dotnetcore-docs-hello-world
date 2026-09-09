import { useRouter } from 'expo-router';

import PlaceholderScreen from '@/components/PlaceholderScreen';
import PrimaryButton from '@/components/PrimaryButton';

export default function SignInScreen() {
  const router = useRouter();

  return (
    <PlaceholderScreen
      title="Sign In"
      description="The email/password (or social) sign-in form will go here.">
      <PrimaryButton
        label="Continue"
        onPress={() => router.push('/(onboarding)/goals')}
      />
    </PlaceholderScreen>
  );
}
