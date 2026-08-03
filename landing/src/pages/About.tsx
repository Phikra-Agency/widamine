import { useEffect } from 'react'
import { PhoneCall, ArrowRight, Check, Clock, MapPin, Sparkle } from '@phosphor-icons/react'
import { useScheduleModalStore } from '@/stores/scheduleModalStore'
import PublicNavbar from '@/components/PublicNavbar'
import PublicFooter from '@/components/PublicFooter'
import { C, TYPE } from '@/lib/theme'

const TEAM_MEMBERS = [
  { name: 'Dr. Widad Slaoui', role: 'Médecin Esthétique', img: '/images/team/widad.jpg' },
  { name: 'Chaymae Ez Ouhri', role: 'Praticienne Certifiée', img: '/images/team/chaymae ez ouhri .jpg' },
  { name: 'Ihssan', role: 'Praticien Expert', img: '/images/team/ihssan.jpg' },
  { name: 'Ilham', role: 'Praticienne Senior', img: '/images/team/ilham.jpg' },
  { name: 'Loubna', role: 'Praticienne', img: '/images/team/loubna .jpg' },
  { name: 'Najwa', role: 'Praticienne', img: '/images/team/najwa.jpg' },
]

export default function About() {
  const { open } = useScheduleModalStore()

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [])

  return (
    <div style={{ background: C.bg, minHeight: '100vh' }}>
      <PublicNavbar />

      {/* Hero */}
      <section className='pt-32 pb-20'>
        <div className='max-w-6xl mx-auto px-4 sm:px-6'>
          <div className='grid lg:grid-cols-2 gap-12 items-center'>
            <div className='space-y-6'>
              <div className='inline-flex items-center gap-2 px-4 py-2 rounded-full' style={{ background: `${C.primary}12`, border: `1px solid ${C.primary}25` }}>
                <Sparkle size={18} weight='duotone' style={{ color: C.primary }} />
                <span className='text-sm font-semibold' style={{ color: C.primary }}>À propos de Widamine</span>
              </div>

              <h1 className='font-amoria leading-tight' style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', color: C.secondary, letterSpacing: '-0.02em' }}>
                Excellence en médecine esthétique
              </h1>

              <p className='text-lg leading-relaxed' style={{ color: C.secondary, opacity: 0.75, fontFamily: TYPE.bodyFamily }}>
                Chez Widamine, nous combinons expertise médicale et technologies avancées pour révéler votre beauté naturelle en toute sécurité.
              </p>

              <div className='flex flex-wrap gap-4 pt-4'>
                <button
                  onClick={open}
                  className='inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-semibold transition-transform hover:scale-105'
                  style={{ background: C.primary, boxShadow: '0 8px 24px rgba(0,159,214,0.3)' }}
                >
                  Réserver une consultation
                  <ArrowRight size={18} weight='bold' />
                </button>
              </div>
            </div>

            <div className='relative'>
              <div className='aspect-square rounded-3xl overflow-hidden' style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
                <img src='/images/gallery/DSC01316.jpg' alt='Centre Widamine' className='w-full h-full object-cover' />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className='py-20' style={{ background: 'white' }}>
        <div className='max-w-6xl mx-auto px-4 sm:px-6'>
          <div className='text-center mb-12'>
            <h2 className='font-amoria mb-4' style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: C.secondary }}>
              Notre équipe
            </h2>
            <p className='text-lg max-w-2xl mx-auto' style={{ color: C.secondary, opacity: 0.7, fontFamily: TYPE.bodyFamily }}>
              Des experts passionnés à votre service
            </p>
          </div>

          <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-8'>
            {TEAM_MEMBERS.map((member, i) => (
              <div key={i} className='group'>
                <div 
                  className='relative overflow-hidden rounded-2xl mb-4 transition-transform duration-300'
                  style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
                >
                  <img 
                    src={member.img} 
                    alt={member.name}
                    className='w-full aspect-[3/4] object-cover'
                    onError={(e) => {
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=009fd6&color=fff&size=400`
                    }}
                  />
                  {i === 0 && (
                    <div 
                      className='absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold text-white'
                      style={{ background: C.primary }}
                    >
                      Fondatrice
                    </div>
                  )}
                </div>
                <h3 className='font-semibold text-lg mb-1' style={{ color: C.secondary }}>{member.name}</h3>
                <p className='text-sm font-medium' style={{ color: C.primary }}>{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className='py-20' style={{ background: C.bg }}>
        <div className='max-w-6xl mx-auto px-4 sm:px-6'>
          <div className='grid lg:grid-cols-2 gap-12 items-center'>
            <div>
              <h2 className='font-amoria mb-6' style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', color: C.secondary }}>
                Pourquoi choisir Widamine ?
              </h2>
              <p className='text-base leading-relaxed mb-8' style={{ color: C.secondary, opacity: 0.75, fontFamily: TYPE.bodyFamily }}>
                Une équipe médicale certifiée, des technologies de pointe et des protocoles personnalisés pour des résultats naturels et sécurisés.
              </p>
              <div className='space-y-3'>
                {[
                  'Équipe médicale certifiée',
                  'Protocoles personnalisés',
                  'Technologies avancées',
                  'Suivi post-traitement',
                  'Environnement sécurisé'
                ].map((item, i) => (
                  <div key={i} className='flex items-center gap-3'>
                    <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg' style={{ background: `${C.primary}12` }}>
                      <Check size={16} weight='bold' style={{ color: C.primary }} />
                    </div>
                    <span className='text-sm font-medium' style={{ color: C.secondary }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className='relative'>
              <div className='aspect-[4/5] rounded-2xl overflow-hidden' style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.12)' }}>
                <img src='/images/gallery/DSC01316.jpg' alt='Centre' className='w-full h-full object-cover' />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className='py-20 relative overflow-hidden' style={{ background: `linear-gradient(135deg, ${C.primary} 0%, ${C.secondary} 100%)` }}>
        <div className='max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10'>
          <h2 className='font-amoria leading-tight mb-6 text-white' style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
            Prêt à commencer ?
          </h2>
          <p className='text-lg leading-relaxed mb-8 text-white/90 max-w-2xl mx-auto' style={{ fontFamily: TYPE.bodyFamily }}>
            Réservez votre consultation et découvrez comment nous pouvons vous aider.
          </p>
          <div className='flex flex-wrap items-center justify-center gap-4'>
            <button
              onClick={open}
              className='inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white font-semibold transition-transform hover:scale-105'
              style={{ color: C.primary, boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}
            >
              Réserver maintenant
              <ArrowRight size={18} weight='bold' />
            </button>
            <a
              href='tel:+212522365247'
              className='inline-flex items-center gap-2 px-8 py-4 rounded-full border-2 border-white font-semibold text-white transition-all hover:bg-white/10'
            >
              <PhoneCall size={18} weight='duotone' />
              05 22 36 52 47
            </a>
          </div>

          {/* Contact Cards */}
          <div className='grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto mt-12'>
            <div className='p-4 rounded-xl backdrop-blur-sm' style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
              <MapPin size={20} weight='duotone' className='text-white mx-auto mb-2' />
              <div className='text-xs font-semibold text-white mb-1'>Adresse</div>
              <div className='text-xs text-white/80'>Casablanca, Maroc</div>
            </div>
            <div className='p-4 rounded-xl backdrop-blur-sm' style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
              <Clock size={20} weight='duotone' className='text-white mx-auto mb-2' />
              <div className='text-xs font-semibold text-white mb-1'>Horaires</div>
              <div className='text-xs text-white/80'>Lun - Sam: 9h - 19h</div>
            </div>
            <div className='p-4 rounded-xl backdrop-blur-sm' style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
              <PhoneCall size={20} weight='duotone' className='text-white mx-auto mb-2' />
              <div className='text-xs font-semibold text-white mb-1'>Téléphone</div>
              <div className='text-xs text-white/80'>05 22 36 52 47</div>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
