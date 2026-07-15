import { Link, useParams } from 'react-router-dom'
import PublicNavbar from '@/components/PublicNavbar'
import { getServicePage, SERVICE_PAGES } from '@/lib/siteContent'
import { ServiceIcon } from '@/components/ServiceIcon'
import { useScheduleModalStore } from '@/stores/scheduleModalStore'
import { C, TYPE } from '@/lib/theme'

const CAT_LINKS: Record<string, string> = { visage: '/category/visage', corps: '/category/corps', techniques: '/category/techniques' }
const CAT_LABELS: Record<string, string> = { visage: 'Traitements du visage', corps: 'Traitements du corps', techniques: 'Nos techniques' }

const CTN = { maxWidth: 1280, width: '100%', margin: '0 auto', padding: '32px clamp(20px, 6vw, 80px) 24px' } as const

const BRAND_FLOWER = 'https://cdn.prod.website-files.com/6605bb62a0c4eb429d0631b4/66b0fbb4c50c3351ead87c66_concept-fleur.avif'

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
            <p style={{ fontWeight: 500 }}>Service introuvable.</p>
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
            <div className='grid items-start gap-12 lg:grid-cols-[1fr_420px] lg:gap-20'>
              <div className='relative max-w-[680px]'>
                <Link
                  to={CAT_LINKS[service.category]}
                  className='inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] transition hover:opacity-65 mb-4'
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
                  className='text-balance mt-6'
                  style={{
                    fontSize: 18,
                    fontWeight: 500,
                    lineHeight: '1.7',
                    margin: 0,
                  }}
                >
                  {service.heroDescription}
                </p>
                <p
                  className='text-balance mt-5'
                  style={{
                    fontSize: 16,
                    fontWeight: 500,
                    lineHeight: '1.7',
                    margin: 0,
                  }}
                >
                  {service.intro}
                </p>
              </div>

              <div className='flex flex-col gap-6 w-full lg:w-[420px] lg:flex-shrink-0 lg:sticky lg:top-28'>
                <button
                  type='button'
                  onClick={() => openWithMotif(service.title)}
                  className='inline-flex cursor-pointer items-center justify-center rounded-full border-0 font-semibold transition duration-300 hover:-translate-y-0.5 hover:shadow-lg min-h-touch w-full'
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    color: '#ffffff',
                    backgroundColor: C.primary,
                    padding: '14px 28px',
                    fontSize: 15,
                    lineHeight: '18px',
                  }}
                >
                  Prendre rendez-vous
                </button>

                <div
                  className='rounded-2xl p-5'
                  style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.12)' }}
                >
                  <p className='text-xs font-semibold uppercase tracking-[0.1em] mb-3' style={{ color: service.color }}>
                    Contre-indications
                  </p>
                  <p className='text-sm leading-6' style={{ color: C.secondary }}>
                    {service.contraindications}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

<section className='relative overflow-hidden py-20 sm:py-28' style={{ background: C.bg }}>
            <div className='pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/40' />
            <div className='pointer-events-none absolute -bottom-16 -left-16 h-52 w-52 rounded-full bg-white/30' />
            <div style={CTN}>
              <div className='relative mx-auto max-w-4xl'>
                <div className='mb-14 text-center'>
                  <div className='mx-auto mb-4 h-0.5 w-8 rounded-full' style={{ background: service.color }} />
                  <h2
                    className='leading-tight'
                    style={{ fontFamily: TYPE.headingFamily, fontSize: TYPE.h2, letterSpacing: TYPE.headingSpacing, color: C.secondary }}
                  >
                    En <em style={{ color: service.color, fontStyle: 'italic' }}>quelques mots</em>
                  </h2>
                </div>
                <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                  {service.highlights.map((highlight, i) => (
                    <div
                      key={highlight}
                      className='group rounded-2xl bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl text-left'
                      style={{ boxShadow: '0 4px 20px -4px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.05)' }}
                    >
                      <span
                        className='mb-3 block text-[48px] font-bold leading-none transition-colors'
                        style={{ color: service.color, fontFamily: TYPE.headingFamily }}
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <p
                        className='leading-7 transition-colors group-hover:opacity-90'
                        style={{ color: C.secondary, fontFamily: TYPE.bodyFamily, fontWeight: 500 }}
                      >
                        {highlight}
                      </p>
                    </div>
                  ))}
                </div>
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
                      fontSize: 17,
                      fontWeight: 500,
                      lineHeight: '32px',
                      margin: 0,
                    }}
                  >
                    {firstSection.body}
                  </p>
                  <button
                    type='button'
                    onClick={() => openWithMotif(service.title)}
                    className='inline-flex cursor-pointer items-center rounded-full border-0 font-semibold transition duration-300 hover:-translate-y-0.5 hover:shadow-lg min-h-touch'
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      color: '#ffffff',
                      backgroundColor: C.primary,
                      padding: '13px 24px',
                      fontSize: 15,
                      lineHeight: '18px',
                    }}
                  >
                    Prendre rendez-vous
                  </button>
                </div>

                <div className='relative mx-auto h-[260px] w-full max-w-[430px] sm:h-[360px] lg:mx-0'>
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
                        fontSize: 'clamp(1.15rem, 3.5vw, 1.625rem)',
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
                          fontSize: 16,
                          fontWeight: 500,
                          lineHeight: '30px',
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

        {/* ─── Related treatments ─── */}
        {(() => {
          const related = SERVICE_PAGES.filter((s) => s.category === service.category && s.slug !== service.slug).slice(0, 3)
          if (related.length === 0) return null
          return (
            <section className='relative overflow-hidden py-10 sm:py-16'>
              <div style={CTN}>
                <h2 className='mb-8 text-center leading-tight sm:text-2xl' style={{ fontFamily: TYPE.headingFamily, fontSize: TYPE.h3, letterSpacing: TYPE.headingSpacing, color: C.secondary }}>
                  <em style={{ color: C.primary, fontStyle: 'italic' }}>Découvrez</em> aussi
                </h2>
                <div className='mx-auto grid max-w-3xl gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                  {related.map((s) => (
                    <Link
                      key={s.slug}
                      to={`/services/${s.slug}`}
                      className='group flex items-center gap-4 rounded-2xl bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg min-h-touch'
                      style={{ boxShadow: '0 4px 20px -4px rgba(0,0,0,0.08)' }}
                    >
                      <ServiceIcon slug={s.slug} size={48} color={s.color} className='shrink-0' />
                      <div className='min-w-0 flex-1'>
                        <h3 className='text-sm font-semibold' style={{ fontFamily: TYPE.headingFamily, color: C.secondary }}>
                          {s.title}
                        </h3>
                        <span className='mt-1 inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider' style={{ color: C.primary }}>
                          Voir le soin
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          )
        })()}

        <section className='relative overflow-hidden py-10 sm:py-16'>
          <div style={{ ...CTN, padding: '32px clamp(20px, 6vw, 80px) 56px' }}>
            <div className='relative overflow-hidden rounded-[28px]' style={{ backgroundColor: C.primary, padding: 'clamp(40px, 6vw, 64px) clamp(24px, 5vw, 48px)' }}>
              <div className='absolute -left-12 -top-14 h-44 w-44 rounded-full bg-white/10' />
              <div className='absolute -bottom-14 right-10 h-52 w-52 rounded-full' style={{ background: C.orange, opacity: 0.18 }} />
              <div className='relative z-10 mx-auto max-w-[740px] text-center'>
                <h2
                  className='text-balance'
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
                    className='inline-flex cursor-pointer items-center rounded-full border-0 font-semibold transition duration-300 hover:-translate-y-0.5 min-h-touch'
                    style={{
                      marginTop: 32,
                      padding: '14px 24px',
                      backgroundColor: '#ffffff',
                      color: C.secondary,
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: 15,
                      lineHeight: '18px',
                    }}
                  >
                    Prendre rendez-vous
                  </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
