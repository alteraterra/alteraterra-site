import { useEffect } from 'react';
import { useContent } from '@/content/SiteContentContext';

/**
 * SiteHead, overlays CMS-managed SEO + globals onto the static <head> baseline
 * shipped in index.html.
 *
 * We PATCH the existing tags in place (instead of emitting new ones via
 * react-helmet) so there are never duplicate <title>/<meta>/JSON-LD tags, and
 * the index.html values stay as the no-JS / first-paint default. GA and
 * google-site-verification remain operational tags in index.html.
 *
 * This is what makes the /admin/site/seo and /admin/site/globals editors live:
 * edit a field → save → the next load reflects it in the document head.
 */

function upsertMeta(key: 'name' | 'property', keyVal: string, content?: string) {
  if (!content) return;
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${key}="${keyVal}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(key, keyVal);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export default function SiteHead() {
  const { section } = useContent();
  const seo = section('seo') ?? {};
  const globals = section('globals') ?? {};

  useEffect(() => {
    const title = seo.title;
    const desc = seo.description;
    const url = seo.canonical || globals.siteUrl;
    const img = seo.ogImage;

    if (title) document.title = title;
    if (url) {
      const link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (link) link.href = url;
    }

    const metas: Array<['name' | 'property', string, string | undefined]> = [
      ['name', 'description', desc],
      ['property', 'og:title', title],
      ['property', 'og:description', desc],
      ['property', 'og:url', url],
      ['property', 'og:image', img],
      ['name', 'twitter:card', img ? 'summary_large_image' : undefined],
      ['name', 'twitter:title', title],
      ['name', 'twitter:description', desc],
      ['name', 'twitter:image', img],
    ];
    for (const [k, v, c] of metas) upsertMeta(k, v, c);

    // Organization JSON-LD: rewrite the static block from CMS globals so an
    // edited Instagram/LinkedIn/name propagates to structured data.
    const sameAs = [globals.instagramUrl, globals.linkedinUrl].filter(Boolean) as string[];
    if (sameAs.length || globals.siteTitle || globals.siteUrl || globals.tagline || seo.jsonLdLogo) {
      const ld = document.head.querySelector<HTMLScriptElement>('script[type="application/ld+json"]');
      if (ld) {
        try {
          const data = JSON.parse(ld.textContent || '{}');
          if (globals.siteTitle) data.name = globals.siteTitle;
          if (globals.tagline) data.alternateName = globals.tagline;
          if (globals.siteUrl) data.url = globals.siteUrl;
          if (seo.jsonLdLogo) data.logo = seo.jsonLdLogo;
          if (sameAs.length) data.sameAs = sameAs;
          ld.textContent = JSON.stringify(data);
        } catch {
          /* malformed static block, leave it as-is */
        }
      }
    }
  }, [seo, globals]);

  return null;
}
