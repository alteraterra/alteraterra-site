import { useSiteContentDraft } from './useSiteContentDraft';
import { EditorShell, Group, TextField, TextArea } from './fields';
import ImageField from './ImageField';
import ListEditor from './ListEditor';
import type { HouseService } from '@/content/schema';

export default function HouseEditor() {
  const hook = useSiteContentDraft();
  const { draft, update } = hook;
  const house = draft.house ?? {};
  const services = house.services ?? [];

  return (
    <EditorShell
      title="The House"
      description="Section heading and the list of services. Add, remove or reorder freely."
      hook={hook}
    >
      <Group title="Heading">
        <TextField label="Label" value={house.label ?? ''} onChange={(v) => update(['house', 'label'], v)} />
        <TextField label="Title" value={house.title ?? ''} onChange={(v) => update(['house', 'title'], v)} />
        <TextArea label="Subtitle" value={house.subtitle ?? ''} onChange={(v) => update(['house', 'subtitle'], v)} />
      </Group>

      <Group title="Services">
        <ListEditor<HouseService>
          items={services}
          label="Services"
          addLabel="Add service"
          onChange={(next) => update(['house', 'services'], next)}
          newItem={() => ({ title: '', desc: '', image: '', imageAlt: '' })}
          renderItem={(svc, _idx, set) => (
            <div className="space-y-3">
              <TextField label="Title" value={svc.title ?? ''} onChange={(v) => set({ ...svc, title: v })} />
              <TextArea label="Description" value={svc.desc ?? ''} onChange={(v) => set({ ...svc, desc: v })} />
              <ImageField label="Image" value={svc.image} onChange={(v) => set({ ...svc, image: v })} />
              <TextField label="Image alt" value={svc.imageAlt ?? ''} onChange={(v) => set({ ...svc, imageAlt: v })} />
            </div>
          )}
        />
      </Group>
    </EditorShell>
  );
}
