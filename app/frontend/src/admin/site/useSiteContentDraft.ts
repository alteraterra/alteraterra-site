import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import type { SiteContent } from '@/content/schema';

/** The single editable site-content blob, always treated as partial. */
export type SiteContentDraft = Partial<SiteContent>;

/** A dot/array path into the draft, e.g. ['house', 'services', 0, 'title']. */
export type DraftPath = Array<string | number>;

export interface UseSiteContentDraft {
  /** Current working copy. `undefined` until the first load resolves. */
  draft: SiteContentDraft;
  /** True once `draft` diverges from the last loaded/saved snapshot. */
  dirty: boolean;
  /** Initial load in flight (no row fetched yet). */
  loading: boolean;
  /** Save in flight. */
  saving: boolean;
  /** Last load/save error message, if any. */
  error: string | null;
  /** Immutable deep-set: `update(['house','title'], 'New title')`. */
  update: (path: DraftPath, value: unknown) => void;
  /** Persist `draft` to `site_content` (id=1) and toast the outcome. */
  save: () => Promise<void>;
  /** Re-fetch the row from Supabase, discarding local edits. */
  reload: () => Promise<void>;
}

const ROW_ID = 1;

/**
 * Immutably set `value` at `path` within `obj`, cloning only the spine of
 * containers along the way. Missing intermediates are created as objects, or
 * arrays when the next key is numeric.
 */
function deepSet<T>(obj: T, path: DraftPath, value: unknown): T {
  if (path.length === 0) return value as T;
  const [key, ...rest] = path;

  if (typeof key === 'number') {
    const arr = Array.isArray(obj) ? [...(obj as unknown[])] : [];
    arr[key] = deepSet(arr[key], rest, value);
    return arr as unknown as T;
  }

  const base = obj && typeof obj === 'object' && !Array.isArray(obj)
    ? (obj as Record<string, unknown>)
    : {};
  const next: Record<string, unknown> = { ...base };
  const childPath = rest.length === 0 ? [] : rest;
  next[key] =
    rest.length === 0 ? value : deepSet(next[key], childPath, value);
  return next as unknown as T;
}

/**
 * Loads the single `site_content` row (id=1), holds an editable draft in
 * React state with a dirty flag, and persists it back on save(). The blob is
 * always partial: the i18n dictionary remains the runtime fallback.
 */
export function useSiteContentDraft(): UseSiteContentDraft {
  const [draft, setDraft] = useState<SiteContentDraft>({});
  const [dirty, setDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('site_content')
        .select('data')
        .eq('id', ROW_ID)
        .single();
      if (err) throw err;
      setDraft(((data?.data as SiteContentDraft) ?? {}));
      setDirty(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      toast.error('Failed to load site content', { description: msg });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const update = useCallback((path: DraftPath, value: unknown) => {
    setDraft((prev) => deepSet(prev, path, value));
    setDirty(true);
  }, []);

  const save = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      const { error: err } = await supabase
        .from('site_content')
        .update({ data: draft })
        .eq('id', ROW_ID);
      if (err) throw err;
      setDirty(false);
      toast.success('Site content saved');
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      toast.error('Failed to save site content', { description: msg });
    } finally {
      setSaving(false);
    }
  }, [draft]);

  return { draft, dirty, loading, saving, error, update, save, reload };
}

export default useSiteContentDraft;
