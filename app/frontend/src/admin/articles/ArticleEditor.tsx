import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { ChevronDown, ChevronRight, Image as ImageIcon, Plus, Trash2, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import TipTapEditor from '@/admin/editor/TipTapEditor';
import { tipTapToBlocks, blocksToTipTap } from '@/admin/editor/extensions';
import { MediaPicker } from '@/admin/media/MediaPicker';
import { publicMediaUrl } from '@/lib/supabase';
import type { Block, BlogPost, BlogStatus } from '@/types/blog';

import { useArticleQuery } from './useArticleQuery';
import { useDeleteArticle, useSaveArticle } from './useArticleMutations';

type FormShape = {
  title: string;
  slug: string;
  lang: string;
  status: BlogStatus;
  scheduled_at: string;
  category: string;
  author: string;
  tags: string[];
  excerpt: string;
  cover_url: string;
  cover_alt: string;
  blocks: Block[];
  // SEO
  seo_title: string;
  seo_description: string;
  noindex: boolean;
  // GEO
  summary_for_llm: string;
  key_takeaways: { value: string }[];
  faq_blocks: { question: string; answer: string }[];
  citable_facts: { claim: string; source_url: string }[];
  schema_org_type: string;
  reading_time_minutes: number | null;
};

const SLUG_RE = /^[a-z0-9-]+$/;

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function emptyDefaults(): FormShape {
  return {
    title: '',
    slug: '',
    lang: 'en',
    status: 'draft',
    scheduled_at: '',
    category: '',
    author: '',
    tags: [],
    excerpt: '',
    cover_url: '',
    cover_alt: '',
    blocks: [],
    seo_title: '',
    seo_description: '',
    noindex: false,
    summary_for_llm: '',
    key_takeaways: [],
    faq_blocks: [],
    citable_facts: [],
    schema_org_type: 'Article',
    reading_time_minutes: null,
  };
}

function postToForm(post: BlogPost): FormShape {
  return {
    title: post.title ?? '',
    slug: post.slug ?? '',
    lang: post.lang ?? 'en',
    status: post.status ?? 'draft',
    scheduled_at: post.scheduled_at
      ? new Date(post.scheduled_at).toISOString().slice(0, 16)
      : '',
    category: post.category ?? '',
    author: post.author ?? '',
    tags: post.tags ?? [],
    excerpt: post.excerpt ?? '',
    cover_url: post.cover_url ?? '',
    cover_alt: '',
    blocks: (post.blocks as Block[]) ?? [],
    seo_title: post.seo_title ?? '',
    seo_description: post.seo_description ?? '',
    noindex: !!post.noindex,
    summary_for_llm: post.summary_for_llm ?? '',
    key_takeaways: (post.key_takeaways ?? []).map((v) => ({ value: v })),
    faq_blocks: post.faq_blocks ?? [],
    citable_facts: post.citable_facts ?? [],
    schema_org_type: post.schema_org_type ?? 'Article',
    reading_time_minutes: post.reading_time_minutes ?? null,
  };
}

function formToRow(values: FormShape) {
  return {
    title: values.title.trim(),
    slug: values.slug.trim(),
    lang: values.lang,
    status: values.status,
    scheduled_at:
      values.status === 'scheduled' && values.scheduled_at
        ? new Date(values.scheduled_at).toISOString()
        : null,
    category: values.category,
    author: values.author,
    tags: values.tags,
    excerpt: values.excerpt,
    cover_url: values.cover_url,
    blocks: values.blocks,
    seo_title: values.seo_title,
    seo_description: values.seo_description,
    noindex: values.noindex,
    summary_for_llm: values.summary_for_llm,
    key_takeaways: values.key_takeaways.map((k) => k.value).filter(Boolean),
    faq_blocks: values.faq_blocks,
    citable_facts: values.citable_facts,
    schema_org_type: values.schema_org_type,
    reading_time_minutes: values.reading_time_minutes,
  };
}

function CharCount({ value, max }: { value: string; max: number }) {
  const len = value?.length ?? 0;
  const over = len > max;
  return (
    <span className={`text-xs ${over ? 'text-red-600' : 'text-stone-500'}`}>
      {len} / {max}
    </span>
  );
}

function Section({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-md border border-stone-200 bg-[#fbf7ee]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="font-serif text-lg">{title}</span>
        {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>
      {open && <div className="space-y-4 border-t border-stone-200 p-4">{children}</div>}
    </div>
  );
}

function TagsInput({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const [draft, setDraft] = useState('');
  const add = () => {
    const t = draft.trim();
    if (!t) return;
    if (!value.includes(t)) onChange([...value, t]);
    setDraft('');
  };
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border border-stone-300 bg-white px-2 py-2">
      {value.map((t) => (
        <span
          key={t}
          className="inline-flex items-center gap-1 rounded-full bg-stone-200 px-2 py-0.5 text-xs"
        >
          {t}
          <button
            type="button"
            onClick={() => onChange(value.filter((x) => x !== t))}
            className="text-stone-500 hover:text-stone-800"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            add();
          } else if (e.key === 'Backspace' && !draft && value.length) {
            onChange(value.slice(0, -1));
          }
        }}
        placeholder="Add tag…"
        className="min-w-[120px] flex-1 bg-transparent text-sm outline-none"
      />
    </div>
  );
}

export default function ArticleEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';

  const query = useArticleQuery(isNew ? undefined : id);
  const save = useSaveArticle();
  const del = useDeleteArticle();
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormShape>({
    defaultValues: emptyDefaults(),
    mode: 'onChange',
  });

  // Load post into form
  useEffect(() => {
    if (isNew) {
      reset(emptyDefaults());
      return;
    }
    if (query.data) reset(postToForm(query.data));
  }, [isNew, query.data, reset]);

  // Auto-slug from title if slug is empty / has not been hand-edited
  const titleVal = watch('title');
  const slugVal = watch('slug');
  const [slugTouched, setSlugTouched] = useState(false);
  useEffect(() => {
    if (slugTouched) return;
    if (!slugVal && titleVal) setValue('slug', slugify(titleVal), { shouldValidate: true });
  }, [titleVal, slugVal, slugTouched, setValue]);

  const status = watch('status');
  const excerptVal = watch('excerpt') ?? '';
  const seoTitleVal = watch('seo_title') ?? '';
  const seoDescVal = watch('seo_description') ?? '';
  const summaryVal = watch('summary_for_llm') ?? '';
  const coverUrlVal = watch('cover_url');

  const takeawaysFA = useFieldArray({ control, name: 'key_takeaways' });
  const faqFA = useFieldArray({ control, name: 'faq_blocks' });
  const factsFA = useFieldArray({ control, name: 'citable_facts' });

  const initialDoc = useMemo(() => {
    if (!query.data) return blocksToTipTap([]);
    return blocksToTipTap((query.data.blocks as Block[]) ?? []);
  }, [query.data]);

  const onSubmit = (publish: boolean) =>
    handleSubmit(async (values) => {
      const row = formToRow(values);
      const payload: Record<string, unknown> = { ...row };
      if (publish) {
        payload.status = 'published';
        if (!query.data?.published_at) {
          payload.published_at = new Date().toISOString();
        }
      }
      try {
        const saved = await save.mutateAsync({
          id: isNew ? undefined : id,
          ...(payload as Partial<BlogPost>),
        });
        if (isNew && saved?.id) {
          navigate(`/admin/articles/${saved.id}`, { replace: true });
        }
      } catch {
        /* toast handled in mutation */
      }
    })();

  const onDelete = async () => {
    if (!id || isNew) return;
    try {
      await del.mutateAsync(id);
      navigate('/admin/articles', { replace: true });
    } catch {
      /* toast handled */
    }
  };

  const loading = !isNew && query.isLoading;

  return (
    <div className="min-h-screen bg-[#f5efe4] text-stone-900">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/admin/articles')}
            className="text-sm text-stone-600 hover:text-stone-900"
          >
            ← Back to articles
          </button>
          {!isNew && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this article?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This cannot be undone. The post will be removed permanently.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onDelete}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        {loading ? (
          <p className="text-stone-500">Loading…</p>
        ) : (
          <form className="space-y-6">
            {/* Title */}
            <div className="space-y-1">
              <Input
                {...register('title', { required: 'Title is required' })}
                placeholder="Untitled article"
                className="h-auto border-0 bg-transparent px-0 font-serif text-4xl tracking-tight focus-visible:ring-0"
                style={{ fontFamily: 'Cormorant Garamond, Cormorant, serif' }}
              />
              {errors.title && (
                <p className="text-xs text-red-600">{errors.title.message}</p>
              )}
            </div>

            {/* Meta grid */}
            <div className="grid grid-cols-1 gap-4 rounded-md border border-stone-200 bg-[#fbf7ee] p-4 md:grid-cols-2">
              <div className="space-y-1">
                <Label>Slug</Label>
                <Input
                  {...register('slug', {
                    required: 'Slug is required',
                    pattern: {
                      value: SLUG_RE,
                      message: 'Lowercase letters, numbers and hyphens only',
                    },
                    onChange: () => setSlugTouched(true),
                  })}
                  placeholder="my-post-slug"
                  className="bg-white"
                />
                {errors.slug && (
                  <p className="text-xs text-red-600">{errors.slug.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label>Language</Label>
                <Controller
                  control={control}
                  name="lang"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">EN</SelectItem>
                        <SelectItem value="es">ES</SelectItem>
                        <SelectItem value="it">IT</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-1">
                <Label>Status</Label>
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {status === 'scheduled' && (
                <div className="space-y-1">
                  <Label>Scheduled at</Label>
                  <Input type="datetime-local" {...register('scheduled_at')} className="bg-white" />
                </div>
              )}

              <div className="space-y-1">
                <Label>Category</Label>
                <Input {...register('category')} placeholder="Travel, Food…" className="bg-white" />
              </div>

              <div className="space-y-1">
                <Label>Author</Label>
                <Input {...register('author')} placeholder="Author name" className="bg-white" />
              </div>

              <div className="space-y-1 md:col-span-2">
                <Label>Tags</Label>
                <Controller
                  control={control}
                  name="tags"
                  render={({ field }) => (
                    <TagsInput value={field.value ?? []} onChange={field.onChange} />
                  )}
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <div className="flex items-center justify-between">
                  <Label>Excerpt</Label>
                  <CharCount value={excerptVal} max={200} />
                </div>
                <Textarea
                  rows={3}
                  {...register('excerpt', {
                    maxLength: { value: 200, message: 'Excerpt must be ≤ 200 chars' },
                  })}
                  className="bg-white"
                />
                {errors.excerpt && (
                  <p className="text-xs text-red-600">{errors.excerpt.message}</p>
                )}
              </div>
            </div>

            {/* Cover image */}
            <div className="space-y-3 rounded-md border border-stone-200 bg-[#fbf7ee] p-4">
              <Label className="font-serif text-lg">Cover image</Label>
              <div className="flex items-start gap-4">
                <div className="flex h-32 w-48 items-center justify-center overflow-hidden rounded border border-stone-300 bg-white">
                  {coverUrlVal ? (
                    <img
                      src={publicMediaUrl(coverUrlVal)}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-stone-400" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => setMediaPickerOpen(true)}>
                      {coverUrlVal ? 'Replace cover' : 'Pick cover'}
                    </Button>
                    {coverUrlVal && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setValue('cover_url', '', { shouldDirty: true })}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs">Alt text</Label>
                    <Input
                      {...register('cover_alt')}
                      placeholder="Describe the image for accessibility"
                      className="bg-white"
                    />
                  </div>
                </div>
              </div>
              <MediaPicker
                open={mediaPickerOpen}
                onOpenChange={setMediaPickerOpen}
                onSelect={(asset: { url?: string; path?: string }) => {
                  const next = asset?.url ?? asset?.path ?? '';
                  setValue('cover_url', next, { shouldDirty: true });
                  setMediaPickerOpen(false);
                }}
              />
            </div>

            {/* Body editor */}
            <div className="space-y-2 rounded-md border border-stone-200 bg-[#fbf7ee] p-4">
              <Label className="font-serif text-lg">Body</Label>
              <Controller
                control={control}
                name="blocks"
                render={({ field }) => (
                  <TipTapEditor
                    initialContent={initialDoc}
                    onChange={(doc: unknown) => {
                      const blocks = tipTapToBlocks(doc);
                      field.onChange(blocks);
                    }}
                  />
                )}
              />
            </div>

            {/* SEO panel */}
            <Section title="SEO">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label>SEO title</Label>
                  <CharCount value={seoTitleVal} max={60} />
                </div>
                <Input
                  {...register('seo_title', {
                    maxLength: { value: 60, message: 'SEO title must be ≤ 60 chars' },
                  })}
                  className="bg-white"
                />
                {errors.seo_title && (
                  <p className="text-xs text-red-600">{errors.seo_title.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label>SEO description</Label>
                  <CharCount value={seoDescVal} max={160} />
                </div>
                <Textarea
                  rows={3}
                  {...register('seo_description', {
                    maxLength: { value: 160, message: 'SEO description must be ≤ 160 chars' },
                  })}
                  className="bg-white"
                />
                {errors.seo_description && (
                  <p className="text-xs text-red-600">{errors.seo_description.message}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Controller
                  control={control}
                  name="noindex"
                  render={({ field }) => (
                    <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                  )}
                />
                <Label>noindex — exclude from search engines</Label>
              </div>
            </Section>

            {/* GEO panel */}
            <Section title="Generative engine optimization (GEO)">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label>Summary for LLM</Label>
                  <CharCount value={summaryVal} max={300} />
                </div>
                <Textarea
                  rows={4}
                  {...register('summary_for_llm', {
                    maxLength: { value: 300, message: 'Summary must be ≤ 300 chars' },
                  })}
                  className="bg-white"
                />
                {errors.summary_for_llm && (
                  <p className="text-xs text-red-600">{errors.summary_for_llm.message}</p>
                )}
              </div>

              {/* Key takeaways */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Key takeaways (5–7)</Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={takeawaysFA.fields.length >= 7}
                    onClick={() => takeawaysFA.append({ value: '' })}
                  >
                    <Plus className="mr-1 h-3 w-3" /> Add
                  </Button>
                </div>
                {takeawaysFA.fields.map((f, i) => (
                  <div key={f.id} className="flex gap-2">
                    <Input
                      {...register(`key_takeaways.${i}.value` as const)}
                      placeholder={`Takeaway ${i + 1}`}
                      className="bg-white"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => takeawaysFA.remove(i)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {takeawaysFA.fields.length > 7 && (
                  <p className="text-xs text-red-600">Maximum 7 takeaways.</p>
                )}
              </div>

              {/* FAQ blocks */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>FAQ blocks</Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => faqFA.append({ question: '', answer: '' })}
                  >
                    <Plus className="mr-1 h-3 w-3" /> Add
                  </Button>
                </div>
                {faqFA.fields.map((f, i) => (
                  <div key={f.id} className="space-y-2 rounded border border-stone-200 bg-white p-3">
                    <div className="flex items-center gap-2">
                      <Input
                        {...register(`faq_blocks.${i}.question` as const)}
                        placeholder="Question"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => faqFA.remove(i)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <Textarea
                      {...register(`faq_blocks.${i}.answer` as const)}
                      rows={2}
                      placeholder="Answer"
                    />
                  </div>
                ))}
              </div>

              {/* Citable facts */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Citable facts</Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => factsFA.append({ claim: '', source_url: '' })}
                  >
                    <Plus className="mr-1 h-3 w-3" /> Add
                  </Button>
                </div>
                {factsFA.fields.map((f, i) => (
                  <div key={f.id} className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_1fr_auto]">
                    <Input
                      {...register(`citable_facts.${i}.claim` as const)}
                      placeholder="Claim"
                      className="bg-white"
                    />
                    <Input
                      {...register(`citable_facts.${i}.source_url` as const)}
                      placeholder="https://source.example.com"
                      className="bg-white"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => factsFA.remove(i)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <Label>Schema.org type</Label>
                  <Controller
                    control={control}
                    name="schema_org_type"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Article">Article</SelectItem>
                          <SelectItem value="TravelGuide">TravelGuide</SelectItem>
                          <SelectItem value="NewsArticle">NewsArticle</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Reading time (minutes)</Label>
                  <Input
                    type="number"
                    min={0}
                    {...register('reading_time_minutes', {
                      valueAsNumber: true,
                      setValueAs: (v) => (v === '' || v === null ? null : Number(v)),
                    })}
                    className="bg-white"
                  />
                </div>
              </div>
            </Section>

            {/* Sticky save bar */}
            <div className="sticky bottom-4 flex items-center justify-end gap-2 rounded-md border border-stone-300 bg-[#fbf7ee] p-3 shadow-sm">
              <span className="mr-auto text-xs text-stone-500">
                {isDirty ? 'Unsaved changes' : 'No changes'}
              </span>
              <Button
                type="button"
                variant="outline"
                disabled={save.isPending}
                onClick={() => onSubmit(false)}
              >
                Save draft
              </Button>
              <Button
                type="button"
                disabled={save.isPending}
                onClick={() => onSubmit(true)}
              >
                Save and publish
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
