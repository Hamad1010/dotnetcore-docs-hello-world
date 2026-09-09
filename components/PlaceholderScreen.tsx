import { StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';

type Props = {
  title: string;
  description: string;
  children?: React.ReactNode;
};

export default function PlaceholderScreen({ title, description, children }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 12,
  },
});
