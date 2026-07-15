const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export const API = {
  base: BACKEND_URL,
  notes: `${BACKEND_URL}/api/notes`,
  categories: `${BACKEND_URL}/api/notes/categories`,
  voiceNotes: `${BACKEND_URL}/api/voice-notes`,
  ai: {
    chat: `${BACKEND_URL}/api/ai/chat`,
    summarize: `${BACKEND_URL}/api/ai/summarize`,
    mcqs: `${BACKEND_URL}/api/ai/mcqs`,
    translate: `${BACKEND_URL}/api/ai/translate`,
  },
  revision: {
    mark: `${BACKEND_URL}/api/revision/mark`,
    logs: `${BACKEND_URL}/api/revision/logs`,
  },
  payments: {
    createOrder: `${BACKEND_URL}/api/payments/create-order`,
    verify: `${BACKEND_URL}/api/payments/verify`,
  },
  health: `${BACKEND_URL}/api/health`,
};

export async function apiFetch<T = any>(
  url: string,
  options: RequestInit & { token?: string } = {}
): Promise<T> {
  try {
    const { token, ...fetchOptions } = options;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(url, {
      headers: { ...headers, ...(fetchOptions.headers as Record<string, string> || {}) },
      ...fetchOptions,
    });
    const json = await res.json();
    return json;
  } catch (error: any) {
    return { success: false, error: error.message || 'Network error' } as T;
  }
}
