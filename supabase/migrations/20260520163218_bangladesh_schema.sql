-- ============================================================================
-- BANGLADESH-SPECIFIC SCHEMA
-- Examiner network, calibration data, AI grader feedback loop
-- Per ARCHITECTURE commitment #8 (conservative grading)
-- ============================================================================

CREATE TYPE examiner_status AS ENUM ('prospect', 'active', 'inactive', 'departed');
CREATE TYPE grader_review_verdict AS ENUM ('agrees', 'too_lenient', 'too_strict', 'incorrect');

-- EXAMINERS (paid consultants from BIBM/BAB network)
CREATE TABLE examiners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  institution TEXT,
  role TEXT,
  expertise_areas TEXT[] DEFAULT '{}',
  email TEXT,
  phone TEXT,
  status examiner_status NOT NULL DEFAULT 'prospect',
  consent_signed BOOLEAN NOT NULL DEFAULT FALSE,
  consent_signed_at TIMESTAMPTZ,
  fee_per_paper_bdt INTEGER,
  fee_per_review_hour_bdt INTEGER,
  is_named_on_marketing BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_examiners_status ON examiners(status);

-- EXAMINER GRADED PAPERS (the calibration dataset; ~100 papers expected to start)
CREATE TABLE examiner_graded_papers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  examiner_id UUID REFERENCES examiners(id) ON DELETE SET NULL,
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  exam_name TEXT NOT NULL,
  exam_year INTEGER,
  exam_session TEXT,
  subject TEXT,
  question_text TEXT NOT NULL,
  student_answer_text TEXT NOT NULL,
  student_answer_image_url TEXT,
  examiner_score NUMERIC(5,2) NOT NULL,
  max_score NUMERIC(5,2) NOT NULL,
  examiner_comments TEXT,
  examiner_marks_breakdown JSONB DEFAULT '{}'::jsonb,
  acquisition_source TEXT,
  acquisition_date DATE,
  is_used_for_training BOOLEAN NOT NULL DEFAULT TRUE,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_graded_papers_examiner ON examiner_graded_papers(examiner_id);
CREATE INDEX idx_graded_papers_course ON examiner_graded_papers(course_id);
CREATE INDEX idx_graded_papers_exam ON examiner_graded_papers(exam_name, exam_year);
CREATE INDEX idx_graded_papers_used ON examiner_graded_papers(is_used_for_training);

COMMENT ON COLUMN examiner_graded_papers.acquisition_source IS 'e.g. disposal_vendor_bibm, direct_examiner_contribution, archive_donation';

-- GRADING RUBRICS (extracted from examiner interviews + calibration analysis)
CREATE TABLE grading_rubrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  subject TEXT,
  question_pattern TEXT,
  rubric_text TEXT NOT NULL,
  structured_criteria JSONB NOT NULL DEFAULT '{}'::jsonb,
  conservative_bias_factor NUMERIC(4,3) NOT NULL DEFAULT 0.95,
  derived_from_examiner_ids UUID[] DEFAULT '{}',
  derived_from_paper_ids UUID[] DEFAULT '{}',
  version INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_rubrics_course ON grading_rubrics(course_id);
CREATE INDEX idx_rubrics_active ON grading_rubrics(course_id, is_active);

COMMENT ON COLUMN grading_rubrics.conservative_bias_factor IS '0.95 = grade 5% harsher than real examiner. Per commitment #8.';

-- AI GRADER EVALUATIONS (every time the AI grades a student answer)
CREATE TABLE ai_grader_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  mock_attempt_id UUID REFERENCES mock_exam_attempts(id) ON DELETE CASCADE,
  question_id UUID REFERENCES question_bank(id) ON DELETE SET NULL,
  student_answer_text TEXT NOT NULL,
  rubric_id UUID REFERENCES grading_rubrics(id) ON DELETE SET NULL,
  grader_model TEXT NOT NULL,
  ai_score NUMERIC(5,2) NOT NULL,
  max_score NUMERIC(5,2) NOT NULL,
  ai_feedback TEXT,
  ai_markdown_breakdown JSONB DEFAULT '{}'::jsonb,
  tokens_used INTEGER,
  cost_cents NUMERIC(10,4),
  needs_review BOOLEAN NOT NULL DEFAULT FALSE,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_ai_grader_student ON ai_grader_evaluations(student_id);
CREATE INDEX idx_ai_grader_course ON ai_grader_evaluations(course_id);
CREATE INDEX idx_ai_grader_mock ON ai_grader_evaluations(mock_attempt_id);
CREATE INDEX idx_ai_grader_needs_review ON ai_grader_evaluations(needs_review) WHERE needs_review = TRUE;

-- EXAMINER REVIEW PASSES (quarterly review of AI grader outputs)
CREATE TABLE examiner_review_passes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  examiner_id UUID NOT NULL REFERENCES examiners(id) ON DELETE CASCADE,
  ai_evaluation_id UUID NOT NULL REFERENCES ai_grader_evaluations(id) ON DELETE CASCADE,
  examiner_score NUMERIC(5,2),
  verdict grader_review_verdict NOT NULL,
  comments TEXT,
  suggested_rubric_changes TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  reviewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_examiner_review_examiner ON examiner_review_passes(examiner_id);
CREATE INDEX idx_examiner_review_evaluation ON examiner_review_passes(ai_evaluation_id);
CREATE INDEX idx_examiner_review_verdict ON examiner_review_passes(verdict);

-- REAL EXAM PAPERS (uploaded by students post-exam)
CREATE TABLE real_exam_papers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  exam_name TEXT NOT NULL,
  exam_year INTEGER NOT NULL,
  exam_session TEXT,
  subject TEXT,
  image_urls TEXT[] NOT NULL DEFAULT '{}',
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ocr_status TEXT NOT NULL DEFAULT 'pending',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX idx_real_exam_papers_student ON real_exam_papers(student_id);
CREATE INDEX idx_real_exam_papers_exam ON real_exam_papers(exam_name, exam_year);
CREATE INDEX idx_real_exam_papers_ocr_status ON real_exam_papers(ocr_status);

-- OCR EXTRACTIONS (extracted text from real exam paper uploads)
CREATE TABLE ocr_extractions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  real_exam_paper_id UUID NOT NULL REFERENCES real_exam_papers(id) ON DELETE CASCADE,
  page_number INTEGER,
  extracted_text TEXT NOT NULL,
  confidence NUMERIC(5,4),
  extraction_engine TEXT,
  matched_question_id UUID REFERENCES question_bank(id) ON DELETE SET NULL,
  needs_human_review BOOLEAN NOT NULL DEFAULT FALSE,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_ocr_paper ON ocr_extractions(real_exam_paper_id);
CREATE INDEX idx_ocr_matched ON ocr_extractions(matched_question_id);

-- RLS
ALTER TABLE examiners ENABLE ROW LEVEL SECURITY;
ALTER TABLE examiner_graded_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE grading_rubrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_grader_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE examiner_review_passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE real_exam_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ocr_extractions ENABLE ROW LEVEL SECURITY;

-- All BD admin tables: service role only for now (examiner admin UI comes later)
CREATE POLICY "Service role full examiners" ON examiners FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full graded papers" ON examiner_graded_papers FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full rubrics" ON grading_rubrics FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full ai grader" ON ai_grader_evaluations FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full examiner reviews" ON examiner_review_passes FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full real exam papers" ON real_exam_papers FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full ocr" ON ocr_extractions FOR ALL USING (auth.role() = 'service_role');

-- Students can read their own AI grader evaluations and upload their own exam papers
CREATE POLICY "Students read own ai grader evals" ON ai_grader_evaluations
  FOR SELECT TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Students manage own real exam papers" ON real_exam_papers
  FOR ALL TO authenticated
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

-- Triggers
CREATE TRIGGER examiners_updated_at BEFORE UPDATE ON examiners FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER graded_papers_updated_at BEFORE UPDATE ON examiner_graded_papers FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER rubrics_updated_at BEFORE UPDATE ON grading_rubrics FOR EACH ROW EXECUTE FUNCTION set_updated_at();
