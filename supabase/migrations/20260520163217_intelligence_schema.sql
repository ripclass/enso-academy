-- ============================================================================
-- RUNTIME INTELLIGENCE: cache, escalations, classmate interventions
-- These tables power the three-tier model architecture cost control
-- ============================================================================

-- pgvector lives in the `extensions` schema; put it on the search_path so the
-- unqualified `vector` / `vector_cosine_ops` references resolve at apply time.
SET search_path = public, extensions;

CREATE TYPE qa_origin AS ENUM ('preauthored', 'student_asked', 'classmate_asked', 'lecturer_proactive');
CREATE TYPE escalation_reason AS ENUM ('novel_question', 'low_confidence', 'sensitive_topic', 'cache_miss', 'student_explicit_request');

-- CACHED Q&A (the cache layer; 60-70% of queries served from here)
CREATE TABLE cached_qa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
  question_text TEXT NOT NULL,
  answer_text TEXT NOT NULL,
  origin qa_origin NOT NULL,
  concept_tags TEXT[] NOT NULL DEFAULT '{}',
  answered_by_model TEXT,
  confidence NUMERIC(5,4),
  embedding vector(1536) NOT NULL,
  hit_count INTEGER NOT NULL DEFAULT 0,
  last_hit_at TIMESTAMPTZ,
  quality_score NUMERIC(5,2),
  primary_source_ids UUID[] DEFAULT '{}',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_cached_qa_course ON cached_qa(course_id);
CREATE INDEX idx_cached_qa_origin ON cached_qa(origin);
CREATE INDEX idx_cached_qa_concept_tags ON cached_qa USING gin(concept_tags);
CREATE INDEX idx_cached_qa_embedding ON cached_qa USING ivfflat (embedding vector_cosine_ops) WITH (lists = 200);
CREATE INDEX idx_cached_qa_hits ON cached_qa(hit_count DESC);

COMMENT ON TABLE cached_qa IS 'Q&A cache. Similarity search via embedding. Every student question increments hit_count or creates a new row.';

-- ESCALATIONS (when the cheap lecturer escalates to Sonnet/Opus)
CREATE TABLE escalations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
  question_text TEXT NOT NULL,
  reason escalation_reason NOT NULL,
  escalated_from_model TEXT,
  resolved_by_model TEXT,
  final_answer TEXT,
  cached_qa_id UUID REFERENCES cached_qa(id) ON DELETE SET NULL,
  latency_ms INTEGER,
  tokens_used INTEGER,
  cost_cents NUMERIC(10,4),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);
CREATE INDEX idx_escalations_student ON escalations(student_id);
CREATE INDEX idx_escalations_course ON escalations(course_id);
CREATE INDEX idx_escalations_session ON escalations(session_id);
CREATE INDEX idx_escalations_reason ON escalations(reason);
CREATE INDEX idx_escalations_created ON escalations(created_at DESC);

-- CLASSMATES (consistent characters per course)
CREATE TABLE classmates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  voice_id TEXT,
  persona_description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_classmates_course ON classmates(course_id);

-- CLASSMATE INTERVENTIONS (gap-driven, per commitment #5)
CREATE TABLE classmate_interventions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
  classmate_id UUID REFERENCES classmates(id) ON DELETE SET NULL,
  triggering_concept TEXT NOT NULL,
  gap_evidence JSONB NOT NULL,
  question_asked TEXT NOT NULL,
  lecturer_response TEXT,
  cached_qa_id UUID REFERENCES cached_qa(id) ON DELETE SET NULL,
  suppressed BOOLEAN NOT NULL DEFAULT FALSE,
  suppression_reason TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_classmate_int_student ON classmate_interventions(student_id);
CREATE INDEX idx_classmate_int_course ON classmate_interventions(course_id);
CREATE INDEX idx_classmate_int_concept ON classmate_interventions(triggering_concept);
CREATE INDEX idx_classmate_int_occurred ON classmate_interventions(occurred_at DESC);

COMMENT ON COLUMN classmate_interventions.gap_evidence IS 'Snapshot of student_knowledge_state values at the moment the intervention fired';

-- SIMILARITY SEARCH RPC (for cached_qa lookups from the application)
CREATE OR REPLACE FUNCTION match_cached_qa(
  p_course_id UUID,
  p_query_embedding vector(1536),
  p_match_threshold NUMERIC DEFAULT 0.85,
  p_match_count INTEGER DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  question_text TEXT,
  answer_text TEXT,
  similarity NUMERIC,
  origin qa_origin,
  hit_count INTEGER
)
LANGUAGE plpgsql
-- search_path set on the function so the `<=>` operator (extensions schema)
-- resolves at query time, not just at migration-apply time.
SET search_path = public, extensions
AS $$
BEGIN
  RETURN QUERY
  SELECT
    cached_qa.id,
    cached_qa.question_text,
    cached_qa.answer_text,
    (1 - (cached_qa.embedding <=> p_query_embedding))::NUMERIC AS similarity,
    cached_qa.origin,
    cached_qa.hit_count
  FROM cached_qa
  WHERE cached_qa.course_id = p_course_id
    AND (1 - (cached_qa.embedding <=> p_query_embedding)) > p_match_threshold
  ORDER BY cached_qa.embedding <=> p_query_embedding
  LIMIT p_match_count;
END;
$$;

-- RLS
ALTER TABLE cached_qa ENABLE ROW LEVEL SECURITY;
ALTER TABLE escalations ENABLE ROW LEVEL SECURITY;
ALTER TABLE classmates ENABLE ROW LEVEL SECURITY;
ALTER TABLE classmate_interventions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full cached_qa" ON cached_qa FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full escalations" ON escalations FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full classmates" ON classmates FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full classmate_interventions" ON classmate_interventions FOR ALL USING (auth.role() = 'service_role');

-- Students can read their own classmate interventions
CREATE POLICY "Students read own classmate interventions" ON classmate_interventions
  FOR SELECT TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Authenticated read active classmates" ON classmates
  FOR SELECT TO authenticated
  USING (is_active = TRUE);

-- Triggers
CREATE TRIGGER cached_qa_updated_at BEFORE UPDATE ON cached_qa FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER classmates_updated_at BEFORE UPDATE ON classmates FOR EACH ROW EXECUTE FUNCTION set_updated_at();
