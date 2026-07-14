# StudySnap — Frontend

The Next.js 16 progressive web app with a premium Material Design 3 interface.

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
