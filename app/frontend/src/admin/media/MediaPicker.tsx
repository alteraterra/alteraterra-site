import { useCallback, useMemo, useRef, useState } from 'react';
import { Upload, Search, Loader2 } from 'lucide-react';
import { publicMediaUrl } from '@/lib/supabase';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { MediaTile, type MediaTileItem } from './MediaTile';
import { useMediaList } from './useMediaList';
import { useMediaUpload } from './useMediaUpload';

export interface MediaPickerProps {
  open: boolean;
  onClose: () => void;
  /**
   * Invoked when the user confirms a selection. Receives the public URL
   * and the optional alt text the user typed in the picker (alt is owned
   * by the editor block, not the media row).
   */
  onSelect: (src: string, alt?: string) => void;
}

/**
 * Modal media picker used by the article editor. Grid + drop-to-upload,
 * same surface language as the library page but constrained to a dialog.
 */
export function MediaPicker({ open, onClose, onSelect }: MediaPickerProps) {
  const { items, isLoading, error, refetch, removeLocal: _removeLocal, prependLocal } = useMediaList();
  // _removeLocal intentionally unused in picker, no delete affordance here.
  void _removeLocal;
  const { uploadFile, isUploading, progress } = useMediaUpload();

  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState<MediaTileItem | null>(null);
  const [alt, setAlt] = useState('');
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
      let lastUploaded: MediaTileItem | null = null;
      for (const file of arr) {
        try {
          const { path } = await uploadFile(file);
          const item: MediaTileItem = {
            path,
            name: file.name,
            url: publicMediaUrl(path),
            size: file.size,
          };
          prependLocal(item);
          lastUploaded = item;
        } catch (e) {
          setUploadError(e instanceof Error ? e.message : String(e));
        }
      }
      await refetch();
      // Auto-select the most recently uploaded file so a single click confirms.
      if (lastUploaded) setSelected(lastUploaded);
    },
    [uploadFile, prependLocal, refetch]
  );

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files?.length) void handleFiles(e.dataTransfer.files);
  };

  const handleConfirm = () => {
    if (!selected) return;
    onSelect(selected.url, alt.trim() || undefined);
    onClose();
    // Reset for the next open.
    setSelected(null);
    setAlt('');
    setFilter('');
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent className="max-w-4xl border-bronze/30 bg-parchment text-charcoal sm:rounded-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-deepblack">Choose media</DialogTitle>
          <DialogDescription className="text-mist">
            Pick an existing file or upload a new one. The public URL is inserted into the editor.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[200px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mist" />
              <Input
                type="search"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Filter by filename…"
                className="border-bronze/40 bg-parchment pl-9 text-charcoal placeholder:text-mist focus-visible:ring-bronze-warm"
              />
            </div>
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
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {(progress * 100).toFixed(0)}%
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload new
                </>
              )}
            </Button>
          </div>

          <div
            className={cn(
              'rounded-md border-2 border-dashed p-1 transition-colors',
              isDragOver ? 'border-bronze-warm bg-chalk' : 'border-transparent'
            )}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={onDrop}
          >
            <div className="max-h-[420px] min-h-[260px] overflow-y-auto rounded-sm bg-chalk/40 p-3">
              {uploadError ? (
                <div className="mb-3 rounded border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  {uploadError}
                </div>
              ) : null}
              {error ? (
                <div className="mb-3 rounded border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  {error.message}
                </div>
              ) : null}

              {isLoading && items.length === 0 ? (
                <div className="flex items-center justify-center py-10 text-mist">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading…
                </div>
              ) : filtered.length === 0 ? (
                <div className="py-10 text-center text-sm text-mist">
                  {filter
                    ? 'No files match that filter.'
                    : 'No media yet, drop a file to upload.'}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {filtered.map((item) => (
                    <MediaTile
                      key={item.path}
                      item={item}
                      selected={selected?.path === item.path}
                      onSelect={(it) => setSelected(it)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {selected ? (
            <div className="rounded-md border border-bronze/30 bg-chalk/30 px-3 py-2">
              <label
                htmlFor="media-alt"
                className="block text-[10px] font-medium uppercase tracking-wide text-mist"
              >
                Alt text (per-use, stored on the editor block)
              </label>
              <Input
                id="media-alt"
                value={alt}
                onChange={(e) => setAlt(e.target.value)}
                placeholder={selected.name}
                className="mt-1 border-bronze/40 bg-parchment text-charcoal placeholder:text-mist focus-visible:ring-bronze-warm"
              />
            </div>
          ) : null}
        </div>

        <DialogFooter className="mt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="border-bronze/40 text-charcoal hover:bg-chalk"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={!selected}
            className="bg-bronze-warm text-parchment hover:bg-bronze disabled:bg-bronze/40"
          >
            Insert
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default MediaPicker;
