-- Learning App database schema.
--
-- HOW TO USE THIS FILE (no technical setup needed):
-- 1. Go to supabase.com/dashboard -> your project -> SQL Editor.
-- 2. Paste this entire file in and click "Run".
-- That's it - this creates every table the app needs, plus the security
-- rules that make sure users can only ever see/change their own data.

-- ============================================================
-- Content tables (courses/units/lessons/questions)
-- Written by us (via the content import tool later), read by everyone.
-- ============================================================

create table if not exists courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists units (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses (id) on delete cascade,
  title text not null,
  sort_order int not null default 0
);

create table if not exists lessons (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references units (id) on delete cascade,
  title text not null,
  sort_order int not null default 0
);

create table if not exists questions (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references lessons (id) on delete cascade,
  type text not null check (type in ('multiple_choice', 'fill_blank', 'match_pairs')),
  prompt text not null,
  options jsonb,
  correct_answer jsonb not null,
  explanation_correct text,
  explanation_incorrect text,
  difficulty text,
  sort_order int not null default 0
);

-- ============================================================
-- Per-user tables
-- ============================================================

-- One row per signed-up user, auto-created on sign-up (see trigger below).
create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  current_streak int not null default 0,
  longest_streak int not null default 0,
  total_xp int not null default 0,
  streak_freezes_available int not null default 1,
  is_premium boolean not null default false
);

create table if not exists user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id uuid not null references lessons (id) on delete cascade,
  status text not null default 'not_started' check (status in ('not_started', 'in_progress', 'completed')),
  score int,
  last_attempted_at timestamptz,
  unique (user_id, lesson_id)
);

create table if not exists user_answer_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  question_id uuid not null references questions (id) on delete cascade,
  was_correct boolean not null,
  answered_at timestamptz not null default now()
);

create table if not exists streak_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  completed boolean not null default false,
  freeze_used boolean not null default false,
  unique (user_id, date)
);

create table if not exists review_queue_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  question_id uuid not null references questions (id) on delete cascade,
  next_review_at timestamptz not null default now(),
  times_reviewed int not null default 0,
  unique (user_id, question_id)
);

create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  plan_type text not null default 'free',
  status text not null default 'inactive' check (status in ('inactive', 'trial', 'active', 'expired')),
  revenuecat_customer_id text,
  updated_at timestamptz not null default now()
);

create table if not exists reminder_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  reminder_times text[] not null default array['19:00'],
  enabled boolean not null default true,
  timezone text not null default 'UTC'
);

-- ============================================================
-- Auto-create a profile row whenever someone signs up
-- ============================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, split_part(new.email, '@', 1));
  insert into public.subscriptions (user_id) values (new.id);
  insert into public.reminder_settings (user_id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- Award XP to the signed-in user only (never lets one user grant
-- XP to another user's account).
-- ============================================================

create or replace function public.award_xp(xp_amount int)
returns void as $$
begin
  update public.profiles
  set total_xp = total_xp + xp_amount
  where id = auth.uid();
end;
$$ language plpgsql security definer;

grant execute on function public.award_xp(int) to authenticated;

-- ============================================================
-- Row Level Security: users can only ever touch their own rows.
-- Content tables are readable by any signed-in user, writable by none
-- (content gets added via the Supabase dashboard or an admin tool later).
-- ============================================================

alter table courses enable row level security;
alter table units enable row level security;
alter table lessons enable row level security;
alter table questions enable row level security;
alter table profiles enable row level security;
alter table user_progress enable row level security;
alter table user_answer_log enable row level security;
alter table streak_records enable row level security;
alter table review_queue_items enable row level security;
alter table subscriptions enable row level security;
alter table reminder_settings enable row level security;

drop policy if exists "content is readable by signed-in users" on courses;
create policy "content is readable by signed-in users" on courses
  for select to authenticated using (true);
drop policy if exists "content is readable by signed-in users" on units;
create policy "content is readable by signed-in users" on units
  for select to authenticated using (true);
drop policy if exists "content is readable by signed-in users" on lessons;
create policy "content is readable by signed-in users" on lessons
  for select to authenticated using (true);
drop policy if exists "content is readable by signed-in users" on questions;
create policy "content is readable by signed-in users" on questions
  for select to authenticated using (true);

drop policy if exists "users can view own profile" on profiles;
create policy "users can view own profile" on profiles
  for select to authenticated using (auth.uid() = id);
drop policy if exists "users can update own profile" on profiles;
create policy "users can update own profile" on profiles
  for update to authenticated using (auth.uid() = id);

drop policy if exists "users can view own progress" on user_progress;
create policy "users can view own progress" on user_progress
  for select to authenticated using (auth.uid() = user_id);
drop policy if exists "users can write own progress" on user_progress;
create policy "users can write own progress" on user_progress
  for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "users can update own progress" on user_progress;
create policy "users can update own progress" on user_progress
  for update to authenticated using (auth.uid() = user_id);

drop policy if exists "users can view own answer log" on user_answer_log;
create policy "users can view own answer log" on user_answer_log
  for select to authenticated using (auth.uid() = user_id);
drop policy if exists "users can write own answer log" on user_answer_log;
create policy "users can write own answer log" on user_answer_log
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "users can view own streak records" on streak_records;
create policy "users can view own streak records" on streak_records
  for select to authenticated using (auth.uid() = user_id);
drop policy if exists "users can write own streak records" on streak_records;
create policy "users can write own streak records" on streak_records
  for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "users can update own streak records" on streak_records;
create policy "users can update own streak records" on streak_records
  for update to authenticated using (auth.uid() = user_id);

drop policy if exists "users can view own review queue" on review_queue_items;
create policy "users can view own review queue" on review_queue_items
  for select to authenticated using (auth.uid() = user_id);
drop policy if exists "users can write own review queue" on review_queue_items;
create policy "users can write own review queue" on review_queue_items
  for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "users can update own review queue" on review_queue_items;
create policy "users can update own review queue" on review_queue_items
  for update to authenticated using (auth.uid() = user_id);

drop policy if exists "users can view own subscription" on subscriptions;
create policy "users can view own subscription" on subscriptions
  for select to authenticated using (auth.uid() = user_id);
drop policy if exists "users can update own subscription" on subscriptions;
create policy "users can update own subscription" on subscriptions
  for update to authenticated using (auth.uid() = user_id);

drop policy if exists "users can view own reminder settings" on reminder_settings;
create policy "users can view own reminder settings" on reminder_settings
  for select to authenticated using (auth.uid() = user_id);
drop policy if exists "users can update own reminder settings" on reminder_settings;
create policy "users can update own reminder settings" on reminder_settings
  for update to authenticated using (auth.uid() = user_id);
