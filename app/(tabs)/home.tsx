import { useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';

import PlaceholderScreen from '@/components/PlaceholderScreen';
import PrimaryButton from '@/components/PrimaryButton';
import { Text } from '@/components/Themed';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <PlaceholderScreen
      title="Home"
      description="Today's lesson card, streak indicator, and quick stats will go here.">
      <PrimaryButton
        label="Start Today's Lesson"
        onPress={() => router.push('/lesson/sample-lesson-1')}
      />
      <Text
        style={styles.paywallLink}
        onPress={() => router.push('/paywall')}>
        Preview paywall
      </Text>
    </PlaceholderScreen>
  );
}

const styles = StyleSheet.create({
  paywallLink: {
    marginTop: 20,
    fontSize: 14,
    opacity: 0.6,
    textDecorationLine: 'underline',
  },
});
