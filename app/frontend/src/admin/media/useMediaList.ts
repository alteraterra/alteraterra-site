import { useCallback, useEffect, useState } from 'react';
import { supabase, publicMediaUrl, MEDIA_BUCKET } from '@/lib/supabase';
import type { MediaTileItem } from './MediaTile';

/**
 * Probe an image URL for natural dimensions. Returns null on non-images
 * or on error. Kept fire-and-forget so the grid renders immediately and
 * fills in dims as they resolve.
 */
function probeDimensions(url: string): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    if (typeof Image === 'undefined') return resolve(null);
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

export interface UseMediaListReturn {
  items: MediaTileItem[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  /** Optimistic remove from local cache. Caller should still call refetch. */
  removeLocal: (path: string) => void;
  /** Optimistic prepend after upload. */
  prependLocal: (item: MediaTileItem) => void;
}

/**
 * Lists the root of the `media` bucket, newest first. Probes image dims
 * lazily in the background.
 */
export function useMediaList(): UseMediaListReturn {
  const [items, setItems] = useState<MediaTileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchList = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // List the bucket root. Storage `list` is non-recursive: it returns
      // the year-month folders as entries. We then list each folder and
      // flatten, bounded to a sensible cap.
      const { data: roots, error: rootErr } = await supabase.storage
        .from(MEDIA_BUCKET)
        .list('', { limit: 200, sortBy: { column: 'created_at', order: 'desc' } });
      if (rootErr) throw rootErr;

      const folders = (roots || []).filter((r) => r.id === null || !r.metadata);
      const files = (roots || []).filter((r) => r.metadata);

      const collected: MediaTileItem[] = files.map((f) => ({
        path: f.name,
        name: f.name,
        url: publicMediaUrl(f.name),
        size: (f.metadata as { size?: number } | null)?.size,
      }));

      // Fan-out into yearMonth folders.
      for (const folder of folders) {
        const { data: inner, error: innerErr } = await supabase.storage
          .from(MEDIA_BUCKET)
          .list(folder.name, {
            limit: 200,
            sortBy: { column: 'created_at', order: 'desc' },
          });
        if (innerErr) continue;
        for (const f of inner || []) {
          if (!f.metadata) continue;
          const path = `${folder.name}/${f.name}`;
          collected.push({
            path,
            name: f.name,
            url: publicMediaUrl(path),
            size: (f.metadata as { size?: number } | null)?.size,
          });
        }
      }

      // Newest first by created_at if available; storage list already sorts,
      // but folder-fanout breaks the global order, re-sort by name (which
      // embeds yearMonth) as a stable fallback.
      collected.sort((a, b) => (a.path < b.path ? 1 : -1));

      setItems(collected);

      // Lazy dimension probe, write back as each resolves. Best-effort.
      collected.forEach((it) => {
        probeDimensions(it.url).then((dims) => {
          if (!dims) return;
          setItems((prev) =>
            prev.map((p) =>
              p.path === it.path ? { ...p, width: dims.width, height: dims.height } : p
            )
          );
        });
      });
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchList();
  }, [fetchList]);

  const removeLocal = useCallback((path: string) => {
    setItems((prev) => prev.filter((p) => p.path !== path));
  }, []);

  const prependLocal = useCallback((item: MediaTileItem) => {
    setItems((prev) => {
      const without = prev.filter((p) => p.path !== item.path);
      return [item, ...without];
    });
  }, []);

  return { items, isLoading, error, refetch: fetchList, removeLocal, prependLocal };
}
