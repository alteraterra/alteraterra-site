import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from '@/components/ui/sonner';
import type { BlogStatus } from '@/types/blog';

type Row = {
  id: string;
  slug: string;
  lang: string;
  status: BlogStatus;
  title: string;
  category: string | null;
  author: string | null;
  updated_at: string;
};

const STATUS_DOT: Record<BlogStatus, string> = {
  draft: 'bg-zinc-400',
  scheduled: 'bg-amber-500',
  published: 'bg-emerald-500',
};

const STATUS_LABEL: Record<BlogStatus, string> = {
  draft: 'Draft',
  scheduled: 'Scheduled',
  published: 'Published',
};

function formatDate(value: string): string {
  try {
    return new Date(value).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return value;
  }
}

export default function ArticlesList() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | BlogStatus>('all');
  const [langFilter, setLangFilter] = useState<'all' | string>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    supabase
      .from('blog_posts')
      .select('id,slug,lang,status,title,category,author,updated_at')
      .order('updated_at', { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          toast.error('Could not load articles', { description: error.message });
          setRows([]);
        } else {
          setRows((data ?? []) as Row[]);
        }
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (langFilter !== 'all' && r.lang !== langFilter) return false;
      if (q && !r.title.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [rows, statusFilter, langFilter, search]);

  const langs = useMemo(() => {
    const s = new Set<string>();
    rows.forEach((r) => s.add(r.lang));
    return Array.from(s).sort();
  }, [rows]);

  return (
    <div className="min-h-screen bg-[#f5efe4] text-stone-900">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl">Articles</h1>
            <p className="mt-1 text-sm text-stone-600">
              Manage every post — drafts, scheduled, and published.
            </p>
          </div>
          <Button asChild>
            <Link to="/admin/articles/new">
              <Plus className="mr-2 h-4 w-4" /> New article
            </Link>
          </Button>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-md border border-stone-200 bg-[#fbf7ee] p-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title"
              className="pl-9 bg-white"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as 'all' | BlogStatus)}>
            <SelectTrigger className="w-[160px] bg-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="published">Published</SelectItem>
            </SelectContent>
          </Select>
          <Select value={langFilter} onValueChange={setLangFilter}>
            <SelectTrigger className="w-[140px] bg-white">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All languages</SelectItem>
              {(langs.length ? langs : ['en']).map((l) => (
                <SelectItem key={l} value={l}>
                  {l.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border border-stone-200 bg-[#fbf7ee]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead className="w-[130px]">Status</TableHead>
                <TableHead className="w-[80px]">Lang</TableHead>
                <TableHead className="w-[160px]">Category</TableHead>
                <TableHead className="w-[160px]">Author</TableHead>
                <TableHead className="w-[180px]">Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-stone-500">
                    Loading…
                  </TableCell>
                </TableRow>
              )}
              {!loading && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-stone-500">
                    No articles found.
                  </TableCell>
                </TableRow>
              )}
              {!loading &&
                filtered.map((r) => (
                  <TableRow
                    key={r.id}
                    className="cursor-pointer hover:bg-[#f0e9d8]"
                    onClick={() => navigate(`/admin/articles/${r.id}`)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{r.title || <em className="text-stone-400">Untitled</em>}</span>
                        <span className="text-xs text-stone-500">/{r.slug}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={`inline-block h-2 w-2 rounded-full ${STATUS_DOT[r.status]}`} />
                        <span className="text-sm">{STATUS_LABEL[r.status]}</span>
                      </div>
                    </TableCell>
                    <TableCell className="uppercase text-xs">{r.lang}</TableCell>
                    <TableCell className="text-sm">{r.category || '—'}</TableCell>
                    <TableCell className="text-sm">{r.author || '—'}</TableCell>
                    <TableCell className="text-sm text-stone-600">
                      {formatDate(r.updated_at)}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
