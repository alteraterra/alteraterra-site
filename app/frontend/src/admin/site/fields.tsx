import { type ReactNode } from 'react';
import type { UseSiteContentDraft } from './useSiteContentDraft';

/**
 * Shared UI primitives for the site-content editors. Keeps every editor short
 * and visually consistent with the rest of the atelier admin.
 */

export function EditorShell({
  title,
  description,
  hook,
  children,
}: {
  title: string;
  description?: string;
  hook: UseSiteContentDraft;
  children: ReactNode;
}) {
  const { dirty, saving, loading, save } = hook;
  return (
    <div className="max-w-3xl pb-24">
      <header className="mb-10 flex items-start justify-between gap-6">
        <div>
          <h1 className="font-display text-3xl text-charcoal">{title}</h1>
          {description ? (
            <p className="mt-2 text-sm leading-relaxed text-charcoal/60">
              {description}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => void save()}
          disabled={!dirty || saving}
          className="ease-luxe shrink-0 rounded-md border border-bronze/50 px-6 py-3 text-[11px] uppercase tracking-[0.3em] text-charcoal transition-colors duration-300 hover:border-bronze-warm hover:bg-bronze-warm hover:text-deepblack disabled:cursor-not-allowed disabled:opacity-30"
        >
          {saving ? 'Saving…' : dirty ? 'Save' : 'Saved'}
        </button>
      </header>

      {loading ? (
        <p className="text-sm text-mist">Loading…</p>
      ) : (
        <div className="space-y-8">{children}</div>
      )}
    </div>
  );
}

export function Group({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="space-y-4 rounded-md border border-bronze/20 bg-chalk/20 p-6">
      {title ? (
        <h2 className="font-display text-lg text-charcoal/90">{title}</h2>
      ) : null}
      {children}
    </section>
  );
}

const labelCls =
  'block text-[10px] font-medium uppercase tracking-[0.3em] text-mist mb-2';
const inputCls =
  'ease-luxe w-full rounded-md border border-bronze/30 bg-parchment/60 px-3 py-2 text-[15px] text-charcoal outline-none transition-colors duration-300 focus:border-bronze-warm';

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  max,
  hint,
  readOnly,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  max?: number;
  hint?: string;
  readOnly?: boolean;
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <input
        type="text"
        value={value}
        readOnly={readOnly}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputCls} ${readOnly ? 'opacity-60' : ''}`}
      />
      <div className="mt-1 flex justify-between">
        {hint ? <span className="text-[11px] text-mist">{hint}</span> : <span />}
        {max ? (
          <span
            className={`text-[11px] ${value.length > max ? 'text-destructive' : 'text-mist'}`}
          >
            {value.length}/{max}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <input
        type="number"
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(Number(e.target.value))}
        className={inputCls}
      />
    </div>
  );
}

export function TextArea({
  label,
  value,
  onChange,
  rows = 4,
  max,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  max?: number;
  hint?: string;
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <textarea
        value={value}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputCls} resize-y leading-relaxed`}
      />
      <div className="mt-1 flex justify-between">
        {hint ? <span className="text-[11px] text-mist">{hint}</span> : <span />}
        {max ? (
          <span
            className={`text-[11px] ${value.length > max ? 'text-destructive' : 'text-mist'}`}
          >
            {value.length}/{max}
          </span>
        ) : null}
      </div>
    </div>
  );
}
