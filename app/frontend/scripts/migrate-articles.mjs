// One-shot migration: imports journalArticles.ts into Supabase `blog_posts`
// and uploads referenced images into the `media` storage bucket.
//
// Idempotent — rerun safely. See ./README.md.

import { createRequire } from 'node:module';
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve, basename, extname } from 'node:path';
import { Buffer } from 'node:buffer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const FRONTEND_DIR = resolve(__dirname, '..');

const require = createRequire(import.meta.url);

// ---------- env ----------
function loadEnv() {
  const candidates = ['.env.local', '.env'];
  let loaded = false;
  for (const f of candidates) {
    const p = resolve(FRONTEND_DIR, f);
    if (!existsSync(p)) continue;
    const txt = readFileSync(p, 'utf8');
    for (const raw of txt.split(/\r?\n/)) {
      const line = raw.trim();
      if (!line || line.startsWith('#')) continue;
      const eq = line.indexOf('=');
      if (eq < 0) continue;
      const k = line.slice(0, eq).trim();
      let v = line.slice(eq + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      if (!(k in process.env)) process.env[k] = v;
    }
    loaded = true;
  }
  return loaded;
}
loadEnv();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing env. Need VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

// ---------- supabase ----------
const { createClient } = require('@supabase/supabase-js');
const supa = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const BUCKET = 'media';

function publicMediaUrl(path) {
  const base = SUPABASE_URL.replace(/\/$/, '');
  return base + '/storage/v1/object/public/' + BUCKET + '/' + path.replace(/^\//, '');
}

// ---------- load TS data via esbuild transform ----------
async function loadArticles() {
  const tsPath = resolve(FRONTEND_DIR, 'src/data/journalArticles.ts');
  const src = readFileSync(tsPath, 'utf8');
  let esbuild;
  try {
    esbuild = require('esbuild');
  } catch {
    // Resolve via pnpm store
    const hits = require('node:fs')
      .readdirSync(resolve(FRONTEND_DIR, 'node_modules/.pnpm'))
      .filter((n) => n.startsWith('esbuild@'));
    if (!hits.length) throw new Error('esbuild not available');
    esbuild = require(resolve(
      FRONTEND_DIR,
      'node_modules/.pnpm',
      hits[0],
      'node_modules/esbuild',
    ));
  }
  const { code } = esbuild.transformSync(src, {
    loader: 'ts',
    format: 'esm',
    target: 'es2022',
  });
  // Write to a temp file beside the source so relative imports (none here) would resolve.
  const tmpPath = resolve(__dirname, '_articles.generated.mjs');
  writeFileSync(tmpPath, code);
  const mod = await import(pathToFileURL(tmpPath).href + `?t=${Date.now()}`);
  const list = mod.default || mod.journalArticles;
  if (!Array.isArray(list)) throw new Error('Could not locate articles array in module');
  // Optional: drop a JSON sibling for inspection / reuse.
  try {
    writeFileSync(resolve(__dirname, '_articles.json'), JSON.stringify(list, null, 2));
  } catch {}
  return list;
}

// ---------- section -> block converter ----------
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Section → Block conversion contract (inverse of public-rewrite adapter):
 *   { type:'text',       content }                 -> { type:'paragraph', html:`<p>${content}</p>` }
 *   { type:'subheading', content }                 -> { type:'heading',   level:2, text:content }
 *   { type:'quote',      content }                 -> { type:'quote',     text:content }
 *   { type:'image',      content, caption? }       -> { type:'image',     src:content, alt:caption||'', caption:caption||'' }
 *
 * `content` for image sections is rewritten to the uploaded Supabase storage URL
 * before this converter runs.
 */
function sectionToBlock(section) {
  switch (section.type) {
    case 'text':
      return { type: 'paragraph', html: `<p>${escapeHtml(section.content)}</p>` };
    case 'subheading':
      return { type: 'heading', level: 2, text: section.content };
    case 'quote':
      return { type: 'quote', text: section.content };
    case 'image':
      return {
        type: 'image',
        src: section.content,
        alt: section.caption || '',
        caption: section.caption || '',
      };
    default:
      // Unknown — fall back to paragraph.
      return { type: 'paragraph', html: `<p>${escapeHtml(section.content || '')}</p>` };
  }
}

// ---------- date parsing ----------
const MONTHS = {
  january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
  july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
};
function parsePublishedAt(s) {
  if (!s) return null;
  const m = String(s).trim().toLowerCase().match(/^([a-z]+)\s+(\d{4})$/);
  if (!m) return null;
  const month = MONTHS[m[1]];
  const year = parseInt(m[2], 10);
  if (month == null || !year) return null;
  // First day of that month, UTC.
  return new Date(Date.UTC(year, month, 1)).toISOString();
}

// ---------- image upload ----------
const stats = { articles: 0, imagesUploaded: 0, bytes: 0, skipped: 0 };

function mimeFromExt(ext) {
  const e = ext.toLowerCase().replace(/^\./, '');
  if (e === 'jpg' || e === 'jpeg') return 'image/jpeg';
  if (e === 'png') return 'image/png';
  if (e === 'webp') return 'image/webp';
  if (e === 'gif') return 'image/gif';
  if (e === 'svg') return 'image/svg+xml';
  return 'application/octet-stream';
}

async function fetchWithRetry(url, { timeoutMs = 10_000, retries = 3 } = {}) {
  let lastErr;
  for (let attempt = 0; attempt < retries; attempt++) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(url, { signal: ctrl.signal });
      clearTimeout(t);
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
      return Buffer.from(await res.arrayBuffer());
    } catch (e) {
      clearTimeout(t);
      lastErr = e;
      if (attempt < retries - 1) {
        await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
      }
    }
  }
  throw lastErr;
}

async function storageObjectExists(path) {
  // list() with a path filter is the cheapest existence check on storage.
  const dir = path.includes('/') ? path.slice(0, path.lastIndexOf('/')) : '';
  const name = path.includes('/') ? path.slice(path.lastIndexOf('/') + 1) : path;
  const { data, error } = await supa.storage.from(BUCKET).list(dir, {
    limit: 100,
    search: name,
  });
  if (error) return false;
  return Array.isArray(data) && data.some((f) => f.name === name);
}

function filenameFromUrl(u) {
  try {
    const url = new URL(u);
    const last = basename(url.pathname);
    return last || `image-${Date.now()}.bin`;
  } catch {
    return basename(u) || `image-${Date.now()}.bin`;
  }
}

/**
 * Migrate one image URL.
 * - Remote (http/https): fetch with timeout+retry, upload to migrated/<slug>/<filename>.
 * - Local /assets/foo.jpg: read from public/assets and upload.
 * Returns the publicMediaUrl path on success, or the original URL on failure.
 */
async function migrateImage(rawUrl, slug) {
  if (!rawUrl) return rawUrl;

  // If already a Supabase public URL, leave as-is.
  if (rawUrl.startsWith(SUPABASE_URL)) return rawUrl;

  const isHttp = /^https?:\/\//i.test(rawUrl);
  const filename = isHttp ? filenameFromUrl(rawUrl) : basename(rawUrl);
  const storagePath = `migrated/${slug}/${filename}`;

  if (await storageObjectExists(storagePath)) {
    stats.skipped++;
    return publicMediaUrl(storagePath);
  }

  let body;
  try {
    if (isHttp) {
      body = await fetchWithRetry(rawUrl);
    } else {
      // Local asset under public/
      const localPath = resolve(FRONTEND_DIR, 'public', rawUrl.replace(/^\//, ''));
      if (!existsSync(localPath)) {
        console.warn(`  ! missing local asset: ${rawUrl}`);
        return rawUrl;
      }
      body = readFileSync(localPath);
    }
  } catch (e) {
    console.warn(`  ! fetch failed for ${rawUrl}: ${e.message}`);
    return rawUrl;
  }

  const contentType = mimeFromExt(extname(filename));
  const { error } = await supa.storage.from(BUCKET).upload(storagePath, body, {
    contentType,
    upsert: false,
  });
  if (error && !/already exists|duplicate/i.test(error.message)) {
    console.warn(`  ! upload failed for ${storagePath}: ${error.message}`);
    return rawUrl;
  }
  stats.imagesUploaded++;
  stats.bytes += body.length;
  return publicMediaUrl(storagePath);
}

// ---------- per-article migration ----------
async function migrateArticle(article) {
  const slug = article.slug;

  // Idempotency: skip if already migrated.
  const { data: existing } = await supa
    .from('blog_posts')
    .select('id, tags')
    .eq('slug', slug)
    .eq('lang', 'en')
    .maybeSingle();
  if (existing && Array.isArray(existing.tags) && existing.tags.includes('migrated')) {
    console.log(`= already migrated ${slug}`);
    return;
  }

  // 1. Migrate hero image.
  const cover_url = await migrateImage(article.heroImage, slug);

  // 2. Migrate inline image sections and convert sections -> blocks.
  const sections = [];
  for (const s of article.sections || []) {
    if (s.type === 'image') {
      const newSrc = await migrateImage(s.content, slug);
      sections.push({ ...s, content: newSrc });
    } else {
      sections.push(s);
    }
  }
  const blocks = sections.map(sectionToBlock);
  const imagesInBody = sections.filter((s) => s.type === 'image').length;

  // 3. Reading time minutes from "11 min read".
  const rtMatch = String(article.readTime || '').match(/(\d+)/);
  const reading_time_minutes = rtMatch ? parseInt(rtMatch[1], 10) : null;

  // 4. Build row.
  const row = {
    slug,
    lang: 'en',
    status: 'published',
    title: article.title || 'Untitled',
    excerpt: article.excerpt || '',
    cover_url: cover_url || '',
    tags: ['migrated'],
    author: 'Altera Terra',
    blocks,
    seo_title: article.title || '',
    seo_description: article.excerpt || '',
    category: article.category || '',
    reading_time_minutes,
    summary_for_llm: article.excerpt || '',
    key_takeaways: [],
    faq_blocks: [],
    citable_facts: [],
    schema_org_type: 'Article',
    noindex: false,
    published_at: parsePublishedAt(article.date),
  };

  // 5. Upsert on (slug, lang).
  const { error } = await supa
    .from('blog_posts')
    .upsert(row, { onConflict: 'slug,lang' });
  if (error) {
    console.error(`x ${slug}: ${error.message}`);
    return;
  }
  stats.articles++;
  console.log(`✓ migrated ${slug} (cover + ${imagesInBody} images uploaded)`);
}

// ---------- main ----------
(async () => {
  console.log(`→ Migrating articles to ${SUPABASE_URL}\n`);

  const articles = await loadArticles();
  console.log(`Loaded ${articles.length} articles from src/data/journalArticles.ts\n`);

  for (const a of articles) {
    try {
      await migrateArticle(a);
    } catch (e) {
      console.error(`x ${a.slug}: ${e.message}`);
    }
  }

  const mb = (stats.bytes / 1024 / 1024).toFixed(2);
  console.log(`\n— Summary —`);
  console.log(`  articles upserted: ${stats.articles}`);
  console.log(`  images uploaded:   ${stats.imagesUploaded}`);
  console.log(`  images skipped:    ${stats.skipped} (already in storage)`);
  console.log(`  total bytes:       ${stats.bytes} (${mb} MB)`);
})().catch((e) => {
  console.error('FATAL:', e);
  process.exit(1);
});
