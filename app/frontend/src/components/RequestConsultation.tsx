import { useEffect, useId, useRef, useState, useMemo } from 'react';
import { client } from '@/lib/api';
import { useLanguage } from '@/i18n/LanguageContext';
import { useContent } from '@/content/SiteContentContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function RequestConsultation() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { t } = useLanguage();
  const { text, section } = useContent();

  // Interests: CMS-driven (value locked, label editable) with hardcoded fallback.
  const interestFallback = [
    { value: 'curated-journeys', label: t('consult.interest.journeys') },
    { value: 'private-access', label: t('consult.interest.access') },
    { value: 'cultural-immersion', label: t('consult.interest.cultural') },
    { value: 'lifestyle-curation', label: t('consult.interest.lifestyle') },
    { value: 'other', label: t('consult.interest.other') },
  ];
  const interestsRaw = section('consult')?.interests;
  const interests =
    interestsRaw && interestsRaw.length > 0
      ? interestsRaw.map((it, i) => ({
          value: it.value ?? interestFallback[i]?.value ?? '',
          label: it.label ?? interestFallback[i]?.label ?? '',
        }))
      : interestFallback;

  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [areaOfInterest, setAreaOfInterest] = useState('');
  const [message, setMessage] = useState('');

  // Field-level validation state — used only to drive aria-invalid on submit.
  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string;
    email?: string;
    areaOfInterest?: string;
    message?: string;
  }>({});

  // CAPTCHA state
  const captcha = useMemo(() => {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    return { a, b, answer: a + b };
  }, []);
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaError, setCaptchaError] = useState(false);

  // Stable ids for label/error association
  const nameId = useId();
  const nameErrId = useId();
  const emailId = useId();
  const emailErrId = useId();
  const phoneId = useId();
  const interestId = useId();
  const interestErrId = useId();
  const messageId = useId();
  const messageErrId = useId();
  const captchaId = useId();
  const captchaErrId = useId();
  const formErrId = useId();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    const nextErrors: typeof fieldErrors = {};
    if (!fullName.trim()) nextErrors.fullName = t('consult.name.ph');
    if (!email.trim()) nextErrors.email = t('consult.email.ph');
    if (!areaOfInterest) nextErrors.areaOfInterest = t('consult.interest.select');
    if (!message.trim()) nextErrors.message = t('consult.message.ph');
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    // Validate CAPTCHA
    if (parseInt(captchaInput, 10) !== captcha.answer) {
      setCaptchaError(true);
      return;
    }
    setCaptchaError(false);

    setSubmitting(true);
    setError('');

    try {
      const response = await client.apiCall.invoke({
        url: '/api/v1/enquiry/submit',
        method: 'POST',
        data: {
          full_name: fullName,
          email,
          phone: phone || null,
          area_of_interest: areaOfInterest,
          message,
        },
      });

      // Robust success check - handle multiple possible response shapes from apiCall.invoke
      const resp = response as any;
      const isSuccess =
        resp?.success === true ||
        resp?.data?.success === true ||
        resp?.data?.data?.success === true ||
        (typeof resp === 'object' && resp !== null && 'success' in resp && resp.success === true);

      const httpStatus = resp?.status || resp?.statusCode || resp?.data?.status;
      const isHttpSuccess = httpStatus === 200 || httpStatus === 201;

      if (isSuccess || isHttpSuccess) {
        setSubmitted(true);
      } else if (!resp || (typeof resp === 'object' && Object.keys(resp).length === 0)) {
        // apiCall.invoke might return void/undefined on success in some SDK versions
        setSubmitted(true);
      } else {
        console.warn('[Enquiry] Could not confirm success. Full response:', response);
        setError(t('consult.error'));
      }
    } catch (err: any) {
      console.error('[Enquiry] Submission error:', err);
      setError(t('consult.error2'));
    } finally {
      setSubmitting(false);
    }
  };

  const captchaQuestion = text('consult.captchaQ', 'consult.captcha.q')
    .replace('{a}', String(captcha.a))
    .replace('{b}', String(captcha.b));

  return (
    <section
      ref={ref}
      className="bg-deepblack min-h-[calc(100dvh-68px)] flex items-center py-24 md:py-32"
    >
      <div className="mx-auto max-w-2xl px-8 w-full">
        <div
          className={`transition-all duration-1000 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <div className="mx-auto mb-12 h-px w-10 bg-gradient-to-r from-transparent via-bronze/40 to-transparent" />

          <div className="text-center mb-16">
            <span aria-hidden="true" className="font-body text-[11px] tracking-[0.5em] uppercase text-bronze/75 block mb-6">
              {text('consult.label', 'consult.label')}
            </span>

            <h2 className="font-display text-3xl font-normal text-white/95 sm:text-4xl md:text-5xl leading-tight tracking-[-0.01em] px-2">
              {text('consult.title', 'consult.title')}
            </h2>

            <p className="mt-8 font-body text-[15px] leading-[1.85] text-white/75 max-w-md mx-auto">
              {text('consult.subtitle', 'consult.subtitle')}
            </p>
          </div>

          {submitted ? (
            <div
              role="status"
              aria-live="polite"
              className="text-center py-16 transition-all duration-700 opacity-100"
            >
              <div className="mx-auto mb-8 h-px w-10 bg-gradient-to-r from-transparent via-bronze/40 to-transparent" />
              <h3 className="font-display text-2xl font-light text-white/80 mb-8">
                {text('consult.thanks.title', 'consult.thanks.title')}
              </h3>
              <div className="font-body text-[15px] leading-[1.85] text-white/75 max-w-md mx-auto text-left space-y-4">
                <p>{text('consult.thanks.dear', 'consult.thanks.dear')}</p>
                <p>{text('consult.thanks.p1', 'consult.thanks.p1')}</p>
                <p>{text('consult.thanks.p2', 'consult.thanks.p2')}</p>
                <p>{text('consult.thanks.p3', 'consult.thanks.p3')}</p>
                <p>{text('consult.thanks.p4', 'consult.thanks.p4')}</p>
                <p className="mt-6">{text('consult.thanks.yours', 'consult.thanks.yours')}</p>
                <p className="text-bronze/60">Altera Terra</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-8">
              {/* Name */}
              <div>
                <label
                  htmlFor={nameId}
                  className="block font-body text-xs tracking-[0.3em] uppercase text-white/80 mb-3"
                >
                  {text('consult.fields.name', 'consult.name')}
                </label>
                <input
                  id={nameId}
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (fieldErrors.fullName) setFieldErrors((f) => ({ ...f, fullName: undefined }));
                  }}
                  aria-invalid={!!fieldErrors.fullName}
                  aria-describedby={fieldErrors.fullName ? nameErrId : undefined}
                  className="w-full bg-transparent border-b border-white/15 focus-visible:border-bronze-warm focus-visible:[box-shadow:0_1px_0_0_#C99879] text-white/80 font-body text-[15px] py-3 outline-none transition-colors duration-500 placeholder:text-white/65"
                  placeholder={t('consult.name.ph')}
                />
                {fieldErrors.fullName && (
                  <p id={nameErrId} role="alert" className="mt-2 font-body text-[11px] text-red-400/80">
                    {fieldErrors.fullName}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor={emailId}
                  className="block font-body text-xs tracking-[0.3em] uppercase text-white/80 mb-3"
                >
                  {text('consult.fields.email', 'consult.email')}
                </label>
                <input
                  id={emailId}
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors((f) => ({ ...f, email: undefined }));
                  }}
                  aria-invalid={!!fieldErrors.email}
                  aria-describedby={fieldErrors.email ? emailErrId : undefined}
                  className="w-full bg-transparent border-b border-white/15 focus-visible:border-bronze-warm focus-visible:[box-shadow:0_1px_0_0_#C99879] text-white/80 font-body text-[15px] py-3 outline-none transition-colors duration-500 placeholder:text-white/65"
                  placeholder={t('consult.email.ph')}
                />
                {fieldErrors.email && (
                  <p id={emailErrId} role="alert" className="mt-2 font-body text-[11px] text-red-400/80">
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor={phoneId}
                  className="block font-body text-xs tracking-[0.3em] uppercase text-white/80 mb-3"
                >
                  {text('consult.fields.phone', 'consult.phone')} <span className="text-white/65">{text('consult.fields.phoneOpt', 'consult.phone.opt')}</span>
                </label>
                <input
                  id={phoneId}
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-transparent border-b border-white/15 focus-visible:border-bronze-warm focus-visible:[box-shadow:0_1px_0_0_#C99879] text-white/80 font-body text-[15px] py-3 outline-none transition-colors duration-500 placeholder:text-white/65"
                  placeholder={t('consult.phone.ph')}
                />
              </div>

              {/* Interest — Radix Select */}
              <div>
                <label
                  htmlFor={interestId}
                  className="block font-body text-xs tracking-[0.3em] uppercase text-white/80 mb-3"
                >
                  {text('consult.fields.interest', 'consult.interest')}
                </label>
                <Select
                  value={areaOfInterest}
                  onValueChange={(value) => {
                    setAreaOfInterest(value);
                    if (fieldErrors.areaOfInterest) setFieldErrors((f) => ({ ...f, areaOfInterest: undefined }));
                  }}
                >
                  <SelectTrigger
                    id={interestId}
                    aria-invalid={!!fieldErrors.areaOfInterest}
                    aria-describedby={fieldErrors.areaOfInterest ? interestErrId : undefined}
                    className="w-full h-auto rounded-none border-0 border-b border-white/20 bg-transparent text-white/90 font-body text-[15px] py-3 px-0 focus-visible:border-bronze-warm focus-visible:[box-shadow:0_1px_0_0_#C99879] focus:ring-0 focus:ring-offset-0 data-[placeholder]:text-white/65 transition-colors duration-500"
                  >
                    <SelectValue placeholder={t('consult.interest.select')} />
                  </SelectTrigger>
                  <SelectContent className="bg-deepblack border border-white/15 text-white/85 rounded-none">
                    {interests.map((it) => (
                      <SelectItem
                        key={it.value}
                        value={it.value}
                        className="font-body text-[15px] text-white/85 focus:bg-bronze-warm/20 focus:text-white data-[state=checked]:text-bronze-warm cursor-pointer"
                      >
                        {it.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.areaOfInterest && (
                  <p id={interestErrId} role="alert" className="mt-2 font-body text-[11px] text-red-400/80">
                    {fieldErrors.areaOfInterest}
                  </p>
                )}
              </div>

              {/* Message */}
              <div>
                <label
                  htmlFor={messageId}
                  className="block font-body text-xs tracking-[0.3em] uppercase text-white/80 mb-3"
                >
                  {text('consult.fields.message', 'consult.message')}
                </label>
                <textarea
                  id={messageId}
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    if (fieldErrors.message) setFieldErrors((f) => ({ ...f, message: undefined }));
                  }}
                  aria-invalid={!!fieldErrors.message}
                  aria-describedby={fieldErrors.message ? messageErrId : undefined}
                  className="w-full bg-transparent border-b border-white/15 focus-visible:border-bronze-warm focus-visible:[box-shadow:0_1px_0_0_#C99879] text-white/80 font-body text-[15px] py-3 outline-none transition-colors duration-500 resize-none placeholder:text-white/65"
                  placeholder={t('consult.message.ph')}
                />
                {fieldErrors.message && (
                  <p id={messageErrId} role="alert" className="mt-2 font-body text-[11px] text-red-400/80">
                    {fieldErrors.message}
                  </p>
                )}
              </div>

              {/* CAPTCHA */}
              <div>
                <label
                  htmlFor={captchaId}
                  className="block font-body text-xs tracking-[0.3em] uppercase text-white/80 mb-3"
                >
                  {text('consult.fields.captcha', 'consult.captcha')}
                </label>
                <p className="font-body text-[13px] text-white/60 mb-3">
                  {captchaQuestion}
                </p>
                <input
                  id={captchaId}
                  type="text"
                  inputMode="numeric"
                  required
                  value={captchaInput}
                  onChange={(e) => {
                    setCaptchaInput(e.target.value);
                    setCaptchaError(false);
                  }}
                  aria-invalid={captchaError}
                  aria-describedby={captchaError ? captchaErrId : undefined}
                  className={`w-full bg-transparent border-b ${
                    captchaError ? 'border-red-400/60' : 'border-white/10 focus:border-bronze/40'
                  } text-white/80 font-body text-[15px] py-3 outline-none transition-colors duration-500 placeholder:text-white/65`}
                  placeholder="..."
                />
                {captchaError && (
                  <p id={captchaErrId} role="alert" className="mt-2 font-body text-[11px] text-red-400/80">
                    {t('consult.captcha.wrong')}
                  </p>
                )}
              </div>

              {/* Form-level error */}
              {error && (
                <p
                  id={formErrId}
                  role="alert"
                  className="text-center font-body text-[12px] text-red-400/80"
                >
                  {error}
                </p>
              )}

              {/* Submit — width-stable hover (no tracking reflow) */}
              <div className="pt-6 text-center">
                <button
                  type="submit"
                  disabled={submitting}
                  aria-describedby={error ? formErrId : undefined}
                  className="inline-block font-body text-xs tracking-[0.35em] uppercase text-white/90 border border-bronze/50 px-16 py-5 hover:text-white hover:border-bronze hover:bg-bronze/5 transition-colors duration-700 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span className="inline-block">
                    {submitting ? t('consult.sending') : t('consult.submit')}
                  </span>
                </button>
              </div>

              <p className="text-center font-body text-xs text-white/70 mt-4">
                {t('consult.directmail')}{' '}
                <a
                  href="mailto:enquire@alteraterra.vip"
                  className="text-bronze/75 hover:text-bronze/80 transition-colors duration-500"
                >
                  enquire@alteraterra.vip
                </a>
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
