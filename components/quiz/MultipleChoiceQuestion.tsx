import { StyleSheet } from 'react-native';

import OptionButton from '@/components/quiz/OptionButton';
import { View } from '@/components/Themed';
import type { Question } from '@/types/database';

type Props = {
  question: Question;
  selectedValue: string | null;
  onSelect: (value: string) => void;
  disabled: boolean;
  showResult: boolean;
};

export default function MultipleChoiceQuestion({
  question,
  selectedValue,
  onSelect,
  disabled,
  showResult,
}: Props) {
  const options = Array.isArray(question.options) ? (question.options as string[]) : [];
  const correctAnswer = typeof question.correct_answer === 'string' ? question.correct_answer : null;

  return (
    <View style={styles.container}>
      {options.map((option) => (
        <OptionButton
          key={option}
          label={option}
          selected={selectedValue === option}
          disabled={disabled}
          showResult={showResult}
          isCorrectOption={option === correctAnswer}
          onPress={() => onSelect(option)}
        />
      ))}
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
