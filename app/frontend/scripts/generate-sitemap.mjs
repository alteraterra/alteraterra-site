// generate-sitemap.mjs
// -----------------------------------------------------------------------------
// Generates public/sitemap.xml at build time.
// - Static routes always written.
// - If VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY are present, also pulls
//   every published blog_posts row and emits one <url> per article using
//   updated_at as <lastmod>.
// - If env is missing or the fetch fails, falls back to static-only and
//   exits 0 (do not fail the build).
// -----------------------------------------------------------------------------

import { writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const FRONTEND_ROOT = resolve(__dirname, "..");

// dotenv is a devDependency — import optionally so a stale node_modules
// doesn't crash the build. We fall back to process.env if dotenv is missing.
try {
  const { config: loadEnv } = await import("dotenv");
  const envLocal = resolve(FRONTEND_ROOT, ".env.local");
  if (existsSync(envLocal)) loadEnv({ path: envLocal });
  const envDefault = resolve(FRONTEND_ROOT, ".env");
  if (existsSync(envDefault)) loadEnv({ path: envDefault });
} catch {
  console.warn("[sitemap] dotenv not installed — using process.env only.");
}

const SITE_URL = (process.env.VITE_SITE_URL || "https://alteraterra.vip").replace(
  /\/+$/,
  "",
);
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;
console.log(`[sitemap] SUPABASE_URL=${SUPABASE_URL ? 'set' : 'unset'} SUPABASE_KEY=${SUPABASE_KEY ? 'set' : 'unset'} SITE_URL=${process.env.VITE_SITE_URL || '(default)'}`);

const STATIC_ROUTES = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/prelude", changefreq: "monthly", priority: "0.8" },
  { path: "/the-house", changefreq: "monthly", priority: "0.8" },
  { path: "/journal", changefreq: "weekly", priority: "0.9" },
  { path: "/meet-the-team", changefreq: "monthly", priority: "0.7" },
  { path: "/enquire", changefreq: "monthly", priority: "0.7" },
  { path: "/newsletter", changefreq: "monthly", priority: "0.5" },
  { path: "/privacy", changefreq: "yearly", priority: "0.3" },
  { path: "/terms", changefreq: "yearly", priority: "0.3" },
  { path: "/team/oscar-motta", changefreq: "monthly", priority: "0.6" },
  { path: "/team/domenico-morelli", changefreq: "monthly", priority: "0.6" },
];

function xmlEscape(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function urlEntry({ loc, lastmod, changefreq, priority }) {
  const parts = [
    `  <url>`,
    `    <loc>${xmlEscape(loc)}</loc>`,
    lastmod ? `    <lastmod>${xmlEscape(lastmod)}</lastmod>` : null,
    changefreq ? `    <changefreq>${changefreq}</changefreq>` : null,
    priority ? `    <priority>${priority}</priority>` : null,
    `  </url>`,
  ].filter(Boolean);
  return parts.join("\n");
}

async function fetchPublishedPosts() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn(
      "[sitemap] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY not set — emitting static routes only.",
    );
    return [];
  }
  const endpoint = `${SUPABASE_URL.replace(/\/+$/, "")}/rest/v1/blog_posts?select=slug,lang,updated_at&status=eq.published`;
  try {
    const res = await fetch(endpoint, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        Accept: "application/json",
      },
    });
    if (!res.ok) {
      console.warn(
        `[sitemap] Supabase fetch failed (${res.status}) — emitting static routes only.`,
      );
      return [];
    }
    const rows = await res.json();
    if (!Array.isArray(rows)) return [];
    return rows;
  } catch (err) {
    console.warn(`[sitemap] Supabase fetch error: ${err?.message || err}`);
    return [];
  }
}

function toIsoDate(value) {
  if (!value) return undefined;
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return undefined;
    return d.toISOString();
  } catch {
    return undefined;
  }
}

async function main() {
  const posts = await fetchPublishedPosts();
  const today = new Date().toISOString();

  const staticUrls = STATIC_ROUTES.map((r) =>
    urlEntry({
      loc: `${SITE_URL}${r.path}`,
      lastmod: today,
      changefreq: r.changefreq,
      priority: r.priority,
    }),
  );

  const postUrls = posts.map((post) =>
    urlEntry({
      loc: `${SITE_URL}/journal/${post.slug}`,
      lastmod: toIsoDate(post.updated_at) || today,
      changefreq: "monthly",
      priority: "0.7",
    }),
  );

  const body = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap-0.9">`,
    ...staticUrls,
    ...postUrls,
    `</urlset>`,
    ``,
  ].join("\n");

  const out = resolve(FRONTEND_ROOT, "public", "sitemap.xml");
  writeFileSync(out, body, "utf8");
  console.log(
    `[sitemap] wrote ${out} (${STATIC_ROUTES.length} static + ${posts.length} posts)`,
  );
}

main().catch((err) => {
  console.error("[sitemap] unexpected error:", err);
  // Do not fail the build.
  process.exit(0);
});
