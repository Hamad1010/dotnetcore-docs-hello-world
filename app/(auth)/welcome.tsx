import { Link } from 'expo-router';
import { StyleSheet } from 'react-native';

import PlaceholderScreen from '@/components/PlaceholderScreen';
import PrimaryButton from '@/components/PrimaryButton';
import { Text } from '@/components/Themed';

export default function WelcomeScreen() {
  return (
    <PlaceholderScreen
      title="Welcome"
      description="Intro slides explaining the app and its value will go here.">
      <Link href="/(auth)/sign-in" asChild>
        <PrimaryButton label="Sign In" onPress={() => {}} />
      </Link>
      <Link href="/(auth)/sign-up" style={styles.secondaryLink}>
        <Text>Create an account</Text>
      </Link>
    </PlaceholderScreen>
  );
}

const styles = StyleSheet.create({
  secondaryLink: {
    marginTop: 16,
    fontSize: 15,
    textAlign: 'center',
  },
});
