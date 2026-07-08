/**
 * Custom TipTap node extensions for the Altera Terra blog editor.
 *
 * Exports:
 *   - Callout       : a block node with optional title + rich-text body.
 *   - Faq           : a block node holding a list of { question, answer } pairs.
 *   - tipTapToBlocks: pure adapter from TipTap JSONContent -> Block[].
 *   - blocksToTipTap: pure adapter from Block[] -> TipTap JSONContent.
 *
 * Both adapters are framework-agnostic and safe to import from a Node
 * migration script (no React, no DOM access).
 */

import { Node, mergeAttributes } from '@tiptap/core';
import type { JSONContent } from '@tiptap/core';
import type {
  Block,
  ParagraphBlock,
  HeadingBlock,
  QuoteBlock,
  ImageBlock,
  CalloutBlock,
  FaqBlock,
} from '@/types/blog';

/* ──────────────────────────────────────────────────────────────────────────
 * Callout node
 *   - block with optional `title` attribute
 *   - content: inline rich text (allow paragraphs / marks via "block+")
 *   - Render: bronze-warm left border + parchment background
 * ────────────────────────────────────────────────────────────────────────── */
export const Callout = Node.create({
  name: 'callout',
  group: 'block',
  // Allow paragraph(s) inside so the body can carry formatting.
  content: 'block+',
  defining: true,

  addAttributes() {
    return {
      title: {
        default: '',
        parseHTML: (el) => el.getAttribute('data-title') || '',
        renderHTML: (attrs) =>
          attrs.title ? { 'data-title': attrs.title as string } : {},
      },
    };
  },

  parseHTML() {
    return [{ tag: 'aside[data-type="callout"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'aside',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'callout',
        class:
          'my-8 border-l-2 border-bronze-warm bg-parchment/70 px-5 py-4 rounded-sm',
      }),
      0,
    ];
  },
});

/* ──────────────────────────────────────────────────────────────────────────
 * FAQ node
 *   - block with attribute `items`: { question, answer }[]
 *   - atomic (no inline editing of children, the NodeView handles editing
 *     by writing back to `items` via updateAttributes)
 * ────────────────────────────────────────────────────────────────────────── */
export const Faq = Node.create({
  name: 'faq',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: false,

  addAttributes() {
    return {
      items: {
        default: [] as { question: string; answer: string }[],
        parseHTML: (el) => {
          const raw = el.getAttribute('data-items');
          if (!raw) return [];
          try {
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return [];
          }
        },
        renderHTML: (attrs) => ({
          'data-items': JSON.stringify(attrs.items ?? []),
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'section[data-type="faq"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'section',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'faq',
        class: 'my-10 border-t border-bronze/15 pt-6',
      }),
    ];
  },
});

/* ──────────────────────────────────────────────────────────────────────────
 * Adapters
 *
 * The editor's source of truth is the Block[] array.  These two functions
 * round-trip between Block[] and TipTap's JSONContent doc.  Keep them pure
 *, the migration script imports them directly.
 * ────────────────────────────────────────────────────────────────────────── */

/** Inline node → minimal HTML string (no external libs, server-safe). */
function inlineNodeToHTML(node: JSONContent): string {
  if (!node) return '';

  if (node.type === 'text') {
    let out = escapeHTML(node.text ?? '');
    const marks = node.marks ?? [];
    for (const m of marks) {
      switch (m.type) {
        case 'bold':
          out = `<strong>${out}</strong>`;
          break;
        case 'italic':
          out = `<em>${out}</em>`;
          break;
        case 'underline':
          out = `<u>${out}</u>`;
          break;
        case 'strike':
          out = `<s>${out}</s>`;
          break;
        case 'code':
          out = `<code>${out}</code>`;
          break;
        case 'link': {
          const href = (m.attrs?.href as string) || '#';
          const target = (m.attrs?.target as string) || '_blank';
          const rel = (m.attrs?.rel as string) || 'noopener noreferrer';
          out = `<a href="${escapeAttr(href)}" target="${escapeAttr(
            target,
          )}" rel="${escapeAttr(rel)}">${out}</a>`;
          break;
        }
        default:
          break;
      }
    }
    return out;
  }

  if (node.type === 'hardBreak') return '<br />';

  // Generic fall-through: serialise children.
  return (node.content ?? []).map(inlineNodeToHTML).join('');
}

/** Serialise the `content` array of a block as inline HTML. */
function inlineChildrenToHTML(children: JSONContent[] | undefined): string {
  if (!children || children.length === 0) return '';
  return children.map(inlineNodeToHTML).join('');
}

/** Flatten a node tree to plain text (used for headings, quotes, etc.). */
function nodeToPlainText(node: JSONContent | undefined): string {
  if (!node) return '';
  if (node.type === 'text') return node.text ?? '';
  if (node.type === 'hardBreak') return '\n';
  return (node.content ?? []).map(nodeToPlainText).join('');
}

function escapeHTML(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(s: string): string {
  return s.replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

/**
 * Convert a TipTap doc (JSONContent root) into the Block[] schema.
 * Unknown nodes are dropped silently.
 */
export function tipTapToBlocks(doc: JSONContent | null | undefined): Block[] {
  if (!doc || !Array.isArray(doc.content)) return [];
  const blocks: Block[] = [];

  for (const node of doc.content) {
    switch (node.type) {
      case 'paragraph': {
        const html = inlineChildrenToHTML(node.content);
        // Skip empty paragraphs at the boundary; keep otherwise so users can
        // intentionally add breathing room.
        const block: ParagraphBlock = { type: 'paragraph', html };
        blocks.push(block);
        break;
      }
      case 'heading': {
        const lvl = node.attrs?.level;
        const level: 2 | 3 = lvl === 3 ? 3 : 2;
        const block: HeadingBlock = {
          type: 'heading',
          level,
          text: nodeToPlainText(node),
        };
        blocks.push(block);
        break;
      }
      case 'blockquote': {
        // First paragraph = quote text; an optional <cite> child or
        // <p class="attribution"> becomes the attribution.
        const paragraphs = (node.content ?? []).filter(
          (c) => c.type === 'paragraph',
        );
        const text = nodeToPlainText(paragraphs[0]);
        let attribution: string | undefined;
        if (paragraphs.length > 1) {
          attribution = nodeToPlainText(paragraphs[paragraphs.length - 1]);
        }
        const block: QuoteBlock = attribution
          ? { type: 'quote', text, attribution }
          : { type: 'quote', text };
        blocks.push(block);
        break;
      }
      case 'image': {
        const src = (node.attrs?.src as string) || '';
        if (!src) break;
        const alt = (node.attrs?.alt as string) || undefined;
        const caption = (node.attrs?.title as string) || undefined;
        const block: ImageBlock = { type: 'image', src };
        if (alt) block.alt = alt;
        if (caption) block.caption = caption;
        blocks.push(block);
        break;
      }
      case 'callout': {
        const title = (node.attrs?.title as string) || undefined;
        // The body is the children's inline+paragraph HTML serialised.
        const html = (node.content ?? [])
          .map((child) => {
            if (child.type === 'paragraph') {
              return `<p>${inlineChildrenToHTML(child.content)}</p>`;
            }
            return inlineNodeToHTML(child);
          })
          .join('');
        const block: CalloutBlock = title
          ? { type: 'callout', title, html }
          : { type: 'callout', html };
        blocks.push(block);
        break;
      }
      case 'faq': {
        const raw = node.attrs?.items;
        const items: { question: string; answer: string }[] = Array.isArray(raw)
          ? raw
              .filter((it): it is { question: string; answer: string } =>
                Boolean(it && typeof it === 'object'),
              )
              .map((it) => ({
                question: String(it.question ?? ''),
                answer: String(it.answer ?? ''),
              }))
          : [];
        const block: FaqBlock = { type: 'faq', items };
        blocks.push(block);
        break;
      }
      default:
        // Unknown block, ignore.
        break;
    }
  }

  return blocks;
}

/**
 * Convert the Block[] schema back into a TipTap JSON document.
 * HTML inside paragraph/callout blocks is parsed conservatively into
 * text + simple marks (bold/italic/link).  We deliberately keep this
 * tolerant rather than perfect, round-tripping through the editor will
 * normalise anything weird.
 */
export function blocksToTipTap(blocks: Block[] | null | undefined): JSONContent {
  const content: JSONContent[] = [];
  if (!blocks || blocks.length === 0) {
    return { type: 'doc', content: [{ type: 'paragraph' }] };
  }

  for (const block of blocks) {
    switch (block.type) {
      case 'paragraph':
        content.push({
          type: 'paragraph',
          content: htmlToInlineNodes(block.html),
        });
        break;
      case 'heading':
        content.push({
          type: 'heading',
          attrs: { level: block.level },
          content: block.text ? [{ type: 'text', text: block.text }] : [],
        });
        break;
      case 'quote': {
        const paras: JSONContent[] = [
          {
            type: 'paragraph',
            content: block.text ? [{ type: 'text', text: block.text }] : [],
          },
        ];
        if (block.attribution) {
          paras.push({
            type: 'paragraph',
            content: [{ type: 'text', text: block.attribution }],
          });
        }
        content.push({ type: 'blockquote', content: paras });
        break;
      }
      case 'image':
        content.push({
          type: 'image',
          attrs: {
            src: block.src,
            alt: block.alt ?? null,
            title: block.caption ?? null,
          },
        });
        break;
      case 'callout': {
        const body = htmlToBlockNodes(block.html);
        content.push({
          type: 'callout',
          attrs: { title: block.title ?? '' },
          content: body.length > 0 ? body : [{ type: 'paragraph' }],
        });
        break;
      }
      case 'faq':
        content.push({
          type: 'faq',
          attrs: { items: block.items ?? [] },
        });
        break;
      default:
        break;
    }
  }

  return { type: 'doc', content };
}

/* ──────────────────────────────────────────────────────────────────────────
 * Lightweight HTML -> inline-node parser
 *
 * Handles the subset of HTML we actually emit: <strong>/<b>, <em>/<i>,
 * <u>, <s>, <a href>, <br>, and plain text.  Anything else collapses to
 * its text content.  Server-safe (no DOMParser).
 * ────────────────────────────────────────────────────────────────────────── */

type Mark = { type: string; attrs?: Record<string, unknown> };

const TAG_TO_MARK: Record<string, string> = {
  strong: 'bold',
  b: 'bold',
  em: 'italic',
  i: 'italic',
  u: 'underline',
  s: 'strike',
  strike: 'strike',
  code: 'code',
};

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

/** Parse a single HTML attribute string (`href="x" target="y"`). */
function parseAttrs(attrStr: string): Record<string, string> {
  const out: Record<string, string> = {};
  const re = /(\w[\w-]*)\s*=\s*"([^"]*)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(attrStr)) !== null) out[m[1]] = decodeEntities(m[2]);
  return out;
}

/**
 * Parse an HTML fragment containing only inline tags into TipTap inline
 * nodes.  Block-level tags inside the string are treated as transparent
 * (their inner content is included; their tag is dropped).
 */
function htmlToInlineNodes(html: string): JSONContent[] {
  if (!html) return [];
  const tokens = tokenize(html);
  const nodes: JSONContent[] = [];
  const markStack: Mark[] = [];

  const pushText = (text: string) => {
    if (!text) return;
    const node: JSONContent = { type: 'text', text };
    if (markStack.length > 0) {
      node.marks = markStack.map((m) => ({
        type: m.type,
        attrs: m.attrs,
      })) as JSONContent['marks'];
    }
    nodes.push(node);
  };

  for (const tok of tokens) {
    if (tok.kind === 'text') {
      pushText(decodeEntities(tok.value));
      continue;
    }

    const tag = tok.tag.toLowerCase();

    if (tag === 'br') {
      nodes.push({ type: 'hardBreak' });
      continue;
    }

    // Block tags inside an inline fragment: ignore the tag wrapper itself,
    // its content is already inline-tokenised in-line.
    if (['p', 'div', 'section', 'article', 'aside'].includes(tag)) continue;

    if (tok.kind === 'open') {
      if (tag === 'a') {
        const attrs = parseAttrs(tok.attrs);
        markStack.push({
          type: 'link',
          attrs: {
            href: attrs.href ?? '#',
            target: attrs.target ?? '_blank',
            rel: attrs.rel ?? 'noopener noreferrer',
          },
        });
      } else if (TAG_TO_MARK[tag]) {
        markStack.push({ type: TAG_TO_MARK[tag] });
      }
    } else if (tok.kind === 'close') {
      // Pop the most recent matching mark.
      const wanted = tag === 'a' ? 'link' : TAG_TO_MARK[tag];
      if (!wanted) continue;
      for (let i = markStack.length - 1; i >= 0; i--) {
        if (markStack[i].type === wanted) {
          markStack.splice(i, 1);
          break;
        }
      }
    }
  }

  return nodes;
}

/**
 * Parse an HTML fragment that may contain block-level <p> elements into
 * an array of TipTap paragraph nodes (used for callout bodies).  Falls
 * back to a single paragraph if no <p> wrappers are present.
 */
function htmlToBlockNodes(html: string): JSONContent[] {
  if (!html) return [];
  const trimmed = html.trim();
  // Naive split on <p>…</p>; anything outside <p> tags is wrapped.
  const paraMatches = [...trimmed.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)];
  if (paraMatches.length === 0) {
    return [{ type: 'paragraph', content: htmlToInlineNodes(trimmed) }];
  }
  return paraMatches.map((m) => ({
    type: 'paragraph',
    content: htmlToInlineNodes(m[1]),
  }));
}

/* ── Tiny HTML tokenizer ─────────────────────────────────────────────── */

type Token =
  | { kind: 'text'; value: string }
  | { kind: 'open'; tag: string; attrs: string }
  | { kind: 'close'; tag: string }
  | { kind: 'self'; tag: string; attrs: string };

function tokenize(html: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < html.length) {
    if (html[i] === '<') {
      const end = html.indexOf('>', i);
      if (end === -1) {
        tokens.push({ kind: 'text', value: html.slice(i) });
        break;
      }
      const raw = html.slice(i + 1, end).trim();
      if (raw.startsWith('/')) {
        tokens.push({ kind: 'close', tag: raw.slice(1).trim() });
      } else if (raw.endsWith('/')) {
        const inner = raw.slice(0, -1).trim();
        const sp = inner.indexOf(' ');
        const tag = sp === -1 ? inner : inner.slice(0, sp);
        const attrs = sp === -1 ? '' : inner.slice(sp + 1);
        tokens.push({ kind: 'self', tag, attrs });
      } else {
        const sp = raw.indexOf(' ');
        const tag = sp === -1 ? raw : raw.slice(0, sp);
        const attrs = sp === -1 ? '' : raw.slice(sp + 1);
        tokens.push({ kind: 'open', tag, attrs });
      }
      i = end + 1;
    } else {
      const next = html.indexOf('<', i);
      const stop = next === -1 ? html.length : next;
      tokens.push({ kind: 'text', value: html.slice(i, stop) });
      i = stop;
    }
  }
  return tokens;
}
