import Layout from '@/components/Layout';
import Hairline from '@/components/Hairline';

// ponytail: bumped manually on each material change
const LAST_REVIEWED = 'May 2026';

export default function LegalPage({ kind }: { kind: 'privacy' | 'terms' }) {
  const title = kind === 'privacy' ? 'Privacy Notice' : 'Terms of Engagement';
  const eyebrow = kind === 'privacy' ? 'Confidentiality' : 'Conditions';

  return (
    <Layout>
      <section className="bg-parchment paper-noise min-h-[calc(100dvh-68px)] py-24 md:py-32">
        <div className="mx-auto max-w-2xl px-8">
          <span className="font-body text-[11px] tracking-[0.5em] uppercase text-bronze-warm block mb-6 text-center">
            {eyebrow}
          </span>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-normal text-charcoal tracking-[-0.01em] leading-tight text-center mb-10">
            {title}
          </h1>
          <Hairline width="w-12" className="mb-12" />

          <div className="font-body text-[15px] leading-[1.85] text-charcoal/80 space-y-6">
            <p>
              Altera Terra operates as a private collective. Membership is by invitation
              or introduction, and the relationships we hold are governed by discretion as
              much as by service. This page exists as the formal record of how we treat
              information shared with us and the terms under which we engage.
            </p>
            {kind === 'privacy' ? (
              <>
                <p>
                  Personal information you share — whether through enquiry, consultation,
                  or membership — is held confidentially and used only for the purpose of
                  responding to and serving you. We do not sell data, and we do not share
                  it with third parties except where strictly required to deliver an
                  experience you have requested.
                </p>
                <p>
                  We retain only what is necessary, for only as long as our relationship
                  requires it. To request access, correction, or deletion of your records,
                  please write to{' '}
                  <a href="mailto:privacy@alteraterra.vip" className="text-bronze-warm hover:text-bronze underline-offset-4 hover:underline transition-colors duration-700">
                    privacy@alteraterra.vip
                  </a>.
                </p>
              </>
            ) : (
              <>
                <p>
                  Engagement with Altera Terra is by mutual agreement. Bookings, plans,
                  and bespoke arrangements are subject to the specific terms communicated
                  at the time of confirmation. Cancellation, refund, and force-majeure
                  conditions vary by partner and destination.
                </p>
                <p>
                  These pages, and any content within, are © Altera Terra. Distribution
                  without permission is not permitted. For any matter requiring formal
                  attention, write to{' '}
                  <a href="mailto:legal@alteraterra.vip" className="text-bronze-warm hover:text-bronze underline-offset-4 hover:underline transition-colors duration-700">
                    legal@alteraterra.vip
                  </a>.
                </p>
              </>
            )}
            <p className="text-charcoal/60 italic pt-4">
              Last reviewed {LAST_REVIEWED}.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
