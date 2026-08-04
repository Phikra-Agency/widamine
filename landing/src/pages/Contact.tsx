import { useState, type FormEvent } from 'react'
import toast from 'react-hot-toast'
import axios from 'axios'
import { API_BASE_URL } from '@/lib/api'
import z from 'zod'
import { MapPin, Phone, Envelope } from '@phosphor-icons/react'
import PublicNavbar from '@/components/PublicNavbar'
import { C } from '@/lib/theme'

const SM = {
  contact: {
    topLeft: '/images/leaf-top-left.png',
    topRight: 'https://cdn.prod.website-files.com/6605bb62a0c4eb429d0631b4/66bdb37252963420db73fe16_contact-header-feuillage.avif',
  },
  consult: {
    branch: 'https://cdn.prod.website-files.com/6605bb62a0c4eb429d0631b4/66ba364172b57bbc64c50e1e_consult-branche-feuiille.avif',
    map: 'https://cdn.prod.website-files.com/6605bb62a0c4eb429d0631b4/6607f56f68f48578d6eedfe0_Map-Square-Moncey.webp',
  },
}

const FAQS = [
  { q: 'Comment prendre rendez-vous ?', a: 'Pour une consultation, deux solutions s\'offrent à vous : la consultation en présentiel ou la visio-consultation. Vous pouvez nous contacter par téléphone du lundi au samedi de 9h à 19h, ou par email.' },
  { q: 'Faut-il une lettre d\'un médecin ?', a: 'La plupart de nos patients sont adressés par leurs médecins traitants ou confrères. Cependant, vous pouvez prendre rendez-vous directement par téléphone ou email.' },
  { q: 'Les consultations sont-elles remboursées ?', a: 'La plupart des actes de dermatologie esthétique ne sont pas pris en charge par la sécurité sociale. Nos honoraires sont librement fixés.' },
  { q: 'Proposez-vous des visio-consultations ?', a: 'Oui, nous proposons des visio-consultations qui permettent de réduire les délais d\'attente. Contactez-nous pour en savoir plus.' },
  { q: 'Puis-je venir pour de la dermatologie générale ?', a: 'Nous sommes spécialisés en dermatologie esthétique et correctrice. Pour la dermatologie générale, nous vous orientons vers un confrère adapté.' },
]

export default function Contact() {
  return (
    <div className='min-h-screen' style={{ background: C.bg }}>
      <PublicNavbar />

      {/* ─── Hero + Form ─── */}
      <section className='relative overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-20 lg:pt-44'>
        <div className='absolute -left-20 top-32 h-56 w-56 rounded-full bg-white/70' />
        <img src={SM.contact.topLeft} alt='' className='absolute left-0 top-0 w-36 sm:w-52 lg:w-64 widamine-tint opacity-60 scale-y-[-1] -rotate-[25deg] -mt-[50px]' loading='lazy' />
        <img src={SM.contact.topRight} alt='' className='absolute right-0 top-0 w-36 sm:w-52 lg:w-64 widamine-tint opacity-60' loading='lazy' />

        <div className='relative mx-auto max-w-6xl px-5 sm:px-8'>
          <div className='mb-14 text-center'>
            <h1 className='font-amoria text-3xl leading-tight sm:text-4xl md:text-5xl' style={{ color: C.secondary }}>
              Contactez <span style={{ color: C.primary, fontStyle: 'italic' }}>Widamine</span>
            </h1>
            <p className='mx-auto mt-4 max-w-md text-sm leading-8 sm:text-base'>
              Retrouvez ci-dessous nos coordonnées pour nous contacter. Nous serons ravis de vous accueillir.
            </p>
          </div>

          <div className='grid gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-start'>
            <ContactForm />
            <div className='space-y-6'>
              <ContactRow
                icon={<MapPin size={20} weight="duotone" />}
                label='Adresse'
                text='Boulevard Slaoui, Bureaux Nour, 2ème étage, Fès'
              />
              <ContactRow
                icon={<Envelope size={18} weight="duotone" />}
                label='Email'
                text='info@widamineaestheticcenter.com'
              />
              <ContactRow
                icon={<Phone size={18} weight="duotone" />}
                label='Téléphone'
                text='+212 (535) 624 696'
                sub='(9h à 19h)'
              />
              <div className='w-full overflow-hidden rounded-[1.5rem]' style={{ boxShadow: '0 4px 20px -8px rgba(0,0,0,0.12)' }}>
                <iframe
                  src='https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3303!2d-4.9820!3d34.0360!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0:0x0!2zQm91bGV2YXJkIFNsYW91aSwgRsOocw!5e0!3m2!1sfr!2sma!4v1'
                  width='100%'
                  height='220'
                  style={{ border: 0 }}
                  allowFullScreen
                  loading='lazy'
                  referrerPolicy='no-referrer-when-downgrade'
                  className='w-full'
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Consult section ─── */}
      <section className='mx-auto max-w-6xl px-5 sm:px-8'>
        <div className='relative overflow-hidden rounded-[2rem] p-8 sm:p-10 lg:p-12' style={{ background: C.primary, color: 'white' }}>
          <div className='grid gap-10 lg:grid-cols-[1fr_0.5fr] lg:items-center'>
            <div>
              <h2 className='font-amoria text-2xl leading-tight sm:text-3xl'>
                Comment prendre rendez-vous au Widamine Center ?
              </h2>
              <div className='mt-6 border-b border-white/25 pb-5'>
                <h3 className='text-lg font-semibold'>Pour une consultation, 2 solutions :</h3>
                <p className='mt-2 text-sm leading-7 text-white/75'>
                  La consultation en présentiel ou la visio-consultation (qui permet souvent de diminuer le délai).
                </p>
              </div>
              <a href='tel:+212535624696' className='mt-5 flex items-center gap-4 border-b border-white/25 py-5 transition hover:opacity-80'>
                <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white' style={{ color: C.primary }}>
                  <Phone size={18} weight="duotone" />
                </div>
                <div>
                  <p className='text-sm font-semibold'>Par téléphone</p>
                  <p className='text-sm text-white/70'>+212 (535) 624 696</p>
                </div>
              </a>
              <a href='mailto:info@widamineaestheticcenter.com' className='mt-5 flex items-center gap-4 border-b border-white/25 py-5 transition hover:opacity-80'>
                <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white' style={{ color: C.primary }}>
                  <Envelope size={18} weight="duotone" />
                </div>
                <div>
                  <p className='text-sm font-semibold'>Par email</p>
                  <p className='text-sm text-white/70'>info@widamineaestheticcenter.com</p>
                </div>
              </a>
            </div>
          </div>
          <img src={SM.consult.branch} alt='' className='absolute right-0 bottom-0 w-36 opacity-60 hidden lg:block widamine-tint' loading='lazy' />
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className='mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28'>
        <div className='grid gap-10 lg:grid-cols-[0.35fr_0.65fr] lg:items-start'>
          <div className='lg:sticky lg:top-28'>
            <h2 className='font-amoria text-3xl leading-tight sm:text-4xl' style={{ color: C.secondary }}>
              Questions <span style={{ color: C.primary, fontStyle: 'italic' }}>Fréquentes</span>
            </h2>
          </div>
          <div className='space-y-3'>
            {FAQS.map((faq, i) => (
              <FAQItem key={i} question={faq.q} answer={faq.a} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

/* ─── Contact row ─── */

function ContactRow({ icon, label, text, sub }: { icon: React.ReactNode; label: string; text: string; sub?: string }) {
  return (
    <div className='flex items-start gap-4'>
      <div className='mt-1 flex h-10 w-10 shrink-0 items-center justify-center' style={{ color: C.primary }}>
        {icon}
      </div>
      <div>
        <h3 className='text-base font-semibold' style={{ color: C.secondary }}>
          {label}
          {sub && <span className='ml-1.5 text-xs font-normal' style={{ color: `${C.secondary}a0` }}>{sub}</span>}
        </h3>
        <p className='mt-1 text-sm leading-6'>{text}</p>
      </div>
    </div>
  )
}

/* ─── FAQ accordion ─── */

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className='overflow-hidden rounded-[1.25rem]' style={{ background: 'white', boxShadow: '0 2px 12px -4px rgba(0,0,0,0.04)' }}>
      <button onClick={() => setOpen(!open)} className='flex w-full items-center justify-between px-6 py-5 text-left'>
        <span className='pr-4 text-sm font-semibold sm:text-base' style={{ color: C.secondary }}>{question}</span>
        <span className='shrink-0 transition-transform duration-300' style={{ color: C.primary, transform: open ? 'rotate(45deg)' : 'rotate(0deg)' }}>
          <svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round'>
            <line x1='12' y1='5' x2='12' y2='19' />
            <line x1='5' y1='12' x2='19' y2='12' />
          </svg>
        </span>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-60' : 'max-h-0'}`}>
        <div className='px-6 pb-5'>
          <p className='text-sm leading-7'>{answer}</p>
        </div>
      </div>
    </div>
  )
}

/* ─── Contact form ─── */

function ContactForm() {
  const [loading, setLoading] = useState(false)
  const [contactData, setContactData] = useState({ name: '', email: '', phone: '', context: '' })
  const [errors, setErrors] = useState<{ name?: string; email?: string; phone?: string; context?: string }>({})

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    try {
      if (loading) return
      setLoading(true)
      const obj = z.object({
        name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(100),
        email: z.string().email('Email invalide'),
        phone: z.string().min(8).max(20).regex(/^[\d\s\+\(\)]+$/, 'Numéro de téléphone invalide'),
        context: z.string().max(500, 'Le message ne doit pas dépasser 500 caractères'),
      })
      const parsed = obj.safeParse(contactData)
      if (!parsed.success) {
        const fieldErrors: typeof errors = {}
        parsed.error.errors.forEach((err) => {
          const field = err.path[0] as keyof typeof errors
          fieldErrors[field] = err.message
        })
        setErrors(fieldErrors)
        return
      }
      await axios.post(API_BASE_URL + '/contacts', parsed.data)
      toast.success('Message envoyé avec succès !')
      setContactData({ name: '', email: '', phone: '', context: '' })
      setErrors({})
    } catch {
      toast.error('Une erreur est survenue, veuillez réessayer plus tard.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className='space-y-4 rounded-[1.5rem] border border-black/5 bg-white p-6 shadow-sm sm:p-8' onSubmit={submit}>
      <input
        type='text'
        placeholder='Nom complet'
        className='w-full rounded-full border border-[#d5d0ca] bg-white px-5 py-3.5 text-sm outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/15'
        style={{ color: C.secondary }}
        value={contactData.name}
        onChange={(e) => { setContactData({ ...contactData, name: e.target.value }); setErrors({ ...errors, name: undefined }) }}
      />
      {errors.name && <p className='-mt-3 ml-5 text-xs text-red-500'>{errors.name}</p>}
      <input
        type='email'
        placeholder='Email'
        className='w-full rounded-full border border-[#d5d0ca] bg-white px-5 py-3.5 text-sm outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/15'
        style={{ color: C.secondary }}
        value={contactData.email}
        onChange={(e) => { setContactData({ ...contactData, email: e.target.value }); setErrors({ ...errors, email: undefined }) }}
      />
      {errors.email && <p className='-mt-3 ml-5 text-xs text-red-500'>{errors.email}</p>}
      <input
        type='tel'
        placeholder='Téléphone'
        className='w-full rounded-full border border-[#d5d0ca] bg-white px-5 py-3.5 text-sm outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/15'
        style={{ color: C.secondary }}
        value={contactData.phone}
        onChange={(e) => { setContactData({ ...contactData, phone: e.target.value }); setErrors({ ...errors, phone: undefined }) }}
      />
      {errors.phone && <p className='-mt-3 ml-5 text-xs text-red-500'>{errors.phone}</p>}
      <textarea
        placeholder='Message'
        rows={5}
        className='w-full resize-none rounded-[1.25rem] border border-[#d5d0ca] bg-white px-5 py-3.5 text-sm outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/15'
        style={{ color: C.secondary }}
        value={contactData.context}
        onChange={(e) => { setContactData({ ...contactData, context: e.target.value }); setErrors({ ...errors, context: undefined }) }}
      />
      {errors.context && <p className='-mt-3 ml-5 text-xs text-red-500'>{errors.context}</p>}
      <button
        type='submit'
        disabled={loading}
        className='w-full rounded-full py-3.5 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-60 min-h-touch'
        style={{ background: C.primary }}
      >
        {loading ? 'Envoi en cours...' : 'Envoyer le message'}
      </button>
    </form>
  )
}


