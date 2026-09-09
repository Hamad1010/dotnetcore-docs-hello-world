import { useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';

// MVP: just the first lesson in sort order. Once there are multiple
// courses/units, or per-user progress tracking, this should pick the
// user's actual next incomplete lesson instead.
export function useNextLessonId() {
  const [lessonId, setLessonId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    supabase
      .from('lessons')
      .select('id')
      .order('sort_order', { ascending: true })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) {
          setLessonId(data?.id ?? null);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { lessonId, loading };
}
