-- Glossary flashcards: per-student spaced-repetition state.
-- One row per (student, glossary card): the student's Leitner box + next due
-- time. All access is through server actions using the admin client, so RLS is
-- enabled with no public policy (service-role only), matching daily_case_results.

create table if not exists public.flashcard_reviews (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  glossary_id uuid not null references public.glossary(id) on delete cascade,
  box smallint not null default 1,
  due_at timestamptz not null default now(),
  reps integer not null default 0,
  lapses integer not null default 0,
  last_reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, glossary_id)
);

-- The study-deck query: this student's due cards for a course.
create index if not exists flashcard_reviews_due_idx
  on public.flashcard_reviews (student_id, course_id, due_at);

-- Covering index for the glossary_id foreign key (advisor requirement).
create index if not exists flashcard_reviews_glossary_idx
  on public.flashcard_reviews (glossary_id);

create trigger flashcard_reviews_updated_at before update on public.flashcard_reviews
  for each row execute function set_updated_at();

alter table public.flashcard_reviews enable row level security;
