import { useCallback } from 'react';
import type { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Link as LinkIcon,
  Quote,
  ImageIcon,
  Pilcrow,
  Heading2,
  Heading3,
  MessageSquare,
  HelpCircle,
} from 'lucide-react';

type Props = {
  editor: Editor | null;
  onPickImage: () => Promise<{ src: string; alt?: string } | null>;
};

function Separator() {
  return <span className="mx-1 h-5 w-px bg-bronze-warm/30" aria-hidden />;
}

function ToolButton({
  active = false,
  disabled = false,
  onClick,
  label,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={[
        'inline-flex h-8 w-8 items-center justify-center rounded-sm',
        'font-body text-xs uppercase tracking-[0.18em]',
        'transition-colors duration-200',
        active
          ? 'bg-bronze-warm/15 text-charcoal'
          : 'text-charcoal/70 hover:bg-bronze-warm/10 hover:text-charcoal',
        disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

export default function Toolbar({ editor, onPickImage }: Props) {
  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Link URL', prev ?? 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href: url, target: '_blank', rel: 'noopener noreferrer' })
      .run();
  }, [editor]);

  const insertImage = useCallback(async () => {
    if (!editor) return;
    const picked = await onPickImage();
    if (!picked) return;
    editor
      .chain()
      .focus()
      .setImage({ src: picked.src, alt: picked.alt ?? '' })
      .run();
  }, [editor, onPickImage]);

  const insertCallout = useCallback(() => {
    if (!editor) return;
    editor
      .chain()
      .focus()
      .insertContent({
        type: 'callout',
        attrs: { title: '' },
        content: [{ type: 'paragraph' }],
      })
      .run();
  }, [editor]);

  const insertFaq = useCallback(() => {
    if (!editor) return;
    editor
      .chain()
      .focus()
      .insertContent({
        type: 'faq',
        attrs: {
          items: [{ question: '', answer: '' }],
        },
      })
      .run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div
      className={[
        'sticky top-0 z-20 flex flex-wrap items-center gap-0.5 px-2 py-1.5',
        'bg-parchment/95 backdrop-blur supports-[backdrop-filter]:bg-parchment/80',
        'border-b border-bronze-warm/25 rounded-t-sm',
      ].join(' ')}
      role="toolbar"
      aria-label="Editor toolbar"
    >
      <ToolButton
        label="Paragraph"
        active={editor.isActive('paragraph')}
        onClick={() => editor.chain().focus().setParagraph().run()}
      >
        <Pilcrow className="h-4 w-4" />
      </ToolButton>
      <ToolButton
        label="Heading 2"
        active={editor.isActive('heading', { level: 2 })}
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 2 }).run()
        }
      >
        <Heading2 className="h-4 w-4" />
      </ToolButton>
      <ToolButton
        label="Heading 3"
        active={editor.isActive('heading', { level: 3 })}
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 3 }).run()
        }
      >
        <Heading3 className="h-4 w-4" />
      </ToolButton>

      <Separator />

      <ToolButton
        label="Bold"
        active={editor.isActive('bold')}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="h-4 w-4" />
      </ToolButton>
      <ToolButton
        label="Italic"
        active={editor.isActive('italic')}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="h-4 w-4" />
      </ToolButton>
      <ToolButton
        label="Link"
        active={editor.isActive('link')}
        onClick={setLink}
      >
        <LinkIcon className="h-4 w-4" />
      </ToolButton>

      <Separator />

      <ToolButton
        label="Quote"
        active={editor.isActive('blockquote')}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote className="h-4 w-4" />
      </ToolButton>
      <ToolButton label="Image" onClick={insertImage}>
        <ImageIcon className="h-4 w-4" />
      </ToolButton>

      <Separator />

      <ToolButton
        label="Callout"
        active={editor.isActive('callout')}
        onClick={insertCallout}
      >
        <MessageSquare className="h-4 w-4" />
      </ToolButton>
      <ToolButton
        label="FAQ"
        active={editor.isActive('faq')}
        onClick={insertFaq}
      >
        <HelpCircle className="h-4 w-4" />
      </ToolButton>
    </div>
  );
}
