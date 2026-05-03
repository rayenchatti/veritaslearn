---
To: Yassin Bouteraa
From: Lead Technical Architect / AI Assistant
Date: April 28, 2026
Subject: Technical Conception and Architecture Report — VeritasLearn
---

# VeritasLearn: Product Requirements & Technical Conception

## 1. Project Idea & Overview
**VeritasLearn** is an intelligent, AI-powered mobile learning ecosystem. Instead of functioning as a generic chatbot, it acts as a structured "expert tutor." When a user asks an academic or study-related question, the AI generates a comprehensive, interactive **Study Pack**. 

This pack includes:
- A detailed, markdown-formatted lesson.
- A "humanized", simplified version of the concept using emojis.
- Interactive quizzes (standard and easy modes) based strictly on the generated lesson.
- Auto-generated flashcards for key terminology.

The app gamifies the learning experience by awarding XP for passed quizzes, tracking learning streaks, and ranking users on a global leaderboard.

## 2. Application Architecture & Pages
The mobile application is modularly designed, separating the core learning loop from user management. 

### Core Screens
- **LandingPage / AuthPage:** The entry pipeline for user onboarding, handling secure registration and login.
- **DashboardPage:** The central hub displaying the user's learning statistics (XP, current streak, quiz pass rate, and total study time).
- **ChatPage:** The primary interactive interface. Users ask questions here, and the AI responds with generated study packs. It includes a dynamic gatekeeper that rejects non-academic queries.
- **SessionDetailPage / HistoryPage:** A review center where users can look back at past generated lessons, retake quizzes, and review flashcards.
- **LeaderboardPage:** The gamification center that fetches aggregated XP data to rank users globally.
- **ProfilePage / EditProfilePage:** User management interface for updating bios, uploading avatars, and managing notification settings.

## 3. Technology Stack
The project utilizes a modern, decoupled architecture, leveraging a mobile client, a robust Backend-as-a-Service (BaaS), and a high-speed AI inference gateway.

### Frontend (Mobile Client)
- **Framework:** React Native (Bare CLI workflow, v0.84)
- **Routing:** React Navigation (Native Stack & Bottom Tabs)
- **State Management:** React Context API
- **UI/Icons:** Custom UI components, Lucide React Native

### Backend & Infrastructure
- **BaaS Provider:** Supabase
- **Database:** PostgreSQL
- **Serverless Compute:** Supabase Edge Functions (running on Deno)
- **Authentication:** Supabase Auth (JWT-based)
- **File Storage:** Supabase Storage (for user avatars)

### AI Integration
- **Provider:** Groq API
- **Model:** `llama-3.3-70b-versatile` (Configured for strict JSON structural outputs)

## 4. Database Conception (PostgreSQL Schema)
The relational database is designed to securely link user identities to their learning metrics and generated content.

- `users`: Stores profile metadata (`id`, `username`, `full_name`, `avatar_url`, `bio`, `notifications_enabled`).
- `chat_sessions`: Persists every generated study pack. Fields include `topic`, `question`, `answer` (markdown), `humanized`, `flashcards` (JSON array), and quiz scores.
- `user_quiz_attempts`: An append-only ledger tracking individual quiz performances (`score`, `total`, `points_earned`, `passed`) used to calculate XP and streaks.
- `user_rate_limits`: Tracks the `request_count` per `date` per user to manage API quotas.
- `avatars` (Storage Bucket): Handles binary image data for user profile pictures.

## 5. Security & Technical Implementations

### A. API Security & Credential Hiding
The React Native client never communicates directly with the Groq AI API. Instead, the mobile app sends requests to a Supabase Edge Function. The `GROQ_API_KEY` is stored strictly as a backend environment variable, protecting the app from reverse-engineering and key theft.

### B. Authentication & Token Verification
Every request to the Edge Function requires a Supabase JWT. The Edge Function decodes and verifies the `Authorization` header to extract the `user_id`. If the token is missing or invalid, the request is rejected immediately.

### C. AI Scope Bounding & Prompt Engineering
To prevent users from abusing the AI for non-educational purposes (e.g., writing code scripts, social chatting, or asking for jokes), the system prompt enforces strict bounds. The AI is instructed to return a unified JSON schema containing an `isStudyRelated` boolean. If the AI detects an off-topic prompt, it halts generation and returns a structured refusal message, which the frontend displays gracefully.

### D. Rate Limiting
To control infrastructure costs, the Edge Function queries the `user_rate_limits` table before calling the Groq API. Users are strictly capped at 50 requests per day. 

### E. Row Level Security (RLS) & RPC Bypasses
Supabase RLS is enforced at the database level so that a user can only `SELECT`, `INSERT`, or `UPDATE` their own `chat_sessions` and `user_quiz_attempts`. To allow the Leaderboard to calculate global rankings without exposing private user data, a secure PostgreSQL RPC function (`get_leaderboard`) is utilized to aggregate and return only the necessary XP and username data.
