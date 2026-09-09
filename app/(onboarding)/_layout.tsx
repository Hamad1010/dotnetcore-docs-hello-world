import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="goals" />
      <Stack.Screen name="notifications" />
    </Stack>
  );
}
