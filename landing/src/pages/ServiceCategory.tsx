import { Link, useParams } from 'react-router-dom'
import PublicNavbar from '@/components/PublicNavbar'
import { SERVICE_PAGES } from '@/lib/siteContent'
import { useScheduleModalStore } from '@/stores/scheduleModalStore'
import { C, TYPE, SPACING } from '@/lib/theme'
import { CalendarBlank, PhoneCall } from '@phosphor-icons/react'
import TintedIcon from '@/components/TintedIcon'

const CATEGORY_LABELS: Record<string, { title: string; description: string }> = {
  visage: {
    title: 'Traitements du visage',
    description: 'Des soins dermatologiques et esthétiques pour sublimer votre visage. Technologies de pointe et expertise médicale pour des résultats naturels et durables.',
  },
  corps: {
    title: 'Traitements du corps',
    description: 'Redessinez votre silhouette avec nos traitements de body contouring non-invasifs et nos programmes silhouette personnalisés.',
  },
  techniques: {
    title: 'Nos techniques',
    description: 'Découvrez les technologies laser et esthétiques de dernière génération que nous utilisons pour vous offrir les meilleurs résultats.',
  },
}

export default function ServiceCategory() {
  const { category = 'visage' } = useParams<{ category: string }>()
  const { open } = useScheduleModalStore()
  const cat = CATEGORY_LABELS[category]
  const services = SERVICE_PAGES.filter((p) => p.category === category)
  const otherCategories = Object.keys(CATEGORY_LABELS).filter((c) => c !== category)

  if (!cat || services.length === 0) {
    return (
      <div className='min-h-screen' style={{ background: C.bg }}>
        <PublicNavbar />
        <section className={`${SPACING.container} pt-32 pb-16 sm:pt-40`}>
          <div className='rounded-2xl bg-white p-8 text-center' style={{ boxShadow: '0 10px 40px -10px rgba(0,0,0,0.12)' }}>
            <p className='text-lg'>Catégorie introuvable.</p>
            <Link to='/' className='mt-4 inline-flex items-center gap-2 text-sm font-medium' style={{ color: C.primary }}>
              ← Retour
            </Link>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className='min-h-screen' style={{ background: C.bg }}>
      <PublicNavbar />

      {/* ─── Hero: Title + Description ─── */}
      <section className='relative overflow-hidden pt-20 pb-10 sm:pt-24 sm:pb-12 lg:pt-28 lg:pb-14'>
        <div className={`${SPACING.container}`}>
          <div className='mx-auto max-w-3xl text-center'>
            <Link
              to='/'
              className='mb-4 inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.18em] transition hover:opacity-65'
              style={{ color: C.primary, fontFamily: TYPE.bodyFamily }}
            >
              ← Retour
            </Link>
            <h1
              className='leading-[1.1] sm:text-4xl md:text-5xl'
              style={{ fontFamily: TYPE.headingFamily, fontSize: TYPE.h1, letterSpacing: TYPE.headingSpacing, color: C.secondary }}
            >
              <em style={{ color: C.primary, fontStyle: 'italic' }}>{cat.title.split(' ')[0]}</em>
              {` ${cat.title.split(' ').slice(1).join(' ')}`}
            </h1>
            <p className='mx-auto mt-6 max-w-xl text-sm leading-7 sm:text-base'>
              {cat.description}
            </p>
          </div>
        </div>
      </section>

      {/* ─── Treatment grid: icon + name cards (square-moncey style) ─── */}
      <section className='relative overflow-hidden py-10 sm:py-12 lg:py-14'>
        <div className={`${SPACING.container}`}>
          <div className='mx-auto max-w-4xl'>
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
              {services.map((service) => (
                <Link
                  key={service.slug}
                  to={`/services/${service.slug}`}
                  className='group flex items-center gap-4 rounded-2xl bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg'
                  style={{ boxShadow: '0 4px 20px -4px rgba(0,0,0,0.08)' }}
                >
                  <TintedIcon slug={service.slug} color={service.color} className='h-14 w-14 shrink-0' />
                  <div className='min-w-0 flex-1'>
                    <h3
                      className='text-sm font-semibold'
                      style={{ fontFamily: TYPE.headingFamily, fontSize: TYPE.bodyMain, color: C.secondary }}
                    >
                      {service.title}
                    </h3>
                    <p
                      className='mt-1 text-xs leading-5 line-clamp-2'
                    >
                      {service.intro}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Other categories ─── */}
      <section className='relative overflow-hidden py-10 sm:py-12 lg:py-14'>
        <div className={`${SPACING.container}`}>
          <div className='mx-auto max-w-4xl'>
            <h2
              className='mb-6 text-center leading-tight sm:text-2xl'
              style={{ fontFamily: TYPE.headingFamily, fontSize: TYPE.h3, letterSpacing: TYPE.headingSpacing, color: C.secondary }}
            >
              <em style={{ color: C.primary, fontStyle: 'italic' }}>La méthode</em> Widamine
            </h2>
            <div className='grid gap-4 sm:grid-cols-2'>
              {otherCategories.map((catSlug) => {
                const catData = CATEGORY_LABELS[catSlug]
                const catServices = SERVICE_PAGES.filter((p) => p.category === catSlug)
                return (
                  <Link
                    key={catSlug}
                    to={`/category/${catSlug}`}
                    className='group flex items-center gap-4 rounded-2xl bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg'
                    style={{ boxShadow: '0 4px 20px -4px rgba(0,0,0,0.08)' }}
                  >
                    <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl' style={{ background: `${C.primary}15` }}>
                      <TintedIcon slug={catServices[0]?.slug || ''} color={C.primary} className='h-8 w-8' />
                    </div>
                    <div>
                      <h3 className='text-sm font-semibold' style={{ fontFamily: TYPE.headingFamily, color: C.secondary }}>
                        {catData.title}
                      </h3>
                      <p className='mt-0.5 text-xs'>
                        Découvrir les traitements →
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className='relative overflow-hidden pb-12 sm:pb-14'>
        <div className={`${SPACING.container}`}>
          <div className='relative overflow-hidden mx-auto max-w-4xl rounded-2xl p-10 text-center sm:p-14'
            style={{ background: C.primary }}
          >
            <div className='relative z-10'>
              <h2
                className='mx-auto max-w-2xl leading-tight sm:text-2xl'
                style={{ fontFamily: TYPE.headingFamily, fontSize: TYPE.h3, letterSpacing: TYPE.headingSpacing, color: '#ffffff' }}
              >
                Ensemble, élaborons un plan de traitement efficace et adapté à votre demande.
              </h2>
              <div className='mt-8 flex flex-wrap items-center justify-center gap-3'>
                <button
                  onClick={open}
                  className='inline-flex items-center rounded-full px-7 py-3.5 text-sm font-semibold'
                  style={{ background: '#ffffff', color: C.primary }}
                >
                  Prendre rendez-vous
                </button>
                <a
                  href='tel:+212535624696'
                  className='inline-flex items-center rounded-full border-2 px-7 py-3.5 text-sm font-semibold transition'
                  style={{ borderColor: '#ffffff', color: '#ffffff' }}
                >
                  +212 (535) 624 696
                </a>
              </div>
            </div>
            <img
              src='https://cdn.prod.website-files.com/6605bb62a0c4eb429d0631b4/66ab80d30a331b406dca0b96_cta-visual-bottom-left.png'
              alt='' className='pointer-events-none absolute bottom-0 left-0 z-0 select-none'
              style={{ width: '8vw', maxWidth: 100 }}
            />
            <img
              src='https://cdn.prod.website-files.com/6605bb62a0c4eb429d0631b4/66ab80d3911f5fb82f1302e5_cta-visual-top-right.png'
              alt='' className='pointer-events-none absolute right-0 top-0 z-0 select-none'
              style={{ width: '8vw', maxWidth: 100 }}
            />
          </div>
        </div>
      </section>
    </div>
  )
}
