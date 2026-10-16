-- Add the generation limit counter required by the public review flow.
ALTER TABLE public.review_sessions
  ADD COLUMN IF NOT EXISTS generation_count INTEGER NOT NULL DEFAULT 0;