-- ============================================================================
-- FIX: subscriptions RLS initplan
-- The advisor_hardening migration (20260520174114) missed one student policy.
-- Wrap auth.uid() in a scalar subquery here too (advisor: auth_rls_initplan).
-- ============================================================================

ALTER POLICY "Students read own subscriptions" ON public.subscriptions USING (student_id = (select auth.uid()));
