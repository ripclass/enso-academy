-- ============================================================================
-- STUDENTS SCHEMA
-- Profiles, enrollments, sessions, knowledge state, memory, preferences, events
-- Designed for persistent student model per ARCHITECTURE commitment #2
-- ============================================================================

-- pgvector lives in the `extensions` schema; put it on the search_path so the
-- unqualified `vector` / `vector_cosine_ops` references (student_memory) resolve.
SET search_path = public, extensions;

CREATE TYPE enrollment_status AS ENUM ('active', 'completed', 'expired', 'refunded', 'paused');
CREATE TYPE modality AS ENUM ('standard', 'audio', 'dialogue', 'drill');
CREATE TYPE session_type AS ENUM ('lesson', 'mock_exam', 'quiz', 'review', 'free_chat');

-- STUDENT PROFILES (extends auth.users)
CREATE TABLE student_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  display_name TEXT,
  avatar_url TEXT,
  country TEXT,
  city TEXT,
  timezone TEXT DEFAULT 'Asia/Dhaka',
  professional_role TEXT,
  employer TEXT,
  bio TEXT,
  goals JSONB DEFAULT '{}'::jsonb,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ENROLLMENTS (one row per student per course purchase)
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
  status enrollment_status NOT NULL DEFAULT 'active',
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ,
  progress_percent NUMERIC(5,2) DEFAULT 0,
  purchase_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, course_id)
);
CREATE INDEX idx_enrollments_student ON enrollments(student_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);
CREATE INDEX idx_enrollments_status ON enrollments(status);
CREATE INDEX idx_enrollments_last_activity ON enrollments(last_activity_at DESC NULLS LAST);

-- SESSIONS (a single sit-down learning session)
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  enrollment_id UUID REFERENCES enrollments(id) ON DELETE CASCADE,
  session_type session_type NOT NULL,
  modality modality NOT NULL DEFAULT 'standard',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
  mock_attempt_id UUID,
  summary TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_sessions_student ON sessions(student_id);
CREATE INDEX idx_sessions_course ON sessions(course_id);
CREATE INDEX idx_sessions_enrollment ON sessions(enrollment_id);
CREATE INDEX idx_sessions_started ON sessions(started_at DESC);

-- STUDENT KNOWLEDGE STATE (per concept, per student, per course)
-- The heart of commitment #2 — "the student model is real"
CREATE TABLE student_knowledge_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  concept_tag TEXT NOT NULL,
  mastery_probability NUMERIC(5,4) NOT NULL DEFAULT 0.0,
  confidence NUMERIC(5,4) NOT NULL DEFAULT 0.0,
  last_observed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  observation_count INTEGER NOT NULL DEFAULT 0,
  correct_count INTEGER NOT NULL DEFAULT 0,
  incorrect_count INTEGER NOT NULL DEFAULT 0,
  last_quiz_at TIMESTAMPTZ,
  last_explanation_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, course_id, concept_tag)
);
CREATE INDEX idx_knowledge_student_course ON student_knowledge_state(student_id, course_id);
CREATE INDEX idx_knowledge_concept ON student_knowledge_state(concept_tag);
CREATE INDEX idx_knowledge_mastery ON student_knowledge_state(student_id, mastery_probability);

COMMENT ON TABLE student_knowledge_state IS 'Per-concept mastery estimates updated on every interaction. Exposed to AI lecturer as context.';

-- STUDENT MEMORY (long-term per-student relationship layer for AI lecturer)
-- Implements commitment #4 — "the lecturer remembers"
CREATE TABLE student_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  memory_type TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  importance NUMERIC(3,2) NOT NULL DEFAULT 0.5,
  last_referenced_at TIMESTAMPTZ,
  reference_count INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,
  embedding vector(1536),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_memory_student ON student_memory(student_id);
CREATE INDEX idx_memory_course ON student_memory(course_id);
CREATE INDEX idx_memory_importance ON student_memory(student_id, importance DESC);
CREATE INDEX idx_memory_embedding ON student_memory USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

COMMENT ON COLUMN student_memory.memory_type IS 'e.g. goal, preference, relationship_fact, study_pattern, struggle, success';

-- STUDENT PREFERENCES
CREATE TABLE student_preferences (
  student_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  preferred_modality modality NOT NULL DEFAULT 'standard',
  contextual_modality JSONB DEFAULT '{}'::jsonb,
  voice_gender TEXT,
  voice_speed NUMERIC(3,2) DEFAULT 1.0,
  bangla_code_switch BOOLEAN DEFAULT FALSE,
  daily_study_goal_minutes INTEGER DEFAULT 60,
  notification_preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- MODALITY STATE (current mode per student per course, updated as student switches)
CREATE TABLE modality_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  current_modality modality NOT NULL DEFAULT 'standard',
  last_switched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  context JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, course_id)
);
CREATE INDEX idx_modality_state_student ON modality_state(student_id);

-- SESSION EVENTS (every meaningful interaction during a session)
CREATE TABLE session_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_session_events_session ON session_events(session_id);
CREATE INDEX idx_session_events_student ON session_events(student_id);
CREATE INDEX idx_session_events_type ON session_events(event_type);
CREATE INDEX idx_session_events_occurred ON session_events(occurred_at DESC);

COMMENT ON COLUMN session_events.event_type IS 'e.g. lesson_started, question_asked, hand_raised, classmate_intervention, quiz_submitted, modality_switched';

-- PORTFOLIO ARTIFACTS (evidence of learning per commitment #10)
CREATE TABLE portfolio_artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  artifact_type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  prompt_used TEXT,
  quality_score NUMERIC(5,2),
  is_shareable BOOLEAN NOT NULL DEFAULT FALSE,
  share_url TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_portfolio_student ON portfolio_artifacts(student_id);
CREATE INDEX idx_portfolio_course ON portfolio_artifacts(course_id);

-- RLS
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_knowledge_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE modality_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_artifacts ENABLE ROW LEVEL SECURITY;

-- Students can read and update their own profile
CREATE POLICY "Students own profile" ON student_profiles
  FOR ALL TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Students own enrollments" ON enrollments
  FOR SELECT TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Students own sessions" ON sessions
  FOR ALL TO authenticated
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students own knowledge state" ON student_knowledge_state
  FOR SELECT TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Students own memory" ON student_memory
  FOR SELECT TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Students own preferences" ON student_preferences
  FOR ALL TO authenticated
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students own modality state" ON modality_state
  FOR ALL TO authenticated
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students own session events" ON session_events
  FOR SELECT TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Students own portfolio" ON portfolio_artifacts
  FOR ALL TO authenticated
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

-- Service role full access for all student tables (used by server-side logic that updates state)
CREATE POLICY "Service role full student_profiles" ON student_profiles FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full enrollments" ON enrollments FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full knowledge state" ON student_knowledge_state FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full memory" ON student_memory FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full session events" ON session_events FOR ALL USING (auth.role() = 'service_role');

-- Triggers
CREATE TRIGGER student_profiles_updated_at BEFORE UPDATE ON student_profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER enrollments_updated_at BEFORE UPDATE ON enrollments FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER student_knowledge_updated_at BEFORE UPDATE ON student_knowledge_state FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER student_memory_updated_at BEFORE UPDATE ON student_memory FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER student_preferences_updated_at BEFORE UPDATE ON student_preferences FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER modality_state_updated_at BEFORE UPDATE ON modality_state FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER portfolio_updated_at BEFORE UPDATE ON portfolio_artifacts FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Auto-create student_profile on auth.users insert
CREATE OR REPLACE FUNCTION create_student_profile_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.student_profiles (id, full_name, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  INSERT INTO public.student_preferences (student_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_student_profile_on_signup();
