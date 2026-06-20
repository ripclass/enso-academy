-- ============================================================================
-- FREEMIUM MOCK ENTITLEMENTS
-- Meters mock-exam attempts independently of course enrollment:
--   * any authenticated user gets a small free "taste" allowance (e.g. 1)
--   * buying the course grants included mock attempts (e.g. 5)
--   * pay-per-mock purchases add purchased credits
-- An attempt is allowed while  used < included_total + purchased_total.
-- Enrollment still gates COURSE CONTENT; this ledger gates MOCK ATTEMPTS.
-- ============================================================================

-- Balance ledger: one row per (student, course).
CREATE TABLE mock_entitlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  -- "free" attempts: the baseline taste + any course-bundle attempts.
  included_total INTEGER NOT NULL DEFAULT 0 CHECK (included_total >= 0),
  -- pay-per-mock credits purchased.
  purchased_total INTEGER NOT NULL DEFAULT 0 CHECK (purchased_total >= 0),
  -- attempts consumed (started).
  used INTEGER NOT NULL DEFAULT 0 CHECK (used >= 0),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (student_id, course_id)
);
CREATE INDEX idx_mock_entitlements_student ON mock_entitlements(student_id);
CREATE INDEX idx_mock_entitlements_course ON mock_entitlements(course_id);

-- Per-mock purchase audit trail (also the webhook idempotency anchor).
CREATE TABLE mock_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_checkout_session_id TEXT UNIQUE,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status purchase_status NOT NULL DEFAULT 'pending',
  credits_granted INTEGER NOT NULL DEFAULT 1 CHECK (credits_granted >= 0),
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_mock_purchases_student ON mock_purchases(student_id);
CREATE INDEX idx_mock_purchases_course ON mock_purchases(course_id);
CREATE INDEX idx_mock_purchases_status ON mock_purchases(status);

-- RLS
ALTER TABLE mock_entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_purchases ENABLE ROW LEVEL SECURITY;

-- Students may READ their own balances/purchases; all writes are service-role
-- only (granted/consumed by trusted server code + Stripe webhooks).
CREATE POLICY "Students read own mock entitlements" ON mock_entitlements
  FOR SELECT TO authenticated
  USING (student_id = (select auth.uid()));

CREATE POLICY "Students read own mock purchases" ON mock_purchases
  FOR SELECT TO authenticated
  USING (student_id = (select auth.uid()));

CREATE POLICY "Service role full mock entitlements" ON mock_entitlements
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full mock purchases" ON mock_purchases
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Triggers
CREATE TRIGGER mock_entitlements_updated_at BEFORE UPDATE ON mock_entitlements
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER mock_purchases_updated_at BEFORE UPDATE ON mock_purchases
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Atomic, race-safe attempt consumption: increments `used` only when the
-- student still has an available attempt, returning TRUE if consumed.
-- SECURITY DEFINER so trusted server code can call it; EXECUTE revoked from
-- anon/authenticated (server uses the service-role client).
CREATE OR REPLACE FUNCTION consume_mock_attempt(p_student UUID, p_course UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ok BOOLEAN;
BEGIN
  UPDATE mock_entitlements
     SET used = used + 1
   WHERE student_id = p_student
     AND course_id = p_course
     AND used < included_total + purchased_total
  RETURNING TRUE INTO v_ok;
  RETURN COALESCE(v_ok, FALSE);
END;
$$;

REVOKE EXECUTE ON FUNCTION consume_mock_attempt(UUID, UUID) FROM anon, authenticated;
