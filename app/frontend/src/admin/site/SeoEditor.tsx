import { useSiteContentDraft } from './useSiteContentDraft';
import { EditorShell, Group, TextField, TextArea } from './fields';
import ImageField from './ImageField';

export default function SeoEditor() {
  const hook = useSiteContentDraft();
  const { draft, update } = hook;
  const seo = draft.seo ?? {};

  return (
    <EditorShell
      title="SEO"
      description="Default page title, description and social image. The index.html defaults remain the baseline for crawlers."
      hook={hook}
    >
      <Group title="Defaults">
        <TextField label="Title" value={seo.title ?? ''} onChange={(v) => update(['seo', 'title'], v)} max={60} />
        <TextArea label="Description" value={seo.description ?? ''} onChange={(v) => update(['seo', 'description'], v)} max={160} />
        <TextField label="Canonical URL" value={seo.canonical ?? ''} onChange={(v) => update(['seo', 'canonical'], v)} />
        <ImageField label="OG / social image" value={seo.ogImage} onChange={(v) => update(['seo', 'ogImage'], v)} />
        <ImageField label="JSON-LD logo" value={seo.jsonLdLogo} onChange={(v) => update(['seo', 'jsonLdLogo'], v)} />
      </Group>
    </EditorShell>
  );
}
