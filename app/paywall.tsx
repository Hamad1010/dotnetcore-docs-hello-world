import { useRouter } from 'expo-router';

import PlaceholderScreen from '@/components/PlaceholderScreen';
import PrimaryButton from '@/components/PrimaryButton';

export default function PaywallScreen() {
  const router = useRouter();

  return (
    <PlaceholderScreen
      title="Go Premium"
      description="Premium plan details and the purchase button (via RevenueCat) will go here.">
      <PrimaryButton label="Close" onPress={() => router.back()} />
    </PlaceholderScreen>
  );
}
