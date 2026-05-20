-- Add reset date tracking for daily generator limit on free users.
-- generator_uses_remaining is now treated as the *today* count;
-- when generator_uses_reset_date < current_date the API resets it to FREE_DAILY_LIMIT.

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS generator_uses_reset_date date;

-- Update default so new signups start with the daily limit (4).
ALTER TABLE public.users
  ALTER COLUMN generator_uses_remaining SET DEFAULT 4;
