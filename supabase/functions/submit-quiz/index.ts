// =====================================================
// Supabase Edge Function: /submit-quiz
// Quiz Submission + Chat Access Unlocking
// =====================================================

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function ok(payload: unknown) {
  return new Response(JSON.stringify(payload), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
}

function decodeJwtPayload(jwt: string): Record<string, unknown> | null {
  try {
    const parts = jwt.split(".");
    if (parts.length !== 3) return null;
    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(b64));
  } catch {
    return null;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
  const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const PASS_THRESHOLD = parseInt(Deno.env.get("PASS_THRESHOLD") ?? "70", 10);

  try {
    // ── 1. Extract user from JWT (gateway already verified sig) ──
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return ok({ error: "Missing Authorization header" });
    }
    const payload = decodeJwtPayload(authHeader.slice(7));
    const userId = payload?.sub as string | undefined;
    if (!userId) return ok({ error: "Invalid token: could not decode sub claim" });

    // ── 2. Parse body ─────────────────────────────────────────
    let body: any;
    try { body = await req.json(); } catch { return ok({ error: "Invalid JSON body" }); }
    const { topic, userAnswers, questions, isRetry, answersSignature, answersPayload } = body;

    if (!topic || !Array.isArray(userAnswers)) {
      return ok({ error: "Missing required fields: topic, userAnswers" });
    }
    if (!answersSignature || !answersPayload) {
      return ok({ error: "Missing secure answers payload or signature. Update your app." });
    }

    // ── 3. Verify signature ───────────────────────────────────
    const encoder = new TextEncoder();
    const keyData = encoder.encode(SUPABASE_SERVICE_KEY.slice(0, 32).padEnd(32, '0'));
    const cryptoKey = await crypto.subtle.importKey(
      "raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["verify"]
    );
    
    // Decode base64 signature
    const binaryString = atob(answersSignature);
    const signatureBytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        signatureBytes[i] = binaryString.charCodeAt(i);
    }

    const isValid = await crypto.subtle.verify(
      "HMAC",
      cryptoKey,
      signatureBytes,
      encoder.encode(answersPayload)
    );

    if (!isValid) {
      return ok({ error: "Invalid answers signature. Tampering detected." });
    }

    const secureAnswers = JSON.parse(answersPayload);
    // Assume we're grading the normal quiz for now. If easyQuiz, client needs to specify, or we just check length.
    // For simplicity, we assume if userAnswers.length matches easyQuiz, it's easyQuiz, otherwise normal quiz.
    let correctAnswersArray = secureAnswers.quiz;
    if (userAnswers.length === secureAnswers.easyQuiz?.length && userAnswers.length !== secureAnswers.quiz?.length) {
      correctAnswersArray = secureAnswers.easyQuiz;
    }

    if (userAnswers.length !== correctAnswersArray.length) {
      return ok({ error: "Mismatch between answers and questions count" });
    }

    // ── 4. Score server-side ──────────────────────────────────
    let correct = 0;
    for (let i = 0; i < correctAnswersArray.length; i++) {
      if (userAnswers[i] === correctAnswersArray[i]) correct++;
    }
    const total = correctAnswersArray.length;
    const scorePercent = Math.round((correct / total) * 100);
    const passed = scorePercent >= PASS_THRESHOLD;
    const pointsEarned = passed ? (isRetry ? 30 : 50) : 0;

    // ── 4. Store attempt ──────────────────────────────────────
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: { persistSession: false },
    });

    const { error: insertError } = await supabase
      .from("user_quiz_attempts")
      .insert({ user_id: userId, topic, score: correct, total, passed, points_earned: pointsEarned, is_retry: isRetry ?? false });

    if (insertError) {
      return ok({ error: "Failed to record quiz attempt: " + insertError.message });
    }

    // ── 5. Unlock chat access if passed ──────────────────────
    if (passed) {
      await supabase.from("chat_access").upsert({
        user_id: userId,
        topic,
        unlocked: true,
        updated_at: new Date().toISOString(),
      });
    }

    return ok({ passed, score: correct, total, scorePercent, pointsEarned, passThreshold: PASS_THRESHOLD });

  } catch (err: any) {
    return ok({ error: `Unexpected: ${err?.message ?? String(err)}` });
  }
});
