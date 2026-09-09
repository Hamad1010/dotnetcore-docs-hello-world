import { Pressable, StyleSheet, Text } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

type Props = {
  label: string;
  onPress: () => void;
  selected: boolean;
  disabled: boolean;
  isCorrectOption?: boolean;
  showResult?: boolean;
};

export default function OptionButton({
  label,
  onPress,
  selected,
  disabled,
  isCorrectOption,
  showResult,
}: Props) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  let backgroundColor = 'transparent';
  let borderColor: string = colors.tabIconDefault;

  if (showResult && isCorrectOption) {
    backgroundColor = '#d4edda';
    borderColor = '#28a745';
  } else if (showResult && selected && !isCorrectOption) {
    backgroundColor = '#f8d7da';
    borderColor = '#dc3545';
  } else if (selected) {
    borderColor = colors.tint;
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.option, { borderColor, backgroundColor }]}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  option: {
    width: '100%',
    maxWidth: 360,
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
  },
});
