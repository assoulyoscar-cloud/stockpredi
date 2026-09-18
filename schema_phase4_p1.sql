-- PHASE 4 P1: F&B Monetization Schema (Simplified - Single Tier)
-- Generated: 2026-09-18

-- 1. Extend users table with subscription fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS (
  stripe_subscription_id VARCHAR(255),
  stripe_subscription_status VARCHAR(20),
  subscription_started_at TIMESTAMP,
  subscription_ended_at TIMESTAMP
);

-- 2. Forecast usage tracking
CREATE TABLE IF NOT EXISTS forecast_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  forecast_date DATE NOT NULL,
  forecast_count INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, forecast_date)
);

-- 3. Subscription audit log
CREATE TABLE IF NOT EXISTS subscription_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type VARCHAR(50),
  event_date TIMESTAMP DEFAULT NOW(),
  metadata JSONB
);

-- 4. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_forecast_usage_user_date 
  ON forecast_usage(user_id, forecast_date DESC);

CREATE INDEX IF NOT EXISTS idx_forecast_usage_user 
  ON forecast_usage(user_id);

CREATE INDEX IF NOT EXISTS idx_subscription_logs_user 
  ON subscription_logs(user_id, event_date DESC);

-- 5. Row Level Security (RLS) Policies
ALTER TABLE forecast_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_logs ENABLE ROW LEVEL SECURITY;

-- Users can only see their own usage
CREATE POLICY "Users can view own forecast_usage" ON forecast_usage
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own subscription_logs" ON subscription_logs
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- Service role can manage (for API)
CREATE POLICY "Service role can manage forecast_usage" ON forecast_usage
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage subscription_logs" ON subscription_logs
  FOR ALL USING (auth.role() = 'service_role');

COMMENT ON TABLE forecast_usage IS 'Track daily forecast API usage per user';
COMMENT ON TABLE subscription_logs IS 'Audit log for subscription changes';
COMMENT ON COLUMN users.stripe_subscription_id IS 'Stripe subscription ID';
COMMENT ON COLUMN users.stripe_subscription_status IS 'active|past_due|canceled';
