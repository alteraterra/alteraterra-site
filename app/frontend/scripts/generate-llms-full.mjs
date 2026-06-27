// generate-llms-full.mjs
// -----------------------------------------------------------------------------
// Generates public/llms-full.txt at build time.
//
// One section per published article: title, canonical URL, summary, key
// takeaways, body as plain text. Top of the file embeds public/llms.txt so
// LLMs that fetch only one file still see the site overview.
//
// Same env-graceful behavior as the sitemap generator: if Supabase env is
// missing or fetch fails, emit a minimal file (overview only) and exit 0.
// -----------------------------------------------------------------------------

import { writeFileSync, existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const FRONTEND_ROOT = resolve(__dirname, "..");

try {
  const { config: loadEnv } = await import("dotenv");
  const envLocal = resolve(FRONTEND_ROOT, ".env.local");
  if (existsSync(envLocal)) loadEnv({ path: envLocal });
  const envDefault = resolve(FRONTEND_ROOT, ".env");
  if (existsSync(envDefault)) loadEnv({ path: envDefault });
} catch {
  console.warn("[llms-full] dotenv not installed — using process.env only.");
}

const SITE_URL = (process.env.VITE_SITE_URL || "https://alteraterra.vip").replace(
  /\/+$/,
  "",
);
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

// -- Helpers ------------------------------------------------------------------

function readOverview() {
  const p = resolve(FRONTEND_ROOT, "public", "llms.txt");
  if (existsSync(p)) {
    try {
      return readFileSync(p, "utf8").trim();
    } catch {
      /* ignore */
    }
  }
  return `# Altera Terra\n\n> Unum Per Iter — a private collective in the art of living.`;
}

// Strip HTML tags and decode the most common entities; collapse whitespace.
function htmlToPlainText(input) {
  if (!input) return "";
  let s = String(input);
  // Drop scripts/styles outright.
  s = s.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, "");
  // Treat block-level closers as paragraph breaks.
  s = s.replace(/<\/(p|div|li|h[1-6]|blockquote|br)>/gi, "\n\n");
  s = s.replace(/<br\s*\/?>/gi, "\n");
  // Remove all remaining tags.
  s = s.replace(/<[^>]+>/g, "");
  // Decode entities.
  s = s
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&mdash;/gi, "—")
    .replace(/&ndash;/gi, "–")
    .replace(/&hellip;/gi, "…");
  // Collapse runs of blank lines.
  s = s.replace(/\n{3,}/g, "\n\n");
  return s.trim();
}

async function fetchPublishedPosts() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn(
      "[llms-full] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY not set — overview only.",
    );
    return [];
  }
  // Pull a generous set of columns and tolerate missing ones (Supabase will
  // 400 on an unknown column; we retry with a smaller projection in that case).
  const fullSelect =
    "slug,lang,title,excerpt,seo_description,summary_for_llm,key_takeaways,faq_blocks,blocks,category,published_at,updated_at";
  const minimalSelect =
    "slug,lang,title,excerpt,summary_for_llm,published_at,updated_at";

  for (const select of [fullSelect, minimalSelect]) {
    const endpoint = `${SUPABASE_URL.replace(/\/+$/, "")}/rest/v1/blog_posts?select=${select}&status=eq.published&order=published_at.desc`;
    try {
      const res = await fetch(endpoint, {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          Accept: "application/json",
        },
      });
      if (res.ok) {
        const rows = await res.json();
        return Array.isArray(rows) ? rows : [];
      }
      console.warn(
        `[llms-full] Supabase fetch failed (${res.status}) for select="${select}".`,
      );
    } catch (err) {
      console.warn(`[llms-full] Supabase fetch error: ${err?.message || err}`);
    }
  }
  return [];
}

function postBodyPlain(post) {
  // Body is stored as a TipTap-style Block[] array in `blocks` (jsonb).
  const blocks = post.blocks;
  if (Array.isArray(blocks) && blocks.length) {
    const parts = [];
    for (const b of blocks) {
      if (!b || typeof b !== "object") continue;
      switch (b.type) {
        case "paragraph":
        case "callout":
          parts.push(htmlToPlainText(b.html || ""));
          break;
        case "heading":
          parts.push(htmlToPlainText(b.text || ""));
          break;
        case "quote":
          parts.push(htmlToPlainText(b.text || ""));
          break;
        case "image":
          if (b.caption) parts.push(htmlToPlainText(b.caption));
          break;
        case "faq":
          for (const item of b.items || []) {
            if (item?.question) parts.push(htmlToPlainText(item.question));
            if (item?.answer) parts.push(htmlToPlainText(item.answer));
          }
          break;
        default:
          break;
      }
    }
    return parts.filter(Boolean).join("\n\n");
  }
  return "";
}

function renderTakeaways(post) {
  const t = post.key_takeaways;
  if (!t) return "";
  let items = [];
  if (Array.isArray(t)) {
    items = t.map((x) => String(x).trim()).filter(Boolean);
  } else if (typeof t === "string") {
    items = t
      .split(/\r?\n|•|;|•/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (!items.length) return "";
  return ["Key takeaways:", ...items.map((it) => `- ${it}`)].join("\n");
}

function renderPost(post) {
  const url = `${SITE_URL}/journal/${post.slug}`;
  const lines = [];
  lines.push(`# ${post.title || post.slug}`);
  lines.push(``);
  lines.push(`URL: ${url}`);
  if (post.lang) lines.push(`Language: ${post.lang}`);
  if (post.published_at) lines.push(`Published: ${post.published_at}`);
  if (post.updated_at && post.updated_at !== post.published_at) {
    lines.push(`Updated: ${post.updated_at}`);
  }
  lines.push(``);
  const summary = post.summary_for_llm || post.excerpt || post.seo_description;
  if (summary) {
    lines.push(`Summary:`);
    lines.push(String(summary).trim());
    lines.push(``);
  }
  const takeaways = renderTakeaways(post);
  if (takeaways) {
    lines.push(takeaways);
    lines.push(``);
  }
  const body = postBodyPlain(post);
  if (body) {
    lines.push(`---`);
    lines.push(``);
    lines.push(body);
    lines.push(``);
  }
  return lines.join("\n");
}

async function main() {
  const overview = readOverview();
  const posts = await fetchPublishedPosts();

  const sections = [
    overview,
    ``,
    `---`,
    ``,
    `# Articles`,
    ``,
    posts.length
      ? `The following ${posts.length} articles are published as of ${new Date().toISOString()}.`
      : `No articles available at build time. Visit ${SITE_URL}/journal for the live list.`,
    ``,
  ];

  for (const post of posts) {
    sections.push(renderPost(post));
    sections.push(``);
  }

  const out = resolve(FRONTEND_ROOT, "public", "llms-full.txt");
  writeFileSync(out, sections.join("\n"), "utf8");
  console.log(`[llms-full] wrote ${out} (${posts.length} posts)`);
}

main().catch((err) => {
  console.error("[llms-full] unexpected error:", err);
  process.exit(0);
});
