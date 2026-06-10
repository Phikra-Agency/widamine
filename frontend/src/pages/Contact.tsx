import { useState, type FormEvent } from 'react'
import toast from 'react-hot-toast'
import { EnvelopeSimple as Mail, MapPin, Phone, Plus, Minus } from '@phosphor-icons/react'
import axios from 'axios'
import { API_BASE_URL } from '@/lib/api'
import z from 'zod'
import PublicNavbar from '@/components/PublicNavbar'

const C = { bg: '#F7F1EB', primary: '#2e90c0', secondary: '#1a3646', accent: '#e8c5b8' }

const SM = {
  contact: {
    topLeft: 'https://cdn.prod.website-files.com/6605bb62a0c4eb429d0631b4/66bdb3d4417f66a31d312431_contact-header-libellule.avif',
    topRight: 'https://cdn.prod.website-files.com/6605bb62a0c4eb429d0631b4/66bdb37252963420db73fe16_contact-header-feuillage.avif',
  },
}

const FAQS = [
  { q: 'Comment prendre rendez-vous ?', a: 'Pour une consultation, deux solutions s\'offrent à vous : la consultation en présentiel ou la visio-consultation. Vous pouvez nous contacter par téléphone du lundi au samedi de 9h à 19h, ou par email à info@widamineaestheticcenter.com.' },
  { q: 'Faut-il une lettre d\'un médecin ?', a: 'La plupart de nos patients sont adressés par leurs médecins traitants ou confrères. Cependant, vous pouvez prendre rendez-vous directement par téléphone ou email.' },
  { q: 'Les consultations sont-elles remboursées ?', a: 'La plupart des actes de dermatologie esthétique ne sont pas pris en charge par la sécurité sociale. Widamine Center exerce en honoraires librement fixés.' },
  { q: 'Proposez-vous des visio-consultations ?', a: 'Oui, nous proposons des visio-consultations qui permettent de réduire les délais d\'attente. Contactez-nous pour en savoir plus.' },
  { q: 'Puis-je venir pour de la dermatologie générale ?', a: 'Widamine Center est spécialisé en dermatologie esthétique et correctrice. Pour la dermatologie générale, nous vous orientons vers un confrère adapté.' },
]

/* ── SVG Icons ────────────────────────────────────────────────── */

const PinIcon = () => (
  <svg xmlns='http://www.w3.org/2000/svg' width='20' viewBox='0 0 35 41' fill='none'>
    <path d='M17.5006 0.875C12.8609 0.880734 8.4129 2.72638 5.13214 6.00714C1.85138 9.2879 0.00573373 13.7359 0 18.3756C0 23.0858 3.66679 29.6527 10.902 37.8913C11.7271 38.8289 12.7425 39.5799 13.8806 40.0944C15.0187 40.6089 16.2533 40.875 17.5023 40.875C18.7512 40.875 19.9859 40.6089 21.1239 40.0944C22.262 39.5799 23.2774 38.8289 24.1025 37.8913C31.3344 29.6543 35.0012 23.0874 35.0012 18.3756C34.9955 13.7359 33.1498 9.2879 29.8691 6.00714C26.5883 2.72638 22.1403 0.880734 17.5006 0.875ZM20.344 34.5945C19.9806 34.9852 19.5405 35.2968 19.0513 35.5099C18.5621 35.723 18.0342 35.8329 17.5006 35.8329C16.967 35.8329 16.4391 35.723 15.9499 35.5099C15.4607 35.2968 15.0206 34.9852 14.6572 34.5945C8.51863 27.6026 4.99017 21.6907 4.99017 18.3773C4.99017 15.062 6.30718 11.8824 8.65146 9.53813C10.9957 7.19385 14.1753 5.87684 17.4906 5.87684C20.8059 5.87684 23.9855 7.19385 26.3297 9.53813C28.674 11.8824 29.991 15.062 29.991 18.3773C30.001 21.6907 26.4826 27.6026 20.344 34.5945Z' fill='currentColor' />
    <path d='M17.5007 10.9668C16.0624 10.9668 14.6565 11.3933 13.4606 12.1923C12.2648 12.9914 11.3327 14.1271 10.7823 15.4559C10.2319 16.7846 10.0879 18.2468 10.3685 19.6574C10.6491 21.068 11.3417 22.3637 12.3587 23.3807C13.3757 24.3977 14.6714 25.0903 16.082 25.3709C17.4926 25.6515 18.9548 25.5075 20.2835 24.9571C21.6123 24.4067 22.748 23.4746 23.5471 22.2788C24.3461 21.0829 24.7726 19.677 24.7726 18.2387C24.7704 16.3108 24.0035 14.4624 22.6403 13.0991C21.277 11.7359 19.4286 10.969 17.5007 10.9668ZM17.5007 20.5105C17.0514 20.5105 16.6122 20.3772 16.2386 20.1276C15.865 19.878 15.5738 19.5232 15.4019 19.1081C15.2299 18.693 15.1849 18.2362 15.2726 17.7955C15.3602 17.3548 15.5766 16.9501 15.8943 16.6323C16.212 16.3146 16.6168 16.0983 17.0575 16.0106C17.4982 15.923 17.9549 15.968 18.37 16.1399C18.7851 16.3118 19.1399 16.603 19.3896 16.9766C19.6392 17.3502 19.7724 17.7894 19.7724 18.2387C19.772 18.8411 19.5325 19.4187 19.1066 19.8446C18.6806 20.2705 18.103 20.51 17.5007 20.5105Z' fill='currentColor' />
  </svg>
)

const PhoneIcon = () => (
  <svg xmlns='http://www.w3.org/2000/svg' width='18' viewBox='0 0 25 24' fill='none'>
    <path d='M21.2093 14.0401C20.5411 13.4034 19.6534 13.0482 18.7304 13.0482C17.8074 13.0482 16.9198 13.4034 16.2515 14.0401L15.8415 14.441C15.4817 14.786 15.0021 14.9843 14.4976 14.9988C13.9932 15.0133 13.5034 14.8427 13.1297 14.5251C12.1875 13.7184 11.3603 12.7996 10.6632 11.7874C9.96616 10.7753 9.40985 9.68551 9.01015 8.54436C8.85403 8.09451 8.91686 7.5997 9.18327 7.19803L9.55152 6.62928C10.0412 5.88021 10.7421 5.30286 11.5527 4.97957C12.3634 4.65628 13.2429 4.60543 14.0805 4.83441C14.9181 5.06339 15.6675 5.56037 16.2194 6.25028C16.7714 6.9402 17.1 7.79093 17.1668 8.68328C17.2336 9.57563 17.0362 10.4666 16.6045 11.2401L16.2515 11.8691C15.9237 12.4598 15.8055 13.1575 15.9203 13.8291C16.0351 14.5007 16.3743 15.0967 16.8634 15.5858L17.2734 15.9868C17.8924 16.5879 18.2536 17.3823 18.2929 18.2215C18.3322 19.0607 18.0471 19.8829 17.4951 20.5449C16.9431 21.2068 16.1625 21.6619 15.3008 21.8175C14.4392 21.9732 13.5583 21.8206 12.8058 21.3861C11.3255 20.5232 10.0084 19.3861 8.93243 18.0341C7.85649 16.6821 7.04093 15.1403 6.53014 13.4951C6.01935 11.8499 5.82323 10.1366 5.95339 8.43803C6.08355 6.73944 6.53719 5.09151 7.28989 3.59528C7.43193 3.30878 7.65326 3.06441 7.92829 2.8883C8.20333 2.71218 8.52219 2.61032 8.84964 2.59333C9.17709 2.57635 9.50093 2.64483 9.78951 2.79128C10.0781 2.93772 10.3207 3.15653 10.4886 3.42278L10.8986 4.05178C11.3523 4.75778 11.572 5.58778 11.5288 6.42778C11.4857 7.26778 11.1819 8.07478 10.6632 8.73278C10.1444 9.39078 9.43656 9.87228 8.63444 10.1138C7.83232 10.3553 6.97749 10.3453 6.18107 10.0851C5.38466 9.82493 4.68391 9.32693 4.17221 8.65878C3.66052 7.99063 3.36427 7.18228 3.32527 6.34328C3.28628 5.50428 3.50673 4.67378 3.95774 3.96628C4.40876 3.25878 5.06926 2.70828 5.84909 2.38728L6.25909 2.18628C7.14382 1.73128 8.14382 1.49128 9.15409 1.49028C10.1644 1.48928 11.1647 1.72728 12.0498 2.18228' fill='currentColor' />
  </svg>
)

const MailIcon = () => (
  <svg xmlns='http://www.w3.org/2000/svg' width='18' viewBox='0 0 25 25' fill='none'>
    <path d='M22.9167 4.16667H2.08333C1.5308 4.16667 1.00089 4.38616 0.609488 4.77757C0.218088 5.16897 0 5.69888 0 6.25L0 18.75C0 19.3025 0.218088 19.8324 0.609488 20.2238C1.00089 20.6152 1.5308 20.8333 2.08333 20.8333H22.9167C23.4692 20.8333 23.9991 20.6152 24.3905 20.2238C24.7819 19.8324 25 19.3025 25 18.75V6.25C25 5.69888 24.7819 5.16897 24.3905 4.77757C23.9991 4.38616 23.4692 4.16667 22.9167 4.16667ZM22.9167 6.25L12.5 13.5417L2.08333 6.25V6.26042L12.5 13.0208L22.9167 6.26042V6.25Z' fill='currentColor' />
  </svg>
)

const PlusIcon = () => (
  <svg xmlns='http://www.w3.org/2000/svg' width='16' viewBox='0 0 32 32' fill='none'>
    <path d='M25.3333 15.667V16.3336C25.3333 16.7018 25.0349 17.0003 24.6667 17.0003H17V24.667C17 25.0351 16.7015 25.3336 16.3333 25.3336H15.6667C15.2985 25.3336 15 25.0351 15 24.667V17.0003H7.3333C6.96511 17.0003 6.66663 16.7018 6.66663 16.3336V15.667C6.66663 15.2988 6.96511 15.0003 7.3333 15.0003H15V7.33365C15 6.96546 15.2985 6.66699 15.6667 6.66699H16.3333C16.7015 6.66699 17 6.96546 17 7.33365V15.0003H24.6667C25.0349 15.0003 25.3333 15.2988 25.3333 15.667Z' fill='currentColor' />
  </svg>
)

const MinusIcon = () => (
  <svg xmlns='http://www.w3.org/2000/svg' width='16' viewBox='0 0 32 32' fill='none'>
    <path d='M24.6667 17H7.33333C6.96514 17 6.66667 16.7015 6.66667 16.3333V15.6667C6.66667 15.2985 6.96514 15 7.33333 15H24.6667C25.0349 15 25.3333 15.2985 25.3333 15.6667V16.3333C25.3333 16.7015 25.0349 17 24.6667 17Z' fill='currentColor' />
  </svg>
)

/* ── Page ──────────────────────────────────────────────────────── */

export default function Contact() {
  return (
    <div className='min-h-screen' style={{ background: C.bg }}>
      <PublicNavbar />

      {/* ─── Hero: heading + contact cards ─── */}
      <section className='relative overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-20 lg:pt-48 lg:pb-24'>
        <img src={SM.contact.topLeft} alt='' className='absolute left-0 top-16 w-36 sm:w-52 lg:w-64 widamine-tint opacity-60' loading='lazy' />
        <img src={SM.contact.topRight} alt='' className='absolute right-0 top-16 w-36 sm:w-52 lg:w-64 widamine-tint opacity-60' loading='lazy' />

        <div className='relative mx-auto max-w-6xl px-5 sm:px-8'>
          <div className='grid gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-start'>
            {/* Left — heading + intro */}
            <div>
              <h1 className='font-amoria text-3xl leading-tight sm:text-4xl md:text-5xl' style={{ color: C.secondary }}>
                Contactez <span style={{ color: C.primary, fontStyle: 'italic' }}>Widamine</span>
              </h1>
              <p className='mt-6 max-w-md text-sm leading-8 sm:text-base' style={{ color: `${C.secondary}b3` }}>
                Retrouvez ci-dessous nos coordonnées pour nous contacter. Nous serons ravis de vous accueillir au Boulevard Slaoui, Bureaux Nour, Fès.
              </p>
            </div>

            {/* Right — contact cards (white card, same as SM) */}
            <div className='rounded-2xl p-6 sm:p-8' style={{ background: 'white', boxShadow: '0 4px 20px -6px rgba(0,0,0,0.06)' }}>
              <div className='space-y-5'>
                <ContactCard icon={<PinIcon />} label='Adresse' text='Boulevard Slaoui, Bureaux Nour, En face cinéma Astor, 2ème étage, Fès' />
                <ContactCard icon={<MailIcon />} label='Email' text='info@widamineaestheticcenter.com' />
                <ContactCard icon={<PhoneIcon />} label='Téléphone' text='+212 (535) 624 696' sub='(9h à 19h)' />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Consult section (orange bg, 2-col) ─── */}
      <section className='relative mx-auto max-w-6xl px-5 sm:px-8'>
        <div className='relative overflow-hidden rounded-2xl p-8 sm:p-10 lg:p-12' style={{ background: C.primary, color: 'white' }}>
          <div className='grid gap-10 lg:grid-cols-[1fr_0.7fr] lg:items-center'>
            {/* Left */}
            <div>
              <h2 className='font-amoria text-2xl leading-tight sm:text-3xl'>
                Comment prendre rendez-vous chez Widamine ?
              </h2>
              <div className='mt-6 border-b border-white/30 pb-5'>
                <h3 className='text-lg font-semibold'>Pour une consultation, 2 solutions :</h3>
                <p className='mt-2 text-sm leading-7 text-white/80'>
                  La consultation en présentiel ou la visio-consultation (qui permet souvent de diminuer le délai).
                </p>
              </div>
              <a href='tel:+212535624696' className='mt-5 flex items-center gap-4 border-b border-white/30 py-5 transition hover:opacity-80'>
                <div className='flex h-12 w-12 items-center justify-center rounded-full bg-white'>
                  <span style={{ color: C.primary }}><PhoneIcon /></span>
                </div>
                <div>
                  <p className='text-sm font-semibold'>Appelez-nous</p>
                  <p className='text-sm text-white/70'>+212 (535) 624 696</p>
                </div>
              </a>
              <a href='mailto:info@widamineaestheticcenter.com' className='mt-5 flex items-center gap-4 border-b border-white/30 py-5 transition hover:opacity-80'>
                <div className='flex h-12 w-12 items-center justify-center rounded-full bg-white'>
                  <span style={{ color: C.primary }}><MailIcon /></span>
                </div>
                <div>
                  <p className='text-sm font-semibold'>Envoyez un email</p>
                  <p className='text-sm text-white/70'>info@widamineaestheticcenter.com</p>
                </div>
              </a>
            </div>

            {/* Right — decorative */}
            <div className='hidden lg:flex justify-center'>
              <div className='relative w-full max-w-[200px] aspect-[2/3] rounded-2xl border-3 border-white overflow-hidden' style={{ border: '3px solid white' }}>
                <img src='https://cdn.prod.website-files.com/669fe584884bb430eb37ac4e/66e9827c8084de52aefc84f6_Entre%CC%81e%20cabinet.webp' alt='Widamine' className='h-full w-full object-cover widamine-tint' />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAQ section (sticky heading + accordion) ─── */}
      <section className='mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28'>
        <div className='grid gap-10 lg:grid-cols-[0.35fr_0.65fr] lg:items-start'>
          {/* Left sticky heading */}
          <div className='lg:sticky lg:top-28'>
            <h2 className='font-amoria text-3xl leading-tight sm:text-4xl' style={{ color: C.secondary }}>
              Questions <span style={{ color: C.primary, fontStyle: 'italic' }}>Fréquentes</span>
            </h2>
          </div>

          {/* Right — FAQ items */}
          <div className='space-y-3'>
            {FAQS.map((faq, i) => (
              <FAQItem key={i} question={faq.q} answer={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── Contact form ─── */}
      <section className='mx-auto max-w-6xl px-5 pb-20 sm:px-8 sm:pb-28'>
        <div className='grid gap-10 lg:grid-cols-[0.35fr_0.65fr] lg:items-start'>
          <div className='lg:sticky lg:top-28'>
            <h2 className='font-amoria text-2xl leading-tight sm:text-3xl' style={{ color: C.secondary }}>
              Écrivez-<span style={{ color: C.primary, fontStyle: 'italic' }}>nous</span>
            </h2>
            <p className='mt-4 text-sm leading-7' style={{ color: `${C.secondary}a0` }}>
              Partagez votre besoin ou le soin qui vous intéresse. Nous vous recontacterons rapidement.
            </p>
          </div>
          <ContactForm />
        </div>
      </section>
    </div>
  )
}

function ContactCard({ icon, label, text, sub }: { icon: React.ReactNode; label: string; text: string; sub?: string }) {
  return (
    <div className='flex items-start gap-4'>
      <div className='mt-1 flex h-10 w-10 shrink-0 items-center justify-center' style={{ color: C.primary }}>
        {icon}
      </div>
      <div>
        <h3 className='text-base font-semibold' style={{ color: C.secondary }}>{label}{sub && <span className='ml-1 text-xs font-normal' style={{ color: `${C.secondary}a0` }}>{sub}</span>}</h3>
        <p className='mt-1 text-sm leading-6' style={{ color: `${C.secondary}a0` }}>{text}</p>
      </div>
    </div>
  )
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className='overflow-hidden rounded-lg' style={{ background: 'white' }}>
      <button onClick={() => setOpen(!open)} className='flex w-full items-center justify-between px-5 py-4 text-left'>
        <span className='pr-4 text-sm font-semibold sm:text-base' style={{ color: C.secondary }}>{question}</span>
        <span className='shrink-0' style={{ color: C.primary }}>{open ? <MinusIcon /> : <PlusIcon />}</span>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-60' : 'max-h-0'}`}>
        <div className='px-5 pb-4'>
          <p className='text-sm leading-7' style={{ color: `${C.secondary}a0` }}>{answer}</p>
        </div>
      </div>
    </div>
  )
}

function ContactForm() {
  const [loading, setLoading] = useState(false)
  const [contactData, setContactData] = useState({ name: '', email: '', phone: '', context: '' })

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    try {
      if (loading) return
      setLoading(true)
      const obj = z.object({
        name: z.string().nonempty({ error: 'Le nom est requis' }).min(2, { error: 'Minimum 2 caractères' }).max(100).regex(/^[a-zA-Z\s\-]+$/, 'Lettres uniquement'),
        email: z.email({ error: 'Email invalide' }).nonempty({ error: 'Email requis' }),
        phone: z.string().nonempty({ error: 'Téléphone requis' }).regex(/^[0-9]+$/, 'Chiffres uniquement').min(10).max(15),
        context: z.string().max(500),
      })
      const parsed = obj.safeParse(contactData)
      if (!parsed.success) {
        const tree = z.treeifyError(parsed.error)
        Object.keys(tree.properties!).forEach((key) => {
          const err = tree.properties?.[key as keyof typeof tree.properties]?.errors?.[0]
          if (err) toast.error(err as string, { id: key })
        })
        return
      }
      await axios.post(API_BASE_URL + '/contacts', parsed.data)
      toast.success('Message envoyé avec succès!')
      setContactData({ name: '', email: '', phone: '', context: '' })
    } catch {
      toast.error('Une erreur est survenue, veuillez réessayer plus tard.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className='space-y-3 rounded-2xl p-6 sm:p-8' style={{ background: C.secondary, boxShadow: '0 10px 40px -10px rgba(26,54,70,0.15)' }} onSubmit={submit}>
      <Field label='Nom'>
        <input type='text' placeholder='Nom' className='w-full bg-transparent text-sm text-white placeholder:text-white/35 outline-none' value={contactData.name} onChange={(e) => setContactData({ ...contactData, name: e.target.value })} />
      </Field>
      <Field label='Email'>
        <input type='email' placeholder='Email' className='w-full bg-transparent text-sm text-white placeholder:text-white/35 outline-none' value={contactData.email} onChange={(e) => setContactData({ ...contactData, email: e.target.value })} />
      </Field>
      <Field label='Téléphone'>
        <input type='tel' placeholder='Téléphone' className='w-full bg-transparent text-sm text-white placeholder:text-white/35 outline-none' value={contactData.phone} onChange={(e) => setContactData({ ...contactData, phone: e.target.value })} />
      </Field>
      <label className='block rounded-xl border border-white/12 bg-white/5 px-4 py-3'>
        <span className='mb-2 block text-sm text-white/60'>Message</span>
        <textarea placeholder='Message' rows={5} className='w-full resize-none bg-transparent text-sm text-white placeholder:text-white/35 outline-none' value={contactData.context} onChange={(e) => setContactData({ ...contactData, context: e.target.value })} />
      </label>
      <button type='submit' className='w-full rounded-full bg-primary py-3 text-sm font-medium text-white shadow-[0_10px_25px_-5px_rgba(46,144,192,0.3)] transition hover:bg-primary/90 disabled:opacity-60' disabled={loading}>
        {loading ? 'Envoi...' : 'Envoyer'}
      </button>
    </form>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className='block rounded-full border border-white/12 bg-white/5 px-4 py-3'>
      <span className='mb-1 block text-sm text-white/60'>{label}</span>
      {children}
    </label>
  )
}
