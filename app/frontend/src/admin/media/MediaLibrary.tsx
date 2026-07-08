import { useCallback, useMemo, useRef, useState } from 'react';
import { Upload, Search, Loader2, ImagePlus } from 'lucide-react';
import { supabase, MEDIA_BUCKET, publicMediaUrl } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { MediaTile, type MediaTileItem } from './MediaTile';
import { useMediaList } from './useMediaList';
import { useMediaUpload } from './useMediaUpload';

/**
 * /admin/media page. Parchment-on-bronze surface, drop-to-upload zone,
 * filename filter, optimistic add/remove, refetch on success.
 */
export default function MediaLibrary() {
  const { items, isLoading, error, refetch, removeLocal, prependLocal } = useMediaList();
  const { uploadFile, isUploading, progress } = useMediaUpload();
  const [filter, setFilter] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => it.name.toLowerCase().includes(q));
  }, [items, filter]);

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      setUploadError(null);
      const arr = Array.from(files);
      for (const file of arr) {
        try {
          const { path } = await uploadFile(file);
          // Optimistically prepend so it's visible immediately.
          const optimistic: MediaTileItem = {
            path,
            name: file.name,
            url: publicMediaUrl(path),
            size: file.size,
          };
          prependLocal(optimistic);
        } catch (e) {
          setUploadError(e instanceof Error ? e.message : String(e));
        }
      }
      // Reconcile with server.
      await refetch();
    },
    [uploadFile, prependLocal, refetch]
  );

  const handleDelete = useCallback(
    async (item: MediaTileItem) => {
      const confirmed = window.confirm(`Delete "${item.name}"? This cannot be undone.`);
      if (!confirmed) return;
      // Optimistic removal.
      removeLocal(item.path);
      const { error: delErr } = await supabase.storage.from(MEDIA_BUCKET).remove([item.path]);
      if (delErr) {
        setUploadError(`Delete failed: ${delErr.message}`);
      }
      await refetch();
    },
    [removeLocal, refetch]
  );

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files?.length) {
      void handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="min-h-screen bg-parchment text-charcoal">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl text-deepblack">Media library</h1>
            <p className="mt-1 text-sm text-mist">
              Files in the <code className="rounded bg-chalk px-1 py-0.5 text-xs">media</code> bucket.
              Drop new ones below or click upload.
            </p>
          </div>
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mist" />
            <Input
              type="search"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter by filename…"
              className="border-bronze/40 bg-parchment pl-9 text-charcoal placeholder:text-mist focus-visible:ring-bronze-warm"
            />
          </div>
        </header>

        <div
          className={cn(
            'mb-8 flex items-center justify-between gap-4 rounded-md border-2 border-dashed p-6 transition-colors',
            isDragOver
              ? 'border-bronze-warm bg-chalk'
              : 'border-bronze/40 bg-parchment hover:border-bronze-warm/70'
          )}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={onDrop}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-bronze-warm/15 text-bronze-warm">
              <ImagePlus className="h-5 w-5" />
            </div>
            <div>
              <div className="font-display text-lg text-deepblack">Drop files to upload</div>
              <div className="text-xs text-mist">
                Or click the button. PNG, JPG, WebP, SVG, PDF, anything storage will accept.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isUploading ? (
              <span className="inline-flex items-center gap-2 text-xs text-mist">
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading {(progress * 100).toFixed(0)}%
              </span>
            ) : null}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.length) void handleFiles(e.target.files);
                e.target.value = '';
              }}
            />
            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="bg-bronze-warm text-parchment hover:bg-bronze"
            >
              <Upload className="h-4 w-4" />
              Upload
            </Button>
          </div>
        </div>

        {uploadError ? (
          <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {uploadError}
          </div>
        ) : null}

        {error ? (
          <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            Could not load media: {error.message}
          </div>
        ) : null}

        {isLoading && items.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-mist">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading media…
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-md border border-bronze/30 bg-chalk/50 px-6 py-12 text-center text-mist">
            {filter ? 'No files match that filter.' : 'No media yet. Upload something above.'}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {filtered.map((item) => (
              <MediaTile key={item.path} item={item} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
