import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, PhoneCall, Heart, Users, Sparkle, Target, CheckCircle } from '@phosphor-icons/react'
import { useScheduleModalStore } from '@/stores/scheduleModalStore'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import PublicNavbar from '@/components/PublicNavbar'
import PublicFooter from '@/components/PublicFooter'
import { C, TYPE } from '@/lib/theme'

gsap.registerPlugin(ScrollTrigger)

const TEAM_MEMBERS = [
  { name: 'Dr. Widad Slaoui', role: 'Médecin Esthétique', img: '/images/team/widad.jpg' },
  { name: 'Chaymae Ez Ouhri', role: 'Praticienne', img: '/images/team/chaymae ez ouhri .jpg' },
  { name: 'Ihssan', role: 'Praticien', img: '/images/team/ihssan.jpg' },
  { name: 'Ilham', role: 'Praticienne', img: '/images/team/ilham.jpg' },
  { name: 'Loubna', role: 'Praticienne', img: '/images/team/loubna .jpg' },
  { name: 'Najwa', role: 'Praticienne', img: '/images/team/najwa.jpg' },
  { name: 'Nisrin', role: 'Praticienne', img: '/images/team/nisrin .jpg' },
]

const VALUES = [
  {
    icon: Heart,
    title: 'Excellence médicale',
    description: 'Des soins de la plus haute qualité avec les dernières technologies en médecine esthétique.',
  },
  {
    icon: Users,
    title: 'Approche personnalisée',
    description: 'Chaque patient est unique. Nous créons des plans de traitement sur mesure adaptés à vos besoins.',
  },
  {
    icon: Sparkle,
    title: 'Résultats naturels',
    description: 'Notre philosophie : sublimer votre beauté naturelle sans artifice.',
  },
  {
    icon: Target,
    title: 'Écoute et confiance',
    description: 'Un accompagnement bienveillant du premier rendez-vous au suivi post-traitement.',
  },
]

const ACHIEVEMENTS = [
  { number: '5+', label: 'Années d\'expérience' },
  { number: '2000+', label: 'Patients satisfaits' },
  { number: '15+', label: 'Traitements proposés' },
  { number: '98%', label: 'Taux de satisfaction' },
]

export default function About() {
  const heroRef = useRef<HTMLElement>(null)
  const { openScheduleModal } = useScheduleModalStore()

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('[data-fade]', {
        opacity: 0,
        y: 30,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power2.out',
      })

      gsap.from('[data-slide-up]', {
        scrollTrigger: {
          trigger: '[data-slide-up]',
          start: 'top 80%',
        },
        opacity: 0,
        y: 50,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power2.out',
      })
    }, heroRef)

    return () => ctx.revert()
  }, [])

  return (
    <div style={{ background: C.bg, minHeight: '100vh' }}>
      <PublicNavbar />
      
      {/* Hero Section */}
      <section ref={heroRef} className='relative overflow-hidden' style={{ paddingTop: '140px', paddingBottom: '80px' }}>
        {/* Decorative elements */}
        <div className='pointer-events-none absolute -top-20 -right-20 h-96 w-96 rounded-full opacity-20' style={{ background: `radial-gradient(circle, ${C.primary}40 0%, transparent 70%)` }} />
        <div className='pointer-events-none absolute -bottom-20 -left-20 h-80 w-80 rounded-full opacity-15' style={{ background: `radial-gradient(circle, ${C.accent}40 0%, transparent 70%)` }} />

        <div className='relative z-10 mx-auto max-w-7xl px-4 sm:px-6'>
          <div className='text-center'>
            <img src='/logo.svg' alt='Widamine' data-fade className='mx-auto mb-8 w-16 sm:w-20' />
            <h1 
              data-fade 
              className='mx-auto max-w-4xl font-amoria text-[2.5rem] leading-[1.1] sm:text-5xl md:text-6xl lg:text-7xl' 
              style={{ color: C.secondary }}
            >
              Votre centre d'excellence en <span style={{ color: C.primary, fontStyle: 'italic' }}>médecine esthétique</span>
            </h1>
            <p 
              data-fade 
              className='mx-auto mt-6 max-w-2xl text-base sm:text-lg leading-relaxed' 
              style={{ fontFamily: TYPE.bodyFamily, color: C.secondary, opacity: 0.75 }}
            >
              À Widamine, nous croyons que chaque personne mérite de se sentir bien dans sa peau. 
              Notre mission est de vous accompagner dans votre quête de beauté et de bien-être avec expertise, 
              écoute et bienveillance.
            </p>
            <div data-fade className='mt-10 flex flex-wrap items-center justify-center gap-4'>
              <button
                onClick={openScheduleModal}
                className='group inline-flex items-center gap-2 rounded-full px-8 py-4 text-base font-medium text-white shadow-lg transition-all hover:shadow-xl hover:scale-105'
                style={{ background: C.primary }}
              >
                Prendre rendez-vous
                <svg className='transition-transform group-hover:translate-x-1' width='16' height='16' viewBox='0 0 16 16' fill='none'>
                  <path d='M6 3L11 8L6 13' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
                </svg>
              </button>
              <Link
                to='/contact'
                className='inline-flex items-center gap-2 rounded-full border-2 px-8 py-4 text-base font-medium transition-all hover:shadow-md'
                style={{ borderColor: C.primary, color: C.primary }}
              >
                Nous contacter
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className='py-16 sm:py-20' style={{ background: C.primary }}>
        <div className='mx-auto max-w-7xl px-4 sm:px-6'>
          <div className='grid grid-cols-2 gap-8 sm:gap-12 lg:grid-cols-4'>
            {ACHIEVEMENTS.map((item, i) => (
              <div key={i} data-slide-up className='text-center'>
                <div className='font-amoria text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-2'>
                  {item.number}
                </div>
                <div className='text-sm sm:text-base text-white/80' style={{ fontFamily: TYPE.bodyFamily }}>
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className='py-20 sm:py-28'>
        <div className='mx-auto max-w-7xl px-4 sm:px-6'>
          <div className='grid lg:grid-cols-2 gap-12 lg:gap-16 items-center'>
            <div data-slide-up>
              <div className='inline-block rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider mb-6' style={{ background: `${C.primary}15`, color: C.primary }}>
                Notre Histoire
              </div>
              <h2 className='font-amoria text-3xl sm:text-4xl lg:text-5xl leading-tight mb-6' style={{ color: C.secondary }}>
                Une vision, une passion : <span style={{ color: C.primary, fontStyle: 'italic' }}>votre beauté</span>
              </h2>
              <div className='space-y-4 text-base leading-relaxed' style={{ fontFamily: TYPE.bodyFamily, color: C.secondary, opacity: 0.8 }}>
                <p>
                  Fondé par <strong>Dr. Widad Slaoui</strong>, Widamine est né d'une vision claire : créer un espace où la médecine esthétique 
                  rencontre l'art et l'humanité. Avec plus de 5 ans d'expérience, notre clinique s'est imposée comme une référence 
                  en matière de soins esthétiques au Maroc.
                </p>
                <p>
                  Notre approche se distingue par l'écoute attentive de chaque patient, une expertise technique irréprochable, 
                  et un engagement sans faille pour des résultats naturels et harmonieux. Nous croyons que la beauté ne se force pas, 
                  elle se révèle.
                </p>
                <p>
                  Aujourd'hui, <strong>Widamine</strong> c'est une équipe de praticiens passionnés, des équipements de pointe, 
                  et surtout, la confiance de plus de 2000 patients qui nous ont choisis pour les accompagner dans leur parcours beauté.
                </p>
              </div>
            </div>
            <div data-slide-up className='relative'>
              <div className='overflow-hidden rounded-3xl shadow-2xl'>
                <img 
                  src='/images/gallery/DSC01316.jpg' 
                  alt='Centre Widamine' 
                  className='w-full h-[500px] object-cover'
                />
              </div>
              {/* Floating decoration */}
              <div className='absolute -bottom-6 -right-6 w-32 h-32 rounded-full opacity-20' style={{ background: C.accent }} />
              <div className='absolute -top-6 -left-6 w-24 h-24 rounded-full opacity-15' style={{ background: C.primary }} />
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className='py-20 sm:py-28' style={{ background: C.customWhite }}>
        <div className='mx-auto max-w-7xl px-4 sm:px-6'>
          <div className='text-center mb-16'>
            <div data-slide-up className='inline-block rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider mb-6' style={{ background: `${C.primary}15`, color: C.primary }}>
              Nos Valeurs
            </div>
            <h2 data-slide-up className='font-amoria text-3xl sm:text-4xl lg:text-5xl leading-tight mb-6' style={{ color: C.secondary }}>
              Ce qui nous <span style={{ color: C.primary, fontStyle: 'italic' }}>anime</span>
            </h2>
          </div>

          <div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-8'>
            {VALUES.map((value, i) => (
              <div 
                key={i} 
                data-slide-up 
                className='group text-center p-8 rounded-2xl transition-all hover:shadow-xl'
                style={{ background: 'white', border: `1px solid ${C.primary}15` }}
              >
                <div className='inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 transition-transform group-hover:scale-110' style={{ background: `${C.primary}10`, color: C.primary }}>
                  <value.icon size={32} weight='duotone' />
                </div>
                <h3 className='font-amoria text-xl mb-3' style={{ color: C.secondary }}>
                  {value.title}
                </h3>
                <p className='text-sm leading-relaxed' style={{ fontFamily: TYPE.bodyFamily, color: C.secondary, opacity: 0.7 }}>
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className='py-20 sm:py-28'>
        <div className='mx-auto max-w-7xl px-4 sm:px-6'>
          <div className='text-center mb-16'>
            <div data-slide-up className='inline-block rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider mb-6' style={{ background: `${C.primary}15`, color: C.primary }}>
              Notre Équipe
            </div>
            <h2 data-slide-up className='font-amoria text-3xl sm:text-4xl lg:text-5xl leading-tight mb-6' style={{ color: C.secondary }}>
              Des experts à votre <span style={{ color: C.primary, fontStyle: 'italic' }}>écoute</span>
            </h2>
            <p data-slide-up className='mx-auto max-w-2xl text-base leading-relaxed' style={{ fontFamily: TYPE.bodyFamily, color: C.secondary, opacity: 0.75 }}>
              Une équipe pluridisciplinaire de praticiens passionnés, formés aux dernières techniques 
              de médecine esthétique pour vous offrir les meilleurs soins.
            </p>
          </div>

          <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8'>
            {TEAM_MEMBERS.map((member, i) => (
              <div key={i} data-slide-up className='group text-center'>
                <div className='relative mb-4 overflow-hidden rounded-2xl shadow-lg transition-transform group-hover:scale-105'>
                  <img 
                    src={member.img} 
                    alt={member.name}
                    className='w-full aspect-[3/4] object-cover'
                    onError={(e) => {
                      e.currentTarget.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(member.name) + '&background=009fd6&color=fff&size=400'
                    }}
                  />
                  <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity' />
                </div>
                <h3 className='font-semibold text-base mb-1' style={{ color: C.secondary }}>
                  {member.name}
                </h3>
                <p className='text-sm' style={{ color: C.primary }}>
                  {member.role}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='py-20 sm:py-28' style={{ background: `linear-gradient(135deg, ${C.primary} 0%, ${C.secondary} 100%)` }}>
        <div className='mx-auto max-w-4xl px-4 sm:px-6 text-center'>
          <h2 data-slide-up className='font-amoria text-3xl sm:text-4xl lg:text-5xl leading-tight mb-6 text-white'>
            Prêt à commencer votre transformation ?
          </h2>
          <p data-slide-up className='text-base sm:text-lg leading-relaxed mb-10 text-white/90' style={{ fontFamily: TYPE.bodyFamily }}>
            Prenez rendez-vous dès aujourd'hui et découvrez comment nous pouvons vous aider 
            à atteindre vos objectifs esthétiques en toute confiance.
          </p>
          <div data-slide-up className='flex flex-wrap items-center justify-center gap-4'>
            <button
              onClick={openScheduleModal}
              className='group inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-base font-medium shadow-lg transition-all hover:shadow-xl hover:scale-105'
              style={{ color: C.primary }}
            >
              Prendre rendez-vous maintenant
              <svg className='transition-transform group-hover:translate-x-1' width='16' height='16' viewBox='0 0 16 16' fill='none'>
                <path d='M6 3L11 8L6 13' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
              </svg>
            </button>
            <a
              href='tel:+212522365247'
              className='inline-flex items-center gap-2 rounded-full border-2 border-white px-8 py-4 text-base font-medium text-white transition-all hover:bg-white/10'
            >
              <PhoneCall size={20} weight='duotone' />
              05 22 36 52 47
            </a>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
