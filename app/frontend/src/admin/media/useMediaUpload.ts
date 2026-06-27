import { useCallback, useRef, useState } from 'react';
import { supabase, publicMediaUrl, MEDIA_BUCKET } from '@/lib/supabase';

/**
 * Result of a successful upload to the `media` bucket.
 */
export interface UploadedMedia {
  /** Storage path inside the bucket, e.g. `2026-06/abcd1234-photo.jpg`. */
  path: string;
  /** Fully-qualified public URL via the storage CDN. */
  publicUrl: string;
}

export interface UseMediaUploadOptions {
  /**
   * Optional progress callback invoked with a [0..1] fraction.
   * Note: supabase-js v2 does not stream byte-level progress for the
   * standard `upload()` call, so we report 0 at start, 0.5 mid-flight,
   * and 1 on success. Consumers can ignore the value and rely on `isUploading`.
   */
  onProgress?: (fraction: number) => void;
  /**
   * Override the default cache-control header. Defaults to 1 year.
   */
  cacheControl?: string;
}

export interface UseMediaUploadReturn {
  uploadFile: (file: File) => Promise<UploadedMedia>;
  isUploading: boolean;
  /** Most recent error, or null. */
  error: Error | null;
  /** [0..1] best-effort progress for the current upload. */
  progress: number;
}

const SAFE_FILENAME_FALLBACK = 'file';

/**
 * Slugify a filename's basename while preserving its extension.
 * Lowercases, removes diacritics, replaces non-[a-z0-9] with `-`,
 * collapses runs of `-`, and trims to 64 chars to keep paths sane.
 */
export function slugify(filename: string): string {
  const dot = filename.lastIndexOf('.');
  const base = dot > 0 ? filename.slice(0, dot) : filename;
  const ext = dot > 0 ? filename.slice(dot + 1).toLowerCase() : '';

  const slugBase = base
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64) || SAFE_FILENAME_FALLBACK;

  return ext ? `${slugBase}.${ext.replace(/[^a-z0-9]/g, '')}` : slugBase;
}

/**
 * Short, URL-safe random id (no nanoid dep). 10 chars of [a-z0-9].
 * Collision-resistant enough for filename disambiguation inside a month
 * folder; the storage layer would reject true duplicates anyway.
 */
function shortId(): string {
  const bytes = new Uint8Array(8);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  let out = '';
  for (let i = 0; i < bytes.length; i++) {
    out += bytes[i].toString(36).padStart(2, '0');
  }
  return out.slice(0, 10);
}

function yearMonth(d = new Date()): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

/**
 * React hook for uploading files into the `media` bucket.
 *
 * Usage:
 *   const { uploadFile, isUploading, progress } = useMediaUpload({ onProgress });
 *   const { path, publicUrl } = await uploadFile(file);
 */
export function useMediaUpload(options: UseMediaUploadOptions = {}): UseMediaUploadReturn {
  const { onProgress, cacheControl = '31536000' } = options;
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState(0);
  const onProgressRef = useRef(onProgress);
  onProgressRef.current = onProgress;

  const report = useCallback((fraction: number) => {
    setProgress(fraction);
    onProgressRef.current?.(fraction);
  }, []);

  const uploadFile = useCallback(
    async (file: File): Promise<UploadedMedia> => {
      setIsUploading(true);
      setError(null);
      report(0);
      try {
        const path = `${yearMonth()}/${shortId()}-${slugify(file.name)}`;
        report(0.1);

        const { error: upErr } = await supabase.storage
          .from(MEDIA_BUCKET)
          .upload(path, file, {
            cacheControl,
            contentType: file.type || undefined,
            upsert: false,
          });

        if (upErr) throw upErr;

        report(1);
        return { path, publicUrl: publicMediaUrl(path) };
      } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e));
        setError(err);
        throw err;
      } finally {
        setIsUploading(false);
      }
    },
    [cacheControl, report]
  );

  return { uploadFile, isUploading, error, progress };
}
