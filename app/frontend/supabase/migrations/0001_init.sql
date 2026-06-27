-- Admins allowlist (magic-link gate)
create table public.admins (
  email text primary key
);
alter table public.admins enable row level security;
create policy "admins_self_select" on public.admins
  for select to authenticated using (auth.jwt() ->> 'email' = email);

-- Site content singleton (for editable site copy if needed later)
create table public.site_content (
  id int primary key check (id = 1) default 1,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.site_content enable row level security;
create policy "site_content_public_read" on public.site_content for select using (true);
create policy "site_content_admin_write" on public.site_content
  for all to authenticated
  using (exists (select 1 from public.admins where email = auth.jwt() ->> 'email'))
  with check (exists (select 1 from public.admins where email = auth.jwt() ->> 'email'));
insert into public.site_content (id, data) values (1, '{}'::jsonb) on conflict (id) do nothing;

-- Blog posts (mirrors oscarmotta.com schema + GEO fields for AT)
create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  lang text not null default 'en',
  status text not null default 'draft' check (status in ('draft','scheduled','published')),
  title text not null default 'Untitled',
  excerpt text not null default '',
  cover_url text not null default '',
  tags text[] not null default '{}',
  author text not null default '',
  blocks jsonb not null default '[]'::jsonb,   -- TipTap-style block array
  seo_title text not null default '',
  seo_description text not null default '',
  category text not null default '',
  reading_time_minutes int,
  -- GEO fields
  summary_for_llm text not null default '',
  key_takeaways text[] not null default '{}',
  faq_blocks jsonb not null default '[]'::jsonb,
  citable_facts jsonb not null default '[]'::jsonb,
  schema_org_type text not null default 'Article',
  noindex boolean not null default false,
  -- Dates
  published_at timestamptz,
  scheduled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (slug, lang)
);
create index blog_posts_status_published_idx on public.blog_posts (status, published_at desc);
create index blog_posts_lang_idx on public.blog_posts (lang);
create index blog_posts_category_idx on public.blog_posts (category);

alter table public.blog_posts enable row level security;

create policy "blog_posts_public_read_published" on public.blog_posts
  for select using (status = 'published');

create policy "blog_posts_admin_all" on public.blog_posts
  for all to authenticated
  using (exists (select 1 from public.admins where email = auth.jwt() ->> 'email'))
  with check (exists (select 1 from public.admins where email = auth.jwt() ->> 'email'));

-- updated_at trigger
create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;
create trigger blog_posts_updated_at before update on public.blog_posts
  for each row execute function public.set_updated_at();
create trigger site_content_updated_at before update on public.site_content
  for each row execute function public.set_updated_at();
