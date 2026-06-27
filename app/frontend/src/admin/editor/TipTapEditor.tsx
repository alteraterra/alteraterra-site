import { useEffect, useMemo, useRef } from 'react';
import {
  useEditor,
  EditorContent,
  NodeViewWrapper,
  NodeViewContent,
  ReactNodeViewRenderer,
} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import type { NodeViewProps } from '@tiptap/react';

import type { Block } from '@/types/blog';
import {
  Callout,
  Faq,
  tipTapToBlocks,
  blocksToTipTap,
} from '@/admin/editor/extensions';
import Toolbar from '@/admin/editor/Toolbar';

type Props = {
  value: Block[];
  onChange: (blocks: Block[]) => void;
  onPickImage: () => Promise<{ src: string; alt?: string } | null>;
  placeholder?: string;
};

/* ──────────────────────────────────────────────────────────────────────────
 * NodeView: Callout (inline editing via NodeViewContent)
 * ────────────────────────────────────────────────────────────────────────── */
function CalloutView({ node, updateAttributes }: NodeViewProps) {
  const title = (node.attrs.title as string) ?? '';

  return (
    <NodeViewWrapper
      as="aside"
      className="my-8 border-l-2 border-bronze-warm bg-parchment/70 px-5 py-4 rounded-sm"
      data-type="callout"
    >
      <input
        type="text"
        value={title}
        onChange={(e) => updateAttributes({ title: e.target.value })}
        placeholder="Callout title (optional)"
        className="w-full bg-transparent border-0 outline-none italic font-display text-bronze placeholder:text-bronze/40 text-sm tracking-wide mb-2"
      />
      <NodeViewContent className="font-body text-[15px] leading-[1.85] text-charcoal/85" />
    </NodeViewWrapper>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * NodeView: FAQ (atomic node, edits attrs.items via plain inputs)
 * ────────────────────────────────────────────────────────────────────────── */
type FaqItem = { question: string; answer: string };

function FaqView({ node, updateAttributes }: NodeViewProps) {
  const items: FaqItem[] = Array.isArray(node.attrs.items)
    ? (node.attrs.items as FaqItem[])
    : [];

  const setItems = (next: FaqItem[]) => updateAttributes({ items: next });

  const updateItem = (i: number, patch: Partial<FaqItem>) => {
    const next = items.map((it, idx) => (idx === i ? { ...it, ...patch } : it));
    setItems(next);
  };

  const addItem = () =>
    setItems([...items, { question: '', answer: '' }]);

  const removeItem = (i: number) =>
    setItems(items.filter((_, idx) => idx !== i));

  return (
    <NodeViewWrapper
      as="section"
      data-type="faq"
      className="my-10 border-t border-bronze/15 pt-6"
    >
      <header className="mb-4 flex items-center gap-3">
        <span className="h-px w-6 bg-bronze-warm/60" />
        <span className="font-body text-[11px] tracking-[0.4em] uppercase text-bronze-warm">
          FAQ
        </span>
        <span className="h-px flex-1 bg-bronze-warm/20" />
      </header>

      <div className="space-y-4">
        {items.length === 0 && (
          <p className="font-body text-sm italic text-charcoal/50">
            No questions yet — add one below.
          </p>
        )}
        {items.map((item, i) => (
          <div
            key={i}
            className="border border-bronze-warm/20 rounded-sm bg-parchment/60 p-3"
          >
            <div className="flex items-start gap-2">
              <input
                type="text"
                value={item.question}
                onChange={(e) =>
                  updateItem(i, { question: e.target.value })
                }
                placeholder="Question"
                className="flex-1 bg-transparent border-0 outline-none font-display text-base text-charcoal placeholder:text-charcoal/30"
              />
              <button
                type="button"
                onClick={() => removeItem(i)}
                className="font-body text-[10px] tracking-[0.3em] uppercase text-charcoal/40 hover:text-bronze-warm transition-colors"
                aria-label={`Remove question ${i + 1}`}
              >
                Remove
              </button>
            </div>
            <textarea
              value={item.answer}
              onChange={(e) => updateItem(i, { answer: e.target.value })}
              placeholder="Answer"
              rows={3}
              className="mt-2 w-full resize-y bg-transparent border-0 outline-none font-body text-[14px] leading-[1.75] text-charcoal/80 placeholder:text-charcoal/30"
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addItem}
        className="mt-4 font-body text-[11px] tracking-[0.35em] uppercase text-bronze-warm hover:text-bronze transition-colors border-b border-bronze-warm/40 hover:border-bronze pb-0.5"
      >
        + Add Question
      </button>
    </NodeViewWrapper>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * Configured Callout + Faq extensions with React node views attached.
 * ────────────────────────────────────────────────────────────────────────── */
const CalloutWithView = Callout.extend({
  addNodeView() {
    return ReactNodeViewRenderer(CalloutView);
  },
});

const FaqWithView = Faq.extend({
  addNodeView() {
    return ReactNodeViewRenderer(FaqView);
  },
});

/* ──────────────────────────────────────────────────────────────────────────
 * Main editor component
 * ────────────────────────────────────────────────────────────────────────── */
export default function TipTapEditor({
  value,
  onChange,
  onPickImage,
  placeholder = 'Begin the story…',
}: Props) {
  // Build the initial doc once; subsequent external `value` changes are handled
  // via the effect below so we don't reset the editor on every keystroke.
  const initialDoc = useMemo(() => blocksToTipTap(value), []);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- only on mount

  // Guard so we don't loop when our own onChange flushes back.
  const internalUpdate = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Off-brand or unused — keep the editor disciplined.
        codeBlock: false,
        horizontalRule: false,
        // Keep: bold, italic, strike, paragraph, heading, blockquote, bulletList,
        // orderedList, listItem, history, hardBreak, dropcursor, gapcursor.
        heading: { levels: [2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          target: '_blank',
          class: 'text-bronze underline underline-offset-4 decoration-bronze/40',
        },
      }),
      Image.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: {
          class: 'my-8 rounded-sm w-full h-auto',
        },
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass:
          'before:content-[attr(data-placeholder)] before:float-left before:text-charcoal/30 before:italic before:pointer-events-none before:h-0',
      }),
      CalloutWithView,
      FaqWithView,
    ],
    content: initialDoc,
    editorProps: {
      attributes: {
        // The parchment reading surface — mirrors public ArticlePage type scale.
        class: [
          'tiptap-surface',
          'min-h-[420px] px-5 sm:px-8 py-8 sm:py-10',
          'bg-parchment paper-noise',
          'font-body text-[16px] leading-[1.9] text-charcoal/85',
          'focus:outline-none',
          // Headings → Cormorant, generous spacing
          '[&_h2]:font-display [&_h2]:text-2xl sm:[&_h2]:text-3xl [&_h2]:font-light',
          '[&_h2]:text-charcoal [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:leading-snug',
          '[&_h3]:font-display [&_h3]:text-xl [&_h3]:font-light',
          '[&_h3]:text-charcoal/90 [&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:tracking-wide',
          // Paragraphs
          '[&_p]:my-4 [&_p]:max-w-2xl',
          // Blockquote — bronze-warm hairline left edge
          '[&_blockquote]:border-l-2 [&_blockquote]:border-bronze-warm/70',
          '[&_blockquote]:pl-5 [&_blockquote]:my-8 [&_blockquote]:italic',
          '[&_blockquote]:font-display [&_blockquote]:text-lg [&_blockquote]:text-charcoal/80',
          // Images
          '[&_img]:rounded-sm [&_img]:my-8',
          // Lists
          '[&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6',
          '[&_li]:my-1',
          // Selection
          'selection:bg-bronze-warm/25',
        ].join(' '),
      },
    },
    onUpdate: ({ editor: ed }) => {
      internalUpdate.current = true;
      const blocks = tipTapToBlocks(ed.getJSON());
      onChange(blocks);
      // Release the guard on the next tick so external resets still work.
      queueMicrotask(() => {
        internalUpdate.current = false;
      });
    },
  });

  // External `value` change (e.g. parent loads a different post) → reset doc.
  useEffect(() => {
    if (!editor) return;
    if (internalUpdate.current) return;
    const incoming = blocksToTipTap(value);
    const current = editor.getJSON();
    // Cheap structural diff — only reset if genuinely different.
    if (JSON.stringify(incoming) !== JSON.stringify(current)) {
      editor.commands.setContent(incoming, { emitUpdate: false });
    }
  }, [value, editor]);

  return (
    <div className="rounded-sm border border-bronze-warm/25 bg-parchment shadow-sm overflow-hidden">
      <Toolbar editor={editor} onPickImage={onPickImage} />
      <EditorContent editor={editor} />
    </div>
  );
}
