import { StyleSheet, TextInput, type TextInputProps } from 'react-native';

import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

export default function FormInput(props: TextInputProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  return (
    <TextInput
      placeholderTextColor={colors.tabIconDefault}
      style={[styles.input, { color: colors.text, borderColor: colors.tabIconDefault }]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    width: '100%',
    maxWidth: 320,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    marginBottom: 12,
  },
});
