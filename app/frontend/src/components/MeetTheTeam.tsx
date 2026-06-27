import { Link } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { useReveal } from '@/hooks/useReveal';
import StatStrip from '@/components/StatStrip';
import Hairline from '@/components/Hairline';
import { Fragment } from 'react';

const teamMembers = [
  {
    name: 'Domenico Morelli',
    roleKey: 'domenico.role',
    image: '/assets/domenico-morelli.jpg',
    slug: '/team/domenico-morelli',
    objectPosition: 'center 20%',
    imgClassName: '',
  },
  {
    name: 'Oscar Motta',
    roleKey: 'oscar.role',
    image: '/assets/oscar-motta.jpg',
    slug: '/team/oscar-motta',
    objectPosition: 'center 15%',
    imgClassName: '',
  },
];

const pillarKeys = [
  { label: 'team.pillar1.label', desc: 'team.pillar1.desc' },
  { label: 'team.pillar2.label', desc: 'team.pillar2.desc' },
  { label: 'team.pillar3.label', desc: 'team.pillar3.desc' },
  { label: 'team.pillar4.label', desc: 'team.pillar4.desc' },
];

export default function MeetTheTeam() {
  const { ref, visible } = useReveal<HTMLElement>({ threshold: 0.1 });
  const { t } = useLanguage();

  return (
    <section
      id="meet-the-team"
      ref={ref}
      className="bg-deepblack relative py-28 md:py-36"
    >
      <div className="mx-auto mb-20 h-px w-16 bg-gradient-to-r from-transparent via-bronze/30 to-transparent" />

      <div
        className={`mx-auto max-w-3xl px-8 text-center transition-all duration-1000 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        <span className="font-body text-[11px] tracking-[0.5em] uppercase text-bronze/75 block mb-6">
          {t('team.label')}
        </span>

        <h2 className="font-display text-3xl font-normal text-white/95 sm:text-4xl md:text-5xl leading-tight tracking-[-0.01em] px-2">
          {t('team.title')}
        </h2>

        <p className="mt-7 font-body text-[15px] sm:text-base leading-[1.85] text-white/75 max-w-xl mx-auto">
          {t('team.subtitle')}
        </p>
      </div>

      {/* Team Members Portraits */}
      <div className="mx-auto max-w-3xl px-8 mt-20 md:mt-28">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
          {teamMembers.map((member, i) => (
            <Link
              key={member.name}
              to={member.slug}
              className={`group text-center transition-all duration-1000 ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: visible ? `${400 + i * 200}ms` : '0ms' }}
            >
              <div className="relative mx-auto w-56 h-56 md:w-64 md:h-64 rounded-full overflow-hidden mb-8">
                <div className="absolute inset-0 rounded-full border border-white/[0.06] group-hover:border-bronze/20 transition-colors duration-700 z-10" />
                {'useBackground' in member && member.useBackground ? (
                  <div
                    role="img"
                    aria-label={member.name}
                    className="w-full h-full grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-[1.03]"
                    style={{
                      backgroundImage: `url(${member.image})`,
                      backgroundSize: '180% auto',
                      backgroundPosition: '15% 15%',
                      backgroundRepeat: 'no-repeat',
                    }}
                  />
                ) : (
                  <img
                    src={member.image}
                    alt={member.name}
                    className={`w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 ${member.imgClassName || ''} ${!member.imgClassName ? 'group-hover:scale-[1.03]' : ''}`}
                    style={{ objectPosition: member.objectPosition }}
                  />
                )}
                <div className="absolute inset-0 rounded-full bg-gradient-to-t from-deepblack/60 via-transparent to-transparent" />
              </div>

              <h3 className="font-display text-xl sm:text-2xl font-normal text-white/95 group-hover:text-white tracking-wide transition-colors duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
                {member.name}
              </h3>
              <p className="mt-2 font-body text-xs tracking-[0.25em] uppercase text-bronze group-hover:text-bronze/90 transition-colors duration-700">
                {t(member.roleKey)}
              </p>

              <span className="mt-5 inline-block font-body text-[11px] tracking-[0.35em] uppercase text-white/70 group-hover:text-white group-hover:tracking-[0.45em] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
                {t('team.viewprofile')}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Pillars grid */}
      <div className="mx-auto max-w-5xl px-8 mt-24 md:mt-32">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {pillarKeys.map((pillar, i) => (
            <Fragment key={pillar.label}>
              {/* Mobile-only hairline divider between stacked pillars */}
              {i > 0 && (
                <div className="md:hidden my-8">
                  <Hairline width="w-12" />
                </div>
              )}
              <div
                className={`relative bg-deepblack p-10 md:p-14 transition-all duration-1000 ${
                  // Desktop: 1px left column divider between the two columns,
                  // applied to every pillar in the right column (odd index).
                  i % 2 === 1
                    ? 'md:before:absolute md:before:left-0 md:before:top-6 md:before:bottom-6 md:before:w-px md:before:bg-white/[0.08] md:before:content-[""]'
                    : ''
                } ${
                  visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                }`}
                style={{ transitionDelay: visible ? `${800 + i * 150}ms` : '0ms' }}
              >
                <span className="font-body text-[11px] tracking-[0.4em] text-bronze/60 block mb-4">
                  {String(i + 1).padStart(2, '0')}
                </span>

                <h3 className="font-display text-2xl font-normal text-white/95 tracking-wide mb-5">
                  {t(pillar.label)}
                </h3>

                <p className="font-body text-sm leading-[1.85] text-white/80">
                  {t(pillar.desc)}
                </p>
              </div>
            </Fragment>
          ))}
        </div>
      </div>

      {/* Closing statement */}
      <div
        className={`mx-auto max-w-2xl px-8 mt-20 md:mt-28 text-center transition-all duration-1000 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
        style={{ transitionDelay: visible ? '1200ms' : '0ms' }}
      >
        <blockquote className="font-display text-xl md:text-2xl font-normal italic text-white/85 leading-relaxed">
          {t('team.quote')}
        </blockquote>

        <div className="mt-8 mx-auto h-px w-8 bg-bronze/25" />

        <p className="mt-8 font-body text-[11px] tracking-[0.3em] uppercase text-white/70">
          {t('team.founded')}
        </p>
      </div>

      <div className="mt-24 md:mt-32">
        <StatStrip />
      </div>
    </section>
  );
}