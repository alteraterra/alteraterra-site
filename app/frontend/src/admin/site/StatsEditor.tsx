import { useSiteContentDraft } from './useSiteContentDraft';
import { EditorShell, Group, TextField, NumberField } from './fields';
import ListEditor from './ListEditor';
import type { StatItem } from '@/content/schema';

export default function StatsEditor() {
  const hook = useSiteContentDraft();
  const { draft, update } = hook;
  const stats = draft.stats ?? {};
  const marquee = draft.marquee ?? {};

  return (
    <EditorShell
      title="Stats & Marquee"
      description="The number band on the team page and the scrolling destinations strip."
      hook={hook}
    >
      <Group title="Stats">
        <ListEditor<StatItem>
          items={stats.items ?? []}
          label="Stat items"
          addLabel="Add stat"
          onChange={(next) => update(['stats', 'items'], next)}
          newItem={() => ({ value: 0, suffix: '', label: '' })}
          renderItem={(s, _idx, set) => (
            <div className="space-y-3">
              <NumberField label="Value" value={s.value ?? 0} onChange={(v) => set({ ...s, value: v })} />
              <TextField label="Suffix" value={s.suffix ?? ''} onChange={(v) => set({ ...s, suffix: v })} hint="e.g. + or %" />
              <TextField label="Label" value={s.label ?? ''} onChange={(v) => set({ ...s, label: v })} />
            </div>
          )}
        />
      </Group>

      <Group title="Destinations marquee">
        <TextField label="Aria label" value={marquee.ariaLabel ?? ''} onChange={(v) => update(['marquee', 'ariaLabel'], v)} />
        <ListEditor<string>
          items={marquee.destinations ?? []}
          label="Destinations"
          addLabel="Add destination"
          onChange={(next) => update(['marquee', 'destinations'], next)}
          newItem={() => ''}
          renderItem={(d, _idx, set) => (
            <TextField label="Name" value={d} onChange={set} />
          )}
        />
      </Group>
    </EditorShell>
  );
}
