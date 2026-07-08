import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { deepGet } from './deepGet';
import type { SiteContent } from './schema';

/**
 * SiteContentContext, exposes the editable site-content blob to the tree and
 * the resolver helpers the components use to read copy/images.
 *
 * RESOLUTION ORDER (the locked architecture):
 *   text(path, i18nKey) → blob value at `path` → t(i18nKey) → raw i18nKey
 *   img(path, fallback) → blob value at `path` → fallback
 *
 * The i18n dictionary stays as the permanent fallback. This provider MUST be
 * mounted INSIDE LanguageProvider because `text()` calls `t()` from
 * useLanguage(), see App.tsx where it sits immediately inside <LanguageProvider>.
 */

interface SiteContentValue {
  content: Partial<SiteContent>;
  /** Raw string at a blob path ('' if absent). No i18n fallback. */
  get: (path: string) => string;
  /** Whole section object by top-level key, or undefined. */
  section: <K extends keyof SiteContent>(k: K) => SiteContent[K] | undefined;
  /** Blob value at path, else t(i18nKey) (which itself falls back to the raw key). */
  text: (path: string, i18nKey: string) => string;
  /** Blob value at path, else the provided fallback (used for images/URLs). */
  img: (path: string, fallback: string) => string;
}

const SiteContentContext = createContext<SiteContentValue | undefined>(undefined);

export function SiteContentProvider({
  initial,
  children,
}: {
  initial?: Partial<SiteContent>;
  children: ReactNode;
}) {
  // Hold the blob in state so a future admin/live-update path can replace it.
  const [content] = useState<Partial<SiteContent>>(initial ?? {});
  const { t } = useLanguage();

  const value = useMemo<SiteContentValue>(() => {
    const get = (path: string): string => String(deepGet(content, path) ?? '');

    const section = <K extends keyof SiteContent>(k: K): SiteContent[K] | undefined =>
      content[k];

    const text = (path: string, i18nKey: string): string =>
      (String(deepGet(content, path) ?? '') || t(i18nKey));

    const img = (path: string, fallback: string): string =>
      deepGet(content, path) || fallback;

    return { content, get, section, text, img };
  }, [content, t]);

  return (
    <SiteContentContext.Provider value={value}>
      {children}
    </SiteContentContext.Provider>
  );
}

export function useContent(): SiteContentValue {
  const ctx = useContext(SiteContentContext);
  if (!ctx) throw new Error('useContent must be used within SiteContentProvider');
  return ctx;
}
