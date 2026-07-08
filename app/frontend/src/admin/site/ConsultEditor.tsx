import { useSiteContentDraft } from './useSiteContentDraft';
import { EditorShell, Group, TextField, TextArea } from './fields';
import ListEditor from './ListEditor';
import type { ConsultInterest } from '@/content/schema';

export default function ConsultEditor() {
  const hook = useSiteContentDraft();
  const { draft, update } = hook;
  const consult = draft.consult ?? {};
  const fields = consult.fields ?? {};
  const thanks = consult.thanks ?? {};

  return (
    <EditorShell
      title="Consultation"
      description="The consultation form, headings, field labels, interest options, and the thank-you note."
      hook={hook}
    >
      <Group title="Headings">
        <TextField label="Label" value={consult.label ?? ''} onChange={(v) => update(['consult', 'label'], v)} />
        <TextField label="Title" value={consult.title ?? ''} onChange={(v) => update(['consult', 'title'], v)} />
        <TextArea label="Subtitle" value={consult.subtitle ?? ''} onChange={(v) => update(['consult', 'subtitle'], v)} />
        <TextField label="Captcha question" value={consult.captchaQ ?? ''} onChange={(v) => update(['consult', 'captchaQ'], v)} hint="Keep the {a} and {b} tokens" />
      </Group>

      <Group title="Field labels">
        {Object.keys(fields).map((k) => (
          <TextField
            key={k}
            label={k}
            value={fields[k] ?? ''}
            onChange={(v) => update(['consult', 'fields', k], v)}
          />
        ))}
      </Group>

      <Group title="Interest options">
        <ListEditor<ConsultInterest>
          items={consult.interests ?? []}
          label="Interests"
          addLabel="Add interest"
          onChange={(next) => update(['consult', 'interests'], next)}
          newItem={() => ({ value: '', label: '' })}
          renderItem={(it, _idx, set) => (
            <div className="space-y-3">
              <TextField label="Value (submitted to API, change with care)" value={it.value ?? ''} onChange={(v) => set({ ...it, value: v })} />
              <TextField label="Label" value={it.label ?? ''} onChange={(v) => set({ ...it, label: v })} />
            </div>
          )}
        />
      </Group>

      <Group title="Thank-you note">
        <TextField label="Title" value={thanks.title ?? ''} onChange={(v) => update(['consult', 'thanks', 'title'], v)} />
        <TextField label="Dear" value={thanks.dear ?? ''} onChange={(v) => update(['consult', 'thanks', 'dear'], v)} />
        <TextArea label="Paragraph 1" value={thanks.p1 ?? ''} onChange={(v) => update(['consult', 'thanks', 'p1'], v)} />
        <TextArea label="Paragraph 2" value={thanks.p2 ?? ''} onChange={(v) => update(['consult', 'thanks', 'p2'], v)} />
        <TextArea label="Paragraph 3" value={thanks.p3 ?? ''} onChange={(v) => update(['consult', 'thanks', 'p3'], v)} />
        <TextArea label="Paragraph 4" value={thanks.p4 ?? ''} onChange={(v) => update(['consult', 'thanks', 'p4'], v)} />
        <TextField label="Yours" value={thanks.yours ?? ''} onChange={(v) => update(['consult', 'thanks', 'yours'], v)} />
      </Group>
    </EditorShell>
  );
}
