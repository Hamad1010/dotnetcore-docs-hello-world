-- Sample PLACEHOLDER lesson content, for testing the app only.
-- This is generic trivia, not real course material - safe to use freely.
-- Run this in the Supabase SQL Editor AFTER schema.sql.
-- Safe to re-run: it clears out any previous sample content first.

delete from questions where lesson_id in (
  select id from lessons where unit_id in (
    select id from units where course_id in (
      select id from courses where title = 'Sample Course (Placeholder)'
    )
  )
);
delete from lessons where unit_id in (
  select id from units where course_id in (
    select id from courses where title = 'Sample Course (Placeholder)'
  )
);
delete from units where course_id in (
  select id from courses where title = 'Sample Course (Placeholder)'
);
delete from courses where title = 'Sample Course (Placeholder)';

with new_course as (
  insert into courses (title, description)
  values ('Sample Course (Placeholder)', 'Temporary test content - not the real course.')
  returning id
),
new_unit as (
  insert into units (course_id, title, sort_order)
  select id, 'Unit 1', 0 from new_course
  returning id
),
new_lesson as (
  insert into lessons (unit_id, title, sort_order)
  select id, 'Lesson 1: Basics', 0 from new_unit
  returning id
)
insert into questions (lesson_id, type, prompt, options, correct_answer, explanation_correct, explanation_incorrect, sort_order)
select id, 'multiple_choice', 'What is the capital of France?',
  '["Paris", "Rome", "Berlin", "Madrid"]'::jsonb, '"Paris"'::jsonb,
  'Correct! Paris is the capital of France.',
  'Not quite - the capital of France is Paris.', 0
from new_lesson
union all
select id, 'fill_blank', '2 + 2 = ____',
  null, '"4"'::jsonb,
  'Correct!',
  'Not quite - 2 + 2 = 4.', 1
from new_lesson
union all
select id, 'multiple_choice', 'Which planet is known as the Red Planet?',
  '["Mars", "Venus", "Jupiter", "Saturn"]'::jsonb, '"Mars"'::jsonb,
  'Correct! Mars is often called the Red Planet.',
  'Not quite - it''s Mars.', 2
from new_lesson
union all
select id, 'fill_blank', 'The largest ocean on Earth is the ____ Ocean.',
  null, '"Pacific"'::jsonb,
  'Correct! The Pacific is the largest ocean.',
  'Not quite - it''s the Pacific Ocean.', 3
from new_lesson;
