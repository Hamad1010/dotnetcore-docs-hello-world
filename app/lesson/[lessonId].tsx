import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';

import FillBlankQuestion from '@/components/quiz/FillBlankQuestion';
import MultipleChoiceQuestion from '@/components/quiz/MultipleChoiceQuestion';
import PrimaryButton from '@/components/PrimaryButton';
import { Text, View } from '@/components/Themed';
import { completeLesson, type AnsweredQuestion } from '@/features/quiz/completeLesson';
import { isAnswerCorrect } from '@/features/quiz/scoring';
import { useLessonQuestions } from '@/features/quiz/useLessonQuestions';
import { useSession } from '@/lib/useSession';

type Phase = 'question' | 'feedback' | 'submitting' | 'summary';

type Summary = {
  correctCount: number;
  totalCount: number;
  xpEarned: number;
};

export default function LessonScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const router = useRouter();
  const { session } = useSession();
  const { lesson, questions, loading, error } = useLessonQuestions(lessonId);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [phase, setPhase] = useState<Phase>('question');
  const [answers, setAnswers] = useState<AnsweredQuestion[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);

  const currentQuestion = questions[currentIndex];
  const wasCorrect = useMemo(
    () => (currentQuestion ? isAnswerCorrect(currentQuestion, currentAnswer) : false),
    [currentQuestion, currentAnswer]
  );

  async function handleContinue() {
    const isLastQuestion = currentIndex === questions.length - 1;

    if (!isLastQuestion) {
      setCurrentIndex((i) => i + 1);
      setCurrentAnswer('');
      setPhase('question');
      return;
    }

    if (!session) {
      router.replace('/(auth)/welcome');
      return;
    }

    setPhase('submitting');
    const result = await completeLesson({
      userId: session.user.id,
      lessonId: lesson!.id,
      answers,
    });
    setSummary(result);
    setPhase('summary');
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      ) : error || !lesson ? (
        <View style={styles.center}>
          <Text style={styles.title}>Couldn&apos;t load this lesson</Text>
          <Text style={styles.description}>{error ?? 'Lesson not found.'}</Text>
          <PrimaryButton label="Close" onPress={() => router.back()} />
        </View>
      ) : questions.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.title}>{lesson.title}</Text>
          <Text style={styles.description}>No questions in this lesson yet.</Text>
          <PrimaryButton label="Close" onPress={() => router.back()} />
        </View>
      ) : phase === 'summary' && summary ? (
        <View style={styles.center}>
          <Text style={styles.title}>Lesson Complete!</Text>
          <Text style={styles.description}>
            {summary.correctCount} / {summary.totalCount} correct{'\n'}+{summary.xpEarned} XP earned
          </Text>
          <PrimaryButton label="Done" onPress={() => router.replace('/(tabs)/home')} />
        </View>
      ) : (
        <View style={styles.container}>
          <Text style={styles.progress}>
            Question {currentIndex + 1} of {questions.length}
          </Text>
          <Text style={styles.prompt}>{currentQuestion.prompt}</Text>

          {currentQuestion.type === 'multiple_choice' ? (
            <MultipleChoiceQuestion
              question={currentQuestion}
              selectedValue={currentAnswer || null}
              onSelect={setCurrentAnswer}
              disabled={phase === 'feedback'}
              showResult={phase === 'feedback'}
            />
          ) : currentQuestion.type === 'fill_blank' ? (
            <FillBlankQuestion
              value={currentAnswer}
              onChangeText={setCurrentAnswer}
              disabled={phase === 'feedback'}
            />
          ) : (
            <Text style={styles.description}>This question type isn&apos;t supported yet.</Text>
          )}

          {phase === 'feedback' && (
            <Text style={[styles.feedback, wasCorrect ? styles.correct : styles.incorrect]}>
              {wasCorrect
                ? currentQuestion.explanation_correct ?? 'Correct!'
                : currentQuestion.explanation_incorrect ??
                  `Not quite. The correct answer was "${currentQuestion.correct_answer}".`}
            </Text>
          )}

          {phase === 'question' && (
            <PrimaryButton
              label="Check"
              disabled={currentAnswer.trim().length === 0}
              onPress={() => {
                setAnswers((prev) => [...prev, { questionId: currentQuestion.id, wasCorrect }]);
                setPhase('feedback');
              }}
            />
          )}
          {phase === 'feedback' && <PrimaryButton label="Continue" onPress={handleContinue} />}
          {phase === 'submitting' && <ActivityIndicator />}
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  progress: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 12,
  },
  prompt: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
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
  feedback: {
    fontSize: 15,
    textAlign: 'center',
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  correct: {
    color: '#28a745',
  },
  incorrect: {
    color: '#dc3545',
  },
});
