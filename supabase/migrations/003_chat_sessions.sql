-- =====================================================
-- VeritasLearn Migration 003: Chat Sessions (History)
-- Run this in your Supabase SQL Editor (Dashboard)
-- =====================================================

-- ─── 1. Chat sessions table ─────────────────────────────────

CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  humanized TEXT,
  key_points JSONB DEFAULT '[]'::jsonb,
  flashcards JSONB DEFAULT '[]'::jsonb,
  quiz_score INT,
  quiz_total INT,
  quiz_passed BOOLEAN,
  quiz_points INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 2. Enable RLS ──────────────────────────────────────────

ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

-- ─── 3. RLS Policies ────────────────────────────────────────

CREATE POLICY "Users can view own sessions"
  ON public.chat_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON public.chat_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
  ON public.chat_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- ─── 4. Index for fast user-scoped queries ──────────────────

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id
  ON public.chat_sessions (user_id, created_at DESC);
