import { useSiteContentDraft } from './useSiteContentDraft';
import { EditorShell, Group, TextField, TextArea } from './fields';
import ImageField from './ImageField';

export default function HomeEditor() {
  const hook = useSiteContentDraft();
  const { draft, update } = hook;
  const hero = draft.hero ?? {};
  const prelude = draft.prelude ?? {};
  const enquiry = draft.enquiry ?? {};
  const newsletter = draft.newsletter ?? {};

  return (
    <EditorShell
      title="Home"
      description="The hero, the prelude passage, and the enquiry & newsletter sections."
      hook={hook}
    >
      <Group title="Hero">
        <TextField label="Brand" value={hero.brand ?? ''} onChange={(v) => update(['hero', 'brand'], v)} />
        <TextField label="Motto" value={hero.motto ?? ''} onChange={(v) => update(['hero', 'motto'], v)} />
        <TextField label="Descriptor 1" value={hero.descriptor1 ?? ''} onChange={(v) => update(['hero', 'descriptor1'], v)} />
        <TextField label="Descriptor 2" value={hero.descriptor2 ?? ''} onChange={(v) => update(['hero', 'descriptor2'], v)} />
        <TextField label="Enter label" value={hero.enter ?? ''} onChange={(v) => update(['hero', 'enter'], v)} />
        <TextField label="Enter link (route)" value={hero.ctaTo ?? ''} onChange={(v) => update(['hero', 'ctaTo'], v)} hint="e.g. /prelude" />
        <ImageField label="Hero image" value={hero.image} onChange={(v) => update(['hero', 'image'], v)} />
        <TextField label="Hero image alt" value={hero.imageAlt ?? ''} onChange={(v) => update(['hero', 'imageAlt'], v)} />
      </Group>

      <Group title="Prelude">
        <TextArea label="Paragraph 1" value={prelude.p1 ?? ''} onChange={(v) => update(['prelude', 'p1'], v)} />
        <TextArea label="Paragraph 2" value={prelude.p2 ?? ''} onChange={(v) => update(['prelude', 'p2'], v)} />
        <TextArea label="Paragraph 3" value={prelude.p3 ?? ''} onChange={(v) => update(['prelude', 'p3'], v)} />
        <TextField label="Private label" value={prelude.private ?? ''} onChange={(v) => update(['prelude', 'private'], v)} />
        <TextArea label="Quote" value={prelude.quote ?? ''} onChange={(v) => update(['prelude', 'quote'], v)} />
        <TextField label="Closing" value={prelude.closing ?? ''} onChange={(v) => update(['prelude', 'closing'], v)} />
        <ImageField label="Prelude image" value={prelude.image} onChange={(v) => update(['prelude', 'image'], v)} />
        <TextField label="Prelude image alt" value={prelude.imageAlt ?? ''} onChange={(v) => update(['prelude', 'imageAlt'], v)} />
      </Group>

      <Group title="Enquiry">
        <TextField label="Label" value={enquiry.label ?? ''} onChange={(v) => update(['enquiry', 'label'], v)} />
        <TextField label="Title" value={enquiry.title ?? ''} onChange={(v) => update(['enquiry', 'title'], v)} />
        <TextArea label="Subtitle" value={enquiry.subtitle ?? ''} onChange={(v) => update(['enquiry', 'subtitle'], v)} />
        <TextField label="CTA" value={enquiry.cta ?? ''} onChange={(v) => update(['enquiry', 'cta'], v)} />
        <TextField label="Email" value={enquiry.email ?? ''} onChange={(v) => update(['enquiry', 'email'], v)} />
      </Group>

      <Group title="Newsletter">
        <TextField label="Label" value={newsletter.label ?? ''} onChange={(v) => update(['newsletter', 'label'], v)} />
        <TextField label="Title" value={newsletter.title ?? ''} onChange={(v) => update(['newsletter', 'title'], v)} />
        <TextArea label="Subtitle" value={newsletter.subtitle ?? ''} onChange={(v) => update(['newsletter', 'subtitle'], v)} />
        <TextField label="Placeholder" value={newsletter.placeholder ?? ''} onChange={(v) => update(['newsletter', 'placeholder'], v)} />
        <TextField label="Subscribe button" value={newsletter.subscribe ?? ''} onChange={(v) => update(['newsletter', 'subscribe'], v)} />
        <TextField label="Thanks message" value={newsletter.thanks ?? ''} onChange={(v) => update(['newsletter', 'thanks'], v)} />
        <TextArea label="Privacy note" value={newsletter.privacy ?? ''} onChange={(v) => update(['newsletter', 'privacy'], v)} />
      </Group>
    </EditorShell>
  );
}
