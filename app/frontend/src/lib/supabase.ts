import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * True when this page load arrived via a magic-link (session in the URL hash).
 * MUST be captured here, before createClient below: supabase-js consumes and
 * strips the hash during client init, and module/microtask timing makes any
 * later check (even other modules' top level) lose the race.
 */
export const AUTH_HASH_LANDING =
  typeof window !== 'undefined' && window.location.hash.includes('access_token');

export const SUPABASE_CONFIGURED = Boolean(url && key);

// ponytail: dummy client when env is missing so the app still boots locally.
// Public-site code must always check SUPABASE_CONFIGURED before calling.
export const supabase = SUPABASE_CONFIGURED
  ? createClient(url!, key!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        // Implicit flow: magic links carry the session in the URL hash
        // (#access_token=...). Robust for email links opened in any browser —
        // PKCE would require the same client that requested the link.
        flowType: 'implicit',
      },
    })
  : (createClient('http://localhost:0', 'placeholder', { auth: { persistSession: false } }));

export const MEDIA_BUCKET = 'media';

export function publicMediaUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const base = (url || '').replace(/\/$/, '');
  return base + '/storage/v1/object/public/' + MEDIA_BUCKET + '/' + path.replace(/^\//, '');
}
