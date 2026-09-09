import { useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';
import type { Lesson, Question } from '@/types/database';

export function useLessonQuestions(lessonId: string) {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      const [lessonResult, questionsResult] = await Promise.all([
        supabase.from('lessons').select('*').eq('id', lessonId).single(),
        supabase.from('questions').select('*').eq('lesson_id', lessonId).order('sort_order'),
      ]);

      if (cancelled) return;

      if (lessonResult.error || questionsResult.error) {
        setError(lessonResult.error?.message ?? questionsResult.error?.message ?? 'Failed to load lesson.');
        setLoading(false);
        return;
      }

      setLesson(lessonResult.data);
      setQuestions(questionsResult.data ?? []);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [lessonId]);

  return { lesson, questions, loading, error };
}
