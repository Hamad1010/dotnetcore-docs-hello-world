import { Redirect } from 'expo-router';

// Placeholder entry point. Once sign-in is wired up, this will check
// whether the user is logged in and send them to (tabs) or (auth).
export default function Index() {
  return <Redirect href="/(auth)/welcome" />;
}
