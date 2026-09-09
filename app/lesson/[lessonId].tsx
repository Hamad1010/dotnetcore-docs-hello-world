import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import PlaceholderScreen from '@/components/PlaceholderScreen';
import PrimaryButton from '@/components/PrimaryButton';

export default function LessonScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ title: 'Lesson', headerShown: false }} />
      <PlaceholderScreen
        title="Lesson"
        description={`Questions, answer feedback, and the XP summary for lesson "${lessonId}" will go here.`}>
        <PrimaryButton label="Close" onPress={() => router.back()} />
      </PlaceholderScreen>
    </>
  );
}
