import { useSiteContentDraft } from './useSiteContentDraft';
import { EditorShell, Group, TextField, TextArea } from './fields';
import ImageField from './ImageField';
import ListEditor from './ListEditor';
import type { TeamMember, TeamPillar } from '@/content/schema';

/** "Oscar Motta" -> "oscar-motta"; the admin never types slugs by hand. */
const kebab = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export default function TeamEditor() {
  const hook = useSiteContentDraft();
  const { draft, update } = hook;
  const team = draft.team ?? {};

  return (
    <EditorShell
      title="Team"
      description="Section headings, the members grid, and the values pillars. Each member is one complete entry: card + bio page."
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
          addLabel="Create member"
          onChange={(next) => update(['team', 'members'], next)}
          newItem={() => ({ name: '', role: '', slug: '', image: '', imageAlt: '', objectPosition: 'center', bio: [] })}
          renderItem={(m, _idx, set) => (
            <div className="space-y-3">
              <TextField
                label="Name"
                value={m.name ?? ''}
                onChange={(v) =>
                  // Slug follows the name until it has been set some other way.
                  set({ ...m, name: v, slug: !m.slug || m.slug === kebab(m.name ?? '') ? kebab(v) : m.slug })
                }
              />
              <TextField label="Role" value={m.role ?? ''} onChange={(v) => set({ ...m, role: v })} />
              <ImageField label="Portrait" value={m.image} onChange={(v) => set({ ...m, image: v })} />
              <TextField label="Portrait alt" value={m.imageAlt ?? ''} onChange={(v) => set({ ...m, imageAlt: v })} />
              <TextField label="Object position" value={m.objectPosition ?? ''} onChange={(v) => set({ ...m, objectPosition: v })} hint="e.g. center 20%" />
              <ListEditor<string>
                items={m.bio ?? []}
                label="Bio paragraphs (profile page)"
                addLabel="Add paragraph"
                onChange={(next) => set({ ...m, bio: next })}
                newItem={() => ''}
                renderItem={(para, _i, setPara) => (
                  <textarea
                    value={para}
                    rows={3}
                    onChange={(e) => setPara(e.target.value)}
                    className="ease-luxe w-full resize-y rounded-md border border-bronze/30 bg-deepblack/40 px-3 py-2 text-[15px] leading-relaxed text-parchment outline-none transition-colors duration-300 focus:border-bronze-warm"
                  />
                )}
              />
              {m.slug && (
                <p className="font-body text-[11px] tracking-wide text-parchment/50">
                  Profile page: /team/{m.slug}
                </p>
              )}
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
