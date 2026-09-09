import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';

import PlaceholderScreen from '@/components/PlaceholderScreen';
import PrimaryButton from '@/components/PrimaryButton';
import { Text } from '@/components/Themed';
import { useProfile } from '@/features/profile/useProfile';
import { useNextLessonId } from '@/features/quiz/useNextLesson';

export default function HomeScreen() {
  const router = useRouter();
  const { lessonId, loading: lessonLoading } = useNextLessonId();
  const { profile, refresh: refreshProfile } = useProfile();

  useFocusEffect(
    useCallback(() => {
      refreshProfile();
    }, [refreshProfile])
  );

  return (
    <PlaceholderScreen
      title="Home"
      description="Today's lesson card, streak indicator, and quick stats will go here.">
      {profile && (
        <Text style={styles.streak}>
          {profile.current_streak > 0
            ? `🔥 ${profile.current_streak} day streak · ${profile.total_xp} XP`
            : `${profile.total_xp} XP so far`}
        </Text>
      )}

      {lessonLoading ? (
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
  streak: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 20,
  },
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
