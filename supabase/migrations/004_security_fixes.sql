-- =====================================================
-- VeritasLearn Migration 004: Security Fixes
-- Run this in your Supabase SQL Editor (Dashboard)
-- =====================================================

-- ─── 1. Fix SECURITY DEFINER function ─────────────────────────
-- Adding SET search_path = '' prevents search_path injection attacks

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.users (id, username, full_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'full_name', '')
  );
  RETURN new;
END;
$$;

-- ─── 2. Restrict Profile Updates ──────────────────────────────
-- Users should only be able to update specific columns, not everything.
-- (Prevents assigning roles directly if new columns are added later)

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

-- Revoke blanket UPDATE access
REVOKE UPDATE ON public.users FROM authenticated;
-- Grant UPDATE only on non-sensitive columns
GRANT UPDATE (username, full_name, bio, phone, avatar_url, notifications_enabled, updated_at) 
ON public.users TO authenticated;

-- Recreate policy
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ─── 3. Safe Leaderboard Access ───────────────────────────────
-- user_quiz_attempts has RLS so users can only read THEIR OWN attempts.
-- To build a leaderboard, we need to bypass RLS securely via a function.

CREATE OR REPLACE FUNCTION public.get_leaderboard()
RETURNS TABLE (
    user_id UUID,
    total_points BIGINT,
    username TEXT
)
LANGUAGE sql
SECURITY DEFINER SET search_path = ''
AS $$
  SELECT 
    a.user_id,
    SUM(a.points_earned) as total_points,
    u.username
  FROM public.user_quiz_attempts a
  LEFT JOIN public.users u ON u.id = a.user_id
  WHERE a.passed = true
  GROUP BY a.user_id, u.username
  ORDER BY total_points DESC
  LIMIT 10;
$$;

-- Allow authenticated users to call this function
GRANT EXECUTE ON FUNCTION public.get_leaderboard() TO authenticated;
