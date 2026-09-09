import { useRouter } from 'expo-router';
import { ActivityIndicator, StyleSheet } from 'react-native';

import PlaceholderScreen from '@/components/PlaceholderScreen';
import PrimaryButton from '@/components/PrimaryButton';
import { Text } from '@/components/Themed';
import { useNextLessonId } from '@/features/quiz/useNextLesson';

export default function HomeScreen() {
  const router = useRouter();
  const { lessonId, loading } = useNextLessonId();

  return (
    <PlaceholderScreen
      title="Home"
      description="Today's lesson card, streak indicator, and quick stats will go here.">
      {loading ? (
        <ActivityIndicator />
      ) : lessonId ? (
        <PrimaryButton
          label="Start Today's Lesson"
          onPress={() => router.push({ pathname: '/lesson/[lessonId]', params: { lessonId } })}
        />
      ) : (
        <Text style={styles.noLessons}>No lessons available yet.</Text>
      )}
      <Text style={styles.paywallLink} onPress={() => router.push('/paywall')}>
        Preview paywall
      </Text>
    </PlaceholderScreen>
  );
}

const styles = StyleSheet.create({
  noLessons: {
    marginTop: 12,
    opacity: 0.6,
  },
  paywallLink: {
    marginTop: 20,
    fontSize: 14,
    opacity: 0.6,
    textDecorationLine: 'underline',
  },
});
