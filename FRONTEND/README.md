<div align="center">
  <img src="FRONTEND/public/studysnap-logo.svg" width="60" alt="StudySnap">
  <h1>StudySnap — Frontend</h1>
  <p>Next.js 16 progressive web app with premium Material Design 3 interface</p>
</div>

## Screenshots

| Dashboard | Editor | AI Chat | Mobile |
|-----------|--------|---------|--------|
| <img src="public/screenshots/dashboard-desktop.png" width="200"> | <img src="public/screenshots/editor-desktop.png" width="200"> | <img src="public/screenshots/ai-desktop.png" width="200"> | <img src="public/screenshots/dashboard-mobile.png" width="80"> |

## Key Files

| File | Purpose |
|------|---------|
| `app/page.tsx` | Main layout — header, sidebar, content area, mobile nav |
| `app/globals.css` | Premium design tokens, glassmorphism, animations, card system |
| `components/HomeScreen.tsx` | Dashboard: hero, stats, search, categories, folders, notes grid/list |
| `components/NoteEditor.tsx` | Full editor: auto-save, TTS/STT, PIN lock, PDF export, tags |
| `components/VoiceNotes.tsx` | Audio recording with real-time transcription |
| `components/AiHelper.tsx` | AI chat, summarize, MCQ quiz, flashcards, translate |
| `components/RevisionCalendar.tsx` | Spaced repetition scheduler |
| `components/ProfileView.tsx` | Student profile with stats and Leaflet study map |
| `lib/store/useStore.ts` | Zustand store — 24 subjects, user, notes, revision, etc. |

## Setup

```bash
cp .env.local.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
npm start
```
