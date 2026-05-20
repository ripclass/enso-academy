-- ============================================================================
-- MOCK EXAMS, READINESS, SIGNOFF
-- Per ARCHITECTURE commitments #6 (mocks mimic real exams) and #7 (signoff is real)
-- ============================================================================

CREATE TYPE mock_attempt_status AS ENUM ('in_progress', 'submitted', 'invalidated', 'abandoned');
CREATE TYPE signoff_status AS ENUM ('not_ready', 'approaching', 'ready', 'stale');
CREATE TYPE real_exam_result AS ENUM ('pass', 'fail', 'pending', 'not_taken');

-- MOCK EXAM TEMPLATES (e.g. "CAMS Mock 1", "CDCS Mock 2")
CREATE TABLE mock_exam_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL,
  question_count INTEGER NOT NULL,
  time_limit_minutes INTEGER NOT NULL,
  pass_score_percent NUMERIC(5,2),
  selection_criteria JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_mock_templates_course ON mock_exam_templates(course_id);

COMMENT ON COLUMN mock_exam_templates.selection_criteria IS 'Rules for drawing questions: e.g. {"by_domain": {"sanctions": 30, "kyc": 25}, "difficulty_distribution": {...}}';

-- MOCK EXAM ATTEMPTS (one row per student per attempt)
CREATE TABLE mock_exam_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  template_id UUID REFERENCES mock_exam_templates(id) ON DELETE SET NULL,
  status mock_attempt_status NOT NULL DEFAULT 'in_progress',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  total_questions INTEGER NOT NULL,
  correct_count INTEGER,
  incorrect_count INTEGER,
  skipped_count INTEGER,
  score_percent NUMERIC(5,2),
  by_domain_scores JSONB DEFAULT '{}'::jsonb,
  questions_snapshot JSONB NOT NULL,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  flags JSONB DEFAULT '[]'::jsonb,
  navigation_events JSONB DEFAULT '[]'::jsonb,
  focus_blur_events INTEGER DEFAULT 0,
  invalidation_reason TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_mock_attempts_student ON mock_exam_attempts(student_id);
CREATE INDEX idx_mock_attempts_course ON mock_exam_attempts(course_id);
CREATE INDEX idx_mock_attempts_template ON mock_exam_attempts(template_id);
CREATE INDEX idx_mock_attempts_status ON mock_exam_attempts(status);
CREATE INDEX idx_mock_attempts_submitted ON mock_exam_attempts(submitted_at DESC NULLS LAST);

COMMENT ON COLUMN mock_exam_attempts.focus_blur_events IS 'Count of tab-away events during the mock. >0 may indicate cheating/distraction; affects signoff.';

-- STUDENT READINESS (one row per student per course, continuously updated)
CREATE TABLE student_readiness (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  status signoff_status NOT NULL DEFAULT 'not_ready',
  mock_count INTEGER NOT NULL DEFAULT 0,
  average_score NUMERIC(5,2),
  minimum_score NUMERIC(5,2),
  weakest_domain TEXT,
  weakest_domain_score NUMERIC(5,2),
  criteria_met JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_evaluated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, course_id)
);
CREATE INDEX idx_readiness_student ON student_readiness(student_id);
CREATE INDEX idx_readiness_status ON student_readiness(status);

-- SIGNOFF EVENTS (immutable log of readiness state transitions)
CREATE TABLE signoff_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  from_status signoff_status,
  to_status signoff_status NOT NULL,
  triggered_by_attempt_id UUID REFERENCES mock_exam_attempts(id) ON DELETE SET NULL,
  criteria_snapshot JSONB NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_signoff_events_student ON signoff_events(student_id);
CREATE INDEX idx_signoff_events_course ON signoff_events(course_id);
CREATE INDEX idx_signoff_events_occurred ON signoff_events(occurred_at DESC);

-- REAL EXAM OUTCOMES (student-reported results from the actual certification exam)
-- This is the calibration feedback loop for the signoff threshold
CREATE TABLE real_exam_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  signoff_event_id UUID REFERENCES signoff_events(id) ON DELETE SET NULL,
  result real_exam_result NOT NULL,
  exam_date DATE,
  reported_score NUMERIC(5,2),
  student_notes TEXT,
  days_between_signoff_and_exam INTEGER,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_real_exam_student ON real_exam_outcomes(student_id);
CREATE INDEX idx_real_exam_course ON real_exam_outcomes(course_id);
CREATE INDEX idx_real_exam_result ON real_exam_outcomes(result);

-- RLS
ALTER TABLE mock_exam_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_readiness ENABLE ROW LEVEL SECURITY;
ALTER TABLE signoff_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE real_exam_outcomes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read published mock templates" ON mock_exam_templates
  FOR SELECT TO authenticated
  USING (is_published = TRUE);

CREATE POLICY "Students own mock attempts" ON mock_exam_attempts
  FOR ALL TO authenticated
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students own readiness" ON student_readiness
  FOR SELECT TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Students own signoff events" ON signoff_events
  FOR SELECT TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Students own real exam outcomes" ON real_exam_outcomes
  FOR ALL TO authenticated
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

-- Service role
CREATE POLICY "Service role full mock templates" ON mock_exam_templates FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full readiness" ON student_readiness FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full signoff events" ON signoff_events FOR ALL USING (auth.role() = 'service_role');

-- Triggers
CREATE TRIGGER mock_templates_updated_at BEFORE UPDATE ON mock_exam_templates FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER mock_attempts_updated_at BEFORE UPDATE ON mock_exam_attempts FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER readiness_updated_at BEFORE UPDATE ON student_readiness FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER real_exam_updated_at BEFORE UPDATE ON real_exam_outcomes FOR EACH ROW EXECUTE FUNCTION set_updated_at();
