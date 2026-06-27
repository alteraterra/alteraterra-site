import { useSiteContentDraft } from './useSiteContentDraft';
import { EditorShell, Group, TextField } from './fields';
import ListEditor from './ListEditor';
import type { NavItem } from '@/content/schema';

export default function FooterEditor() {
  const hook = useSiteContentDraft();
  const { draft, update } = hook;
  const footer = draft.footer ?? {};
  const nav = draft.nav ?? {};

  return (
    <EditorShell
      title="Footer & Navigation"
      description="Footer details and the top-navigation labels. Routes are locked; only labels are editable."
      hook={hook}
    >
      <Group title="Footer">
        <ListEditor<string>
          items={footer.cities ?? []}
          label="Cities"
          addLabel="Add city"
          onChange={(next) => update(['footer', 'cities'], next)}
          newItem={() => ''}
          renderItem={(c, _idx, set) => <TextField label="City" value={c} onChange={set} />}
        />
        <TextField label="Instagram URL" value={footer.instagramUrl ?? ''} onChange={(v) => update(['footer', 'instagramUrl'], v)} />
        <TextField label="Instagram handle" value={footer.instagramHandle ?? ''} onChange={(v) => update(['footer', 'instagramHandle'], v)} />
        <TextField label="Curated-by text" value={footer.curatedby ?? ''} onChange={(v) => update(['footer', 'curatedby'], v)} />
        <TextField label="Partner URL" value={footer.partnerUrl ?? ''} onChange={(v) => update(['footer', 'partnerUrl'], v)} />
        <TextField label="Partner text" value={footer.partnerText ?? ''} onChange={(v) => update(['footer', 'partnerText'], v)} />
        <TextField label="Domain" value={footer.domain ?? ''} onChange={(v) => update(['footer', 'domain'], v)} />
        <TextField label="Rights line" value={footer.rights ?? ''} onChange={(v) => update(['footer', 'rights'], v)} hint="Keep the {year} token" />
      </Group>

      <Group title="Navigation labels">
        <ListEditor<NavItem>
          items={nav.items ?? []}
          label="Nav items"
          addLabel="Add nav item"
          onChange={(next) => update(['nav', 'items'], next)}
          newItem={() => ({ key: '', label: '', to: '' })}
          renderItem={(it, _idx, set) => (
            <div className="space-y-3">
              <TextField label="Label" value={it.label ?? ''} onChange={(v) => set({ ...it, label: v })} />
              <TextField label="Route (locked)" value={it.to ?? ''} onChange={() => {}} readOnly hint="Routing is fixed in code" />
            </div>
          )}
        />
      </Group>
    </EditorShell>
  );
}
