export type BlogStatus = 'draft' | 'scheduled' | 'published';
export type BlockType = 'paragraph' | 'heading' | 'quote' | 'image' | 'callout' | 'faq';

export interface BaseBlock { type: BlockType }
export interface ParagraphBlock extends BaseBlock { type: 'paragraph'; html: string }
export interface HeadingBlock extends BaseBlock { type: 'heading'; level: 2 | 3; text: string }
export interface QuoteBlock extends BaseBlock { type: 'quote'; text: string; attribution?: string }
export interface ImageBlock extends BaseBlock { type: 'image'; src: string; alt?: string; caption?: string }
export interface CalloutBlock extends BaseBlock { type: 'callout'; title?: string; html: string }
export interface FaqBlock extends BaseBlock { type: 'faq'; items: { question: string; answer: string }[] }
export type Block = ParagraphBlock | HeadingBlock | QuoteBlock | ImageBlock | CalloutBlock | FaqBlock;

export interface BlogPost {
  id: string;
  slug: string;
  lang: string;
  status: BlogStatus;
  title: string;
  excerpt: string;
  cover_url: string;
  tags: string[];
  author: string;
  blocks: Block[];
  seo_title: string;
  seo_description: string;
  category: string;
  reading_time_minutes: number | null;
  summary_for_llm: string;
  key_takeaways: string[];
  faq_blocks: { question: string; answer: string }[];
  citable_facts: { claim: string; source_url: string }[];
  schema_org_type: string;
  noindex: boolean;
  published_at: string | null;
  scheduled_at: string | null;
  created_at: string;
  updated_at: string;
}
