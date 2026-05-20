-- ============================================================================
-- COMMERCIAL: Stripe customers, purchases, subscriptions
-- ADMIN: SME reviewers, content reviews, audit log
-- ============================================================================

CREATE TYPE purchase_status AS ENUM ('pending', 'completed', 'refunded', 'failed', 'disputed');
CREATE TYPE subscription_status AS ENUM ('active', 'past_due', 'canceled', 'paused', 'trialing');
CREATE TYPE review_status AS ENUM ('pending', 'approved', 'changes_requested', 'rejected');

-- STRIPE CUSTOMERS (one row per student with Stripe activity)
CREATE TABLE stripe_customers (
  student_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL UNIQUE,
  email TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_stripe_customers_stripe_id ON stripe_customers(stripe_customer_id);

-- COURSE PURCHASES (one-time $199 purchases)
CREATE TABLE course_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_checkout_session_id TEXT UNIQUE,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status purchase_status NOT NULL DEFAULT 'pending',
  enrollment_id UUID REFERENCES enrollments(id) ON DELETE SET NULL,
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  refunded_at TIMESTAMPTZ,
  refund_reason TEXT,
  discount_code TEXT,
  discount_amount_cents INTEGER DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_purchases_student ON course_purchases(student_id);
CREATE INDEX idx_purchases_course ON course_purchases(course_id);
CREATE INDEX idx_purchases_status ON course_purchases(status);

-- SUBSCRIPTIONS ($39/mo all-access)
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  stripe_price_id TEXT NOT NULL,
  status subscription_status NOT NULL,
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
  canceled_at TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_subscriptions_student ON subscriptions(student_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- SME REVIEWERS (subject matter experts who review course content)
CREATE TABLE sme_reviewers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  expertise_areas TEXT[] DEFAULT '{}',
  email TEXT NOT NULL,
  hourly_rate_usd_cents INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_sme_reviewers_active ON sme_reviewers(is_active);

-- CONTENT REVIEWS (SME review of generated course content)
CREATE TABLE content_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  element_id UUID REFERENCES content_library_elements(id) ON DELETE CASCADE,
  question_id UUID REFERENCES question_bank(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES sme_reviewers(id) ON DELETE RESTRICT,
  status review_status NOT NULL DEFAULT 'pending',
  issues_found JSONB DEFAULT '[]'::jsonb,
  suggested_changes TEXT,
  review_minutes INTEGER,
  review_notes TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_content_reviews_course ON content_reviews(course_id);
CREATE INDEX idx_content_reviews_reviewer ON content_reviews(reviewer_id);
CREATE INDEX idx_content_reviews_status ON content_reviews(status);

-- AUDIT LOG (security-relevant events)
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_table TEXT,
  target_id UUID,
  payload JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_audit_actor ON audit_log(actor_user_id);
CREATE INDEX idx_audit_action ON audit_log(action);
CREATE INDEX idx_audit_occurred ON audit_log(occurred_at DESC);

-- RLS
ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sme_reviewers ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Students can read their own commercial records (not write — that's service role only)
CREATE POLICY "Students read own stripe customer" ON stripe_customers
  FOR SELECT TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Students read own purchases" ON course_purchases
  FOR SELECT TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Students read own subscriptions" ON subscriptions
  FOR SELECT TO authenticated
  USING (student_id = auth.uid());

-- Service role full access (Stripe webhooks write via service role)
CREATE POLICY "Service role full stripe customers" ON stripe_customers FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full purchases" ON course_purchases FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full subscriptions" ON subscriptions FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full sme reviewers" ON sme_reviewers FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full content reviews" ON content_reviews FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full audit log" ON audit_log FOR ALL USING (auth.role() = 'service_role');

-- Triggers
CREATE TRIGGER stripe_customers_updated_at BEFORE UPDATE ON stripe_customers FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER purchases_updated_at BEFORE UPDATE ON course_purchases FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER sme_reviewers_updated_at BEFORE UPDATE ON sme_reviewers FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER content_reviews_updated_at BEFORE UPDATE ON content_reviews FOR EACH ROW EXECUTE FUNCTION set_updated_at();
