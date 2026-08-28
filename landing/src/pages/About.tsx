import { useEffect, useRef } from 'react'
import { useScheduleModalStore } from '@/stores/scheduleModalStore'
import PublicNavbar from '@/components/PublicNavbar'
import { C, TYPE, SPACING } from '@/lib/theme'
import { motion } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'

const TEAM_MEMBERS = [
  { name: 'Dr. Widad Slaoui', role: 'Dermatologue Esthétique', img: '/images/team/dr widad slaoui.jpg', founder: true },
  { name: 'Chaymae Ez Ouhri', role: 'Praticienne Certifiée', img: '/images/team/chaymae ez ouhri .jpg' },
  { name: 'Ihssan', role: 'Praticien Expert', img: '/images/team/ihssan.jpg' },
  { name: 'Ilham', role: 'Praticienne Senior', img: '/images/team/ilham.jpg' },
  { name: 'Loubna', role: 'Praticienne', img: '/images/team/loubna .jpg' },
  { name: 'Najwa', role: 'Praticienne', img: '/images/team/najwa.jpg' },
]

const GALLERY_IMAGES = [
  '/images/gallery/DSC01316.jpg',
  '/images/gallery/DSC01374.jpg',
  '/images/gallery/DSC01346.webp',
  '/images/gallery/DSC01330.webp',
]

const FlowerDecor = () => (
  <svg xmlns='http://www.w3.org/2000/svg' width='44' height='94' viewBox='0 0 44 94' fill='none' className='absolute opacity-20'>
    <path d='M14.7062 29.9963C12.0308 26.9437 6.19855 25.2227 6.65014 20.4075C8.62293 16.9743 12.3739 19.8038 14.5152 21.505C17.7635 17.9686 10.2882 11.4424 12.4373 6.58637C17.3312 1.61461 20.0722 15.6112 22.4791 12.86C25.5476 11.073 25.1314 7.32487 26.3904 4.46753C30.1049-1.5194 35.6536 6.06913 33.6664 10.6815C33.3974 11.3055 33.5356 12.5028 33.301 13.2458C32.9522 14.35 32.4047 15.381 32.0207 16.4716C31.531 17.8613 31.0211 21.6259 33.8552 20.4031C34.4629 20.1408 34.9422 19.6582 35.4475 19.2302C39.4894 15.808 40.1683 23.2367 39.8933 25.6525C39.4358 29.6712 35.615 31.2 32.0736 31.8448C22.936 33.6579 34.8671 46.4316 25.8405 49.5679C22.6481 49.9093 21.3049 45.3474 20.3242 42.9592C18.4218 39.6131 13.3863 39.5244 11.2208 36.1931C6.23032 29.3435 18.1428 34.1549 14.7062 29.9963Z' fill={C.primary} />
  </svg>
)

export default function About() {
  const { open } = useScheduleModalStore()

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [])

  return (
    <div style={{ background: C.bg, minHeight: '100vh' }}>
      <PublicNavbar />

      {/* Hero Section - Premium Two Column */}
      <section className='relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden'>
        {/* Decorative flower top-right */}
        <motion.div 
          className='absolute top-12 right-8 hidden lg:block' 
          style={{ color: C.primary }}
          initial={{ opacity: 0, rotate: -20, scale: 0.8 }}
          animate={{ opacity: 0.2, rotate: 0, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <FlowerDecor />
        </motion.div>
        
        <div className='mx-auto max-w-7xl px-6 sm:px-8 relative z-10'>
          <div className='grid lg:grid-cols-2 gap-12 lg:gap-16 items-center'>
            {/* Left Column - Text Content */}
            <div>
              <motion.p 
                className='text-xs font-bold tracking-[0.25em] uppercase mb-6'
                style={{ color: C.primary }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                À PROPOS DE WIDAMINE
              </motion.p>
              
              <motion.h1 
                className='leading-[1.05] mb-8'
                style={{ 
                  fontFamily: TYPE.headingFamily,
                  fontSize: 'clamp(2.5rem, 5.5vw, 4.5rem)',
                  color: C.secondary,
                  letterSpacing: '-0.02em',
                }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                Une vision, une{' '}
                <span style={{ color: C.primary, fontStyle: 'italic' }}>passion</span>, 
                <br/>une expertise
              </motion.h1>
              
              <motion.p 
                className='text-lg leading-relaxed mb-10'
                style={{ color: `${C.secondary}cc`, fontFamily: TYPE.bodyFamily }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                Depuis 2018, le Widamine Aesthetic Center combine expertise médicale, 
                innovation technologique et approche humaine pour sublimer la beauté 
                naturelle de chaque patient.
              </motion.p>

              <motion.div 
                className='flex flex-wrap gap-4'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <button
                  onClick={open}
                  className='inline-flex min-h-14 cursor-pointer items-center justify-center rounded-full px-8 text-base font-semibold text-white transition-colors duration-500 hover:!bg-[#007a9e] active:scale-[0.96]'
                  style={{ background: C.primary }}
                >
                  Prendre rendez-vous
                </button>
                
                <a
                  href='tel:+212535624696'
                  className='inline-flex min-h-14 cursor-pointer items-center justify-center rounded-full border px-8 text-base font-semibold transition-all duration-500 hover:brightness-[0.88] hover:bg-primary/[0.08] active:scale-[0.96]'
                  style={{ 
                    borderColor: C.primary, 
                    color: C.secondary,
                  }}
                >
                  +212 535 624 696
                </a>
              </motion.div>
            </div>

            {/* Right Column - Image */}
            <motion.div 
              className='relative group'
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <div 
                className='relative overflow-hidden'
                style={{ 
                  borderRadius: '2rem',
                  boxShadow: '0 40px 100px -20px rgba(0,0,0,0.25)',
                }}
              >
                <div className='aspect-[4/5] lg:aspect-[3/4] overflow-hidden'>
                  <img 
                    src='https://lh3.googleusercontent.com/gps-cs-s/AHRPTWk-C-bpX_xlt-IoVZClvZEDvooFgooE2MXE2ziwjHH1TUfWrxzanvJivhmVZkorFBaVCIUQ2w-NIGkQEWe9Cdz8seQy78ZxZlZy0Ejt5ob9Cg53uYqci7xYvDJ-funph8EUEYYXXcdGh3I=s680-w680-h510' 
                    alt='Centre Widamine - Cabinet médical' 
                    className='w-full h-full object-cover transition-transform duration-[800ms] ease-out group-hover:scale-105'
                  />
                </div>
                
                {/* Elegant overlay accent */}
                <div 
                  className='absolute inset-0 pointer-events-none'
                  style={{
                    background: `linear-gradient(135deg, ${C.primary}00 0%, ${C.primary}15 100%)`,
                  }}
                />
              </div>

              {/* Decorative element */}
              <div 
                className='absolute -bottom-6 -right-6 w-32 h-32 rounded-3xl -z-10 hidden lg:block'
                style={{ 
                  background: C.primary,
                  opacity: 0.1,
                }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Vision Section - Clean Redesign */}
      <section className='py-24 sm:py-32 relative' style={{ background: 'white' }}>
        <div className='mx-auto max-w-7xl px-6 sm:px-8'>
          <div className='grid lg:grid-cols-2 gap-16 lg:gap-20 items-start'>
            {/* Left Column */}
            <div>
              <motion.p 
                className='text-xs font-bold tracking-[0.25em] uppercase mb-6'
                style={{ color: C.primary }}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                NOTRE VISION
              </motion.p>
              
              <motion.h2 
                className='leading-[1.1] mb-8'
                style={{ 
                  fontFamily: TYPE.headingFamily,
                  fontSize: 'clamp(2.2rem, 4.5vw, 3.8rem)',
                  color: C.secondary,
                  letterSpacing: '-0.02em',
                }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.1 }}
              >
                La beauté naturelle sublimée par la{' '}
                <span style={{ color: C.primary, fontStyle: 'italic' }}>science</span>
              </motion.h2>
              
              <motion.p 
                className='text-base leading-loose mb-10'
                style={{ color: `${C.secondary}aa`, fontFamily: TYPE.bodyFamily }}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Notre mission est d'offrir à chaque patient une expérience unique qui 
                allie expertise médicale, technologies de pointe et écoute attentive.
              </motion.p>

              <motion.button
                onClick={open}
                className='inline-flex min-h-14 cursor-pointer items-center justify-center rounded-full px-8 text-base font-semibold text-white transition-colors duration-500 hover:!bg-[#007a9e] active:scale-[0.96]'
                style={{ background: C.primary }}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                Réserver une consultation
              </motion.button>
            </div>
            
            {/* Right Column - Simple Clean List */}
            <div className='space-y-10 lg:pl-8'>
              {/* Item 1 */}
              <motion.div 
                className='flex items-start gap-5'
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.15 }}
              >
                <div 
                  className='w-3 h-3 rounded-sm flex-shrink-0 mt-2.5'
                  style={{ background: C.primary }}
                />
                <div className='flex-1'>
                  <h3 
                    className='text-xl sm:text-2xl mb-3'
                    style={{ fontFamily: TYPE.headingFamily, color: C.secondary }}
                  >
                    <span style={{ color: C.primary, fontStyle: 'italic' }}>Expertise</span>{' '}
                    et innovation
                  </h3>
                  <p 
                    className='text-base leading-loose'
                    style={{ color: `${C.secondary}99`, fontFamily: TYPE.bodyFamily }}
                  >
                    Nous investissons continuellement dans la formation de notre équipe et 
                    l'acquisition des technologies les plus avancées de médecine esthétique.
                  </p>
                </div>
              </motion.div>

              {/* Item 2 */}
              <motion.div 
                className='flex items-start gap-5'
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.25 }}
              >
                <div 
                  className='w-3 h-3 rounded-sm flex-shrink-0 mt-2.5'
                  style={{ background: C.primary }}
                />
                <div className='flex-1'>
                  <h3 
                    className='text-xl sm:text-2xl mb-3'
                    style={{ fontFamily: TYPE.headingFamily, color: C.secondary }}
                  >
                    <span style={{ color: C.primary, fontStyle: 'italic' }}>Écoute</span>{' '}
                    et personnalisation
                  </h3>
                  <p 
                    className='text-base leading-loose'
                    style={{ color: `${C.secondary}99`, fontFamily: TYPE.bodyFamily }}
                  >
                    Chaque consultation commence par une écoute attentive. Nous concevons 
                    ensuite un protocole sur mesure adapté à votre peau et vos objectifs.
                  </p>
                </div>
              </motion.div>

              {/* Item 3 */}
              <motion.div 
                className='flex items-start gap-5'
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.35 }}
              >
                <div 
                  className='w-3 h-3 rounded-sm flex-shrink-0 mt-2.5'
                  style={{ background: C.primary }}
                />
                <div className='flex-1'>
                  <h3 
                    className='text-xl sm:text-2xl mb-3'
                    style={{ fontFamily: TYPE.headingFamily, color: C.secondary }}
                  >
                    <span style={{ color: C.primary, fontStyle: 'italic' }}>Résultats</span>{' '}
                    naturels
                  </h3>
                  <p 
                    className='text-base leading-loose'
                    style={{ color: `${C.secondary}99`, fontFamily: TYPE.bodyFamily }}
                  >
                    Notre philosophie : sublimer votre beauté naturelle avec des résultats 
                    harmonieux qui respectent votre identité unique.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className='py-24 sm:py-32 relative overflow-hidden' style={{ background: C.bg }}>
        {/* Decorative flower bottom-left */}
        <div className='absolute bottom-12 left-8 hidden lg:block' style={{ color: C.primary, transform: 'rotate(-25deg)' }}>
          <FlowerDecor />
        </div>

        <div className='mx-auto max-w-7xl px-6 sm:px-8 relative z-10'>
          <div className='mb-20 text-center max-w-3xl mx-auto'>
            <p 
              className='text-xs font-bold tracking-[0.25em] uppercase mb-6'
              style={{ color: C.primary }}
            >
              NOS VALEURS
            </p>
            
            <h2 
              className='leading-[1.1]'
              style={{ 
                fontFamily: TYPE.headingFamily,
                fontSize: 'clamp(2rem, 4vw, 3.5rem)',
                color: C.secondary,
                letterSpacing: '-0.02em',
              }}
            >
              Ce qui nous <span style={{ color: C.primary, fontStyle: 'italic' }}>distingue</span>
            </h2>
          </div>

          <div className='grid md:grid-cols-3 gap-8 lg:gap-12'>
            {[
              { 
                num: '01', 
                title: 'Excellence médicale', 
                text: 'Une équipe de médecins certifiés et praticiens experts, formés aux dernières techniques de médecine esthétique internationale.' 
              },
              { 
                num: '02', 
                title: 'Technologies avancées', 
                text: 'Des équipements de pointe pour des résultats naturels, précis et sécurisés dans tous nos traitements.' 
              },
              { 
                num: '03', 
                title: 'Approche personnalisée', 
                text: 'Chaque patient est unique. Nous créons des protocoles sur mesure adaptés à vos besoins et objectifs.' 
              },
            ].map((v, i) => (
              <motion.div 
                key={i} 
                className='group relative'
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.6, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Hover background */}
                <div 
                  className='absolute -inset-6 rounded-[2rem] opacity-0 transition-all duration-500 group-hover:opacity-100'
                  style={{ background: 'white', boxShadow: '0 20px 60px -15px rgba(0,0,0,0.1)' }}
                />
                
                <div className='relative p-2'>
                  <div 
                    className='text-6xl sm:text-7xl font-light mb-8 opacity-15 transition-all duration-500 group-hover:opacity-30'
                    style={{ fontFamily: TYPE.headingFamily, color: C.primary }}
                  >
                    {v.num}
                  </div>
                  
                  <h3 
                    className='text-2xl sm:text-3xl mb-5 transition-transform duration-500 group-hover:translate-x-1'
                    style={{ fontFamily: TYPE.headingFamily, color: C.secondary }}
                  >
                    {v.title}
                  </h3>
                  
                  <p 
                    className='text-base leading-loose'
                    style={{ color: `${C.secondary}bb`, fontFamily: TYPE.bodyFamily }}
                  >
                    {v.text}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className='py-24 sm:py-32 relative' style={{ background: C.bg }}>
        <div className='mx-auto max-w-7xl px-6 sm:px-8'>
          <div className='mb-20 text-center max-w-3xl mx-auto'>
            <p 
              className='text-xs font-bold tracking-[0.25em] uppercase mb-6'
              style={{ color: C.primary }}
            >
              NOTRE ÉQUIPE
            </p>
            
            <h2 
              className='leading-[1.1]'
              style={{ 
                fontFamily: TYPE.headingFamily,
                fontSize: 'clamp(2rem, 4vw, 3.5rem)',
                color: C.secondary,
                letterSpacing: '-0.02em',
              }}
            >
              Des experts <span style={{ color: C.primary, fontStyle: 'italic' }}>passionnés</span> à votre service
            </h2>
          </div>

          <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10'>
            {TEAM_MEMBERS.map((member, i) => (
              <motion.div 
                key={i} 
                className='group'
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              >
                <div 
                  className='relative overflow-hidden mb-6 bg-white transition-all duration-500 group-hover:shadow-2xl'
                  style={{ 
                    borderRadius: '2rem', 
                    boxShadow: '0 15px 60px -15px rgba(0,0,0,0.18)' 
                  }}
                >
                  <div className='aspect-[3/4] overflow-hidden'>
                    <img 
                      src={member.img} 
                      alt={member.name}
                      className='h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-110'
                      onError={(e) => {
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=009fd6&color=fff&size=600`
                      }}
                    />
                  </div>
                  
                  {member.founder && (
                    <div 
                      className='absolute top-5 right-5 px-5 py-2.5 rounded-full text-xs font-bold text-white backdrop-blur-sm'
                      style={{ 
                        background: C.primary, 
                        boxShadow: '0 8px 24px rgba(0,159,214,0.4)' 
                      }}
                    >
                      Fondatrice
                    </div>
                  )}
                </div>
                
                <h3 
                  className='text-xl sm:text-2xl font-semibold mb-2'
                  style={{ color: C.secondary, fontFamily: TYPE.headingFamily }}
                >
                  {member.name}
                </h3>
                
                <p 
                  className='text-sm font-bold uppercase tracking-wider'
                  style={{ color: C.primary, opacity: 0.9 }}
                >
                  {member.role}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className='py-28 sm:py-36 relative overflow-hidden' style={{ background: C.bg }}>
        {/* Decorative elements */}
        <div className='absolute top-1/2 left-8 hidden lg:block opacity-30' style={{ color: C.primary, transform: 'translateY(-50%) rotate(15deg)' }}>
          <FlowerDecor />
        </div>
        <div className='absolute top-1/2 right-8 hidden lg:block opacity-30' style={{ color: C.primary, transform: 'translateY(-50%) rotate(-15deg)' }}>
          <FlowerDecor />
        </div>

        <div className='mx-auto max-w-5xl px-6 sm:px-8 text-center relative z-10'>
          <h2 
            className='leading-[1.1] mb-10'
            style={{ 
              fontFamily: TYPE.headingFamily,
              fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
              color: C.secondary,
              letterSpacing: '-0.02em',
            }}
          >
            Prête à révéler votre{' '}
            <span style={{ color: C.primary, fontStyle: 'italic' }}>beauté naturelle</span> ?
          </h2>
          
          <p 
            className='text-lg sm:text-xl mb-14 max-w-2xl mx-auto'
            style={{ color: `${C.secondary}dd`, fontFamily: TYPE.bodyFamily }}
          >
            Prenez rendez-vous pour une consultation personnalisée avec nos experts.
          </p>
          
          <div className='flex flex-wrap items-center justify-center gap-5'>
            <button
              onClick={open}
              className='inline-flex min-h-14 cursor-pointer items-center justify-center rounded-full px-8 text-base font-semibold text-white transition-colors duration-500 hover:!bg-[#007a9e] active:scale-[0.96]'
              style={{ background: C.primary }}
            >
              Prendre rendez-vous
            </button>
            
            <a
              href='tel:+212535624696'
              className='inline-flex min-h-14 cursor-pointer items-center justify-center rounded-full border px-8 text-base font-semibold transition-all duration-500 hover:brightness-[0.88] hover:bg-primary/[0.08] active:scale-[0.96]'
              style={{ 
                borderColor: C.primary, 
                color: C.secondary,
              }}
            >
              +212 535 624 696
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
