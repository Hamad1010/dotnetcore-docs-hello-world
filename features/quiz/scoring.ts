import type { Question } from '@/types/database';

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

export function isAnswerCorrect(question: Question, givenAnswer: string): boolean {
  const correct = question.correct_answer;
  if (typeof correct !== 'string') return false;
  return normalize(correct) === normalize(givenAnswer);
}

const XP_PER_CORRECT_ANSWER = 10;
const PERFECT_LESSON_BONUS_XP = 20;

export function calculateLessonXp(correctCount: number, totalCount: number): number {
  const baseXp = correctCount * XP_PER_CORRECT_ANSWER;
  const isPerfect = totalCount > 0 && correctCount === totalCount;
  return baseXp + (isPerfect ? PERFECT_LESSON_BONUS_XP : 0);
}
