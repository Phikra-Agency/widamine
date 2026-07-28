import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import PublicNavbar from '@/components/PublicNavbar'
import { getServicePage, SERVICE_PAGES, type ServicePageContent } from '@/lib/siteContent'
import { useScheduleModalStore } from '@/stores/scheduleModalStore'
import { C, TYPE, SPACING } from '@/lib/theme'
import { Phone, Envelope } from '@phosphor-icons/react'

const BRANCH_IMG = 'https://cdn.prod.website-files.com/6605bb62a0c4eb429d0631b4/66ba364172b57bbc64c50e1e_consult-branche-feuiille.avif'

const CAT_LINKS: Record<string, string> = { visage: '/category/visage', corps: '/category/corps', techniques: '/category/techniques' }
const CAT_LABELS: Record<string, string> = { visage: 'Traitements du visage', corps: 'Traitements du corps', techniques: 'Nos techniques' }

function ReelCard({ service }: { service: ServicePageContent }) {
  const reelUrl = service.reelUrl || 'https://instagram.com/widaminecenter'
  return (
    <a
      href={reelUrl}
      target='_blank'
      rel='noopener noreferrer'
      className='group relative flex items-center justify-center w-full rounded-2xl overflow-hidden shadow-lg h-[380px] sm:h-[420px] max-w-[240px]'
      style={{ background: `linear-gradient(160deg, ${C.primary}, ${C.secondary})` }}
    >
      <div className='absolute inset-0 bg-black/10' />
      <div className='relative z-10 flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/25 backdrop-blur-sm group-hover:scale-110 group-hover:bg-white/35 transition-all'>
        <svg width='20' height='20' viewBox='0 0 24 24' fill='white' className='sm:w-6 sm:h-6'>
          <path d='M8 5v14l11-7z'/>
        </svg>
      </div>
    </a>
  )
}


export default function ServiceDetail() {
  const { slug = '' } = useParams()
  const service = getServicePage(slug)
  const { openWithMotif } = useScheduleModalStore()

  if (!service) {
    return (
      <div className='min-h-screen' style={{ background: C.bg }}>
        <PublicNavbar />
        <section className={`${SPACING.container} pt-40 pb-16 text-center`}>
          <p className='text-lg' style={{ fontFamily: TYPE.bodyFamily }}>Service introuvable.</p>
        </section>
      </div>
    )
}

const FAQS = [
  { q: 'Comment prendre rendez-vous ?', a: 'Pour une consultation, deux solutions s\'offrent à vous : la consultation en présentiel ou la visio-consultation. Vous pouvez nous contacter par téléphone du lundi au samedi de 9h à 19h, ou par email.' },
  { q: 'Faut-il une lettre d\'un médecin ?', a: 'La plupart de nos patients sont adressés par leurs médecins traitants ou confrères. Cependant, vous pouvez prendre rendez-vous directement par téléphone ou email.' },
  { q: 'Les consultations sont-elles remboursées ?', a: 'La plupart des actes de dermatologie esthétique ne sont pas pris en charge par la sécurité sociale. Nos honoraires sont librement fixés.' },
  { q: 'Proposez-vous des visio-consultations ?', a: 'Oui, nous proposons des visio-consultations qui permettent de réduire les délais d\'attente. Contactez-nous pour en savoir plus.' },
  { q: 'Puis-je venir pour de la dermatologie générale ?', a: 'Nous sommes spécialisés en dermatologie esthétique et correctrice. Pour la dermatologie générale, nous vous orientons vers un confrère adapté.' },
]

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className='overflow-hidden rounded-[1.25rem]' style={{ background: 'white', boxShadow: '0 2px 12px -4px rgba(0,0,0,0.04)' }}>
      <button onClick={() => setOpen(!open)} className='flex w-full items-center justify-between px-4 py-4 sm:px-6 sm:py-5 text-left'>
        <span className='pr-3 sm:pr-4 text-sm font-semibold sm:text-base' style={{ color: C.secondary }}>{question}</span>
        <span className='shrink-0 transition-transform duration-300' style={{ color: C.primary, transform: open ? 'rotate(45deg)' : 'rotate(0deg)' }}>
          <svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' className='sm:w-5 sm:h-5'>
            <line x1='12' y1='5' x2='12' y2='19' />
            <line x1='5' y1='12' x2='19' y2='12' />
          </svg>
        </span>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-60' : 'max-h-0'}`}>
        <div className='px-4 pb-4 sm:px-6 sm:pb-5'>
          <p className='text-sm leading-7'>{answer}</p>
        </div>
      </div>
    </div>
  )
}

  const firstSection = service.sections[0]
  const detailSections = service.sections.slice(1)

  return (
    <div className='min-h-screen' style={{ background: C.bg }}>
      <PublicNavbar />

      <section className='pt-24 sm:pt-40 lg:pt-48 pb-16 sm:pb-20 lg:pb-32'>
        <div className={`${SPACING.container}`}>
          <div className='grid lg:grid-cols-[400px_1fr] xl:grid-cols-[450px_1fr] gap-8 md:gap-12 lg:gap-24 items-start'>
            
            {/* ─── Left Sticky Column (Identity & Booking) ─── */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.6 }} 
              className='lg:sticky lg:top-32 flex flex-col'
            >
              <Link to={CAT_LINKS[service.category]} className='mb-6 sm:mb-8 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] transition hover:opacity-60' style={{ color: service.color }}>
                ← {CAT_LABELS[service.category]}
              </Link>
              
              <h1 className='text-[clamp(2rem,5vw,4.5rem)] leading-[1.05] mb-4 sm:mb-6' style={{ fontFamily: TYPE.headingFamily, color: C.secondary }}>
                {service.title}
              </h1>
              
              <p className='text-base sm:text-lg lg:text-xl leading-relaxed mb-4 sm:mb-6' style={{ color: C.secondary, fontFamily: TYPE.headingFamily }}>
                {service.heroDescription}
              </p>
              
              <p className='text-sm sm:text-[15px] leading-relaxed mb-8 sm:mb-10' style={{ color: `${C.secondary}dd`, fontFamily: TYPE.bodyFamily, fontWeight: 300 }}>
                {service.intro}
              </p>

              <button
                type='button'
                onClick={() => openWithMotif(service.title)}
                className='w-full inline-flex min-h-12 sm:min-h-14 items-center justify-center rounded-full px-6 sm:px-8 text-sm font-bold tracking-widest uppercase transition-all hover:-translate-y-0.5 shadow-[0_10px_24px_rgba(0,159,214,0.25)] hover:shadow-[0_16px_32px_rgba(0,159,214,0.35)]'
                style={{ background: C.primary, color: C.white, fontFamily: TYPE.bodyFamily }}
              >
                Prendre rendez-vous
              </button>

              {/* Minimalist Visual Hint - Just for the detail page */}
              <div className='my-8 sm:my-10 hidden lg:block opacity-20'>
                <svg width='100%' height='1' viewBox='0 0 100 1' preserveAspectRatio='none' fill='none' xmlns='http://www.w3.org/2000/svg'>
                  <line x1='0' y1='0.5' x2='100' y2='0.5' stroke='currentColor' strokeWidth='1' strokeDasharray='2 4'/>
                </svg>
              </div>

              {/* Instagram reel thumbnail */}
              <div className='hidden lg:block'>
                <ReelCard service={service} />
              </div>
            </motion.div>

            {/* ─── Right Scrolling Column (Details) ─── */}
            <div className='flex flex-col gap-16 sm:gap-20 lg:gap-32 lg:pt-8'>
              
              {/* Highlights */}
              {service.highlights && service.highlights.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.8 }}>
                  <h3 className='text-[10px] font-semibold uppercase tracking-widest mb-8 sm:mb-10' style={{ color: C.secondary }}>Points clés</h3>
                  <div className='grid sm:grid-cols-2 gap-x-8 sm:gap-x-12 gap-y-10 sm:gap-y-12'>
                    {service.highlights.map((highlight, i) => (
                      <div key={highlight} className='relative'>
                        <span className='absolute -left-3 sm:-left-4 -top-5 sm:-top-6 text-4xl sm:text-5xl opacity-5 select-none' style={{ fontFamily: TYPE.headingFamily, color: C.secondary }}>
                          0{i + 1}
                        </span>
                        <p className='relative z-10 text-sm sm:text-[15px] leading-relaxed' style={{ color: C.secondary, fontWeight: 400 }}>
                          {highlight}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}


              {/* First Detail Section */}
              {firstSection && (
                <div className='border-t pt-12 sm:pt-16' style={{ borderColor: 'rgba(26,54,70,0.08)' }}>
                  <h2 className='text-2xl sm:text-3xl lg:text-4xl leading-tight mb-6 sm:mb-8' style={{ fontFamily: TYPE.headingFamily, color: C.secondary }}>
                    {firstSection.title}
                  </h2>
                  <p className='text-[15px] sm:text-[16px] lg:text-lg leading-relaxed' style={{ color: `${C.secondary}dd`, fontWeight: 300 }}>
                    {firstSection.body}
                  </p>
                </div>
              )}

              {/* Remaining Detail Sections */}
              {detailSections.length > 0 && (
                <div className='space-y-12 sm:space-y-16'>
                  {detailSections.map((section, index) => (
                    <div key={section.title} className='border-t pt-8 sm:pt-10' style={{ borderColor: 'rgba(26,54,70,0.08)' }}>
                      <h3 className='text-lg sm:text-xl lg:text-2xl mb-5 sm:mb-6' style={{ fontFamily: TYPE.headingFamily, color: C.secondary }}>
                        {section.title}
                      </h3>
                      <p className='text-sm sm:text-[15px] lg:text-base leading-relaxed' style={{ color: `${C.secondary}dd`, fontWeight: 300 }}>
                        {section.body}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Contraindications */}
              {service.contraindications && (
                <div className='border-t pt-12 sm:pt-16' style={{ borderColor: 'rgba(26,54,70,0.08)' }}>
                  <h3 className='text-[10px] font-semibold uppercase tracking-widest mb-5 sm:mb-6' style={{ color: service.color }}>Contre-indications</h3>
                  <p className='text-sm sm:text-[15px] leading-relaxed' style={{ color: `${C.secondary}dd` }}>{service.contraindications}</p>
                </div>
              )}

            </div>

          </div>
        </div>
      </section>

      {/* ─── Consult section ─── */}
      <section className='mx-auto max-w-6xl px-4 sm:px-6 lg:px-8'>
        <div className='relative overflow-hidden rounded-2xl sm:rounded-[2rem] p-6 sm:p-8 lg:p-12' style={{ background: C.primary, color: 'white' }}>
          <div className='grid gap-8 sm:gap-10 lg:grid-cols-[1fr_0.5fr] lg:items-center'>
            <div>
              <h2 className='font-amoria text-xl sm:text-2xl lg:text-3xl leading-tight'>
                Comment prendre rendez-vous au Widamine Center ?
              </h2>
              <div className='mt-5 sm:mt-6 border-b border-white/25 pb-4 sm:pb-5'>
                <h3 className='text-base sm:text-lg font-semibold'>Pour une consultation, 2 solutions :</h3>
                <p className='mt-2 text-sm leading-7 text-white/75'>
                  La consultation en présentiel ou la visio-consultation (qui permet souvent de diminuer le délai).
                </p>
              </div>
              <a href='tel:+212535624696' className='mt-4 sm:mt-5 flex items-center gap-3 sm:gap-4 border-b border-white/25 py-4 sm:py-5 transition hover:opacity-80'>
                <div className='flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full bg-white' style={{ color: C.primary }}>
                  <Phone size={16} weight="duotone" className='sm:w-[18px] sm:h-[18px]' />
                </div>
                <div>
                  <p className='text-sm font-semibold'>Par téléphone</p>
                  <p className='text-sm text-white/70'>+212 (535) 624 696</p>
                </div>
              </a>
              <a href='mailto:info@widamineaestheticcenter.com' className='mt-4 sm:mt-5 flex items-center gap-3 sm:gap-4 border-b border-white/25 py-4 sm:py-5 transition hover:opacity-80'>
                <div className='flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full bg-white' style={{ color: C.primary }}>
                  <Envelope size={16} weight="duotone" className='sm:w-[18px] sm:h-[18px]' />
                </div>
                <div>
                  <p className='text-sm font-semibold'>Par email</p>
                  <p className='text-sm text-white/70'>info@widamineaestheticcenter.com</p>
                </div>
              </a>
            </div>
          </div>
          <img src={BRANCH_IMG} alt='' className='absolute right-0 bottom-0 w-24 sm:w-32 lg:w-36 opacity-60 hidden lg:block widamine-tint' loading='lazy' />
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className='mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-28'>
        <div className='grid gap-8 sm:gap-10 lg:grid-cols-[0.35fr_0.65fr] lg:items-start'>
          <div className='lg:sticky lg:top-28'>
            <h2 className='font-amoria text-2xl sm:text-3xl lg:text-4xl leading-tight' style={{ color: C.secondary }}>
              Questions <span style={{ color: C.primary, fontStyle: 'italic' }}>Fréquentes</span>
            </h2>
          </div>
          <div className='space-y-2 sm:space-y-3'>
            {FAQS.map((faq, i) => (
              <FAQItem key={i} question={faq.q} answer={faq.a} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
