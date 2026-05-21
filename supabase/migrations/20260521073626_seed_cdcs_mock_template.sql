-- ============================================================================
-- DEV SEED: CDCS Mock 1 template — 20 questions, 40 minutes, 75% pass.
-- ============================================================================

DO $$
DECLARE v_course_id UUID;
BEGIN
  SELECT id INTO v_course_id FROM courses WHERE slug = 'cdcs';
  IF v_course_id IS NULL THEN RAISE EXCEPTION 'CDCS course not found'; END IF;

  INSERT INTO mock_exam_templates (
    course_id, name, sort_order, question_count, time_limit_minutes,
    pass_score_percent, selection_criteria, is_published, metadata
  ) VALUES (
    v_course_id, 'CDCS Mock 1: Foundations', 1, 20, 40, 75.00,
    '{"by_domain": {"parties_to_credit": 6, "ucp_600_articles": 9, "standby_vs_commercial": 3, "trade_finance_compliance": 2}, "difficulty_distribution": {"foundational": 4, "standard": 9, "advanced": 7}}'::jsonb,
    TRUE,
    '{"is_dev_seed": true}'::jsonb
  );
END $$;
