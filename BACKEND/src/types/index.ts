export interface NotePayload {
  id?: string;
  title: string;
  content: string;
  tags?: string[];
  isPinned?: boolean;
  isFavorite?: boolean;
  pinLock?: string | null;
  categoryId?: string | null;
  folderId?: string | null;
}

export interface VoiceNotePayload {
  id?: string;
  noteId: string;
  audioUrl: string;
  duration: number;
  transcript?: string | null;
}

export interface CategoryPayload {
  name: string;
  color?: string;
}

export interface FolderPayload {
  name: string;
}

export interface AiChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface RevisionPayload {
  noteId: string;
  rating: 'easy' | 'medium' | 'hard';
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
