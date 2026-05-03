# 🎓 VeritasLearn

> **Originally conceptualized for the IEEE ISIMA CS SBC OPSYNC Hackathon, VeritasLearn has been fully implemented into a production-ready mobile application.**

VeritasLearn is an intelligent, gamified mobile learning assistant designed to transform the way students approach education. By leveraging large language models with strict educational guardrails, it generates personalized, highly accurate study materials on-the-fly.

## 🌟 What It Does
VeritasLearn turns any academic question into an interactive lesson. When a user asks a question, the AI generates a comprehensive "Study Pack" consisting of:
- **Structured Lessons:** Clear, markdown-formatted explanations of the topic.
- **Micro-Quizzes:** Auto-generated multiple-choice questions specifically tied to the lesson to test immediate comprehension.
- **Flashcards:** Bite-sized summaries of key terms.
- **Gamified Progression:** Users earn XP for passing quizzes, increasing their rank from "Seeker" to "Titan" on a competitive global leaderboard.

## 🛑 The Problem It Solves
Modern AI chatbots are incredibly powerful but heavily prone to **hallucinations** and **passive consumption**. Students often use them to cheat or get quick answers without actually learning.

VeritasLearn solves this by:
1. **Enforcing Active Learning:** The AI won't just give you the answer; it generates a quiz you must pass to prove you understood the material.
2. **Preventing Off-Topic Chat:** The system intelligently rejects non-academic prompts (like "write me a Python script" or "tell me a joke") to ensure the platform remains strictly for studying.
3. **Cryptographic Anti-Cheating:** Client-side grading bypasses are prevented by securely signing correct quiz answers via the backend using HMAC-SHA256. 

## 🛠️ Tech Stack
- **Frontend / Mobile Framework:** React Native (Bare Workflow) & TypeScript
- **Backend & Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth (with Secure Keychain Storage)
- **Serverless Compute:** Deno Edge Functions (Supabase Functions)
- **AI Engine:** Groq API running `llama-3.3-70b-versatile`
- **Security:** Strict Row-Level Security (RLS) & Stateless HMAC-SHA256 Payload Signatures

## 🚀 How to Run It Locally

### Prerequisites
- [Node.js](https://nodejs.org/en/) (v22+)
- [React Native Environment Setup](https://reactnative.dev/docs/environment-setup) (Android Studio / Xcode)
- A [Supabase](https://supabase.com/) project

### 1. Clone the repository
```bash
git clone https://github.com/rayenchatti/veritaslearn.git
cd veritaslearn
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory and add your Supabase keys:
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

*Note: The backend Edge Functions require a separate `.env` file with your `SUPABASE_SERVICE_ROLE_KEY` and `GROQ_API_KEY` when deploying to Supabase.*

### 4. Run the App

**For Android:**
```bash
npm run android
```

**For iOS:**
*(Mac only)*
```bash
cd ios
pod install
cd ..
npm run ios
```

---
*Built with ❤️ .*
