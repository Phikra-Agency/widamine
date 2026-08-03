import { useEffect } from 'react'
import { PhoneCall, Star, Certificate, Users, Heart, Sparkle, ArrowRight, Check, Clock, MapPin } from '@phosphor-icons/react'
import { useScheduleModalStore } from '@/stores/scheduleModalStore'
import PublicNavbar from '@/components/PublicNavbar'
import PublicFooter from '@/components/PublicFooter'
import { C, TYPE } from '@/lib/theme'

const SERVICES_HIGHLIGHT = [
  { icon: Sparkle, title: 'Soins du Visage', desc: 'Rajeunissement, hydratation, éclat' },
  { icon: Heart, title: 'Soins du Corps', desc: 'Silhouette, fermeté, bien-être' },
  { icon: Certificate, title: 'Techniques Avancées', desc: 'Technologies dernière génération' },
  { icon: Users, title: 'Consultation Personnalisée', desc: 'Diagnostic et plan sur mesure' },
]

const TEAM_MEMBERS = [
  { name: 'Dr. Widad Slaoui', role: 'Médecin Esthétique', specialty: 'Fondatrice & Directrice Médicale', img: '/images/team/widad.jpg' },
  { name: 'Chaymae Ez Ouhri', role: 'Praticienne Certifiée', specialty: 'Spécialiste Soins du Visage', img: '/images/team/chaymae ez ouhri .jpg' },
  { name: 'Ihssan', role: 'Praticien Expert', specialty: 'Techniques Injectables', img: '/images/team/ihssan.jpg' },
  { name: 'Ilham', role: 'Praticienne Senior', specialty: 'Soins Corporels', img: '/images/team/ilham.jpg' },
  { name: 'Loubna', role: 'Praticienne', specialty: 'Esthétique Avancée', img: '/images/team/loubna .jpg' },
  { name: 'Najwa', role: 'Praticienne', specialty: 'Dermatologie Esthétique', img: '/images/team/najwa.jpg' },
]

const STATS = [
  { number: '2000+', label: 'Patients satisfaits', icon: Star },
  { number: '5+', label: 'Années d\'expérience', icon: Certificate },
  { number: '15+', label: 'Traitements proposés', icon: Sparkle },
  { number: '98%', label: 'Taux de satisfaction', icon: Heart },
]

export default function About() {
  const { openScheduleModal } = useScheduleModalStore()

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [])

  return (
    <div style={{ background: C.bg, minHeight: '100vh' }}>
      <PublicNavbar />

      
      {/* Hero Section - Large Image with Decorative Elements */}
      <section className='relative overflow-hidden pt-32 pb-20'>
        {/* Decorative Background Elements */}
        <div className='absolute -top-20 -right-20 h-96 w-96 rounded-full opacity-10 blur-3xl' style={{ background: C.primary }} />
        <div className='absolute top-40 -left-32 h-80 w-80 rounded-full opacity-8 blur-3xl' style={{ background: C.orange }} />
        
        {/* Decorative Leaf SVG - Top Right */}
        <svg className='absolute top-24 right-12 h-32 w-32 opacity-20' viewBox='0 0 100 100' fill='none'>
          <path d='M50 10 Q80 40 90 70 Q70 80 50 90 Q40 70 30 50 Q40 30 50 10Z' fill={C.orange} opacity='0.3' />
          <path d='M50 10 Q20 40 10 70 Q30 80 50 90' stroke={C.orange} strokeWidth='1' fill='none' opacity='0.4' />
        </svg>
        
        {/* Decorative Leaf SVG - Bottom Left */}
        <svg className='absolute bottom-12 left-12 h-40 w-40 opacity-15' viewBox='0 0 100 100' fill='none'>
          <circle cx='50' cy='50' r='30' fill={C.primary} opacity='0.2' />
          <circle cx='30' cy='30' r='15' fill={C.orange} opacity='0.3' />
        </svg>

        <div className='max-w-7xl mx-auto px-4 sm:px-6'>
          <div className='grid lg:grid-cols-2 gap-12 lg:gap-16 items-center'>
            {/* Left Content */}
            <div className='space-y-8 relative z-10'>
              <div className='inline-flex items-center gap-2 px-5 py-2.5 rounded-full' style={{ background: `${C.primary}12`, border: `1px solid ${C.primary}25` }}>
                <Sparkle size={20} weight='duotone' style={{ color: C.primary }} />
                <span className='text-sm font-semibold' style={{ color: C.primary }}>Excellence Médicale depuis 2019</span>
              </div>

              <h1 className='font-amoria leading-[1.08]' style={{ fontSize: 'clamp(2.5rem, 5.5vw, 5rem)', color: C.secondary, letterSpacing: '-0.02em' }}>
                Rehaussez votre beauté avec <span style={{ color: C.primary, fontStyle: 'italic' }}>expert care</span>
              </h1>

              <p className='text-lg leading-relaxed max-w-xl' style={{ color: C.secondary, opacity: 0.75, fontFamily: TYPE.bodyFamily }}>
                Chez Widamine, nous combinons l'art de la médecine esthétique avec les technologies les plus avancées 
                pour vous offrir des résultats naturels et harmonieux.
              </p>

              <div className='flex flex-wrap gap-4 pt-4'>
                <button
                  onClick={openScheduleModal}
                  className='group inline-flex items-center gap-3 px-8 py-4 rounded-full text-white font-semibold transition-all hover:scale-105 active:scale-95'
                  style={{ 
                    background: C.primary, 
                    boxShadow: '0 8px 24px rgba(0,159,214,0.3)',
                  }}
                >
                  Réserver une consultation
                  <ArrowRight size={20} weight='bold' className='transition-transform group-hover:translate-x-1' />
                </button>
              </div>

              {/* Quick Contact Info */}
              <div className='flex flex-wrap gap-6 pt-6 border-t border-secondary/10'>
                <div className='flex items-center gap-3'>
                  <div className='flex h-11 w-11 items-center justify-center rounded-xl' style={{ background: `${C.primary}10` }}>
                    <PhoneCall size={20} weight='duotone' style={{ color: C.primary }} />
                  </div>
                  <div>
                    <div className='text-xs font-medium opacity-60' style={{ color: C.secondary }}>Appelez-nous</div>
                    <a href='tel:+212522365247' className='text-sm font-semibold hover:underline' style={{ color: C.secondary }}>
                      05 22 36 52 47
                    </a>
                  </div>
                </div>
                <div className='flex items-center gap-3'>
                  <div className='flex h-11 w-11 items-center justify-center rounded-xl' style={{ background: `${C.orange}10` }}>
                    <Clock size={20} weight='duotone' style={{ color: C.orange }} />
                  </div>
                  <div>
                    <div className='text-xs font-medium opacity-60' style={{ color: C.secondary }}>Horaires</div>
                    <div className='text-sm font-semibold' style={{ color: C.secondary }}>Lun - Sam: 9h - 19h</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Hero Image with Circular Cutout */}
            <div className='relative'>
              {/* Main circular image */}
              <div className='relative mx-auto' style={{ maxWidth: '520px' }}>
                <div className='aspect-square rounded-full overflow-hidden relative' style={{ 
                  boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                  border: `8px solid white`,
                }}>
                  <img 
                    src='/images/gallery/DSC01316.jpg' 
                    alt='Centre Widamine'
                    className='w-full h-full object-cover'
                  />
                  {/* Overlay gradient */}
                  <div className='absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/10' />
                </div>

                {/* Floating badge - Top right */}
                <div 
                  className='absolute -top-4 -right-4 bg-white px-6 py-4 rounded-2xl shadow-lg'
                  style={{ border: `2px solid ${C.primary}15` }}
                >
                  <div className='flex items-center gap-3'>
                    <div className='flex h-12 w-12 items-center justify-center rounded-full' style={{ background: `${C.orange}15` }}>
                      <Star size={24} weight='fill' style={{ color: C.orange }} />
                    </div>
                    <div>
                      <div className='font-amoria text-2xl font-bold' style={{ color: C.secondary }}>98%</div>
                      <div className='text-xs font-medium opacity-70' style={{ color: C.secondary }}>Satisfaction</div>
                    </div>
                  </div>
                </div>

                {/* Floating badge - Bottom left */}
                <div 
                  className='absolute -bottom-6 -left-6 bg-white px-6 py-4 rounded-2xl shadow-lg'
                  style={{ border: `2px solid ${C.primary}15` }}
                >
                  <div className='flex items-center gap-3'>
                    <div className='flex h-12 w-12 items-center justify-center rounded-full' style={{ background: `${C.primary}15` }}>
                      <Certificate size={24} weight='duotone' style={{ color: C.primary }} />
                    </div>
                    <div>
                      <div className='font-amoria text-2xl font-bold' style={{ color: C.secondary }}>5+</div>
                      <div className='text-xs font-medium opacity-70' style={{ color: C.secondary }}>Années</div>
                    </div>
                  </div>
                </div>

                {/* Decorative circles */}
                <div className='absolute -top-8 -left-8 h-24 w-24 rounded-full opacity-20' style={{ background: C.primary }} />
                <div className='absolute -bottom-10 -right-10 h-32 w-32 rounded-full opacity-15' style={{ background: C.orange }} />
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Services Highlight Section */}
      <section className='py-20' style={{ background: 'white' }}>
        <div className='max-w-7xl mx-auto px-4 sm:px-6'>
          <div className='text-center mb-16'>
            <div className='inline-block px-5 py-2 rounded-full mb-4' style={{ background: `${C.orange}12`, border: `1px solid ${C.orange}20` }}>
              <span className='text-sm font-semibold' style={{ color: C.orange }}>Nos Services</span>
            </div>
            <h2 className='font-amoria mb-4' style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', color: C.secondary, letterSpacing: '-0.01em' }}>
              Des soins <span style={{ color: C.primary, fontStyle: 'italic' }}>sur mesure</span> pour vous
            </h2>
            <p className='text-lg max-w-2xl mx-auto' style={{ color: C.secondary, opacity: 0.7, fontFamily: TYPE.bodyFamily }}>
              Technologies avancées et expertise médicale pour des résultats naturels
            </p>
          </div>

          <div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-6'>
            {SERVICES_HIGHLIGHT.map((service, i) => (
              <div 
                key={i} 
                className='group relative p-8 rounded-3xl transition-all duration-300 hover:-translate-y-2'
                style={{ 
                  background: 'white',
                  border: `1px solid ${C.primary}12`,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,159,214,0.15)'
                  e.currentTarget.style.borderColor = `${C.primary}30`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)'
                  e.currentTarget.style.borderColor = `${C.primary}12`
                }}
              >
                <div 
                  className='flex h-16 w-16 items-center justify-center rounded-2xl mb-6 transition-transform duration-300 group-hover:scale-110'
                  style={{ background: `${C.primary}12` }}
                >
                  <service.icon size={32} weight='duotone' style={{ color: C.primary }} />
                </div>
                <h3 className='font-semibold text-lg mb-3' style={{ color: C.secondary }}>
                  {service.title}
                </h3>
                <p className='text-sm leading-relaxed mb-4' style={{ color: C.secondary, opacity: 0.7, fontFamily: TYPE.bodyFamily }}>
                  {service.desc}
                </p>
                <div className='flex items-center gap-2 text-sm font-semibold transition-all group-hover:gap-3' style={{ color: C.primary }}>
                  En savoir plus
                  <ArrowRight size={16} weight='bold' />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Team Section */}
      <section className='py-24' style={{ background: C.bg }}>
        <div className='max-w-7xl mx-auto px-4 sm:px-6'>
          <div className='text-center mb-16'>
            <div className='inline-block px-5 py-2 rounded-full mb-4' style={{ background: `${C.primary}12`, border: `1px solid ${C.primary}25` }}>
              <span className='text-sm font-semibold' style={{ color: C.primary }}>Notre Équipe</span>
            </div>
            <h2 className='font-amoria mb-4' style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', color: C.secondary, letterSpacing: '-0.01em' }}>
              Des experts <span style={{ color: C.primary, fontStyle: 'italic' }}>passionnés</span> à votre service
            </h2>
            <p className='text-lg max-w-2xl mx-auto' style={{ color: C.secondary, opacity: 0.7, fontFamily: TYPE.bodyFamily }}>
              Une équipe pluridisciplinaire formée aux dernières techniques de médecine esthétique
            </p>
          </div>

          <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-8'>
            {TEAM_MEMBERS.map((member, i) => (
              <div key={i} className='group'>
                <div 
                  className='relative overflow-hidden rounded-3xl mb-5 transition-all duration-500'
                  style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)'
                    e.currentTarget.style.boxShadow = '0 16px 50px rgba(0,159,214,0.2)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.1)'
                  }}
                >
                  <img 
                    src={member.img} 
                    alt={member.name}
                    className='w-full aspect-[3/4] object-cover'
                    style={{ outline: '1px solid oklch(0 0 0 / 0.08)', outlineOffset: '-1px' }}
                    onError={(e) => {
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=009fd6&color=fff&size=400`
                    }}
                  />
                  
                  {/* Hover Overlay */}
                  <div 
                    className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 transition-opacity duration-500 flex items-end p-6'
                    style={{ pointerEvents: 'none' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '1'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '0'
                    }}
                  >
                    <div className='text-white'>
                      <div className='text-xs font-medium mb-1 opacity-90'>{member.specialty}</div>
                      <div className='text-sm font-semibold'>{member.role}</div>
                    </div>
                  </div>

                  {/* Badge for first member */}
                  {i === 0 && (
                    <div 
                      className='absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-semibold text-white'
                      style={{ background: C.primary, boxShadow: '0 4px 12px rgba(0,159,214,0.4)' }}
                    >
                      Fondatrice
                    </div>
                  )}
                </div>

                <div className='text-center'>
                  <h3 className='font-semibold text-lg mb-1' style={{ color: C.secondary }}>
                    {member.name}
                  </h3>
                  <p className='text-sm font-medium' style={{ color: C.primary }}>
                    {member.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Stats & Trust Section */}
      <section className='py-20' style={{ background: 'white' }}>
        <div className='max-w-7xl mx-auto px-4 sm:px-6'>
          {/* Stats Grid */}
          <div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20'>
            {STATS.map((stat, i) => (
              <div 
                key={i}
                className='group text-center p-8 rounded-3xl transition-all duration-300 hover:-translate-y-2'
                style={{ 
                  background: i % 2 === 0 ? `${C.primary}08` : `${C.orange}08`,
                  border: `1px solid ${i % 2 === 0 ? C.primary : C.orange}15`
                }}
              >
                <div 
                  className='flex h-16 w-16 items-center justify-center rounded-2xl mx-auto mb-4 transition-transform duration-300 group-hover:scale-110'
                  style={{ background: i % 2 === 0 ? `${C.primary}15` : `${C.orange}15` }}
                >
                  <stat.icon size={32} weight='duotone' style={{ color: i % 2 === 0 ? C.primary : C.orange }} />
                </div>
                <div 
                  className='font-amoria text-5xl font-bold mb-2 tabular-nums'
                  style={{ 
                    color: C.secondary,
                    fontVariantNumeric: 'tabular-nums'
                  }}
                >
                  {stat.number}
                </div>
                <div className='text-sm font-medium' style={{ color: C.secondary, opacity: 0.7 }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Why Choose Us */}
          <div className='grid lg:grid-cols-2 gap-12 items-center'>
            <div>
              <div className='inline-block px-5 py-2 rounded-full mb-6' style={{ background: `${C.orange}12`, border: `1px solid ${C.orange}20` }}>
                <span className='text-sm font-semibold' style={{ color: C.orange }}>Pourquoi Widamine ?</span>
              </div>
              <h2 className='font-amoria mb-6' style={{ fontSize: 'clamp(1.75rem, 3.5vw, 3rem)', color: C.secondary, letterSpacing: '-0.01em' }}>
                L'excellence médicale au <span style={{ color: C.primary, fontStyle: 'italic' }}>cœur</span> de nos soins
              </h2>
              <p className='text-base leading-relaxed mb-8' style={{ color: C.secondary, opacity: 0.75, fontFamily: TYPE.bodyFamily }}>
                Chez Widamine, nous combinons expertise médicale, technologies de pointe et approche personnalisée 
                pour vous garantir les meilleurs résultats en toute sécurité.
              </p>

              <div className='space-y-4'>
                {[
                  'Équipe médicale certifiée et expérimentée',
                  'Protocoles personnalisés selon vos besoins',
                  'Technologies dernière génération',
                  'Suivi post-traitement rigoureux',
                  'Environnement médical sécurisé'
                ].map((item, i) => (
                  <div key={i} className='flex items-center gap-4'>
                    <div 
                      className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl'
                      style={{ background: `${C.primary}12` }}
                    >
                      <Check size={20} weight='bold' style={{ color: C.primary }} />
                    </div>
                    <span className='text-sm font-medium' style={{ color: C.secondary }}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className='relative'>
              <div className='aspect-[4/5] rounded-3xl overflow-hidden' style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.12)' }}>
                <img 
                  src='/images/gallery/DSC01316.jpg' 
                  alt='Centre Widamine'
                  className='w-full h-full object-cover'
                  style={{ outline: '1px solid oklch(0 0 0 / 0.08)', outlineOffset: '-1px' }}
                />
              </div>

              {/* Decorative elements */}
              <div className='absolute -bottom-8 -right-8 h-40 w-40 rounded-3xl opacity-15' style={{ background: C.primary }} />
              <div className='absolute -top-8 -left-8 h-32 w-32 rounded-full opacity-20' style={{ background: C.orange }} />
            </div>
          </div>
        </div>
      </section>


      {/* CTA Section */}
      <section className='py-24 relative overflow-hidden' style={{ background: `linear-gradient(135deg, ${C.primary} 0%, ${C.secondary} 100%)` }}>
        {/* Decorative elements */}
        <div className='absolute top-0 right-0 h-96 w-96 rounded-full opacity-10 blur-3xl' style={{ background: 'white' }} />
        <div className='absolute bottom-0 left-0 h-80 w-80 rounded-full opacity-10 blur-3xl' style={{ background: C.orange }} />

        <div className='max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10'>
          <div className='inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-6' style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}>
            <Sparkle size={18} weight='duotone' className='text-white' />
            <span className='text-sm font-semibold text-white'>Commencez votre parcours beauté</span>
          </div>

          <h2 className='font-amoria leading-tight mb-6 text-white' style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: '-0.01em' }}>
            Prêt à révéler votre <span style={{ fontStyle: 'italic' }}>meilleure version</span> ?
          </h2>
          
          <p className='text-lg leading-relaxed mb-10 text-white/90 max-w-2xl mx-auto' style={{ fontFamily: TYPE.bodyFamily }}>
            Réservez votre consultation gratuite et découvrez comment nos experts peuvent vous aider 
            à atteindre vos objectifs esthétiques en toute confiance.
          </p>

          <div className='flex flex-wrap items-center justify-center gap-4 mb-12'>
            <button
              onClick={openScheduleModal}
              className='group inline-flex items-center justify-center gap-3 px-10 py-5 rounded-full bg-white font-semibold transition-all hover:scale-105 active:scale-95'
              style={{ 
                color: C.primary,
                boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
              }}
            >
              Réserver ma consultation gratuite
              <ArrowRight size={20} weight='bold' className='transition-transform group-hover:translate-x-1' />
            </button>
            
            <a
              href='tel:+212522365247'
              className='inline-flex items-center justify-center gap-3 px-10 py-5 rounded-full border-2 border-white font-semibold text-white transition-all hover:bg-white/10 active:scale-95'
            >
              <PhoneCall size={20} weight='duotone' />
              05 22 36 52 47
            </a>
          </div>

          {/* Contact Info Cards */}
          <div className='grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto'>
            <div className='p-6 rounded-2xl backdrop-blur-sm' style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
              <div className='flex h-12 w-12 items-center justify-center rounded-xl mx-auto mb-3' style={{ background: 'rgba(255,255,255,0.15)' }}>
                <MapPin size={24} weight='duotone' className='text-white' />
              </div>
              <div className='text-sm font-semibold text-white mb-1'>Adresse</div>
              <div className='text-sm text-white/80'>Casablanca, Maroc</div>
            </div>

            <div className='p-6 rounded-2xl backdrop-blur-sm' style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
              <div className='flex h-12 w-12 items-center justify-center rounded-xl mx-auto mb-3' style={{ background: 'rgba(255,255,255,0.15)' }}>
                <Clock size={24} weight='duotone' className='text-white' />
              </div>
              <div className='text-sm font-semibold text-white mb-1'>Horaires</div>
              <div className='text-sm text-white/80'>Lun - Sam: 9h - 19h</div>
            </div>

            <div className='p-6 rounded-2xl backdrop-blur-sm' style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
              <div className='flex h-12 w-12 items-center justify-center rounded-xl mx-auto mb-3' style={{ background: 'rgba(255,255,255,0.15)' }}>
                <PhoneCall size={24} weight='duotone' className='text-white' />
              </div>
              <div className='text-sm font-semibold text-white mb-1'>Téléphone</div>
              <div className='text-sm text-white/80'>05 22 36 52 47</div>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
