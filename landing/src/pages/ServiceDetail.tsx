import { Link, useParams } from 'react-router-dom'
import PublicFooter from '@/components/PublicFooter'
import PublicNavbar from '@/components/PublicNavbar'
import { getServicePage, ICON_MAP } from '@/lib/siteContent'
import { CalendarBlank, CheckCircle, Sparkle } from '@phosphor-icons/react'
import { useScheduleModalStore } from '@/stores/scheduleModalStore'
import { C, TYPE } from '@/lib/theme'

const CAT_LINKS: Record<string, string> = { visage: '/category/visage', corps: '/category/corps', techniques: '/category/techniques' }
const CAT_LABELS: Record<string, string> = { visage: 'Traitements du visage', corps: 'Traitements du corps', techniques: 'Nos techniques' }

const CTN = { maxWidth: 1280, width: '100%', margin: '0 auto', padding: '32px clamp(20px, 6vw, 80px) 24px' } as const

const BRAND_FLOWER = 'https://cdn.prod.website-files.com/6605bb62a0c4eb429d0631b4/66b0fbb4c50c3351ead87c66_concept-fleur.avif'
const BRAND_BUBBLES = 'https://cdn.prod.website-files.com/6605bb62a0c4eb429d0631b4/66aa4ea27518914b10e9001c_section-2-left-bubbles.svg'

export default function ServiceDetail() {
  const { slug = '' } = useParams()
  const service = getServicePage(slug)
  const { openWithMotif } = useScheduleModalStore()

  if (!service) {
    return (
      <div className='min-h-screen' style={{ background: C.bg }}>
        <PublicNavbar />
        <main className='mx-auto w-full max-w-7xl px-4 pt-32 pb-16 sm:px-6 sm:pt-40 lg:px-8'>
          <div className='rounded-2xl bg-white p-8 text-center shadow-lg'>
            <p style={{ color: C.secondary, fontFamily: TYPE.bodyFamily, fontWeight: 500 }}>Service introuvable.</p>
            <Link to='/' className='mt-4 inline-flex items-center gap-2 text-sm font-medium' style={{ color: C.primary }}>
              Retour
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const titleWords = service.title.split(' ')
  const firstSection = service.sections[0]
  const detailSections = service.sections.slice(1)
  const iconUrl = ICON_MAP[service.slug]

  return (
    <div className='min-h-screen' style={{ background: C.bg }}>
      <PublicNavbar />
      <main>
        <section className='relative overflow-hidden pt-32 sm:pt-40 lg:pt-44'>
          <div
            className='pointer-events-none absolute right-0 top-20 h-72 w-72 rounded-full blur-3xl'
            style={{ background: C.orange, opacity: 0.18 }}
          />
          <div style={CTN}>
            <div className='grid items-center gap-12 lg:grid-cols-[360px_minmax(0,1fr)] lg:gap-20'>
              <div className='relative mx-auto flex min-h-[280px] w-full max-w-[340px] items-center justify-center lg:mx-0'>
                <div
                  className='absolute left-4 top-0 h-36 w-36 rounded-full'
                  style={{ background: service.color, opacity: 0.14 }}
                />
                <div
                  className='absolute bottom-4 right-2 h-44 w-44 rounded-full'
                  style={{ background: C.primary, opacity: 0.1 }}
                />
                <img
                  src={BRAND_BUBBLES}
                  alt=''
                  className='pointer-events-none absolute left-0 top-4 w-24 select-none opacity-45'
                  loading='lazy'
                />
                {iconUrl ? (
                  <div className='relative z-10 h-[200px] w-[200px] drop-shadow-[0_18px_26px_rgba(30,30,30,0.10)]'>
                    <img
                      src={iconUrl}
                      alt=''
                      className='h-full w-full object-contain'
                      loading='lazy'
                    />
                    <div
                      className='pointer-events-none absolute inset-0'
                      style={{
                        backgroundColor: service.color,
                        opacity: 0.13,
                        maskImage: `url("${iconUrl}")`,
                        maskRepeat: 'no-repeat',
                        maskPosition: 'center',
                        maskSize: 'contain',
                        WebkitMaskImage: `url("${iconUrl}")`,
                        WebkitMaskRepeat: 'no-repeat',
                        WebkitMaskPosition: 'center',
                        WebkitMaskSize: 'contain',
                      }}
                    />
                  </div>
                ) : null}
              </div>

              <div className='relative z-10 flex max-w-[680px] flex-col items-start gap-5'>
                <Link
                  to={CAT_LINKS[service.category]}
                  className='inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] transition hover:opacity-65'
                  style={{ color: C.primary, fontFamily: TYPE.bodyFamily }}
                >
                  {CAT_LABELS[service.category]}
                </Link>
                <h1
                  style={{
                    fontFamily: TYPE.headingFamily,
                    fontSize: 'clamp(2.7rem, 7vw, 5.8rem)',
                    fontWeight: 700,
                    lineHeight: 0.95,
                    letterSpacing: '-0.03em',
                    color: C.secondary,
                    margin: 0,
                  }}
                >
                  {titleWords[0]}{' '}
                  <em style={{ color: service.color, fontStyle: 'italic' }}>{titleWords.slice(1).join(' ')}</em>
                </h1>
                <p
                  style={{
                    fontFamily: TYPE.bodyFamily,
                    fontSize: 18,
                    fontWeight: 500,
                    lineHeight: '32px',
                    color: C.secondary,
                    margin: 0,
                  }}
                >
                  {service.heroDescription}
                </p>
                <p
                  style={{
                    fontFamily: TYPE.bodyFamily,
                    fontSize: 16,
                    fontWeight: 500,
                    lineHeight: '30px',
                    color: 'rgba(30,30,30,0.82)',
                    margin: 0,
                  }}
                >
                  {service.intro}
                </p>
                <p
                  className='border-l-2 pl-4'
                  style={{
                    borderColor: service.color,
                    fontFamily: TYPE.bodyFamily,
                    fontSize: 14,
                    fontWeight: 500,
                    lineHeight: '25px',
                    color: C.accent,
                    margin: 0,
                  }}
                >
                  <em style={{ fontWeight: 700 }}>Contre-indications :</em> {service.contraindications}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className='relative overflow-hidden py-8 sm:py-12'>
          <div style={CTN}>
            <div className='mx-auto max-w-[680px] text-center'>
              <div className='mb-5 inline-flex h-11 w-11 items-center justify-center rounded-full' style={{ background: `${service.color}1F`, color: service.color }}>
                <Sparkle size={20} weight='fill' />
              </div>
              <h2
                style={{
                  fontFamily: TYPE.headingFamily,
                  fontSize: 'clamp(2rem, 4vw, 3.4rem)',
                  fontWeight: 700,
                  lineHeight: 1,
                  letterSpacing: '-0.03em',
                  color: C.secondary,
                  margin: 0,
                }}
              >
                En <em style={{ color: service.color, fontStyle: 'italic' }}>quelques mots</em>
              </h2>
              <ul className='mx-auto mt-8 grid max-w-[560px] gap-4 p-0 text-left' style={{ listStyle: 'none' }}>
                {service.highlights.map((highlight) => (
                  <li
                    key={highlight}
                    className='grid grid-cols-[24px_1fr] items-start gap-3'
                    style={{
                      fontFamily: TYPE.bodyFamily,
                      fontSize: 17,
                      fontWeight: 600,
                      lineHeight: '28px',
                      color: C.secondary,
                    }}
                  >
                    <CheckCircle size={22} weight='fill' style={{ color: service.color, marginTop: 3 }} />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {firstSection ? (
          <section className='relative overflow-hidden py-10 sm:py-16'>
            <div style={CTN}>
              <div className='grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_430px] lg:gap-20'>
                <div className='flex max-w-[660px] flex-col items-start gap-6'>
                  <h2
                    style={{
                      fontFamily: TYPE.headingFamily,
                      fontSize: 'clamp(2.15rem, 4vw, 4rem)',
                      fontWeight: 700,
                      lineHeight: 1,
                      letterSpacing: '-0.03em',
                      color: C.secondary,
                      margin: 0,
                    }}
                  >
                    <em style={{ color: service.color, fontStyle: 'italic' }}>Que faire</em> ?
                  </h2>
                  <p
                    style={{
                      fontFamily: TYPE.bodyFamily,
                      fontSize: 17,
                      fontWeight: 500,
                      lineHeight: '32px',
                      color: 'rgba(30,30,30,0.84)',
                      margin: 0,
                    }}
                  >
                    {firstSection.body}
                  </p>
                  <button
                    type='button'
                    onClick={() => openWithMotif(service.title)}
                    className='inline-flex cursor-pointer items-center gap-2 rounded-full border-0 transition duration-300 hover:-translate-y-0.5 hover:shadow-lg'
                    style={{
                      fontFamily: TYPE.bodyFamily,
                      color: '#ffffff',
                      backgroundColor: C.primary,
                      padding: '13px 24px',
                      fontSize: 15,
                      fontWeight: 700,
                      lineHeight: '18px',
                    }}
                  >
                    <CalendarBlank size={17} weight='bold' />
                    Prendre rendez-vous
                  </button>
                </div>

                <div className='relative mx-auto h-[360px] w-full max-w-[430px] lg:mx-0'>
                  <div
                    className='absolute right-8 top-0 h-28 w-28 rounded-full'
                    style={{ background: service.color, opacity: 0.16 }}
                  />
                  <div
                    className='absolute bottom-0 left-0 h-52 w-52 rounded-full'
                    style={{ background: C.orange, opacity: 0.22 }}
                  />
                  <div
                    className='absolute bottom-8 right-4 h-44 w-44 rounded-full'
                    style={{ background: C.primary, opacity: 0.12 }}
                  />
                  <img
                    src={BRAND_FLOWER}
                    alt=''
                    className='relative z-10 h-full w-full object-contain drop-shadow-[0_24px_34px_rgba(30,30,30,0.11)]'
                    loading='lazy'
                  />
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {detailSections.length > 0 ? (
          <section className='relative overflow-hidden py-6 sm:py-10'>
            <div style={CTN}>
              <div className='mx-auto grid max-w-[900px] gap-10'>
                {detailSections.map((section, index) => (
                  <article key={section.title} className='grid gap-5 border-t pt-8 sm:grid-cols-[190px_1fr]' style={{ borderColor: 'rgba(30,30,30,0.12)' }}>
                    <h3
                      style={{
                        fontFamily: TYPE.headingFamily,
                        fontSize: 26,
                        fontWeight: 700,
                        lineHeight: '32px',
                        letterSpacing: '-0.02em',
                        color: index % 2 === 0 ? service.color : C.accent,
                        margin: 0,
                      }}
                    >
                      {section.title}
                    </h3>
                    <p
                      style={{
                        fontFamily: TYPE.bodyFamily,
                        fontSize: 16,
                        fontWeight: 500,
                        lineHeight: '30px',
                        color: 'rgba(30,30,30,0.82)',
                        margin: 0,
                      }}
                    >
                      {section.body}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className='relative overflow-hidden py-10 sm:py-16'>
          <div style={{ ...CTN, padding: '32px clamp(20px, 6vw, 80px) 56px' }}>
            <div className='relative overflow-hidden rounded-[28px]' style={{ backgroundColor: C.primary, padding: 'clamp(40px, 6vw, 64px) clamp(24px, 5vw, 48px)' }}>
              <div className='absolute -left-12 -top-14 h-44 w-44 rounded-full bg-white/10' />
              <div className='absolute -bottom-14 right-10 h-52 w-52 rounded-full' style={{ background: C.orange, opacity: 0.18 }} />
              <div className='relative z-10 mx-auto max-w-[740px] text-center'>
                <h2
                  style={{
                    fontFamily: TYPE.headingFamily,
                    fontSize: 'clamp(2rem, 4vw, 3.3rem)',
                    fontWeight: 700,
                    lineHeight: 1.12,
                    letterSpacing: '-0.03em',
                    color: '#ffffff',
                    margin: 0,
                  }}
                >
                  Ensemble, élaborons un plan de traitement efficace et adapté à votre demande, votre psychologie et votre peau.
                </h2>
                <button
                  type='button'
                  onClick={() => openWithMotif(service.title)}
                  className='inline-flex cursor-pointer items-center gap-2 rounded-full border-0 transition duration-300 hover:-translate-y-0.5'
                  style={{
                    marginTop: 32,
                    padding: '14px 24px',
                    backgroundColor: '#ffffff',
                    color: C.secondary,
                    fontFamily: TYPE.bodyFamily,
                    fontSize: 15,
                    fontWeight: 700,
                    lineHeight: '18px',
                  }}
                >
                  <CalendarBlank size={17} weight='bold' />
                  Prendre rendez-vous
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  )
}
