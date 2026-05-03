// =====================================================
// Supabase Edge Function: /generate
// Secure Groq AI Gateway
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

/**
 * Decode JWT payload WITHOUT verifying the signature.
 * Safe because the Supabase gateway already verified the JWT before
 * passing the request to this function.
 */
function decodeJwtPayload(jwt: string): Record<string, unknown> | null {
  try {
    const parts = jwt.split(".");
    if (parts.length !== 3) return null;
    // Base64url → base64 → decode
    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(b64);
    return JSON.parse(json);
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
  const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY") ?? "";
  const MAX_DAILY = parseInt(Deno.env.get("MAX_DAILY_REQUESTS") ?? "50", 10);

  try {
    // ── 1. Extract user ID directly from JWT payload ──────────
    // The Supabase gateway (ES256-aware) already verified the signature.
    // We just need the sub claim — no local crypto needed.
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return ok({ error: "Missing Authorization header" });
    }

    const token = authHeader.slice(7);
    const payload = decodeJwtPayload(token);
    const userId = payload?.sub as string | undefined;

    if (!userId) {
      return ok({ error: "Invalid token: could not decode sub claim" });
    }

    // ── 2. Parse body ─────────────────────────────────────────
    let body: any;
    try { body = await req.json(); } catch { return ok({ error: "Invalid JSON body" }); }
    const prompt = String(body?.prompt ?? "").trim().slice(0, 1000);
    if (!prompt) return ok({ error: "Missing prompt" });

    // ── 3. Rate limit ─────────────────────────────────────────
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: { persistSession: false },
    });
    const today = new Date().toISOString().split("T")[0];
    const { data: rl } = await supabase
      .from("user_rate_limits")
      .select("request_count")
      .eq("user_id", userId)
      .eq("date", today)
      .maybeSingle();

    const count = rl?.request_count ?? 0;
    if (count >= MAX_DAILY) {
      return ok({ error: `Daily AI limit reached (${MAX_DAILY}/day). Try again tomorrow.` });
    }

    // ── 4. Groq call ──────────────────────────────────────────
    if (!GROQ_API_KEY) return ok({ error: "Server misconfigured: GROQ_API_KEY missing" });

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: "You are VeritasLearn, an expert AI tutor. Always respond with a valid JSON study pack.",
          },
          {
            role: "user",
            content: buildPrompt(prompt),
          },
        ],
      }),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      return ok({ error: `Groq ${groqRes.status}: ${errText.slice(0, 300)}` });
    }

    const groqJson = await groqRes.json();
    const raw = groqJson?.choices?.[0]?.message?.content ?? "";
    const cleaned = raw.replace(/```json/g, "").replace(/```/g, "").trim();
    let parsed: any;
    try { parsed = JSON.parse(cleaned); } catch {
      return ok({ error: "AI returned invalid JSON: " + cleaned.slice(0, 200) });
    }

    if (parsed.isStudyRelated === false) {
      // The AI decided this is not study-related
      return ok({ error: parsed.refusalMessage || "📚 Please ask a study-related question." });
    }

    if (parsed.error) {
      return ok({ error: parsed.error });
    }

    // ── 5. Bump rate limit ────────────────────────────────────
    await supabase.from("user_rate_limits").upsert({
      user_id: userId,
      date: today,
      request_count: count + 1,
    });

    // ── 6. Generate signature for answers ───────────
    const correctAnswers = parsed.quiz?.map((q: any) => q.correctAnswer) || [];
    const easyAnswers = parsed.easyQuiz?.map((q: any) => q.correctAnswer) || [];
    const answersPayload = JSON.stringify({ quiz: correctAnswers, easyQuiz: easyAnswers });
    
    const encoder = new TextEncoder();
    const keyData = encoder.encode(SUPABASE_SERVICE_KEY.slice(0, 32).padEnd(32, '0'));
    const cryptoKey = await crypto.subtle.importKey(
      "raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
    );
    const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(answersPayload));
    const signatureBytes = new Uint8Array(signatureBuffer);
    const signatureBase64 = btoa(Array.from(signatureBytes).map(b => String.fromCharCode(b)).join(''));
    
    parsed.answersSignature = signatureBase64;
    parsed.answersPayload = answersPayload;

    return ok({ data: parsed });

  } catch (err: any) {
    return ok({ error: `Unexpected: ${err?.message ?? String(err)}` });
  }
});

function buildPrompt(prompt: string): string {
  return `You are an expert tutor. Generate a study pack as a JSON object for: "${prompt}".

IMPORTANT RULES:
1. You must decide if the topic is related to study, learning, or academics. Set "isStudyRelated" to true or false.
2. If "isStudyRelated" is false (e.g. social chat, jokes, coding non-academic scripts, personal advice), provide a polite refusal in "refusalMessage" and leave other fields empty.
3. If "isStudyRelated" is true, generate the study pack. The "answer" field MUST be a STRUCTURED LESSON — a concise, educational explanation. Use markdown formatting with **bold** for key terms and clear paragraphs. Ensure you properly escape any quotes inside JSON strings.
4. The quiz questions MUST test ONLY concepts explicitly explained in the "answer" lesson.
5. The "humanized" field is a simplified, fun version of the lesson with emojis.
6. Generate 3-5 quiz questions (4 options each), 2-3 easy quiz questions (2 options each), and 3-5 flashcards.

Required JSON structure (Always return this exact structure):
{
  "isStudyRelated": true,
  "refusalMessage": "",
  "topic": "Short descriptive title",
  "answer": "A structured lesson in Markdown... (Properly escape quotes)",
  "humanized": "A fun, simplified version of the lesson with emojis 🎯",
  "keyPoints": ["key concept 1", "key concept 2"],
  "quiz": [
    { "id": "q1", "question": "Question?", "options": ["a","b","c","d"], "correctAnswer": 0, "explanation": "Why this answer is correct", "timeLimit": 30 }
  ],
  "easyQuiz": [
    { "id": "eq1", "question": "Simpler question?", "options": ["a","b"], "correctAnswer": 0, "explanation": "...", "timeLimit": 20 }
  ],
  "flashcards": [
    { "id": "f1", "front": "Key Term", "back": "Definition" }
  ]
}`;
}
