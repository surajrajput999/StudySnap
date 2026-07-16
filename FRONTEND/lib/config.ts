const isBrowser = typeof window !== 'undefined';

function detectBackendURL(): string {
  if (process.env.NEXT_PUBLIC_BACKEND_URL) {
    return process.env.NEXT_PUBLIC_BACKEND_URL;
  }
  if (isBrowser) {
    const host = window.location.hostname;
    if (host !== 'localhost' && host !== '127.0.0.1') {
      const fallback = `https://${host.replace('frontend', 'api').replace('app', 'api')}`;
      console.warn(`[config] NEXT_PUBLIC_BACKEND_URL not set — guessing backend at ${fallback}. Set this environment variable in Vercel.`);
      return fallback;
    }
  }
  return 'http://localhost:4000';
}

const BACKEND_URL = detectBackendURL();

if (typeof window !== 'undefined' && BACKEND_URL.includes('localhost') && window.location.hostname !== 'localhost') {
  console.error(
    `[config] ⚠️ BACKEND_URL is "${BACKEND_URL}" but frontend is deployed at "${window.location.hostname}".\n` +
    '  → Set NEXT_PUBLIC_BACKEND_URL in Vercel dashboard to your Render backend URL.\n' +
    '  → Example: https://studysnap-api.onrender.com'
  );
}

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
  const { token, ...fetchOptions } = options;
  const startTime = performance.now();

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    console.log(`[apiFetch] → ${options.method || 'GET'} ${url}`);

    const res = await fetch(url, {
      headers: { ...headers, ...(fetchOptions.headers as Record<string, string> || {}) },
      ...fetchOptions,
    });

    const duration = Math.round(performance.now() - startTime);
    const json = await res.json();

    if (!res.ok) {
      console.error(`[apiFetch] ✗ ${res.status} ${url} (${duration}ms):`, json);
    } else {
      console.log(`[apiFetch] ✓ ${url} (${duration}ms)`);
    }

    return json;
  } catch (error: any) {
    const duration = Math.round(performance.now() - startTime);
    const msg = error?.message || 'Unknown network error';
    console.error(`[apiFetch] ✗ NETWORK ERROR ${url} (${duration}ms): ${msg}`);

    if (url.includes('localhost') && typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      console.error('[apiFetch] ⚠️ Request to localhost from deployed frontend will always fail.');
      console.error('[apiFetch] → Set NEXT_PUBLIC_BACKEND_URL in Vercel to production backend URL.');
    }

    return { success: false, error: msg, _debug: { url, duration } } as T;
  }
}
