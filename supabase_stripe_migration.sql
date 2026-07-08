-- Migration : colonnes Stripe dans la table users
-- A coller dans Supabase > SQL Editor > New query

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- Index pour les lookups webhook Stripe (par customer_id)
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer
  ON public.users (stripe_customer_id);
