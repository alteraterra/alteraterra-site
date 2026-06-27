import { useSiteContentDraft } from './useSiteContentDraft';
import { EditorShell, Group, TextField, TextArea } from './fields';
import ImageField from './ImageField';
import ListEditor from './ListEditor';
import type { TeamMember, TeamPillar } from '@/content/schema';

export default function TeamEditor() {
  const hook = useSiteContentDraft();
  const { draft, update } = hook;
  const team = draft.team ?? {};

  return (
    <EditorShell
      title="Team"
      description="Section headings, the members grid, and the values pillars."
      hook={hook}
    >
      <Group title="Headings">
        <TextField label="Label" value={team.label ?? ''} onChange={(v) => update(['team', 'label'], v)} />
        <TextField label="Title" value={team.title ?? ''} onChange={(v) => update(['team', 'title'], v)} />
        <TextArea label="Subtitle" value={team.subtitle ?? ''} onChange={(v) => update(['team', 'subtitle'], v)} />
        <TextField label="View profile label" value={team.viewprofile ?? ''} onChange={(v) => update(['team', 'viewprofile'], v)} />
        <TextArea label="Quote" value={team.quote ?? ''} onChange={(v) => update(['team', 'quote'], v)} />
        <TextField label="Founded line" value={team.founded ?? ''} onChange={(v) => update(['team', 'founded'], v)} />
      </Group>

      <Group title="Members">
        <ListEditor<TeamMember>
          items={team.members ?? []}
          label="Members"
          addLabel="Add member"
          onChange={(next) => update(['team', 'members'], next)}
          newItem={() => ({ name: '', role: '', slug: '', image: '', imageAlt: '', objectPosition: 'center' })}
          renderItem={(m, _idx, set) => (
            <div className="space-y-3">
              <TextField label="Name" value={m.name ?? ''} onChange={(v) => set({ ...m, name: v })} />
              <TextField label="Role" value={m.role ?? ''} onChange={(v) => set({ ...m, role: v })} />
              <TextField label="Slug (profile route)" value={m.slug ?? ''} onChange={(v) => set({ ...m, slug: v })} hint="e.g. oscar-motta" />
              <ImageField label="Portrait" value={m.image} onChange={(v) => set({ ...m, image: v })} />
              <TextField label="Portrait alt" value={m.imageAlt ?? ''} onChange={(v) => set({ ...m, imageAlt: v })} />
              <TextField label="Object position" value={m.objectPosition ?? ''} onChange={(v) => set({ ...m, objectPosition: v })} hint="e.g. center 20%" />
            </div>
          )}
        />
      </Group>

      <Group title="Pillars">
        <ListEditor<TeamPillar>
          items={team.pillars ?? []}
          label="Pillars"
          addLabel="Add pillar"
          onChange={(next) => update(['team', 'pillars'], next)}
          newItem={() => ({ label: '', desc: '' })}
          renderItem={(p, _idx, set) => (
            <div className="space-y-3">
              <TextField label="Label" value={p.label ?? ''} onChange={(v) => set({ ...p, label: v })} />
              <TextArea label="Description" value={p.desc ?? ''} onChange={(v) => set({ ...p, desc: v })} />
            </div>
          )}
        />
      </Group>
    </EditorShell>
  );
}
