import { useEffect, useMemo, useState } from 'react';
import journalArticles, {
  type JournalArticle,
  type ArticleSection,
} from './journalArticles';
import { supabase, SUPABASE_CONFIGURED, publicMediaUrl } from '@/lib/supabase';
import type { Block, BlogPost } from '@/types/blog';

export type { ArticleSection } from './journalArticles';

export interface TranslatedArticle extends Omit<JournalArticle, 'sections'> {
  sections: ArticleSection[];
}

/* ─── helpers ──────────────────────────────────────────────────────────── */

/** Strip a single wrapping <p>…</p> and any HTML tags inside; collapse whitespace. */
function htmlToText(html: string): string {
  if (!html) return '';
  // Strip a leading/trailing <p> wrapper if present.
  let s = html.trim();
  s = s.replace(/^<p[^>]*>/i, '').replace(/<\/p>\s*$/i, '');
  // Strip all remaining tags.
  s = s.replace(/<\/?[^>]+>/g, '');
  // Decode the most common entities.
  s = s
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  return s.replace(/\s+/g, ' ').trim();
}

/**
 * Map editor Block[] → renderer ArticleSection[].
 *  - paragraph → text
 *  - heading   → subheading
 *  - quote     → quote
 *  - image     → image (src + caption, src run through publicMediaUrl for storage paths)
 *  - callout   → native callout (title + body); also accepted as plain text by older renderers
 *  - faq       → native faq variant carrying the items[]
 */
export function convertBlocksToSections(blocks: Block[]): ArticleSection[] {
  if (!Array.isArray(blocks)) return [];
  const out: ArticleSection[] = [];
  for (const block of blocks) {
    switch (block.type) {
      case 'paragraph':
        out.push({ type: 'text', content: htmlToText(block.html) });
        break;
      case 'heading':
        out.push({ type: 'subheading', content: block.text });
        break;
      case 'quote':
        out.push({ type: 'quote', content: block.text });
        break;
      case 'image':
        out.push({
          type: 'image',
          content: publicMediaUrl(block.src),
          caption: block.caption,
        });
        break;
      case 'callout':
        out.push({
          type: 'callout',
          content: htmlToText(block.html),
          title: block.title,
        });
        break;
      case 'faq':
        out.push({
          type: 'faq',
          content: '',
          items: Array.isArray(block.items) ? block.items : [],
        });
        break;
      default:
        // Unknown block type, skip silently rather than crash the page.
        break;
    }
  }
  return out;
}

function formatPublishedDate(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
}

function rowToArticle(row: BlogPost): TranslatedArticle {
  return {
    slug: row.slug,
    category: row.category || '',
    title: row.title,
    excerpt: row.excerpt || '',
    heroImage: publicMediaUrl(row.cover_url || ''),
    date: formatPublishedDate(row.published_at),
    readTime: `${row.reading_time_minutes || 10} min read`,
    sections: convertBlocksToSections((row.blocks as Block[]) || []),
  };
}

/* ─── hooks ────────────────────────────────────────────────────────────── */

/**
 * Returns published journal articles.
 *  - When Supabase is configured AND the `blog_posts` table has published rows, returns those.
 *  - When Supabase is NOT configured, OR the query fails, OR the table is empty,
 *    falls back to the in-repo TS file so the public site never goes blank during cutover.
 */
export function useTranslatedArticles(): TranslatedArticle[] {
  const fallback = useMemo<TranslatedArticle[]>(() => journalArticles as TranslatedArticle[], []);
  const [articles, setArticles] = useState<TranslatedArticle[]>(fallback);

  useEffect(() => {
    if (!SUPABASE_CONFIGURED) {
      // Already showing the TS fallback, nothing to fetch.
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('lang', 'en')
          .eq('status', 'published')
          .order('published_at', { ascending: false });
        if (cancelled) return;
        if (error) {
          // Keep the TS fallback in place; surface the error to the console for ops.
          // eslint-disable-next-line no-console
          console.warn('[journal] supabase fetch failed, using TS fallback:', error.message);
          return;
        }
        const rows = (data || []) as BlogPost[];
        if (rows.length === 0) {
          // Cutover window, table is empty, keep the TS fallback.
          return;
        }
        setArticles(rows.map(rowToArticle));
      } catch (err) {
        if (cancelled) return;
        // eslint-disable-next-line no-console
        console.warn('[journal] supabase fetch threw, using TS fallback:', err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return articles;
}

/**
 * Returns a single article by slug.
 */
export function useTranslatedArticle(slug: string | undefined): TranslatedArticle | undefined {
  const articles = useTranslatedArticles();
  return useMemo(() => articles.find((a) => a.slug === slug), [articles, slug]);
}
