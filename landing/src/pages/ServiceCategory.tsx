import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import PublicNavbar from '@/components/PublicNavbar'
import { useServices } from '@/hooks/useServices'
import { serviceToContent, ICON_MAP } from '@/lib/siteContent'
import { ServiceIcon } from '@/components/ServiceIcon'
import { useScheduleModalStore } from '@/stores/scheduleModalStore'
import { C, TYPE, SPACING } from '@/lib/theme'

const CATEGORY_DATA: Record<string, { title: string; subtitle: string; description: string; color: string }> = {
  tous: {
    title: 'Nos soins',
    subtitle: 'Tous les traitements',
    description: "L'ensemble des soins et protocoles du Widamine Aesthetic Center.",
    color: C.primary,
  },
  visage: {
    title: 'Traitements du visage',
    subtitle: 'Soins & Protocoles',
    description: "Une approche sur-mesure pour révéler l'éclat naturel de votre peau. Nos protocoles exclusifs allient technologies de pointe et expertise médicale pour des résultats subtils, harmonieux et durables.",
    color: C.primary,
  },
  corps: {
    title: 'Traitements du corps',
    subtitle: 'Remodelage & Silhouette',
    description: 'Sculptez et tonifiez votre corps grâce à nos traitements de body-contouring non invasifs. Une prise en charge globale pour vous réconcilier avec votre image, en toute sécurité.',
    color: C.primary,
  },
  techniques: {
    title: 'Nos techniques',
    subtitle: 'Plateau Technique',
    description: "Le Widamine Center est équipé d'un plateau technique de dernière génération. Découvrez nos solutions avancées pour des résultats optimaux.",
    color: C.primary,
  },
}

export default function ServiceCategory() {
  const { category = 'visage' } = useParams<{ category: string }>()
  const { open } = useScheduleModalStore()
  const { services: dynamicServices, loading } = useServices()
  const cat = CATEGORY_DATA[category] || CATEGORY_DATA['tous']
  
  // Filter by category and remove duplicates by slug
  const filteredServices = cat === CATEGORY_DATA['tous'] 
    ? dynamicServices 
    : dynamicServices.filter((s) => s.category === category)
  
  // Deduplicate by slug (keep first occurrence)
  const uniqueServices = filteredServices.filter((service, index, self) => 
    index === self.findIndex((s) => s.slug === service.slug)
  )
  
  const services = uniqueServices.map(serviceToContent)

  if (!loading && services.length === 0) {
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
      <section className='pt-24 sm:pt-40 lg:pt-48 pb-12 sm:pb-16 lg:pb-24 border-b' style={{ borderColor: 'rgba(26,54,70,0.08)' }}>
        <div className={`${SPACING.container}`}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className='max-w-4xl'>
            <Link to='/' className='mb-6 sm:mb-8 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest transition hover:opacity-60' style={{ color: C.secondary }}>
              ← Retour
            </Link>
            <h1 className='text-[clamp(2.25rem,6vw,5.5rem)] leading-[1.05] mb-6 sm:mb-8' style={{ fontFamily: TYPE.headingFamily, color: C.secondary }}>
              {cat.title}
            </h1>
            <div className='grid sm:grid-cols-[180px_1fr] gap-6 sm:gap-12 lg:gap-16 items-start'>
              <p className='text-xs font-semibold uppercase tracking-widest pt-1' style={{ color: cat.color }}>
                {cat.subtitle}
              </p>
              <p className='text-base sm:text-lg lg:text-xl leading-relaxed' style={{ color: `${C.secondary}dd`, fontFamily: TYPE.bodyFamily, fontWeight: 300 }}>
                {cat.description}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Architectural Services List ─── */}
      <section className='py-16 sm:py-20'>
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
                  className='group flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8 py-8 sm:py-10 md:py-14 border-b transition-colors hover:bg-white/40 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 rounded-2xl'
                  style={{ borderColor: 'rgba(26,54,70,0.08)' }}
                >
                  {/* Service Icon — per-motif tint */}
                  <div className='shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border bg-white/50 flex items-center justify-center transition-all group-hover:shadow-lg' style={{ borderColor: `${service.color}18`, background: `${service.color}0f` }}>
                    <ServiceIcon slug={service.slug} size={28} color={service.color} />
                  </div>

                  <div className='md:flex-1'>
                    <div className='mb-3 sm:mb-4 flex flex-wrap gap-2 sm:gap-3'>
                      {service.highlights.slice(0, 2).map((h, i) => (
                        <span key={i} className='text-[10px] font-semibold uppercase tracking-widest' style={{ color: service.color }}>
                          {h}
                        </span>
                      ))}
                    </div>
                    <h2 className='text-2xl sm:text-3xl md:text-4xl transition-colors group-hover:text-[#009FD6]' style={{ fontFamily: TYPE.headingFamily, color: C.secondary }}>
                      {service.title}
                    </h2>
                  </div>
                  
                  <div className='md:flex-1 flex items-center gap-4 md:gap-8'>
                    <p className='text-sm sm:text-[15px] leading-relaxed flex-1' style={{ color: `${C.secondary}aa`, fontWeight: 300 }}>
                      {service.intro || service.heroDescription}
                    </p>
                    <div className='flex h-10 w-10 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-full border border-[rgba(26,54,70,0.1)] text-[#009FD6] transition-all group-hover:border-[#009FD6] group-hover:bg-[#009FD6] group-hover:text-white'>
                      <svg width='16' height='16' viewBox='0 0 16 16' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' className='md:w-[18px] md:h-[18px]'><path d='M3 8h10m-4-4l4 4-4 4'/></svg>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Minimalist Final CTA ─── */}
      <section className='py-20 sm:py-28 lg:py-32'>
        <div className={`${SPACING.container}`}>
          <div className='mx-auto max-w-4xl text-center'>
            <h2 className='text-[clamp(2rem,4vw,3.5rem)] leading-tight mb-6 sm:mb-8' style={{ fontFamily: TYPE.headingFamily, color: C.secondary }}>
              Prête à révéler votre beauté ?
            </h2>
            <p className='text-base sm:text-lg mb-10 sm:mb-12' style={{ color: `${C.secondary}dd`, fontWeight: 300 }}>
              Prenez rendez-vous pour une consultation personnalisée avec nos experts.
            </p>
            <button
              onClick={open}
              className='inline-flex min-h-12 sm:min-h-14 items-center justify-center rounded-full px-8 sm:px-10 text-sm font-bold tracking-widest uppercase transition-all hover:-translate-y-1 shadow-[0_10px_24px_rgba(0,159,214,0.25)] hover:shadow-[0_16px_32px_rgba(0,159,214,0.35)]'
              style={{ background: C.primary, color: C.white, fontFamily: TYPE.bodyFamily }}
            >
              Prendre rendez-vous
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
