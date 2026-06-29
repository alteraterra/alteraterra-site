import { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { MediaPicker } from '@/admin/media/MediaPicker';
import { publicMediaUrl } from '@/lib/supabase';

export interface ImageFieldProps {
  /** Current image URL (or storage path). Empty when unset. */
  value?: string;
  /** Called with the newly chosen public URL. */
  onChange: (url: string) => void;
  /** Field label rendered above the control. */
  label?: string;
}

/**
 * Thin wrapper over the shared MediaPicker for site-content image fields.
 * Shows a thumbnail (or placeholder) plus a Change / Add image button that
 * opens the picker; on select it hands the public URL back via onChange.
 */
export function ImageField({ value, onChange, label }: ImageFieldProps) {
  const [open, setOpen] = useState(false);
  const hasImage = Boolean(value);

  return (
    <div className="space-y-2">
      {label ? (
        <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-parchment/45">
          {label}
        </p>
      ) : null}
      <div className="flex items-start gap-4">
        <div className="flex h-24 w-32 items-center justify-center overflow-hidden rounded-md border border-bronze/30 bg-charcoal/40">
          {hasImage ? (
            <img
              src={publicMediaUrl(value as string)}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <ImageIcon className="h-7 w-7 text-bronze/50" />
          )}
        </div>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="ease-luxe rounded-md border border-bronze/40 px-4 py-2 text-[11px] uppercase tracking-[0.25em] text-parchment transition-colors duration-300 hover:border-bronze-warm hover:text-bronze-warm"
          >
            {hasImage ? 'Change' : 'Add image'}
          </button>
          {hasImage ? (
            <button
              type="button"
              onClick={() => onChange('')}
              className="ease-luxe text-[11px] uppercase tracking-[0.25em] text-parchment/45 transition-colors duration-300 hover:text-destructive"
            >
              Remove
            </button>
          ) : null}
        </div>
      </div>

      <MediaPicker
        open={open}
        onClose={() => setOpen(false)}
        onSelect={(url) => onChange(url)}
      />
    </div>
  );
}

export default ImageField;
