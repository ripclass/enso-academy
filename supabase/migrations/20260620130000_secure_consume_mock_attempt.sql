-- ============================================================================
-- SECURITY FIX: lock down consume_mock_attempt EXECUTE.
-- consume_mock_attempt is SECURITY DEFINER and must be callable ONLY by trusted
-- server code (the service-role client). The original migration revoked EXECUTE
-- from anon/authenticated, but Postgres grants EXECUTE to PUBLIC by default —
-- so anon/authenticated could still call it via /rest/v1/rpc/consume_mock_attempt
-- with an arbitrary p_student, letting a caller burn another user's mock
-- attempts. Revoke from PUBLIC and re-grant only to service_role.
-- ============================================================================

REVOKE EXECUTE ON FUNCTION public.consume_mock_attempt(uuid, uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.consume_mock_attempt(uuid, uuid) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_mock_attempt(uuid, uuid) TO service_role;
