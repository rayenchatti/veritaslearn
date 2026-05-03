-- =====================================================
-- VeritasLearn Migration 005: Fix Security Advisor Warnings
-- Run this in your Supabase SQL Editor (Dashboard)
-- =====================================================

-- ─── 1. Fix "Public Bucket Allows Listing" ────────────────────────────
-- The 'avatars' bucket is public, so images can be downloaded via public URL without any RLS policy.
-- The previous SELECT policy allowed anyone to list all files in the bucket using the API.
-- We drop it so that listing is disabled, but public URL access remains perfectly fine.
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;


-- ─── 2. Fix "Public Can Execute SECURITY DEFINER Function" ────────────
-- PostgreSQL grants EXECUTE to PUBLIC by default. We must explicitly revoke it.

-- Revoke public access to get_leaderboard
REVOKE EXECUTE ON FUNCTION public.get_leaderboard() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_leaderboard() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_leaderboard() TO authenticated;

-- Revoke all access to handle_new_user (it's a trigger, no one should execute it directly)
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;
