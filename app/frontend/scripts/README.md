# scripts/

One-shot maintenance scripts. Run from `app/frontend/`.

## migrate-articles.mjs

Imports the 11 articles in `src/data/journalArticles.ts` into Supabase
`blog_posts` and uploads every referenced image into the `media` storage
bucket under `migrated/<slug>/<filename>`.

### Prerequisites

Place the following in `app/frontend/.env.local`:

```
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

The **service-role key is required** — RLS on `blog_posts` blocks the
anon key from writing, and storage uploads need admin privilege. The key
bypasses RLS and grants full database access, so:

> WARNING — service-role key is a master credential.
> Never commit `.env.local`. Never expose this key to the browser.
> The script is server-side only.

### Run

```sh
# From app/frontend/
node scripts/migrate-articles.mjs
# or
pnpm exec node scripts/migrate-articles.mjs
```

(`tsx` is not needed — the script is `.mjs` and uses esbuild's
`transformSync`, resolved from the local `node_modules`, to load
`journalArticles.ts` at runtime.)

### What it does

- Loads `src/data/journalArticles.ts` (TS → ESM via esbuild) and writes
  a sibling `scripts/_articles.json` for inspection.
- For each article:
  - Downloads the hero image and any inline `type:'image'` section image
    from `mgx-backend-cdn.metadl.com` (10s timeout, 3 retries) or reads
    from `public/assets/` for local paths.
  - Uploads each image to `media/migrated/<slug>/<filename>`. Existing
    objects are detected and skipped.
  - Converts `sections[]` → `blocks[]` via the converter contract:
    - `text`        → `{ type:'paragraph', html:'<p>...</p>' }`
    - `subheading`  → `{ type:'heading', level:2, text }`
    - `quote`       → `{ type:'quote', text }`
    - `image`       → `{ type:'image', src, alt, caption }`
  - Parses `"May 2026"` → ISO `published_at` (UTC, day 1 of month).
  - Upserts the row on `(slug, lang)` with
    `status='published'`, `lang='en'`, `author='Altera Terra'`,
    `schema_org_type='Article'`, `tags=['migrated']`.
- Prints `✓ migrated <slug> (cover + N images uploaded)` per article.
- Prints a final summary: articles upserted, images uploaded/skipped,
  total bytes.

### Idempotency

The script is safe to rerun:

- Storage uploads check `list()` before upload and skip existing files.
- Posts with `tags @> ARRAY['migrated']` are skipped on subsequent runs
  (delete the row or remove the `migrated` tag to force re-import).

### Verification

After a successful run, the 11 articles appear in:

- `/admin/articles` (the admin list view)
- `/blog/<slug>` (the public reader)
