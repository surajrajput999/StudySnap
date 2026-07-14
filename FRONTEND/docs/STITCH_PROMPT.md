# Project Name: StudySnap

## Core UI/UX Design Specification & Prompt

### 1. Introduction & Overview
"StudySnap" is a premium, mobile-first web application designed to help students create, organize, read, listen to, and revise their study notes easily. The visual design focuses on the **Material Design 3 (MD3)** spec, adopting a sleek **Blue & White theme** with rich animations, glassmorphism card overlays, responsive layouts, and standard dark mode compatibility.

---

### 2. Color Palette & Typography
- **Primary Color:** `#0061A4` (Material Blue / Accent Primary)
- **Secondary Color:** `#535F70` (Sleek slate-blue for secondary indicators)
- **Background Color:** `#F8F9FF` (Clean light background with subtle blue tint)
- **Card Background:** White `#FFFFFF` with glassmorphic semi-transparency overlays (`rgba(255, 255, 255, 0.85)`) and shadows.
- **Dark Mode Background:** `#0F172A` (Deep slate / navy)
- **Typography Font Family:** *Outfit* or *Inter* (Google Fonts)
- **Layout Radius:** `28px` for large containers (standard MD3 card behavior), `16px` for normal widgets/buttons, and `8px` for small list tags.

---

### 3. Layout Structure & Navigation
1. **Header/AppBar:**
   - Left side: Logo ("StudySnap" text + clean lightbulb icon) and greeting ("Hello, Student!").
   - Right side: Streak tracker (flame icon + count), Dark Mode toggle, profile avatar.
2. **Global Navigation:**
   - Responsive Bottom Navigation bar for mobile screens.
   - Persistent Left Navigation drawer for tablet & desktop screens.
   - Core tabs: Home, Calendar/Revision, AI Help, Profile.

---

### 4. Interactive Components & Screens

#### A. Home Screen
- **Global Search:** Pill-shaped text-box with micro-interaction hover state.
- **Study Streak Widget:** Curved card showing study days and active metrics.
- **Revision Reminders Feed:** Carousel of upcoming review targets with a "Mark as Revised" check circle.
- **Subject Categories:** Horizontal scrolling list of colorful pills (Physics, Chemistry, Math, Biology, Computer).
- **Recent Notes:** Dynamic list layout with drag-to-delete indicator, pinning icon, and title details.

#### B. Note Editor
- **Rich Text Control Bar:** Sticky toolbar at the top for formatting, pinning, and starring.
- **Note Fields:** Plain/Rich text container supporting auto-save badge indicators.
- **Dictation & Listen Controllers:** Floating action buttons for "Speak to Text" (microphone icon) and "Listen Note" (speaker icon with audio wave animations).
- **Export/Share panel:** Bottom sheet for exporting notes to PDF or sharing.

#### E. Voice Notes Recorder
- **Waveform Animator:** Dynamic CSS visualizer displaying audio frequency waves when recording.
- **Playback Speeds Controller:** Segmented control toggling `0.5x`, `1.0x`, `1.5x`, and `2.0x`.
- **Rename Dialog:** MD3 modal dialog for editing audio metadata.

#### F. Revision Calendar
- **Monthly Grid View:** Mini calendar grid highlighting study streaks, revision history, and upcoming schedules.
- **Reminders Config:** Daily/Weekly toggles.

#### G. AI Assistant Pane
- **AI Sidebar:** Interactive prompt helper where students can trigger "Summarize Notes", "Generate MCQs", "Explain Simply", and "Translate to Hindi".
- **Chatbot Interface:** Interactive messaging thread with user bubbles (blue theme) and AI response bubbles (white theme) with text-streaming animation.

---

### 5. Micro-Animations & State Transitions
- **Hover Transitions:** Smooth transitions (`0.2s ease-in-out`) for active hover buttons.
- **PWA Slide-ins:** Bottom navigation sheets and slide transitions when changing routes.
- **Pulse Indicators:** Pulse glow animations for the voice notes recording state.
