import { calculateLessonXp } from '@/features/quiz/scoring';
import { recordLessonCompletion } from '@/features/streak/recordLessonCompletion';
import { supabase } from '@/lib/supabase';

export type AnsweredQuestion = {
  questionId: string;
  wasCorrect: boolean;
};

export async function completeLesson({
  userId,
  lessonId,
  answers,
}: {
  userId: string;
  lessonId: string;
  answers: AnsweredQuestion[];
}) {
  const correctCount = answers.filter((a) => a.wasCorrect).length;
  const totalCount = answers.length;
  const xpEarned = calculateLessonXp(correctCount, totalCount);

  await supabase.from('user_progress').upsert(
    {
      user_id: userId,
      lesson_id: lessonId,
      status: 'completed',
      score: totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0,
      last_attempted_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,lesson_id' }
  );

  if (answers.length > 0) {
    await supabase.from('user_answer_log').insert(
      answers.map((a) => ({
        user_id: userId,
        question_id: a.questionId,
        was_correct: a.wasCorrect,
      }))
    );
  }

  const wrongAnswers = answers.filter((a) => !a.wasCorrect);
  if (wrongAnswers.length > 0) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    await supabase.from('review_queue_items').upsert(
      wrongAnswers.map((a) => ({
        user_id: userId,
        question_id: a.questionId,
        next_review_at: tomorrow.toISOString(),
        times_reviewed: 0,
      })),
      { onConflict: 'user_id,question_id' }
    );
  }

  await supabase.rpc('award_xp', { xp_amount: xpEarned });
  await recordLessonCompletion(userId);

  return { correctCount, totalCount, xpEarned };
}
