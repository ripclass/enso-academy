-- Scene model (Prompt 12 / ADR 0016)
-- A lesson is an ordered list of typed scenes. `scene_type` discriminates how a
-- content element is delivered to the student; `scene_data` holds the structured
-- payload the scene renderer consumes (and the contract the Opus course-generation
-- pipeline emits). Existing rows default to a `reading` scene with an empty
-- payload — backward compatible: the player renders such a row from `body`.

create type scene_type as enum ('reading', 'slide', 'quiz', 'interactive', 'pbl');

alter table content_library_elements
  add column scene_type scene_type not null default 'reading',
  add column scene_data jsonb not null default '{}'::jsonb;
