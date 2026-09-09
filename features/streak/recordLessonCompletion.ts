import { getLocalDateString } from '@/features/streak/date';
import { supabase } from '@/lib/supabase';

// Called once a lesson is finished. Bumps the streak by one, but only
// the first time today - completing a second lesson the same day
// doesn't count twice.
export async function recordLessonCompletion(userId: string) {
  const today = getLocalDateString();

  const { data: existing } = await supabase
    .from('streak_records')
    .select('completed')
    .eq('user_id', userId)
    .eq('date', today)
    .maybeSingle();

  if (existing?.completed) {
    return;
  }

  await supabase
    .from('streak_records')
    .upsert(
      { user_id: userId, date: today, completed: true, freeze_used: false },
      { onConflict: 'user_id,date' }
    );

  const { data: profile } = await supabase
    .from('profiles')
    .select('current_streak, longest_streak')
    .eq('id', userId)
    .single();

  if (!profile) return;

  const newStreak = profile.current_streak + 1;

  await supabase
    .from('profiles')
    .update({
      current_streak: newStreak,
      longest_streak: Math.max(newStreak, profile.longest_streak),
    })
    .eq('id', userId);
}
