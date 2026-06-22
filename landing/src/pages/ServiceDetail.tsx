import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import PublicNavbar from '@/components/PublicNavbar'
import { getServicePage, SERVICE_PAGES } from '@/lib/siteContent'
import { CalendarBlank, ArrowLeft, PhoneCall, EnvelopeSimple, Clock, ShieldCheck, Star, FileText } from '@phosphor-icons/react'
import { useScheduleModalStore } from '@/stores/scheduleModalStore'
import { C } from '@/lib/theme'

const SM = {
  branch: 'https://cdn.prod.website-files.com/6605bb62a0c4eb429d0631b4/66ba364172b57bbc64c50e1e_consult-branche-feuiille.avif',
  flower: 'https://cdn.prod.website-files.com/6605bb62a0c4eb429d0631b4/66b0fbb4c50c3351ead87c66_concept-fleur.avif',
  libellule: 'https://cdn.prod.website-files.com/6605bb62a0c4eb429d0631b4/66bdb3d4417f66a31d312431_contact-header-libellule.avif',
  feuillage: 'https://cdn.prod.website-files.com/6605bb62a0c4eb429d0631b4/66bdb37252963420db73fe16_contact-header-feuillage.avif',
  fallback: 'https://cdn.prod.website-files.com/6605bb62a0c4eb429d0631b4/660ea71c6f94851cc9dbd4a9_cabine1.jpg',
  bubbles: 'https://cdn.prod.website-files.com/6605bb62a0c4eb429d0631b4/66aa4ea27518914b10e9001c_section-2-left-bubbles.svg',
}

const FAQS = [
  { q: 'Combien de séances sont nécessaires ?', a: "Le nombre de séances dépend du traitement et de votre cas particulier. Lors de la consultation, nous établissons un plan personnalisé avec une estimation précise du nombre de séances recommandé." },
  { q: 'Est-ce que c\'est douloureux ?', a: 'La plupart de nos traitements sont bien tolérés. Nous utilisons des technologies modernes qui minimisent l\'inconfort. Une anesthésie locale peut être proposée si nécessaire pour certains soins.' },
  { q: 'Quels sont les délais de récupération ?', a: 'Cela varie selon le traitement. Certains soins permettent une reprise immédiate des activités, d\'autres nécessitent quelques jours de repos. Tout vous sera expliqué en détail lors de la consultation.' },
  { q: 'Les résultats sont-ils permanents ?', a: 'Certains traitements offrent des résultats définitifs (épilation laser, liposuccion), d\'autres nécessitent des séances d\'entretien. Nous vous informons clairement sur la durée des résultats attendus.' },
  { q: 'Y a-t-il des contre-indications ?', a: 'Chaque traitement a ses contre-indications spécifiques. Une consultation préalable est indispensable pour vérifier votre éligibilité et adapter le soin à votre profil médical.' },
]

export default function ServiceDetail() {
  const { slug = '' } = useParams()
  const service = getServicePage(slug)
  const { open } = useScheduleModalStore()
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  if (!service) {
    return (
      <div className='min-h-screen' style={{ background: C.bg }}>
        <PublicNavbar />
        <section className='mx-auto max-w-6xl px-5 pt-32 pb-16 sm:px-8 sm:pt-40'>
          <div className='rounded-[2rem] bg-white p-8 text-center' style={{ boxShadow: '0 10px 40px -10px rgba(0,0,0,0.12)' }}>
            <p className='text-lg' style={{ color: C.secondary }}>Service introuvable.</p>
            <Link to='/' className='mt-4 inline-flex items-center gap-2 text-sm font-medium' style={{ color: C.primary }}>
              <ArrowLeft size={16} /> Retour à l'accueil
            </Link>
          </div>
        </section>
      </div>
    )
  }

  const related = SERVICE_PAGES.filter((p) => p.category === service.category && p.slug !== service.slug).slice(0, 3)

  return (
    <div className='min-h-screen' style={{ background: C.bg }}>
      <PublicNavbar />

      {/* ─── Hero ─── */}
      <section className='relative overflow-hidden pt-28 pb-14 sm:pt-32 sm:pb-16 lg:pt-36 lg:pb-20'>
        <img src={SM.libellule} alt='' className='absolute left-0 top-16 w-28 sm:w-40 lg:w-48 widamine-tint opacity-40' loading='lazy' />
        <img src={SM.feuillage} alt='' className='absolute right-0 top-16 w-28 sm:w-40 lg:w-48 widamine-tint opacity-40' loading='lazy' />
        <img src={SM.branch} alt='' className='absolute right-0 bottom-0 w-24 sm:w-32 widamine-tint opacity-30' loading='lazy' />

        <div className='relative mx-auto max-w-6xl px-5 sm:px-8'>
          <Link to='/' className='mb-6 inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.18em] transition hover:opacity-65' style={{ color: C.primary }}>
            <ArrowLeft size={12} /> Retour
          </Link>
          <div className='grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center'>
            <div>
              <span className='inline-block rounded-full px-3.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white mb-4' style={{ background: C.primary }}>
                {service.eyebrow}
              </span>
              <h1 className='font-amoria text-[1.75rem] leading-[1.1] sm:text-4xl md:text-5xl' style={{ color: C.secondary }}>
                {service.title}
              </h1>
              <p className='mt-5 max-w-lg text-sm leading-7 sm:text-base' style={{ color: `${C.secondary}99` }}>
                {service.heroDescription}
              </p>
              <div className='mt-7 flex flex-wrap gap-3'>
                <button
                  onClick={open}
                  className='inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl'
                  style={{ background: C.primary }}
                >
                  <CalendarBlank size={16} />
                  Prendre rendez-vous
                </button>
                <a
                  href='tel:+212535624696'
                  className='inline-flex items-center gap-2 rounded-full border-2 px-6 py-3 text-sm font-semibold transition hover:-translate-y-0.5'
                  style={{ borderColor: C.primary, color: C.primary }}
                >
                  <PhoneCall size={16} />
                  +212 (535) 624 696
                </a>
              </div>
            </div>
            <div className='overflow-hidden rounded-[2rem]' style={{ boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15)' }}>
              <img
                src={service.image}
                alt={service.title}
                className='h-56 w-full object-cover sm:h-72 widamine-tint'
                loading='lazy'
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = SM.fallback }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Intro + highlights bar ─── */}
      <section className='mx-auto max-w-6xl px-5 sm:px-8 -mt-5 relative z-10'>
        <div className='rounded-[2rem] bg-white p-6 sm:p-8 shadow-xl border border-black/5' style={{ boxShadow: '0 10px 40px -10px rgba(0,0,0,0.12)' }}>
          <p className='text-sm leading-7' style={{ color: `${C.secondary}a6` }}>
            {service.intro}
          </p>
          <div className='mt-5 flex flex-wrap gap-2'>
            {service.highlights.map((h) => (
              <span key={h} className='inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-[11px] font-medium' style={{ background: `${C.primary}12`, color: C.primary }}>
                <Star size={10} weight='fill' />
                {h}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pourquoi choisir ce traitement ─── */}
      <section className='mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20'>
        <div className='text-center'>
          <h2 className='font-amoria text-2xl leading-tight sm:text-3xl' style={{ color: C.secondary }}>
            Pourquoi choisir ce <span style={{ color: C.primary, fontStyle: 'italic' }}>traitement</span> ?
          </h2>
        </div>
        <div className='mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
          {[
            { icon: ShieldCheck, label: 'Expertise médicale', desc: 'Prise en charge par des médecins spécialistes en dermatologie esthétique.' },
            { icon: Star, label: 'Technologies de pointe', desc: 'Équipements dernière génération pour des résultats optimaux et sécurisés.' },
            { icon: Clock, label: 'Résultats durables', desc: 'Des protocoles éprouvés pour des effets qui durent dans le temps.' },
            { icon: FileText, label: 'Suivi personnalisé', desc: 'Un accompagnement sur mesure avant, pendant et après chaque traitement.' },
          ].map((item) => (
            <div key={item.label} className='rounded-[1.25rem] bg-white p-5 text-center border border-black/5 transition-all hover:-translate-y-1 hover:shadow-md' style={{ boxShadow: '0 2px 12px -6px rgba(0,0,0,0.06)' }}>
              <div className='mx-auto flex h-10 w-10 items-center justify-center rounded-full' style={{ background: `${C.primary}14`, color: C.primary }}>
                <item.icon size={18} />
              </div>
              <h3 className='mt-3 text-sm font-semibold' style={{ color: C.secondary }}>{item.label}</h3>
              <p className='mt-1.5 text-[11px] leading-6' style={{ color: `${C.secondary}80` }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Content sections ─── */}
      <section className='mx-auto max-w-6xl px-5 sm:px-8'>
        <div className='mx-auto max-w-4xl'>
          <div className='space-y-5'>
            {service.sections.map((section, i) => (
              <div
                key={section.title}
                className='relative overflow-hidden rounded-[2rem] bg-white p-6 sm:p-8 lg:p-10 transition-all hover:-translate-y-1'
                style={{ boxShadow: '0 4px 20px -8px rgba(0,0,0,0.08)' }}
              >
                <div className='flex items-start gap-4'>
                  <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white text-xs font-bold' style={{ background: C.primary }}>
                    {i + 1}
                  </div>
                  <div className='min-w-0'>
                    <h3 className='text-base font-semibold' style={{ color: C.secondary }}>{section.title}</h3>
                    <p className='mt-2 text-sm leading-7' style={{ color: `${C.secondary}a0` }}>{section.body}</p>
                  </div>
                </div>
                <img src={SM.flower} alt='' className='absolute right-0 bottom-0 w-16 opacity-[0.06]' loading='lazy' />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className='mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20'>
        <div className='mx-auto max-w-4xl'>
          <h2 className='text-center font-amoria text-2xl leading-tight sm:text-3xl' style={{ color: C.secondary }}>
            Questions <span style={{ color: C.primary, fontStyle: 'italic' }}>fréquentes</span>
          </h2>
          <div className='mt-8 space-y-2'>
            {FAQS.map((faq, i) => {
              const isOpen = openFaq === i
              return (
                <div key={i} className='overflow-hidden rounded-[1.25rem] bg-white border border-black/5 transition-shadow hover:shadow-md' style={{ boxShadow: isOpen ? '0 4px 20px -8px rgba(0,0,0,0.1)' : '0 2px 12px -4px rgba(0,0,0,0.04)' }}>
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className='flex w-full items-center justify-between px-5 py-4 text-left'
                  >
                    <span className='pr-3 text-sm font-semibold' style={{ color: C.secondary }}>{faq.q}</span>
                    <span className={`shrink-0 text-lg transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`} style={{ color: C.primary }}>
                      +
                    </span>
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-48' : 'max-h-0'}`}>
                    <div className='px-5 pb-4'>
                      <p className='text-sm leading-7' style={{ color: `${C.secondary}a0` }}>{faq.a}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── Related services ─── */}
      {related.length > 0 ? (
        <section className='mx-auto max-w-6xl px-5 pb-16 sm:px-8 sm:pb-20'>
          <h2 className='text-center font-amoria text-xl leading-tight sm:text-2xl' style={{ color: C.secondary }}>
            Autres traitements <span style={{ color: C.primary, fontStyle: 'italic' }}>associés</span>
          </h2>
          <div className='mt-8 grid gap-3 sm:grid-cols-3'>
            {related.map((r) => (
              <Link
                key={r.slug}
                to={`/services/${r.slug}`}
                className='group relative overflow-hidden rounded-[1.5rem] bg-white p-5 transition-all hover:-translate-y-1 hover:shadow-lg border border-black/5'
                style={{ boxShadow: '0 2px 12px -6px rgba(0,0,0,0.06)' }}
              >
                <div className='flex h-10 w-10 items-center justify-center rounded-full text-white text-xs font-bold' style={{ background: C.primary }}>
                  {r.title[0]}
                </div>
                <h3 className='mt-3 text-sm font-semibold' style={{ color: C.secondary }}>{r.title}</h3>
                <p className='mt-1 text-[11px] leading-5' style={{ color: `${C.secondary}70` }}>{r.highlights.slice(0, 2).join(' · ')}</p>
                <span className='mt-3 inline-flex items-center gap-1 text-[11px] font-medium transition-all group-hover:gap-2' style={{ color: C.primary }}>
                  Découvrir <ArrowLeft size={10} className='rotate-180' />
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* ─── CTA ─── */}
      <section className='mx-auto max-w-6xl px-5 pb-16 sm:px-8 sm:pb-20'>
        <div className='relative overflow-hidden rounded-[2rem] p-7 sm:p-10' style={{ background: C.secondary, color: 'white' }}>
          <div className='relative z-10 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-12'>
            <div>
              <h2 className='font-amoria text-xl leading-tight sm:text-2xl'>
                Prêt(e) à prendre <span style={{ color: C.primary, fontStyle: 'italic' }}>rendez-vous</span> ?
              </h2>
              <p className='mt-2 text-sm leading-6 text-white/65'>
                Contactez-nous par téléphone ou par email pour une consultation.
              </p>
            </div>
            <div className='flex flex-wrap gap-2'>
              <a
                href='tel:+212535624696'
                className='inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl'
              >
                <PhoneCall size={14} />
                +212 (535) 624 696
              </a>
              <a
                href='mailto:info@widamineaestheticcenter.com'
                className='inline-flex items-center gap-2 rounded-full border-2 px-5 py-2.5 text-sm font-medium text-white transition hover:-translate-y-0.5'
                style={{ borderColor: 'rgba(255,255,255,0.25)' }}
              >
                <EnvelopeSimple size={14} />
                Email
              </a>
              <button
                onClick={open}
                className='inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl'
                style={{ color: C.primary }}
              >
                <CalendarBlank size={14} />
                Réserver
              </button>
            </div>
          </div>
          <img src={SM.bubbles} alt='' className='absolute left-0 bottom-0 w-28 opacity-20 hidden lg:block' loading='lazy' />
          <img src={SM.branch} alt='' className='absolute right-0 bottom-0 w-28 opacity-25 hidden lg:block widamine-tint' loading='lazy' />
        </div>
      </section>
    </div>
  )
}