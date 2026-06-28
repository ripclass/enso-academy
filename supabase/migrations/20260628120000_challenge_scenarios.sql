-- Challenge scenario bank (the "Apply it" round). DB-served so scenarios can be
-- added or edited without a deploy, like lesson content. The typed in-code bank
-- (lib/cases/scenario-bank.ts) remains the seed source and a runtime floor, so
-- coverage never regresses if a row is missing. Read through a server action
-- using the admin client, so RLS is enabled with no public policies
-- (service-role only), matching daily_case_results.

create table if not exists public.challenge_scenarios (
  id text primary key,
  course_id uuid not null references public.courses(id) on delete cascade,
  mechanic text not null,
  title text not null,
  concept_tags text[] not null default '{}',
  spec jsonb not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists challenge_scenarios_course_idx
  on public.challenge_scenarios (course_id);
create index if not exists challenge_scenarios_concept_tags_idx
  on public.challenge_scenarios using gin (concept_tags);

alter table public.challenge_scenarios enable row level security;
