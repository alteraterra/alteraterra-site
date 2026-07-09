import { useState } from 'react';
import { useSiteContentDraft } from './useSiteContentDraft';
import { EditorShell, Group, TextField } from './fields';
import ImageField from './ImageField';
import ListEditor from './ListEditor';
import type { ProfileContent } from '@/content/schema';

export default function ProfilesEditor() {
  const hook = useSiteContentDraft();
  const { draft, update } = hook;
  const profiles = draft.profiles ?? {};
  const slugs = Object.keys(profiles);
  const [newSlug, setNewSlug] = useState('');

  const addProfile = () => {
    const slug = newSlug.trim();
    if (!slug || profiles[slug]) return;
    update(['profiles', slug], { name: '', role: '', bio: [], image: '', imageAlt: '', objectPosition: 'center' });
    setNewSlug('');
  };

  const removeProfile = (slug: string) => {
    // ponytail: native confirm; the styled AlertDialog isn't worth the wiring for an admin-only action
    if (!window.confirm(`Remove the "${slug}" profile? Its bio page at /team/${slug} will stop resolving.`)) return;
    const { [slug]: _removed, ...rest } = profiles;
    update(['profiles'], rest);
  };

  return (
    <EditorShell
      title="Profiles"
      description="Individual team-member bio pages, keyed by slug (e.g. /team/oscar-motta)."
      hook={hook}
    >
      {slugs.map((slug) => {
        const p: ProfileContent = profiles[slug] ?? {};
        return (
          <Group key={slug} title={slug}>
            <TextField label="Name" value={p.name ?? ''} onChange={(v) => update(['profiles', slug, 'name'], v)} />
            <TextField label="Role" value={p.role ?? ''} onChange={(v) => update(['profiles', slug, 'role'], v)} />
            <ImageField label="Portrait" value={p.image} onChange={(v) => update(['profiles', slug, 'image'], v)} />
            <TextField label="Portrait alt" value={p.imageAlt ?? ''} onChange={(v) => update(['profiles', slug, 'imageAlt'], v)} />
            <TextField label="Object position" value={p.objectPosition ?? ''} onChange={(v) => update(['profiles', slug, 'objectPosition'], v)} />
            <ListEditor<string>
              items={p.bio ?? []}
              label="Bio paragraphs"
              addLabel="Add paragraph"
              onChange={(next) => update(['profiles', slug, 'bio'], next)}
              newItem={() => ''}
              renderItem={(para, _idx, set) => (
                <textarea
                  value={para}
                  rows={3}
                  onChange={(e) => set(e.target.value)}
                  className="ease-luxe w-full resize-y rounded-md border border-bronze/30 bg-deepblack/40 px-3 py-2 text-[15px] leading-relaxed text-parchment outline-none transition-colors duration-300 focus:border-bronze-warm"
                />
              )}
            />
            <button
              type="button"
              onClick={() => removeProfile(slug)}
              className="ease-luxe rounded-md border border-red-400/40 px-4 py-2 text-[11px] uppercase tracking-[0.25em] text-red-300/90 transition-colors duration-300 hover:border-red-400 hover:text-red-300"
            >
              Remove profile
            </button>
          </Group>
        );
      })}

      <Group title="Add a profile">
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <TextField label="New slug" value={newSlug} onChange={setNewSlug} hint="e.g. jane-doe" />
          </div>
          <button
            type="button"
            onClick={addProfile}
            className="ease-luxe mb-6 rounded-md border border-bronze/40 px-5 py-2 text-[11px] uppercase tracking-[0.25em] text-parchment transition-colors duration-300 hover:border-bronze-warm hover:text-bronze-warm"
          >
            Add
          </button>
        </div>
      </Group>
    </EditorShell>
  );
}
