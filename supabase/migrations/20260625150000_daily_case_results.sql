-- Case Mode: the daily case + leaderboard.
-- One row per (student, course, day): the student's score on that day's shared
-- daily case. The leaderboard is read through a server action (admin client),
-- so RLS is enabled with no public policies (service-role only).

create table if not exists public.daily_case_results (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  day date not null,
  score integer not null,
  correct integer not null default 0,
  total integer not null default 0,
  display_name text,
  created_at timestamptz not null default now(),
  unique (student_id, course_id, day)
);

create index if not exists daily_case_results_board_idx
  on public.daily_case_results (course_id, day, score desc, created_at);

alter table public.daily_case_results enable row level security;
