-- ============================================================================
-- CONTENT SCHEMA
-- Courses, modules, lessons, content library elements, question banks
-- Designed for modular content per ARCHITECTURE commitment #3 (lessons are not linear)
-- ============================================================================

-- pgvector lives in the `extensions` schema (installed WITH SCHEMA extensions in
-- the enable_pgvector migration); put it on the search_path so unqualified
-- `vector` / `vector_cosine_ops` references resolve when this migration applies.
SET search_path = public, extensions;

-- ENUMs
CREATE TYPE course_tier AS ENUM ('global', 'bangladesh');
CREATE TYPE course_status AS ENUM ('draft', 'in_review', 'published', 'archived');
CREATE TYPE content_element_type AS ENUM (
  'explanation',
  'case_study',
  'analogy',
  'definition',
  'example',
  'counter_example',
  'diagram_spec',
  'quiz_question',
  'reflection_prompt'
);
CREATE TYPE question_type AS ENUM (
  'single_choice',
  'multiple_choice',
  'true_false',
  'short_answer',
  'written_answer',
  'scenario_mcq',
  'drag_and_drop',
  'matching'
);
CREATE TYPE difficulty_level AS ENUM ('foundational', 'standard', 'advanced', 'expert');

-- COURSES
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  description TEXT,
  tier course_tier NOT NULL,
  certifying_body TEXT,
  real_exam_format JSONB NOT NULL DEFAULT '{}'::jsonb,
  price_usd_cents INTEGER,
  price_bdt INTEGER,
  status course_status NOT NULL DEFAULT 'draft',
  cover_image_url TEXT,
  estimated_study_hours INTEGER,
  signoff_threshold JSONB NOT NULL DEFAULT '{}'::jsonb,
  primary_source_count INTEGER DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ
);
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_courses_tier ON courses(tier);
CREATE INDEX idx_courses_slug ON courses(slug);

COMMENT ON COLUMN courses.real_exam_format IS 'Structured spec of the real exam: question_count, time_limit_minutes, question_types, interface_notes';
COMMENT ON COLUMN courses.signoff_threshold IS 'Calibrated readiness criteria: avg_score, min_score, min_per_domain, max_time_per_question';

-- MODULES
CREATE TABLE modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL,
  estimated_minutes INTEGER,
  learning_objectives JSONB NOT NULL DEFAULT '[]'::jsonb,
  prerequisite_module_ids UUID[] DEFAULT '{}',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(course_id, slug)
);
CREATE INDEX idx_modules_course_id ON modules(course_id);
CREATE INDEX idx_modules_course_sort ON modules(course_id, sort_order);

-- LESSONS (logical containers; actual content lives in content_library_elements)
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL,
  estimated_minutes INTEGER,
  learning_objectives JSONB NOT NULL DEFAULT '[]'::jsonb,
  concept_tags TEXT[] NOT NULL DEFAULT '{}',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(module_id, slug)
);
CREATE INDEX idx_lessons_module_id ON lessons(module_id);
CREATE INDEX idx_lessons_concept_tags ON lessons USING gin(concept_tags);

-- CONTENT LIBRARY ELEMENTS (the actual teachable content, modular)
CREATE TABLE content_library_elements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
  module_id UUID REFERENCES modules(id) ON DELETE SET NULL,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  element_type content_element_type NOT NULL,
  title TEXT,
  body TEXT NOT NULL,
  body_format TEXT NOT NULL DEFAULT 'markdown',
  estimated_seconds INTEGER,
  concept_tags TEXT[] NOT NULL DEFAULT '{}',
  prerequisite_concepts TEXT[] NOT NULL DEFAULT '{}',
  difficulty difficulty_level NOT NULL DEFAULT 'standard',
  teaches_concepts TEXT[] NOT NULL DEFAULT '{}',
  embedding vector(1536),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_content_lib_course ON content_library_elements(course_id);
CREATE INDEX idx_content_lib_lesson ON content_library_elements(lesson_id);
CREATE INDEX idx_content_lib_type ON content_library_elements(element_type);
CREATE INDEX idx_content_lib_concept_tags ON content_library_elements USING gin(concept_tags);
CREATE INDEX idx_content_lib_teaches ON content_library_elements USING gin(teaches_concepts);
CREATE INDEX idx_content_lib_embedding ON content_library_elements USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

COMMENT ON TABLE content_library_elements IS 'Modular teachable content. Lessons are paths through these, not fixed sequences.';
COMMENT ON COLUMN content_library_elements.embedding IS 'OpenAI text-embedding-3-small (1536 dims) for semantic search';

-- PRIMARY SOURCE CITATIONS (IP-defensibility commitment #1)
CREATE TABLE primary_source_citations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  element_id UUID REFERENCES content_library_elements(id) ON DELETE CASCADE,
  source_name TEXT NOT NULL,
  source_organization TEXT,
  source_url TEXT,
  source_year INTEGER,
  citation_text TEXT,
  page_or_section TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT TRUE,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_citations_course ON primary_source_citations(course_id);
CREATE INDEX idx_citations_element ON primary_source_citations(element_id);
CREATE INDEX idx_citations_source ON primary_source_citations(source_name);

-- QUESTION BANK (used for quizzes within lessons AND drawn from for mock exams)
CREATE TABLE question_bank (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  module_id UUID REFERENCES modules(id) ON DELETE SET NULL,
  lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
  question_type question_type NOT NULL,
  question_text TEXT NOT NULL,
  options JSONB,
  correct_answer JSONB NOT NULL,
  explanation TEXT,
  wrong_answer_rationales JSONB,
  concept_tags TEXT[] NOT NULL DEFAULT '{}',
  difficulty difficulty_level NOT NULL DEFAULT 'standard',
  domain TEXT,
  primary_source_id UUID REFERENCES primary_source_citations(id) ON DELETE SET NULL,
  estimated_seconds INTEGER,
  eligible_for_mock BOOLEAN NOT NULL DEFAULT TRUE,
  eligible_for_quiz BOOLEAN NOT NULL DEFAULT TRUE,
  times_used_count INTEGER NOT NULL DEFAULT 0,
  correct_response_rate NUMERIC(5,4),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_qbank_course ON question_bank(course_id);
CREATE INDEX idx_qbank_module ON question_bank(module_id);
CREATE INDEX idx_qbank_lesson ON question_bank(lesson_id);
CREATE INDEX idx_qbank_difficulty ON question_bank(difficulty);
CREATE INDEX idx_qbank_domain ON question_bank(domain);
CREATE INDEX idx_qbank_concept_tags ON question_bank USING gin(concept_tags);
CREATE INDEX idx_qbank_eligible_mock ON question_bank(course_id, eligible_for_mock) WHERE eligible_for_mock = TRUE;

-- GLOSSARY
CREATE TABLE glossary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  term TEXT NOT NULL,
  definition TEXT NOT NULL,
  short_definition TEXT,
  aliases TEXT[] DEFAULT '{}',
  related_terms TEXT[] DEFAULT '{}',
  primary_source_id UUID REFERENCES primary_source_citations(id) ON DELETE SET NULL,
  embedding vector(1536),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(course_id, term)
);
CREATE INDEX idx_glossary_course ON glossary(course_id);
CREATE INDEX idx_glossary_embedding ON glossary USING ivfflat (embedding vector_cosine_ops) WITH (lists = 50);

-- CASE STUDIES (real enforcement actions, used as teaching artifacts)
CREATE TABLE case_studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  full_text TEXT NOT NULL,
  institution_involved TEXT,
  year INTEGER,
  jurisdiction TEXT,
  penalty_amount_usd BIGINT,
  concept_tags TEXT[] NOT NULL DEFAULT '{}',
  discussion_questions JSONB DEFAULT '[]'::jsonb,
  primary_source_id UUID REFERENCES primary_source_citations(id) ON DELETE SET NULL,
  embedding vector(1536),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_case_studies_course ON case_studies(course_id);
CREATE INDEX idx_case_studies_year ON case_studies(year);
CREATE INDEX idx_case_studies_jurisdiction ON case_studies(jurisdiction);
CREATE INDEX idx_case_studies_embedding ON case_studies USING ivfflat (embedding vector_cosine_ops) WITH (lists = 50);

-- COURSE VERSIONS (for tracking generation iterations)
CREATE TABLE course_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  generation_prompt_version TEXT,
  generated_by TEXT DEFAULT 'claude-opus',
  generation_batch_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(course_id, version_number)
);
CREATE INDEX idx_course_versions_course ON course_versions(course_id);

-- RLS
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_library_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE primary_source_citations ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_bank ENABLE ROW LEVEL SECURITY;
ALTER TABLE glossary ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_versions ENABLE ROW LEVEL SECURITY;

-- Published courses are readable by anyone (marketing pages, course discovery)
CREATE POLICY "Anyone can read published courses"
  ON courses FOR SELECT
  USING (status = 'published');

-- Authenticated users can read modules of published courses
CREATE POLICY "Authenticated users read modules of published courses"
  ON modules FOR SELECT
  TO authenticated
  USING (course_id IN (SELECT id FROM courses WHERE status = 'published'));

-- Authenticated users can read lessons of published courses
CREATE POLICY "Authenticated users read lessons of published courses"
  ON lessons FOR SELECT
  TO authenticated
  USING (module_id IN (
    SELECT id FROM modules WHERE course_id IN (SELECT id FROM courses WHERE status = 'published')
  ));

-- Content library and question bank access requires enrollment (policies added in Migration 2)
-- For now, restrict to service role until enrollments are wired
CREATE POLICY "Service role full access to content_library_elements"
  ON content_library_elements FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to question_bank"
  ON question_bank FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to primary_source_citations"
  ON primary_source_citations FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to glossary"
  ON glossary FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to case_studies"
  ON case_studies FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to course_versions"
  ON course_versions FOR ALL
  USING (auth.role() = 'service_role');

-- updated_at triggers
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER modules_updated_at BEFORE UPDATE ON modules FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER lessons_updated_at BEFORE UPDATE ON lessons FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER content_library_updated_at BEFORE UPDATE ON content_library_elements FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER question_bank_updated_at BEFORE UPDATE ON question_bank FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER glossary_updated_at BEFORE UPDATE ON glossary FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER case_studies_updated_at BEFORE UPDATE ON case_studies FOR EACH ROW EXECUTE FUNCTION set_updated_at();
