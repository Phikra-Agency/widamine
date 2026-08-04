import { useEffect } from 'react'
import { useScheduleModalStore } from '@/stores/scheduleModalStore'
import PublicNavbar from '@/components/PublicNavbar'
import { C, TYPE } from '@/lib/theme'

const TEAM_MEMBERS = [
  { name: 'Dr. Widad Slaoui', role: 'Dermatologue Esthétique', img: '/images/team/dr widad slaoui.jpg', founder: true },
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
      <section className='pt-32 pb-16 sm:pt-40 sm:pb-20'>
        <div className='mx-auto max-w-7xl px-6 sm:px-8'>
          <p className='text-xs font-bold tracking-[0.25em] uppercase mb-4' style={{ color: C.primary }}>
            À PROPOS DE WIDAMINE
          </p>
          <h1 
            className='leading-[1.05] mb-6 text-balance'
            style={{ 
              fontFamily: TYPE.headingFamily,
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              color: C.secondary,
            }}
          >
            Une vision, une <span style={{ color: C.primary, fontStyle: 'italic' }}>passion</span>, une expertise
          </h1>
          <p className='text-lg leading-relaxed max-w-2xl' style={{ color: `${C.secondary}dd` }}>
            Depuis 2018, le Widamine Aesthetic Center combine expertise médicale, innovation technologique et approche humaine pour sublimer la beauté naturelle de chaque patient.
          </p>
        </div>
      </section>

      {/* Images */}
      <section className='pb-16 sm:pb-20'>
        <div className='mx-auto max-w-7xl px-6 sm:px-8'>
          <div className='grid lg:grid-cols-2 gap-6'>
            <div className='overflow-hidden rounded-3xl' style={{ boxShadow: '0 20px 60px -16px rgba(0,0,0,0.12)' }}>
              <img 
                src='/images/gallery/clinic-interior.jpg' 
                alt='Centre Widamine' 
                className='w-full h-full object-cover aspect-[4/3] transition-transform duration-700 hover:scale-105'
              />
            </div>
            <div className='overflow-hidden rounded-3xl' style={{ boxShadow: '0 20px 60px -16px rgba(0,0,0,0.12)' }}>
              <img 
                src='/images/gallery/DSC01374.jpg' 
                alt='Soins Widamine' 
                className='w-full h-full object-cover aspect-[4/3] transition-transform duration-700 hover:scale-105'
              />
            </div>
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className='py-20 sm:py-28' style={{ background: 'white' }}>
        <div className='mx-auto max-w-7xl px-6 sm:px-8'>
          <div className='grid lg:grid-cols-2 gap-16 items-start'>
            <div>
              <p className='text-xs font-bold tracking-[0.25em] uppercase mb-4' style={{ color: C.primary }}>
                NOTRE VISION
              </p>
              <h2 
                className='leading-tight mb-6'
                style={{ 
                  fontFamily: TYPE.headingFamily,
                  fontSize: 'clamp(2rem, 4vw, 3rem)',
                  color: C.secondary,
                }}
              >
                La beauté naturelle sublimée par la science
              </h2>
              <p className='text-base leading-loose' style={{ color: `${C.secondary}cc` }}>
                Notre mission est d'offrir à chaque patient une expérience unique qui allie expertise médicale, technologies de pointe et écoute attentive.
              </p>
            </div>
            
            <div className='space-y-8'>
              <div>
                <h3 className='text-2xl mb-3' style={{ fontFamily: TYPE.headingFamily, color: C.secondary }}>
                  <span style={{ color: C.primary, fontStyle: 'italic' }}>Expertise</span> et innovation
                </h3>
                <p className='text-base leading-loose' style={{ color: `${C.secondary}cc` }}>
                  Nous investissons continuellement dans la formation de notre équipe et l'acquisition des technologies les plus avancées.
                </p>
              </div>
              
              <div>
                <h3 className='text-2xl mb-3' style={{ fontFamily: TYPE.headingFamily, color: C.secondary }}>
                  <span style={{ color: C.primary, fontStyle: 'italic' }}>Écoute</span> et personnalisation
                </h3>
                <p className='text-base leading-loose' style={{ color: `${C.secondary}cc` }}>
                  Chaque consultation commence par une écoute attentive. Nous concevons ensuite un protocole sur mesure adapté à votre peau.
                </p>
              </div>
              
              <button
                onClick={open}
                className='inline-flex items-center rounded-full px-7 py-3.5 text-sm font-semibold text-white shadow-lg transition-transform hover:-translate-y-1 active:scale-95'
                style={{ background: C.primary }}
              >
                Réserver une consultation
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className='py-20 sm:py-28' style={{ background: C.bg }}>
        <div className='mx-auto max-w-7xl px-6 sm:px-8'>
          <div className='mb-16 text-center max-w-3xl mx-auto'>
            <p className='text-xs font-bold tracking-[0.25em] uppercase mb-4' style={{ color: C.primary }}>
              NOS VALEURS
            </p>
            <h2 
              className='leading-tight'
              style={{ 
                fontFamily: TYPE.headingFamily,
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                color: C.secondary,
              }}
            >
              Ce qui nous <span style={{ color: C.primary, fontStyle: 'italic' }}>distingue</span>
            </h2>
          </div>

          <div className='grid md:grid-cols-3 gap-10'>
            {[
              { num: '01', title: 'Excellence médicale', text: 'Une équipe de médecins certifiés et praticiens experts, formés aux dernières techniques de médecine esthétique internationale.' },
              { num: '02', title: 'Technologies avancées', text: 'Des équipements de pointe pour des résultats naturels, précis et sécurisés dans tous nos traitements.' },
              { num: '03', title: 'Approche personnalisée', text: 'Chaque patient est unique. Nous créons des protocoles sur mesure adaptés à vos besoins et objectifs.' },
            ].map((v, i) => (
              <div key={i} className='group relative'>
                <div className='absolute -inset-4 rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100' style={{ background: `${C.primary}08` }} />
                <div className='relative'>
                  <div className='text-5xl font-light mb-6 opacity-20' style={{ fontFamily: TYPE.headingFamily, color: C.primary }}>
                    {v.num}
                  </div>
                  <h3 className='text-2xl mb-4' style={{ fontFamily: TYPE.headingFamily, color: C.secondary }}>
                    {v.title}
                  </h3>
                  <p className='text-base leading-loose' style={{ color: `${C.secondary}bb` }}>
                    {v.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className='py-20 sm:py-28' style={{ background: 'white' }}>
        <div className='mx-auto max-w-7xl px-6 sm:px-8'>
          <div className='mb-16 max-w-3xl'>
            <p className='text-xs font-bold tracking-[0.25em] uppercase mb-4' style={{ color: C.primary }}>
              NOTRE PARCOURS
            </p>
            <h2 
              className='leading-tight'
              style={{ 
                fontFamily: TYPE.headingFamily,
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                color: C.secondary,
              }}
            >
              Une croissance fondée sur l'<span style={{ color: C.primary, fontStyle: 'italic' }}>excellence</span>
            </h2>
          </div>

          <div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-8'>
            {[
              { year: '2018', label: 'Fondation du centre', desc: 'Ouverture du premier centre de dermato-esthétique à Fès' },
              { year: '2020', label: 'Expansion technique', desc: 'Acquisition de technologies laser de dernière génération' },
              { year: '2022', label: 'Reconnaissance internationale', desc: 'Participation aux congrès mondiaux de dermatologie' },
              { year: '2024', label: 'Leadership régional', desc: 'Plus de 5000 patients satisfaits' },
            ].map((m, i) => (
              <div key={i}>
                <div className='text-4xl font-light mb-4' style={{ fontFamily: TYPE.headingFamily, color: C.primary }}>
                  {m.year}
                </div>
                <h4 className='text-lg font-semibold mb-2' style={{ color: C.secondary }}>
                  {m.label}
                </h4>
                <p className='text-sm leading-relaxed' style={{ color: `${C.secondary}99` }}>
                  {m.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className='py-20 sm:py-28' style={{ background: C.bg }}>
        <div className='mx-auto max-w-7xl px-6 sm:px-8'>
          <div className='mb-16 text-center max-w-3xl mx-auto'>
            <p className='text-xs font-bold tracking-[0.25em] uppercase mb-4' style={{ color: C.primary }}>
              NOTRE ÉQUIPE
            </p>
            <h2 
              className='leading-tight'
              style={{ 
                fontFamily: TYPE.headingFamily,
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                color: C.secondary,
              }}
            >
              Des experts <span style={{ color: C.primary, fontStyle: 'italic' }}>passionnés</span> à votre service
            </h2>
          </div>

          <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-8'>
            {TEAM_MEMBERS.map((member, i) => (
              <div key={i} className='group'>
                <div 
                  className='relative overflow-hidden mb-5 transition-all duration-500'
                  style={{ borderRadius: '1.75rem', boxShadow: '0 12px 48px -12px rgba(0,0,0,0.14)' }}
                >
                  <div className='aspect-[3/4] overflow-hidden'>
                    <img 
                      src={member.img} 
                      alt={member.name}
                      className='h-full w-full object-cover transition-transform duration-700 group-hover:scale-105'
                      onError={(e) => {
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=009fd6&color=fff&size=600`
                      }}
                    />
                  </div>
                  {member.founder && (
                    <div 
                      className='absolute top-4 right-4 px-4 py-2 rounded-full text-xs font-bold text-white'
                      style={{ background: C.primary, boxShadow: '0 4px 16px rgba(0,159,214,0.3)' }}
                    >
                      Fondatrice
                    </div>
                  )}
                </div>
                
                <h3 className='text-xl font-semibold mb-2' style={{ color: C.secondary, fontFamily: TYPE.headingFamily }}>
                  {member.name}
                </h3>
                
                <p className='text-sm font-bold uppercase tracking-wider' style={{ color: C.primary, opacity: 0.9 }}>
                  {member.role}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className='py-24 sm:py-32' style={{ background: 'white' }}>
        <div className='mx-auto max-w-5xl px-6 sm:px-8 text-center'>
          <h2 
            className='leading-tight mb-8'
            style={{ 
              fontFamily: TYPE.headingFamily,
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              color: C.secondary,
            }}
          >
            Prête à révéler votre <span style={{ color: C.primary, fontStyle: 'italic' }}>beauté naturelle</span> ?
          </h2>
          
          <p className='text-lg mb-12 max-w-2xl mx-auto' style={{ color: `${C.secondary}dd` }}>
            Prenez rendez-vous pour une consultation personnalisée avec nos experts.
          </p>
          
          <div className='flex flex-wrap items-center justify-center gap-4'>
            <button
              onClick={open}
              className='inline-flex items-center rounded-full px-8 py-4 text-base font-semibold text-white shadow-xl transition-transform hover:-translate-y-1 active:scale-95'
              style={{ background: C.primary }}
            >
              Prendre rendez-vous
            </button>
            
            <a
              href='tel:+212535624696'
              className='inline-flex items-center rounded-full border-2 px-8 py-4 text-base font-semibold transition-all hover:-translate-y-1 hover:bg-primary/5'
              style={{ borderColor: C.primary, color: C.secondary }}
            >
              +212 535 624 696
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
