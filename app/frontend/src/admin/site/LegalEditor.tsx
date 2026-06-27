import { useSiteContentDraft } from './useSiteContentDraft';
import { EditorShell, Group, TextField, TextArea } from './fields';
import ListEditor from './ListEditor';
import type { LegalSection } from '@/content/schema';

function SectionFields({
  data,
  onField,
  onBody,
}: {
  data: LegalSection;
  onField: (k: keyof LegalSection, v: string) => void;
  onBody: (next: string[]) => void;
}) {
  return (
    <div className="space-y-3">
      <TextField label="Eyebrow" value={data.eyebrow ?? ''} onChange={(v) => onField('eyebrow', v)} />
      <TextField label="Title" value={data.title ?? ''} onChange={(v) => onField('title', v)} />
      <TextField label="Email" value={data.email ?? ''} onChange={(v) => onField('email', v)} />
      <ListEditor<string>
        items={data.body ?? []}
        label="Body paragraphs"
        addLabel="Add paragraph"
        onChange={onBody}
        newItem={() => ''}
        renderItem={(para, _idx, set) => (
          <textarea
            value={para}
            rows={4}
            onChange={(e) => set(e.target.value)}
            className="ease-luxe w-full resize-y rounded-md border border-bronze/30 bg-parchment/60 px-3 py-2 text-[15px] leading-relaxed text-charcoal outline-none transition-colors duration-300 focus:border-bronze-warm"
          />
        )}
      />
    </div>
  );
}

export default function LegalEditor() {
  const hook = useSiteContentDraft();
  const { draft, update } = hook;
  const legal = draft.legal ?? {};

  return (
    <EditorShell
      title="Legal"
      description="Privacy & terms copy. These edits are legally significant — review carefully."
      hook={hook}
    >
      <Group title="Shared">
        <TextField label="Last reviewed" value={legal.lastReviewed ?? ''} onChange={(v) => update(['legal', 'lastReviewed'], v)} hint="e.g. May 2026" />
        <TextArea label="Intro (both pages)" value={legal.intro ?? ''} onChange={(v) => update(['legal', 'intro'], v)} />
      </Group>

      <Group title="Privacy Notice">
        <SectionFields
          data={legal.privacy ?? {}}
          onField={(k, v) => update(['legal', 'privacy', k], v)}
          onBody={(next) => update(['legal', 'privacy', 'body'], next)}
        />
      </Group>

      <Group title="Terms of Engagement">
        <SectionFields
          data={legal.terms ?? {}}
          onField={(k, v) => update(['legal', 'terms', k], v)}
          onBody={(next) => update(['legal', 'terms', 'body'], next)}
        />
      </Group>
    </EditorShell>
  );
}
