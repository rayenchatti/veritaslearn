-- =====================================================
-- VeritasLearn Migration 002: Profiles & Avatar Storage
-- Run this in your Supabase SQL Editor (Dashboard)
-- =====================================================

-- ─── 1. Extend users table with profile fields ──────────────

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ─── 2. Update trigger to populate full_name from signup metadata ──

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, username, full_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'full_name', '')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── 3. Add WITH CHECK to existing update policy ──────────────
-- Drop and recreate to add WITH CHECK (security best practice)

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ─── 4. Avatar storage bucket ─────────────────────────────────

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::TEXT
  );

-- Allow authenticated users to update/replace their own avatar
CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::TEXT
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::TEXT
  );

-- Allow anyone to read avatars (public bucket)
CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Allow users to delete their own avatar
CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::TEXT
  );

-- ─── 5. Delete RLS policies for account deletion ─────────────

CREATE POLICY "Users can delete own profile"
  ON public.users FOR DELETE
  USING (auth.uid() = id);

CREATE POLICY "Users can delete own quiz attempts"
  ON public.user_quiz_attempts FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own chat access"
  ON public.chat_access FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own rate limits"
  ON public.user_rate_limits FOR DELETE
  USING (auth.uid() = user_id);
