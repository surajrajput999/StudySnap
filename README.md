<div align="center">
  <img src="FRONTEND/public/studysnap-logo.svg" width="80" alt="StudySnap">
  <h1 style="font-size: 2.5em; margin: 8px 0 4px; letter-spacing: -1px;">StudySnap</h1>
  <p style="font-size: 1.1em; color: #666; margin-bottom: 16px;">
    <strong>Your Intelligent Study Companion</strong><br>
    Create · Organize · Listen · Revise
  </p>
  <p>
    <img src="https://img.shields.io/badge/Next.js_16-000000?style=flat-square&logo=next.js&logoColor=white" alt="Next.js 16">
    <img src="https://img.shields.io/badge/Express.js-000000?style=flat-square&logo=express&logoColor=white" alt="Express.js">
    <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript">
    <img src="https://img.shields.io/badge/Clerk-6C47FF?style=flat-square&logo=clerk&logoColor=white" alt="Clerk">
    <img src="https://img.shields.io/badge/Zustand-7C3AED?style=flat-square&logo=react&logoColor=white" alt="Zustand">
    <img src="https://img.shields.io/badge/Groq-10B981?style=flat-square&logo=llama&logoColor=white" alt="Groq AI">
    <img src="https://img.shields.io/badge/PWA-5A0FC8?style=flat-square&logo=pwa&logoColor=white" alt="PWA">
  </p>
</div>

---



<div align="center">
  <h3>Dashboard</h3>
  <table>
    <tr>
      <td align="center"><strong>Desktop</strong></td>
      <td align="center"><strong>Mobile</strong></td>
      <td align="center"><strong>Dark Mode</strong></td>
    </tr>
    <tr>
      <td><img src="screenshots/dashboard-desktop.png" alt="Desktop Dashboard" width="380"></td>
      <td><img src="screenshots/dashboard-mobile.png" alt="Mobile Dashboard" width="120"></td>
      <td><img src="screenshots/dashboard-dark.png" alt="Dark Mode Dashboard" width="380"></td>
    </tr>
  </table>

  <h3>Features</h3>
  <table>
    <tr>
      <td align="center"><strong>Note Editor</strong></td>
      <td align="center"><strong>Voice Notes</strong></td>
      <td align="center"><strong>AI Assistant</strong></td>
    </tr>
    <tr>
      <td><img src="screenshots/editor-desktop.png" alt="Note Editor" width="250"></td>
      <td><img src="screenshots/voice-desktop.png" alt="Voice Notes" width="250"></td>
      <td><img src="screenshots/ai-desktop.png" alt="AI Assistant" width="250"></td>
    </tr>
    <tr>
      <td align="center"><strong>Revision Calendar</strong></td>
      <td align="center"><strong>Profile & Stats</strong></td>
      <td></td>
    </tr>
    <tr>
      <td><img src="screenshots/revision-desktop.png" alt="Revision Calendar" width="250"></td>
      <td><img src="screenshots/profile-desktop.png" alt="Profile" width="250"></td>
      <td></td>
    </tr>
  </table>
</div>

---

## Features

| | Feature | Description |
|---|---------|-------------|
| 🎯 | **Elite Dashboard** | Greeting, streak tracking, stats bar, 24 subjects, folders, search, pinned/favorite notes, grid/list view toggle |
| 📝 | **Advanced Note Editor** | Auto-save, TTS (listen aloud), STT (voice dictation), tags, PIN lock, PDF export, TXT/MD import |
| 🎙️ | **Voice Notes** | Record audio, pause/resume, playback speed (0.5x–2x), real-time speech-to-text transcription |
| 🤖 | **AI Assistant** | Chat with LLaMA-3, note summarization, MCQ generation with explanations, interactive flashcards, Hindi/English translation |
| 📅 | **Smart Revision** | Spaced repetition algorithm with Easy/Medium/Hard ratings, daily/weekly reminders, revision history |
| 👤 | **Student Profile** | Name, school/college, field of study, class/semester, study goals, Leaflet study zones map |
| 🎨 | **Premium UI** | Material Design 3, glassmorphism, gradient cards, staggered animations, dark mode |
| 📱 | **PWA Offline** | Service worker, offline caching, installable on mobile/desktop |

---

## Architecture

```
studysnap/
├── FRONTEND/                    # Next.js 16 + React 19
│   ├── app/
│   │   ├── page.tsx             # Main layout (header, sidebar, content, mobile nav)
│   │   └── globals.css          # Premium design system (MD3 tokens, animations)
│   ├── components/
│   │   ├── HomeScreen.tsx       # Dashboard with hero, stats, search, categories, notes
│   │   ├── NoteEditor.tsx       # Full editor with TTS/STT, tags, PIN, PDF/import
│   │   ├── VoiceNotes.tsx       # Audio recording + playback + transcription
│   │   ├── AiHelper.tsx         # AI chat, summarize, MCQ, flashcards, translate
│   │   ├── RevisionCalendar.tsx # Spaced repetition scheduler
│   │   └── ProfileView.tsx      # Student profile, stats, study zones map
│   ├── lib/store/useStore.ts    # Zustand store (24 categories, revision, etc.)
│   ├── lib/config.ts            # API config, apiFetch helper
│   └── public/
│       ├── window.svg           # Logo (lightbulb + open book)
│       ├── studysnap-logo.svg   # 400x400 logo
│       ├── screenshots/         # Feature screenshots
│       └── manifest.json        # PWA manifest
├── BACKEND/                     # Express.js + TypeScript API
│   └── src/
│       ├── routes/              # REST endpoints
│       ├── services/            # AI (Groq), email, cache, queue, payments
│       ├── middleware/          # Auth, rate limiting, security
│       └── db/                  # Drizzle ORM + Neon schema
├── package.json                 # Root scripts (install:all, dev, build)
└── .env.example                 # Environment template
```

---

## Quick Start

```bash
# 1. Clone & install
git clone https://github.com/surajrajput999/StudySnap.git
cd StudySnap
npm run install:all

# 2. Configure environment
cp .env.example BACKEND/.env
cp FRONTEND/.env.local.example FRONTEND/.env.local

# 3. Run both servers
npm run dev
```

| Server | URL |
|--------|-----|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:4000 |

---

## Tech Stack

| Category | Technology |
|----------|-----------|
| **Frontend** | Next.js 16, React 19, TypeScript |
| **State** | Zustand (localStorage persistence) |
| **Backend** | Express.js, TypeScript |
| **Database** | Neon PostgreSQL + Drizzle ORM |
| **Auth** | Clerk (Sign In / User Button) |
| **AI** | Groq (LLaMA-3 70B) |
| **Cache** | Upstash Redis |
| **Storage** | Cloudinary (images), Backblaze B2 (files) |
| **Email** | Brevo |
| **Payments** | Razorpay |
| **Queue** | BullMQ |
| **Security** | Helmet, CORS, Rate Limiting, csurf |
| **PWA** | Web Manifest, Service Worker |
| **Map** | Leaflet + OpenStreetMap |

---

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both frontend + backend in dev mode |
| `npm run build` | Build both frontend + backend for production |
| `npm run lint` | Lint frontend |
| `npm run install:all` | Install dependencies for both packages |

---

<div align="center">
  <p>Built with ❤️ by <a href="https://github.com/surajrajput999">Suraj Kumar</a></p>
  <p>
    <img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="MIT">
  </p>
</div>
