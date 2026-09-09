import { addDaysToDateString, daysBetweenDateStrings, getLocalDateString } from '@/features/streak/date';
import { supabase } from '@/lib/supabase';

// Runs once when the app opens for a signed-in user. Looks back at
// yesterday and decides whether the streak survived (nothing to do),
// gets saved by a streak freeze (exactly one missed day, freeze
// available), or is broken (reset to 0). Safe to call every app open:
// once a gap has been evaluated, a streak_records row for that day
// exists, so later calls skip straight past it.
export async function checkDailyStreak(userId: string) {
  const today = getLocalDateString();
  const yesterday = addDaysToDateString(today, -1);

  const { data: todayRow } = await supabase
    .from('streak_records')
    .select('completed')
    .eq('user_id', userId)
    .eq('date', today)
    .maybeSingle();

  if (todayRow?.completed) return;

  const { data: yesterdayRow } = await supabase
    .from('streak_records')
    .select('id')
    .eq('user_id', userId)
    .eq('date', yesterday)
    .maybeSingle();

  if (yesterdayRow) return;

  const { data: profile } = await supabase
    .from('profiles')
    .select('current_streak, streak_freezes_available')
    .eq('id', userId)
    .single();

  if (!profile || profile.current_streak === 0) return;

  const { data: lastCompleted } = await supabase
    .from('streak_records')
    .select('date')
    .eq('user_id', userId)
    .eq('completed', true)
    .order('date', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!lastCompleted) return;

  const gap = daysBetweenDateStrings(lastCompleted.date, today);

  if (gap <= 1) return;

  if (gap === 2 && profile.streak_freezes_available > 0) {
    await supabase
      .from('streak_records')
      .upsert(
        { user_id: userId, date: yesterday, completed: false, freeze_used: true },
        { onConflict: 'user_id,date' }
      );
    await supabase
      .from('profiles')
      .update({ streak_freezes_available: profile.streak_freezes_available - 1 })
      .eq('id', userId);
    return;
  }

  await supabase
    .from('streak_records')
    .upsert(
      { user_id: userId, date: yesterday, completed: false, freeze_used: false },
      { onConflict: 'user_id,date' }
    );
  await supabase.from('profiles').update({ current_streak: 0 }).eq('id', userId);
}
