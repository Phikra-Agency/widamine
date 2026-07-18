import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import PublicNavbar from '@/components/PublicNavbar'
import { SERVICE_PAGES } from '@/lib/siteContent'
import { useScheduleModalStore } from '@/stores/scheduleModalStore'
import { C, TYPE, SPACING } from '@/lib/theme'

const CATEGORY_DATA: Record<string, { title: string; subtitle: string; description: string; color: string }> = {
  visage: {
    title: 'Traitements du visage',
    subtitle: 'Soins & Protocoles',
    description: "Une approche sur-mesure pour révéler l'éclat naturel de votre peau. Nos protocoles exclusifs allient technologies de pointe et expertise médicale pour des résultats subtils, harmonieux et durables.",
    color: '#009FD6',
  },
  corps: {
    title: 'Traitements du corps',
    subtitle: 'Remodelage & Silhouette',
    description: 'Sculptez et tonifiez votre corps grâce à nos traitements de body-contouring non invasifs. Une prise en charge globale pour vous réconcilier avec votre image, en toute sécurité.',
    color: '#009FD6',
  },
  techniques: {
    title: 'Nos techniques',
    subtitle: 'Plateau Technique',
    description: "Le Widamine Center est équipé d'un plateau technique de dernière génération. Découvrez nos solutions avancées pour des résultats optimaux.",
    color: '#009FD6',
  },
}

export default function ServiceCategory() {
  const { category = 'visage' } = useParams<{ category: string }>()
  const { open } = useScheduleModalStore()
  const cat = CATEGORY_DATA[category] || CATEGORY_DATA['visage']
  const services = SERVICE_PAGES.filter((p) => p.category === category)

  if (services.length === 0) {
    return (
      <div className='min-h-screen' style={{ background: C.bg }}>
        <PublicNavbar />
        <section className={`${SPACING.container} pt-40 pb-16 text-center`}>
          <p className='text-lg' style={{ fontFamily: TYPE.bodyFamily }}>Catégorie introuvable.</p>
        </section>
      </div>
    )
  }

  return (
    <div className='min-h-screen' style={{ background: C.bg }}>
      <PublicNavbar />

      {/* ─── Minimalist Hero ─── */}
      <section className='pt-32 sm:pt-48 pb-16 lg:pb-24 border-b' style={{ borderColor: 'rgba(26,54,70,0.08)' }}>
        <div className={`${SPACING.container}`}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className='max-w-4xl'>
            <Link to='/' className='mb-8 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest transition hover:opacity-60' style={{ color: C.secondary }}>
              ← Retour
            </Link>
            <h1 className='text-[clamp(3rem,6vw,5.5rem)] leading-[1.05] mb-8' style={{ fontFamily: TYPE.headingFamily, color: C.secondary }}>
              {cat.title}
            </h1>
            <div className='grid sm:grid-cols-[200px_1fr] gap-8 sm:gap-16 items-start'>
              <p className='text-xs font-semibold uppercase tracking-widest pt-1' style={{ color: cat.color }}>
                {cat.subtitle}
              </p>
              <p className='text-lg sm:text-xl leading-relaxed' style={{ color: `${C.secondary}dd`, fontFamily: TYPE.bodyFamily, fontWeight: 300 }}>
                {cat.description}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Architectural Services List ─── */}
      <section className='py-20'>
        <div className={`${SPACING.container}`}>
          <div className='max-w-6xl mx-auto'>
            {services.map((service, idx) => (
              <motion.div
                key={service.slug}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
              >
                <Link
                  to={`/services/${service.slug}`}
                  className='group flex flex-col md:flex-row md:items-center justify-between gap-8 py-10 md:py-14 border-b transition-colors hover:bg-white/40 -mx-6 px-6 sm:-mx-8 sm:px-8 rounded-2xl'
                  style={{ borderColor: 'rgba(26,54,70,0.08)' }}
                >
                  <div className='md:w-1/2'>
                    <div className='mb-4 flex flex-wrap gap-3'>
                      {service.highlights.slice(0, 2).map((h, i) => (
                        <span key={i} className='text-[10px] font-semibold uppercase tracking-widest' style={{ color: service.color }}>
                          {h}
                        </span>
                      ))}
                    </div>
                    <h2 className='text-3xl md:text-4xl transition-colors group-hover:text-[#009FD6]' style={{ fontFamily: TYPE.headingFamily, color: C.secondary }}>
                      {service.title}
                    </h2>
                  </div>
                  
                  <div className='md:w-1/2 flex items-center gap-8'>
                    <p className='text-[15px] leading-relaxed flex-1' style={{ color: `${C.secondary}aa`, fontWeight: 300 }}>
                      {service.intro || service.heroDescription}
                    </p>
                    <div className='hidden md:flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[rgba(26,54,70,0.1)] text-[#009FD6] transition-all group-hover:border-[#009FD6] group-hover:bg-[#009FD6] group-hover:text-white'>
                      <svg width='18' height='18' viewBox='0 0 16 16' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'><path d='M3 8h10m-4-4l4 4-4 4'/></svg>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Minimalist Final CTA ─── */}
      <section className='py-32'>
        <div className={`${SPACING.container}`}>
          <div className='mx-auto max-w-4xl text-center'>
            <h2 className='text-[clamp(2.5rem,4vw,3.5rem)] leading-tight mb-8' style={{ fontFamily: TYPE.headingFamily, color: C.secondary }}>
              Prête à révéler votre beauté ?
            </h2>
            <p className='text-lg mb-12' style={{ color: `${C.secondary}cc`, fontWeight: 300 }}>
              Prenez rendez-vous pour une consultation personnalisée avec nos experts.
            </p>
            <button
              onClick={open}
              className='inline-flex min-h-14 items-center justify-center rounded-full px-10 text-sm font-bold tracking-widest uppercase transition-all hover:-translate-y-1 shadow-[0_10px_24px_rgba(0,159,214,0.25)] hover:shadow-[0_16px_32px_rgba(0,159,214,0.35)]'
              style={{ background: C.primary, color: '#ffffff', fontFamily: "'Poppins', sans-serif" }}
            >
              Prendre rendez-vous
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
