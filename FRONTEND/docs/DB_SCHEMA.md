# Database Schemas & Relations - StudySnap

This document details the PostgreSQL database tables, field types, and foreign key constraints designed in Drizzle ORM for Neon PostgreSQL.

## Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    USERS {
        text id PK "Clerk User ID"
        text name
        text college
        text semester
        text study_goals
        integer streak_count
        timestamp last_active_date
        timestamp created_at
    }
    
    CATEGORIES {
        uuid id PK
        text user_id FK
        text name
        text color
        timestamp created_at
    }

    FOLDERS {
        uuid id PK
        text user_id FK
        text name
        timestamp created_at
    }

    NOTES {
        uuid id PK
        text user_id FK
        text title
        text content
        text tags "Comma-separated string"
        boolean is_pinned
        boolean is_favorite
        text pin_lock "4-digit PIN"
        uuid category_id FK
        uuid folder_id FK
        timestamp last_revised_at
        timestamp next_revision_at
        integer revision_streak
        boolean is_archived
        timestamp created_at
        timestamp updated_at
    }

    VOICE_NOTES {
        uuid id PK
        uuid note_id FK
        text audio_url
        integer duration "seconds"
        text transcript
        timestamp created_at
    }

    REVISION_LOGS {
        uuid id PK
        uuid note_id FK
        timestamp revised_at
        text rating "easy|medium|hard"
        timestamp next_scheduled_at
    }

    USERS ||--o{ CATEGORIES : "creates"
    USERS ||--o{ FOLDERS : "creates"
    USERS ||--o{ NOTES : "writes"
    CATEGORIES ||--o{ NOTES : "tags"
    FOLDERS ||--o{ NOTES : "groups"
    NOTES ||--o{ VOICE_NOTES : "records"
    NOTES ||--o{ REVISION_LOGS : "logs"
```

---

## 1. Table Definitions

### `users`
Tracks individual student goals, profiles, and streak records.
- `id` (text, primaryKey): Clerk User ID.
- `name` (text, notNull): Student full name.
- `college` / `semester` / `studyGoals` (text, nullable): Student meta details.
- `streakCount` (integer, default 0): Current consecutive active study days.
- `lastActiveDate` (timestamp, nullable): Date streak check was last run.

### `categories`
Groups notes under subjects (Physics, Chemistry, custom subjects).
- `id` (uuid, primaryKey): Unique ID.
- `userId` (text, notNull): Foreign Key linking categories to the creator user.
- `name` (text, notNull): Subject name (e.g. Maths).
- `color` (text, nullable): Subject hex accent code (e.g. `#0061A4`).

### `folders`
Organizes notes under hierarchical structures.
- `id` (uuid, primaryKey): Unique ID.
- `userId` (text, notNull): Creator user reference.
- `name` (text, notNull): Folder label (e.g. Semester 2).

### `notes`
Stores the rich-text note details, metadata, and spaced repetition tracking stats.
- `id` (uuid, primaryKey): Note identifier.
- `userId` (text, notNull): Author user reference.
- `title` (text, notNull): Note headline.
- `content` (text, notNull): Note body text.
- `tags` (text, nullable): Comma-separated tags lists (e.g. `optics,formula`).
- `isPinned` / `isFavorite` (boolean, default false): Dashboard priority states.
- `pinLock` (text, nullable): 4-digit PIN code to secure notes locally.
- `categoryId` (uuid, nullable): References `categories.id` (`set null` on delete).
- `folderId` (uuid, nullable): References `folders.id` (`cascade` on delete).
- `lastRevisedAt` / `nextRevisionAt` (timestamp, nullable): Scheduled revision dates.
- `revisionStreak` (integer, default 0): Spaced repetition streak levels.

### `voiceNotes`
Captures voice sessions associated with notes.
- `id` (uuid, primaryKey): Recording ID.
- `noteId` (uuid, notNull): References `notes.id` (`cascade` on delete).
- `audioUrl` (text, notNull): Web link or blob path to audio file.
- `duration` (integer, notNull): Recording length in seconds.
- `transcript` (text, nullable): Associated AI text transcripts.

### `revisionLogs`
Maintains records of spaced repetition events for performance stats.
- `id` (uuid, primaryKey): Log ID.
- `noteId` (uuid, notNull): References `notes.id` (`cascade` on delete).
- `revisedAt` (timestamp, default now): Review completion timestamp.
- `rating` (text): Difficulty assessment chosen by user (`easy`, `medium`, `hard`).
- `nextScheduledAt` (timestamp, notNull): Newly computed next review date.
