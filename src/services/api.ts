/**
 * api.ts — Secure API layer for VeritasLearn
 *
 * All calls go through Supabase Edge Functions.
 * The Groq API key NEVER leaves the server.
 */

import { supabase } from './supabase';
import { StudyData } from '../utils/mockData';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';

// ─────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  timeLimit: number;
}

export interface QuizSubmitResult {
  passed: boolean;
  score: number;
  total: number;
  scorePercent: number;
  pointsEarned: number;
  passThreshold: number;
}

// ─────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────

/**
 * Call a Supabase Edge Function using raw fetch.
 *
 * IMPORTANT: We read the JWT directly from AsyncStorage instead of calling
 * supabase.auth.getSession(). Some supabase-js versions try to locally verify
 * the JWT using WebCrypto, which throws "Unsupported JWT algorithm ES256" in
 * React Native environments. Reading from storage bypasses all crypto entirely.
 */
async function callEdgeFunction(name: string, body: object): Promise<any> {
  // Read session token straight from AsyncStorage — no JWT verification triggered.
  let token = SUPABASE_ANON_KEY;
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    // Supabase stores session under: sb-{project_ref}-auth-token
    const raw = await AsyncStorage.getItem('sb-nyrnbrvbmxyurejdorvm-auth-token');
    if (raw) {
      const parsed = JSON.parse(raw);
      token = parsed.access_token ?? SUPABASE_ANON_KEY;
    }
  } catch {
    // Fall back to anon key if storage read fails
  }

  const res = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  let json: any;
  try {
    json = await res.json();
  } catch {
    throw new Error(`Edge Function ${name} returned HTTP ${res.status} with non-JSON body`);
  }

  if (!res.ok) {
    throw new Error(json?.error ?? json?.message ?? `HTTP ${res.status}`);
  }

  if (json?.error) {
    throw new Error(json.error);
  }

  return json;
}

// ─────────────────────────────────────────────────
// 1. Generate study data (secure Groq gateway)
// ─────────────────────────────────────────────────

export async function generateStudyDataSecure(
  prompt: string,
  topic: string
): Promise<StudyData> {
  const json = await callEdgeFunction('generate', { prompt, topic });

  const parsed: StudyData = json.data;

  // Ensure unique IDs
  parsed.quiz = parsed.quiz.map((q, i) => ({ ...q, id: q.id || `q_${Date.now()}_${i}` }));
  parsed.easyQuiz = parsed.easyQuiz.map((q, i) => ({ ...q, id: q.id || `eq_${Date.now()}_${i}` }));
  parsed.flashcards = parsed.flashcards.map((f, i) => ({ ...f, id: f.id || `fc_${Date.now()}_${i}` }));

  return parsed;
}

// ─────────────────────────────────────────────────
// 2. Submit quiz answers (server-side scoring)
// ─────────────────────────────────────────────────

export async function submitQuizToBackend(
  topic: string,
  userAnswers: number[],
  questions: QuizQuestion[],
  isRetry: boolean = false,
  answersSignature?: string,
  answersPayload?: string
): Promise<QuizSubmitResult> {
  const json = await callEdgeFunction('submit-quiz', { topic, userAnswers, questions, isRetry, answersSignature, answersPayload });
  return json as QuizSubmitResult;
}

// ─────────────────────────────────────────────────
// 3. Fetch user stats from Supabase
// ─────────────────────────────────────────────────

export async function fetchUserStats(userId: string) {
  const { data: attempts, error } = await supabase
    .from('user_quiz_attempts')
    .select('passed, score, total, points_earned, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error || !attempts) return null;

  const totalAttempts = attempts.length;
  const passedAttempts = attempts.filter(a => a.passed).length;
  const totalPoints = attempts.reduce((sum, a) => sum + (a.points_earned ?? 0), 0);
  const passRate = totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0;

  const streak = calculateStreak(attempts);

  return {
    questionsAnswered: totalAttempts,
    quizPassRate: passRate,
    currentStreak: streak,
    totalXP: totalPoints,
    aiRelianceDecrease: Math.min(passRate, 100),
    totalStudyTime: totalAttempts * 5,
  };
}

function calculateStreak(attempts: { created_at: string; passed: boolean }[]): number {
  if (!attempts.length) return 0;
  const passedDays = new Set(
    attempts
      .filter(a => a.passed)
      .map(a => a.created_at.split('T')[0])
  );
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().split('T')[0];
    if (passedDays.has(key)) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

// ─────────────────────────────────────────────────
// 4. Fetch real leaderboard from Supabase
// ─────────────────────────────────────────────────

export interface LeaderboardRow {
  rank: number;
  userId: string;
  displayName: string;
  totalXP: number;
  isCurrentUser: boolean;
}

export async function fetchLeaderboard(currentUserId: string): Promise<LeaderboardRow[]> {
  // Call the secure RPC function to bypass RLS safely for the leaderboard
  const { data, error } = await supabase.rpc('get_leaderboard');

  if (error || !data) return [];

  return data.map((row: any, i: number) => ({
    rank: i + 1,
    userId: row.user_id,
    displayName: row.username ?? `User_${row.user_id.slice(0, 6)}`,
    totalXP: Number(row.total_points),
    isCurrentUser: row.user_id === currentUserId,
  }));
}

// ─────────────────────────────────────────────────
// 5. Profile CRUD
// ─────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  username: string | null;
  full_name: string | null;
  bio: string | null;
  phone: string | null;
  avatar_url: string | null;
  notifications_enabled: boolean;
  created_at: string;
  updated_at: string | null;
}

export async function fetchProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) return null;
  return data as UserProfile;
}

export async function updateProfile(
  userId: string,
  updates: Partial<Pick<UserProfile, 'username' | 'full_name' | 'bio' | 'phone' | 'avatar_url' | 'notifications_enabled'>>
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('users')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function uploadAvatar(
  userId: string,
  fileUri: string,
  mimeType: string = 'image/jpeg'
): Promise<{ url: string | null; error?: string }> {
  try {
    const ext = mimeType === 'image/png' ? 'png' : 'jpg';
    const filePath = `${userId}/avatar.${ext}`;

    // Read the file as a blob
    const response = await fetch(fileUri);
    const blob = await response.blob();

    // Upload to Supabase Storage (upsert to overwrite existing)
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, blob, {
        contentType: mimeType,
        upsert: true,
      });

    if (uploadError) return { url: null, error: uploadError.message };

    // Get the public URL
    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    const publicUrl = data.publicUrl + '?t=' + Date.now(); // cache-bust

    // Save URL to user profile
    await updateProfile(userId, { avatar_url: publicUrl });

    return { url: publicUrl };
  } catch (err: any) {
    return { url: null, error: err.message ?? 'Upload failed' };
  }
}

export async function deleteUserAccount(): Promise<{ success: boolean; error?: string }> {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not logged in' };

    // Delete user data from public tables (cascade will handle most)
    await supabase.from('users').delete().eq('id', user.id);
    await supabase.from('user_quiz_attempts').delete().eq('user_id', user.id);
    await supabase.from('chat_access').delete().eq('user_id', user.id);
    await supabase.from('user_rate_limits').delete().eq('user_id', user.id);

    // Delete avatar from storage
    const { data: files } = await supabase.storage.from('avatars').list(user.id);
    if (files && files.length > 0) {
      await supabase.storage.from('avatars').remove(files.map(f => `${user.id}/${f.name}`));
    }

    // Sign out (actual auth.users row deletion requires admin API / edge function)
    await supabase.auth.signOut();

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message ?? 'Delete failed' };
  }
}

// ─────────────────────────────────────────────────
// 6. Chat Sessions (History)
// ─────────────────────────────────────────────────

export interface ChatSession {
  id: string;
  user_id: string;
  topic: string;
  question: string;
  answer: string;
  humanized: string | null;
  key_points: string[];
  flashcards: { front: string; back: string }[];
  quiz_score: number | null;
  quiz_total: number | null;
  quiz_passed: boolean | null;
  quiz_points: number;
  created_at: string;
}

export interface SaveSessionInput {
  topic: string;
  question: string;
  answer: string;
  humanized?: string;
  key_points?: string[];
  flashcards?: { front: string; back: string }[];
  quiz_score?: number;
  quiz_total?: number;
  quiz_passed?: boolean;
  quiz_points?: number;
}

export async function saveSession(
  userId: string,
  input: SaveSessionInput
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase.from('chat_sessions').insert({
    user_id: userId,
    topic: input.topic,
    question: input.question,
    answer: input.answer,
    humanized: input.humanized ?? null,
    key_points: input.key_points ?? [],
    flashcards: input.flashcards ?? [],
    quiz_score: input.quiz_score ?? null,
    quiz_total: input.quiz_total ?? null,
    quiz_passed: input.quiz_passed ?? null,
    quiz_points: input.quiz_points ?? 0,
  });

  if (error) {
    const { Alert } = require('react-native');
    Alert.alert('Save Session Error', error.message ?? JSON.stringify(error));
    return { success: false, error: error.message };
  }
  return { success: true };
}

export async function fetchSessions(
  userId: string,
  limit: number = 50
): Promise<ChatSession[]> {
  const { data, error } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data as ChatSession[];
}

export async function fetchSessionById(
  sessionId: string
): Promise<ChatSession | null> {
  const { data, error } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (error || !data) return null;
  return data as ChatSession;
}

export async function deleteSession(
  sessionId: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('chat_sessions')
    .delete()
    .eq('id', sessionId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}
