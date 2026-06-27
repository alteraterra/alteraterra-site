import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const SUPABASE_CONFIGURED = Boolean(url && key);

// ponytail: dummy client when env is missing so the app still boots locally.
// Public-site code must always check SUPABASE_CONFIGURED before calling.
export const supabase = SUPABASE_CONFIGURED
  ? createClient(url!, key!, { auth: { persistSession: true, autoRefreshToken: true } })
  : (createClient('http://localhost:0', 'placeholder', { auth: { persistSession: false } }));

export const MEDIA_BUCKET = 'media';

export function publicMediaUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const base = (url || '').replace(/\/$/, '');
  return base + '/storage/v1/object/public/' + MEDIA_BUCKET + '/' + path.replace(/^\//, '');
}
