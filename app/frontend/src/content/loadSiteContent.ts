import { supabase, SUPABASE_CONFIGURED } from '@/lib/supabase';
import type { SiteContent } from './schema';

/**
 * loadSiteContent, fetch the single editable site-content blob (id=1).
 *
 * Called once at boot, BEFORE first paint, so the result is merged over the
 * i18n dictionary. This MUST be resilient: it never throws and always resolves
 * to a usable object. If Supabase is not configured, the request fails, or the
 * request hangs, it degrades to `{}`, the i18n dictionary then serves as the
 * complete fallback and nothing is blocked.
 *
 * A 4s timeout (Promise.race) guarantees a hung network request cannot block
 * paint: whichever settles first wins, and the timeout branch yields `{}`.
 */

const TIMEOUT_MS = 4000;

/**
 * Module singleton holding the blob loaded at boot.
 *
 * main.tsx awaits loadSiteContent() and calls setBootedContent() with the
 * result BEFORE rendering. App.tsx then reads getBootedContent() and passes it
 * as `initial` to <SiteContentProvider> mounted inside <LanguageProvider>, the
 * provider must live there so useContent() can call t(). This singleton is the
 * hand-off channel between main (where we can await) and App (where the provider
 * must mount, to be under LanguageProvider).
 */
let booted: Partial<SiteContent> = {};

export function setBootedContent(blob: Partial<SiteContent>): void {
  booted = blob ?? {};
}

export function getBootedContent(): Partial<SiteContent> {
  return booted;
}

async function fetchBlob(): Promise<Partial<SiteContent>> {
  try {
    const { data, error } = await supabase
      .from('site_content')
      .select('data')
      .eq('id', 1)
      .single();
    if (error) return {};
    return (data?.data as Partial<SiteContent>) ?? {};
  } catch {
    return {};
  }
}

export async function loadSiteContent(): Promise<Partial<SiteContent>> {
  if (!SUPABASE_CONFIGURED) return {};

  // Timeout that degrades to {} so a hung request never blocks paint.
  const timeout = new Promise<Partial<SiteContent>>((resolve) => {
    setTimeout(() => resolve({}), TIMEOUT_MS);
  });

  try {
    return await Promise.race([fetchBlob(), timeout]);
  } catch {
    return {};
  }
}
