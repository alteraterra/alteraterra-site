import { useState, type ReactNode } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export interface ListEditorProps<T> {
  /** The current array. */
  items: T[];
  /** Receives the full next array on any add / remove / reorder / edit. */
  onChange: (next: T[]) => void;
  /**
   * Render one row. `set(value)` replaces the item at `idx` immutably,
   * propagating through onChange.
   */
  renderItem: (item: T, idx: number, set: (value: T) => void) => ReactNode;
  /** Factory for a blank entry appended on ADD. */
  newItem: () => T;
  /** Section / collection label, e.g. "Services". */
  label?: string;
  /** Optional label for the add button; defaults to `Add`. */
  addLabel?: string;
}

/**
 * Generic repeatable-list editor with full ADD / REMOVE (confirmed) /
 * REORDER (move up / move down) and a render-prop per row. Used across the
 * site-content editors for services, members, pillars, stats, cities, nav,
 * interests, and bio/body paragraphs.
 */
export function ListEditor<T>({
  items,
  onChange,
  renderItem,
  newItem,
  label,
  addLabel = 'Add',
}: ListEditorProps<T>) {
  const [pendingRemove, setPendingRemove] = useState<number | null>(null);

  const setAt = (idx: number, value: T) => {
    const next = items.slice();
    next[idx] = value;
    onChange(next);
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    const next = items.slice();
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  };

  const remove = (idx: number) => {
    const next = items.slice();
    next.splice(idx, 1);
    onChange(next);
    setPendingRemove(null);
  };

  const add = () => onChange([...items, newItem()]);

  return (
    <div className="space-y-3">
      {label ? (
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-parchment/45">
            {label}
          </p>
        </div>
      ) : null}

      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="rounded-md border border-dashed border-bronze/30 px-4 py-6 text-center text-sm text-parchment/45">
            No items yet.
          </p>
        ) : (
          items.map((item, idx) => (
            <div
              key={idx}
              className="rounded-md border border-bronze/25 bg-charcoal/30 p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.3em] text-parchment/45">
                  {idx + 1}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-label="Move up"
                    disabled={idx === 0}
                    onClick={() => move(idx, idx - 1)}
                    className="rounded p-1.5 text-parchment/70 transition-colors hover:bg-bronze/10 hover:text-bronze-warm disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Move down"
                    disabled={idx === items.length - 1}
                    onClick={() => move(idx, idx + 1)}
                    className="rounded p-1.5 text-parchment/70 transition-colors hover:bg-bronze/10 hover:text-bronze-warm disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Remove"
                    onClick={() => setPendingRemove(idx)}
                    className="rounded p-1.5 text-parchment/70 transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {renderItem(item, idx, (value) => setAt(idx, value))}
            </div>
          ))
        )}
      </div>

      <button
        type="button"
        onClick={add}
        className="ease-luxe inline-flex items-center gap-2 rounded-md border border-bronze/40 px-4 py-2 text-[11px] uppercase tracking-[0.25em] text-parchment transition-colors duration-300 hover:border-bronze-warm hover:text-bronze-warm"
      >
        <Plus className="h-4 w-4" /> {addLabel}
      </button>

      <AlertDialog
        open={pendingRemove !== null}
        onOpenChange={(o) => {
          if (!o) setPendingRemove(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this item?</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone once you save.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => pendingRemove !== null && remove(pendingRemove)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default ListEditor;
