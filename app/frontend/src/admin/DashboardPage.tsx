// Expected route registration (wired in App.tsx by the wire phase):
//   /admin/login          → LoginPage (public)
//   /admin                → RequireAdmin > AdminLayout
//     index               → DashboardPage
//     /admin/articles     → (articles list)
//     /admin/articles/new → (article editor)
//     /admin/media        → (media library)
//     /admin/settings     → (settings)

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

interface RecentPost {
  id: string;
  title: string | null;
  status: string | null;
  updated_at: string | null;
}

interface Stats {
  total: number;
  published: number;
  drafts: number;
}

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '—';
  }
}

const StatCard: React.FC<{ label: string; value: number | string }> = ({
  label,
  value,
}) => (
  <div className="border border-bronze/15 bg-charcoal/20 px-6 py-7">
    <p className="text-[10px] tracking-[0.35em] uppercase text-parchment/50 mb-3">
      {label}
    </p>
    <p className="font-display text-4xl text-parchment">{value}</p>
  </div>
);

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    total: 0,
    published: 0,
    drafts: 0,
  });
  const [recent, setRecent] = useState<RecentPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const { data, error: err } = await supabase
          .from('blog_posts')
          .select('id, status', { count: 'exact', head: false });
        if (err) throw err;
        const rows = data ?? [];
        const total = rows.length;
        const published = rows.filter((r: any) => r.status === 'published').length;
        const drafts = rows.filter((r: any) => r.status === 'draft').length;

        const { data: recentRows, error: recentErr } = await supabase
          .from('blog_posts')
          .select('id, title, status, updated_at')
          .order('updated_at', { ascending: false })
          .limit(5);
        if (recentErr) throw recentErr;

        if (!cancelled) {
          setStats({ total, published, drafts });
          setRecent((recentRows as RecentPost[]) ?? []);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? 'Failed to load dashboard');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="max-w-5xl">
      <div className="flex items-end justify-between gap-6 mb-12">
        <div>
          <p className="text-[11px] tracking-[0.35em] uppercase text-bronze-warm mb-3">
            Overview
          </p>
          <h1 className="font-display text-4xl md:text-5xl text-parchment leading-none">
            Atelier — overview
          </h1>
        </div>
        <Link
          to="/admin/articles/new"
          className="ease-luxe transition-colors duration-500 inline-flex items-center px-5 py-3 text-[11px] tracking-[0.35em] uppercase border border-bronze/40 text-parchment hover:bg-bronze-warm hover:text-deepblack hover:border-bronze-warm whitespace-nowrap"
        >
          + New article
        </Link>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-8 border border-bronze-warm/40 px-4 py-3 text-sm text-bronze-warm/90"
        >
          {error}
        </div>
      )}

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-16">
        <StatCard label="Total articles" value={loading ? '—' : stats.total} />
        <StatCard label="Published" value={loading ? '—' : stats.published} />
        <StatCard label="Drafts" value={loading ? '—' : stats.drafts} />
      </section>

      <section>
        <h2 className="font-display text-2xl text-parchment mb-6">
          Recent activity
        </h2>

        <div className="border-t border-bronze/15">
          {loading && (
            <div className="py-6 text-sm text-parchment/50">Loading…</div>
          )}
          {!loading && recent.length === 0 && (
            <div className="py-6 text-sm text-parchment/50">
              No articles yet.
            </div>
          )}
          {!loading &&
            recent.map((post) => (
              <div
                key={post.id}
                className="grid grid-cols-12 gap-4 items-center py-4 border-b border-bronze/10"
              >
                <p className="col-span-7 md:col-span-8 truncate text-parchment">
                  {post.title || 'Untitled'}
                </p>
                <p className="col-span-2 text-[11px] tracking-[0.25em] uppercase text-bronze-warm/80">
                  {post.status ?? '—'}
                </p>
                <p className="col-span-3 md:col-span-2 text-right text-[11px] tracking-[0.2em] uppercase text-parchment/40">
                  {formatDate(post.updated_at)}
                </p>
              </div>
            ))}
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
