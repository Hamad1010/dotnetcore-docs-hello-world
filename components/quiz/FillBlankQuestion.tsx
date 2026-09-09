import { StyleSheet } from 'react-native';

import FormInput from '@/components/FormInput';
import { View } from '@/components/Themed';

type Props = {
  value: string;
  onChangeText: (value: string) => void;
  disabled: boolean;
};

export default function FillBlankQuestion({ value, onChangeText, disabled }: Props) {
  return (
    <View style={styles.container}>
      <FormInput
        placeholder="Type your answer"
        value={value}
        onChangeText={onChangeText}
        editable={!disabled}
        autoCapitalize="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    marginTop: 16,
  },
});
