-- ============================================================================
-- ADVISOR HARDENING
-- Remediates Supabase database advisor findings on the v1 schema (run 2026-05-20):
--   SECURITY   : pin search_path on functions; revoke EXECUTE on trigger functions
--   PERFORMANCE: wrap auth.* calls in scalar subqueries (auth_rls_initplan);
--                scope service-role policies TO service_role (multiple_permissive);
--                add covering indexes for unindexed foreign keys
-- service_role bypasses RLS (rolbypassrls = true), so the service-role policies
-- are belt-and-suspenders; scoping them TO service_role removes them from the
-- authenticated/anon policy evaluation without changing effective access.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- SECURITY 1/2 — pin function search_path (advisor: function_search_path_mutable)
-- ----------------------------------------------------------------------------
ALTER FUNCTION public.set_updated_at() SET search_path = '';
ALTER FUNCTION public.create_student_profile_on_signup() SET search_path = '';

-- ----------------------------------------------------------------------------
-- SECURITY 2/2 — these are trigger functions; they fire as the table owner and
-- never need to be REST-callable. Revoke EXECUTE so they leave the API surface.
-- (advisor: anon/authenticated_security_definer_function_executable)
-- ----------------------------------------------------------------------------
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.create_student_profile_on_signup() FROM PUBLIC, anon, authenticated;

-- ----------------------------------------------------------------------------
-- PERFORMANCE — scope service-role policies TO service_role with USING (true).
-- Removes the per-row auth.role() call (auth_rls_initplan) and stops these
-- policies from also being evaluated for authenticated/anon (multiple_permissive).
-- ----------------------------------------------------------------------------
ALTER POLICY "Service role full ai grader" ON public.ai_grader_evaluations TO service_role USING (true);
ALTER POLICY "Service role full audit log" ON public.audit_log TO service_role USING (true);
ALTER POLICY "Service role full cached_qa" ON public.cached_qa TO service_role USING (true);
ALTER POLICY "Service role full access to case_studies" ON public.case_studies TO service_role USING (true);
ALTER POLICY "Service role full classmate_interventions" ON public.classmate_interventions TO service_role USING (true);
ALTER POLICY "Service role full classmates" ON public.classmates TO service_role USING (true);
ALTER POLICY "Service role full access to content_library_elements" ON public.content_library_elements TO service_role USING (true);
ALTER POLICY "Service role full content reviews" ON public.content_reviews TO service_role USING (true);
ALTER POLICY "Service role full purchases" ON public.course_purchases TO service_role USING (true);
ALTER POLICY "Service role full access to course_versions" ON public.course_versions TO service_role USING (true);
ALTER POLICY "Service role full enrollments" ON public.enrollments TO service_role USING (true);
ALTER POLICY "Service role full escalations" ON public.escalations TO service_role USING (true);
ALTER POLICY "Service role full graded papers" ON public.examiner_graded_papers TO service_role USING (true);
ALTER POLICY "Service role full examiner reviews" ON public.examiner_review_passes TO service_role USING (true);
ALTER POLICY "Service role full examiners" ON public.examiners TO service_role USING (true);
ALTER POLICY "Service role full access to glossary" ON public.glossary TO service_role USING (true);
ALTER POLICY "Service role full rubrics" ON public.grading_rubrics TO service_role USING (true);
ALTER POLICY "Service role full mock templates" ON public.mock_exam_templates TO service_role USING (true);
ALTER POLICY "Service role full ocr" ON public.ocr_extractions TO service_role USING (true);
ALTER POLICY "Service role full access to primary_source_citations" ON public.primary_source_citations TO service_role USING (true);
ALTER POLICY "Service role full access to question_bank" ON public.question_bank TO service_role USING (true);
ALTER POLICY "Service role full real exam papers" ON public.real_exam_papers TO service_role USING (true);
ALTER POLICY "Service role full session events" ON public.session_events TO service_role USING (true);
ALTER POLICY "Service role full signoff events" ON public.signoff_events TO service_role USING (true);
ALTER POLICY "Service role full sme reviewers" ON public.sme_reviewers TO service_role USING (true);
ALTER POLICY "Service role full stripe customers" ON public.stripe_customers TO service_role USING (true);
ALTER POLICY "Service role full knowledge state" ON public.student_knowledge_state TO service_role USING (true);
ALTER POLICY "Service role full memory" ON public.student_memory TO service_role USING (true);
ALTER POLICY "Service role full student_profiles" ON public.student_profiles TO service_role USING (true);
ALTER POLICY "Service role full readiness" ON public.student_readiness TO service_role USING (true);
ALTER POLICY "Service role full subscriptions" ON public.subscriptions TO service_role USING (true);

-- ----------------------------------------------------------------------------
-- PERFORMANCE — wrap auth.uid() in a scalar subquery so it is evaluated once
-- per query instead of once per row (advisor: auth_rls_initplan).
-- SELECT-only student policies (USING):
-- ----------------------------------------------------------------------------
ALTER POLICY "Students read own ai grader evals" ON public.ai_grader_evaluations USING (student_id = (select auth.uid()));
ALTER POLICY "Students read own classmate interventions" ON public.classmate_interventions USING (student_id = (select auth.uid()));
ALTER POLICY "Students read own purchases" ON public.course_purchases USING (student_id = (select auth.uid()));
ALTER POLICY "Students own enrollments" ON public.enrollments USING (student_id = (select auth.uid()));
ALTER POLICY "Students own session events" ON public.session_events USING (student_id = (select auth.uid()));
ALTER POLICY "Students own signoff events" ON public.signoff_events USING (student_id = (select auth.uid()));
ALTER POLICY "Students read own stripe customer" ON public.stripe_customers USING (student_id = (select auth.uid()));
ALTER POLICY "Students own knowledge state" ON public.student_knowledge_state USING (student_id = (select auth.uid()));
ALTER POLICY "Students own memory" ON public.student_memory USING (student_id = (select auth.uid()));
ALTER POLICY "Students own readiness" ON public.student_readiness USING (student_id = (select auth.uid()));

-- FOR ALL student policies (USING + WITH CHECK):
ALTER POLICY "Students own mock attempts" ON public.mock_exam_attempts USING (student_id = (select auth.uid())) WITH CHECK (student_id = (select auth.uid()));
ALTER POLICY "Students own modality state" ON public.modality_state USING (student_id = (select auth.uid())) WITH CHECK (student_id = (select auth.uid()));
ALTER POLICY "Students own portfolio" ON public.portfolio_artifacts USING (student_id = (select auth.uid())) WITH CHECK (student_id = (select auth.uid()));
ALTER POLICY "Students own real exam outcomes" ON public.real_exam_outcomes USING (student_id = (select auth.uid())) WITH CHECK (student_id = (select auth.uid()));
ALTER POLICY "Students manage own real exam papers" ON public.real_exam_papers USING (student_id = (select auth.uid())) WITH CHECK (student_id = (select auth.uid()));
ALTER POLICY "Students own sessions" ON public.sessions USING (student_id = (select auth.uid())) WITH CHECK (student_id = (select auth.uid()));
ALTER POLICY "Students own preferences" ON public.student_preferences USING (student_id = (select auth.uid())) WITH CHECK (student_id = (select auth.uid()));
ALTER POLICY "Students own profile" ON public.student_profiles USING (id = (select auth.uid())) WITH CHECK (id = (select auth.uid()));

-- ----------------------------------------------------------------------------
-- PERFORMANCE — covering indexes for unindexed foreign keys
-- (advisor: unindexed_foreign_keys)
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_ai_grader_question ON public.ai_grader_evaluations(question_id);
CREATE INDEX IF NOT EXISTS idx_ai_grader_rubric ON public.ai_grader_evaluations(rubric_id);
CREATE INDEX IF NOT EXISTS idx_cached_qa_lesson ON public.cached_qa(lesson_id);
CREATE INDEX IF NOT EXISTS idx_case_studies_source ON public.case_studies(primary_source_id);
CREATE INDEX IF NOT EXISTS idx_classmate_int_cached_qa ON public.classmate_interventions(cached_qa_id);
CREATE INDEX IF NOT EXISTS idx_classmate_int_classmate ON public.classmate_interventions(classmate_id);
CREATE INDEX IF NOT EXISTS idx_classmate_int_lesson ON public.classmate_interventions(lesson_id);
CREATE INDEX IF NOT EXISTS idx_classmate_int_session ON public.classmate_interventions(session_id);
CREATE INDEX IF NOT EXISTS idx_content_lib_module ON public.content_library_elements(module_id);
CREATE INDEX IF NOT EXISTS idx_content_reviews_element ON public.content_reviews(element_id);
CREATE INDEX IF NOT EXISTS idx_content_reviews_question ON public.content_reviews(question_id);
CREATE INDEX IF NOT EXISTS idx_purchases_enrollment ON public.course_purchases(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_escalations_cached_qa ON public.escalations(cached_qa_id);
CREATE INDEX IF NOT EXISTS idx_escalations_lesson ON public.escalations(lesson_id);
CREATE INDEX IF NOT EXISTS idx_glossary_source ON public.glossary(primary_source_id);
CREATE INDEX IF NOT EXISTS idx_modality_state_course ON public.modality_state(course_id);
CREATE INDEX IF NOT EXISTS idx_qbank_source ON public.question_bank(primary_source_id);
CREATE INDEX IF NOT EXISTS idx_real_exam_signoff ON public.real_exam_outcomes(signoff_event_id);
CREATE INDEX IF NOT EXISTS idx_real_exam_papers_course ON public.real_exam_papers(course_id);
CREATE INDEX IF NOT EXISTS idx_sessions_lesson ON public.sessions(lesson_id);
CREATE INDEX IF NOT EXISTS idx_signoff_events_attempt ON public.signoff_events(triggered_by_attempt_id);
CREATE INDEX IF NOT EXISTS idx_sme_reviewers_user ON public.sme_reviewers(user_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_course ON public.student_knowledge_state(course_id);
CREATE INDEX IF NOT EXISTS idx_readiness_course ON public.student_readiness(course_id);
