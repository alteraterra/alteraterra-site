import { useState } from 'react';
import { Copy, Check, Trash2, ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MediaTileItem {
  /** Storage path inside the `media` bucket. */
  path: string;
  /** Display filename (basename). */
  name: string;
  /** Public URL — already resolved via publicMediaUrl(). */
  url: string;
  /** Size in bytes if known. */
  size?: number;
  /** Image natural dimensions if probed. */
  width?: number;
  height?: number;
}

export interface MediaTileProps {
  item: MediaTileItem;
  /** Click → select (used by picker). When provided, the tile is selectable. */
  onSelect?: (item: MediaTileItem) => void;
  /** Delete button handler. When omitted, the trash icon is hidden. */
  onDelete?: (item: MediaTileItem) => void;
  /** Marks the tile as the currently selected one (picker). */
  selected?: boolean;
  className?: string;
}

function isImagePath(p: string): boolean {
  return /\.(png|jpe?g|gif|webp|avif|svg|bmp)$/i.test(p);
}

function formatBytes(n?: number): string {
  if (!n && n !== 0) return '';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

/**
 * Shared tile used by MediaLibrary and MediaPicker. Parchment surface,
 * bronze-warm hover. Holds the thumbnail, filename, dims, copy + delete.
 */
export function MediaTile({ item, onSelect, onDelete, selected, className }: MediaTileProps) {
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);
  const isImage = isImagePath(item.path);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(item.url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      /* no-op */
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(item);
  };

  const handleActivate = () => {
    onSelect?.(item);
  };

  const interactive = Boolean(onSelect);

  return (
    <div
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-md border border-bronze/30 bg-parchment text-charcoal shadow-sm transition-all',
        'hover:border-bronze-warm hover:shadow-md',
        selected && 'ring-2 ring-bronze-warm ring-offset-2 ring-offset-parchment',
        interactive && 'cursor-pointer',
        className
      )}
      onClick={interactive ? handleActivate : undefined}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleActivate();
              }
            }
          : undefined
      }
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-pressed={interactive ? selected : undefined}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-chalk">
        {isImage && !imgError ? (
          <img
            src={item.url}
            alt={item.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-mist">
            <ImageOff className="h-8 w-8" />
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-end gap-1 bg-gradient-to-t from-deepblack/60 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            onClick={handleCopy}
            className="pointer-events-auto inline-flex h-8 w-8 items-center justify-center rounded bg-parchment/95 text-charcoal shadow-sm transition-colors hover:bg-bronze-warm hover:text-parchment"
            aria-label={copied ? 'URL copied' : 'Copy public URL'}
            title={copied ? 'Copied' : 'Copy URL'}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
          {onDelete ? (
            <button
              type="button"
              onClick={handleDelete}
              className="pointer-events-auto inline-flex h-8 w-8 items-center justify-center rounded bg-parchment/95 text-charcoal shadow-sm transition-colors hover:bg-destructive hover:text-destructive-foreground"
              aria-label="Delete"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-0.5 px-3 py-2">
        <div className="truncate font-body text-xs text-charcoal" title={item.name}>
          {item.name}
        </div>
        <div className="flex items-center justify-between text-[10px] uppercase tracking-wide text-mist">
          <span>
            {item.width && item.height ? `${item.width}×${item.height}` : '—'}
          </span>
          <span>{formatBytes(item.size)}</span>
        </div>
      </div>
    </div>
  );
}

export default MediaTile;
