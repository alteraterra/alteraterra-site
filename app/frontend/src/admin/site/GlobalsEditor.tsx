import { useSiteContentDraft } from './useSiteContentDraft';
import { EditorShell, Group, TextField } from './fields';

export default function GlobalsEditor() {
  const hook = useSiteContentDraft();
  const { draft, update } = hook;
  const g = draft.globals ?? {};
  const set = (k: string) => (v: string) => update(['globals', k], v);

  return (
    <EditorShell
      title="Globals"
      description="Site-wide settings: analytics, social links, contact emails."
      hook={hook}
    >
      <Group title="Identity">
        <TextField label="Site title" value={g.siteTitle ?? ''} onChange={set('siteTitle')} />
        <TextField label="Tagline" value={g.tagline ?? ''} onChange={set('tagline')} />
        <TextField label="Site URL" value={g.siteUrl ?? ''} onChange={set('siteUrl')} />
      </Group>

      <Group title="Analytics">
        <TextField label="GA4 measurement ID" value={g.ga4Id ?? ''} onChange={set('ga4Id')} hint="e.g. G-XXXXXXXXXX" />
        <TextField label="Google site verification" value={g.gscVerification ?? ''} onChange={set('gscVerification')} />
      </Group>

      <Group title="Social">
        <TextField label="Instagram URL" value={g.instagramUrl ?? ''} onChange={set('instagramUrl')} />
        <TextField label="LinkedIn URL" value={g.linkedinUrl ?? ''} onChange={set('linkedinUrl')} />
      </Group>

      <Group title="Contact emails">
        <TextField label="Enquire email" value={g.enquireEmail ?? ''} onChange={set('enquireEmail')} />
        <TextField label="Privacy email" value={g.privacyEmail ?? ''} onChange={set('privacyEmail')} />
        <TextField label="Legal email" value={g.legalEmail ?? ''} onChange={set('legalEmail')} />
      </Group>
    </EditorShell>
  );
}
